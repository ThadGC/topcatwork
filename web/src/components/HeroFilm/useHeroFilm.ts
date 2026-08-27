'use client';

/**
 * HERO FILM — the engine.
 *
 * Owns the scroll -> film-time mapping, the animation loop, every visible
 * output, and the lock-at-end handoff. It writes styles IMPERATIVELY through
 * refs and holds no React state at all beyond the on/off flag: this loop runs
 * at 60Hz and a `setState` per frame would defeat the entire exercise.
 *
 * ── the mapping ─────────────────────────────────────────────────────────────
 *
 *     top    = the runway's document offset
 *     travel = runway height − viewport height          (≈950vh / 800vh / 700vh)
 *     target = clamp((scrollY − top) / travel)          raw scroll, 0..1
 *     eased  = target, chased (see the loop below)
 *     film   = clamp(eased / (1 − hold))                0..1
 *     want   = film × duration                          seconds
 *
 * `hold` is a TAIL hold: `film` reaches 1 while there is still `hold` of the
 * runway left, and that remainder is the headroom the settle debounce runs in
 * before the runway collapses.
 *
 * ── what drives the picture ─────────────────────────────────────────────────
 * `want` drives the TRANSPORT and nothing else. Every visible output — story
 * beats, hero wipe, grades, plate, veil, curve — is driven by the film's
 * ACTUAL presented time. The beats were tuned against specific frames; drive
 * them from the scroll target and they fire against frames the decoder has not
 * reached yet, and the copy drifts off the shots it was written for.
 *
 * ── the transport ───────────────────────────────────────────────────────────
 * The default is the disciplined seek ported from VDM Digital's shipping
 * scroll-scrub engine: ONE seek in flight at a time, an epsilon deadband, and
 * a 20%-per-frame lerp between the scroll and the decoder. See ./lib/scrub.ts,
 * which carries the reasoning. The forward-play `playbackRate` chase that used
 * to be the default survives behind `?film=play` (./lib/mode.ts) so the two
 * can be compared on a real device, but it is not the VDM approach and it is
 * not what ships.
 *
 * ── two stages of smoothing, on purpose ─────────────────────────────────────
 * The reference lerps ONCE, because its `target` is raw scroll. Topcat lerps
 * twice: `eased` above (EASE 0.15 plus a one-frame floor), and then the
 * scrub's own 0.2. That is not an oversight — `eased` is also what `hold`,
 * `armSettle()` and `lockFilm()` are expressed in, so it cannot be removed
 * without redefining when the runway collapses.
 *
 * The cost is scroll-to-picture lag: roughly 0.17s from `eased` plus 0.1s from
 * the scrub at a brisk 1.5x scroll, versus 0.1s for the reference. It is a lag
 * between the SCROLL and the picture, never between the picture and the copy,
 * because every visible output is composed from the film's actual presented
 * time. If it ever reads as soft, EASE is the knob — raising it shortens the
 * first stage without touching the second or the lock.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  DUR,
  EASE,
  FPS,
  HERO_EDGE,
  KIT_OUT,
  KIT_SET,
  SETTLE_MS,
  SRCFPS,
  VP_H_SLOP,
  WIPE_AT,
  WIPE_OUT,
  FILM_H,
  FILM_W,
} from './lib/constants';
import {
  clamp01,
  curveValue,
  heroNarrow,
  inkOn,
  kitOffset,
  plateOpacity,
  r2,
  revealAlpha,
  revealScale,
  storyAlpha,
  storyBlur,
  storyZ,
  veilValue,
  wipeEase,
} from './lib/outputs';
import { contentBox, filmFrame, revealFrame, type RevealFrame } from './lib/geometry';
import { promoteDeferredImage } from './lib/deferredImg';
import { attachFilmSource, type FilmSourceHandle } from './lib/filmSource';
import { filmMode, type FilmMode , gradeOff , revealOff } from './lib/mode';
import {
  IDENTITY,
  PANE_OFF,
  STRIP_BLEED,
  WEDGE_BLEED,
  affineCss,
  invertAffine,
  isPaneOff,
  revealPanes,
  type Affine,
  type PaneBleed,
} from './lib/reveal';
import { FrameSampler } from './lib/sampler';
import { STORY, beatWindow, pickBand, type Band } from './lib/timeline';
import { useCineBand, filmSupported, type CineEnv } from './useCineBand';
import { useFilmScrub, scrubIsMobile } from './useFilmScrub';
import { useFilmTransport, type FilmTransport } from './useFilmTransport';
import { useVideoFrame } from './useVideoFrame';

declare global {
  interface Window {
    /** Read by the hero-parallax module: "do not add .loaded, the film owns it". */
    __cineHold?: boolean;
  }
}

export interface HeroFilmRefs {
  cine: React.RefObject<HTMLDivElement | null>;
  hero: React.RefObject<HTMLElement | null>;
  bg: React.RefObject<HTMLDivElement | null>;
  video: React.RefObject<HTMLVideoElement | null>;
  plate: React.RefObject<HTMLDivElement | null>;
  /** One entry per STORY beat, in order. */
  lines: React.RefObject<Array<HTMLParagraphElement | null>>;
  heroCopy: React.RefObject<HTMLDivElement | null>;
  trust: React.RefObject<HTMLDivElement | null>;
  cue: React.RefObject<HTMLDivElement | null>;
  skip: React.RefObject<HTMLButtonElement | null>;
}

export interface HeroFilmSources {
  src: string;
  poster: string;
  srcNarrow: string;
  posterNarrow: string;
  srcPhone: string;
  posterPhone: string;
}

export interface HeroFilmPlates {
  src: string;
  srcNarrow: string;
  srcPhone: string;
}

export interface UseHeroFilmOptions {
  refs: HeroFilmRefs;
  sources: HeroFilmSources;
  plates: HeroFilmPlates;
  /** CSS-module class applied to `#hero` once the film has inked. */
  loadedClass: string;
  /** CSS-module class applied to the scroll cue once it is gone. */
  cueGoneClass: string;
}

export interface HeroFilmApi {
  /** False under reduced motion or no MP4 support: render the still hero. */
  enabled: boolean;
  /** The current band, for markup that has to differ. */
  env: CineEnv;
  /** Jump to the last frame and hand off. Wired to the "Skip intro" button. */
  skipToEnd: () => void;
}

/** Per-beat memo guards. Every one of these exists to avoid a style write. */
interface BeatMemo {
  o: number;
  z: number;
  b: number;
  g: number;
}

const NO_MEMO = (): BeatMemo => ({ o: -1, z: -1, b: -1, g: -1 });

/**
 * One of the reveal's clip panes: the wrapper that clips, and the inner span
 * that carries the exact inverse so the glyphs stay put. See lib/reveal.ts.
 *
 * `w` and `i` are the last matrix written to each half. Everything else in this
 * engine memoises its style writes and so does this: a frame that does not move
 * the edge must not touch the DOM.
 */
interface PaneEls {
  wrap: HTMLElement;
  inner: HTMLElement;
  w: string;
  i: string;
  /** last parked state written to the wrapper. See `writePane`. */
  p: boolean;
}

interface RevealPaneEls {
  host: HTMLElement | null;
  wedge: PaneEls | null;
  strip: PaneEls | null;
}

/**
 * Find one pane inside the reveal line and give it its box.
 *
 * The negative margin expands the pane's clip box past the copy; the equal
 * padding puts its CONTENT box back exactly where the copy was, so the text
 * lays out and wraps identically. That leaves both halves of the pair sharing
 * one origin — the line's content-box top-left — which is `(bl.l, bl.t)` inside
 * the wrapper's own border box and `(0, 0)` inside the inner's. Both are
 * written, because a default `50% 50%` on either one would stop the pair
 * cancelling and drift the glyphs.
 */
function grabPane(host: HTMLElement, key: string, bl: PaneBleed): PaneEls | null {
  const wrap = host.querySelector<HTMLElement>('[data-rv="' + key + '"]');
  const inner = host.querySelector<HTMLElement>('[data-rv="' + key + '-in"]');
  if (!wrap || !inner) return null;
  wrap.style.margin = -bl.t + 'px ' + -bl.r + 'px ' + -bl.b + 'px ' + -bl.l + 'px';
  wrap.style.padding = bl.t + 'px ' + bl.r + 'px ' + bl.b + 'px ' + bl.l + 'px';
  wrap.style.transformOrigin = bl.l + 'px ' + bl.t + 'px';
  inner.style.transformOrigin = '0px 0px';
  return { wrap, inner, w: '', i: '', p: false };
}

/**
 * Write one pane's transform pair. The inner always carries the inverse.
 *
 * A pane the frame has no edge for — the strip on the two bands whose reveal
 * has only one, and both panes once the sweep is released — is PARKED rather
 * than transformed away. lib/reveal.ts's `PANE_OFF` says "this pane uncovers
 * nothing" by translating the box a hundred thousand pixels off the copy, which
 * is true but would leave the pane's inner counter-translated the same hundred
 * thousand pixels back out of its box: under the `overflow: hidden` fallback
 * (Safari before 16, which has no `overflow: clip`) that is a live scroll
 * container with a hundred-thousand-pixel scroll range. `visibility` over the
 * identity says the same thing and leaves nothing behind to scroll. It is a
 * paint-only property, so parking and unparking costs no layout either.
 */
function writePane(pane: PaneEls | null, m: Affine): void {
  if (!pane) return;
  const park = isPaneOff(m);
  if (park !== pane.p) {
    pane.p = park;
    pane.wrap.style.visibility = park ? 'hidden' : '';
  }
  const w = affineCss(park ? IDENTITY : m);
  if (w !== pane.w) {
    pane.w = w;
    pane.wrap.style.transform = w;
  }
  const i = affineCss(invertAffine(park ? IDENTITY : m));
  if (i !== pane.i) {
    pane.i = i;
    pane.inner.style.transform = i;
  }
}

/**
 * The attribute that takes the clip off the reveal line.
 *
 * It is the released state — the sweep is over, or never started, or
 * `?reveal=off` turned it off — and the stylesheet hangs `overflow: visible`
 * and `will-change: auto` off it. Written once per transition, never per frame.
 */
const RV_OPEN = 'data-rv-open';

export function useHeroFilm(opts: UseHeroFilmOptions): HeroFilmApi {
  const { refs, sources, plates, loadedClass, cueGoneClass } = opts;
  const env = useCineBand();

  /**
   * Tri-state, and it has to be.
   *
   * Support cannot be decided during render — `canPlayType` and `matchMedia`
   * are client-only — so the first commit does not know yet. `null` is that
   * "not yet" state, and it is distinct from `false` because `false` runs
   * `fail()`, which schedules `.loaded` onto the hero over a double rAF. Boot
   * with `false` instead of `null` and that rAF can land AFTER the film has
   * started, inking the hero copy in over frame one and never taking it back
   * off — `ink()`'s memo has already settled by then.
   */
  const [enabled, setEnabled] = useState<boolean | null>(null);

  /* ── the transport, and the `?film=` switch ─────────────────────────────── */

  /** Coarse pointer / small viewport. Refreshed by `sync()`, read per frame. */
  const mobile = useRef(false);
  const isMobile = useCallback(() => mobile.current, []);

  // Both are pure ref containers with no effects, so both are constructed and
  // one is selected. A conditional hook is not an option and neither costs
  // anything to build.
  const scrub = useFilmScrub(refs.video, isMobile);
  const play = useFilmTransport(refs.video);
  const mode = useRef<FilmMode>('scrub');
  /** `?grade=off`: skip every readback. See lib/mode.ts for why. */
  const noGrade = useRef(false);
  /** `?reveal=off`: stop per-frame clip-path writes. See lib/mode.ts. */
  const noReveal = useRef(false);
  const picked = useRef<FilmTransport>(scrub);

  /**
   * A stable facade over whichever transport the switch chose.
   *
   * It exists so the selection can be made in an effect — `location` does not
   * exist during the static export's render — without the engine's effect
   * dependency arrays ever seeing a new object identity, which would tear the
   * film down and rebuild it.
   */
  const facade = useRef<FilmTransport>(undefined as unknown as FilmTransport);
  if (!facade.current) {
    facade.current = {
      step: (want, dur, dt) => picked.current.step(want, dur, dt),
      snap: (time, dur) => picked.current.snap(time, dur),
      ready: () => picked.current.ready(),
      reset: () => picked.current.reset(),
      halt: () => picked.current.halt(),
    };
  }
  const transport = facade.current;

  const sampler = useRef<FrameSampler>(undefined as unknown as FrameSampler);
  if (!sampler.current) sampler.current = new FrameSampler();

  /* ── mutable engine state. None of this belongs in React state. ────────── */

  const hold = useRef(0.1);
  const top = useRef(0);
  const travel = useRef(1);
  const dur = useRef(DUR);
  const veilAt = useRef(38);
  const veilMin = useRef(0.2);

  const target = useRef(0);
  const eased = useRef(-1);
  const want = useRef(0);
  const raf = useRef<number | null>(null);
  const lastT = useRef(0);
  const live = useRef(true);
  const locked = useRef(false);
  const settleT = useRef<ReturnType<typeof setTimeout> | null>(null);
  const vpW = useRef(0);
  const vpH = useRef(0);

  /** The live source attachment: direct URL first, Blob fallback second. */
  const source = useRef<FilmSourceHandle | null>(null);
  /**
   * Has the decoder painted a real frame yet?
   *
   * The frame-0 plate is held over the film until it has. Drop this gate and
   * the first paint on iOS is a black video box where the plate used to be —
   * the element reports `readyState` long before it has anything on screen.
   */
  const painted = useRef(false);

  // Output memo guards — legacy `graded`, `veiled`, `curved`, `inked`, …
  const graded = useRef(-1);
  const veiled = useRef(-1);
  const curved = useRef(-1);
  const inked = useRef<boolean | null>(null);
  const plateO = useRef(-1);
  const plateUrl = useRef('');
  /**
   * Has the sweep finished?
   *
   * `null` while the reveal is not running at all. This is what the polygon's
   * `''` used to mean and it is read in exactly the same place: the reveal
   * line's scrim is only allowed on once the line is fully uncovered, because
   * during the sweep a rect sample would grade the copy against pixels the
   * viewer cannot see it over.
   */
  const revDone = useRef<boolean | null>(null);
  /**
   * Is the line released — i.e. is the clip off?
   *
   * Memo for the one attribute this costs, so a frame that does not change the
   * state does not touch the DOM. `null` is "never written", which is not the
   * same as `false`: the line ships without the attribute and the first tick
   * has to be able to leave it that way.
   */
  const revOpen = useRef<boolean | null>(null);
  const revSc = useRef<number | null>(null);
  const kitTx = useRef<number | null>(null);
  const heroO = useRef(-1);
  const heroZ = useRef(-1);
  const heroE = useRef(-1);
  const heroTx = useRef<number | null>(null);
  const trustGone = useRef<boolean | null>(null);
  const heroLast = useRef<'wide' | 'nr' | 'off' | ''>('');
  const cued = useRef<boolean | null>(null);
  const skipped = useRef<boolean | null>(null);
  const firstAlpha = useRef(0);
  const beats = useRef<BeatMemo[]>(STORY.map(NO_MEMO));

  // Measured boxes: hero copy, trust chips, kit line.
  const HW = useRef({ x0: 0, x1: 0 });
  const HT = useRef({ x0: 0, x1: 0 });
  const KW = useRef({ x1: 0 });
  const RV = useRef<RevealFrame | null>(null);

  /** Band snapshot the loop reads. Kept in a ref so the loop never restarts. */
  const bandRef = useRef<CineEnv>(env);
  bandRef.current = env;

  /* ── the reveal, driven by presented frames ────────────────────────────── */

  // Indirection so the decoder callback can be registered before the tick it
  // calls exists — the subscription must not be re-created per render.
  const revealTickRef = useRef<() => void>(() => {});
  const videoFrame = useVideoFrame(refs.video, () => {
    // A new frame is on screen: the sampler's cache is stale, and the reveal
    // has a new source frame to interpolate against. Both are cheap; neither
    // needs the animation loop to be running.
    revealTickRef.current();
  });

  /** The two clip panes, resolved out of the reveal line and given their box. */
  const RP = useRef<RevealPaneEls>({ host: null, wedge: null, strip: null });

  const resolvePanes = useCallback((el: HTMLElement): RevealPaneEls => {
    const p = RP.current;
    if (p.host === el) return p;
    p.host = el;
    p.wedge = grabPane(el, 'wedge', WEDGE_BLEED);
    p.strip = grabPane(el, 'strip', STRIP_BLEED);
    return p;
  }, []);

  /**
   * One frame of the reveal — two transforms per pane, and nothing else.
   *
   * NO clip-path, no mask, no filter, no width or height. Every one of those
   * re-rasterises the headline; a transform on a promoted layer does not, which
   * is the entire point of the exercise. lib/reveal.ts derives the transforms
   * from the same measured tables the polygon used, so the picture is the same
   * picture frame for frame.
   *
   * The one thing here that is not a transform is the release: the moment the
   * sweep is over the clip comes OFF, because a pane clips to the copy's box
   * plus its bleed and that is a state to sweep through, not a state to park a
   * headline in. The polygon was removed from the element at exactly this
   * point. It costs one attribute, at one frame of the film.
   */
  const revealTick = useCallback(() => {
    const el = refs.lines.current?.[1] ?? null; // beat 1 is the reveal line
    if (!el) return;
    const band = bandRef.current;
    const frame = RV.current;
    const on = band.mode !== 'off' && !!frame?.ok;
    const p = resolvePanes(el);

    /**
     * Hand the line back: no clip, no promotion, no second copy.
     *
     * The wedge carries the identity and shows the copy exactly where it lays
     * out; the strip is parked, so its duplicate — which lies precisely on top
     * of the wedge's, both being at the identity — never paints. The attribute
     * is what takes `overflow` and `will-change` off both panes.
     */
    const release = () => {
      if (revOpen.current !== true) {
        revOpen.current = true;
        el.setAttribute(RV_OPEN, '');
      }
      writePane(p.wedge, IDENTITY);
      writePane(p.strip, PANE_OFF);
    };

    if (!on || !frame) {
      revDone.current = null;
      release();
      if (revSc.current !== null) {
        revSc.current = null;
        el.style.removeProperty('--lsc');
      }
      return;
    }

    const fr = videoFrame.frame(refs.video.current);
    const panes = revealPanes(fr, frame, {
      phone: band.phone && !band.wide,
      tablet: band.tablet,
    });
    revDone.current = panes.done;

    // `?reveal=off` still computes the geometry — `done` is what gates the
    // line's scrim — it just does not clip. See lib/mode.ts. `done` lands in
    // the same branch: the sweep is finished, so the clip is finished with it.
    if (noReveal.current || panes.done) {
      release();
      return;
    }
    if (revOpen.current !== false) {
      revOpen.current = false;
      el.removeAttribute(RV_OPEN);
    }
    writePane(p.wedge, panes.wedge);
    writePane(p.strip, panes.strip);
  }, [refs, videoFrame, resolvePanes]);
  revealTickRef.current = revealTick;

  /* ── measurement ───────────────────────────────────────────────────────── */

  const bgRect = useCallback(() => refs.bg.current?.getBoundingClientRect() ?? null, [refs]);

  const filmW = useCallback((): number => {
    const v = refs.video.current;
    if (v?.videoWidth) return v.videoWidth;
    const band = bandRef.current;
    return band.phone ? FILM_W.phone : band.narrow ? FILM_W.tablet : FILM_W.wide;
  }, [refs]);

  /** `setFilmFrame()` — the three vars the wide-band line layout is built on. */
  const setFilmFrame = useCallback(() => {
    const cine = refs.cine.current;
    const bg = bgRect();
    if (!cine || !bg || !bg.width || !bg.height) return;
    const v = refs.video.current;
    const f = filmFrame(bg.width, bg.height, filmW(), v?.videoHeight || FILM_H);
    cine.style.setProperty('--filmU', f.filmU + 'px');
    cine.style.setProperty('--filmX', f.filmX + 'px');
    cine.style.setProperty('--filmY', f.filmY + 'px');
  }, [refs, bgRect, filmW]);

  const measure = useCallback(() => {
    const cine = refs.cine.current;
    if (!cine) return;
    setFilmFrame();

    const cs = getComputedStyle(cine);
    const h = parseFloat(cs.getPropertyValue('--cineHold'));
    if (h > 0 && h < 0.9) hold.current = h;
    const va = parseFloat(cs.getPropertyValue('--cineVeilAt'));
    if (va >= 0 && va < dur.current) veilAt.current = va;
    const vm = parseFloat(cs.getPropertyValue('--cineVeilMin'));
    if (vm >= 0 && vm <= 1) veilMin.current = vm;

    top.current = cine.getBoundingClientRect().top + window.scrollY;

    // Mobile URL-bar suppression. The cached viewport height is only refreshed
    // when the width changes or the height moves more than VP_H_SLOP. Drop
    // this and every address-bar collapse re-measures `travel`, which rescales
    // the whole timeline mid-scroll and throws the film several seconds.
    if (
      !vpH.current ||
      window.innerWidth !== vpW.current ||
      Math.abs(window.innerHeight - vpH.current) > VP_H_SLOP
    ) {
      vpW.current = window.innerWidth;
      vpH.current = window.innerHeight;
    }
    travel.current = Math.max(1, cine.offsetHeight - vpH.current);
  }, [refs, setFilmFrame]);

  const measurePin = useCallback(() => {
    const band = bandRef.current;
    if (!band.wide) return;
    const h = refs.heroCopy.current;
    const t = refs.trust.current;
    if (h) HW.current = { x0: h.offsetLeft, x1: h.offsetLeft + h.offsetWidth };
    if (t) HT.current = { x0: t.offsetLeft, x1: t.offsetLeft + t.offsetWidth };
  }, [refs]);

  const measureKit = useCallback(() => {
    const el = refs.lines.current?.[2];
    if (!el) return;
    const band = bandRef.current;
    if (band.mode === 'off') {
      el.style.removeProperty('--lx');
      el.style.removeProperty('--lg');
      kitTx.current = null;
      return;
    }
    KW.current = { x1: el.offsetLeft + el.offsetWidth };
  }, [refs]);

  const measureReveal = useCallback(() => {
    const el = refs.lines.current?.[1];
    const band = bandRef.current;
    if (!el || band.mode === 'off') {
      RV.current = null;
      revealTick();
      return;
    }
    // The panes have to be boxed before the line is measured: their negative
    // margins cancel their padding exactly, so the line's own size does not
    // move either way, but reading first and writing after would leave a
    // measurement taken against a box that is about to change.
    resolvePanes(el);

    // `offsetWidth` and friends are rounded to whole pixels and that is fine
    // for the film frame, which is where the polygon lived. The panes are NOT
    // fine with it — half a pixel of error in a pane's edge is half a pixel of
    // error in the reveal — so their four numbers come off `getComputedStyle`.
    //
    // Through `contentBox()`, never straight off `cs.width`: the line is
    // `box-sizing: border-box`, and Blink resolves `width` against box-sizing,
    // so on this element `cs.width` is the BORDER box. In the phone band, where
    // the line carries 27.3px of padding either side, that is 390px against a
    // 335.406px content box — and 54.6px of error in `cw` is what opened the
    // gap between the two panes that read as a black bar across the headline.
    // See lib/geometry.ts.
    const box = contentBox(getComputedStyle(el));

    const bg = bgRect();
    const v = refs.video.current;
    RV.current = revealFrame({
      bgRect: bg ?? { left: 0, top: 0, width: 0, height: 0 },
      el: {
        left: el.offsetLeft,
        top: el.offsetTop,
        width: el.offsetWidth,
        height: el.offsetHeight,
        padLeft: box.pl,
        padTop: box.pt,
        contentW: box.w,
        contentH: box.h,
      },
      fw: band.phone ? FILM_W.phone : band.tablet ? FILM_W.tablet : FILM_W.wide,
      videoW: v?.videoWidth ?? 0,
      videoH: v?.videoHeight ?? 0,
    });
    revealTick();
  }, [refs, bgRect, revealTick, resolvePanes]);

  /* ── outputs ───────────────────────────────────────────────────────────── */

  const ink = useCallback(
    (film: number) => {
      const on = inkOn(film);
      if (on === inked.current) return;
      inked.current = on;
      const hero = refs.hero.current;
      if (!hero) return;
      hero.classList.toggle(loadedClass, on);
      // The bare class as well: ported global rules key off `.hero.loaded`.
      hero.classList.toggle('loaded', on);
    },
    [refs, loadedClass],
  );

  const veil = useCallback(
    (film: number) => {
      const v = veilValue(film, dur.current, veilAt.current, veilMin.current);
      if (v === veiled.current) return;
      veiled.current = v;
      refs.cine.current?.style.setProperty('--cineVeil', String(v));
    },
    [refs],
  );

  const curve = useCallback(
    (film: number) => {
      const v = curveValue(film);
      if (v === curved.current) return;
      curved.current = v;
      refs.cine.current?.style.setProperty('--cineCurve', String(v));
    },
    [refs],
  );

  const plate = useCallback(
    (shown: number) => {
      const el = refs.plate.current;
      if (!el) return;
      const band = bandRef.current;
      const url = pickBand(band, plates.src, plates.srcNarrow, plates.srcPhone);
      if (url && url !== plateUrl.current) {
        plateUrl.current = url;
        el.style.backgroundImage = "url('" + url + "')";
      }
      // The plate is the exact first frame of the exact clip this band
      // decodes, so holding it until a real frame has painted is invisible;
      // dropping it early is a black box. `plateOpacity()` then takes over and
      // covers frame 0 only, exactly as it always did.
      const o = painted.current ? plateOpacity(shown) : 1;
      if (o !== plateO.current) {
        plateO.current = o;
        el.style.opacity = String(o);
      }
    },
    [refs, plates],
  );

  /** First real painted frame: release the plate and repaint it once. */
  const onPainted = useCallback(() => {
    if (painted.current) return;
    painted.current = true;
    plateO.current = -1;
    plate(want.current);
  }, [plate]);

  const barHeight = useCallback((): number => {
    const bar = document.querySelector('header.bar');
    return bar ? bar.getBoundingClientRect().height : 78;
  }, []);

  const grade = useCallback(() => {
    const v = refs.video.current;
    const bg = bgRect();
    if (!v || !bg) return;
    const g = noGrade.current ? -1 : sampler.current.navGrade(v, bg, barHeight());
    if (g < 0 || g === graded.current) return;
    graded.current = g;
    refs.cine.current?.style.setProperty('--navGrade', String(g));
  }, [refs, bgRect, barHeight]);

  /** Per-line scrim, `--lg`. `-1` from the sampler means "unreadable, skip". */
  const applyBandGrade = useCallback(
    (i: number, el: HTMLElement, o: number) => {
      const memo = beats.current[i];
      if (o > 0.02) {
        const v = refs.video.current;
        const bg = bgRect();
        if (v && bg) {
          const g = noGrade.current
            ? -1
            : sampler.current.bandGrade('L' + i, v, bg, el.getBoundingClientRect());
          if (g >= 0) {
            const w = r2(g * o);
            if (w !== memo.g) {
              memo.g = w;
              el.style.setProperty('--lg', String(w));
            }
          }
        }
        return;
      }
      if (memo.g !== 0) {
        memo.g = 0;
        el.style.setProperty('--lg', '0');
      }
    },
    [refs, bgRect],
  );

  /** Reset the three "flat" outputs the reveal and kit branches share. */
  const flatten = useCallback((i: number, el: HTMLElement) => {
    const memo = beats.current[i];
    if (memo.z !== 0) {
      memo.z = 0;
      el.style.setProperty('--lz', '0');
    }
    if (memo.b !== 0) {
      memo.b = 0;
      el.style.filter = 'none';
    }
  }, []);

  const story = useCallback(
    (t: number) => {
      const band = bandRef.current;
      const els = refs.lines.current;
      if (!els) return;

      for (let i = 0; i < STORY.length; i++) {
        const el = els[i];
        const beat = STORY[i];
        if (!el) continue;
        const w = beatWindow(beat, band);
        if (w.out <= w.at) continue;
        const memo = beats.current[i];
        const p = clamp01((t - w.at) / (w.out - w.at));

        /* (a) the reveal line — no fade in, the clip-path is the entrance. */
        if (beat.id === 'reveal' && band.mode !== 'off') {
          const fad = band.phone ? 2.03 : 2.47;
          const o = revealAlpha(t, w.at, w.out, fad);
          if (o !== memo.o) {
            memo.o = o;
            el.style.opacity = String(o);
          }
          if (band.mode === 'nr') {
            const sc = revealScale(t, w.out, fad);
            if (sc !== revSc.current) {
              revSc.current = sc;
              if (sc === 1) el.style.removeProperty('--lsc');
              else el.style.setProperty('--lsc', String(sc));
            }
          }
          // The scrim only comes on once the wipe has finished. During the
          // wipe the line is half-masked, so a rect sample would grade against
          // pixels the viewer cannot see it over.
          if (band.mode === 'nr' && revDone.current === true && o > 0.02) {
            applyBandGrade(i, el, o);
          } else if (memo.g !== 0) {
            memo.g = 0;
            el.style.setProperty('--lg', '0');
          }
          flatten(i, el);
          if (!videoFrame.supported) revealTick();
          continue;
        }

        /* (b)(c) the kit line — hard on/off, slides in and back out left. */
        if (beat.id === 'kit' && band.mode !== 'off') {
          const o = p <= 0 || p >= 1 ? 0 : 1;
          let setAt: number;
          let outAt: number;
          if (band.mode === 'nr') {
            const rmp = band.phone ? 1.8 : 2.2;
            setAt = w.at + rmp;
            outAt = w.out - rmp;
          } else {
            setAt = KIT_SET;
            outAt = KIT_OUT;
          }
          const tx = kitOffset(t, w.at, w.out, setAt, outAt, KW.current.x1);
          if (tx !== kitTx.current) {
            kitTx.current = tx;
            el.style.setProperty('--lx', String(tx));
          }
          if (o !== memo.o) {
            memo.o = o;
            el.style.opacity = String(o);
          }
          applyBandGrade(i, el, o);
          flatten(i, el);
          continue;
        }

        /* (d) everything else: fade, Z rush, exit blur. */
        const o = storyAlpha(p);
        if (i === 0) firstAlpha.current = o;
        const z = storyZ(p, w.zNear);
        const b = storyBlur(p);
        if (o !== memo.o) {
          memo.o = o;
          el.style.opacity = String(o);
        }
        applyBandGrade(i, el, o);
        if (z !== memo.z) {
          memo.z = z;
          el.style.setProperty('--lz', String(z));
        }
        if (b !== memo.b) {
          memo.b = b;
          el.style.filter = b ? 'blur(' + b + 'px)' : 'none';
        }
      }
    },
    [refs, applyBandGrade, flatten, revealTick, videoFrame],
  );

  const heroCopyOut = useCallback(
    (t: number) => {
      const el = refs.heroCopy.current;
      const trust = refs.trust.current;
      const cine = refs.cine.current;
      if (!el) return;
      const band = bandRef.current;

      // A band change invalidates every cached value and every inline style.
      if (band.mode !== heroLast.current) {
        heroLast.current = band.mode;
        heroO.current = -1;
        heroZ.current = -1;
        heroE.current = -1;
        heroTx.current = null;
        trustGone.current = null;
        el.style.opacity = '';
        el.style.visibility = '';
        el.style.removeProperty('--hz');
        el.style.removeProperty('--tx');
        if (trust) {
          trust.style.opacity = '';
          trust.style.visibility = '';
          trust.style.removeProperty('--tx');
        }
        cine?.style.removeProperty('--cineEdge');
      }

      if (band.mode === 'off') return;

      if (band.mode === 'nr') {
        const { o, z } = heroNarrow(t);
        if (z !== heroZ.current) {
          heroZ.current = z;
          el.style.setProperty('--hz', String(z));
        }
        if (o !== heroO.current) {
          heroO.current = o;
          el.style.opacity = String(o);
          el.style.visibility = o ? 'visible' : 'hidden';
          cine?.style.setProperty('--cineEdge', String(o));
        }
        return;
      }

      // Wide: the copy is wiped off to the left by the film itself.
      const p = clamp01((t - WIPE_AT) / (WIPE_OUT - WIPE_AT));
      const tx = r2(-HW.current.x1 * wipeEase(p));
      const o = p >= 1 ? 0 : 1;

      if (tx !== heroTx.current) {
        heroTx.current = tx;
        el.style.setProperty('--tx', String(tx));
        trust?.style.setProperty('--tx', String(tx));
      }
      if (o !== heroO.current) {
        heroO.current = o;
        el.style.opacity = String(o);
        el.style.visibility = o ? 'visible' : 'hidden';
        if (trust) {
          trust.style.opacity = String(o);
          trust.style.visibility = o ? 'visible' : 'hidden';
        }
      }
      // The trust chips sit left of the headline, so they clear the screen
      // first; hide them the moment they do rather than compositing an
      // off-screen row for the rest of the wipe.
      if (o && trust && HT.current.x1 > HT.current.x0) {
        const gone = HT.current.x1 + tx <= 0;
        if (gone !== trustGone.current) {
          trustGone.current = gone;
          trust.style.visibility = gone ? 'hidden' : 'visible';
        }
      }
      if (heroZ.current !== 0) {
        heroZ.current = 0;
        el.style.setProperty('--hz', '0');
      }
      const vis = HW.current.x1 > 0 ? clamp01((HW.current.x1 + tx) / HW.current.x1) : 0;
      const e = r2(HERO_EDGE * vis);
      if (e !== heroE.current) {
        heroE.current = e;
        cine?.style.setProperty('--cineEdge', String(e));
      }
    },
    [refs],
  );

  const chrome = useCallback(
    (film: number) => {
      const cue = refs.cue.current;
      const skip = refs.skip.current;
      const g = firstAlpha.current <= 0.02;
      if (g !== cued.current) {
        cued.current = g;
        if (cue) {
          cue.classList.toggle(cueGoneClass, g);
          if (g) cue.style.opacity = '';
        }
      }
      if (cue && !g) cue.style.opacity = String(firstAlpha.current);

      const d = film > 0.985;
      if (d !== skipped.current) {
        skipped.current = d;
        if (skip) skip.hidden = d;
        document.documentElement.classList.toggle('skip-live', !d);
      }
    },
    [refs, cueGoneClass],
  );

  /** Paint one composition, from a film time that has actually been shown. */
  const compose = useCallback(
    (shown: number) => {
      const film = clamp01(shown / dur.current);
      ink(film);
      veil(film);
      curve(film);
      story(shown);
      heroCopyOut(shown);
      plate(shown);
      chrome(film);
      grade();
    },
    [ink, veil, curve, story, heroCopyOut, plate, chrome, grade],
  );

  /* ── lock-at-end ───────────────────────────────────────────────────────── */

  const dropHeroHash = useCallback(() => {
    if ((location.hash || '').toLowerCase() !== '#hero') return;
    try {
      history.replaceState(null, '', location.pathname + location.search);
    } catch {
      /* ignore */
    }
  }, []);

  const lockFilm = useCallback(() => {
    if (locked.current) return;
    locked.current = true;

    // Guarantee the last frame is what the collapse leaves on screen. The
    // transport plays forward, so at the moment of lock it may still be a
    // fraction behind; one seek here is invisible and removes the jump.
    transport.snap(dur.current, dur.current);
    compose(dur.current);

    measure();
    const drop = travel.current;
    document.documentElement.classList.add('cine-done');
    // The runway collapse and the scroll subtraction are simultaneous, so the
    // hero does not move a pixel and the page below rises by exactly the
    // runway length.
    window.scrollTo({ top: Math.max(0, Math.round(window.scrollY - drop)), behavior: 'instant' });
    dropHeroHash();
    dispatchEvent(new Event('resize'));
  }, [transport, compose, measure, dropHeroHash]);

  const armSettle = useCallback(() => {
    if (locked.current) return;
    if (clamp01(eased.current / (1 - hold.current)) < 1) return;
    if (settleT.current) clearTimeout(settleT.current);
    settleT.current = setTimeout(() => {
      if (!locked.current && clamp01(eased.current / (1 - hold.current)) >= 1) lockFilm();
    }, SETTLE_MS);
  }, [lockFilm]);

  /* ── the loop ──────────────────────────────────────────────────────────── */

  const tickRef = useRef<(now?: number) => void>(() => {});

  const kick = useCallback(() => {
    if (raf.current === null) {
      lastT.current = 0;
      raf.current = requestAnimationFrame((n) => tickRef.current(n));
    }
  }, []);

  const tick = useCallback(
    (now?: number) => {
      raf.current = null;
      const t = now ?? performance.now();
      if (!lastT.current) lastT.current = t - 1000 / 60;
      let dt = t - lastT.current;
      lastT.current = t;
      if (dt > 100) dt = 100;
      if (dt < 1) dt = 1;

      if (eased.current < 0) eased.current = target.current;

      // The chase. `FE` is one source frame expressed in eased units; the
      // floor term guarantees the film never advances slower than one frame
      // per animation frame, so a slow scroll still reads as motion rather
      // than as a stutter.
      //
      // FPS cancels out of `floor` exactly — FE * (dt / (1000/FPS)) reduces to
      // (1 - hold) * dt / (dur * 1000), i.e. "at least real time" — so moving
      // FPS from 60 to the source's 24 left the floor byte-for-byte the same.
      // It only widens the snap threshold below, from 2% of a 1/60s frame to
      // 2% of a 1/24s one: 0.33ms of film against 0.83ms, both far under a
      // frame and both meaning the same thing, "close enough, stop chasing".
      const FE = (1 - hold.current) / (dur.current * FPS);
      const d = target.current - eased.current;
      const ad = Math.abs(d);
      if (ad <= FE * 0.02) {
        eased.current = target.current;
      } else {
        let step = ad * (1 - Math.pow(1 - EASE, dt / (1000 / 60)));
        const floor = FE * (dt / (1000 / FPS));
        if (step < floor) step = floor;
        if (step > ad) step = ad;
        eased.current += (d < 0 ? -1 : 1) * step;
      }

      const film = clamp01(eased.current / (1 - hold.current));
      want.current = film * dur.current;

      transport.step(want.current, dur.current, dt);

      // Compose from the frame that is ACTUALLY on screen.
      const v = refs.video.current;
      const presented = videoFrame.current;
      const shown = presented
        ? presented.mediaTime
        : v && v.readyState >= 2 && !Number.isNaN(v.currentTime)
          ? v.currentTime
          : want.current;

      sampler.current.setFrame(videoFrame.key(v));
      compose(shown);

      // Keep running while either half is still moving: the scroll chase, or
      // the transport catching up to it. The legacy loop only watched the
      // former, which was safe when a seek landed the frame synchronously.
      //
      // The slop is `1 / SRCFPS` = 83.3ms, TWO source frames, and it is not a
      // typo for `1 / FPS`. It is what has to park the loop at the end of the
      // film: there `want` is `dur`, while the scrub can only ever address
      // `ceiling * dur` and its deadband lets the element rest one epsilon
      // short of even that. Tighten this to one source frame and the residue
      // at film progress 1 — 22ms of ceiling plus up to 42ms of mobile
      // deadband — sits permanently outside it, so `catching` never goes
      // false, the loop never parks and `armSettle()` is never reached from
      // here. lib/scrub.ts states the inequality; scrub.test.ts asserts it.
      const chasing = eased.current !== target.current;
      const catching =
        !!v && (!v.paused || v.seeking || Math.abs(want.current - v.currentTime) > 1 / SRCFPS);

      if (chasing || catching) {
        raf.current = requestAnimationFrame((n) => tickRef.current(n));
      } else {
        armSettle();
      }
    },
    [transport, refs, videoFrame, compose, armSettle],
  );
  tickRef.current = tick;

  const onScroll = useCallback(() => {
    if (locked.current) return;
    if (!live.current) return;
    target.current = clamp01((window.scrollY - top.current) / travel.current);
    // Until the film has a few seconds of contiguous buffer, pin the scrub at
    // zero rather than scrubbing a film that cannot answer.
    if (!transport.ready()) target.current = 0;
    kick();
    armSettle();
  }, [transport, kick, armSettle]);

  /* ── skip / deep link ──────────────────────────────────────────────────── */

  const skipToEnd = useCallback(() => {
    if (!enabled) return;
    measure();
    window.scrollTo({ top: Math.round(top.current + travel.current), behavior: 'instant' });
    target.current = 1;
    eased.current = 1;
    want.current = dur.current;
    transport.snap(dur.current, dur.current);
    compose(dur.current);
    armSettle();
    if (locked.current) dropHeroHash();
  }, [enabled, measure, transport, compose, armSettle, dropHeroHash]);

  const skipRef = useRef(skipToEnd);
  skipRef.current = skipToEnd;

  /* ── boot ──────────────────────────────────────────────────────────────── */

  useEffect(() => {
    // Both of these are client-only reads, and both must land before `enabled`
    // leaves its `null` state — the lifecycle effect below bails out while it
    // is null, so by the time the loop exists the transport is already chosen.
    mode.current = filmMode();
    noGrade.current = gradeOff();
    noReveal.current = revealOff();
    picked.current = mode.current === 'play' ? play : scrub;
    mobile.current = scrubIsMobile();
    setEnabled(filmSupported(env.reduce));
  }, [env.reduce, play, scrub]);

  /** `fail()` — drop the film and leave a still hero behind. */
  const fail = useCallback(() => {
    const root = document.documentElement;
    /*
      The still hero ships with `data-src` and no `src`, because under
      `cine-on` it is at opacity 0 for the whole session and fetching it costs
      151,604 bytes for nothing — see ./lib/deferredImg.ts. Dropping `cine-on`
      is precisely the moment that stops being true, so promote it FIRST: the
      class change is what makes the element visible, and an <img> with no src
      is a blank hero.
    */
    promoteDeferredImage(refs.bg.current?.querySelector('img[data-src]'));
    root.classList.remove('cine-on');
    root.classList.remove('skip-live');
    root.classList.remove('to-hero');
    window.__cineHold = false;
    refs.cine.current?.style.removeProperty('--cineVeil');
    refs.cine.current?.style.removeProperty('--navGrade');
    graded.current = -1;
    // Release the hero copy: with no film there is nothing to ink it in.
    const hero = refs.hero.current;
    if (hero && !hero.classList.contains('loaded')) {
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          hero.classList.add(loadedClass);
          hero.classList.add('loaded');
        }),
      );
    }
    if (raf.current !== null) cancelAnimationFrame(raf.current);
    raf.current = null;
    transport.halt();
    dispatchEvent(new Event('scroll'));
  }, [refs, loadedClass, transport]);

  const failRef = useRef(fail);
  failRef.current = fail;

  /** `sync()` — remeasure everything and repaint from a clean slate. */
  const sync = useCallback(() => {
    const cine = refs.cine.current;
    const v = refs.video.current;
    if (!cine || !v) return;

    document.documentElement.classList.add('cine-on');
    window.__cineHold = true;
    cine.style.removeProperty('height');

    // The deadband and the iOS prime both key off this, and it can only change
    // on the events that call sync(): a band change, a resize, an orientation
    // flip. Cached so the animation loop is not asking matchMedia twice a frame.
    mobile.current = scrubIsMobile();

    measurePin();
    measureReveal();
    measureKit();
    sampler.current.invalidate();
    plate(want.current);

    // fetchFilm(): pick this band's encode and only reload if it changed.
    //
    // Compared against the HANDLE's source and not against `v.src`, because on
    // the Blob fallback path `v.src` is a `blob:` URL that matches nothing.
    const band = bandRef.current;
    const src = pickBand(band, sources.src, sources.srcNarrow, sources.srcPhone);
    const poster = pickBand(band, sources.poster, sources.posterNarrow, sources.posterPhone);
    if (source.current?.source !== src) {
      source.current?.release();
      if (poster) v.poster = poster;
      v.preload = 'auto';
      painted.current = false;
      plateO.current = -1;
      want.current = -1;
      transport.reset();
      source.current = attachFilmSource(v, src, {
        onFail: () => failRef.current(),
        onPainted,
      });
    } else if (v.preload !== 'auto') {
      v.preload = 'auto';
    }

    measure();
    eased.current = -1;
    inked.current = null;
    veiled.current = -1;
    curved.current = -1;
    heroLast.current = '';
    beats.current = STORY.map(NO_MEMO);
    onScroll();
    dispatchEvent(new Event('scroll'));
  }, [
    refs,
    measurePin,
    measureReveal,
    measureKit,
    plate,
    onPainted,
    sources,
    transport,
    measure,
    onScroll,
  ]);

  const syncRef = useRef(sync);
  syncRef.current = sync;

  /** Band or reduced-motion change: full resync, exactly like the legacy MQ handler. */
  useEffect(() => {
    if (!enabled) return;
    syncRef.current();
  }, [enabled, env.wide, env.narrow, env.phone]);

  /* ── lifecycle: one effect owns every listener and the loop ────────────── */

  useEffect(() => {
    // Support is still undecided on the first commit: do nothing at all.
    if (enabled === null) return;
    if (!enabled) {
      failRef.current();
      return;
    }

    const root = document.documentElement;
    const cine = refs.cine.current;
    const v = refs.video.current;
    if (!cine || !v) return;

    root.classList.add('cine-on');
    window.__cineHold = true;

    const scroll = () => onScroll();
    const resize = () => syncRef.current();
    const onLoad = () => syncRef.current();

    const onMeta = () => {
      if (Number.isFinite(v.duration) && v.duration > 1) dur.current = v.duration;
      setFilmFrame();
      measureReveal();
      measure();
      onScroll();
    };

    /*
      THE SYNTHETIC SCROLL FIRES ONCE, NOT ON EVERY `progress`.

      `maybeReady` is bound to `progress`, `canplay`, `canplaythrough` and
      `loadeddata` below. `progress` fires repeatedly for as long as the film
      is downloading, and on the phone band the film is 6.22 MB — so it fires
      right across the intro. Each of those dispatched a global `scroll`, and a
      global `scroll` runs every other scroll-driven module on the page: the
      header's `#hero` rect read, the sticky bar's `.hero-ctas` rect plus a
      `querySelector('header.bar')` and an `offsetHeight`, and (until they were
      armed behind an observer) Services' and Process' below-the-fold rect
      reads. That is how work for sections 5,700px down was running before the
      visitor had scrolled at all: the probe's `firstScrollAt` was 563ms.

      `transport.ready()` is a one-way latch, so the page only needs telling
      once — that single dispatch is what covers a film that becomes ready
      while the visitor is holding still. `onScroll()` itself is NOT deduped:
      it is the film's own repaint and has to run on every new chunk of data.
    */
    let announced = false;
    const maybeReady = () => {
      if (!transport.ready()) return;
      onScroll();
      if (announced) return;
      announced = true;
      dispatchEvent(new Event('scroll'));
    };

    /**
     * iOS PRIMING — `primeVideo()` in the VDM reference.
     *
     * iOS will not paint a single frame of an inline video until playback has
     * been initiated at least once, no matter what `currentTime` is set to. So
     * play it and immediately pause it: one frame's worth of playback, and
     * from then on seeks paint.
     *
     * Two conditions, both from the reference and both load-bearing:
     *
     *  - MOBILE ONLY. On desktop a seek paints on its own, and a stray play()
     *    on a film the scrub transport believes is paused is just drift.
     *    Topcat's old prime fired on every device and ignored the band.
     *  - AFTER A GESTURE. iOS rejects play() without one. The promise is
     *    caught rather than retried: a rejection leaves the plate up, which is
     *    the correct picture, and the next gesture tries again for free.
     */
    let userReady = false;
    const primeFilm = () => {
      if (!mobile.current) return;
      try {
        const p = v.play();
        if (p && typeof p.then === 'function') {
          p.then(
            () => {
              try {
                v.pause();
              } catch {
                /* detached */
              }
            },
            () => {
              /* keep the plate; a later gesture or seek retries naturally */
            },
          );
        } else {
          v.pause();
        }
      } catch {
        /* keep the plate */
      }
    };
    const onFirstGesture = () => {
      if (userReady) return;
      userReady = true;
      primeFilm();
    };
    const onPrimeData = () => {
      if (userReady) primeFilm();
    };

    v.addEventListener('loadedmetadata', onMeta);
    v.addEventListener('progress', maybeReady);
    v.addEventListener('canplay', maybeReady);
    v.addEventListener('canplaythrough', maybeReady);
    v.addEventListener('loadeddata', maybeReady);
    v.addEventListener('loadeddata', onPrimeData);
    addEventListener('scroll', scroll, { passive: true });
    addEventListener('resize', resize);
    addEventListener('load', onLoad);
    addEventListener('pointerdown', onFirstGesture, { once: true, passive: true });
    addEventListener('touchstart', onFirstGesture, { once: true, passive: true });

    // A film that will never load must not leave the page holding its breath.
    //
    // Declaring failure is the LOADER's job now: an `error` on the direct URL
    // is a Blob-fallback trigger, not a failure, and only lib/filmSource.ts
    // knows when both paths are spent. This is only the case it cannot see —
    // an element that quietly settled on NETWORK_NO_SOURCE without ever
    // raising one.
    let deadTries = 0;
    const deadPoll = setInterval(() => {
      if (v.networkState === 3 && !v.error && !source.current?.viaBlob) {
        failRef.current();
        clearInterval(deadPoll);
      } else if (++deadTries > 10 || v.readyState >= 2) {
        clearInterval(deadPoll);
      }
    }, 400);

    const io =
      typeof IntersectionObserver === 'function'
        ? new IntersectionObserver((es) => {
            live.current = es[0].isIntersecting;
            if (live.current) onScroll();
          })
        : null;
    io?.observe(cine);

    const ro =
      typeof ResizeObserver === 'function'
        ? new ResizeObserver(() => {
            setFilmFrame();
            measureReveal();
            sampler.current.invalidate();
          })
        : null;
    const bg = refs.bg.current;
    if (bg) ro?.observe(bg);

    const onFonts = () => {
      measurePin();
      measureReveal();
      measureKit();
    };
    // `document.fonts` is absent in jsdom; the film measures text boxes, so
    // the post-webfont remeasure is not optional in a real browser.
    document.fonts?.ready?.then(onFonts).catch(() => {});

    // #hero deep link: land on the finished film with no scrub at all.
    const heroHash = () => (location.hash || '').toLowerCase() === '#hero';
    const unveil = () => root.classList.remove('to-hero');
    let hashLoad: (() => void) | null = null;
    let hashTimer: ReturnType<typeof setTimeout> | null = null;
    if (heroHash()) {
      skipRef.current();
      const onSeeked = () => requestAnimationFrame(() => requestAnimationFrame(unveil));
      v.addEventListener('seeked', onSeeked, { once: true });
      v.addEventListener('error', unveil, { once: true });
      hashLoad = () => {
        skipRef.current();
        hashTimer = setTimeout(() => {
          skipRef.current();
          unveil();
        }, 160);
      };
      addEventListener('load', hashLoad);
    }

    // The brand mark links to /#hero; clicking it from this page should snap
    // the film to its end rather than reload.
    const onBrandClick = (e: MouseEvent) => {
      const t = e.target as Element | null;
      const a = t?.closest?.('a.brand') as HTMLAnchorElement | null;
      if (!a) return;
      const href = a.getAttribute('href');
      if (!href) return;
      const u = new URL(href, location.href);
      if (u.hash.toLowerCase() !== '#hero') return;
      if (u.pathname.replace(/index\.html$/, '/') !== location.pathname.replace(/index\.html$/, '/'))
        return;
      e.preventDefault();
      if ((location.hash || '').toLowerCase() !== '#hero') {
        history.replaceState(null, '', '#hero');
      }
      skipRef.current();
    };
    document.addEventListener('click', onBrandClick);

    const idleId =
      typeof requestIdleCallback === 'function'
        ? requestIdleCallback(() => plate(want.current), { timeout: 1500 })
        : (setTimeout(() => plate(want.current), 300) as unknown as number);

    syncRef.current();

    return () => {
      v.removeEventListener('loadedmetadata', onMeta);
      v.removeEventListener('progress', maybeReady);
      v.removeEventListener('canplay', maybeReady);
      v.removeEventListener('canplaythrough', maybeReady);
      v.removeEventListener('loadeddata', maybeReady);
      v.removeEventListener('loadeddata', onPrimeData);
      removeEventListener('scroll', scroll);
      removeEventListener('resize', resize);
      removeEventListener('load', onLoad);
      removeEventListener('pointerdown', onFirstGesture);
      removeEventListener('touchstart', onFirstGesture);
      if (hashLoad) removeEventListener('load', hashLoad);
      if (hashTimer) clearTimeout(hashTimer);
      document.removeEventListener('click', onBrandClick);
      clearInterval(deadPoll);
      io?.disconnect();
      ro?.disconnect();
      if (typeof cancelIdleCallback === 'function') cancelIdleCallback(idleId);
      else clearTimeout(idleId as unknown as ReturnType<typeof setTimeout>);
      if (settleT.current) clearTimeout(settleT.current);
      settleT.current = null;
      if (raf.current !== null) cancelAnimationFrame(raf.current);
      raf.current = null;
      transport.halt();
      sampler.current.dispose();
      // Complete teardown of the media, per the reference: abort the in-flight
      // clip fetch, drop the loader's listeners, and revoke the Blob URL. A
      // leaked object URL pins the whole clip — up to 25 MB — in memory for the
      // lifetime of the tab.
      source.current?.release();
      source.current = null;
      painted.current = false;
      // Leave no trace on the document: this component unmounts on every
      // client-side navigation away from the home page.
      root.classList.remove('cine-on', 'cine-done', 'skip-live', 'to-hero');
      window.__cineHold = false;
      locked.current = false;
    };
    // `refs` is a stable object of stable refs; the loop's dependencies are
    // all stable callbacks. Re-running this effect would tear down the film.
  }, [enabled, refs, onScroll, setFilmFrame, measure, measureReveal, measurePin, measureKit, plate, transport]);

  return { enabled: enabled === true, env, skipToEnd };
}

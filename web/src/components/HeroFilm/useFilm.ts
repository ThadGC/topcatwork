'use client';

/**
 * HERO FILM — the engine.
 *
 * ⛔ THE ONE RULE THIS FILE EXISTS TO ENFORCE:
 *
 *     THIS CODE NEVER WRITES A POSITIONAL PROPERTY OF ANYTHING.
 *
 * No `top`, no `left`, no `translateY`, no scroll write, no height change, no
 * layout read. The hero is held in place entirely by CSS — `position: fixed` on
 * a direct child of <body> — so there is no offset for JavaScript to compute
 * and therefore nothing that can fall behind the compositor. If this loop is
 * late, or stalls completely, the PICTURE freezes. Nothing moves.
 *
 * That is the whole design. The previous film shook up and down on mobile for
 * many sessions because its pin was `position: sticky` in a runway ten
 * viewports tall, and the movement was on the scroll axis only — the signature
 * of a pin resolving against a stale scroll offset. The client also reports it
 * never reproduced on localhost, only on a real phone against a real
 * deployment, which is the signature of the main thread stalling on network
 * work that localhost does not have. Both are addressed structurally below.
 *
 * ── what the loop is allowed to touch ───────────────────────────────────────
 *   video.currentTime          the picture
 *   element.style.opacity      composited
 *   --lx, --lsc, --hx, --veil  composited transforms and opacities, written on
 *                              the consuming element, NEVER on :root
 *   pane transforms            composited; the reveal
 *   data-film on the stage     a released/running flag, written on change only
 *
 * ── what it must never touch, and why ───────────────────────────────────────
 *   getBoundingClientRect, offsetWidth, getComputedStyle
 *       Every read after a write in the same task forces a synchronous style
 *       and layout flush. The old loop did four of these per tick. On a desktop
 *       they vanish into headroom; on a throttled phone they overrun the frame.
 *       All geometry here is measured ONCE per resize and cached.
 *   drawImage(video) / getImageData
 *       On a phone the decoded frame belongs to another process, so a readback
 *       is a cross-process surface acquire plus a colour conversion — ~8.3ms
 *       against a 16.7ms budget, or 8.3ms on a 120Hz phone. The old loop did it
 *       two or three times a tick to grade the nav and the text scrims. Both
 *       are static values now.
 *   requestVideoFrameCallback
 *       While scrubbing it fires when a SEEK COMPLETES, i.e. on the network's
 *       clock. The old build drove the reveal edge off it, so the edge stepped
 *       at network rate while everything else ran at display rate.
 *   window.scrollTo / scrollBy, or any write to the runway's height
 *       A programmatic scroll fired into a live momentum animation is a
 *       cross-thread fight. The old build did exactly this at the end of the
 *       film, collapsing the runway by seven viewports and subtracting the same
 *       distance from scrollY in the same frame.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  clamp01,
  heroNarrowAlpha,
  kitOffset,
  plateOpacity,
  r2,
  revealAlpha,
  revealScale,
  veilValue,
  wipeEase,
} from './lib/curves';
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
  type RevealMetrics,
} from './lib/reveal';
import { PHONE_GRADE, WIDE_GRADE, gradeAt } from './lib/grade';
import {
  DUR,
  STORY,
  bandFor,
  beatWindow,
  filmBand,
  type Band,
} from './lib/timeline';
import {
  animates,
  mounts,
  readFilmMode,
  residentLoad,
  scalesReveal,
  seeks,
  showsText,
  type FilmMode,
} from './lib/mode';

/**
 * TWO FRAME RATES, AND THEY ARE NOT THE SAME NUMBER.
 *
 * `FILM_FPS` is the encode rate — the rate the masters were actually shot at.
 * It sets the seek deadband and the plate's frame-0 test.
 *
 * ⛔ IT IS 24 BECAUSE 12 WAS NOT SMOOTH. The cuts were briefly encoded at 12fps
 * to keep them small enough to hold in memory. The client, 28 Aug: "if I scroll
 * very slowly, it just jumps between frames, and it doesn't feel like a smooth
 * experience." He is right and it is arithmetic — half the frames means each
 * one is held twice as long under a slow scrub. The film now ships every frame
 * the camera shot. Do not trade this back for file size.
 *
 * `REVEAL_FPS` is the grid the reveal tables were MEASURED on, which is every
 * second frame of a 24fps master. It is a property of the measurement, not of
 * the encode, so it stays at 12 whatever the cuts are re-encoded at — the
 * tables are indexed by `filmSeconds * REVEAL_FPS`, never by a frame count.
 */
export const FILM_FPS = 24;
export const REVEAL_FPS = 12;

/**
 * The runway, per band, in viewport heights.
 *
 *   film   the distance over which the film actually plays
 *   tail   ONE VIEWPORT of hold at the final frame. This is not padding: it is
 *          exactly the height of `.heroOut`, so the page's own hero rises over
 *          a film that has stopped rather than over one still moving.
 *   +100   the viewport itself
 *
 * Derived to preserve the scroll feel of the build the client signed off,
 * which expressed the same thing as a total height plus a fractional tail
 * `hold`: phone 800vh at hold 0.2125, tablet 900vh at 0.2, wide 1050vh at
 * 0.1387. Multiplying those out gives 551 / 640 / 818 viewport-heights of
 * actual film, which is what is reproduced here.
 */
const RUNWAY = {
  phone: { film: 550, tail: 100 },
  tablet: { film: 640, tail: 100 },
  wide: { film: 820, tail: 100 },
} as const;

/** Seek deadband: half a film frame. Closer than this and the seek is a no-op
 *  that costs a decode and returns the same picture. */
const SEEK_EPS = 0.5 / FILM_FPS;

/** The scrim floor, and where it starts ramping to full. Film seconds. */
const VEIL_MIN = 0.2;
const VEIL_AT = 38;

export interface FilmRefs {
  runway: React.RefObject<HTMLDivElement | null>;
  stage: React.RefObject<HTMLDivElement | null>;
  video: React.RefObject<HTMLVideoElement | null>;
  plate: React.RefObject<HTMLDivElement | null>;
  shade: React.RefObject<HTMLDivElement | null>;
  reveal: React.RefObject<HTMLParagraphElement | null>;
  kit: React.RefObject<HTMLParagraphElement | null>;
  heroCopy: React.RefObject<HTMLDivElement | null>;
  /** The PAGE's hero — the h1, the CTAs, the chips. Released at 93%. */
  pageHero: React.RefObject<HTMLElement | null>;
  skip: React.RefObject<HTMLButtonElement | null>;
}

export interface FilmSources {
  wide: string;
  phone: string;
  plateWide: string;
  platePhone: string;
}

/**
 * Every ancestor property that would silently break the pin.
 *
 * Any of these on an ancestor makes THAT element the containing block for
 * fixed descendants, so `position: fixed` stops meaning "the viewport" — the
 * stage becomes the wrong size and scrolls away with the page. A clipping
 * ancestor that also scrolls costs the stage its viewport anchoring outright.
 *
 * Nothing throws when this happens and it looks perfect on a desktop. It only
 * shows up as a shake on a real phone, which is the one place nobody here can
 * look. So it is asserted at runtime, and a violation REFUSES TO MOUNT THE
 * FILM rather than shipping a shaking one: a missing film gets reported in an
 * hour, a shaking film survived many sessions unreported as a cause.
 */
function pinIsSafe(stage: HTMLElement): { ok: boolean; why?: string } {
  let n: HTMLElement | null = stage.parentElement;
  while (n && n !== document.documentElement) {
    if (n !== document.body) {
      const cs = getComputedStyle(n);
      const bad =
        (cs.transform !== 'none' && 'transform') ||
        (cs.filter !== 'none' && 'filter') ||
        (cs.backdropFilter !== 'none' && 'backdrop-filter') ||
        (cs.perspective !== 'none' && 'perspective') ||
        (cs.contain !== 'none' && cs.contain !== '' && 'contain') ||
        (cs.willChange !== 'auto' && 'will-change') ||
        (cs.overflow !== 'visible' && 'overflow') ||
        (cs.overflowX !== 'visible' && 'overflow-x') ||
        (cs.overflowY !== 'visible' && 'overflow-y') ||
        (cs.position === 'sticky' && 'position:sticky');
      if (bad) {
        return {
          ok: false,
          why: `${bad} on <${n.tagName.toLowerCase()}${
            n.className ? ' class="' + String(n.className).slice(0, 40) + '"' : ''
          }> — the film stage must be a direct child of <body> with no clipping, transformed or scroll-positioned ancestor`,
        };
      }
    }
    n = n.parentElement;
  }
  return { ok: true };
}

/** Cover fit of a `vw x vh` source inside a `boxW x boxH` box. */
function coverFit(boxW: number, boxH: number, vw: number, vh: number) {
  const vr = vw / vh;
  const br = boxW / boxH;
  if (vr > br) {
    const dh = boxH;
    const dw = dh * vr;
    return { dw, dh, dx: (boxW - dw) / 2, dy: 0 };
  }
  const dw = boxW;
  const dh = dw / vr;
  return { dw, dh, dx: 0, dy: (boxH - dh) / 2 };
}

/** An element's exact CONTENT box.
 *
 *  `getComputedStyle().width` is NOT it: Blink resolves it against the
 *  element's own `box-sizing`, so on a `border-box` element it comes back as
 *  the BORDER box. The phone's reveal line carries ~27px of padding a side, and
 *  a `cw` that is 54px too large parks the wedge pane's clip edge 54px behind
 *  the slant while the strip pane stays on it — the two panes stop tiling and a
 *  band down the middle of the headline is uncovered by neither. That is the
 *  black bar across the phone headline the client reported on the old build. */
function contentBox(el: HTMLElement) {
  const cs = getComputedStyle(el);
  const num = (v: string) => {
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : 0;
  };
  const pl = num(cs.paddingLeft);
  const pt = num(cs.paddingTop);
  let w = num(cs.width);
  let h = num(cs.height);
  if (cs.boxSizing === 'border-box') {
    w = Math.max(
      0,
      w - pl - num(cs.paddingRight) - num(cs.borderLeftWidth) - num(cs.borderRightWidth),
    );
    h = Math.max(
      0,
      h - pt - num(cs.paddingBottom) - num(cs.borderTopWidth) - num(cs.borderBottomWidth),
    );
  }
  return { w, h, pl, pt };
}

interface Geom {
  /** the runway's document offset */
  top: number;
  /** px of scroll over which the film plays */
  filmPx: number;
  /** px of scroll for the whole runway, film + tail */
  runPx: number;
  band: Band;
  /** the reveal line's pane metrics, or null if it cannot be measured */
  rv: RevealMetrics | null;
  /** the kit line's right edge, for its slide */
  kitX1: number;
}

export function useFilm(refs: FilmRefs, sources: FilmSources) {
  const [mode] = useState<FilmMode>(() => readFilmMode());
  const [live, setLive] = useState(false);

  const geom = useRef<Geom | null>(null);
  const raf = useRef(0);
  const lastWrite = useRef(0);
  const armed = useRef(false);
  const doneFlag = useRef<boolean | null>(null);
  const memo = useRef({
    plate: -1,
    veil: -1,
    nav: -1,
    lgRv: -1,
    lgKit: -1,
    rvA: -1,
    rvS: -1,
    kitA: -1,
    kitX: NaN as number,
    heroA: -1,
    heroX: NaN as number,
    open: false,
    ink: false,
  });

  /* ── measurement: ONCE per resize, never in the loop ──────────────────── */

  const measure = useCallback(() => {
    const runway = refs.runway.current;
    const stage = refs.stage.current;
    if (!runway || !stage) return;

    const band = bandFor(window.innerWidth);
    const key = band.phone ? 'phone' : band.tablet ? 'tablet' : 'wide';
    const vh = window.innerHeight;
    const plan = RUNWAY[key];

    // The ONE height write, and it happens on resize, never during a scroll.
    runway.style.setProperty('--runway', `${plan.film + plan.tail + 100}vh`);

    const filmPx = (plan.film / 100) * vh;
    const runPx = ((plan.film + plan.tail) / 100) * vh;
    const top = runway.getBoundingClientRect().top + window.scrollY;

    // The film frame, for the wide band's film-space line layout. Written on
    // the STAGE, not on :root: an unregistered custom property is inherited, so
    // setting one on the root invalidates style for the whole document.
    const v = refs.video.current;
    const fw = v?.videoWidth || (filmBand(band).phone ? 608 : 1920);
    const fh = v?.videoHeight || 1080;
    const sc = Math.max(window.innerWidth / fw, vh / fh);
    stage.style.setProperty('--filmU', `${Math.round(sc * 1e5) / 1e5}px`);
    stage.style.setProperty(
      '--filmX',
      `${Math.round(((window.innerWidth - fw * sc) / 2) * 100) / 100}px`,
    );
    stage.style.setProperty(
      '--filmY',
      `${Math.round(((vh - fh * sc) / 2) * 100) / 100}px`,
    );

    // The reveal line's pane frame.
    let rv: RevealMetrics | null = null;
    const line = refs.reveal.current;
    if (line) {
      boxPanes(line);
      const cb = contentBox(line);
      const fit = coverFit(window.innerWidth, vh, fw / fh, 1);
      rv = {
        sc: fit.dw / fw,
        dx: fit.dx,
        dy: fit.dy,
        left: line.offsetLeft,
        top: line.offsetTop,
        w: line.offsetWidth,
        h: line.offsetHeight,
        pl: cb.pl,
        pt: cb.pt,
        cw: cb.w,
        ch: cb.h,
      };
    }

    const kitEl = refs.kit.current;
    geom.current = {
      top,
      filmPx: Math.max(1, filmPx),
      runPx: Math.max(1, runPx),
      band,
      rv,
      kitX1: kitEl ? kitEl.offsetLeft + kitEl.offsetWidth : 0,
    };
  }, [refs]);

  /* ── the reveal panes ─────────────────────────────────────────────────── */

  const boxPanes = (line: HTMLElement) => {
    for (const [sel, bl] of [
      ['[data-rv="wedge"]', WEDGE_BLEED],
      ['[data-rv="strip"]', STRIP_BLEED],
    ] as [string, PaneBleed][]) {
      const wrap = line.querySelector<HTMLElement>(sel);
      const inner = wrap?.firstElementChild as HTMLElement | null;
      if (!wrap || !inner) continue;
      // Negative margin cancels the padding exactly, so the pane's box reaches
      // past the copy without moving the copy.
      wrap.style.margin = `${-bl.t}px ${-bl.r}px ${-bl.b}px ${-bl.l}px`;
      wrap.style.padding = `${bl.t}px ${bl.r}px ${bl.b}px ${bl.l}px`;
      // Both halves MUST share this origin or the inverse stops cancelling.
      wrap.style.transformOrigin = `${bl.l}px ${bl.t}px`;
      inner.style.transformOrigin = '0px 0px';
    }
  };

  const writePane = (line: HTMLElement, sel: string, m: Affine) => {
    const wrap = line.querySelector<HTMLElement>(sel);
    const inner = wrap?.firstElementChild as HTMLElement | null;
    if (!wrap || !inner) return;
    const park = isPaneOff(m);
    // Park with `visibility`, not by writing the huge offset: under the
    // `overflow: hidden` fallback a pane whose inner is pushed a hundred
    // thousand pixels out is a scroll container with that much scrollable
    // overflow, sitting on the page for as long as the band lasts.
    wrap.style.visibility = park ? 'hidden' : '';
    if (park) return;
    wrap.style.transform = affineCss(m);
    inner.style.transform = affineCss(invertAffine(m));
  };

  const paintReveal = useCallback(
    (filmSeconds: number) => {
      const line = refs.reveal.current;
      const g = geom.current;
      if (!line || !g || !g.rv) return;
      const panes = revealPanes(filmSeconds * REVEAL_FPS, g.rv, filmBand(g.band));
      if (panes.done !== memo.current.open) {
        memo.current.open = panes.done;
        if (panes.done) line.setAttribute('data-open', '');
        else line.removeAttribute('data-open');
      }
      if (panes.done) {
        writePane(line, '[data-rv="wedge"]', IDENTITY);
        writePane(line, '[data-rv="strip"]', PANE_OFF);
        return;
      }
      writePane(line, '[data-rv="wedge"]', panes.wedge);
      writePane(line, '[data-rv="strip"]', panes.strip);
    },
    [refs],
  );

  /* ── the loop ─────────────────────────────────────────────────────────── */

  const tick = useCallback(
    (now: number) => {
      raf.current = requestAnimationFrame(tick);

      // Cap at 60Hz. A 120Hz phone halves the frame budget, and none of this
      // film is authored above 60. Scroll is still sampled every frame; only
      // the writes are capped.
      if (now - lastWrite.current < 16.4) return;
      lastWrite.current = now;

      const g = geom.current;
      const stage = refs.stage.current;
      if (!g || !stage) return;

      const y = window.scrollY - g.top;
      const past = y > g.runPx;
      const before = y < -1;

      // Release. A single attribute, written only when it changes.
      const done = past || before;
      if (done !== doneFlag.current) {
        doneFlag.current = done;
        stage.dataset.film = done ? 'done' : 'on';
        /*
          The header has no chrome of its own while the film is running — the
          bar forming is the film's closing beat. This is a ROOT class, which
          is normally forbidden in this loop because an unregistered custom
          property on the root invalidates style for the whole document. It is
          allowed here because it is written ONLY on a transition: twice in a
          visit, not sixty times a second. See SiteHeader.tsx.
        */
        document.documentElement.classList.toggle('film-running', !done);
      }
      if (done) return;

      const p = clamp01(y / g.filmPx);
      const v = refs.video.current;
      const dur = v && isFinite(v.duration) && v.duration > 1 ? v.duration : DUR;
      const t = p * dur;

      // The picture. One seek in flight at a time, with a half-frame deadband.
      // The file is in memory by now, so this cannot touch the network.
      if (v && seeks(mode) && !v.seeking && Math.abs(v.currentTime - t) > SEEK_EPS) {
        try {
          v.currentTime = t;
        } catch {
          /* a decoder that has gone away; the plate is still on screen */
        }
      }

      const m = memo.current;

      const plate = plateOpacity(t, FILM_FPS);
      if (plate !== m.plate) {
        m.plate = plate;
        const el = refs.plate.current;
        if (el) el.style.opacity = String(plate);
      }

      const veil = veilValue(p, dur, VEIL_AT, VEIL_MIN);
      if (veil !== m.veil) {
        m.veil = veil;
        stage.style.setProperty('--veil', String(veil));
      }

      /*
        The scrims read against the footage, from a table sampled offline —
        never by reading pixels back off the video. See lib/grade.ts for why
        that distinction is the difference between a film that holds 60fps on a
        phone and one that does not.
      */
      const grade = filmBand(g.band).phone ? PHONE_GRADE : WIDE_GRADE;
      const frame = t * REVEAL_FPS;
      const nav = r2(gradeAt(grade.nav, frame));
      if (nav !== m.nav) {
        m.nav = nav;
        stage.style.setProperty('--navGrade', String(nav));
      }

      if (showsText(mode)) {
        const fb = filmBand(g.band);

        // Beat 2 — uncovered by the reveal, faded only on the way out.
        const rvEl = refs.reveal.current;
        if (rvEl) {
          const w = beatWindow(STORY[1], g.band);
          const fad = g.band.phone ? 2.03 : 2.47;
          const a = revealAlpha(t, w.at, w.out, fad);
          if (a !== m.rvA) {
            m.rvA = a;
            rvEl.style.opacity = String(a);
          }
          /* The scrim only comes on once the wipe has FINISHED. While the
             line is half-uncovered a scrim would be grading against pixels the
             visitor cannot see it over, and it would draw a soft dark box
             around a headline that is still arriving. This is the old build's
             rule and it is why its reference frames show no glow mid-wipe. */
          const lg = memo.current.open && a > 0.02 ? r2(gradeAt(grade.reveal, frame)) : 0;
          if (lg !== m.lgRv) {
            m.lgRv = lg;
            rvEl.style.setProperty('--lg', String(lg));
          }
          if (!g.band.wide && scalesReveal(mode)) {
            const s = revealScale(t, w.out, fad);
            if (s !== m.rvS) {
              m.rvS = s;
              rvEl.style.setProperty('--lsc', String(s));
            }
          }
          paintReveal(fb.phone ? t : t);
        }

        // Beat 3 — hard on and off, slides in and back out to the left.
        const kitEl = refs.kit.current;
        if (kitEl) {
          const w = beatWindow(STORY[2], g.band);
          const on = t > w.at && t < w.out ? 1 : 0;
          if (on !== m.kitA) {
            m.kitA = on;
            kitEl.style.opacity = String(on);
          }
          const ramp = g.band.wide ? 3.2 : g.band.phone ? 1.8 : 2.2;
          const x = kitOffset(t, w.at, w.out, w.at + ramp, w.out - ramp, g.kitX1);
          if (x !== m.kitX) {
            m.kitX = x;
            kitEl.style.setProperty('--lx', String(x));
          }
          const kg = on ? r2(gradeAt(grade.kit, frame)) : 0;
          if (kg !== m.lgKit) {
            m.lgKit = kg;
            kitEl.style.setProperty('--lg', String(kg));
          }
        }
      }

      // The hero block. Taken off the screen by the film, not faded politely.
      const hero = refs.heroCopy.current;
      if (hero) {
        if (g.band.wide) {
          const q = clamp01(t / 6);
          const a = q >= 1 ? 0 : r2(1 - q);
          const x = -Math.round(wipeEase(q) * (window.innerWidth * 0.9));
          if (a !== m.heroA) {
            m.heroA = a;
            hero.style.opacity = String(a);
          }
          if (x !== m.heroX) {
            m.heroX = x;
            hero.style.setProperty('--hx', String(x));
          }
        } else {
          const a = heroNarrowAlpha(t);
          if (a !== m.heroA) {
            m.heroA = a;
            hero.style.opacity = String(a);
          }
        }
      }

      /*
        `ink` — the handoff. At 93% of the film the page's own hero fades and
        scales up in place over the final frame; the CSS transition does the
        movement, this only decides when. `loaded` is what globals.css's
        entrance stagger is keyed on, and `data-ink` is what film.module.css
        uses; both are written once, on the transition.
      */
      const ink = p >= 0.93;
      if (ink !== m.ink) {
        m.ink = ink;
        const ph = refs.pageHero.current;
        if (ph) {
          if (ink) {
            ph.setAttribute('data-ink', '');
            ph.classList.add('loaded');
          } else {
            ph.removeAttribute('data-ink');
            ph.classList.remove('loaded');
          }
        }
      }

      const skip = refs.skip.current;
      if (skip) {
        const gone = p > 0.985;
        const o = gone ? '0' : '1';
        if (skip.style.opacity !== o) {
          skip.style.opacity = o;
          skip.style.pointerEvents = gone ? 'none' : 'auto';
        }
      }
    },
    [refs, mode, paintReveal],
  );

  /* ── skip ─────────────────────────────────────────────────────────────── */

  const skipToEnd = useCallback(() => {
    const g = geom.current;
    if (!g) return;
    // The one place a scroll is written, and it is a direct response to a tap,
    // never something the engine decides to do while the visitor is scrolling.
    window.scrollTo({ top: g.top + g.runPx + 2, behavior: 'auto' });
  }, []);

  /* ── mount ────────────────────────────────────────────────────────────── */

  useEffect(() => {
    if (!mounts(mode)) return;
    const stage = refs.stage.current;
    const video = refs.video.current;
    if (!stage || !video) return;

    // Reduced motion, or no MP4 decoder: never start. The still hero and a one
    // viewport runway are already what is on screen.
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const canPlay = !!video.canPlayType?.('video/mp4; codecs="avc1.42E01E"');
    if (reduce || !canPlay) {
      stage.dataset.film = 'off';
      return;
    }

    // The pin, asserted. A violation ships the still hero rather than a film
    // that might shake on a phone nobody here can test on.
    const safe = pinIsSafe(stage);
    if (!safe.ok) {
      stage.dataset.film = 'off';
      // eslint-disable-next-line no-console
      console.error('[hero film] refusing to mount — ' + safe.why);
      return;
    }

    let cancelled = false;
    let objectUrl = '';

    const band = bandFor(window.innerWidth);
    const src = filmBand(band).phone ? sources.phone : sources.wide;

    const arm = () => {
      if (cancelled) return;
      armed.current = true;
      setLive(true);
      document.documentElement.classList.add('film-running');
      // The stage is `visibility: hidden` until this says otherwise, so it has
      // to be set here and not only from inside the loop — `?film=frozen`
      // never starts the loop and must still show the film.
      stage.dataset.film = 'on';
      doneFlag.current = false;
      // The component releases the page hero on a timer if the film never
      // arms; this is what stands that down. See the note at its call site.
      refs.pageHero.current?.setAttribute('data-film-armed', '');
      // `?film=notext` hides the story from here, not by rendering different
      // markup — see the note at the call site in index.tsx.
      if (!showsText(mode)) stage.dataset.text = 'off';
      measure();
      if (animates(mode)) {
        lastWrite.current = 0;
        raf.current = requestAnimationFrame(tick);
      }
    };

    /*
      MEMORY RESIDENCY, AND WHY IT IS THE WHOLE BALLGAME.

      The old build set `src` and let the media loader range-fetch as the scrub
      seeked. On localhost every one of those seeks is instant, which is exactly
      why the bug was never reproducible here: the failing path never ran. On a
      real connection a cold mid-file range is hundreds of milliseconds of TTFB
      before the radio has even woken, and the whole film waits on it.

      So the film is fetched ONCE, in full, as a blob, and only then does the
      scrub arm. After that no seek can touch the network — the worst a seek can
      cost is decoding up to six frames from the nearest keyframe, which is why
      the cuts are encoded with a keyframe every half second.

      `document.fonts.ready` joins the same gate: a web font arriving mid-film
      re-rasterises every story line at a new metric, on the main thread, which
      is precisely the text-only shiver this rebuild is trying to remove.
    */
    if (!residentLoad(mode)) {
      video.src = src;
      video.load();
      video.addEventListener('loadeddata', arm, { once: true });
    } else {
      Promise.all([
        fetch(src, { cache: 'force-cache' }).then((r) => r.blob()),
        document.fonts?.ready ?? Promise.resolve(),
      ])
        .then(([blob]) => {
          if (cancelled) return;
          objectUrl = URL.createObjectURL(blob as Blob);
          video.src = objectUrl;
          video.load();
          if (video.readyState >= 2) arm();
          else video.addEventListener('loadeddata', arm, { once: true });
        })
        .catch(() => {
          // The film could not be fetched. The plate is already on screen and
          // the runway is still one viewport: the visitor gets the still hero.
          if (!cancelled) stage.dataset.film = 'off';
        });
    }

    let rz = 0;
    const onResize = () => {
      window.clearTimeout(rz);
      rz = window.setTimeout(() => {
        if (armed.current) measure();
      }, 150);
    };
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);

    return () => {
      cancelled = true;
      window.clearTimeout(rz);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
      cancelAnimationFrame(raf.current);
      document.documentElement.classList.remove('film-running');
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [mode, refs, sources, measure, tick]);

  return { mode, live, skipToEnd, showsText: showsText(mode) };
}

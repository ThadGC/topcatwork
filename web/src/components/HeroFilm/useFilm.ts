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
  heroNarrowScale,
  keepCueAlpha,
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
  HERO_INK,
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
 * This is the film's scroll distance and nothing else. The hero section that
 * follows it is a real 100vh box in normal flow, so at the end of the runway
 * the hero is exactly filling the viewport — which is what makes the handoff
 * free of any movement at all.
 *
 * Derived to preserve the scroll feel of the build the client signed off,
 * which expressed the same thing as a total height plus a fractional tail
 * `hold`: phone 800vh at hold 0.2125, tablet 900vh at 0.2, wide 1050vh at
 * 0.1387. Multiplying those out gives 551 / 640 / 818 viewport-heights of
 * actual film, which is what these were.
 *
 * ⛔ THE TOUCH BANDS ARE NOW A QUARTER LONGER THAN THAT, ON PURPOSE.
 *
 * The client, 28 Aug, on his phone: "the video that is tied to the user swipe
 * might be slightly too quick. So for instance, they can swipe through it too
 * fast by accident ... if they do one big swipe, they can switch past things
 * that they didn't mean to." And, on the third beat: "the stone sets the tone
 * of the room comes in too quickly."
 *
 * A longer runway is fewer seconds of film per pixel of scroll, so one flick
 * covers less of it. That is the only lever that does not break the strict
 * scroll-to-film coupling the whole engine is built on — rate-limiting the
 * film time instead would let the picture drift away from the scroll position
 * and put the lock's `p >= 1` behind a catch-up animation.
 *
 * It also takes pressure off the decoder, which is what the reverse-scrub
 * glitching is made of: fewer film-seconds per gesture is fewer seeks per
 * gesture. See REVEAL_MAX_LAG.
 *
 * ⚠️ WIDE IS DELIBERATELY UNCHANGED at the signed-off 818. The client on the
 * same day: "so far, the desktop version seems to be working perfectly. I
 * don't see any errors with the desktop version." A mouse wheel and a trackpad
 * do not produce the flick that caused this.
 */
const RUNWAY = { phone: 690, tablet: 800, wide: 820 } as const;

/**
 * How long the scroll must be still before the film locks.
 *
 * The collapse changes the document height by several viewports. Doing that
 * inside a live momentum scroll is a cross-thread fight, so it waits for the
 * visitor to actually stop. What it does NOT do any more is honour where they
 * stopped — see `lockFilm`.
 */
const SETTLE_MS = 220;


/** Seek deadband: half a film frame. Closer than this and the seek is a no-op
 *  that costs a decode and returns the same picture. */
const SEEK_EPS = 0.5 / FILM_FPS;

/**
 * How far the PICTURE may lag the SCROLL before the reveal stops following it.
 *
 * The reveal's mask is driven by the frame actually on screen rather than by
 * the scroll target, because it tracks a real moving edge in the footage and
 * half a frame of lead shows as a sliver of headline uncovering early. That is
 * right while the decoder is keeping up.
 *
 * It is badly wrong when it is not. The scrub allows one seek in flight, so a
 * fast drag — and above all a REVERSE one, where every backward seek re-decodes
 * from the previous keyframe — leaves `shown` seconds behind `t`. The mask is
 * then computed from a frame index below the reveal's own table, `phonePanes`
 * clamps to the table's first entry, and the first entry is the mask at its
 * THICKEST: a black bar sitting over a headline that the scroll has already
 * faded to full opacity.
 *
 * The client, 28 Aug: "if I were to reverse the video by swiping back ... the
 * video glitches all over the place, the black bar that is supposed to go back
 * over the ... the slab you choose is unique text ... it's extra thick. It's
 * completely broken."
 *
 * Past this much lag the mask follows the scroll instead. The picture is still
 * catching up, but the mask and the words it is masking agree with each other,
 * which reads as the reveal running rather than as a bar stuck over the text.
 * Four frames: comfortably more than the half-frame deadband and the one seek
 * in flight, comfortably less than the gap a flick opens up.
 */
const REVEAL_MAX_LAG = 4 / FILM_FPS;

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
  /** The two chips that ride the wide band's wipe alongside the opening line. */
  trust: React.RefObject<HTMLDivElement | null>;
  /** The PAGE's hero — the h1, the CTAs, the chips. Released at 93%. */
  pageHero: React.RefObject<HTMLElement | null>;
  /** The one viewport the hero occupies in normal flow. The lock's anchor. */
  heroSpace: React.RefObject<HTMLDivElement | null>;
  skip: React.RefObject<HTMLButtonElement | null>;
  /** The small arrow that carries the swipe on once the opening copy has gone.
   *  A direct child of the stage, not of `.heroCopy` — see index.tsx. */
  keepCue: React.RefObject<HTMLDivElement | null>;
}

export interface FilmSources {
  wide: string;
  phone: string;
  /** The client's high-resolution render of frame 0, over the film until it moves. */
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
  /**
   * The opening copy's right edge, and the trust row's.
   *
   * The wide band's wipe is `-x1 * wipeEase(p)`, so the copy travels exactly
   * its own extent and is fully clear of the screen at p=1, whatever the
   * viewport. Driving it off the viewport width instead — which is what this
   * did before — moves it nearly twice as far, and the headline was already
   * cut off at its left edge one second into a six second wipe.
   */
  heroX1: number;
  trustX1: number;
}

export function useFilm(refs: FilmRefs, sources: FilmSources) {
  const [mode] = useState<FilmMode>(() => readFilmMode());
  const [live, setLive] = useState(false);

  const geom = useRef<Geom | null>(null);
  /**
   * The media time of the frame ACTUALLY ON SCREEN.
   *
   * ⛔ `video.currentTime` IS NOT THIS. Assigning to it returns the REQUESTED
   * time immediately, while the decoder is still fetching and decoding the
   * frame — so during a fast scrub `currentTime` runs ahead of the picture by
   * however long the seek takes. Driving the reveal from it put the clip edge
   * ahead of the slab it is supposed to be tracking, and on a fast scroll the
   * gap opened wide enough to read as a black bar across half the headline.
   * The client photographed exactly that.
   *
   * `requestVideoFrameCallback` reports the frame that has been PRESENTED, so
   * this is the only value the reveal can honestly be computed from. It was
   * avoided because while scrubbing it fires on the network's clock — but that
   * argument died with byte-range loading: the film is memory-resident before
   * the scrub arms, so a seek is a decode, not a round trip.
   */
  const shown = useRef(0);
  const locked = useRef(false);
  const stillSince = useRef(0);
  /* The timestamp of the first tick at p = 1, so the lock can wait a bounded
     time for the closing seek to land instead of forever. */
  const completeAt = useRef(0);
  const lastY = useRef(-1);
  const raf = useRef(0);
  const lastWrite = useRef(0);
  const armed = useRef(false);
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
    edge: -1,
    heroSc: -1,
    trustGone: null as boolean | null,
    keepCue: -1,
    open: false,
    ink: false,
  });

  /* ── measurement: ONCE per resize, never in the loop ──────────────────── */

  const measure = useCallback(() => {
    const runway = refs.runway.current;
    const stage = refs.stage.current;
    if (!runway || !stage || locked.current) return;

    const band = bandFor(window.innerWidth);
    const key = band.phone ? 'phone' : band.tablet ? 'tablet' : 'wide';
    const vh = window.innerHeight;
    const plan = RUNWAY[key];

    // The runway's height is written exactly twice in a page's life: here, when
    // the film arms, and again at the lock. Never during a scroll.
    runway.style.setProperty('--runway', `${plan}vh`);

    /*
      ⛔ THE RUNWAY'S OWN LAID-OUT HEIGHT, NOT A SUM FROM `innerHeight`.

      This used to be `(plan / 100) * vh`. The scrub is `p = y / filmPx`, so
      filmPx was a function of the live viewport height — and on a phone the
      address bar retracting or returning changes that mid-scroll. The same
      scrollY then mapped to a different p and the film JUMPED.

      Measured at 390 with scrollY held constant, 844 -> 758 (an 86px bar):
      p=0.60 jumps 3.01s, p=0.80 jumps 4.02s, and from p >= 0.898 the re-map
      pushes p past 1 and ENDS THE FILM OUTRIGHT. The client, 28 Aug: "as soon
      as I got to the stone sets the tone of the room, it just glitched
      straight through to the surfaces for every space. But then when I swiped
      back and did it again, it now did it the right way" — non-deterministic
      because it depends on whether the bar happened to move.

      The runway has no padding, no border and `box-sizing: border-box`, so its
      border-box height IS the film's length, and it is whatever was actually
      laid out rather than a number recomputed from a viewport that moves. It
      is numerically identical on desktop and correct on iOS, where `vh` is the
      large viewport.

      ⚠️ The `--runway` write above must stay ABOVE this line so the rect is
      read after the height has been applied.
    */
    const filmPx = runway.getBoundingClientRect().height || (plan / 100) * vh;
    const runPx = filmPx;
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
    const hcEl = refs.heroCopy.current;
    const trEl = refs.trust.current;

    /*
      The transform-origin the narrow band's hero copy scales about.
      
      The original's perspective origin was `26% 50%` of the story plane, which
      is the viewport. A translateZ under perspective scales about that point,
      so reproducing it as a `scale` needs the same point expressed relative to
      the copy's own box. Measured here, once, rather than guessed at — it moves
      with the viewport and with the copy's position.
    */
    if (hcEl && !band.wide) {
      const r = hcEl.getBoundingClientRect();
      hcEl.style.transformOrigin = `${Math.round((0.26 * window.innerWidth - r.left) * 100) / 100}px ${
        Math.round((0.5 * vh - r.top) * 100) / 100
      }px`;
    } else if (hcEl) {
      hcEl.style.removeProperty('transform-origin');
    }
    geom.current = {
      top,
      filmPx: Math.max(1, filmPx),
      runPx: Math.max(1, runPx),
      band,
      rv,
      kitX1: kitEl ? kitEl.offsetLeft + kitEl.offsetWidth : 0,
      heroX1: hcEl ? hcEl.offsetLeft + hcEl.offsetWidth : 0,
      trustX1: trEl ? trEl.offsetLeft + trEl.offsetWidth : 0,
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

  /**
   * THE LOCK — the end of the film, and it is one-way.
   *
   * The client, 28 Aug: "once users reach this point, they cannot scroll
   * through the video again. They have to refresh."
   *
   * The runway collapses to nothing and the same distance comes off the scroll
   * IN THE SAME FRAME, so nothing on screen moves a pixel and everything below
   * rises by exactly the runway's length. The hero is already filling the
   * viewport at this moment — it is the box immediately after the runway — so
   * after the collapse it is simply the top of the page, and there is no longer
   * anything above it to scroll back into.
   *
   * Latched. It happens once per page load and the loop stops with it.
   */
  const lockFilm = useCallback(() => {
    const g = geom.current;
    const runway = refs.runway.current;
    const stage = refs.stage.current;
    const space = refs.heroSpace.current;
    if (locked.current || !g || !runway || !stage || !space) return;
    locked.current = true;

    /*
      THE STAGE STOPS BEING FIXED AND BECOMES THE HERO.

      `data-film="done"` switches it to `position: absolute; top: 0` and gives
      it the curve. The runway collapses to nothing in the same frame, and the
      scroll lands on the top of the hero's reserved space — which, with the
      runway gone, is the top of the document. A fixed box at top 0 and an
      absolute box at document top 0 with the scroll at 0 are the same place, so
      there is nothing to see. From here it scrolls away like any other section.

      The correction is measured off the reserved space AFTER the collapse
      rather than computed from a cached height: browsers do their own scroll
      anchoring when content above the viewport changes size, and measuring
      afterwards accounts for whatever the browser already did instead of
      double-counting it.

      ALWAYS the hero, never wherever they happened to stop. The runway is film
      from end to end, so there is no content position inside it worth
      preserving — honour an overshoot and a hard flick drops the visitor into
      the middle of the page having never seen the hero.
    */
    stage.dataset.film = 'done';
    document.documentElement.classList.remove('film-running');
    runway.style.setProperty('--runway', '0px');

    const afterTop = space.getBoundingClientRect().top;
    if (afterTop) window.scrollBy({ top: afterTop, left: 0, behavior: 'instant' });

    /*
      ⛔ AND THE MOMENTUM THEY ARRIVED WITH IS ABSORBED.

      A comment above claims "the correction still always lands on the hero, so
      an overshoot is absorbed rather than carried into the page." Measured at
      390, it does not. The correction itself is right — a slow finish lands at
      scrollY 0 with the hero exactly filling the viewport — but a FLICK is
      still being animated by the browser when the runway collapses underneath
      it, and that animation then carries on into a document that is now five to
      eight viewports shorter. Measured: at the lock, scrollY 0 and the hero at
      top 0; 2.5 seconds later, scrollY 1600 and the hero 1600px above the
      viewport, with the middle of the screen in the services section. A real
      phone flick carries much further than a scripted one.

      The client, 28 Aug: "if I swipe past, it jumps straight down to the
      project gallery section, which is wrong."

      So the landing is held until the visitor asks for something new. A flick's
      momentum arrives with no further input — the finger has already lifted —
      so it is absorbed and they stop on the hero. A deliberate second gesture
      fires `wheel`, `touchstart` or `keydown` and releases immediately, so
      nobody is ever held against their will. 700ms is the backstop.

      This is the same fault `skipToEnd` fixed with `behavior:'instant'`; what
      was missed is that a real visitor's own momentum does it too.
    */
    const land = window.scrollY;
    const lockedAt = performance.now();
    let free = false;
    let quiet = 0;
    let capId = 0;
    const release = () => {
      if (free) return;
      free = true;
      window.clearTimeout(capId);
      window.removeEventListener('wheel', onInput);
      window.removeEventListener('touchstart', onInput);
      window.removeEventListener('keydown', onInput);
    };
    /*
      ⛔ 150ms OF GRACE, OR THE GESTURE THAT ENDED THE FILM RELEASES THE GUARD
      IT JUST TRIGGERED. The lock runs inside a rAF tick, and the wheel or touch
      that pushed the scroll past the end is often delivered to the window
      AFTER it — so without this the guard was armed and released in the same
      breath, and the fling went straight through. A second, deliberate gesture
      is always later than this.
    */
    const onInput = () => {
      if (performance.now() - lockedAt > 150) release();
    };
    /*
      ⛔ IT LETS GO WHEN THE FLING STOPS, NOT ON A TIMER. A fixed 700ms backstop
      was tried first and it expired mid-fling: a 1600px throw was still being
      animated when the guard let go, and the visitor finished 1600px past the
      hero regardless. The release condition is quiet instead — eight frames in
      which nothing tried to move the page — with a hard cap behind it.

      ⛔ AND `behavior: 'instant'` IS NOT OPTIONAL. `html` carries
      `scroll-behavior: smooth` (content.css, globals.css), so the one-argument
      `window.scrollTo(x, y)` form ANIMATES. Measured with it: from y=1775 a
      re-issued `scrollTo(0, 0)` walked 1802, 1800, 1792, 1779, 1756, 1723,
      1674 … so `scrollY` never equalled `land` on any frame, `quiet` never
      reached 8, the release below was DEAD CODE, and the guard became a flat
      two second freeze — which is the "page apparently frozen" fault this
      whole design exists to avoid. Worse, it fired a fresh scroll ANIMATION
      every frame into a live fling, which is precisely the cross-thread fight
      this file's header forbids and the documented shape of the phone shake.
      With the options form it snaps in one frame and releases in about eight.
    */
    const pin = () => {
      if (free) return;
      if (window.scrollY !== land) {
        window.scrollTo({ top: land, left: 0, behavior: 'instant' });
        quiet = 0;
      } else if (++quiet > 8) {
        release();
        return;
      }
      requestAnimationFrame(pin);
    };
    window.addEventListener('wheel', onInput, { passive: true });
    window.addEventListener('touchstart', onInput, { passive: true });
    window.addEventListener('keydown', onInput);
    /* A backstop now that the quiet exit actually works, not the primary path:
       long enough to outlast a hard fling, short enough that no failure mode
       leaves anyone pinned. */
    capId = window.setTimeout(release, 900);
    requestAnimationFrame(pin);

    cancelAnimationFrame(raf.current);
    raf.current = 0;
  }, [refs]);

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
      const past = y >= g.runPx;
      const before = y < -1;

      /*
        ⛔ NOTHING HERE WRITES `data-film`. ONLY `lockFilm` DOES.

        This used to set it to 'done' the moment the scroll passed the end of
        the runway, which was correct when 'done' meant "hide the stage". It
        does not mean that any more: 'done' switches the stage from `fixed` to
        `absolute` at the document top, i.e. it turns the stage into the hero.
        Doing that while the runway is still several viewports tall throws the
        stage thousands of pixels above the viewport and leaves the visitor
        staring at empty runway until the lock catches up.

        That is exactly the reported fault. Traced frame by frame at 1440x900:
        at t=4860ms the stage went `absolute` with the runway still 7380px and
        the stage's own top at -7480 — a black screen — and it stayed that way
        for 1.1 seconds until `lockFilm` collapsed the runway and snapped back.

        The stage stays fixed and on screen right up to the lock. `done` below
        is only whether there is anything left to paint.
      */
      /* `past` is still read by `complete` below; the old combined `done`
         flag has gone with the early return it guarded. */
      void past;

      const p = clamp01(y / g.filmPx);

      /*
        THE HANDOFF AND THE LOCK COME BEFORE THE EARLY RETURN.

        They used to sit further down, after `if (done) return`, which meant
        that the moment the film released neither of them ever ran: the hero
        never inked and the runway never collapsed. Reaching the end simply
        left the stage hidden and the film still scrollable. Caught by driving
        the scroll PAST the end of the runway rather than to 99.9% of it — at
        99.9% everything looks right, which is exactly why it was missed.
      */
      /*
        ⛔ TWO DIFFERENT MOMENTS, AND THEY ARE NOT THE SAME NUMBER.

        `ink` is when the copy arrives: 93%, while the picture is still
        settling. The client, 28 Aug: "shortly before its end, as the kitchen is
        almost settling into its final position, then the surfaces worth
        building around should have come up already just before it settles in.
        And then it's already there." That is the old build's INK_AT, and it is
        why the copy lives inside the stage — at 0.93 the film is still moving,
        so the copy has to be pinned over it. Releasing it at 1 instead made the
        hero appear only once everything had stopped, which reads as a jump.

        `complete` is when the film is over and the runway may collapse. Both
        were one variable and the lock fired at whatever the copy's threshold
        was; separating them is what lets the copy lead the ending.
      */
      const ink = p >= HERO_INK;
      const complete = p >= 1;
      if (ink !== memo.current.ink) {
        memo.current.ink = ink;
        const ph = refs.pageHero.current;
        if (ph) {
          /*
            BOTH, and both are needed. `data-ink` is what film.module.css uses
            to settle the block as a whole; `loaded` is what globals.css's
            entrance stagger is keyed on — `#hero .hero-el {opacity:0}` /
            `#hero.loaded .hero-el {opacity:1}`, with a per-element `--hd`
            delay of 180/340/560/720/880ms.

            Writing only `data-ink` faded the block in with every element
            inside it still at zero, so the hero arrived as a headline alone,
            with no lede, no CTAs and no trust chips.
          */
          if (ink) {
            ph.setAttribute('data-ink', '');
            ph.classList.add('loaded');
          } else {
            ph.removeAttribute('data-ink');
            ph.classList.remove('loaded');
          }
        }
      }

      /*
        ⛔ FIRES THE MOMENT THE FILM COMPLETES. NO SETTLE WAIT.

        It used to wait for the scroll to stand still for 220ms, so that the
        collapse would not land inside a momentum scroll. The cost of that is
        worse than the thing it avoided: the stage covers the viewport until the
        lock, so a visitor who keeps scrolling gets NOTHING — the client counted
        about fifteen full-speed scrolls on a trackpad with the page apparently
        frozen, because a trackpad delivers wheel events continuously and the
        scroll never stands still long enough to qualify.

        There is no dead region to protect: the runway ends exactly where the
        film does, so completion and the end of the runway are the same point.
        Firing here means the collapse happens at the instant there is nothing
        left to scroll through. The correction still always lands on the hero,
        so an overshoot is absorbed rather than carried into the page.

        The dead scroll the client asked for is the 40vh hold BELOW the hero —
        real page, real movement — not a stall.
      */
      /*
        ⛔ THE ENDING IS PAINTED BEFORE THE LOCK, NOT INSTEAD OF IT.

        This used to read `if (complete) { lockFilm(); return; }`, which
        returned BEFORE the seek and before every write below it. On the
        natural path that was invisible, because the loop had been seeking all
        the way up the runway and the picture was already almost home. But any
        path that arrives at the end WITHOUT scrubbing through it locked the
        stage as the hero with the video still on whatever frame it happened to
        be showing — frame 0, the quarry.

        Measured at 390x844: click the brand logo on a fresh load and the film
        locks with `video.currentTime = 0`, against 41.94 on the natural path.
        That is the client's report — "it's supposed to take you to the
        surfaces worth building around hero section, but instead it loads the
        site in completely below this" — and his screenshot is the quarry, the
        opening story line, SCROLL TO BEGIN and SKIP INTRO all frozen in place
        as the hero. THE SKIP BUTTON HAD THE SAME FAULT and nobody had
        reported it yet.

        So `complete` now falls through and every write below runs at p = 1:
        the seek to the last frame, the veil, the scrims, the story lines
        retiring, the cue, the skip. The lock happens at the foot of the tick.
      */
      if (before) return;

      const v = refs.video.current;
      const dur = v && isFinite(v.duration) && v.duration > 1 ? v.duration : DUR;
      /* ⛔ CLAMPED INSIDE THE LAST FRAME. At p = 1 this is exactly `dur`, and
         seeking a video to its own duration is the one seek a browser is
         entitled to refuse — it can clamp, fire `ended`, or land on nothing.
         Half a frame back is unambiguously the final picture. */
      const t = Math.min(p * dur, dur - 0.5 / FILM_FPS);

      // The picture. One seek in flight at a time, with a half-frame deadband.
      // The file is in memory by now, so this cannot touch the network.
      // Fallback only: with no rVFC there is nothing else to go on.
      // (`in` would narrow `v` to never — lib.dom declares the method.)
      if (
        v &&
        typeof (v as { requestVideoFrameCallback?: unknown }).requestVideoFrameCallback !==
          'function'
      ) {
        shown.current = v.currentTime;
      }

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
          /*
            ⛔ DRIVEN BY THE FRAME THAT IS ON SCREEN, NOT BY THE SCROLL TARGET.

            The edge is tracked against a real moving edge in the footage, so it
            has to be computed for the picture the visitor is actually looking
            at. Driving it from `t` put it a consistent 0.46 frames ahead —
            measured across the whole sweep — because the scrub holds a
            half-frame deadband before it seeks. Half a frame on a slanted edge
            is a sliver of the headline uncovering just before the slab reaches
            it, every frame, for the length of the reveal.

            Quantised to the film's own frame grid, so the edge lands exactly on
            the frame boundary the decoder is showing rather than somewhere
            between two of them. This is NOT `requestVideoFrameCallback`, which
            while scrubbing fires on the network's clock — it is a free read of
            a value the transport has already set.
          */
          /*
            The frame on screen, not the one that has been asked for — while
            the decoder is close enough to it to be worth following. Past
            REVEAL_MAX_LAG the mask follows the scroll instead; see the note on
            that constant for why a stale frame index is so much worse here
            than a stale picture.
          */
          paintReveal(Math.abs(shown.current - t) > REVEAL_MAX_LAG ? t : shown.current);
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

      /*
        THE OPENING COPY, taken off the screen by the film.

        Wide: it slides out to the left by exactly its own extent and does NOT
        fade — opacity is a hard 1 until the wipe is over, then 0. The trust
        chips ride the same offset and are hidden the moment they clear the
        left edge, rather than compositing an off-screen row for the rest of
        the wipe.

        The edge vignette's opacity is how much of the copy is still on screen,
        so the two move together. All four numbers below were read frame by
        frame off the old build and match it to 2dp.
      */
      const hero = refs.heroCopy.current;
      const trust = refs.trust.current;
      if (hero) {
        if (g.band.wide) {
          const q = clamp01(t / 6);
          const tx = r2(-g.heroX1 * wipeEase(q));
          const on = q >= 1 ? 0 : 1;
          if (tx !== m.heroX) {
            m.heroX = tx;
            hero.style.setProperty('--hx', String(tx));
            trust?.style.setProperty('--hx', String(tx));
          }
          if (on !== m.heroA) {
            m.heroA = on;
            hero.style.opacity = String(on);
            hero.style.visibility = on ? 'visible' : 'hidden';
            if (trust) {
              trust.style.opacity = String(on);
              trust.style.visibility = on ? 'visible' : 'hidden';
            }
          }
          if (on && trust && g.trustX1 > 0) {
            const gone = g.trustX1 + tx <= 0;
            if (gone !== m.trustGone) {
              m.trustGone = gone;
              trust.style.visibility = gone ? 'hidden' : 'visible';
            }
          }
          const e = g.heroX1 > 0 ? r2(clamp01((g.heroX1 + tx) / g.heroX1)) : 0;
          if (e !== m.edge) {
            m.edge = e;
            stage.style.setProperty('--cineEdge', String(e));
          }
        } else {
          const a = heroNarrowAlpha(t);
          if (a !== m.heroA) {
            m.heroA = a;
            hero.style.opacity = String(a);
            hero.style.visibility = a ? 'visible' : 'hidden';
            stage.style.setProperty('--cineEdge', String(a));
          }
          // Flies at the camera as it goes. See heroNarrowScale.
          const sc = heroNarrowScale(t);
          if (sc !== m.heroSc) {
            m.heroSc = sc;
            hero.style.setProperty('--hsc', String(sc));
          }
        }
      }

      /*
        THE KEEP-SCROLLING CUE — the small arrow that carries the swipe on after
        the opening copy has gone. The fault report is the company's own owner:
        "the video just stopped when he didn't know that he needs continuous
        swiping".

        WRITTEN HERE, immediately after the block that takes the opening copy
        off the screen, because it is that block's handover: `keepCueAlpha`
        starts exactly where `.heroCopy` finishes leaving, which is why the
        curve has to know the band. `g.band` is the LAYOUT band, so `wide` is
        1121 and up and the else-branch — phone and tablet together — is the
        one the narrow curve belongs to.

        `visibility` as well as `opacity`, for the same reason the hero copy
        carries both: a fully transparent element is still a composited layer.
      */
      const keep = refs.keepCue.current;
      if (keep) {
        const a = keepCueAlpha(t, HERO_INK * dur, g.band.wide);
        if (a !== m.keepCue) {
          m.keepCue = a;
          keep.style.opacity = String(a);
          keep.style.visibility = a ? 'visible' : 'hidden';
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

      /*
        THE LOCK, LAST — after everything above has been written at p = 1.

        It waits for the seek to actually land. `video.currentTime = t` is a
        REQUEST: it returns immediately with the decoder still working, and
        that asynchrony has already cost this build one bug (the reveal edge
        running ahead of the slab, §5.13 of the rebuild log). Locking in the
        same frame as a jump-seek would hand the visitor the hero with the
        previous frame still on screen for as long as the decode takes — a
        flash of the quarry behind "Surfaces worth building around".

        `!v.seeking` is the decoder saying it has arrived. The deadline is the
        backstop: a decoder that never reports, or a mode that never seeks at
        all, must not strand the visitor on a film that will not end. 400ms is
        far longer than a seek from memory needs and short enough that nobody
        reads it as a hang.
      */
      if (complete) {
        if (!completeAt.current) completeAt.current = now;
        const landed = !v || !seeks(mode) || !v.seeking;
        if (landed || now - completeAt.current > 400) lockFilm();
      }
    },
    [refs, mode, paintReveal, lockFilm],
  );

  /* ── skip ─────────────────────────────────────────────────────────────── */

  const skipToEnd = useCallback(() => {
    const g = geom.current;
    if (!g) return;
    /*
      The one place a scroll is written, and it is a direct response to a tap,
      never something the engine decides to do while the visitor is scrolling.

      ⛔ `instant`, NOT `auto`. `auto` defers to the CSS, and `html` carries
      `scroll-behavior: smooth`, so this was an ANIMATED scroll — still in
      flight when the film reached its end. The lock then collapsed the runway
      under it, the browser clamped the scroll to the shrunken document, and
      the animation carried on to its original target: measured, the visitor
      ended at scrollY 4644 with the hero 4644px above the viewport, on both
      the Skip button and the brand logo. It never showed in a probe because
      every probe disables smooth scrolling before it measures.
    */
    window.scrollTo({ top: g.top + g.runPx + 2, behavior: 'instant' });
  }, []);

  /* ── mount ────────────────────────────────────────────────────────────── */

  useEffect(() => {
    const stage = refs.stage.current;
    const video = refs.video.current;
    if (!stage || !video) return;

    /*
      ⛔ NO FILM WILL RUN ON THIS PAGE LOAD.

      Every give-up path ends here, and every one of them used to end at a bare
      `data-film = 'off'` that did nothing about the film's own furniture. The
      client, 28 Aug: "it shows the surfaces worth building around as an overlay
      above the your worktop starts here ... it's showing both text at the same
      time ... it should not show on the first frame ever."

      Three things have to happen together, and only one of them was:
        - `data-hero` takes the plate, the story, the opening copy, the trust
          chips and the Skip button off the stage. `data-film='off'` cannot do
          that job, because `off` is ALSO the server-rendered value on a normal
          cold load, where the plate IS the intended first paint.
        - the deadline in index.tsx is stood down, so it cannot ink the page
          hero a second time on top of what is already there.
        - the page hero is inked HERE instead, immediately, because with no film
          coming there is nothing left to wait for.
    */
    const landed = () => {
      stage.dataset.film = 'off';
      stage.dataset.hero = 'landed';
      const ph = refs.pageHero.current;
      if (!ph) return;
      ph.removeAttribute('data-film-pending');
      ph.setAttribute('data-ink', '');
      ph.classList.add('loaded');
    };

    // `?film=off` and friends. Returning without a word left the stage at its
    // SSR `off` with nothing hidden, which is the stacked-hero fault above.
    if (!mounts(mode)) {
      landed();
      return;
    }

    // Reduced motion, or no MP4 decoder: never start. The still is the hero.
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const canPlay = !!video.canPlayType?.('video/mp4; codecs="avc1.42E01E"');
    if (reduce || !canPlay) {
      landed();
      return;
    }

    // The pin, asserted. A violation ships the still hero rather than a film
    // that might shake on a phone nobody here can test on.
    const safe = pinIsSafe(stage);
    if (!safe.ok) {
      landed();
      // eslint-disable-next-line no-console
      console.error('[hero film] refusing to mount — ' + safe.why);
      return;
    }

    /*
      ⛔ `data-film` STAYS `off` UNTIL THE FILM IS ACTUALLY ARMED.

      It used to flip to `on` here, before the fetch. In `on` the stage is
      `position: fixed`, opaque, and covering the viewport — and the runway is
      still 0, because `--runway` is only ever written by `measure()`, which
      runs from `arm()`, which does not run until the whole cut has been fetched
      as a blob. 6.8MB on the phone, 17.8MB on the wide. So for the entire
      download the visitor scrolled and NOTHING MOVED.

      Raising the runway here instead does not fix it: the loop is not running
      either, so a taller runway still paints nothing, and the film then arms at
      whatever point they have scrolled to and starts mid-film.

      In `off` the stage is `position: absolute; top: 0` — a real, scrollable
      page. The plate is still the first paint (`.plate` is opaque in every
      state) and its bytes are already paid by the preload links in index.tsx,
      so nothing about the opening picture changes and arming is not delayed.

      ⛔ AND THE PAGE HERO IS MARKED PENDING. The deadline in index.tsx exists
      to give a visitor words to read if no film ever comes. While one IS
      coming, the film's own opening line is already on screen, so letting the
      deadline fire painted the page's h1 on top of it — the client's stacked
      hero. `data-film-pending` stands the deadline down; `arm()` clears it, and
      so does `landed()`.
    */
    refs.pageHero.current?.setAttribute('data-film-pending', '');

    let cancelled = false;
    let objectUrl = '';

    const band = bandFor(window.innerWidth);
    const src = filmBand(band).phone ? sources.phone : sources.wide;

    /*
      Track the presented frame. `mediaTime` is the media timestamp of the frame
      that has just been composited, which is exactly what the reveal needs.

      Nothing is written to the DOM from here — it only records a number the rAF
      loop reads. That distinction matters: the old build wrote the reveal's
      clip-path from inside this callback, so the edge stepped at whatever rate
      frames arrived. Here the writing stays on the display clock and only the
      VALUE comes from the decoder.
    */
    let vfc = 0;
    const onFrame = (_now: number, meta: { mediaTime: number }) => {
      shown.current = meta.mediaTime;
      const rv = video as HTMLVideoElement & {
        requestVideoFrameCallback?: (cb: typeof onFrame) => number;
      };
      if (!cancelled && rv.requestVideoFrameCallback) {
        vfc = rv.requestVideoFrameCallback(onFrame);
      }
    };

    const arm = () => {
      if (cancelled) return;
      /*
        ⛔ THE FILM ONLY EVER STARTS FROM THE TOP OF THE PAGE.

        The stage now stays `off` while the blob is in flight, which means the
        visitor has a real, scrollable page in front of them the whole time. If
        they have used it, arming would raise the runway by five to eight
        viewports ABOVE where they are standing and pin an opaque fixed stage
        over the viewport in the same frame: they would be thrown from wherever
        they were reading back to frame 0 of the film.

        The film is never abandoned for being SLOW — it waits, which is the
        client's own decision — only for the visitor having got on with it. A
        refresh is what plays it, which is his rule for the end of the film
        applied to the start.

        4px of slack rather than 0: the old build's own idiom, index.html:3457.
      */
      if (window.scrollY > 4) {
        landed();
        video.removeAttribute('src');
        video.load();
        if (objectUrl) {
          URL.revokeObjectURL(objectUrl);
          objectUrl = '';
        }
        return;
      }
      armed.current = true;
      setLive(true);
      const rv = video as HTMLVideoElement & {
        requestVideoFrameCallback?: (cb: typeof onFrame) => number;
      };
      if (rv.requestVideoFrameCallback) {
        vfc = rv.requestVideoFrameCallback(onFrame);
      } else {
        // No rVFC: fall back to the requested time. The reveal can lead the
        // picture on a slow decode, which is the fault this replaces — but a
        // reveal that leads is better than one that never moves.
        shown.current = 0;
      }
      document.documentElement.classList.add('film-running');
      /*
        THE ONE PLACE THE FILM TAKES THE PAGE OVER.

        Until this line the stage is `off` — absolute at the document top,
        scrolling away like any other hero. This is what makes it
        `position: fixed`, and `measure()` below is what raises the runway
        underneath it. BOTH HAPPEN IN THE SAME SYNCHRONOUS BLOCK, in this
        order, so there is never a frame with a fixed stage over a runway of
        zero. Do not separate them.

        (A comment here used to say the stage was `visibility: hidden` until
        this ran. There is no `visibility` declaration in film.module.css and
        there never was. Nothing covers the plate before this point.)

        `?film=frozen` never starts the loop and this is still what shows it.
      */
      stage.dataset.film = 'on';
      /*
        THE PAGE HERO GOES BACK UNDER THE FILM'S CONTROL.

        `data-film-pending` stands the deadline down before it fires. These two
        removals undo it if it somehow fired anyway — a slow first paint, a
        backgrounded tab, a resumed bfcache page. Without them the page's h1 and
        CTAs stay painted on top of the film's opening line for the whole 44
        seconds, and the loop cannot undo it: its handoff only writes on a
        CHANGE and `memo.ink` is already false. `memo.ink` stays false here, so
        the real handoff at 93% still re-asserts both.
      */
      const ph = refs.pageHero.current;
      if (ph) {
        ph.setAttribute('data-film-armed', '');
        ph.removeAttribute('data-film-pending');
        ph.removeAttribute('data-ink');
        ph.classList.remove('loaded');
      }
      // `?film=notext` hides the story from here, not by rendering different
      // markup — see the note at the call site in index.tsx.
      if (!showsText(mode)) stage.dataset.text = 'off';
      measure();

      /*
        ⛔ ARRIVING ON `/#hero` NEVER PLAYS THE FILM.

        The client, 28 Aug, having said it more than once: "if someone clicks on
        the TopCat logo, it only takes them back to the Surfaces Worth Building
        Around. No matter what inner page they're on or whatever they're doing,
        it never goes back to the start of the video... The only way they ever
        get back to the start of the video is if they refresh their browser."

        `BRAND_HOME` is `/#hero` on all 178 pages. From the landing page itself
        the capture-phase handler below catches the click, but from an INNER
        page the logo is a real navigation: the home page loads cold, the film
        mounts, and it played from the quarry every time. The comment on that
        handler claimed this case was "handled at arm time below" and no such
        code was ever written — the same dropped-block fault this port keeps
        producing.

        So the hash is honoured here, once, at the moment the scrub arms:
        `skipToEnd` puts the scroll past the end of the runway and the first
        tick paints the whole ending and locks. The visitor lands on the hero
        having never seen the film, which is exactly what he asked for.

        A bare `/` is untouched, so a refresh still plays it from the top.
      */
      if (typeof location !== 'undefined' && location.hash === '#hero') {
        /*
          ⛔ THE HASH IS TAKEN OFF THE URL BEFORE THE JUMP.

          Chrome's fragment scroll is deferred and re-attempted as the page
          finishes loading, so leaving `#hero` in place put it in a fight with
          the lock's own correction: measured, the visitor ended at scrollY
          4644 with the hero 4644px above the viewport. Dropping the hash the
          moment we take responsibility for it settles that — replaceState, so
          the back button still returns to the page they came from.
        */
        history.replaceState(null, '', location.pathname + location.search);
        skipToEnd();
      }

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
          /*
            The film could not be fetched.

            ⛔ `data-film = 'off'` ALONE IS NOT ENOUGH, and the comment that
            used to sit here asserted the opposite twice. The plate stays at
            opacity 1 ABOVE the still, so this stranded the visitor on the
            quarry with the film's opening line and SKIP INTRO over it — not on
            the still hero. And the runway does not ship at one viewport; it
            ships at zero.
          */
          if (!cancelled) landed();
        });
    }

    /*
      THE BRAND LOGO JUMPS STRAIGHT TO THE HERO.

      The client, 28 Aug: "when the user clicks on the Topcat Worktops logo
      icon, it shouldn't play through the video and stop at the surfaces worth
      building around section. It should immediately just go straight there as
      if that is the only hero section that the site has."

      `BRAND_HOME` is `/#hero`, so the native anchor already lands on the right
      element — but landing there means arriving at the film's last frame with
      the whole runway still above you, which then has to complete and lock.
      Locking first collapses the runway out of the way and puts the hero at the
      top in one step, which is what "as if that is the only hero section" means.

      Capture phase, so it runs before the browser's own hash handling, and
      `preventDefault` so the two do not both try to move the page.

      A visitor arriving directly on `/#hero` is the same case and is handled at
      arm time below.
    */
    const onLogo = (e: MouseEvent) => {
      if (locked.current || e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.('a[href]');
      if (!a) return;
      const href = a.getAttribute('href') || '';
      if (!/(^|\/)#hero$/.test(href)) return;
      e.preventDefault();
      /*
        ⛔ `skipToEnd()`, NOT `lockFilm()`.
        This used to lock the film outright, on the reasoning that locking is
        instant while scrolling to the end would scrub. Locking cold is what
        produced the fault the client reported: the stage became the hero with
        the video still on frame 0, so clicking the logo handed him the quarry,
        the opening story line and SCROLL TO BEGIN as his hero section.

        `skipToEnd` puts the scroll past the end of the runway and the very
        next tick paints the whole ending at p = 1 and then locks. There is no
        scrub to see: it is one jump, one paint, in a single frame. Same path
        as the Skip button, which had the same fault for the same reason.
      */
      skipToEnd();
    };
    document.addEventListener('click', onLogo, true);

    let rz = 0;
    let lw = window.innerWidth;
    let lh = window.innerHeight;
    const remeasure = () => {
      window.clearTimeout(rz);
      rz = window.setTimeout(() => {
        if (armed.current) measure();
      }, 150);
    };
    /*
      ⛔ A PHONE'S ADDRESS BAR IS NOT A RESIZE. THE OLD BUILD KNEW THIS AND THE
      PORT DROPPED THE GUARD.

      index.html:3450-3454, verbatim, in a capture-phase listener installed
      before anything else:

          if(w===lw && w<=1120 && Math.abs(h-lh)<=140){ e.stopImmediatePropagation(); return; }

      Same width, a narrow screen, and a height change small enough to be
      browser chrome: that is the bar moving, not the window changing, and
      re-measuring on it re-maps the scroll under the visitor. Even with the
      film length now read off the laid-out runway, re-measuring mid-scroll is
      work with nothing to gain.

      `orientationchange` is deliberately NOT filtered — a real rotation is
      exactly the case that must always re-measure, and it can look like a
      height-only change on a square-ish viewport.
    */
    const onResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      if (w === lw && w <= 1120 && Math.abs(h - lh) <= 140) return;
      lw = w;
      lh = h;
      remeasure();
    };
    const onOrient = () => {
      lw = window.innerWidth;
      lh = window.innerHeight;
      remeasure();
    };
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onOrient);

    return () => {
      cancelled = true;
      window.clearTimeout(rz);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onOrient);
      document.removeEventListener('click', onLogo, true);
      cancelAnimationFrame(raf.current);
      if (vfc) {
        const rv = video as HTMLVideoElement & { cancelVideoFrameCallback?: (h: number) => void };
        rv.cancelVideoFrameCallback?.(vfc);
      }
      document.documentElement.classList.remove('film-running');
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [mode, refs, sources, measure, tick, lockFilm, skipToEnd]);

  return { mode, live, skipToEnd, showsText: showsText(mode) };
}

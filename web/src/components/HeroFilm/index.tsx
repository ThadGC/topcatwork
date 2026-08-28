'use client';

/**
 * HERO FILM.
 *
 * A 44.25-second film scrubbed by the page scroll, with two story beats keyed
 * to specific shots, one of which is uncovered by an edge tracked frame by
 * frame against the footage.
 *
 * ── the shape, and why it is this shape ─────────────────────────────────────
 *
 *   <body>
 *     <header class="bar">          fixed, direct child of body   [steady]
 *     <nav class="mobile-nav">      fixed, direct child of body   [steady]
 *     <div class="stage">           fixed, direct child of body   <- THE FILM
 *     <main>
 *       <div class="runway">        plain, tall, transparent
 *         <div id="hero">           the page's own hero, in flow, at the end
 *       <div class="overFilm">      opaque, z-index 1 — scrolls over the film
 *
 * The film is a FIXED BACKDROP and the page scrolls over the top of it. It is
 * a sibling of the header and the WhatsApp button — the two things on this page
 * the client reports as steady while everything inside the old sticky hero
 * shook. It is deliberately NOT inside <main>, which carries `overflow-x: clip`
 * and moves with the scroll; a clipping ancestor that scrolls is what costs a
 * fixed element its viewport anchoring, and that is the most likely reason the
 * old Skip button shook even though it was itself `position: fixed`.
 *
 * There is no sticky element, no runway collapse, no `window.scrollTo` at the
 * end, and no JavaScript anywhere in the pin.
 *
 * ── what stays in normal flow, on purpose ───────────────────────────────────
 * The PAGE's hero copy — the h1, the two CTAs and the trust chips — is not in
 * the stage. It sits in flow at the end of the runway and rises over the film's
 * final frame, which is what the old build's 93% handoff did with two seconds
 * of JavaScript. Keeping it in flow means the h1 stays inside <main>, `#hero`
 * is still a real scroll target for the brand-logo link, and `.hero-ctas` still
 * scrolls out of view so <StickyContactBar> reveals on time. The FILM's own
 * opening line — "Your worktop starts here." — is a different block and does
 * live in the stage, because it is part of the film.
 *
 * ── the no-JavaScript state is the SSR state ────────────────────────────────
 * Server-rendered, this is a one-viewport runway with the still hero behind it
 * and the page's hero copy on top: exactly the page you get with reduced
 * motion, with no MP4 decoder, or with the film fetch failing. The engine
 * raises the runway only once it has the film in memory and has satisfied
 * itself the pin is safe.
 */

import { useEffect, useRef, type ReactNode } from 'react';
import { TcDefs } from '@/components/sections/TcDefs';
import css from './film.module.css';
import { HERO_COPY, STORY } from './lib/timeline';
import { useFilm, type FilmRefs, type FilmSources } from './useFilm';

const DEFAULT_SOURCES: FilmSources = {
  wide: '/assets/video/film-wide.mp4?v=1',
  phone: '/assets/video/film-phone.mp4?v=1',
  plateWide: '/assets/video/plate-wide.webp?v=1',
  platePhone: '/assets/video/plate-phone.webp?v=1',
};

const STILL = {
  src: '/assets/site/hero-night-2752.webp',
  srcSet:
    '/assets/site/hero-night-1400.webp 1400w, /assets/site/hero-night-2000.webp 2000w, /assets/site/hero-night-2752.webp 2752w',
  sizes: '(max-width:720px) 1000px, 1739px',
};

export interface HeroFilmProps {
  /**
   * The page's own hero copy — the h1, the CTAs and the trust chips. Rendered
   * in flow at the END of the runway, so it rises over the film's final frame.
   */
  hero?: ReactNode;
  /** The rest of the page. Goes inside the opaque wrapper that scrolls over
   *  the film. */
  children?: ReactNode;
  sources?: Partial<FilmSources>;
  skipLabel?: string;
}

function CueArrow() {
  return (
    <svg viewBox="0 0 32 96" focusable="false" aria-hidden="true">
      <path d="M16 1.25V94.75M1.25 80L16 94.75 30.75 80" />
    </svg>
  );
}

/** One story beat's copy. The reveal beat renders it twice, once per pane. */
function BeatCopy({ i }: { i: number }) {
  const b = STORY[i];
  return (
    <>
      {b.text}
      {b.emphasis ? <em>{b.emphasis}</em> : null}
      {b.sub ? <span className={css.sub}>{b.sub}</span> : null}
    </>
  );
}

/**
 * ⚠️ THIS COMPONENT RENDERS THE PAGE'S `<main>`, which is unusual and is not a
 * liberty — it is the only way to get all three of these at once:
 *
 *   - the stage OUTSIDE <main>, because <main> carries `overflow-x: clip` and
 *     moves with the scroll, and a clipping ancestor that scrolls is what costs
 *     a fixed element its viewport anchoring;
 *   - the h1 INSIDE <main>, where it belongs;
 *   - both server-rendered, with no portal, so the still hero is still the LCP
 *     image and the no-JS page is correct.
 *
 * A portal would satisfy the first two and lose the third.
 */
export function HeroFilm({
  hero,
  children,
  sources: srcProp,
  skipLabel = 'Skip intro',
}: HeroFilmProps) {
  const runway = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const plate = useRef<HTMLDivElement>(null);
  const shade = useRef<HTMLDivElement>(null);
  const reveal = useRef<HTMLParagraphElement>(null);
  const kit = useRef<HTMLParagraphElement>(null);
  const heroCopy = useRef<HTMLDivElement>(null);
  const skip = useRef<HTMLButtonElement>(null);
  const heroOut = useRef<HTMLElement>(null);

  // One stable object — a new identity per render would tear the film down and
  // rebuild it on every parent render.
  const refs = useRef<FilmRefs>({
    runway,
    stage,
    video,
    plate,
    shade,
    reveal,
    kit,
    heroCopy,
    pageHero: heroOut,
    skip,
  });
  const sources = useRef<FilmSources>({ ...DEFAULT_SOURCES, ...srcProp });

  const { skipToEnd } = useFilm(refs.current, sources.current);

  /*
    With no JavaScript — or with the film off, or its fetch failed — nothing
    ever writes `data-ink`, and the hero would sit at opacity 0 over a still
    frame. So it is released here on mount as the baseline, and the engine
    takes over the timing only once it has actually armed. The film's own
    `ink()` at 93% then re-asserts it; adding a class twice is free.
  */
  useEffect(() => {
    const el = heroOut.current;
    if (el && !el.hasAttribute('data-ink')) {
      const id = window.setTimeout(() => {
        if (!el.hasAttribute('data-film-armed')) {
          el.setAttribute('data-ink', '');
          el.classList.add('loaded');
        }
      }, 1200);
      return () => window.clearTimeout(id);
    }
  }, []);

  return (
    <>
      {/*
        THE STAGE. A direct child of <body> once React has rendered the page,
        because <SiteChrome> composes with fragments and <main> is its sibling.
        Nothing may wrap this in a positioned, clipping or transformed box —
        useFilm.ts walks up from here on mount and refuses to run the film if
        anything does.
      */}
      {/* The plate is the first picture anyone sees, so it must not wait for
          a script to ask for it. `media` does the band pick and is evaluated by
          the preload scanner, ahead of script execution; the reduced-motion
          clause stops a visitor who will never see the film paying for it.
          Both URLs are the ones film.module.css sets on `.plate`, so this is
          one request, not two. */}
      <link
        rel="preload"
        as="image"
        href={sources.current.platePhone}
        media="(max-width:720px) and (prefers-reduced-motion: no-preference)"
      />
      <link
        rel="preload"
        as="image"
        href={sources.current.plateWide}
        media="(min-width:721px) and (prefers-reduced-motion: no-preference)"
      />

      {/*
        ⛔ THE STAGE IS NOT `aria-hidden`. It was, while it held only the film —
        and then the page's own hero moved into it, which put the site's <h1>
        inside an aria-hidden subtree and took the main heading of the whole
        site out of the accessibility tree. Caught by tests/smoke.test.tsx,
        which could no longer find a heading at all.

        Only the PICTURE is hidden, on `.frame` below. The story beats and the
        film's opening line are real text and are read, exactly as they were in
        the build before this one.
      */}
      <div className={css.stage} ref={stage} data-film="off">
        <div className={css.frame} aria-hidden="true">
          {/* The end-state still. Also the no-JS and reduced-motion hero, which
              is why it carries a real src rather than a data attribute. */}
          <img
            className={css.still}
            src={STILL.src}
            srcSet={STILL.srcSet}
            sizes={STILL.sizes}
            width={2752}
            height={1536}
            alt=""
            draggable={false}
            fetchPriority="high"
            decoding="async"
          />

          {/* No `src` in the markup. The engine picks the band's cut, fetches
              it in full, and only then hands it over — see the residency note
              in useFilm.ts. `muted` and `playsInline` are what keep iOS from
              taking the film fullscreen. */}
          <video
            className={css.vid}
            ref={video}
            playsInline
            muted
            preload="none"
            width={1920}
            height={1080}
            aria-hidden="true"
            tabIndex={-1}
            disablePictureInPicture
            disableRemotePlayback
          />

          {/* The client's own high-resolution render of frame 0, over the film
              until the film moves. */}
          <div className={css.plate} ref={plate} />
          <div className={css.shade} ref={shade} />
          <div className={css.navGrade} />
        </div>

        {/*
          ALWAYS RENDERED, never conditional on the film mode. `?film=notext`
          hides this from the ENGINE side, by an attribute the stage carries and
          CSS acts on — because the mode is read from the URL at mount, the
          server cannot know it, and any markup that depends on it is a
          guaranteed hydration mismatch. Caught by the mode sweep itself.
        */}
        <div className={css.story}>
            {/* ⚠️ BEAT 1, "It starts as a mountain.", IS NOT RENDERED. It was
                `display:none` in every band of the previous build and of the
                original before it. It is in lib/timeline.ts as data. */}
            <p className={`${css.line} ${css.rvLine}`} ref={reveal}>
              {/* THE REVEAL. Two panes over two copies of the same words: each
                  pane clips with its own overflow and carries the edge on a
                  transform, and the inner span carries the exact inverse, so
                  the clip edge moves and the glyphs do not. The strip pane is
                  `display:none` above 720px, where the footage has no second
                  edge to track. */}
              <span className={css.pane} data-rv="wedge">
                <span className={css.paneInner}>
                  <BeatCopy i={1} />
                </span>
              </span>
              <span
                className={`${css.pane} ${css.strip}`}
                data-rv="strip"
                aria-hidden="true"
              >
                <span className={css.paneInner}>
                  <BeatCopy i={1} />
                </span>
              </span>
            </p>

          <p className={`${css.line} ${css.kitLine}`} ref={kit}>
            <BeatCopy i={2} />
          </p>
        </div>

        {/* The FILM's own opening line. Not the page's h1 — that is in flow
            below, at the end of the runway. */}
        <div className={css.heroCopy} ref={heroCopy}>
          <p className={css.hl}>
            {HERO_COPY.headline}
            <em>{HERO_COPY.emphasis}</em>
          </p>
          <p className={css.heroSub}>{HERO_COPY.sub}</p>
          <div className={css.heroCue} aria-hidden="true">
            <span>{HERO_COPY.cue}</span>
            <CueArrow />
          </div>
        </div>

        <button type="button" className={css.skip} ref={skip} onClick={skipToEnd}>
          {skipLabel}
        </button>

      </div>

      <main>
        {/*
          THE RUNWAY. A plain box whose only job is to be tall. It ships at one
          viewport and the engine raises it once, on mount, and only if the film
          is actually going to run — so with no JavaScript, no MP4 decoder or
          reduced motion this is a normal one-screen hero and the page behaves
          like every other page on the site.

          Transparent, so the fixed stage behind it is what you see.
        */}
        {/*
          THE RUNWAY. A plain box whose only job is to be tall. Nothing is ever
          written to it except its height, twice: once on mount when the film
          arms, and once at the lock. It ships at zero, so with no JavaScript
          the hero below is simply the top of the page.
        */}
        <div className={css.runway} id="filmRunway" ref={runway} />

        {/*
          THE HERO — a REAL SECTION IN NORMAL FLOW, and the end of the film.

          The client, 28 Aug: "when I see the surfaces worth building around,
          that should mark the end of the video … then this becomes a new hero
          section, and then it scrolls down from here like a regular website."

          It sits immediately after the runway, so it is exactly filling the
          viewport at the moment the film reaches its last frame. Until then it
          rises into view BEHIND the stage, which is opaque and fixed and
          covers it completely — so it is never seen sliding up. The instant the
          film ends the stage is released and this is already in place, and the
          copy settles onto it.

          Then `lockFilm()` collapses the runway to nothing and subtracts the
          same distance from the scroll in the same frame. Nothing moves, and
          the film is gone: there is no longer any runway above this to scroll
          back through. Reaching the end is one-way, and a refresh is what
          replays it — which is the behaviour the client asked for.
        */}
        <section className={css.hero} id="hero" ref={heroOut}>
          <img
            className={css.heroStill}
            src={STILL.src}
            srcSet={STILL.srcSet}
            sizes={STILL.sizes}
            width={2752}
            height={1536}
            alt=""
            draggable={false}
            decoding="async"
            aria-hidden="true"
          />
          <div className={css.heroShade} aria-hidden="true" />
          {/*
            The two gold gradients, first child of the hero as the source has
            them. `.wbtn svg` fills with `url(#tcGoldSolid)` and the "Free home
            visit" chip strokes with `url(#tcGold)`; a `url(#id)` paint resolves
            against the document, so with no <defs> the icon disappears.
          */}
          <TcDefs />
          <div className={css.heroInner}>{hero}</div>
        </section>

        {/* Opaque, and above the stage in paint order, so the page slides up
            over the film rather than the film showing through it. */}
        <div className={css.overFilm}>{children}</div>
      </main>
    </>
  );
}

export default HeroFilm;

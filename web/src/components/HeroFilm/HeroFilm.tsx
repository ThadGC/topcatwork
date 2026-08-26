'use client';

/**
 * HERO FILM.
 *
 * A 44-second film scrubbed by the page scroll, with three story beats keyed
 * to specific shots, a reveal tracked frame-by-frame against an edge in the
 * footage, and a hand-off at the end that collapses the runway and releases the
 * hero copy.
 *
 * ── the shape ───────────────────────────────────────────────────────────────
 *   <div .cine>            tall runway; scrolling it is what scrubs the film
 *     <section .hero>      sticky, one viewport tall
 *       <div .bg>          the film, the still, the plate and three scrims
 *       <div .story>       the three beats + the hero block + the trust chips
 *       .cue / .skip       chrome
 *       <div .inner>       children — the page's own hero copy, held back
 *                          until the film inks at 93%
 *
 * ── what this file does and does not do ─────────────────────────────────────
 * It renders markup and holds refs. It does not compute anything: the engine
 * (./useHeroFilm.ts) writes every animated property imperatively through those
 * refs at 60Hz, and this component re-renders only when the band changes or
 * the film is switched off entirely. A `setState` in the loop would defeat the
 * entire exercise.
 *
 * ── static export ───────────────────────────────────────────────────────────
 * The SSR output is the still hero: `<img>` visible, `<video preload="none">`
 * with no `src`. That is simultaneously the no-JS fallback, the reduced-motion
 * fallback and the pre-hydration state. `<HeroFilmBoot/>` flips the CSS during
 * parse and the engine attaches the source on mount.
 */

import { useMemo, useRef, type ReactNode } from 'react';
import { TcDefs } from '@/components/sections/TcDefs';
import styles from './HeroFilm.module.css';
import { DEFAULT_PLATES, DEFAULT_SOURCES } from './lib/constants';
import { HERO_COPY, STORY } from './lib/timeline';
import {
  useHeroFilm,
  type HeroFilmPlates,
  type HeroFilmRefs,
  type HeroFilmSources,
} from './useHeroFilm';

export interface HeroFilmProps {
  /** The page's own hero copy — title, sub, CTAs, chips. Held back until 93%. */
  children?: ReactNode;
  /**
   * The trust chips that ride the wide-band wipe alongside the hero block.
   * Supplied by the caller because they are design-system components, not film.
   */
  trust?: ReactNode;
  /** Film encodes, per band. Defaults to the shipping assets. */
  sources?: Partial<HeroFilmSources>;
  /** Frame-0 stills, per band. Defaults to the shipping assets. */
  plates?: Partial<HeroFilmPlates>;
  /** The still hero, shown whenever the film is off. */
  still?: {
    src: string;
    srcSet?: string;
    sizes?: string;
    width: number;
    height: number;
    alt?: string;
  };
  /** Text on the skip control. */
  skipLabel?: string;
}

const DEFAULT_STILL = {
  src: '/assets/site/hero-night-2752.webp',
  srcSet:
    '/assets/site/hero-night-1400.webp 1400w, /assets/site/hero-night-2000.webp 2000w, /assets/site/hero-night-2752.webp 2752w',
  sizes: '(max-width:720px) 1000px, 1739px',
  width: 2752,
  height: 1536,
  alt: '',
};

/** The down-arrow used by the hero block's "Scroll to begin" affordance. */
function CueArrow() {
  return (
    <i>
      <svg viewBox="0 0 32 96" focusable="false" aria-hidden="true">
        <path d="M16 1.25V94.75M1.25 80L16 94.75 30.75 80" />
      </svg>
      {/* Masked sheen: <b> carries the arrow-shaped mask, <span> is the band
          of light that travels down inside it. */}
      <b>
        <span />
      </b>
    </i>
  );
}

export function HeroFilm({
  children,
  trust,
  sources: sourcesProp,
  plates: platesProp,
  still = DEFAULT_STILL,
  skipLabel = 'Skip intro',
}: HeroFilmProps) {
  const cine = useRef<HTMLDivElement>(null);
  const hero = useRef<HTMLElement>(null);
  const bg = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const plate = useRef<HTMLDivElement>(null);
  const lines = useRef<Array<HTMLParagraphElement | null>>([]);
  const heroCopy = useRef<HTMLDivElement>(null);
  const trustRef = useRef<HTMLDivElement>(null);
  const cue = useRef<HTMLDivElement>(null);
  const skip = useRef<HTMLButtonElement>(null);

  // One stable object. The engine holds it in effect dependency arrays; a new
  // identity per render would tear the film down and rebuild it.
  const refs = useRef<HeroFilmRefs>({
    cine,
    hero,
    bg,
    video,
    plate,
    lines,
    heroCopy,
    trust: trustRef,
    cue,
    skip,
  });

  const sources = useMemo<HeroFilmSources>(
    () => ({ ...DEFAULT_SOURCES, ...sourcesProp }),
    [sourcesProp],
  );
  const plates = useMemo<HeroFilmPlates>(
    () => ({ ...DEFAULT_PLATES, ...platesProp }),
    [platesProp],
  );

  const { skipToEnd } = useHeroFilm({
    refs: refs.current,
    sources,
    plates,
    loadedClass: styles.loaded,
    cueGoneClass: styles.gone,
  });

  return (
    <div className={styles.cine} ref={cine} id="cine">
      <section className={styles.hero} ref={hero} id="hero">
        {/*
          `svg.tc-defs` — the two gold gradients, and the source really does
          keep them here, as the first child of `#hero` (index.html:4). They
          are NOT decoration that could live anywhere: `.wbtn svg` fills with
          `url(#tcGoldSolid)` and the hero's "Free home visit" chip strokes
          with `url(#tcGold)`, and a `url(#id)` paint resolves against the
          document — with no `<defs>` in the DOM the stroke resolves to
          nothing and the icon disappears. The class is unhashed on purpose:
          the rule that gives it zero size is global (globals.css §11), like
          it is on the 172 content-styled pages.
        */}
        <TcDefs />

        <div className={styles.bg} ref={bg} aria-hidden="true">
          {/* Still hero. Never removed: it is what is on screen whenever the
              film is off, and `html.cine-on` fades it out when it is not. */}
          <img
            className={styles.bgImg}
            src={still.src}
            srcSet={still.srcSet}
            sizes={still.sizes}
            width={still.width}
            height={still.height}
            alt={still.alt ?? ''}
            draggable={false}
            fetchPriority="high"
            decoding="async"
          />

          {/*
            No `src` and no `poster` in the markup. The engine picks the band's
            encode on mount and assigns both, so a phone never starts fetching
            the 1920 cut and a reduced-motion visitor fetches nothing at all.
            `muted` + `playsInline` are what make forward playback legal
            without a gesture — the transport depends on being able to play().
          */}
          <video
            className={styles.vid}
            ref={video}
            playsInline
            muted
            preload="none"
            width={1920}
            height={1080}
            aria-hidden="true"
            tabIndex={-1}
            disablePictureInPicture
            // React has no prop for this one; it is a real HTML attribute.
            {...{ disableremoteplayback: 'true' }}
          />

          <div className={styles.plate} ref={plate} aria-hidden="true" />
          <div className={styles.shade} />
          <div className={styles.navgrade} aria-hidden="true" />
          <div className={styles.edge} aria-hidden="true" />
        </div>

        <div className={styles.story}>
          {STORY.map((beat, i) => {
            const copy = (
              <>
                {beat.text}
                {beat.emphasis ? <em>{beat.emphasis}</em> : null}
                {beat.sub ? <span className={styles.lineSub}>{beat.sub}</span> : null}
              </>
            );
            return (
              <p
                key={beat.id}
                ref={(el) => {
                  lines.current[i] = el;
                }}
                className={
                  beat.id === 'open'
                    ? styles.line + ' ' + styles.open
                    : beat.id === 'reveal'
                      ? styles.line + ' ' + styles.rvLine
                      : styles.line
                }
                // Read by CSS, not by JS: the port keeps the band-specific
                // placement in the stylesheet, where the breakpoints already are.
                data-vpos={beat.vpos}
                data-vpos-wide={beat.vposWide}
                data-vpos-narrow={beat.vposNarrow}
              >
                {beat.id === 'reveal' ? (
                  <>
                    {/*
                      THE REVEAL, COMPOSITED.

                      This beat is not faded in, it is uncovered by an edge
                      tracked against the film. That used to be a fresh
                      `clip-path` polygon written to this paragraph every
                      animation frame, which cannot be composited: the browser
                      re-rasterises the whole headline sixty times a second, and
                      on a phone at devicePixelRatio 3.75 that is the stutter.

                      So the clip is a box instead. Each PANE clips with its own
                      `overflow`, carries the edge on a transform, and the INNER
                      span carries the exact inverse — the clip edge moves, the
                      glyphs do not, and nothing is ever repainted. The engine
                      writes both transforms and both transform-origins;
                      lib/reveal.ts derives them from the same measured tables
                      the polygon used.

                      TWO panes, because the phone's reveal has a second,
                      horizontal edge and the region it uncovers is the UNION of
                      two half-planes — which is not convex, so no single
                      clipping box can hold it. The wedge pane takes everything
                      left of the slant; the strip pane takes what is above the
                      horizontal edge and right of the slant. They are disjoint,
                      they overlap by a hair so the shared edge has no seam, and
                      the strip is display:none above 720px, where there is no
                      second edge to carry.
                    */}
                    <span className={styles.rvPane} data-rv="wedge">
                      <span className={styles.rvInner} data-rv="wedge-in">
                        {copy}
                      </span>
                    </span>
                    <span
                      className={styles.rvPane + ' ' + styles.rvStrip}
                      data-rv="strip"
                      aria-hidden="true"
                    >
                      <span className={styles.rvInner} data-rv="strip-in">
                        {copy}
                      </span>
                    </span>
                  </>
                ) : (
                  copy
                )}
              </p>
            );
          })}

          <div className={styles.heroCopy} ref={heroCopy}>
            <p className={styles.hl}>
              {HERO_COPY.headline}
              <em>{HERO_COPY.emphasis}</em>
            </p>
            <p className={styles.heroSub}>{HERO_COPY.sub}</p>
            <div className={styles.heroCue} aria-hidden="true">
              <span>{HERO_COPY.cue}</span>
              <CueArrow />
            </div>
          </div>

          <div className={styles.trust} ref={trustRef} aria-hidden="true">
            {trust}
          </div>
        </div>

        <div className={styles.cue} ref={cue} aria-hidden="true">
          <span>Scroll</span>
          <i />
        </div>

        <button type="button" className={styles.skip} ref={skip} onClick={skipToEnd}>
          {skipLabel}
        </button>

        <div className={styles.inner}>{children}</div>
      </section>
    </div>
  );
}

export default HeroFilm;

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
import { FilmMediaBoot, HeroFilmBoot } from './HeroFilmBoot';
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

/** Minimal attribute-value escape for the hand-built <noscript> markup below. */
function attr(value: string | number): string {
  return String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

/**
 * The still hero as a raw HTML string, for the <noscript> twin.
 *
 * Built by hand rather than rendered as JSX because React must not hydrate
 * inside a <noscript> — see the note at the call site.
 *
 * THE INLINE `position:absolute`, which is not decoration. `.bgImg` is
 * `display:block; width:100%; height:100%` (HeroFilm.module.css:127) and `.bg`
 * around it is `position:absolute; inset:0; overflow:hidden` (:85). With
 * scripting disabled the twin is a SECOND block box of the parent's full
 * height in normal flow, so it lays out BELOW the deferred `<img>` — which is
 * empty, but still takes its 100%, and `.bg` clips the rest. The no-JS hero
 * would be a blank frame. Taking the twin out of flow onto the same box the
 * deferred element occupies is what puts the picture back; `object-fit` and
 * the `.bgImg` transform apply either way, so it is the identical rendering.
 */
export function noscriptStill(
  still: NonNullable<HeroFilmProps['still']>,
  className: string,
): string {
  const parts = [
    `class="${attr(className)}"`,
    `style="position:absolute;inset:0"`,
    `src="${attr(still.src)}"`,
    still.srcSet ? `srcset="${attr(still.srcSet)}"` : '',
    still.sizes ? `sizes="${attr(still.sizes)}"` : '',
    `width="${attr(still.width)}"`,
    `height="${attr(still.height)}"`,
    `alt="${attr(still.alt ?? '')}"`,
  ].filter(Boolean);
  return `<img ${parts.join(' ')}>`;
}

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
      {/*
        The parse-time gate. First child of `.cine` so `html.cine-on` — and
        with it the 800vh phone runway — is in force before this subtree is
        laid out, before the still <img> and the <video> are parsed, and before
        Chrome's lazy-loading pass measures how far below the fold the services
        strip is. See the header of ./HeroFilmBoot.tsx for what it was costing
        while it went unrendered.
      */}
      <HeroFilmBoot />

      {/*
        The frame-0 plate, preloaded per band.

        This is the first picture of the intro: `.plate` sits over the film at
        opacity 1 until the decoder paints a real frame, so it — not the still
        hero, which `cine-on` has already taken to opacity 0 — is what the
        visitor looks at while the film buffers. It was arriving at t=553ms on
        the phone, behind 1.86 MB of below-the-fold service imagery, because
        nothing asks for it until the engine writes it as a CSS background.

        `media` does the band pick, and the reduced-motion clause is what stops
        a visitor who will never see the film from fetching 41,906 bytes of it.
        Both are evaluated by the preload scanner, ahead of script execution,
        which is why this earns its place beside a boot script that could
        otherwise set it itself. The URL is the same one the <video poster> and
        the `.plate` background use, so all three are one request.
      */}
      <link
        rel="preload"
        as="image"
        href={plates.srcPhone}
        media="(max-width:720px) and (prefers-reduced-motion: no-preference)"
      />
      {/* One link for the tablet AND the wide band: both play the 1920 cut,
          so both want its plate. See lib/timeline.ts `filmBand`. */}
      <link
        rel="preload"
        as="image"
        href={plates.src}
        media="(min-width:721px) and (prefers-reduced-motion: no-preference)"
      />

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
          {/*
            Still hero. Never removed: it is what is on screen whenever the film
            is off, and `html.cine-on` takes it to opacity 0 when it is not.

            THE URL IS IN `data-src`, NOT `src`. `cine-on` is set during parse,
            so on every device that runs the film this element is at zero for
            the whole session — and it was still being fetched, 151,604 bytes of
            it, first on the wire at t=68ms and at `fetchpriority="high"`. See
            ./lib/deferredImg.ts for the three things that promote it back, and
            why CSS cannot solve this on its own.

            `sizes`, `width` and `height` stay real: none of them starts a fetch,
            and the last two are the aspect-ratio box that keeps the deferral
            from costing layout shift.
          */}
          <img
            className={styles.bgImg}
            data-src={still.src}
            data-srcset={still.srcSet}
            sizes={still.sizes}
            width={still.width}
            height={still.height}
            alt={still.alt ?? ''}
            draggable={false}
            fetchPriority="high"
            decoding="async"
          />

          {/*
            The no-JavaScript twin. Nothing above promotes the still without a
            script, so this is the only hero a no-JS visitor gets — and it is a
            plain <img src>, exactly what shipped before the deferral. It costs
            ~250 bytes of markup and is never fetched by a browser that runs JS.

            `dangerouslySetInnerHTML`, not JSX children, and that is not a
            style choice. With scripting ENABLED the browser parses everything
            inside <noscript> as raw TEXT, so the DOM React hydrates against has
            a text node here — while JSX children would have React expecting an
            <img> element, which is a hydration mismatch on every load. Handing
            it a string means React never looks inside.
          */}
          <noscript dangerouslySetInnerHTML={{ __html: noscriptStill(still, styles.bgImg) }} />

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
            /* Markup ships `none`; HeroFilmBoot rewrites it to `auto` at parse
               time (HeroFilmBoot.tsx:198) so the film starts loading before
               hydration. React saw server `auto` vs client `none` and reported
               a mismatch it "won't patch up" — suppressed here because the
               attribute is owned by the boot script. */
            suppressHydrationWarning
            preload="none"
            width={1920}
            height={1080}
            aria-hidden="true"
            tabIndex={-1}
            disablePictureInPicture
            /* React 19 does know this one, camelCased — the lowercase spread
               produced "Invalid DOM property `disableremoteplayback`". */
            disableRemotePlayback
          />

          {/*
            Parse-time, and LAST of the three — it reaches the <img> and the
            <video> above through `document.currentScript.parentNode`, so both
            have to exist by the time it runs.

            It is the whole of the film's cold start: pick the band, attach the
            encode, promote the still instead if the film is off. The engine
            still owns everything after that, and re-attaches through
            `attachFilmSource`, which now leaves an element that already carries
            the right URL alone rather than calling load() on it. Measured
            effect: the film's first byte moves from t=568ms to ~t=90ms.
          */}
          <FilmMediaBoot
            sources={[sources.src, sources.srcPhone]}
            posters={[sources.poster, sources.posterPhone]}
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

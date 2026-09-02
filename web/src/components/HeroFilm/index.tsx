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
import { CineTrust } from '@/components/sections/HeroCopy';
import { TcDefs } from '@/components/sections/TcDefs';
import css from './film.module.css';
import { HERO_COPY, STORY } from './lib/timeline';
import { useFilm, type FilmRefs, type FilmSources } from './useFilm';

const DEFAULT_SOURCES: FilmSources = {
  /*
    ⛔ `?v=2` — THE WIDE CUT WAS RE-ENCODED 2 Sep 2026 AND THE STAMP MUST MOVE
    WITH IT. `.htaccess` gives every .mp4 `max-age=604800`, so a visitor who
    has seen the site this week would otherwise keep the old 17.8MB file for
    another seven days and none of the load work would reach them.

    17,788,007 -> 13,149,264 bytes, 26.1% off, re-encoded from the ARBITER'S
    OWN 60fps master (assets/video/topcat-intro-1920.mp4) at CRF 26 rather
    than from the shipped cut, so there is no second generation of loss.

    What was held EXACTLY, because the film is scrubbed and hand-measured:
      1920x1080          the encoded width is a coordinate system — `sc` is
                         derived from videoWidth and feeds both the reveal
                         tables and --filmU, which lays out the wide band's
                         typography in film-space pixels. Changing the
                         resolution would silently resize the story text.
      1062 frames        counted, not assumed
      44.250000s         identical, so every hand-measured reveal time still
                         lands on the frame it was measured against
      89 keyframes       every 0.500s exactly, as before — this is what makes
                         a seek into a partially buffered file cheap, and the
                         readiness gate depends on it
      faststart          moov ahead of mdat, verified by box order

    Measured quality, SSIM against that same master: shipped 0.9864, new
    0.9854. Checked by eye at 1:1 on the dark cabinet gradients and the marble
    veining, which is where CRF 26 would break first. Neither shows it.

    The phone cut is untouched — the client reports mobile as working, its
    keyframes are twice as dense, and it is 6.8MB against the wide's 13.1.
  */
  wide: '/assets/video/film-wide.mp4?v=2',
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

/**
 * The scroll cue's arrow, with a band of light that travels down it.
 *
 * `<b>` carries a mask cut to the arrow's own outline and `<span>` inside it is
 * the light. The two are not decoration that could be collapsed into the SVG: a
 * mask is what confines the glare to the stroke, and a separate element is what
 * lets it be animated with a transform rather than by repainting a gradient.
 */
function CueArrow() {
  return (
    <i>
      <svg viewBox="0 0 32 96" focusable="false" aria-hidden="true">
        <path d="M16 1.25V94.75M1.25 80L16 94.75 30.75 80" />
      </svg>
      <b>
        <span />
      </b>
    </i>
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
  const trustRef = useRef<HTMLDivElement>(null);
  const skip = useRef<HTMLButtonElement>(null);
  const keepCue = useRef<HTMLDivElement>(null);
  const heroOut = useRef<HTMLElement>(null);
  const heroSpace = useRef<HTMLDivElement>(null);

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
    trust: trustRef,
    pageHero: heroOut,
    heroSpace,
    skip,
    keepCue,
  });
  const sources = useRef<FilmSources>({ ...DEFAULT_SOURCES, ...srcProp });

  const { skipToEnd } = useFilm(refs.current, sources.current);

  /*
    THE DEADLINE ON THE PAGE'S OWN HERO COPY — A BACKSTOP, NOT A SCHEDULE.

    If nothing ever writes `data-ink` the hero sits at opacity 0 over a still
    frame, so something has to release it when no film is coming.

    ⛔ IT MUST NOT FIRE WHILE A FILM IS STILL COMING. It used to check only
    `data-film-armed`, which useFilm sets after the whole cut has downloaded —
    seconds, on any real connection. So on essentially every visit the deadline
    won the race and painted the page's h1 and CTAs on top of the film's own
    opening line, and nothing ever took it back off.

    The client, 28 Aug: "it shows the surfaces worth building around as an
    overlay above the your worktop starts here ... it's showing both text at the
    same time ... it should not show on the first frame ever." He also noticed
    it clears on a refresh, which is the race: a warm film wins, a cold one
    loses.

    `data-film-pending` is written synchronously by useFilm's mount effect the
    moment it commits to fetching, and that effect runs before this one. So by
    the time this fires the answer is already known: pending means the film's
    own opening copy is on screen and there is nothing to release; armed means
    the film has it. Every path where no film will run — reduced motion, no
    H.264, `?film=off`, an unsafe pin, a failed fetch, a visitor who scrolled —
    inks the hero itself, immediately, and does not wait for this at all.

    The film's own `ink()` at 93% then re-asserts it; adding a class twice is
    free.
  */
  useEffect(() => {
    const el = heroOut.current;
    if (el && !el.hasAttribute('data-ink')) {
      const id = window.setTimeout(() => {
        if (el.hasAttribute('data-film-armed') || el.hasAttribute('data-film-pending')) return;
        el.setAttribute('data-ink', '');
        el.classList.add('loaded');
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
        ⛔ THE FILM ITSELF IS PRELOADED. ADDED 2 Sep 2026, AND IT IS THE
        LARGEST SINGLE WIN ON THE FILM'S START TIME.

        MEASURED, real Chrome, cold cache, throttled to 1.5Mbps, on the
        deployed build BEFORE this line existed:

            227ms   17 JS bundles, 3 stylesheets and the hero still,
                    all requested together
           1042ms   <video> exists, data-film='off', runway 0
           5002ms   film-wide.mp4 finally requested
           8751ms   readyState 3 — the film arms

        The film's `src` is assigned inside the mount effect, so the fetch
        cannot begin until the bundles have downloaded, React has hydrated and
        the pin assertion has passed. Nearly five seconds of a slow visit were
        spent not asking for the one file the page is about.

        Same mechanism as the two plate preloads above, and the same reasons it
        works: `media` does the band pick, the preload scanner reads it ahead of
        script execution, and the reduced-motion clause stops a visitor who will
        never see the film paying for a 13MB download. The `href` values are
        byte-identical to what useFilm assigns, ?v= stamp included, so this is
        the same request and not a second one — get that wrong and the page
        downloads the film twice.

        ⚠️ The band split here is 720px, matching the plates and
        `bandFor`/`filmBand` in useFilm. Tablets take the wide cut, as they do
        in the engine; that is a known cost recorded in the handoff, not an
        oversight of this line.
      */}
      <link
        rel="preload"
        as="video"
        type="video/mp4"
        href={sources.current.phone}
        media="(max-width:720px) and (prefers-reduced-motion: no-preference)"
      />
      <link
        rel="preload"
        as="video"
        type="video/mp4"
        href={sources.current.wide}
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
          {/* The edge vignette. Its opacity tracks how much of the opening
              copy is still on screen — see film.module.css. */}
          <div className={css.edge} />
        </div>

        {/*
          THE LOADING MARK. Added 2 Sep 2026, at the client's suggestion:
          "maybe something like the Topcat logo icon spinning or a circle
          around it… and maybe it says loading your experience. Then it'll
          give time for the video to load in the background."

          Built as the honest face of the readiness gate rather than as an
          interstitial, and the difference matters:

          - IT IS NEVER A TIMER. It is shown only while the stage carries
            `data-film-wait`, which useFilm sets when the film genuinely
            cannot advance, and it goes the instant the film can. On a fast
            connection the gate opens in a few hundred milliseconds and the
            0.45s delay on the fade-in below means nobody ever sees it.
          - THE RING IS REAL. `--filmLoad` is how much of the four-second head
            start is actually buffered, written by the tick. A ring that fills
            on a fixed animation while the network does something else is a
            lie, and this site does not have a spare unit of the client's
            trust to spend on one.
          - IT NEVER TRAPS ANYONE. Skip Intro sits above it and still works,
            and the gate stands itself down after STALL_LIMIT.

          `aria-hidden` with a polite live region beside it: the mark is
          decorative, the sentence is the part worth announcing, and it is
          announced once rather than on every ring update.
        */}
        <div className={css.loading} aria-hidden="true">
          <i className={css.loadRing}>
            <img src="/assets/brand/topcat-icon.svg" alt="" width={48} height={48} />
          </i>
          <b>Loading your experience</b>
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

        {/* The two chips that ride the wipe out with the opening line. */}
        <div className={css.trust} ref={trustRef} aria-hidden="true">
          <CineTrust />
        </div>

        <button type="button" className={css.skip} ref={skip} onClick={skipToEnd}>
          {skipLabel}
        </button>


        {/*
          THE KEEP-SCROLLING CUE. The client, 28 Aug: "once the user starts
          scrolling and the first wave of text goes away ... right above the
          phone button ... we need to still have a small arrow showing that
          they need to continue swiping, because the owner of the company was
          confused that the video just stopped when he didn't know that he
          needs continuous swiping ... And that is non-intrusive."

          ⛔ A DIRECT CHILD OF THE STAGE, and it has to be. The first-load cue
          lives inside `.heroCopy`, which is the block the film wipes off the
          screen — the engine writes that block's opacity, visibility and
          transform, so anything inside it leaves when it leaves. This is the
          same <CueArrow/>, in a box the film does not take away, with its own
          opacity written by the loop.
        */}
        <div className={css.keepCue} ref={keepCue} aria-hidden="true">
          <CueArrow />
        </div>

        {/*
          THE PAGE'S OWN HERO — inside the stage, and released at 93% of the
          film so it is already in place before the picture settles.

          `id="hero"` is here, so every `#hero …` rule in globals.css keeps
          working. There is no separate overlay image: the client asked for it
          to go — "the end of the video is just what it is for the hero
          section" — so what is behind this copy is the film's own final frame,
          still on screen, which is why there is nothing left to jump.
        */}
        <section className={css.pageHero} id="hero" ref={heroOut}>
          <TcDefs />
          <div className={css.heroInner}>{hero}</div>
          {/*
            THE HERO'S OWN SCROLL CUE. The client, looking at the settled hero:
            "there's a big open space below that. I want you to just have a
            small golden arrow animating the same way as in the video, just
            pointing down, telling people to scroll down... not too bright or
            noticeable."

            Literally the film's own <CueArrow/>, sharing its keyframes and its
            sheen — see `.keepCue i` in film.module.css, whose selectors this
            joins rather than copies, so the two can never drift apart. Only the
            size, the placement and the opacity differ: smaller, centred under
            the chips, and dimmer, because this one sits on a settled hero
            rather than over a moving picture.

            Inside `.pageHero`, so it arrives with the hero copy at 93% of the
            film and scrolls away with it. No engine hookup and nothing to
            tear down.
          */}
          <div className={css.settledCue} aria-hidden="true">
            <CueArrow />
          </div>
        </section>

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
          ⛔ THE RUNWAY GOES UP DURING PARSE, NOT AFTER HYDRATION.
          ADDED 2 Sep 2026. THIS IS THE "IT JUMPED TO SOMETHING ELSE" BUG.

          The client: "when I opened the site for the first time on Safari or a
          new browser, it didn't play the video immediately, it almost jumped to
          something else."

          MEASURED, real Chrome, cold cache, 1.5Mbps, on the deployed build:
          the runway was 0px and `data-film` was 'off' until 4,774ms, and then
          became 8,100px in one step. For those first ~4.8 seconds the entire
          home page was scrollable under a hero that says "Scroll to begin" —
          and the moment the effect ran, 8,100px of runway appeared UNDER the
          visitor and everything they were reading leapt away. On a repeat visit
          the window is nil, because the bundles and the film are both cached,
          which is exactly why he only saw it on a cold browser.

          This closes the window. It runs during parse, immediately after the
          two elements exist, and writes the SAME two things the mount effect
          writes, in the same order and for the same reason — the runway holds
          the distance, `data-film='loading'` holds the viewport, and one
          without the other is either an empty scroll or a stage pinned over a
          short page. The effect's own block is now idempotent rather than
          first.

          It reads `html.film-running`, which the root layout has already
          decided during parse on the film's own conditions: the home path,
          no `data-to-hero`, no reduced motion, an H.264 decoder and no
          `?film=off`. So this cannot fire on a visitor who will never see a
          film, and there is nothing here to keep in step with those rules.

          `pinIsSafe` still cannot be tested before layout, so the give-up path
          is unchanged: `landed()` collapses the runway and clears the stage.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              '(function(){try{' +
              "if(!document.documentElement.classList.contains('film-running'))return;" +
              "var r=document.getElementById('filmRunway');" +
              /* The stage is a direct child of <body> and the runway is inside
                 <main>, so they are not siblings — query the attribute, which
                 is unique on the page and already parsed by this point. */
              "var s=document.querySelector('[data-film]');" +
              'if(!r||!s)return;' +
              /* The band heights are RUNWAY + HOLD from useFilm.ts: phone
                 690+100, tablet 800+100, wide 820+80. Kept in step by hand —
                 there is no way to share a constant with a parse-time string. */
              'var w=window.innerWidth,v=w<=720?790:w<=1120?900:900;' +
              "s.setAttribute('data-film','loading');" +
              /* The loading mark belongs to the download too, not only to a
                 scrub that has outrun the buffer. The tick takes ownership of
                 this attribute the moment the film arms and clears it as soon
                 as the gate opens. */
              "s.setAttribute('data-film-wait','1');" +
              "r.style.setProperty('--runway',v+'vh');" +
              '}catch(e){}})()',
          }}
        />

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
        {/*
          THE SPACE THE HERO OCCUPIES IN FLOW.

          Empty. The hero's picture and copy are inside the stage, which is what
          lets the copy arrive OVER the film before it has finished — the client,
          28 Aug: "shortly before its end, as the kitchen is almost settling into
          its final position, the surfaces worth building around should have come
          up already." A block that only exists after the film cannot do that.

          So the stage IS the hero. It is `position: fixed` while the film runs
          and becomes `position: absolute` at the lock, at which moment the
          scroll is already at the top of this box — so the two render
          identically and nothing moves. After that it scrolls away like any
          other section. This reserves its one viewport in the document.
        */}
        <div className={css.heroSpace} ref={heroSpace} aria-hidden="true" />

        {/*
          THE BEAT BETWEEN THE HERO AND THE FIRST SECTION.

          Its size is not a matter of taste — it is solved. The client, 28 Aug:
          "the spacing between [the closing line] and the border below it, the
          spacing should be the same as hear it from your neighbours from the
          divider above that. So make that spacing equal."

          Measured on the reviews section, which is what follows the hero: the
          gap from the closing link's underline down to the divider beneath it
          is 89px on a phone, 106 on a tablet and 164 on the desktop. The gap
          above the section's heading is this spacer plus the section's own top
          padding, which is 39 / 46 / 164. So the spacer is the difference —
          and on the desktop it is already equal, which is why it is zero there.

          ⛔ IT HAS BEEN WRONG IN BOTH DIRECTIONS. It first shipped with no CSS
          rule at all, so it was 0px while two comments claimed 40vh. Then it
          was given the old build's own hold, 60vh, and read as a broken empty
          screen — "one gigantic gap" — because the hold sits below a 100vh
          hero whose copy is centred, so the hero's bottom half is already dark.
          Then it was removed entirely, which made the heading sit too close.
          These three numbers are measured against the section below, so if that
          section's padding changes, re-measure rather than guess.

          It is NOT what protects the handoff from a hard flick. That is the
          momentum guard in `lockFilm`.
        */}
        <div className={css.heroHold} aria-hidden="true" />

        {/* Above the stage in paint order so the page slides up over the film.
            Deliberately no background — see the note in film.module.css. */}
        <div className={css.overFilm}>{children}</div>
      </main>
    </>
  );
}

export default HeroFilm;

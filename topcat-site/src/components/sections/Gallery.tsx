'use client';

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from 'react';
import { createPortal } from 'react-dom';

import { PROJECTS, type Project } from '@/data/home/projects';
import { REVIEWS } from '@/data/home/reviews';
import { srcSet } from '@/data/home/srcset';
import { useCursorGlow } from '@/hooks/useCursorGlow';
import { useGalleryDoors } from '@/hooks/useGalleryDoors';
import { HERO_N, useProjectSlideshow } from '@/hooks/useProjectSlideshow';

/**
 * `section#gallery` — index.html:3741.
 *
 * Three things live in this section: the project wall, the full-screen
 * project detail, and the image lightbox.
 *
 * WHICH LAYOUT RENDERS
 * --------------------
 * The source has three gallery modes, chosen by a CSS custom property that JS
 * reads back (`--galMode`, globals.css §7):
 *
 *   phone  ≤720px        a single column
 *   grid   721-1120px    a centred column, wider cards
 *   door   ≥1121px       the scroll-pinned wall where each card swings open
 *                        on a hinge as you scroll past it
 *
 * `galStatic()` (site.js:2088) treats *phone and grid alike* — both set the
 * `gal-static` class, which turns `.gal-scroll`/`.gal-pin`/`.gal-stage` from
 * an absolutely-positioned pinned stage into ordinary flow. So `gal-static`
 * is not a fallback; it is the shipped layout for every viewport under
 * 1121px, and site.css:3045/3056 tune it for 721px and 1121px up.
 *
 * The door engine now lives in `useGalleryDoors` (site.js:2050-2330). It owns
 * the `gal-static` class as well: `measure()` (site.js:2095-2096) reads
 * `--galMode` back out of CSS and toggles the class, so this component no
 * longer decides the mode. Below 1121px the engine's own `render()` and
 * `frame()` bail on their first line and the static layout is untouched.
 */

/** site.js:2044 — the wall is built in sets of four. */
const PER_SET = 4;

/*
 * site.css:1516-1518 and 3204. When the slideshow was cut from the port these
 * three rules were dropped from the extracted stylesheet with it, so the five
 * `.phb-slide`s would render as unsized, unpositioned, fully opaque divs. The
 * rules are reinstated verbatim here rather than in `home-sections.css`
 * because this component owns the markup they style and the stylesheet is
 * generated. They belong back in the stylesheet next to `.proj-hero-bg`
 * (home-sections.css:995) whenever it is next regenerated.
 */
const PHB_CSS = `
.phb-slide{position:absolute;inset:0;background-size:cover;background-position:center;opacity:0;transition:opacity 1.3s var(--ease);will-change:opacity,transform}
.phb-slide.active{animation:phbZoom 6s var(--ease) forwards}
@keyframes phbZoom{from{transform:scale(1.10)}to{transform:scale(1)}}
@media(max-width:720px){.phb-slide{will-change:opacity}}
`;
const PHB_STYLE = <style>{PHB_CSS}</style>;

function setsOf<T>(items: readonly T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

export default function Gallery() {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const detailRef = useRef<HTMLDivElement | null>(null);
  const heroBgRef = useRef<HTMLDivElement | null>(null);

  const mediaRef = useRef<HTMLDivElement | null>(null);

  const [open, setOpen] = useState<Project | null>(null);
  const [gridOpen, setGridOpen] = useState(false);
  const [lightbox, setLightbox] = useState<number | null>(null);

  /*
   * site.js:2527-2528 — `document.body.appendChild(detail)` and
   * `appendChild(lightbox)`, plus `appendChild(overlay)` for the grid view at
   * site.js:2499. The source ships all three inside `#gallery` and then MOVES
   * them to <body> on init, because `#gallery` is `position:relative;
   * z-index:1` (site.css) — a stacking context that would otherwise flatten
   * the overlays' own z-index (120/130) down to the section's 1, letting every
   * later sibling (#stones, #reviews, #process, #cta, the footer, the sticky
   * contact bar) paint straight over an open project.
   *
   * `mounted` reproduces the move exactly: the server and the first client
   * render put the markup inside the section — matching the source's shipped
   * HTML and keeping hydration identical — and the effect then relocates it to
   * <body>, which is where site.js leaves it.
   */
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  /*
   * The source never empties the overlay on close. `closeFocus` (site.js:2475)
   * only drops the `.on` class, so the project's own copy, photographs and
   * hero stay in the DOM behind the 0.5s fade and are replaced only when the
   * next project is loaded. Driving the content from `open` would blank it in
   * the same frame as the click and play the fade over an empty shell, so the
   * `.on` class tracks `open` while the CONTENT tracks `shown`, which is only
   * ever overwritten — never cleared. Same reasoning for the lightbox's 0.35s
   * fade and `lbShown`.
   */
  const [shown, setShown] = useState<Project | null>(null);
  const [lbShown, setLbShown] = useState<number | null>(null);

  useCursorGlow(stageRef, '.gal-door');
  // site.js:2391 `attachGlow(el)` runs per tile inside `loadMedia`, so the
  // glow is re-attached every time a project's photographs are built. The
  // tiles do not exist at mount, so this must re-run when `shown` changes.
  useCursorGlow(detailRef, '.proj-ph', shown);

  /* ------------------------------------------------- the door engine -- */

  // site.js:2050-2330. Also owns the `gal-static` class (site.js:2095-2096).
  useGalleryDoors(scrollRef, stageRef);

  // site.js:2338-2377 — the hero cross-fade, started by `openFocus` at 2500.
  useProjectSlideshow(heroBgRef, open ? open.img : null, open ? open.gallery : null);

  /* ------------------------------------------------------ open / close */

  const openProject = useCallback((p: Project) => {
    setLightbox(null);
    setOpen(p);
    setShown(p);
    document.documentElement.classList.add('proj-open');
    // site.js:2469 — the overlay always opens at the top, never where the
    // last project was left scrolled to.
    if (detailRef.current) detailRef.current.scrollTop = 0;
  }, []);

  const closeProject = useCallback(() => {
    setLightbox(null);
    setOpen(null);
    document.documentElement.classList.remove('proj-open');
  }, []);

  useEffect(() => {
    if (gridOpen) document.documentElement.classList.add('gal-grid-open');
    else document.documentElement.classList.remove('gal-grid-open');
  }, [gridOpen]);

  /*
   * site.js:2476-2478 — a CAPTURE-phase click listener on `header.bar`: any
   * click on any anchor in the bar closes an open project. Without it the
   * overlay survives the navigation, so on the home page the logo (href
   * `/#hero`) and every same-page nav link scroll the document behind an
   * overlay that still covers the viewport — the page appears frozen on the
   * project. Capture, so it runs before the anchor's own default.
   */
  useEffect(() => {
    const bar = document.querySelector('header.bar');
    if (!bar) return;
    const onBarClick = (e: Event) => {
      if ((e.target as HTMLElement | null)?.closest('a')) closeProject();
    };
    bar.addEventListener('click', onBarClick, true);
    return () => bar.removeEventListener('click', onBarClick, true);
  }, [closeProject]);

  // site.js:2508 — Escape closes the innermost thing that is open, and the
  // arrows page the lightbox.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (lightbox !== null && open) {
        if (e.key === 'Escape') setLightbox(null);
        else if (e.key === 'ArrowRight')
          setLightbox((i) => ((i ?? 0) + 1) % open.gallery.length);
        else if (e.key === 'ArrowLeft')
          setLightbox(
            (i) => ((i ?? 0) - 1 + open.gallery.length) % open.gallery.length,
          );
        return;
      }
      if (e.key !== 'Escape') return;
      if (open) closeProject();
      else if (gridOpen) setGridOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightbox, open, gridOpen, closeProject]);

  useEffect(
    () => () => {
      document.documentElement.classList.remove('proj-open', 'gal-grid-open');
    },
    [],
  );

  // Retain the last opened index so the photograph and the counter survive the
  // lightbox's own 0.35s fade-out instead of vanishing on the closing frame.
  useEffect(() => {
    if (lightbox !== null) setLbShown(lightbox);
  }, [lightbox]);

  const review = shown?.reviewBy
    ? (REVIEWS.find((r) => r.n === shown.reviewBy) ?? null)
    : null;
  // site.js:2466 — with neither a story nor a review the intro collapses to a
  // single column instead of leaving an empty one.
  const hasCol = Boolean(shown?.story || review);

  /*
   * site.js:2394-2426 — the TopCat plate. `loadMedia` appends one extra cell
   * to `#projMedia` for a `brand:true` project, a marble tile carrying
   * `topcat-vertical.svg`, sized from the first photograph's intrinsic ratio
   * and the number of columns the masonry would otherwise leave ragged.
   *
   * The source then measures on the next frame and takes the plate back out
   * when it makes the column bottoms MORE uneven than leaving the gap — which
   * is why it shows on wimbledon, central-london and harlow at 1440 but not on
   * harrow or hornchurch. `plateOff` is that measurement's verdict; the plate
   * is rendered first so the effect has something to measure, exactly as the
   * source appends before it checks.
   */
  const brandVars = useMemo((): CSSProperties | undefined => {
    if (!shown?.brand || !shown.gallery.length) return undefined;
    const [, w0, h0] = shown.gallery[0];
    const gap = (c: number) => (c - (shown.gallery.length % c)) % c;
    const n3 = gap(3);
    const n2 = gap(2);
    return {
      ...(w0 && h0
        ? {
            '--brandAR3': `${w0} / ${h0 * (n3 || 1)}`,
            '--brandAR2': `${w0} / ${h0 * (n2 || 1)}`,
          }
        : {}),
      '--brandShow3': n3 ? 'flex' : 'none',
      '--brandShow2': n2 ? 'flex' : 'none',
    } as CSSProperties;
  }, [shown]);

  const [plateOff, setPlateOff] = useState(false);

  useLayoutEffect(() => {
    setPlateOff(false);
  }, [shown]);

  useEffect(() => {
    const wrap = mediaRef.current;
    if (!wrap || !brandVars) return;
    const measure = () => {
      const plate = wrap.querySelector<HTMLElement>('.proj-brand');
      if (!plate) return;
      const ragged = () => {
        const bottoms = new Map<number, number>();
        for (const el of Array.from(wrap.children) as HTMLElement[]) {
          if (!el.offsetWidth && !el.offsetHeight) continue;
          const x = Math.round(el.offsetLeft);
          bottoms.set(x, Math.max(bottoms.get(x) ?? 0, el.offsetTop + el.offsetHeight));
        }
        const v = [...bottoms.values()];
        return v.length > 1 ? Math.max(...v) - Math.min(...v) : 0;
      };
      const withPlate = ragged();
      plate.style.display = 'none';
      const without = ragged();
      plate.style.display = '';
      if (withPlate >= without) setPlateOff(true);
    };
    const raf = requestAnimationFrame(measure);
    // The verdict is column-count dependent, so it has to be retaken when the
    // masonry changes columns at the 721/1121 band edges.
    window.addEventListener('resize', measure);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', measure);
    };
  }, [shown, brandVars]);

  // `i` is the card's index WITHIN its set of four, which is what the source
  // uses for both the stacking order (site.js:2206) and the hinge side
  // (site.js:2214) — not its index in PROJECTS.
  const card = (p: Project, i: number) => {
    const responsive = srcSet(p.img, '(max-width:720px) 440px, 1160px');
    return (
      <article
        key={p.key}
        className="gal-card"
        tabIndex={0}
        role="button"
        aria-label={p.name + ', ' + p.place}
        data-name={p.name}
        data-place={p.place}
        data-key={p.key}
        style={{ zIndex: 10 + i }}
        onClick={() => openProject(p)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openProject(p);
          }
        }}
      >
        <div
          className="gal-door glow-card"
          style={{ transformOrigin: i % 2 === 0 ? '0% 50%' : '100% 50%' }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={p.img}
            {...responsive}
            alt={p.name + ', ' + p.place}
            draggable={false}
            loading="lazy"
            decoding="async"
          />
          <div className="gal-veil" />
          <div className="sheen" />
          <div className="gal-meta">
            <span className="gal-name">{p.name}</span>
            <span className="gal-place">{p.place}</span>
          </div>
        </div>
      </article>
    );
  };

  /*
   * site.js:2499 and 2527-2528 move all three overlays to <body>. They are
   * declared here as one fragment so the portal relocates them together.
   */
  const overlays = (
    <>
    {/* --------------------------------------------------- the detail */}
    <div
      className={'proj-detail' + (open ? ' on' : '')}
      id="projDetail"
      aria-hidden={!open}
      ref={detailRef}
    >
      <button className="proj-close" id="projClose" onClick={closeProject}>
        <svg
          viewBox="0 0 24 24"
          width="13"
          height="13"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M15 5l-7 7 7 7" />
        </svg>{' '}
        Back to the gallery
      </button>

      <div className="proj-hero">
        {/*
          site.js:2339 — five stacked slides, cross-faded on a 4.5s timer by
          useProjectSlideshow. `.proj-hero-bg` itself carries no image in the
          source (site.css:1515, `background:var(--ink)`); slide 0 is filled
          with the clicked card's photograph in a layout effect, before paint.
        */}
        <div className="proj-hero-bg" id="projHeroBg" ref={heroBgRef}>
          {Array.from({ length: HERO_N }, (_, i) => (
            <div className="phb-slide" key={i} />
          ))}
        </div>
        <div className="proj-hero-veil" />
        <div className="proj-hero-copy">
          <span className="proj-eyebrow" id="projPlace">
            {shown ? shown.place : 'Project'}
          </span>
          <h2 className="proj-title" id="projName">
            {shown ? shown.name : 'Project'}
          </h2>
          <span className="proj-scrollcue" aria-hidden="true">
            <svg
              viewBox="0 0 24 24"
              width="26"
              height="26"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 4v15" />
              <path d="M5.5 12.5L12 19l6.5-6.5" />
            </svg>
          </span>
        </div>
      </div>

      <div className="proj-body">
        <div
          className="proj-intro"
          style={hasCol ? undefined : { gridTemplateColumns: '1fr' }}
        >
          <div className="proj-meta">
            <div>
              <span className="pm-k">Location</span>
              <span className="pm-v" id="projMetaPlace">
                {shown?.place ?? ''}
              </span>
            </div>
            <div
              id="projTypeRow"
              style={shown?.type ? undefined : { display: 'none' }}
            >
              <span className="pm-k">Project type</span>
              <span className="pm-v" id="projMetaType">
                {shown?.type ?? ''}
              </span>
            </div>
          </div>
          <div
            className="proj-desc"
            id="projDesc"
            style={hasCol ? undefined : { display: 'none' }}
          >
            <div
              id="projStoryWrap"
              style={shown?.story ? undefined : { display: 'none' }}
            >
              <p className="proj-lead">What we did</p>
              <p className="big" id="projStory">
                {shown?.story ?? ''}
              </p>
            </div>
            <figure
              className="proj-rev"
              id="projRev"
              style={review ? undefined : { display: 'none' }}
            >
              <div className="proj-rev-top">
                <span className="stars">★★★★★</span>
                <span className="proj-rev-src">Google review</span>
              </div>
              <blockquote id="projRevText">
                {review ? '“' + review.q + '”' : ''}
              </blockquote>
              <figcaption id="projRevName">{review ? review.n : ''}</figcaption>
            </figure>
          </div>
        </div>

        <div className="proj-media" id="projMedia" ref={mediaRef}>
          {shown?.gallery.map(([src, w, h], i) => (
            <div
              key={src}
              className="proj-ph glow-card"
              tabIndex={0}
              role="button"
              aria-label={`${shown.name}, photograph ${i + 1} of ${shown.gallery.length}`}
              onClick={() => setLightbox(i)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setLightbox(i);
                }
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                width={w}
                height={h}
                alt={`${shown.name}, photograph ${i + 1}`}
                loading="lazy"
                decoding="async"
                draggable={false}
              />
              <div className="sheen" />
            </div>
          ))}
          {/*
            site.js:2394-2426. The plate is decoration, not a photograph: the
            source appends it AFTER building MEDIA, gives it no click or
            keydown handler and no tabIndex, and marks it aria-hidden — so it
            never enters the lightbox and never shifts the "n / total" count.
          */}
          {brandVars && !plateOff && (
            <div className="proj-brand" aria-hidden="true" style={brandVars}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/assets/brand/topcat-vertical.svg"
                alt=""
                draggable={false}
              />
            </div>
          )}
        </div>

        <div className="proj-cta">
          <p>Planning something like this?</p>
          <a href="/contact/" className="proj-cta-btn">
            Get a quote
          </a>
        </div>
      </div>
    </div>

    {/* ------------------------------------------------- the lightbox */}
    <div
      className={'proj-lightbox' + (lightbox !== null ? ' on' : '')}
      id="projLightbox"
      aria-hidden={lightbox === null}
    >
      <button
        className="pl-close"
        id="plClose"
        aria-label="Minimise"
        onClick={() => setLightbox(null)}
      >
        Minimise <span>&times;</span>
      </button>
      <button
        className="pl-nav pl-prev"
        id="plPrev"
        aria-label="Previous image"
        onClick={() =>
          shown &&
          setLightbox(
            (i) => ((i ?? 0) - 1 + shown.gallery.length) % shown.gallery.length,
          )
        }
      >
        &#8249;
      </button>
      <button
        className="pl-nav pl-next"
        id="plNext"
        aria-label="Next image"
        onClick={() =>
          shown && setLightbox((i) => ((i ?? 0) + 1) % shown.gallery.length)
        }
      >
        &#8250;
      </button>
      <div className="pl-stage">
        <div
          className="pl-img"
          id="plImg"
          style={
            shown && lbShown !== null && shown.gallery[lbShown]
              ? { backgroundImage: `url(${shown.gallery[lbShown][0]})` }
              : undefined
          }
        />
        <span className="pl-play" id="plPlay" />
      </div>
      <div className="pl-caption">
        {/* site.js:2436 renderLb always writes an empty label; kept as-is. */}
        <span className="pl-label" id="plLabel" />
        <span className="pl-counter" id="plCounter">
          {shown && lbShown !== null && shown.gallery[lbShown]
            ? `${lbShown + 1} / ${shown.gallery.length}`
            : ''}
        </span>
      </div>
    </div>

    {/* ------------------------------------------- "View as grid" ---- */}
    <div
      className={'gal-grid-view' + (gridOpen ? ' on' : '')}
      aria-hidden={!gridOpen}
    >
      <button
        type="button"
        className="gal-grid-close"
        onClick={() => setGridOpen(false)}
      >
        Close &times;
      </button>
      <div className="gal-grid-title">
        <h3>
          Project <em>gallery</em>
        </h3>
      </div>
      <div className="gal-grid-inner">
        {PROJECTS.map((p) => (
          <article
            key={p.key}
            className="gal-grid-item glow-card"
            tabIndex={0}
            role="button"
            aria-label={p.name + ', ' + p.place}
            data-name={p.name}
            data-place={p.place}
            data-key={p.key}
            onClick={() => openProject(p)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openProject(p);
              }
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={p.img}
              {...srcSet(p.img, '(max-width:720px) 440px, 1160px')}
              alt={p.name + ', ' + p.place}
              draggable={false}
              loading="lazy"
              decoding="async"
            />
            <div className="gg-veil" />
            <div className="sheen" />
            <span className="gg-name">{p.name}</span>
            <span className="gg-place">{p.place}</span>
          </article>
        ))}
      </div>
    </div>
    </>
  );

  return (
    <section id="gallery">
      {PHB_STYLE}
      <div className="gal-scroll" id="galScroll" ref={scrollRef}>
        <div className="gal-pin">
          <div className="gal-stage" id="galStage" ref={stageRef}>
            <div className="gal-mid" id="galMid">
              <h2 className="section-title">
                View our project <em>gallery</em>
              </h2>
              <p className="section-sub">
                Recent projects across England. Click any project to open its
                story.
              </p>
              <div className="gal-mid-actions">
                <a className="gal-mid-cta" href="#cta">
                  Get in touch
                </a>
                <button
                  type="button"
                  className="gal-grid-btn"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setGridOpen(true);
                  }}
                >
                  View as grid
                </button>
              </div>
            </div>
            {setsOf(PROJECTS, PER_SET).map((set, s) => (
              // `.gal-set` is `display:contents` under gal-static, so the
              // grouping costs nothing there and is exactly what the door
              // engine animates when it lands.
              <div className="gal-set" key={s}>
                {set.map((p, i) => card(p, i))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {mounted ? createPortal(overlays, document.body) : overlays}
    </section>
  );
}

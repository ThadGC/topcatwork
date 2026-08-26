'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { PROJECTS, type Project } from '@/data/home/projects';
import { REVIEWS } from '@/data/home/reviews';
import { srcSet } from '@/data/home/srcset';
import { useCursorGlow } from '@/hooks/useCursorGlow';

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
 * The door engine is NOT ported here — it is a scroll-linked 3D rig with its
 * own gather/spread/walk phases (site.js:2019-2330). `DOOR_ENGINE` below is
 * the single switch: while it is false the section renders `gal-static` at
 * every width, which is the source's own layout with the source's own
 * numbers. Flip it to true when the engine lands and the mode logic reverts
 * to exactly what site.js does.
 */
const DOOR_ENGINE = false;

/** site.js:2044 — the wall is built in sets of four. */
const PER_SET = 4;

function setsOf<T>(items: readonly T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

export default function Gallery() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const detailRef = useRef<HTMLDivElement | null>(null);

  const [open, setOpen] = useState<Project | null>(null);
  const [gridOpen, setGridOpen] = useState(false);
  const [lightbox, setLightbox] = useState<number | null>(null);

  useCursorGlow(stageRef, '.gal-door');
  useCursorGlow(detailRef, '.proj-ph');

  /* ---------------------------------------------------------- gal mode */

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    if (!DOOR_ENGINE) {
      el.classList.add('gal-static');
      return;
    }
    // site.js:2088 — the mode comes out of CSS, never out of matchMedia.
    const sync = () => {
      const m = getComputedStyle(el).getPropertyValue('--galMode').trim();
      el.classList.toggle('gal-static', m === 'phone' || m === 'grid');
    };
    sync();
    window.addEventListener('resize', sync);
    return () => window.removeEventListener('resize', sync);
  }, []);

  /* ------------------------------------------------------ open / close */

  const openProject = useCallback((p: Project) => {
    setLightbox(null);
    setOpen(p);
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

  const review = open?.reviewBy
    ? (REVIEWS.find((r) => r.n === open.reviewBy) ?? null)
    : null;
  // site.js:2466 — with neither a story nor a review the intro collapses to a
  // single column instead of leaving an empty one.
  const hasCol = Boolean(open?.story || review);

  const card = (p: Project) => {
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
        onClick={() => openProject(p)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openProject(p);
          }
        }}
      >
        <div className="gal-door glow-card">
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

  return (
    <section id="gallery" ref={sectionRef}>
      <div className="gal-scroll" id="galScroll">
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
                {set.map(card)}
              </div>
            ))}
          </div>
        </div>
      </div>

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
            The legacy hero cross-fades through the project's photographs on a
            4.5s timer across five stacked `.phb-slide`s (site.js:2343). That
            slideshow is not ported; the hero holds the card image the visitor
            clicked, which is the first frame of that sequence.
          */}
          <div
            className="proj-hero-bg"
            id="projHeroBg"
            style={open ? { backgroundImage: `url("${open.img}")` } : undefined}
          />
          <div className="proj-hero-veil" />
          <div className="proj-hero-copy">
            <span className="proj-eyebrow" id="projPlace">
              {open ? open.place : 'Project'}
            </span>
            <h2 className="proj-title" id="projName">
              {open ? open.name : 'Project'}
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
                  {open?.place ?? ''}
                </span>
              </div>
              <div
                id="projTypeRow"
                style={open?.type ? undefined : { display: 'none' }}
              >
                <span className="pm-k">Project type</span>
                <span className="pm-v" id="projMetaType">
                  {open?.type ?? ''}
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
                style={open?.story ? undefined : { display: 'none' }}
              >
                <p className="proj-lead">What we did</p>
                <p className="big" id="projStory">
                  {open?.story ?? ''}
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

          <div className="proj-media" id="projMedia">
            {open?.gallery.map(([src, w, h], i) => (
              <div
                key={src}
                className="proj-ph glow-card"
                tabIndex={0}
                role="button"
                aria-label={`${open.name}, photograph ${i + 1} of ${open.gallery.length}`}
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
                  alt={`${open.name}, photograph ${i + 1}`}
                  loading="lazy"
                  decoding="async"
                  draggable={false}
                />
                <div className="sheen" />
              </div>
            ))}
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
            open &&
            setLightbox(
              (i) => ((i ?? 0) - 1 + open.gallery.length) % open.gallery.length,
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
            open && setLightbox((i) => ((i ?? 0) + 1) % open.gallery.length)
          }
        >
          &#8250;
        </button>
        <div className="pl-stage">
          <div
            className="pl-img"
            id="plImg"
            style={
              open && lightbox !== null
                ? { backgroundImage: `url(${open.gallery[lightbox][0]})` }
                : undefined
            }
          />
          <span className="pl-play" id="plPlay" />
        </div>
        <div className="pl-caption">
          {/* site.js:2436 renderLb always writes an empty label; kept as-is. */}
          <span className="pl-label" id="plLabel" />
          <span className="pl-counter" id="plCounter">
            {open && lightbox !== null
              ? `${lightbox + 1} / ${open.gallery.length}`
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
    </section>
  );
}

'use client';

import { useEffect, useRef, useState } from 'react';

import { SERVICES } from '@/data/home/services';
import { srcSet } from '@/data/home/srcset';
import { useCursorGlow } from '@/hooks/useCursorGlow';
import { useReveal } from '@/hooks/useReveal';

/**
 * `section.section#services` — index.html:3717.
 *
 * Two renderings of the same eight services sit in this section at once, and
 * CSS decides which one is visible:
 *
 *   .svc-helix   a 3D carousel, shown ≥721px
 *   .services-grid   flip cards, shown ≤720px (`--svcMode: phone`)
 *
 * The flip cards are built here from `SERVICES` — the same call the source
 * makes at site.js:340, `buildCards(grid, SERVICES, {nameOnly:true,
 * readMore:true})`. `nameOnly` is why the front of the card carries a title
 * and no description; `readMore` is why the back ends in a link to the
 * service page instead of a "Back" hint.
 *
 * THE HELIX STAGE IS LEFT EMPTY, deliberately. `.helix-card` is a 3D carousel
 * with its own yaw/step engine (site.js:454-690) and a procedural marble
 * backing painted onto each card's reverse; it is a separate piece of work
 * from this composition. The stage, its two `.wbtn` controls and the
 * `#svcNav` tablist are all here with the legacy ids, so wiring the engine to
 * them is a drop-in. Until then the grid — which is real, complete markup —
 * is what renders.
 */

const FLIP_ICON = (
  <svg viewBox="0 0 24 24">
    <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
    <path d="M21 3v5h-5" />
    <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
    <path d="M3 21v-5h5" />
  </svg>
);

const MORE_ICON = (
  <svg viewBox="0 0 24 24">
    <path d="M5 12h14" />
    <path d="M13 6l6 6-6 6" />
  </svg>
);

/** site.js:458 — the helix visits the services in this order, not source order. */
const HELIX_ORDER = [0, 1, 7, 3, 4, 5, 6, 2] as const;

/** site.js:439 — reveal on at 0.78 of viewport height, off again at 0.94. */
const SVC_ON = 0.78;
const SVC_OFF = 0.94;

/**
 * The services-grid entrance, ported from site.js:425-452.
 *
 * Note what the source actually does: it *removes* `.enter` and swaps in
 * `.svc-rev`, then toggles `.revealed` from a scroll handler. The `.svc.go` /
 * `@keyframes svcIn` pair in site.css is dead code — nothing has added `.go`
 * for a long time — so it is not reproduced here beyond the CSS that came
 * across with the rest of the stylesheet.
 *
 * `--svcFrom` is measured per card: the distance from the card's natural left
 * edge to just past the right edge of the viewport, so every card slides in
 * from off-screen regardless of which column it lands in. It has to be
 * measured with the transform cleared, or the second measurement reads the
 * first slide's offset back.
 */
function useServicesReveal(gridRef: React.RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    const cards = Array.from(grid.querySelectorAll<HTMLElement>('.svc'));
    if (!cards.length) return;

    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      cards.forEach((el) => {
        el.classList.remove('enter');
        el.style.opacity = '1';
      });
      return;
    }

    cards.forEach((el, i) => {
      el.classList.remove('enter');
      el.classList.add('svc-rev');
      el.style.setProperty('--si', String(i));
    });

    const measure = () => {
      cards.forEach((el) => {
        const pt = el.style.transition;
        const pf = el.style.transform;
        el.style.transition = 'none';
        el.style.transform = 'none';
        const r = el.getBoundingClientRect();
        el.style.setProperty(
          '--svcFrom',
          Math.round((window.innerWidth || 1200) - r.left + 60) + 'px',
        );
        el.style.transform = pf;
        void el.offsetWidth; // force the reflow before the transition returns
        el.style.transition = pt;
      });
    };

    let shown = false;
    const check = () => {
      const topFrac =
        grid.getBoundingClientRect().top / (window.innerHeight || 1);
      if (!shown && topFrac < SVC_ON) {
        shown = true;
        cards.forEach((el) => el.classList.add('revealed'));
      } else if (shown && topFrac > SVC_OFF) {
        shown = false;
        cards.forEach((el) => el.classList.remove('revealed'));
      }
    };

    const onResize = () => {
      measure();
      check();
    };

    measure();
    check();
    window.addEventListener('scroll', check, { passive: true });
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('scroll', check);
      window.removeEventListener('resize', onResize);
    };
  }, [gridRef]);
}

export default function Services() {
  const sectionRef = useReveal<HTMLElement>();
  const gridRef = useRef<HTMLDivElement | null>(null);
  const [flipped, setFlipped] = useState<ReadonlySet<number>>(new Set());

  useServicesReveal(gridRef);
  useCursorGlow(gridRef, '.svc');

  const toggle = (i: number) =>
    setFlipped((prev) => {
      const next = new Set(prev);
      if (!next.delete(i)) next.add(i);
      return next;
    });

  return (
    <section className="section" id="services" ref={sectionRef}>
      <div className="svc-wrap">
        <div className="section-head rise svc-intro">
          <h2 className="section-title">
            Surfaces for every <em>space</em>
          </h2>
          <p className="section-sub">
            {/*
              Two lengths of the same paragraph, both always in the DOM.
              site.css swaps them at 720px (`#services .svc-sub-long
              {display:none}`) rather than truncating with JS, so the short
              copy is a real, separately-written sentence — not the long one
              cut off.
            */}
            <span className="svc-sub-long">
              Whatever you are imagining, a kitchen worth gathering in, a
              bathroom that feels like a retreat, a workspace that means
              business, Topcat brings it to life in stone. Every surface is
              templated and fitted by our own team, cut to that template by our
              experienced fabricators, so the finish you fall for is the finish
              you live with. Choose a space and picture yours.
            </span>
            <span className="svc-sub-short">
              Kitchens, bathrooms, workspaces and more, brought to life in
              stone. Templated and fitted by our own team, cut to that template
              by our experienced fabricators. Choose a space and picture yours.
            </span>
          </p>

          <div
            className="svc-nav"
            id="svcNav"
            role="tablist"
            aria-label="Our services"
          >
            {HELIX_ORDER.map((idx) => (
              <button key={SERVICES[idx].t} type="button" role="tab">
                {SERVICES[idx].t}
              </button>
            ))}
          </div>

          <div className="svc-intro-ctas">
            <a className="rev-cta-primary" href="#cta">
              Get in touch
            </a>
            <a className="rev-cta-ghost" href="tel:+448000982812">
              Call us
            </a>
          </div>
        </div>

        <div className="svc-helix" id="svcHelix" aria-label="Service showcase">
          <div className="helix-stage" id="helixStage" />
          <div className="helix-ui">
            <button className="wbtn" id="helixPrev" aria-label="Previous service">
              <svg viewBox="0 0 24 24">
                <path d="M15 5l-7 7 7 7" />
              </svg>
            </button>
            <button className="wbtn" id="helixNext" aria-label="Next service">
              <svg viewBox="0 0 24 24">
                <path d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="services-grid" id="svcGridServices" ref={gridRef}>
        {SERVICES.map((s, i) => {
          const idx = '0' + (i + 1);
          const responsive = srcSet(s.img, '(max-width:720px) 440px, 1160px');
          return (
            <article
              key={s.href}
              className={'svc enter' + (flipped.has(i) ? ' flipped' : '')}
              tabIndex={0}
              style={{ ['--d' as string]: i * 150 + 'ms' }}
              onClick={() => toggle(i)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  toggle(i);
                }
              }}
            >
              <div className="svc-inner">
                <div className="face front">
                  <div className="stone">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={s.img}
                      {...responsive}
                      alt={s.t}
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                  <div className="veil" />
                  <div className="sheen" />
                  <div className="front-text">
                    <div className="idx">{idx}</div>
                    <div className="ft-bottom">
                      <h3>{s.t}</h3>
                      <span className="flip-hint">
                        {FLIP_ICON} Click for details
                      </span>
                    </div>
                  </div>
                </div>

                <div className="face back">
                  <div className="stone">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={s.img}
                      {...responsive}
                      alt=""
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                  <div className="veil" />
                  <div className="back-text">
                    <div className="idx">{idx}</div>
                    <h3>{s.t}</h3>
                    <p>{s.long}</p>
                    <a
                      className="svc-more"
                      href={s.href}
                      /* The card itself flips on click; the link must not. */
                      onClick={(e) => e.stopPropagation()}
                    >
                      Read more {MORE_ICON}
                    </a>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <p className="svc-catchall">
        Not seeing your space here? <a href="#cta">Contact us</a>
      </p>
    </section>
  );
}

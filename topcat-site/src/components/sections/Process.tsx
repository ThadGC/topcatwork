'use client';

import { useEffect, useRef, useState } from 'react';

import { PROCESS, PROC_COPY, PROC_DETAIL } from '@/data/home/process';
import { srcSet } from '@/data/home/srcset';
import { useCursorGlow } from '@/hooks/useCursorGlow';
import { useReveal } from '@/hooks/useReveal';
import { useWeld } from '@/hooks/useWeld';

/**
 * `section.section#process` — index.html:4033, with `#procFlow` built from
 * PROCESS/PROC_COPY (site.js:202-241) and the detail modal from PROC_DETAIL.
 *
 * FIVE TILES, NOT FOUR. The four steps are followed by an aftercare banner
 * (`.pt-e`) that carries no image and is not clickable. `#procFlow` is a
 * 12-column grid with named areas `a b c / d e` (site.css:1057), so the tiles
 * must be emitted in source order with the `pt-a`…`pt-e` classes — the class
 * *is* the placement.
 *
 * `.ptile` starts at `opacity:0` and only reveals once `#procFlow` carries
 * `.flow`, which is why the reveal below is not the shared `.rise` observer:
 * a single class on the container releases all five tiles and the three
 * arrows together, with the per-tile `--td` stagger doing the rest.
 */

/** site.js:322 — flow on at 0.80 of viewport height, off again past 0.97. */
const PR_ON = 0.8;
const PR_OFF = 0.97;

/** site.js:226 — arrows sit between these tile pairs. */
const ARROW_PAIRS: readonly (readonly [number, number])[] = [
  [0, 1],
  [1, 2],
  [3, 4],
];

const AREAS = ['pt-a', 'pt-b', 'pt-c', 'pt-d'] as const;

export default function Process() {
  const sectionRef = useReveal<HTMLElement>();
  const flowRef = useRef<HTMLDivElement | null>(null);
  const [detail, setDetail] = useState<number | null>(null);
  const lastFocus = useRef<Element | null>(null);

  useCursorGlow(flowRef, '.ptile');

  /*
    THE WELD — assets/site.js:4441-4573, ported in `useWeld`.

    It lives here rather than in <About/> because the source's IIFE is anchored
    on `#process`: it pins this section, measures its height, and observes it.
    The hook looks both sections up by id exactly as the source does, so
    <About/> needs no change and `useAboutHinge` is untouched.

    Desktop-only (>=1121px) and a no-op under reduced motion; both gates are
    inside the hook, matching the media queries the ported CSS already uses
    (src/styles/home-sections.css:1899).
  */
  useWeld();

  /* --------------------------------------------------- flow + arrows */

  useEffect(() => {
    const flow = flowRef.current;
    if (!flow) return;

    /**
     * site.js:236 `measure` — the arrows are absolutely positioned into the
     * gutters between tiles, and the gutter is a `clamp()` of viewport width,
     * so their position can only be measured, never authored. Below 980px the
     * grid becomes a single column and `.pt-arrow` is `display:none`, which
     * is why the source bails out early rather than measuring garbage.
     */
    const measure = () => {
      if (window.innerWidth <= 980) return;
      const tiles = Array.from(flow.querySelectorAll<HTMLElement>('.ptile'));
      flow.querySelectorAll<HTMLElement>('.pt-arrow').forEach((el, k) => {
        const [li, ri] = ARROW_PAIRS[k];
        const L = tiles[li];
        const R = tiles[ri];
        if (!L || !R) return;
        el.style.left =
          (L.offsetLeft + L.offsetWidth + R.offsetLeft) / 2 + 'px';
        el.style.top = L.offsetTop + L.offsetHeight / 2 + 'px';
      });
    };

    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      flow.classList.add('flow', 'still');
      measure();
      return;
    }

    let on = false;
    const check = () => {
      const topFrac =
        flow.getBoundingClientRect().top / (window.innerHeight || 1);
      if (!on && topFrac < PR_ON) {
        on = true;
        flow.classList.add('flow');
      } else if (on && topFrac > PR_OFF) {
        on = false;
        flow.classList.remove('flow');
      }
    };

    // site.js:328 — the grid can be zero-width on first paint (fonts, images
    // still settling); retry until it has a box to measure.
    // Undefined until `boot()` first retries — which, now that boot is armed
    // rather than run at mount, may never happen at all.
    let timer: ReturnType<typeof setTimeout> | undefined;
    const boot = () => {
      if (!flow.clientWidth) {
        timer = setTimeout(boot, 120);
        return;
      }
      measure();
      check();
    };
    const onResize = () => {
      measure();
      check();
    };

    /*
      ARMED, NOT RUN AT MOUNT — the same deferral as Services', for the same
      measured reason and with the same shape.

      `check()` reads `#procFlow`'s `getBoundingClientRect()` on every scroll
      event. The in-page probe on the S21 Ultra counted 3,745 of those calls in
      14.4s — 207ms of forced layout — four per event from the non-film
      modules, and this was one of the four, for a section that sits below
      Services, itself ~5,700px below the fold behind the 800vh film runway.
      `boot()` also reads `clientWidth` at mount, inside the same hydration
      commit the film is starting in (long tasks at 98ms and 170ms, first
      scroll at 563ms).

      Nothing about the behaviour moves: `boot()`'s zero-width retry, the 0.72
      / 0.92 thresholds and both listeners are identical, and once armed they
      stay for the page's life. A viewport and a half of margin against a
      trigger at 0.72 of a viewport means the flow is always measured before it
      can be seen. `measure()` is a no-op below 980px in any case — the arrows
      it positions are `display:none` there — so on the phone this removes a
      per-scroll rect read and nothing else.
    */
    let armed = false;
    let io: IntersectionObserver | null = null;

    const arm = () => {
      if (armed) return;
      armed = true;
      io?.disconnect();
      io = null;
      boot();
      window.addEventListener('scroll', check, { passive: true });
      window.addEventListener('resize', onResize);
    };

    if (typeof IntersectionObserver !== 'undefined') {
      io = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) arm();
        },
        { rootMargin: '150% 0px' },
      );
      io.observe(flow);
    } else {
      arm();
    }

    return () => {
      io?.disconnect();
      clearTimeout(timer);
      window.removeEventListener('scroll', check);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  /* ---------------------------------------------------------- modal */

  const open = (i: number) => {
    lastFocus.current = document.activeElement;
    setDetail(i);
  };

  useEffect(() => {
    if (detail === null) return;
    // site.js:298 — the page behind the modal must not scroll.
    document.documentElement.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDetail(null);
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.documentElement.style.overflow = '';
      document.removeEventListener('keydown', onKey);
      const back = lastFocus.current;
      if (back instanceof HTMLElement && back !== document.body) back.focus();
    };
  }, [detail]);

  const d = detail === null ? null : PROC_DETAIL[detail];
  const p = detail === null ? null : PROCESS[detail];

  return (
    <section className="section" id="process" ref={sectionRef}>
      <div className="section-head rise">
        <h2 className="section-title">
          A process without <em>surprises</em>
        </h2>
        <p className="section-sub">
          From first visit to finished worktop, four simple steps.
        </p>
      </div>

      <div className="proc-flow" id="procFlow" ref={flowRef}>
        {PROCESS.map((step, i) => (
          <article
            key={step.t}
            className={'ptile glow-card ' + AREAS[i]}
            role="button"
            tabIndex={0}
            aria-label={step.t + ', read more about this step'}
            onClick={() => open(i)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                open(i);
              }
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={step.img}
              {...srcSet(step.img, '(max-width:720px) 345px, 515px')}
              alt={step.t}
              draggable={false}
              loading="lazy"
              decoding="async"
            />
            <div className="pt-scrim" />
            <div className="sheen" />
            <span className="pt-pill">{i + 1}</span>
            <div className="pt-text">
              <h3 className="pt-name">{step.t}</h3>
              <p className="pt-line">{PROC_COPY[i]}</p>
              <span className="pt-more">
                Read more <span aria-hidden="true">&rsaquo;</span>
              </span>
            </div>
          </article>
        ))}

        {/* The fifth tile: aftercare. No image, no click target. */}
        <article className="ptile glow-card pt-e">
          <span className="pt-pill">5</span>
          <span className="pe-label">Aftercare</span>
          <div className="pe-big">
            <b>72h</b>
            <span>on site again if anything needs attention</span>
          </div>
          <span className="pe-sep" aria-hidden="true" />
          <div className="pe-item">
            <b>10-year</b>
            <span>guarantee, in writing</span>
          </div>
        </article>

        {ARROW_PAIRS.map((_, k) => (
          <span
            key={k}
            className="pt-arrow"
            aria-hidden="true"
            /* site.js:231 — 0.6s, then 0.25s apart, so they chase the tiles. */
            style={{ ['--ad' as string]: 0.6 + k * 0.25 + 's' }}
          >
            {'›'}
          </span>
        ))}
      </div>

      <div className="rev-cta section-cta">
        <p className="rev-cta-line">
          Start with a free home visit. We take it from there.
        </p>
        <div className="rev-cta-btns">
          <a className="rev-cta-primary" href="#cta">
            Get in touch
          </a>
          <a className="rev-cta-ghost" href="tel:+448000982812">
            Call us
          </a>
        </div>
      </div>

      {/* ---------------------------------------------------- the modal */}
      <div
        className={'pmodal' + (detail !== null ? ' open' : '')}
        id="procModal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pmTitle"
        hidden={detail === null}
      >
        <div className="pmodal-veil" onClick={() => setDetail(null)} />
        <div className="pmodal-card">
          <button
            type="button"
            className="pm-x"
            aria-label="Close"
            onClick={() => setDetail(null)}
            /* site.js:299 — focus moves to the close button on open. */
            ref={(node) => {
              if (node && detail !== null) node.focus();
            }}
          >
            &times;
          </button>
          <div className="pm-shot">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {/* Rendered only when a card is open. It used to be here always,
                with `src={undefined}` — a src-less <img> sitting in the DOM of
                every page that carries this section, which the 27 Aug image
                audit picked up as a broken image on five pages. Nothing else
                references `#pmShot`. */}
            {p ? <img alt={p.t} id="pmShot" src={p.img} draggable={false} /> : null}
            <span className="pm-badge" id="pmBadge">
              {detail === null ? '' : String(detail + 1)}
            </span>
          </div>
          <div className="pm-body">
            <h3 className="pm-title" id="pmTitle">
              {p?.t ?? ''}
            </h3>
            <p className="pm-lede" id="pmLede">
              {d?.lede ?? ''}
            </p>
            <ul className="pm-points" id="pmPoints">
              {d?.points.map(([k, v]) => (
                <li key={k}>
                  <span className="pk">{k}</span>
                  <span className="pv">{v}</span>
                </li>
              ))}
            </ul>
            {/* The two CTAs that used to close this panel are gone, on every
                band. The client, 27 Aug: "there also doesn't need to be a CTA
                inside it, so you can remove it for all devices — the CTA
                inside the flippable cards for the process section." The
                section's own `.rev-cta` below the tiles is untouched; this
                panel is a detail view, not a place to be sold to. */}
          </div>
        </div>
      </div>
    </section>
  );
}

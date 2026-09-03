'use client';

import { useEffect, useRef, useState } from 'react';

import { SERVICES } from '@/data/home/services';
import { srcSet } from '@/data/home/srcset';
import { useCursorGlow } from '@/hooks/useCursorGlow';
import { useReveal } from '@/hooks/useReveal';
import { useServiceHelix } from '@/hooks/useServiceHelix';
import { viewportHeight } from '@/lib/viewportHeight';

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

/**
 * `sizes` for the eight card photographs.
 *
 * THE LEGACY STRING WAS WRONG FOR THE LEGACY LAYOUT, which is why this is a
 * fidelity fix and not a quality trade. site.js declared
 * `(max-width:720px) 440px, 1160px` — a 440px slot on a 384px-wide handset is
 * wider than the viewport, so it cannot describe any two-column grid, and it
 * is what put 1,863,538 B of below-the-fold stone on the wire ahead of the
 * film's own poster while the visitor was still watching the hero.
 *
 * WHAT THE CASCADE ACTUALLY RESOLVES TO, read off the stylesheet rather than
 * guessed. `home-sections.css:109` puts `#services .services-grid` at one
 * column below 600px, but `home-sections.css:524` — a LATER `@media
 * (max-width:720px)` block of equal specificity — overrides it back to
 * `repeat(2,1fr)` with `gap:10px`, `max-width:none` and `padding:0`. Later
 * wins, so every phone gets two columns, not one. The grid sits inside
 * `.section`'s `clamp(20px,5vw,64px)` side padding (home-sections.css:18), so
 * a column is exactly
 *
 *     (100vw - 2 * clamp(20px,5vw,64px) - 10px) / 2
 *
 * which is 45vw - 5px for any viewport at or above 400px and less than that
 * below it. `45vw` is therefore a tight upper bound over the whole band and
 * never under-declares: 167 CSS px at 384px wide, 319 at 720. It is written as
 * a bare `vw` and not as that `calc(clamp(...))` on purpose — a `sizes` entry
 * a browser cannot parse is dropped, and the fallback is 100vw, which would
 * pick a LARGER rung than we ship today.
 *
 * WHICH RUNG THAT PICKS. 167 CSS px at dpr 3.75 is 626 device px; the cover
 * crop (a 1.5 photograph in the 1.38 box at `home-sections.css:527`) plus
 * `.stone`'s scale takes the painted requirement to ~708. The ladder's bottom
 * rung is 880w — still 1.24x supersampled — where 440px asked for 1650 and
 * pulled 2400w, 3.4x the linear resolution the screen can resolve.
 *
 * THE NUMBER. Of the eight cards, six are fetched before the film's poster is
 * requested (device log, t=527-678ms): 1,863,538 B at the 2400/1550/1200 rungs
 * against 363,758 B at 880w. 1,499,780 B saved off the front of the waterfall,
 * 1,947,290 B across all eight.
 *
 * THE VISUAL COST WAS CHECKED, NOT ASSUMED: rendered through the exact crop
 * and scale the phone performs, 880w scores SSIM 0.878-0.922 against the 2400w
 * render, 0.797 on `outdoor`, the noisiest. That gap is a resampling
 * difference above the display's Nyquist limit rather than detail the screen
 * can show. If a reviewer wants the 1600w rung held anyway (SSIM 0.958-0.981,
 * 838,164 B saved instead of 1,499,780), declare `90vw` here and change
 * nothing else.
 */
const CARD_SIZES = '(max-width:720px) 45vw, 1160px';

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
function useServicesReveal(
  gridRef: React.RefObject<HTMLDivElement | null>,
  /** `/services/` — the hub. No entrance; the cards are simply there. */
  still = false,
) {
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    const cards = Array.from(grid.querySelectorAll<HTMLElement>('.svc'));
    if (!cards.length) return;

    /* ⛔ THE HUB DOES NOT PLAY THE ENTRANCE. Client, 3 Sep 2026: "when I open
       up on the main services tab there shouldn't be an animation … just
       remove the intro animation from that section", and then, explicitly:
       "they only mean that for the inner services main page, not the landing
       page. Landing page can stay the same."

       This takes the SAME path the reduced-motion branch already takes rather
       than adding a second way to end up static — one exit, two reasons. */
    if (still || matchMedia('(prefers-reduced-motion: reduce)').matches) {
      cards.forEach((el) => {
        el.classList.remove('enter');
        el.style.opacity = '1';
      });
      return;
    }

    const dress = () => {
      cards.forEach((el, i) => {
        el.classList.remove('enter');
        el.classList.add('svc-rev');
        el.style.setProperty('--si', String(i));
      });
    };

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
      /* Layout viewport: a chrome-driven innerHeight step is ~10% of the
         viewport and can cross this latch's threshold on its own. */
      const topFrac = grid.getBoundingClientRect().top / viewportHeight();
      if (!shown && topFrac < SVC_ON) {
        shown = true;
        cards.forEach((el) => el.classList.add('revealed'));
      } else if (shown && topFrac > SVC_OFF) {
        shown = false;
        cards.forEach((el) => el.classList.remove('revealed'));
      }
    };

    /* rAF-batched so a burst of scroll events costs ONE forced layout per
       frame instead of one per event. `check()` reads getBoundingClientRect
       and then writes a class, which is the read-then-write pattern that makes
       the browser recalculate the document synchronously. */
    let raf = 0;
    const request = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        check();
      });
    };

    const onResize = () => {
      measure();
      check();
    };

    /*
      THE ENTRANCE IS ARMED, NOT RUN AT MOUNT — and everything below this line
      is a delay, not a change: the same `dress`, `measure`, `check` and the
      same two listeners, started when the grid is a viewport and a half away
      instead of during hydration.

      Three measured reasons, all on the S21 Ultra (384x722 CSS, dpr 3.75):

       1. `measure()` writes `transform`, reads `getBoundingClientRect()`,
          writes again and then reads `offsetWidth` to force the reflow back —
          per card, for eight cards. Eight forced synchronous layouts of a
          1,701-element document, landing inside React's passive-effect flush,
          on the same main thread the film is trying to open its first byte
          range on. The in-page probe caught hydration as two long tasks, 98ms
          and 170ms, both before `firstScrollAt: 563ms`.
       2. `check()` was on `window.scroll` from mount. The probe counted 3,745
          `getBoundingClientRect()` calls over 14.4s (207ms of forced layout),
          four per scroll event from the non-film modules, and this was one of
          the four — for a section that is ~5,700px below the fold behind an
          800vh film runway.
       3. `.svc-rev` carries `will-change:transform,opacity`
          (home-sections.css:560,586) and nothing ever takes it off. Adding it
          at mount promotes eight below-the-fold cards to their own compositor
          layers for the whole intro, next to the video's layer.

      `--svcFrom` is measured later rather than at hydration, which is if
      anything more correct — fonts and images have settled by then. (Below
      600px it is not even read: home-sections.css:558 replaces the transform
      with a small translate+scale.) The cards keep their SSR `.enter` state,
      which is `opacity:0`, until `dress()` swaps in `.svc-rev`, which is also
      `opacity:0` — so there is no frame in which they are visible unstyled.

      One viewport and a half of margin, against a reveal that triggers at 0.78
      of a viewport (SVC_ON), so the grid is always dressed and measured long
      before it can be seen. Once armed nothing is torn down: the listeners
      live for the page's life exactly as they did before.
    */
    let armed = false;
    let io: IntersectionObserver | null = null;

    const arm = () => {
      if (armed) return;
      armed = true;
      io?.disconnect();
      io = null;
      dress();
      measure();
      check();
      window.addEventListener('scroll', request, { passive: true });
      window.addEventListener('resize', onResize);
    };

    if (typeof IntersectionObserver !== 'undefined') {
      io = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) arm();
        },
        { rootMargin: '150% 0px' },
      );
      io.observe(grid);
    } else {
      // No IntersectionObserver: behave exactly as before. Failing to the old
      // behaviour is the only safe direction — undressed cards stay at
      // `opacity:0`, which is eight blank tiles.
      arm();
    }

    return () => {
      io?.disconnect();
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener('scroll', request);
      window.removeEventListener('resize', onResize);
    };
  }, [gridRef, still]);
}

/**
 * PHONE TAPS NAVIGATE; WIDER CLICKS FLIP — site.js:364-392.
 *
 * The source registers a CAPTURE-phase interceptor on the grid. Below 720px
 * (`--svcMode: phone`, the CSS->JS channel already declared at
 * home-sections.css:525) a tap on a card must go to that service page; the
 * flip only exists at tablet and desktop. Capture phase is what lets it beat
 * the card's own flip handler.
 *
 * Without this the port flipped on every device, so a phone tap turned the
 * card over instead of opening the page — which reads as the card vanishing.
 *
 * `label()` mirrors site.js:383-390: on phone each card is announced as a
 * link, because that is what it behaves as.
 */
function usePhoneCardLinks(gridRef: React.RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    const svcMode = () =>
      getComputedStyle(grid).getPropertyValue('--svcMode').trim() || 'desktop';

    const cards = () => Array.from(grid.children);

    const hrefFor = (card: Element) => {
      const i = cards().indexOf(card);
      return i >= 0 && SERVICES[i] ? SERVICES[i].href : null;
    };

    const intercept = (e: Event) => {
      if (svcMode() !== 'phone') return;
      const target = e.target as HTMLElement | null;
      const card = target?.closest?.('.svc');
      if (!card || !grid.contains(card)) return;
      /* A real link inside the card keeps its own behaviour. site.js:372. */
      if (target?.closest('a')) return;
      const href = hrefFor(card);
      if (!href) return;
      e.stopPropagation();
      e.preventDefault();
      location.href = href;
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      intercept(e);
    };

    const label = () => {
      const phone = svcMode() === 'phone';
      cards().forEach((el, i) => {
        const s = SERVICES[i];
        if (phone && s?.href) {
          el.setAttribute('role', 'link');
          el.setAttribute('aria-label', s.t);
        } else {
          el.removeAttribute('role');
          el.removeAttribute('aria-label');
        }
      });
    };

    grid.addEventListener('click', intercept, true);
    grid.addEventListener('keydown', onKeyDown, true);
    label();
    window.addEventListener('resize', label, { passive: true });

    return () => {
      grid.removeEventListener('click', intercept, true);
      grid.removeEventListener('keydown', onKeyDown, true);
      window.removeEventListener('resize', label);
    };
  }, [gridRef]);
}

export interface ServicesProps {
  /**
   * `/services/` — the hub, where this section is the page's own opening and
   * not something the visitor scrolls down to. The heading and the cards are
   * painted in place with no entrance.
   *
   * The landing page passes nothing and is untouched: there the section sits
   * below the film and the entrance is part of the page arriving.
   *
   * Named to match `<Reviews inner />`, which already draws the same
   * distinction on the same pages.
   */
  readonly inner?: boolean;
}

export default function Services({ inner = false }: ServicesProps = {}) {
  const sectionRef = useReveal<HTMLElement>();
  const gridRef = useRef<HTMLDivElement | null>(null);
  const helixRef = useRef<HTMLDivElement | null>(null);
  const [flipped, setFlipped] = useState<ReadonlySet<number>>(new Set());

  useServicesReveal(gridRef, inner);
  usePhoneCardLinks(gridRef);
  useServiceHelix(helixRef);
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
        {/* `.rise` is opacity:0 + translateY until the observer adds `.in`.
            Dropping it on the hub is what makes the heading and the lede
            simply present at first paint, which is what he asked for. */}
        <div className={`section-head${inner ? '' : ' rise'} svc-intro`}>
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
          <div className="helix-stage" id="helixStage" ref={helixRef}>
            {HELIX_ORDER.map((idx) => {
              const s = SERVICES[idx];
              const responsive = srcSet(s.img, '(max-width:720px) 210px, 385px');
              return (
                <article
                  key={s.href}
                  className="helix-card"
                  role="group"
                  aria-label={s.t}
                >
                  <div className="hx-face hx-front glow-card">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={s.img}
                      {...responsive}
                      alt={s.t}
                      draggable={false}
                      loading="lazy"
                      decoding="async"
                    />
                    <div className="hx-veil" />
                    <div className="hx-meta">
                      <h3 className="hx-name">{s.t}</h3>
                      <a className="hx-link" href={s.href}>
                        View this service
                      </a>
                    </div>
                  </div>
                  <div className="hx-face hx-back glow-card">
                    <div className="hx-back-frame">
                      <span className="hx-back-diamond" />
                      <span className="hx-back-word">Topcat</span>
                      <span className="hx-back-sub">Worktops</span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
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
          const responsive = srcSet(s.img, CARD_SIZES);
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
                  {/*
                    THE SECOND COPY OF THE PHOTOGRAPH IS NOT A BUG, and it is
                    not free to remove. `.face` is `backface-visibility:hidden`,
                    so the two halves of the flip are separate painted planes;
                    site.css gives them different treatments (`.face.front
                    .stone` sits at full opacity under a mid-transparent veil,
                    `.face.back .stone` at 0.20 under a near-opaque one), which
                    one shared element cannot satisfy. Sixteen <img> elements
                    for eight photographs is the flip card's real shape.

                    It costs no bytes. Both elements carry the same `src`, the
                    same `srcSet` and the same `sizes`, so they resolve to one
                    URL and the image cache serves one fetch — the device log
                    confirms it: six distinct service files, six requests, no
                    repeats. (The one URL that does appear twice in that log,
                    topcat-vertical.svg, is an artefact of the test server's
                    `Cache-Control: no-store`; SiteGround does not send that.)
                  */}
                  <div className="stone">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={s.img}
                      {...responsive}
                      alt=""
                      aria-hidden="true"
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

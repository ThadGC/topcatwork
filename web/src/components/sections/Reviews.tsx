'use client';

import { REVIEWS } from '@/data/home/reviews';
import { useCursorGlow } from '@/hooks/useCursorGlow';
import { useReveal } from '@/hooks/useReveal';
import { useReviewDeck } from '@/hooks/useReviewDeck';

/**
 * `section.section.mode-grid#reviews` — index.html:3700.
 *
 * Fifteen Google reviews. The card markup is site.js:1466's template; the
 * copy is `REVIEWS`, filtered and lifted by scripts/extract-home-data.mjs.
 *
 * SERVER-RENDERED, UNLIKE THE LEGACY PAGE. The source ships
 * `<div class="rev-deck" id="revDeck"></div>` and builds the cards from a JS
 * array at runtime, so the reviews are invisible to anything that does not
 * execute scripts. Rendering them in the tree costs nothing — the layout is
 * still JS (see useReviewDeck) but the text is in the HTML.
 *
 * `.rev-stone` stays empty. On the legacy page `marbleFill()` paints a
 * procedural marble into it; that generator belongs to the stone renderer and
 * is not part of this composition. `.rev-stone::after` supplies a gradient
 * over it either way, so an unfilled stone reads as a dark card rather than a
 * hole.
 */
export default function Reviews() {
  const { sectionRef, deckRef, page, pagerDisabled, toggleExpand } =
    useReviewDeck(REVIEWS.length);
  const revealRef = useReveal<HTMLElement>();
  useCursorGlow(deckRef, '.rev');

  return (
    <section
      className="section mode-grid"
      id="reviews"
      ref={(node) => {
        sectionRef.current = node;
        revealRef.current = node;
      }}
    >
      <div className="section-head rise">
        <h2 className="section-title">
          Hear it from your <em>neighbours</em>
        </h2>
        <p className="section-sub">
          Real, unedited Google reviews from across London and the Home
          Counties, rated 5.0 across the board.
        </p>
      </div>

      <div className="rev-stage" id="revStage">
        <div className="rev-deck" id="revDeck" ref={deckRef}>
          {REVIEWS.map((r, i) => (
            <article
              className="rev"
              key={r.n + i}
              data-i={i}
              tabIndex={0}
              /*
                `data-full` is the untruncated quote. fitQuote reads it back
                every time it re-clamps, so it must survive the truncation it
                writes into `.qt` — which is why the full text lives on the
                attribute and not only in the paragraph.
              */
              data-full={r.q}
            >
              <div className="rev-inner">
                <div className="rev-face front">
                  <div className="rev-stone" data-marble={4100 + i * 7} />
                  <div className="rev-front">
                    <div className="rev-top">
                      <div className="stars">★★★★★</div>
                      <span className="rev-src">Google review</span>
                    </div>
                    <p className="quote">
                      {/*
                        Server render carries the full quote so it is in the
                        HTML; fitQuote replaces this text node with the
                        truncated form on mount.
                      */}
                      <span className="qt">{'“' + r.q + '”'}</span>
                      <button
                        type="button"
                        className="rev-more"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleExpand(i);
                        }}
                      >
                        Read more
                      </button>
                    </p>
                    <div className="rev-foot">
                      {/*
                        The Stone-Grade Seal at signature size: the SAME
                        200-unit geometry as the mark in the About section
                        (two rings, plumb line, head, tail, diamond), not a
                        redrawn approximation. Stroke widths are non-scaling
                        (see .rev-seal *), so they are read as rendered px and
                        stay hairline instead of scaling to a blob.
                      */}
                      <svg
                        className="rev-seal"
                        viewBox="0 0 200 200"
                        fill="none"
                        aria-hidden="true"
                      >
                        <g stroke="currentColor">
                          <circle cx="100" cy="100" r="92" strokeWidth="0.55" />
                          <circle
                            cx="100"
                            cy="100"
                            r="84"
                            strokeWidth="0.45"
                            opacity="0.65"
                          />
                          <path
                            d="M100 44 L100 96"
                            strokeWidth="0.9"
                            strokeLinecap="round"
                          />
                          <path
                            d="M78 96 L122 96 L100 124 Z"
                            strokeWidth="0.9"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M100 124 L100 150"
                            strokeWidth="0.9"
                            strokeLinecap="round"
                          />
                          <rect
                            x="93"
                            y="131"
                            width="14"
                            height="14"
                            transform="rotate(45 100 138)"
                            strokeWidth="0.7"
                          />
                        </g>
                      </svg>
                      <div className="rev-author">{r.n}</div>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        <button
          className="rev-page prev"
          id="revPagePrev"
          aria-label="Previous reviews"
          disabled={pagerDisabled}
          onClick={() => page(-1)}
        >
          <svg viewBox="0 0 24 24">
            <path d="M15 5l-7 7 7 7" />
          </svg>
        </button>
        <button
          className="rev-page next"
          id="revPageNext"
          aria-label="Next reviews"
          disabled={pagerDisabled}
          onClick={() => page(1)}
        >
          <svg viewBox="0 0 24 24">
            <path d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <div className="rev-cta">
        <p className="rev-cta-line">
          Like what you&apos;re reading?
          <a className="rev-cta-go" href="#cta">
            Tell us about your kitchen
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M4 12h15" />
              <path d="m13 6 6 6-6 6" />
            </svg>
          </a>
        </p>
      </div>
    </section>
  );
}

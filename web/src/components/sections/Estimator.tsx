'use client';

import TcUpload from '@/components/forms/TcUpload';
import { useReveal } from '@/hooks/useReveal';

/**
 * `section.section#estimator` — index.html:3881. The price calculator.
 *
 * This file is the calculator's SHELL, copied out of index.html without a
 * word changed: the material tabs, the quick-start kitchen shapes, the five
 * extras with their sub-labels, the edge-profile picker, the "priced by hand"
 * panel for marble and quartzite, the cutting-plan preview and the two
 * footnotes. All of it is static markup in the source too.
 *
 * WHAT IS NOT HERE: the pricing engine. `#estRows`, `#estBoard` and the
 * `#estModal` body are filled at runtime, and the numbers in `.est-price`,
 * `.est-stats` and `.est-meta` are placeholders that site.js overwrites on
 * the first recalculation — they are reproduced exactly as the source ships
 * them, including the en-dashes and the `–` in the stat slots, so the panel
 * has correct metrics before the engine attaches. The engine itself (slab
 * packing, joint placement, the per-material rate card) is separate work.
 *
 * `hidden` attributes are kept where the source has them: `#estPoa`,
 * `#estEdgePanel`, `#estLmWrap`, `#estJnote`, `#estAdds` and `#estModal` are
 * all closed on load and opened by the engine.
 *
 * THE TWO DROPZONES ARE <TcUpload/>, NOT `div.tc-up[data-up]`. They are empty
 * divs in the source because site.js:3521 `mountUpload()` finds every
 * `.tc-up[data-up]` and writes the widget into it with innerHTML. That is
 * ported to React, so the marker attribute is deliberately NOT emitted — an
 * un-ported site.js landing later would otherwise blow away a React subtree.
 *
 * Both roots share ONE file list, exactly as the legacy `TC_UP` singleton
 * does: a file dropped on the compact one inside the calculator is the same
 * file the "priced by hand" panel shows, and it is the list `TC_FORM_EXTRA`
 * posts as `file1`…`fileN`. See src/lib/form/uploads.ts.
 */
export default function Estimator() {
  const ref = useReveal<HTMLElement>();

  return (
    <>
      <section className="section" id="estimator" ref={ref}>
        <div className="section-head rise">
          <h2 className="section-title">
            What would yours <em>cost</em>?
          </h2>
          <p className="section-sub">
            Type in your sizes, straight off the tape, and watch them laid out
            on real slabs. An honest range in seconds, no forms and no phone
            number, with your exact price after a free home visit.
          </p>
        </div>

        <div className="est-grid">
          <div className="est-panel glow-card rise" id="estPanel">
            <div className="est-block">
              <div className="est-labelrow">
                <span className="est-k">Material</span>
                <span className="est-hint">Engineered or natural</span>
              </div>
              <div className="est-tabs" id="estTabs">
                <button
                  className="mat-tab on"
                  data-mat="Quartz"
                  type="button"
                  aria-pressed="true"
                >
                  Quartz
                </button>
                <button
                  className="mat-tab"
                  data-mat="Marble"
                  type="button"
                  aria-pressed="false"
                >
                  Marble &amp; Quartzite
                </button>
                <button
                  className="mat-tab"
                  data-mat="Granite"
                  type="button"
                  aria-pressed="false"
                >
                  Granite
                </button>
                <button
                  className="mat-tab"
                  data-mat="Porcelain"
                  type="button"
                  aria-pressed="false"
                >
                  Porcelain
                </button>
              </div>
              <button
                className="est-stonebtn"
                id="estStoneBtn"
                type="button"
                aria-haspopup="dialog"
              >
                <span className="est-swatch" id="estSwatch" aria-hidden="true" />
                <span className="est-stonetxt">
                  <b id="estStoneName">&ndash;</b>
                  <small id="estStoneSup">&ndash;</small>
                </span>
                <span className="est-change" aria-hidden="true">
                  Change
                </span>
              </button>
            </div>

            <div id="estCalc">
              <div className="est-block">
                <div className="est-labelrow">
                  <span className="est-k">Your worktops</span>
                  <span className="est-hint">
                    Most kitchens are two or three pieces
                  </span>
                </div>
                <div
                  className="est-quick"
                  id="estQuick"
                  role="group"
                  aria-label="Quick-start kitchen shapes"
                >
                  <button
                    className="est-chip"
                    data-shape="straight"
                    type="button"
                    aria-pressed="false"
                  >
                    Straight
                  </button>
                  <button
                    className="est-chip"
                    data-shape="lshape"
                    type="button"
                    aria-pressed="false"
                  >
                    L-shape
                  </button>
                  <button
                    className="est-chip"
                    data-shape="ushape"
                    type="button"
                    aria-pressed="false"
                  >
                    U-shape
                  </button>
                  <button
                    className="est-chip"
                    data-shape="galley"
                    type="button"
                    aria-pressed="false"
                  >
                    Galley
                  </button>
                  <button
                    className="est-chip"
                    id="estIsland"
                    type="button"
                    aria-pressed="false"
                  >
                    + Island
                  </button>
                </div>
                <div className="est-rows" id="estRows" />
                <div className="est-rowfoot">
                  <button className="est-add" id="estAdd" type="button">
                    <span className="est-addplus" aria-hidden="true">
                      +
                    </span>
                    <span className="est-addtxt">Add another piece</span>
                  </button>
                  <span className="est-mm">
                    Sizes in millimetres, 3000&thinsp;mm = 3&thinsp;m
                  </span>
                </div>
              </div>

              <div className="est-block">
                <div className="est-labelrow">
                  <span className="est-k">The extras</span>
                  <span className="est-hint">Toggle what applies</span>
                </div>
                <div className="est-extras">
                  <label className="est-extra">
                    <input type="checkbox" id="exWaterfall" />
                    <span className="est-sw" aria-hidden="true" />
                    <span className="est-xname">
                      Waterfall island ends
                      <small>Mitred stone folded to the floor</small>
                    </span>
                  </label>
                  <label className="est-extra">
                    <input type="checkbox" id="exSplash" />
                    <span className="est-sw" aria-hidden="true" />
                    <span className="est-xname">
                      Full-height splashback
                      <small>The same stone, run up the wall</small>
                    </span>
                  </label>
                  <label className="est-extra">
                    <input type="checkbox" id="exSill" />
                    <span className="est-sw" aria-hidden="true" />
                    <span className="est-xname">
                      Window sill
                      <small>Cut and finished in the same stone</small>
                    </span>
                  </label>
                  <label className="est-extra">
                    <input type="checkbox" id="exRemoval" />
                    <span className="est-sw" aria-hidden="true" />
                    <span className="est-xname">
                      Old worktop removal
                      <small>Taken out and disposed of for you</small>
                    </span>
                  </label>
                  <label className="est-extra est-x-wide">
                    <input type="checkbox" id="exEdge" />
                    <span className="est-sw" aria-hidden="true" />
                    <span className="est-xname">
                      Detailed edging
                      <small>
                        A milled profile in place of the standard pencil edge
                      </small>
                    </span>
                  </label>
                  <div className="est-edge" id="estEdgePanel" hidden>
                    <button
                      className="est-edgebtn"
                      id="estEdgeBtn"
                      type="button"
                      aria-haspopup="dialog"
                    >
                      <span
                        className="est-edgeglyph"
                        id="estEdgeGlyph"
                        aria-hidden="true"
                      />
                      <span className="est-edgetxt" id="estEdgeTxt">
                        Choose your edge profile
                        <small>Eighteen to choose from</small>
                      </span>
                      <span className="est-change" aria-hidden="true">
                        Choose
                      </span>
                    </button>
                    <div className="est-lm" id="estLmWrap" hidden>
                      <label htmlFor="estLm">Total linear metres</label>
                      <input
                        className="est-in"
                        id="estLm"
                        type="number"
                        inputMode="decimal"
                        min="0.5"
                        max="40"
                        step="0.5"
                        placeholder="4"
                      />
                      <span className="est-lmout" id="estLmOut" />
                    </div>
                  </div>
                </div>
                <p className="est-standard">
                  A pencil edge and rounded corners come as standard.
                </p>
              </div>

              <div className="est-block">
                <TcUpload compact />
              </div>
            </div>

            <div className="est-poa" id="estPoa" hidden>
              <span className="est-poa-rule" aria-hidden="true" />
              <h3 id="estPoaTitle">
                Marble and quartzite are priced <em>by hand</em>
              </h3>
              <p id="estPoaLead">
                The price of the stone itself swings enormously here, from one
                block to the next and from one supplier to the next, so a
                calculator could only ever give you a number we could not stand
                behind. Send us what you already have and we will go and source
                it.
              </p>
              <ul className="est-poa-points">
                <li>
                  A plan, a sketch or your measurements, in whatever form you
                  have them
                </li>
                <li>
                  A photo of the colour you are after, or a link to a slab you
                  have seen, and we will find it or something better
                </li>
                <li>
                  Samples come to your kitchen, and you approve your own slab
                  from photographs before a single cut
                </li>
              </ul>
              <TcUpload />
              <div className="est-poa-cta">
                <a className="rev-cta-primary" href="#cta">
                  Get a price for this stone
                </a>
                <a className="rev-cta-ghost" href="tel:+448000982812">
                  Call 0800 098 2812
                </a>
              </div>
            </div>
          </div>

          <div className="est-preview glow-card rise" id="estPreview">
            <span className="est-dress" aria-hidden="true">
              <span className="est-wash" />
            </span>
            <div className="est-bhead">
              <span className="est-k">Your cutting plan</span>
              <span className="est-stamp" id="estStamp">
                Indicative range
              </span>
            </div>
            <div
              className="est-board"
              id="estBoard"
              role="group"
              aria-label="Slab cutting plan"
            />
            <div className="est-stats" id="estStats">
              <div className="est-stat">
                <b id="stSlabs">–</b>
                <span id="stSlabsL">slabs</span>
              </div>
              <div className="est-stat">
                <b id="stArea">–</b>
                <span>of worktop</span>
              </div>
              <div className="est-stat">
                <b id="stJoins">–</b>
                <span id="stJoinsL">joints</span>
              </div>
            </div>
            <p className="est-jnote" id="estJnote" hidden>
              Runs longer than the slab carry one discreet joint, placed exactly
              at your template visit.
            </p>
            <div className="est-out">
              <span className="est-k" id="estOutK">
                Your estimate
              </span>
              <div className="est-price" id="estPrice" aria-hidden="true">
                £2,000 – £2,500
              </div>
              <span className="est-sr" id="estPriceSR" aria-live="polite" />
              <div className="est-meta" id="estMeta">
                Quartz · 2 pieces · 1 slab
              </div>
              <p className="est-adds" id="estAdds" hidden />
              <p className="est-inc" id="estInc">
                Templating, fitting, every cut-out, drainer grooves, pencil
                edges and rounded corners, all included. Indicative only, your
                itemised quote follows a free visit.
              </p>
              <a href="#cta" className="btn-gold" id="estCta">
                Get your exact quote
              </a>
            </div>
          </div>
        </div>

        <div className="est-help rise">
          <div className="est-help-txt">
            <b>Not quite your space?</b>
            <span>
              Breakfast bars, curved runs, more than four slabs, a stone we have
              not listed. Plenty of jobs sit outside a calculator, and they are
              often the best ones. Tell us what you have in mind and we will
              price it by hand.
            </span>
          </div>
          <div className="est-help-cta">
            <a className="rev-cta-primary" href="#cta">
              Talk to our team
            </a>
            <a className="rev-cta-ghost" href="tel:+448000982812">
              Call 0800 098 2812
            </a>
          </div>
        </div>

        <p className="est-readmore">
          Still choosing? Read up on{' '}
          <a href="/materials/quartz-worktops.html">quartz</a>,{' '}
          <a href="/materials/granite-worktops.html">granite</a>,{' '}
          <a href="/materials/marble-worktops.html">marble</a>,{' '}
          <a href="/materials/porcelain-worktops.html">porcelain</a> and{' '}
          <a href="/materials/quartzite-worktops.html">quartzite</a>, or see{' '}
          <a href="/guides/how-much-do-quartz-worktops-cost.html">
            what worktops actually cost
          </a>
          .
        </p>
      </section>

      {/*
        The stone / edge-profile picker. It is a SIBLING of #estimator in the
        source, not a child — `.est-modal` is `position:fixed`, and keeping it
        outside the section keeps it clear of the section's stacking context.
      */}
      <div
        className="est-modal"
        id="estModal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="estModalTitle"
        hidden
      >
        <div className="est-mcard">
          <div className="est-mhead">
            <div>
              <h3 id="estModalTitle">Choose your stone</h3>
              <p id="estModalSub" />
            </div>
            <button
              className="est-mx"
              id="estModalX"
              type="button"
              aria-label="Close"
            >
              &times;
            </button>
          </div>
          <div className="est-mbody" id="estModalBody" />
        </div>
      </div>
    </>
  );
}

'use client';

import { useState } from 'react';

import { useReveal } from '@/hooks/useReveal';

/**
 * `section.section#stones` — index.html:3803. The materials strip.
 *
 * A draggable wheel of slabs with a material rail above it and a filter
 * drawer below. Everything except the wheel itself is here, verbatim.
 *
 * `#wheel` IS EMPTY, and it is empty in the legacy HTML too. The slabs are
 * rendered at runtime by the procedural stone generator (site.js:706 `STONES`
 * palettes, `marble()`, `marbleFill()`), which draws each slab as an SVG from
 * a palette preset and a seed rather than loading a photograph. That renderer
 * is its own piece of work and is shared with the stone detail pages, the
 * compare tool and the review card backings — it does not belong to this
 * composition. The wheel's controls, readout and rail are all here with their
 * legacy ids so attaching it is a drop-in.
 *
 * The filter drawer's open/closed state IS wired, because it is pure markup
 * state: `#stoneFilter` toggles `hidden` and the button's `aria-expanded`
 * follows it. The chips do not filter anything until the wheel exists to
 * filter, so they are rendered inert exactly as the source ships them —
 * `.sf-chip` with `data-f`/`data-v` for the engine to read.
 */
export default function Stones() {
  const ref = useReveal<HTMLElement>();
  const [filterOpen, setFilterOpen] = useState(false);

  return (
    <section className="section" id="stones" ref={ref}>
      <div className="section-head rise">
        <h2 className="section-title">
          Choose your <em>stone</em>
        </h2>
        <p className="section-sub">
          Drag through the collection and choose the stone you&apos;ll live
          with.
        </p>
      </div>

      <div className="stone-stage rise">
        <div className="stone-rail rail-mats" id="matTabs">
          {/*
            `on` is on Quartz in the source markup — the wheel boots showing
            quartz and the class is the pre-JS state, not a runtime artefact.
          */}
          <button className="mat-tab on" data-mat="Quartz">
            Quartz
          </button>
          <button className="mat-tab" data-mat="Marble">
            Marble &amp; Quartzite
          </button>
          <button className="mat-tab" data-mat="Granite">
            Granite
          </button>
          <a className="mat-tab mat-tab-all" href="/stones/">
            All stones <span aria-hidden="true">&rsaquo;</span>
          </a>
        </div>

        <div className="wheel" id="wheel" aria-label="Slab selector" role="group" />

        <div className="wheel-ui">
          <button className="wbtn" id="prev" aria-label="Previous stone">
            <svg viewBox="0 0 24 24">
              <path d="M15 5l-7 7 7 7" />
            </svg>
          </button>
          <div className="readout" id="readout" />
          <button className="wbtn" id="next" aria-label="Next stone">
            <svg viewBox="0 0 24 24">
              <path d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <div className="stone-rail rail-actions wheel-actions">
          <div className="stone-filter" id="stoneFilter" hidden={!filterOpen}>
            <div className="sf-search">
              <input
                type="search"
                id="sfSearch"
                placeholder="Try white, matt, marble effect"
                autoComplete="off"
                aria-label="Search stones by colour, finish or name"
              />
            </div>
            <div className="sf-group">
              <span className="sf-label">Tone</span>
              <div className="sf-chips" data-f="tone">
                <button className="sf-chip" type="button" data-v="light">
                  Light
                </button>
                <button className="sf-chip" type="button" data-v="dark">
                  Dark
                </button>
              </div>
            </div>
            <div className="sf-group">
              <span className="sf-label">Colour</span>
              <div className="sf-chips" data-f="hue">
                <button className="sf-chip" type="button" data-v="white">
                  Whites
                </button>
                <button className="sf-chip" type="button" data-v="cream">
                  Creams
                </button>
                <button className="sf-chip" type="button" data-v="grey">
                  Greys
                </button>
                <button className="sf-chip" type="button" data-v="black">
                  Blacks
                </button>
                <button className="sf-chip" type="button" data-v="brown">
                  Browns
                </button>
                <button className="sf-chip" type="button" data-v="blue">
                  Blues
                </button>
                <button className="sf-chip" type="button" data-v="green">
                  Greens
                </button>
              </div>
            </div>
            <div className="sf-group">
              <span className="sf-label">Veining</span>
              <div className="sf-chips" data-f="vein">
                <button className="sf-chip" type="button" data-v="statement">
                  Statement
                </button>
                <button className="sf-chip" type="button" data-v="soft">
                  Soft
                </button>
                <button className="sf-chip" type="button" data-v="calm">
                  Calm &amp; plain
                </button>
              </div>
            </div>
            <div className="sf-group">
              <span className="sf-label">Finish</span>
              <div className="sf-chips" data-f="finish">
                <button className="sf-chip" type="button" data-v="polished">
                  Polished
                </button>
                <button className="sf-chip" type="button" data-v="honed">
                  Honed (matt)
                </button>
                <button className="sf-chip" type="button" data-v="leathered">
                  Leathered
                </button>
              </div>
            </div>
            <div className="sf-group">
              <span className="sf-label">
                Silica{' '}
                <a className="sf-help" href="/guides/is-quartz-safe-silica.html">
                  what is this
                </a>
              </span>
              <div className="sf-chips" data-f="silica">
                <button className="sf-chip" type="button" data-v="free">
                  Silica free
                </button>
                <button className="sf-chip" type="button" data-v="low">
                  Low silica
                </button>
              </div>
            </div>
            <div className="sf-foot">
              <span className="sf-count" id="sfCount">
                Showing 12 of 12
              </span>
              <button className="sf-clear" id="sfClear" type="button">
                Clear all
              </button>
            </div>
          </div>

          <a className="rev-cta-primary" id="stoneView" href="/stones/">
            View this stone
          </a>
          <button
            className="rev-cta-ghost sf-toggle"
            id="stoneFilterBtn"
            type="button"
            aria-expanded={filterOpen}
            aria-controls="stoneFilter"
            onClick={() => setFilterOpen((v) => !v)}
          >
            <span className="sf-ico" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <path d="M4 5h16l-6 7v7l-4-2v-5z" />
              </svg>
            </span>
            <span>Filter</span>
            {/*
              The badge counts active filters. It stays `hidden` until the
              wheel's filter engine has something to count.
            */}
            <span className="sf-badge" id="sfBadge" hidden />
          </button>
          <a className="rev-cta-ghost" id="stoneEst" href="#estimator">
            Get an estimate
          </a>
          <a className="rev-cta-ghost" id="stoneAsk" href="#cta">
            Get in touch
          </a>
        </div>

        <p className="stone-more rise">
          These are the stones we hold photographs of, not the limit of what we
          can get. If the one you have in mind is not here,{' '}
          <a href="#cta">tell us what you are after</a> and we will source it
          where we can.
        </p>
      </div>
    </section>
  );
}

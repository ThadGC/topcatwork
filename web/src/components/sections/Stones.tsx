'use client';

import { useEffect, useRef, useState } from 'react';

import { useReveal } from '@/hooks/useReveal';
import { useStoneWheel } from '@/hooks/useStoneWheel';

/**
 * `section.section#stones` — index.html:3803. The materials strip.
 *
 * A draggable wheel of slabs with a material rail above it and a filter
 * drawer below.
 *
 * `#wheel` IS RENDERED EMPTY, and it is empty in the legacy HTML too. Its 67
 * slabs are built at runtime by `useStoneWheel`, imperatively, because the
 * wheel is a MEASURED belt: the step between slabs is read off a slab that is
 * already in the DOM, and the step decides how long the belt has to be. See
 * the long note at the top of hooks/useStoneWheel.ts. Everything the hook
 * drives is here with its legacy id — `#matTabs`, `#prev`, `#readout`,
 * `#next`, `#stoneView`, `#stoneFilter`, `#sfSearch`, `#sfCount`, `#sfBadge`,
 * `#sfClear`, `#stoneEst`, `#stoneAsk`.
 *
 * WHY THE STATIC CLASSNAMES BELOW ARE SAFE. The hook writes `class`, `href`,
 * `hidden` and `textContent` on several of these elements — the `on` material
 * tab, the badge, the count, "View this stone"'s target. React only writes a
 * DOM attribute when the prop VALUE changes between renders, so a prop that
 * is a literal here is never rewritten and never fights the hook. The one
 * exception is the drawer's `hidden`, which IS component state (`filterOpen`)
 * — and the hook correspondingly never touches it, exactly as site.js splits
 * the two (site.js:1401-1406 owns open/close; :1407-1424 owns the chips).
 */
export default function Stones() {
  const ref = useReveal<HTMLElement>();
  /* The ref for `#wheel`. Reads `#stones` and everything under it by id, the
     way site.js reads `document`. */
  const wheelRef = useStoneWheel(ref);
  const [filterOpen, setFilterOpen] = useState(false);
  const drawer = useRef<HTMLDivElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);

  /*
    THE DRAWER CLOSES ON ANYTHING THAT MEANS "I AM DONE HERE".

    The client, 28 Aug: "when a user clicks on the filter, they currently have
    to click on the filter button again for the filter to minimize. There has
    to be a small x next to it, or if they tap anywhere or click anywhere
    outside of the filter, it should close the filter."

    So: an outside press, Escape, or the drawer's own close button — on top of
    the toggle, which still works as a toggle.

    ⛔ THE TOGGLE IS EXCLUDED FROM THE OUTSIDE-PRESS TEST. Without that, a press
    on it closes the drawer here on `pointerdown` and its own `onClick` then
    reads `filterOpen === false` and reopens it, so the button stops closing
    anything.

    `pointerdown`, not `click`, so a drag that starts on the wheel puts the
    drawer away before the wheel moves under it. Capture phase, so a handler
    that stops propagation cannot keep the drawer open.
  */
  useEffect(() => {
    if (!filterOpen) return;

    const onDown = (e: PointerEvent) => {
      const t = e.target as Node | null;
      if (!t) return;
      if (drawer.current?.contains(t)) return;
      if (toggle.current?.contains(t)) return;
      setFilterOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setFilterOpen(false);
      toggle.current?.focus();
    };

    document.addEventListener('pointerdown', onDown, true);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown, true);
      document.removeEventListener('keydown', onKey);
    };
  }, [filterOpen]);

  return (
    <section className="section" id="stones" ref={ref}>
      <div className="section-head rise">
        <h2 className="section-title">
          Choose your <em>stone</em>
        </h2>
        {/* Client copy change, 26 Aug 2026 — was "…the stone you'll live
            with." Deliberately differs from the legacy build; do not restore
            it to match old. */}
        <p className="section-sub">
          Drag through the collection and choose the stone for your space.
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

        <div
          className="wheel"
          id="wheel"
          ref={wheelRef}
          aria-label="Slab selector"
          role="group"
        />

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
          <div className="stone-filter" id="stoneFilter" hidden={!filterOpen} ref={drawer}>
            {/* The drawer's own close. `sf-title` is the same gold rubric as
                every `sf-label` below it, so the row reads as part of the
                panel rather than bolted onto it. */}
            <div className="sf-head">
              <span className="sf-title">Filter</span>
              <button
                className="sf-close"
                type="button"
                aria-label="Close filter"
                onClick={() => {
                  setFilterOpen(false);
                  toggle.current?.focus();
                }}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>
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
            ref={toggle}
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
              The badge counts active filters (site.js:1371). The hook
              un-hides it and writes the count; `hidden` here is the pre-JS
              state, and React never rewrites it because the prop is a
              literal.
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

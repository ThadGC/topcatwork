'use client';

/**
 * The collection browser — `section.st-controls` + `section.st-gridwrap`.
 *
 * ---------------------------------------------------------------------------
 * WHY THE FILTER IS IMPERATIVE AND NOT REACT STATE
 * ---------------------------------------------------------------------------
 * All 132 tiles are rendered once, server-side, and filtering toggles a `.hide`
 * class on them — exactly what stones/index.html:281 does. That is not
 * nostalgia, it is the only shape that works here:
 *
 *   1. Every tile also carries `.rise`, and the reveal observer adds `.in`
 *      directly to the element. If React owned `className` it would rewrite
 *      the attribute on the next filter keystroke and strip `.in`, and 100
 *      already-revealed tiles would blink back to opacity 0.
 *   2. The tiles are the SEO payload. They must be in the exported HTML with
 *      their hrefs, matching the ItemList JSON-LD — so they are server-
 *      rendered regardless, and re-rendering them in the client buys nothing.
 *   3. `data-attr` and `data-find` are ~300 characters each. Keeping them in
 *      the DOM as the single source of truth avoids shipping the same 40KB of
 *      search text twice, once as markup and once as a JS array.
 *
 * There is therefore no React state in this component at all. The search input
 * is uncontrolled and the effect is the whole controller.
 *
 * ---------------------------------------------------------------------------
 * THE TWO-FIELD SEARCH
 * ---------------------------------------------------------------------------
 * `data-find` is a free-text haystack matched by substring (plus a
 * one-deletion fuzzy pass for terms of 5+ characters). `data-attr` is a token
 * list matched whole-word, and the ~34 SCOPED terms — colours, finishes,
 * materials — are matched against it instead. Without that split, typing
 * "black" would match every stone whose *description* mentions black, and the
 * colour filter would stop meaning anything.
 *
 * ---------------------------------------------------------------------------
 * SELF-EXCLUDING FACET COUNTS
 * ---------------------------------------------------------------------------
 * `matches(el, skip)` re-runs the whole predicate with one facet removed. That
 * is what lets a refine chip stay enabled while it is itself active, and what
 * greys out chips that would return nothing — a chip is disabled when no tile
 * passes every OTHER filter and also carries that chip's value. Deleting the
 * `skip` parameter looks like a simplification and silently disables every
 * chip in the group you are already filtering by.
 */
import { useEffect } from 'react';

import type { CollectionRecord } from '@/lib/stones';
import { countLabel, matchesTerms, normaliseQuery } from '@/lib/stones';

import { StoneTile } from './StoneTile';
import { CompareRects, RefineBars, SearchGlass } from './icons';

/** The three refine-drawer groups, in source order. */
const REFINE_GROUPS = [
  {
    label: 'Colour',
    facet: 'hue',
    chips: [
      ['white', 'Whites'],
      ['cream', 'Creams'],
      ['grey', 'Greys'],
      ['black', 'Blacks'],
      ['brown', 'Browns'],
      ['blue', 'Blues'],
      ['green', 'Greens'],
    ],
  },
  {
    label: 'Veining',
    facet: 'vein',
    chips: [
      ['statement', 'Statement'],
      ['soft', 'Soft'],
      ['calm', 'Calm & plain'],
    ],
  },
  {
    label: 'Finish',
    facet: 'finish',
    chips: [
      ['polished', 'Polished'],
      ['honed', 'Honed (matt)'],
      ['leathered', 'Leathered'],
      ['brushed', 'Brushed'],
    ],
  },
] as const;

type Facet = 'hue' | 'vein' | 'finish';
const FACETS: Facet[] = ['hue', 'vein', 'finish'];

/** `#quartz`, `#marble`, `#granite` preselect a material tab on load. */
const HASH_TO_MAT: Record<string, string> = {
  marble: 'Marble',
  quartz: 'Quartz',
  granite: 'Granite',
};

export function StoneCollection({ collection }: { collection: CollectionRecord }) {
  useEffect(() => {
    // Document-scoped, exactly like the source. There is no wrapper element to
    // scope to: the two <section>s must stay direct children of <main>, and a
    // <div> around them would be markup the legacy page does not have.
    const tiles = Array.from(document.querySelectorAll<HTMLAnchorElement>('.stile'));
    const countEl = document.getElementById('stCount');
    const emptyEl = document.getElementById('stEmpty');
    const search = document.querySelector<HTMLInputElement>('#stSearch');
    const drawer = document.getElementById('stDrawer');
    const refineBtn = document.querySelector<HTMLButtonElement>('#stRefine');
    const badge = document.getElementById('stBadge');
    const clearBtn = document.querySelector<HTMLButtonElement>('#stClear');
    const matTabs = Array.from(
      document.querySelectorAll<HTMLButtonElement>('.ftab[data-mat]'),
    );
    const toneTabs = Array.from(
      document.querySelectorAll<HTMLButtonElement>('.ftab[data-tone]'),
    );
    const chips = Array.from(document.querySelectorAll<HTMLButtonElement>('.rchip'));
    if (!countEl || !emptyEl || !search) return;

    let terms: string[] = [];
    let mat = 'All';
    let tone = 'All';
    const refine: Record<Facet, Set<string>> = {
      hue: new Set(),
      vein: new Set(),
      finish: new Set(),
    };

    /**
     * @param skip the one facet to ignore, so a group can count its own
     *             options without excluding them. `null` means "apply all".
     */
    const matches = (el: HTMLElement, skip: Facet | 'mat' | 'tone' | null): boolean => {
      if (
        terms.length &&
        !matchesTerms(
          { attr: el.dataset.attr ?? '', find: el.dataset.find ?? '' },
          terms,
        )
      ) {
        return false;
      }
      if (skip !== 'mat' && mat !== 'All' && el.dataset.mat !== mat) return false;
      if (skip !== 'tone' && tone !== 'All' && el.dataset.tone !== tone.toLowerCase()) {
        return false;
      }
      for (const facet of FACETS) {
        if (facet === skip || refine[facet].size === 0) continue;
        const value = el.dataset[facet] ?? '';
        // Finish is a substring test, the other two are equality. `data-finish`
        // can read "honed and filled", and the "honed" chip has to catch it.
        const hit = [...refine[facet]].some((want) =>
          facet === 'finish' ? value.indexOf(want) > -1 : value === want,
        );
        if (!hit) return false;
      }
      return true;
    };

    const apply = () => {
      let shown = 0;
      for (const tile of tiles) {
        const ok = matches(tile, null);
        tile.classList.toggle('hide', !ok);
        if (ok) shown++;
      }

      for (const chip of chips) {
        const facet = chip.dataset.f as Facet;
        const value = chip.dataset.v ?? '';
        if (chip.classList.contains('on')) {
          chip.disabled = false;
          continue;
        }
        chip.disabled = !tiles.some((tile) => {
          if (!matches(tile, facet)) return false;
          const got = tile.dataset[facet] ?? '';
          return facet === 'finish' ? got.indexOf(value) > -1 : got === value;
        });
      }

      const active = refine.hue.size + refine.vein.size + refine.finish.size;
      if (badge) {
        badge.hidden = active === 0;
        badge.textContent = active ? String(active) : '';
      }
      if (clearBtn) clearBtn.hidden = active === 0;
      countEl.textContent = countLabel(shown);
      emptyEl.hidden = shown > 0;
    };

    const onSearch = () => {
      terms = normaliseQuery(search.value);
      apply();
    };

    const onMatTab = (event: Event) => {
      const btn = event.currentTarget as HTMLButtonElement;
      mat = btn.dataset.mat ?? 'All';
      matTabs.forEach((tab) => tab.classList.toggle('on', tab === btn));
      apply();
    };

    const onToneTab = (event: Event) => {
      const btn = event.currentTarget as HTMLButtonElement;
      tone = btn.dataset.tone ?? 'All';
      toneTabs.forEach((tab) => tab.classList.toggle('on', tab === btn));
      apply();
    };

    const onChip = (event: Event) => {
      const chip = event.currentTarget as HTMLButtonElement;
      const facet = chip.dataset.f as Facet;
      const value = chip.dataset.v ?? '';
      if (refine[facet].has(value)) refine[facet].delete(value);
      else refine[facet].add(value);
      chip.classList.toggle('on', refine[facet].has(value));
      apply();
    };

    const onRefine = () => {
      if (!drawer || !refineBtn) return;
      const opening = drawer.hasAttribute('hidden');
      if (opening) drawer.removeAttribute('hidden');
      else drawer.setAttribute('hidden', '');
      refineBtn.setAttribute('aria-expanded', String(opening));
      refineBtn.classList.toggle('on', opening);
    };

    const onClear = () => {
      FACETS.forEach((facet) => refine[facet].clear());
      chips.forEach((chip) => chip.classList.remove('on'));
      apply();
    };

    search.addEventListener('input', onSearch);
    matTabs.forEach((tab) => tab.addEventListener('click', onMatTab));
    toneTabs.forEach((tab) => tab.addEventListener('click', onToneTab));
    chips.forEach((chip) => chip.addEventListener('click', onChip));
    refineBtn?.addEventListener('click', onRefine);
    if (clearBtn) {
      clearBtn.hidden = true;
      clearBtn.addEventListener('click', onClear);
    }

    // Listeners first, then the hash preselect, because it works by clicking
    // the tab — the source's own ordering.
    const hash = (location.hash || '').slice(1).toLowerCase();
    const preselect = HASH_TO_MAT[hash];
    if (preselect) {
      matTabs.find((tab) => tab.dataset.mat === preselect)?.click();
    }

    apply();

    return () => {
      search.removeEventListener('input', onSearch);
      matTabs.forEach((tab) => tab.removeEventListener('click', onMatTab));
      toneTabs.forEach((tab) => tab.removeEventListener('click', onToneTab));
      chips.forEach((chip) => chip.removeEventListener('click', onChip));
      refineBtn?.removeEventListener('click', onRefine);
      clearBtn?.removeEventListener('click', onClear);
    };
  }, []);

  return (
    <>
      <section className="st-controls">
        <div className="wrap">
          <div className="st-controlrow">
            <label className="st-search">
              <SearchGlass />
              <input
                id="stSearch"
                type="search"
                placeholder={collection.search.placeholder}
                aria-label="Search stones by colour, finish or name"
              />
            </label>

            {/*
              Two `.st-ftabs` groups. The material bucket has only three real
              values — quartzite and travertine are folded into "Marble", which
              is why the tab reads "Marble & Quartzite" while `data-mat` says
              "Marble". See the note on StoneTaxonomy in lib/stones.ts.
            */}
            <div className="st-ftabs" role="group" aria-label="Filter by material">
              <button className="ftab on" data-mat="All" type="button">
                All
              </button>
              <button className="ftab" data-mat="Marble" type="button">
                Marble &amp; Quartzite
              </button>
              <button className="ftab" data-mat="Quartz" type="button">
                Quartz
              </button>
              <button className="ftab" data-mat="Granite" type="button">
                Granite
              </button>
            </div>

            <div className="st-ftabs" role="group" aria-label="Filter by tone">
              <button className="ftab tone on" data-tone="All" type="button">
                All tones
              </button>
              <button className="ftab tone" data-tone="Light" type="button">
                Light
              </button>
              <button className="ftab tone" data-tone="Dark" type="button">
                Dark
              </button>
            </div>

            <button
              className="st-refine"
              id="stRefine"
              type="button"
              aria-expanded="false"
              aria-controls="stDrawer"
            >
              <RefineBars />
              Refine
              <span className="st-badge" id="stBadge" hidden />
            </button>

            <a className="st-refine st-compare" href="/stones/compare.html">
              <CompareRects strokeWidth="2.6" />
              Compare
            </a>
          </div>

          <div className="st-drawer" id="stDrawer" hidden>
            {REFINE_GROUPS.map((group) => (
              <div className="rgroup" key={group.facet}>
                <span className="rlabel">{group.label}</span>
                <div className="rchips">
                  {group.chips.map(([value, label]) => (
                    <button
                      className="rchip"
                      type="button"
                      key={value}
                      data-f={group.facet}
                      data-v={value}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <button className="st-clear" id="stClear" type="button">
              Clear all
            </button>
          </div>

          {/* Server-rendered as the unfiltered total; rewritten on every apply(). */}
          <p className="st-count" id="stCount">
            {collection.countLabel}
          </p>
        </div>
      </section>

      <section className="st-gridwrap">
        <div className="wrap">
          <div className="st-grid">
            {collection.tiles.map((tile) => (
              <StoneTile key={tile.slug} tile={tile} />
            ))}
          </div>
          <div className="st-empty" id="stEmpty" hidden>
            <p className="st-empty-line">No stone by that name in the collection.</p>
            <p className="st-empty-sub">
              We can usually source it. Call{' '}
              <a href="tel:+448000982812">0800 098 2812</a> or{' '}
              <a href="/contact/">get in touch</a> and tell us what you are after.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

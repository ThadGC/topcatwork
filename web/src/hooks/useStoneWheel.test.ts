/**
 * The stone wheel.
 *
 * Two halves. The first exercises the ordering pass and the filter as pure
 * functions against the numbers in assets/site.js:1001-1038 and 1290-1329.
 * The second mounts `<Stones/>` and counts the DOM the hook builds, because
 * the defect this port fixes was measured in the DOM: `#wheel .slab` was 0
 * where the old build has 67, and `#wheel *` was 0 where it has 335.
 *
 * WHAT JSDOM CANNOT SEE. `offsetWidth`/`clientWidth` are 0 and `matchMedia`
 * answers "no" to everything (tests/setup.ts), so `metrics()` takes the
 * narrow-viewport branch and `makeBelt` never repeats the list. That does not
 * change the tile count — at 1440px the desktop branch's step is large enough
 * that `reps` is 1 too — but it does mean the transforms asserted here are
 * not the transforms a real browser produces. Geometry is left to the visual
 * pass; this file asserts structure, ordering and text.
 */
import { createElement } from 'react';
import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import Stones from '@/components/sections/Stones';
import { MATERIALS, POPULAR, matLabel, stoneMarkup } from '@/data/home/stoneWheel';
import {
  LAND,
  OPEN_SPAN,
  clearOpening,
  fanOrder,
  filterStones,
  landingIndex,
  mod,
  newStoneFilter,
  sfActiveN,
  termHits,
} from './useStoneWheel';

afterEach(cleanup);

describe('the dataset adapter', () => {
  it('rebuilds the three legacy material lists at their legacy lengths', () => {
    /* site.js:829-968 — Marble 45, Quartz 67, Granite 20. */
    expect(MATERIALS.Quartz).toHaveLength(67);
    expect(MATERIALS.Marble).toHaveLength(45);
    expect(MATERIALS.Granite).toHaveLength(20);
  });

  it('keeps the lists in the order clearOpening walks', () => {
    /* Alphabetical by slug within each material — the legacy literal order.
       clearOpening steps through NEIGHBOURS, so a re-sort would change which
       slabs sit either side of centre. */
    for (const list of [MATERIALS.Quartz, MATERIALS.Marble, MATERIALS.Granite]) {
      const slugs = list.map((s) => s.slug);
      expect(slugs).toEqual([...slugs].sort());
    }
  });

  it('carries kind separately from mat', () => {
    /* The bucket is Marble; the display family is Quartzite. `.r-mat` shows
       the family (site.js:1067 `s.kind || s.mat`). */
    const aqua = MATERIALS.Marble.find((s) => s.slug === 'aqua-gucci');
    expect(aqua?.mat).toBe('Marble');
    expect(aqua?.kind).toBe('Quartzite');
    const azul = MATERIALS.Quartz.find((s) => s.slug === 'azul-shimmer');
    expect(azul?.kind).toBe('Quartz');
    expect(azul?.tone).toBe('light');
  });

  it('has no silica on any record, so the silica chips can never match', () => {
    /* Not one of the 132 legacy literals has the key. */
    const all = [...MATERIALS.Quartz, ...MATERIALS.Marble, ...MATERIALS.Granite];
    expect(all.every((s) => s.silica === undefined)).toBe(true);
    const f = newStoneFilter();
    f.silica.add('free');
    expect(filterStones(MATERIALS.Quartz, f)).toHaveLength(0);
  });
});

describe('stoneMarkup', () => {
  const azul = MATERIALS.Quartz.find((s) => s.slug === 'azul-shimmer')!;
  const html = stoneMarkup(azul);

  it('uses the wheel sizes, not the collection tile sizes', () => {
    /* site.js:981. The tile's is `(max-width:700px) 45vw, 290px`. */
    expect(html).toContain('sizes="(max-width:700px) 60vw, 300px"');
    expect(html).not.toContain('45vw');
  });

  it('leaves alt empty — the name is already a sibling element', () => {
    expect(html).toContain('alt=""');
  });

  it('reproduces the source’s unslashed 1600w candidate', () => {
    /* site.js:981 builds the 800w URL absolute and the 1600w one RELATIVE.
       On `/`, where the wheel lives, both resolve to the same file. */
    expect(html).toContain('/assets/slabs/azul-shimmer-s.webp?v=3 800w');
    expect(html).toContain(', assets/slabs/azul-shimmer.webp?v=3 1600w');
  });
});

describe('the ordering pass', () => {
  it('lands Quartz on the first POPULAR entry', () => {
    expect(POPULAR.Quartz[0]).toBe('azul-shimmer');
    const i = landingIndex(MATERIALS.Quartz, 'Quartz');
    expect(MATERIALS.Quartz[i].slug).toBe('azul-shimmer');
  });

  it('skips a POPULAR entry that is dark-toned', () => {
    /* Granite's list opens with absolute-black-extra, which is dark, so the
       landing falls through to the second entry. site.js:1004. */
    expect(POPULAR.Granite[0]).toBe('absolute-black-extra');
    const i = landingIndex(MATERIALS.Granite, 'Granite');
    expect(MATERIALS.Granite[i].slug).toBe('bianco-crystal');
  });

  it('reads currentMat, not the list, because fanOrder drops the argument', () => {
    /* THE TRAP, site.js:1034: `landingIndex(list)` passes one argument, so
       `mat` is undefined inside and POPULAR[currentMat] is what gets walked.
       Asking for the Quartz preference list over the GRANITE stones finds
       none of them and falls through to the fewest-dark-neighbours scan. */
    const viaCurrent = landingIndex(MATERIALS.Granite, 'Quartz');
    const viaExplicit = landingIndex(MATERIALS.Granite, 'Quartz', 'Granite');
    expect(MATERIALS.Granite[viaExplicit].slug).toBe('bianco-crystal');
    expect(viaCurrent).not.toBe(viaExplicit);
  });

  it('puts the landing stone at index LAND', () => {
    const belt = fanOrder(MATERIALS.Quartz, 'Quartz');
    expect(belt).toHaveLength(67);
    expect(belt[LAND].slug).toBe('azul-shimmer');
  });

  it('clears every dark stone out of the seven slabs either side', () => {
    const belt = fanOrder(MATERIALS.Quartz, 'Quartz');
    const n = belt.length;
    for (let d = -OPEN_SPAN; d <= OPEN_SPAN; d++) {
      const s = belt[mod(LAND + d, n)];
      expect(`${s.slug}:${s.tone}`).not.toContain(':dark');
    }
  });

  it('loses nothing while it reorders', () => {
    for (const mat of ['Quartz', 'Marble', 'Granite'] as const) {
      const belt = fanOrder(MATERIALS[mat], mat);
      expect(new Set(belt.map((s) => s.slug)).size).toBe(MATERIALS[mat].length);
    }
  });

  it('returns a list of fewer than three untouched', () => {
    /* site.js:1033 — there is no arc to clear. */
    const two = MATERIALS.Quartz.slice(0, 2);
    expect(fanOrder(two, 'Quartz')).toEqual(two);
  });

  it('returns a list with fewer than five light stones untouched', () => {
    /* site.js:1017 — clearOpening cannot fill a seven-wide opening. */
    const darks = MATERIALS.Granite.filter((s) => s.tone === 'dark').slice(0, 8);
    const out = clearOpening(darks, 0);
    expect(out.list).toEqual(darks);
    expect(out.s).toBe(0);
  });
});

describe('the filter', () => {
  it('matches a plain name', () => {
    const f = newStoneFilter();
    f.q = 'azul';
    expect(filterStones(MATERIALS.Quartz, f).map((s) => s.slug)).toContain('azul-shimmer');
  });

  it('glues the multi-word phrases before splitting', () => {
    /* site.js:1315-1319. Without the glue, "marble effect" splits into two
       terms and "marble" alone throws out every quartz. Glued, it is the one
       token `marbleeffect`, whose rule is `quartz statement|soft`. */
    const f = newStoneFilter();
    f.q = 'marble effect';
    const glued = newStoneFilter();
    glued.q = 'marbleeffect';
    const out = filterStones(MATERIALS.Quartz, f);
    expect(out.map((s) => s.slug)).toEqual(
      filterStones(MATERIALS.Quartz, glued).map((s) => s.slug),
    );
    expect(out.length).toBeGreaterThan(0);
    expect(out.length).toBeLessThan(MATERIALS.Quartz.length);
    /* The rule is applied to the whole haystack, not to the `vein` field, so
       a calm-veined stone with "Soft" in its NAME passes. Reproduce, do not
       tighten: site.js:1305. */
    const calmPass = out.find((s) => s.vein === 'calm');
    if (calmPass) expect(calmPass.name.toLowerCase()).toMatch(/soft|statement/);
  });

  it('applies a synonym rule as AND-of-groups, OR-within-a-group', () => {
    /* site.js:1305-1306. */
    expect(termHits('quartz statement', 'marbleeffect')).toBe(true);
    expect(termHits('quartz calm', 'marbleeffect')).toBe(false);
    expect(termHits('granite soft', 'marbleeffect')).toBe(false);
  });

  it('fuzzy-matches only terms of five characters or more', () => {
    /* site.js:1298-1308. A literal substring hit is tested FIRST, so `zul`
       matches "azul" outright — the length guard only gates the one-deletion
       pass below it. "carrarra" is not a substring but is one deletion from
       "carrara"; "qrtz" is neither, and is too short to be eligible. */
    expect(termHits('azul shimmer quartz', 'zul')).toBe(true);
    expect(termHits('carrara honed marble', 'carrarra')).toBe(true);
    expect(termHits('azul shimmer quartz', 'qrtz')).toBe(false);
  });

  it('intersects the chip sets', () => {
    const f = newStoneFilter();
    f.tone.add('dark');
    f.hue.add('black');
    const out = filterStones(MATERIALS.Quartz, f);
    expect(out.length).toBeGreaterThan(0);
    expect(out.every((s) => s.tone === 'dark' && s.hue === 'black')).toBe(true);
  });

  it('matches a finish by substring, lower-cased', () => {
    /* site.js:1326 — the chips carry "honed", the data carries "Honed". */
    const f = newStoneFilter();
    f.finish.add('honed');
    const out = filterStones(MATERIALS.Marble, f);
    expect(out.length).toBeGreaterThan(0);
    expect(out.every((s) => s.finish.toLowerCase().includes('honed'))).toBe(true);
  });

  it('counts a whitespace-only query as no filter', () => {
    /* site.js:1260 — `q.trim() ? 1 : 0`. */
    const f = newStoneFilter();
    f.q = '   ';
    expect(sfActiveN(f)).toBe(0);
    f.q = 'white';
    f.tone.add('light');
    expect(sfActiveN(f)).toBe(2);
  });
});

describe('matLabel', () => {
  it('labels the Marble bucket as Marble & Quartzite', () => {
    /* site.js:827 — the bucket holds quartzite too. */
    expect(matLabel('Marble')).toBe('Marble & Quartzite');
    expect(matLabel('Quartz')).toBe('Quartz');
    expect(matLabel('Nonsense')).toBe('Nonsense');
  });
});

describe('the mounted wheel', () => {
  it('builds 67 slabs and 335 elements inside #wheel', () => {
    /* THE MEASURED DEFECT. The old build reports 67 and 335 at 863px; this
       port was reported as 0 and 0. Five elements per slab:
       .slab > (.stone > img, .glass, span.name). site.js:1054. */
    const { container } = render(createElement(Stones));
    const wheel = container.querySelector('#wheel')!;
    expect(wheel.querySelectorAll('.slab')).toHaveLength(67);
    expect(wheel.querySelectorAll('*')).toHaveLength(335);
  });

  it('centres Azul Shimmer and fills the readout', () => {
    const { container } = render(createElement(Stones));
    const readout = container.querySelector('#readout')!;
    expect(readout.querySelector('.r-mat')!.textContent).toBe('Quartz');
    expect(readout.querySelector('.r-name')!.textContent).toBe('Azul Shimmer');
    /* site.js:1068 — a constant string. */
    expect(readout.querySelector('.r-sup')!.textContent).toBe(
      'Fitted with a ten-year guarantee',
    );
  });

  it('points "View this stone" at the centred stone', () => {
    const { container } = render(createElement(Stones));
    const view = container.querySelector<HTMLAnchorElement>('#stoneView')!;
    /* The legacy leaf, and what every other stone link in this build uses. */
    expect(view.getAttribute('href')).toBe('/stones/azul-shimmer.html');
  });

  it('names the slab in the belt order the wheel lands on', () => {
    const { container } = render(createElement(Stones));
    const names = Array.from(
      container.querySelectorAll('#wheel .slab .name'),
      (n) => n.textContent,
    );
    expect(names[LAND]).toBe('Azul Shimmer');
  });

  it('writes the filter count from the data, not the markup placeholder', () => {
    /* site.js:1372. The legacy markup ships "Showing 12 of 12". */
    const { container } = render(createElement(Stones));
    expect(container.querySelector('#sfCount')!.textContent).toBe('Showing 67 of 67');
  });

  it('hides the silica group, because no stone carries the field', () => {
    /* site.js:1330-1345 — `has.free` and `has.low` are both false. */
    const { container } = render(createElement(Stones));
    const grp = container.querySelector('.sf-chips[data-f="silica"]')!;
    expect((grp.closest('.sf-group') as HTMLElement).hidden).toBe(true);
  });

  it('switches material when a tab is clicked', () => {
    const { container } = render(createElement(Stones));
    const tab = container.querySelector<HTMLButtonElement>('.mat-tab[data-mat="Granite"]')!;
    tab.click();
    expect(tab.classList.contains('on')).toBe(true);
    expect(container.querySelector('#wheel')!.querySelectorAll('.slab')).toHaveLength(20);
    expect(container.querySelector('#readout .r-name')!.textContent).toBe('Bianco Crystal');
  });

  it('empties the wheel and says so when nothing matches', () => {
    /* site.js:1376-1386. */
    const { container } = render(createElement(Stones));
    const search = container.querySelector<HTMLInputElement>('#sfSearch')!;
    search.value = 'zzzzzznotastone';
    search.dispatchEvent(new Event('input', { bubbles: true }));
    expect(container.querySelector('#wheel')!.querySelectorAll('.slab')).toHaveLength(0);
    expect(container.querySelector('#readout .r-name')!.textContent).toBe('No stones match');
    expect(container.querySelector('#readout .r-mat')!.textContent).toBe('Quartz');
    const view = container.querySelector<HTMLAnchorElement>('#stoneView')!;
    expect(view.style.pointerEvents).toBe('none');
  });

  it('rebuilds the belt when a filter narrows it, and restores the CTA', () => {
    const { container } = render(createElement(Stones));
    const chip = container.querySelector<HTMLButtonElement>(
      '.sf-chips[data-f="tone"] .sf-chip[data-v="dark"]',
    )!;
    chip.click();
    const expected = MATERIALS.Quartz.filter((s) => s.tone === 'dark').length;
    expect(expected).toBeGreaterThan(0);
    expect(container.querySelector('#wheel')!.querySelectorAll('.slab')).toHaveLength(expected);
    expect(container.querySelector('#sfBadge')!.textContent).toBe('1');
    expect((container.querySelector('#sfBadge') as HTMLElement).hidden).toBe(false);
    expect(container.querySelector<HTMLAnchorElement>('#stoneView')!.style.pointerEvents).toBe('');
  });

  it('dispatches topcat:stone in the shape the CTA chip reads', () => {
    /* site.js:1429-1434, consumed at ContactForm.tsx:66-78 as
       `${d.name} · ${d.kind ?? d.mat}`. Nothing dispatched this before. */
    const { container } = render(createElement(Stones));
    let detail: Record<string, unknown> | null = null;
    const listen = (e: Event) => {
      detail = (e as CustomEvent<Record<string, unknown>>).detail;
    };
    document.addEventListener('topcat:stone', listen);
    container.querySelector<HTMLElement>('#stoneEst')!.click();
    document.removeEventListener('topcat:stone', listen);
    expect(detail).toMatchObject({
      name: 'Azul Shimmer',
      mat: 'Quartz',
      kind: 'Quartz',
      slug: 'azul-shimmer',
    });
  });

  it('leaves nothing behind when the section unmounts', () => {
    const { container, unmount } = render(createElement(Stones));
    const wheel = container.querySelector('#wheel')!;
    expect(wheel.querySelectorAll('.slab').length).toBe(67);
    unmount();
    expect(wheel.querySelectorAll('.slab')).toHaveLength(0);
  });
});

/**
 * The engine against the ORIGINAL's own output.
 *
 * `vectors.data.ts` is not hand-written: it is a dump of what the legacy
 * `pack()` and `compute()` actually returned when the shipped source lines
 * were sliced out of "TOPCAT WORKTOPS/assets/site.js" and run. If a number
 * here is wrong, it is wrong in production too.
 */
import { describe, expect, it } from 'vitest';

import {
  BRACKETS,
  EDGE_RATE,
  ISLAND,
  LIM,
  MATS,
  MAX_BRACKET,
  REMOVAL,
  SHAPES,
  clamp,
  widRange,
  type MatId,
  type Piece,
  type UseId,
} from './constants';
import { BEST, NO_CAT_TILE, bestFor, faceSlug, matchStone, modalTerms, tileURL } from './catalogue';
import { EDGES, MATERIALS, POPULAR } from './catalogue.data';
import { LAB } from './constants';
import { pack } from './pack';
import { edgeMetres, estimate } from './price';
import { estVectors, packVectors } from './vectors.data';

/** JSON round-trip, so `jl: undefined` and a missing key compare equal — the
 *  vectors were serialised the same way. */
const j = <T>(v: T) => JSON.parse(JSON.stringify(v));

const shape = (name: keyof typeof SHAPES, island = false): Piece[] => {
  const pieces: Piece[] = SHAPES[name].map(([len, wid, use]) => ({ len, wid, th: 20, use }));
  if (island) pieces.push({ ...ISLAND });
  return pieces;
};

const q = { name: 'Azul Shimmer', mat: 'Quartz', finish: 'Polished', slug: 'azul-shimmer' };
const run = (over: Partial<Parameters<typeof estimate>[0]> = {}) =>
  estimate({ mat: 'Quartz', stone: q, pieces: shape('straight'), checked: {}, edgeIdx: null, lmRaw: '', ...over });

/* ------------------------------------------------------------------ */

describe('pack() reproduces the original, vector for vector', () => {
  it('has a table to check against', () => {
    expect(packVectors.length).toBeGreaterThan(90);
  });

  for (const v of packVectors) {
    it(`${v.name}`, () => {
      const plan = pack(
        v.pieces.map((p, i) => ({ ...p, use: p.use as UseId, lab: LAB(i) })),
        v.mat as MatId,
      );
      expect(plan.slabs.length).toBe(v.out.slabs);
      expect(plan.joints).toBe(v.out.joints);
      expect(plan.areaM2).toBe(v.out.areaM2);
      expect(plan.dims).toEqual(v.out.dims);
      expect(j(plan.slabs.map((s) => s.placed))).toEqual(v.out.placed);
      expect(j(plan.slabs.map((s) => s.free))).toEqual(v.out.free);
    });
  }
});

describe('estimate() reproduces the original, vector for vector', () => {
  for (const v of estVectors) {
    it(`${v.name}`, () => {
      const got = estimate({
        mat: v.inp.mat as MatId,
        stone: v.inp.stone,
        pieces: v.inp.pieces.map((p) => ({ ...p, use: p.use as UseId })),
        checked: v.inp.checked ?? {},
        edgeIdx: v.inp.edgeIdx ?? null,
        lmRaw: v.inp.lmRaw ?? '',
      });
      // `plan` is our own addition; every other field is a DOM sink the
      // original wrote, and must match key for key.
      const { plan: _plan, ...sinks } = got;
      void _plan;
      expect(j(sinks)).toEqual(v.out);
    });
  }
});

/* ------------------------------------------------------------------
   The acceptance cases, spelled out rather than left inside the table.
   ------------------------------------------------------------------ */

describe('the acceptance cases', () => {
  it('U-shape + island settles at £3,850 – £4,300', () => {
    // The brief quotes "£3,498 – £3,957", which is frame 11 of the panel's
    // own 0.14 easing on the way to this pair — see easePrice below.
    expect(run({ pieces: shape('ushape', true) }).price).toEqual({ type: 'range', lo: 3850, hi: 4300 });
  });

  it('the eased readout passes through £3,498 – £3,957 on the way there', () => {
    // site.js:3874-3879 — lowS += (lowT - lowS) * 0.14, one step per frame,
    // starting from the panel's own opening range.
    let lo = 2000;
    let hi = 2500;
    for (let i = 0; i < 11; i++) {
      lo += (3850 - lo) * 0.14;
      hi += (4300 - hi) * 0.14;
    }
    expect(Math.round(lo)).toBe(3498);
    expect(Math.round(hi)).toBe(3957);
  });

  it('an island switches the COLUMN, it does not add a slab', () => {
    const solo = run({ pieces: shape('ushape') });
    const withIsland = run({ pieces: shape('ushape', true) });
    // Same worktops, so the same bracket key …
    expect(solo.price).toEqual({ type: 'range', lo: BRACKETS[2].solo[0], hi: BRACKETS[2].solo[1] });
    expect(withIsland.price).toEqual({ type: 'range', lo: BRACKETS[2].island[0], hi: BRACKETS[2].island[1] });
    // … even though the island did put another slab on the cutting plan.
    expect(withIsland.plan!.slabs.length).toBe(solo.plan!.slabs.length + 1);
  });

  it('one worktop slab plus an island is bracket 1 island, not bracket 2', () => {
    const r = run({ pieces: shape('galley', true) });
    expect(r.plan!.slabs.length).toBe(2);
    expect(r.price).toEqual({ type: 'range', lo: 2300, hi: 2800 });
  });

  it('Marble, Granite and Porcelain are POA with no price', () => {
    for (const mat of ['Marble', 'Granite', 'Porcelain'] as MatId[]) {
      const r = estimate({ mat, stone: bestFor(mat), pieces: shape('ushape', true), checked: {}, edgeIdx: null, lmRaw: '' });
      expect(MATS[mat].poa).toBe(true);
      expect(r.price).toEqual({
        type: 'text',
        text: 'Price on application',
        sr: `${mat} is priced by hand, tell us the room and we will price it properly`,
      });
      expect(r.poaHidden).toBe(false);
      expect(r.calcHidden).toBe(true);
      expect(r.statsHidden).toBe(true);
      expect(r.ctaHidden).toBe(true);
      expect(r.plan).toBeUndefined();
    }
    expect(MATS.Quartz.poa).toBe(false);
  });

  it('the Marble head names quartzite, and Granite reuses the Marble lead', () => {
    const m = estimate({ mat: 'Marble', stone: bestFor('Marble'), pieces: [], checked: {}, edgeIdx: null, lmRaw: '' });
    const g = estimate({ mat: 'Granite', stone: bestFor('Granite'), pieces: [], checked: {}, edgeIdx: null, lmRaw: '' });
    expect(m.poaTitleHTML).toBe('Marble and quartzite are priced <em>by hand</em>');
    expect(g.poaTitleHTML).toBe('Granite is priced <em>by hand</em>');
    expect(g.poaLead).toBe(m.poaLead);
  });

  it('past four worktop slabs it stops calculating', () => {
    const big: Piece[] = Array.from({ length: 5 }, () => ({ len: 6000, wid: 1500, th: 20, use: 'run' as UseId }));
    const r = run({ pieces: big });
    expect(r.price).toEqual({
      type: 'text',
      text: 'Priced by hand',
      sr: 'A kitchen this size is priced by hand, please get in touch',
    });
    expect(r.meta).toMatch(/ · beyond the estimator$/);
    expect(MAX_BRACKET).toBe(4);
  });

  it('no pieces at all shows an em dash, not a price', () => {
    const r = run({ pieces: [] });
    expect(r.price).toEqual({ type: 'text', text: '—', sr: 'Add your sizes to see a range' });
    expect(r.stSlabs).toBe('–');
    expect(r.stArea).toBe('–');
    expect(r.stJoints).toBe('–');
  });
});

/* ------------------------------------------------------------------ */

describe('input clamping', () => {
  it('clamps length and width into LIM', () => {
    expect(clamp(10, LIM.len)).toBe(LIM.len[0]);
    expect(clamp(99999, LIM.len)).toBe(LIM.len[1]);
    expect(clamp(10, LIM.wid)).toBe(LIM.wid[0]);
    expect(clamp(99999, LIM.wid)).toBe(LIM.wid[1]);
  });

  it('rounds before clamping, and falls to the FLOOR on junk', () => {
    expect(clamp('612.7', LIM.wid)).toBe(613);
    expect(clamp('nonsense', LIM.wid)).toBe(LIM.wid[0]);
    expect(clamp(NaN, LIM.len)).toBe(LIM.len[0]);
  });

  it('upstands clamp to 100–150, everything else to 100–1500', () => {
    expect(widRange({ use: 'upstand' })).toEqual([100, 150]);
    expect(widRange({ use: 'run' })).toEqual(LIM.wid);
    expect(clamp(900, widRange({ use: 'upstand' }))).toBe(150);
  });

  it('the packer clamps oversize pieces down to the usable slab too', () => {
    const plan = pack([{ len: 99999, wid: 99999, th: 20, use: 'run', lab: 'A' }], 'Quartz');
    // 6000 mm of length across a 3160 mm usable slab is two segments, one joint.
    expect(plan.joints).toBe(1);
    // …and the width is capped at the slab's usable 1560, not at LIM's 1500.
    expect(plan.slabs[0].placed[0].h).toBe(1500);
  });

  it('edge metres cap at 40 and ignore blanks, zero, negatives and junk', () => {
    expect(edgeMetres(true, 0, '999')).toBe(LIM.lm[1]);
    expect(edgeMetres(true, 0, '   ')).toBe(0);
    expect(edgeMetres(true, 0, '0')).toBe(0);
    expect(edgeMetres(true, 0, '-4')).toBe(0);
    expect(edgeMetres(true, 0, 'abc')).toBe(0);
    expect(edgeMetres(true, null, '6')).toBe(0);
    expect(edgeMetres(false, 0, '6')).toBe(0);
    // NOTE the source applies no LOWER clamp here, so 0.1 is charged as 0.1.
    expect(edgeMetres(true, 0, '0.1')).toBe(0.1);
  });
});

describe('the two priced extras', () => {
  it('removal is a flat 200 on both ends', () => {
    const r = run({ checked: { exRemoval: true } });
    expect(r.price).toEqual({ type: 'range', lo: 2000 + REMOVAL, hi: 2500 + REMOVAL });
    expect(r.adds).toBe('Includes taking your old worktop away.');
  });

  it('edging is £150–£300 a metre against the chosen profile', () => {
    const r = run({ checked: { exEdge: true }, edgeIdx: 0, lmRaw: '6' });
    expect(r.price).toEqual({ type: 'range', lo: 2000 + 6 * EDGE_RATE[0], hi: 2500 + 6 * EDGE_RATE[1] });
    expect(r.adds).toBe('Includes 6 m of eased edging.');
  });

  it('both together read as one sentence', () => {
    const r = run({ checked: { exRemoval: true, exEdge: true }, edgeIdx: 5, lmRaw: '8' });
    expect(r.adds).toBe(`Includes taking your old worktop away and 8 m of ${EDGES[5][0].toLowerCase()} edging.`);
  });

  it('the other three extras count in the meta line but cost nothing', () => {
    const r = run({ checked: { exWaterfall: true, exSplash: true, exSill: true } });
    expect(r.price).toEqual({ type: 'range', lo: 2000, hi: 2500 });
    expect(r.meta).toMatch(/· 3 extras$/);
    expect(r.addsHidden).toBe(true);
  });
});

describe('the catalogue', () => {
  it('has eighteen edge profiles', () => {
    expect(EDGES).toHaveLength(18);
  });

  it('lands on the same stone the original does', () => {
    expect(BEST).toEqual({ Marble: 'carrara-honed', Quartz: 'azul-shimmer', Granite: 'bianco-crystal' });
    expect(bestFor('Quartz').name).toBe('Azul Shimmer');
    expect(bestFor('Porcelain').name).toBe('Porcelain and sintered stone');
  });

  it('keeps the three buckets at their original sizes', () => {
    expect(MATERIALS.Quartz).toHaveLength(67);
    expect(MATERIALS.Marble).toHaveLength(45);
    expect(MATERIALS.Granite).toHaveLength(20);
  });

  it('paints porcelain with the most-asked-for marble, not a drawn stand-in', () => {
    /* Porcelain holds no slabs of its own. Anything can be printed on it, so
       the board borrows POPULAR.Marble[0] — the client's own preference order —
       and that resolves to a slab photo already in the catalogue, not a new
       asset. If this fails, the porcelain board is back on the drawn SVG. */
    expect(NO_CAT_TILE.Porcelain).toBe('carrara-honed');
    expect(POPULAR.Marble[0]).toBe(NO_CAT_TILE.Porcelain);
    const porcelain = bestFor('Porcelain');
    expect(porcelain.slug).toBe('');
    expect(faceSlug(porcelain, 'Porcelain')).toBe('carrara-honed');
    expect(tileURL(faceSlug(porcelain, 'Porcelain'))).toBe('/assets/slabs/carrara-honed.webp?v=3');
    /* and a bucket that HAS a catalogue keeps its own stone */
    expect(faceSlug(bestFor('Quartz'), 'Quartz')).toBe('azul-shimmer');
  });

  it('searches on synonyms, not just names', () => {
    const carrara = MATERIALS.Marble.find((s) => s.slug === 'carrara-honed')!;
    expect(matchStone(carrara, modalTerms('carrara'))).toBe(true);
    expect(matchStone(carrara, modalTerms('carrera'))).toBe(true); // STONE_FIXES
    expect(matchStone(carrara, modalTerms('matt'))).toBe(true); // STONE_WORDS matt -> honed
    expect(matchStone(carrara, modalTerms('black'))).toBe(false);
    expect(modalTerms('marble effect')).toEqual(['marbleeffect']);
  });
});

/**
 * The estimator's constants — assets/site.js:3590-3655, 3676-3686.
 *
 * Carried across unchanged. The old file declares them inside the estimator
 * IIFE; nothing here is derived, rounded or "tidied". Where the source has an
 * oddity (Granite is POA despite having a full catalogue; POA_LEAD.Granite is
 * a byte-identical copy of POA_LEAD.Marble) the oddity is reproduced.
 */

/** The four pricing buckets the material tabs switch between. */
export type MatId = 'Quartz' | 'Marble' | 'Granite' | 'Porcelain';

/** One `#estRows` row. `use` decides the width range and the island column. */
export interface Piece {
  len: number;
  wid: number;
  th: number;
  use: UseId;
}

/** A piece once `compute()` has stamped its A/B/C label on it — site.js:3925. */
export interface LabelledPiece extends Piece {
  lab: string;
}

export type UseId = 'run' | 'sink' | 'hob' | 'sinkhob' | 'splash' | 'upstand' | 'island';

/** The five extras' checkbox ids — site.js:3610. Order is load-bearing: the
 *  meta line counts them in this order. */
export const EXTRAS = ['exWaterfall', 'exSplash', 'exSill', 'exRemoval', 'exEdge'] as const;
export type ExtraId = (typeof EXTRAS)[number];

/** Slab size and behaviour per bucket — site.js:3590-3595.
 *  `rotate` lets pack() try a piece side-on; `poa` skips the calculator
 *  entirely; `noCat` hides the stone picker (porcelain has no catalogue). */
export const MATS: Record<MatId, { dims: { L: number; W: number }; rotate: boolean; poa: boolean; noCat?: boolean }> = {
  Quartz: { dims: { L: 3200, W: 1600 }, rotate: true, poa: false },
  Marble: { dims: { L: 2800, W: 1600 }, rotate: false, poa: true },
  Granite: { dims: { L: 3000, W: 1700 }, rotate: true, poa: true },
  Porcelain: { dims: { L: 3200, W: 1600 }, rotate: false, poa: true, noCat: true },
};

/** The stand-in "stone" for the bucket that has no catalogue — site.js:3596-3599. */
export const NO_CAT: Record<string, { name: string; mat: string; sup: string; slug: string; finish: string; stone: string; seed: number }> = {
  Porcelain: {
    name: 'Porcelain and sintered stone',
    mat: 'Porcelain',
    sup: '',
    slug: '',
    finish: '',
    stone: 'mist',
    seed: 41,
  },
};

/** Saw kerf and the unusable border of a slab, in mm — site.js:3600. */
export const KERF = 5;
export const TRIM = 20;

/**
 * The client's own price table — site.js:3601-3606.
 *
 * Keyed by SLAB COUNT (of the worktop pieces only, islands excluded), then by
 * column. An island does NOT add a slab to this key; it switches the column
 * from `solo` to `island`. See site.js:3944-3948.
 */
export const BRACKETS: Record<number, { solo: [number, number]; island: [number, number] }> = {
  1: { solo: [2000, 2500], island: [2300, 2800] },
  2: { solo: [3000, 3600], island: [3850, 4300] },
  3: { solo: [3850, 4300], island: [4350, 5000] },
  4: { solo: [4350, 5000], island: [5100, 5550] },
};

/** Past four slabs the calculator gives up and says so — site.js:3607. */
export const MAX_BRACKET = 4;

/** Flat add-on for taking the old worktop away — site.js:3608. */
export const REMOVAL = 200;

/** Milled edge profile, per linear metre, low and high — site.js:3609. */
export const EDGE_RATE: [number, number] = [150, 300];

/** Input limits — site.js:3611. `rows` is the "+ Add another piece" cap. */
export const LIM = {
  len: [300, 6000] as [number, number],
  wid: [100, 1500] as [number, number],
  lm: [0.5, 40] as [number, number],
  rows: 10,
};

/** Upstands get their own, much narrower width range — site.js:3612. */
export const UPSTAND: [number, number] = [100, 150];

/** The two thickness buttons on every row — site.js:3613. */
export const THICK = [20, 30] as const;

/** The "Used for" dropdown — site.js:3614-3622. */
export const USES: { id: UseId; label: string }[] = [
  { id: 'run', label: 'Worktop run' },
  { id: 'sink', label: 'Sink run' },
  { id: 'hob', label: 'Hob run' },
  { id: 'sinkhob', label: 'Sink and hob run' },
  { id: 'splash', label: 'Splashback' },
  { id: 'upstand', label: 'Upstands' },
  { id: 'island', label: 'Island' },
];

/** The quick-start kitchens — site.js:3623-3628. [len, wid, use]. */
export const SHAPES: Record<string, [number, number, UseId][]> = {
  straight: [[3000, 620, 'sinkhob']],
  lshape: [
    [3000, 620, 'sink'],
    [2200, 620, 'hob'],
  ],
  ushape: [
    [3000, 620, 'sink'],
    [2600, 620, 'hob'],
    [2200, 620, 'run'],
  ],
  galley: [
    [3000, 620, 'sink'],
    [3000, 620, 'hob'],
  ],
};

/** What "+ Island" pushes onto the row list — site.js:3629. */
export const ISLAND: Piece = { len: 2000, wid: 1000, th: 20, use: 'island' };

/** Presets dark enough to need light labels on the cutting plan — site.js:3630. */
export const DARKSTONES: Record<string, number> = { nerogold: 1, emperador: 1, goldveil: 1, fumo: 1 };

/**
 * The "priced by hand" copy — site.js:3676-3686.
 *
 * `_default` is assigned as `POA_LEAD.Marble` on the next line of the source
 * (site.js:3681), i.e. Granite and Marble deliberately share one paragraph.
 */
const POA_MARBLE_LEAD =
  'The price of the stone itself swings enormously here, from one block to the next and from one supplier to the next, so a calculator could only ever give you a number we could not stand behind. Send us what you already have and we will go and source it.';

export const POA_LEAD: Record<string, string> = {
  Marble: POA_MARBLE_LEAD,
  Granite: POA_MARBLE_LEAD,
  Porcelain:
    'Porcelain is cut on a waterjet rather than a saw, the slabs come from a much shorter list of suppliers, and the thin edges are mitred by hand to read as solid stone. That is real work and it varies job to job, so we price it properly rather than guess. Send us your plans and we will come back with a figure.',
  _default: POA_MARBLE_LEAD,
};

export const POA_HEAD: Record<string, string> = {
  Marble: 'Marble and quartzite are priced',
  Granite: 'Granite is priced',
  Porcelain: 'Porcelain is priced',
};

/** site.js:827. */
export const MAT_LABEL: Record<string, string> = {
  Quartz: 'Quartz',
  Marble: 'Marble & Quartzite',
  Granite: 'Granite',
  Porcelain: 'Porcelain',
};

/** site.js:828. */
export const matLabel = (m: string): string => MAT_LABEL[m] || m;

/** site.js:3703. Rounds, then clamps into `r`; a non-finite value falls to the
 *  RANGE FLOOR, not to zero. */
export const clamp = (v: number | string, r: [number, number]): number => {
  const n = Math.round(+v);
  return isFinite(n) ? Math.min(r[1], Math.max(r[0], n)) : r[0];
};

/** site.js:3704 — piece labels A, B, C … wrapping at Z. */
export const LAB = (i: number): string => String.fromCharCode(65 + (i % 26));

/** site.js:3705. */
export const useLabel = (id: string): string => (USES.find((u) => u.id === id) || USES[0]).label;

/** site.js:3706 — upstands are the one use with a different width range. */
export const widRange = (p: { use: string }): [number, number] => (p.use === 'upstand' ? UPSTAND : LIM.wid);

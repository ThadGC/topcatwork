/**
 * `compute()` — assets/site.js:3904-3965 — as a pure function.
 *
 * The old one writes straight into a dozen DOM nodes and returns nothing.
 * Every one of those writes becomes a field here, named after the element it
 * fed, so the vector table can assert the whole panel state at once and the
 * component stays a dumb renderer.
 *
 * Ordering matters and is preserved: the POA bail-out comes first, the stats
 * are written BEFORE the "no slabs" bail-out, and the meta line is written
 * before the over-four-slabs bail-out appends " · beyond the estimator" to it.
 */
import {
  BRACKETS,
  EDGE_RATE,
  EXTRAS,
  LAB,
  LIM,
  MATS,
  MAX_BRACKET,
  POA_HEAD,
  POA_LEAD,
  REMOVAL,
  matLabel,
  type ExtraId,
  type MatId,
  type Piece,
} from './constants';
import { EDGES } from './catalogue.data';
import { pack, type Plan } from './pack';

/** Just enough of a catalogue row for the meta line — site.js:3911, 3941. */
export interface EstimatorStone {
  name: string;
  mat?: string;
  finish?: string;
  slug?: string;
  sup?: string;
  stone?: string;
  seed?: number;
  kind?: string;
}

export interface EstimateInput {
  mat: MatId;
  stone: EstimatorStone;
  pieces: Piece[];
  /** The five extras, by checkbox id. Absent reads as unchecked. */
  checked: Partial<Record<ExtraId, boolean>>;
  /** Index into EDGES, or null while no profile has been chosen. */
  edgeIdx: number | null;
  /** The RAW text of `#estLm` — the source parses the string, not a number. */
  lmRaw: string;
}

/** What the price readout shows: an animated range, or a fixed phrase. */
export type PriceState =
  | { type: 'range'; lo: number; hi: number }
  | { type: 'text'; text: string; sr: string };

export interface Estimate {
  /** `#estAdds` hidden — site.js:3905, 3960. */
  addsHidden: boolean;
  /** `#estCalc` hidden — site.js:3907, 3921. */
  calcHidden: boolean;
  /** `#estPoa` hidden. */
  poaHidden: boolean;
  /** `#estStats` hidden. */
  statsHidden: boolean;
  /** `#estJnote` hidden — site.js:3908, 3933. */
  jnoteHidden: boolean;
  /** `#estPoaTitle` innerHTML, POA only. */
  poaTitleHTML?: string;
  /** `#estPoaLead` text, POA only. */
  poaLead?: string;
  /** `#estOutK` text. */
  outK: string;
  /** `#estStamp` text. */
  stamp: string;
  /** `#estCta` hidden. */
  ctaHidden: boolean;
  /** `#stSlabs` / `#stSlabsL`. */
  stSlabs?: string;
  stSlabsL?: string;
  /** `#stArea`. */
  stArea?: string;
  /** `#stJoins` / `#stJoinsL`. Note zero joints prints "none", not "0". */
  stJoints?: string;
  stJointsL?: string;
  /** `#estMeta` text. */
  meta?: string;
  /** `#estAdds` text, only when something was added. */
  adds?: string;
  price: PriceState;
  /** The cutting plan for `#estBoard`; absent on the POA path. */
  plan?: Plan;
}

/**
 * `edgeMetres()` — site.js:3880-3886.
 *
 * The upper limit is applied here; there is deliberately NO lower clamp on
 * this path, so 0.1 m is charged as 0.1 m even though the input's own `min`
 * is 0.5. A blank box, a zero, a negative or junk all read as "no edging".
 */
export function edgeMetres(edgeOn: boolean, edgeIdx: number | null, lmRaw: string): number {
  if (!edgeOn || edgeIdx === null) return 0;
  const raw = lmRaw.trim();
  if (raw === '') return 0;
  const v = parseFloat(raw);
  return isFinite(v) && v > 0 ? Math.min(LIM.lm[1], v) : 0;
}

/** site.js:3696 — the only escaping the panel does, and only for the POA head. */
const esc = (s: string | null | undefined): string =>
  String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c] as string);

export function estimate(input: EstimateInput): Estimate {
  const { mat, stone, pieces, checked, edgeIdx, lmRaw } = input;

  /* site.js:3906-3920 — the POA bail-out. Marble, Granite and Porcelain all
     take this path; only Quartz reaches the calculator. */
  if (MATS[mat].poa) {
    const noCat = !!(MATS[mat] || {}).noCat;
    return {
      addsHidden: true,
      calcHidden: true,
      poaHidden: false,
      statsHidden: true,
      jnoteHidden: true,
      poaTitleHTML: esc(POA_HEAD[mat] || matLabel(mat) + ' is priced') + ' <em>by hand</em>',
      poaLead: POA_LEAD[mat] || POA_LEAD._default,
      outK: 'Priced by hand',
      stamp: 'By appointment',
      ctaHidden: true,
      price: {
        type: 'text',
        text: 'Price on application',
        sr: mat + ' is priced by hand, tell us the room and we will price it properly',
      },
      meta: noCat ? stone.name : stone.name + (stone.finish ? ' · ' + stone.finish : ''),
    };
  }

  /* site.js:3921-3933 — the plan and the three stats. */
  const plan = pack(
    pieces.map((p, i) => ({ ...p, lab: LAB(i) })),
    mat,
  );
  const n = plan.slabs.length;
  const base = {
    addsHidden: true,
    calcHidden: false,
    poaHidden: true,
    statsHidden: false,
    outK: 'Your estimate',
    stamp: 'Indicative range',
    ctaHidden: false,
    stSlabs: n ? String(n) : '–',
    stSlabsL: n === 1 ? 'slab needed' : 'slabs needed',
    stArea: n ? plan.areaM2.toFixed(1) + ' m²' : '–',
    stJoints: n ? (plan.joints ? String(plan.joints) : 'none') : '–',
    stJointsL: plan.joints === 1 ? 'joint' : 'joints',
    jnoteHidden: !plan.joints,
    plan,
  };

  /* site.js:3934-3938 — nothing to price. */
  if (!n) {
    return {
      ...base,
      price: { type: 'text', text: '—', sr: 'Add your sizes to see a range' },
      meta: 'Add your sizes to see a range',
    };
  }

  /* site.js:3939-3943 — the meta line. `nx` counts ALL five extras, including
     the three that cost nothing yet. */
  const pcs = pieces.length;
  const nx = EXTRAS.reduce((s, id) => s + (checked[id] ? 1 : 0), 0);
  const meta =
    stone.name +
    ' · ' +
    (pcs === 1 ? '1 piece' : pcs + ' pieces') +
    ' · ' +
    (n === 1 ? '1 slab' : n + ' slabs') +
    (nx ? ' · ' + (nx === 1 ? '1 extra' : nx + ' extras') : '');

  /* site.js:3944-3948 — THE ISLAND RULE. The bracket key is the slab count of
     the worktops ALONE; the island is excluded from that pack and only flips
     the column. A kitchen that needs one worktop slab plus an island is
     bracket 1 / island, not bracket 2. */
  const worktops = pieces.filter((p) => p.use !== 'island');
  const island = worktops.length < pieces.length;
  const wSlabs = worktops.length
    ? pack(
        worktops.map((p, i) => ({ ...p, lab: LAB(i) })),
        mat,
      ).slabs.length
    : 0;
  const key = Math.max(1, wSlabs);

  /* site.js:3949-3953 — past four worktop slabs there is no table row. */
  if (key > MAX_BRACKET) {
    return {
      ...base,
      price: { type: 'text', text: 'Priced by hand', sr: 'A kitchen this size is priced by hand, please get in touch' },
      meta: meta + ' · beyond the estimator',
    };
  }

  /* site.js:3954-3962 — the table lookup and the two add-ons. */
  const br = BRACKETS[key][island ? 'island' : 'solo'];
  let lo = br[0];
  let hi = br[1];
  const added: string[] = [];
  if (checked.exRemoval) {
    lo += REMOVAL;
    hi += REMOVAL;
    added.push('taking your old worktop away');
  }
  const m = edgeMetres(!!checked.exEdge, edgeIdx, lmRaw);
  if (m) {
    lo += m * EDGE_RATE[0];
    hi += m * EDGE_RATE[1];
    added.push(m + ' m of ' + EDGES[edgeIdx as number][0].toLowerCase() + ' edging');
  }

  return {
    ...base,
    addsHidden: !added.length,
    ...(added.length ? { adds: 'Includes ' + added.join(' and ') + '.' } : null),
    meta,
    price: { type: 'range', lo, hi },
  };
}

/**
 * The slab cut-list packer — assets/site.js:3720-3779, ported line for line.
 *
 * This is NOT a per-square-metre calculator. It takes the user's pieces,
 * splits any run longer than a slab into jointed segments, then shelf-packs
 * the resulting parts onto as few slabs as it can. The slab COUNT is what the
 * price table is keyed on; the area is only ever printed as a stat.
 *
 * The one deliberate oddity kept from the source: it runs the whole first-fit
 * pass FOUR times, once per sort order, and keeps whichever pass used fewest
 * slabs. `pack()` in the source closes over `mat`; here it is an argument.
 */
import { KERF, LIM, MATS, TRIM, clamp, widRange, type LabelledPiece, type MatId } from './constants';

/** A free rectangle still available on a slab. */
export interface FreeRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** A part as laid down on a slab. `jl`/`jr` mark a cut joint on that edge. */
export interface PlacedPart extends FreeRect {
  lab: string;
  jl?: boolean;
  jr?: boolean;
}

export interface Slab {
  free: FreeRect[];
  placed: PlacedPart[];
}

export interface Plan {
  slabs: Slab[];
  joints: number;
  areaM2: number;
  dims: { L: number; W: number };
}

/** A part before placement — a whole piece, or one segment of a long run. */
interface Part {
  w: number;
  h: number;
  lab: string;
  jl?: boolean;
  jr?: boolean;
}

export function pack(list: LabelledPiece[], mat: MatId): Plan {
  /* site.js:3721-3734 — split long runs, counting one joint per extra cut. */
  const { L, W } = MATS[mat].dims;
  const uL = L - TRIM * 2;
  const uW = W - TRIM * 2;
  const parts: Part[] = [];
  let joints = 0;
  list.forEach((p) => {
    const len = clamp(p.len, LIM.len);
    const wid = Math.min(clamp(p.wid, widRange(p)), uW);
    if (len <= uL) {
      parts.push({ w: len, h: wid, lab: p.lab });
    } else {
      const n = Math.ceil(len / uL);
      const seg = Math.ceil(len / n);
      joints += n - 1;
      for (let s = 0; s < n; s++) {
        const w = Math.min(seg, len - seg * s);
        parts.push({ w, h: wid, lab: p.lab + '·' + (s + 1), jl: s > 0, jr: s < n - 1 });
      }
    }
  });

  /* site.js:3735-3758 — guillotine first-fit with a best-short-side score.
     Rotation is only tried on parts with no joint on either end, and it is
     penalised by 0.5 so an unrotated fit of equal score wins. */
  const rotOK = MATS[mat].rotate;
  function tryPlace(s: Slab, part: Part): boolean {
    let best: { ri: number; w: number; h: number; score: number } | null = null;
    s.free.forEach((r, ri) => {
      const orients: [number, number][] = [[part.w, part.h]];
      if (rotOK && !part.jl && !part.jr && part.w !== part.h) orients.push([part.h, part.w]);
      orients.forEach(([w, h], oi) => {
        if (w <= r.w && h <= r.h) {
          const score = Math.min(r.w - w, r.h - h) + oi * 0.5;
          if (!best || score < best.score) best = { ri, w, h, score };
        }
      });
    });
    if (!best) return false;
    const pick = best as { ri: number; w: number; h: number; score: number };
    const r = s.free[pick.ri];
    s.placed.push({ x: r.x, y: r.y, w: pick.w, h: pick.h, lab: part.lab, jl: part.jl, jr: part.jr });
    const remW = r.w - pick.w - KERF;
    const remH = r.h - pick.h - KERF;
    const out: FreeRect[] = [];
    if (remW > 0 && remH > 0) {
      if (remW >= remH) {
        out.push({ x: r.x + pick.w + KERF, y: r.y, w: remW, h: r.h }, { x: r.x, y: r.y + pick.h + KERF, w: pick.w, h: remH });
      } else {
        out.push({ x: r.x, y: r.y + pick.h + KERF, w: r.w, h: remH }, { x: r.x + pick.w + KERF, y: r.y, w: remW, h: pick.h });
      }
    } else if (remW > 0) out.push({ x: r.x + pick.w + KERF, y: r.y, w: remW, h: r.h });
    else if (remH > 0) out.push({ x: r.x, y: r.y + pick.h + KERF, w: r.w, h: remH });
    s.free.splice(pick.ri, 1, ...out.filter((o) => o.w >= 60 && o.h >= 60));
    return true;
  }

  /* site.js:3759-3776 — four sort orders, keep the cheapest result. */
  const ORDERS: ((a: Part, b: Part) => number)[] = [
    (a, b) => Math.max(b.w, b.h) - Math.max(a.w, a.h),
    (a, b) => b.w * b.h - a.w * a.h,
    (a, b) => b.h - a.h || b.w - a.w,
    (a, b) => b.w - a.w || b.h - a.h,
  ];
  let slabs: Slab[] | null = null;
  ORDERS.forEach((cmp) => {
    const out: Slab[] = [];
    [...parts].sort(cmp).forEach((part) => {
      for (const s of out) {
        if (tryPlace(s, part)) return;
      }
      const s: Slab = { free: [{ x: TRIM, y: TRIM, w: uL, h: uW }], placed: [] };
      out.push(s);
      tryPlace(s, part);
    });
    if (!slabs || out.length < slabs.length) slabs = out;
  });

  /* site.js:3777-3778 — area is of the PARTS, not of the slabs used. */
  const areaM2 = parts.reduce((s, p) => s + p.w * p.h, 0) / 1e6;
  return { slabs: slabs || [], joints, areaM2, dims: MATS[mat].dims };
}

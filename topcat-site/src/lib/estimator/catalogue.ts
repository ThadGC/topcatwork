/**
 * The stone catalogue behind the picker — assets/site.js:971-974, 1001-1015,
 * 1289-1311, 3631-3635, 3844-3856.
 *
 * The estimator does not read `src/data/stones.json`: the legacy panel has its
 * own in-script array with a per-stone palette preset and seed, and its own
 * key order, and both drive which stone the panel lands on. Ported as-is.
 */
import { MATERIALS, POPULAR, SLAB_TILES, SLAB_V, STONE_FIXES, STONE_WORDS, type CatalogueStone } from './catalogue.data';
import { MATS, NO_CAT, type MatId } from './constants';

export { MATERIALS, EDGES, type CatalogueStone } from './catalogue.data';

/** site.js:971-974 — the slab photo for a slug, or null to draw one instead. */
export function tileURL(slug: string | undefined | null): string | null {
  const t = slug && Object.prototype.hasOwnProperty.call(SLAB_TILES, slug) ? SLAB_TILES[slug] : null;
  return t ? '/assets/slabs/' + t + '.webp?v=' + SLAB_V : null;
}

/**
 * site.js:1001-1015 — which stone to open on.
 *
 * Walks POPULAR in order and takes the first light one; failing that, the
 * light stone with the fewest dark neighbours within two either side. The
 * modulo wrap in `dark()` is the source's, and it means the ends of the list
 * are scored against the other end.
 */
export function landingIndex(list: CatalogueStone[], mat: string): number {
  const n = list.length;
  const dark = (i: number) => list[((i % n) + n) % n].tone === 'dark';
  for (const slug of POPULAR[mat] || []) {
    const i = list.findIndex((s) => s.slug === slug);
    if (i >= 0 && !dark(i)) return i;
  }
  let best = -1;
  let score = Infinity;
  for (let i = 0; i < n; i++) {
    if (dark(i)) continue;
    let c = 0;
    for (let d = -2; d <= 2; d++) if (dark(i + d)) c++;
    if (c < score) {
      score = c;
      best = i;
    }
  }
  return best >= 0 ? best : 0;
}

/** site.js:3631-3635 — the landing slug per bucket, computed once. */
export const BEST: Record<string, string> = {};
Object.keys(MATERIALS).forEach((m) => {
  const list = MATERIALS[m];
  if (list && list.length) BEST[m] = list[landingIndex(list, m)].slug;
});

/** site.js:3844-3846 — the bucket's opening stone. Porcelain has no catalogue
 *  and falls to its NO_CAT stand-in. */
export function bestFor(m: string): CatalogueStone {
  if (MATS[m as MatId] && MATS[m as MatId].noCat) return NO_CAT[m] as CatalogueStone;
  return (MATERIALS[m].find((s) => s.slug === BEST[m]) || MATERIALS[m][0]) as CatalogueStone;
}

/**
 * The slab photo the no-catalogue buckets borrow.
 *
 * Porcelain holds no slabs of its own, so the board used to fall back to the
 * drawn stand-in in `NO_CAT` — a procedural SVG, obviously not a worktop.
 * Any pattern can be printed on porcelain, so it borrows the marble people ask
 * for most instead. That is `POPULAR.Marble[0]` — the client's own hand-ordered
 * preference list — resolved here rather than hard-coded, so re-ordering the
 * list re-points the picture. No new asset: this is a slug already in
 * `SLAB_TILES`, so `tileURL()` returns the same file the picker uses.
 */
export const NO_CAT_TILE: Record<string, string> = {};
Object.keys(NO_CAT).forEach((m) => {
  const slug = (POPULAR.Marble || [])[0];
  if (slug && Object.prototype.hasOwnProperty.call(SLAB_TILES, slug)) NO_CAT_TILE[m] = slug;
});

/** The slug whose slab photo a bucket should paint with: its own, or the
 *  borrowed one when the bucket has no catalogue. */
export function faceSlug(stone: { slug?: string; mat?: string }, mat: string): string | undefined {
  if (stone.slug) return stone.slug;
  return NO_CAT_TILE[stone.mat || mat];
}

/** The payload of the cross-page `topcat:stone` event — site.js:3848-3856. */
export interface StoneDetail {
  name?: string;
  mat?: string;
  stone?: string;
  seed?: number | string;
  slug?: string;
  sup?: string;
  src?: string;
}

/**
 * site.js:3860-3870 — resolve an inbound `topcat:stone` into a catalogue row.
 * Matches on slug, then on a case-insensitive name, then synthesises a row
 * from the bucket's best stone, keeping the incoming name (capped at 60).
 */
export function findStone(d: StoneDetail, mat: string, palettes: Record<string, unknown>): CatalogueStone {
  const m = d.mat && MATS[d.mat as MatId] ? d.mat : mat;
  if ((MATS[m as MatId] || {}).noCat) return NO_CAT[m] as CatalogueStone;
  const hit = (MATERIALS[m] || []).find(
    (s) => (d.slug && s.slug === d.slug) || (d.name && s.name.toLowerCase() === String(d.name).toLowerCase()),
  );
  if (hit) return hit;
  const ok = typeof d.stone === 'string' && Object.prototype.hasOwnProperty.call(palettes, d.stone);
  const fb = bestFor(m);
  return {
    name: String(d.name || fb.name).slice(0, 60),
    mat: m,
    sup: '',
    slug: '',
    stone: ok ? (d.stone as string) : fb.stone,
    seed: ok ? +(d.seed as number) || 0 : fb.seed,
  } as CatalogueStone;
}

/* -------------------------------------------------------------------------
   The picker's search — site.js:1289-1311.
   The estimator modal uses THIS matcher, not the collection page's
   attr/find one in lib/stones.ts. They are different matchers over
   different data and must not be merged.
   ------------------------------------------------------------------------- */

const hayCache: Record<string, string> = {};

/** site.js:1290-1296. `silica` is never set on this dataset, so `sil` is ''. */
function stoneHaystack(s: CatalogueStone): string {
  if (hayCache[s.slug]) return hayCache[s.slug];
  const kind = (s.kind || s.mat) + (s.mat === 'Quartz' ? ' engineered' : ' natural stone');
  return (hayCache[s.slug] = [s.name, kind, s.tone, s.hue, s.vein, s.finish, s.stone, ''].join(' ').toLowerCase());
}

/** site.js:1297-1301 — one-deletion fuzzy match, five characters or more. */
function nearlyIn(hay: string, t: string): boolean {
  if (t.length < 5) return false;
  for (let i = 0; i < t.length; i++) {
    if (hay.includes(t.slice(0, i) + t.slice(i + 1))) return true;
  }
  return false;
}

/** site.js:1302-1308. */
function termHits(hay: string, raw: string): boolean {
  const t = STONE_FIXES[raw] || raw;
  if (hay.includes(t)) return true;
  const rule = STONE_WORDS[t];
  if (rule) return rule.split(' ').every((grp) => grp.split('|').some((w) => hay.includes(w)));
  return nearlyIn(hay, t) || nearlyIn(hay, raw);
}

/** site.js:1309-1311. */
export function matchStone(s: CatalogueStone, terms: string[]): boolean {
  return terms.every((t) => termHits(stoneHaystack(s), t));
}

/** site.js:4155-4157 — the modal's own query normaliser, which glues only the
 *  "marble effect" family and none of the collection page's other phrases. */
export function modalTerms(q: string): string[] {
  const s = q.trim().toLowerCase();
  return s ? s.replace(/\b(marble|stone)\s+(effect|look|style)\b/g, '$1$2').split(/[\s,]+/).filter(Boolean) : [];
}

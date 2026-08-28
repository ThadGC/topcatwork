/**
 * The stone dataset.
 *
 * `src/data/stones.json` is machine-extracted from the 134 legacy pages under
 * `stones/` (132 detail pages + the collection index + the compare tool) and
 * must not be hand-edited — re-run `pnpm extract` instead. This module is the
 * only place that reads it, so the shape assertion lives here once.
 *
 * Two material taxonomies exist in the data and they deliberately disagree.
 * See NOTE ON MATERIALS below; picking one breaks either the filter UI or the
 * estimator deep-links.
 */
import raw from '@data/stones.json';

/* -------------------------------------------------------------------------
   Shared leaf shapes
   ------------------------------------------------------------------------- */

/** A `srcset` entry: `<url> <descriptor>`. Every stone image has exactly two. */
export interface SrcsetEntry {
  url: string;
  descriptor: string;
}

/** A legacy `<img>`, carried whole so the ported markup can be byte-faithful. */
export interface StoneImage {
  src: string;
  alt: string;
  srcset: SrcsetEntry[];
  sizes: string;
  loading: string;
  decoding: string;
}

/** `.btn-gold` / `.btn-ghost` in the source. */
export interface Cta {
  href: string;
  label: string;
  labelLong?: string;
  labelShort?: string;
  variant: 'gold' | 'ghost' | string;
}

/**
 * A heading with one `<em>` gold word. `html` keeps the markup, `accent` is
 * the emphasised word on its own; `text` is the flattened string used for
 * `aria-label`s and tests.
 */
export interface Heading {
  type?: string;
  level?: number;
  text: string;
  html: string;
  accent?: string;
}

/** A `<p>`; `html` is present only when the paragraph contains inline links. */
export interface RichText {
  type?: string;
  text: string;
  html?: string;
  classes?: string[];
}

export interface BreadcrumbItem {
  name: string;
  href: string | null;
  current: boolean;
}

export interface Breadcrumbs {
  back: { href: string; label: string } | null;
  items: BreadcrumbItem[];
}

export interface Seo {
  title: string;
  description: string;
  robots: string;
  canonical: string;
  lang: string;
  og: {
    type: string;
    title: string;
    description: string;
    url: string;
    siteName: string;
    image: string;
    imageWidth: string;
    imageHeight: string;
  };
  twitterCard: string;
  stylesheets: string[];
  preloadFonts: string[];
}

/* -------------------------------------------------------------------------
   Stone detail — ARCHETYPE 8, all 132 pages
   ------------------------------------------------------------------------- */

/** One row of `ul.stp-facts`. Every stone has exactly six, in this order:
 *  Stone, Finish, Typical slab, Thickness, Care, In daily use. */
export interface StoneFact {
  label: string;
  value: string;
}

/**
 * The estimator hand-off.
 *
 * Every CTA on a stone page carries `?stone=&mat=&p=&s=&slug=` through to the
 * home page's `#estimator`, parsed at assets/site.js:4587-4598. `p` keys into
 * the `STONES` palette map (site.js:706) and `s` seeds the procedural marble
 * canvas, so both are per-stone constants that must ride along in the data —
 * they are not derivable from anything else on the page.
 */
export interface StoneEstimator {
  stone: string;
  mat: string;
  /** Palette preset: calacatta | statuario | carrara | nerogold | … */
  p: string;
  /** Integer seed for the generator, carried as a string. */
  s: string;
  slug: string;
}

/** One `a.stile.mini` in the "More … to consider" row. Always exactly three. */
export interface RelatedStone {
  slug: string;
  href: string;
  name: string;
  finish: string;
  image: StoneImage;
  ariaLabel: string;
}

export interface StoneSections {
  /** `section.block > .wrap.prose.rise` — "About <material>", two paragraphs.
   *  Paragraph 1 is one of three material-specific strings; paragraph 2 is
   *  identical on all 132 pages. */
  about: { heading: Heading; paragraphs: RichText[] };
  /** "See it in your home, not on a screen" — identical except the CTA query. */
  homeVisit: { heading: Heading; sub: RichText; ctas: Cta[] };
  /** "More <material> to consider" — the three related tiles live in
   *  `StoneRecord.related`, not here. */
  related: { heading: Heading; sub: RichText; sourceNote: RichText };
  /** `section.cta-band` — "Make it yours". */
  ctaBand: { heading: Heading; paragraphs: RichText[]; ctas: Cta[] };
}

/**
 * The filter attributes the collection tiles carry as `data-*`.
 *
 * NOTE ON MATERIALS. `taxonomy.mat` is the *selector and pricing* bucket and
 * has only three values — Quartz (67), Granite (20), Marble (45) — because
 * quartzite and travertine collapse into "Marble" there. `StoneRecord.family`
 * is the *display* family and has five — quartz, quartzite, granite, marble,
 * travertine. The filter UI labels the bucket "Marble & Quartzite". Keep both.
 */
export interface StoneTaxonomy {
  mat: string;
  tone: string;
  hue: string;
  vein: string;
  finish: string;
  /** Token list matched word-for-word for the ~34 SCOPED search terms. */
  attr: string;
  /** Free-text haystack matched by substring for everything else. */
  find: string;
}

/** The `CMP_DATA` record lifted from stones/compare.html:303. */
export interface CompareRecord {
  slug: string;
  name: string;
  mat: string;
  shown: string;
  kind: string;
  range: string;
  finish: string;
  hue: string;
  tone: string;
  vein: string;
  care: string;
  wear: string;
  size: string;
  thick: string;
  desc: string;
  attr: string;
  find: string;
  /** 800w */
  img: string;
  /** 1600w */
  img2: string;
}

export interface StoneRecord {
  slug: string;
  source: string;
  /** The legacy URL, e.g. `/stones/carrara.html`. The canonical target. */
  url: string;
  seo: Seo;
  breadcrumbs: Breadcrumbs;
  jsonLd: unknown[];
  name: string;
  /** Display family: quartz | quartzite | granite | marble | travertine. */
  family: string;
  familyLabel: string;
  finish: string;
  /** `span.eyebrow.stp-kicker` — "Granite · Brushed". */
  kicker: string;
  materialLabel: string;
  lede: string;
  hero: {
    image: StoneImage;
    compare: { href: string; label: string };
  };
  facts: StoneFact[];
  estimator: StoneEstimator;
  ctas: Cta[];
  trust: { text: string; html: string }[];
  sections: StoneSections;
  related: RelatedStone[];
  taxonomy: StoneTaxonomy;
  compare: CompareRecord;
}

/* -------------------------------------------------------------------------
   Collection — ARCHETYPE 9
   ------------------------------------------------------------------------- */

export interface CollectionTile {
  slug: string;
  href: string;
  materialLabel: string;
  name: string;
  finish: string;
  image: StoneImage;
  data: StoneTaxonomy;
}

export interface CollectionFilter {
  label: string;
  id: string | null;
  classes: string[];
  /** Set on the four material tabs. */
  mat: string | null;
  /** Set on the three tone tabs. */
  tone: string | null;
  /** Set on the refine-drawer chips: hue | vein | finish. */
  facet: string | null;
  value: string | null;
}

export interface CollectionRecord {
  source: string;
  url: string;
  seo: Seo;
  breadcrumbs: Breadcrumbs;
  jsonLd: unknown[];
  hero: { heading: Heading; lede: RichText };
  search: { id: string; placeholder: string; type: string };
  filters: CollectionFilter[];
  countLabel: string;
  tiles: CollectionTile[];
  blocks: unknown[];
}

/* -------------------------------------------------------------------------
   Compare — ARCHETYPE 10
   ------------------------------------------------------------------------- */

export interface ComparePageRecord {
  source: string;
  url: string;
  seo: Seo;
  breadcrumbs: Breadcrumbs;
  jsonLd: unknown[];
  hero: { heading: Heading; lede: RichText };
  empty: { line: string; sub: string };
  buttons: { id: string; label: string; classes: string[] }[];
  blocks: unknown[];
}

export interface StonesData {
  counts: {
    htmlFiles: number;
    stones: number;
    collectionTiles: number;
    compareRecords: number;
    byFamily: Record<string, number>;
    byFinish: Record<string, number>;
  };
  collection: CollectionRecord;
  compare: { page: ComparePageRecord; data: CompareRecord[] };
  stones: StoneRecord[];
}

const data = raw as unknown as StonesData;

export const stones: StoneRecord[] = data.stones;
export const collection: CollectionRecord = data.collection;
export const comparePage: ComparePageRecord = data.compare.page;
/** The 132-entry `CMP_DATA` array, in its source order. */
export const compareData: CompareRecord[] = data.compare.data;
export const counts = data.counts;

const bySlug = new Map(stones.map((s) => [s.slug, s]));

export function getStone(slug: string): StoneRecord {
  const stone = bySlug.get(slug);
  if (!stone) throw new Error(`No stone with slug "${slug}"`);
  return stone;
}

/** Every stone slug, in the dataset's own order. Drives `generateStaticParams`. */
export function stoneSlugs(): string[] {
  return stones.map((s) => s.slug);
}

/* -------------------------------------------------------------------------
   The enquiry hand-off
   ------------------------------------------------------------------------- */

/**
 * WHERE "GET AN ESTIMATE FOR THIS STONE" GOES.
 *
 * The client, 28 Aug: "when someone goes to an individual stone page and they
 * click get an estimate for this stone, it's currently completely fucked. It's
 * supposed to go straight to the contact form with the stone preselected."
 *
 * The dataset carries the legacy destination — `/index.html?stone=&mat=&p=&s=
 * &slug=#estimator` — which cannot work in this build for two separate
 * reasons, both measured:
 *
 *   1. It lands on the home page, where the film's runway goes up UNDER the
 *      in-flight fragment scroll and `lockFilm` then absorbs the overshoot
 *      onto the hero. Final scrollY was 0 in every armed run. The lock is
 *      latched, one-way and deliberate (useFilm.ts:534), so no fragment below
 *      the film can survive it. That is the "random section" he is seeing.
 *   2. Nothing reads `?stone=` any more. The old build's dispatcher
 *      (assets/site.js:4585-4603) was dropped in the port while BOTH its
 *      consumers survived, so the parameters arrive and are ignored.
 *
 * `/contact/` has no film, no runway and no scrub, and the enquiry card is the
 * point of the page. `#ctaForm` rather than `#cta` because he asked for the
 * form: `#cta` puts the copy column on screen and leaves the fields below the
 * fold on a phone.
 *
 * `p` and `s` are dropped: both lookups this feeds (`chipKind` and the
 * estimator's `findStone`) resolve on slug then name, and neither reads them.
 * `mat` and `slug` stay because both are keys.
 *
 * ⛔ Built here rather than edited into `stones.json` — that file is machine
 * extracted and carries "must not be hand-edited", so a re-run of the
 * extractor would put all 792 legacy hrefs straight back.
 */
/**
 * WHERE EACH STONE-PAGE CTA GOES, now that the page carries the form itself.
 *
 * The client, 28 Aug: "make sure that the Get An Estimate For The Stone button
 * goes to that one. And if they hit the Get In Touch button, then it goes to
 * the contact page."
 *
 * So the two enquiry routes split by intent, and the labels split cleanly:
 * across all 132 stones the only labels on a legacy stone deep link are
 * "Get an estimate for this stone" (132), "Get an estimate" (132), "Book a
 * free home visit" (132) and "Get in touch" (264). Everything that is asking
 * about THIS STONE stays on the page and drops to the form; only "Get in
 * touch" leaves, which is the general enquiry and belongs on /contact/.
 */
export function stoneCtaHref(
  cta: { href: string; label: string },
  stone: Pick<StoneRecord, 'name' | 'slug' | 'estimator'>,
): string {
  if (!isLegacyStoneHref(cta.href)) return cta.href;
  return /get in touch/i.test(cta.label) ? stoneEnquiryHref(stone) : '#cta';
}

export function stoneEnquiryHref(stone: Pick<StoneRecord, 'name' | 'slug' | 'estimator'>): string {
  const q = new URLSearchParams({
    stone: stone.name,
    mat: stone.estimator.mat,
    slug: stone.slug,
  });
  return `/contact/?${q}#ctaForm`;
}

/** True for any legacy `/index.html?stone=…` deep link, whatever its hash. */
export function isLegacyStoneHref(href: string): boolean {
  return href.startsWith('/index.html?stone=');
}

/**
 * The same rewrite for links carried inside a rich-text blob rather than a
 * `Cta` record — `sections.related.sourceNote` is the one that does.
 */
export function rewriteStoneLinks(
  html: string,
  stone: Pick<StoneRecord, 'name' | 'slug' | 'estimator'>,
): string {
  return html.replace(/\/index\.html\?stone=[^"']*/g, stoneEnquiryHref(stone));
}

/* -------------------------------------------------------------------------
   The client-side search vocabulary
   -------------------------------------------------------------------------
   Both the collection filter (stones/index.html:280) and the compare picker
   (stones/compare.html:304) inline the same two tables. They are lifted here
   verbatim so the two React controllers cannot drift apart.
   ------------------------------------------------------------------------- */

/**
 * Terms that must match a whole word inside `data-attr` rather than a
 * substring of `data-find`. Without this, "black" matches "Absolute Black
 * Brushed"'s description as well as its colour, and the colour filter stops
 * meaning anything.
 */
export const SCOPED: Record<string, 1> = {
  anthracite: 1, beige: 1, black: 1, blue: 1, brown: 1, brushed: 1,
  charcoal: 1, cream: 1, dark: 1, filled: 1, gloss: 1, glossy: 1,
  granite: 1, graphite: 1, green: 1, grey: 1, honed: 1, ivory: 1,
  leathered: 1, light: 1, marble: 1, marbleeffect: 1, marblelook: 1,
  matt: 1, matte: 1, navy: 1, offwhite: 1, polished: 1, quartz: 1,
  quartzite: 1, satin: 1, silver: 1, teal: 1, travertine: 1, white: 1,
};

/** Misspellings the source corrects before matching. */
export const FIX: Record<string, string> = {
  calcutta: 'calacatta', calcatta: 'calacatta', calacata: 'calacatta',
  calacutta: 'calacatta', calcata: 'calacatta', carara: 'carrara',
  carrera: 'carrara', carrarra: 'carrara', statuairo: 'statuario',
  statuary: 'statuario', marquena: 'marquina', marchina: 'marquina',
  arabascato: 'arabescato', arabesco: 'arabescato', guatamala: 'guatemala',
};

/**
 * One-deletion fuzzy match, for terms of 5 characters or more. Verbatim from
 * the source `nearly()`; the length guard is what stops short words matching
 * everything.
 */
export function nearly(hay: string, t: string): boolean {
  if (t.length < 5) return false;
  for (let i = 0; i < t.length; i++) {
    if (hay.indexOf(t.slice(0, i) + t.slice(i + 1)) > -1) return true;
  }
  return false;
}

/** Whole-word containment: the source's `tok()`. */
export function tok(s: string, t: string): boolean {
  return ` ${s} `.indexOf(` ${t} `) > -1;
}

/**
 * The query normaliser shared by both search boxes. Glues the multi-word
 * phrases the token matcher would otherwise split — "marble effect" ->
 * "marbleeffect", "low maintenance" -> "lowmaintenance", "off-white" ->
 * "offwhite".
 */
export function normaliseQuery(value: string): string[] {
  const q = value
    .trim()
    .toLowerCase()
    .replace(/\b(marble|stone)\s+(effect|look|style)\b/g, '$1$2')
    .replace(/\blow\s+maintenance\b/g, 'lowmaintenance')
    .replace(/\boff[\s-]white\b/g, 'offwhite');
  return q ? q.split(/[\s,]+/).filter(Boolean) : [];
}

/** `attr`/`find` pair — the only two fields the term matcher reads. */
export interface Searchable {
  attr: string;
  find: string;
}

/** Does every search term hit this record? The source's `hits()`/term loop. */
export function matchesTerms(rec: Searchable, terms: string[]): boolean {
  return terms.every((raw) => {
    const t = FIX[raw] ?? raw;
    if (SCOPED[t]) return tok(rec.attr, t);
    return rec.find.indexOf(t) > -1 || nearly(rec.find, t);
  });
}

/** "Showing 1 stone" / "Showing 12 stones". */
export function countLabel(n: number): string {
  return `Showing ${n}${n === 1 ? ' stone' : ' stones'}`;
}

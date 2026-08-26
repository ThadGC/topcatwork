/**
 * The /worktops/ dataset — one hub, four counties, four towns.
 *
 * `src/data/locations.json` is the extractor's record of the nine live pages
 * under https://www.topcatworktops.co.uk/worktops/. Nothing here derives copy,
 * headings, links or structured data: the JSON is the page, and this module
 * only types it and looks records up by URL path.
 *
 * ---------------------------------------------------------------------------
 * THE URL SHAPE IS THE ONE THING TO GET RIGHT
 * ---------------------------------------------------------------------------
 * All nine live URLs are DIRECTORY urls:
 *
 *   /worktops/                          hub
 *   /worktops/<county>/                 4 counties
 *   /worktops/<county>/<town>/          4 towns
 *
 * next.config.ts pins `trailingSlash: false`, so `app/worktops/[...slug]`
 * exports `out/worktops/essex.html` and `out/worktops/essex/harlow.html`.
 * `scripts/postexport.mjs` then copies each to `<path>/index.html`, and it
 * finds them by scanning every `url` in src/data/*.json for one ending in a
 * slash — which is exactly what `record.url` is below. Renaming or dropping
 * that field silently 404s the whole section, so it is asserted in
 * tests/worktops.test.tsx rather than trusted.
 */
import raw from '@/data/locations.json';

import type { Breadcrumbs, Seo } from './stones';

/* --- inline copy -------------------------------------------------------- */

/**
 * One run of extracted copy. `html` carries the inline `<em>`/`<a>` the
 * legacy markup uses and `text` is the flattened fallback; <Rich> picks.
 */
export interface LocationRichText {
  text: string;
  html?: string;
  accent?: string;
}

/* --- content nodes ------------------------------------------------------ */

export interface HeadingNode extends LocationRichText {
  type: 'heading';
  level: 1 | 2;
  /** Only ever `margin-top:2rem`, on the towns' second h2. Carried, not guessed. */
  style?: string;
}

export interface LedeNode extends LocationRichText {
  type: 'lede';
  classes?: string[];
}

export interface ParagraphNode extends LocationRichText {
  type: 'paragraph';
}

export interface NoteNode extends LocationRichText {
  type: 'note';
  classes?: string[];
}

export interface CtaNoteNode extends LocationRichText {
  type: 'ctaNote';
  classes?: string[];
}

export interface ProseNode {
  type: 'prose';
  paragraphs: LocationRichText[];
  /** `lead-answer` on the counties — seo.css gives it the gold rule. */
  variant?: string;
}

export interface LinkListNode {
  type: 'linkList';
  variant?: string;
  items: { label: string; href: string }[];
}

export interface ChipsNode {
  type: 'chips';
  items: string[];
}

export interface TicksNode {
  type: 'ticks';
  items: { body: string }[];
}

export interface TableNode {
  type: 'table';
  caption: string;
  columns: string[];
  rows: { header: string; cells: string[] }[];
}

export interface StepsNode {
  type: 'steps';
  items: { step: string; title: string; body: string }[];
}

export interface AppGridNode {
  type: 'appGrid';
  items: { title: string; body: string; href: string }[];
}

export interface CardGridNode {
  type: 'cardGrid';
  items: { title: string; body: string; href: string; cta: string }[];
}

export interface CtaRowNode {
  type: 'ctaRow';
  items: LocationCta[];
}

export interface FaqNode {
  type: 'faq';
  items: { question: string; answer: string }[];
}

export type LocationNode =
  | HeadingNode
  | LedeNode
  | ParagraphNode
  | NoteNode
  | CtaNoteNode
  | ProseNode
  | LinkListNode
  | ChipsNode
  | TicksNode
  | TableNode
  | StepsNode
  | AppGridNode
  | CardGridNode
  | CtaRowNode
  | FaqNode;

/* --- blocks ------------------------------------------------------------- */

/**
 * One `<section>` of the page.
 *
 * `kind` picks the element (`section.block`, `section.faq`,
 * `section.cta-band`, `section.svc-hero`) and `region` says where it sits:
 * `lead-main` blocks are the left column of `.lead-grid` and everything else
 * is a direct child of `<main>`. The array is in DOM order, including the one
 * `main` block that follows the FAQ on every county and town page.
 */
export interface LocationBlock {
  kind: 'block' | 'faq' | 'ctaBand' | 'hero';
  classes: string[];
  region: 'main' | 'lead-main';
  content: LocationNode[];
}

/* --- hero --------------------------------------------------------------- */

export interface LocationCta {
  href: string;
  label: string;
  labelLong: string;
  labelShort: string;
  variant: 'gold' | 'ghost';
}

export interface LocationChip {
  kind: 'chip-google' | 'chip-guarantee' | 'chip-reason';
  text: string;
  /** The `.chip-legacy` fallback line, on the Google chip only. */
  legacy?: string;
  google?: { word: string; score: string };
  /** The `<b class="chip-mk">` lead-in — "10", "72". */
  mark?: string;
}

export interface LocationHero {
  background: string;
  heading: HeadingNode;
  lede: LedeNode;
  ctas: LocationCta[];
  chips: LocationChip[];
}

/* --- pages -------------------------------------------------------------- */

export interface LocationEnquiryForm {
  id: string;
  heading: LocationRichText;
  sub: LocationRichText;
  select: { id: string; name: string; label: string; options: string[] };
  submitLabel: string;
  note: string;
  done: string;
}

/** The hub, /worktops/. No hero, no aside form, three sections. */
export interface LocationHub {
  slug: string;
  source: string;
  url: string;
  seo: Seo;
  breadcrumbs: Breadcrumbs;
  jsonLd: unknown[];
  title: string;
  heading: LocationRichText;
  lede: LocationRichText;
  blocks: LocationBlock[];
}

/** A county or a town. Same archetype; `level` is the only switch. */
export interface LocationRecord {
  slug: string;
  source: string;
  url: string;
  seo: Seo;
  breadcrumbs: Breadcrumbs;
  jsonLd: unknown[];
  enquiryForm: LocationEnquiryForm | null;
  title: string;
  heading: LocationRichText;
  lede: LocationRichText;
  hero: LocationHero;
  faq: { heading: HeadingNode; items: { question: string; answer: string }[] };
  ctaBand: LocationBlock;
  body: LocationBlock[];
  blocks: LocationBlock[];
  level: 'county' | 'town';
  county: string;
  town: string | null;
  /** The URL segments under /worktops/ — `['essex']`, `['essex','harlow']`. */
  path: string[];
}

interface LocationsFile {
  index: LocationHub;
  locations: LocationRecord[];
}

const data = raw as unknown as LocationsFile;

/* --- lookups ------------------------------------------------------------ */

export function getHub(): LocationHub {
  return data.index;
}

export function allLocations(): LocationRecord[] {
  return data.locations;
}

/**
 * Every route below /worktops/, as `generateStaticParams` wants it: eight
 * arrays, four of length 1 and four of length 2. Sorted so the build order —
 * and the exported file list — is stable across machines.
 */
export function locationPaths(): string[][] {
  return data.locations
    .map((location) => location.path)
    .slice()
    .sort((a, b) => a.join('/').localeCompare(b.join('/')));
}

/** Look a page up by its `path` segments. Throws rather than 404ing silently. */
export function getLocation(path: string[]): LocationRecord {
  const key = path.join('/');
  const found = data.locations.find((location) => location.path.join('/') === key);
  if (!found) {
    throw new Error(
      `No /worktops/ record for "${key}". Known: ${locationPaths()
        .map((p) => p.join('/'))
        .join(', ')}`,
    );
  }
  return found;
}

/** The nine live URLs, hub first. Used by the postexport guard in the tests. */
export function locationUrls(): string[] {
  return [data.index.url, ...data.locations.map((location) => location.url)];
}

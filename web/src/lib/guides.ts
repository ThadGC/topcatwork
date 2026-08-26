/**
 * The guides dataset — the nine long-form articles under /guides/ plus the hub.
 *
 * `src/data/guides.json` is machine-extracted from the ten legacy files in
 * `guides/` and must not be hand-edited — re-run `pnpm extract` instead. This
 * module is the only place that reads it, so the shape assertion lives here
 * once, exactly as `src/lib/stones.ts` does for the 134 stone pages.
 *
 * ---------------------------------------------------------------------------
 * THE DOCUMENT MODEL, AND WHY IT IS A NODE LIST RATHER THAN NAMED SLOTS
 * ---------------------------------------------------------------------------
 * The stone archetype has fixed slots (hero, about, homeVisit, related,
 * ctaBand) because all 132 pages are the same 299 lines. The guides are not:
 * they are editorial, they run 4 to 8 body sections, and the comparison table
 * appears first on five of them, second on two and not at all on two more.
 * Modelling that as named slots means a slot per guide, so the extractor
 * emits an ORDERED LIST of blocks instead and the template walks it.
 *
 * Consequently the ONLY invariant the template may rely on is the node type.
 * It must never assume a table exists, never assume a fixed section count, and
 * never re-order. `tests/guides.test.tsx` pins the counts that do hold.
 *
 * ---------------------------------------------------------------------------
 * `blocks` vs `body` — USE `blocks`
 * ---------------------------------------------------------------------------
 * The extractor emits both. They are not the same list:
 *
 *   blocks   the whole document in source order, including the `faq` and
 *            `ctaBand` blocks — 8 to 11 entries.
 *   body     the same list filtered to `kind === 'block'`, i.e. the prose
 *            sections only, with the FAQ and the CTA band dropped.
 *
 * Rendering `body` therefore silently loses the FAQ accordion and the closing
 * CTA band from every one of the nine pages. `body` is kept in the type below
 * because it is in the data, but nothing in the port reads it.
 *
 * ---------------------------------------------------------------------------
 * `region` — THE TWO-COLUMN SPLIT
 * ---------------------------------------------------------------------------
 * Each block carries `region: 'main' | 'lead-main'`. In the source the article
 * opens full width (h1, byline, lead answer), then a `.lead-grid` puts the
 * body sections in `.lead-main` beside a `.lead-aside` holding the enquiry
 * form, then the FAQ and Related go full width again. `region` IS that split,
 * and `<GuideArticle>` groups the contiguous `lead-main` run on it rather than
 * hard-coding "everything from index 1 to length - 3".
 */
import raw from '@data/guides.json';

import type { Breadcrumbs, Cta, Heading, RichText, Seo } from './stones';

/* -------------------------------------------------------------------------
   Content nodes — the eleven types the extractor emits
   ------------------------------------------------------------------------- */

/**
 * `h1` … `h3`. `html` carries the one `<em>` gold word service.css paints
 * (`em{font-style:normal;color:var(--gold-soft)}`), which is the site's whole
 * heading rhythm — "The maintenance <em>question</em>". Render it through
 * <Rich>, never rebuilt from `text` + `accent`.
 *
 * THE LEVEL IS SEO SURFACE. These pages rank on their heading hierarchy, so
 * `level` is mapped straight through: exactly one h1 per page, h2 for every
 * body section, and no h3 anywhere in the article body (the only h3s on a
 * guide page are the enquiry form's and the hub's card titles).
 */
export type GuideHeading = Heading & { type: 'heading'; level: number };

/** `p.byline` — the author line and the review date, split for the hairline. */
export interface GuideByline {
  type: 'byline';
  /** Flattened "author + reviewed", for aria-labels and tests. */
  text: string;
  /** "Written by Nick, Managing Director, Topcat Worktops." */
  author: string;
  /** "Last reviewed 7 August 2026" — rendered in `span.reviewed`. */
  reviewed: string;
}

/**
 * `div.prose`, one or more `<p>`.
 *
 * `variant` is `'lead-answer'` on the opening block of all nine guides and
 * absent everywhere else. seo.css hangs the gold rule and the larger type off
 * `.lead-answer`, so the class must reach the DOM as `prose lead-answer`.
 */
export interface GuideProse {
  type: 'prose';
  paragraphs: RichText[];
  variant?: string;
}

/**
 * `table.tbl` inside `div.tbl-wrap` (which is what makes it scroll on a phone
 * instead of blowing the layout out — `.tbl` has `min-width:520px`).
 *
 * INVARIANT: `columns.length === row.cells.length + 1`. The first column is
 * the row-header column, carried as `row.header` and emitted as
 * `<th scope="row">`; `columns[0]` is its `<th scope="col">`, and on four of
 * the seven tables it is deliberately the empty string.
 */
export interface GuideTable {
  type: 'table';
  caption: string;
  columns: string[];
  rows: { header: string; cells: string[] }[];
}

/** `div.faq-grid` — `<details>`/`<summary>`, not the home page's tab widget. */
export interface GuideFaqList {
  type: 'faq';
  items: { question: string; answer: string }[];
}

/** `div.rel-cols` — "More guides" / "Materials", each a `ul.rel`. */
export interface GuideRelatedColumns {
  type: 'relatedColumns';
  columns: { title: string; links: { label: string; href: string }[] }[];
}

/** A bare `<p>`; only the CTA band uses one. */
export type GuideParagraph = RichText & { type: 'paragraph' };

/** `div.cta-row` — `.btn-gold` / `.btn-ghost`, in source order. */
export interface GuideCtaRow {
  type: 'ctaRow';
  items: Cta[];
}

/** `p.cta-note` — the small print under the CTA row. */
export interface GuideCtaNote {
  type: 'ctaNote';
  text: string;
  classes?: string[];
}

/** `p.lede` — the hub only. */
export interface GuideLede {
  type: 'lede';
  text: string;
  html?: string;
  classes?: string[];
}

/** `div.mgrid` of `a.mcard` — the hub's nine guide cards. */
export interface GuideCardGrid {
  type: 'cardGrid';
  items: { title: string; body: string; href: string; cta: string }[];
}

export type GuideNode =
  | GuideHeading
  | GuideByline
  | GuideProse
  | GuideTable
  | GuideFaqList
  | GuideRelatedColumns
  | GuideParagraph
  | GuideCtaRow
  | GuideCtaNote
  | GuideLede
  | GuideCardGrid;

/* -------------------------------------------------------------------------
   Blocks
   ------------------------------------------------------------------------- */

/**
 * One `<section>` of the document.
 *
 * `classes` is the section's class list as found — `['block']`, `['faq']` or
 * `['cta-band']` — and is emitted verbatim rather than derived from `kind`,
 * because content.css keys off the class and not off anything we invent.
 */
export interface GuideBlock {
  kind: 'block' | 'faq' | 'ctaBand';
  classes: string[];
  region: 'main' | 'lead-main';
  content: GuideNode[];
}

/* -------------------------------------------------------------------------
   Pages
   ------------------------------------------------------------------------- */

/** Shared by the nine articles and the hub. */
interface GuidePageBase {
  slug: string;
  source: string;
  url: string;
  seo: Seo;
  breadcrumbs: Breadcrumbs;
  /**
   * The page's structured-data graphs, carried whole.
   *
   * Nine articles: `[[Article, BreadcrumbList]]`. The hub:
   * `[[HomeAndConstructionBusiness, BreadcrumbList]]`.
   *
   * ⚠️ THERE IS NO FAQPage ON ANY GUIDE. Eight of the nine render a visible
   * FAQ accordion, so the obvious "improvement" is to synthesise FAQPage
   * markup for them. Do not. The live pages do not emit it (checked against
   * all ten saved responses), these pages rank as they are, and inventing
   * schema is a content change wearing a port's clothes.
   */
  jsonLd: unknown[];
  title: string;
  heading: Heading;
  blocks: GuideBlock[];
  /** `blocks` filtered to `kind === 'block'`. Nothing reads it — see above. */
  body: GuideBlock[];
}

export interface GuideRecord extends GuidePageBase {
  lede: RichText | null;
  hero: unknown | null;
  faq: { heading: Heading; items: { question: string; answer: string }[] } | null;
  ctaBand: unknown | null;
  /** The `.lead-aside` enquiry form, rendered by <QuickForm>. */
  enquiryForm: unknown | null;
}

export interface GuidesIndexRecord extends GuidePageBase {
  lede: RichText | null;
  enquiryForm: unknown | null;
}

interface GuidesData {
  counts: { htmlFiles: number; guides: number };
  index: GuidesIndexRecord;
  guides: GuideRecord[];
}

const data = raw as unknown as GuidesData;

/* -------------------------------------------------------------------------
   Accessors
   ------------------------------------------------------------------------- */

/** The nine articles, in the extractor's order (alphabetical by slug). */
export const guides: GuideRecord[] = data.guides;

/** `/guides/` — the hub. */
export const guidesIndex: GuidesIndexRecord = data.index;

export const guideCounts = data.counts;

/**
 * Resolve a slug to its record.
 *
 * Throws rather than returning undefined: with `dynamicParams = false` every
 * slug reaching this function came from `generateStaticParams`, so an unknown
 * one is a build-time bug and should stop the build, not render an empty page.
 */
export function getGuide(slug: string): GuideRecord {
  const guide = guides.find((g) => g.slug === slug);
  if (!guide) throw new Error(`unknown guide slug: ${slug}`);
  return guide;
}

/** Every article slug — the input to `generateStaticParams`. */
export function guideSlugs(): string[] {
  return guides.map((g) => g.slug);
}

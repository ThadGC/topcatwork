/**
 * The services dataset — the hub at `/services/` and the nine detail pages.
 *
 * `src/data/services.json` is machine-extracted from the ten legacy files
 * under `services/` and must not be hand-edited — re-run `pnpm extract`.
 * This module is the only place that reads it, so the shape assertion lives
 * here once, exactly as `lib/stones.ts` does for the stone archetype.
 *
 * ---------------------------------------------------------------------------
 * TWO FAMILIES IN ONE FOLDER — this is the thing to know before touching it
 * ---------------------------------------------------------------------------
 * `/services/` and `/services/<slug>.html` do NOT share a stylesheet, a
 * chrome variant or a page skeleton. The legacy <head>s say so outright:
 *
 *   /services/               -> /assets/site.css          (Family A, `rich`)
 *   /services/<slug>.html    -> /services/service.css      (Family B, `lite`)
 *                               + /assets/footer.css + /assets/nav.css
 *
 * The hub is the home page's own sections re-used verbatim behind a
 * `.page-head` masthead — #services, #process, #why, #reviews and #cta are
 * byte-for-byte identical to index.html's, which was verified against the
 * saved live HTML rather than assumed. The nine detail pages are the
 * content-styled `.svc-hero` + `.lead-grid` skeleton that /trade/ also uses.
 *
 * That is why there is no `app/services/layout.tsx`: a layout there would
 * pull content.css onto the hub as well. The Family-B shell lives one level
 * down, in `app/services/[slug]/layout.tsx`.
 *
 * ---------------------------------------------------------------------------
 * URL SHAPE
 * ---------------------------------------------------------------------------
 * The nine detail URLs are `.html` leaves and the hub is a directory URL:
 *
 *   /services/kitchen-worktops      exported directly (trailingSlash:false)
 *   /services/                           out/services.html -> out/services/index.html
 *                                        by scripts/postexport.mjs
 *
 * Both canonicals in the data already say exactly that, so nothing here
 * derives a URL — see the assertions in tests/services.test.tsx.
 */
import raw from '@data/services.json';

import type { ServiceOption } from './form/serviceOptions';
import type { Breadcrumbs, Cta, Heading, RichText, Seo } from './stones';

export type { Breadcrumbs, Cta, Heading, RichText, Seo };

/* -------------------------------------------------------------------------
   The hero chip row
   -------------------------------------------------------------------------
   Carried in the data but NOT read by the renderer: <HeroChips> already
   holds the same four chips as markup, including the Google mark's four
   coloured paths and the `.chip-legacy` fallback that no text extraction can
   express. The record is kept so a test can prove the two have not drifted.
   ------------------------------------------------------------------------- */

export interface HeroChip {
  kind: string;
  text: string;
  legacy?: string;
  mark?: string;
  google?: { word: string; score: string };
}

/* -------------------------------------------------------------------------
   Body content — the eight node types the nine pages are built from
   ------------------------------------------------------------------------- */

/** `<p>` inside `.wrap.prose.rise`. Never carries inline markup on these pages. */
export interface ParagraphNode {
  type: 'paragraph';
  text: string;
}

/** `<h2>` with one `<em>` gold word — "What we <em>make</em>". */
export interface HeadingNode extends Heading {
  type: 'heading';
  level: number;
}

/** `<p class="sub">`. `html` appears where the copy contains `&amp;`. */
export interface SubNode extends RichText {
  type: 'sub';
}

/** `.feat-grid` — four to six `.feat` tiles of `<h3>` + `<p>`. */
export interface FeaturesNode {
  type: 'features';
  items: { title: string; body: string }[];
}

/** `.mats` — the material and cross-sell link chips. `note` is `.mat-note`. */
export interface LinkChipsNode {
  type: 'linkChips';
  items: { label: string; href: string; note?: string }[];
}

/** `.steps` — always four `.step`s of `.n` + `<h3>` + `<p>`. */
export interface StepsNode {
  type: 'steps';
  items: { step: string; title: string; body: string }[];
}

/** `ul.ticks` — `<li><strong>title</strong>body</li>`, no separator element. */
export interface TicksNode {
  type: 'ticks';
  items: { title: string; body: string }[];
}

/** `.cta-inline` — the two mid-page enquiry prompts. */
export interface CtaInlineNode {
  type: 'ctaInline';
  line: Heading;
  sub: RichText;
  ctas: Cta[];
}

export type ContentNode =
  | ParagraphNode
  | HeadingNode
  | SubNode
  | FeaturesNode
  | LinkChipsNode
  | StepsNode
  | TicksNode
  | CtaInlineNode;

/**
 * One `<section>` of the body.
 *
 * `region` is where the section sits relative to the enquiry aside:
 * `lead-main` is inside `.lead-grid > .lead-main`, beside the sticky form;
 * `main` is full width, below the grid. The eight body sections split
 * 8 / 1 on every one of the nine pages — the "More of what we do" cross-sell
 * is the one that escapes the grid — but the field is read rather than
 * assumed, so a page that differs renders correctly instead of silently
 * losing its column.
 */
export interface BodyBlock {
  kind: 'block' | 'ctaInline';
  classes: string[];
  region: 'main' | 'lead-main';
  content: ContentNode[];
}

/* -------------------------------------------------------------------------
   The parts that are not body blocks
   ------------------------------------------------------------------------- */

export interface ServiceHero {
  /** Inline `background-image`, source-relative: `../assets/site/…webp`.
   *  Resolves against `/services/<slug>.html`, i.e. to `/assets/site/…`. */
  background: string;
  heading: HeadingNode;
  lede: RichText;
  ctas: Cta[];
  chips: HeroChip[];
}

/** `section.block.faq` — a plain `<details>` accordion, no controller. */
export interface ServiceFaq {
  heading: HeadingNode;
  items: { question: string; answer: string }[];
}

/** `section.cta-band` — the closing ask. */
export interface ServiceCtaBand {
  heading: HeadingNode;
  paragraphs: RichText[];
  ctas: Cta[];
  note: string | null;
}

/** `form.qform#qform` in `aside.lead-aside`; rendered by <QuickForm>. */
export interface EnquiryForm {
  id: string;
  heading: Heading;
  sub: RichText;
  fields: {
    id: string;
    name: string;
    type: string;
    placeholder: string;
    autocomplete: string;
    label: string;
  }[];
  select: { id: string; name: string; label: string; options: string[] };
  submitLabel: string;
  note: string;
  done: string;
}

export interface ServiceRecord {
  slug: string;
  source: string;
  /** `/services/<slug>.html` — the canonical target. */
  url: string;
  seo: Seo;
  breadcrumbs: Breadcrumbs;
  jsonLd: unknown[];
  enquiryForm: EnquiryForm;
  title: string;
  heading: Heading;
  lede: RichText;
  hero: ServiceHero;
  faq: ServiceFaq;
  ctaBand: ServiceCtaBand;
  /** The eight middle sections, in source order, hero/faq/ctaBand excluded. */
  body: BodyBlock[];
  /** `body` again with hero, faq and ctaBand folded back in. Unused here. */
  blocks: unknown[];
}

/** The hub. Its sections are the home page's, so only the <head> is read. */
export interface ServicesIndexRecord {
  slug: 'index';
  source: string;
  /** `/services/` — a directory URL, restored by scripts/postexport.mjs. */
  url: string;
  seo: Seo;
  jsonLd: unknown[];
  title: string;
  heading: Heading;
  blocks: unknown[];
}

export interface ServicesData {
  counts: { htmlFiles: number; services: number };
  index: ServicesIndexRecord;
  services: ServiceRecord[];
}

const data = raw as unknown as ServicesData;

export const services: ServiceRecord[] = data.services;
export const servicesIndex: ServicesIndexRecord = data.index;
export const counts = data.counts;

const bySlug = new Map(services.map((s) => [s.slug, s]));

export function getService(slug: string): ServiceRecord {
  const service = bySlug.get(slug);
  if (!service) throw new Error(`No service with slug "${slug}"`);
  return service;
}

/** Every service slug, in the dataset's own order. Drives generateStaticParams. */
export function serviceSlugs(): string[] {
  return services.map((s) => s.slug);
}

/**
 * The hub's masthead copy.
 *
 * `index.heading` gives the `<h1>`, but the lede is the paragraph inside the
 * extracted `.page-head-in` group rather than a top-level field — the
 * extractor sets `index.lede` to null on this page. Pulled out here so
 * app/services/page.tsx passes a string to <PageHead> and no page component
 * has to walk the block tree.
 */
export function servicesIndexLede(): string {
  const head = servicesIndex.blocks[0] as
    | { content?: { content?: { type?: string; text?: string }[] }[] }
    | undefined;
  const nodes = head?.content?.[0]?.content ?? [];
  const paragraph = nodes.find((n) => n.type === 'paragraph');
  if (!paragraph?.text) {
    throw new Error('services.json: the /services/ page-head lost its paragraph');
  }
  return paragraph.text;
}

/* -------------------------------------------------------------------------
   THE ENQUIRY THAT STAYS ON THE PAGE
   -------------------------------------------------------------------------
   The client, 28 Aug, on the nine service pages: "instead of having a call to
   action above the footer, I want it to be an actual form. The form with the
   service that they've selected and what they are looking for. This also helps
   TopCat track where people enquired from. And all the CTAs that talk about
   getting an estimate on those individual pages go to the bottom of the page
   to that form instead of the individual contact page."

   This is the same move the 132 stone pages made earlier the same day, so it
   is deliberately the same shape: `serviceCtaHref` here is the sibling of
   `stoneCtaHref` in ./stones, and the page swaps `section.cta-band` for the
   shared <Cta/> card.
   ------------------------------------------------------------------------- */

/**
 * The label this page's enquiry travels under.
 *
 * The values are NOT invented: they are the nine options of the aside's own
 * `#qfService` select (`enquiryForm.select.options`), so a service-page
 * enquiry reads in TopCat's inbox exactly like every other one and the field
 * stays sortable. That is why "Outdoor Spaces" sends as "Outdoor kitchens"
 * and why the two bathroom pages share a label.
 *
 * ⚠️ Two slugs map to one label on purpose — /services/vanity-tops and
 * /services/bathroom-worktops are both "Bathrooms and vanity tops". They are
 * still told apart in the email by `page`, which buildPayload sends as
 * location.pathname on every submission.
 */
const ENQUIRY_LABELS: Record<string, ServiceOption> = {
  'kitchen-worktops': 'Kitchen worktops',
  'kitchen-islands': 'Kitchen islands',
  splashbacks: 'Splashbacks',
  'vanity-tops': 'Bathrooms and vanity tops',
  'bathroom-worktops': 'Bathrooms and vanity tops',
  'outdoor-kitchens': 'Outdoor kitchens',
  fireplaces: 'Fireplaces',
  'dining-tables': 'Dining tables',
  'commercial-worktops': 'Commercial',
};

/**
 * `undefined` rather than a guess for an unknown slug: an enquiry with no
 * service is a small loss, one carrying the wrong service is a real one.
 */
export function serviceEnquiryLabel(slug: string): ServiceOption | undefined {
  return ENQUIRY_LABELS[slug];
}

/**
 * Re-point one CTA at the form now standing at the foot of the page.
 *
 * ⛔ ONLY `/contact/`. Each of the four enquiry CTAs on these pages ships as
 * `<a href="/contact/">Get your free quote</a>` and is paired with a
 * `tel:+448000982812` button; the body also links sibling services, `/stones/`
 * and `/materials/porcelain-worktops.html`. Re-pointing anything but the
 * quote button would strand the visitor on the page they are already reading,
 * so everything else falls through untouched.
 */
export function serviceCtaHref(cta: Cta): string {
  return cta.href === '/contact/' ? '#cta' : cta.href;
}

/** The same rewrite across a whole row. */
export function serviceCtas(ctas: Cta[]): Cta[] {
  return ctas.map((cta) => ({ ...cta, href: serviceCtaHref(cta) }));
}

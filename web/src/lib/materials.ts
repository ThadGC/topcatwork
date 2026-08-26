/**
 * The materials dataset — ARCHETYPE 6 (`/materials/`) and 7
 * (`/materials/<slug>.html`, five pages).
 *
 * `src/data/materials.json` is machine-extracted from the six legacy files
 * under `materials/` and must not be hand-edited — re-run `pnpm extract`.
 * This module is the only place that reads it, so the shape assertion lives
 * here once, exactly as `lib/stones.ts` does for the stone archetypes.
 *
 * It also owns ONE thing the legacy pages do not have: the join from a
 * material page to the stones catalogue. See STONE CROSS-LINKS at the bottom.
 */
import raw from '@data/materials.json';

import { collection, stones, type Breadcrumbs, type Cta, type Seo } from '@/lib/stones';

/* -------------------------------------------------------------------------
   Leaf shapes
   ------------------------------------------------------------------------- */

/** A heading with at most one `<em>` gold word — `Quartz <em>worktops</em>`. */
export interface MaterialHeading {
  type?: string;
  level?: number;
  text: string;
  html: string;
  accent?: string;
}

/** A `<p>`; the material copy carries no inline links, so `html` is rare. */
export interface MaterialText {
  type?: string;
  text: string;
  html?: string;
  classes?: string[];
}

/** One `.fact` of `dl.facts` — a `<dt>`/`<dd>` pair. */
export interface MaterialFact {
  label: string;
  value: string;
}

/** One `a.mcard` on the hub grid. */
export interface MaterialCard {
  title: string;
  body: string;
  href: string;
  cta: string;
}

/** One `a.app` of `.appgrid` — "Not only kitchens". */
export interface MaterialApp {
  title: string;
  body: string;
  href: string;
}

/** One `.step` of `.steps` — "How it works". */
export interface MaterialStep {
  step: string;
  title: string;
  body: string;
}

/** One column of `.rel-cols`, a `p.foot-k` over a `ul.rel`. */
export interface MaterialRelatedColumn {
  title: string;
  links: { label: string; href: string }[];
}

/**
 * Everything that can appear inside a block, discriminated by `type`.
 * <MaterialBlocks> switches on this and nothing else, which is what keeps the
 * five detail pages and the hub on one renderer.
 */
export type MaterialContent =
  | ({ type: 'heading' } & MaterialHeading)
  | ({ type: 'lede' } & MaterialText)
  | ({ type: 'paragraph' } & MaterialText)
  | ({ type: 'note' } & MaterialText)
  | ({ type: 'priceLine' } & MaterialText)
  | ({ type: 'ctaNote' } & MaterialText)
  | { type: 'prose'; variant?: string; paragraphs: MaterialText[] }
  | { type: 'facts'; items: MaterialFact[] }
  | { type: 'ticks'; items: { body: string }[] }
  | { type: 'steps'; items: MaterialStep[] }
  | { type: 'appGrid'; items: MaterialApp[] }
  | { type: 'cardGrid'; items: MaterialCard[] }
  | { type: 'relatedColumns'; columns: MaterialRelatedColumn[] }
  | { type: 'faq'; items: MaterialFaqItem[] }
  | { type: 'ctaRow'; items: Cta[] };

/** One `<details>` of `.faq-grid`. */
export interface MaterialFaqItem {
  question: string;
  answer: string;
}

/**
 * `region` is the extractor's record of WHERE the section sits in the source.
 * `lead-main` means inside `.lead-grid > .lead-main`, beside the aside form;
 * `main` means a full-width child of `<main>`. Getting this wrong moves the
 * Related block into the narrow column, so it is data, not a guess.
 */
export interface MaterialBlock {
  kind: string;
  classes: string[];
  region: 'main' | 'lead-main' | string;
  content: MaterialContent[];
  /** Hero block only — the `.svc-hero-bg` image, set inline in the source. */
  background?: string;
  /** Hero block only — the four `.hero-chips`, rendered by <HeroChips>. */
  chips?: unknown[];
}

/** `form.qform` in the aside. Rendered by the shared <QuickForm>. */
export interface MaterialEnquiryForm {
  id: string;
  heading: MaterialHeading;
  sub: MaterialText;
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

/* -------------------------------------------------------------------------
   The two records
   ------------------------------------------------------------------------- */

/** `/materials/<slug>.html` — five pages, one template. */
export interface MaterialRecord {
  slug: string;
  source: string;
  /** The legacy URL, e.g. `/materials/quartz-worktops.html`. */
  url: string;
  seo: Seo;
  breadcrumbs: Breadcrumbs;
  jsonLd: unknown[];
  enquiryForm: MaterialEnquiryForm | null;
  title: string;
  heading: MaterialHeading;
  lede: MaterialText;
  hero: {
    /** The `.svc-hero-bg` image, set inline in the source. */
    background: string;
    heading: MaterialHeading;
    lede: MaterialText;
    ctas: Cta[];
    chips: unknown[];
  };
  faq: {
    heading: MaterialHeading;
    items: { question: string; answer: string }[];
  };
  ctaBand: {
    heading: MaterialHeading;
    paragraphs: MaterialText[];
    ctas: Cta[];
    note: MaterialText;
  };
  /** `blocks` minus the hero, the FAQ and the CTA band — the prose spine. */
  body: MaterialBlock[];
  /** Every section of `<main>`, in source order. */
  blocks: MaterialBlock[];
}

/** `/materials/` — the hub. Three blocks, no hero and no aside form. */
export interface MaterialsIndexRecord {
  slug: string;
  source: string;
  url: string;
  seo: Seo;
  breadcrumbs: Breadcrumbs;
  jsonLd: unknown[];
  enquiryForm: MaterialEnquiryForm | null;
  title: string;
  heading: MaterialHeading;
  lede: MaterialText;
  blocks: MaterialBlock[];
}

interface MaterialsData {
  counts: { htmlFiles: number; materials: number };
  index: MaterialsIndexRecord;
  materials: MaterialRecord[];
}

const data = raw as unknown as MaterialsData;

export const materialsIndex: MaterialsIndexRecord = data.index;
export const materials: MaterialRecord[] = data.materials;
export const materialCounts = data.counts;

const bySlug = new Map(materials.map((m) => [m.slug, m]));

export function getMaterial(slug: string): MaterialRecord {
  const material = bySlug.get(slug);
  if (!material) throw new Error(`No material with slug "${slug}"`);
  return material;
}

/** The five slugs, in the dataset's own order. Drives `generateStaticParams`. */
export function materialSlugs(): string[] {
  return materials.map((m) => m.slug);
}

/* -------------------------------------------------------------------------
   The page skeleton
   ------------------------------------------------------------------------- */

/**
 * A detail page is three runs, in this order and only this order:
 *
 *   hero        section.svc-hero, full width
 *   leadMain    the prose spine, inside .lead-grid > .lead-main, beside the
 *               aside enquiry form
 *   tail        section.faq, the Related block, section.cta-band — full width
 *               again, BELOW the grid
 *
 * `.lead-grid` is a real element wrapping the middle run, so the runs have to
 * be contiguous for the port to nest correctly. All five pages are, but that
 * is a fact about today's data rather than a guarantee, so it is checked here
 * instead of assumed at the call site: a future extraction that interleaves a
 * full-width block into the middle of the spine would otherwise be rendered
 * silently in the wrong column.
 */
export interface MaterialSkeleton {
  hero: MaterialBlock;
  leadMain: MaterialBlock[];
  tail: MaterialBlock[];
}

export function materialSkeleton(material: MaterialRecord): MaterialSkeleton {
  const [hero, ...rest] = material.blocks;
  if (!hero || hero.kind !== 'hero') {
    throw new Error(`${material.slug}: expected a hero block first`);
  }

  const split = rest.findIndex((b) => b.region !== 'lead-main');
  const leadMain = split === -1 ? rest : rest.slice(0, split);
  const tail = split === -1 ? [] : rest.slice(split);

  if (leadMain.length === 0) {
    throw new Error(`${material.slug}: no .lead-main blocks`);
  }
  const stray = tail.find((b) => b.region === 'lead-main');
  if (stray) {
    throw new Error(
      `${material.slug}: a "${stray.kind}" block sits in .lead-main after the ` +
        'grid closed — the runs are no longer contiguous.',
    );
  }

  return { hero, leadMain, tail };
}

/* -------------------------------------------------------------------------
   STONE CROSS-LINKS — the one thing here the legacy pages do not have
   -------------------------------------------------------------------------
   The live material pages link sideways to the other materials and down to
   the guides, but never into the stones catalogue: the only `/stones/` href
   anywhere in their <main> is the compare tool, and even that only from the
   hub's chrome. That is a gap — 132 stone pages sit one level down with no
   route in from the page that describes their material.

   The join is derivable, so nothing here is hand-listed. A material slug is
   `<family>-worktops`, and `StoneRecord.family` is the DISPLAY family with
   exactly those five values (quartz, quartzite, granite, marble, travertine).
   Strip the suffix, look it up, and a material either has a family in the
   catalogue or it does not:

     quartz-worktops    -> quartz     (67)
     quartzite-worktops -> quartzite  (26)
     granite-worktops   -> granite    (20)
     marble-worktops    -> marble     (18)
     porcelain-worktops -> nothing

   Porcelain is not a natural stone and we hold no porcelain slabs, so
   `stonesForMaterial('porcelain-worktops')` returns null and that page renders
   no stone column at all — rather than an empty one, or a link into a filter
   that would come back with nothing.

   ⚠️ Use `family`, NOT `taxonomy.mat`. The latter is the selector's three-way
   pricing bucket, where quartzite and travertine collapse into "Marble" — see
   NOTE ON MATERIALS in lib/stones.ts. Keying off it would put 45 stones
   including every quartzite under /materials/marble-worktops.html.

   Every href is `StoneRecord.url` verbatim, so a link can only exist where the
   detail page exists; tests/materials.test.tsx pins that both ways.
   ------------------------------------------------------------------------- */

/** One `li` of the stones column: a real, existing `/stones/<slug>.html`. */
export interface MaterialStoneLink {
  slug: string;
  href: string;
  name: string;
  finish: string;
}

export interface MaterialStones {
  /** The `StoneRecord.family` key, e.g. `quartz`. */
  family: string;
  /** Its display label, e.g. `Quartz`. */
  familyLabel: string;
  /** How many stones the catalogue holds in this family. */
  total: number;
  /** At most MAX_STONE_LINKS of them, in the catalogue's own display order. */
  links: MaterialStoneLink[];
  /** The way through to the rest. Always present; `/stones/` is a real route. */
  more: { href: string; label: string };
}

/**
 * A column of a dozen links is a column nobody reads, and quartz alone has
 * 67. Eight, then a link to the catalogue for the rest.
 */
export const MAX_STONE_LINKS = 8;

/**
 * Grouped in the order `/stones/` itself lists them — `collection.tiles` is
 * the client's own display order, which is not the alphabetical-by-slug order
 * of `stones`. Taking the first eight of that is the closest thing the data
 * has to "the ones worth showing first".
 */
const byFamily = (() => {
  const index = new Map(stones.map((s) => [s.slug, s]));
  const groups = new Map<string, typeof stones>();
  for (const tile of collection.tiles) {
    const stone = index.get(tile.slug);
    if (!stone) continue; // Cannot happen; the stones suite pins tile ⊆ detail.
    const group = groups.get(stone.family);
    if (group) group.push(stone);
    else groups.set(stone.family, [stone]);
  }
  return groups;
})();

/** `quartz-worktops` -> `quartz`. The whole of the mapping. */
export function stoneFamilyForMaterial(slug: string): string {
  return slug.replace(/-worktops$/, '');
}

/**
 * The stones catalogue, filtered to this material's family — or null where
 * the catalogue holds none, which today is porcelain and only porcelain.
 */
export function stonesForMaterial(slug: string): MaterialStones | null {
  const family = stoneFamilyForMaterial(slug);
  const group = byFamily.get(family);
  if (!group || group.length === 0) return null;

  const familyLabel = group[0].familyLabel;

  return {
    family,
    familyLabel,
    total: group.length,
    links: group.slice(0, MAX_STONE_LINKS).map((stone) => ({
      slug: stone.slug,
      href: stone.url,
      name: stone.name,
      finish: stone.finish,
    })),
    more: {
      href: collection.url,
      label: `All ${group.length} ${familyLabel.toLowerCase()} stones`,
    },
  };
}

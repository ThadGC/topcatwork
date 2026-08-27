/**
 * ARCHETYPE — the local-SEO area page. 8 routes, one template.
 *
 *   /worktops/berkshire/                  county
 *   /worktops/essex/                      county
 *   /worktops/essex/harlow/               town
 *   /worktops/hertfordshire/              county
 *   /worktops/hertfordshire/st-albans/    town
 *   /worktops/hertfordshire/stevenage/    town
 *   /worktops/london/                     county
 *   /worktops/london/enfield/             town
 *
 * ---------------------------------------------------------------------------
 * WHY A CATCH-ALL AND NOT [county]/[town]
 * ---------------------------------------------------------------------------
 * The county and the town are the SAME archetype — identical section skeleton,
 * identical aside form, identical FAQ shell — and they nest one inside the
 * other's URL. Two nested dynamic segments would need two copies of this file
 * and a `[county]/page.tsx` that duplicated `[county]/[town]/page.tsx`.
 * `[...slug]` takes both depths with one `generateStaticParams`, and
 * `dynamicParams = false` makes any path not in locations.json a build error
 * rather than a silent 404.
 *
 * ---------------------------------------------------------------------------
 * THE EIGHT URLs ARE DIRECTORY URLs — READ scripts/postexport.mjs
 * ---------------------------------------------------------------------------
 * next.config.ts pins `trailingSlash: false` for the 149 `.html` leaves, so
 * this route exports flat files:
 *
 *   out/worktops/essex.html          not  out/worktops/essex/index.html
 *   out/worktops/essex/harlow.html   not  out/worktops/essex/harlow/index.html
 *
 * `pnpm build` runs scripts/postexport.mjs, which copies each to its
 * `<path>/index.html`. It finds them by scanning src/data/*.json for any `url`
 * ending in a slash — locations.json carries all nine — so nothing here needs
 * a hand-maintained list. tests/worktops.test.tsx asserts that scan still
 * finds all nine, because getting it wrong 404s the whole section quietly.
 *
 * ---------------------------------------------------------------------------
 * SECTIONS, IN SOURCE ORDER
 * ---------------------------------------------------------------------------
 *   1  section.svc-hero      plate, breadcrumb, h1, lede, CTAs, trust chips
 *   2  div.lead-grid         seven section.block + aside form.qform
 *   3  section.faq           four <details>, headed with the place name
 *   4  section.block         counties: "Other areas we cover"
 *                            towns:    guides + "Nearby towns"
 *   5  section.cta-band      "Get a price for your <place> kitchen"
 *
 * Blocks 2-5 all come out of `record.blocks` in DOM order; <LocationBlocks>
 * groups the `lead-main` run into `.lead-grid` and leaves the rest as direct
 * children of `<main>`.
 */
import type { Metadata } from 'next';

import { JsonLd } from '@/components/chrome/JsonLd';
import JourneyTracker from '@/components/forms/JourneyTracker';
import QuickForm from '@/components/forms/QuickForm';
import { LocationHero } from '@/components/locations/LocationHero';
import { LocationBlocks } from '@/components/locations/LocationSections';
import { TcDefs } from '@/components/sections/TcDefs';
import { getLocation, locationPaths } from '@/lib/locations';
import type { LocationBlock, LocationChip } from '@/lib/locations';
import { metadataFromSeo } from '@/lib/seo';

/* ---------------------------------------------------------------------------
 * CHANGE REQUEST #3 (26 Aug) — the local chips leave the hero
 * ---------------------------------------------------------------------------
 * A DELIBERATE DIFFERENCE FROM THE LIVE SITE. NOT A PORT DEFECT, AND NOT TO BE
 * "RESTORED".
 *
 * The live pages carry one or two extra `<span class="chip chip-reason">` in
 * the hero row on top of the standard four — verified, e.g.
 * worktops/london/enfield/index.html:192 "Dialling 020". They were ported
 * faithfully; the client has since asked for the hero row to be the four
 * standard chips only, in this order:
 *
 *     Google reviews · 10 year guarantee · 72 hour aftercare · Free home visit
 *
 * which is already the order the data holds them in, so filtering preserves it.
 *
 * The postcode and dialling strings carry local-SEO weight, so they are moved
 * rather than deleted — see `withLocalChips` below.
 */
const STANDARD_HERO_CHIPS = [
  '10 year guarantee',
  '72 hour aftercare',
  'Free home visit',
];

/**
 * The Google chip is matched on `kind`, not text: its `text` is the flattened
 * "Google reviews 5.0★★★★★" the extractor builds out of the stacked layout.
 */
function isStandardHeroChip(chip: LocationChip): boolean {
  return chip.kind === 'chip-google' || STANDARD_HERO_CHIPS.includes(chip.text);
}

/**
 * WHERE THE POSTCODE / DIALLING CHIPS WENT — the local-coverage block.
 *
 * Every one of the eight pages has exactly one `chips` node, and on every one
 * of them it is the `<ul class="chips">` in block 3, the local-area section:
 * "Areas we cover around Enfield" on a town, "Towns and areas we cover in
 * Essex" on a county. The strings are appended to that list VERBATIM, so
 * "EN1 to EN3, and N9 to N21" and "Dialling 020" stay on the same page, in the
 * one block that is actually about local reach, in markup and CSS that already
 * exist — no new element, no new class, no rewritten copy.
 *
 * If a page ever arrives without that list this throws rather than silently
 * dropping the strings, which is how <LocationNodes> treats an unknown node
 * too: losing indexed text quietly is the failure worth being loud about.
 */
function withLocalChips(
  blocks: LocationBlock[],
  extra: string[],
): LocationBlock[] {
  if (extra.length === 0) return blocks;

  let placed = false;
  const out = blocks.map((block) => {
    if (placed || !block.content.some((node) => node.type === 'chips')) {
      return block;
    }
    return {
      ...block,
      content: block.content.map((node) => {
        if (placed || node.type !== 'chips') return node;
        placed = true;
        return { ...node, items: [...node.items, ...extra] };
      }),
    };
  });

  if (!placed) {
    throw new Error(
      `/worktops/ page has no .chips list to hold its local chips: ${extra.join(', ')}`,
    );
  }
  return out;
}

/** Exactly eight, from the data. Nothing is fetched and nothing is derived. */
export function generateStaticParams() {
  return locationPaths().map((slug) => ({ slug }));
}

export const dynamicParams = false;

/**
 * Every one of these pages ranks on its own town name. Title, description,
 * canonical, OG and robots come straight off the extracted `seo` block — no
 * templating, no "| Topcat" appended twice (metadataFromSeo emits
 * `title.absolute`).
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return metadataFromSeo(getLocation(slug).seo);
}

export default async function WorktopsAreaPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const record = getLocation(slug);

  // The hero is block 0 and needs the breadcrumb inside it; the rest is data.
  const rest = record.blocks.filter((block) => block.kind !== 'hero');

  // CR #3 — four standard chips in the hero, the local ones down the page.
  const hero = {
    ...record.hero,
    chips: record.hero.chips.filter(isStandardHeroChip),
  };
  const localChips = record.hero.chips
    .filter((chip) => !isStandardHeroChip(chip))
    .map((chip) => chip.text);
  const blocks = withLocalChips(rest, localChips);

  return (
    <>
      {/*
        HomeAndConstructionBusiness + BreadcrumbList, one <script>, emitted
        verbatim. The BreadcrumbList is what tells Google the town sits under
        the county, so its item URLs must stay the live directory URLs.
      */}
      <JsonLd data={record.jsonLd} />
      <JourneyTracker />
      <TcDefs solid={false} />
      <main>
        <LocationHero hero={hero} crumbs={record.breadcrumbs} />
        <LocationBlocks
          blocks={blocks}
          aside={
            <aside className="lead-aside">
              {/*
                The live select opens on "Kitchen worktops" — its first option
                — not on /trade/'s "Commercial". Same form, same id, same
                field names, same send.php payload.
              */}
              <QuickForm defaultService="Kitchen worktops" />
            </aside>
          }
        />
      </main>
    </>
  );
}

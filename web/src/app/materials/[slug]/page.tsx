/**
 * ARCHETYPE 7 — the material detail page. Five routes, one template.
 *
 * Sections, in source order:
 *   1  section.svc-hero          — bg plate, crumb, h1, lede, CTAs, chips
 *   2  div.lead-grid
 *        div.lead-main           — the prose spine: lead answer + facts +
 *                                  price line, five prose blocks, .appgrid,
 *                                  .ticks, .steps
 *        aside.lead-aside        — form.qform
 *   3  section.faq               — .faq-grid of <details>
 *   4  section.block             — Related (+ the stones column, below)
 *   5  section.cta-band          — "Get a price for <em>x</em>"
 *
 * `trailingSlash: false` is set in next.config.ts precisely so this route
 * exports to `out/materials/<slug>.html` — byte-for-byte the legacy URL, which
 * means the canonicals carried in materials.json stay true and no redirect is
 * needed. `/materials/` itself is the hub route next door, restored to its
 * directory form by scripts/postexport.mjs.
 *
 * ---------------------------------------------------------------------------
 * THE ONE ADDITION: STONE CROSS-LINKS
 * ---------------------------------------------------------------------------
 * The rest of this page is a port. The stones column in section 4 is not: the
 * live pages carry no route into the stones catalogue at all, and 132 stone
 * pages sit one level down with no way in from the page that describes their
 * material. `stonesForMaterial()` derives the join from
 * `StoneRecord.family` — see STONE CROSS-LINKS in lib/materials.ts for why it
 * is `family` and not `taxonomy.mat`, and why porcelain gets no column.
 *
 * Every href is a stone's own `url`, so a link cannot outlive its page.
 * tests/materials.test.tsx pins that, and pins the <head> against the live
 * markup either side of it.
 */
import type { Metadata } from 'next';

import QuickForm from '@/components/forms/QuickForm';
import { JsonLd } from '@/components/chrome/JsonLd';
import { MaterialBlocks } from '@/components/materials/MaterialBlocks';
import { MaterialHero } from '@/components/materials/MaterialHero';
import { TcDefs } from '@/components/sections/TcDefs';
import {
  getMaterial,
  materialSkeleton,
  materialSlugs,
  stonesForMaterial,
} from '@/lib/materials';
import { metadataFromSeo } from '@/lib/seo';

/**
 * All five slugs, so `output: 'export'` emits all five files. Nothing is
 * fetched: the dataset is a JSON module resolved at build time.
 */
export function generateStaticParams() {
  return materialSlugs().map((slug) => ({ slug }));
}

/** A slug outside the dataset is a build error, not a silent 404. */
export const dynamicParams = false;

/**
 * These five pages are the material half of the site's SEO surface — hand
 * written titles and descriptions, canonicals on the `.html` leaf — so the
 * record is mapped straight through by <metadataFromSeo> rather than
 * templated. Nothing here derives or truncates.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return metadataFromSeo(getMaterial(slug).seo);
}

export default async function MaterialPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const material = getMaterial(slug);
  // `hero` is not destructured: <MaterialHero> reads it from the record.
  // Calling the skeleton is still what proves the three runs are contiguous.
  const { leadMain, tail } = materialSkeleton(material);
  const stones = stonesForMaterial(slug);

  return (
    <>
      <JsonLd data={material.jsonLd} />
      {/* `#tcGold` only — the chip icon in the hero fills with it. */}
      <TcDefs solid={false} />
      <main>
        {/*
          The crumb is INSIDE the hero on this archetype, so <MaterialHero>
          renders it. On the hub next door it sits above <main>. Both are the
          source's, and content.css:96 styles `.svc-hero>.crumb` specifically.
        */}
        <MaterialHero material={material} />

        <div className="lead-grid">
          <div className="lead-main">
            <MaterialBlocks blocks={leadMain} />
          </div>
          {/*
            `.lead-aside` is `display:none` until 1080px (content.css:303) —
            the form is desktop-only furniture, and the phone gets the sticky
            contact bar instead. It is still rendered into the HTML, exactly as
            the source does.

            "Kitchen worktops" because the source's <select> carries no
            `selected` attribute, so the browser picks option one. /trade/
            pre-selects "Commercial"; these five do not.
          */}
          <aside className="lead-aside">
            <QuickForm defaultService="Kitchen worktops" />
          </aside>
        </div>

        {/* FAQ, Related (+ stones), CTA band. */}
        <MaterialBlocks blocks={tail} stones={stones} />
      </main>
    </>
  );
}

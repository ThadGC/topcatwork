/**
 * The guide article — nine routes, one template.
 *
 * These are the site's editorial surface: long-form answers to the questions
 * that get asked on every home visit, each one written to rank for its own
 * query. Four things about them are load-bearing and easy to lose in a port:
 *
 *   1  THE HEADING SPINE. One h1, then h2 per body section, and no h3 in the
 *      article body. Carried through from the extracted `level` — never from
 *      position in the list. <GuideBlocks> does the mapping.
 *   2  THE HEAD. Hand-written title, description and canonical per page,
 *      mapped one-to-one by metadataFromSeo. Nothing is templated or derived.
 *   3  THE JSON-LD. `Article` + `BreadcrumbList`, re-emitted whole. See the
 *      note on `jsonLd` in src/lib/guides.ts about the FAQPage that is NOT
 *      there and must not be invented.
 *   4  THE URL. `/guides/<slug>.html`, a `.html` leaf. With
 *      `trailingSlash: false` this route exports straight to
 *      `out/guides/<slug>.html` — byte-for-byte the live URL — so the
 *      canonicals stay true, every inbound link keeps working and no redirect
 *      is needed anywhere.
 *
 * Page shape, in source order:
 *   nav.crumb                     — before <main>: Home / Guides / <title>
 *   article
 *     section.block               — h1, p.byline, div.prose.lead-answer
 *     div.lead-grid               — .lead-main body sections + .lead-aside form
 *     section.faq                 — <details> accordion (8 of the 9 guides)
 *     section.block               — Related
 *   section.cta-band              — outside the article
 *
 * The grouping is done by <GuideArticle>, off each block's `region`, because
 * the body runs 4 to 8 sections and the comparison table moves between them.
 */
import type { Metadata } from 'next';

import { Breadcrumb } from '@/components/chrome/Breadcrumb';
import { JsonLd } from '@/components/chrome/JsonLd';
import { GuideArticle } from '@/components/guides/GuideArticle';
import { getGuide, guideSlugs } from '@/lib/guides';
import { metadataFromSeo } from '@/lib/seo';

/**
 * All nine slugs, so `output: 'export'` emits all nine files. Nothing is
 * fetched: the dataset is a JSON module resolved at build time.
 */
export function generateStaticParams() {
  return guideSlugs().map((slug) => ({ slug }));
}

/**
 * A slug outside the dataset is a build error, not a silent 404 — the same
 * setting the stone archetype uses, and the reason `getGuide` throws instead
 * of returning undefined.
 */
export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return metadataFromSeo(getGuide(slug).seo);
}

export default async function GuidePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const guide = getGuide(slug);

  return (
    <>
      <JsonLd data={guide.jsonLd} />
      {/* Outside <main>, as in the source — three levels here, not two. */}
      <Breadcrumb crumbs={guide.breadcrumbs} />
      <main>
        <GuideArticle blocks={guide.blocks} />
      </main>
    </>
  );
}

/**
 * `/guides/` — the guides hub.
 *
 * Sections, in source order:
 *   1  nav.crumb                  — before <main>, Home / Guides
 *   2  section.block              — h1, p.lede, div.mgrid of nine a.mcard
 *   3  section.cta-band           — "Still deciding"
 *
 * ---------------------------------------------------------------------------
 * THE URL
 * ---------------------------------------------------------------------------
 * `/guides/` is a DIRECTORY url, and one of the ~21 on the site.
 * `trailingSlash: false` (set for the 149 `.html` leaves, of which nine are
 * this hub's children) means this route exports to `out/guides.html`.
 * scripts/postexport.mjs then copies it to `out/guides/index.html`, and both
 * files coexist beside the `guides/` directory holding the nine articles.
 *
 * Nothing needs adding to that script: it reads every `url` ending in `/` out
 * of src/data/*.json, and guides.json's index record carries `"url": "/guides/"`.
 *
 * ---------------------------------------------------------------------------
 * NO <article> HERE
 * ---------------------------------------------------------------------------
 * The nine guides wrap their body in `<article>`; the hub does not, and that
 * is the source's reading, not an oversight. The hub is a list of links to
 * articles — it is not itself one — which is also why its JSON-LD is
 * HomeAndConstructionBusiness + BreadcrumbList rather than Article.
 */
import type { Metadata } from 'next';

import { Breadcrumb } from '@/components/chrome/Breadcrumb';
import { JsonLd } from '@/components/chrome/JsonLd';
import { GuideSections } from '@/components/guides/GuideBlocks';
import { guidesIndex } from '@/lib/guides';
import { metadataFromSeo } from '@/lib/seo';

export const metadata: Metadata = metadataFromSeo(guidesIndex.seo);

export default function GuidesPage() {
  return (
    <>
      <JsonLd data={guidesIndex.jsonLd} />
      {/*
        Outside <main>, as in the source. The crumb is a sibling of <main> on
        every SEO-shell page, and content.css positions it against the page
        padding rather than against the `.wrap` column.
      */}
      <Breadcrumb crumbs={guidesIndex.breadcrumbs} />
      <main>
        <GuideSections blocks={guidesIndex.blocks} />
      </main>
    </>
  );
}

/**
 * ARCHETYPE 10 — `/stones/compare.html`, the shortlist tool.
 *
 * The route directory is `compare/`, and with `trailingSlash: false` the export
 * writes `out/stones/compare.html` — exactly the legacy URL, which every one of
 * the 132 stone pages links to as `/stones/compare.html?s=<slug>`.
 *
 * All of the behaviour is in <StoneCompare/>. The shell here is just the head,
 * the structured data and the breadcrumb, which is all the legacy page has
 * server-side too: `#cmpCards` ships empty and is filled on load from the
 * shortlist in the query string.
 */
import type { Metadata } from 'next';

import { Breadcrumb } from '@/components/chrome/Breadcrumb';
import { JsonLd } from '@/components/chrome/JsonLd';
import { RiseObserver } from '@/components/sections/RiseObserver';
import { StoneCompare } from '@/components/stones/StoneCompare';
import { metadataFromSeo } from '@/lib/seo';
import { compareData, comparePage } from '@/lib/stones';

export const metadata: Metadata = metadataFromSeo(comparePage.seo);

export default function StonesComparePage() {
  return (
    <>
      <JsonLd data={comparePage.jsonLd} />
      <Breadcrumb crumbs={comparePage.breadcrumbs} />
      <StoneCompare data={compareData} />
      {/*
        Only one element on this page carries `.rise` — the closing "Can't
        choose from a screen?" band — but `.rise` is `opacity:0` until `.in`
        is added, so without an observer that whole section is invisible.
        Threshold 0.12, the value the three /stones/ pages use inline, not
        site.js's 0.25.
      */}
      <RiseObserver threshold={0.12} />
    </>
  );
}

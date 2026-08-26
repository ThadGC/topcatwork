/**
 * ARCHETYPE 6 — `/materials/`, the hub.
 *
 * The shortest page in the family: three sections, no hero, no aside form.
 * A `.mgrid` of five `.mcard` links into the detail pages, the standing
 * "included as standard" block, and the CTA band. All of it comes out of
 * materials.json, so there is no copy in this file.
 *
 * URL SHAPE. `trailingSlash: false` exports this route to `out/materials.html`
 * and would leave `/materials/` 404ing on Apache. scripts/postexport.mjs
 * copies it to `out/materials/index.html` afterwards — it reads the directory
 * list out of the extracted data, and materialsIndex.url is `/materials/`, so
 * this route is picked up with no change to that script. Both files coexist,
 * `materials.html` beside the `materials/` directory holding the five leaves,
 * and the canonical stays `/materials/`.
 *
 * `<main>` is rendered here, not by a layout: <SiteChrome> deliberately does
 * not own it (see the note in SiteChrome.tsx), and `nav.crumb` sits ABOVE
 * <main> on this page — unlike the five detail pages, where it is inside the
 * hero.
 */
import type { Metadata } from 'next';

import { Breadcrumb } from '@/components/chrome/Breadcrumb';
import { JsonLd } from '@/components/chrome/JsonLd';
import { MaterialBlocks } from '@/components/materials/MaterialBlocks';
import { TcDefs } from '@/components/sections/TcDefs';
import { materialsIndex } from '@/lib/materials';
import { metadataFromSeo } from '@/lib/seo';

export const metadata: Metadata = metadataFromSeo(materialsIndex.seo);

export default function MaterialsIndexPage() {
  return (
    <>
      <JsonLd data={materialsIndex.jsonLd} />
      {/*
        The cut-down defs: `#tcGold` only, which is what every content-styled
        page ships. Nothing on THIS page paints with it — the hub has no
        `.hero-chips`, and the crumb chevron carries its own `#backGold` — but
        the source emits it here all the same, and it costs nothing. Dropping
        it would be the divergence.
      */}
      <TcDefs solid={false} />
      <Breadcrumb crumbs={materialsIndex.breadcrumbs} />
      <main>
        <MaterialBlocks blocks={materialsIndex.blocks} />
      </main>
    </>
  );
}

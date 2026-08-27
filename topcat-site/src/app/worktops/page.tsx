/**
 * ARCHETYPE — /worktops/, the areas-we-cover hub.
 *
 * The simplest page in the family: no hero plate, no aside form, and the
 * breadcrumb OUTSIDE `<main>` (the eight area pages put theirs inside the
 * hero). Three sections, all region "main":
 *
 *   1  section.block     h1, two `.lede` paragraphs, the four county cards
 *   2  section.block     "What is included as standard" — ticks + note
 *   3  section.cta-band  "Not sure if we reach you"
 *
 * Its live URL is the directory `/worktops/`. With `trailingSlash: false` this
 * route exports to `out/worktops.html` and scripts/postexport.mjs copies it to
 * `out/worktops/index.html`; both files coexist beside the `worktops/`
 * directory that holds the eight area pages.
 */
import type { Metadata } from 'next';

import { Breadcrumb } from '@/components/chrome/Breadcrumb';
import { JsonLd } from '@/components/chrome/JsonLd';
import JourneyTracker from '@/components/forms/JourneyTracker';
import { LocationBlocks } from '@/components/locations/LocationSections';
import { TcDefs } from '@/components/sections/TcDefs';
import { getHub } from '@/lib/locations';
import { metadataFromSeo } from '@/lib/seo';

const hub = getHub();

export const metadata: Metadata = metadataFromSeo(hub.seo);

export default function WorktopsHubPage() {
  return (
    <>
      <JsonLd data={hub.jsonLd} />
      {/* tcform.js is on this page too, and its page-load half is the visit trail. */}
      <JourneyTracker />
      {/* The cut-down defs — `#tcGold` only, as on every content-styled page. */}
      <TcDefs solid={false} />
      <Breadcrumb crumbs={hub.breadcrumbs} />
      <main>
        <LocationBlocks blocks={hub.blocks} />
      </main>
    </>
  );
}

/**
 * THE SERVICES HUB — `/services/`.
 *
 * A SITE-STYLED PAGE — assets/site.css, bare `:root` tokens, `rich` chrome —
 * and the odd one out in this folder: the nine pages beneath it are Family B
 * (services/service.css, `lite`). That is why the content.css shell lives in
 * `app/services/[slug]/layout.tsx` rather than here. See the note at the top
 * of that file.
 *
 * ---------------------------------------------------------------------------
 * IT IS THE HOME PAGE'S SECTIONS, AND THAT IS NOT AN APPROXIMATION
 * ---------------------------------------------------------------------------
 * `#services`, `#process`, `#why`, `#reviews` and `#cta` were compared
 * character-for-character against `index.html` in the saved crawl of the live
 * host. All five are IDENTICAL — same markup, same copy, same ids, same
 * empty containers for the controllers in site.js to fill. So they are
 * imported, exactly as /about/ and /projects/ import the same components,
 * rather than restated and left to drift.
 *
 * What makes this page its own page is the masthead and the ORDER: the home
 * page opens with the hero film and leads with proof; /services/ opens with
 * `.page-head` and leads with the thing you came for.
 *
 * ---------------------------------------------------------------------------
 * `home-sections.css`
 * ---------------------------------------------------------------------------
 * Imported here for the same reason app/page.tsx imports it: it is the port
 * of site.css's section rules — `.section`, `.section-title`, `.svc-helix`,
 * `.services-grid`, `.why-mosaic`, `.rev-deck`, `.cta-card` — and Next only
 * serves a stylesheet on the routes whose bundle imports it. Without this
 * line the five sections below render on globals.css alone, which carries the
 * token root and the chrome but not the sections.
 *
 * ⚠️ /about/, /contact/, /estimate/ and /projects/ use these same components
 * and do NOT import it. That looks like the same gap and is not this page's
 * to close — flagged rather than fixed here, because changing four other
 * routes' CSS payload from inside the services family is how a port grows
 * accidents.
 */
import type { Metadata } from 'next';

import { JsonLd } from '@/components/chrome/JsonLd';
import JourneyTracker from '@/components/forms/JourneyTracker';
import Cta from '@/components/sections/Cta';
import { PageHead } from '@/components/sections/PageHead';
import Process from '@/components/sections/Process';
import Reviews from '@/components/sections/Reviews';
import SectionDivider from '@/components/sections/SectionDivider';
import Services from '@/components/sections/Services';
import { TcDefs } from '@/components/sections/TcDefs';
import Why from '@/components/sections/Why';
import { metadataFromSeo } from '@/lib/seo';
import { servicesIndex, servicesIndexLede } from '@/lib/services';

import '@/styles/home-sections.css';

/**
 * Straight from the extraction, like the nine detail pages — the hub ranks
 * for "worktop services" and its title, description and canonical are the
 * client's, not ours. The canonical is the DIRECTORY url `/services/`, which
 * `scripts/postexport.mjs` restores by copying `out/services.html` to
 * `out/services/index.html` after the export.
 */
export const metadata: Metadata = metadataFromSeo(servicesIndex.seo);

export default function ServicesHubPage() {
  return (
    <main>
      {/* BreadcrumbList only — the hub carries no Service or LocalBusiness
          node, unlike the nine pages beneath it. */}
      <JsonLd data={servicesIndex.jsonLd} />
      <JourneyTracker />
      <TcDefs />
      <PageHead crumb="Services" title="Services" lede={servicesIndexLede()} />
      <Services />
      <SectionDivider />
      <Process />
      <SectionDivider />
      <Why />
      <SectionDivider />
      <Reviews inner />
      <SectionDivider />
      <Cta />
    </main>
  );
}

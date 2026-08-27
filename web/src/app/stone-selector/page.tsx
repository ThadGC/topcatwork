import type { Metadata } from 'next';

import JourneyTracker from '@/components/forms/JourneyTracker';
import Cta from '@/components/sections/Cta';
import Estimator from '@/components/sections/Estimator';
import { PageHead } from '@/components/sections/PageHead';
import Process from '@/components/sections/Process';
import Reviews from '@/components/sections/Reviews';
import SectionDivider from '@/components/sections/SectionDivider';
import Stones from '@/components/sections/Stones';
import { TcDefs } from '@/components/sections/TcDefs';

import '@/styles/home-sections.css';

/*
  THE STONE SELECTOR, AS ITS OWN PAGE.

  The client, 27 Aug: "currently in the nav bar, when you go to stones and
  choose stone selector, it takes you to the choose your stone section on the
  landing page. That should have its own dedicated page inside and then
  obviously have some global sections below that and the estimator and those
  kinds of things."

  Both Stones dropdowns pointed at `/#stones` — an anchor into the home page,
  which on this site means landing behind the cine intro and being scrolled
  somewhere by it. `nav-data.ts` now points them here.

  A SITE-STYLED PAGE, TOP LEVEL, NOT UNDER `/stones/`. The `/stones/*` segment
  is Family B: its layout imports content.css and stone.css and sets
  `data-tokens="content"` for the 134 legacy stone pages. This page is the home
  page's own furniture — `<Stones/>`, `<Estimator/>`, `<Reviews/>`, `<Cta/>` —
  and belongs in the site.css family with /estimate, /projects and /about. Put
  it under /stones/ and the marble floor and the content token root come with
  it.

  `<Stones/>` on a page other than the home page is not new: /estimate already
  mounts it below the estimator.
*/

const DESCRIPTION =
  'Browse the full Topcat collection — quartz, marble, quartzite and granite. Filter by colour, tone, veining and finish, then get an estimate on the stone you choose.';
const TITLE = 'Stone Selector | Browse Every Worktop Stone | Topcat Worktops';

export const metadata: Metadata = {
  /* `absolute` — the root layout appends '| Topcat' and this already ends in
     the brand. Same reason as the other pages; see src/lib/seo.ts. */
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: 'https://www.topcatworktops.co.uk/stone-selector/' },
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    title: TITLE,
    description: DESCRIPTION,
    url: 'https://www.topcatworktops.co.uk/stone-selector/',
    siteName: 'Topcat Worktops',
    images: [
      {
        url: 'https://www.topcatworktops.co.uk/assets/site/og-cover.jpg',
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: { card: 'summary_large_image' },
};

export default function StoneSelectorPage() {
  return (
    <main>
      <JourneyTracker />
      <TcDefs />
      <PageHead
        crumb="Stone selector"
        title="Stone selector"
        lede="Drag through the whole collection, narrow it by colour, tone, veining and finish, and open any slab to see it full size. Samples come to your kitchen, and you approve your own slab from photographs before a single cut."
      />
      <Stones />
      <SectionDivider />
      {/* "the estimator and those kinds of things" — the stone you have just
          chosen is the one the estimator prices, so it goes directly under. */}
      <Estimator />
      <SectionDivider />
      <Process />
      <SectionDivider />
      <Reviews inner />
      <SectionDivider />
      <Cta />
    </main>
  );
}

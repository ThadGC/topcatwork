import type { Metadata } from 'next';

import JourneyTracker from '@/components/forms/JourneyTracker';
import { JsonLd } from '@/components/chrome/JsonLd';
import Cta from '@/components/sections/Cta';
import Faq from '@/components/sections/Faq';
import { PageHead } from '@/components/sections/PageHead';
import Reviews from '@/components/sections/Reviews';
import SectionDivider from '@/components/sections/SectionDivider';
import { TcDefs } from '@/components/sections/TcDefs';
import { CONTACT_LD } from '@/data/ld/contact';

/*
  A SITE-STYLED PAGE: assets/site.css, the bare `:root` token set, and the
  `rich` chrome variant that <SiteChrome> resolves from the path.

  The sections are the home page's, unchanged — /contact/ carries the same
  #cta, #reviews and #faq blocks with the same copy, which is why they are
  imported rather than restated. The order is the source's own, and on this
  page the enquiry card comes FIRST: on /contact/ it is the point of the page,
  not the sign-off.
*/

const DESCRIPTION =
  'Tell us about your project and we will come to you. Free home visit, samples brought to your kitchen, and a quote with no pressure behind it.';
const TITLE = 'Contact Topcat Worktops | Free Home Visit & Quote | Topcat Worktops';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: 'https://www.topcatworktops.co.uk/contact/' },
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    title: TITLE,
    description: DESCRIPTION,
    url: 'https://www.topcatworktops.co.uk/contact/',
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

export default function ContactPage() {
  return (
    <main>
      <JsonLd data={CONTACT_LD} />
      <JourneyTracker />
      <TcDefs />
      <PageHead
        crumb="Contact"
        title="Contact"
        lede="Send us the room, the rough sizes or just a photograph, and we will come back to you with what it takes. The home visit is free, we bring the samples to your kitchen, and nothing is charged until you have said yes."
      />
      <Cta />
      <SectionDivider />
      <Reviews />
      <SectionDivider />
      <Faq />
    </main>
  );
}

import type { Metadata } from 'next';

import JourneyTracker from '@/components/forms/JourneyTracker';
import { JsonLd } from '@/components/chrome/JsonLd';
import About from '@/components/sections/About';
import Cta from '@/components/sections/Cta';
import Faq from '@/components/sections/Faq';
import { PageHead } from '@/components/sections/PageHead';
import Reviews from '@/components/sections/Reviews';
import SectionDivider from '@/components/sections/SectionDivider';
import { TcDefs } from '@/components/sections/TcDefs';
import Why from '@/components/sections/Why';
import { ABOUT_LD } from '@/data/ld/about';

import '@/styles/home-sections.css';

/*
  A SITE-STYLED PAGE — assets/site.css, bare `:root` tokens, `rich` chrome.

  #about, #why, #reviews, #faq and #cta are the home page's sections, and on
  /about/ they are the same markup with the same copy, so they are imported
  rather than restated. The masthead and the section ORDER are what make this
  page: the home page leads with the film, /about/ leads with the story.
*/

const DESCRIPTION =
  'Who we are and how we work. One team from the first measurement to the last seal, with a ten year guarantee behind it.';
const TITLE = 'About Topcat Worktops | One Contract, One Contact | Topcat Worktops';

export const metadata: Metadata = {
  /*
    `absolute`, not a bare string. The root layout sets a `'%s | Topcat'`
    title template and this title already ends in the brand — without
    `absolute` the exported <title> carries the suffix twice. Same reason
    src/lib/seo.ts wraps every extracted title; see the note there.
  */
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: 'https://www.topcatworktops.co.uk/about/' },
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    title: TITLE,
    description: DESCRIPTION,
    url: 'https://www.topcatworktops.co.uk/about/',
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

export default function AboutPage() {
  return (
    <main>
      <JsonLd data={ABOUT_LD} />
      <JourneyTracker />
      <TcDefs />
      <PageHead
        crumb="About us"
        title="About us"
        lede="You will deal with the same people from the first measurement to the last seal. We advise on the stone, we source the slab, we template it, we fit it, and we answer for all of it afterwards."
      />
      <About />
      <SectionDivider />
      <Why />
      <SectionDivider />
      <Reviews />
      <SectionDivider />
      <Faq />
      <SectionDivider />
      <Cta />
    </main>
  );
}

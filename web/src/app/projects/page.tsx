import type { Metadata } from 'next';

import JourneyTracker from '@/components/forms/JourneyTracker';
import { JsonLd } from '@/components/chrome/JsonLd';
import Cta from '@/components/sections/Cta';
import Gallery from '@/components/sections/Gallery';
import { PageHead } from '@/components/sections/PageHead';
import Process from '@/components/sections/Process';
import Reviews from '@/components/sections/Reviews';
import SectionDivider from '@/components/sections/SectionDivider';
import { TcDefs } from '@/components/sections/TcDefs';
import { PROJECTS_LD } from '@/data/ld/projects';

import '@/styles/home-sections.css';

/*
  A SITE-STYLED PAGE — assets/site.css, bare `:root` tokens, `rich` chrome.

  ⚠️ `<main class="pg-col">` — this is the only page of the seven that puts a
  class on <main>, and the gallery's pinned scroll depends on it. Do not drop
  it, and do not let a layout own <main> for this route.
*/

const DESCRIPTION =
  'Recent worktop projects across London, Hertfordshire, Essex, Berkshire, Buckinghamshire, Surrey, Oxfordshire & Bedfordshire. See the stone, the space and how each one was templated and fitted.';
const TITLE = 'Our Projects | Kitchen Worktop Installations | Topcat Worktops';

export const metadata: Metadata = {
  /*
    `absolute`, not a bare string. The root layout sets a `'%s | Topcat'`
    title template and this title already ends in the brand — without
    `absolute` the exported <title> carries the suffix twice. Same reason
    src/lib/seo.ts wraps every extracted title; see the note there.
  */
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: 'https://www.topcatworktops.co.uk/projects/' },
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    title: TITLE,
    description: DESCRIPTION,
    url: 'https://www.topcatworktops.co.uk/projects/',
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

export default function ProjectsPage() {
  return (
    <main className="pg-col">
      <JsonLd data={PROJECTS_LD} />
      <JourneyTracker />
      <TcDefs />
      <PageHead
        crumb="Projects"
        title="Projects"
        lede="A finished kitchen is the only honest sample. These are ours, real installations with the place, the work and the date on every one."
      />
      <Gallery />
      <SectionDivider />
      <Reviews />
      <SectionDivider />
      <Process />
      <SectionDivider />
      <Cta />
    </main>
  );
}

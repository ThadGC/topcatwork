import type { Metadata } from 'next';

import JourneyTracker from '@/components/forms/JourneyTracker';
import { JsonLd } from '@/components/chrome/JsonLd';
import Cta from '@/components/sections/Cta';
import Estimator from '@/components/sections/Estimator';
import { PageHead } from '@/components/sections/PageHead';
import Process from '@/components/sections/Process';
import SectionDivider from '@/components/sections/SectionDivider';
import Stones from '@/components/sections/Stones';
import { TcDefs } from '@/components/sections/TcDefs';
import { ESTIMATE_LD } from '@/data/ld/estimate';

/*
  A SITE-STYLED PAGE — assets/site.css, bare `:root` tokens, `rich` chrome.

  <Estimator/> carries the calculator shell and BOTH of its dropzones, which
  are <TcUpload/> and share one file list with the enquiry card's. So a
  visitor can attach a plan while pricing a marble top and it rides along with
  the enquiry they send from #cta at the bottom of the same page, exactly as
  the legacy `TC_UP` singleton behaves.

  The pricing engine itself — slab packing, joint placement, the per-material
  rate card — is separate work and lands inside <Estimator/>.
*/

const DESCRIPTION =
  'Type in your sizes and see them laid out on real slabs. An honest range for quartz worktops in seconds, with your exact price after a free home visit.';
const TITLE = 'Worktop Cost Estimator | Quartz, Granite & Marble | Topcat Worktops';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: 'https://www.topcatworktops.co.uk/estimate/' },
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    title: TITLE,
    description: DESCRIPTION,
    url: 'https://www.topcatworktops.co.uk/estimate/',
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

export default function EstimatePage() {
  return (
    <main>
      <JsonLd data={ESTIMATE_LD} />
      <JourneyTracker />
      <TcDefs />
      <PageHead
        crumb="Estimate"
        title="Estimate"
        lede="What a worktop costs comes down to the stone, the shape of the run and how many slabs the cut actually needs. This works all three out on real slabs of the stone you pick, so the range you see is the one we would quote from."
      />
      <Estimator />
      <SectionDivider />
      <Stones />
      <SectionDivider />
      <Process />
      <SectionDivider />
      <Cta />
    </main>
  );
}

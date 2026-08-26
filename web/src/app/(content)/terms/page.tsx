import type { Metadata } from 'next';

import { Breadcrumb } from '@/components/chrome/Breadcrumb';
import { contentCrumbs } from '@/components/sections/crumbs';
import { JsonLd } from '@/components/chrome/JsonLd';
import { TcDefs } from '@/components/sections/TcDefs';
import JourneyTracker from '@/components/forms/JourneyTracker';
import { TERMS_LD } from '@/data/ld/terms';
import { TERMS_HTML } from '@/data/legal/terms';

/* A CONTENT-STYLED PAGE — see the note at the top of ../privacy/page.tsx. */

export const metadata: Metadata = {
  /*
    `absolute`, not a bare string. The root layout sets a `'%s | Topcat'`
    title template and this title already ends in the brand — without
    `absolute` the exported <title> carries the suffix twice. Same reason
    src/lib/seo.ts wraps every extracted title; see the note there.
  */
  title: { absolute: 'Terms & Conditions | Topcat Worktops' },
  description:
    'The terms on which Topcat Worktops quotes, supplies, delivers and installs quartz, granite and marble worktops, including payment, warranty and cancellation.',
  alternates: { canonical: 'https://www.topcatworktops.co.uk/terms/' },
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    title: 'Terms & Conditions | Topcat Worktops',
    description:
      'The terms on which Topcat Worktops quotes, supplies, delivers and installs quartz, granite and marble worktops, including payment, warranty and cancellation.',
    url: 'https://www.topcatworktops.co.uk/terms/',
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

export default function TermsPage() {
  return (
    <>
      <JsonLd data={TERMS_LD} />
      <JourneyTracker />
      <TcDefs solid={false} />
      <Breadcrumb crumbs={contentCrumbs('Terms & Conditions')} />
      <main>
        <section className="block">
          <div className="wrap">
            <h1>
              Terms &amp; <em>Conditions</em>
            </h1>
            <p className="legal-lede">
              Please review how Topcat Worktops handles quotations, installations and
              warranties before accepting your proposal.
            </p>
            <div className="legal" dangerouslySetInnerHTML={{ __html: TERMS_HTML }} />
          </div>
        </section>
      </main>
    </>
  );
}

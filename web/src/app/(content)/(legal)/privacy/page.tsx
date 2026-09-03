import type { Metadata } from 'next';

import { Breadcrumb } from '@/components/chrome/Breadcrumb';
import { contentCrumbs } from '@/components/sections/crumbs';
import { JsonLd } from '@/components/chrome/JsonLd';
import { TcDefs } from '@/components/sections/TcDefs';
import JourneyTracker from '@/components/forms/JourneyTracker';
import { PRIVACY_LD } from '@/data/ld/privacy';
import { PRIVACY_HTML } from '@/data/legal/privacy';

/*
  A CONTENT-STYLED PAGE. The legacy /privacy/ loads services/service.css,
  not assets/site.css, so it needs `data-tokens="content"` on <body> —
  see the token-root table in the README. That attribute is set by the
  chrome layer's content shell; this file only supplies what sat inside
  <main>, plus the two siblings the source puts just before it.

  It carries tcform.js even though it has no form, which is how the journey
  trail records a visit to the privacy page. <TcFormBoot/> is that.
*/

export const metadata: Metadata = {
  /*
    `absolute`, not a bare string. The root layout sets a `'%s | Topcat'`
    title template and this title already ends in the brand — without
    `absolute` the exported <title> carries the suffix twice. Same reason
    src/lib/seo.ts wraps every extracted title; see the note there.
  */
  title: { absolute: 'Privacy Policy | Topcat Worktops' },
  description:
    'What Topcat Worktops does with the details you send through this website, how long we keep them, and your rights over them. Includes the cookies this site sets and how to refuse them.',
  alternates: { canonical: 'https://www.topcatworktops.co.uk/privacy/' },
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    title: 'Privacy Policy | Topcat Worktops',
    description:
      'What Topcat Worktops does with the details you send through this website, how long we keep them, and your rights over them. Includes the cookies this site sets and how to refuse them.',
    url: 'https://www.topcatworktops.co.uk/privacy/',
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

export default function PrivacyPage() {
  return (
    <>
      <JsonLd data={PRIVACY_LD} />
      <JourneyTracker />
      <TcDefs solid={false} />
      <Breadcrumb crumbs={contentCrumbs('Privacy Policy')} />
      <main>
        <section className="block">
          <div className="wrap">
            <h1>
              Privacy <em>Policy</em>
            </h1>
            <p className="legal-lede">
              What we collect when you enquire, what we do with it, and what you can ask
              us to do about it, including the Google advertising cookies this site
              sets and how to turn them off.
            </p>
            <div className="legal" dangerouslySetInnerHTML={{ __html: PRIVACY_HTML }} />
          </div>
        </section>
      </main>
    </>
  );
}

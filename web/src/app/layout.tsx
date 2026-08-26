import type { Metadata, Viewport } from 'next';

import { SiteChrome } from '@/components/chrome';

import './globals.css';
// Imported AFTER globals.css so the cascade matches the legacy load order:
// site.css's reset first, then its chrome block. These rules are deliberately
// unlayered, like the source, which is how they win over globals.css's
// `@layer base` reset without a single !important.
import '@/components/chrome/chrome.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.topcatworktops.co.uk'),
  title: {
    default:
      'Quartz, Granite & Marble Worktops | London & the Home Counties | Topcat',
    template: '%s | Topcat',
  },
  description:
    'Bespoke quartz, marble and granite worktops, chosen from the slab, templated to the millimetre and fitted in days. Free home visit across London, Hertfordshire, Essex, Berkshire, Buckinghamshire, Surrey, Oxfordshire & Bedfordshire.',
  openGraph: {
    type: 'website',
    title:
      'Quartz, Granite & Marble Worktops | London & the Home Counties | Topcat',
    description:
      'Bespoke quartz, marble and granite worktops, chosen from the slab, templated to the millimetre and fitted in days. Free home visit across London and the Home Counties.',
    url: 'https://www.topcatworktops.co.uk/',
    siteName: 'Topcat Worktops',
    images: [
      {
        url: 'https://www.topcatworktops.co.uk/assets/site/og-cover.jpg',
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
  },
  icons: {
    icon: [{ url: '/assets/brand/favicon.svg', type: 'image/svg+xml' }],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    /*
      en-GB, not en. 177 of the 178 live pages serve `<html lang="en-GB">` —
      the value the extractor already records as `seo.lang` on all 169 data-
      backed records — and this is a UK-only fitter, so the region subtag is
      load-bearing for locale targeting.

      The single exception is the home page, which genuinely serves
      `lang="en"`. App Router has one root layout and a page cannot reach the
      <html> element, so that one override is applied to out/index.html by
      scripts/postexport.mjs, alongside the directory-URL copies.
    */
    <html lang="en-GB">
      <head>
        {/*
          The two self-hosted variable faces are preloaded on every legacy
          page. `crossorigin` is mandatory on a font preload even same-origin,
          or the browser fetches the file twice.

          These stay hand-written <link>s rather than next/font because the
          @font-face rules in globals.css hard-code /assets/fonts/… and
          next/font would rewrite those URLs out from under them.
        */}
        <link
          rel="preload"
          as="font"
          type="font/woff2"
          href="/assets/fonts/cinzel-latin-var.woff2"
          crossOrigin=""
        />
        <link
          rel="preload"
          as="font"
          type="font/woff2"
          href="/assets/fonts/montserrat-latin-var.woff2"
          crossOrigin=""
        />
      </head>
      {/*
        No `data-tokens` here: the bare :root in globals.css is the site.css
        token root, which is what the home page and /about /contact /estimate
        /projects load. Pages the legacy site serves with service.css must set
        `data-tokens="content"` on <body> in their own route-group layout —
        that is what switches --muted to 0.60, --faint to 0.34 and the wide
        --uipx clamp floor to 0.80px.
      */}
      {/*
        <SiteChrome> renders the header, the mobile nav sheet, the sticky
        contact bar, the FABs and the footer around the page, and picks the
        rich/lite variant from the route. It also owns the <main> element,
        because the footer sits INSIDE <main> on the six rich pages and after
        it on the other 171 — see the note in SiteChrome.tsx.
      */}
      <body>
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}

/**
 * `/sitemap.html` — the human sitemap.
 *
 * Sections, in source order:
 *   1  svg.tc-defs               — before <main>, `#tcGold` only
 *   2  nav.crumb                 — before <main>, Home / Sitemap
 *   3  section.block             — h1 + p.lede
 *   4  six section.block.sm-group — the link groups, the last one three-column
 *   5  section.cta-band          — "Ready to talk about your project"
 *
 * ---------------------------------------------------------------------------
 * THE URL
 * ---------------------------------------------------------------------------
 * `/sitemap.html` is a `.html` LEAF, not a directory URL, so this route needs
 * nothing from scripts/postexport.mjs: `trailingSlash: false` exports
 * app/sitemap/page.tsx straight to `out/sitemap.html`, which is the live URL,
 * with the live canonical, and no redirect anywhere. Do NOT add '/sitemap/'
 * to that script's EXTRA_HUBS — the directory form is not a URL this site has.
 *
 * This is also the page every other page links to: nav-data.ts's FOOT_LEGAL
 * puts `{ href: '/sitemap.html', label: 'Sitemap' }` in the footer bar, which
 * renders on all 199 exported pages. Delete this route and every one of them
 * links to a 404.
 *
 * ---------------------------------------------------------------------------
 * THE LIST IS DATA, AND IT IS NOT DERIVED
 * ---------------------------------------------------------------------------
 * @/data/sitemap holds the groups exactly as the legacy page writes them. See
 * the header of that file for why it is not generated from src/data/*.json —
 * the labels and the counts are editorial and disagree with the extracted
 * records on purpose.
 */
import type { Metadata } from 'next';

import { Breadcrumb } from '@/components/chrome/Breadcrumb';
import { JsonLd } from '@/components/chrome/JsonLd';
import { TcDefs } from '@/components/sections/TcDefs';
import { contentCrumbs } from '@/components/sections/crumbs';
import JourneyTracker from '@/components/forms/JourneyTracker';
import { SITEMAP_LD } from '@/data/ld/sitemap';
import { SITEMAP_GROUPS, SITEMAP_LEDE, type SitemapLink } from '@/data/sitemap';

const TITLE = 'Sitemap | Every Page on Topcat Worktops';
const DESCRIPTION =
  'Every page on the Topcat Worktops site in one place: services, materials, ' +
  'guides, the areas we cover and the full stone collection.';

export const metadata: Metadata = {
  /*
    `absolute`, like every other page's. The root layout sets a
    `'%s | Topcat'` template and this title already ends in a brand — without
    it the exported <title> reads "… Topcat Worktops | Topcat".
  */
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: 'https://www.topcatworktops.co.uk/sitemap.html' },
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    title: TITLE,
    description: DESCRIPTION,
    url: 'https://www.topcatworktops.co.uk/sitemap.html',
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

function LinkList({
  links,
  twoUp = true,
}: {
  links: readonly SitemapLink[];
  twoUp?: boolean;
}) {
  return (
    <ul className={twoUp ? 'rel two-up' : 'rel'}>
      {links.map((link) => (
        <li key={link.href}>
          <a href={link.href}>{link.label}</a>
        </li>
      ))}
    </ul>
  );
}

export default function SitemapPage() {
  return (
    <>
      <JsonLd data={SITEMAP_LD} />
      {/* Carries tcform.js with no form of its own, which is how the visit
          trail records a stop here — same as /privacy/ and /terms/. */}
      <JourneyTracker />
      {/* `#tcGold` only: the cut-down defs every content-styled page ships. */}
      <TcDefs solid={false} />
      <Breadcrumb crumbs={contentCrumbs('Sitemap')} />
      <main>
        <section className="block">
          <div className="wrap">
            <h1>Sitemap</h1>
            <p className="lede">{SITEMAP_LEDE}</p>
          </div>
        </section>

        {SITEMAP_GROUPS.map((group) => (
          <section className="block sm-group" key={group.title}>
            <div className="wrap">
              <h2>
                {group.title} <span className="sm-count">{group.count}</span>
              </h2>

              {group.note ? <p className="note">{group.note}</p> : null}

              {/*
                The stones group's note is the one that carries a link, so it
                is written here rather than living in the data as a string of
                markup.
              */}
              {group.columns ? (
                <p className="note">
                  Every stone in the range has its own page.{' '}
                  <a href="/stones/">Browse the collection</a> to filter by colour
                  and material.
                </p>
              ) : null}

              {group.links ? <LinkList links={group.links} /> : null}

              {group.columns ? (
                <div className="sm-stones">
                  {group.columns.map((column) => (
                    <div className="sm-stone-col" key={column.title}>
                      <h3>
                        {column.title}{' '}
                        <span className="sm-count">{column.count}</span>
                      </h3>
                      <LinkList links={column.links} twoUp={false} />
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </section>
        ))}

        {/*
          The closing band. `.wrap` here carries NO `.rise` — this page ships
          no reveal observer at all, so a `.rise` would stay at opacity 0
          forever.
        */}
        <section className="cta-band">
          <div className="wrap">
            <h2>
              Ready to talk about your <em>project</em>
            </h2>
            <p>
              A free home visit with samples, an honest price, and one contact
              from first measurement to final wipe down.
            </p>
            <div className="cta-row">
              <a className="btn-gold" href="/contact/">
                <span className="cta-long">Get your free quote</span>
                <span className="cta-short">Get a free quote</span>
              </a>
              <a className="btn-ghost" href="tel:+448000982812">
                <span className="cta-long">Call 0800 098 2812</span>
                <span className="cta-short">Give us a call</span>
              </a>
            </div>
            <p className="cta-note">
              Free home visit with samples. Every cut-out included. Ten year
              guarantee.
            </p>
          </div>
        </section>
      </main>
    </>
  );
}

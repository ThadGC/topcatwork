/* ==========================================================================
   /sitemap.html — the page, checked against the legacy markup rather than
   against a snapshot of our own output.

   This page is a link index, so the only failure that matters is a link that
   moved, disappeared or was silently re-labelled. sitemap.html is in the repo,
   so the whole list can be diffed against it character for character at test
   time — the same trick tests/home-copy.test.ts plays with assets/site.js, and
   for the same reason: a snapshot would happily lock in a mistake we made.

   If the legacy tree is ever removed, delete this file with it rather than
   weakening it to a snapshot.
   ========================================================================== */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render } from '@testing-library/react';

import SitemapPage, { metadata } from '@/app/sitemap/page';
import { SITEMAP_GROUPS } from '@/data/sitemap';

const SOURCE = readFileSync(resolve(__dirname, '../../sitemap.html'), 'utf8');
const SOURCE_MAIN = SOURCE.slice(SOURCE.indexOf('<main>'), SOURCE.indexOf('</main>'));

const decode = (s: string) =>
  s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

/** Every `<li><a href>label</a></li>` in the source's <main>, in order. */
function sourceLinks(): Array<[string, string]> {
  return [...SOURCE_MAIN.matchAll(/<li><a href="([^"]+)">(.*?)<\/a><\/li>/g)].map(
    (m) => [m[1], decode(m[2])],
  );
}

afterEach(cleanup);

describe('/sitemap.html', () => {
  it('reproduces every link in the legacy list, in order', () => {
    const { container } = render(<SitemapPage />);
    const rendered = [...container.querySelectorAll('main li a')].map(
      (a): [string, string] => [a.getAttribute('href')!, a.textContent!],
    );
    expect(rendered).toEqual(sourceLinks());
    // 178, i.e. every page on the site — the guard against a group being
    // dropped wholesale, which an order-insensitive check would miss.
    expect(rendered).toHaveLength(178);
  });

  it('keeps the source’s own counts, which disagree with the lists', () => {
    /*
      Deliberately NOT derived. The legacy page counts Materials as "5 pages"
      above six links and Guides as "9 pages" above ten, because neither counts
      its hub. Computing these from `links.length` would "fix" the client's
      copy.
    */
    const byTitle = Object.fromEntries(SITEMAP_GROUPS.map((g) => [g.title, g]));
    expect(byTitle['Materials'].count).toBe('5 pages');
    expect(byTitle['Materials'].links).toHaveLength(6);
    expect(byTitle['Guides'].count).toBe('9 pages');
    expect(byTitle['Guides'].links).toHaveLength(10);

    const { container } = render(<SitemapPage />);
    const counts = [...container.querySelectorAll('h2 .sm-count')].map(
      (s) => s.textContent,
    );
    expect(counts).toEqual([
      ...SOURCE_MAIN.matchAll(/<h2>.*?<span class="sm-count">(.*?)<\/span><\/h2>/gs),
    ].map((m) => decode(m[1])));
  });

  it('splits the collection into the three stone columns the source ships', () => {
    const { container } = render(<SitemapPage />);
    const cols = container.querySelectorAll('.sm-stones .sm-stone-col');
    expect(cols).toHaveLength(3);
    expect([...cols].map((c) => c.querySelector('h3')!.textContent)).toEqual([
      'Quartz 67',
      'Marble & Quartzite 45',
      'Granite 20',
    ]);
    // 67 + 45 + 20. The stone lists are single-column; only the flat groups
    // above them carry `.two-up`.
    expect(container.querySelectorAll('.sm-stone-col li')).toHaveLength(132);
    for (const list of container.querySelectorAll('.sm-stone-col ul')) {
      expect(list.className).toBe('rel');
    }
  });

  it('carries the head the live page ranks on', () => {
    const head = SOURCE.slice(0, SOURCE.indexOf('</head>'));
    const title = /<title>(.*?)<\/title>/.exec(head)![1];
    const canonical = /<link rel="canonical" href="([^"]+)"/.exec(head)![1];
    const description = /<meta name="description" content="([^"]+)"/.exec(head)![1];

    // `absolute`, or the root layout's '%s | Topcat' template doubles the brand.
    expect(metadata.title).toEqual({ absolute: decode(title) });
    expect(metadata.alternates?.canonical).toBe(canonical);
    expect(metadata.description).toBe(decode(description));
    // A `.html` leaf: trailingSlash is false, so this is the exported path.
    expect(canonical).toMatch(/\/sitemap\.html$/);
  });

  it('emits the page’s structured data verbatim', () => {
    const raw = /<script type="application\/ld\+json">(.*?)<\/script>/s.exec(SOURCE)![1];
    const { container } = render(<SitemapPage />);
    const scripts = container.querySelectorAll(
      'script[type="application/ld+json"]',
    );
    expect(scripts).toHaveLength(1);
    expect(JSON.parse(scripts[0].textContent!)).toEqual(JSON.parse(raw));
  });

  it('is a content-styled page: cut-down defs, breadcrumb, no .rise', () => {
    const { container } = render(<SitemapPage />);
    expect(container.querySelector('svg.tc-defs #tcGold')).toBeTruthy();
    expect(container.querySelector('svg.tc-defs #tcGoldSolid')).toBeNull();
    expect(container.querySelector('nav.crumb [aria-current="page"]'))
      .toHaveTextContent('Sitemap');
    /*
      The page ships no IntersectionObserver of any kind, so a `.rise` on the
      closing band would sit at opacity 0 for ever.
    */
    expect(container.querySelectorAll('.rise')).toHaveLength(0);
    expect(container.querySelector('.cta-band')).toBeTruthy();
  });
});

/**
 * The guides family — slug resolution, and head-for-head parity with the
 * legacy markup.
 *
 * ---------------------------------------------------------------------------
 * WHY THIS SUITE READS THE LEGACY HTML
 * ---------------------------------------------------------------------------
 * These ten pages are the site's SEO surface. They rank today, the titles and
 * descriptions are hand-written, and every canonical points at a `.html` leaf
 * that has inbound links. A snapshot of our own output would happily lock in a
 * truncated description or a canonical we quietly changed, so the assertions
 * below parse `guides/*.html` at test time and diff the real `<head>` against
 * what `generateMetadata` produces — the same approach tests/home-copy.test.ts
 * takes against assets/site.js.
 *
 * The ten files in `guides/` were verified byte-for-byte identical (modulo
 * CRLF) to the ten responses crawled from thadeusg3.sg-host.com, so the
 * repository copy IS the live copy for this family and is the safe thing to
 * read from inside the test runner.
 *
 * If `guides/` is ever removed from the repo these tests should be deleted
 * with it, not weakened: at that point guides.json becomes the source of truth
 * and there is nothing left to compare against.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, within } from '@testing-library/react';

import GuidePage, {
  dynamicParams,
  generateMetadata,
  generateStaticParams,
} from '@/app/guides/[slug]/page';
import GuidesPage, { metadata as guidesHubMetadata } from '@/app/guides/page';
import { getGuide, guideCounts, guideSlugs, guides, guidesIndex } from '@/lib/guides';

/* -------------------------------------------------------------------------
   The legacy <head>, parsed
   ------------------------------------------------------------------------- */

const LEGACY = resolve(__dirname, '../../guides');

/** `&amp;` is the only entity that appears in any of the ten heads. */
const decode = (s: string) =>
  s
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');

interface LegacyHead {
  title: string;
  description: string;
  canonical: string;
  robots: string;
  ogType: string;
  ogTitle: string;
  ogDescription: string;
  ogUrl: string;
  ogSiteName: string;
  ogImage: string;
  ogImageWidth: string;
  ogImageHeight: string;
  twitterCard: string;
  jsonLd: unknown[];
  /** Every stylesheet href, query string stripped. */
  stylesheets: string[];
}

function legacyHead(file: string): LegacyHead {
  const html = readFileSync(resolve(LEGACY, file), 'utf8');
  const head = html.slice(0, html.indexOf('</head>'));

  const meta = (attr: 'name' | 'property', key: string) => {
    const re = new RegExp(`<meta ${attr}="${key}" content="([^"]*)"`, 'i');
    const found = head.match(re);
    if (!found) throw new Error(`${file}: no <meta ${attr}="${key}">`);
    return decode(found[1]);
  };

  const title = head.match(/<title>([\s\S]*?)<\/title>/);
  const canonical = head.match(/<link rel="canonical" href="([^"]*)"/);
  if (!title || !canonical) throw new Error(`${file}: no <title> or canonical`);

  const scripts = [...head.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];

  return {
    title: decode(title[1]),
    description: meta('name', 'description'),
    canonical: canonical[1],
    robots: meta('name', 'robots'),
    ogType: meta('property', 'og:type'),
    ogTitle: meta('property', 'og:title'),
    ogDescription: meta('property', 'og:description'),
    ogUrl: meta('property', 'og:url'),
    ogSiteName: meta('property', 'og:site_name'),
    ogImage: meta('property', 'og:image'),
    ogImageWidth: meta('property', 'og:image:width'),
    ogImageHeight: meta('property', 'og:image:height'),
    twitterCard: meta('name', 'twitter:card'),
    jsonLd: scripts.map((m) => JSON.parse(m[1])),
    stylesheets: [...head.matchAll(/<link rel="stylesheet" href="([^"?]*)/g)].map(
      (m) => m[1],
    ),
  };
}

/** slug -> its legacy file. The hub is `index.html`. */
const FILE_OF = (slug: string) => (slug === 'index' ? 'index.html' : `${slug}.html`);

beforeEach(() => {
  localStorage.clear();
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, status: 200 }));
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

/* -------------------------------------------------------------------------
   Slug resolution
   ------------------------------------------------------------------------- */

describe('slug resolution', () => {
  it('carries all nine guides plus the hub, and the extractor agrees', () => {
    expect(guides).toHaveLength(9);
    expect(guideCounts.guides).toBe(9);
    /* Ten HTML files: the nine articles and index.html. */
    expect(guideCounts.htmlFiles).toBe(10);
    expect(guidesIndex.slug).toBe('index');
  });

  it('emits one static param per guide, with no duplicates', () => {
    const params = generateStaticParams();
    expect(params).toHaveLength(9);
    expect(new Set(params.map((p) => p.slug)).size).toBe(9);
    expect(params.map((p) => p.slug)).toEqual(guideSlugs());
  });

  it('names exactly the nine slugs the brief lists', () => {
    /* Hard-coded on purpose: this is the route manifest, and a slug that
       silently changes shape is a 404 on a page that ranks. */
    expect(guideSlugs()).toEqual([
      '20mm-vs-30mm-quartz-worktops',
      'best-kitchen-worktop-material',
      'how-much-do-quartz-worktops-cost',
      'is-quartz-heatproof',
      'is-quartz-safe-silica',
      'quartz-vs-granite-worktops',
      'quartz-vs-porcelain-worktops',
      'quartzite-vs-quartz',
      'what-happens-when-we-template',
    ]);
  });

  it('resolves every generated param back to its own record', () => {
    for (const { slug } of generateStaticParams()) {
      expect(getGuide(slug).slug).toBe(slug);
    }
  });

  it('throws on an unknown slug rather than rendering an empty page', () => {
    /* With `dynamicParams = false` an unknown slug can only come from a bug,
       so it must stop the build instead of exporting a blank article. */
    expect(dynamicParams).toBe(false);
    expect(() => getGuide('quartz-vs-formica')).toThrow(/unknown guide slug/);
    expect(() => getGuide('')).toThrow(/unknown guide slug/);
  });

  it('keeps every article URL a .html leaf, and the hub a directory URL', () => {
    for (const guide of guides) {
      expect(guide.url).toBe(`/guides/${guide.slug}.html`);
      expect(guide.seo.canonical).toBe(
        `https://www.topcatworktops.co.uk/guides/${guide.slug}.html`,
      );
    }
    /* The one directory URL in the family — restored by
       scripts/postexport.mjs, which finds it by scanning guides.json for a
       `url` ending in `/`. Nothing needs adding to that script's EXTRA_HUBS. */
    expect(guidesIndex.url).toBe('/guides/');
    expect(guidesIndex.seo.canonical).toBe('https://www.topcatworktops.co.uk/guides/');
  });
});

/* -------------------------------------------------------------------------
   Metadata parity
   ------------------------------------------------------------------------- */

describe('metadata parity with the legacy <head>', () => {
  it.each(guides.map((g) => [g.slug] as const))(
    '/guides/%s.html reproduces its head exactly',
    async (slug) => {
      const live = legacyHead(FILE_OF(slug));
      const meta = await generateMetadata({ params: Promise.resolve({ slug }) });

      /* The root layout sets a `'%s | Topcat'` template and every legacy title
         already ends in "| Topcat Worktops", so the title must be absolute or
         the suffix lands twice. */
      expect(meta.title).toEqual({ absolute: live.title });
      expect(meta.description).toBe(live.description);
      expect(meta.alternates?.canonical).toBe(live.canonical);

      /* Every one of the ten is `index, follow`. */
      expect(live.robots).toBe('index, follow');
      expect(meta.robots).toEqual({ index: true, follow: true });

      expect(meta.openGraph).toMatchObject({
        type: live.ogType,
        title: live.ogTitle,
        description: live.ogDescription,
        url: live.ogUrl,
        siteName: live.ogSiteName,
        images: [
          {
            url: live.ogImage,
            width: Number(live.ogImageWidth),
            height: Number(live.ogImageHeight),
          },
        ],
      });
      expect(meta.twitter).toEqual({ card: live.twitterCard });
    },
  );

  it('/guides/ reproduces the hub head exactly', () => {
    const live = legacyHead('index.html');

    expect(guidesHubMetadata.title).toEqual({ absolute: live.title });
    expect(guidesHubMetadata.description).toBe(live.description);
    expect(guidesHubMetadata.alternates?.canonical).toBe(live.canonical);
    expect(guidesHubMetadata.robots).toEqual({ index: true, follow: true });
    expect(guidesHubMetadata.openGraph).toMatchObject({
      type: live.ogType,
      title: live.ogTitle,
      url: live.ogUrl,
      images: [{ url: live.ogImage, width: 1200, height: 630 }],
    });
    expect(guidesHubMetadata.twitter).toEqual({ card: live.twitterCard });
  });

  it('carries the canonical as a .html leaf, which trailingSlash:false depends on', () => {
    /* If this ever became `/guides/<slug>/` the export would move too, and
       every inbound link and every canonical on the live site would be wrong. */
    for (const guide of guides) {
      const live = legacyHead(FILE_OF(guide.slug));
      expect(live.canonical.endsWith('.html')).toBe(true);
      expect(live.canonical).toBe(guide.seo.canonical);
    }
  });

  it('links seo.css last on all ten pages — the sheet this family needs', () => {
    /* The reason app/guides/layout.tsx imports a fourth stylesheet, and the
       reason it imports it AFTER content.css: both declare `.cta-note` and on
       the live pages seo.css wins. */
    for (const slug of [...guideSlugs(), 'index']) {
      const sheets = legacyHead(FILE_OF(slug)).stylesheets;
      expect(sheets).toContain('/services/service.css');
      expect(sheets[sheets.length - 1]).toBe('/seo.css');
    }
  });
});

/* -------------------------------------------------------------------------
   JSON-LD
   ------------------------------------------------------------------------- */

describe('structured data', () => {
  it('re-emits each article graph verbatim — Article + BreadcrumbList', () => {
    for (const guide of guides) {
      const live = legacyHead(FILE_OF(guide.slug));
      expect(live.jsonLd).toHaveLength(1);
      expect(guide.jsonLd).toEqual(live.jsonLd);

      const graph = live.jsonLd[0] as { '@type': string }[];
      expect(graph.map((n) => n['@type'])).toEqual(['Article', 'BreadcrumbList']);
    }
  });

  it('re-emits the hub graph verbatim', () => {
    const live = legacyHead('index.html');
    expect(guidesIndex.jsonLd).toEqual(live.jsonLd);
    const graph = live.jsonLd[0] as { '@type': string }[];
    expect(graph.map((n) => n['@type'])).toEqual([
      'HomeAndConstructionBusiness',
      'BreadcrumbList',
    ]);
  });

  it('does NOT invent FAQPage for the eight guides that show an FAQ', () => {
    /*
      Eight of the nine render a visible <details> accordion, so synthesising
      FAQPage markup looks like free rich-result eligibility. The live pages do
      not emit it, these pages rank as they are, and adding schema the client
      never published is a content change wearing a port's clothes.
    */
    const withVisibleFaq = guides.filter((g) =>
      g.blocks.some((b) => b.kind === 'faq'),
    );
    expect(withVisibleFaq).toHaveLength(9);

    for (const guide of guides) {
      expect(JSON.stringify(guide.jsonLd)).not.toContain('FAQPage');
      expect(readFileSync(resolve(LEGACY, FILE_OF(guide.slug)), 'utf8')).not.toContain(
        'FAQPage',
      );
    }
  });

  it('gives every article a three-level breadcrumb ending in itself', () => {
    for (const guide of guides) {
      expect(guide.breadcrumbs.back).toEqual({
        href: '/guides/',
        label: 'Back to Guides',
      });
      expect(guide.breadcrumbs.items.map((i) => i.name)).toEqual([
        'Home',
        'Guides',
        guide.title,
      ]);
      expect(guide.breadcrumbs.items[2].current).toBe(true);
      expect(guide.breadcrumbs.items[2].href).toBeNull();
    }
  });
});

/* -------------------------------------------------------------------------
   The document model
   ------------------------------------------------------------------------- */

describe('the document model', () => {
  it('renders `blocks`, not `body` — `body` drops the FAQ and the CTA band', () => {
    /* The extractor emits both, and `body` is `blocks` filtered to
       kind === 'block'. Rendering it would silently lose two sections from
       every page, so this pins the difference rather than the equality. */
    for (const guide of guides) {
      expect(guide.body).toEqual(guide.blocks.filter((b) => b.kind === 'block'));
      expect(guide.body.length).toBeLessThan(guide.blocks.length);
    }
  });

  it('closes every article with an FAQ, a Related block and a CTA band', () => {
    for (const guide of guides) {
      const kinds = guide.blocks.map((b) => b.kind);
      expect(kinds.slice(-3)).toEqual(['faq', 'block', 'ctaBand']);
      expect(guide.blocks[guide.blocks.length - 1].classes).toEqual(['cta-band']);
    }
  });

  it('splits each article into main / lead-main / main, in that order', () => {
    /* <GuideArticle> folds on `region`, so what has to hold is that the
       lead-main blocks are ONE contiguous run — not that there are N of them. */
    for (const guide of guides) {
      const regions = guide.blocks.map((b) => b.region);
      expect(regions[0]).toBe('main');
      const first = regions.indexOf('lead-main');
      const last = regions.lastIndexOf('lead-main');
      expect(first).toBeGreaterThan(0);
      expect(regions.slice(first, last + 1).every((r) => r === 'lead-main')).toBe(true);
      expect(regions.slice(last + 1).every((r) => r === 'main')).toBe(true);
    }
  });

  it('varies the body length and the table position, which is why nothing is indexed', () => {
    /* The guard against someone "simplifying" the template back to
       blocks.slice(1, -3) and a fixed table slot. */
    const bodyCounts = new Set(
      guides.map((g) => g.blocks.filter((b) => b.region === 'lead-main').length),
    );
    expect(bodyCounts.size).toBeGreaterThan(1);

    const tableAt = guides.map((g) =>
      g.blocks.findIndex((b) => b.content.some((c) => c.type === 'table')),
    );
    /* Two guides have no comparison table at all, and the rest disagree on
       where it sits. */
    expect(tableAt).toContain(-1);
    expect(new Set(tableAt.filter((i) => i >= 0)).size).toBeGreaterThan(1);
  });

  it('keeps every table a header column plus one cell per remaining column', () => {
    for (const guide of guides) {
      for (const block of guide.blocks) {
        for (const node of block.content) {
          if (node.type !== 'table') continue;
          expect(node.rows.length).toBeGreaterThan(0);
          for (const row of node.rows) {
            expect(row.cells).toHaveLength(node.columns.length - 1);
          }
        }
      }
    }
  });

  it('points every related link and hub card at a URL the export produces', () => {
    const known = new Set(guides.map((g) => g.url));
    for (const guide of guides) {
      for (const block of guide.blocks) {
        for (const node of block.content) {
          if (node.type !== 'relatedColumns') continue;
          for (const column of node.columns) {
            for (const link of column.links) {
              if (!link.href.startsWith('/guides/')) continue;
              expect(known.has(link.href), `${guide.slug} -> ${link.href}`).toBe(true);
              /* Never link a guide to itself. */
              expect(link.href).not.toBe(guide.url);
            }
          }
        }
      }
    }
  });
});

/* -------------------------------------------------------------------------
   Rendering
   ------------------------------------------------------------------------- */

describe('the article template', () => {
  it('renders the archetype section for section', async () => {
    const guide = getGuide('quartz-vs-granite-worktops');
    const { container } = render(
      await GuidePage({ params: Promise.resolve({ slug: guide.slug }) }),
    );

    /* 1 — the crumb, outside <main>, with this page as the leaf. */
    const crumb = screen.getByRole('navigation', { name: 'Breadcrumb' });
    expect(crumb).toHaveTextContent('Home');
    expect(crumb).toHaveTextContent('Guides');
    expect(container.querySelector('main nav.crumb')).toBeNull();

    /* 2 — the opening block: h1, byline, lead answer. */
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(guide.title);
    const byline = container.querySelector('p.byline');
    expect(byline).toHaveTextContent('Written by Nick, Managing Director');
    expect(byline?.querySelector('span.reviewed')).toHaveTextContent('Last reviewed');
    expect(container.querySelector('.prose.lead-answer p')).toHaveTextContent(
      'Choose quartz if you want a low maintenance',
    );

    /* 3 — the two-column band: body sections beside the enquiry form. */
    const grid = container.querySelector('div.lead-grid');
    expect(grid).toBeTruthy();
    expect(grid?.querySelector(':scope > div.lead-main')).toBeTruthy();
    expect(grid?.querySelector(':scope > aside.lead-aside form#qform')).toBeTruthy();
    /* Six lead-main sections on this guide: the table, then five h2 sections. */
    expect(grid?.querySelectorAll('div.lead-main > section.block')).toHaveLength(6);

    /* 4 — the comparison table, inside its scroll wrapper. */
    const table = container.querySelector('div.tbl-wrap > table.tbl');
    expect(table).toBeTruthy();
    expect(table?.querySelector('caption')).toHaveTextContent(
      'Quartz and granite compared',
    );
    expect(table?.querySelectorAll('thead th[scope="col"]')).toHaveLength(3);
    expect(table?.querySelectorAll('tbody tr')).toHaveLength(8);
    expect(table?.querySelectorAll('tbody th[scope="row"]')).toHaveLength(8);

    /* 5 — the FAQ: native <details>, not the home page's tab widget. */
    const faq = container.querySelector('section.faq > .wrap > .faq-grid');
    expect(faq?.querySelectorAll('details')).toHaveLength(3);
    expect(within(faq as HTMLElement).getByText('Which lasts longer?').tagName).toBe(
      'SUMMARY',
    );

    /* 6 — Related, then the CTA band OUTSIDE the article. */
    expect(container.querySelectorAll('.rel-cols > div')).toHaveLength(2);
    expect(container.querySelector('article section.cta-band')).toBeNull();
    expect(container.querySelector('main > section.cta-band')).toBeTruthy();
    expect(container.querySelector('.cta-band .btn-gold .cta-short')).toHaveTextContent(
      'Get a free quote',
    );
    expect(container.querySelector('.cta-band p.cta-note')).toHaveTextContent(
      'Ten year guarantee',
    );
  });

  it('gives every guide exactly one h1 and an h2-only body, which carries the SEO', async () => {
    for (const guide of guides) {
      cleanup();
      const { container } = render(
        await GuidePage({ params: Promise.resolve({ slug: guide.slug }) }),
      );

      const h1s = container.querySelectorAll('h1');
      expect(h1s, guide.slug).toHaveLength(1);
      expect(h1s[0]).toHaveTextContent(guide.title);

      /*
        The article's own spine is h1 -> h2 and nothing else. The only h3 on
        the page belongs to the enquiry form in `.lead-aside` ("Get in touch
        with Topcat"), which is chrome, so it is excluded rather than allowed:
        an h3 appearing INSIDE the article would mean a body heading had been
        demoted.
      */
      const article = container.querySelector('article') as HTMLElement;
      const bodyHeadings = [...article.querySelectorAll('h1,h2,h3,h4,h5,h6')].filter(
        (h) => !h.closest('.lead-aside'),
      );
      expect(bodyHeadings[0].tagName, guide.slug).toBe('H1');
      expect(
        bodyHeadings.slice(1).every((h) => h.tagName === 'H2'),
        guide.slug,
      ).toBe(true);

      /* And the levels are the extracted ones, not derived from position. */
      const extracted = guide.blocks
        .flatMap((b) => b.content)
        .filter((n) => n.type === 'heading');
      expect(extracted[0].level, guide.slug).toBe(1);
      expect(extracted.slice(1).every((h) => h.level === 2), guide.slug).toBe(true);
    }
  });

  it('renders the gold <em> accent from the extracted html, not from `accent`', async () => {
    const guide = getGuide('quartz-vs-granite-worktops');
    const { container } = render(
      await GuidePage({ params: Promise.resolve({ slug: guide.slug }) }),
    );
    /* "The maintenance <em>question</em>" — rebuilding this from text+accent
       goes wrong the moment the accent word appears twice in the sentence. */
    const ems = [...container.querySelectorAll('article h2 em')].map(
      (e) => e.textContent,
    );
    expect(ems).toContain('question');
    expect(ems).toContain('line');
  });

  it('renders every guide without throwing', async () => {
    for (const guide of guides) {
      cleanup();
      const { container } = render(
        await GuidePage({ params: Promise.resolve({ slug: guide.slug }) }),
      );
      expect(container.querySelector('article'), guide.slug).toBeTruthy();
      expect(container.querySelector('form#qform'), guide.slug).toBeTruthy();
      expect(container.querySelector('main > section.cta-band'), guide.slug).toBeTruthy();
    }
  });
});

/* -------------------------------------------------------------------------
   The fourth stylesheet
   ------------------------------------------------------------------------- */

describe('seo.css, the sheet this family cannot render without', () => {
  const LAYOUT = readFileSync(resolve(__dirname, '../src/app/guides/layout.tsx'), 'utf8');
  const SEO_CSS = readFileSync(resolve(__dirname, '../src/styles/seo.css'), 'utf8');

  it('is imported by the guides layout, AFTER content.css', () => {
    /* Both sheets declare `.cta-note` and on the live pages seo.css loads
       last. Swap these two lines and the CTA footnote changes size on ten
       pages. */
    const content = LAYOUT.indexOf("import '@/styles/content.css'");
    const seo = LAYOUT.indexOf("import '@/styles/seo.css'");
    expect(content).toBeGreaterThan(-1);
    expect(seo).toBeGreaterThan(content);
  });

  it('still carries every rule the guide markup hangs off', () => {
    /*
      This is the guard against a well-meaning "deduplicate the stylesheets"
      pass. Each selector below is emitted by <GuideBlocks> and defined ONLY
      here — services/service.css restates none of them, which was checked one
      class at a time before the port script was written.
    */
    for (const selector of [
      '.lead-answer',
      '.byline',
      '.byline .reviewed',
      '.tbl-wrap',
      '.tbl',
      '.mgrid',
      '.mcard',
      '.mcard-go',
      '.rel',
      '.rel-cols',
      '.cta-note',
      '.block h1',
    ]) {
      expect(SEO_CSS, selector).toContain(selector);
    }
  });
});

describe('the hub', () => {
  it('renders the h1, the lede and one card per guide', () => {
    const { container } = render(<GuidesPage />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Worktop guides',
    );
    expect(container.querySelector('p.lede')).toHaveTextContent(
      'The questions we get asked on every home visit',
    );

    const cards = [...container.querySelectorAll('a.mcard')];
    expect(cards).toHaveLength(9);
    for (const card of cards) {
      expect(card.querySelector('h3')).toBeTruthy();
      expect(card.querySelector('span.mcard-go')).toHaveTextContent('Read the guide');
    }

    /* Every card points at a route generateStaticParams actually emits. */
    const routes = new Set(guides.map((g) => g.url));
    expect(cards.map((c) => c.getAttribute('href')).every((h) => routes.has(h!))).toBe(
      true,
    );
  });

  it('is a list of articles, not an article — no <article>, no enquiry form', () => {
    const { container } = render(<GuidesPage />);
    expect(container.querySelector('article')).toBeNull();
    expect(container.querySelector('.lead-grid')).toBeNull();
    expect(container.querySelector('form#qform')).toBeNull();
    expect(container.querySelector('main > section.cta-band')).toBeTruthy();
  });

  it('puts the crumb outside <main>, two levels deep', () => {
    const { container } = render(<GuidesPage />);
    const crumb = container.querySelector('nav.crumb');
    expect(crumb).toBeTruthy();
    expect(crumb?.closest('main')).toBeNull();
    expect(crumb?.querySelectorAll('ol > li')).toHaveLength(2);
    expect(crumb?.querySelector('li[aria-current="page"]')).toHaveTextContent('Guides');
  });
});

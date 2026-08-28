/* ==========================================================================
   /worktops/ — the nine local-SEO pages.

   These pages are the section of the site most expensive to get wrong: they
   rank on town names, they are the only family whose live URLs are ALL
   directory URLs, and they nest two levels deep. So unlike tests/pages.test.tsx
   these are not thin. They assert the three things that would cost the client
   traffic and that a build still passes without:

     1. Exactly nine routes, at exactly the nine live paths — no more.
     2. Every <title>, description, canonical and JSON-LD graph is the live
        one, matched against src/data/locations.json rather than restated here.
     3. scripts/postexport.mjs still finds all nine directory URLs. This is the
        silent failure: `trailingSlash:false` exports /worktops/essex.html, and
        if postexport's scan stops matching, /worktops/essex/ 404s on the host
        while the build stays green.
   ========================================================================== */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

import WorktopsAreaPage, {
  generateMetadata,
  generateStaticParams,
} from '@/app/worktops/[...slug]/page';
import WorktopsHubPage, { metadata as hubMetadata } from '@/app/worktops/page';
import {
  allLocations,
  getHub,
  getLocation,
  locationUrls,
} from '@/lib/locations';

/** The nine live URLs, from the crawl. Hard-coded on purpose — this is the spec. */
const LIVE_URLS = [
  '/worktops/',
  '/worktops/berkshire/',
  '/worktops/essex/',
  '/worktops/essex/harlow/',
  '/worktops/hertfordshire/',
  '/worktops/hertfordshire/st-albans/',
  '/worktops/hertfordshire/stevenage/',
  '/worktops/london/',
  '/worktops/london/enfield/',
];

const SLUGS = [
  ['berkshire'],
  ['essex'],
  ['essex', 'harlow'],
  ['hertfordshire'],
  ['hertfordshire', 'st-albans'],
  ['hertfordshire', 'stevenage'],
  ['london'],
  ['london', 'enfield'],
];

const area = (slug: string[]) => WorktopsAreaPage({ params: Promise.resolve({ slug }) });

beforeEach(() => {
  localStorage.clear();
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, status: 200 }));
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

/* ------------------------------------------------------------------ routes */

describe('the nine routes', () => {
  it('generates exactly the eight area paths, and no others', () => {
    expect(generateStaticParams()).toEqual(SLUGS.map((slug) => ({ slug })));
  });

  it('covers exactly the nine live URLs, hub included', () => {
    expect(locationUrls().slice().sort()).toEqual(LIVE_URLS.slice().sort());
  });

  it('keeps every URL a directory URL — the whole family depends on it', () => {
    for (const url of locationUrls()) {
      expect(url.startsWith('/worktops/')).toBe(true);
      expect(url.endsWith('/')).toBe(true);
      expect(url.endsWith('.html')).toBe(false);
    }
  });

  it('derives each path from its URL, so the two can never drift apart', () => {
    for (const location of allLocations()) {
      expect(`/worktops/${location.path.join('/')}/`).toBe(location.url);
    }
  });

  it('nests the four towns under their county and leaves the counties flat', () => {
    const byLevel = (level: string) =>
      allLocations()
        .filter((l) => l.level === level)
        .map((l) => l.path.join('/'))
        .sort();

    expect(byLevel('county')).toEqual(['berkshire', 'essex', 'hertfordshire', 'london']);
    expect(byLevel('town')).toEqual([
      'essex/harlow',
      'hertfordshire/st-albans',
      'hertfordshire/stevenage',
      'london/enfield',
    ]);
    for (const town of allLocations().filter((l) => l.level === 'town')) {
      expect(town.path[0]).toBe(town.county);
      expect(town.path).toHaveLength(2);
    }
  });

  it('refuses a path that is not in the data instead of rendering an empty page', () => {
    expect(() => getLocation(['essex', 'colchester'])).toThrow(/No \/worktops\/ record/);
  });
});

/* ---------------------------------------------------------------- postexport */

describe('scripts/postexport.mjs still finds all nine', () => {
  /**
   * A copy of the script's own scan, run against the real data directory. If
   * the extractor ever renames `url`, or a new town lands without one, this
   * fails here rather than as a 404 on the client's host.
   */
  function collectUrls(node: unknown, into: Set<string>): Set<string> {
    if (Array.isArray(node)) {
      for (const child of node) collectUrls(child, into);
      return into;
    }
    if (node && typeof node === 'object') {
      for (const [key, value] of Object.entries(node)) {
        if (key === 'url' && typeof value === 'string') into.add(value);
        else collectUrls(value, into);
      }
    }
    return into;
  }

  it('picks the nine worktops directory URLs out of src/data', () => {
    const dir = join(process.cwd(), 'src', 'data');
    const found = new Set<string>();
    for (const file of readdirSync(dir)) {
      if (!file.endsWith('.json')) continue;
      collectUrls(JSON.parse(readFileSync(join(dir, file), 'utf8')), found);
    }
    const directories = [...found].filter(
      (url) => url.startsWith('/worktops') && url.endsWith('/') && url !== '/',
    );
    expect(directories.sort()).toEqual(LIVE_URLS.slice().sort());
  });
});

/* --------------------------------------------------------------- metadata */

describe('the <head> on every page is the live one', () => {
  it('maps the hub head straight off the extracted record', () => {
    const { seo } = getHub();
    expect(hubMetadata.title).toEqual({ absolute: seo.title });
    expect(hubMetadata.description).toBe(seo.description);
    expect(hubMetadata.alternates?.canonical).toBe(seo.canonical);
    expect(hubMetadata.alternates?.canonical).toBe(
      'https://www.topcatworktops.co.uk/worktops/',
    );
  });

  it.each(SLUGS)('maps /worktops/%s/ head straight off its record', async (...slug) => {
    const path = slug as string[];
    const record = getLocation(path);
    const meta = await generateMetadata({ params: Promise.resolve({ slug: path }) });

    expect(meta.title).toEqual({ absolute: record.seo.title });
    expect(meta.description).toBe(record.seo.description);
    expect(meta.alternates?.canonical).toBe(record.seo.canonical);
    /* The canonical must be the directory URL, not a .html leaf. */
    expect(meta.alternates?.canonical).toBe(
      `https://www.topcatworktops.co.uk/worktops/${path.join('/')}/`,
    );
    expect(meta.robots).toEqual({ index: true, follow: true });
    expect(meta.openGraph?.url).toBe(record.seo.og.url);
  });

  it('names the place, not the county, in all nine titles', () => {
    /*
      These are the strings that rank, transcribed from the crawl of the live
      site (scratchpad/live/worktops/**\/index.html), not from the data file the
      rest of this suite reads. Restated deliberately: it is the one assertion
      here that would catch the extractor and the live site disagreeing.
    */
    const titles = Object.fromEntries(
      [getHub(), ...allLocations()].map((page) => [
        page.url,
        (page as { seo: { title: string } }).seo.title,
      ]),
    );

    expect(titles['/worktops/']).toBe(
      'Areas We Cover | Worktops Across London & the Home Counties | Topcat',
    );
    for (const [url, place] of [
      ['/worktops/berkshire/', 'Berkshire'],
      ['/worktops/essex/', 'Essex'],
      ['/worktops/essex/harlow/', 'Harlow'],
      ['/worktops/hertfordshire/', 'Hertfordshire'],
      ['/worktops/hertfordshire/st-albans/', 'St Albans'],
      ['/worktops/hertfordshire/stevenage/', 'Stevenage'],
      ['/worktops/london/', 'London'],
      ['/worktops/london/enfield/', 'Enfield'],
    ]) {
      expect(titles[url]).toBe(
        `Kitchen Worktops in ${place} | Bathrooms & Commercial Too | Topcat`,
      );
    }
  });
});

/* --------------------------------------------------------------- JSON-LD */

describe('the structured data', () => {
  it('emits one graph per page, LocalBusiness then BreadcrumbList', () => {
    for (const record of [getHub(), ...allLocations()]) {
      expect(record.jsonLd).toHaveLength(1);
      const graph = record.jsonLd[0] as { '@type': string }[];
      expect(graph.map((node) => node['@type'])).toEqual([
        'HomeAndConstructionBusiness',
        'BreadcrumbList',
      ]);
    }
  });

  it('walks the BreadcrumbList down Home / Areas / county / town', () => {
    const trail = (slug: string[]) =>
      (
        (getLocation(slug).jsonLd[0] as { itemListElement?: { name: string; item: string }[] }[])[1]
          .itemListElement ?? []
      ).map((item) => [item.name, item.item]);

    expect(trail(['essex'])).toEqual([
      ['Home', 'https://www.topcatworktops.co.uk/index.html#hero'],
      ['Areas we cover', 'https://www.topcatworktops.co.uk/worktops/'],
      ['Essex', 'https://www.topcatworktops.co.uk/worktops/essex/'],
    ]);
    expect(trail(['hertfordshire', 'st-albans'])).toEqual([
      ['Home', 'https://www.topcatworktops.co.uk/index.html#hero'],
      ['Areas we cover', 'https://www.topcatworktops.co.uk/worktops/'],
      ['Hertfordshire', 'https://www.topcatworktops.co.uk/worktops/hertfordshire/'],
      ['St Albans', 'https://www.topcatworktops.co.uk/worktops/hertfordshire/st-albans/'],
    ]);
  });

  it('renders the graph into one <script>, not one per node', async () => {
    const { container } = render(await area(['london', 'enfield']));
    const scripts = container.querySelectorAll('script[type="application/ld+json"]');
    expect(scripts).toHaveLength(1);
    const parsed = JSON.parse(scripts[0].textContent!) as { '@type': string }[];
    expect(parsed).toHaveLength(2);
    expect(parsed[1]['@type']).toBe('BreadcrumbList');
  });
});

/* ----------------------------------------------------------------- markup */

describe('the hub, /worktops/', () => {
  it('renders its h1, the four county cards and the CTA band', () => {
    const { container } = render(<WorktopsHubPage />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Areas we cover');

    const cards = container.querySelectorAll('.mgrid .mcard');
    expect(cards).toHaveLength(4);
    expect([...cards].map((card) => card.getAttribute('href'))).toEqual([
      '/worktops/hertfordshire/',
      '/worktops/essex/',
      '/worktops/london/',
      '/worktops/berkshire/',
    ]);

    expect(container.querySelector('section.cta-band')).toBeTruthy();
    /* No hero and no aside form on the hub — both are the area archetype's. */
    expect(container.querySelector('.svc-hero')).toBeNull();
    expect(container.querySelector('form#qform')).toBeNull();
  });

  it('puts the breadcrumb outside <main>, as the source does', () => {
    const { container } = render(<WorktopsHubPage />);
    const crumb = container.querySelector('nav.crumb')!;
    expect(crumb.closest('main')).toBeNull();
    expect(crumb.querySelector('[aria-current="page"]')?.textContent).toBe(
      'Areas we cover',
    );
  });
});

describe('the eight area pages', () => {
  it.each(SLUGS)('/worktops/%s/ renders hero, aside form and FAQ', async (...slug) => {
    const path = slug as string[];
    const record = getLocation(path);
    const { container } = render(await area(path));

    /* The hero, with the crumb INSIDE it on this archetype. */
    const hero = container.querySelector('section.svc-hero')!;
    expect(hero).toBeTruthy();
    expect(hero.querySelector('nav.crumb')).toBeTruthy();
    expect(hero.querySelector('h1')?.textContent).toBe(record.heading.text);
    expect(
      (hero.querySelector('.svc-hero-bg') as HTMLElement).style.backgroundImage,
    ).toContain('/assets/kitchen-day.jpg');

    /* The sticky aside is inside the lead grid, beside the copy column. */
    const grid = container.querySelector('.lead-grid')!;
    expect(grid.querySelector(':scope > .lead-main')).toBeTruthy();
    expect(grid.querySelector(':scope > .lead-aside form#qform')).toBeTruthy();

    /* Four disclosure FAQs, headed with the place name. */
    const faq = container.querySelector('section.faq')!;
    expect(faq.querySelectorAll('details')).toHaveLength(record.faq.items.length);
    expect(faq.querySelector('h2')?.textContent).toBe(record.faq.heading.text);

    expect(container.querySelector('section.cta-band')).toBeTruthy();
  });

  it('walks the breadcrumb to the current page, three deep or four', async () => {
    const county = render(await area(['essex'])).container.querySelector('nav.crumb')!;
    expect([...county.querySelectorAll('li')].map((li) => li.textContent)).toEqual([
      'Home',
      'Areas we cover',
      'Essex',
    ]);
    cleanup();

    const town = render(await area(['essex', 'harlow'])).container.querySelector(
      'nav.crumb',
    )!;
    expect([...town.querySelectorAll('li')].map((li) => li.textContent)).toEqual([
      'Home',
      'Areas we cover',
      'Essex',
      'Harlow',
    ]);
    expect(town.querySelector('[aria-current="page"]')?.textContent).toBe('Harlow');
    /* The back chevron goes UP a level, to the county, not to the hub. */
    expect(town.querySelector('.crumb-back')?.getAttribute('href')).toBe(
      '/worktops/essex/',
    );
  });

  it('links each county to its towns, and each town back to its county', async () => {
    const essex = render(await area(['essex'])).container;
    expect(
      [...essex.querySelectorAll('a[href^="/worktops/essex/"]')].map((a) =>
        a.getAttribute('href'),
      ),
    ).toContain('/worktops/essex/harlow/');
    cleanup();

    const harlow = render(await area(['essex', 'harlow'])).container;
    expect(harlow.querySelector('a[href="/worktops/essex/"]')).toBeTruthy();
  });

  it('keeps Berkshire’s empty town list, which the live page ships', async () => {
    const { container } = render(await area(['berkshire']));
    const lists = [...container.querySelectorAll('ul.rel.two-up')];
    expect(lists[0].children).toHaveLength(0);
    /* …and its area chips are still there. */
    expect(container.querySelectorAll('ul.chips li').length).toBeGreaterThan(0);
  });

  it('renders the price table with row headers, inside its scroll wrapper', async () => {
    const { container } = render(await area(['hertfordshire', 'stevenage']));
    const table = container.querySelector('.tbl-wrap > table.tbl')!;
    expect(table.querySelector('caption')?.textContent).toBe(
      'Typical all-in cost, quartz, supplied and fitted including VAT',
    );
    expect([...table.querySelectorAll('thead th')].map((th) => th.getAttribute('scope'))).toEqual(
      ['col', 'col', 'col'],
    );
    expect(table.querySelectorAll('tbody tr')).toHaveLength(4);
    expect(table.querySelector('tbody th')?.getAttribute('scope')).toBe('row');
  });

  /*
    REWRITTEN FOR CHANGE REQUEST #3 (26 Aug). This test used to assert the
    opposite — six hero chips, "CM17 to CM20" and "Dialling 01279" among them,
    which is what the live page ships and what the port faithfully carried.
    The client asked for the hero row to be the four standard chips only, so
    the pair now lives in the local-coverage list further down the page. Both
    halves are asserted here: gone from the hero, still on the page.
  */
  it('shows only the four standard chips in the hero (CR #3)', async () => {
    const { container } = render(await area(['essex', 'harlow']));
    const chips = [...container.querySelectorAll('.hero-chips .chip')].map((chip) =>
      chip.textContent?.replace(/\s+/g, ' ').trim(),
    );
    expect(chips).toHaveLength(4);
    expect(chips[0]).toContain('Google reviews');
    expect(chips.slice(1)).toEqual([
      '10 year guarantee',
      '72 hour aftercare',
      'Free home visit',
    ]);
    expect(chips).not.toContain('CM17 to CM20');
    expect(chips).not.toContain('Dialling 01279');

    /* Moved, not deleted — they are the tail of the local-coverage list. */
    const areas = [...container.querySelectorAll('ul.chips li')].map((li) =>
      li.textContent?.trim(),
    );
    expect(areas.slice(-2)).toEqual(['CM17 to CM20', 'Dialling 01279']);

    /* The house icon paints with #tcGold, which <TcDefs> must have put in the DOM. */
    expect(container.querySelector('.chip-ico svg path')?.getAttribute('stroke')).toBe(
      'url(#tcGold)',
    );
    expect(container.querySelector('svg.tc-defs #tcGold')).toBeTruthy();
    expect(container.querySelector('svg.tc-defs #tcGoldSolid')).toBeNull();
  });

  it('keeps the gold <em> accent inside the headings rather than flattening it', async () => {
    const { container } = render(await area(['london']));
    expect(container.querySelector('h1 em')?.textContent).toBe('London');
    expect(container.querySelector('section.cta-band h2 em')?.textContent).toBe('kitchen');
  });

  it('opens the aside form on "Kitchen worktops", not /trade/’s "Commercial"', async () => {
    const { container } = render(await area(['london', 'enfield']));
    const select = container.querySelector<HTMLSelectElement>('form#qform select#qfService')!;
    expect(select.value).toBe('Kitchen worktops');
    expect(select.options).toHaveLength(9);
  });

  it('puts the trailing block AFTER the FAQ, where the source has it', async () => {
    const { container } = render(await area(['essex', 'harlow']));
    const sections = [...container.querySelectorAll('main > *')].map(
      (el) => el.tagName.toLowerCase() + '.' + el.className,
    );
    expect(sections).toEqual([
      'section.svc-hero',
      'div.lead-grid',
      'section.faq',
      'section.block',
      'section.cta-band',
    ]);
  });
});

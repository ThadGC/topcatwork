/* ==========================================================================
   The services family — the hub at /services/ and the nine detail pages.

   These pages are the site's commercial search surface: "kitchen worktops",
   "splashbacks", "outdoor kitchens". They rank today, so the assertions that
   matter most are not about markup — they are about the <head>. Every title
   and canonical below is checked against THE SHIPPED HTML, not against the
   extraction that fed the port, so a bad extraction cannot certify itself.

   ⚠️ WHERE "THE LIVE VALUES" COME FROM. The oracle is `services/*.html` at
   the repo root — the legacy build. It was diffed line-for-line against a
   fresh crawl of https://thadeusg3.sg-host.com on 2026-08-26 and all ten
   files are byte-identical, so the in-repo copy is the live copy and the
   check does not depend on a crawl directory that only existed on one
   machine. `scripts/port-content-css.mjs` reads the same tree the same way.
   ========================================================================== */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';

import ServicesHubPage from '@/app/services/page';
import ServicePage, {
  generateMetadata,
  generateStaticParams,
} from '@/app/services/[slug]/page';
import { SERVICES as NAV_SERVICES } from '@/components/chrome/nav-data';
import {
  counts,
  getService,
  serviceSlugs,
  services,
  servicesIndex,
  servicesIndexLede,
} from '@/lib/services';

/** The nine, in the order the legacy folder lists them. */
const SLUGS = [
  'bathroom-worktops',
  'commercial-worktops',
  'dining-tables',
  'fireplaces',
  'kitchen-islands',
  'kitchen-worktops',
  'outdoor-kitchens',
  'splashbacks',
  'vanity-tops',
];

/* --- the oracle --------------------------------------------------------- */

/*
  `process.cwd()` rather than `new URL(…, import.meta.url)`: Vite resolves a
  URL built from `import.meta.url` as a module id and refuses to serve a
  `.html` file to the test runner ("Denied ID … ?url"). Vitest runs with the
  project root as the cwd, which is `web/`, so the legacy tree is one level up.
  scripts/port-content-css.mjs reaches the same folder the same way.
*/
const LEGACY = resolve(process.cwd(), '..', 'services');

function legacyHtml(file: string): string {
  return readFileSync(resolve(LEGACY, file), 'utf8');
}

/**
 * `<title>` and `<link rel="canonical">` straight out of the shipped file.
 *
 * The entities are decoded because Next emits characters, not entities: the
 * live `<title>` says `Supplied &amp; Fitted`, the exported one says
 * `Supplied & Fitted`, and those are the same title. Only the five HTML
 * entities the legacy titles and descriptions actually use are handled — a
 * general decoder would be a second implementation to get wrong.
 */
function headOf(file: string): { title: string; canonical: string } {
  const html = legacyHtml(file);
  const title = /<title>([\s\S]*?)<\/title>/.exec(html)?.[1];
  const canonical = /<link rel="canonical" href="([^"]+)">/.exec(html)?.[1];
  if (!title || !canonical) throw new Error(`services/${file}: no title or canonical`);
  return { title: decode(title), canonical };
}

function decode(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'");
}

/** What Next will actually put in the <head> for one slug. */
async function metaFor(slug: string) {
  const meta = await generateMetadata({ params: Promise.resolve({ slug }) });
  return {
    // `metadataFromSeo` emits `{ absolute }` so the root layout's
    // '%s | Topcat' template does not double the suffix.
    title: (meta.title as { absolute: string }).absolute,
    canonical: String(meta.alternates?.canonical),
  };
}

beforeEach(() => {
  localStorage.clear();
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, status: 200 }));
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

/* ------------------------------------------------------------------------ */

describe('the dataset', () => {
  it('carries all nine services, and generateStaticParams emits one route each', () => {
    expect(counts.services).toBe(9);
    expect(counts.htmlFiles).toBe(10); // nine + the hub
    expect(services).toHaveLength(9);
    expect(serviceSlugs()).toEqual(SLUGS);
    expect(generateStaticParams()).toEqual(SLUGS.map((slug) => ({ slug })));
  });

  it('resolves every slug, and refuses one it does not know', () => {
    for (const slug of SLUGS) {
      expect(getService(slug).slug).toBe(slug);
    }
    expect(() => getService('worktops')).toThrow(/No service with slug/);
  });

  it('keeps the nine URLs as .html leaves and the hub as a directory', () => {
    // The whole `trailingSlash: false` decision rests on this: these nine
    // export straight to out/services/<slug>.html, which IS the live URL, so
    // the canonicals stay true and nothing needs a redirect. The hub goes the
    // other way and is restored by scripts/postexport.mjs.
    for (const service of services) {
      expect(service.url).toBe(`/services/${service.slug}.html`);
    }
    expect(servicesIndex.url).toBe('/services/');
  });
});

/* ------------------------------------------------------------------------ */

describe('the <head>, against the shipped HTML', () => {
  it.each(SLUGS)('/services/%s.html has the live title and canonical', async (slug) => {
    const live = headOf(`${slug}.html`);
    const ported = await metaFor(slug);

    expect(ported.title).toBe(live.title);
    expect(ported.canonical).toBe(live.canonical);
    // And the canonical really does name this page, not the hub or a sibling.
    expect(ported.canonical).toBe(
      `https://www.topcatworktops.co.uk/services/${slug}.html`,
    );
  });

  it('/services/ has the live title and canonical', () => {
    const live = headOf('index.html');
    expect(servicesIndex.seo.title).toBe(live.title);
    expect(servicesIndex.seo.canonical).toBe(live.canonical);
    expect(live.canonical).toBe('https://www.topcatworktops.co.uk/services/');
  });

  it('carries the description, robots and OG block through unchanged', async () => {
    for (const slug of SLUGS) {
      const html = legacyHtml(`${slug}.html`);
      const meta = await generateMetadata({ params: Promise.resolve({ slug }) });
      const liveDescription = decode(
        /<meta name="description" content="([^"]+)">/.exec(html)![1],
      );

      expect(meta.description).toBe(liveDescription);
      expect(meta.robots).toEqual({ index: true, follow: true });
      expect(meta.openGraph?.url).toBe(
        `https://www.topcatworktops.co.uk/services/${slug}.html`,
      );
      expect(meta.openGraph?.title).toBe(liveTitle(html));
      expect(meta.openGraph?.description).toBe(liveDescription);
    }
  });

  it('keeps the three-node JSON-LD graph on every service page', () => {
    // Service + BreadcrumbList + LocalBusiness, in that order. Google reads
    // the Service node for the rich result these pages compete on, and the
    // @id on LocalBusiness is what joins them to the same business entity.
    for (const service of services) {
      expect(service.jsonLd).toHaveLength(1);
      const graph = (service.jsonLd[0] as { '@graph': { '@type': string }[] })[
        '@graph'
      ];
      expect(graph.map((node) => node['@type'])).toEqual([
        'Service',
        'BreadcrumbList',
        'LocalBusiness',
      ]);
      const serviceNode = graph[0] as unknown as { url: string; name: string };
      expect(serviceNode.url).toBe(service.seo.canonical);
      expect(serviceNode.name).toBe(service.title);
    }
    // The hub carries a BreadcrumbList and nothing else.
    expect(servicesIndex.jsonLd).toHaveLength(1);
    expect((servicesIndex.jsonLd[0] as { '@type': string })['@type']).toBe(
      'BreadcrumbList',
    );
  });
});

function liveTitle(html: string): string {
  return decode(/<title>([\s\S]*?)<\/title>/.exec(html)![1]);
}

/* ------------------------------------------------------------------------ */

describe('the detail template', () => {
  it.each(SLUGS)('/services/%s.html renders its whole skeleton', async (slug) => {
    const service = getService(slug);
    const { container } = render(
      await ServicePage({ params: Promise.resolve({ slug }) }),
    );

    /* 1 — the hero, and the plate that is its only image. */
    const hero = container.querySelector('section.svc-hero')!;
    expect(hero).toBeTruthy();
    // The plate is an inline style with a SOURCE-RELATIVE url. Asserted as a
    // substring of the attribute rather than through `toHaveStyle`, because
    // jsdom re-quotes `url(…)` and the point here is the path, not the quoting.
    expect(hero.querySelector('.svc-hero-bg')?.getAttribute('style')).toContain(
      service.hero.background,
    );
    expect(service.hero.background.startsWith('../assets/')).toBe(true);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      service.heading.text,
    );
    expect(hero.querySelector('.lede')?.textContent).toBe(service.lede.text);
    expect(hero.querySelector('.hero-chips .chip-google')).toBeTruthy();
    /*
      Family B: no `.glow-card` (site.js is not loaded here to attach the
      pointer glow) and the `.chip-legacy` stars are bare, not wrapped in
      `<b>`. Both are how the host serves these nine, and both come off the
      one `glow` flag on <HeroChips>.
    */
    expect(hero.querySelectorAll('.hero-chips .glow-card')).toHaveLength(0);
    expect(hero.querySelector('.chip-legacy b')).toBeNull();
    expect(hero.querySelector('.chip-legacy')?.textContent).toBe(
      '★★★★★ 5.0 on Google',
    );

    /* The crumb is INSIDE the hero on this archetype, and its last item is
       the page itself. */
    const crumb = hero.querySelector('nav.crumb')!;
    expect(crumb.querySelector('[aria-current="page"]')?.textContent).toBe(
      service.title,
    );

    /* 2 — the two-column lead, and the enquiry card in the aside. */
    expect(container.querySelector('.lead-grid > .lead-main')).toBeTruthy();
    expect(container.querySelector('.lead-grid > aside.lead-aside form#qform')).toBeTruthy();

    /* 3 — the FAQ: a grid of <details>, one per extracted question. */
    const faq = container.querySelector('section.block.faq')!;
    expect(faq.querySelectorAll('.faq-grid > details')).toHaveLength(
      service.faq.items.length,
    );
    expect(faq.querySelectorAll('.faq-grid > details > .a')).toHaveLength(
      service.faq.items.length,
    );

    /* 5 — the closing band. */
    expect(container.querySelector('section.cta-band .cta-row')).toBeTruthy();
  });

  it('puts the cross-sell OUTSIDE the lead grid, where the source does', async () => {
    // "More of what we do" is the one body section with region 'main'. If it
    // is rendered into .lead-main it sits in a narrow column beside the form
    // instead of running full width under the FAQ.
    for (const slug of SLUGS) {
      cleanup();
      const { container } = render(
        await ServicePage({ params: Promise.resolve({ slug }) }),
      );
      const leadMain = container.querySelector('.lead-main')!;
      const service = getService(slug);

      expect(leadMain.querySelectorAll(':scope > section')).toHaveLength(
        service.body.filter((b) => b.region === 'lead-main').length,
      );
      // The last `.mats` row on the page is the cross-sell, and it is a
      // sibling of the grid, not a descendant.
      const crossSell = [...container.querySelectorAll('.mats')].at(-1)!;
      expect(leadMain.contains(crossSell)).toBe(false);
      // …and every chip in it points at another service page.
      for (const link of crossSell.querySelectorAll('a')) {
        expect(link.getAttribute('href')).toMatch(/^[a-z-]+\.html$/);
      }
    }
  });

  it('renders both mid-page enquiry prompts, each with its own CTA pair', async () => {
    const { container } = render(
      await ServicePage({ params: Promise.resolve({ slug: 'kitchen-worktops' }) }),
    );
    const inline = container.querySelectorAll('.cta-inline-wrap .cta-inline');
    expect(inline).toHaveLength(2);
    expect(inline[0].querySelector('.ci-line')?.textContent).toBe(
      'See the stone in your own kitchen',
    );
    expect(inline[1].querySelector('.ci-line')?.textContent).toBe(
      'Ready for a real number?',
    );
    for (const prompt of inline) {
      expect(prompt.querySelectorAll('.cta-row .btn-gold')).toHaveLength(1);
      expect(prompt.querySelectorAll('.cta-row .btn-ghost')).toHaveLength(1);
    }
  });

  it('gives every CTA both label spans, so the phone copy is not lost', async () => {
    // service.css hides `.cta-long` below 420px and shows `.cta-short`.
    // Emitting one label would silently change the button text on a phone.
    const { container } = render(
      await ServicePage({ params: Promise.resolve({ slug: 'splashbacks' }) }),
    );
    const ctas = container.querySelectorAll('.cta-row a');
    expect(ctas.length).toBeGreaterThan(0);
    for (const cta of ctas) {
      expect(cta.querySelector('.cta-long')?.textContent).toBeTruthy();
      expect(cta.querySelector('.cta-short')?.textContent).toBeTruthy();
    }
  });

  it('uses `prose` on the intro only, and `rise` on every section', async () => {
    for (const slug of SLUGS) {
      cleanup();
      const { container } = render(
        await ServicePage({ params: Promise.resolve({ slug }) }),
      );
      const service = getService(slug);
      expect(container.querySelectorAll('.wrap.prose.rise')).toHaveLength(1);
      // The intro is paragraphs and nothing else.
      const prose = container.querySelector('.wrap.prose.rise')!;
      expect(prose.querySelector('h2')).toBeNull();
      expect(prose.querySelectorAll('p').length).toBeGreaterThanOrEqual(2);
      // Nothing below the hero is left un-revealed: `.rise` starts at
      // opacity:0 and only `.rise.in` is visible, so a section whose wrap
      // lost the class would still animate — one that never had it renders,
      // but out of step with everything around it.
      const sections = container.querySelectorAll('section.block, section.cta-band');
      expect(sections.length).toBe(service.body.length + 2); // + faq + cta-band
      for (const section of sections) {
        expect(section.querySelector(':scope > .wrap')).toHaveClass('rise');
      }
    }
  });

  it('keeps the gold accent as markup, not as a rebuilt string', async () => {
    // "Kitchen <span class='h1-gold'>Worktops</span>" and
    // "What we <em>make</em>" — the accent word is inline markup the CSS
    // paints. Flattening it to text loses the whole heading rhythm.
    const { container } = render(
      await ServicePage({ params: Promise.resolve({ slug: 'kitchen-worktops' }) }),
    );
    expect(container.querySelector('h1 .h1-gold')?.textContent).toBe('Worktops');
    expect(container.querySelector('.ticks li strong')?.textContent).toBe(
      'One accountable team',
    );
    expect(
      [...container.querySelectorAll('h2 em')].map((em) => em.textContent),
    ).toContain('make');
  });

  it('renders the one-gradient defs, not the site.css pair', async () => {
    const { container } = render(
      await ServicePage({ params: Promise.resolve({ slug: 'fireplaces' }) }),
    );
    expect(container.querySelector('svg.tc-defs #tcGold')).toBeTruthy();
    expect(container.querySelector('svg.tc-defs #tcGoldSolid')).toBeNull();
  });

  it('leaves the enquiry select on its first option, as the source does', async () => {
    // No `selected` attribute anywhere in the nine files, so the browser
    // default wins — "Kitchen worktops", even on /services/fireplaces.html.
    const { container } = render(
      await ServicePage({ params: Promise.resolve({ slug: 'fireplaces' }) }),
    );
    const select = container.querySelector<HTMLSelectElement>('#qfService')!;
    expect(select.value).toBe('Kitchen worktops');
    expect(select.options).toHaveLength(9);
  });
});

/* ------------------------------------------------------------------------ */

describe('the hub', () => {
  it('renders the masthead and the five sections it shares with the home page', () => {
    const { container } = render(<ServicesHubPage />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Services');
    const head = container.querySelector('section.page-head')!;
    expect(head.querySelector('.page-crumb')?.textContent).toContain('Services');
    expect(head.querySelector('p')?.textContent).toBe(servicesIndexLede());
    // The site-styled chip row: `.glow-card` on all four, and the bolded
    // stars in `.chip-legacy`. The nine pages below this one have neither —
    // see the Family-B assertions above.
    expect(head.querySelectorAll('.hero-chips .chip.glow-card')).toHaveLength(4);
    expect(head.querySelector('.chip-legacy b')?.textContent).toBe('★★★★★');

    for (const id of ['services', 'process', 'why', 'reviews', 'cta']) {
      expect(container.querySelector(`#${id}`), id).toBeTruthy();
    }
    // Four rules, one between each pair of the five sections.
    expect(container.querySelectorAll('.section-divider')).toHaveLength(4);
    // The enquiry card is the same one /about/ and /projects/ carry.
    expect(container.querySelector('form#ctaForm')).toBeTruthy();
    // Both gold gradients — this page is site.css, unlike the nine below it.
    expect(container.querySelector('svg.tc-defs #tcGoldSolid')).toBeTruthy();
  });

  it('keeps the mount points site.js used to fill, and fills them itself', () => {
    /*
      In the source these five are EMPTY and site.js builds their contents on
      load. The port has no site.js — the components are React — so the same
      ids are here as anchors for the CSS (`#svcGridServices` is the grid,
      `#procFlow` sets `--u`) but the tiles are rendered rather than injected.
      Diffed against the live HTML for /services/: every node the host ships
      is present, and the only additions are exactly this runtime-built
      content. Same trade the home page and /projects/ already make.
    */
    const { container } = render(<ServicesHubPage />);
    for (const id of ['svcGridServices', 'svcNav', 'helixStage', 'procFlow', 'revDeck']) {
      expect(container.querySelector(`#${id}`), id).toBeTruthy();
    }
    expect(
      container.querySelectorAll('#svcGridServices article.svc').length,
    ).toBeGreaterThan(0);
  });
});

/* ------------------------------------------------------------------------ */

describe('the chrome links into this family', () => {
  it('points the Services dropdown at the nine URLs that actually export', () => {
    /*
      Under `trailingSlash: false` these nine are .html leaves. The nav used
      to carry `/services/<slug>/`, which was right when the config said
      `trailingSlash: true` and is a 404 now: postexport.mjs only builds a
      directory form for urls that END in a slash, and none of these do.
    */
    expect(NAV_SERVICES.map((link) => link.href)).toEqual(
      NAV_SERVICES.map((link) => link.href.replace(/\/$/, '')),
    );
    for (const link of NAV_SERVICES) {
      expect(link.href).toMatch(/^\/services\/[a-z-]+\.html$/);
      const slug = link.href.slice('/services/'.length, -'.html'.length);
      expect(serviceSlugs()).toContain(slug);
    }
    expect(NAV_SERVICES).toHaveLength(9);

    // And the labels are the legacy nav's, which are NOT the page titles:
    // "Bathrooms" links to bathroom-worktops.html, "Outdoor spaces" to
    // outdoor-kitchens.html. Carried as found.
    const bathrooms = NAV_SERVICES.find((l) => l.label === 'Bathrooms');
    expect(bathrooms?.href).toBe('/services/bathroom-worktops.html');
  });

  it('matches the hrefs the live nav ships', () => {
    const html = legacyHtml('kitchen-worktops.html');
    const inNav = [
      ...html.matchAll(/href="(\/services\/[a-z-]+\.html)"/g),
    ].map((m) => m[1]);
    for (const link of NAV_SERVICES) {
      expect(inNav).toContain(link.href);
    }
  });
});

/* ==========================================================================
   The materials family — the hub at /materials/ and the five detail pages.

   Two jobs, and they pull in opposite directions.

   THE PORT half asserts that nothing moved. These five pages are the
   informational top of the funnel — "quartz worktops", "marble worktops" —
   and they rank today, so the <head> is checked against THE SHIPPED HTML
   rather than against the extraction that fed the port. An extraction cannot
   certify itself.

   THE ADDITION half asserts that the one new thing on these pages is sound.
   The live pages carry no route into the stones catalogue at all, so this
   port adds a stones column to the Related block, derived from
   `StoneRecord.family`. A cross-link is only worth having if it lands, so the
   rule tested here is absolute: every href in that column must be a real
   /stones/<slug>.html that the stones dataset knows about, and it must belong
   to the family the page is about.

   ⚠️ WHERE "THE LIVE VALUES" COME FROM. The oracle is `materials/*.html` at
   the repo root — the legacy build. All six files were diffed against a fresh
   crawl of https://thadeusg3.sg-host.com on 2026-08-26 and are byte-identical,
   so the in-repo copy IS the live copy and the check does not depend on a
   crawl directory that only ever existed on one machine.
   ========================================================================== */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';

import MaterialsIndexPage from '@/app/materials/page';
import MaterialPage, {
  generateMetadata,
  generateStaticParams,
} from '@/app/materials/[slug]/page';
import {
  MAX_STONE_LINKS,
  getMaterial,
  materialCounts,
  materialSkeleton,
  materialSlugs,
  materials,
  materialsIndex,
  stoneFamilyForMaterial,
  stonesForMaterial,
  type MaterialBlock,
  type MaterialRecord,
} from '@/lib/materials';
import { stones } from '@/lib/stones';

/** The five, in the order the legacy folder lists them. */
const SLUGS = [
  'granite-worktops',
  'marble-worktops',
  'porcelain-worktops',
  'quartz-worktops',
  'quartzite-worktops',
];

/** Which stone family each material page should reach into, and how many. */
const FAMILIES: Record<string, string | null> = {
  'granite-worktops': 'granite',
  'marble-worktops': 'marble',
  'porcelain-worktops': null, // we hold no porcelain slabs
  'quartz-worktops': 'quartz',
  'quartzite-worktops': 'quartzite',
};

/* --- the oracle --------------------------------------------------------- */

/**
 * `join()` on a resolved dirname, NOT `new URL('../../materials/…')`. Vite
 * rewrites a `new URL(…, import.meta.url)` whose path is dynamic into an asset
 * glob over that directory, and `materials/` is outside `server.fs.allow`, so
 * the glob resolves to a denied id and the whole suite fails to import. The
 * path arithmetic below is invisible to Vite's analyser and reads the file at
 * run time, which is what is wanted.
 */
const HERE = dirname(fileURLToPath(import.meta.url));
const WEB = join(HERE, '..');
const LEGACY = join(WEB, '..', 'materials');

function legacyHtml(file: string): string {
  return readFileSync(join(LEGACY, file), 'utf8');
}

/**
 * Only the five entities the legacy heads actually use. A general decoder
 * would be a second implementation to get wrong; Next emits characters, so
 * `Supplied &amp; Fitted` and `Supplied & Fitted` are the same title.
 */
function decode(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'");
}

function liveHead(file: string) {
  const html = legacyHtml(file);
  const title = /<title>([\s\S]*?)<\/title>/.exec(html)?.[1];
  const canonical = /<link rel="canonical" href="([^"]+)">/.exec(html)?.[1];
  const description = /<meta name="description" content="([^"]+)">/.exec(html)?.[1];
  const robots = /<meta name="robots" content="([^"]+)">/.exec(html)?.[1];
  const ogUrl = /<meta property="og:url" content="([^"]+)">/.exec(html)?.[1];
  const twitter = /<meta name="twitter:card" content="([^"]+)">/.exec(html)?.[1];
  if (!title || !canonical || !description) {
    throw new Error(`materials/${file}: incomplete <head>`);
  }
  return {
    title: decode(title),
    canonical,
    description: decode(description),
    robots,
    ogUrl,
    twitter,
  };
}

/** The `application/ld+json` payload of the shipped file, parsed. */
function liveJsonLd(file: string): unknown[] {
  const html = legacyHtml(file);
  const raw = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/.exec(html)?.[1];
  if (!raw) throw new Error(`materials/${file}: no JSON-LD`);
  return JSON.parse(raw);
}

/** What Next will actually put in the <head> for one slug. */
async function metaFor(slug: string) {
  const meta = await generateMetadata({ params: Promise.resolve({ slug }) });
  return meta;
}

/** Every `<a href>` inside a rendered tree, in document order. */
function hrefsIn(root: ParentNode): string[] {
  return [...root.querySelectorAll('a[href]')].map((a) => a.getAttribute('href')!);
}

const STONE_SLUGS = new Set(stones.map((s) => s.slug));
const STONE_URLS = new Set(stones.map((s) => s.url));
const MATERIAL_URLS = new Set(materials.map((m) => m.url));

beforeEach(() => {
  localStorage.clear();
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, status: 200 }));
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

/* ------------------------------------------------------------------------ */

describe('the dataset and slug resolution', () => {
  it('carries all five materials, and generateStaticParams emits one route each', () => {
    expect(materialCounts.materials).toBe(5);
    expect(materialCounts.htmlFiles).toBe(6); // five + the hub
    expect(materials).toHaveLength(5);
    expect(materialSlugs()).toEqual(SLUGS);
    expect(generateStaticParams()).toEqual(SLUGS.map((slug) => ({ slug })));
    expect(new Set(materialSlugs()).size).toBe(5);
  });

  it('resolves every slug, and refuses one it does not know', () => {
    for (const slug of SLUGS) {
      expect(getMaterial(slug).slug).toBe(slug);
    }
    /* The three shapes a wrong slug actually arrives in: the family name
       without the suffix, the hub itself, and a stone that lives elsewhere. */
    expect(() => getMaterial('quartz')).toThrow(/No material with slug "quartz"/);
    expect(() => getMaterial('index')).toThrow(/No material with slug/);
    expect(() => getMaterial('carrara')).toThrow(/No material with slug/);
  });

  it('keeps the five URLs as .html leaves and the hub as a directory', () => {
    /* The whole `trailingSlash: false` decision rests on this: these five
       export straight to out/materials/<slug>.html, which IS the live URL, so
       the canonicals stay true and nothing needs a redirect. The hub goes the
       other way and is restored by scripts/postexport.mjs — which reads the
       directory list out of this very field, so `/materials/` being a
       trailing-slash URL here is what gets out/materials/index.html written. */
    for (const material of materials) {
      expect(material.url).toBe(`/materials/${material.slug}.html`);
    }
    expect(materialsIndex.url).toBe('/materials/');
    expect(materialsIndex.url.endsWith('/')).toBe(true);
  });

  it('splits every page into hero / lead-main / tail, in that order', () => {
    for (const material of materials) {
      const { hero, leadMain, tail } = materialSkeleton(material);
      expect(hero.kind).toBe('hero');
      expect(leadMain.every((b) => b.region === 'lead-main')).toBe(true);
      expect(tail.every((b) => b.region === 'main')).toBe(true);
      /* Nothing may be dropped: the three runs must reconstruct `blocks`. */
      expect([hero, ...leadMain, ...tail]).toEqual(material.blocks);
      /* The tail is always FAQ -> Related -> CTA band. */
      expect(tail.map((b) => b.kind)).toEqual(['faq', 'block', 'ctaBand']);
    }
  });

  it('refuses a page whose full-width and lead-main runs interleave', () => {
    /* Guarding the guard. If a future extraction puts a full-width block in
       the middle of the prose spine, the naive split would render everything
       after it in the narrow column beside the form. */
    const real = getMaterial('quartz-worktops');
    const spliced: MaterialRecord = {
      ...real,
      blocks: [
        real.blocks[0],
        real.blocks[1],
        { ...real.blocks[2], kind: 'interloper', region: 'main' } as MaterialBlock,
        real.blocks[3],
      ],
    };
    expect(() => materialSkeleton(spliced)).toThrow(/no longer contiguous/);
  });
});

/* ------------------------------------------------------------------------ */

describe('the <head>, against the shipped HTML', () => {
  it.each(SLUGS)('/materials/%s.html has the live title and canonical', async (slug) => {
    const live = liveHead(`${slug}.html`);
    const meta = await metaFor(slug);

    /* `{ absolute }` so the root layout's '%s | Topcat' template does not
       double the suffix the legacy titles already carry. */
    expect((meta.title as { absolute: string }).absolute).toBe(live.title);
    expect(String(meta.alternates?.canonical)).toBe(live.canonical);
    /* And the canonical names THIS page, not the hub and not a sibling. */
    expect(live.canonical).toBe(
      `https://www.topcatworktops.co.uk/materials/${slug}.html`,
    );
  });

  it('/materials/ has the live title and canonical', () => {
    const live = liveHead('index.html');
    expect(materialsIndex.seo.title).toBe(live.title);
    expect(materialsIndex.seo.canonical).toBe(live.canonical);
    expect(live.canonical).toBe('https://www.topcatworktops.co.uk/materials/');
  });

  it('carries the description, robots, OG and twitter blocks through unchanged', async () => {
    for (const slug of SLUGS) {
      const live = liveHead(`${slug}.html`);
      const meta = await metaFor(slug);

      expect(meta.description).toBe(live.description);
      /* "index, follow" is the source's explicit default, parsed rather than
         dropped — all five pages are indexable and must stay that way. */
      expect(live.robots).toBe('index, follow');
      expect(meta.robots).toEqual({ index: true, follow: true });

      expect(meta.openGraph?.url).toBe(live.ogUrl);
      expect(meta.openGraph?.url).toBe(live.canonical);
      expect(meta.openGraph?.title).toBe(live.title);
      expect(meta.openGraph?.description).toBe(live.description);
      /* `Metadata['twitter']` is a union whose other arms have no `card`, so
         it is read through a narrow cast rather than left to inference. */
      const twitter = meta.twitter as { card?: string } | null | undefined;
      expect(twitter?.card).toBe(live.twitter);
      expect(live.twitter).toBe('summary_large_image');
    }
  });

  it('re-emits the JSON-LD graph exactly as the source ships it', () => {
    /* One <script> holding an array of two: the business, then the trail.
       Google reads the BreadcrumbList for the crumb in the result, and its
       last item must be the page's own canonical or the trail points at a
       different URL from the one being indexed. */
    for (const material of materials) {
      const live = liveJsonLd(`${material.slug}.html`);
      expect(material.jsonLd).toEqual([live]);

      const graphs = live as { '@type': string; itemListElement?: unknown[] }[];
      expect(graphs.map((g) => g['@type'])).toEqual([
        'HomeAndConstructionBusiness',
        'BreadcrumbList',
      ]);
      const trail = graphs[1].itemListElement as { name: string; item: string }[];
      expect(trail).toHaveLength(3);
      expect(trail[1].item).toBe('https://www.topcatworktops.co.uk/materials/');
      expect(trail[2].item).toBe(material.seo.canonical);
      expect(trail[2].name).toBe(material.title);
    }

    const liveIndex = liveJsonLd('index.html');
    expect(materialsIndex.jsonLd).toEqual([liveIndex]);
    const indexTrail = (liveIndex as { itemListElement?: unknown[] }[])[1]
      .itemListElement as { item: string }[];
    expect(indexTrail).toHaveLength(2);
    expect(indexTrail[1].item).toBe(materialsIndex.seo.canonical);
  });
});

/* ------------------------------------------------------------------------ */

describe('the hub', () => {
  it('renders the five cards, and every one lands on a real material page', () => {
    const { container } = render(<MaterialsIndexPage />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Worktop materials',
    );

    const cards = [...container.querySelectorAll('.mgrid > a.mcard')];
    expect(cards).toHaveLength(5);
    for (const card of cards) {
      const href = card.getAttribute('href')!;
      expect(MATERIAL_URLS.has(href)).toBe(true);
      /* Each card is a heading, a paragraph and the gold go-word — the
         `.mcard-go` span is what seo.css letterspaces, not a pseudo-element,
         so it has to be real markup. */
      expect(card.querySelector('h3')?.textContent).toBeTruthy();
      expect(card.querySelector('.mcard-go')?.textContent).toBeTruthy();
    }
    /* All five, once each — a card pointing twice at the same page would be
       a silent loss of one material from the hub. */
    expect(new Set(cards.map((c) => c.getAttribute('href')))).toEqual(MATERIAL_URLS);
  });

  it('puts the crumb ABOVE <main>, and ships the gold defs', () => {
    /* The one structural difference from the five detail pages, where the
       crumb lives inside `.svc-hero` and content.css:96 restyles it. */
    const { container } = render(<MaterialsIndexPage />);
    const main = container.querySelector('main')!;
    expect(main.querySelector('nav.crumb')).toBeNull();
    expect(container.querySelector('nav.crumb')).toBeTruthy();
    expect(container.querySelector('main section.svc-hero')).toBeNull();

    /* The cut-down defs the content-styled pages ship: #tcGold, no solid. */
    expect(container.querySelector('svg.tc-defs #tcGold')).toBeTruthy();
    expect(container.querySelector('svg.tc-defs #tcGoldSolid')).toBeNull();
  });
});

/* ------------------------------------------------------------------------ */

describe('the detail template', () => {
  it.each(SLUGS)('/materials/%s.html renders its whole skeleton', async (slug) => {
    const material = getMaterial(slug);
    const { container } = render(
      await MaterialPage({ params: Promise.resolve({ slug }) }),
    );

    /* 1 — the hero: bg plate, crumb, h1, lede, CTAs, chips. */
    const hero = container.querySelector('main > section.svc-hero')!;
    expect(hero).toBeTruthy();
    expect(hero.querySelector('.svc-hero-bg')?.getAttribute('style')).toContain(
      material.hero.background,
    );
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      material.heading.text,
    );
    expect(hero.querySelector('.svc-hero-inner > .lede')?.textContent).toBe(
      material.hero.lede.text,
    );
    expect(hero.querySelectorAll('.cta-row > a')).toHaveLength(
      material.hero.ctas.length,
    );
    expect(hero.querySelector('.hero-chips .chip-google')).toBeTruthy();
    /* No `glow-card`: that is the site.css chrome, not this one. */
    expect(hero.querySelector('.hero-chips .glow-card')).toBeNull();

    /* The crumb is INSIDE the hero here, and its last item is this page. */
    const crumb = hero.querySelector('nav.crumb')!;
    expect(crumb).toBeTruthy();
    expect(crumb.querySelector('[aria-current="page"]')?.textContent).toBe(
      material.title,
    );

    /* 2 — the two-column lead, with the aside enquiry form. */
    const leadMain = container.querySelector('.lead-grid > .lead-main')!;
    expect(leadMain).toBeTruthy();
    expect(
      container.querySelector('.lead-grid > aside.lead-aside form#qform'),
    ).toBeTruthy();
    /* The lead answer, the fact table and the price line open the spine. */
    expect(leadMain.querySelector('.prose.lead-answer')).toBeTruthy();
    expect(leadMain.querySelectorAll('dl.facts > .fact').length).toBeGreaterThan(0);
    expect(leadMain.querySelector('p.price-line strong')?.textContent).toBe('Cost:');
    expect(leadMain.querySelectorAll('.appgrid > a.app').length).toBe(9);
    expect(leadMain.querySelectorAll('.steps > .step').length).toBe(6);

    /* 3 — the FAQ: native <details>, one per extracted question. */
    const faq = container.querySelector('main > section.faq')!;
    expect(faq.querySelectorAll('.faq-grid > details')).toHaveLength(
      material.faq.items.length,
    );
    expect(faq.querySelectorAll('.faq-grid > details > .a')).toHaveLength(
      material.faq.items.length,
    );

    /* 4/5 — Related, then the closing band, both full width. */
    expect(container.querySelector('main > section.block .rel-cols')).toBeTruthy();
    expect(container.querySelector('main > section.cta-band .cta-row')).toBeTruthy();
    expect(
      container.querySelector('section.cta-band p.cta-note')?.textContent,
    ).toBe(material.ctaBand.note.text);
  });

  it('keeps the FAQ, Related and CTA band OUTSIDE the lead grid', async () => {
    /* If any of the three renders into `.lead-main` it drops into a narrow
       column beside the form instead of running full width beneath it. */
    const { container } = render(
      await MaterialPage({ params: Promise.resolve({ slug: 'quartz-worktops' }) }),
    );
    const leadMain = container.querySelector('.lead-grid > .lead-main')!;
    expect(leadMain.querySelector('section.faq')).toBeNull();
    expect(leadMain.querySelector('section.cta-band')).toBeNull();
    expect(leadMain.querySelector('.rel-cols')).toBeNull();
  });

  it('gives every CTA both responsive labels', async () => {
    /* content.css swaps `.cta-long` for `.cta-short` below 720px. One label
       and the phone reads "Call 0800 098 2812" in a 96px-wide button. */
    const { container } = render(
      await MaterialPage({ params: Promise.resolve({ slug: 'marble-worktops' }) }),
    );
    const ctas = [...container.querySelectorAll('.cta-row > a')];
    expect(ctas.length).toBeGreaterThan(0);
    for (const cta of ctas) {
      expect(cta.querySelector('.cta-long')?.textContent).toBeTruthy();
      expect(cta.querySelector('.cta-short')?.textContent).toBeTruthy();
    }
  });
});

/* ------------------------------------------------------------------------ */

describe('the stones cross-links', () => {
  it('maps each material to its own stone family, and porcelain to none', () => {
    for (const [slug, family] of Object.entries(FAMILIES)) {
      expect(stoneFamilyForMaterial(slug)).toBe(family ?? 'porcelain');
      const found = stonesForMaterial(slug);
      if (family === null) {
        /* We hold no porcelain slabs. An empty column, or a link into a
           filter that returns nothing, would be worse than no column. */
        expect(found).toBeNull();
        continue;
      }
      expect(found).not.toBeNull();
      expect(found!.family).toBe(family);
    }
  });

  it('never mixes families — the marble page must not list quartzite', () => {
    /* The trap this test exists for: `taxonomy.mat` collapses quartzite and
       travertine into "Marble", so keying the filter off it would put 45
       stones under /materials/marble-worktops.html. `family` is the display
       taxonomy and is the right one. See lib/stones.ts, NOTE ON MATERIALS. */
    const byFamily = new Map(stones.map((s) => [s.slug, s.family]));
    for (const slug of SLUGS) {
      const found = stonesForMaterial(slug);
      if (!found) continue;
      for (const link of found.links) {
        expect(byFamily.get(link.slug)).toBe(found.family);
      }
    }
    const marble = stonesForMaterial('marble-worktops')!;
    expect(marble.total).toBe(18); // not 45
    expect(marble.links.some((l) => byFamily.get(l.slug) === 'quartzite')).toBe(false);
  });

  it('caps the column and offers the catalogue for the rest', () => {
    for (const slug of SLUGS) {
      const found = stonesForMaterial(slug);
      if (!found) continue;
      expect(found.links.length).toBeLessThanOrEqual(MAX_STONE_LINKS);
      expect(found.links.length).toBeLessThanOrEqual(found.total);
      expect(found.more.href).toBe('/stones/');
      expect(found.more.label).toBe(
        `All ${found.total} ${found.familyLabel.toLowerCase()} stones`,
      );
      /* No duplicates inside one column. */
      expect(new Set(found.links.map((l) => l.slug)).size).toBe(found.links.length);
    }
    /* Quartz is the one that would run away with the column: 67 stones. */
    expect(stonesForMaterial('quartz-worktops')!.total).toBe(67);
    expect(stonesForMaterial('quartz-worktops')!.links).toHaveLength(MAX_STONE_LINKS);
  });

  it('resolves every stone href to a route that exists', () => {
    /* The whole point. `url` is taken from the stone record rather than
       rebuilt from the slug, so a link cannot outlive its page — but assert
       both directions anyway, because a template that quietly formats its own
       href is exactly how this breaks later. */
    for (const slug of SLUGS) {
      const found = stonesForMaterial(slug);
      if (!found) continue;
      for (const link of found.links) {
        expect(STONE_SLUGS.has(link.slug)).toBe(true);
        expect(STONE_URLS.has(link.href)).toBe(true);
        expect(link.href).toBe(`/stones/${link.slug}.html`);
        expect(link.name).toBeTruthy();
      }
    }
  });

  it.each(SLUGS)(
    '/materials/%s.html emits no cross-link that 404s',
    async (slug) => {
      const { container } = render(
        await MaterialPage({ params: Promise.resolve({ slug }) }),
      );
      const main = container.querySelector('main')!;

      /* Every /stones/ href on the page must be either the collection hub or
         a stone detail page that is really in the dataset. */
      const stoneHrefs = hrefsIn(main).filter((h) => h.startsWith('/stones/'));
      for (const href of stoneHrefs) {
        expect(href === '/stones/' || STONE_URLS.has(href)).toBe(true);
      }

      /* And every /materials/ href must be the hub or one of the five. */
      for (const href of hrefsIn(main).filter((h) => h.startsWith('/materials/'))) {
        expect(href === '/materials/' || MATERIAL_URLS.has(href)).toBe(true);
      }

      /* No relative or protocol-less hrefs slipped in: these pages are
         exported to a `.html` leaf, so `foo.html` would resolve against
         /materials/ and a bare `stones/` against the wrong directory. */
      for (const href of hrefsIn(main)) {
        expect(
          href.startsWith('/') ||
            href.startsWith('#') ||
            href.startsWith('tel:') ||
            href.startsWith('mailto:') ||
            href.startsWith('https://'),
        ).toBe(true);
      }
    },
  );

  it('appends the stones column to Related without disturbing the ported ones', async () => {
    const material = getMaterial('granite-worktops');
    const extracted = material.body
      .flatMap((b) => b.content)
      .filter((c) => c.type === 'relatedColumns')
      .flatMap((c) => (c as { columns: { title: string }[] }).columns);

    const { container } = render(
      await MaterialPage({ params: Promise.resolve({ slug: 'granite-worktops' }) }),
    );
    const columns = [...container.querySelectorAll('.rel-cols > div')];

    /* The extracted columns come first, in source order and with their own
       copy; the stones column is appended after them. */
    expect(columns).toHaveLength(extracted.length + 1);
    extracted.forEach((column, i) => {
      expect(columns[i].querySelector('.foot-k')?.textContent).toBe(column.title);
    });

    const added = columns[columns.length - 1];
    expect(added.querySelector('.foot-k')?.textContent).toBe('Granite stones');
    const hrefs = hrefsIn(added);
    expect(hrefs).toHaveLength(MAX_STONE_LINKS + 1); // the eight, plus "all 20"
    expect(hrefs[hrefs.length - 1]).toBe('/stones/');
    expect(added.textContent).toContain('All 20 granite stones');
  });

  it('adds NOTHING to the porcelain page and nothing outside Related', async () => {
    /* Scoping guard. The cross-links are an addition to a page that ranks, so
       they are allowed in exactly one place: the Related block. If a stone
       link ever appears in the hero, the prose spine or the CTA band, that is
       new copy on an SEO page and it should be a deliberate decision, not a
       renderer accident. */
    const { container } = render(
      await MaterialPage({ params: Promise.resolve({ slug: 'quartz-worktops' }) }),
    );
    const related = container.querySelector('.rel-cols')!;
    const outside = hrefsIn(container.querySelector('main')!).filter(
      (h) => STONE_URLS.has(h) && !hrefsIn(related).includes(h),
    );
    expect(outside).toEqual([]);
  });

  it('leaves the porcelain page with only the columns the source shipped', async () => {
    const material = getMaterial('porcelain-worktops');
    const extracted = material.body
      .flatMap((b) => b.content)
      .filter((c) => c.type === 'relatedColumns')
      .flatMap((c) => (c as { columns: unknown[] }).columns);

    const { container } = render(
      await MaterialPage({ params: Promise.resolve({ slug: 'porcelain-worktops' }) }),
    );
    expect(container.querySelectorAll('.rel-cols > div')).toHaveLength(
      extracted.length,
    );
    /* Not one stone link anywhere on the page — the catalogue holds no
       porcelain, and an empty "Porcelain stones" heading would be a lie. */
    const stoneLinks = hrefsIn(container.querySelector('main')!).filter((h) =>
      STONE_URLS.has(h),
    );
    expect(stoneLinks).toEqual([]);
  });
});

/* ------------------------------------------------------------------------ */

describe('the route shell', () => {
  const LAYOUT = readFileSync(join(WEB, 'src', 'app', 'materials', 'layout.tsx'), 'utf8');

  it('imports seo.css, and imports it AFTER content.css', () => {
    /* Two selectors exist in both sheets and only the order decides them:
       `.prose p` (70ch -> 72ch) and `.block h2`. Swap these two lines and
       every prose paragraph on these six pages narrows by 2ch against the
       live build. seo.css is also the only sheet that defines `.mgrid`,
       `.mcard`, `.facts`, `.price-line`, `.appgrid`, `.rel`/`.rel-cols` and
       `.note` — drop it and the family renders unstyled. */
    const content = LAYOUT.indexOf("import '@/styles/content.css'");
    const seo = LAYOUT.indexOf("import '@/styles/seo.css'");
    expect(content).toBeGreaterThan(-1);
    expect(seo).toBeGreaterThan(content);
  });

  it('sets the content token root, like every other Family-B route', () => {
    expect(LAYOUT).toContain('document.body.dataset.tokens="content"');
  });

  it('ships no .rise anywhere — these six pages are not reveal-animated', async () => {
    /* Every other content family carries `.rise` and a <RiseObserver/>. The
       materials pages do not: not one section in the six legacy files has the
       class. Adding it without the observer would leave the page at opacity 0;
       adding both would introduce a fade the client never had. */
    const hub = render(<MaterialsIndexPage />);
    expect(hub.container.querySelectorAll('.rise')).toHaveLength(0);
    cleanup();

    for (const slug of SLUGS) {
      const { container } = render(
        await MaterialPage({ params: Promise.resolve({ slug }) }),
      );
      expect(container.querySelectorAll('.rise'), slug).toHaveLength(0);
      cleanup();
    }
  });
});

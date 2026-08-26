/**
 * The stone archetype: data integrity, the SEO head, and the search matcher.
 *
 * These pages are the biggest block of the port — 132 of the 178 — and they
 * are generated from one template, so a single wrong assumption in the data
 * layer is wrong 132 times. The assertions below are the ones that would catch
 * that: the counts, the URL shape the whole `trailingSlash: false` decision
 * rests on, the per-page canonical, and the two-field search behaviour that
 * makes the collection filter mean anything.
 */
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';

import StonePage, { generateStaticParams } from '../src/app/stones/[slug]/page';
import { metadataFromSeo } from '../src/lib/seo';
import {
  collection,
  compareData,
  comparePage,
  countLabel,
  getStone,
  matchesTerms,
  nearly,
  normaliseQuery,
  stoneSlugs,
  stones,
  tok,
} from '../src/lib/stones';

describe('the dataset', () => {
  it('carries all 132 stones, and generateStaticParams emits one route each', () => {
    expect(stones).toHaveLength(132);
    expect(generateStaticParams()).toHaveLength(132);
    expect(new Set(stoneSlugs()).size).toBe(132);
  });

  it('agrees with the collection index and the compare tool', () => {
    // Three independent extractions of the same 132 stones — the tiles on
    // /stones/, the CMP_DATA array on compare.html, and the detail pages.
    expect(collection.tiles).toHaveLength(132);
    expect(compareData).toHaveLength(132);
    const detail = new Set(stoneSlugs());
    expect(collection.tiles.every((t) => detail.has(t.slug))).toBe(true);
    expect(compareData.every((c) => detail.has(c.slug))).toBe(true);
  });

  it('keeps every URL as a .html leaf — the reason trailingSlash is false', () => {
    for (const stone of stones) {
      expect(stone.url).toBe(`/stones/${stone.slug}.html`);
      expect(stone.seo.canonical).toBe(
        `https://www.topcatworktops.co.uk/stones/${stone.slug}.html`,
      );
    }
    // The two hubs go the other way: directory URLs, restored by
    // scripts/postexport.mjs.
    expect(collection.seo.canonical).toBe('https://www.topcatworktops.co.uk/stones/');
    expect(comparePage.seo.canonical).toBe(
      'https://www.topcatworktops.co.uk/stones/compare.html',
    );
  });

  it('gives every stone three related tiles that resolve to real pages', () => {
    const known = new Set(stoneSlugs());
    for (const stone of stones) {
      expect(stone.related).toHaveLength(3);
      for (const related of stone.related) {
        expect(known.has(related.slug)).toBe(true);
        expect(related.href).toBe(`/stones/${related.slug}.html`);
        // Never suggest the page you are already on.
        expect(related.slug).not.toBe(stone.slug);
      }
    }
  });

  it('renders ul.stp-facts as a subsequence of the seven possible rows', () => {
    /*
     * The archetype map says "exactly 6 li". It is wrong, and checking it is
     * how we found out: the real distribution is 5 / 6 / 7 rows (55 / 53 / 24
     * stones). Two rows are optional and both were verified against the source
     * markup, not assumed —
     *
     *   Range          present on 24. `stones/taj-mahal.html` has
     *                  "<span>Range</span>Marble &amp; Quartzite"; almond-beige
     *                  has no Range row at all.
     *   Typical slab   absent on 55, e.g. stones/absolute-black-honed.html,
     *                  where the supplier quotes no standard slab size.
     *
     * So the invariant is order, not count. The template maps `facts` straight
     * through and must never hard-code six.
     */
    const ORDER = [
      'Stone',
      'Range',
      'Finish',
      'Typical slab',
      'Thickness',
      'Care',
      'In daily use',
    ];
    const histogram: Record<number, number> = {};
    for (const stone of stones) {
      const labels = stone.facts.map((f) => f.label);
      histogram[labels.length] = (histogram[labels.length] ?? 0) + 1;

      expect(labels).toEqual(ORDER.filter((label) => labels.includes(label)));
      expect(labels[0]).toBe('Stone');
      expect(labels.at(-1)).toBe('In daily use');
      expect(stone.facts.every((f) => f.value.length > 0)).toBe(true);
    }
    expect(histogram).toEqual({ 5: 55, 6: 53, 7: 24 });
  });

  it('carries the estimator palette preset and seed on every CTA', () => {
    // `p` and `s` are per-stone constants read by site.js:4587 to seed the
    // procedural marble canvas. They are not derivable, so if the extractor
    // ever drops them the estimator silently renders the wrong stone.
    for (const stone of stones) {
      expect(stone.estimator.p).toMatch(/^[a-z]+$/);
      expect(stone.estimator.s).toMatch(/^\d+$/);
      expect(stone.estimator.slug).toBe(stone.slug);
      expect(['Marble', 'Quartz', 'Granite']).toContain(stone.estimator.mat);

      const estimate = stone.ctas.find((c) => c.href.includes('#estimator'));
      expect(estimate?.href).toContain(`p=${stone.estimator.p}`);
      expect(estimate?.href).toContain(`s=${stone.estimator.s}`);
      expect(estimate?.href).toContain(`slug=${stone.slug}`);
    }
  });

  it('keeps the display family and the pricing bucket as separate fields', () => {
    // Five display families, three pricing buckets: quartzite and travertine
    // are sold as "Marble". Collapsing them would break either the filter UI
    // or the estimator deep-links.
    const families = new Set(stones.map((s) => s.family));
    const buckets = new Set(stones.map((s) => s.taxonomy.mat));
    expect([...families].sort()).toEqual([
      'granite',
      'marble',
      'quartz',
      'quartzite',
      'travertine',
    ]);
    expect([...buckets].sort()).toEqual(['Granite', 'Marble', 'Quartz']);

    const quartzite = stones.find((s) => s.family === 'quartzite');
    expect(quartzite?.taxonomy.mat).toBe('Marble');
  });

  it('ships two srcset variants for every slab image', () => {
    for (const stone of stones) {
      expect(stone.hero.image.srcset.map((s) => s.descriptor)).toEqual(['800w', '1600w']);
      expect(stone.hero.image.loading).toBe('lazy');
    }
    for (const tile of collection.tiles) {
      expect(tile.image.srcset).toHaveLength(2);
      expect(tile.image.loading).toBe('lazy');
    }
  });
});

describe('metadataFromSeo', () => {
  const stone = getStone('absolute-black-brushed');
  const meta = metadataFromSeo(stone.seo);

  it('emits the legacy title verbatim, not through the layout template', () => {
    // The root layout sets `template: '%s | Topcat'`, and every legacy title
    // already ends "| Topcat Worktops". Without `absolute` you get both.
    expect(meta.title).toEqual({
      absolute: 'Absolute Black Brushed Granite Worktops | Topcat Worktops',
    });
  });

  it('carries the hand-written description and the .html canonical', () => {
    expect(meta.description).toBe(stone.seo.description);
    expect(meta.alternates?.canonical).toBe(
      'https://www.topcatworktops.co.uk/stones/absolute-black-brushed.html',
    );
  });

  it('maps robots and the OG image dimensions', () => {
    expect(meta.robots).toEqual({ index: true, follow: true });
    const image = (meta.openGraph as { images: { width: number; height: number }[] })
      .images[0];
    expect(image.width).toBe(1200);
    expect(image.height).toBe(630);
  });

  it('gives all 132 stones a distinct title and description', () => {
    expect(new Set(stones.map((s) => s.seo.title)).size).toBe(132);
    expect(new Set(stones.map((s) => s.seo.description)).size).toBe(132);
  });
});

describe('the search matcher', () => {
  it('glues the multi-word phrases the tokeniser would otherwise split', () => {
    expect(normaliseQuery('marble effect')).toEqual(['marbleeffect']);
    expect(normaliseQuery('low maintenance')).toEqual(['lowmaintenance']);
    expect(normaliseQuery('off-white')).toEqual(['offwhite']);
    expect(normaliseQuery('  White ,  Matt ')).toEqual(['white', 'matt']);
    expect(normaliseQuery('   ')).toEqual([]);
  });

  it('matches SCOPED terms as whole words in attr, not substrings of find', () => {
    const record = {
      attr: 'carrara polished quartz light white statement',
      // "white" appears here only inside a sentence, never as a tag.
      find: 'a soft off-white background with grey veining',
    };
    // "white" is SCOPED, so it must hit `attr`, and this record's attr does
    // carry it.
    expect(matchesTerms(record, ['white'])).toBe(true);
    // "black" is SCOPED and absent from attr — a substring hit in find must
    // not rescue it.
    expect(matchesTerms({ ...record, attr: 'carrara polished' }, ['white'])).toBe(false);
  });

  it('falls back to a substring search for unscoped terms', () => {
    const record = { attr: 'carrara polished', find: 'gentle veining across the slab' };
    expect(matchesTerms(record, ['veining'])).toBe(true);
    expect(matchesTerms(record, ['granite'])).toBe(false);
  });

  it('corrects the known misspellings before matching', () => {
    const record = { attr: 'calacatta gold', find: 'calacatta gold marble' };
    expect(matchesTerms(record, ['calcutta'])).toBe(true);
    expect(matchesTerms(record, ['carrera'])).toBe(false);
  });

  it('tolerates one dropped letter, but only from five characters up', () => {
    expect(nearly('calacatta gold', 'calacata')).toBe(true);
    // Four characters: the guard is what stops short words matching everything.
    expect(nearly('grey slab', 'grye')).toBe(false);
    expect(tok('polished honed', 'honed')).toBe(true);
    expect(tok('polished honed', 'hone')).toBe(false);
  });

  it('requires every term, not any', () => {
    const record = { attr: 'white polished quartz', find: 'white polished quartz' };
    expect(matchesTerms(record, ['white', 'quartz'])).toBe(true);
    expect(matchesTerms(record, ['white', 'granite'])).toBe(false);
  });

  it('pluralises the count label the way the source does', () => {
    expect(countLabel(0)).toBe('Showing 0 stones');
    expect(countLabel(1)).toBe('Showing 1 stone');
    expect(countLabel(132)).toBe('Showing 132 stones');
    expect(collection.countLabel).toBe(countLabel(collection.tiles.length));
  });
});

describe('the stone detail template', () => {
  it('renders the archetype section for section', async () => {
    const stone = getStone('absolute-black-brushed');
    render(await StonePage({ params: Promise.resolve({ slug: stone.slug }) }));

    // 1 — breadcrumb, with the current page as the leaf.
    const crumb = screen.getByRole('navigation', { name: 'Breadcrumb' });
    expect(crumb).toHaveTextContent('Home');
    expect(crumb).toHaveTextContent('The collection');

    // 2 — hero: kicker, slab, compare link, h1, lede, six facts, CTAs, trust.
    expect(screen.getByText('Granite · Brushed')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Absolute Black Brushed',
    );
    expect(
      screen.getByAltText('Absolute Black Brushed granite slab'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', {
        name: /Compare Absolute Black Brushed with other stones/,
      }),
    ).toHaveAttribute('href', '/stones/compare.html?s=absolute-black-brushed');
    expect(document.querySelectorAll('.stp-facts li')).toHaveLength(
      stone.facts.length,
    );

    // 3-6 — the three .block sections and the cta-band, in order.
    const headings = screen
      .getAllByRole('heading', { level: 2 })
      .map((h) => h.textContent);
    expect(headings).toEqual([
      'About granite',
      'See it in your home, not on a screen',
      'More granite to consider',
      'Make it yours',
    ]);

    // 5 — exactly three related tiles, each a real stone page.
    const related = document.querySelectorAll('.st-grid.related .stile.mini');
    expect(related).toHaveLength(3);
    for (const tile of related) {
      expect(tile.getAttribute('href')).toMatch(/^\/stones\/[a-z0-9-]+\.html$/);
    }
  });

  it('paints the <em> gold word as markup, not as escaped text', () => {
    // `Rich` renders the extracted html so "About <em>granite</em>" keeps its
    // emphasis. Rebuilding it from text + accent would break the moment the
    // accent word appeared twice in a heading.
    const stone = getStone('absolute-black-brushed');
    expect(stone.sections.about.heading.html).toBe('About <em>granite</em>');
    expect(stone.sections.ctaBand.heading.html).toBe('Make it <em>yours</em>');
  });
});

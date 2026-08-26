/* ==========================================================================
   The two head fields no page renders and no reviewer reads: `robots` and
   `<html lang>`.

   Both went wrong silently, which is the whole reason this file exists. A
   wrong `robots` does not throw, does not change a pixel, and does not fail a
   build — it just hands Google a page the client de-indexed on purpose. A
   wrong `lang` is the same shape of failure aimed at locale targeting. The
   live HTML is the spec for both, so these assertions restate what the live
   corpus does and pin the port to it.
   ========================================================================== */

import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { metadataFromSeo } from '@/lib/seo';
import { comparePage } from '@/lib/stones';

import { extractSeo } from '../scripts/lib/common.mjs';
import { parse } from '../scripts/lib/minidom.mjs';

const WEB = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (...p: string[]) => readFileSync(join(WEB, ...p), 'utf8');

const DATA = join(WEB, 'src', 'data');
const LAYOUT = read('src', 'app', 'layout.tsx');
const POSTEXPORT = read('scripts', 'postexport.mjs');

interface SeoLike {
  robots?: unknown;
  lang?: unknown;
  canonical?: unknown;
}

/** Every `seo` block in every extracted data file, with the record's url. */
function everySeoRecord(): { url: string; seo: SeoLike }[] {
  const out: { url: string; seo: SeoLike }[] = [];
  const walk = (node: unknown): void => {
    if (Array.isArray(node)) {
      for (const child of node) walk(child);
      return;
    }
    if (node && typeof node === 'object') {
      const rec = node as { url?: unknown; seo?: unknown };
      if (typeof rec.url === 'string' && rec.seo && typeof rec.seo === 'object') {
        out.push({ url: rec.url, seo: rec.seo as SeoLike });
      }
      for (const value of Object.values(node)) walk(value);
    }
  };
  for (const file of readdirSync(DATA)) {
    if (!file.endsWith('.json')) continue;
    walk(JSON.parse(readFileSync(join(DATA, file), 'utf8')));
  }
  return out;
}

const RECORDS = everySeoRecord();

describe('robots', () => {
  it('finds a seo block for every extracted page', () => {
    // 169 of the 178 live pages are data-backed; the other nine (/ /about/
    // /contact/ /estimate/ /projects/ /privacy/ /terms/ /trade/ sitemap.html)
    // are hand-written routes with their metadata inline.
    expect(RECORDS.length).toBe(169);
  });

  it('de-indexes /stones/compare.html, and nothing else', () => {
    // The live page emits the tag TWICE — `index, follow` early in <head> and
    // `noindex, follow` as the last meta — and a crawler honours the last,
    // most restrictive directive. The shortlist tool is the sole noindex page
    // in the 178-page corpus, which makes it a deliberate client decision
    // rather than an accident to tidy away.
    const noindexed = RECORDS.filter(
      (r) => typeof r.seo.robots === 'string' && r.seo.robots.includes('noindex'),
    ).map((r) => r.url);
    expect(noindexed).toEqual(['/stones/compare.html']);

    expect(comparePage.seo.robots).toBe('noindex, follow');
    expect(metadataFromSeo(comparePage.seo).robots).toEqual({
      index: false,
      follow: true,
    });
  });

  it('leaves every other page on the source default', () => {
    for (const { url, seo } of RECORDS) {
      if (url === '/stones/compare.html') continue;
      expect(seo.robots, url).toBe('index, follow');
    }
  });

  it('reads the tag last-wins, which is how compare.html was missed', () => {
    // The regression was in the extractor, not in the data: `meta()` takes the
    // first match, so the decorative first copy won. Guard the helper itself
    // or the next extraction run puts the bug straight back.
    const html = `<html lang="en-GB"><head><title>t</title>
      <meta name="robots" content="index, follow">
      <meta name="description" content="d">
      <meta name="robots" content="noindex, follow">
    </head><body></body></html>`;
    const seo = extractSeo(parse(html));
    expect(seo?.robots).toBe('noindex, follow');
    // Single-tag pages — all 177 others — are unaffected by last-wins.
    const single = extractSeo(
      parse('<html lang="en-GB"><head><meta name="robots" content="index, follow"></head></html>'),
    );
    expect(single?.robots).toBe('index, follow');
  });
});

describe('<html lang>', () => {
  /** The lang the root layout hard-codes, read out of the source. */
  const layoutLang = /<html\s+lang="([^"]*)"/.exec(LAYOUT)?.[1];
  /** postexport's copy of the same value, and its per-page exceptions. */
  const rootLang = /const ROOT_LANG = '([^']*)'/.exec(POSTEXPORT)?.[1];

  it('renders en-GB, the value 177 of the 178 live pages serve', () => {
    expect(layoutLang).toBe('en-GB');
  });

  it('keeps postexport.mjs in step with the layout', () => {
    // postexport rewrites `lang` on the pages that disagree with the layout,
    // so its ROOT_LANG has to be the layout's value or it rewrites the wrong
    // pages. It fails the build loudly if this drifts; fail here first.
    expect(rootLang).toBe(layoutLang);
  });

  it('overrides the home page, the site’s only genuine "en"', () => {
    // App Router has one root layout and a page cannot reach <html>, so the
    // single exception is applied to out/index.html after the export.
    expect(POSTEXPORT).toMatch(/const LANG_OVERRIDES = \{\s*'\/': 'en',\s*\};/);
  });

  it('agrees with every extracted record', () => {
    // All 169 data-backed pages are en-GB. If an extraction ever produces a
    // different value, postexport picks it up automatically — but the layout
    // default should still be the majority, so notice it here.
    const langs = new Set(RECORDS.map((r) => r.seo.lang));
    expect([...langs]).toEqual(['en-GB']);
  });
});

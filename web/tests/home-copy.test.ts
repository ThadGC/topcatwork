import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import { FAQS, faqGroups } from '@/data/home/faqs';
import { PROCESS, PROC_COPY, PROC_DETAIL } from '@/data/home/process';
import { PROJECTS } from '@/data/home/projects';
import { REVIEWS } from '@/data/home/reviews';
import { SERVICES } from '@/data/home/services';
import { SRCSET } from '@/data/home/srcset';

/**
 * THE COPY GUARD.
 *
 * The fidelity bar on this port is "same copy, verbatim". The data modules
 * under src/data/home are generated from assets/site.js, but a generated file
 * can still be hand-edited later, and a single smart quote or a dropped
 * sentence would be invisible in review.
 *
 * So this suite reads the LEGACY SOURCE at test time and asserts that every
 * string the home page renders is still present in it, character for
 * character. It is a diff against the client's actual words, not against a
 * snapshot of our own output — a snapshot would happily lock in a typo we
 * introduced.
 *
 * If site.js is ever removed from the repo these tests should be deleted with
 * it, not weakened: at that point the data modules become the source of
 * truth and there is nothing left to compare against.
 */

const SITE_JS = readFileSync(
  resolve(__dirname, '../../assets/site.js'),
  'utf8',
);

/**
 * site.js is a JS file, so its string literals carry escapes: `\'` inside a
 * single-quoted string, and nothing else that matters here. Normalising the
 * one escape is enough to compare prose.
 */
const inSource = (s: string) => SITE_JS.includes(s.replace(/'/g, "\\'")) || SITE_JS.includes(s);

describe('services strip', () => {
  it('carries all eight services in source order', () => {
    expect(SERVICES).toHaveLength(8);
    expect(SERVICES.map((s) => s.t)).toEqual([
      'Kitchen Worktops',
      'Splashbacks',
      'Bathrooms',
      'Outdoor Spaces',
      'Fireplaces',
      'Dining Tables',
      'Vanity Tops',
      'Commercial',
    ]);
  });

  it('reproduces every back-of-card paragraph verbatim', () => {
    for (const s of SERVICES) expect(inSource(s.long), s.t).toBe(true);
  });

  it('points every card at an existing legacy .html leaf', () => {
    for (const s of SERVICES) {
      expect(s.href).toMatch(/^\/services\/[a-z-]+\.html$/);
      expect(inSource(s.href)).toBe(true);
    }
  });
});

describe('process steps', () => {
  it('has four steps and four tile lines', () => {
    expect(PROCESS).toHaveLength(4);
    expect(PROC_COPY).toHaveLength(4);
    expect(PROC_DETAIL).toHaveLength(4);
  });

  it('keeps the SECOND `d:` from the source literal', () => {
    // The source object declares `d` twice per step; JS keeps the later one,
    // and so must the extraction. If this ever flips, the tiles would show
    // the long-form line the legacy page never rendered.
    expect(PROCESS[0].d).toBe('Understanding your space and style.');
    expect(PROCESS[3].d).toBe('Fitted cleanly, usually within days.');
  });

  it('reproduces the tile lines and the modal copy verbatim', () => {
    for (const line of PROC_COPY) expect(inSource(line), line).toBe(true);
    for (const d of PROC_DETAIL) {
      expect(inSource(d.lede)).toBe(true);
      for (const [k, v] of d.points) {
        expect(inSource(k)).toBe(true);
        expect(inSource(v)).toBe(true);
      }
    }
  });
});

describe('reviews', () => {
  it('drops the four withheld reviewers and keeps the rest', () => {
    expect(REVIEWS).toHaveLength(15);
    for (const r of REVIEWS) {
      expect(r.n).not.toMatch(/luke|copley|thadeus|tabrez/i);
    }
  });

  it('reproduces every quote verbatim, emoji and curly quotes included', () => {
    for (const r of REVIEWS) {
      expect(inSource(r.q), r.n).toBe(true);
      expect(inSource(r.n), r.n).toBe(true);
    }
  });
});

describe('projects', () => {
  it('has eight projects, each with a gallery', () => {
    expect(PROJECTS).toHaveLength(8);
    for (const p of PROJECTS) {
      expect(p.gallery.length).toBeGreaterThan(0);
      // Intrinsic dimensions ride along so the lightbox can size its stage
      // before the image has loaded.
      for (const [src, w, h] of p.gallery) {
        expect(src).toMatch(/^\/assets\/projects\/.+\.webp$/);
        expect(w).toBeGreaterThan(0);
        expect(h).toBeGreaterThan(0);
      }
    }
  });

  it('only names reviewers that exist in REVIEWS', () => {
    // openFocus() looks the review up by name and warns when it misses. A
    // typo here would silently drop a review from a project page.
    const names = new Set(REVIEWS.map((r) => r.n));
    for (const p of PROJECTS) {
      if (p.reviewBy) expect(names.has(p.reviewBy), p.reviewBy).toBe(true);
    }
  });

  it('reproduces every project story verbatim', () => {
    for (const p of PROJECTS) {
      if (p.story) expect(inSource(p.story), p.name).toBe(true);
    }
  });
});

describe('faq', () => {
  it('has twelve questions in four groups, already sorted by group', () => {
    expect(FAQS).toHaveLength(12);
    const groups = faqGroups();
    expect(groups.map((g) => g.name)).toEqual([
      'Price and guarantee',
      'How it works',
      'Your stone',
      'Living with it',
    ]);
    // The builder starts a new group whenever `g` changes, so a question out
    // of order would silently create a fifth group with a duplicate name.
    expect(new Set(groups.map((g) => g.name)).size).toBe(groups.length);
    expect(groups.flatMap((g) => g.items)).toEqual(FAQS.map((_, i) => i));
  });

  it('reproduces every question and answer verbatim', () => {
    for (const f of FAQS) {
      expect(inSource(f.q), f.label).toBe(true);
      expect(inSource(f.a), f.label).toBe(true);
      expect(inSource(f.label), f.label).toBe(true);
      expect(inSource(f.tag), f.label).toBe(true);
    }
  });
});

describe('srcset table', () => {
  it('is the legacy SS map, and every display URL it lists is a real path', () => {
    for (const [url, set] of Object.entries(SRCSET)) {
      expect(inSource(url), url).toBe(true);
      expect(set).toMatch(/\d+w$/);
    }
  });

  it('covers every services card and every project card', () => {
    // A missing entry is not a runtime error — ss() just omits the attribute
    // — which is exactly why it is worth asserting. Silently losing a srcset
    // would ship a 2400px slab photo to a phone and nothing would break.
    for (const s of SERVICES) expect(SRCSET[s.img], s.t).toBeTruthy();
    for (const p of PROJECTS) expect(SRCSET[p.img], p.name).toBeTruthy();
  });

  it('has the one gap the legacy map has, and only that one', () => {
    // `process-template-678.webp` is genuinely absent from SS, so the legacy
    // page renders that tile with a bare `src` and no srcset. The port
    // reproduces the gap rather than inventing widths for files that are not
    // on the server — but it is pinned here so the gap stays deliberate.
    const missing = PROCESS.filter((p) => !SRCSET[p.img]).map((p) => p.img);
    expect(missing).toEqual(['/assets/site/process-template-678.webp']);
  });
});

/* ==========================================================================
   The seven ported pages render, and the copy on them is the client's.

   These are deliberately thin. The point is not to restate the markup — the
   markup IS the spec and a test that repeats it proves nothing — but to
   catch the three ways a port like this actually breaks: a page that throws,
   a page that lost its enquiry form, and a legal page whose body silently
   emptied because an extraction changed shape.
   ========================================================================== */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';

import AboutPage, { metadata as aboutMeta } from '@/app/about/page';
import ContactPage, { metadata as contactMeta } from '@/app/contact/page';
import EstimatePage, { metadata as estimateMeta } from '@/app/estimate/page';
import ProjectsPage, { metadata as projectsMeta } from '@/app/projects/page';
import PrivacyPage, { metadata as privacyMeta } from '@/app/(content)/(legal)/privacy/page';
import TermsPage, { metadata as termsMeta } from '@/app/(content)/(legal)/terms/page';
import TradePage, { metadata as tradeMeta } from '@/app/(content)/trade/page';

beforeEach(() => {
  localStorage.clear();
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, status: 200 }));
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('the four site-styled pages', () => {
  it.each([
    ['about', AboutPage, 'About us'],
    ['contact', ContactPage, 'Contact'],
    ['estimate', EstimatePage, 'Estimate'],
    ['projects', ProjectsPage, 'Projects'],
  ])('/%s/ renders its masthead and its enquiry card', (_slug, Page, heading) => {
    const { container } = render(<Page />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(heading);
    /* Every one of the four carries the enquiry card at #cta. */
    expect(container.querySelector('form#ctaForm')).toBeTruthy();
    expect(container.querySelector('#cta')).toBeTruthy();
  });

  it('keeps `pg-col` on /projects/, which its pinned gallery depends on', () => {
    const { container } = render(<ProjectsPage />);
    expect(container.querySelector('main')).toHaveClass('pg-col');
  });

  it('mounts both uploader roots on /estimate/, sharing one file list', () => {
    const { container } = render(<EstimatePage />);
    /* The compact one in the calculator, the full one in the POA panel, and
       the third inside the enquiry card's disclosure. */
    expect(container.querySelectorAll('.tc-up')).toHaveLength(3);
    expect(container.querySelectorAll('.tc-up.compact')).toHaveLength(1);
    /* site.js's mount marker must NOT be here — see the note in the page. */
    expect(container.querySelectorAll('[data-up]')).toHaveLength(0);
  });

  it('gives the gold gradients to the page, before anything paints with them', () => {
    const { container } = render(<AboutPage />);
    const defs = container.querySelector('svg.tc-defs');
    expect(defs).toBeTruthy();
    expect(defs!.querySelector('#tcGold')).toBeTruthy();
    expect(defs!.querySelector('#tcGoldSolid')).toBeTruthy();
  });
});

describe('the three content-styled pages', () => {
  it('/trade/ renders its hero, its aside form and its FAQ', () => {
    const { container } = render(<TradePage />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'A worktop partner that behaves like your team',
    );
    expect(container.querySelector('form#qform')).toBeTruthy();
    expect(container.querySelectorAll('.faq details')).toHaveLength(6);
    /* The cut-down defs: #tcGold only, no #tcGoldSolid. */
    expect(container.querySelector('svg.tc-defs #tcGold')).toBeTruthy();
    expect(container.querySelector('svg.tc-defs #tcGoldSolid')).toBeNull();
  });

  it('/privacy/ keeps the promises its own copy makes', () => {
    const { container } = render(<PrivacyPage />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Privacy Policy');
    const legal = container.querySelector('.legal');
    expect(legal).toBeTruthy();
    expect(legal!.textContent).toContain('This website sets no cookies');
    expect(legal!.textContent).toContain('Information Commissioner');
    /* The #cookies anchor is linked from the footer; losing it 404s a link. */
    expect(legal!.querySelector('#cookies')).toBeTruthy();
  });

  it('/terms/ keeps all twelve numbered sections and the closing line', () => {
    const { container } = render(<TermsPage />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Terms & Conditions',
    );
    const legal = container.querySelector('.legal')!;
    expect(legal.querySelectorAll('h2')).toHaveLength(12);
    expect(legal.querySelector('address')).toBeTruthy();
    expect(legal.querySelector('.legal-close')?.textContent).toContain(
      'Acceptance of quotation is considered acknowledgement',
    );
  });

  it('carries a breadcrumb whose last item is the current page', () => {
    const { container } = render(<PrivacyPage />);
    const crumb = container.querySelector('nav.crumb')!;
    expect(crumb.querySelector('[aria-current="page"]')?.textContent).toBe(
      'Privacy Policy',
    );
  });
});

/* ------------------------------------------------------------------------ */

/**
 * THE DOUBLE-SUFFIX GUARD.
 *
 * app/layout.tsx sets `title: { template: '%s | Topcat' }`, and every legacy
 * title already ends in the brand. A page that writes `title: 'Privacy Policy
 * | Topcat Worktops'` as a bare string therefore ships "Privacy Policy |
 * Topcat Worktops | Topcat" — a silent SEO regression on the exact string
 * these pages rank on, invisible in the source file and visible only in the
 * exported <head>.
 *
 * src/lib/seo.ts already solves it with `{ absolute }` for the 171 extracted
 * pages; these seven write their metadata by hand, so they are checked
 * against the legacy <title> itself rather than against each other.
 */
describe('the seven hand-written page titles', () => {
  const legacyTitle = (dir: string) => {
    const html = readFileSync(resolve(__dirname, `../../${dir}/index.html`), 'utf8');
    return /<title>(.*?)<\/title>/s
      .exec(html)![1]
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");
  };

  it.each([
    ['about', aboutMeta],
    ['contact', contactMeta],
    ['estimate', estimateMeta],
    ['projects', projectsMeta],
    ['privacy', privacyMeta],
    ['terms', termsMeta],
    ['trade', tradeMeta],
  ])('/%s/ declares an absolute title equal to the legacy one', (dir, meta) => {
    expect(meta.title).toEqual({ absolute: legacyTitle(dir) });
    // The failure this exists to catch, stated directly.
    expect(typeof meta.title).not.toBe('string');
    expect(legacyTitle(dir)).not.toMatch(/\| Topcat \| Topcat$/);
  });
});

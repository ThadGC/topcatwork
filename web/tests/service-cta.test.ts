/* ==========================================================================
   THE SERVICE PAGES' ENQUIRY ROUTING.

   The client, 28 Aug: "instead of having a call to action above the footer, I
   want it to be an actual form... and all the CTAs that talk about getting an
   estimate on those individual pages go to the bottom of the page to that form
   instead of the individual contact page."

   ⚠️ WHY THIS FILE EXISTS AT ALL. tests/services.test.tsx is the natural home
   for it, and all 35 of its tests fail from the broken jsdom shim — they
   cannot report a regression. These assertions are deliberately pure: they
   read the dataset and the two helpers, render nothing, and therefore actually
   run. When the shim is fixed, the markup-level checks in services.test.tsx
   become the second line rather than the only one.
   ========================================================================== */

import { describe, expect, it } from 'vitest';

import { SERVICE_OPTIONS } from '@/lib/form/serviceOptions';
import {
  getService,
  serviceCtaHref,
  serviceCtas,
  serviceEnquiryLabel,
  serviceSlugs,
  type Cta,
} from '@/lib/services';

/** Every CTA the nine pages carry, wherever it sits in the record. */
function allCtas(slug: string): Cta[] {
  const s = getService(slug);
  const inline = s.body.flatMap((block) =>
    block.content.flatMap((node) => (node.type === 'ctaInline' ? node.ctas : [])),
  );
  return [...s.hero.ctas, ...inline, ...s.ctaBand.ctas];
}

describe('serviceCtaHref', () => {
  it('sends every "Get your free quote" to the form on the page', () => {
    for (const slug of serviceSlugs()) {
      const quotes = allCtas(slug).filter((c) => c.href === '/contact/');
      // Four per page today: hero, two mid-page prompts, the closing band.
      expect(quotes.length).toBeGreaterThan(0);
      for (const cta of quotes) expect(serviceCtaHref(cta)).toBe('#cta');
    }
  });

  it('leaves the phone number alone', () => {
    for (const slug of serviceSlugs()) {
      for (const cta of allCtas(slug)) {
        if (cta.href.startsWith('tel:')) expect(serviceCtaHref(cta)).toBe(cta.href);
      }
    }
  });

  it('leaves navigation alone, so nobody is stranded on the page they are reading', () => {
    // The body links sibling services, /stones/ and the porcelain material
    // page. Re-pointing those at the form would break the cross-sell.
    const nav = [
      { href: '/stones/', label: 'Quartz', variant: 'ghost' },
      { href: '/materials/porcelain-worktops.html', label: 'Porcelain', variant: 'ghost' },
      { href: 'kitchen-islands.html', label: 'Kitchen Islands', variant: 'ghost' },
      { href: '/services/', label: 'Back to Services', variant: 'ghost' },
    ] as unknown as Cta[];
    for (const cta of nav) expect(serviceCtaHref(cta)).toBe(cta.href);
  });

  it('rewrites a row without mutating the dataset', () => {
    const slug = serviceSlugs()[0];
    const before = getService(slug).hero.ctas;
    const after = serviceCtas(before);
    expect(after).not.toBe(before);
    // The record the next request reads must still say /contact/.
    expect(getService(slug).hero.ctas.some((c) => c.href === '/contact/')).toBe(true);
    expect(after.some((c) => c.href === '/contact/')).toBe(false);
    // Labels and variants ride through untouched: service.css needs both spans.
    after.forEach((c, i) => {
      expect(c.variant).toBe(before[i].variant);
      expect(c.labelLong ?? c.label).toBe(before[i].labelLong ?? before[i].label);
    });
  });

  it('leaves no page CTA pointing at /contact/ once rewritten', () => {
    for (const slug of serviceSlugs()) {
      const rewritten = serviceCtas(allCtas(slug));
      expect(rewritten.filter((c) => c.href === '/contact/')).toHaveLength(0);
    }
  });
});

describe('serviceEnquiryLabel', () => {
  it('names every one of the nine pages', () => {
    for (const slug of serviceSlugs()) {
      expect(serviceEnquiryLabel(slug), `no enquiry label for ${slug}`).toBeTruthy();
    }
  });

  it('only ever uses a label the enquiry select already offers', () => {
    // The value lands in the same `service` field as #qfService, so a label
    // outside this list would read as a new category in TopCat's inbox.
    for (const slug of serviceSlugs()) {
      expect(SERVICE_OPTIONS).toContain(serviceEnquiryLabel(slug)!);
    }
  });

  it('matches the options the dataset itself ships for the aside select', () => {
    for (const slug of serviceSlugs()) {
      expect(getService(slug).enquiryForm.select.options).toContain(
        serviceEnquiryLabel(slug)!,
      );
    }
  });

  it('returns undefined for an unknown slug rather than guessing', () => {
    // An enquiry with no service is a small loss; one carrying the wrong
    // service is a real one.
    expect(serviceEnquiryLabel('not-a-service')).toBeUndefined();
  });
});

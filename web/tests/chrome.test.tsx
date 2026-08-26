import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';

import { MobileNav } from '../src/components/chrome/MobileNav';
import { SiteFooter } from '../src/components/chrome/SiteFooter';
import { SiteHeader } from '../src/components/chrome/SiteHeader';
import { StickyContactBar } from '../src/components/chrome/StickyContactBar';
import {
  FOOT_EXPLORE,
  PRIMARY,
  SERVICES,
  STONES_DESKTOP,
  STONES_MOBILE,
  thresholdForVariant,
  variantForPath,
} from '../src/components/chrome/nav-data';

/**
 * These guard the handful of chrome details that a later edit is most likely
 * to "tidy" into a regression — the ones the source only reveals if you diff
 * all 178 pages. Each one names the source line it is defending.
 */

let pathname = '/';
vi.mock('next/navigation', () => ({
  usePathname: () => pathname,
}));

beforeEach(() => {
  pathname = '/';
  document.documentElement.className = '';
  window.scrollY = 0;
});

afterEach(() => {
  cleanup();
  document.documentElement.className = '';
});

/* ------------------------------------------------------------------------ */

describe('variant resolution', () => {
  it('routes the six site.css pages to rich and everything else to lite', () => {
    for (const p of [
      '/',
      '/about/',
      '/contact/',
      '/estimate/',
      '/projects/',
      '/services/',
    ]) {
      expect(variantForPath(p), p).toBe('rich');
    }

    // A service DETAIL page is lite even though /services/ itself is rich.
    for (const p of [
      '/services/fireplaces/',
      '/stones/carrara/',
      '/guides/quartz/',
      '/worktops/london/',
      '/trade/',
      '/privacy/',
      '/sitemap/',
    ]) {
      expect(variantForPath(p), p).toBe('lite');
    }
  });

  it('keeps the two measured scroll thresholds apart', () => {
    // site.js:2815 vs the content pages' inline `window.scrollY>12`.
    expect(thresholdForVariant('rich')).toBe(40);
    expect(thresholdForVariant('lite')).toBe(12);
  });
});

/* ------------------------------------------------------------------------ */

describe('SiteHeader', () => {
  it('gives the rich bar its id, flare and dropdowns, and the lite bar none', () => {
    const { container, rerender } = render(<SiteHeader variant="rich" />);
    expect(container.querySelector('header.bar')).toHaveAttribute(
      'id',
      'siteBar',
    );
    expect(container.querySelector('.bar-flare')).toBeInTheDocument();
    expect(container.querySelectorAll('.nav-item')).toHaveLength(2);

    rerender(<SiteHeader variant="lite" />);
    expect(container.querySelector('header.bar')).not.toHaveAttribute('id');
    expect(container.querySelector('.bar-flare')).not.toBeInTheDocument();
    expect(container.querySelectorAll('.nav-item')).toHaveLength(0);
    expect(container.querySelectorAll('nav.top > a')).toHaveLength(
      PRIMARY.length,
    );
  });

  it('renders class="bar" on the server pass, as the legacy HTML does', () => {
    // The source adds .scrolled from a deferred script, so the shipped HTML
    // never carries it. Anything else is a hydration mismatch waiting to fire.
    const { container } = render(<SiteHeader variant="rich" />);
    expect(container.querySelector('header')!.className).toBe('bar');
  });

  it('forms at 40px on rich and 12px on lite', () => {
    const { container, unmount } = render(<SiteHeader variant="lite" />);
    const bar = () => container.querySelector('header.bar')!;

    act(() => {
      window.scrollY = 20;
      window.dispatchEvent(new Event('scroll'));
    });
    expect(bar().className).toContain('scrolled'); // 20 > 12
    unmount();

    const rich = render(<SiteHeader variant="rich" />);
    act(() => {
      window.scrollY = 20;
      window.dispatchEvent(new Event('scroll'));
    });
    expect(
      rich.container.querySelector('header.bar')!.className,
    ).not.toContain('scrolled'); // 20 < 40
  });

  it('keeps the two carets structurally different', () => {
    // Services is stroke-width 1.6 with a linecap only; Stones is 1.4 and
    // also sets a linejoin. Hand-editing drift in the source, kept.
    const { container } = render(<SiteHeader variant="rich" />);
    const carets = container.querySelectorAll('.nav-caret path');
    expect(carets).toHaveLength(2);
    expect(carets[0].getAttribute('stroke-width')).toBe('1.6');
    expect(carets[0].getAttribute('stroke-linejoin')).toBeNull();
    expect(carets[1].getAttribute('stroke-width')).toBe('1.4');
    expect(carets[1].getAttribute('stroke-linejoin')).toBe('round');
  });

  it('adds no ARIA state to the CSS-only dropdowns', () => {
    // :hover / :focus-within with no JS. Announcing an expanded state that no
    // key can toggle would be worse than the source's silence.
    const { container } = render(<SiteHeader variant="rich" />);
    for (const item of container.querySelectorAll('.nav-item > a')) {
      expect(item).not.toHaveAttribute('aria-expanded');
      expect(item).not.toHaveAttribute('aria-haspopup');
    }
  });
});

/* ------------------------------------------------------------------------ */

describe('mobile nav', () => {
  const bothMounted = (variant: 'rich' | 'lite' = 'lite') =>
    render(
      <>
        <SiteHeader variant={variant} />
        <MobileNav variant={variant} />
      </>,
    );

  it('shares one open state between the burger and the sheet', () => {
    // They are separate components; the module store is what joins them.
    bothMounted();
    const burger = screen.getByRole('button', { name: 'Open menu' });

    fireEvent.click(burger);
    expect(document.documentElement).toHaveClass('nav-open');
    expect(burger).toHaveAttribute('aria-expanded', 'true');
    expect(burger).toHaveAccessibleName('Close menu');

    fireEvent.click(burger);
    expect(document.documentElement).not.toHaveClass('nav-open');
  });

  it('renders exactly ten children, because the stagger is positional', () => {
    // nav.css targets .mobile-nav > *:nth-child(1..9); .mn-row is child ten
    // precisely so that it gets no delay.
    const { container } = render(<MobileNav />);
    const sheet = container.querySelector('#mobileNav')!;
    expect(sheet.children).toHaveLength(10);
    expect(sheet.children[9]).toHaveClass('mn-row');
    expect(sheet.children[1]).toHaveAttribute('id', 'mnSubServices');
    expect(sheet.children[4]).toHaveAttribute('id', 'mnSubStones');
  });

  it('closes when any link inside the sheet is tapped', () => {
    bothMounted();
    fireEvent.click(screen.getByRole('button', { name: 'Open menu' }));
    expect(document.documentElement).toHaveClass('nav-open');

    fireEvent.click(screen.getByRole('link', { name: 'Get a free quote' }));
    expect(document.documentElement).not.toHaveClass('nav-open');
  });

  it('closes on Escape unconditionally, as the source does', () => {
    bothMounted();
    fireEvent.click(screen.getByRole('button', { name: 'Open menu' }));
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(document.documentElement).not.toHaveClass('nav-open');

    // Bound with no open-state guard, so a second press is a harmless no-op.
    expect(() => fireEvent.keyDown(window, { key: 'Escape' })).not.toThrow();
  });

  it('opens one sub-panel at a time', () => {
    const { container } = render(<MobileNav />);
    const [services, stones] = [
      ...container.querySelectorAll<HTMLButtonElement>('.mn-toggle'),
    ];

    fireEvent.click(services);
    expect(services).toHaveAttribute('aria-expanded', 'true');
    expect(container.querySelector('#mnSubServices')).toHaveClass('open');

    // closeSubs() runs first in the source, so this closes Services.
    fireEvent.click(stones);
    expect(services).toHaveAttribute('aria-expanded', 'false');
    expect(stones).toHaveAttribute('aria-expanded', 'true');
    expect(container.querySelector('#mnSubServices')).not.toHaveClass('open');

    // Tapping the open one closes it.
    fireEvent.click(stones);
    expect(stones).toHaveAttribute('aria-expanded', 'false');
  });

  it('resets the accordion on a lite Escape but not on a rich one', () => {
    // site.js only resets from the burger's second click listener; the content
    // pages' inline script folds closeSubs into setOpen, so every close resets.
    const rich = render(
      <>
        <SiteHeader variant="rich" />
        <MobileNav variant="rich" />
      </>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Open menu' }));
    fireEvent.click(rich.container.querySelector('.mn-toggle')!);
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(rich.container.querySelector('#mnSubServices')).toHaveClass('open');
    cleanup();

    const lite = render(
      <>
        <SiteHeader variant="lite" />
        <MobileNav variant="lite" />
      </>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Open menu' }));
    fireEvent.click(lite.container.querySelector('.mn-toggle')!);
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(lite.container.querySelector('#mnSubServices')).not.toHaveClass(
      'open',
    );
  });

  it('releases the scroll lock when the sheet unmounts', () => {
    const { unmount } = bothMounted();
    fireEvent.click(screen.getByRole('button', { name: 'Open menu' }));
    expect(document.documentElement).toHaveClass('nav-open');
    unmount();
    expect(document.documentElement).not.toHaveClass('nav-open');
  });

  it('lists six stones on mobile against three on the desktop dropdown', () => {
    // Not a transcription slip — the legacy markup really does differ.
    expect(STONES_DESKTOP).toHaveLength(3);
    expect(STONES_MOBILE).toHaveLength(6);

    const { container } = render(<MobileNav />);
    expect(
      container.querySelectorAll('#mnSubStones a'),
    ).toHaveLength(STONES_MOBILE.length);
    expect(
      container.querySelectorAll('#mnSubServices a'),
    ).toHaveLength(SERVICES.length);
  });
});

/* ------------------------------------------------------------------------ */

describe('StickyContactBar', () => {
  it("takes the source's early return when there is no reveal anchor", () => {
    // `if(!document.querySelector('.hero-ctas')){ bar-always; on; return; }`
    const { container } = render(<StickyContactBar mode="scroll" />);
    expect(container.querySelector('.mbar')).toHaveClass('on');
    expect(document.documentElement).toHaveClass('bar-always');
  });

  it('stays down until the anchor clears the header, then comes up', () => {
    const anchor = document.createElement('div');
    anchor.className = 'hero-ctas';
    anchor.getBoundingClientRect = () => ({ bottom: 500 }) as DOMRect;
    document.body.append(anchor);

    const { container } = render(<StickyContactBar mode="scroll" />);
    expect(container.querySelector('.mbar')).not.toHaveClass('on');
    expect(document.documentElement).not.toHaveClass('bar-always');

    act(() => {
      anchor.getBoundingClientRect = () => ({ bottom: -10 }) as DOMRect;
      window.dispatchEvent(new Event('scroll'));
    });
    expect(container.querySelector('.mbar')).toHaveClass('on');

    anchor.remove();
  });
});

/* ------------------------------------------------------------------------ */

describe('SiteFooter', () => {
  it('leaves .foot-tail empty so :empty can hide it below 721px', () => {
    const { container } = render(<SiteFooter />);
    const tail = container.querySelector('#footTail')!;
    // A single stray comment or space here breaks `.foot-tail:empty`.
    expect(tail.childNodes).toHaveLength(0);
  });

  it('renders area and hours inside .foot-contact for the server pass', () => {
    // jsdom resolves no media query, so --footTail is never 'on' and the
    // re-parenting is a no-op — which is exactly the <721px reading.
    const { container } = render(<SiteFooter />);
    expect(
      container.querySelector('.foot-contact .foot-c-area'),
    ).toBeInTheDocument();
    expect(
      container.querySelector('.foot-contact .foot-c-hours'),
    ).toBeInTheDocument();
  });

  it('carries the Explore column and the bare #faq link the source ships', () => {
    const { container } = render(<SiteFooter />);
    expect(container.querySelectorAll('.foot-explore li')).toHaveLength(
      FOOT_EXPLORE.length,
    );
    // Dead on 174 of 178 pages. A source bug, carried; pass faqHref to fix it.
    expect(screen.getByRole('link', { name: 'FAQ' })).toHaveAttribute(
      'href',
      '#faq',
    );
  });

  it('accepts a corrected FAQ href', () => {
    render(<SiteFooter faqHref="/#faq" />);
    expect(screen.getByRole('link', { name: 'FAQ' })).toHaveAttribute(
      'href',
      '/#faq',
    );
  });
});

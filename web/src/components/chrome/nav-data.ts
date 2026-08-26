/**
 * Every link and contact string the chrome renders, in one place.
 *
 * ---------------------------------------------------------------------------
 * URL SHAPE
 * ---------------------------------------------------------------------------
 * next.config.ts pins `output: 'export'` + `trailingSlash: true`, so the build
 * emits directory URLs (`/services/kitchen-worktops/index.html`). Next cannot
 * emit `/services/kitchen-worktops.html` under that config, so the four legacy
 * `.html` link shapes become directories here:
 *
 *   /services/<slug>.html   ->  /services/<slug>/     (9 links)
 *   /stones/compare.html    ->  /stones/compare/      (2 links)
 *   /sitemap.html           ->  /sitemap/             (1 link)
 *   /index.html#hero        ->  /#hero                (brand, lite pages)
 *
 * Those are the ONLY href changes in the whole chrome, and every one of them
 * lands on the same page. They need 301s in .htaccess at cutover — that list
 * is exactly the mapping above.
 */

/* --- contact ------------------------------------------------------------ */

export const PHONE_TEL = 'tel:+448000982812';
export const PHONE_DISPLAY = '0800 098 2812';

export const WHATSAPP_URL = 'https://wa.me/447464940287';
export const WHATSAPP_DISPLAY = '07464 940287';

export const EMAIL = 'info@topcatworktops.co.uk';
export const EMAIL_HREF = `mailto:${EMAIL}`;

export const INSTAGRAM_URL = 'https://www.instagram.com/topcatworktops/';
export const LINKEDIN_URL = 'https://www.linkedin.com/company/topcat-worktops/';

export const BRAND_HOME = '/#hero';
export const BRAND_LABEL = 'Topcat Worktops, home';

export const WA_FAB_LABEL = 'Message Topcat Worktops on WhatsApp';
export const CALL_FAB_LABEL = `Call Topcat Worktops on ${PHONE_DISPLAY}`;

/* --- shape -------------------------------------------------------------- */

export interface NavLink {
  readonly href: string;
  readonly label: string;
}

/* --- primary nav (the flat 7, in source order) -------------------------- */

export const PRIMARY: readonly NavLink[] = [
  { href: '/services/', label: 'Services' },
  { href: '/projects/', label: 'Projects' },
  { href: '/stones/', label: 'Stones' },
  { href: '/estimate/', label: 'Estimate' },
  { href: '/about/', label: 'About us' },
  { href: '/trade/', label: 'Trade' },
  { href: '/contact/', label: 'Contact' },
];

/* --- the nine service pages, desktop dropdown and mobile sub alike ------ */

export const SERVICES: readonly NavLink[] = [
  { href: '/services/kitchen-worktops/', label: 'Kitchen worktops' },
  { href: '/services/kitchen-islands/', label: 'Kitchen islands' },
  { href: '/services/splashbacks/', label: 'Splashbacks' },
  { href: '/services/bathroom-worktops/', label: 'Bathrooms' },
  { href: '/services/outdoor-kitchens/', label: 'Outdoor spaces' },
  { href: '/services/fireplaces/', label: 'Fireplaces' },
  { href: '/services/dining-tables/', label: 'Dining tables' },
  { href: '/services/vanity-tops/', label: 'Vanity tops' },
  { href: '/services/commercial-worktops/', label: 'Commercial' },
];

/**
 * The desktop Stones dropdown lists three items. The mobile one lists six.
 *
 * This is NOT a transcription slip — the legacy markup really does differ,
 * and the mobile sheet is the one that carries the three range anchors.
 * Reproduced as found.
 */
export const STONES_DESKTOP: readonly NavLink[] = [
  { href: '/#stones', label: 'Stone selector' },
  { href: '/stones/', label: 'All stones' },
  { href: '/stones/compare/', label: 'Compare stones' },
];

export const STONES_MOBILE: readonly NavLink[] = [
  { href: '/#stones', label: 'Stone selector' },
  { href: '/stones/', label: 'All stones' },
  { href: '/stones/#quartz', label: 'Quartz' },
  { href: '/stones/#marble', label: 'Marble & Quartzite' },
  { href: '/stones/#granite', label: 'Granite' },
  { href: '/stones/compare/', label: 'Compare stones' },
];

/* --- footer columns ----------------------------------------------------- */

export const FOOT_EXPLORE: readonly NavLink[] = [
  { href: '/services/', label: 'Services' },
  { href: '/projects/', label: 'Projects' },
  { href: '/stones/', label: 'Stones' },
  { href: '/estimate/', label: 'Estimate' },
  { href: '/about/', label: 'About us' },
  { href: '/trade/', label: 'For the trade' },
];

/**
 * `faqHref` fills the last slot. The source hard-codes a bare `#faq`, which
 * only resolves on the three pages that actually have a FAQ section (home,
 * about, contact) and is a dead link on the other 174. Carried as-is; pass
 * `faqHref="/#faq"` to <SiteFooter> if the client wants it fixed.
 */
export const FOOT_BROWSE_HEAD: readonly NavLink[] = [
  { href: '/materials/', label: 'Materials' },
  { href: '/guides/', label: 'Worktop guides' },
  { href: '/worktops/', label: 'Areas we cover' },
];

export const FOOT_LEGAL: readonly NavLink[] = [
  { href: '/sitemap/', label: 'Sitemap' },
  { href: '/privacy/', label: 'Privacy' },
  { href: '/terms/', label: 'Terms' },
  { href: '/privacy/#cookies', label: 'Cookies' },
];

export const FOOT_TAGLINE =
  'Bespoke stone worktops, from slab selection to a flawless fit.';

export const FOOT_AREA =
  'London, Hertfordshire, Essex, Berkshire, Buckinghamshire, Surrey, ' +
  'Oxfordshire & Bedfordshire, plus nationwide templating';

export const FOOT_HOURS = 'Monday to Sunday, 7am to 9pm';

export const FOOT_COPYRIGHT = '© 2026 Topcat Worktops Ltd. All rights reserved.';

/* --- chrome variant ----------------------------------------------------- */

export type ChromeVariant = 'rich' | 'lite';

/**
 * The six pages the legacy site serves with the full `assets/site.css`:
 * dropdown nav, `.bar-flare`, the FABs, `scrollY > 40`, footer inside <main>.
 * Everything else is `lite` — flat nav, no flare, no FABs, `scrollY > 12`,
 * footer after </main>.
 */
export const RICH_ROUTES: readonly string[] = [
  '/',
  '/about',
  '/contact',
  '/estimate',
  '/projects',
  '/services',
];

/** `/services/` and `/services` both resolve; `/services/fireplaces/` does not. */
export function variantForPath(pathname: string | null | undefined): ChromeVariant {
  if (!pathname) return 'lite';
  const clean = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
  return RICH_ROUTES.includes(clean) ? 'rich' : 'lite';
}

/** The scroll distance at which `.scrolled` latches. Measured, and divergent. */
export function thresholdForVariant(variant: ChromeVariant): number {
  return variant === 'rich' ? 40 : 12;
}

/**
 * Every link and contact string the chrome renders, in one place.
 *
 * ---------------------------------------------------------------------------
 * URL SHAPE
 * ---------------------------------------------------------------------------
 * next.config.ts pins `output: 'export'` + `trailingSlash: FALSE`, so a leaf
 * route exports to the legacy URL unchanged: `app/services/[slug]/page.tsx`
 * emits `out/services/kitchen-worktops.html`. The `.html` link shapes below
 * are therefore the real exported paths and must stay as the source writes
 * them — rewriting one to a directory URL is a dead link, not a redirect,
 * because postexport.mjs only creates directory forms for urls that END in a
 * slash.
 *
 *   /services/<slug>.html   9 links, live as written        ✔ route exists
 *   /stones/compare.html    2 links                          ✔ route exists
 *   /sitemap.html           1 link, on every page            ✔ route exists
 *   /index.html#hero    ->  /#hero    (brand, lite pages)   the one rewrite
 *
 * That last one is the only href in the whole chrome that differs from the
 * legacy markup, and it lands on the same page — .htaccess serves index.html
 * at the root either way, so it needs no redirect.
 *
 * ⚠️ This block used to describe `trailingSlash: true` and mapped all four
 * shapes to directories. The config moved and the hrefs moved with it; if you
 * are ever tempted to put the slashes back, read the long note in
 * next.config.ts first — 149 of the 178 live URLs are `.html` leaves.
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
  { href: '/services/kitchen-worktops.html', label: 'Kitchen worktops' },
  { href: '/services/kitchen-islands.html', label: 'Kitchen islands' },
  { href: '/services/splashbacks.html', label: 'Splashbacks' },
  { href: '/services/bathroom-worktops.html', label: 'Bathrooms' },
  { href: '/services/outdoor-kitchens.html', label: 'Outdoor spaces' },
  { href: '/services/fireplaces.html', label: 'Fireplaces' },
  { href: '/services/dining-tables.html', label: 'Dining tables' },
  { href: '/services/vanity-tops.html', label: 'Vanity tops' },
  { href: '/services/commercial-worktops.html', label: 'Commercial' },
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
  { href: '/stones/compare.html', label: 'Compare stones' },
];

export const STONES_MOBILE: readonly NavLink[] = [
  { href: '/#stones', label: 'Stone selector' },
  { href: '/stones/', label: 'All stones' },
  { href: '/stones/#quartz', label: 'Quartz' },
  { href: '/stones/#marble', label: 'Marble & Quartzite' },
  { href: '/stones/#granite', label: 'Granite' },
  { href: '/stones/compare.html', label: 'Compare stones' },
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
  { href: '/sitemap.html', label: 'Sitemap' },
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

/* --- the one page with no mobile chrome --------------------------------- */

/**
 * `/trade/` is the single exception on the whole site, and it is an exception
 * three times over. 177 of the 178 live pages carry `nav.mobile-nav`, the
 * `.nav-burger` that opens it and the `.mbar` sticky contact bar; /trade/
 * carries none of them, and its footer is its own markup rather than
 * `footer.site#footer` — a different tagline, no guarantee pill, no social
 * row, no WhatsApp line, no `.foot-tail`, and a three-link bottom bar reading
 * "Get a quote / FAQ / Sitemap" instead of "Sitemap / Privacy / Terms /
 * Cookies".
 *
 * It is a landing page written for a different audience, so this is a
 * deliberate divergence in the source and not drift. Giving it the shared
 * chrome silently rewrites the one page a builder or developer actually
 * lands on.
 *
 * It is still `lite` for every other purpose — flat seven-link bar, the 12px
 * scroll threshold, service.css — so this is a separate flag rather than a
 * third ChromeVariant.
 */
export const BARE_ROUTES: readonly string[] = ['/trade'];

/** True on the routes that ship no mobile nav, no burger and no sticky bar. */
export function isBarePath(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  const clean = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
  return BARE_ROUTES.includes(clean);
}

/* --- /trade/'s own footer strings --------------------------------------- */

export const TRADE_FOOT_TAGLINE =
  'Bespoke stone worktops, templated, fitted and guaranteed by one team.';

/** `#faq` resolves on the home page, which is where /trade/'s footer points. */
export const TRADE_FOOT_BROWSE: readonly NavLink[] = [
  { href: '/materials/', label: 'Materials' },
  { href: '/guides/', label: 'Worktop guides' },
  { href: '/worktops/', label: 'Areas we cover' },
  { href: '/index.html#faq', label: 'FAQ' },
];

export const TRADE_FOOT_LEGAL: readonly NavLink[] = [
  { href: '/contact/', label: 'Get a quote' },
  { href: '/index.html#faq', label: 'FAQ' },
  { href: '/sitemap.html', label: 'Sitemap' },
];

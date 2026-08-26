'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

import { ContactFabs } from './ContactFabs';
import { KeyboardOpenWatcher } from './KeyboardOpenWatcher';
import { MobileNav } from './MobileNav';
import { SiteFooter } from './SiteFooter';
import { SiteHeader } from './SiteHeader';
import { StickyContactBar } from './StickyContactBar';
import { variantForPath, type ChromeVariant } from './nav-data';

export interface SiteChromeProps {
  readonly children: ReactNode;
  /** Omit to resolve from the route. Pass to force a variant (tests, previews). */
  readonly variant?: ChromeVariant;
  /** Omit to enable on '/' only. */
  readonly cine?: boolean;
  /** Passed through to <SiteFooter>. */
  readonly faqHref?: string;
}

/**
 * Wraps a page in the site chrome and picks the variant.
 *
 * ---------------------------------------------------------------------------
 * WHY DOM ORDER DIFFERS BETWEEN THE TWO VARIANTS
 * ---------------------------------------------------------------------------
 * This is not tidiness, it is the source:
 *
 *   rich   header -> mobile-nav -> mbar -> wa-fab -> call-fab
 *          -> <main> page ... footer </main>
 *   lite   header -> mobile-nav -> <main> page </main> -> mbar -> footer
 *
 * The FABs really do sit between the sticky bar and <main>, and that is
 * load-bearing: `.mbar.on ~ .wa-fab` is a general sibling combinator, so the
 * bar must precede the FABs in the same parent or the FABs never hide behind
 * it. The order below preserves it.
 *
 * ONE KNOWN DEPARTURE. Each page renders its own <main> — /projects/ needs
 * `<main class="pg-col">` for its pinned gallery, and the stone pages put
 * `nav.crumb` outside it — so a layout cannot wrap them. On the six rich
 * pages the legacy footer sits INSIDE <main>; here it follows </main>.
 * `footer.site` sets its own `position:relative;z-index:1`, and the only
 * thing it loses is `main{overflow-x:clip}`, which no footer rule needs.
 * Visually identical; recorded because it IS a departure.
 *
 * ---------------------------------------------------------------------------
 * VARIANT RESOLUTION
 * ---------------------------------------------------------------------------
 * `usePathname()` resolves at prerender under `output: 'export'` — each route
 * is rendered to its own index.html with its own pathname — so the variant is
 * baked into the exported HTML and nothing is decided at runtime.
 *
 * ---------------------------------------------------------------------------
 * ONE THING THIS CANNOT DO YET
 * ---------------------------------------------------------------------------
 * The lite pages also need `data-tokens="content"` on <body> (globals.css §4:
 * --muted 0.60, --faint 0.34, the 0.80px --uipx floor, and body padding-top).
 * A nested client component cannot write an attribute onto <body>, which the
 * root layout owns. When the 171 content routes land, either
 *
 *   (a) promote (rich)/(lite) to multiple root layouts, each rendering its
 *       own <html>/<body> — the standard App Router pattern; or
 *   (b) have the lite group layout emit, as its very first child, a blocking
 *       inline <script> that sets document.body.dataset.tokens = 'content'.
 *       It runs before the rest of the body parses, so there is no flash, and
 *       it survives static export.
 *
 * Until then every route renders on the site.css token root, which is correct
 * for the only route that currently exists.
 */
export function SiteChrome({
  children,
  variant: variantProp,
  cine: cineProp,
  faqHref,
}: SiteChromeProps) {
  const pathname = usePathname();
  const variant = variantProp ?? variantForPath(pathname);
  const isHome = pathname === '/' || pathname === '';
  const cine = cineProp ?? isHome;

  if (variant === 'rich') {
    return (
      <>
        <KeyboardOpenWatcher />
        <SiteHeader variant="rich" cine={cine} />
        <MobileNav variant="rich" />
        {/* .mbar must precede the FABs — general sibling combinator. */}
        <StickyContactBar
          mode={isHome ? 'scroll' : 'always'}
          revealAnchorSelector=".hero-ctas"
        />
        <ContactFabs />
        {children}
        <SiteFooter faqHref={faqHref} />
      </>
    );
  }

  return (
    <>
      <KeyboardOpenWatcher />
      <SiteHeader variant="lite" />
      <MobileNav variant="lite" />
      {children}
      <StickyContactBar mode="always" />
      <SiteFooter faqHref={faqHref} />
    </>
  );
}

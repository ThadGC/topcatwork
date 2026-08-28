'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

import { ContactFabs } from './ContactFabs';
import { KeyboardOpenWatcher } from './KeyboardOpenWatcher';
import { MobileNav } from './MobileNav';
import { SiteFooter } from './SiteFooter';
import { SiteHeader } from './SiteHeader';
import { StickyContactBar } from './StickyContactBar';
import { isBarePath, variantForPath, type ChromeVariant } from './nav-data';

export interface SiteChromeProps {
  readonly children: ReactNode;
  /** Omit to resolve from the route. Pass to force a variant (tests, previews). */
  readonly variant?: ChromeVariant;
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
 *   bare   header -> <main> page </main> -> trade footer      (/trade/ only)
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
  faqHref,
}: SiteChromeProps) {
  const pathname = usePathname();
  const variant = variantProp ?? variantForPath(pathname);
  const isHome = pathname === '/' || pathname === '';

  /*
    /trade/ — its own footer, and on the legacy site the one page with no
    mobile chrome at all. See the long note beside BARE_ROUTES in nav-data.ts.

    CLIENT CHANGE, 26 Aug 2026 — the burger and the sheet are now rendered
    here too. Measured before the change, at 375px: /trade/ was the ONLY route
    of the eight sampled with no `.nav-burger` and no `nav.mobile-nav`, on BOTH
    builds — so this is a deliberate divergence from the source, not a port
    fix. Do not "restore" it to match old.

    The burger and <MobileNav/> go together and must stay together: a
    `.nav-burger` carries `aria-controls="mobileNav"`, so shipping it without
    the sheet is a button that announces a menu and then does nothing. That is
    exactly why the source shipped neither.

    <KeyboardOpenWatcher/> stays: the source loads tcform.js here too, and the
    `html.kb-open` class it writes is free when there is nothing to suppress.
  */
  if (isBarePath(pathname)) {
    return (
      <>
        <KeyboardOpenWatcher />
        <SiteHeader variant="lite" />
        <MobileNav variant="lite" />
        {children}
        {/*
          The client, 28 Aug: "on the inner pages, like in the gallery, there
          should still be the sticky bottom bar... it stays there from the get
          go." Every other route already does. /trade/ was the one page on the
          site with no bar at all, because this branch never rendered one.

          After {children} and before the footer, which is the lite branch's
          DOM order and the source's for every non-rich page. `mode="always"`
          takes `useStickyBar`'s no-anchor path: `html.bar-always`, on from
          mount, no scroll listener. No <ContactFabs> here — /trade/ ships none
          and `html.bar-always` would hide them anyway; rendering them is what
          would newly arm the `.mbar.on ~ .wa-fab` coupling that has bitten
          this build before.
        */}
        <StickyContactBar mode="always" />
        {/*
          ⛔ THE SHARED FOOTER, NOT /trade/'s OWN. REVERSED 28 Aug.

          The source gives /trade/ a deliberately different footer — its own
          tagline, no guarantee pill, no social row, no WhatsApp line, no
          `.foot-tail`, and a three-link bottom bar reading "Get a quote / FAQ /
          Sitemap" instead of "Sitemap / Privacy / Terms / Cookies". <TradeFooter>
          reproduced that faithfully and carries a note saying not to unify it.

          The client overruled it, 28 Aug: "on the inner pages, at least on the
          trade page, the footer doesn't look like the correct footer. So you're
          going to have to fix that. All the footers have to be consistent
          across." Consistency beats source fidelity here because it is his call
          on his own site, so /trade/ now takes the same footer as the other 177
          pages.

          `faqHref` points at /trade/'s OWN `#faq` (its "Trade questions" block)
          rather than the home page's, so the link still lands where a trade
          visitor expects.

          <TradeFooter> is kept in the tree, unused, with its own tests: it is
          the record of what the source does, and this is a preference that has
          already changed once.
        */}
        <SiteFooter faqHref="#faq" />
      </>
    );
  }

  if (variant === 'rich') {
    return (
      <>
        <KeyboardOpenWatcher />
        <SiteHeader variant="rich" heroAnchored={isHome} />
        <MobileNav variant="rich" />
        {/* .mbar must precede the FABs — general sibling combinator. */}
        <StickyContactBar
          mode={isHome ? 'scroll' : 'always'}
          /*
            ⛔ `.hero-ctas` ON EVERY PAGE, INCLUDING THE HOME PAGE.

            This used to key the home page on `#filmRunway`, on the reasoning
            that the hero's CTAs are pinned inside the film stage so their rect
            never leaves the viewport. That is true only WHILE THE FILM RUNS,
            which is exactly when the bar should be down; the moment the film
            locks, the stage becomes `position:absolute` and the hero scrolls
            away like any other section, so its CTAs do leave.

            Keying on the runway broke the client's rule in the other
            direction. `#filmRunway` SHIPS AT ZERO HEIGHT and is the first
            thing in <main>, so on the very first read its bottom is ~0, which
            is already "behind the header" — the bar latched ON at mount and
            `useStickyBar` only re-reads on scroll and resize, so nothing ever
            unlatched it. It was only invisible because `html.film-running
            .mbar{opacity:0}` was hiding it, and it appeared the instant the
            film locked.

            The client, 28 Aug: "as soon as the Get A Free Quote button is
            starting to go out of sight, then the sticky bottom bar pops up.
            It's not automatically there. This is just for the landing page.
            On the other pages, it stays there from the get go."

            `.hero-ctas` is that button's own row (HeroCopy.tsx:137). Measured
            at 390x844: bar down through the film and still down at the lock,
            up at scrollY 480 as the CTA's bottom passes behind the 80px
            header. Every other page passes mode="always" and never reads this.
          */
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

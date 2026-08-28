'use client';

import { useHeaderScrolled } from '@/hooks/useHeaderScrolled';

import { useChromeVariant } from './ChromeProvider';
import { setNavOpen, useNavState } from './nav-state';
import {
  BRAND_HOME,
  BRAND_LABEL,
  SERVICES,
  STONES_DESKTOP,
  thresholdForVariant,
  type ChromeVariant,
  type NavLink,
} from './nav-data';

export interface SiteHeaderProps {
  /**
   * 'rich' is the six site.css pages: `.bar-flare`, id="siteBar", the 40px
   * threshold. 'lite' is the other 171, which have none of them.
   * Defaults to whatever <ChromeProvider> was given.
   *
   * NOTE: the nav itself is NO LONGER part of this split. Both variants now
   * render <PrimaryNav/> with the two dropdowns — see the note on that
   * function. Everything else about the split is intact.
   */
  readonly variant?: ChromeVariant;
  /** Override the measured 40 / 12. For tests and for the client's decision. */
  /**
   * The landing page. The bar is never `.formed` there and is anchored to the
   * hero instead — the forming is the film's closing beat.
   */
  readonly heroAnchored?: boolean;
  readonly scrollThreshold?: number;
  /**
   * The `.nav-burger` that opens `nav.mobile-nav`. On 177 of the 178 live
   * pages. Pass `false` on /trade/, which ships neither — a burger with
   * `aria-controls="mobileNav"` and no sheet to control is a button that
   * announces a menu and then does nothing.
   */
  readonly burger?: boolean;
}

/**
 * `header.bar` — the fixed top bar.
 *
 * ---------------------------------------------------------------------------
 * THE TWO VARIANTS ARE NOT COSMETIC
 * ---------------------------------------------------------------------------
 * A single header would silently rewrite 172 of the 178 pages. The rich bar
 * carries `id="siteBar"` and an `<i class="bar-flare">` sweep, and forms at a
 * different scroll distance. Both readings are here, chosen by `variant`.
 *
 * The NAV is the one piece that has been unified, at the client's explicit
 * request (26 Aug 2026): "on the internal pages, the Navbar should function
 * the same way that it functions on the landing page… the services should
 * still have a drop down and all the other drop downs." The legacy site
 * really does ship a flat seven-link nav on the 171 content pages — measured,
 * both builds, `probe-nav.mjs` — so this is a deliberate DIVERGENCE FROM THE
 * SOURCE, not a restored port defect. `.bar-flare`, `#siteBar` and the 12px
 * threshold were not part of the request and are untouched, so the content
 * pages do not silently inherit three other behaviours along with it.
 *
 * ---------------------------------------------------------------------------
 * THE DROPDOWNS HAVE NO JAVASCRIPT AND NO ARIA — DELIBERATELY
 * ---------------------------------------------------------------------------
 * `.nav-menu` opens on `:hover` and `:focus-within`, both pure CSS, with a
 * 16px invisible `::before` bridging the gap so the pointer can cross into
 * the panel. There is no `aria-expanded`, no `aria-haspopup` and no keyboard
 * open, and none is added here: announcing an expanded state that no key can
 * actually toggle is worse than the honest silence the source ships, and
 * `:focus-within` already makes every item tab-reachable. Flagged as its own
 * accessibility ticket, not smuggled into a port.
 */
export function SiteHeader({
  variant: variantProp,
  heroAnchored = false,
  scrollThreshold,
  burger = true,
}: SiteHeaderProps) {
  const variant = useChromeVariant(variantProp);
  const { navOpen } = useNavState();
  const rich = variant === 'rich';

  const { scrolled, preform } = useHeaderScrolled({
    threshold: scrollThreshold ?? thresholdForVariant(variant),
    heroAnchored,
  });

  /*
    `.formed` — CLIENT CHANGE, 26 Aug 2026. Not in the source.

      "the nav bar should still be formed on these internal pages instead of
       having the forming animation."

    Every page EXCEPT the one running the hero film got it, written during
    render, so it is in the exported HTML and the bar is formed at first paint
    — a transition never runs on an initial computed value, so there is nothing
    to catch mid-fade and no flash before hydration.

    ⛔ NOT ON THE LANDING PAGE, and that is measured, not assumed: the old
    build reads `class="bar preform"` there even after the film has locked and
    the hero is sitting at the top of the page. The bar's forming IS the film's
    closing beat, so it happens when the hero goes by and not before. Shipping
    it formed put a dark plate and a gold hairline across the top of the hero,
    which the client caught in a side-by-side.

    Keyed on `heroAnchored` rather than on the rich/lite split deliberately:
    keying on the split would have left /about/, /contact/, /estimate/,
    /projects/ and /services/ still forming on scroll, and those are internal
    pages by any reading the client has.

    `scrolled` and `preform` still start off, as the source has them: the
    legacy HTML reads `class="bar"` because the source adds both from a
    deferred script, after the document is already on screen.
  */
  const formed = !heroAnchored;

  const className = [
    'bar',
    formed && 'formed',
    scrolled && 'scrolled',
    preform && 'preform',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <header className={className} id={rich ? 'siteBar' : undefined}>
      {rich ? <i className="bar-flare" aria-hidden="true" /> : null}

      <a className="brand" href={BRAND_HOME} aria-label={BRAND_LABEL}>
        <img
          className="brand-logo"
          src="/assets/brand/topcat-horizontal.svg"
          alt=""
          width={1455}
          height={323}
          decoding="async"
        />
      </a>

      <nav className="top" aria-label="Primary">
        <PrimaryNav />
      </nav>

      <a className="bar-cta" href="/contact/">
        Get a quote
      </a>

      {burger ? (
        <button
          className="nav-burger"
          id="navBurger"
          type="button"
          aria-label={navOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={navOpen}
          aria-controls="mobileNav"
          /* `true` = this close came from the burger, so reset the sub-panels.
             See setNavOpen in nav-state.ts for why that is not unconditional. */
          onClick={() => setNavOpen(!navOpen, true)}
        >
          <span />
          <span />
          <span />
        </button>
      ) : null}
    </header>
  );
}

/**
 * Services and Stones become `.nav-item` dropdowns; the other five stay flat.
 * Order is fixed by the source: Services, Projects, Stones, Estimate, About
 * us, Trade, Contact.
 *
 * This used to be `RichNav`, chosen against a flat `LiteNav` by `variant`.
 * Both variants render it now — see the client request in the header note.
 * The seven top-level hrefs and their order are identical to the flat nav's
 * `PRIMARY`, so no content page's bar gains or loses a destination; the only
 * change is that two of the seven grow a caret and a `.nav-menu`.
 */
function PrimaryNav() {
  return (
    <>
      <NavItem
        label="Services"
        href="/services/"
        menuLabel="Services"
        caret="services"
        items={SERVICES}
        allHref="/services/"
        allLabel="All services"
      />
      <a href="/projects/">Projects</a>
      <NavItem
        label="Stones"
        href="/stones/"
        menuLabel="Stones"
        caret="stones"
        items={STONES_DESKTOP}
      />
      <a href="/estimate/">Estimate</a>
      <a href="/about/">About us</a>
      <a href="/trade/">Trade</a>
      <a href="/contact/">Contact</a>
    </>
  );
}

interface NavItemProps {
  readonly label: string;
  readonly href: string;
  readonly menuLabel: string;
  readonly caret: 'services' | 'stones';
  readonly items: readonly NavLink[];
  /** Present on Services only: a separator and a gold "All services" row. */
  readonly allHref?: string;
  readonly allLabel?: string;
}

function NavItem({
  label,
  href,
  menuLabel,
  caret,
  items,
  allHref,
  allLabel,
}: NavItemProps) {
  return (
    <div className="nav-item">
      <a href={href}>
        {label}
        <span className="nav-caret" aria-hidden="true">
          {/*
            The two carets are NOT the same glyph. Services is stroke-width
            1.6 with only a linecap; Stones is 1.4 and also sets a linejoin.
            Hand-editing drift in the source, reproduced rather than unified —
            they render one third of a pixel apart at 9x6.
          */}
          {caret === 'services' ? (
            <svg viewBox="0 0 10 6">
              <path
                d="M1 1l4 4 4-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          ) : (
            <svg viewBox="0 0 10 6">
              <path
                d="M1 1l4 4 4-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </span>
      </a>
      <div className="nav-menu" role="group" aria-label={menuLabel}>
        {items.map((item) => (
          <a key={item.href} href={item.href}>
            {item.label}
          </a>
        ))}
        {allHref ? (
          <>
            <span className="nav-menu-sep" aria-hidden="true" />
            <a className="nav-menu-all" href={allHref}>
              {allLabel}
            </a>
          </>
        ) : null}
      </div>
    </div>
  );
}

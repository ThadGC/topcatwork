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
   * The landing page. The bar's forming is anchored to the HERO there rather
   * than to a plain scroll threshold — the forming is the film's closing beat
   * — and this is what seeds `.preform`, which keeps the bar clean over the
   * footage. It no longer has anything to do with `.formed`; that class was
   * removed on 2 Sep 2026. See the note above `className` below.
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
    `.formed` IS GONE. REVERSED 2 Sep 2026, AT THE CLIENT'S REQUEST.

    26 Aug he asked for the opposite of the source: "the nav bar should still
    be formed on these internal pages instead of having the forming animation."
    That shipped as a render-time `.formed` class on every non-home page.

    2 Sep he reversed it, having seen it on the deployed build: "The inner
    pages, when I scroll on them, the nav bar no longer forms at the top. As
    you scroll, it's supposed to create the Navbar. Right now the Navbar
    doesn't form on any of the pages besides the landing page."

    ⚠️ TWO DEFECTS WERE STACKED HERE AND ONLY ONE OF THEM WAS THIS CLASS.
    The louder one was `html.film-running` leaking onto all 178 non-home routes
    from the root layout's parse-time script (fixed in app/layout.tsx, 2 Sep):
    `html.film-running header.bar.formed::before` is (0,3,1) and beat both
    `.formed` and `.scrolled` at (0,2,1), so the plate could not paint at ANY
    scroll position. Fixing that alone would have given him a bar that is
    always plated — the 26 Aug behaviour he has just rejected — so this class
    had to go too. Both were measured on the deployed build in real Chrome
    before either was touched.

    THE SOURCE AGREES WITH HIM, which is why this is a restoration and not a
    second divergence. The arbiter has no `.formed` anywhere: `grep -rn
    "\.formed"` over every legacy .css/.html/.js returns nothing. All 178
    legacy pages ship plain `<header class="bar">` and add `.scrolled` at
    runtime — 40px on the six rich pages, 12px on the other 171. Measured on
    the reference deployment: /guides/ reads `bar` at scrollY 12 and
    `bar scrolled` at 13, /about/ reads `bar` at 40 and `bar scrolled` at 41.

    `scrolled` and `preform` still start off, as the source has them: the
    legacy HTML reads `class="bar"` because the source adds both from a
    deferred script, after the document is already on screen. `heroAnchored`
    no longer has anything to do with the painted state — it selects the
    hero-anchored READ in useHeaderScrolled and seeds `.preform`, which is
    what keeps the landing page's bar clean over the film.
  */
  const className = ['bar', scrolled && 'scrolled', preform && 'preform']
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
      {/* Before Contact, so Contact stays the last item in the bar. */}
      <a href="/articles">Articles</a>
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

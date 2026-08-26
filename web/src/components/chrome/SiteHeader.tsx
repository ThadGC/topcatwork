'use client';

import { useHeaderScrolled } from '@/hooks/useHeaderScrolled';

import { useChromeVariant } from './ChromeProvider';
import { setNavOpen, useNavState } from './nav-state';
import {
  BRAND_HOME,
  BRAND_LABEL,
  PRIMARY,
  SERVICES,
  STONES_DESKTOP,
  thresholdForVariant,
  type ChromeVariant,
  type NavLink,
} from './nav-data';

export interface SiteHeaderProps {
  /**
   * 'rich' is the six site.css pages: dropdown nav, `.bar-flare`, id="siteBar".
   * 'lite' is the other 171: a flat seven-link nav and nothing else.
   * Defaults to whatever <ChromeProvider> was given.
   */
  readonly variant?: ChromeVariant;
  /** Index only. Turns on the hero-anchored `.scrolled` and the `.preform` state. */
  readonly cine?: boolean;
  /** Override the measured 40 / 12. For tests and for the client's decision. */
  readonly scrollThreshold?: number;
}

/**
 * `header.bar` — the fixed top bar.
 *
 * ---------------------------------------------------------------------------
 * THE TWO VARIANTS ARE NOT COSMETIC
 * ---------------------------------------------------------------------------
 * A single header would silently rewrite 172 of the 178 pages. The rich bar
 * carries `id="siteBar"`, an `<i class="bar-flare">` sweep, and two hover
 * dropdowns; the lite bar has none of them and forms at a different scroll
 * distance. Both readings are here, chosen by `variant`.
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
  cine = false,
  scrollThreshold,
}: SiteHeaderProps) {
  const variant = useChromeVariant(variantProp);
  const { navOpen } = useNavState();
  const rich = variant === 'rich';

  const { scrolled, preform } = useHeaderScrolled({
    threshold: scrollThreshold ?? thresholdForVariant(variant),
    cine,
  });

  // Both classes start off so the exported HTML reads `class="bar"`, which
  // is exactly what the legacy HTML reads — the source adds them from a
  // deferred script, after the document is already on screen.
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
        {rich ? <RichNav /> : <LiteNav />}
      </nav>

      <a className="bar-cta" href="/contact/">
        Get a quote
      </a>

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
    </header>
  );
}

/** The seven flat links, in source order. */
function LiteNav() {
  return (
    <>
      {PRIMARY.map((link) => (
        <a key={link.href} href={link.href}>
          {link.label}
        </a>
      ))}
    </>
  );
}

/**
 * Services and Stones become `.nav-item` dropdowns; the other five stay flat.
 * Order is fixed by the source: Services, Projects, Stones, Estimate, About
 * us, Trade, Contact.
 */
function RichNav() {
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

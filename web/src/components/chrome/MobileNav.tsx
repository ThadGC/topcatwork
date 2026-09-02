'use client';

import { useEffect, useRef, useState, type MouseEvent } from 'react';

import { useIsomorphicLayoutEffect } from '@/hooks/useIsomorphicLayoutEffect';

import { useChromeVariant } from './ChromeProvider';
import { releaseNav, setNavOpen, toggleSub, useNavState } from './nav-state';
import { PhonePath, WhatsAppPathsSheet } from './glyphs';
import {
  PHONE_TEL,
  SERVICES,
  STONES_MOBILE,
  WHATSAPP_URL,
  type ChromeVariant,
} from './nav-data';

export interface MobileNavProps {
  /** Only affects when the accordion resets. Resolved from the route if omitted. */
  readonly variant?: ChromeVariant;
}

const SUB_SERVICES = 'mnSubServices';
const SUB_STONES = 'mnSubStones';

/**
 * `nav.mobile-nav#mobileNav` — the full-screen sheet behind the burger.
 *
 * Byte-identical on all 177 pages that have it. (`/trade/` has none at all,
 * which means that page currently has no navigation whatsoever on a phone —
 * a real bug, flagged separately.)
 *
 * ---------------------------------------------------------------------------
 * THE CHILD COUNT IS LOAD-BEARING
 * ---------------------------------------------------------------------------
 * nav.css staggers the entrance with `.mobile-nav > *:nth-child(1..10)` at
 * .05/.09/.13/.17/.21/.25/.29/.33/.38/.42s, and `.mn-row` is the LAST child
 * precisely so that it gets no delay. This component must render exactly
 * eleven children, in this order:
 *
 *   1 .mn-group Services   2 #mnSubServices   3 Projects   4 .mn-group Stones
 *   5 #mnSubStones         6 Estimate         7 About us   8 Trade
 *   9 Articles            10 Contact         11 .mn-row
 *
 * ⚠️ IT WAS TEN CHILDREN AND A 1..9 LADDER until Articles was added on
 * 2 Sep 2026. The ladder in chrome.css grew a tenth step in the same commit —
 * it has to, because the delays are positional: leave it at 1..9 and the new
 * link is the one item that fades in with no delay, ahead of Contact.
 *
 * Do not wrap them, do not reorder them, do not conditionally drop one.
 *
 * ---------------------------------------------------------------------------
 * WHAT IS DELIBERATELY MISSING
 * ---------------------------------------------------------------------------
 * No focus trap, no focus return to the burger on close, no `inert` or
 * `aria-hidden` on the background, and no scroll-position restore after
 * `html.nav-open{overflow-y:hidden}` releases. The source has none of these.
 * They are a genuine accessibility gap and they are a separate ticket; adding
 * them here would be a redesign wearing a port's clothes.
 */
export function MobileNav({ variant }: MobileNavProps = {}) {
  const resolved = useChromeVariant(variant);
  const { openSub } = useNavState();

  /*
    The lite pages' inline script folds closeSubs() into setOpen itself, so
    every close resets the accordion; site.js only resets on a burger close.
    Escape and link taps are the two paths where that difference shows.
  */
  const resetOnClose = resolved === 'lite';

  /* Never leave `html.nav-open` — and with it the scroll lock — behind. */
  useEffect(() => releaseNav, []);

  /**
   * Escape closes, unconditionally and globally, whether or not the sheet is
   * open. That is the source's `window.addEventListener('keydown', ...)` with
   * no guard, and it is kept so that a stuck `nav-open` class is always one
   * key away from clearing.
   */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setNavOpen(false, resetOnClose);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [resetOnClose]);

  /**
   * One delegated handler, bound on the <nav>, exactly like the source's two
   * listeners on `sheet`. Binding per link would miss the sub-menu links,
   * which is why the source delegates in the first place.
   *
   * A `.mn-toggle` is a sibling of its `<a>`, never a descendant, so
   * `closest('a')` from the button is null and the two branches cannot both
   * fire on one click.
   */
  const onSheetClick = (e: MouseEvent<HTMLElement>) => {
    const target = e.target as HTMLElement;

    const toggle = target.closest('.mn-toggle');
    if (toggle) {
      const id = toggle.getAttribute('aria-controls');
      if (id) toggleSub(id);
      return;
    }

    if (target.closest('a')) setNavOpen(false, resetOnClose);
  };

  return (
    <nav
      className="mobile-nav"
      id="mobileNav"
      aria-label="Site menu"
      onClick={onSheetClick}
    >
      {/* 1 */}
      <div className="mn-group">
        <a href="/services/">Services</a>
        <SubToggle
          controls={SUB_SERVICES}
          open={openSub === SUB_SERVICES}
          label="Show the service pages"
        />
      </div>

      {/* 2 */}
      <SubPanel id={SUB_SERVICES} open={openSub === SUB_SERVICES}>
        {SERVICES.map((item) => (
          <a key={item.href} href={item.href}>
            {item.label}
          </a>
        ))}
      </SubPanel>

      {/* 3 */}
      <a href="/projects/">Projects</a>

      {/* 4 */}
      <div className="mn-group">
        <a href="/stones/">Stones</a>
        <SubToggle
          controls={SUB_STONES}
          open={openSub === SUB_STONES}
          label="Show the stone ranges"
        />
      </div>

      {/*
        5 — six items here against the desktop dropdown's three. The extra
        Quartz / Marble & Quartzite / Granite anchors exist only in the
        mobile sheet. Not a transcription slip; see nav-data.ts.
      */}
      <SubPanel id={SUB_STONES} open={openSub === SUB_STONES}>
        {STONES_MOBILE.map((item) => (
          <a key={item.href} href={item.href}>
            {item.label}
          </a>
        ))}
      </SubPanel>

      {/* 6-10 */}
      <a href="/estimate/">Estimate</a>
      <a href="/about/">About us</a>
      <a href="/trade/">Trade</a>
      <a href="/articles">Articles</a>
      <a href="/contact/">Contact</a>

      {/* 11 — no stagger delay, by design */}
      <div className="mn-row">
        <a className="mn-cta" href="/contact/">
          Get a free quote
        </a>
        <div className="mn-pair">
          <a
            className="mn-alt"
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <WhatsAppPathsSheet />
            </svg>
            <span>WhatsApp</span>
          </a>
          <a className="mn-alt" href={PHONE_TEL}>
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <PhonePath />
            </svg>
            <span>Call us</span>
          </a>
        </div>
      </div>
    </nav>
  );
}

function SubToggle({
  controls,
  open,
  label,
}: {
  controls: string;
  open: boolean;
  label: string;
}) {
  return (
    <button
      className="mn-toggle"
      type="button"
      aria-expanded={open}
      aria-controls={controls}
      aria-label={label}
    >
      <svg viewBox="0 0 10 6" aria-hidden="true">
        <path
          d="M1 1l4 4 4-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    </button>
  );
}

/**
 * `.mn-sub` animates `max-height` from 0 to its own scrollHeight, so the
 * height has to be measured off the live element — there is no CSS-only
 * equivalent that keeps the .45s ease.
 *
 * The measurement runs in a layout effect so it lands before paint, and it
 * re-runs on open rather than being cached: the panel's height depends on
 * the viewport width (the links wrap), and a phone that rotates between two
 * opens would otherwise clip.
 *
 * `.open` carries no CSS at all — it is a state marker the source sets so it
 * can ask "is this panel already open?" on the next tap. Kept so anything
 * else styling against it keeps working.
 */
function SubPanel({
  id,
  open,
  children,
}: {
  id: string;
  open: boolean;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [maxHeight, setMaxHeight] = useState<string | undefined>(undefined);

  useIsomorphicLayoutEffect(() => {
    if (!open) {
      setMaxHeight(undefined);
      return;
    }
    const el = ref.current;
    if (el) setMaxHeight(`${el.scrollHeight}px`);
  }, [open]);

  return (
    <div
      ref={ref}
      className={open ? 'mn-sub open' : 'mn-sub'}
      id={id}
      style={maxHeight ? { maxHeight } : undefined}
    >
      {children}
    </div>
  );
}

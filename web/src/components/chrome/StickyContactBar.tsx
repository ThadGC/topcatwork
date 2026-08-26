'use client';

import { useStickyBar, type StickyBarMode } from '@/hooks/useStickyBar';

import { PhonePath, WhatsAppPathsSheet } from './glyphs';
import { PHONE_TEL, WHATSAPP_URL } from './nav-data';

export interface StickyContactBarProps {
  /**
   * 'scroll' is the home page and only the home page: the bar rises when the
   * hero's own CTA row scrolls up behind the header. Everywhere else the bar
   * is up from the start and `html.bar-always` hides the FABs to match.
   */
  readonly mode: StickyBarMode;
  /** Ignored unless mode is 'scroll'. */
  readonly revealAnchorSelector?: string;
}

/**
 * `.mbar#mobileBar` — the sticky contact bar, below 1120px only.
 *
 * ---------------------------------------------------------------------------
 * DOM ORDER IS PART OF THE STYLING
 * ---------------------------------------------------------------------------
 * The rule that hides the FABs behind this bar is a general sibling
 * combinator:
 *
 *   .mbar.on ~ .wa-fab, .mbar.on ~ .call-fab { opacity:0; ... }
 *
 * so `.mbar` MUST be rendered before `<ContactFabs>` and in the same parent.
 * <SiteChrome> does that; if this component is ever placed by hand, keep the
 * order header -> mobile-nav -> mbar -> wa-fab -> call-fab.
 */
export function StickyContactBar({
  mode,
  revealAnchorSelector = '.hero-ctas',
}: StickyContactBarProps) {
  const on = useStickyBar({ mode, anchorSelector: revealAnchorSelector });

  return (
    <div className={on ? 'mbar on' : 'mbar'} id="mobileBar">
      <a className="mbar-a mbar-cta" href="/contact/">
        Get a quote
      </a>
      <a
        className="mbar-a"
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <WhatsAppPathsSheet />
        </svg>
        <span>WhatsApp</span>
      </a>
      <a className="mbar-a" href={PHONE_TEL}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <PhonePath />
        </svg>
        <span>Call</span>
      </a>
    </div>
  );
}

'use client';

import { useEffect, type RefObject } from 'react';

export interface FooterTailRefs {
  readonly footer: RefObject<HTMLElement | null>;
  readonly tail: RefObject<HTMLDivElement | null>;
  readonly contact: RefObject<HTMLDivElement | null>;
  readonly area: RefObject<HTMLDivElement | null>;
  readonly hours: RefObject<HTMLDivElement | null>;
}

/**
 * Port of assets/site.js:4606-4619, verbatim.
 *
 *   const on   = getComputedStyle(foot).getPropertyValue('--footTail').trim() === 'on';
 *   const host = on ? tail : contact;
 *   if (area.parentElement !== host) { host.appendChild(area); host.appendChild(hours); }
 *
 * `--footTail:on` is declared only inside the two media queries at and above
 * 721px, so this is a media query being read back through a custom property
 * rather than duplicated in JS — the layout decision stays in the stylesheet
 * and the script just asks it. Both declarations survive in globals.css §7.
 *
 * ---------------------------------------------------------------------------
 * WHY THE NODES ARE MOVED RATHER THAN RE-RENDERED
 * ---------------------------------------------------------------------------
 * Rendering area+hours into one branch or the other on a media query is the
 * tidier React, but the server pass has no viewport: it would place them in
 * `.foot-contact` and every desktop visitor would watch them jump on hydrate.
 * Moving the existing nodes has no such frame, and it keeps the exported HTML
 * byte-identical to the legacy markup, which is the fidelity bar for this port.
 *
 * The move is safe only because React never re-renders these two subtrees:
 * they are static JSX with no keys, no conditionals and no interpolated
 * children. If anything below `.foot-c-area` or `.foot-c-hours` ever becomes
 * dynamic, React will re-insert it at its original position and fight this.
 */
export function useFooterTail({
  footer,
  tail,
  contact,
  area,
  hours,
}: FooterTailRefs): void {
  useEffect(() => {
    const foot = footer.current;
    const tailEl = tail.current;
    const contactEl = contact.current;
    const areaEl = area.current;
    const hoursEl = hours.current;
    if (!foot || !tailEl || !contactEl || !areaEl || !hoursEl) return;

    const place = () => {
      const on =
        getComputedStyle(foot).getPropertyValue('--footTail').trim() === 'on';
      const host = on ? tailEl : contactEl;
      if (areaEl.parentElement !== host) {
        host.appendChild(areaEl);
        host.appendChild(hoursEl);
      }
    };

    place();
    window.addEventListener('resize', place, { passive: true });
    return () => window.removeEventListener('resize', place);
  }, [footer, tail, contact, area, hours]);
}

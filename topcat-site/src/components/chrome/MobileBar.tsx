'use client';

import { StickyContactBar } from './StickyContactBar';

/**
 * `.mbar#mobileBar` with no props — the reading 172 of the 178 pages use.
 *
 * Those pages have no `.hero-ctas` to reveal against, so their inline script
 * takes the early return: `html.bar-always` on, `.mbar.on` on, and no scroll
 * listener at all. That is exactly `<StickyContactBar mode="always" />`, and
 * this is the convenience name for it so a route layout can drop it in
 * without restating the mode.
 *
 * The home page is the exception and must use <StickyContactBar mode="scroll">
 * directly — see <SiteChrome>.
 *
 * Placement still matters: it has to precede <ContactFabs> in the same parent,
 * because `.mbar.on ~ .wa-fab` is a general sibling combinator.
 */
export function MobileBar() {
  return <StickyContactBar mode="always" />;
}

export default MobileBar;

'use client';

import { useKeyboardOpen } from '@/hooks/useKeyboardOpen';

/**
 * The document-level chrome behaviours that belong to no single element.
 * Renders nothing.
 *
 * Right now that is one thing: the soft-keyboard watcher from tcform.js, which
 * writes `html.kb-open` so `.mbar` and the FABs get out of the way of an open
 * keyboard. It lives in the form script in the source but it is chrome — a
 * page with no form still needs it when, say, the estimator's number pad opens.
 *
 * Everything else the legacy inline scripts do already has an owner:
 *
 *   `.scrolled` / `.preform`   <SiteHeader>       via useHeaderScrolled
 *   `html.nav-open`, accordion <MobileNav>        via nav-state
 *   `.mbar.on`, `bar-always`   <StickyContactBar> via useStickyBar
 *   footer tail re-parenting   <SiteFooter>       via useFooterTail
 *
 * The `.rise` IntersectionObserver is deliberately NOT here. It reveals page
 * content, not chrome, and its threshold differs by page family (0.12 on the
 * content pages' inline script, 0.25 in site.js) — it belongs to whichever
 * component owns the sections being revealed.
 *
 * Safe to mount more than once: the watcher only ever toggles a class, and it
 * removes it on unmount.
 */
export function ChromeScripts() {
  useKeyboardOpen();
  return null;
}

export default ChromeScripts;

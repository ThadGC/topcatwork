'use client';

import { useEffect } from 'react';

/**
 * Mirrors a boolean onto a class on `<html>`.
 *
 * The legacy chrome coordinates through five classes on the root element —
 * `nav-open`, `bar-always`, `kb-open`, `proj-open` — because the
 * CSS that reacts to them lives above the component that owns the state
 * (`html.nav-open{overflow-y:hidden}` is the obvious one). React cannot
 * render an attribute onto an ancestor of the root, so the class is written
 * imperatively, exactly as the source does it.
 *
 * The cleanup removes the class, which the source never does — it has no
 * unmount. That only matters under client-side navigation, where leaving
 * `nav-open` behind would lock the scroll of the next page.
 */
export function useHtmlClass(name: string, active: boolean): void {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle(name, active);
    return () => {
      root.classList.remove(name);
    };
  }, [name, active]);
}

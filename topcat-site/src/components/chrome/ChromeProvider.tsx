'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';

import { variantForPath, type ChromeVariant } from './nav-data';

const VariantContext = createContext<ChromeVariant | null>(null);

/**
 * OPTIONAL. Pins the chrome variant for a subtree.
 *
 * Nothing requires this: <SiteHeader>, <MobileNav>, <StickyContactBar> and
 * <SiteFooter> all resolve their own variant, and share their open/closed
 * state through the module store in nav-state.ts. Reach for the provider only
 * when the route cannot say which family it belongs to — a preview page, a
 * Storybook-style harness, or a test rendering the rich bar at '/'.
 */
export function ChromeProvider({
  variant,
  children,
}: {
  variant: ChromeVariant;
  children: ReactNode;
}) {
  return (
    <VariantContext.Provider value={variant}>{children}</VariantContext.Provider>
  );
}

/**
 * Resolves the variant, most specific first:
 *
 *   1. an explicit prop
 *   2. an enclosing <ChromeProvider>
 *   3. the route — six paths are 'rich', everything else is 'lite'
 *
 * Step 3 settles at build time: under `output: 'export'` every route is
 * prerendered to its own index.html, so `usePathname()` is known during that
 * render and the variant is baked into the HTML rather than decided live.
 */
export function useChromeVariant(explicit?: ChromeVariant): ChromeVariant {
  const fromContext = useContext(VariantContext);
  const pathname = usePathname();
  return explicit ?? fromContext ?? variantForPath(pathname);
}

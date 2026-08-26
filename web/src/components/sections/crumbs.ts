import type { Breadcrumbs } from '@/lib/stones';

/**
 * The two-level breadcrumb the content-styled pages carry: a back chevron,
 * then `Home / <this page>`.
 *
 * `/index.html#hero` rather than `/#hero` — that is the href in the source on
 * every content page, and .htaccess serves index.html at the root either way.
 * Left as found so the exported HTML diffs clean against the legacy build.
 *
 * The shape is <Breadcrumb>'s, which the stone pages feed from their
 * extracted data; these three pages have no extractor behind them, so they
 * build it here.
 */
export function contentCrumbs(label: string): Breadcrumbs {
  return {
    back: { href: '/index.html#hero', label: 'Back to Home' },
    items: [
      { name: 'Home', href: '/index.html#hero', current: false },
      { name: label, href: null, current: true },
    ],
  };
}

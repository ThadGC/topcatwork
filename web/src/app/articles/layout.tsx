/**
 * The `/articles` shell.
 *
 * Deliberately identical to app/guides/layout.tsx, because the listing is the
 * same kind of page as the guides hub and must read as one. Three things come
 * from here and nothing else does — the chrome (header, mobile sheet, sticky
 * bar, footer) is <SiteChrome> in app/layout.tsx, which resolves `/articles`
 * to the `lite` variant from its path.
 *
 * ---------------------------------------------------------------------------
 * 1. THE STYLESHEET ORDER IS LOAD-BEARING
 * ---------------------------------------------------------------------------
 * content.css then seo.css, matching the legacy link order on every SEO-shell
 * page. seo.css MUST follow content.css: both declare `.cta-note`, and on the
 * live pages seo.css wins. seo.css is also what carries the `.mgrid`/`.mcard`
 * card grid and the `.block h1` / `.block > .wrap > .lede` rules this page is
 * built from, so without it the listing renders as an unstyled heading over a
 * column of borderless links.
 *
 * articles.css is last and is the only sheet unique to this route. It adds the
 * "Load more" row and the empty state and restyles nothing.
 *
 * ---------------------------------------------------------------------------
 * 2. THE `data-tokens` SCRIPT
 * ---------------------------------------------------------------------------
 * Byte-identical to app/guides/layout.tsx, app/stones/layout.tsx and
 * app/(content)/layout.tsx, on purpose — one pattern to delete rather than
 * four. globals.css §4 keys the content-page readings off
 * `body[data-tokens='content']`: --muted 0.55 -> 0.60, --faint 0.32 -> 0.34,
 * the --uipx floor 0.74px -> 0.80px, and `body{font-weight:300;line-height:1.6;
 * padding-top:var(--barH)}`. Without the attribute this page silently renders
 * on the home page's token root, which is a real difference in body weight and
 * in every muted line on the page.
 *
 * <body> belongs to the root layout and a nested layout cannot set an
 * attribute on it, so a blocking inline script does it while the rest of the
 * body is still parsing. React neither reads nor writes body attributes, so
 * there is no hydration mismatch it can cause.
 *
 * ---------------------------------------------------------------------------
 * 3. NO `metadata` EXPORT HERE
 * ---------------------------------------------------------------------------
 * The one page under this layout carries its own hand-written title,
 * description and canonical. A layout-level default would be a second source
 * of truth for a <head> that already has one.
 */
import '@/styles/content.css';
import '@/styles/seo.css';
import '@/styles/articles.css';

const SET_CONTENT_TOKENS =
  '(function(){function s(){document.body.dataset.tokens="content"}' +
  'document.body?s():document.addEventListener("DOMContentLoaded",s)})()';

export default function ArticlesLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: SET_CONTENT_TOKENS }} />
      {children}
    </>
  );
}

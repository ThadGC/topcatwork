/**
 * The `/stones/*` shell — Family B stylesheets and the content token root.
 *
 * The chrome itself (header, mobile nav sheet, sticky bar, footer, and the
 * `<main>` element) is rendered by <SiteChrome> in app/layout.tsx, which
 * resolves the rich/lite variant from the route. This layout adds only what is
 * specific to the 134 pages under /stones/.
 *
 * ---------------------------------------------------------------------------
 * 1. THE STYLESHEET ORDER IS LOAD-BEARING
 * ---------------------------------------------------------------------------
 * A legacy stone page links four stylesheets in this order:
 *
 *   /services/service.css -> /assets/footer.css -> /assets/nav.css
 *                                               -> /stones/stone.css
 *
 * The middle two are inside components/chrome/chrome.css, imported by the root
 * layout. The other two are here, and they must stay in this order: service.css
 * declares `body::before{z-index:-1}`, and stone.css re-declares the same
 * pseudo-element at `z-index:0`, then lifts the content back over it with
 * `main, body > nav.crumb, body > footer{position:relative;z-index:1}`. Import
 * stone.css first and the marble floor paints over the page.
 *
 * ---------------------------------------------------------------------------
 * 2. THE `data-tokens` SCRIPT, AND WHAT DOES *NOT* DEPEND ON IT
 * ---------------------------------------------------------------------------
 * Two files express the content-page readings, and only one of them needs an
 * attribute on <body>:
 *
 *   content.css   carries service.css's own `:root` and `body` blocks, so the
 *                 three token divergences (--muted 0.60, --faint 0.34, the
 *                 0.80px --uipx floor), `body{font-weight:300;line-height:1.6;
 *                 padding-top:var(--barH)}` and `body::before{z-index:-1}` are
 *                 live from the first paint. It is route-scoped — Next only
 *                 serves it where it is imported — so plain selectors are
 *                 correct and no attribute is involved. NOTHING THAT AFFECTS
 *                 LAYOUT WAITS FOR JAVASCRIPT.
 *
 *   chrome.css §12  re-states the five places service.css disagrees with
 *                 site.css about the header, and does it as
 *                 `body[data-tokens='content'] …`. Those are cosmetic: a 24px
 *                 -> 20px flex gap, a 1.5px bar height below 1120px, the
 *                 tablet corner radius, `.brand` display, and --uipx-scaled
 *                 nav links. They need the attribute.
 *
 * <body> belongs to the root layout and a nested layout cannot set an
 * attribute on it, so the attribute is written by the inline script below —
 * option (b) of the two SiteChrome.tsx proposes. It is synchronous and runs
 * while the rest of the body is still parsing, and React neither reads nor
 * writes body attributes, so there is no hydration mismatch. Even if it were
 * blocked entirely, the page would differ by those few pixels and nothing
 * more.
 *
 * When the port grows a (lite) route group with its own root layout, delete
 * this script and put `data-tokens="content"` on that layout's <body>.
 */
import '@/styles/content.css';
import './stone.css';

const SET_CONTENT_TOKENS =
  '(function(){function s(){document.body.dataset.tokens="content"}' +
  'document.body?s():document.addEventListener("DOMContentLoaded",s)})()';

export default function StonesLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: SET_CONTENT_TOKENS }} />
      {children}
    </>
  );
}

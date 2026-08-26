/**
 * The `/materials/*` shell — Family-B stylesheets plus the SEO sheet, and the
 * content token root.
 *
 * The chrome (header, mobile nav sheet, sticky bar, footer) comes from
 * <SiteChrome> in app/layout.tsx, which resolves these six routes to the
 * `lite` variant from their paths. This layout adds only what the materials
 * archetypes need on top.
 *
 * ---------------------------------------------------------------------------
 * 1. THE STYLESHEET ORDER IS LOAD-BEARING
 * ---------------------------------------------------------------------------
 * A legacy material page links four stylesheets, in this order:
 *
 *   /services/service.css -> /assets/footer.css -> /assets/nav.css -> /seo.css
 *
 * The middle two are in components/chrome/chrome.css, imported by the root
 * layout. The other two are here, and seo.css MUST come second. Two selectors
 * live in both sheets and only the load order decides them:
 *
 *   .prose p    service.css `max-width:70ch` -> seo.css `max-width:72ch`
 *   .block h2   service.css's type scale, plus seo.css's scroll-margin-top
 *
 * Swap these two imports and every prose paragraph on these six pages narrows
 * by 2ch against the live build. This is the same shape as
 * app/stones/layout.tsx, where stone.css is the fourth sheet instead.
 *
 * ---------------------------------------------------------------------------
 * 2. THE `data-tokens` SCRIPT
 * ---------------------------------------------------------------------------
 * content.css carries service.css's own `:root` and `body` blocks, so the
 * three token divergences (--muted 0.60, --faint 0.34, the 0.80px --uipx
 * floor), `body{font-weight:300;line-height:1.6;padding-top:var(--barH)}` and
 * `body::before{z-index:-1}` are live from the first paint with no JavaScript
 * in the path. Nothing that affects layout waits on the script below.
 *
 * What the script IS for is chrome.css §12, which re-states the five places
 * service.css disagrees with site.css about the header as
 * `body[data-tokens='content'] …`: a 24px -> 20px flex gap, a 1.5px bar height
 * below 1120px, the tablet corner radius, `.brand` display, and the
 * --uipx-scaled nav links. <body> belongs to the root layout and a nested
 * layout cannot set an attribute on it, so it is written here — synchronously,
 * while the rest of the body is still parsing. React neither reads nor writes
 * body attributes, so there is no hydration mismatch.
 *
 * When the port grows a (lite) route group with its own root layout, delete
 * this script and put `data-tokens="content"` on that layout's <body>. It is
 * deliberately identical to the one in app/stones/layout.tsx and
 * app/(content)/layout.tsx so there is one pattern to delete, not three.
 */
import '@/styles/content.css';
import '@/styles/seo.css';

const SET_CONTENT_TOKENS =
  '(function(){function s(){document.body.dataset.tokens="content"}' +
  'document.body?s():document.addEventListener("DOMContentLoaded",s)})()';

export default function MaterialsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: SET_CONTENT_TOKENS }} />
      {children}
    </>
  );
}

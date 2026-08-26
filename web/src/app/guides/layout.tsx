/**
 * The `/guides/*` shell — the SEO-shell stylesheets and the content token root.
 *
 * The chrome (header, mobile nav sheet, sticky bar, footer) comes from
 * <SiteChrome> in app/layout.tsx, which resolves these ten routes to the
 * `lite` variant from their paths. This layout adds only what is specific to
 * the guides.
 *
 * ---------------------------------------------------------------------------
 * 1. FOUR STYLESHEETS, NOT THREE — THE ORDER IS LOAD-BEARING
 * ---------------------------------------------------------------------------
 * A legacy guide page links four sheets, in this order:
 *
 *   /services/service.css -> /assets/footer.css -> /assets/nav.css -> /seo.css
 *
 * The middle two are inside components/chrome/chrome.css, imported by the root
 * layout. The other two are here, and seo.css MUST come after content.css:
 * both declare `.cta-note`, and on the live pages seo.css wins.
 *
 * seo.css is the one that is easy to miss — only 28 of the 178 legacy pages
 * link it — and it is not optional here. It carries every piece of editorial
 * furniture these ten pages are built from: `.lead-answer` and its gold rule,
 * `.byline`/`.reviewed`, `.tbl`/`.tbl-wrap`, `.mgrid`/`.mcard`, `.rel`/
 * `.rel-cols`, `.block h1` and `.block > .wrap > .lede`. Drop it and the
 * guides render with an unstyled h1 and borderless comparison tables.
 *
 * ---------------------------------------------------------------------------
 * 2. THE `data-tokens` SCRIPT
 * ---------------------------------------------------------------------------
 * Identical to app/stones/layout.tsx and app/(content)/layout.tsx, on purpose
 * — one pattern to delete rather than three.
 *
 * content.css carries service.css's own `:root` and `body` blocks, so the
 * three token divergences (--muted 0.60, --faint 0.34, the 0.80px --uipx
 * floor), `body{font-weight:300;line-height:1.6;padding-top:var(--barH)}` and
 * `body::before{z-index:-1}` are live from the first paint with no JavaScript
 * in the path. The attribute is only needed by chrome.css §12, which re-states
 * the five cosmetic places service.css disagrees with site.css about the
 * header. <body> belongs to the root layout and a nested layout cannot set an
 * attribute on it, so a blocking inline script does it; it runs while the rest
 * of the body is still parsing, and React neither reads nor writes body
 * attributes, so there is no hydration mismatch.
 *
 * When the port grows a (lite) route group with its own root layout, delete
 * this script and put `data-tokens="content"` on that layout's <body>.
 *
 * ---------------------------------------------------------------------------
 * 3. NO `metadata` EXPORT HERE
 * ---------------------------------------------------------------------------
 * Every one of the ten pages has a hand-written title, description and
 * canonical carried in guides.json. A layout-level default would be a fourth
 * source of truth for a <head> that already has one.
 */
import '@/styles/content.css';
import '@/styles/seo.css';

const SET_CONTENT_TOKENS =
  '(function(){function s(){document.body.dataset.tokens="content"}' +
  'document.body?s():document.addEventListener("DOMContentLoaded",s)})()';

export default function GuidesLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: SET_CONTENT_TOKENS }} />
      {children}
    </>
  );
}

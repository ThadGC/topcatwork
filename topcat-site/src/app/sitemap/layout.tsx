/**
 * The `/sitemap.html` shell — Family-B stylesheets and the content token root.
 *
 * ---------------------------------------------------------------------------
 * WHY A LAYOUT FOR ONE ROUTE
 * ---------------------------------------------------------------------------
 * Same reason app/worktops/layout.tsx exists: the sheet imports and the
 * `data-tokens` script are shell concerns, not page concerns, and keeping the
 * shape identical across the five Family-B shells means there is one pattern
 * to delete when a real (lite) root layout lands, not five variations on one.
 *
 * The legacy <head> on sitemap.html links, in this order:
 *
 *   /services/service.css  ->  @/styles/content.css   (here)
 *   /assets/footer.css     ->  components/chrome/chrome.css  (root layout)
 *   /assets/nav.css        ->  components/chrome/chrome.css  (root layout)
 *   /seo.css               ->  @/styles/seo.css       (here)
 *
 * seo.css is NOT optional on this page and it is the only sheet that carries
 * its layout: `.rel` and `.rel.two-up` (every link list), `.sm-group`,
 * `.sm-count`, `.sm-stones` and `.sm-stone-col` (the three stone columns)
 * exist nowhere else. It must load AFTER content.css, which is the legacy
 * order — `.note` and `.block h1` are restated on top of service.css's
 * readings.
 *
 * ---------------------------------------------------------------------------
 * THE `data-tokens` SCRIPT
 * ---------------------------------------------------------------------------
 * Verbatim from app/worktops/layout.tsx. content.css carries service.css's
 * own `:root` and `body` blocks, so the token divergences and
 * `body{padding-top:var(--barH)}` are live from first paint with no
 * JavaScript in the path; the attribute is needed only by chrome.css §12,
 * which keys five cosmetic header rules off `body[data-tokens='content']`,
 * and <body> belongs to the root layout where a nested layout cannot reach
 * it.
 */
import '@/styles/content.css';
import '@/styles/seo.css';

const SET_CONTENT_TOKENS =
  '(function(){function s(){document.body.dataset.tokens="content"}' +
  'document.body?s():document.addEventListener("DOMContentLoaded",s)})()';

export default function SitemapLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: SET_CONTENT_TOKENS }} />
      {children}
    </>
  );
}

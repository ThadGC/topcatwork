/**
 * The `/worktops/*` shell — Family B stylesheets and the content token root.
 *
 * Nine routes live under here: the hub, four counties and four towns. The
 * chrome (header, mobile nav, sticky bar, footer) comes from <SiteChrome> in
 * app/layout.tsx, which resolves all nine to the `lite` variant from their
 * paths. This layout adds only what the legacy <head> on these pages adds.
 *
 * ---------------------------------------------------------------------------
 * 1. FOUR STYLESHEETS, AND THE FOURTH IS NEW
 * ---------------------------------------------------------------------------
 * Every /worktops/ page links, in this order:
 *
 *   /services/service.css  ->  @/styles/content.css   (here)
 *   /assets/footer.css     ->  components/chrome/chrome.css  (root layout)
 *   /assets/nav.css        ->  components/chrome/chrome.css  (root layout)
 *   /seo.css               ->  @/styles/seo.css       (here)
 *
 * seo.css is the one /trade/, /privacy/ and /terms/ do not carry, and it is
 * not optional here: `.mgrid`/`.mcard` (the hub's county cards), `.tbl` (the
 * price table on all eight area pages), `.rel.two-up` (every related-links
 * list), `.chips` (the area lists) and `.lead-answer` (the counties' opening
 * paragraph) exist nowhere else. It must load AFTER content.css, because it
 * also re-states `.note`, `.cta-note`, `.prose p` and `.block h1` on top of
 * service.css's readings — which is the legacy order.
 *
 * ---------------------------------------------------------------------------
 * 2. THE `data-tokens` SCRIPT
 * ---------------------------------------------------------------------------
 * Same mechanism, and the same reasoning, as app/stones/layout.tsx: content.css
 * carries service.css's own `:root` and `body` blocks, so the token
 * divergences and `body{padding-top:var(--barH)}` are live from first paint
 * with no JavaScript in the path. The attribute is needed only by chrome.css
 * §12, which keys five cosmetic header rules off
 * `body[data-tokens='content']`, and <body> belongs to the root layout where a
 * nested layout cannot reach it. Delete this the day a (lite) root layout
 * exists — there are three copies of it now, and they should die together.
 */
import '@/styles/content.css';
import '@/styles/seo.css';

const SET_CONTENT_TOKENS =
  '(function(){function s(){document.body.dataset.tokens="content"}' +
  'document.body?s():document.addEventListener("DOMContentLoaded",s)})()';

export default function WorktopsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: SET_CONTENT_TOKENS }} />
      {children}
    </>
  );
}

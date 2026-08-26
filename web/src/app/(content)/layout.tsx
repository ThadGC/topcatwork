/**
 * The shell for the content-styled pages that are not part of a data-driven
 * family: /trade/, /privacy/ and /terms/.
 *
 * A route group, so the three URLs are unchanged — `(content)` never appears
 * in a path. It exists to say the thing all three have in common and nothing
 * else: they are served with services/service.css rather than
 * assets/site.css.
 *
 * The chrome — header, mobile nav, sticky bar, footer — comes from
 * <SiteChrome> in app/layout.tsx, which resolves these three to the `lite`
 * variant from their paths. This layout adds two things on top.
 *
 * ---------------------------------------------------------------------------
 * 1. content.css
 * ---------------------------------------------------------------------------
 * The port of services/service.css. It loads after globals.css and after
 * chrome.css, matching the legacy <link> order on these pages:
 *
 *   /services/service.css -> /assets/footer.css -> /assets/nav.css
 *
 * ⚠️ Unlike /stones/, there is no fourth sheet here. /trade/ carries one page
 * -specific block (its hero plate at three widths) and keeps it inline in the
 * page, exactly as the source does.
 *
 * ---------------------------------------------------------------------------
 * 2. The content token root
 * ---------------------------------------------------------------------------
 * globals.css §4 keys the content-page readings off
 * `body[data-tokens='content']` — --muted 0.55→0.60, --faint 0.32→0.34, the
 * --uipx floor 0.74px→0.80px, and `body{font-weight:300;line-height:1.6;
 * padding-top:var(--barH)}`. Without the attribute these pages silently render
 * on the home page's token root, which is a real visual difference in body
 * weight and in every muted line of text.
 *
 * <body> belongs to the root layout and a nested layout cannot add an
 * attribute to it, so the attribute is written by a blocking inline script —
 * the same mechanism app/stones/layout.tsx uses, deliberately, so there is one
 * pattern to delete rather than two. It is synchronous and runs while the rest
 * of the body is still parsing, so it lands before first paint and there is no
 * flash of the wrong token root. React neither reads nor writes body
 * attributes, so hydration does not see it.
 *
 * When the port grows a proper (lite) root layout, put
 * `data-tokens="content"` on its <body> and delete this script.
 */
import '@/styles/content.css';

const SET_CONTENT_TOKENS =
  '(function(){function s(){document.body.dataset.tokens="content"}' +
  'document.body?s():document.addEventListener("DOMContentLoaded",s)})()';

export default function ContentLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: SET_CONTENT_TOKENS }} />
      {children}
    </>
  );
}

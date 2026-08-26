/**
 * The `/services/<slug>.html` shell — the Family-B stylesheet and token root.
 *
 * ---------------------------------------------------------------------------
 * WHY THIS LAYOUT IS UNDER `[slug]` AND NOT AT `app/services/`
 * ---------------------------------------------------------------------------
 * The two halves of this folder are not the same kind of page. `/services/`
 * is one of the six the legacy site serves with `assets/site.css` — the rich
 * chrome, the home page's own sections — while the nine detail pages under it
 * are served with `services/service.css`, the flat nav and no FABs. Their
 * `<head>`s say it plainly:
 *
 *   services/index.html            <link href="/assets/site.css">
 *   services/kitchen-worktops.html <link href="service.css">
 *                                  <link href="/assets/footer.css">
 *                                  <link href="/assets/nav.css">
 *
 * A layout at `app/services/` would sit above both and pull content.css onto
 * the hub, which is the one thing that must not happen: content.css restates
 * `:root` and `body`, so the hub would silently render on the content token
 * root — a different body weight and a different `--muted` on every line.
 *
 * `<SiteChrome>` already gets this right on its own: `variantForPath` lists
 * `/services` in RICH_ROUTES and matches on the cleaned path, so the hub is
 * `rich` and `/services/kitchen-worktops` is `lite`. This layout is the CSS
 * half of the same split.
 *
 * ---------------------------------------------------------------------------
 * content.css AND THE `data-tokens` SCRIPT
 * ---------------------------------------------------------------------------
 * Identical mechanism to app/(content)/layout.tsx and app/stones/layout.tsx —
 * deliberately, so there is one pattern to delete rather than three. See the
 * long note in app/(content)/layout.tsx for why the attribute is written by a
 * blocking inline script instead of on <body>: a nested layout cannot put an
 * attribute on an element the root layout owns.
 *
 * Nothing that affects layout waits for that script. content.css is
 * route-scoped, so its own plain `:root`/`body` blocks are live from the
 * first paint; the attribute only feeds chrome.css §12, which is five
 * cosmetic header rules.
 *
 * ⚠️ There is no fourth stylesheet here. The stone pages add stone.css after
 * content.css and the order matters there; these nine link nothing beyond the
 * three above, and the hero background is an inline `style` on
 * `.svc-hero-bg`, exactly as the source writes it.
 */
import '@/styles/content.css';

const SET_CONTENT_TOKENS =
  '(function(){function s(){document.body.dataset.tokens="content"}' +
  'document.body?s():document.addEventListener("DOMContentLoaded",s)})()';

export default function ServiceDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: SET_CONTENT_TOKENS }} />
      {children}
    </>
  );
}

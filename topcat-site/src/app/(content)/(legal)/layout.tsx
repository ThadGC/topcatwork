/**
 * The shell the two legal pages — /privacy/ and /terms/ — add on top of
 * ../layout.tsx. A route group, so neither URL changes.
 *
 * ---------------------------------------------------------------------------
 * WHY IT EXISTS: seo.css
 * ---------------------------------------------------------------------------
 * The (content) group serves three routes and they do NOT link the same
 * sheets. /trade/ links three:
 *
 *   /services/service.css -> /assets/footer.css -> /assets/nav.css
 *
 * while /privacy/ and /terms/ link a fourth after them
 * (privacy/index.html:21-24, terms/index.html:21-24):
 *
 *   /services/service.css -> /assets/footer.css -> /assets/nav.css -> /seo.css
 *
 * seo.css is not optional on these two: it is the ONLY sheet in the whole
 * legacy build that declares `.block h1` (seo.css:110-113), and the legal
 * pages' heading is a bare `<h1>` inside `.block > .wrap`. Without the sheet
 * the H1 fell all the way back to the UA default — measured 32px/51.2px/700
 * in Montserrat at every band, against the source's fluid
 * `clamp(30px,3.4vw,50px)` at weight 500 in Cinzel (30px at 375, 30.6px at
 * 900, 48.96px at 1440), and unclamped in width against the rule's
 * `max-width:22ch`.
 *
 * The import lives here and not in ../layout.tsx precisely so /trade/ does
 * not pick it up — the source does not give /trade/ this sheet, and seo.css
 * restates `.prose p`, `.block h2` and `.cta-note` over service.css.
 *
 * ORDER MATTERS. content.css (the port of service.css, imported by the parent
 * layout) must load first and seo.css second, which is the legacy <link>
 * order. A nested layout's CSS is emitted after its parent's, so nesting is
 * what buys the ordering; it is the same arrangement app/sitemap/layout.tsx,
 * app/guides/layout.tsx, app/materials/layout.tsx and app/worktops/layout.tsx
 * already use.
 *
 * Everything else these pages need — the `data-tokens="content"` root, the
 * chrome, content.css — comes from ../layout.tsx and is deliberately not
 * repeated here.
 */
import '@/styles/seo.css';

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

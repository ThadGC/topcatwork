import type { NextConfig } from 'next';

/**
 * TopCat — static export target.
 *
 * The build deploys to the client's existing SiteGround Apache/cPanel host,
 * alongside the legacy `send.php`. That constrains the whole app:
 *
 *   - `output: 'export'`      no Node server at runtime. Therefore NO route
 *                             handlers, NO server actions, NO ISR, NO
 *                             middleware anywhere in this project.
 *   - `images.unoptimized`    required by `output: 'export'`; there is no
 *                             /_next/image endpoint on Apache.
 *
 * Forms keep posting to /send.php exactly as they do today.
 *
 * ---------------------------------------------------------------------------
 * `trailingSlash: false` — READ THIS BEFORE CHANGING IT
 * ---------------------------------------------------------------------------
 * The legacy site mixes two URL shapes, and no single setting emits both:
 *
 *   .html leaf   /stones/<slug>.html   (132)   /services/<slug>.html   (9)
 *                /guides/<slug>.html   (9)     /materials/<slug>.html  (5)
 *                /stones/compare.html  (1)     /sitemap.html           (1)
 *   directory    /, /about/, /contact/, /estimate/, /projects/, /services/,
 *                /stones/, /guides/, /materials/, /worktops/, /trade/,
 *                /privacy/, /terms/, /worktops/<county>/[<town>/]
 *
 * 149 of the 178 URLs are `.html` leaves. With `trailingSlash: false` those
 * come out right for free — `app/stones/[slug]/page.tsx` exports to
 * `out/stones/<slug>.html`, which is byte-for-byte the live URL, so every
 * canonical, every internal link and every inbound backlink keeps working with
 * no redirect and no .htaccess rewrite.
 *
 * The ~19 hub routes are then fixed up by `scripts/postexport.mjs`, which runs
 * as part of `pnpm build`: it copies `out/<name>.html` to
 * `out/<name>/index.html` for every URL the extracted data says was a
 * directory. Both files coexist (`stones.html` beside the `stones/` directory
 * holding the 132 leaves), so both forms resolve and the canonical still names
 * the directory URL.
 *
 * Setting this back to `true` would rename all 149 leaves to
 * `/stones/<slug>/`, invalidating every canonical tag in src/data/*.json and
 * every link in the ported markup. Do not.
 */
const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: false,
  images: {
    unoptimized: true,
  },
  reactStrictMode: true,
  poweredByHeader: false,
};

export default nextConfig;

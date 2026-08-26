import type { NextConfig } from 'next';

/**
 * TopCat — a Next application, deployed to Vercel.
 *
 * IT USED TO BE A STATIC EXPORT, and that is worth recording because the
 * decision reached further than it looked. `output: 'export'` was chosen so the
 * build would drop onto the client's SiteGround Apache box beside the legacy
 * `send.php`. Static export forbids route handlers, which is the ONLY reason
 * 464 lines of PHP survived a rewrite whose whole point was the Next stack. The
 * host was an assumption, never a requirement — the target is Vercel and this
 * is a demo — so the export constraint and the PHP went together.
 *
 * What that changed:
 *   - route handlers are available again; the enquiry endpoint is now
 *     `app/api/enquiry/route.ts` and `send.php` is out of the app entirely.
 *   - `scripts/postexport.mjs` no longer runs. It existed to copy
 *     `out/<name>.html` to `out/<name>/index.html`, and there is no `out/`.
 *   - the URL shapes are now served by rewrites rather than by files on disk.
 *
 * ---------------------------------------------------------------------------
 * THE `.html` URLS — READ THIS BEFORE TOUCHING `rewrites`
 * ---------------------------------------------------------------------------
 * The legacy site's URLs are mostly `.html` leaves, and they rank:
 *
 *   /stones/<slug>.html      132      /services/<slug>.html      9
 *   /guides/<slug>.html        9      /materials/<slug>.html     5
 *   /stones/compare.html       1      /sitemap.html              1
 *
 * Under static export those existed because the exporter literally wrote
 * `out/stones/nero-marquina.html`. A Node server has no such file — the route
 * is `/stones/nero-marquina`. Without the rewrites below, all 157 of those
 * URLs 404, every canonical in src/data/*.json points at a dead page, and
 * every inbound link breaks.
 *
 * The rewrites map the `.html` form onto the real route, so both resolve and
 * the canonical tags stay true. They are rewrites, not redirects, deliberately:
 * a redirect would change the URL in the bar and make the canonical a lie.
 */
const nextConfig: NextConfig = {
  trailingSlash: false,
  images: {
    // The srcset ladders in the ported markup are hand-built and already
    // responsive. Leaving Next's optimiser off keeps the served bytes
    // identical to what was measured on the device; turning it on is a
    // separate, measurable change rather than a silent one.
    unoptimized: true,
  },
  reactStrictMode: true,
  poweredByHeader: false,

  async rewrites() {
    return [
      { source: '/stones/compare.html', destination: '/stones/compare' },
      { source: '/stones/:slug.html', destination: '/stones/:slug' },
      { source: '/services/:slug.html', destination: '/services/:slug' },
      { source: '/guides/:slug.html', destination: '/guides/:slug' },
      { source: '/materials/:slug.html', destination: '/materials/:slug' },
      { source: '/sitemap.html', destination: '/sitemap' },
    ];
  },
};

export default nextConfig;

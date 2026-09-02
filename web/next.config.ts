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
  /*
    The little round badge in the bottom-left corner. It is Next's own dev
    indicator — the menu behind it reads Route / Route Info / Preferences —
    and it is injected by the dev server only: it has never appeared in a
    production build, so it was never going to reach a visitor. The client saw
    it while reviewing and asked for it gone, and there is no reason to keep
    it, so it is off here too.
  */
  devIndicators: false,
  images: {
    // The srcset ladders in the ported markup are hand-built and already
    // responsive. Leaving Next's optimiser off keeps the served bytes
    // identical to what was measured on the device; turning it on is a
    // separate, measurable change rather than a silent one.
    unoptimized: true,
  },
  reactStrictMode: true,
  poweredByHeader: false,

  /*
    THE LEGACY STONE DEEP LINKS.

    The 132 stone pages ship `/index.html?stone=…&mat=…&p=…&s=…&slug=…#estimator`
    in their extracted data, and those URLs are in the live site's HTML today,
    so they are indexable and may be linked from outside. They cannot work on
    the home page any more: the film's runway goes up under the in-flight
    fragment scroll and `lockFilm` absorbs the overshoot onto the hero, which
    is what the client reported as landing on "a random section". The stone
    pages themselves are re-pointed in `stoneEnquiryHref`; this catches
    everything already out in the world.

    ⛔ THE `has` GUARD IS LOAD-BEARING. `/index.html#hero` is the brand logo's
    href on all 178 pages, and `/index.html#faq` is the footer's. Without the
    query condition this rule would swallow both and send the whole site to the
    contact form. Redirects run BEFORE rewrites, so only the `?stone=` case is
    diverted and the bare `/index.html` rewrite below still stands.

    The fragment never reaches the server, so `#estimator` and `#cta` cannot be
    told apart here. Both land on the contact form, which is the client's own
    decision: "It should go straight to the contact form with that stone
    preselected."

    307 rather than 308 while the domain is still unsettled — a permanent
    redirect is cached by the browser and is painful to take back.
  */
  async redirects() {
    return [
      {
        source: '/index.html',
        has: [
          { type: 'query', key: 'stone', value: '(?<stone>.*)' },
          { type: 'query', key: 'mat', value: '(?<mat>.*)' },
          { type: 'query', key: 'slug', value: '(?<slug>.*)' },
        ],
        destination: '/contact/?stone=:stone&mat=:mat&slug=:slug#ctaForm',
        permanent: false,
      },
      /* The same link with only the stone name on it. */
      {
        source: '/index.html',
        has: [{ type: 'query', key: 'stone', value: '(?<stone>.*)' }],
        destination: '/contact/?stone=:stone#ctaForm',
        permanent: false,
      },
      /*
        ⛔ THE NINE SERVICE PAGES ARE A REDIRECT, NOT A REWRITE — AND THEY ARE
        THE ONLY FAMILY THAT IS.

        The client: "all the individual service pages are still resolving with a
        .html extension. We want clean URLs instead, so
        /services/outdoor-kitchens.html should become /services/outdoor-kitchens
        ... and make sure the old .html URLs redirect to the new ones rather
        than 404ing."

        The rewrite that used to sit in `rewrites()` below served the page at
        the `.html` URL and left it in the address bar, which is exactly what he
        is looking at. It was right while every canonical in services.json still
        pointed at a `.html` leaf — a redirect then would have moved the visitor
        off the URL the page declared as its own. Those 455 references are now
        clean (`url`, `seo.canonical` and `og.url` on all nine, plus every
        inbound link in locations.json, materials.json, nav-data.ts, sitemap.ts
        and the sibling links inside the pages themselves), so the redirect is
        now the truthful answer and the rewrite would be the lie.

        308, not 307: this shape is settled and the old leaves should stop being
        fetched. The two stone deep-links above stay 307 for their own stated
        reason — the domain, not the path shape, is what is unsettled there.

        ⚠️ THE OTHER FAMILIES ARE DELIBERATELY UNTOUCHED. /stones/ (132),
        /guides/ (9), /materials/ (5), /sitemap.html and /index.html still
        rewrite, because their canonicals are still `.html` leaves. Converting
        one family without its canonicals would advertise one URL and serve
        another. He asked for the service pages; the rest is a separate,
        larger change and is listed as such in the handover.
      */
      {
        source: '/services/:slug.html',
        destination: '/services/:slug',
        permanent: true,
      },
      /*
        THE ARTICLES, AND THEY ARE THE SECOND FAMILY TO RETIRE ITS `.html`.

        Articles are standalone HTML files hand-dropped into public/articles/.
        Each one declares `/articles/<slug>` as its canonical, so the `.html`
        leaf it is physically stored as must redirect rather than answer, or
        the same page is reachable at two URLs and one of them contradicts its
        own canonical tag.

        308, like the services family: this shape is settled from the start.

        ⛔ THIS PAIRS WITH THE REWRITE BELOW AND NEITHER SHIPS ALONE. On its
        own, this redirect sends /articles/foo.html to a URL that 404s on
        Vercel, because Next serves public/ by exact match only and has no
        `.html` fallback. Apache does have one, so shipping half of this makes
        the live site work and the Vercel copy the developer reviews broken.

        It cannot loop with the rewrite. Next builds ONE linear route array —
        headers, redirects, beforeFiles, the filesystem, afterFiles — and
        walks it once; a rewrite mutates the pathname and the walk continues
        forward, so the rewritten path never re-enters the redirect phase.
        Measured on 16.3.3: /articles/foo.html is exactly one hop.
      */
      {
        source: '/articles/:slug.html',
        destination: '/articles/:slug',
        permanent: true,
      },
    ];
  },

  async rewrites() {
    return [
      /* The home page is a `.html` leaf too, and it was the one this list
         missed. `.brand` links `/index.html#hero` on all 178 pages and the FAQ
         jump links `/index.html#faq`, so without this the TopCat logo in the
         header 404s everywhere — measured: /index.html was 404 here and 200 on
         the legacy build. There are 1224 `index.html` references across src. */
      { source: '/index.html', destination: '/' },
      { source: '/stones/compare.html', destination: '/stones/compare' },
      { source: '/stones/:slug.html', destination: '/stones/:slug' },
      { source: '/guides/:slug.html', destination: '/guides/:slug' },
      { source: '/materials/:slug.html', destination: '/materials/:slug' },
      { source: '/sitemap.html', destination: '/sitemap' },
      /*
        The article leaves. `public/articles/<slug>.html` is a real file, and
        Next's public handler is an EXACT-MATCH set — `/articles/<slug>` is
        not in it, so without this rule the clean URL 404s on Vercel while
        Apache serves it happily from .htaccess rule 2. This is the Next-side
        equivalent of that rule and it exists to make the two hosts agree.

        afterFiles (a plain returned array), NOT beforeFiles: afterFiles runs
        after the filesystem check, which is what leaves `/articles` itself to
        the real route rather than swallowing it.
      */
      { source: '/articles/:slug', destination: '/articles/:slug.html' },
    ];
  },
};

export default nextConfig;

/* ==========================================================================
   The structured data on /estimate/, lifted verbatim out of estimate/index.html.

   1 <script type="application/ld+json"> block(s). Kept as parsed
   objects rather than a raw string so a typo cannot ship: this file is the
   output of scripts run against the legacy HTML, and every block was
   JSON.parse'd at extraction time.

   Next's Metadata API has no field for arbitrary JSON-LD, so the page emits
   these itself as a <script type="application/ld+json"> in the body. That is
   what Google's own guidance recommends and what the legacy pages do; the
   position in the document is not significant to a crawler.
   ========================================================================== */

export const ESTIMATE_LD: readonly unknown[] = [
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://www.topcatworktops.co.uk/"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Estimate",
        "item": "https://www.topcatworktops.co.uk/estimate/"
      }
    ]
  }
];

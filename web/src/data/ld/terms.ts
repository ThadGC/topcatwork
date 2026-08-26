/* ==========================================================================
   The structured data on /terms/, lifted verbatim out of terms/index.html.

   1 <script type="application/ld+json"> block(s). Kept as parsed
   objects rather than a raw string so a typo cannot ship: this file is the
   output of scripts run against the legacy HTML, and every block was
   JSON.parse'd at extraction time.

   Next's Metadata API has no field for arbitrary JSON-LD, so the page emits
   these itself as a <script type="application/ld+json"> in the body. That is
   what Google's own guidance recommends and what the legacy pages do; the
   position in the document is not significant to a crawler.
   ========================================================================== */

export const TERMS_LD: readonly unknown[] = [
  [
    {
      "@context": "https://schema.org",
      "@type": "HomeAndConstructionBusiness",
      "name": "Topcat Worktops Ltd",
      "url": "https://www.topcatworktops.co.uk/",
      "telephone": "+448000982812",
      "email": "info@topcatworktops.co.uk",
      "description": "Bespoke quartz, marble, granite and porcelain worktops, templated, fitted and guaranteed across London, Hertfordshire, Essex, Berkshire, Buckinghamshire, Surrey, Oxfordshire & Bedfordshire.",
      "areaServed": [
        {
          "@type": "AdministrativeArea",
          "name": "London"
        },
        {
          "@type": "AdministrativeArea",
          "name": "Hertfordshire"
        },
        {
          "@type": "AdministrativeArea",
          "name": "Essex"
        },
        {
          "@type": "AdministrativeArea",
          "name": "Berkshire"
        },
        {
          "@type": "AdministrativeArea",
          "name": "Buckinghamshire"
        },
        {
          "@type": "AdministrativeArea",
          "name": "Surrey"
        },
        {
          "@type": "AdministrativeArea",
          "name": "Oxfordshire"
        },
        {
          "@type": "AdministrativeArea",
          "name": "Bedfordshire"
        }
      ],
      "openingHours": "Mo-Su 07:00-21:00"
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://www.topcatworktops.co.uk/index.html#hero"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Terms & Conditions",
          "item": "https://www.topcatworktops.co.uk/terms/"
        }
      ]
    }
  ]
];

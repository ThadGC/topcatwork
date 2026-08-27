/* ==========================================================================
   The structured data on /trade/, lifted verbatim out of trade/index.html.

   1 <script type="application/ld+json"> block(s). Kept as parsed
   objects rather than a raw string so a typo cannot ship: this file is the
   output of scripts run against the legacy HTML, and every block was
   JSON.parse'd at extraction time.

   Next's Metadata API has no field for arbitrary JSON-LD, so the page emits
   these itself as a <script type="application/ld+json"> in the body. That is
   what Google's own guidance recommends and what the legacy pages do; the
   position in the document is not significant to a crawler.
   ========================================================================== */

export const TRADE_LD: readonly unknown[] = [
  {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        "name": "Trade stone worktop supply and fit",
        "serviceType": "Trade stone worktop supply and fit",
        "description": "Stone worktop supply and fit for the trade across London, Hertfordshire, Essex and Berkshire. Template to fit through one contact, dates confirmed in writing, trade terms that hold, and a ten-year guarantee on every install.",
        "url": "https://www.topcatworktops.co.uk/trade/",
        "provider": {
          "@type": "LocalBusiness",
          "name": "Topcat Worktops",
          "@id": "https://www.topcatworktops.co.uk/#business"
        },
        "areaServed": [
          "London",
          "Hertfordshire",
          "Essex",
          "Berkshire",
          "Buckinghamshire",
          "Surrey",
          "Oxfordshire",
          "Bedfordshire"
        ],
        "audience": {
          "@type": "BusinessAudience",
          "audienceType": "Kitchen designers, builders, developers and architects"
        }
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": "https://www.topcatworktops.co.uk/index.html"
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Trade",
            "item": "https://www.topcatworktops.co.uk/trade/"
          }
        ]
      },
      {
        "@type": "LocalBusiness",
        "@id": "https://www.topcatworktops.co.uk/#business",
        "name": "Topcat Worktops",
        "url": "https://www.topcatworktops.co.uk",
        "telephone": "0800 098 2812",
        "email": "info@topcatworktops.co.uk",
        "priceRange": "££",
        "areaServed": [
          "London",
          "Hertfordshire",
          "Essex",
          "Berkshire",
          "Buckinghamshire",
          "Surrey",
          "Oxfordshire",
          "Bedfordshire"
        ],
        "openingHoursSpecification": [
          {
            "@type": "OpeningHoursSpecification",
            "dayOfWeek": [
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
              "Saturday",
              "Sunday"
            ],
            "opens": "07:00",
            "closes": "21:00"
          }
        ]
      }
    ]
  }
];

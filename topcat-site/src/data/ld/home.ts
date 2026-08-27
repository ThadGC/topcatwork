/* ==========================================================================
   The structured data on the home page, lifted verbatim out of index.html.

   1 <script type="application/ld+json"> block(s). Kept as parsed
   objects rather than a raw string so a typo cannot ship: this file is the
   output of a script run against the live HTML, and every block was
   JSON.parse'd at extraction time.

   Next's Metadata API has no field for arbitrary JSON-LD, so the page emits
   these itself as a <script type="application/ld+json"> in the body. That is
   what Google's own guidance recommends and what the legacy pages do; the
   position in the document is not significant to a crawler.
   ========================================================================== */

export const HOME_LD: readonly unknown[] = [
  {
    "@context": "https://schema.org",
    "@type": "HomeAndConstructionBusiness",
    "name": "Topcat Worktops Ltd",
    "description": "Bespoke quartz, marble and granite worktops for kitchens and bathrooms, chosen from the slab, templated to the millimetre and fitted in days.",
    "url": "https://www.topcatworktops.co.uk",
    "telephone": "+448000982812",
    "email": "info@topcatworktops.co.uk",
    "sameAs": [
      "https://www.instagram.com/topcatworktops/",
      "https://www.linkedin.com/company/topcat-worktops/"
    ],
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
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "St Albans",
      "addressRegion": "Hertfordshire",
      "addressCountry": "GB"
    },
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
    ],
    "priceRange": "££",
    "makesOffer": [
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Quartz worktops, supplied and fitted"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Granite worktops, supplied and fitted"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Marble worktops, supplied and fitted"
        }
      }
    ]
  }
];

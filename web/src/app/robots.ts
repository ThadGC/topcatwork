import type { MetadataRoute } from 'next';

import { SITE } from '@/lib/site';

/**
 * /robots.txt
 *
 * Neither build had one: it 404'd on the legacy site and on this one, which
 * the 27 Aug audit turned up as a launch item rather than a regression.
 *
 * Everything is crawlable except the enquiry endpoint, which is a POST handler
 * and has nothing for a crawler to index. The sitemap is declared here so a
 * crawler finds it without being told.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/api/'] }],
    sitemap: `${SITE}/sitemap.xml`,
    host: SITE,
  };
}

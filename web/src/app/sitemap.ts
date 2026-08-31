import type { MetadataRoute } from 'next';

import { guideSlugs } from '@/lib/guides';
import { locationPaths } from '@/lib/locations';
import { materialSlugs } from '@/lib/materials';
import { serviceSlugs } from '@/lib/services';
import { SITE } from '@/lib/site';
import { stoneSlugs } from '@/lib/stones';

/**
 * /sitemap.xml
 *
 * Neither build had one — it 404'd on the legacy site too, and the 27 Aug
 * audit called it out as a launch item.
 *
 * ⚠️ EVERY URL HERE MUST EQUAL THAT PAGE'S OWN CANONICAL, or the sitemap
 * argues with the pages it lists and Search Console reports "alternate page
 * with proper canonical tag" for the lot. The shapes below were read off the
 * live pages rather than assumed, because they are NOT uniform:
 *
 *   /                              the origin, no trailing segment
 *   /about/ /contact/ …            directory form, trailing slash
 *   /stones/<slug>.html            a leaf, from the legacy export
 *   /services/<slug>               CLEAN since 29 Aug — see below
 *   /guides/<slug>.html            a leaf
 *   /materials/<slug>.html         a leaf
 *   /worktops/<county>/            directory form
 *   /stones/compare.html           a leaf
 *   /sitemap.html                  a leaf, and NOT this file
 *
 * The counts are asserted in tests/sitemap-xml.test.ts, and the audit script
 * diffs every URL here against the canonical the page actually emits.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const at = (path: string, priority: number, changeFrequency: 'daily' | 'weekly' | 'monthly' | 'yearly') => ({
    url: `${SITE}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  });

  return [
    /* The bare origin, NOT `${SITE}/` — that is exactly what the page's own
       canonical renders as, and the two must be byte-identical. */
    { url: SITE, lastModified: now, changeFrequency: 'weekly' as const, priority: 1.0 },

    /* The pages a customer moves through. */
    at('/stone-selector/', 0.9, 'weekly'),
    at('/estimate/', 0.9, 'monthly'),
    at('/contact/', 0.9, 'monthly'),
    at('/services/', 0.8, 'monthly'),
    at('/projects/', 0.8, 'weekly'),
    at('/stones/', 0.8, 'weekly'),
    at('/materials/', 0.8, 'monthly'),
    at('/worktops/', 0.8, 'monthly'),
    at('/guides/', 0.7, 'monthly'),
    at('/about/', 0.6, 'yearly'),
    at('/trade/', 0.6, 'monthly'),
    at('/stones/compare.html', 0.6, 'monthly'),

    /* The SEO surface. */
    /* ⛔ CLEAN, NOT `.html` — the only family in this list that is. The nine
       service canonicals were changed on 29 Aug at the client's request, and a
       sitemap must advertise the canonical URL. Left as a leaf it would send
       every crawler to a 308 and disagree with the <link rel="canonical"> on
       the page it points at. The other four families keep their leaves because
       their canonicals still are leaves. */
    ...serviceSlugs().map((s) => at(`/services/${s}`, 0.8, 'monthly')),
    ...materialSlugs().map((s) => at(`/materials/${s}.html`, 0.8, 'monthly')),
    ...locationPaths().map((p) => at(`/worktops/${p.join('/')}/`, 0.7, 'monthly')),
    ...guideSlugs().map((s) => at(`/guides/${s}.html`, 0.6, 'monthly')),
    ...stoneSlugs().map((s) => at(`/stones/${s}.html`, 0.5, 'monthly')),

    /* Housekeeping, last: low priority, but they should not be orphans. */
    at('/sitemap.html', 0.3, 'yearly'),
    at('/privacy/', 0.2, 'yearly'),
    at('/terms/', 0.2, 'yearly'),
  ];
}

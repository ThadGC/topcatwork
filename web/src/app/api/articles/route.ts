/**
 * GET /api/articles — the articles folder as it stands right now.
 *
 * The Vercel half of a pair. `public/api/articles/index.php` is the other
 * half and answers the same URL on the SiteGround host, with the same JSON
 * contract, so `<ArticleList>` cannot tell which one replied. This is the
 * same twin arrangement `app/api/enquiry/route.ts` and
 * `public/api/enquiry/index.php` already use, for the same reason: the live
 * domain is a static snapshot served by Apache, which cannot run a Next route
 * handler.
 *
 * ---------------------------------------------------------------------------
 * WHAT IT IS FOR, AND WHAT IT IS NOT FOR
 * ---------------------------------------------------------------------------
 * `/articles` is prerendered, so the list baked into it is whatever was on
 * disk when `next build` ran. On the live host articles are uploaded by hand
 * AFTER that, so the baked list goes stale immediately. This endpoint lets the
 * listing top itself up at runtime.
 *
 * It is NOT the SEO surface. The prerendered HTML already links every article
 * the build knew about; this only adds the ones it could not have known
 * about. If it never answers, the page is still correct — just as fresh as
 * the last deploy.
 *
 * On Vercel the two lists are usually identical, because an article only
 * reaches Vercel through a deploy, which is also a build. That is expected:
 * the endpoint earns its keep on Apache.
 */
import { NextResponse } from 'next/server';

import { readArticles } from '@/lib/articles';

/** Read the folder per request, not once at build — freshness is the point. */
export const dynamic = 'force-dynamic';

export function GET() {
  try {
    const articles = readArticles().map(({ slug, url, title, description, published }) => ({
      slug,
      url,
      title,
      description,
      published,
    }));

    return NextResponse.json(
      { articles },
      {
        /* The listing merges this over its own list on every visit, so a
           cached copy would defeat the freshness this exists to provide. */
        headers: { 'cache-control': 'no-store' },
      },
    );
  } catch {
    /* A malformed file makes readArticles throw by design, which is right at
       build time and wrong here: one bad upload must not blank the endpoint
       for a visitor. The prerendered list stands. */
    return NextResponse.json({ articles: [] }, { headers: { 'cache-control': 'no-store' } });
  }
}

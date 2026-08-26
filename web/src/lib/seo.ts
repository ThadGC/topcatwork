/**
 * Legacy `<head>` -> Next `Metadata`.
 *
 * Every extracted page record carries a `seo` block lifted verbatim from the
 * source markup. These pages are SEO-tuned — hand-written titles, hand-written
 * descriptions, and canonicals that point at `.html` leaves — so nothing here
 * derives, templates or truncates. It maps one to one.
 *
 * Two things worth knowing:
 *
 *   - `title` is emitted as `{ absolute }`. The root layout sets a
 *     `'%s | Topcat'` template, and every legacy title already ends in
 *     "| Topcat Worktops". Without `absolute` you get it twice.
 *   - `robots: "index, follow"` is the source's explicit default. It is the
 *     same as emitting nothing, but the tag is in all 178 pages, so it is
 *     carried rather than silently dropped.
 */
import type { Metadata } from 'next';

/** The shape the extractor produces for every page's <head>. */
export interface SeoRecord {
  title: string;
  description: string;
  robots: string;
  canonical: string;
  og: {
    type: string;
    title: string;
    description: string;
    url: string;
    siteName: string;
    image: string;
    imageWidth: string;
    imageHeight: string;
  };
  twitterCard: string;
}

/** `"index, follow"` -> Next's structured robots directives. */
function parseRobots(robots: string): Metadata['robots'] {
  const directives = robots
    .split(',')
    .map((d) => d.trim().toLowerCase())
    .filter(Boolean);
  return {
    index: !directives.includes('noindex'),
    follow: !directives.includes('nofollow'),
  };
}

export function metadataFromSeo(seo: SeoRecord): Metadata {
  return {
    title: { absolute: seo.title },
    description: seo.description,
    robots: parseRobots(seo.robots),
    alternates: { canonical: seo.canonical },
    openGraph: {
      type: seo.og.type as 'website',
      title: seo.og.title,
      description: seo.og.description,
      url: seo.og.url,
      siteName: seo.og.siteName,
      images: [
        {
          url: seo.og.image,
          width: Number(seo.og.imageWidth),
          height: Number(seo.og.imageHeight),
        },
      ],
    },
    twitter: { card: seo.twitterCard as 'summary_large_image' },
  };
}

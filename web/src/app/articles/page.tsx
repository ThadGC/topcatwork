/**
 * `/articles` — the articles hub.
 *
 * Page shape, matching the /guides/ hub exactly:
 *   nav.crumb        — before <main>, Home / Articles
 *   section.block    — h1, p.lede, the card grid, the Load more row
 *
 * ---------------------------------------------------------------------------
 * THE URL HAS NO TRAILING SLASH, AND IT IS THE ONE HUB ON THE SITE THAT DOES
 * NOT
 * ---------------------------------------------------------------------------
 * /guides/, /materials/, /stones/, /worktops/ and /services/ are all directory
 * URLs. This one is `/articles`, because `public/articles/` is a REAL
 * DIRECTORY of hand-dropped HTML files sitting at the web root of the live
 * host. Apache's mod_dir sees it, 301s `/articles` to `/articles/`, and the
 * `!-d` condition in public/.htaccess rule 2 then refuses to serve the
 * listing at all. The fix is in three parts and all three are required: a
 * scoped `DirectorySlash Off` in public/articles/.htaccess, an explicit pair
 * of rules in public/.htaccess, and this page declaring the slash-less form
 * as its canonical so the sitemap, the nav and the page all agree.
 *
 * ---------------------------------------------------------------------------
 * NO <article> HERE
 * ---------------------------------------------------------------------------
 * The same reading as the guides hub: this is a list of links to articles, it
 * is not itself one, which is also why the JSON-LD is CollectionPage +
 * BreadcrumbList rather than Article.
 *
 * ---------------------------------------------------------------------------
 * WHERE THE CONTENT COMES FROM
 * ---------------------------------------------------------------------------
 * `readArticles()` reads `public/articles/*.html` at BUILD time. There is no
 * database, no CMS and no data file: the folder is the source of truth, and
 * dropping a file into it is the entire authoring step. See src/lib/articles.ts
 * for what happens to an article uploaded after the last build.
 */
import type { Metadata } from 'next';

import { Breadcrumb } from '@/components/chrome/Breadcrumb';
import { JsonLd } from '@/components/chrome/JsonLd';
import { ArticleList } from '@/components/articles/ArticleList';
import { ARTICLES_PER_PAGE, readArticles } from '@/lib/articles';
import { metadataFromSeo } from '@/lib/seo';
import { SITE } from '@/lib/site';

/* 52 characters, so Google shows it whole. The shorter " | Topcat" suffix is
   the one the home page uses; the site carries both forms. */
const TITLE = 'Worktop Articles | Advice on Stone Surfaces | Topcat';
const DESCRIPTION =
  'Longer reads on choosing, living with and caring for a stone worktop, ' +
  'written by the people who template, fabricate and fit them.';
const CANONICAL = `${SITE}/articles`;

/* Built through metadataFromSeo rather than by hand, so this page emits the
   same head surface as the other 178: `title` absolute (the root layout's
   '%s | Topcat' template would otherwise append a second suffix), the explicit
   `index, follow` the whole site carries, canonical, the full og block and the
   summary_large_image card. */
export const metadata: Metadata = metadataFromSeo({
  title: TITLE,
  description: DESCRIPTION,
  robots: 'index, follow',
  canonical: CANONICAL,
  og: {
    type: 'website',
    title: TITLE,
    description: DESCRIPTION,
    url: CANONICAL,
    siteName: 'Topcat Worktops',
    image: `${SITE}/assets/site/og-cover.jpg`,
    imageWidth: '1200',
    imageHeight: '630',
  },
  twitterCard: 'summary_large_image',
});

const BREADCRUMBS = {
  back: { href: '/index.html#hero', label: 'Back to Home' },
  items: [
    { name: 'Home', href: '/index.html#hero', current: false },
    { name: 'Articles', href: null, current: true },
  ],
};

export default function ArticlesPage() {
  const articles = readArticles();

  /*
    Nested one level, so <JsonLd> emits ONE <script> holding an array of two
    graphs — the shape every legacy page uses, and the shape the guides hub
    still emits today. Passing the pair unnested would produce two separate
    script tags: valid, but a divergence from the other 178 pages for no gain.

    ItemList carries every article, not just the six on screen, because it
    describes the collection rather than the viewport.
  */
  const jsonLd = [
    [
      {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'Worktop articles',
        description: DESCRIPTION,
        url: CANONICAL,
        isPartOf: { '@type': 'WebSite', name: 'Topcat Worktops', url: `${SITE}/` },
        publisher: { '@type': 'Organization', name: 'Topcat Worktops Ltd' },
        mainEntity: {
          '@type': 'ItemList',
          numberOfItems: articles.length,
          itemListElement: articles.map((article, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: article.title,
            url: `${SITE}${article.url}`,
          })),
        },
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: `${SITE}/index.html#hero`,
          },
          { '@type': 'ListItem', position: 2, name: 'Articles', item: CANONICAL },
        ],
      },
    ],
  ];

  return (
    <>
      <JsonLd data={jsonLd} />
      {/* Outside <main>, as on every SEO-shell page. content.css positions the
          crumb against the page padding rather than against the `.wrap`
          column, so moving it inside would shift it. */}
      <Breadcrumb crumbs={BREADCRUMBS} />
      <main>
        <section className="block">
          <div className="wrap">
            <h1>Worktop articles</h1>
            <p className="lede">
              Longer reads on choosing, living with and caring for a stone
              worktop. Written by the people who template, fabricate and fit
              them.
            </p>
            <ArticleList articles={articles} step={ARTICLES_PER_PAGE} />
          </div>
        </section>
      </main>
    </>
  );
}

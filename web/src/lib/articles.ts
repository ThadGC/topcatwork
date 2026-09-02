/**
 * The articles dataset — read from the FILESYSTEM, not from a JSON module.
 *
 * Every other page family on this site is backed by `src/data/*.json`, which
 * an extractor writes. Articles are deliberately different: they are
 * hand-authored, self-contained HTML documents dropped into
 * `public/articles/` by a human, and the whole point is that dropping one in
 * is the ONLY step. So this module reads the directory instead.
 *
 * ---------------------------------------------------------------------------
 * WHY NOT src/data/articles.json
 * ---------------------------------------------------------------------------
 * `tests/seo-head.test.ts` walks every `*.json` in `src/data/` and asserts the
 * record count is exactly 169. A data file here would break a currently-green
 * test on every article added, which is precisely the wrong signal — a new
 * article is not a regression. Keeping the articles out of `src/data/` keeps
 * that test meaningful. This is a `.ts` module for the same reason
 * `src/data/sitemap.ts` is: the readdirSync filter skips it.
 *
 * ---------------------------------------------------------------------------
 * WHEN THIS RUNS
 * ---------------------------------------------------------------------------
 * Build time only. `/articles` and `/sitemap.xml` are both prerendered, so the
 * directory is read once by `next build` and the result is baked into static
 * HTML. There is no request-time filesystem access and none is wanted.
 *
 * ⚠️ THAT MEANS A REBUILD IS WHAT PUTS AN ARTICLE INTO THE PRERENDERED LIST.
 * An article uploaded to SiteGround after the last build is still LIVE and
 * reachable at its own URL — Apache serves the file directly, see
 * public/.htaccess — but the listing page baked at build time does not know
 * about it. `public/api/articles/index.php` closes that gap at runtime on the
 * live host, and `<ArticleList>` merges what it returns over this list. This
 * module is the SEO-visible half; the PHP is the freshness half.
 *
 * ---------------------------------------------------------------------------
 * THE PARSER IS DELIBERATELY DUMB
 * ---------------------------------------------------------------------------
 * Regex, not an HTML parser. The input is not arbitrary HTML: it is a file
 * written from `public/articles/_TEMPLATE.html`, whose head is fixed and whose
 * tags are one per line. A dependency-free reader keeps the build honest, and
 * a malformed file fails loudly at build (see `readArticles`) rather than
 * silently publishing a half-parsed page.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

/** Where the hand-dropped files live, relative to the `web/` directory. */
export const ARTICLES_DIR = resolve(process.cwd(), 'public', 'articles');

/** The suffix every page title on this site carries. Stripped for card use. */
const TITLE_SUFFIX = ' | Topcat Worktops';

export interface ArticleRecord {
  /** The filename without `.html`. This IS the URL segment. */
  slug: string;
  /** `/articles/<slug>` — clean, no extension. Equals the file's canonical. */
  url: string;
  /** The bare headline, with the site suffix removed. Used on the cards. */
  title: string;
  /** The full `<title>` contents, suffix and all. Used for the SERP check. */
  documentTitle: string;
  /** `<meta name="description">` — the card excerpt and the SERP snippet. */
  description: string;
  /** ISO `YYYY-MM-DD`. Sorts the list; drives `lastModified` in the sitemap. */
  published: string;
}

/* -------------------------------------------------------------------------
   Parsing
   ------------------------------------------------------------------------- */

/**
 * `<meta name="x" content="y">` or `<meta content="y" name="x">`.
 *
 * ⛔ THE VALUE IS CAPTURED UP TO ITS OWN DELIMITER, VIA A BACKREFERENCE, AND
 * IT HAS TO BE. The obvious `content=["']([^"']*)["']` reads
 *
 *   content="How to prepare for template day: a fitter's checklist"
 *
 * as `How to prepare for template day: a fitter`, because the negated class
 * ends at the apostrophe rather than at the quote that actually opened the
 * value. It was caught on the live listing page, where that card had silently
 * lost half its headline while every automated check passed.
 *
 * Apostrophes are ordinary in English copy, so this is not an edge case: it
 * would have truncated a title or a description sooner or later on most
 * articles anyone writes. `\1` closes on whichever quote opened, and the lazy
 * `*?` stops at the first one of those rather than running to the end of the
 * head. The same fix is in public/api/articles/index.php, which must parse
 * these files identically.
 */
function meta(html: string, name: string): string | null {
  const byName = new RegExp(
    `<meta[^>]*\\sname=["']${name}["'][^>]*\\scontent=(["'])(.*?)\\1`,
    'i',
  );
  const byContent = new RegExp(
    `<meta[^>]*\\scontent=(["'])(.*?)\\1[^>]*\\sname=["']${name}["']`,
    'i',
  );
  const hit = byName.exec(html) ?? byContent.exec(html);
  return hit ? decodeEntities(hit[2]).trim() : null;
}

/**
 * The five named entities the template's own copy can contain. The head is
 * author-written prose, so `&amp;` and `&#39;` really do turn up in a
 * description; everything else would be a mistake worth seeing verbatim.
 */
function decodeEntities(value: string): string {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'");
}

/** A build-stopping error, with the filename, because a silent skip is worse. */
function fail(file: string, what: string): never {
  throw new Error(
    `public/articles/${file}: ${what}. ` +
      'Every article must be built from public/articles/_TEMPLATE.html, which ' +
      'carries all of the required tags. Fix the file or move it out of the folder.',
  );
}

/** One file -> one record. Throws if the file is missing anything required. */
export function parseArticle(file: string, html: string): ArticleRecord {
  const slug = file.replace(/\.html$/i, '');

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    fail(
      file,
      'the filename is not a clean slug. Use lowercase letters, digits and ' +
        'single hyphens only, e.g. granite-vs-quartz-worktops.html',
    );
  }

  const titleTag = /<title>([\s\S]*?)<\/title>/i.exec(html);
  if (!titleTag) fail(file, 'no <title> tag');
  const documentTitle = decodeEntities(titleTag[1]).replace(/\s+/g, ' ').trim();
  if (!documentTitle) fail(file, 'the <title> tag is empty');

  const description = meta(html, 'description');
  if (!description) fail(file, 'no <meta name="description">');

  const published = meta(html, 'article:published');
  if (!published) {
    fail(file, 'no <meta name="article:published" content="YYYY-MM-DD">');
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(published)) {
    fail(file, `article:published is "${published}", not YYYY-MM-DD`);
  }

  /* An explicit card headline wins; otherwise take the <title> without the
     site suffix, which is what every card on the site actually shows. */
  const explicit = meta(html, 'article:title');
  const title =
    explicit ||
    (documentTitle.endsWith(TITLE_SUFFIX)
      ? documentTitle.slice(0, -TITLE_SUFFIX.length).trim()
      : documentTitle);

  return {
    slug,
    url: `/articles/${slug}`,
    title,
    documentTitle,
    description,
    published,
  };
}

/* -------------------------------------------------------------------------
   Reading
   ------------------------------------------------------------------------- */

/**
 * Files the folder holds that are NOT articles.
 *
 * `_TEMPLATE.html` is the starting point an author copies, and `assets/` holds
 * the generated stylesheet. A leading underscore or dot means "not content" —
 * the same convention Next uses for private folders.
 */
function isArticleFile(name: string): boolean {
  return name.toLowerCase().endsWith('.html') && !/^[._]/.test(name);
}

/**
 * Every article, NEWEST FIRST.
 *
 * Ties break on slug, ascending, so the order is total and a rebuild with no
 * content change produces a byte-identical page. Two articles published the
 * same day is the common case, not an edge case, so this matters.
 */
export function readArticles(): ArticleRecord[] {
  let names: string[];
  try {
    names = readdirSync(ARTICLES_DIR);
  } catch {
    /* No folder yet is not an error — it is a site with no articles. The
       listing page renders its empty state and the sitemap gains nothing. */
    return [];
  }

  const records = names
    .filter(isArticleFile)
    .filter((name) => statSync(join(ARTICLES_DIR, name)).isFile())
    .map((name) => parseArticle(name, readFileSync(join(ARTICLES_DIR, name), 'utf8')));

  const seen = new Set<string>();
  for (const record of records) {
    if (seen.has(record.slug)) {
      throw new Error(`public/articles: two files resolve to the slug "${record.slug}"`);
    }
    seen.add(record.slug);
  }

  return records.sort((a, b) =>
    a.published === b.published
      ? a.slug.localeCompare(b.slug)
      : b.published.localeCompare(a.published),
  );
}

/** How many articles the listing reveals per press of "Load more". */
export const ARTICLES_PER_PAGE = 6;

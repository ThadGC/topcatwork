/**
 * The articles section.
 *
 * ---------------------------------------------------------------------------
 * WHY THIS FILE ASSERTS THINGS ABOUT THE SITEMAP
 * ---------------------------------------------------------------------------
 * src/app/sitemap.ts opens with a warning that every URL it lists must equal
 * that page's own canonical, and states that the counts are asserted in
 * `tests/sitemap-xml.test.ts`. THAT FILE HAS NEVER EXISTED — the XML sitemap
 * had no coverage at all when the articles work started.
 *
 * That matters more for articles than for any other family, because articles
 * are the only ones the sitemap discovers by READING A DIRECTORY rather than
 * by importing a checked-in dataset. "New articles are picked up
 * automatically" is a filesystem read with no schema behind it, so these tests
 * are the only thing that will ever notice it silently returning nothing, or
 * advertising a URL shape that 404s.
 *
 * These cover the articles rows specifically. The other 179 rows remain
 * uncovered and that is still worth fixing, separately.
 */
import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import sitemap from '../src/app/sitemap';
import { ARTICLES_PER_PAGE, parseArticle, readArticles } from '../src/lib/articles';
import { PRIMARY } from '../src/components/chrome/nav-data';

const ARTICLES_DIR = resolve(__dirname, '../public/articles');
const SITE = 'https://www.topcatworktops.co.uk';

/** A minimal file with every tag the parser requires. */
function file(overrides: Record<string, string> = {}) {
  const f = {
    title: 'A Title | Topcat Worktops',
    description: 'A description.',
    published: '2026-08-01',
    ...overrides,
  };
  return [
    '<!DOCTYPE html><html lang="en-GB"><head>',
    `<title>${f.title}</title>`,
    `<meta name="description" content="${f.description}">`,
    `<meta name="article:published" content="${f.published}">`,
    '</head><body></body></html>',
  ].join('\n');
}

describe('parsing one article file', () => {
  it('takes the slug from the filename and builds the clean URL', () => {
    const a = parseArticle('granite-vs-quartz.html', file());
    expect(a.slug).toBe('granite-vs-quartz');
    expect(a.url).toBe('/articles/granite-vs-quartz');
  });

  it('strips the site suffix for the card headline but keeps the full <title>', () => {
    const a = parseArticle('x.html', file({ title: 'How to clean quartz | Topcat Worktops' }));
    expect(a.title).toBe('How to clean quartz');
    expect(a.documentTitle).toBe('How to clean quartz | Topcat Worktops');
  });

  it('lets an explicit article:title override the card headline', () => {
    const html = file({ title: 'A very long SEO title indeed | Topcat Worktops' }).replace(
      '</head>',
      '<meta name="article:title" content="A short card headline">\n</head>',
    );
    expect(parseArticle('x.html', html).title).toBe('A short card headline');
  });

  /**
   * REGRESSION. The first parser ended a meta value at `[^"']*`, which stops
   * at an APOSTROPHE rather than at the quote that opened the attribute, so
   *   content="How to prepare for template day: a fitter's checklist"
   * was read as "How to prepare for template day: a fitter". It shipped to the
   * listing page and truncated a card headline in the browser while every
   * automated check here passed, because nothing in the fixtures had an
   * apostrophe in it. English copy is full of them.
   */
  it.each([
    ['an apostrophe', "A fitter's checklist for template day"],
    ['a double apostrophe', "The fitter's and the designer's jobs"],
    ['an ampersand entity', 'Marble &amp; granite'],
    ['a colon and comma', 'Honed or polished: which, and why'],
  ])('reads a title containing %s to the end', (_label, value) => {
    const html = file({ title: `${value} | Topcat Worktops` });
    expect(parseArticle('x.html', html).title).toBe(
      value.replace('&amp;', '&'),
    );
  });

  it('reads a description containing an apostrophe to the end', () => {
    const d = "It is the fitter's job, not the designer's, and here is why.";
    expect(parseArticle('x.html', file({ description: d })).description).toBe(d);
  });

  it('reads a single-quoted attribute to its own delimiter', () => {
    const html = file().replace(
      /<meta name="description"[^>]*>/,
      `<meta name='description' content='A "quoted" phrase inside single quotes'>`,
    );
    expect(parseArticle('x.html', html).description).toBe(
      'A "quoted" phrase inside single quotes',
    );
  });

  it('decodes the entities the head can legitimately contain', () => {
    const a = parseArticle('x.html', file({ description: 'Marble &amp; granite, &#39;honed&#39;' }));
    expect(a.description).toBe("Marble & granite, 'honed'");
  });

  /* A malformed file must stop the BUILD. Publishing a half-parsed page, or
     silently skipping one the author believes is live, are both worse than a
     loud failure at the only moment someone is watching. */
  it.each([
    ['no <title>', file().replace(/<title>.*<\/title>/, ''), /no <title>/],
    ['no description', file().replace(/<meta name="description"[^>]*>/, ''), /description/],
    ['no published date', file().replace(/<meta name="article:published"[^>]*>/, ''), /article:published/],
    ['a malformed date', file({ published: '01-08-2026' }), /not YYYY-MM-DD/],
  ])('throws on %s', (_label, html, message) => {
    expect(() => parseArticle('x.html', html)).toThrow(message);
  });

  it.each(['Not_A_Slug.html', 'has spaces.html', 'Trailing-.html', 'double--hyphen.html'])(
    'refuses the filename %s rather than publishing a broken URL',
    (name) => {
      expect(() => parseArticle(name, file())).toThrow(/clean slug/);
    },
  );
});

describe('reading the folder', () => {
  const articles = readArticles();

  it('finds the real article files', () => {
    expect(articles.length).toBeGreaterThan(0);
  });

  it('never lists the template or any underscore file', () => {
    expect(readdirSync(ARTICLES_DIR)).toContain('_TEMPLATE.html');
    expect(articles.map((a) => a.slug)).not.toContain('_TEMPLATE');
    expect(articles.every((a) => !a.slug.startsWith('_'))).toBe(true);
  });

  it('orders newest first', () => {
    const dates = articles.map((a) => a.published);
    expect([...dates].sort().reverse()).toEqual(dates);
  });

  /* Two articles published the same day is the common case, not an edge case,
     and an unstable order would make every rebuild a diff. */
  it('breaks ties on slug so the order is total and a rebuild is stable', () => {
    expect(readArticles().map((a) => a.slug)).toEqual(articles.map((a) => a.slug));
  });

  it('reveals six at a time', () => {
    expect(ARTICLES_PER_PAGE).toBe(6);
  });
});

/**
 * THE CANONICAL AGREEMENT.
 *
 * Each article is a standalone HTML file that declares its own canonical, and
 * the sitemap is generated separately from the filename. Nothing but this test
 * makes the two agree, and when they disagree Search Console reports the whole
 * family as "alternate page with proper canonical tag" and indexes none of it.
 */
describe('every published article file', () => {
  const files = readdirSync(ARTICLES_DIR).filter(
    (f) => f.endsWith('.html') && !f.startsWith('_'),
  );

  it('there is at least one, which the Apache rules require', () => {
    // public/.htaccess rule 2 turns /articles/<anything> into a 500 when the
    // articles directory does not exist on the host.
    expect(files.length).toBeGreaterThan(0);
  });

  it.each(files)('%s declares the clean URL as its canonical', (name) => {
    const html = readFileSync(join(ARTICLES_DIR, name), 'utf8');
    const slug = name.replace(/\.html$/, '');
    const canonical = /<link rel="canonical" href="([^"]+)"/.exec(html)?.[1];
    expect(canonical).toBe(`${SITE}/articles/${slug}`);
    expect(canonical).not.toMatch(/\.html/);
  });

  it.each(files)('%s carries the head tags a SERP result needs', (name) => {
    const html = readFileSync(join(ARTICLES_DIR, name), 'utf8');
    const title = /<title>([^<]+)<\/title>/.exec(html)?.[1] ?? '';
    const description =
      /<meta name="description" content="([^"]+)"/.exec(html)?.[1] ?? '';

    expect(title).toMatch(/ \| Topcat Worktops$/);
    expect(description.length).toBeGreaterThanOrEqual(50);
    // Google truncates a description around 160 characters.
    expect(description.length).toBeLessThanOrEqual(200);
    expect(html).toMatch(/<meta name="robots" content="index, follow">/);
    expect(html).toMatch(/<meta property="og:type" content="article">/);
  });

  it.each(files)('%s has exactly one h1 and one stylesheet', (name) => {
    const html = readFileSync(join(ARTICLES_DIR, name), 'utf8');
    expect(html.match(/<h1[\s>]/g) ?? []).toHaveLength(1);
    expect(html.match(/<link rel="stylesheet"/g) ?? []).toHaveLength(1);
    // Stable URL plus a cache-busting stamp: public/.htaccess would otherwise
    // freeze this file on the visitor for a year.
    expect(html).toMatch(/\/articles\/assets\/topcat-articles\.css\?v=[0-9a-f]{10}/);
  });

  /* The parser and the file must agree about the whole headline, not a prefix
     of it. This is what would have caught the apostrophe truncation from the
     real content rather than from a fixture. */
  it.each(files)('%s card headline survives parsing intact', (name) => {
    const html = readFileSync(join(ARTICLES_DIR, name), 'utf8');
    const declared = /<meta name="article:title" content="([^"]*)"/.exec(html)?.[1];
    if (!declared) return; // optional tag
    const parsed = parseArticle(name, html);
    expect(parsed.title).toBe(declared.replace(/&amp;/g, '&'));
  });

  it.each(files)('%s sets data-tokens on the body', (name) => {
    // Without it globals.css leaves html{overflow-x:clip} standing, which makes
    // <html> the scroll container and kills every position:sticky on the page.
    const html = readFileSync(join(ARTICLES_DIR, name), 'utf8');
    expect(html).toMatch(/<body data-tokens="content">/);
  });

  it.each(files)('%s carries the Google tag exactly once', (name) => {
    const html = readFileSync(join(ARTICLES_DIR, name), 'utf8');
    expect(html.match(/AW-18420008774/g) ?? []).toHaveLength(2); // the src and the config call
    expect(html.match(/googletagmanager\.com\/gtag\/js/g) ?? []).toHaveLength(1);
  });

  it.each(files)('%s emits parseable Article and BreadcrumbList JSON-LD', (name) => {
    const html = readFileSync(join(ARTICLES_DIR, name), 'utf8');
    const block = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/.exec(html)?.[1];
    expect(block).toBeTruthy();
    const graphs = JSON.parse(block!);
    expect(graphs.map((g: { '@type': string }) => g['@type'])).toEqual([
      'Article',
      'BreadcrumbList',
    ]);
  });

  /**
   * The client's own rule, and the one most often breached by generated copy.
   *
   * Scoped to what a READER sees: scripts, styles and HTML comments are
   * stripped first. The rule is about customer-facing copy, and failing a
   * build over a dash in a developer comment would train whoever hits it to
   * stop believing the test. The head is checked separately below, because
   * the title and description are copy even though they are not visible.
   */
  it.each(files)('%s contains no em dash or en dash in its visible copy', (name) => {
    const html = readFileSync(join(ARTICLES_DIR, name), 'utf8');
    const visible = html
      .slice(html.indexOf('<body'))
      .replace(/<script[\s\S]*?<\/script>/g, '')
      .replace(/<style[\s\S]*?<\/style>/g, '')
      .replace(/<!--[\s\S]*?-->/g, '');
    expect(visible).not.toMatch(/[—–]/);
  });

  it.each(files)('%s contains no em dash or en dash in its title or description', (name) => {
    const html = readFileSync(join(ARTICLES_DIR, name), 'utf8');
    const title = /<title>([^<]*)<\/title>/.exec(html)?.[1] ?? '';
    const description = /<meta name="description" content="([^"]*)"/.exec(html)?.[1] ?? '';
    expect(title).not.toMatch(/[—–]/);
    expect(description).not.toMatch(/[—–]/);
  });
});

describe('the sitemap', () => {
  const rows = sitemap();
  const articles = readArticles();
  const urls = rows.map((r) => r.url);

  it('lists the hub without a trailing slash, matching its own canonical', () => {
    expect(urls).toContain(`${SITE}/articles`);
    expect(urls).not.toContain(`${SITE}/articles/`);
  });

  it('lists every article that is on disk', () => {
    for (const article of articles) {
      expect(urls).toContain(`${SITE}${article.url}`);
    }
  });

  /* This is the "picks new articles up automatically" requirement, and it is
     the only automated statement of it anywhere. */
  it('has exactly one row per article, so nothing is dropped or duplicated', () => {
    const rowsForArticles = urls.filter((u) => u.startsWith(`${SITE}/articles/`));
    expect(rowsForArticles).toHaveLength(articles.length);
    expect(new Set(rowsForArticles).size).toBe(articles.length);
  });

  it('never advertises a .html article URL', () => {
    expect(urls.filter((u) => u.includes('/articles/') && u.endsWith('.html'))).toHaveLength(0);
  });

  /* Stamping every article with the build time tells Search Console that all
     of them changed on every deploy, which teaches a crawler to ignore the
     dates entirely. */
  it('reports each article lastModified as its own date, not the build time', () => {
    for (const article of articles) {
      const row = rows.find((r) => r.url === `${SITE}${article.url}`)!;
      expect(new Date(row.lastModified as Date).toISOString().slice(0, 10)).toBe(
        article.published,
      );
    }
  });
});

/**
 * THE PHP TWIN.
 *
 * `public/api/articles/index.php` answers the same URL on the SiteGround host
 * that `app/api/articles/route.ts` answers on Vercel, and the listing page
 * cannot tell which replied. They are two implementations of one contract,
 * written in two languages, and nothing but this test makes them agree.
 *
 * It is not hypothetical. Both parsers were fixed for the same apostrophe bug
 * in one edit, and the PHP half went out with `\2` where it needed `\1` —
 * a backreference to itself. It returned an EMPTY LIST, every TypeScript test
 * still passed, and on the live host the hub would simply have stopped
 * picking up new articles with no error anywhere.
 *
 * Skipped, loudly, when php is not on PATH, so this does not become the test
 * that fails on someone else's machine for a reason they cannot act on.
 */
describe('the PHP twin agrees with the TypeScript reader', () => {
  const php = (() => {
    try {
      execFileSync('php', ['-v'], { stdio: 'pipe' });
      return true;
    } catch {
      return false;
    }
  })();

  it.skipIf(!php)('returns byte-identical JSON to readArticles()', () => {
    const out = execFileSync(
      'php',
      [resolve(__dirname, '../public/api/articles/index.php')],
      { encoding: 'utf8', env: { ...process.env, REQUEST_METHOD: 'GET' } },
    );

    // The CLI prints the headers this script sets, then the body.
    const body = out.slice(out.indexOf('{'));
    const fromPhp = JSON.parse(body).articles;

    const fromTs = readArticles().map(({ slug, url, title, description, published }) => ({
      slug,
      url,
      title,
      description,
      published,
    }));

    expect(fromPhp).toEqual(fromTs);
  });

  it.skipIf(!php)('has no PHP syntax error', () => {
    const out = execFileSync(
      'php',
      ['-l', resolve(__dirname, '../public/api/articles/index.php')],
      { encoding: 'utf8' },
    );
    expect(out).toMatch(/No syntax errors/);
  });
});

describe('the nav link', () => {
  it('is in PRIMARY, without a trailing slash', () => {
    const item = PRIMARY.find((l) => l.label === 'Articles');
    expect(item).toBeDefined();
    expect(item!.href).toBe('/articles');
  });

  it('sits before Contact, so Contact stays last', () => {
    const labels = PRIMARY.map((l) => l.label);
    expect(labels.indexOf('Articles')).toBe(labels.indexOf('Contact') - 1);
  });

  /**
   * PRIMARY IS NOT WHAT RENDERS. SiteHeader and MobileNav hard-code the links
   * as JSX, so an edit to PRIMARY alone changes nothing on screen and an edit
   * to the JSX alone leaves PRIMARY stale. Nothing else in the suite couples
   * the three, so this reads the two components as text.
   */
  it.each([
    'src/components/chrome/SiteHeader.tsx',
    'src/components/chrome/MobileNav.tsx',
  ])('is actually rendered by %s', (component) => {
    const source = readFileSync(resolve(__dirname, '..', component), 'utf8');
    expect(source).toContain('<a href="/articles">Articles</a>');
  });
});

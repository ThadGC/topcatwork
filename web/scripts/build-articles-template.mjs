/**
 * build-articles-template.mjs
 *
 * Writes `public/articles/_TEMPLATE.html` — the file an author copies to start
 * a new article — and keeps the site chrome inside every existing article in
 * step with the React components.
 *
 * ---------------------------------------------------------------------------
 * WHY THE TEMPLATE IS GENERATED RATHER THAN HAND-WRITTEN
 * ---------------------------------------------------------------------------
 * An article is a STANDALONE HTML file. Apache serves it straight off disk and
 * React never touches it, so its header, mobile sheet, sticky bar and footer
 * are a FROZEN COPY of what <SiteHeader> and <SiteFooter> rendered on the day
 * it was written. That copy is the one real weakness of the whole approach:
 * the next time the chrome changes, every article silently disagrees with the
 * rest of the site and nothing in the build says so.
 *
 * So the chrome is never typed by hand. It is lifted out of a REAL BUILT PAGE
 * — `.next/server/app/guides/<slug>.html`, a lite content page, the same
 * archetype an article is — and pasted between markers. When the chrome
 * changes: rebuild, run this with `--sync`, and every article is current
 * again in one command. `--check` fails if any of them has drifted, which is
 * what makes the drift visible instead of invisible.
 *
 * ⛔ THE SOURCE IS THE BUILT REACT OUTPUT, NEVER THE LEGACY SITE. The old
 * vanilla build's inner pages carry a FLAT seven-link nav; the React chrome
 * ships two dropdowns (`.nav-item` / `.nav-menu` / `.nav-caret`) plus
 * `.formed`, `.nav-menu-sep`, `.nav-menu-all` and `.foot-cv-ico`, none of
 * which exist in the legacy stylesheets. Copying the arbiter's markup here
 * produces a page that renders — with a header that does not match the site.
 *
 * ---------------------------------------------------------------------------
 * MODES
 * ---------------------------------------------------------------------------
 *   (none)     rewrite public/articles/_TEMPLATE.html from the current build
 *   --sync     …and refresh the chrome + stylesheet stamp inside every article
 *   --check    change nothing; exit 1 if the template or any article is stale
 *
 * Run: pnpm run articles:template
 *      pnpm run articles:template -- --sync
 *      pnpm run articles:template -- --check
 *
 * ⚠️ NEEDS A BUILD FIRST. It reads `.next/server/app/guides/`, so run
 * `next build` before this or it will tell you the source is missing.
 */
import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const WEB = resolve(HERE, '..');
const BUILT_GUIDES = resolve(WEB, '.next/server/app/guides');
const ARTICLES = resolve(WEB, 'public/articles');
const TEMPLATE = join(ARTICLES, '_TEMPLATE.html');
const VERSION = join(ARTICLES, 'assets/version.json');

const SITE = 'https://www.topcatworktops.co.uk';

/* The blocks --sync replaces. Each is delimited in the emitted HTML so the
   author's own copy between them is never touched. */
const BLOCKS = ['HEADER', 'MOBILENAV', 'MBAR', 'FOOTER', 'SCRIPTS'];

const open = (name) => `<!--TOPCAT:${name}-->`;
const close = (name) => `<!--/TOPCAT:${name}-->`;

/* -------------------------------------------------------------------------
   Lifting the chrome out of a built page
   ------------------------------------------------------------------------- */

/** Balanced-tag cut, so a nested <div> inside the footer cannot end it early. */
function cut(html, startPattern, tag) {
  const start = new RegExp(startPattern).exec(html);
  if (!start) throw new Error(`could not find ${startPattern} in the built page`);
  const from = start.index;
  const tags = new RegExp(`<(/?)${tag}(\\s[^>]*)?>`, 'g');
  tags.lastIndex = from;
  let depth = 0;
  for (let m = tags.exec(html); m; m = tags.exec(html)) {
    depth += m[1] === '/' ? -1 : 1;
    if (depth === 0) return html.slice(from, m.index + m[0].length);
  }
  throw new Error(`unbalanced <${tag}> while cutting the chrome`);
}

function readChrome() {
  if (!existsSync(BUILT_GUIDES)) {
    throw new Error(
      `${BUILT_GUIDES} does not exist. Run \`next build\` first — this script ` +
        'lifts the chrome out of a real built page rather than duplicating it.',
    );
  }
  const page = readdirSync(BUILT_GUIDES)
    .filter((f) => f.endsWith('.html'))
    .sort()[0];
  if (!page) throw new Error(`no built guide pages in ${BUILT_GUIDES}`);

  const html = readFileSync(join(BUILT_GUIDES, page), 'utf8');
  const chrome = {
    SCRIPTS: CHROME_JS,
    HEADER: cut(html, '<header class="bar[^"]*"', 'header'),
    MOBILENAV: cut(html, '<nav class="mobile-nav"', 'nav'),
    MBAR: cut(html, '<div class="mbar"', 'div'),
    FOOTER: cut(html, '<footer class="site"', 'footer'),
  };

  /* A guarantee worth having: the chrome we lift must contain the Articles
     link, or the template would ship a nav that is missing its own section. */
  if (!chrome.HEADER.includes('/articles')) {
    throw new Error('the built header has no /articles link — rebuild after the nav change');
  }
  return { chrome, source: `guides/${page}` };
}

function cssStamp() {
  try {
    return JSON.parse(readFileSync(VERSION, 'utf8')).css;
  } catch {
    throw new Error(
      'public/articles/assets/version.json is missing. Run `pnpm run articles:css` first.',
    );
  }
}

/* -------------------------------------------------------------------------
   The four chrome behaviours, as vanilla JS
   -------------------------------------------------------------------------
   The React chrome gets these from hooks. A standalone page has no React, so
   they are inlined — lifted from the legacy build, where they have run on all
   178 pages for months, and matched to the React DOM (same ids: navBurger,
   mobileNav, mobileBar, footTail).

   The two dropdowns need NO script: chrome.css opens them on `.nav-item:hover`
   and `.nav-item:focus-within`. That is why there are four here and not five.
   ------------------------------------------------------------------------- */
const CHROME_JS = `<script>
/* 1. the burger, the sheet, and the two collapsible sub-panels */
(function(){var b=document.getElementById('navBurger'),s=document.getElementById('mobileNav');if(!b||!s)return;function o(v){document.documentElement.classList.toggle('nav-open',v);b.setAttribute('aria-expanded',v);b.setAttribute('aria-label',v?'Close menu':'Open menu');if(!v)c();}b.addEventListener('click',function(){o(!document.documentElement.classList.contains('nav-open'));});s.addEventListener('click',function(e){if(e.target.closest('a'))o(false);});window.addEventListener('keydown',function(e){if(e.key==='Escape')o(false);});s.addEventListener('click',function(e){var t=e.target.closest('.mn-toggle');if(!t)return;var p=document.getElementById(t.getAttribute('aria-controls'));if(!p)return;var open=!p.classList.contains('open');c();if(open){p.classList.add('open');p.style.maxHeight=p.scrollHeight+'px';t.setAttribute('aria-expanded','true');}});function c(){s.querySelectorAll('.mn-sub').forEach(function(p){p.classList.remove('open');p.style.maxHeight='';});s.querySelectorAll('.mn-toggle').forEach(function(x){x.setAttribute('aria-expanded','false');});}})();
/* 2. the sticky contact bar is always on for a content page */
(function(){var b=document.getElementById('mobileBar');if(!b)return;document.documentElement.classList.add('bar-always');b.classList.add('on');})();
/* 3. the footer's area/hours pair moves into .foot-tail at the wide reading */
(function(){var f=document.querySelector('#footer'),t=document.getElementById('footTail'),c=document.querySelector('.foot-contact'),a=document.querySelector('.foot-c-area'),h=document.querySelector('.foot-c-hours');if(!f||!t||!c||!a||!h)return;function p(){var on=getComputedStyle(f).getPropertyValue('--footTail').trim()==='on',host=on?t:c;if(a.parentElement!==host){host.appendChild(a);host.appendChild(h);}}p();window.addEventListener('resize',p,{passive:true});})();
/* 4. .scrolled latches at 12px, the lite threshold, not the rich bar's 40 */
(function(){var bar=document.querySelector('header.bar'),on=false;function s(){var y=window.scrollY>12;if(y!==on){on=y;bar.classList.toggle('scrolled',y);}}if(bar){s();window.addEventListener('scroll',s,{passive:true});}})();
</script>`;

/* -------------------------------------------------------------------------
   The template
   ------------------------------------------------------------------------- */

function buildTemplate(chrome, stamp, source) {
  const block = (name) => `${open(name)}${chrome[name]}${close(name)}`;

  return `<!DOCTYPE html>
<!--
  ===========================================================================
  TOPCAT WORKTOPS — ARTICLE TEMPLATE
  ===========================================================================
  Copy this file, rename it to the slug you want in the URL, and fill in the
  seven placeholders below. Drop it in public/articles/ and it is live.

    granite-vs-quartz-worktops.html  ->  /articles/granite-vs-quartz-worktops

  THE FILENAME IS THE URL. Lowercase letters, digits and single hyphens only;
  no spaces, no underscores, no capitals. The build refuses anything else
  rather than publishing a broken link.

  ---------------------------------------------------------------------------
  THE SEVEN PLACEHOLDERS
  ---------------------------------------------------------------------------
    {{SLUG}}          the filename without .html, used in the canonical and
                      the structured data. It must MATCH the filename.
    {{TITLE}}         the <title>, WRITTEN FOR THE SEARCH RESULT. End it with
                      " | Topcat Worktops", as every page on the site does.
                      ⛔ KEEP THE WHOLE THING UNDER ABOUT 60 CHARACTERS, which
                      means roughly 42 before the suffix. Google cuts the tail
                      off anything longer, and the tail is the brand name. The
                      site's own 160 pages have a median title of 49
                      characters, so a 75-character one is the odd page out.
                      Front-load the words someone would actually type.
    {{DESCRIPTION}}   the meta description AND the excerpt on /articles.
                      One or two sentences, 120-158 characters. Written for a
                      person, not for a crawler. It is the only body copy the
                      listing shows, so it has to stand alone.
    {{HEADLINE}}      the visible <h1>, and the headline on the /articles card.
                      Exactly one h1 per page.

                      IT DOES NOT HAVE TO MATCH {{TITLE}}, and usually should
                      not. {{TITLE}} is squeezed to fit a search result;
                      {{HEADLINE}} is what a reader sees, so it can be longer
                      and say the whole thing. "How to clean a quartz worktop"
                      in the title, "How to clean a quartz worktop, and what to
                      keep off it" on the page.

                      ⚠️ When the two differ you MUST add the meta tag below,
                      or the listing card falls back to the shortened title:
                        <meta name="article:title" content="{{HEADLINE}}">
                      It is already in the head of this template.
    {{PUBLISHED}}     YYYY-MM-DD. THIS IS WHAT ORDERS THE LISTING, newest
                      first, and what the sitemap reports as lastmod.
    {{UPDATED}}       YYYY-MM-DD. The same as {{PUBLISHED}} on a new piece.
                      Machine-readable, for the meta tag and the JSON-LD.
    {{UPDATED_LONG}}  the SAME DATE written the way a reader sees it, with no
                      ordinal: "25 August 2026", not "25th" and not
                      "2026-08-25". It appears in the byline, and the nine
                      /guides/ pages have used this exact form for months.
    {{BODY}}          the article itself. See the note above <main>.

  ---------------------------------------------------------------------------
  THINGS THAT ARE NOT OPTIONAL
  ---------------------------------------------------------------------------
  - <body data-tokens="content"> — WITHOUT IT THE PAGE BREAKS SUBTLY.
    globals.css only relaxes html{overflow-x:clip} when this attribute is
    present, and while it is clipped the <html> element becomes the scroll
    container, which kills every position:sticky on the page. The colours
    still look right, which is what makes it easy to miss.
  - The chrome between the TOPCAT:* markers is GENERATED. Do not edit it by
    hand: run \`pnpm run articles:template -- --sync\` and it is refreshed in
    every article at once from the real components.
  - The stylesheet's ?v= stamp is generated too. The live host caches CSS as
    immutable for a year, so the stamp is the only way a change ever reaches
    a returning visitor.
  - The Google tag must appear exactly once on every page. It is already here.

  ---------------------------------------------------------------------------
  HOUSE COPY RULES — these are the client's and they are not negotiable
  ---------------------------------------------------------------------------
  - Fabrication is IN-HOUSE. "our experienced fabricators", never a third party.
  - Sell on value, never on being cheap. There is no showroom.
  - The Google rating may be shown as 5.0. NEVER show the number of reviews.
  - Never name a supplier or a stone brand in customer-facing copy.
  - Marble, quartzite and granite are POA. Do not quote a price for them.
  - NO EM DASHES AND NO EN DASHES anywhere in customer-facing copy.

  Chrome lifted from ${source} — regenerate with \`pnpm run articles:template\`.
  ===========================================================================
-->
<html lang="en-GB">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">

<!-- Google tag (gtag.js). Exactly one per page, immediately after <head>. -->
<script async src="https://www.googletagmanager.com/gtag/js?id=AW-18420008774"></script>
<script>
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'AW-18420008774');
</script>

<title>{{TITLE}}</title>
<meta name="description" content="{{DESCRIPTION}}">
<link rel="canonical" href="${SITE}/articles/{{SLUG}}">
<meta name="robots" content="index, follow">

<!-- Read by the listing page and the sitemap.

     article:title  the headline the /articles card shows. Set it whenever the
                    title tag above is a shortened, search-shaped version of
                    the real headline, which is the normal case. Without it the
                    card falls back to the title tag minus the site suffix.
     article:published  ORDERS THE LISTING, newest first, and is the sitemap's
                    lastmod. Get it wrong and the piece lands in the wrong
                    place in the grid. -->
<meta name="article:title" content="{{HEADLINE}}">
<meta name="article:published" content="{{PUBLISHED}}">
<meta name="article:modified" content="{{UPDATED}}">

<meta property="og:type" content="article">
<meta property="og:title" content="{{TITLE}}">
<meta property="og:description" content="{{DESCRIPTION}}">
<meta property="og:url" content="${SITE}/articles/{{SLUG}}">
<meta property="og:site_name" content="Topcat Worktops">
<meta property="og:image" content="${SITE}/assets/site/og-cover.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">

<link rel="icon" type="image/svg+xml" href="/assets/brand/favicon.svg">
<link rel="preload" as="font" type="font/woff2" href="/assets/fonts/cinzel-latin-var.woff2" crossorigin>
<link rel="preload" as="font" type="font/woff2" href="/assets/fonts/montserrat-latin-var.woff2" crossorigin>
<link rel="stylesheet" href="/articles/assets/topcat-articles.css?v=${stamp}">

<script type="application/ld+json">
[
 {
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "{{HEADLINE}}",
  "description": "{{DESCRIPTION}}",
  "mainEntityOfPage": {
   "@type": "WebPage",
   "@id": "${SITE}/articles/{{SLUG}}"
  },
  "author": {
   "@type": "Person",
   "name": "Nick",
   "jobTitle": "Managing Director, Topcat Worktops",
   "url": "${SITE}/about/"
  },
  "publisher": {
   "@type": "Organization",
   "name": "Topcat Worktops Ltd"
  },
  "datePublished": "{{PUBLISHED}}",
  "dateModified": "{{UPDATED}}"
 },
 {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
   {"@type": "ListItem", "position": 1, "name": "Home", "item": "${SITE}/index.html#hero"},
   {"@type": "ListItem", "position": 2, "name": "Articles", "item": "${SITE}/articles"},
   {"@type": "ListItem", "position": 3, "name": "{{HEADLINE}}", "item": "${SITE}/articles/{{SLUG}}"}
  ]
 }
]
</script>
</head>

<body data-tokens="content">

${block('HEADER')}

${block('MOBILENAV')}

<nav class="crumb" aria-label="Breadcrumb">
  <a class="crumb-back" href="/articles" aria-label="Back to Articles">
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <defs><linearGradient id="backGold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#C6A664"></stop><stop offset=".5" stop-color="#E4CD92"></stop><stop offset="1" stop-color="#C6A664"></stop></linearGradient></defs>
      <path d="M15 18l-6-6 6-6" stroke="url(#backGold)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"></path>
    </svg>
  </a>
  <ol>
    <li><a href="/index.html#hero">Home</a></li>
    <li><a href="/articles">Articles</a></li>
    <li aria-current="page">{{HEADLINE}}</li>
  </ol>
</nav>

<!--
  {{BODY}} — THE ARTICLE.

  The furniture below is the same the nine /guides/ pages use, so an article
  reads as part of the site without any new CSS:

    <section class="block"><div class="wrap"> …  one band of content
    <h1> … </h1>                                 exactly one, the headline
    <p class="byline">                           author line + review date
    <div class="prose lead-answer">              the opening answer, gold rule
    <div class="prose">                          ordinary body copy
    <h2> … </h2>                                 every section heading
    <em>word</em>                                paints one word gold
    <div class="tbl-wrap"><table class="tbl">    a comparison table that
                                                 scrolls on a phone
    <section class="faq">                        <details>/<summary> accordion
    <div class="cta-row">                        .btn-gold / .btn-ghost

  Keep to ONE h1 and use h2 for every section: these pages rank on the
  heading spine. Do not invent FAQPage structured data even if you add a FAQ
  accordion; the site deliberately does not emit it.
-->
<main>
  <article>

    <section class="block">
      <div class="wrap">
        <h1>{{HEADLINE}}</h1>
        <p class="byline">Written by Nick, Managing Director, Topcat Worktops.
       <span class="reviewed">Last reviewed {{UPDATED_LONG}}</span></p>
        <div class="prose lead-answer">
          <p>{{BODY}}</p>
        </div>
      </div>
    </section>

    <section class="block">
      <div class="wrap">
        <h2>A section <em>heading</em></h2>
        <div class="prose">
          <p>Replace this section, and add as many more like it as the piece needs.</p>
        </div>
      </div>
    </section>

    <section class="block">
      <div class="wrap">
        <h2>Talk it through with someone who fits them</h2>
        <div class="prose">
          <p>We measure, fabricate in house and fit, so one team answers for the whole job. The home visit is free and there is no obligation.</p>
        </div>
        <div class="cta-row">
          <a class="btn-gold" href="/contact/">Get a free quote</a>
          <a class="btn-ghost" href="/articles">More articles</a>
        </div>
      </div>
    </section>

  </article>
</main>

${block('MBAR')}

${block('FOOTER')}

${open('SCRIPTS')}${CHROME_JS}${close('SCRIPTS')}
</body>
</html>
`;
}

/* -------------------------------------------------------------------------
   Sync + check
   ------------------------------------------------------------------------- */

function articleFiles() {
  if (!existsSync(ARTICLES)) return [];
  return readdirSync(ARTICLES)
    .filter((f) => f.endsWith('.html') && !/^[._]/.test(f))
    .sort();
}

/** Replace each marked chrome block, and the stylesheet stamp, in one file. */
function refresh(html, chrome, stamp) {
  let out = html;
  /* The four behaviours are chrome too, and they were the one part of it that
     `--sync` could not reach before they were wrapped in markers. */
  chrome = { ...chrome, SCRIPTS: CHROME_JS };
  for (const name of BLOCKS) {
    const re = new RegExp(`${open(name)}[\\s\\S]*?${close(name)}`);
    if (!re.test(out)) continue;
    out = out.replace(re, `${open(name)}${chrome[name]}${close(name)}`);
  }
  return out.replace(
    /(href="\/articles\/assets\/topcat-articles\.css\?v=)[^"]*(")/,
    `$1${stamp}$2`,
  );
}

function main() {
  const mode = process.argv.includes('--check')
    ? 'check'
    : process.argv.includes('--sync')
      ? 'sync'
      : 'template';

  const { chrome, source } = readChrome();
  const stamp = cssStamp();
  const template = buildTemplate(chrome, stamp, source);

  const stale = [];

  if (mode === 'check') {
    if (!existsSync(TEMPLATE) || readFileSync(TEMPLATE, 'utf8') !== template) {
      stale.push('_TEMPLATE.html');
    }
  } else {
    writeFileSync(TEMPLATE, template, 'utf8');
    console.log(`  wrote public/articles/_TEMPLATE.html   (chrome from ${source}, css ${stamp})`);
  }

  if (mode !== 'template') {
    for (const file of articleFiles()) {
      const path = join(ARTICLES, file);
      const before = readFileSync(path, 'utf8');
      const after = refresh(before, chrome, stamp);
      if (before === after) continue;
      if (mode === 'check') stale.push(file);
      else {
        writeFileSync(path, after, 'utf8');
        console.log(`  refreshed ${file}`);
      }
    }
  }

  if (mode === 'check') {
    if (stale.length) {
      console.error(
        '\n  STALE — the chrome or the stylesheet stamp has moved on:\n' +
          stale.map((f) => `    ${f}`).join('\n') +
          '\n\n  Fix with: pnpm run articles:template -- --sync\n',
      );
      process.exit(1);
    }
    console.log('  articles are in step with the chrome and the stylesheet.');
  }
}

try {
  main();
} catch (err) {
  console.error(`\n  ${err.message}\n`);
  process.exit(1);
}

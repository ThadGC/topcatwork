/**
 * build-articles-css.mjs
 *
 * Emits `public/articles/assets/topcat-articles.css` — ONE flat, stable
 * stylesheet that a standalone article HTML file can <link> and get exactly
 * the styling a React page gets.
 *
 * WHY THIS EXISTS
 * ---------------
 * Article pages are hand-dropped, self-contained HTML files (see
 * public/articles/_TEMPLATE.html). They are served straight off disk by Apache
 * on SiteGround and by Next's public/ handler on Vercel — React never renders
 * them, so they cannot import a CSS module.
 *
 * They also cannot link Next's own output. Next compiles CSS to content-hashed
 * URLs under `/_next/static/css/<hash>.css`, and the hash changes on every
 * build. A hand-written <link> to one would break at the next deploy. This
 * file's URL never changes, which is the whole point.
 *
 * WHAT GOES IN, AND IN WHAT ORDER
 * -------------------------------
 * The exact cascade a /guides/ page loads, which is the archetype the article
 * template copies:
 *
 *   1  src/app/globals.css            root layout, via postcss (see below)
 *   2  src/components/chrome/chrome.css   root layout, after globals
 *   3  src/styles/content.css         guides/layout.tsx
 *   4  src/styles/seo.css             guides/layout.tsx — MUST come after
 *                                     content.css; both declare `.cta-note`
 *                                     and seo.css is the one that wins live.
 *
 * ⛔ THE ORDER IS LOAD-BEARING, and it is the React load order, not the legacy
 * one. globals.css puts its reset in `@layer base`, which is what lets the
 * three unlayered sheets below win over it without a single !important. Concat
 * them in any other order and the chrome restyles itself.
 *
 * WHY globals.css NEEDS POSTCSS AND THE OTHER THREE DO NOT
 * -------------------------------------------------------
 * Only globals.css carries Tailwind v4 wiring — `@layer theme, base, …`,
 * `@import 'tailwindcss/theme.css'`, `@config '../../tailwind.config.ts'`.
 * Those must be resolved by @tailwindcss/postcss or the browser sees bare
 * @import lines it cannot fetch. chrome.css, content.css and seo.css were
 * checked and contain no Tailwind directives at all, so they are copied
 * byte-for-byte — this script never rewrites a declaration.
 *
 * Tailwind's content detection is OFF in globals.css (`source(none)` on the
 * utilities import), so the utilities layer is empty and the output is
 * deterministic: it is the theme tokens, the site's own reset and the site's
 * own rules, nothing scanned or guessed.
 *
 * ⚠️ THIS FILE IS GENERATED AND COMMITTED. It does NOT run as part of
 * `next build`, deliberately — wiring it into the build would change an
 * existing command. If you edit globals.css, chrome.css, content.css or
 * seo.css, re-run `pnpm run articles:css` and commit the result, or the
 * articles will keep rendering the previous revision of the site's styling.
 *
 * ⚠️ CACHING. public/.htaccess sets `immutable, max-age=31536000` on every
 * `.css` — correct for Next's hashed output, WRONG for this file, whose URL is
 * deliberately stable. The .htaccess carries an override for
 * `/articles/assets/` that drops it to an hour. Do not remove it.
 *
 * Run: pnpm run articles:css
 */
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import postcss from 'postcss';
import tailwind from '@tailwindcss/postcss';

const HERE = dirname(fileURLToPath(import.meta.url));
const WEB = resolve(HERE, '..');

const GLOBALS = resolve(WEB, 'src/app/globals.css');

/** Copied verbatim, in React's own cascade order, after globals.css. */
const RAW = [
  'src/components/chrome/chrome.css',
  'src/styles/content.css',
  'src/styles/seo.css',
];

const OUT = resolve(WEB, 'public/articles/assets/topcat-articles.css');

/**
 * The stamp the <link> in every article carries as `?v=`.
 *
 * ⛔ NOT COSMETIC. public/.htaccess marks EVERY `.css` on the host
 * `immutable, max-age=31536000` — right for Next's content-hashed output,
 * catastrophic for a URL chosen to be stable. Without a stamp, the first
 * version a visitor downloads is the version they keep for a year and the
 * only cure is renaming the file, which destroys the stability the whole
 * approach exists for. scripts/build-articles-template.mjs reads this file
 * and writes the stamp into the template and into every article.
 */
const VERSION = resolve(WEB, 'public/articles/assets/version.json');

const banner = (title) => `\n/* ${'='.repeat(74)}\n   ${title}\n   ${'='.repeat(74)} */\n`;

async function main() {
  /* `from` is what lets @config and the relative @imports inside globals.css
     resolve; without it postcss has no base directory and Tailwind throws. */
  const compiled = await postcss([tailwind()]).process(readFileSync(GLOBALS, 'utf8'), {
    from: GLOBALS,
    to: OUT,
  });

  for (const warning of compiled.warnings()) {
    console.warn(`  ⚠️  ${warning.toString()}`);
  }

  const parts = [
    '/* GENERATED by scripts/build-articles-css.mjs — do not edit by hand.',
    '   Re-run `pnpm run articles:css` after touching any source sheet. */',
    banner('1. src/app/globals.css (compiled through @tailwindcss/postcss)'),
    compiled.css,
  ];

  for (const rel of RAW) {
    const css = readFileSync(resolve(WEB, rel), 'utf8');
    parts.push(banner(`${RAW.indexOf(rel) + 2}. ${rel} (verbatim)`), css);
  }

  const out = parts.join('\n');
  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, out, 'utf8');

  const hash = createHash('sha256').update(out).digest('hex').slice(0, 10);
  writeFileSync(VERSION, `${JSON.stringify({ css: hash }, null, 2)}\n`, 'utf8');

  const kb = (n) => `${(n / 1024).toFixed(1)}kB`;
  console.log(`  globals.css  -> ${kb(compiled.css.length)} compiled`);
  for (const rel of RAW) {
    console.log(`  ${rel.padEnd(34)} -> ${kb(readFileSync(resolve(WEB, rel), 'utf8').length)}`);
  }
  console.log(`\n  wrote public/articles/assets/topcat-articles.css  (${kb(out.length)})`);
  console.log(`  wrote public/articles/assets/version.json          (css ${hash})`);
  console.log('\n  Re-run `pnpm run articles:template -- --sync` to stamp it into the articles.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

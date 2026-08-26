#!/usr/bin/env node
/**
 * Post-export: give the hub routes their directory URLs back.
 *
 * ---------------------------------------------------------------------------
 * THE PROBLEM
 * ---------------------------------------------------------------------------
 * The legacy site mixes two URL shapes and `output: 'export'` cannot emit both
 * under one `trailingSlash` setting:
 *
 *   directory   /, /about/, /stones/, /worktops/essex/, /worktops/essex/harlow/
 *   .html leaf  /stones/<slug>.html, /services/<slug>.html, /guides/<slug>.html,
 *               /materials/<slug>.html, /stones/compare.html, /sitemap.html
 *
 * 149 of the 178 URLs are `.html` leaves — the 132 stone pages alone decide it —
 * so next.config.ts sets `trailingSlash: false`. That is exactly right for the
 * leaves: `app/stones/[slug]/page.tsx` exports straight to
 * `out/stones/<slug>.html`, the legacy URL, with the legacy canonical, and no
 * redirect anywhere.
 *
 * The cost is the ~19 hub routes. `app/stones/page.tsx` exports to
 * `out/stones.html`, and Apache would 404 on `/stones/`.
 *
 * ---------------------------------------------------------------------------
 * THE FIX
 * ---------------------------------------------------------------------------
 * Copy each hub's `<name>.html` to `<name>/index.html`. Both files coexist on
 * disk — `stones.html` sits beside the `stones/` directory that holds the 132
 * leaves — so both URLs resolve, mod_dir serves the index for the directory
 * form, and the canonical in the <head> keeps pointing at the directory URL.
 * No .htaccess rewrite, no redirect, and send.php is untouched.
 *
 * ---------------------------------------------------------------------------
 * WHERE THE LIST COMES FROM
 * ---------------------------------------------------------------------------
 * Not hand-maintained. Every extracted page record carries the legacy `url`,
 * so any url ending in `/` is by definition a directory URL. That is scanned
 * out of src/data/*.json, which means new counties and towns are picked up for
 * free as those archetypes land. EXTRA_HUBS below covers only the handful of
 * pages that have no data file of their own.
 *
 * ---------------------------------------------------------------------------
 * THE SECOND JOB: <html lang>
 * ---------------------------------------------------------------------------
 * The live site serves `lang="en-GB"` on 177 of its 178 pages and `lang="en"`
 * on the home page alone. App Router has exactly one root layout and a page
 * cannot reach the <html> element, so src/app/layout.tsx renders the majority
 * value, `en-GB`, and the handful of pages that disagree are corrected here.
 *
 * Same rule as the hub list: not hand-maintained where the data can say it.
 * Every extracted record carries `seo.lang` beside `seo.canonical`, so any
 * record whose lang differs from the layout's is picked up automatically.
 * LANG_OVERRIDES below covers only pages with no data file of their own —
 * today that is `/` and nothing else.
 *
 * Idempotent: re-running is a no-op. Routes that do not exist yet are reported
 * as `pending` and skipped, so this is safe to run against a partial port.
 *
 * Usage:  node scripts/postexport.mjs [--out <dir>] [--quiet]
 */
import {
  existsSync, mkdirSync, copyFileSync, readdirSync, readFileSync, writeFileSync,
} from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const WEB = resolve(HERE, '..');

/**
 * Directory URLs with no extracted data file behind them. `/` is not here: the
 * root route already exports to out/index.html under either setting.
 */
const EXTRA_HUBS = [
  '/about/',
  '/contact/',
  '/estimate/',
  '/projects/',
  '/services/',
  '/trade/',
  '/privacy/',
  '/terms/',
];

/**
 * The `lang` src/app/layout.tsx hard-codes on <html>. Anything that matches it
 * needs no rewrite; anything that does not is corrected in `applyLang`. Keep
 * this in sync with the layout — the check below fails loudly if it drifts.
 */
const ROOT_LANG = 'en-GB';

/**
 * Legacy URL -> `<html lang>` for pages with no extracted data record. The
 * home page is the site's only genuine `en`; the other eight data-less pages
 * (/about/ /contact/ /estimate/ /projects/ /privacy/ /terms/ /trade/
 * /sitemap.html) are all `en-GB` and therefore need no entry.
 */
const LANG_OVERRIDES = {
  '/': 'en',
};

/** Walk any JSON shape and collect every string under a `url` key. */
function collectUrls(node, into) {
  if (Array.isArray(node)) {
    for (const child of node) collectUrls(child, into);
    return into;
  }
  if (node && typeof node === 'object') {
    for (const [key, value] of Object.entries(node)) {
      if (key === 'url' && typeof value === 'string') into.add(value);
      else collectUrls(value, into);
    }
  }
  return into;
}

function directoryUrls(dataDir) {
  const urls = new Set(EXTRA_HUBS);
  if (existsSync(dataDir)) {
    for (const file of readdirSync(dataDir)) {
      if (!file.endsWith('.json')) continue;
      const found = collectUrls(
        JSON.parse(readFileSync(join(dataDir, file), 'utf8')),
        new Set(),
      );
      for (const url of found) {
        // Site-relative, ends in a slash, and is not the root.
        if (url.startsWith('/') && url.endsWith('/') && url !== '/') urls.add(url);
      }
    }
  }
  return [...urls].sort();
}

/**
 * Walk any JSON shape and collect `{ url, lang }` for every record that has an
 * `seo` block carrying both. That is where the extractor puts the value.
 */
function collectLangs(node, into) {
  if (Array.isArray(node)) {
    for (const child of node) collectLangs(child, into);
    return into;
  }
  if (node && typeof node === 'object') {
    const { url, seo } = node;
    if (typeof url === 'string' && seo && typeof seo === 'object'
        && typeof seo.lang === 'string') {
      into.set(url, seo.lang);
    }
    for (const value of Object.values(node)) collectLangs(value, into);
  }
  return into;
}

/** Every legacy URL whose `<html lang>` is not ROOT_LANG, from data + overrides. */
function langExceptions(dataDir) {
  const langs = new Map();
  if (existsSync(dataDir)) {
    for (const file of readdirSync(dataDir)) {
      if (!file.endsWith('.json')) continue;
      collectLangs(
        JSON.parse(readFileSync(join(dataDir, file), 'utf8')),
        langs,
      );
    }
  }
  for (const [url, lang] of Object.entries(LANG_OVERRIDES)) langs.set(url, lang);

  const out = new Map();
  for (const [url, lang] of langs) {
    if (lang !== ROOT_LANG) out.set(url, lang);
  }
  return out;
}

/**
 * The emitted file(s) for a legacy URL. A directory URL has two after the copy
 * pass above — `<name>.html` and `<name>/index.html` — and both are served, so
 * both are rewritten.
 */
function emittedFor(outDir, url) {
  if (url === '/') return [join(outDir, 'index.html')];
  if (url.endsWith('/')) {
    const rel = url.slice(1, -1);
    return [join(outDir, `${rel}.html`), join(outDir, rel, 'index.html')];
  }
  return [join(outDir, url.slice(1))];
}

const HTML_LANG = /(<html[^>]*?\slang=")([^"]*)(")/;

/**
 * Rewrite `<html lang>` on the pages that disagree with the root layout.
 * Returns { changed, already, missing } as arrays of file paths.
 */
function applyLang(outDir, exceptions) {
  const changed = [];
  const already = [];
  const missing = [];

  for (const [url, lang] of exceptions) {
    for (const file of emittedFor(outDir, url)) {
      if (!existsSync(file)) {
        missing.push(file);
        continue;
      }
      const html = readFileSync(file, 'utf8');
      const match = HTML_LANG.exec(html);
      if (!match) {
        // No <html lang> at all is a real regression in the layout, not a
        // no-op — say so rather than exiting 0 on a broken export.
        console.error(`postexport: no <html lang> in ${file}`);
        process.exitCode = 1;
        continue;
      }
      if (match[2] === lang) {
        already.push(file);
        continue;
      }
      if (match[2] !== ROOT_LANG) {
        // The layout no longer renders what ROOT_LANG claims. Rewriting on top
        // of that would paper over the drift, so stop.
        console.error(
          `postexport: ${file} has lang="${match[2]}", expected the layout's ` +
            `"${ROOT_LANG}" — update ROOT_LANG to match src/app/layout.tsx.`,
        );
        process.exitCode = 1;
        continue;
      }
      writeFileSync(file, html.replace(HTML_LANG, `$1${lang}$3`));
      changed.push(file);
    }
  }
  return { changed, already, missing };
}

function main() {
  const args = process.argv.slice(2);
  const outIndex = args.indexOf('--out');
  const outDir = resolve(outIndex > -1 ? args[outIndex + 1] : join(WEB, 'out'));
  const quiet = args.includes('--quiet');

  if (!existsSync(outDir)) {
    console.error(`postexport: no export at ${outDir} — run \`next build\` first.`);
    process.exit(1);
  }

  const hubs = directoryUrls(join(WEB, 'src', 'data'));
  const copied = [];
  const already = [];
  const pending = [];

  for (const url of hubs) {
    const rel = url.slice(1, -1); // '/stones/' -> 'stones'
    const flat = join(outDir, `${rel}.html`);
    const nested = join(outDir, rel, 'index.html');

    if (!existsSync(flat)) {
      // Either the route has not been built yet, or Next already emitted the
      // directory form (which is what happens for a route whose only child is
      // dynamic). Both are fine.
      (existsSync(nested) ? already : pending).push(url);
      continue;
    }
    if (existsSync(nested)) {
      already.push(url);
      continue;
    }
    mkdirSync(dirname(nested), { recursive: true });
    copyFileSync(flat, nested);
    copied.push(url);
  }

  if (!quiet) {
    console.log(`postexport: ${outDir}`);
    console.log(
      `  ${copied.length} directory URL(s) created, ` +
        `${already.length} already present, ${pending.length} not built yet`,
    );
    for (const url of copied) console.log(`    + ${url}`);
    if (pending.length) {
      console.log(`  pending (route not in this build):`);
      for (const url of pending) console.log(`    · ${url}`);
    }
  }

  const lang = applyLang(outDir, langExceptions(join(WEB, 'src', 'data')));
  if (!quiet) {
    console.log(
      `  <html lang>: ${lang.changed.length} rewritten, ` +
        `${lang.already.length} already correct, ` +
        `${lang.missing.length} not built yet ` +
        `(layout renders "${ROOT_LANG}")`,
    );
    for (const file of lang.changed) console.log(`    ~ ${file}`);
  }
}

main();

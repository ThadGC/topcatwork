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
 * Idempotent: re-running is a no-op. Routes that do not exist yet are reported
 * as `pending` and skipped, so this is safe to run against a partial port.
 *
 * Usage:  node scripts/postexport.mjs [--out <dir>] [--quiet]
 */
import { existsSync, mkdirSync, copyFileSync, readdirSync, readFileSync } from 'node:fs';
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
}

main();

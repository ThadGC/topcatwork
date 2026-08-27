#!/usr/bin/env node
/**
 * extract.mjs — parse the legacy Topcat static site into structured JSON.
 *
 *   node web/scripts/extract.mjs [--repo <path>] [--out <path>] [--quiet]
 *
 * Reads (read-only, never writes outside web/):
 *   stones/*.html      -> web/src/data/stones.json
 *   services/*.html    -> web/src/data/services.json
 *   guides/*.html      -> web/src/data/guides.json
 *   materials/*.html   -> web/src/data/materials.json
 *   worktops/**\/index.html -> web/src/data/locations.json
 *
 * Every source page must land in exactly one record. The run fails loudly if
 * a page is skipped, and prints a coverage report at the end.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { parse, byTag, firstTag, find, findAll, hasClass, attr, text, innerHTML, childEls, firstClass } from './lib/minidom.mjs';
import {
  breadcrumbs, ctaRow, enquiryForm, extractJsonLd, extractSeo, faqItems,
  heading, heroChips, image, mainBlocks, para, sectionBlock, slugFromHref,
  stoneTiles,
} from './lib/common.mjs';

/* ------------------------------------------------------------------ cli --- */

const HERE = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const argOf = (flag, fallback) => {
  const i = args.indexOf(flag);
  return i !== -1 && args[i + 1] ? args[i + 1] : fallback;
};
const REPO = path.resolve(argOf('--repo', path.join(HERE, '..', '..')));
const OUT = path.resolve(argOf('--out', path.join(HERE, '..', 'src', 'data')));
const QUIET = args.includes('--quiet');

/* -------------------------------------------------------------- plumbing --- */

const warnings = [];
function makeCtx(file) {
  return {
    file,
    warn(msg) { warnings.push({ file, msg }); },
  };
}

function read(rel) {
  return fs.readFileSync(path.join(REPO, rel), 'utf8');
}

function listHtml(dir) {
  const abs = path.join(REPO, dir);
  return fs.readdirSync(abs)
    .filter((f) => f.endsWith('.html'))
    .sort()
    .map((f) => `${dir}/${f}`);
}

/** Recursively find every index.html under a directory (posix-style rel paths). */
function listIndexes(dir) {
  const out = [];
  const walkDir = (rel) => {
    const abs = path.join(REPO, rel);
    for (const entry of fs.readdirSync(abs, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const childRel = `${rel}/${entry.name}`;
      if (entry.isDirectory()) walkDir(childRel);
      else if (entry.name === 'index.html') out.push(childRel);
    }
  };
  walkDir(dir);
  return out.sort();
}

function loadPage(rel) {
  const html = read(rel);
  const root = parse(html);
  const ctx = makeCtx(rel);
  return { rel, html, root, ctx };
}

/** The bits every page shares: SEO head, breadcrumbs, JSON-LD, side form. */
function pageShell(page) {
  const { root, ctx, rel } = page;
  return {
    source: rel,
    url: '/' + rel.replace(/index\.html$/, '').replace(/^\/+/, ''),
    seo: extractSeo(root),
    breadcrumbs: breadcrumbs(root),
    jsonLd: extractJsonLd(root, ctx),
    enquiryForm: enquiryForm(root),
  };
}

/** Parse the ?stone=..&mat=..&p=..&s=..&slug=.. estimator deep-link. */
function estimatorParams(href) {
  if (!href || !href.includes('?')) return null;
  const query = href.split('?')[1].split('#')[0];
  const params = {};
  for (const pair of query.split('&')) {
    const [k, v = ''] = pair.split('=');
    params[k] = decodeURIComponent(v.replace(/\+/g, ' '));
  }
  return params;
}

const FAMILY_OF = {
  quartz: 'quartz',
  granite: 'granite',
  marble: 'marble',
  quartzite: 'quartzite',
  porcelain: 'porcelain',
  travertine: 'travertine',
};

/* ------------------------------------------------------------- stones ---- */

function extractStone(page) {
  const { root, ctx } = page;
  const shell = pageShell(page);
  const slug = path.basename(page.rel, '.html');

  const hero = find(root, (n) => hasClass(n, 'stp-hero'));
  if (!hero) { ctx.warn('no .stp-hero'); return null; }

  const kickerEl = find(hero, (n) => hasClass(n, 'stp-kicker'));
  const kicker = text(kickerEl);
  const [familyLabel, finishLabel] = (kicker || '').split('·').map((s) => s.trim());

  const slab = find(hero, (n) => hasClass(n, 'stp-slab'));
  const compareLink = find(hero, (n) => hasClass(n, 'stp-compare'));
  const copy = find(hero, (n) => hasClass(n, 'stp-copy'));

  const facts = byTag(find(copy, (n) => hasClass(n, 'stp-facts')) ?? copy, 'li')
    .map((li) => {
      const label = firstTag(li, 'span');
      const full = text(li);
      const key = text(label);
      return { label: key, value: (full.startsWith(key) ? full.slice(key.length) : full).trim() };
    });

  const heroCtas = ctaRow(find(copy, (n) => hasClass(n, 'cta-row')));
  const trustEl = find(copy, (n) => hasClass(n, 'trust'));

  // The four body sections, in source order.
  const main = firstTag(root, 'main');
  const sections = findAll(main, (n) => n.tag === 'section')
    .filter((s) => !hasClass(s, 'stp-hero'))
    .map((s) => sectionBlock(s, ctx));

  const findSection = (pred) => sections.find(pred) ?? null;
  const aboutSection = sections[0] ?? null;
  const homeVisitSection = findSection((s) => s.content.some((c) => c.type === 'heading' && /See it in your home/i.test(c.text)))
    ?? sections[1] ?? null;
  const relatedSection = findSection((s) => s.content.some((c) => c.type === 'stoneTiles'));
  const ctaBandSection = findSection((s) => s.kind === 'ctaBand');

  const headingOf = (s) => s?.content.find((c) => c.type === 'heading') ?? null;
  const paragraphsOf = (s) => {
    const prose = s?.content.find((c) => c.type === 'prose');
    if (prose) return prose.paragraphs;
    return (s?.content ?? []).filter((c) => c.type === 'paragraph').map(({ type, ...rest }) => rest);
  };

  const related = relatedSection
    ? (relatedSection.content.find((c) => c.type === 'stoneTiles')?.items ?? [])
    : [];

  const estimateCta = heroCtas?.find((c) => c.variant === 'gold') ?? null;

  return {
    slug,
    ...shell,
    name: text(firstTag(copy, 'h1')),
    family: FAMILY_OF[(familyLabel || '').toLowerCase()] ?? (familyLabel || '').toLowerCase() ?? null,
    familyLabel: familyLabel ?? null,
    finish: finishLabel ?? null,
    kicker,
    materialLabel: text(find(slab, (n) => hasClass(n, 'stp-tag'))),
    lede: text(find(copy, (n) => hasClass(n, 'lede'))),
    hero: {
      image: image(firstTag(slab, 'img')),
      compare: compareLink
        ? { href: attr(compareLink, 'href'), label: text(compareLink) }
        : null,
    },
    facts,
    estimator: estimatorParams(estimateCta?.href),
    ctas: heroCtas,
    trust: trustEl ? childEls(trustEl).map((s) => para(s)) : [],
    sections: {
      about: aboutSection && {
        heading: headingOf(aboutSection),
        paragraphs: paragraphsOf(aboutSection),
      },
      homeVisit: homeVisitSection && {
        heading: headingOf(homeVisitSection),
        sub: homeVisitSection.content.find((c) => c.type === 'sub') ?? null,
        ctas: homeVisitSection.content.find((c) => c.type === 'ctaRow')?.items ?? [],
      },
      related: relatedSection && {
        heading: headingOf(relatedSection),
        sub: relatedSection.content.find((c) => c.type === 'sub') ?? null,
        sourceNote: relatedSection.content.find((c) => c.type === 'sourceNote') ?? null,
      },
      ctaBand: ctaBandSection && {
        heading: headingOf(ctaBandSection),
        paragraphs: paragraphsOf(ctaBandSection),
        ctas: ctaBandSection.content.find((c) => c.type === 'ctaRow')?.items ?? [],
      },
    },
    related,
    // NOTE: the ordered `blocks` array is deliberately not kept for stones.
    // All 132 stone pages share one byte-identical section skeleton (About /
    // See it in your home / More X to consider / Make it yours), so `sections`
    // above is a complete, lossless representation and `blocks` was pure
    // duplication -- 30% of the file. web/scripts/verify.mjs proves that no
    // copy is lost by the omission. The other collections DO keep `blocks`,
    // because their section counts genuinely vary page to page.
  };
}

/** stones/index.html — the filterable collection page. */
function extractStoneCollection(page) {
  const { root, ctx } = page;
  const shell = pageShell(page);
  const main = firstTag(root, 'main');
  const controls = find(main, (n) => hasClass(n, 'st-controls'));

  const groupOf = (name) => {
    const holder = find(controls ?? main, (n) => hasClass(n, name));
    if (!holder) return [];
    return findAll(holder, (n) => n.tag === 'button').map((b) => ({
      label: text(b),
      mat: attr(b, 'data-mat'),
      tone: attr(b, 'data-tone'),
      facet: attr(b, 'data-f'),
      value: attr(b, 'data-v'),
    }));
  };

  const allButtons = controls
    ? findAll(controls, (n) => n.tag === 'button').map((b) => ({
      label: text(b),
      id: attr(b, 'id'),
      classes: (attr(b, 'class') || '').split(/\s+/).filter(Boolean),
      mat: attr(b, 'data-mat'),
      tone: attr(b, 'data-tone'),
      facet: attr(b, 'data-f'),
      value: attr(b, 'data-v'),
    }))
    : [];

  const grid = find(main, (n) => hasClass(n, 'st-grid'));

  return {
    ...shell,
    hero: {
      heading: heading(firstTag(main, 'h1')),
      lede: para(find(main, (n) => hasClass(n, 'lede'))),
    },
    search: (() => {
      const input = find(main, (n) => n.tag === 'input');
      return input ? { id: attr(input, 'id'), placeholder: attr(input, 'placeholder'), type: attr(input, 'type') } : null;
    })(),
    filters: allButtons,
    countLabel: text(find(main, (n) => hasClass(n, 'st-count'))),
    tiles: grid ? stoneTiles(grid) : [],
    blocks: mainBlocks(root, ctx),
  };
}

/** stones/compare.html — carries CMP_DATA, the canonical per-stone record. */
function extractCompare(page) {
  const { root, html, ctx } = page;
  const shell = pageShell(page);
  const m = /var\s+CMP_DATA\s*=\s*(\[[\s\S]*?\]);/.exec(html);
  let data = [];
  if (!m) ctx.warn('CMP_DATA not found in compare.html');
  else {
    try { data = JSON.parse(m[1]); }
    catch (err) { ctx.warn(`CMP_DATA is not valid JSON: ${err.message}`); }
  }
  const main = firstTag(root, 'main');
  return {
    page: {
      ...shell,
      hero: {
        heading: heading(firstTag(main, 'h1')),
        lede: para(find(main, (n) => hasClass(n, 'lede'))),
      },
      empty: {
        line: text(find(main, (n) => hasClass(n, 'cmp-empty-line'))),
        sub: text(find(main, (n) => hasClass(n, 'cmp-empty-sub'))),
      },
      buttons: findAll(main, (n) => n.tag === 'button').map((b) => ({
        id: attr(b, 'id'), label: text(b), classes: (attr(b, 'class') || '').split(/\s+/).filter(Boolean),
      })),
      blocks: mainBlocks(root, ctx),
    },
    data,
  };
}

function buildStones() {
  const files = listHtml('stones');
  const detailFiles = files.filter((f) => !/\/(index|compare)\.html$/.test(f));

  const collection = extractStoneCollection(loadPage('stones/index.html'));
  const compare = extractCompare(loadPage('stones/compare.html'));

  const taxonomyBySlug = new Map(collection.tiles.map((t) => [t.slug, t.data ?? null]));
  const compareBySlug = new Map(compare.data.map((d) => [d.slug, d]));

  const stones = [];
  const failed = [];
  for (const rel of detailFiles) {
    const page = loadPage(rel);
    const rec = extractStone(page);
    if (!rec) { failed.push(rel); continue; }
    rec.taxonomy = taxonomyBySlug.get(rec.slug) ?? null;
    rec.compare = compareBySlug.get(rec.slug) ?? null;
    if (!rec.taxonomy) page.ctx.warn('no matching tile in stones/index.html');
    if (!rec.compare) page.ctx.warn('no matching record in CMP_DATA');
    stones.push(rec);
  }

  const families = {};
  for (const s of stones) families[s.family] = (families[s.family] ?? 0) + 1;
  const finishes = {};
  for (const s of stones) finishes[s.finish] = (finishes[s.finish] ?? 0) + 1;

  return {
    doc: {
      $source: 'stones/',
      $generator: 'web/scripts/extract.mjs',
      counts: {
        htmlFiles: files.length,
        stones: stones.length,
        collectionTiles: collection.tiles.length,
        compareRecords: compare.data.length,
        byFamily: families,
        byFinish: finishes,
      },
      collection,
      compare,
      stones,
    },
    seen: [...detailFiles, 'stones/index.html', 'stones/compare.html'],
    failed,
  };
}

/* ----------------------------------------------------- generic page kind -- */

/**
 * Service / material / location / guide pages all share the same anatomy:
 * an optional hero, a lead-grid with a main column and the enquiry aside,
 * an FAQ, a related block, and a closing CTA band. We keep the ordered typed
 * blocks and additionally surface the well-known parts by name.
 */
function extractRichPage(page, { slugFrom = 'basename' } = {}) {
  const { root, ctx } = page;
  const shell = pageShell(page);
  const main = firstTag(root, 'main');
  const blocks = mainBlocks(root, ctx);

  const slug = slugFrom === 'dir'
    ? path.basename(path.dirname(page.rel))
    : path.basename(page.rel, '.html');

  const heroBlock = blocks.find((b) => b.kind === 'hero') ?? null;
  const h1 = firstTag(main, 'h1');

  const faqBlock = blocks.find((b) => b.content.some((c) => c.type === 'faq'));
  const ctaBandBlock = blocks.find((b) => b.kind === 'ctaBand');
  const bodyBlocks = blocks.filter((b) => b !== heroBlock && b !== faqBlock && b !== ctaBandBlock);

  return {
    slug,
    ...shell,
    title: text(h1),
    heading: heading(h1),
    lede: para(find(main, (n) => hasClass(n, 'lede'))),
    hero: heroBlock && {
      background: heroBlock.background ?? null,
      heading: heroBlock.content.find((c) => c.type === 'heading') ?? null,
      lede: heroBlock.content.find((c) => c.type === 'lede') ?? null,
      ctas: heroBlock.content.find((c) => c.type === 'ctaRow')?.items ?? [],
      chips: heroBlock.chips ?? [],
    },
    faq: faqBlock && {
      heading: faqBlock.content.find((c) => c.type === 'heading') ?? null,
      items: faqBlock.content.find((c) => c.type === 'faq')?.items ?? [],
    },
    ctaBand: ctaBandBlock && {
      heading: ctaBandBlock.content.find((c) => c.type === 'heading') ?? null,
      paragraphs: ctaBandBlock.content.filter((c) => c.type === 'paragraph').map(({ type, ...r }) => r),
      ctas: ctaBandBlock.content.find((c) => c.type === 'ctaRow')?.items ?? [],
      note: ctaBandBlock.content.find((c) => c.type === 'ctaNote') ?? null,
    },
    body: bodyBlocks,
    blocks,
  };
}

function extractIndexPage(page) {
  const { root, ctx } = page;
  const shell = pageShell(page);
  const main = firstTag(root, 'main');
  const blocks = mainBlocks(root, ctx);
  return {
    slug: 'index',
    ...shell,
    title: text(firstTag(main, 'h1')),
    heading: heading(firstTag(main, 'h1')),
    lede: para(find(main, (n) => hasClass(n, 'lede'))),
    blocks,
  };
}

function buildCollection(dir, { indexFile = `${dir}/index.html`, label } = {}) {
  const files = listHtml(dir);
  const detail = files.filter((f) => f !== indexFile && !f.endsWith('.css'));
  const index = fs.existsSync(path.join(REPO, indexFile))
    ? extractIndexPage(loadPage(indexFile))
    : null;
  const items = detail.map((rel) => extractRichPage(loadPage(rel)));
  return {
    doc: {
      $source: `${dir}/`,
      $generator: 'web/scripts/extract.mjs',
      counts: { htmlFiles: files.length, [label]: items.length },
      index,
      [label]: items,
    },
    seen: files,
    failed: [],
  };
}

/* ------------------------------------------------------------ locations -- */

function buildLocations() {
  const files = listIndexes('worktops');
  const hubFile = 'worktops/index.html';
  const hub = extractIndexPage(loadPage(hubFile));

  const locations = [];
  for (const rel of files) {
    if (rel === hubFile) continue;
    const page = loadPage(rel);
    const rec = extractRichPage(page, { slugFrom: 'dir' });
    const parts = rel.split('/').slice(1, -1); // e.g. ['hertfordshire','st-albans']
    rec.level = parts.length === 1 ? 'county' : 'town';
    rec.county = parts[0];
    rec.town = parts.length > 1 ? parts[1] : null;
    rec.path = parts;

    // Pricing table and the town/postcode lists are the location-specific bits.
    const allContent = rec.blocks.flatMap((b) => b.content);
    rec.pricing = allContent.find((c) => c.type === 'table') ?? null;
    // On a county page these are the towns covered; on a town page they are the
    // surrounding villages. Same markup, so one field, neutrally named.
    rec.areaChips = allContent.find((c) => c.type === 'chips')?.items ?? [];
    rec.townLinks = (() => {
      const towns = rec.blocks.find((b) => b.content.some(
        (c) => c.type === 'heading' && /(Towns and areas we cover|Areas we cover around)/i.test(c.text),
      ));
      return towns?.content.find((c) => c.type === 'linkList')?.items ?? [];
    })();
    rec.nearby = (() => {
      const near = rec.blocks.find((b) => b.content.some(
        (c) => c.type === 'heading' && /(Nearby towns|Other areas we cover)/i.test(c.text),
      ));
      if (!near) return [];
      const idx = near.content.findIndex((c) => c.type === 'heading' && /(Nearby towns|Other areas we cover)/i.test(c.text));
      const list = near.content.slice(idx).find((c) => c.type === 'linkList');
      return list?.items ?? [];
    })();
    locations.push(rec);
  }

  return {
    doc: {
      $source: 'worktops/',
      $generator: 'web/scripts/extract.mjs',
      counts: {
        htmlFiles: files.length,
        locations: locations.length,
        counties: locations.filter((l) => l.level === 'county').length,
        towns: locations.filter((l) => l.level === 'town').length,
      },
      index: hub,
      locations,
    },
    seen: files,
    failed: [],
  };
}

/* ------------------------------------------------------------------ run --- */

function writeJson(name, doc) {
  fs.mkdirSync(OUT, { recursive: true });
  const file = path.join(OUT, name);
  fs.writeFileSync(file, JSON.stringify(doc, null, 2) + '\n', 'utf8');
  return file;
}

function run() {
  const results = [];

  const stones = buildStones();
  results.push({ name: 'stones.json', dir: 'stones', ...stones });

  const services = buildCollection('services', { label: 'services' });
  results.push({ name: 'services.json', dir: 'services', ...services });

  const guides = buildCollection('guides', { label: 'guides' });
  results.push({ name: 'guides.json', dir: 'guides', ...guides });

  const materials = buildCollection('materials', { label: 'materials' });
  results.push({ name: 'materials.json', dir: 'materials', ...materials });

  const locations = buildLocations();
  results.push({ name: 'locations.json', dir: 'worktops', ...locations });

  const report = { files: [], coverage: [], warnings: [] };

  for (const r of results) {
    const file = writeJson(r.name, r.doc);
    const expected = r.dir === 'worktops' ? listIndexes('worktops') : listHtml(r.dir);
    const missed = expected.filter((f) => !r.seen.includes(f));
    report.files.push({
      out: path.relative(REPO, file).split(path.sep).join('/'),
      bytes: fs.statSync(file).size,
      counts: r.doc.counts,
    });
    report.coverage.push({
      dir: r.dir,
      sourcePages: expected.length,
      extracted: r.seen.length,
      missed,
      failed: r.failed,
    });
  }

  report.warnings = warnings;

  if (!QUIET) {
    console.log(JSON.stringify(report, null, 2));
  }

  const bad = report.coverage.some((c) => c.missed.length || c.failed.length);
  if (bad) {
    console.error('\nEXTRACTION INCOMPLETE: some source pages were not extracted.');
    process.exitCode = 1;
  }
  return report;
}

run();

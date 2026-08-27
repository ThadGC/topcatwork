/**
 * extract-home-css.mjs
 *
 * Lifts the home-page composition rules out of the legacy `assets/site.css`
 * into `src/styles/home-sections.css`, verbatim.
 *
 * WHY A SCRIPT AND NOT HAND-COPYING
 * ---------------------------------
 * site.css is 3354 lines and the section rules are *interleaved* — the tail of
 * the file is a run of shared `@media` blocks where a `#gallery` rule sits two
 * lines below a `#hero` rule. Any hand-drawn line range either drops rules or
 * drags the hero in with it. A selector-level filter is the only cut that is
 * both complete and exact, and re-running it proves the port never drifted.
 *
 * WHAT COMES ACROSS
 * -----------------
 * Every declaration is copied byte-for-byte. This script only *selects*; it
 * never rewrites a value. Selector lists that straddle the boundary (say
 * `.hero-title em,.section-title em`) are split, and only the owned halves are
 * kept — splitting a list into sibling rules with identical declarations is
 * cascade-equivalent, so this is lossless.
 *
 * WHAT IS DELIBERATELY LEFT BEHIND
 *   - the hero / cine film            another agent owns it
 *   - header.bar, .mobile-nav, .mbar  <SiteHeader/> and friends
 *   - footer.site / #footer           <SiteFooter/>
 *   - .page-head, .trade-card, …      other archetypes
 *   - :root, html, body, @font-face   already in src/app/globals.css
 *   - prefers-reduced-motion blocks   already in globals.css (all 13)
 *   - max-height media queries        already in globals.css
 *   - the gold text-gradient recipe   already in globals.css
 *
 * Run: pnpm run extract:home-css
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const SRC = resolve(HERE, '../../assets/site.css');
const OUT = resolve(HERE, '../src/styles/home-sections.css');

/* ------------------------------------------------------------------ parse */

/**
 * Tokenise CSS into a shallow tree. At-rules that take a block of rules
 * (@media, @supports) recurse; @keyframes is kept whole as an opaque leaf
 * because its children are percentage selectors, not real selectors.
 */
function parse(css) {
  const nodes = [];
  let i = 0;

  const readTo = (stop) => {
    let out = '';
    let depth = 0;
    let str = null;
    while (i < css.length) {
      const c = css[i];
      if (str) {
        out += c;
        if (c === '\\') {
          out += css[i + 1] ?? '';
          i += 2;
          continue;
        }
        if (c === str) str = null;
        i++;
        continue;
      }
      if (c === '"' || c === "'") {
        str = c;
        out += c;
        i++;
        continue;
      }
      if (c === '(') depth++;
      if (c === ')') depth--;
      if (depth === 0 && stop.includes(c)) return out;
      out += c;
      i++;
    }
    return out;
  };

  const readBlock = () => {
    // assumes css[i] === '{'
    i++;
    let out = '';
    let depth = 1;
    let str = null;
    while (i < css.length) {
      const c = css[i];
      if (str) {
        out += c;
        if (c === '\\') {
          out += css[i + 1] ?? '';
          i += 2;
          continue;
        }
        if (c === str) str = null;
        i++;
        continue;
      }
      if (c === '"' || c === "'") str = c;
      else if (c === '{') depth++;
      else if (c === '}') {
        depth--;
        if (depth === 0) {
          i++;
          return out;
        }
      }
      out += c;
      i++;
    }
    return out;
  };

  while (i < css.length) {
    const c = css[i];
    if (/\s/.test(c)) {
      i++;
      continue;
    }
    if (css.startsWith('/*', i)) {
      const end = css.indexOf('*/', i + 2);
      i = end === -1 ? css.length : end + 2;
      continue;
    }
    const prelude = readTo('{;').trim();
    if (css[i] === ';') {
      // statement at-rule: @charset, @import, @layer a,b;
      i++;
      if (prelude) nodes.push({ kind: 'statement', text: prelude + ';' });
      continue;
    }
    if (css[i] !== '{') break;
    const body = readBlock();
    if (prelude.startsWith('@')) {
      const name = prelude.slice(1).split(/[\s(]/, 1)[0].toLowerCase();
      if (name === 'keyframes' || name.endsWith('keyframes') || name === 'font-face' || name === 'property') {
        nodes.push({ kind: 'opaque', prelude, body });
      } else {
        nodes.push({ kind: 'at', prelude, children: parse(body) });
      }
    } else {
      nodes.push({ kind: 'rule', selector: prelude, body });
    }
  }
  return nodes;
}

/* ----------------------------------------------------------------- filter */

/**
 * Owned selectors — the home-page composition, everything below the film.
 * Order matters only for readability; the test is "does any pattern match".
 */
const OWNED = [
  /* --- the hero COPY block -----------------------------------------------
   * The film belongs to another agent; the words inside it belong to the
   * page. `<HeroFilm>` takes the hero copy as `children`, and
   * `.hero-title` / `.hero-sub` / `.hero-ctas` / `.hero-chips` have no
   * counterpart in HeroFilm.module.css — that module ports the film chrome
   * (.cine .vid .plate .shade .story .line .inner) and stops there. Left
   * out, these rules are orphaned and the headline renders at the browser
   * default size. The film's `<section>` keeps `id="hero"`, so the
   * `#hero …` overrides that come across land on exactly these elements.
   * --------------------------------------------------------------------- */
  /*
    `.hero-el` is deliberately absent. It is `opacity:0` until
    `.hero.loaded .hl > .hero-el` releases it (site.css:1772), and that
    selector needs the global `.hero` class the film no longer carries — the
    film module holds the whole `.inner` back instead and reveals it at the
    93% handoff. Shipping the rule without its release would pin the headline
    invisible, so <HeroCopy/> omits the class and this omits the rule.
  */
  /(^|[\s,>+~])\.hero-(copy|title|sub|ctas|chips|call-mobile|call-desktop)\b/,
  /(^|[\s,>+~])\.hl\b/,
  /(^|[\s,>+~])\.chip\b/,
  /(^|[\s,>+~])\.chip-/,
  /(^|[\s,>+~])\.g-(mark|stack|word|rating|score|stars)\b/,
  /(^|[\s,>+~])\.(hs-wide|hs-phone|nowrap|cta-long|cta-short)\b/,
  /* site.css:378 `main{position:relative;z-index:1;overflow-x:clip}`.
     A bare element selector matched none of the class patterns below, so it
     was silently dropped — and without it <main> is `position:static`, forms
     no stacking context, and the sections' STATIC in-flow content (notably
     `#stones .section-head`) paints underneath the full-bleed backdrop while
     their `position:relative` siblings still show. Symptom: the heading is in
     the DOM, hit-tests correctly, reports opacity 1 — and is simply not on
     screen. Keep this pattern first; it is an element selector, not a class. */
  /^main$/,

  // shared section primitives
  /(^|[\s,>+~])\.section(-head|-title|-sub|-divider|-cta)?\b/,
  /(^|[\s,>+~])\.rise\b/,
  /(^|[\s,>+~])\.eyebrow\b/,
  /(^|[\s,>+~])\.topspace\b/,
  /(^|[\s,>+~])\.sd-line\b/,
  /(^|[\s,>+~])\.gs-swap\b/,
  /(^|[\s,>+~])\.glow-card\b/,
  /(^|[\s,>+~])\.sheen\b/,
  /(^|[\s,>+~])\.stars\b/,
  /(^|[\s,>+~])\.note\b/,
  /(^|[\s,>+~])\.btn-(gold|ghost)\b/,
  // services
  /#services\b/,
  /(^|[\s,>+~])\.svc\b/,
  /(^|[\s,>+~])\.svc-/,
  /(^|[\s,>+~])\.services-grid\b/,
  /(^|[\s,>+~])\.(face|pface)\b/,
  /(^|[\s,>+~])\.stone\b/,
  /(^|[\s,>+~])\.(front-text|ft-bottom|back-text|flip-hint|veil|idx|desc)\b/,
  /(^|[\s,>+~])\.helix-/,
  /(^|[\s,>+~])\.hx-/,
  // stones / materials strip
  /#stones\b/,
  /(^|[\s,>+~])\.stone-(stage|rail|filter|more|photo)\b/,
  /(^|[\s,>+~])\.rail-/,
  /(^|[\s,>+~])\.mat-tab/,
  /(^|[\s,>+~])\.sf-/,
  /(^|[\s,>+~])\.wheel\b/,
  /(^|[\s,>+~])\.wheel-/,
  /(^|[\s,>+~])\.wbtn\b/,
  /(^|[\s,>+~])\.readout\b/,
  /(^|[\s,>+~])\.slab\b/,
  // reviews
  /#reviews\b/,
  /(^|[\s,>+~])\.rev\b/,
  /(^|[\s,>+~])\.rev-/,
  /(^|[\s,>+~])\.quote\b/,
  // process
  /#process\b/,
  /#procFlow\b/,
  /(^|[\s,>+~])\.proc-flow\b/,
  /(^|[\s,>+~])\.ptile\b/,
  /(^|[\s,>+~])\.pt-/,
  /(^|[\s,>+~])\.pe-/,
  /(^|[\s,>+~])\.pmodal/,
  /(^|[\s,>+~])\.pm-/,
  /(^|[\s,>+~])\.flow\b/,
  /(^|[\s,>+~])\.pstep-/,
  // the process -> about weld door
  /#weldStage\b/,
  /#weldSeam\b/,
  /(^|[\s,>+~])\.weld-/,
  /(^|[\s,>+~])\.ws-/,
  /\.weld-live\b/,
  // trade prompt (sits between #cta and the footer on the home page)
  /(^|[\s,>+~])\.trade-prompt\b/,
  /(^|[\s,>+~])\.tp-/,
  // faq
  /#faq\b/,
  /(^|[\s,>+~])\.faq-/,
  /(^|[\s,>+~])\.fp-/,
  // gallery / projects
  /#gallery\b/,
  /(^|[\s,>+~])\.gal-/,
  /(^|[\s,>+~])\.gg-/,
  /(^|[\s,>+~])\.proj-/,
  /(^|[\s,>+~])\.pl-/,
  // estimator
  /#estimator\b/,
  /(^|[\s,>+~])\.est-/,
  /(^|[\s,>+~])\.ep-/,
  /(^|[\s,>+~])\.sp-/,
  /(^|[\s,>+~])\.tc-up/,
  /(^|[\s,>+~])\.tc-formnote\b/,
  // why
  /#why\b/,
  /(^|[\s,>+~])\.why-mosaic\b/,
  /(^|[\s,>+~])\.wy-/,
  // cta
  /#cta\b/,
  /(^|[\s,>+~])\.cta-/,
  /(^|[\s,>+~])\.cs-/,
  /(^|[\s,>+~])\.cn-/,
  /(^|[\s,>+~])\.cu-/,
  // about
  /#about\b/,
  /(^|[\s,>+~])\.about-/,
  /(^|[\s,>+~])\.ac-/,
  /(^|[\s,>+~])\.acp-/,
];

/** Not ours even when an OWNED pattern matches. Checked first. */
const FOREIGN = [
  /*
    `\b` is WRONG here: in `.hero-title` the boundary falls between `hero`
    and `-`, so `\.hero\b` would swallow every hero-copy class as well. The
    negative lookahead matches the bare `.hero` block and nothing hyphenated.
  */
  /(^|[\s,>+~])\.hero(?![-\w])/,
  /* The film's own layers. `.hero-copy` and its siblings are deliberately
     NOT in this list — see the hero-copy note at the top of OWNED. */
  /(^|[\s,>+~])\.hero-(bg|vid|shade|navgrade|plate|inner|film)\b/,
  /(^|[\s,>+~])\.cine/,
  /\bhtml\.(cine-on|to-hero|skip-live|nav-open|bar-always)/,
  /(^|[\s,>+~])header\.bar\b/,
  /(^|[\s,>+~])\.bar-/,
  /(^|[\s,>+~])\.mobile-nav\b/,
  /(^|[\s,>+~])\.mbar/,
  /(^|[\s,>+~])\.(wa|call)-fab\b/,
  /(^|[\s,>+~])footer\.site\b/,
  /#footer\b/,
  /(^|[\s,>+~])\.foot-/,
  /(^|[\s,>+~])\.page-head/,
  /(^|[\s,>+~])\.crumb/,
  /(^|[\s,>+~])\.trade-(card|grid|lede|stone|scope|q|prompt-)/,
  /#trade/,
  /(^|[\s,>+~])\.tc-defs\b/,
  /(^|[\s,>+~])\.phb-/,
  /(^|[\s,>+~])nav\.top\b/,
  /^:root$/,
  /^html$/,
  /^body$/,
  /^\*/,
];

/**
 * Blocks whose entire content already lives in src/app/globals.css. Copying
 * them again would not change the render, but it would create two places to
 * edit one number, which is exactly how a port drifts.
 */
const IN_GLOBALS = [
  /prefers-reduced-motion/,
  /max-height\s*:/,
];

const isForeign = (sel) => FOREIGN.some((re) => re.test(sel));
const isOwned = (sel) => OWNED.some((re) => re.test(sel));

/** Split a selector list on top-level commas (never inside :is()/:not()). */
function splitSelectors(list) {
  const out = [];
  let depth = 0;
  let cur = '';
  let str = null;
  for (const c of list) {
    if (str) {
      cur += c;
      if (c === str) str = null;
      continue;
    }
    if (c === '"' || c === "'") str = c;
    else if (c === '(' || c === '[') depth++;
    else if (c === ')' || c === ']') depth--;
    else if (c === ',' && depth === 0) {
      out.push(cur.trim());
      cur = '';
      continue;
    }
    cur += c;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}

function filterNodes(nodes) {
  const kept = [];
  for (const n of nodes) {
    if (n.kind === 'statement' || n.kind === 'opaque') {
      // @font-face and @property duplicate globals; @keyframes rides along
      // only if some kept rule can reach it — we keep all of them and prune
      // the unreferenced ones in a second pass.
      if (n.kind === 'opaque' && !/^@(-\w+-)?keyframes/.test(n.prelude)) continue;
      if (n.kind === 'opaque') kept.push(n);
      continue;
    }
    if (n.kind === 'at') {
      if (IN_GLOBALS.some((re) => re.test(n.prelude))) continue;
      const children = filterNodes(n.children);
      if (children.length) kept.push({ ...n, children });
      continue;
    }
    const sels = splitSelectors(n.selector).filter((s) => !isForeign(s) && isOwned(s));
    if (!sels.length) continue;
    kept.push({ kind: 'rule', selector: sels.join(','), body: n.body });
  }
  return kept;
}

/* --------------------------------------------------- prune stray keyframes */

function collectText(nodes, acc = []) {
  for (const n of nodes) {
    if (n.kind === 'rule') acc.push(n.body);
    else if (n.kind === 'at') collectText(n.children, acc);
  }
  return acc;
}

function pruneKeyframes(nodes, usedNames) {
  return nodes
    .map((n) => {
      if (n.kind === 'at') return { ...n, children: pruneKeyframes(n.children, usedNames) };
      return n;
    })
    .filter((n) => {
      if (n.kind !== 'opaque') return true;
      const name = n.prelude.replace(/^@(-\w+-)?keyframes\s+/, '').trim();
      return usedNames.has(name);
    })
    .filter((n) => !(n.kind === 'at' && n.children.length === 0));
}

/* ---------------------------------------------------------------- emit */

function emit(nodes, indent = '') {
  const lines = [];
  for (const n of nodes) {
    if (n.kind === 'opaque') {
      lines.push(`${indent}${n.prelude}{${n.body.trim()}}`);
    } else if (n.kind === 'at') {
      lines.push(`${indent}${n.prelude}{`);
      lines.push(emit(n.children, indent + '  '));
      lines.push(`${indent}}`);
    } else {
      lines.push(`${indent}${n.selector}{${n.body.trim()}}`);
    }
  }
  return lines.join('\n');
}

/* ------------------------------------------------------------------ main */

const css = readFileSync(SRC, 'utf8');
const tree = parse(css);
let kept = filterNodes(tree);

// `[^;]` also matches a newline, so the value pattern must exclude the line
// break as well or one `animation:` swallows every rule down to the next
// semicolon and the keyframes those rules name get pruned as unreferenced.
const bodies = collectText(kept).join(';\n');
const used = new Set();
for (const m of bodies.matchAll(/animation(?:-name)?\s*:\s*([^;\n}]+)/g)) {
  for (const tok of m[1].split(/[\s,]+/)) {
    if (/^[A-Za-z_][\w-]*$/.test(tok)) used.add(tok);
  }
}
kept = pruneKeyframes(kept, used);

const header = `/* ==========================================================================
   TopCat — home-page composition
   --------------------------------------------------------------------------
   GENERATED. Do not hand-edit: run \`pnpm run extract:home-css\`.

   Source: assets/site.css (3354 lines). Every declaration below is byte-for-
   byte what the legacy site ships; scripts/extract-home-css.mjs only decides
   which rules belong to the sections below the hero film. See that file for
   what is deliberately excluded and why.

   These rules are UNLAYERED on purpose. Cascade layers rank below unlayered
   CSS, so the legacy values win over any Tailwind utility that happens to
   collide — which is the behaviour a port wants. Style these sections with
   the legacy class names, not with utilities.
   ========================================================================== */

`;

/**
 * THE ONE BRIDGE RULE.
 *
 * Not a new value — a re-anchored one. globals.css declares
 * `.hero{--hTitle:clamp(72px, min(6.2vw,10.6vh), 92px)}`, and `.hero-title`
 * reads it as its `font-size`. In the legacy DOM the element carrying that
 * token is `section.hero#hero`; in the port the film's <section> keeps
 * `id="hero"` but its class is a hashed CSS-module name, so the class
 * selector no longer matches and `--hTitle` resolves to nothing — which makes
 * `font-size:var(--hTitle)` invalid and drops the headline to inherited size.
 *
 * Same declaration, same element, selected by id instead of class. If the
 * film component ever declares --hTitle itself, delete this.
 */
const BRIDGE = `
/* --- bridge: see scripts/extract-home-css.mjs, "THE ONE BRIDGE RULE" --- */
#hero{--hTitle:clamp(72px,min(6.2vw,10.6vh),92px)}
`;

writeFileSync(OUT, header + emit(kept) + '\n' + BRIDGE, 'utf8');

const count = (function walk(ns) {
  return ns.reduce((a, n) => a + (n.kind === 'at' ? walk(n.children) : 1), 0);
})(kept);
console.log(`extract-home-css: ${count} rules -> ${OUT}`);

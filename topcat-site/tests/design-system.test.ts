import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import config from '../tailwind.config';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const read = (...p: string[]) =>
  fs.readFileSync(path.join(HERE, '..', ...p), 'utf8');

const GLOBALS = read('src', 'app', 'globals.css');
const LAYOUT = read('src', 'app', 'layout.tsx');

/**
 * globals.css is heavily commented on purpose — it documents why each block
 * exists — so these guards assert on code, not prose.
 *
 * The strip has to be quote-aware: `@source '../app/**​/*.{ts,tsx}'` contains
 * a literal `/*` inside a string, and a naive regex swallows the rest of the
 * file from there.
 */
function stripCssComments(css: string): string {
  let out = '';
  let quote: string | null = null;
  let i = 0;

  while (i < css.length) {
    const c = css[i];

    if (quote) {
      out += c;
      if (c === '\\') {
        out += css[i + 1] ?? '';
        i += 2;
        continue;
      }
      if (c === quote) quote = null;
      i += 1;
      continue;
    }

    if (c === '"' || c === "'") {
      quote = c;
      out += c;
      i += 1;
      continue;
    }

    if (c === '/' && css[i + 1] === '*') {
      const end = css.indexOf('*/', i + 2);
      i = end === -1 ? css.length : end + 2;
      out += ' ';
      continue;
    }

    out += c;
    i += 1;
  }

  return out;
}

const GLOBALS_CODE = stripCssComments(GLOBALS);

/**
 * Fidelity guards. This is a port: the temptation to tidy a value is the
 * failure mode these tests exist to catch. Every expectation below is a
 * literal out of the legacy stylesheets.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ext = (config.theme as any).extend;

describe('breakpoints', () => {
  it('has exactly the three semantic modes JS also matches on', () => {
    // site.js: matchMedia('(min-width:1121px)'), mPhone, mNarrow
    expect(config.theme?.screens).toEqual({
      phone: { max: '720px' },
      narrow: { min: '721px', max: '1120px' },
      wide: { min: '1121px' },
    });
  });
});

describe('colour tokens', () => {
  it('carries the named palette verbatim', () => {
    expect(ext.colors.ink.DEFAULT).toBe('#0B0B0D');
    expect(ext.colors.ink[2]).toBe('#15151A');
    expect(ext.colors.ink[3]).toBe('#1D1D23');
    expect(ext.colors.bone).toBe('#F4F1EA');
    expect(ext.colors.gold.DEFAULT).toBe('#C6A664');
    expect(ext.colors.gold.lo).toBe('#8C6B34');
    expect(ext.colors.gold.hi).toBe('#E4CD92');
    expect(ext.colors.gold.soft).toBe('#D4B778');
    expect(ext.colors.warn).toBe('#E08A6B');
  });

  it('keeps the un-tokenised gold gradient bottom stop', () => {
    // #BC9A54 appears raw in every gold gradient in the source.
    expect(ext.colors.gold.deep).toBe('#BC9A54');
  });

  it('resolves --muted and --faint through the token, not a literal', () => {
    // They MUST stay var()-backed: the value differs between the two roots.
    expect(ext.colors.muted).toBe('var(--muted)');
    expect(ext.colors.faint).toBe('var(--faint)');
  });
});

describe('globals.css — the two token roots', () => {
  it('declares both @font-face blocks against the hard-coded /assets path', () => {
    expect(GLOBALS_CODE).toContain(
      "src: url(/assets/fonts/cinzel-latin-var.woff2) format('woff2')",
    );
    expect(GLOBALS_CODE).toContain(
      "src: url(/assets/fonts/montserrat-latin-var.woff2) format('woff2')",
    );
    // next/font/local emits its own @font-face and rewrites the URLs out from
    // under both the rules above and the preload <link>s. It must not be used.
    expect(GLOBALS_CODE).not.toContain('next/font');
    // The layout explains in a comment why next/font is avoided, so match the
    // import itself rather than the mention.
    expect(LAYOUT).not.toMatch(/from\s+['"]next\/font/);

    // Both faces are preloaded on every legacy page; crossOrigin is mandatory
    // on a font preload even same-origin or the file is fetched twice.
    expect(LAYOUT).toContain('/assets/fonts/cinzel-latin-var.woff2');
    expect(LAYOUT).toContain('/assets/fonts/montserrat-latin-var.woff2');
    expect(LAYOUT.match(/crossOrigin/g)).toHaveLength(2);
  });

  it('keeps the three site.css / service.css divergences intact', () => {
    // --muted 0.55 vs 0.60
    expect(GLOBALS_CODE).toContain('--muted: rgba(244, 241, 234, 0.55)');
    expect(GLOBALS_CODE).toContain('--muted: rgba(244, 241, 234, 0.6)');
    // --faint 0.32 vs 0.34
    expect(GLOBALS_CODE).toContain('--faint: rgba(244, 241, 234, 0.32)');
    expect(GLOBALS_CODE).toContain('--faint: rgba(244, 241, 234, 0.34)');
    // --uipx wide clamp floor 0.74px vs 0.80px
    expect(GLOBALS_CODE).toContain(
      '--uipx: clamp(0.74px, min(100vw / 1440, 100vh / 900), 1.18px)',
    );
    expect(GLOBALS_CODE).toContain(
      '--uipx: clamp(0.8px, min(100vw / 1440, 100vh / 900), 1.18px)',
    );
  });

  it('carries --ease-2 even though nothing references it', () => {
    expect(GLOBALS_CODE).toContain('--ease-2: cubic-bezier(0.65, 0, 0.35, 1)');
  });

  it('declares the marble floor and the content-page z-index override', () => {
    expect(GLOBALS_CODE).toContain('body::before');
    expect(GLOBALS_CODE).toContain("body[data-tokens='content']::before");
  });

  it('does not import Tailwind preflight', () => {
    // The legacy reset is only `*{box-sizing:border-box;margin:0;padding:0}`.
    // Preflight would add img/video/button rules the source never had, and
    // silently reflow ported markup.
    expect(GLOBALS_CODE).not.toContain('preflight');
    // The bare `@import "tailwindcss"` pulls preflight in; the split form does not.
    expect(GLOBALS_CODE).not.toMatch(/@import\s+['"]tailwindcss['"]/);
    expect(GLOBALS_CODE).toContain(
      "@import 'tailwindcss/theme.css' layer(theme)",
    );
    expect(GLOBALS_CODE).toContain(
      "@import 'tailwindcss/utilities.css' layer(utilities)",
    );
    expect(GLOBALS_CODE).toContain('box-sizing: border-box');
  });

  it('pins the content sources instead of auto-crawling the project', () => {
    // Auto-detection reads CSS values and prose in this file as class
    // candidates, and re-scans the ~4 MB of src/data/*.json every build.
    expect(GLOBALS_CODE).toContain('source(none)');
    expect(GLOBALS_CODE).toMatch(/@source\s+'\.\.\/app\/\*\*/);
    expect(GLOBALS_CODE).toMatch(/@source\s+'\.\.\/components\/\*\*/);
  });
});

describe('globals.css — CSS -> JS channel properties', () => {
  it('declares every property site.js reads back with getComputedStyle', () => {
    for (const prop of [
      '--cineHold',
      '--cineVeilAt',
      '--cineVeilMin',
      '--galMode',
      '--svcMode',
      '--faqMode',
      '--footTail',
      '--revPer',
      '--revAir',
      '--railW',
      '--wheelBend',
      '--stoneRaster',
      '--barH',
    ]) {
      expect(GLOBALS_CODE, `${prop} must stay a real custom property`).toContain(
        `${prop}:`,
      );
    }
  });

  it('does NOT invent a declaration for --hxMode', () => {
    // site.js:514 reads it and falls back to 'desktop'. Nothing in the source
    // ever declares it; the fallback is load-bearing.
    expect(GLOBALS_CODE).not.toMatch(/--hxMode\s*:/);
  });

  it('leaves --cw / --ch undeclared at :root', () => {
    // Two call sites with DIFFERENT fallbacks (331px/420px at site.js:2130,
    // 145px/278px at site.js:2154). A :root declaration would shadow the
    // second pair and silently resize the phone gallery.
    const rootBlocks = [...GLOBALS_CODE.matchAll(/:root\s*\{([^}]*)\}/g)].map(
      (m) => m[1],
    );
    expect(rootBlocks.length).toBeGreaterThan(0);
    for (const block of rootBlocks) {
      expect(block).not.toMatch(/--cw\s*:/);
      expect(block).not.toMatch(/--ch\s*:/);
    }
  });
});

describe('globals.css — runtime-written properties', () => {
  it('declares the document-level ones at their CSS fallback value', () => {
    expect(GLOBALS_CODE).toContain('--filmU: 1px');
    expect(GLOBALS_CODE).toContain('--filmX: 0px');
    expect(GLOBALS_CODE).toContain('--filmY: 0px');
    // fail() removeProperty()s these two; the declarations must equal the
    // fallbacks or the film-off state changes.
    expect(GLOBALS_CODE).toContain('--cineVeil: 1');
    expect(GLOBALS_CODE).toContain('--navGrade: 0');
  });

  it('keeps --cineGoldTop/Mid/Low, which JS never writes', () => {
    expect(GLOBALS_CODE).toContain('--cineGoldTop: #e4cd92');
    expect(GLOBALS_CODE).toContain('--cineGoldMid: #c6a664');
    expect(GLOBALS_CODE).toContain('--cineGoldLow: #bc9a54');
  });
});

describe('spacing', () => {
  it('has the page gutter, the single most repeated value in the system', () => {
    expect(ext.spacing.gutter).toBe('clamp(20px,5vw,64px)');
  });

  it('keeps the --uipx-scaled UI paddings as calc(), not px', () => {
    expect(ext.spacing.ui11).toBe('calc(11 * var(--uipx))');
    expect(ext.spacing.ui22).toBe('calc(22 * var(--uipx))');
  });
});

describe('type', () => {
  it('maps the three stacks onto the tokens rather than re-declaring them', () => {
    expect(ext.fontFamily.serif).toBe('var(--serif)');
    expect(ext.fontFamily.sans).toBe('var(--sans)');
    expect(ext.fontFamily.brand).toBe('var(--brand)');
  });

  it('carries --hTitle exactly', () => {
    expect(ext.fontSize['hero-title']).toBe(
      'clamp(72px,min(6.2vw,10.6vh),92px)',
    );
  });

  it('keeps the stray 700 weight that Montserrat has to synthesise', () => {
    expect(ext.fontWeight.bold).toBe('700');
  });
});

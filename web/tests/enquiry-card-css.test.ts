import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

/**
 * `src/styles/enquiry-card.css` IS A COPY, AND THIS IS WHAT KEEPS IT HONEST.
 *
 * The enquiry card is styled in `home-sections.css`, which the home page and
 * /contact/ load. The 132 stone pages carry the same card but are on the other
 * stylesheet family (content.css + stone.css) and CANNOT load home-sections.css:
 * measured with a full-page pixel diff, importing it there changes hundreds of
 * rows on every stone page, including 575 consecutive rows of the hero at
 * 1440px, because the two sheets disagree about shared class names at equal
 * specificity (`.btn-gold` letter-spacing is 0.22em in one and 0.2em in the
 * other, which alone moved the CTA buttons from 368px to 361px).
 *
 * So the card's own rules — and only those — are extracted into a scoped file.
 * That leaves two copies of the same declarations, and two copies drift.
 *
 * This test fails the moment they do: every rule in the extract must still
 * appear, character for character, in home-sections.css. It catches an edit to
 * either side — a change to the copy will not be found in the original, and a
 * change to the original will no longer match the copy.
 *
 * If it fails, do NOT edit the extract to match. Make the change in
 * home-sections.css and re-extract, so the home page and the stone pages keep
 * getting the same card.
 */

const read = (p: string) => readFileSync(join(process.cwd(), p), 'utf8');

/** Strip comments and collapse whitespace, so formatting alone cannot fail it. */
const normalise = (css: string) =>
  css
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s+/g, ' ')
    .trim();

/**
 * Split a stylesheet into top-level blocks. `@media` blocks are returned with
 * their inner rules flattened out, so a rule is compared on its own terms
 * rather than on which query happens to wrap it.
 */
function rules(css: string): string[] {
  const out: string[] = [];
  const src = normalise(css);
  let i = 0;

  const block = (from: number) => {
    let depth = 0;
    for (let k = from; k < src.length; k += 1) {
      if (src[k] === '{') depth += 1;
      else if (src[k] === '}') {
        depth -= 1;
        if (depth === 0) return k + 1;
      }
    }
    return src.length;
  };

  while (i < src.length) {
    const open = src.indexOf('{', i);
    if (open === -1) break;
    const head = src.slice(i, open).trim();
    const end = block(open);
    if (head.startsWith('@media')) {
      out.push(...rules(src.slice(open + 1, end - 1)));
    } else if (head && !head.startsWith('@')) {
      out.push(`${head}{${src.slice(open + 1, end - 1).trim()}}`);
    }
    i = end;
  }
  return out;
}

describe('the enquiry card stylesheet extracted for the stone pages', () => {
  const extract = read('src/styles/enquiry-card.css');
  const origin = read('src/styles/home-sections.css');

  it('carries at least the card, its copy column and its form', () => {
    // A guard against the extractor silently producing an empty or gutted file.
    expect(rules(extract).length).toBeGreaterThan(40);
    for (const sel of ['.cta-card', '.cta-title', '.cta-form', '.cta-send', '.cta-stone']) {
      expect(extract, sel).toContain(sel);
    }
  });

  it('touches nothing outside the enquiry-card family', () => {
    // The whole reason the extract is safe on a stone page: no selector in it
    // can reach that page's own layout.
    const FAMILY =
      /(^|[\s,>+~])(#cta|\.cta-|\.cs-|\.cu-|\.cn-|\.r-(txt|src|score)|\.tc-up|\.ic-wa)/;
    const strays = rules(extract)
      .map((r) => r.slice(0, r.indexOf('{')))
      .flatMap((head) => head.split(','))
      .map((s) => s.trim())
      .filter((s) => s && !FAMILY.test(s));
    expect(strays).toEqual([]);
  });

  it('has not drifted from home-sections.css', () => {
    const origins = new Set(rules(origin));
    /* `.cta-row` is emitted scoped as `.cta-form .cta-row`, because that class
       name means something else on the stone pages — see the extractor. Strip
       the scope back off before comparing, so the scoping does not read as
       drift while a real edit still does. */
    const unscope = (r: string) => r.replace(/(^|,\s*)\.cta-form (\.cta-row)/g, '$1$2');
    const drifted = rules(extract).filter(
      (r) => !origins.has(r) && !origins.has(unscope(r)),
    );
    expect(
      drifted,
      'These rules no longer match home-sections.css. Change the card THERE and ' +
        're-extract; do not patch the copy.',
    ).toEqual([]);
  });
});

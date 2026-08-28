/**
 * Build `src/styles/enquiry-card.css` from `home-sections.css`.
 *
 *   node scripts/extract-enquiry-card-css.mjs
 *
 * ---------------------------------------------------------------------------
 * WHY
 * ---------------------------------------------------------------------------
 * The enquiry card is styled in `home-sections.css`, which the home page and
 * /contact/ load. The 132 stone pages carry the same card but sit on the other
 * stylesheet family (content.css + stone.css) and CANNOT load home-sections.css:
 * measured with a full-page pixel diff at 390 / 900 / 1440, importing it there
 * changed hundreds of rows on every stone page, including 575 consecutive rows
 * of the hero at 1440, because the two sheets disagree about shared class names
 * at equal specificity. `.btn-gold` letter-spacing alone (0.22em against 0.2em)
 * moved the CTA buttons from 368px to 361px.
 *
 * So only the card's own rules travel. Run this after ANY change to the card in
 * home-sections.css; `tests/enquiry-card-css.test.ts` fails if you forget.
 *
 * ---------------------------------------------------------------------------
 * THE ONE SUBTLETY: COLLIDING GENERIC NAMES
 * ---------------------------------------------------------------------------
 * `.cta-row` means two different things. In home-sections.css it is the form's
 * two-up field row (`grid-template-columns:1fr 1fr`, which is what puts Name
 * beside Email). In content.css it is the stone page's row of BUTTONS. Copying
 * it across bare would restyle every button row on 132 pages.
 *
 * So selectors in COLLIDING are emitted scoped under `.cta-form`, which both
 * raises them above content.css's bare rule inside the form and makes them
 * unable to reach anything outside it. Without this the stone page's Name and
 * Email fields stack full-width while the home page's sit side by side —
 * measured 521px against 255px, which is exactly how it was caught.
 */
import { readFileSync, writeFileSync } from 'node:fs';

const ORIGIN = 'src/styles/home-sections.css';
const TARGET = 'src/styles/enquiry-card.css';

/** Selectors that belong to the card and to nothing else. */
const FAMILY =
  /(^|[\s,>+~])(#cta(Form|Reply|Stone[A-Za-z]*|Up[A-Za-z]*)?\b|\.cta-(card|copy|title|line|reach|or|lines|tel|trust|rate|form|stone|stonet|up|up-t|up-body|up-in|send|note|ok|err|next|reply|row)\b|\.cs-(label|name|x|mk|more)\b|\.cu-(mk|txt|count|maxnote)\b|\.cn-(k|list)\b|\.r-(txt|src|score)\b|\.tc-up\b|\.ic-wa\b)/;

/** Card selectors whose class name is also used elsewhere on the stone pages. */
const COLLIDING = [/^\.cta-row\b/];

const scope = (sel) =>
  COLLIDING.some((re) => re.test(sel.trim())) ? `.cta-form ${sel.trim()}` : sel.trim();

const belongs = (head) => {
  const parts = head.split(',').map((s) => s.trim()).filter(Boolean);
  return parts.length > 0 && parts.every((p) => FAMILY.test(p));
};

/* Comments are stripped BEFORE parsing: a comment sitting above a rule is
   otherwise read as part of that rule's selector. */
const src = readFileSync(ORIGIN, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');

function endOfBlock(text, open) {
  let depth = 0;
  for (let i = open; i < text.length; i += 1) {
    if (text[i] === '{') depth += 1;
    else if (text[i] === '}') {
      depth -= 1;
      if (depth === 0) return i + 1;
    }
  }
  return text.length;
}

function collect(text) {
  const out = [];
  let i = 0;
  while (i < text.length) {
    const m = /[^{}]*\{/g;
    m.lastIndex = i;
    const hit = m.exec(text);
    if (!hit) break;
    const open = hit.index + hit[0].length - 1;
    const head = text.slice(hit.index, open).trim();
    const end = endOfBlock(text, open);
    if (head.startsWith('@media')) {
      const inner = collect(text.slice(open + 1, end - 1));
      if (inner.length) out.push(`${head} {\n${inner.join('\n')}\n}`);
    } else if (head && !head.startsWith('@') && belongs(head)) {
      const body = text.slice(open + 1, end - 1).trim();
      const sel = head.split(',').map(scope).join(',');
      out.push(`${sel}{${body}}`);
    }
    i = end;
  }
  return out;
}

const rules = collect(src);

const header = `/* =========================================================================
   THE ENQUIRY CARD — GENERATED. DO NOT EDIT BY HAND.
   -------------------------------------------------------------------------
   Rebuild with:  node scripts/extract-enquiry-card-css.mjs
   Source of truth: ${ORIGIN}

   The 132 stone pages carry the same enquiry card as the home page and
   /contact/, but they load content.css + stone.css and CANNOT load
   home-sections.css — measured, importing it there changes hundreds of rows on
   every stone page, including 575 consecutive rows of the hero at 1440px,
   because the two sheets disagree on shared class names at equal specificity.

   So only the card's own rules are copied here, and \`.cta-row\` — which means
   the form's two-up field row in one sheet and the stone page's button row in
   the other — is scoped under \`.cta-form\` so it cannot reach the buttons.

   tests/enquiry-card-css.test.ts fails if this file drifts from its source or
   if a selector outside the enquiry-card family gets into it.
   ========================================================================= */

`;

writeFileSync(TARGET, header + rules.join('\n') + '\n');
// eslint-disable-next-line no-console
console.log(`${TARGET}: ${rules.length} rules from ${ORIGIN}`);

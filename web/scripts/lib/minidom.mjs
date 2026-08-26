/**
 * minidom - a dependency-free HTML tokeniser + tree builder, sized for the
 * Topcat legacy static site. The source markup is machine-generated and
 * well-formed, so we do not need a spec-complete parser; we need one that
 * never silently loses text.
 *
 * Nodes:
 *   { type: 'element', tag, attrs, children, parent }
 *   { type: 'text',    value, parent }
 *   { type: 'comment', value, parent }
 */

const VOID = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
  'link', 'meta', 'param', 'source', 'track', 'wbr',
]);

// Elements whose content is raw text, not markup.
const RAW_TEXT = new Set(['script', 'style']);

// Elements that close themselves when a sibling of the same kind opens.
const AUTO_CLOSE = {
  li: new Set(['li']),
  dt: new Set(['dt', 'dd']),
  dd: new Set(['dt', 'dd']),
  p: new Set([
    'address', 'article', 'aside', 'blockquote', 'div', 'dl', 'fieldset',
    'figcaption', 'figure', 'footer', 'form', 'h1', 'h2', 'h3', 'h4', 'h5',
    'h6', 'header', 'hr', 'main', 'nav', 'ol', 'p', 'pre', 'section',
    'table', 'ul',
  ]),
  option: new Set(['option', 'optgroup']),
  thead: new Set(['tbody', 'tfoot']),
  tbody: new Set(['tbody', 'tfoot']),
  tr: new Set(['tr']),
  td: new Set(['td', 'th', 'tr']),
  th: new Set(['td', 'th', 'tr']),
};

const NAMED_ENTITIES = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ',
  middot: '·', rsaquo: '›', lsaquo: '‹', times: '×',
  divide: '÷', mdash: '—', ndash: '–', hellip: '…',
  copy: '©', reg: '®', trade: '™', deg: '°',
  pound: '£', euro: '€', bull: '•', laquo: '«',
  raquo: '»', ldquo: '“', rdquo: '”', lsquo: '‘',
  rsquo: '’', minus: '−', frac12: '½', sup2: '²',
  eacute: 'é', egrave: 'è', agrave: 'à', ccedil: 'ç',
};

/** Decode the HTML entities that actually occur in this codebase. */
export function decodeEntities(s) {
  if (!s || s.indexOf('&') === -1) return s;
  return s.replace(/&(#x[0-9a-fA-F]+|#\d+|[a-zA-Z][a-zA-Z0-9]{1,10});/g, (whole, body) => {
    if (body[0] === '#') {
      const code = body[1] === 'x' || body[1] === 'X'
        ? parseInt(body.slice(2), 16)
        : parseInt(body.slice(1), 10);
      if (Number.isFinite(code) && code > 0 && code <= 0x10ffff) {
        return String.fromCodePoint(code);
      }
      return whole;
    }
    const hit = NAMED_ENTITIES[body];
    return hit === undefined ? whole : hit;
  });
}

const ATTR_RE = /([^\s"'>/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'`=<>]+)))?/g;

function parseAttrs(raw) {
  const attrs = {};
  if (!raw) return attrs;
  ATTR_RE.lastIndex = 0;
  let m;
  while ((m = ATTR_RE.exec(raw))) {
    const name = m[1].toLowerCase();
    const value = m[2] ?? m[3] ?? m[4] ?? '';
    if (!(name in attrs)) attrs[name] = decodeEntities(value);
  }
  return attrs;
}

function el(tag, attrs) {
  return { type: 'element', tag, attrs, children: [], parent: null };
}

function push(parent, node) {
  node.parent = parent;
  parent.children.push(node);
  return node;
}

/**
 * Parse an HTML document into a tree. Returns the synthetic root element.
 * Throws nothing: unmatched close tags are ignored, unclosed tags are closed
 * at end of input.
 */
export function parse(html) {
  const root = el('#root', {});
  const stack = [root];
  let i = 0;
  const len = html.length;
  let buffer = '';

  const flushText = () => {
    if (buffer) {
      push(stack[stack.length - 1], { type: 'text', value: buffer, parent: null });
      buffer = '';
    }
  };

  while (i < len) {
    const lt = html.indexOf('<', i);
    if (lt === -1) { buffer += html.slice(i); break; }
    buffer += html.slice(i, lt);

    // Comment / doctype / CDATA
    if (html.startsWith('<!--', lt)) {
      const end = html.indexOf('-->', lt + 4);
      const stop = end === -1 ? len : end + 3;
      flushText();
      push(stack[stack.length - 1], {
        type: 'comment', value: html.slice(lt + 4, end === -1 ? len : end), parent: null,
      });
      i = stop;
      continue;
    }
    if (html.startsWith('<!', lt)) {
      const end = html.indexOf('>', lt);
      i = end === -1 ? len : end + 1;
      continue;
    }

    // Close tag
    if (html.startsWith('</', lt)) {
      const end = html.indexOf('>', lt);
      if (end === -1) { buffer += html.slice(lt); break; }
      const tag = html.slice(lt + 2, end).trim().toLowerCase();
      flushText();
      for (let d = stack.length - 1; d > 0; d--) {
        if (stack[d].tag === tag) { stack.length = d; break; }
      }
      i = end + 1;
      continue;
    }

    // Open tag
    const nameMatch = /^<([a-zA-Z][a-zA-Z0-9:-]*)/.exec(html.slice(lt, lt + 64));
    if (!nameMatch) { buffer += '<'; i = lt + 1; continue; }
    const tag = nameMatch[1].toLowerCase();

    // Find the end of the tag, honouring quoted attribute values.
    let j = lt + nameMatch[0].length;
    let quote = null;
    while (j < len) {
      const c = html[j];
      if (quote) { if (c === quote) quote = null; }
      else if (c === '"' || c === "'") quote = c;
      else if (c === '>') break;
      j++;
    }
    if (j >= len) { buffer += html.slice(lt); break; }

    let rawAttrs = html.slice(lt + nameMatch[0].length, j);
    const selfClosing = rawAttrs.trimEnd().endsWith('/');
    if (selfClosing) rawAttrs = rawAttrs.trimEnd().slice(0, -1);

    flushText();

    // Implicit close of the current element (e.g. <li> after <li>).
    for (let d = stack.length - 1; d > 0; d--) {
      const openTag = stack[d].tag;
      const closers = AUTO_CLOSE[openTag];
      if (closers && closers.has(tag)) { stack.length = d; } else break;
    }

    const node = push(stack[stack.length - 1], el(tag, parseAttrs(rawAttrs)));
    i = j + 1;

    if (RAW_TEXT.has(tag)) {
      const closeRe = new RegExp(`</${tag}\\s*>`, 'i');
      const rest = html.slice(i);
      const m = closeRe.exec(rest);
      const body = m ? rest.slice(0, m.index) : rest;
      if (body) push(node, { type: 'text', value: body, parent: null, raw: true });
      i += m ? m.index + m[0].length : rest.length;
      continue;
    }

    if (!VOID.has(tag) && !selfClosing) stack.push(node);
  }
  flushText();
  return root;
}

/* ------------------------------------------------------------------ */
/* Traversal helpers                                                    */
/* ------------------------------------------------------------------ */

export function walk(node, fn) {
  for (const child of node.children ?? []) {
    if (child.type === 'element') {
      if (fn(child) === false) continue;
      walk(child, fn);
    }
  }
}

export function findAll(node, pred) {
  const out = [];
  walk(node, (n) => { if (pred(n)) out.push(n); });
  return out;
}

export function find(node, pred) {
  let hit = null;
  const rec = (n) => {
    for (const child of n.children ?? []) {
      if (hit) return;
      if (child.type !== 'element') continue;
      if (pred(child)) { hit = child; return; }
      rec(child);
    }
  };
  rec(node);
  return hit;
}

export function classes(node) {
  const c = node?.attrs?.class;
  return c ? c.split(/\s+/).filter(Boolean) : [];
}

export function hasClass(node, name) {
  return classes(node).includes(name);
}

export function byTag(node, tag) {
  return findAll(node, (n) => n.tag === tag);
}

export function firstTag(node, tag) {
  return find(node, (n) => n.tag === tag);
}

export function byClass(node, name) {
  return findAll(node, (n) => hasClass(n, name));
}

export function firstClass(node, name) {
  return find(node, (n) => hasClass(n, name));
}

export function attr(node, name) {
  return node?.attrs?.[name] ?? null;
}

/** Direct element children only. */
export function childEls(node) {
  return (node?.children ?? []).filter((c) => c.type === 'element');
}

/* ------------------------------------------------------------------ */
/* Serialisation                                                        */
/* ------------------------------------------------------------------ */

const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;' };

function serializeNode(node) {
  if (node.type === 'text') {
    if (node.raw) return node.value;
    // Decode first, then re-escape. Skipping the decode would turn the
    // source's `&amp;` into `&amp;amp;` and `&#9733;` into `&amp;#9733;`.
    return decodeEntities(node.value).replace(/[&<>]/g, (c) => ESC[c]);
  }
  if (node.type === 'comment') return `<!--${node.value}-->`;
  const attrs = Object.entries(node.attrs)
    .map(([k, v]) => (v === '' ? ` ${k}` : ` ${k}="${v.replace(/"/g, '&quot;')}"`))
    .join('');
  if (VOID.has(node.tag)) return `<${node.tag}${attrs}>`;
  return `<${node.tag}${attrs}>${node.children.map(serializeNode).join('')}</${node.tag}>`;
}

/**
 * Inner HTML, re-serialised from the tree. Entities are decoded then minimally
 * re-encoded, and whitespace runs (the source is CRLF-indented) are collapsed
 * to a single space -- which is exactly what an HTML renderer does with them,
 * so this is lossless for display and keeps the JSON free of stray 
.
 * There is no <pre> anywhere in this site, so nothing depends on the runs.
 */
export function innerHTML(node) {
  if (!node) return null;
  return node.children.map(serializeNode).join('').replace(/\s+/g, ' ').trim();
}

/** Raw concatenated text, entities decoded, whitespace collapsed. */
export function text(node) {
  if (!node) return null;
  let out = '';
  const rec = (n) => {
    for (const child of n.children ?? []) {
      if (child.type === 'text') {
        if (child.raw) continue; // never leak <script> bodies into copy
        out += decodeEntities(child.value);
      } else if (child.type === 'element') {
        if (RAW_TEXT.has(child.tag)) continue;
        if (child.tag === 'br') out += ' ';
        rec(child);
      }
    }
  };
  rec(node);
  return normalise(out);
}

/** Text of a node's own text descendants, excluding the given child tags. */
export function textExcluding(node, excludeTags) {
  if (!node) return null;
  const skip = new Set(excludeTags);
  let out = '';
  const rec = (n) => {
    for (const child of n.children ?? []) {
      if (child.type === 'text') { if (!child.raw) out += decodeEntities(child.value); }
      else if (child.type === 'element' && !skip.has(child.tag) && !RAW_TEXT.has(child.tag)) rec(child);
    }
  };
  rec(node);
  return normalise(out);
}

export function normalise(s) {
  if (s == null) return null;
  return s.replace(/\s+/g, ' ').trim();
}

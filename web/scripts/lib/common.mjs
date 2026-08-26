/**
 * Shared extraction helpers for the Topcat legacy site.
 * Every helper is lossless-biased: when a node cannot be typed it is kept as
 * raw HTML under { type: 'html' } so the caller can report it rather than
 * silently dropping copy.
 */
import {
  attr, byClass, byTag, childEls, decodeEntities, find, findAll, firstClass,
  firstTag, hasClass, innerHTML, normalise, text,
} from './minidom.mjs';

/* ---------------------------------------------------------------- head --- */

export function extractSeo(root) {
  const head = firstTag(root, 'head');
  if (!head) return null;
  const metas = byTag(head, 'meta');
  const meta = (name) => {
    const m = metas.find((n) => attr(n, 'name') === name);
    return m ? attr(m, 'content') : null;
  };
  const prop = (p) => {
    const m = metas.find((n) => attr(n, 'property') === p);
    return m ? attr(m, 'content') : null;
  };
  const links = byTag(head, 'link');
  const linkHref = (rel) => {
    const l = links.find((n) => attr(n, 'rel') === rel);
    return l ? attr(l, 'href') : null;
  };
  return {
    title: text(firstTag(head, 'title')),
    description: meta('description'),
    robots: meta('robots'),
    canonical: linkHref('canonical'),
    lang: attr(firstTag(root, 'html'), 'lang'),
    og: {
      type: prop('og:type'),
      title: prop('og:title'),
      description: prop('og:description'),
      url: prop('og:url'),
      siteName: prop('og:site_name'),
      image: prop('og:image'),
      imageWidth: prop('og:image:width'),
      imageHeight: prop('og:image:height'),
    },
    twitterCard: meta('twitter:card'),
    stylesheets: links
      .filter((n) => attr(n, 'rel') === 'stylesheet')
      .map((n) => attr(n, 'href')),
    preloadFonts: links
      .filter((n) => attr(n, 'rel') === 'preload' && attr(n, 'as') === 'font')
      .map((n) => attr(n, 'href')),
  };
}

export function extractJsonLd(root, ctx) {
  const out = [];
  for (const s of byTag(root, 'script')) {
    if (attr(s, 'type') !== 'application/ld+json') continue;
    const raw = s.children.map((c) => c.value ?? '').join('');
    try {
      out.push(JSON.parse(raw));
    } catch (err) {
      ctx?.warn(`invalid application/ld+json: ${err.message}`);
    }
  }
  return out;
}

/* ------------------------------------------------------------ fragments --- */

/** A heading, keeping the <em>/<span class="h1-gold"> accent word intact. */
export function heading(node) {
  if (!node) return null;
  const accentEl = find(node, (n) => n.tag === 'em' || hasClass(n, 'h1-gold'));
  const out = { text: text(node), html: innerHTML(node) };
  if (accentEl) out.accent = text(accentEl);
  const style = attr(node, 'style');
  if (style) out.style = style;
  return out;
}

/** A paragraph: plain text plus the inner HTML (some carry inline links). */
export function para(node) {
  if (!node) return null;
  const t = text(node);
  const h = innerHTML(node);
  return h !== t ? { text: t, html: h } : { text: t };
}

export function image(img) {
  if (!img) return null;
  const srcset = (attr(img, 'srcset') || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((entry) => {
      const parts = entry.split(/\s+/);
      return { url: parts[0], descriptor: parts[1] ?? null };
    });
  const out = {
    src: attr(img, 'src'),
    alt: attr(img, 'alt') ?? '',
  };
  if (srcset.length) out.srcset = srcset;
  const sizes = attr(img, 'sizes');
  if (sizes) out.sizes = sizes;
  for (const k of ['loading', 'decoding', 'width', 'height']) {
    const v = attr(img, k);
    if (v) out[k] = v;
  }
  return out;
}

/** Buttons inside a .cta-row, keeping the long/short responsive labels. */
export function ctaRow(node) {
  if (!node) return null;
  return childEls(node)
    .filter((n) => n.tag === 'a' || n.tag === 'button')
    .map((a) => {
      const long = find(a, (n) => hasClass(n, 'cta-long'));
      const short = find(a, (n) => hasClass(n, 'cta-short'));
      const out = { href: attr(a, 'href'), label: text(a) };
      if (long) out.labelLong = text(long);
      if (short) out.labelShort = text(short);
      // The two spans are breakpoint alternatives, so the concatenated text()
      // ("Get your free quoteGet a free quote") is never a real label. The long
      // form is the desktop default.
      if (long && short) out.label = out.labelLong;
      const cls = attr(a, 'class') || '';
      if (cls.includes('btn-gold')) out.variant = 'gold';
      else if (cls.includes('btn-ghost')) out.variant = 'ghost';
      return out;
    });
}

export function heroChips(node) {
  if (!node) return null;
  return childEls(node).map((chip) => {
    const cls = (attr(chip, 'class') || '').split(/\s+/).filter((c) => c !== 'chip');
    const mark = find(chip, (n) => hasClass(n, 'chip-mk'));
    const legacy = find(chip, (n) => hasClass(n, 'chip-legacy'));
    // .chip-legacy is the narrow-viewport alternative rendering of the same
    // chip; it trails the markup, so trim it off the chip's own text.
    let label = text(chip);
    const legacyText = legacy ? text(legacy) : null;
    if (legacyText && label.endsWith(legacyText)) {
      label = label.slice(0, label.length - legacyText.length).trim();
    }
    const out = { kind: cls[0] ?? null, text: label };
    if (mark) out.mark = text(mark);
    if (legacyText) out.legacy = legacyText;
    if (hasClass(chip, 'chip-google')) {
      const score = find(chip, (n) => hasClass(n, 'g-score'));
      const word = find(chip, (n) => hasClass(n, 'g-word'));
      out.google = { word: text(word), score: text(score) };
    }
    return out;
  });
}

export function breadcrumbs(root) {
  const nav = find(root, (n) => n.tag === 'nav' && hasClass(n, 'crumb'));
  if (!nav) return null;
  const back = find(nav, (n) => hasClass(n, 'crumb-back'));
  const items = byTag(nav, 'li').map((li) => {
    const a = firstTag(li, 'a');
    return {
      name: text(li),
      href: a ? attr(a, 'href') : null,
      current: attr(li, 'aria-current') === 'page',
    };
  });
  return {
    back: back ? { href: attr(back, 'href'), label: attr(back, 'aria-label') } : null,
    items,
  };
}

/** The side enquiry form (aside.lead-aside > form.qform). Varies per page. */
export function enquiryForm(root) {
  const form = find(root, (n) => n.tag === 'form' && hasClass(n, 'qform'));
  if (!form) return null;
  const select = firstTag(form, 'select');
  const submit = firstTag(form, 'button');
  return {
    id: attr(form, 'id'),
    heading: heading(firstTag(form, 'h3')),
    sub: para(find(form, (n) => hasClass(n, 'qf-sub'))),
    fields: byTag(form, 'input').map((i) => ({
      id: attr(i, 'id'),
      name: attr(i, 'name'),
      type: attr(i, 'type'),
      placeholder: attr(i, 'placeholder'),
      autocomplete: attr(i, 'autocomplete'),
      label: labelFor(form, attr(i, 'id')),
    })),
    select: select
      ? {
        id: attr(select, 'id'),
        name: attr(select, 'name'),
        label: labelFor(form, attr(select, 'id')),
        options: byTag(select, 'option').map((o) => text(o)),
      }
      : null,
    submitLabel: submit ? text(submit) : null,
    note: text(find(form, (n) => hasClass(n, 'qf-note'))),
    done: text(find(form, (n) => hasClass(n, 'qf-done'))),
  };
}

function labelFor(scope, id) {
  if (!id) return null;
  const l = find(scope, (n) => n.tag === 'label' && attr(n, 'for') === id);
  return l ? text(l) : null;
}

/* ---------------------------------------------------------- typed items --- */

export function table(tableEl) {
  const caption = firstTag(tableEl, 'caption');
  const thead = firstTag(tableEl, 'thead');
  const columns = thead
    ? byTag(thead, 'th').map((th) => text(th))
    : [];
  const bodyRows = findAll(tableEl, (n) => n.tag === 'tr')
    .filter((tr) => !thead || !isWithin(tr, thead))
    .map((tr) => {
      const rowHeader = find(tr, (n) => n.tag === 'th');
      const cells = byTag(tr, 'td').map((td) => text(td));
      return rowHeader ? { header: text(rowHeader), cells } : { cells };
    });
  return {
    type: 'table',
    caption: caption ? text(caption) : null,
    columns,
    rows: bodyRows,
  };
}

function isWithin(node, ancestor) {
  let p = node.parent;
  while (p) { if (p === ancestor) return true; p = p.parent; }
  return false;
}

export function faqItems(grid) {
  return childEls(grid)
    .filter((d) => d.tag === 'details')
    .map((d) => {
      const summary = firstTag(d, 'summary');
      const answer = find(d, (n) => hasClass(n, 'a'));
      const a = { question: text(summary), answer: text(answer) };
      const html = innerHTML(answer);
      if (html !== a.answer) a.answerHtml = html;
      return a;
    });
}

export function stoneTiles(grid) {
  return childEls(grid)
    .filter((a) => a.tag === 'a')
    .map((a) => {
      const href = attr(a, 'href');
      const nameEl = find(a, (n) => hasClass(n, 'stile-name'));
      const supEl = find(a, (n) => hasClass(n, 'stile-sup'));
      const tagEl = find(a, (n) => hasClass(n, 'stile-tag'));
      const out = { slug: slugFromHref(href), href };
      // Field order follows the source markup (tag, name, finish) so that
      // flattening a tile reproduces the rendered reading order.
      if (tagEl) out.materialLabel = text(tagEl);
      out.name = text(nameEl);
      out.finish = supEl ? text(supEl) : null;
      out.image = image(firstTag(a, 'img'));
      if (attr(a, 'aria-label')) out.ariaLabel = attr(a, 'aria-label');
      const data = {};
      for (const [k, v] of Object.entries(a.attrs)) {
        if (k.startsWith('data-')) data[k.slice(5)] = v;
      }
      if (Object.keys(data).length) out.data = data;
      return out;
    });
}

export function slugFromHref(href) {
  if (!href) return null;
  const clean = href.split('?')[0].split('#')[0].replace(/\/+$/, '');
  const last = clean.split('/').pop();
  return last ? last.replace(/\.html$/, '') : null;
}

/* -------------------------------------------------------------- blocks --- */

/**
 * Turn one child node of a section's .wrap into a typed content item.
 * Returns null for nodes the caller has already consumed.
 */
function typeNode(node, ctx) {
  const tag = node.tag;
  const cls = classesOf(node);

  if (tag === 'h1' || tag === 'h2' || tag === 'h3' || tag === 'h4') {
    return { type: 'heading', level: Number(tag[1]), ...heading(node) };
  }

  if (tag === 'p') {
    if (cls.includes('byline')) {
      const reviewed = find(node, (n) => hasClass(n, 'reviewed'));
      return {
        type: 'byline',
        text: text(node),
        author: normalise(text(node).replace(text(reviewed) ?? '', '')),
        reviewed: reviewed ? text(reviewed) : null,
      };
    }
    const kind = cls.includes('sub') || cls.includes('section-sub') ? 'sub'
      : cls.includes('note') ? 'note'
        : cls.includes('lede') ? 'lede'
          : cls.includes('price-line') ? 'priceLine'
            : cls.includes('st-source') ? 'sourceNote'
              : cls.includes('cta-note') ? 'ctaNote'
                : cls.includes('st-count') ? 'count'
                  : 'paragraph';
    const item = { type: kind, ...para(node) };
    if (cls.length) item.classes = cls;
    // Some subs carry long/short responsive variants in nested spans.
    const long = find(node, (n) => classesOf(n).some((c) => /-long$/.test(c)));
    const short = find(node, (n) => classesOf(n).some((c) => /-short$/.test(c)));
    if (long && short) { item.textLong = text(long); item.textShort = text(short); }
    return item;
  }

  if (tag === 'div' && cls.includes('prose')) {
    const variant = cls.find((c) => c !== 'prose' && c !== 'rise') ?? null;
    const item = { type: 'prose', paragraphs: byTag(node, 'p').map(para) };
    if (variant) item.variant = variant;
    return item;
  }

  if (tag === 'div' && cls.includes('feat-grid')) {
    return {
      type: 'features',
      items: childEls(node).map((f) => ({
        title: text(firstTag(f, 'h3')),
        body: text(firstTag(f, 'p')),
      })),
    };
  }

  if (tag === 'div' && cls.includes('steps')) {
    return {
      type: 'steps',
      items: childEls(node).map((s) => ({
        step: text(find(s, (n) => hasClass(n, 'n'))),
        title: text(firstTag(s, 'h3')),
        body: text(firstTag(s, 'p')),
      })),
    };
  }

  if (tag === 'ul' && cls.includes('ticks')) {
    return {
      type: 'ticks',
      items: byTag(node, 'li').map((li) => {
        const strong = firstTag(li, 'strong');
        if (!strong) return { body: text(li) };
        const full = text(li);
        const title = text(strong);
        return { title, body: normalise(full.slice(title.length)) };
      }),
    };
  }

  if (tag === 'div' && cls.includes('mats')) {
    return {
      type: 'linkChips',
      items: childEls(node).map((a) => {
        const note = find(a, (n) => hasClass(n, 'mat-note'));
        const label = note
          ? normalise(text(a).slice(0, text(a).length - text(note).length))
          : text(a);
        const out = { label, href: attr(a, 'href') };
        if (note) out.note = text(note);
        return out;
      }),
    };
  }

  if (tag === 'div' && cls.includes('appgrid')) {
    return {
      type: 'appGrid',
      items: childEls(node).map((a) => ({
        title: text(firstTag(a, 'h3')),
        body: text(firstTag(a, 'p')),
        href: attr(a, 'href'),
      })),
    };
  }

  if (tag === 'div' && cls.includes('mgrid')) {
    return {
      type: 'cardGrid',
      items: childEls(node).map((a) => {
        const go = find(a, (n) => hasClass(n, 'mcard-go'));
        const kicker = find(a, (n) => hasClass(n, 'eyebrow') || hasClass(n, 'mg-k'));
        const card = {
          title: text(firstTag(a, 'h3')),
          body: text(firstTag(a, 'p')),
          href: attr(a, 'href'),
        };
        if (kicker) card.kicker = text(kicker);
        if (go) card.cta = text(go);
        return card;
      }),
    };
  }

  if (tag === 'ul' && cls.includes('rel')) {
    return {
      type: 'linkList',
      variant: cls.includes('two-up') ? 'two-up' : null,
      items: byTag(node, 'li').map((li) => {
        const a = firstTag(li, 'a');
        return { label: text(li), href: a ? attr(a, 'href') : null };
      }),
    };
  }

  if (tag === 'ul' && cls.includes('chips')) {
    return { type: 'chips', items: byTag(node, 'li').map((li) => text(li)) };
  }

  if (tag === 'ul' || tag === 'ol') {
    return {
      type: tag === 'ul' ? 'list' : 'orderedList',
      items: byTag(node, 'li').map((li) => para(li)),
    };
  }

  if (tag === 'dl' && cls.includes('facts')) {
    const items = [];
    for (const wrapper of childEls(node)) {
      const dt = firstTag(wrapper, 'dt');
      const dd = firstTag(wrapper, 'dd');
      if (dt && dd) items.push({ label: text(dt), value: text(dd) });
    }
    return { type: 'facts', items };
  }

  if (tag === 'div' && cls.includes('tbl-wrap')) {
    const t = firstTag(node, 'table');
    return t ? table(t) : null;
  }
  if (tag === 'table') return table(node);

  if (tag === 'div' && cls.includes('faq-grid')) {
    return { type: 'faq', items: faqItems(node) };
  }

  if (tag === 'div' && cls.includes('cta-row')) {
    return { type: 'ctaRow', items: ctaRow(node) };
  }

  if (tag === 'div' && cls.includes('cta-inline')) {
    return {
      type: 'ctaInline',
      line: heading(find(node, (n) => hasClass(n, 'ci-line'))),
      sub: para(find(node, (n) => hasClass(n, 'ci-sub'))),
      ctas: ctaRow(find(node, (n) => hasClass(n, 'cta-row'))),
    };
  }

  if (tag === 'div' && cls.includes('rel-cols')) {
    return {
      type: 'relatedColumns',
      columns: childEls(node).map((col) => ({
        title: text(find(col, (n) => hasClass(n, 'foot-k'))),
        links: (firstClass(col, 'rel') ? byTag(firstClass(col, 'rel'), 'li') : []).map((li) => {
          const a = firstTag(li, 'a');
          return { label: text(li), href: a ? attr(a, 'href') : null };
        }),
      })),
    };
  }

  if (tag === 'div' && cls.includes('st-grid')) {
    return { type: 'stoneTiles', variant: cls.includes('related') ? 'related' : null, items: stoneTiles(node) };
  }

  if (tag === 'div' && cls.includes('trust')) {
    return { type: 'trust', items: childEls(node).map((s) => para(s)) };
  }

  if (tag === 'div' && cls.includes('hero-chips')) {
    return { type: 'heroChips', items: heroChips(node) };
  }

  if (tag === 'figure') {
    const img = firstTag(node, 'img');
    const cap = firstTag(node, 'figcaption');
    return {
      type: 'figure',
      classes: cls,
      image: image(img),
      caption: cap ? text(cap) : null,
    };
  }

  if (tag === 'img') return { type: 'image', ...image(node) };

  if (tag === 'a') {
    return {
      type: 'link',
      label: text(node),
      href: attr(node, 'href'),
      classes: cls,
    };
  }

  if (tag === 'button') {
    return { type: 'button', label: text(node), id: attr(node, 'id'), classes: cls, ariaLabel: attr(node, 'aria-label') };
  }

  if (tag === 'input' || tag === 'select' || tag === 'textarea') {
    return {
      type: 'field',
      tag,
      id: attr(node, 'id'),
      name: attr(node, 'name'),
      inputType: attr(node, 'type'),
      placeholder: attr(node, 'placeholder'),
      ariaLabel: attr(node, 'aria-label'),
      options: tag === 'select' ? byTag(node, 'option').map((o) => text(o)) : undefined,
    };
  }

  if (SKIP_TAGS.has(tag)) return null;

  // Unclassified container: recurse so its copy is still typed, keeping the
  // wrapper's classes/id for layout fidelity.
  if (CONTAINER_TAGS.has(tag)) {
    const kids = childEls(node);
    if (kids.length) {
      const inner = [];
      for (const child of kids) {
        const item = typeNode(child, ctx);
        if (item) inner.push(item);
      }
      // Text that sits directly inside the container, outside any child element.
      const own = ownText(node);
      const group = { type: 'group', tag, classes: cls, content: inner };
      const id = attr(node, 'id');
      if (id) group.id = id;
      if (own) group.text = own;
      return group;
    }
  }

  // Leaf we do not recognise: keep the markup so nothing is lost.
  const html = innerHTML(node);
  const t = text(node);
  if (!html && !t) return null;
  // Text-only leaf: unambiguous, no need to flag.
  if (html === t) return { type: 'text', tag, classes: cls, text: t };
  ctx?.warn(`unclassified <${tag} class="${attr(node, 'class') ?? ''}"> kept as raw html`);
  return { type: 'html', tag, classes: cls, text: t, html };
}

const SKIP_TAGS = new Set(['script', 'style', 'svg', 'nav', 'form', 'aside', 'noscript', 'label', 'br', 'hr']);
const CONTAINER_TAGS = new Set(['div', 'article', 'section', 'span', 'header', 'footer', 'main', 'li']);

function ownText(node) {
  let out = '';
  for (const child of node.children ?? []) {
    if (child.type === 'text' && !child.raw) out += decodeEntities(child.value);
  }
  return normalise(out) || null;
}

function classesOf(node) {
  const c = attr(node, 'class');
  return c ? c.split(/\s+/).filter(Boolean) : [];
}

/**
 * Typed representation of one <section>. `.wrap` is unwrapped transparently.
 */
export function sectionBlock(section, ctx) {
  const cls = classesOf(section);
  const region = ancestorClass(section, 'lead-main') ? 'lead-main' : 'main';
  const wrap = find(section, (n) => hasClass(n, 'wrap')) ?? section;

  // svc-hero carries its background, breadcrumb and chips outside .wrap.
  const bg = find(section, (n) => hasClass(n, 'svc-hero-bg'));

  const content = [];
  for (const child of childEls(wrap)) {
    if (child.tag === 'nav' || child.tag === 'form' || child.tag === 'aside') continue;
    if (hasClass(child, 'hero-chips')) continue;
    const item = typeNode(child, ctx);
    if (item) content.push(item);
  }

  const block = {
    kind: sectionKind(cls),
    classes: cls,
    region,
    content,
  };
  if (bg) {
    const style = attr(bg, 'style') || '';
    const url = /url\(\s*['"]?([^'")]+)['"]?\s*\)/.exec(style);
    block.background = url ? url[1] : style;
  }
  const chips = find(section, (n) => hasClass(n, 'hero-chips'));
  if (chips) block.chips = heroChips(chips);
  const id = attr(section, 'id');
  if (id) block.id = id;
  return block;
}

function sectionKind(cls) {
  if (cls.includes('svc-hero')) return 'hero';
  if (cls.includes('st-hero')) return 'hero';
  if (cls.includes('page-head')) return 'pageHead';
  if (cls.includes('cta-band')) return 'ctaBand';
  if (cls.includes('faq')) return 'faq';
  if (cls.includes('cta-inline-wrap')) return 'ctaInline';
  if (cls.includes('st-controls')) return 'stoneControls';
  if (cls.includes('st-gridwrap')) return 'stoneGrid';
  return 'block';
}

function ancestorClass(node, name) {
  let p = node.parent;
  while (p) { if (hasClass(p, name)) return true; p = p.parent; }
  return false;
}

/** Every <section> under <main>, in document order, as typed blocks. */
export function mainBlocks(root, ctx) {
  const main = firstTag(root, 'main');
  if (!main) { ctx?.warn('no <main> element'); return []; }
  return findAll(main, (n) => n.tag === 'section').map((s) => sectionBlock(s, ctx));
}

export { byClass, byTag, find, findAll, firstClass, firstTag, attr, text, innerHTML, hasClass, childEls, normalise };

/**
 * The block renderer shared by `/materials/` and the five `/materials/*.html`
 * pages.
 *
 * The six legacy files are the same handful of section shapes in different
 * orders, and the extractor already records which shape each one is. So there
 * is one switch here and no per-page markup anywhere: a section is
 * `<section class="{classes}"><div class="wrap">…</div></section>` and its
 * children come from `content[]`, in order.
 *
 * WHY `<div class="wrap">` IS UNCONDITIONAL. Every `section.block`,
 * `section.faq` and `section.cta-band` in all six files wraps its children in
 * exactly one `.wrap`, and content.css:262 (`.faq .faq-grid`), :260
 * (`.faq>.wrap>h2`) and the `.lead-grid .block .wrap` override at :312 are all
 * written against that nesting. Flattening it would silently change the
 * measure of every paragraph on the page.
 *
 * NO `.rise` ANYWHERE. Unlike /trade/ and the stone pages, not one section in
 * materials/ carries the reveal class — the source ships these pages visible.
 * Do not add <RiseObserver/> here: with no `.rise` elements it would do
 * nothing, and with them it would introduce a fade the client never had.
 */
import { Rich } from '@/components/chrome/Rich';
import type { MaterialBlock, MaterialContent, MaterialStones } from '@/lib/materials';

/* -------------------------------------------------------------------------
   The pieces
   ------------------------------------------------------------------------- */

/**
 * `dl.facts`. The `<div class="fact">` between the `<dl>` and its `<dt>`/`<dd>`
 * pairs is not decoration — seo.css:23 makes `.facts` a grid and `.facts .fact`
 * the cell, so each pair has to be wrapped to become one grid item. It is also
 * valid: a `<div>` grouping a dt/dd run is exactly what the spec allows.
 */
function Facts({ items }: { items: { label: string; value: string }[] }) {
  return (
    <dl className="facts">
      {items.map((fact) => (
        <div className="fact" key={fact.label}>
          <dt>{fact.label}</dt>
          <dd>{fact.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** `.appgrid` — "Not only kitchens", the nine service cross-links. */
function AppGrid({ items }: { items: { title: string; body: string; href: string }[] }) {
  return (
    <div className="appgrid">
      {items.map((item) => (
        <a className="app" href={item.href} key={item.href}>
          <h3>{item.title}</h3>
          <p>{item.body}</p>
        </a>
      ))}
    </div>
  );
}

/** `.mgrid` — the hub's five material cards. */
function CardGrid({
  items,
}: {
  items: { title: string; body: string; href: string; cta: string }[];
}) {
  return (
    <div className="mgrid">
      {items.map((item) => (
        <a className="mcard" href={item.href} key={item.href}>
          <h3>{item.title}</h3>
          <p>{item.body}</p>
          <span className="mcard-go">{item.cta}</span>
        </a>
      ))}
    </div>
  );
}

/** `.steps` — "How it works", six numbered cards. */
function Steps({ items }: { items: { step: string; title: string; body: string }[] }) {
  return (
    <div className="steps">
      {items.map((item) => (
        <div className="step" key={item.step}>
          <div className="n">{item.step}</div>
          <h3>{item.title}</h3>
          <p>{item.body}</p>
        </div>
      ))}
    </div>
  );
}

/**
 * `.rel-cols` — the Related columns, plus the stones column this port adds.
 *
 * The extracted columns are rendered first and unchanged, so "Other materials"
 * and "Guides worth reading" keep their source order and their copy. The
 * stones column is appended as a third `<div>`; `.rel-cols` is
 * `repeat(auto-fit,minmax(260px,1fr))` (seo.css:88), so it takes the extra
 * child without a stylesheet change and wraps on narrow screens.
 */
function RelatedColumns({
  columns,
  stones,
}: {
  columns: { title: string; links: { label: string; href: string }[] }[];
  stones?: MaterialStones | null;
}) {
  return (
    <div className="rel-cols">
      {columns.map((column) => (
        <div key={column.title}>
          <p className="foot-k">{column.title}</p>
          <ul className="rel">
            {column.links.map((link) => (
              <li key={link.href}>
                <a href={link.href}>{link.label}</a>
              </li>
            ))}
          </ul>
        </div>
      ))}
      {stones ? (
        <div>
          <p className="foot-k">{stones.familyLabel} stones</p>
          <ul className="rel">
            {stones.links.map((link) => (
              <li key={link.href}>
                <a href={link.href}>{link.name}</a>
              </li>
            ))}
            <li>
              <a href={stones.more.href}>{stones.more.label}</a>
            </li>
          </ul>
        </div>
      ) : null}
    </div>
  );
}

/**
 * `.faq-grid` — plain `<details>`/`<summary>`, no JavaScript.
 *
 * NOT the home page's <Faq/>. That one is `section.faq-section#faq`: a
 * twelve-question index with a measured, re-parenting answer plate and a
 * controller behind it. This is the SEO shell's own FAQ block, and the source
 * ships it as native disclosure widgets — content.css:264-284 styles them,
 * including hiding the default marker and drawing its own chevron. Swapping in
 * the rich component would change the markup Google reads.
 *
 * `<div class="a">` is the answer wrapper the CSS pads (content.css:284).
 */
function FaqGrid({ items }: { items: { question: string; answer: string }[] }) {
  return (
    <div className="faq-grid">
      {items.map((item) => (
        <details key={item.question}>
          <summary>{item.question}</summary>
          <div className="a">{item.answer}</div>
        </details>
      ))}
    </div>
  );
}

/** `.cta-row` — `.btn-gold` / `.btn-ghost`, with the two responsive labels. */
export function MaterialCtaRow({
  ctas,
}: {
  ctas: { href: string; label: string; labelLong?: string; labelShort?: string; variant: string }[];
}) {
  return (
    <div className="cta-row">
      {ctas.map((cta) => (
        <a
          className={cta.variant === 'gold' ? 'btn-gold' : 'btn-ghost'}
          href={cta.href}
          key={`${cta.variant}:${cta.href}`}
        >
          {/*
            Two spans, not one label. content.css shows `.cta-long` and hides
            `.cta-short` above 720px and swaps them below, so "Call 0800 098
            2812" becomes "Give us a call" on a phone. Both must be in the
            markup for the CSS to have anything to choose between.
          */}
          <span className="cta-long">{cta.labelLong ?? cta.label}</span>
          <span className="cta-short">{cta.labelShort ?? cta.label}</span>
        </a>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------
   The switch
   ------------------------------------------------------------------------- */

function Content({
  item,
  stones,
}: {
  item: MaterialContent;
  stones?: MaterialStones | null;
}) {
  switch (item.type) {
    case 'heading':
      // Always an <h1> or an <h2>; the source uses no deeper level in a block.
      return <Rich as={item.level === 1 ? 'h1' : 'h2'} value={item} />;
    case 'lede':
      return <Rich as="p" className="lede" value={item} />;
    case 'paragraph':
      return <Rich as="p" value={item} />;
    case 'note':
      return <Rich as="p" className="note" value={item} />;
    case 'ctaNote':
      return <Rich as="p" className="cta-note" value={item} />;
    case 'priceLine':
      // Carries `<strong>Cost:</strong>` — html, never text.
      return <Rich as="p" className="price-line" value={item} />;
    case 'prose':
      return (
        <div className={item.variant ? `prose ${item.variant}` : 'prose'}>
          {item.paragraphs.map((p) => (
            <Rich as="p" key={p.text} value={p} />
          ))}
        </div>
      );
    case 'facts':
      return <Facts items={item.items} />;
    case 'ticks':
      return (
        <ul className="ticks">
          {item.items.map((tick) => (
            <li key={tick.body}>{tick.body}</li>
          ))}
        </ul>
      );
    case 'steps':
      return <Steps items={item.items} />;
    case 'appGrid':
      return <AppGrid items={item.items} />;
    case 'cardGrid':
      return <CardGrid items={item.items} />;
    case 'relatedColumns':
      return <RelatedColumns columns={item.columns} stones={stones} />;
    case 'faq':
      return <FaqGrid items={item.items} />;
    case 'ctaRow':
      return <MaterialCtaRow ctas={item.items} />;
    default:
      /*
        An unknown `type` means the extractor grew a shape this renderer has
        not been taught. Dropping it silently would lose copy off a page that
        ranks, so fail the build instead — `pnpm build` prerenders every one of
        these routes, so this throws in CI, not in front of a visitor.
      */
      throw new Error(
        `MaterialBlocks: unhandled content type "${(item as { type: string }).type}"`,
      );
  }
}

/** One `<section>`, with its `.wrap` and its children in source order. */
export function MaterialSection({
  block,
  stones,
}: {
  block: MaterialBlock;
  stones?: MaterialStones | null;
}) {
  return (
    <section className={block.classes.join(' ')}>
      <div className="wrap">
        {block.content.map((item, i) => (
          <Content key={`${item.type}:${i}`} item={item} stones={stones} />
        ))}
      </div>
    </section>
  );
}

/** A run of sections. */
export function MaterialBlocks({
  blocks,
  stones,
}: {
  blocks: MaterialBlock[];
  stones?: MaterialStones | null;
}) {
  return (
    <>
      {blocks.map((block, i) => (
        <MaterialSection key={`${block.kind}:${i}`} block={block} stones={stones} />
      ))}
    </>
  );
}

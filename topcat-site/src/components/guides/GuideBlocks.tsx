/**
 * The guide document renderer — one component per extracted node type.
 *
 * The nine articles and the hub are all built from the same eleven node types
 * (see src/lib/guides.ts), so the markup for each lives here once and both
 * routes walk the same list. Nothing in this file is guide-specific; if the
 * materials and worktops families land on the same extractor shape they render
 * through it unchanged.
 *
 * ---------------------------------------------------------------------------
 * WHAT IS DELIBERATELY *NOT* HERE
 * ---------------------------------------------------------------------------
 * No `.rise` classes and no <RiseObserver>. The stone and trade archetypes
 * fade their sections in; the guides do not — checked against all ten saved
 * live responses, which carry no `rise` class anywhere. Adding one would be a
 * redesign, and on a long editorial page it is a visible one.
 *
 * No wrapper divs beyond what the source has. `.wrap` is a max-width column
 * and `.lead-grid` is a two-column grid; an extra div between them changes
 * what the grid is laying out.
 */
import { Rich } from '@/components/chrome/Rich';
import type {
  GuideBlock,
  GuideByline,
  GuideCardGrid,
  GuideCtaNote,
  GuideCtaRow,
  GuideFaqList,
  GuideHeading,
  GuideLede,
  GuideNode,
  GuideParagraph,
  GuideProse,
  GuideRelatedColumns,
  GuideTable,
} from '@/lib/guides';

/* -------------------------------------------------------------------------
   Leaf nodes
   ------------------------------------------------------------------------- */

/**
 * `h1` … `h6`, from the extracted level.
 *
 * THE LEVEL CARRIES THE SEO. These are long-form articles that rank on their
 * heading hierarchy, so it is mapped straight through rather than derived from
 * position: h1 once per page, h2 for every body section, and the `<em>` gold
 * word rendered from `html` by <Rich> so a word that repeats in the sentence
 * cannot be emphasised twice.
 */
function GuideHeadingNode({ node }: { node: GuideHeading }) {
  const level = Math.min(Math.max(node.level ?? 2, 1), 6);
  return <Rich as={`h${level}` as 'h2'} value={node} />;
}

/**
 * `p.byline`.
 *
 * Two parts, not one string: seo.css puts a hairline and a colour change on
 * `.byline .reviewed` (`border-left:1px solid var(--hair);color:var(--faint)`),
 * so the review date has to be its own element.
 */
function GuideBylineNode({ node }: { node: GuideByline }) {
  return (
    <p className="byline">
      {node.author} <span className="reviewed">{node.reviewed}</span>
    </p>
  );
}

/**
 * `div.prose`, plus `lead-answer` on the opening block of all nine guides.
 *
 * `.lead-answer` is what hangs the vertical gold rule beside the answer and
 * lifts the type to `clamp(16px,1.35vw,19px)` — it is the "straight answer
 * first" device the whole guide family is written around, so the variant must
 * reach the DOM as a second class rather than being folded into `.prose`.
 */
function GuideProseNode({ node }: { node: GuideProse }) {
  return (
    <div className={node.variant ? `prose ${node.variant}` : 'prose'}>
      {node.paragraphs.map((p, i) => (
        <Rich key={i} as="p" value={p} />
      ))}
    </div>
  );
}

/**
 * `div.tbl-wrap > table.tbl` — the comparison tables.
 *
 * `.tbl-wrap` is not decoration: `.tbl` sets `min-width:520px`, so without the
 * `overflow-x:auto` wrapper the table pushes the whole page sideways on a
 * phone. Six of the seven tables are wider than a phone.
 *
 * The first column is a row-header column — `columns[0]` is its `<th
 * scope="col">` (empty on four of the seven tables, which is the source's own
 * choice for a comparison matrix) and each row's `header` is its `<th
 * scope="row">`. That is what makes the table navigable in a screen reader,
 * and it is why `columns.length === cells.length + 1`.
 */
function GuideTableNode({ node }: { node: GuideTable }) {
  return (
    <div className="tbl-wrap">
      <table className="tbl">
        <caption>{node.caption}</caption>
        <thead>
          <tr>
            {node.columns.map((column, i) => (
              <th key={i} scope="col">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {node.rows.map((row) => (
            <tr key={row.header}>
              <th scope="row">{row.header}</th>
              {row.cells.map((cell, i) => (
                <td key={i}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * `div.faq-grid` — native `<details>`, NOT the home page's <Faq> widget.
 *
 * These are two different components with the same name in the source. The
 * home page has a twelve-question tab index with a measured, height-locked
 * answer plate that re-parents itself below 760px (components/sections/Faq.tsx).
 * The guides have three to five `<details>` in a two-column grid, styled by
 * content.css §`.faq details`, with no JavaScript at all. Reaching for the
 * other one here would swap a static accordion for a stateful widget and lose
 * the open-by-default-on-print behaviour `<details>` gives for free.
 */
function GuideFaqNode({ node }: { node: GuideFaqList }) {
  return (
    <div className="faq-grid">
      {node.items.map((item) => (
        <details key={item.question}>
          <summary>{item.question}</summary>
          <div className="a">{item.answer}</div>
        </details>
      ))}
    </div>
  );
}

/**
 * `div.rel-cols` — the "More guides" / "Materials" columns.
 *
 * `p.foot-k` is the gold column label, borrowed from the footer's key style;
 * it is a paragraph in the source, not a heading, and that is correct — it
 * would otherwise inject an h3 into the middle of the article's h1/h2 spine
 * for what is a list label.
 */
function GuideRelatedColumnsNode({ node }: { node: GuideRelatedColumns }) {
  return (
    <div className="rel-cols">
      {node.columns.map((column) => (
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
    </div>
  );
}

/**
 * `div.cta-row`.
 *
 * Both buttons carry TWO labels — `.cta-long` and `.cta-short` — and
 * content.css swaps them at the narrow breakpoint ("Get your free quote" ->
 * "Get a free quote", "Call 0800 098 2812" -> "Give us a call"). Collapsing
 * them to one string loses the phone wording; the CSS then has nothing to
 * hide and the button overflows its row.
 */
function GuideCtaRowNode({ node }: { node: GuideCtaRow }) {
  return (
    <div className="cta-row">
      {node.items.map((cta) => (
        <a
          key={`${cta.variant}:${cta.href}`}
          className={cta.variant === 'gold' ? 'btn-gold' : 'btn-ghost'}
          href={cta.href}
        >
          {cta.labelLong && cta.labelShort ? (
            <>
              <span className="cta-long">{cta.labelLong}</span>
              <span className="cta-short">{cta.labelShort}</span>
            </>
          ) : (
            cta.label
          )}
        </a>
      ))}
    </div>
  );
}

/** `p.cta-note` — the guarantee line under the CTA row. */
function GuideCtaNoteNode({ node }: { node: GuideCtaNote }) {
  return <p className="cta-note">{node.text}</p>;
}

/** `p.lede` — the hub's standfirst. */
function GuideLedeNode({ node }: { node: GuideLede }) {
  return <Rich as="p" className="lede" value={node} />;
}

/**
 * `div.mgrid` of `a.mcard` — the hub's nine cards.
 *
 * The whole card is the anchor, as in the source, so the hit target is the
 * card and not just the title. `span.mcard-go` is the gold "Read the guide"
 * affordance; it must stay a span inside that anchor rather than becoming a
 * second link, which would put two tab stops on one card.
 *
 * The card title is an `h3`, not an `h2`: the hub's spine is h1 ("Worktop
 * guides") then the CTA band's h2, and the cards sit under the h1.
 */
function GuideCardGridNode({ node }: { node: GuideCardGrid }) {
  return (
    <div className="mgrid">
      {node.items.map((card) => (
        <a key={card.href} className="mcard" href={card.href}>
          <h3>{card.title}</h3>
          <p>{card.body}</p>
          <span className="mcard-go">{card.cta}</span>
        </a>
      ))}
    </div>
  );
}

/** A bare `<p>` — only the CTA band's sub-line uses one. */
function GuideParagraphNode({ node }: { node: GuideParagraph }) {
  return <Rich as="p" value={node} />;
}

/* -------------------------------------------------------------------------
   Dispatch
   ------------------------------------------------------------------------- */

/**
 * One content node.
 *
 * The switch is exhaustive over `GuideNode` and the default arm is typed
 * `never`, so adding a twelfth node type to the extractor is a TYPE ERROR here
 * rather than a node that silently vanishes from nine pages.
 */
export function GuideContent({ node }: { node: GuideNode }) {
  switch (node.type) {
    case 'heading':
      return <GuideHeadingNode node={node} />;
    case 'byline':
      return <GuideBylineNode node={node} />;
    case 'prose':
      return <GuideProseNode node={node} />;
    case 'table':
      return <GuideTableNode node={node} />;
    case 'faq':
      return <GuideFaqNode node={node} />;
    case 'relatedColumns':
      return <GuideRelatedColumnsNode node={node} />;
    case 'paragraph':
      return <GuideParagraphNode node={node} />;
    case 'ctaRow':
      return <GuideCtaRowNode node={node} />;
    case 'ctaNote':
      return <GuideCtaNoteNode node={node} />;
    case 'lede':
      return <GuideLedeNode node={node} />;
    case 'cardGrid':
      return <GuideCardGridNode node={node} />;
    default: {
      const unreachable: never = node;
      return unreachable;
    }
  }
}

/**
 * One `<section>` — `.block`, `.faq` or `.cta-band`, each wrapping its content
 * in the site's `.wrap` column.
 *
 * The class list comes from the data rather than from `kind`, because
 * content.css keys off the class: `section.block::before` and
 * `section.faq:not(.block)::before` draw the hairline between sections, and
 * `.cta-band` is a full-bleed band. Deriving the class here would be inventing
 * it twice.
 */
export function GuideSection({ block }: { block: GuideBlock }) {
  return (
    <section className={block.classes.join(' ')}>
      <div className="wrap">
        {block.content.map((node, i) => (
          <GuideContent key={i} node={node} />
        ))}
      </div>
    </section>
  );
}

/** A run of sections, in source order. */
export function GuideSections({ blocks }: { blocks: GuideBlock[] }) {
  return (
    <>
      {blocks.map((block, i) => (
        <GuideSection key={i} block={block} />
      ))}
    </>
  );
}

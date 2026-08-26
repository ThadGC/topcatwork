/**
 * The /worktops/ block renderer.
 *
 * All nine live pages are built from the same fifteen content nodes in
 * different orders, so this is one renderer over `locations.json` rather than
 * nine hand-written page bodies. The node list is closed — every `type` the
 * extractor emits has a case below, and an unknown one is a build error, not a
 * silently dropped section.
 *
 * ---------------------------------------------------------------------------
 * WHY THE BLOCK LIST IS WALKED RATHER THAN SLICED
 * ---------------------------------------------------------------------------
 * The county and town pages interleave two regions:
 *
 *   <main>
 *     section.svc-hero                      region "main"   (rendered by the page)
 *     <div class="lead-grid">
 *       <div class="lead-main"> 7 x section.block </div>    region "lead-main"
 *       <aside class="lead-aside"> form.qform </aside>
 *     </div>
 *     section.faq                           region "main"
 *     section.block                         region "main"   ← AFTER the FAQ
 *     section.cta-band                      region "main"
 *   </main>
 *
 * That trailing `section.block` is why the regions cannot be partitioned into
 * "lead-main first, main after": DOM order is the data's order. Consecutive
 * `lead-main` blocks are grouped into one `.lead-grid`, everything else is a
 * direct child of `<main>`, and the aside is attached to the first (and only)
 * group. `.lead-grid` is a two-column grid above 1121px and `.lead-aside` is
 * `display:none` below it, so the sticky form appears exactly where the live
 * CSS puts it.
 */
import { Rich } from '@/components/chrome/Rich';
import type {
  LocationBlock,
  LocationCta,
  LocationNode,
  LocationRichText,
} from '@/lib/locations';

import type { ReactNode } from 'react';

/* --- ctas --------------------------------------------------------------- */

/**
 * `.cta-row` — the same pair on every page, and the two labels are BOTH in
 * the markup. `.cta-long`/`.cta-short` are swapped by CSS at the narrow
 * breakpoint, so rendering only one of them loses the phone wording.
 */
export function CtaRow({ ctas }: { ctas: LocationCta[] }) {
  return (
    <div className="cta-row">
      {ctas.map((cta) => (
        <a
          key={`${cta.variant}:${cta.href}`}
          className={cta.variant === 'gold' ? 'btn-gold' : 'btn-ghost'}
          href={cta.href}
        >
          <span className="cta-long">{cta.labelLong}</span>
          <span className="cta-short">{cta.labelShort}</span>
        </a>
      ))}
    </div>
  );
}

/* --- nodes -------------------------------------------------------------- */

function joinClasses(...parts: (string | undefined | false)[]): string {
  return parts.filter(Boolean).join(' ');
}

function Node({ node }: { node: LocationNode }) {
  switch (node.type) {
    case 'heading': {
      const value: LocationRichText = { text: node.text, html: node.html };
      /*
        `style` is only ever `margin-top:2rem`, on the towns' second h2
        ("Nearby towns"). It is an inline attribute in the source, so it is
        carried as one rather than promoted to a class that the legacy CSS
        does not have.
      */
      if (node.style) {
        return (
          <h2
            style={{ marginTop: '2rem' }}
            {...(value.html && value.html !== value.text
              ? { dangerouslySetInnerHTML: { __html: value.html } }
              : { children: value.text })}
          />
        );
      }
      return <Rich as={node.level === 1 ? 'h1' : 'h2'} value={value} />;
    }

    case 'lede':
      return <Rich as="p" className="lede" value={node} />;

    case 'paragraph':
      return <Rich as="p" value={node} />;

    case 'note':
      return <Rich as="p" className="note" value={node} />;

    case 'ctaNote':
      return <Rich as="p" className="cta-note" value={node} />;

    case 'prose':
      return (
        <div className={joinClasses('prose', node.variant)}>
          {node.paragraphs.map((paragraph, i) => (
            <Rich as="p" key={i} value={paragraph} />
          ))}
        </div>
      );

    case 'linkList':
      /*
        Rendered even when empty — Berkshire has no town pages and the live
        page still ships `<ul class="rel two-up"></ul>`. Dropping it would
        change the block's first-child spacing.
      */
      return (
        <ul className={joinClasses('rel', node.variant)}>
          {node.items.map((item) => (
            <li key={item.href}>
              <a href={item.href}>{item.label}</a>
            </li>
          ))}
        </ul>
      );

    case 'chips':
      return (
        <ul className="chips">
          {node.items.map((chip) => (
            <li key={chip}>{chip}</li>
          ))}
        </ul>
      );

    case 'ticks':
      return (
        <ul className="ticks">
          {node.items.map((tick) => (
            <li key={tick.body}>{tick.body}</li>
          ))}
        </ul>
      );

    case 'table':
      /*
        `.tbl` has `min-width:520px`, so the wrapper's `overflow-x:auto` is
        what keeps the price table from widening the page on a phone. The
        row headers are `<th scope="row">`, not `<td>`: seo.css styles
        `.tbl tbody th` differently from `.tbl td`.
      */
      return (
        <div className="tbl-wrap">
          <table className="tbl">
            <caption>{node.caption}</caption>
            <thead>
              <tr>
                {node.columns.map((column) => (
                  <th key={column} scope="col">
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

    case 'steps':
      return (
        <div className="steps">
          {node.items.map((step) => (
            <div className="step" key={step.step}>
              <div className="n">{step.step}</div>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </div>
          ))}
        </div>
      );

    case 'appGrid':
      return (
        <div className="appgrid">
          {node.items.map((item) => (
            <a className="app" key={item.href} href={item.href}>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </a>
          ))}
        </div>
      );

    case 'cardGrid':
      /* The hub's four county cards. `.mcard-go` is the gold kicker line. */
      return (
        <div className="mgrid">
          {node.items.map((item) => (
            <a className="mcard" key={item.href} href={item.href}>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
              <span className="mcard-go">{item.cta}</span>
            </a>
          ))}
        </div>
      );

    case 'ctaRow':
      return <CtaRow ctas={node.items} />;

    case 'faq':
      /*
        Native `<details>`, not the home page's <Faq/> controller. These are
        two different components in the source: the SEO pages ship plain
        disclosure widgets that work with JavaScript off, which is the point
        of them.
      */
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

    default: {
      const exhaustive: never = node;
      throw new Error(
        `Unhandled /worktops/ content node: ${JSON.stringify(exhaustive)}`,
      );
    }
  }
}

export function LocationNodes({ nodes }: { nodes: LocationNode[] }) {
  return (
    <>
      {nodes.map((node, i) => (
        <Node key={i} node={node} />
      ))}
    </>
  );
}

/* --- sections ----------------------------------------------------------- */

/**
 * One `<section>`. Every block on these pages wraps its content in `.wrap`,
 * which is service.css's max-width column; inside `.lead-grid` that wrap is
 * flattened to `max-width:none;padding:0` by content.css, so the same markup
 * serves both regions.
 */
function Section({ block }: { block: LocationBlock }) {
  return (
    <section className={block.classes.join(' ')}>
      <div className="wrap">
        <LocationNodes nodes={block.content} />
      </div>
    </section>
  );
}

export function LocationBlocks({
  blocks,
  aside,
}: {
  blocks: LocationBlock[];
  /** `<aside class="lead-aside">`; omitted on the hub, which has no form. */
  aside?: ReactNode;
}) {
  const out: ReactNode[] = [];
  let i = 0;

  while (i < blocks.length) {
    const block = blocks[i];

    if (block.region !== 'lead-main') {
      out.push(<Section key={i} block={block} />);
      i += 1;
      continue;
    }

    // One run of lead-main blocks -> one .lead-grid with the sticky aside.
    const run: LocationBlock[] = [];
    const start = i;
    while (i < blocks.length && blocks[i].region === 'lead-main') {
      run.push(blocks[i]);
      i += 1;
    }
    out.push(
      <div className="lead-grid" key={`lead-${start}`}>
        <div className="lead-main">
          {run.map((child, j) => (
            <Section key={j} block={child} />
          ))}
        </div>
        {aside}
      </div>,
    );
  }

  return <>{out}</>;
}

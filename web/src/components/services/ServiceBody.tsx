import { Rich } from '@/components/chrome/Rich';
import type { BodyBlock, ContentNode } from '@/lib/services';

import { ServiceCtaRow } from './ServiceCtaRow';

/* ==========================================================================
   The body of a service page — eight `<section>`s built from eight node
   types.

   All nine pages share one skeleton and differ only in copy, which is why
   this is a renderer over `service.body` rather than nine hand-written
   pages. The section signature, verified against the saved live HTML for all
   nine:

     block   [paragraph …]                       the intro, `.wrap.prose.rise`
     block   [heading, sub, features]            "What we make"
     block   [heading, sub, linkChips]           "The materials"
     ctaInline                                   enquiry prompt 1
     block   [heading, sub, steps]               "How it works"
     block   [heading, ticks]                    "Why Topcat"
     ctaInline                                   enquiry prompt 2
     block   [heading, sub]                      "Areas we cover"
     block   [heading, sub, linkChips]  (main)   "More of what we do"

   Only the intro varies in length — two paragraphs on six pages, three on
   bathroom-worktops, dining-tables and vanity-tops — and nothing below reads
   a fixed count.
   ========================================================================== */

/**
 * `.wrap.prose.rise` vs `.wrap.rise`.
 *
 * `prose` is on exactly one section per page: the paragraph-only intro. It is
 * derived rather than carried, because the extractor records the `<section>`
 * classes and not the inner `<div>`'s — and the derivation is exact, since a
 * paragraph-only block is the only place the source uses `prose` on any of
 * the nine pages. `.prose p` (content.css:214) is what sets the 70ch measure
 * and the 15.5px reading size; get this wrong and the intro renders at the
 * section default instead.
 */
function wrapClass(content: ContentNode[]): string {
  const allProse = content.length > 0 && content.every((n) => n.type === 'paragraph');
  return allProse ? 'wrap prose rise' : 'wrap rise';
}

function Node({ node }: { node: ContentNode }) {
  switch (node.type) {
    case 'paragraph':
      return <p>{node.text}</p>;

    case 'heading':
      /* `<h2>What we <em>make</em></h2>` — the gold word is inline markup,
         so it goes through <Rich> rather than being rebuilt from `accent`. */
      return <Rich as="h2" value={node} />;

    case 'sub':
      return <Rich as="p" className="sub" value={node} />;

    case 'features':
      return (
        <div className="feat-grid">
          {node.items.map((item) => (
            <div className="feat" key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </div>
          ))}
        </div>
      );

    case 'linkChips':
      /*
        `.mats` carries two different link shapes and both are the source's:
        the material chips point at absolute URLs (`/stones/`), the
        cross-sell chips at bare filenames (`kitchen-islands.html`). The
        relative ones resolve against `/services/<slug>.html`, i.e. to
        `/services/kitchen-islands.html`, which is the exported path under
        `trailingSlash: false`. Left exactly as found — rewriting them to
        absolute would be a change with no upside and one more thing to get
        wrong.

        `.mat-note` must stay INSIDE the <a> and must not be preceded by any
        text: content.css:240 draws the "·" separator with
        `.mats a .mat-note::before`, so a literal separator here would
        double it.
      */
      return (
        <div className="mats">
          {node.items.map((item) => (
            <a href={item.href} key={item.label}>
              {item.label}
              {item.note ? <span className="mat-note">{item.note}</span> : null}
            </a>
          ))}
        </div>
      );

    case 'steps':
      return (
        <div className="steps">
          {node.items.map((item) => (
            <div className="step" key={item.step}>
              <div className="n">{item.step}</div>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </div>
          ))}
        </div>
      );

    case 'ticks':
      /*
        `<li><strong>One accountable team</strong>One contract and …</li>` —
        the body text is a bare sibling of the <strong>, with no wrapper and
        no whitespace between them. `.ticks li strong{display:block}` is what
        puts it on its own line, so introducing a <span> or a space here
        would change the rendered gap.
      */
      return (
        <ul className="ticks">
          {node.items.map((item) => (
            <li key={item.title}>
              <strong>{item.title}</strong>
              {item.body}
            </li>
          ))}
        </ul>
      );

    case 'ctaInline':
      return (
        <div className="cta-inline">
          <div className="ci-copy">
            <Rich as="p" className="ci-line" value={node.line} />
            <Rich as="p" className="ci-sub" value={node.sub} />
          </div>
          <ServiceCtaRow ctas={node.ctas} />
        </div>
      );
  }
}

export function ServiceSection({ block }: { block: BodyBlock }) {
  return (
    <section className={block.classes.join(' ')}>
      <div className={wrapClass(block.content)}>
        {block.content.map((node, i) => (
          <Node key={`${node.type}-${i}`} node={node} />
        ))}
      </div>
    </section>
  );
}

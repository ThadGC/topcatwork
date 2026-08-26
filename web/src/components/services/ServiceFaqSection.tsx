import { Rich } from '@/components/chrome/Rich';
import type { ServiceFaq } from '@/lib/services';

/**
 * `section.block.faq` — the four-question accordion at the foot of each
 * service page.
 *
 * ⚠️ NOT `<Faq/>` from components/sections. That one is the home page's
 * `section.faq-section#faq`: twelve questions in four groups, a plate that
 * is re-parented in the DOM below 760px, and a keyboard controller in
 * site.js. This is the content-styled family's version and has no JavaScript
 * at all — native `<details>`/`<summary>`, styled by content.css:262-284,
 * two columns above 901px and one below.
 *
 * Two details that are easy to lose:
 *
 *   - `div.faq-grid` is required. `.faq details` gets its border and
 *     background from the section, but the two-column layout is
 *     `.faq .faq-grid{grid-template-columns:1fr 1fr}`, so dropping the
 *     wrapper leaves a single stacked column at every width. (/trade/'s FAQ
 *     genuinely has no grid — that is a different page, not a precedent.)
 *   - the answer is `div.a`, not `<p>`. `.faq .a` carries the padding that
 *     stops the open panel colliding with the summary.
 *
 * There is no `id="faq"` on these sections; the footer's bare `#faq` link is
 * a dead anchor on all nine pages, exactly as it is in the source.
 */
export function ServiceFaqSection({ faq }: { faq: ServiceFaq }) {
  return (
    <section className="block faq">
      <div className="wrap rise">
        <Rich as="h2" value={faq.heading} />
        <div className="faq-grid">
          {faq.items.map((item) => (
            <details key={item.question}>
              <summary>{item.question}</summary>
              <div className="a">{item.answer}</div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

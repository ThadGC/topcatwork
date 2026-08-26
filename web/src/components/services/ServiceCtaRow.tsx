import type { Cta } from '@/lib/services';

/**
 * `.cta-row` — the gold/ghost button pair, as the content-styled pages write
 * it.
 *
 * ⚠️ NOT the same markup as the stone pages' CtaRow. Every CTA on the nine
 * service pages carries TWO labels:
 *
 *   <a class="btn-gold" href="/contact/">
 *     <span class="cta-long">Get your free quote</span>
 *     <span class="cta-short">Get a free quote</span>
 *   </a>
 *
 * and service.css picks one — `.cta-short{display:none}` until 420px, where
 * it swaps. Collapsing them to a single label would silently change the copy
 * on a phone, which is where most of this traffic lands, so both are always
 * emitted. `label` is the fallback for a CTA the extractor found with only
 * one form; none of the 54 on these pages is like that today.
 */
export function ServiceCtaRow({ ctas }: { ctas: Cta[] }) {
  return (
    <div className="cta-row">
      {ctas.map((cta) => (
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

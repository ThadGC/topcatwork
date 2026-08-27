'use client';

import { useReveal } from '@/hooks/useReveal';

/**
 * `aside.trade-prompt` — index.html:4245, between the enquiry card and the
 * footer.
 *
 * The only `<aside>` on the page, and correctly so: it is a note to a
 * different audience (builders, developers, kitchen designers) rather than
 * part of the enquiry flow it follows.
 *
 * It carries `.rise` and is its own reveal root, because the reveal observer
 * is scoped to a subtree and this element is not inside any section. `.rise`
 * on the root itself is handled — see useReveal's sweep.
 */
export default function TradePrompt() {
  const ref = useReveal<HTMLElement>();

  return (
    <aside className="trade-prompt rise" aria-label="For the trade" ref={ref}>
      <span className="tp-mark" aria-hidden="true" />
      <p className="tp-copy">
        Are you a builder, developer or kitchen designer? We work to your
        programme, with terms that hold.
      </p>
      <a className="tp-link" href="/trade/">
        See our trade page <span aria-hidden="true">&rsaquo;</span>
      </a>
    </aside>
  );
}

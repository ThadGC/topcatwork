'use client';

import {
  Fragment,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import { FAQS, faqGroups } from '@/data/home/faqs';

/**
 * `section.faq-section#faq` — index.html:4156, controller at site.js:2601.
 *
 * An index of twelve questions in four groups on the left, one answer plate on
 * the right. Two things about it are easy to get wrong on a port:
 *
 * 1. THE PLATE MOVES IN THE DOM. Above 760px it sits at the end of
 *    `.faq-body`, beside the index. At or below 760px it is re-parented to sit
 *    *directly after the selected question*, so the answer opens inline like
 *    an accordion (site.js:2650 `place()`). That is a genuine DOM move, not a
 *    CSS reorder — `.faq-body` is a grid and there is no grid position that
 *    puts one element after an arbitrary sibling.
 *
 * 2. NOTHING IS SELECTED ON PHONES. `faqPhone()` reads `--faqMode` (which CSS
 *    sets to `phone` at ≤720px) and starts with the accordion shut, adding
 *    `.faq-shut` to the section; every other width opens question 0 on load.
 *    Tapping the open question on a phone closes it again — the only place
 *    the plate can be dismissed.
 *
 * Note the two breakpoints are different on purpose: 760px moves the plate,
 * 720px decides whether anything is open. Both are the source's.
 */

const GROUPS = faqGroups();
/** site.js:2606 — group index and row per question, precomputed for the arrow keys. */
const GROUP_OF: number[] = [];
const POS_IN_GROUP: number[] = [];
GROUPS.forEach((g, gi) =>
  g.items.forEach((i, row) => {
    GROUP_OF[i] = gi;
    POS_IN_GROUP[i] = row;
  }),
);

export default function Faq() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const indexRef = useRef<HTMLDivElement | null>(null);
  const bodyRef = useRef<HTMLDivElement | null>(null);
  const plateRef = useRef<HTMLDivElement | null>(null);
  const tagRef = useRef<HTMLSpanElement | null>(null);
  const qRef = useRef<HTMLHeadingElement | null>(null);
  const aRef = useRef<HTMLParagraphElement | null>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // -1 means "shut" — the phone default, and what tapping the open question
  // returns to.
  const [cur, setCur] = useState(0);
  const [narrow, setNarrow] = useState(false);

  const faqPhone = useCallback(
    () =>
      !!sectionRef.current &&
      getComputedStyle(sectionRef.current).getPropertyValue('--faqMode').trim() ===
        'phone',
    [],
  );

  /* -------------------------------------------------- mode + first open */

  useEffect(() => {
    const mq = matchMedia('(max-width:760px)');
    const sync = () => setNarrow(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    // site.js:2717 — shut on phones, question 0 everywhere else. This has to
    // run after mount because it reads a computed custom property.
    if (faqPhone()) setCur(-1);
    const onResize = () => {
      if (!faqPhone()) setCur((c) => (c < 0 ? 0 : c));
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [faqPhone]);

  /* ------------------------------------------------------- fp-in replay */

  useEffect(() => {
    const plate = plateRef.current;
    if (!plate || cur < 0) return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    // site.js:2675 — remove, force reflow, re-add. Without the reflow the
    // class never leaves the style recalc and the animation does not replay.
    plate.classList.remove('fp-in');
    void plate.offsetWidth;
    plate.classList.add('fp-in');
  }, [cur]);

  /* -------------------------------------------------------- plate lock */

  /**
   * site.js:2678 `lockPlate` — pin the plate to the height of the tallest
   * answer so selecting a different question does not resize the column and
   * shove the page around.
   *
   * It has to be measured, because the answers are prose of unequal length in
   * a fluid-width column. Only the wide layout needs it; in the accordion the
   * plate is between two questions and growing is the correct behaviour.
   */
  const lockPlate = useCallback(() => {
    const plate = plateRef.current;
    const tag = tagRef.current;
    const q = qRef.current;
    const a = aRef.current;
    if (!plate || !tag || !q || !a) return;

    if (matchMedia('(max-width:760px)').matches) {
      plate.style.minHeight = '';
      return;
    }

    const t0 = tag.textContent;
    const q0 = q.textContent;
    const a0 = a.textContent;
    const wasIn = plate.classList.contains('fp-in');
    plate.classList.remove('fp-in');
    plate.style.minHeight = '0px';

    let max = 0;
    for (const f of FAQS) {
      tag.textContent = f.tag;
      q.textContent = f.q;
      a.textContent = f.a;
      if (plate.offsetHeight > max) max = plate.offsetHeight;
    }

    tag.textContent = t0;
    q.textContent = q0;
    a.textContent = a0;
    plate.style.minHeight = max + 'px';
    if (wasIn) plate.classList.add('fp-in');
  }, []);

  // Layout effect: measure before the browser paints, or the plate is briefly
  // the height of question 0's answer and then jumps.
  useLayoutEffect(() => {
    lockPlate();
    let t: ReturnType<typeof setTimeout>;
    const relock = () => {
      clearTimeout(t);
      t = setTimeout(lockPlate, 120);
    };
    window.addEventListener('resize', relock);
    // Web fonts land after first paint and change every line box.
    document.fonts?.ready.then(lockPlate).catch(() => {});
    return () => {
      clearTimeout(t);
      window.removeEventListener('resize', relock);
    };
  }, [lockPlate, narrow]);

  /* -------------------------------------------------- index reveal (.in) */

  useEffect(() => {
    const idx = indexRef.current;
    if (!idx) return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      idx.classList.add('in');
      return;
    }
    // site.js:2724 — `boundingClientRect.top < 0` keeps the index revealed
    // once it has scrolled off the top, instead of un-revealing on the way
    // back down the page.
    const io = new IntersectionObserver(
      (es) =>
        es.forEach((e) =>
          idx.classList.toggle(
            'in',
            e.isIntersecting || e.boundingClientRect.top < 0,
          ),
        ),
      { rootMargin: '0px 0px -12% 0px' },
    );
    io.observe(idx);
    return () => io.disconnect();
  }, []);

  /* ------------------------------------------------------------- input */

  const onTab = (i: number) => {
    if (faqPhone() && i === cur) setCur(-1);
    else setCur(i);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (cur < 0) return;
    const n = FAQS.length;
    let k: number | null = null;
    if (e.key === 'ArrowDown') k = (cur + 1) % n;
    else if (e.key === 'ArrowUp') k = (cur - 1 + n) % n;
    else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      // Left/right jump between groups, holding the row where possible.
      const dir = e.key === 'ArrowRight' ? 1 : -1;
      const g = GROUPS[(GROUP_OF[cur] + dir + GROUPS.length) % GROUPS.length];
      k = g.items[Math.min(POS_IN_GROUP[cur], g.items.length - 1)];
    } else if (e.key === 'Home') k = 0;
    else if (e.key === 'End') k = n - 1;
    if (k === null) return;
    e.preventDefault();
    setCur(k);
    tabRefs.current[k]?.focus();
  };

  const f = cur >= 0 ? FAQS[cur] : null;

  const plate = (
    <div
      className="faq-plate"
      id="faqPanel"
      role="region"
      aria-live="polite"
      aria-labelledby={cur >= 0 ? 'faqQ' + cur : undefined}
      ref={plateRef}
    >
      <div className="fp-head">
        <span className="fp-tag" id="fpTag" ref={tagRef}>
          {f?.tag ?? ''}
        </span>
        <h3 className="fp-q" id="fpQ" ref={qRef}>
          {f?.q ?? ''}
        </h3>
        <span className="fp-rule" aria-hidden="true" />
      </div>
      <p className="fp-a" id="fpA" ref={aRef}>
        {f?.a ?? ''}
      </p>
    </div>
  );

  return (
    <section
      className={'faq-section' + (cur < 0 ? ' faq-shut' : '')}
      id="faq"
      ref={sectionRef}
    >
      <div className="faq-header">
        <h2 className="faq-title">
          Frequently asked <em>questions</em>
        </h2>
        <p className="faq-sub">
          The questions we are asked most, answered straight.
        </p>
      </div>

      <div className="faq-body" id="faqBody" ref={bodyRef}>
        <div
          className="faq-index"
          id="faqIndex"
          ref={indexRef}
          onKeyDown={onKeyDown}
        >
          {GROUPS.map((g, gi) => (
            <div className="faq-group" key={g.name}>
              <h3 className="faq-gk" style={{ ['--gi' as string]: gi }}>
                {g.name}
              </h3>
              {g.items.map((i) => (
                /*
                  A Fragment, not a wrapper element: `.faq-q` buttons are
                  direct children of `.faq-group` in the source, and the plate
                  is re-parented in beside them. Any real wrapper here would
                  change what `.faq-group`'s layout is laying out.
                */
                <Fragment key={i}>
                  <button
                    type="button"
                    className={'faq-q' + (i === cur ? ' on' : '')}
                    id={'faqQ' + i}
                    aria-controls="faqPanel"
                    aria-label={FAQS[i].q}
                    aria-expanded={i === cur}
                    aria-current={i === cur ? 'true' : undefined}
                    style={{ ['--fi' as string]: i }}
                    ref={(node) => {
                      tabRefs.current[i] = node;
                    }}
                    onClick={() => onTab(i)}
                  >
                    <span className="faq-dot" aria-hidden="true" />
                    <span className="faq-qt">{FAQS[i].label}</span>
                    <span className="faq-qf" aria-hidden="true">
                      {FAQS[i].q}
                    </span>
                  </button>
                  {/* The accordion position: plate directly under its question. */}
                  {narrow && i === cur ? plate : null}
                </Fragment>
              ))}
            </div>
          ))}
        </div>

        {/* The wide position: plate as the second column of .faq-body. */}
        {!narrow ? plate : null}
      </div>

      <p className="faq-foot">
        Something we have not covered? <a href="#cta">Ask us directly</a> or call{' '}
        <a href="tel:+448000982812">0800 098 2812</a>.
      </p>
    </section>
  );
}

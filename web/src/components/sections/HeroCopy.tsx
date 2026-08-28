import type { CSSProperties } from 'react';

import { HeroChips } from '@/components/sections/HeroChips';

/**
 * `.hero-copy` — index.html:3667. The page's own hero block: the h1, the
 * lede, the two CTAs and the four trust chips.
 *
 * WHY THIS LIVES WITH THE SECTIONS AND NOT WITH THE HERO. The hero takes the
 * copy as `children` and renders it into its `.inner` slot — the hero owns the
 * frame, the page owns the words. That was the film's API and <HeroStill>
 * keeps it, so this is the caller holding up its end, not a section reaching
 * into the hero.
 *
 * THE ENTRANCE STAGGER (restored, D460). Every element in
 * the legacy block carries `hero-el` with an inline `--hd` stagger
 * (180/340/560/720/880ms), released by `.hero.loaded .hl > .hero-el`.
 *
 * That selector wants the global `.hero` class, which the ported section does
 * not carry — it is styled by a CSS module and keeps only `id="hero"` — so the
 * rules are re-keyed onto `#hero.loaded` in globals.css.
 *
 * ⛔ WITH THE FILM STRIPPED OUT (28 Aug 2026) THIS STAGGER IS THE HERO'S ONLY
 * ENTRANCE, and <HeroStill> is what adds `loaded`. The film used to add the
 * same class at 93% of its runway and suppress the stagger while it ran, so
 * the copy arrived as one object at the handoff rather than cascading twice.
 * Whatever replaces the film has to do one or the other.
 *
 * `.hl` stays: it is `display:block; overflow:hidden` and is what puts the
 * two title lines on their own rows.
 *
 * THE `{' '}` BETWEEN THE TWO `.hl` SPANS IS LOAD-BEARING (D461). Source
 * markup puts the spans on separate lines (index.html:3695-3696); HTML
 * collapses that newline, so the h1's text is "Surfaces worth building
 * around". JSX strips whitespace between adjacent elements, which welded the
 * lines into "Surfaces worthbuilding around" — measured, not guessed:
 *
 *   textContent  old "Surfaces worth building around" / new (broken) "…worthbuilding…"
 *   selection    same, so copy-paste and any crawler reading text lost the space
 *   innerText    "Surfaces worth\nbuilding around" on both — unaffected
 *   accName      "Surfaces worth building around" on both — also unaffected,
 *                because Chrome's AX tree separates block-level descendants
 *
 * So this is a text/SEO/selection bug, NOT a screen-reader one, and it is
 * invisible on screen because `.hl` is `display:block` and already breaks the
 * rows. That same `display:block` is why the space costs nothing in layout:
 * a whitespace-only text node between two block boxes is discarded, and the
 * h1 measures 873.6x167.961 either way. Do not delete it.
 *
 * THE TWO LEDES AND THE TWO CTA LABELS are both always in the markup. CSS
 * picks one — `.hs-wide` / `.hs-phone` and `.cta-long` / `.cta-short` — and
 * the short forms are separately written copy, not the long ones truncated.
 */
/*
 * `#cineTrust` — the two chips that rode the hero film's wide-band wipe,
 * alongside the film's own hero block — WAS HERE. ⛔ Removed 28 Aug 2026 with
 * the film: with no wipe there is nothing for them to ride, and the four
 * `.hero-chips` below are the page's own trust row. The markup is preserved in
 * ~/Documents/TOPCAT-FILM-SPEC/code-snapshot and in git history at 621927e.
 */

export default function HeroCopy() {
  return (
    <div className="hero-copy">
      <h1 className="hero-title">
        <span className="hl">
          <span className="hero-el" style={{ '--hd': '180ms' } as CSSProperties}>
            Surfaces worth
          </span>
        </span>{' '}
        <span className="hl">
          <span className="hero-el" style={{ '--hd': '340ms' } as CSSProperties}>
            <em>building around</em>
          </span>
        </span>
      </h1>
      <p className="hero-sub hero-el" style={{ '--hd': '560ms' } as CSSProperties}>
        <span className="hs-wide">
          Chosen from the slab you approve, fitted by us{' '}
          <span className="nowrap">across England and the British Isles.</span>
        </span>
        <span className="hs-phone">
          Quartz, granite and marble worktops, chosen with you and fitted by
          our own team.
        </span>
      </p>
      <div className="hero-ctas hero-el" style={{ '--hd': '720ms' } as CSSProperties}>
        <a href="/contact/" className="btn-gold">
          <span className="cta-long">Get your free quote</span>
          <span className="cta-short">Get a free quote</span>
        </a>
        {/*
          Two call CTAs, one shown per band: `tel:` on mobile where it dials,
          and an in-page jump to the enquiry form on desktop where it would
          not.
        */}
        <a
          href="tel:+448000982812"
          className="btn-ghost hero-call-mobile"
        >
          <span className="cta-long">Give us a call</span>
          <span className="cta-short">Give us a call</span>
        </a>
        <a href="#cta" className="btn-ghost hero-call-desktop">
          Request a call
        </a>
      </div>
      {/* `glow` is the site-chrome variant: these chips take the cursor glow. */}
      <HeroChips glow hd="880ms" />
    </div>
  );
}

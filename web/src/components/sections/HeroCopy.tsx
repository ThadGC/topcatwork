import { HeroChips } from '@/components/sections/HeroChips';

/**
 * `.hero-copy` — index.html:3667. The page's own hero block: the h1, the
 * lede, the two CTAs and the four trust chips.
 *
 * WHY THIS LIVES WITH THE SECTIONS AND NOT WITH THE FILM. `<HeroFilm>` takes
 * the hero copy as `children` and renders it into its `.inner` slot — the
 * film owns the runway, the scrub and the handoff; the page owns the words.
 * That is the film's own API (see src/components/HeroFilm/index.ts), so this
 * is the caller holding up its end, not a section reaching into the hero.
 *
 * ONE DEPARTURE FROM THE SOURCE MARKUP, and it is forced. Every element in
 * the legacy block carries `hero-el` with an inline `--hd` stagger
 * (180/340/560/720/880ms). `.hero-el` is `opacity:0` until
 * `.hero.loaded .hl > .hero-el` releases it (site.css:1772), and that
 * selector needs the global `.hero` class — which the ported film no longer
 * has, because its section is styled by a CSS module and keeps only
 * `id="hero"`. The film holds the whole `.inner` back instead and reveals it
 * in one move at the 93% handoff (HeroFilm.module.css:1045), so the per-line
 * stagger has nothing to release it.
 *
 * Carrying `hero-el` anyway would leave the headline permanently invisible.
 * The class and the `--hd` values are therefore omitted here, and the
 * matching CSS is omitted from the extraction — see the note in
 * scripts/extract-home-css.mjs. If the film later ports the stagger, both
 * come back together.
 *
 * `.hl` stays: it is `display:block; overflow:hidden` and is what puts the
 * two title lines on their own rows.
 *
 * THE TWO LEDES AND THE TWO CTA LABELS are both always in the markup. CSS
 * picks one — `.hs-wide` / `.hs-phone` and `.cta-long` / `.cta-short` — and
 * the short forms are separately written copy, not the long ones truncated.
 */
/**
 * `#cineTrust` — index.html:3648. The two chips that ride the film's wide-band
 * wipe alongside the cine hero block.
 *
 * NOT the same block as `.hero-chips` below, and the differences are all
 * deliberate: two chips instead of four, and no `.chip-legacy` fallback,
 * because the band is a fixed-width wipe with room for exactly this much.
 * `.g-stack` also drops the `aria-hidden` it carries in `.hero-chips` — the
 * film's own `.trust` wrapper already hides the whole subtree, so repeating
 * it here would be noise.
 *
 * `<HeroFilm trust={…}>` takes it, for the same reason it takes the hero
 * copy: chips are design-system components, not film.
 */
export function CineTrust() {
  return (
    <>
      <span className="chip chip-google glow-card">
        <svg
          className="g-mark"
          viewBox="0 0 48 48"
          aria-hidden="true"
          focusable="false"
        >
          <path
            fill="#EA4335"
            d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
          />
          <path
            fill="#4285F4"
            d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
          />
          <path
            fill="#FBBC05"
            d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
          />
          <path
            fill="#34A853"
            d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
          />
        </svg>
        <span className="g-stack">
          <span className="g-word">Google reviews</span>
          <span className="g-rating">
            <b className="g-score">5.0</b>
            <span className="g-stars">★★★★★</span>
          </span>
        </span>
      </span>
      <span className="chip chip-guarantee glow-card">
        <b className="chip-mk">10</b> year guarantee
      </span>
    </>
  );
}

export default function HeroCopy() {
  return (
    <div className="hero-copy">
      <h1 className="hero-title">
        <span className="hl">Surfaces worth</span>
        <span className="hl">
          <em>building around</em>
        </span>
      </h1>
      <p className="hero-sub">
        <span className="hs-wide">
          Chosen from the slab you approve, fitted by us{' '}
          <span className="nowrap">across England and the British Isles.</span>
        </span>
        <span className="hs-phone">
          Quartz, granite and marble worktops, chosen with you and fitted by
          our own team.
        </span>
      </p>
      <div className="hero-ctas">
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
      <HeroChips glow />
    </div>
  );
}

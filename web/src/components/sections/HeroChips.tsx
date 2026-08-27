/**
 * `.hero-chips` — the four trust chips: the Google rating, the guarantee,
 * the aftercare window and the free home visit.
 *
 * TWO DIFFERENCES BETWEEN THE TWO CHROMES, and `glow` selects both, because
 * across the 29 live pages that carry this row they correlate exactly — the
 * six site-styled pages have both, the twenty-three content-styled ones have
 * neither:
 *
 *   1. `glow-card` on each chip. site.js attaches a pointer-tracking glow to
 *      that class, and only the site-styled pages load site.js.
 *   2. `<b>` around the stars inside `.chip-legacy`. site.css:1128 styles
 *      `.chip b` gold at 11.5px; service.css has no such rule and the source
 *      writes the stars bare there.
 *
 * So `glow` is really "this is a Family-A page". The prop keeps its original
 * name because four call sites already pass it.
 *
 * `.chip-legacy` is the fallback the CSS shows when the stacked Google layout
 * cannot fit; both are always in the markup and CSS picks one. Inside a
 * `#hero` or a `.svc-hero` it is clipped to a screen-reader line, which is
 * why difference 2 is invisible on nearly every page that has it — invisible,
 * but still a difference from what the host serves, so it is reproduced.
 *
 * ---------------------------------------------------------------------------
 * CHANGE REQUEST #3 (26 Aug) — CHECKED HERE, NOTHING TO DO
 * ---------------------------------------------------------------------------
 * The request is that the hero chip row be these four and only these four:
 *
 *     Google reviews · 10 year guarantee · 72 hour aftercare · Free home visit
 *
 * That is already exactly what this component emits, and it is why nothing in
 * it changed. Counting nodes in the rendered hero gives SIX `<span>` inside
 * `.hero-chips`, and the two extras are NOT chips:
 *
 *     `.g-stack > .g-word`  the visible "Google reviews" line, and
 *     `.chip-legacy`        the same rating as one screen-reader line,
 *                           clipped to 1px by the `#hero`/`.svc-hero` rule.
 *
 * Both live INSIDE the single `.chip-google`. Deleting either one to make the
 * count read "four" would either blank the visible chip or strip the only
 * accessible text the rating has. Four chips, six spans, all correct.
 *
 * The chips the request is actually about — "Dialling 020", "EN1 to EN3, and
 * N9 to N21" — never came through here. They are per-page data on the eight
 * /worktops/ pages and are handled in app/worktops/[...slug]/page.tsx.
 */
import type { CSSProperties } from 'react';

export function HeroChips({
  glow = false,
  hd,
}: {
  glow?: boolean;
  /**
   * Entrance-stagger delay, e.g. '880ms'. Opt-in, and only the homepage hero
   * passes it. `.hero-el` is `opacity:0` until `#hero.loaded` releases it, so
   * emitting it on the four pages that render these chips OUTSIDE `#hero`
   * (trade, services, materials, PageHead) would be markup live does not have.
   */
  hd?: string;
}) {
  const chip = (rest: string) => (glow ? `chip ${rest} glow-card` : `chip ${rest}`);
  const chipsClass = hd ? 'hero-chips hero-el' : 'hero-chips';
  const stars = '★★★★★';

  return (
    <div className={chipsClass} style={hd ? ({ '--hd': hd } as CSSProperties) : undefined}>
      <span className={chip('chip-google')}>
        <svg className="g-mark" viewBox="0 0 48 48" aria-hidden="true" focusable="false">
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
        <span className="g-stack" aria-hidden="true">
          <span className="g-word">Google reviews</span>
          <span className="g-rating">
            <b className="g-score">5.0</b>
            <span className="g-stars">★★★★★</span>
          </span>
        </span>
        {/*
          Each branch is ONE expression on purpose. Written as
          `{glow ? <b>{stars}</b> : stars} 5.0 on Google`, the false branch
          puts two adjacent text nodes in the tree and React's SSR separates
          them with an `<!-- -->` marker — a node the live HTML does not have.
        */}
        <span className="chip-legacy">
          {glow ? (
            <>
              <b>{stars}</b> 5.0 on Google
            </>
          ) : (
            `${stars} 5.0 on Google`
          )}
        </span>
      </span>
      <span className={chip('chip-guarantee')}>
        <b className="chip-mk">10</b> year guarantee
      </span>
      <span className={chip('chip-reason')}>
        <b className="chip-mk">72</b> hour aftercare
      </span>
      <span className={chip('chip-reason')}>
        <span className="chip-ico" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" focusable="false">
            <path
              d="M3.4 10.6 12 3.8l8.6 6.8M5.9 9.2V20h12.2V9.2M9.9 20v-5.6h4.2V20"
              stroke="url(#tcGold)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>{' '}
        Free home visit
      </span>
    </div>
  );
}

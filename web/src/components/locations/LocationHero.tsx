/**
 * `section.svc-hero` on the eight county and town pages.
 *
 * Same shell as /trade/'s hero — background plate, breadcrumb, `.svc-hero-inner`
 * column — with two differences that are the whole point of these pages:
 *
 *   1. THE BACKGROUND IS ONE IMAGE, SET INLINE. /trade/ art-directs three
 *      files at three widths from a `<style>` block; every /worktops/ page
 *      ships `style="background-image:url('/assets/kitchen-day.jpg')"` on the
 *      plate itself. Ported as the inline attribute it is.
 *
 *   2. THE CHIP ROW IS PER PAGE. <HeroChips/> is the fixed four the site-styled
 *      pages carry; these pages append one or two local ones — "CM17 to CM20",
 *      "Dialling 01279", "Local dialling 020" — so the row is rendered from
 *      `hero.chips` instead. It is not a fork of <HeroChips/>: the Google chip
 *      here has a plain `.chip-legacy` line where <HeroChips/> bolds the stars,
 *      which is the source's own difference between the two chromes.
 *
 * The breadcrumb sits INSIDE the hero on this archetype (it is outside <main>
 * on the hub), so <Breadcrumb/> is rendered here rather than by the page.
 */
import { Breadcrumb } from '@/components/chrome/Breadcrumb';
import { Rich } from '@/components/chrome/Rich';
import type { Breadcrumbs } from '@/lib/stones';
import type { LocationChip, LocationHero as HeroRecord } from '@/lib/locations';

import { CtaRow } from './LocationSections';

/**
 * The only chip that carries an icon, on all eight pages.
 *
 * The extractor records chips as `{kind, text, mark?}` and has nowhere to put
 * an SVG, so the icon is re-attached here by the one text it ever appears on.
 * Verified against all eight live pages: exactly one `.chip-ico` each, always
 * this chip.
 */
const ICON_CHIP = 'Free home visit';

function Chip({ chip }: { chip: LocationChip }) {
  if (chip.kind === 'chip-google') {
    return (
      <span className="chip chip-google">
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
          <span className="g-word">{chip.google?.word ?? 'Google reviews'}</span>
          <span className="g-rating">
            <b className="g-score">{chip.google?.score ?? '5.0'}</b>
            <span className="g-stars">★★★★★</span>
          </span>
        </span>
        {/* The single-line fallback the CSS shows when the stack cannot fit. */}
        <span className="chip-legacy">{chip.legacy}</span>
      </span>
    );
  }

  if (chip.mark) {
    // "10 year guarantee", "72 hour aftercare" — the number is a <b class="chip-mk">.
    const rest = chip.text.slice(chip.mark.length);
    return (
      <span className={`chip ${chip.kind}`}>
        <b className="chip-mk">{chip.mark}</b>
        {rest}
      </span>
    );
  }

  if (chip.text === ICON_CHIP) {
    return (
      <span className={`chip ${chip.kind}`}>
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
        {chip.text}
      </span>
    );
  }

  return <span className={`chip ${chip.kind}`}>{chip.text}</span>;
}

export function LocationHero({
  hero,
  crumbs,
}: {
  hero: HeroRecord;
  crumbs: Breadcrumbs;
}) {
  return (
    <section className="svc-hero">
      <div
        className="svc-hero-bg"
        style={{ backgroundImage: `url('${hero.background}')` }}
      />
      <Breadcrumb crumbs={crumbs} />
      <div className="wrap svc-hero-inner">
        <Rich as="h1" value={{ text: hero.heading.text, html: hero.heading.html }} />
        <Rich as="p" className="lede" value={hero.lede} />
        <CtaRow ctas={hero.ctas} />
        <div className="hero-chips">
          {hero.chips.map((chip, i) => (
            <Chip key={i} chip={chip} />
          ))}
        </div>
      </div>
    </section>
  );
}

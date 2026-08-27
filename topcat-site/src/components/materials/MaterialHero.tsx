/**
 * `section.svc-hero` on a material page.
 *
 * Its own component rather than another case in <MaterialBlocks>, because the
 * hero is the one section that is NOT `<section><div class="wrap">…`:
 *
 *   1. `.svc-hero-bg` comes first, as an empty sibling. It is
 *      `position:absolute;inset:0;z-index:0` (content.css:112) with the photo
 *      as a background-image and a gradient scrim in its `::after`, so it
 *      cannot be a background on the section itself — the scrim needs its own
 *      box.
 *   2. `nav.crumb` sits INSIDE the hero here, not above `<main>` as it does on
 *      the hub. content.css:96 targets `.svc-hero>.crumb` to centre it and
 *      strip its padding; move it out and it goes back to left-aligned.
 *   3. The copy lives in `.wrap.svc-hero-inner`, which caps at 860px
 *      (content.css:132) rather than the site `.wrap` measure.
 *
 * THE BACKGROUND IS AN INLINE STYLE, as in the source. All five pages use the
 * same photo today, but it is per-page data, and /trade/ shows the shape this
 * takes when a page art-directs three widths. One image, one declaration.
 */
import { Breadcrumb } from '@/components/chrome/Breadcrumb';
import { Rich } from '@/components/chrome/Rich';
import { HeroChips } from '@/components/sections/HeroChips';
import type { MaterialRecord } from '@/lib/materials';

import { MaterialCtaRow } from './MaterialBlocks';

export function MaterialHero({ material }: { material: MaterialRecord }) {
  const { hero, breadcrumbs } = material;

  return (
    <section className="svc-hero">
      <div
        className="svc-hero-bg"
        style={{ backgroundImage: `url('${hero.background}')` }}
      />
      <Breadcrumb crumbs={breadcrumbs} />
      <div className="wrap svc-hero-inner">
        <Rich as="h1" value={hero.heading} />
        <Rich as="p" className="lede" value={hero.lede} />
        <MaterialCtaRow ctas={hero.ctas} />
        {/*
          No `glow` — that prop adds `glow-card`, which only the site.css
          pages carry. The content-styled pages, these five included, ship the
          chips plain. <HeroChips> is the same four chips the source hard-codes
          on every one of them, which is why `hero.chips` is carried in the
          data but not read: it would be five copies of one constant.
        */}
        <HeroChips />
      </div>
    </section>
  );
}

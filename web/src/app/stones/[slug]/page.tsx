/**
 * ARCHETYPE 8 — the stone detail page. 132 routes, one template.
 *
 * All 132 legacy pages are 299 lines with an identical section skeleton; only
 * the data changes. They are the single biggest archetype on the site, and
 * `trailingSlash: false` is set in next.config.ts precisely so this route
 * exports to `out/stones/<slug>.html` — byte-for-byte the legacy URL, which
 * means the canonical tags carried in stones.json stay true and no redirect
 * is needed anywhere.
 *
 * Sections, in source order:
 *   1  nav.crumb                      — outside <main> on this archetype
 *   2  section.stp-hero               — kicker, slab, compare link, copy
 *   3  section.block  .prose.rise     — About <material>
 *   4  section.block  .rise           — See it in your home, not on a screen
 *   5  section.block  .rise           — More <material> to consider (3 tiles)
 *   6  section.cta-band .rise         — Make it yours
 */
import type { Metadata } from 'next';

import { Breadcrumb } from '@/components/chrome/Breadcrumb';
import { JsonLd } from '@/components/chrome/JsonLd';
import { Rich } from '@/components/chrome/Rich';
import CtaSection from '@/components/sections/Cta';
import { RiseObserver } from '@/components/sections/RiseObserver';
import { SlabImage } from '@/components/stones/SlabImage';
import { RelatedStoneTile } from '@/components/stones/StoneTile';
import { CompareRects } from '@/components/stones/icons';
import { metadataFromSeo } from '@/lib/seo';

import '@/styles/enquiry-card.css';
import {
  getStone,
  rewriteStoneLinks,
  stoneCtaHref,
  stoneSlugs,
  type Cta,
  type StoneRecord,
} from '@/lib/stones';

/**
 * All 132 slugs, so `output: 'export'` emits all 132 files. Nothing is
 * fetched: the dataset is a JSON module resolved at build time.
 */
export function generateStaticParams() {
  return stoneSlugs().map((slug) => ({ slug }));
}

/**
 * Static export gives every one of the 132 pages its own <head>. These are
 * SEO-tuned pages — hand-written titles and descriptions, canonicals pointing
 * at the `.html` leaf — so the record is mapped straight through rather than
 * templated. `dynamicParams = false` makes a slug that is not in the dataset a
 * build error instead of a silent 404.
 */
export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return metadataFromSeo(getStone(slug).seo);
}

/**
 * `.cta-row` — `.btn-gold` / `.btn-ghost`, in data order.
 *
 * Every enquiry CTA on these 132 pages ships in the dataset as
 * `/index.html?stone=…#estimator` or `…#cta`, which lands on the home page
 * behind the hero film and is absorbed onto the hero by `lockFilm`. They are
 * re-pointed by `stoneCtaHref`: anything asking about THIS stone drops to the
 * `#cta` form now carried on the page, and "Get in touch" goes to /contact/.
 * The `tel:` CTA that sits beside them falls through untouched.
 */
function CtaRow({ ctas, stone }: { ctas: Cta[]; stone: StoneRecord }) {
  return (
    <div className="cta-row">
      {ctas.map((cta) => (
        <a
          key={`${cta.variant}:${cta.href}`}
          className={cta.variant === 'gold' ? 'btn-gold' : 'btn-ghost'}
          href={stoneCtaHref(cta, stone)}
        >
          {cta.label}
        </a>
      ))}
    </div>
  );
}

export default async function StonePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const stone = getStone(slug);
  const { hero, sections } = stone;

  return (
    <>
      <JsonLd data={stone.jsonLd} />
      {/*
        In the source the crumb sits OUTSIDE <main> — the only archetype where
        it does — which is why stone.css names it explicitly in
        `main, body > nav.crumb, body > footer{position:relative;z-index:1}`.
        <SiteChrome> owns <main> and wraps the whole page in it, so here the
        crumb is inside instead. Visually identical: `main` carries the same
        `position:relative;z-index:1`, so the crumb still sits above the marble
        floor. Flagged as a DOM-shape divergence, not a styling one.
      */}
      <Breadcrumb crumbs={stone.breadcrumbs} />
        <section className="stp-hero">
          <div className="wrap stp-grid">
            {/*
              "Granite · Brushed". Grid-placed by `.stp-kicker{grid-area:kick}`,
              which is why it is a sibling of the shot and the copy rather than
              living inside `.stp-copy` where it visually appears. Below 900px
              the grid re-orders to shot / kick / copy.
            */}
            <span className="eyebrow stp-kicker">{stone.kicker}</span>

            <div className="stp-shot">
              <figure className="stp-slab">
                <span className="stp-stone">
                  <SlabImage image={hero.image} />
                </span>
                <span className="stp-glass" aria-hidden="true" />
                <figcaption className="stp-tag">{stone.materialLabel}</figcaption>
              </figure>
              <a className="stp-compare" href={hero.compare.href}>
                <CompareRects strokeWidth="2.4" />
                {hero.compare.label}
              </a>
            </div>

            <div className="stp-copy">
              <h1>{stone.name}</h1>
              <p className="lede">{stone.lede}</p>
              {/*
                NOT a fixed six rows — the archetype map says six and the data
                says otherwise. Two of the seven are optional, so the real
                counts are 5 / 6 / 7 across 55 / 53 / 24 stones:

                  Range          only where the supplier sells one, e.g.
                                 taj-mahal's "Marble & Quartzite"
                  Typical slab   absent where no standard size is quoted, e.g.
                                 absolute-black-honed

                Order is the invariant, not length. Never hard-code the rows.
                The <span> is the gold label column: `.stp-facts li` is a
                110px/1fr grid, so the label must be a real first child, not a
                ::before.
              */}
              <ul className="stp-facts">
                {stone.facts.map((fact) => (
                  <li key={fact.label}>
                    <span>{fact.label}</span>
                    {fact.value}
                  </li>
                ))}
              </ul>
              <CtaRow ctas={stone.ctas} stone={stone} />
              {/*
                The third trust item contains a link, the first contains a
                <b> of stars; both are carried as html by the extractor.
              */}
              <div className="trust">
                {stone.trust.map((item) => (
                  <Rich key={item.text} as="span" value={item} />
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="block">
          <div className="wrap prose rise">
            <Rich as="h2" value={sections.about.heading} />
            {sections.about.paragraphs.map((p) => (
              <Rich key={p.text} as="p" value={p} />
            ))}
          </div>
        </section>

        <section className="block">
          <div className="wrap rise">
            <Rich as="h2" value={sections.homeVisit.heading} />
            <Rich as="p" className="sub" value={sections.homeVisit.sub} />
            <CtaRow ctas={sections.homeVisit.ctas} stone={stone} />
          </div>
        </section>

        <section className="block">
          <div className="wrap rise">
            <Rich as="h2" value={sections.related.heading} />
            <Rich as="p" className="sub" value={sections.related.sub} />
            {/*
              Always exactly three, chosen in the source as the closest looking
              stones of the same material. `.st-grid.related` collapses from
              three columns to one at 600px, skipping the two-column step the
              collection grid uses.
            */}
            <div className="st-grid related">
              {stone.related.map((related) => (
                <RelatedStoneTile key={related.slug} stone={related} />
              ))}
            </div>
            <Rich
              as="p"
              className="st-source"
              value={{
                ...sections.related.sourceNote,
                html: rewriteStoneLinks(
                  sections.related.sourceNote.html ?? sections.related.sourceNote.text,
                  stone,
                ),
              }}
            />
          </div>
        </section>

        {/*
          THE FULL ENQUIRY CARD, ON THE STONE'S OWN PAGE.

          The client, 28 Aug: "take the full form that's on the landing page and
          also on the contact page, and add that as a global section into every
          single individual stone page. So if someone goes into the individual
          stone page and they click Get An Estimate For The Stone, it'll take
          them right down to where it will say Make It Yours with the same
          details, but just in the other format so they can fill out their
          details right here on this page. So they don't have to go to another
          page to do that."

          This replaces the old `section.cta-band`, which was a heading, two
          paragraphs and a pair of buttons that sent the visitor away. The
          heading and the paragraphs are the SAME extracted copy — "Make it
          yours" and the stone's own two lines — so nothing is lost; only the
          buttons are gone, because the thing they pointed at is now here.

          `initialStone` seeds the chip, so the enquiry arrives carrying the
          stone without the visitor having to name it. `stonePicker={false}`
          for the same reason: offering "Choose your stone" underneath a stone
          that is already filled in would read as a question nobody asked.
        */}
        <CtaSection
          heading={<Rich as="span" value={sections.ctaBand.heading} />}
          lede={
            <>
              {sections.ctaBand.paragraphs.map((p) => (
                <Rich key={p.text} as="span" className="stp-ctaline" value={p} />
              ))}
            </>
          }
          stonePicker={false}
          initialStone={{ name: stone.name, mat: stone.estimator.mat, slug: stone.slug }}
        />
      {/*
        threshold 0.12, not site.js's 0.25 — the stone pages carry the inline
        observer, and it is the looser of the two.
      */}
      <RiseObserver threshold={0.12} />
    </>
  );
}

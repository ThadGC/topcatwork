/**
 * ARCHETYPE 9 — `/stones/`, the collection browser.
 *
 * The static half is here; the 132 tiles and the filter live in
 * <StoneCollection/>, which is a client component so the controller can run,
 * but still server-renders every tile into the exported HTML. That matters:
 * the page's ItemList JSON-LD names all 132 stones, and the markup has to
 * agree with it.
 *
 * `trailingSlash: false` would normally export this route to `out/stones.html`
 * and leave `/stones/` 404ing on Apache. scripts/postexport.mjs copies it to
 * `out/stones/index.html` afterwards, so both files coexist — `stones.html`
 * beside the `stones/` directory that holds the 132 leaves — and the canonical
 * stays `/stones/`.
 */
import type { Metadata } from 'next';

import { Breadcrumb } from '@/components/chrome/Breadcrumb';
import { JsonLd } from '@/components/chrome/JsonLd';
import { Rich } from '@/components/chrome/Rich';
import { RiseObserver } from '@/components/sections/RiseObserver';
import { StoneCollection } from '@/components/stones/StoneCollection';
import { metadataFromSeo } from '@/lib/seo';
import { collection } from '@/lib/stones';

export const metadata: Metadata = metadataFromSeo(collection.seo);

export default function StonesCollectionPage() {
  return (
    <>
      <JsonLd data={collection.jsonLd} />
      <Breadcrumb crumbs={collection.breadcrumbs} />
        {/*
          `.st-hero` carries no `.rise` in the source — the first screen is
          visible immediately, and only the cta-band below fades in.
        */}
        <section className="st-hero">
          <div className="wrap">
            <Rich as="h1" value={collection.hero.heading} />
            <p className="lede">{collection.hero.lede.text}</p>
            <p
              className="st-source"
              dangerouslySetInnerHTML={{ __html: SOURCE_NOTE_HTML }}
            />
          </div>
        </section>

        <StoneCollection collection={collection} />

        <section className="cta-band">
          <div className="wrap rise">
            <h2>
              Can&apos;t choose from a <em>screen?</em>
            </h2>
            <p>
              Nobody should. Book a free home visit and we bring samples to you, in
              your light, against your cabinets. You approve photographs of your
              actual slab before a single cut. Prefer to talk it through? Ask for
              Nick.
            </p>
            <div className="cta-row">
              <a className="btn-gold" href="/contact/">
                Book a free home visit
              </a>
              <a className="btn-ghost" href="tel:+448000982812">
                Call 0800 098 2812
              </a>
            </div>
          </div>
        </section>
      <RiseObserver threshold={0.12} />
    </>
  );
}

/** `p.st-source` — one sentence with a `/contact/` link in the middle of it. */
const SOURCE_NOTE_HTML =
  'These are the stones we hold photographs of, not the limit of what we ' +
  'can get. If the one you have in mind is not here, <a href="/contact/">tell us what ' +
  'you are after</a> and we will source it where we can.';

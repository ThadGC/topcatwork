/**
 * THE SERVICE DETAIL PAGE. Nine routes, one template.
 *
 * `/services/kitchen-worktops.html` and its eight siblings — the pages that
 * carry the site's commercial search terms, so their `<head>` is mapped
 * straight through from the extraction rather than templated. Every title,
 * description, canonical and JSON-LD graph below is the live page's, byte for
 * byte; tests/services.test.tsx asserts it against the saved crawl.
 *
 * `trailingSlash: false` is what lets this route export to
 * `out/services/<slug>.html` — the live URL — so the canonicals stay true and
 * no redirect is needed at cutover.
 *
 * ---------------------------------------------------------------------------
 * SECTIONS, IN SOURCE ORDER
 * ---------------------------------------------------------------------------
 *   1  section.svc-hero          bg plate, crumb, h1, lede, CTAs, chips
 *   2  div.lead-grid             two columns:
 *        .lead-main              the eight body sections
 *        aside.lead-aside        form.qform, the sticky enquiry card
 *   3  section.block.faq         four <details>, no JavaScript
 *   4  section.block             "More of what we do" — full width, OUTSIDE
 *                                the grid, which is why it is filtered out of
 *                                .lead-main by `region` rather than by index
 *   5  section.cta-band          the closing ask
 *
 * The two mid-page enquiry prompts (`.cta-inline`) are body sections 4 and 7,
 * so they are rendered by the same loop as everything else — see
 * components/services/ServiceBody.tsx.
 *
 * ---------------------------------------------------------------------------
 * NO GALLERY STRIP ON THIS ARCHETYPE
 * ---------------------------------------------------------------------------
 * Worth stating because it is the obvious thing to go looking for: none of
 * the nine live pages carries an image strip. The only image on the page is
 * the hero plate, set as a `background-image` on `.svc-hero-bg`. The project
 * gallery lives on `/projects/` and on the home page; the cross-sell here is
 * the `.mats` chip row, not pictures.
 */
import type { Metadata } from 'next';

import { Breadcrumb } from '@/components/chrome/Breadcrumb';
import { JsonLd } from '@/components/chrome/JsonLd';
import { Rich } from '@/components/chrome/Rich';
import JourneyTracker from '@/components/forms/JourneyTracker';
import QuickForm from '@/components/forms/QuickForm';
import { HeroChips } from '@/components/sections/HeroChips';
import { RiseObserver } from '@/components/sections/RiseObserver';
import { TcDefs } from '@/components/sections/TcDefs';
import { ServiceSection } from '@/components/services/ServiceBody';
import { ServiceCtaRow } from '@/components/services/ServiceCtaRow';
import { ServiceFaqSection } from '@/components/services/ServiceFaqSection';
import { getService, serviceSlugs } from '@/lib/services';
import { metadataFromSeo } from '@/lib/seo';

/** All nine slugs, so `output: 'export'` emits all nine files. */
export function generateStaticParams() {
  return serviceSlugs().map((slug) => ({ slug }));
}

/** A slug outside the dataset is a build error, not a silent 404. */
export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return metadataFromSeo(getService(slug).seo);
}

export default async function ServicePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = getService(slug);
  const { hero, ctaBand } = service;

  /*
    `region` decides the column, NOT the index. Eight sections sit inside
    `.lead-grid > .lead-main` beside the enquiry form and one — the
    "More of what we do" cross-sell — runs full width below it. That is the
    split on all nine pages today, but reading the field means a page that
    ever differs renders correctly instead of quietly losing a column.
  */
  const leadMain = service.body.filter((block) => block.region === 'lead-main');
  const fullWidth = service.body.filter((block) => block.region !== 'lead-main');

  return (
    <>
      <JsonLd data={service.jsonLd} />
      <JourneyTracker />
      {/*
        threshold 0.12, not site.js's 0.25. These pages do not load site.js;
        they ship their own inline IntersectionObserver, and it is the looser
        of the two. Same as /trade/ and the stone pages.
      */}
      <RiseObserver threshold={0.12} />
      {/* One gradient, not two — the source ships `#tcGold` alone here. */}
      <TcDefs solid={false} />
      <main>
        <section className="svc-hero">
          {/*
            The plate is an inline `background-image` with a SOURCE-RELATIVE
            url — `../assets/site/service-worktops-quartz-1600.webp`. It stays
            relative: the document is `/services/<slug>.html`, so it resolves
            to `/assets/site/…`, which is where the file is. Rewriting it to
            an absolute path would be a gratuitous diff against the live HTML.
          */}
          <div
            className="svc-hero-bg"
            style={{ backgroundImage: `url('${hero.background}')` }}
          />
          <Breadcrumb crumbs={service.breadcrumbs} />
          <div className="wrap svc-hero-inner">
            {/* `Kitchen <span class="h1-gold">Worktops</span>` — the gold half
                is a span here, not the `<em>` the h2s use. */}
            <Rich as="h1" value={hero.heading} />
            <Rich as="p" className="lede" value={hero.lede} />
            <ServiceCtaRow ctas={hero.ctas} />
            {/* No `glow` — that is the site.css chrome's `.glow-card` hook,
                and these pages do not load site.js to attach it. */}
            <HeroChips />
          </div>
        </section>

        <div className="lead-grid">
          <div className="lead-main">
            {leadMain.map((block, i) => (
              <ServiceSection key={`lead-${i}`} block={block} />
            ))}
          </div>
          <aside className="lead-aside">
            {/*
              The source leaves `#qfService` with no `selected` option on all
              nine pages, so the browser default is the first one — "Kitchen
              worktops" — even on /services/fireplaces.html. Ported as found:
              changing it would change what lands in the client's inbox.
            */}
            <QuickForm defaultService="Kitchen worktops" />
          </aside>
        </div>

        <ServiceFaqSection faq={service.faq} />

        {fullWidth.map((block, i) => (
          <ServiceSection key={`full-${i}`} block={block} />
        ))}

        <section className="cta-band">
          <div className="wrap rise">
            <Rich as="h2" value={ctaBand.heading} />
            {ctaBand.paragraphs.map((p) => (
              <Rich key={p.text} as="p" value={p} />
            ))}
            <ServiceCtaRow ctas={ctaBand.ctas} />
          </div>
        </section>
      </main>
    </>
  );
}

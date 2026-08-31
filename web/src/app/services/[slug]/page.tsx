/**
 * THE SERVICE DETAIL PAGE. Nine routes, one template.
 *
 * `/services/kitchen-worktops` and its eight siblings — the pages that
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
import CtaSection from '@/components/sections/Cta';
import { HeroChips } from '@/components/sections/HeroChips';
import { RiseObserver } from '@/components/sections/RiseObserver';
import { TcDefs } from '@/components/sections/TcDefs';
import { ServiceSection } from '@/components/services/ServiceBody';
import { ServiceCtaRow } from '@/components/services/ServiceCtaRow';
import { ServiceFaqSection } from '@/components/services/ServiceFaqSection';
import {
  getService,
  serviceCtas,
  serviceEnquiryLabel,
  serviceSlugs,
  type BodyBlock,
} from '@/lib/services';
import { metadataFromSeo } from '@/lib/seo';

/*
  ⚠️ THE CARD IS UNSTYLED WITHOUT THIS LINE.

  These pages load content.css, NOT home-sections.css, and the enquiry card's
  rules live in the latter. The stone pages hit this first and the answer is
  the generated extract: only the card's own rules, so importing it here cannot
  disturb the 1,100 rows of service.css around it. See the header of
  enquiry-card.css for why the full sheet must never be imported on a
  content-styled page.
*/
import '@/styles/enquiry-card.css';

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
  /*
    The two `.cta-inline` prompts live inside body blocks rather than in a
    field of their own, so the rewrite reaches them through the content tree.
    Everything that is not a ctaInline node is passed through by identity.
  */
  const repoint = (block: BodyBlock): BodyBlock => ({
    ...block,
    content: block.content.map((node) =>
      node.type === 'ctaInline' ? { ...node, ctas: serviceCtas(node.ctas) } : node,
    ),
  });

  const leadMain = service.body.filter((b) => b.region === 'lead-main').map(repoint);
  const fullWidth = service.body.filter((b) => b.region !== 'lead-main').map(repoint);

  /* The label this page's enquiries travel under; see lib/services.ts.
     The fallback is the old hardcoded default, kept only so an unmapped slug
     still renders a valid select rather than an empty one. */
  const enquiryLabel = serviceEnquiryLabel(slug);
  const quickFormService = enquiryLabel ?? 'Kitchen worktops';

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
            <ServiceCtaRow ctas={serviceCtas(hero.ctas)} />
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
              ⛔ THIS DEFAULT WAS WRONG AND IS NOW FIXED.

              The source leaves `#qfService` with no `selected` option on all
              nine pages, so the browser default was the first one — "Kitchen
              worktops" — even on /services/fireplaces. It was ported as
              found, on the reasoning that changing it would change what lands
              in the client's inbox.

              That reasoning is now inverted by his own instruction: the point
              of this round is that an enquiry should name the page it came
              from. A fireplaces enquiry arriving labelled "Kitchen worktops"
              is precisely the tracking failure he asked to close, so the aside
              and the card at the foot of the page now agree.
            */}
            <QuickForm defaultService={quickFormService} />
          </aside>
        </div>

        <ServiceFaqSection faq={service.faq} />

        {fullWidth.map((block, i) => (
          <ServiceSection key={`full-${i}`} block={block} />
        ))}

        {/*
          THE CLOSING ASK IS NOW THE FORM ITSELF.

          The client, 28 Aug: "instead of having a call to action above the
          footer, I want it to be an actual form. The form with the service
          that they've selected and what they are looking for... and all the
          CTAs that talk about getting an estimate on those individual pages go
          to the bottom of the page to that form instead of the individual
          contact page."

          The same swap the 132 stone pages made earlier the same day. What was
          `section.cta-band` — a heading, a paragraph and two buttons that sent
          the visitor away — keeps its heading and its paragraph, which become
          the card's own copy, and loses only the buttons, because the thing
          they pointed at is now standing here. `ctaBand.ctas` is deliberately
          unused: its "Get your free quote" is this card, and its
          `tel:+448000982812` is already one of the three numbers inside it.

          `service` seeds the chip and the hidden field, so the enquiry names
          the page it came from. `stonePicker` stays ON, unlike the stone
          pages: a visitor reading about splashbacks has not chosen a stone
          yet, so the question is a real one here.
        */}
        <CtaSection
          heading={<Rich as="span" value={ctaBand.heading} />}
          lede={
            <>
              {ctaBand.paragraphs.map((p) => (
                <Rich key={p.text} as="span" value={p} />
              ))}
            </>
          }
          service={enquiryLabel}
        />
      </main>
    </>
  );
}

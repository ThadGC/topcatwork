import type { Metadata } from 'next';

import HeroStill from '@/components/sections/HeroStill';
import JourneyTracker from '@/components/forms/JourneyTracker';
import { JsonLd } from '@/components/chrome/JsonLd';
import About from '@/components/sections/About';
import Cta from '@/components/sections/Cta';
import Estimator from '@/components/sections/Estimator';
import Faq from '@/components/sections/Faq';
import Gallery from '@/components/sections/Gallery';
import HeroCopy from '@/components/sections/HeroCopy';
import Process from '@/components/sections/Process';
import Reviews from '@/components/sections/Reviews';
import SectionDivider from '@/components/sections/SectionDivider';
import Services from '@/components/sections/Services';
import Stones from '@/components/sections/Stones';
import TradePrompt from '@/components/sections/TradePrompt';
import Why from '@/components/sections/Why';
import { HOME_LD } from '@/data/ld/home';

import '@/styles/home-sections.css';

/**
 * The home page — index.html, ported section for section.
 *
 * SECTION ORDER IS THE PAGE'S ARGUMENT, so it is reproduced exactly:
 * proof (reviews) → what we make (services) → what we have made (gallery) →
 * what it is made of (stones) → what it costs (estimator) → how it happens
 * (process) → who we are (about) → why us (why) → objections (faq) → ask.
 *
 * THE TWO WRAPPERS THAT LOOK LIKE NOISE AND ARE NOT
 * -------------------------------------------------
 * `.gs-swap` (index.html:3739) wraps the gallery and the stones sections
 * together. Below 1121px site.css:3214 turns it into a flex column with
 * `order` reversed, so a narrow viewport meets the stone collection *before*
 * the project gallery. Flatten the wrapper and that reordering silently stops
 * happening.
 *
 * `#estModal` sits between `#estimator` and the divider that follows it, as a
 * sibling rather than a child — see the comment in Estimator.tsx. It is
 * rendered from that component, which is why nothing appears between
 * `<Estimator/>` and the next `<SectionDivider/>` here.
 *
 * WHAT THIS FILE DOES NOT RENDER YET
 * ----------------------------------
 * `<SiteHeader/>`, `<MobileNav/>` and `<MobileBar/>` belong in the root
 * layout — they are on 177 of the 178 pages. `<SiteFooter/>` belongs at the
 * end of this `<main>`: in the legacy markup the footer is *inside* `<main>`
 * (index.html:4250), which is unusual but is what every one of the 178 pages
 * does, so the port should keep it there rather than quietly correcting it.
 * All four are the chrome agent's, and slot in without touching this file's
 * section order.
 */
/**
 * The home page carried NO canonical, on this build or the legacy one. The
 * 27 Aug audit walked all 178 pages: every other one has a title, a
 * description, exactly one h1 and a canonical, and only `/` was missing this.
 * Inherited rather than a regression, but it is the most linked page on the
 * site and the one most likely to be reached with query strings on it.
 *
 * Only `alternates` is set here: title, description and openGraph stay the
 * root layout's, which are already written for this page.
 */
export const metadata: Metadata = {
  alternates: { canonical: 'https://www.topcatworktops.co.uk/' },
};

export default function HomePage() {
  return (
    <main>
      {/* THE TRAIL STARTS HERE TOO. Every other page mounts this; the home page
          did not, so the one page most visitors arrive on recorded nothing —
          no "Arrived from google.com", no first page view, and an enquiry sent
          from the home card carried no journey at all. Caught by dumping what
          each form actually puts on the wire (probe-form-payload.mjs). */}
      <JourneyTracker />
      {/*
        The page's structured data — one HomeAndConstructionBusiness block,
        lifted verbatim out of index.html. It is the site's primary
        entity: name, description, the two sameAs profiles, the eight
        AdministrativeArea entries, the St Albans PostalAddress, the
        07:00-21:00 openingHoursSpecification and the three makesOffer
        Services. Every other archetype in the port renders <JsonLd/>;
        this is the page whose graph the rest of them point at, so it
        must not be the one that ships without it.
      */}
      <JsonLd data={HOME_LD} />

      {/*
        ⛔ THE FILM WAS STRIPPED OUT ON 28 AUG 2026 and is being rebuilt from
        scratch. <HeroStill> is the state <HeroFilm> rendered on the server —
        the same hero a reduced-motion visitor already saw. The film's own two
        trust chips went with it: they existed to ride the wide band's wipe,
        and there is no wipe to ride. The complete specification, a snapshot of
        the deleted code and 160 reference frames are in
        ~/Documents/TOPCAT-FILM-SPEC — read FILM-SPEC.md before rebuilding.
      */}
      <HeroStill>
        <HeroCopy />
      </HeroStill>

      <Reviews />

      <SectionDivider />
      <Services />

      <div className="gs-swap">
        <SectionDivider />
        <Gallery />
        <SectionDivider />
        <Stones />
      </div>

      <Estimator />

      <SectionDivider />
      <Process />

      <SectionDivider />
      <About />

      <SectionDivider />
      <Why />

      <SectionDivider />
      <Faq />

      {/* The one page whose enquiry card sits below the stone wheel, so the
          one page that offers the stone as an optional field. See Cta.tsx. */}
      <Cta stonePicker />

      <TradePrompt />

      {/*
        <SiteFooter/> is NOT rendered here. <SiteChrome> in app/layout.tsx
        renders it once for every route, immediately after this </main>,
        so no page has to remember it and no page can render two.

        That is one step off the legacy structure, which puts the footer
        INSIDE <main> (index.html:4250). It was measured before it was
        accepted: `main` contributes `position:relative; z-index:1;
        overflow-x:clip`, and `footer.site` already sets its own
        `position:relative; z-index:1`, so the only property it gives up
        is a clip that no footer rule reaches. Rendering is identical.

        To put it back the legacy way: drop <SiteFooter/> from both
        branches of <SiteChrome> and add it before this comment on every
        page that owns a <main>.
      */}
    </main>
  );
}

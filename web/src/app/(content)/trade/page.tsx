import type { Metadata } from 'next';

import QuickForm from '@/components/forms/QuickForm';
import JourneyTracker from '@/components/forms/JourneyTracker';
import { Breadcrumb } from '@/components/chrome/Breadcrumb';
import { contentCrumbs } from '@/components/sections/crumbs';
import { HeroChips } from '@/components/sections/HeroChips';
import { JsonLd } from '@/components/chrome/JsonLd';
import { RiseObserver } from '@/components/sections/RiseObserver';
import { TcDefs } from '@/components/sections/TcDefs';
import { TRADE_LD } from '@/data/ld/trade';

/*
  A CONTENT-STYLED PAGE — services/service.css, so `data-tokens="content"`
  on <body> (see the README's token-root table).

  Its `.rise` reveal runs at threshold 0.12, not the 0.25 the site-styled
  pages use: /trade/ ships its own inline IntersectionObserver rather than
  loading site.js. Ported as-is; see <RiseObserver/>.
*/

const DESCRIPTION =
  'Stone worktop supply and fit for the trade across London, Hertfordshire, Essex and Berkshire. Template to fit through one contact, dates confirmed in writing, trade terms that hold, and a ten-year guarantee on every install.';

export const metadata: Metadata = {
  title: 'Trade Worktops for Builders, Developers & Kitchen Designers | Topcat',
  description: DESCRIPTION,
  alternates: { canonical: 'https://www.topcatworktops.co.uk/trade/' },
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    title: 'Trade Worktops for Builders, Developers & Kitchen Designers | Topcat',
    description: DESCRIPTION,
    url: 'https://www.topcatworktops.co.uk/trade/',
    siteName: 'Topcat Worktops',
    images: [
      { url: 'https://www.topcatworktops.co.uk/assets/site/og-cover.jpg' },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['https://www.topcatworktops.co.uk/assets/site/og-cover.jpg'],
  },
};

/*
  The hero plate, art-directed at the same three widths as the source's
  inline <style>. It stays an inline <style> rather than moving into a
  stylesheet because the three URLs are this page's, not the design
  system's, and the breakpoints are the site's own 720 / 1120 pair.
*/
const HERO_BG = `  .svc-hero-bg{background-image:url('/assets/site/pagehead-wide-1672.webp')}
  @media(min-width:721px) and (max-width:1120px){
    .svc-hero-bg{background-image:url('/assets/site/pagehead-wide-1150.webp')}
  }
  @media(max-width:720px){
    .svc-hero-bg{background-image:url('/assets/site/pagehead-tall-900.webp')}
  }`;

export default function TradePage() {
  return (
    <>
      <JsonLd data={TRADE_LD} />
      <JourneyTracker />
      <RiseObserver threshold={0.12} />
      <style dangerouslySetInnerHTML={{ __html: HERO_BG }} />
      <TcDefs solid={false} />
      <main>
        <section className="svc-hero">
          <div className="svc-hero-bg" />
          <Breadcrumb crumbs={contentCrumbs('Trade')} />
          <div className="wrap svc-hero-inner">
            <h1>
              A worktop partner that behaves like your{' '}
              <span className="h1-gold">team</span>
            </h1>
            <p className="lede">
              Stone worktops supplied and fitted for kitchen designers, builders,
              building contractors, developers and architects. We can deal with your
              customer directly, template, fabricate, fit and carry the guarantee, work
              to your programme, and turn up on the date we agreed.
            </p>
            <div className="cta-row">
              <a className="btn-gold" href="/contact/">
                <span className="cta-long">Open a trade account</span>
                <span className="cta-short">Trade account</span>
              </a>
              <a className="btn-ghost" href="tel:+448000982812">
                <span className="cta-long">Call 0800 098 2812</span>
                <span className="cta-short">Give us a call</span>
              </a>
            </div>
            <HeroChips />
          </div>
        </section>

        <div className="lead-grid">
          <div className="lead-main">
            <section className="block">
              <div className="wrap prose rise">
                <p>
                  Most of the trade problems we get called about are not stone problems.
                  They are diary problems: a supplier who templated too early, a fitter
                  who did not arrive, a joint that did not match the sample the client
                  signed off. Each one lands on you rather than on them.
                </p>
                <p>
                  We built our trade side around removing exactly that. One contact who
                  knows your job, dates confirmed in writing, and the same team from
                  template to fit, so nothing is handed over and nothing is lost in the
                  handover.
                </p>
              </div>
            </section>

            <section className="block">
              <div className="wrap rise">
                <h2>What you get from us</h2>
                <p className="sub">
                  One team runs the job from first measurement to final fit.
                </p>
                <div className="feat-grid">
                  <div className="feat">
                    <h3>Reliable to a schedule</h3>
                    <p>
                      We work around your site and confirm every date in writing. If your
                      programme moves, tell us and we move with it rather than sending
                      you to the back of a queue.
                    </p>
                  </div>
                  <div className="feat">
                    <h3>Consistent across units</h3>
                    <p>
                      The same finish, unit after unit, whether it is one kitchen or
                      forty. Slabs are reserved and matched up front so a later plot does
                      not arrive looking like a different scheme.
                    </p>
                  </div>
                  <div className="feat">
                    <h3>Trade pricing, protected</h3>
                    <p>
                      Competitive terms that hold, quoted so they stay yours for the
                      length of the project. No renegotiation halfway through and no
                      quiet uplift between plots.
                    </p>
                  </div>
                  <div className="feat">
                    <h3>One accountable contact</h3>
                    <p>
                      Template to fit through a single point, with drawings and samples
                      to help you pitch. You chase one person and that person has the
                      answer.
                    </p>
                  </div>
                  <div className="feat">
                    <h3>Safe, compliant fabrication</h3>
                    <p>
                      Every piece is cut wet, with extraction at the tool, to current HSE
                      guidance, so a supplier&#x27;s practices never become your
                      reputation problem.
                    </p>
                  </div>
                  <div className="feat">
                    <h3>Ten years, in writing</h3>
                    <p>
                      Every install carries our ten-year guarantee on top of the
                      manufacturer&#x27;s own warranty, and the aftercare visit sits
                      inside 72 hours if anything needs attention.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="block">
              <div className="wrap rise">
                <h2>Who we work with</h2>
                <ul className="ticks">
                  <li>
                    <strong>Kitchen designers</strong>Samples and drawings to close the
                    sale, honest steers on what suits the client&#x27;s life, and a fit
                    that reflects on your design rather than on our diary.
                  </li>
                  <li>
                    <strong>Builders and fit-out contractors</strong>One less trade to
                    manage. We template when the units are genuinely ready and fit when
                    we said we would.
                  </li>
                  <li>
                    <strong>Property developers</strong>Repeatable specification across
                    plots, reserved slabs so the last unit matches the first, and pricing
                    held for the length of the scheme.
                  </li>
                  <li>
                    <strong>Architects and specifiers</strong>Material advice with the
                    trade-offs stated plainly, plus samples and technical detail for
                    specification packs.
                  </li>
                </ul>
              </div>
            </section>

            <section className="block" id="how">
              <div className="wrap rise">
                <h2>How we work together</h2>
                <p className="sub">
                  From the first drawing to the signed-off fit, four simple steps.
                </p>
                <div className="steps">
                  <div className="step">
                    <div className="n">Step 1</div>
                    <h3>Talk it through</h3>
                    <p>
                      Send the drawings or the plot schedule. We come back with the
                      material options, the realistic dates and a fixed, itemised price.
                    </p>
                  </div>
                  <div className="step">
                    <div className="n">Step 2</div>
                    <h3>Open the account</h3>
                    <p>
                      One conversation sets your terms. From then on every job runs on
                      the same paperwork, so the second project takes a fraction of the
                      effort of the first.
                    </p>
                  </div>
                  <div className="step">
                    <div className="n">Step 3</div>
                    <h3>Template when ready</h3>
                    <p>
                      We template off the real cabinets once they are level and secure,
                      so nothing is cut to a drawing that moved on site.
                    </p>
                  </div>
                  <div className="step">
                    <div className="n">Step 4</div>
                    <h3>Cut, fit, sign off</h3>
                    <p>
                      Cut and polished to our template, fitted by our own team, and
                      signed off with you before we leave.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="block">
              <div className="wrap rise">
                <h2>Where we work</h2>
                <p className="sub">
                  We fit across London, Hertfordshire, Essex, Berkshire,
                  Buckinghamshire, Surrey, Oxfordshire &amp; Bedfordshire, with
                  nationwide templating on request. That includes Barnet, Enfield,
                  Watford, Harpenden, Hemel Hempstead, Welwyn, Hatfield, Hertford,
                  Potters Bar, Borehamwood, Radlett, Chelmsford, Brentwood, Romford,
                  Reading, Slough and Windsor.
                </p>
              </div>
            </section>
          </div>

          <aside className="lead-aside">
            <QuickForm defaultService="Commercial" />
          </aside>
        </div>

        <section className="block faq" id="faq">
          <div className="wrap rise">
            <h2>Trade questions</h2>
            <details>
              <summary>Do you work to a fixed programme?</summary>
              <div className="a">
                Yes. We confirm template and fit dates in writing and work to your
                sequence. If the site slips we re-book rather than charging you for the
                gap, provided you tell us as soon as you know.
              </div>
            </details>
            <details>
              <summary>Can you hold pricing across a multi-plot development?</summary>
              <div className="a">
                Yes. Trade terms are quoted for the length of the scheme rather than per
                job, so the figure you priced the development on is the figure that still
                applies at the last plot.
              </div>
            </details>
            <details>
              <summary>Will the stone match across units?</summary>
              <div className="a">
                We reserve and match slabs up front for multi-unit work, so plot forty
                reads the same as plot one. Where a run needs more than one slab we
                vein-match the joints by hand.
              </div>
            </details>
            <details>
              <summary>Who actually fits it?</summary>
              <div className="a">
                Our own team. The people who template your job are the people who cut it
                and the people who fit it, which is why there is one contact rather than
                a chain.
              </div>
            </details>
            <details>
              <summary>How quickly can you turn a job around?</summary>
              <div className="a">
                Template to fit is typically three to five working days once the units
                are ready. For programmed work we book the slot in advance so it never
                becomes the thing that holds you up.
              </div>
            </details>
            <details>
              <summary>Do you offer samples for client presentations?</summary>
              <div className="a">
                Yes. Tell us what you are pitching and we will get samples and drawings
                to you, and we can join the client conversation if it helps close it.
              </div>
            </details>
          </div>
        </section>

        <section className="cta-band">
          <div className="wrap rise">
            <h2>Open a trade account</h2>
            <p>
              Send us a drawing or a plot schedule and we will come back with materials,
              dates and a fixed, itemised price. One conversation sets your terms for
              every job after it. Ask for Nick.
            </p>
            <div className="cta-row">
              <a className="btn-gold" href="/contact/">
                Open a trade account
              </a>
              <a className="btn-ghost" href="tel:+448000982812">
                Talk to our trade team
              </a>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

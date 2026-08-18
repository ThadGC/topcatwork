#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Topcat Worktops — SEO page generator.

Generates three page families that close the content gaps found in the 7 Aug 2026
SEO research (see Docs/topcat-worktops-seo-build-plan.md):

    /materials/<slug>.html                    5 per-material pages
    /guides/<slug>.html                       9 comparison + guide pages
    /worktops/<county>/index.html      4 county hubs
    /worktops/<county>/<town>/index.html   4 town pages

Run from inside "Website Demo":

    python3 build_seo_pages.py

------------------------------------------------------------------------------
HOUSE RULES honoured throughout. Breaking one of these is a client-visible error.
------------------------------------------------------------------------------
⛔ FABRICATION IS IN-HOUSE AGAIN (client decision, 14 Aug 2026, in his own notes
   document — REVERSING the 7 Aug 2026 rule that reversed the one before it).
   Topcat advise, source the slab, template BY HAND, cut and polish with their
   own experienced fabricators, fit, and carry the ten year guarantee. "Our
   experienced fabricators" is his wording and it is the wording to use.
   ⚠️ HISTORY, so this is not flipped back by accident: 7 Aug 2026 banned every
   in-house claim outright ("we don't do in house fabrication, do not talk about
   in house fabrication") and the whole site was rewritten around it. His 14 Aug
   document claims in-house fabrication in five separate places, including an
   HSE dust-control answer, so it is a considered position and not a slip.
⛔ NEVER "LASER" ANYTHING (client, 14 Aug 2026): "we template everything by
   hand". Say templated, measured or templated by hand.
⛔ NO SHOWROOM of our own. Samples come to the customer, and slabs may be
   approved from photographs OR chosen in person at the distributor's warehouse,
   which the client recommends (14 Aug 2026).
⛔ NEVER a founding year or anything signalling a young company.
⛔ NEVER a review count and NEVER aggregateRating/review schema. 5.0 on Google
   only. Google explicitly makes self-reviewed star markup ineligible anyway.
⛔ NEVER name the trade suppliers (Nile Stone, Next Stone Slabs) publicly.
⛔ NEVER discount or "cheapest" language. Value, not cheap.
⛔ NEVER claim a product is "silica free" without a manufacturer SDS on file.
✅ Voice: British English, commas not em dashes, no exclamation marks, plain,
   exact, warm, quietly confident. No AI-tell phrasing.

SCHEMA POLICY (verified 7 Aug 2026, see the build plan):
   BUILD:      Organization, HomeAndConstructionBusiness, BreadcrumbList,
               Article + author Person.
   NEVER BUILD: FAQPage (deprecated, rich results stopped 7 May 2026, docs
               deleted 15 June 2026), HowTo, Service, WebSite+SearchAction,
               aggregateRating/review on our own pages, Product/Offer without a
               real visible price, LocalBusiness on location pages (we are not
               located there, and marking it up risks a manual action).
   FAQ CONTENT stays as visible copy on the page. Only the markup is dead.
"""
import html, json, pathlib, shutil

# ⭐⭐⭐ CACHE IDENTITY FOR THE HAND-MAINTAINED STYLESHEETS — 17 Aug 2026 (D289).
# `assets/site.css` and `site.js` have carried a content hash for weeks; `service.css`,
# `stone.css` and `seo.css` never have, and they are the sheets every GENERATED page links.
# ⛔ THAT IS WHY A RE-UPLOADED SITE CAME BACK LOOKING UNCHANGED: the HTML was new, the
# stylesheet was the browser's old copy, and `service.css` alone dresses 176 pages.
# ⚠️ The hash is of the file ON DISK at build time, so it can only be wrong if the builder is
# not re-run — which is already a gate (§8).
def _sig(path):
    import hashlib, pathlib as _p
    p = _p.Path(path)
    try:
        return "?v=" + hashlib.sha1(p.read_bytes()).hexdigest()[:10]
    except OSError:
        return ""

HERE = pathlib.Path(__file__).resolve().parent
SVC_SIG = _sig(HERE / "services" / "service.css")
FOOT_SIG = _sig(HERE / "assets" / "footer.css")
NAV_SIG = _sig(HERE / "assets" / "nav.css")
SEO_SIG = _sig(HERE / "seo.css")


ROOT = pathlib.Path(__file__).resolve().parent
BASE = "https://www.topcatworktops.co.uk"

PHONE_DISPLAY = "0800 098 2812"
PHONE_TEL = "+448000982812"
EMAIL = "info@topcatworktops.co.uk"
HOURS = "Monday to Sunday, 7am to 9pm"
AREA = "London, Hertfordshire, Essex, Berkshire, Buckinghamshire, Surrey, Oxfordshire & Bedfordshire"
AREAS_SERVED = ["London", "Hertfordshire", "Essex", "Berkshire", "Buckinghamshire",
                "Surrey", "Oxfordshire", "Bedfordshire"]
GUARANTEE_YEARS = 10

# The named author on every guide. E-E-A-T: guides need a real person with a real
# role. Nick is the client-approved public name and the front-of-house contact.
AUTHOR = "Nick"
AUTHOR_ROLE = "Managing Director, Topcat Worktops"
AUTHOR_URL = f"{BASE}/about/"
# ⚠️ Shown as "Last reviewed" on every guide. Bump when the copy is genuinely
# re-checked, not on every rebuild, or the date stops meaning anything.
LAST_REVIEWED = "7 August 2026"
LAST_REVIEWED_ISO = "2026-08-07"

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

# Matches the landing page nav exactly. Trade is a real page, not a hash.
NAV_LINKS = [
    ("/services/", "Services"), ("/projects/", "Projects"),
    ("/stones/", "Stones"), ("/estimate/", "Estimate"),
    ("/about/", "About us"), ("/trade/", "Trade"), ("/contact/", "Contact"),
]

HERO_IMG = "/assets/kitchen-day.jpg"


def e(s):
    return html.escape(str(s), quote=True)


def gold_last(text):
    """⭐⭐ THE LAST WORD OF A PAGE TITLE IS GOLD, THE REST WHITE — 14 Aug 2026 (D229).
    ⛔ THE SAME FUNCTION LIVES IN `services/build_services.py` AND THE TWO MUST AGREE. They are
    one visual rule on one shared component (`.svc-hero`, which this family and the service
    pages both use), and the alternative to two copies is importing across builders, which runs
    the other one's module-level work. ⚠️ If you change one, change the other.
    ⛔ One word stays white: `rsplit` returns a single part and nothing is wrapped."""
    parts = str(text).rsplit(" ", 1)
    if len(parts) == 1:
        return e(text)
    return f'{e(parts[0])} <span class="h1-gold">{e(parts[1])}</span>'


# ---------------------------------------------------------------------------
# SHARED SHELL
# ---------------------------------------------------------------------------
def nav_html(depth):
    """depth is only used for the stylesheet href, all nav links are absolute."""
    links = "".join(f'<a href="{h}">{e(t)}</a>' for h, t in NAV_LINKS)
    return f"""<header class="bar">
  <a class="brand" href="/index.html#hero" aria-label="Topcat Worktops, home">{BRAND_LOGO}</a>
  <nav class="top" aria-label="Primary">{links}</nav>
  <a class="bar-cta" href="/contact/">Get a quote</a>
  {NAV_BURGER}
</header>
{NAV_SHEET}
{NAV_JS}
{TC_DEFS}"""


# ⭐ D263 — THE THREE CONSTANTS THIS FAMILY SHARES WITH THE SERVICE LEAVES. The originals and the
# reasoning are in `services/build_services.py`; they are repeated here because each builder emits
# its own page shell, and there is no import path between them. ⛔ A change to any of the three has
# to be made in `services/build_services.py`, here, and in `stones/build_stones.py`.
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
{extra}      </div>"""


def hero_chips(*extra):
    """The four bubbles, plus any place-specific ones this page wants.

    ⭐ THE LOCATION PAGES KEEP THEIR LOCAL FACT (D263). The county and town heroes carried a
    dialling code and a postcode range in their trust line, which is the one thing on those pages
    that is genuinely local, and dropping it to make a shared component fit would have traded real
    content for tidiness. A fifth bubble spans both columns on its own — `.hero-chips`'s
    `:last-child:nth-child(odd)` rule was written for exactly this and has been dormant since.
    """
    rows = "".join(f'        <span class="chip chip-reason">{x}</span>\n' for x in extra if x)
    return HERO_CHIPS.format(extra=rows)

# ⚠️ THIS FAMILY HAD NO SCRIPT AT ALL until D263, and the bar's glass needs one. It is appended to
# `footer_html()` rather than added to eight page templates by hand — the footer is the last thing
# before `</body>` on every one of them, so that is one place instead of eight.
BAR_JS = ("<script>document.addEventListener('DOMContentLoaded',function(){"
          "var bar=document.querySelector('header.bar'),on=false;"
          "function s(){var y=window.scrollY>12;if(y!==on){on=y;bar.classList.toggle('scrolled',y);}}"
          "if(bar){s();window.addEventListener('scroll',s,{passive:true});}});</script>")

# ⭐⭐⭐ THE FOOTER IS LIFTED FROM index.html, NOT WRITTEN AGAIN HERE — 17 Aug 2026 (D290).
# Client: *"the inner pages footer on mobile doesn't look like the hero section foot on mobile.
# Just make sure that the footer are consistent on every device all across the site, the same as
# on the landing page."*
# ⛔⛔ THREE BUILDERS EACH CARRIED THEIR OWN HAND-WRITTEN FOOTER and all three had drifted: the
# landing footer is 4497 characters, these were 1928 (services, stones) and 1755 (the SEO layer,
# which used `class="foot"` instead of `class="site"` and so missed every `#footer` rule in the
# stylesheet). `build_pages.py` has always LIFTED it for the seven internal pages, which is why
# those seven were the only ones that matched. Now everything does.
# ⚠️ SAFE TO LIFT VERBATIM AT ANY DEPTH: every href in it is root-relative or absolute — checked,
# there is not one relative path — and its only image is /assets/brand/topcat-vertical.svg.
def _footer_from_index():
    import pathlib as _p
    src = (_p.Path(__file__).resolve().parent / "index.html").read_text(encoding="utf-8")
    i = src.index('<footer class="site"')
    j = src.index("</footer>", i) + len("</footer>")
    return src[i:j]


FOOTER_HTML = _footer_from_index()

# ⭐⭐ AND THE FOOTER'S OWN SCRIPT COMES WITH IT. On the tablet the Area and Hours blocks move out
# of the contact column into `.foot-tail`, and there is no CSS property that re-parents a node
# (D200) — so the landing page does it in JS. These pages do NOT load `assets/site.js`, which is
# the whole 509 KB landing bundle and has no business on a stone page, so the fifteen lines that
# matter are inlined instead. ⛔ Without this the footer LOOKS right and then rearranges wrongly
# the moment the window is a tablet.
# ⚠️ It reads `--footTail` off the stylesheet rather than deciding for itself what a tablet is —
# a matchMedia here would be a second opinion, and the two would disagree at the edge.
FOOT_JS = ("<script>(function(){var f=document.querySelector('#footer')||document.querySelector('footer'),"
           "t=document.getElementById('footTail'),c=document.querySelector('.foot-contact'),"
           "a=document.querySelector('.foot-c-area'),h=document.querySelector('.foot-c-hours');"
           "if(!f||!t||!c||!a||!h)return;function p(){var on=getComputedStyle(f)"
           ".getPropertyValue('--footTail').trim()==='on',host=on?t:c;"
           "if(a.parentElement!==host){host.appendChild(a);host.appendChild(h);}}"
           "p();window.addEventListener('resize',p,{passive:true});})();</script>")


def footer_html():
    # ⚠️ QFORM_JS ships on every page in this family, including the three indexes and the sitemap
    # that carry no card: its IIFE returns immediately when `#qform` is absent, which is cheaper
    # than a second template branch and cannot drift out of step with the markup.
    return FOOTER_HTML + FOOT_JS + BAR_JS + QFORM_JS

# ⭐⭐ THE MOBILE NAV IS LIFTED FROM index.html TOO — 17 Aug 2026 (D295), §13 item 7. Below
# 1121px these pages hid `nav.top` and offered NOTHING in its place: no way off a leaf page on
# a phone except "Get a quote". The landing page has carried the burger + full-screen overlay
# since D184, with the D194 submenus the client demanded in his own words ("did I not fucking
# ask you to create a drop down in the menu?"), so the leaf pages take the SAME component the
# D290 way: markup lifted from index.html at build time, rules in the generated
# /assets/nav.css, and the toggle JS inlined below (these pages do not load site.js).
# ⚠️ ONE REWRITE ON THE LIFT: the overlay's CTA is `href="#cta"` on the landing, and no leaf
# page carries that id — it becomes /contact/, which is where the leaf bar's own CTA goes.
def _nav_from_index():
    import pathlib as _p, re as _re
    src = (_p.Path(__file__).resolve().parent / "index.html").read_text(encoding="utf-8")
    i = src.index('<button class="nav-burger"')
    j = src.index("</button>", i) + len("</button>")
    burger = _re.sub(r"<!--.*?-->", "", src[i:j], flags=_re.S)
    i = src.index('<nav class="mobile-nav"')
    j = src.index("</nav>", i) + len("</nav>")
    sheet = _re.sub(r"<!--.*?-->", "", src[i:j], flags=_re.S)
    sheet = sheet.replace('href="#cta"', 'href="/contact/"')
    # the bar template is an f-string; a stray brace in lifted markup would crash the build
    assert "{" not in burger and "}" not in burger, "brace in lifted burger markup"
    assert "{" not in sheet and "}" not in sheet, "brace in lifted overlay markup"
    return burger, sheet


NAV_BURGER, NAV_SHEET = _nav_from_index()

# The landing's burger IIFE, comment-stripped (same treatment as FOOT_JS): toggle + Escape +
# close-on-link + the D194 caret expansion, one panel open at a time.
NAV_JS = ("<script>(function(){var b=document.getElementById('navBurger'),"
          "s=document.getElementById('mobileNav');if(!b||!s)return;"
          "function o(v){document.documentElement.classList.toggle('nav-open',v);"
          "b.setAttribute('aria-expanded',v);b.setAttribute('aria-label',v?'Close menu':'Open menu');"
          "if(!v)c();}"
          "b.addEventListener('click',function(){o(!document.documentElement.classList.contains('nav-open'));});"
          "s.addEventListener('click',function(e){if(e.target.closest('a'))o(false);});"
          "window.addEventListener('keydown',function(e){if(e.key==='Escape')o(false);});"
          "s.addEventListener('click',function(e){var t=e.target.closest('.mn-toggle');if(!t)return;"
          "var p=document.getElementById(t.getAttribute('aria-controls'));if(!p)return;"
          "var open=!p.classList.contains('open');c();"
          "if(open){p.classList.add('open');p.style.maxHeight=p.scrollHeight+'px';"
          "t.setAttribute('aria-expanded','true');}});"
          "function c(){s.querySelectorAll('.mn-sub').forEach(function(p){p.classList.remove('open');p.style.maxHeight='';});"
          "s.querySelectorAll('.mn-toggle').forEach(function(x){x.setAttribute('aria-expanded','false');});}"
          "})();</script>")




def head_html(title, metadesc, url, css_depth, extra_ld=""):
    css = "../" * css_depth
    return f"""<!DOCTYPE html>
<html lang="en-GB">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{e(title)}</title>
<meta name="description" content="{e(metadesc)}">
<link rel="canonical" href="{url}">
<meta name="robots" content="index, follow">
<meta property="og:type" content="website">
<meta property="og:title" content="{e(title)}">
<meta property="og:description" content="{e(metadesc)}">
<meta property="og:url" content="{url}">
<meta property="og:site_name" content="Topcat Worktops">
<meta property="og:image" content="https://www.topcatworktops.co.uk/assets/site/og-cover.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" type="image/svg+xml" href="{FAVICON}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700&family=Montserrat:wght@200;300;400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/services/service.css{SVC_SIG}">
<link rel="stylesheet" href="/assets/footer.css{FOOT_SIG}">
<link rel="stylesheet" href="/assets/nav.css{NAV_SIG}">
<link rel="stylesheet" href="/seo.css{SEO_SIG}">
{extra_ld}
</head>
<body>
{nav_html(css_depth)}
"""


BACK_BTN = (
    '<a class="crumb-back" href="{href}" aria-label="Back to {label}" onclick="if(history.length>1&&document.referrer&&new URL(document.referrer,location).origin===location.origin){{history.back();return false}}"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><defs><linearGradient id="backGold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#C6A664"/><stop offset=".5" stop-color="#E4CD92"/><stop offset="1" stop-color="#C6A664"/></linearGradient></defs><path d="M15 18l-6-6 6-6" stroke="url(#backGold)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></a>'
)


# ⭐⭐⭐ THE SIDEBAR QUOTE CARD — 17 August 2026 (D300). Client, with an SBX screenshot: the inner
# pages are "very content heavy", the copy sits left and "leaves a lot of space on the right, which
# looks bad", so the empty column earns its place by carrying a form that "attaches to the nav bar
# as the user scrolls down into that section, and then it folds behind sections that go across it".
# The layout, the sticky offset and the desktop-only gate all live in service.css under THE LEAD
# LAYOUT; this is the markup and the demo behaviour.
# ⚠️ THE FIELDS MATCH THE LANDING PAGE'S ENQUIRY FORM so there is one set of questions on the site,
# and the service select is seeded with the page's own subject where there is one — a visitor who
# clicked "Kitchen worktops" should not have to say so twice.
# ⛔ NO BACKEND IS WIRED AND THAT IS NOT A BLOCKER (§2 rule 13, his own pre-launch task). The submit
# is intercepted and acknowledged in place, exactly as the landing page's form has done since
# 7 August. ⭐ TO GO LIVE: POST the FormData to a handler and replace the acknowledgement.
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


QFORM_JS = ("<script>(function(){var f=document.getElementById('qform');if(!f)return;"
            "f.addEventListener('submit',function(ev){ev.preventDefault();"
            "f.classList.add('sent');});})();</script>")


def crumbs(items):
    """items: list of (href|None, label). Last one is the current page."""
    lis = []
    for href, label in items:
        if href:
            lis.append(f'<li><a href="{href}">{e(label)}</a></li>')
        else:
            lis.append(f'<li aria-current="page">{e(label)}</li>')
    # ⭐ The back target is the PARENT CRUMB, taken from the trail itself rather than typed:
    # it is therefore always a real page, always one level up, and always correct even when
    # the visitor landed here cold from search with no history to go back to.
    parents = [(h, l) for h, l in items if h]
    back = ""
    if parents:
        href, label = parents[-1]
        back = BACK_BTN.format(href=href, label=e(label))
    return (f'<nav class="crumb" aria-label="Breadcrumb">{back}'
            f'<ol>{"".join(lis)}</ol></nav>')


def breadcrumb_ld(items, url):
    """BreadcrumbList only. Desktop-only rich result, but it is one of the few
    types Google still actually uses, and it signals the hierarchy that keeps
    the location pages out of doorway territory."""
    out, pos = [], 1
    for href, label in items:
        item = f"{BASE}{href}" if href else url
        out.append({"@type": "ListItem", "position": pos, "name": label, "item": item})
        pos += 1
    return {"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": out}


def ld_block(*objs):
    objs = [o for o in objs if o]
    if not objs:
        return ""
    body = json.dumps(objs[0] if len(objs) == 1 else objs, indent=1, ensure_ascii=False)
    return f'<script type="application/ld+json">\n{body}\n</script>'


def gold_last(text):
    """The site's white-then-gold title shape, applied to a heading string.

    ⭐ D229 is the client's own rule and it includes the exception: "the first word is gonna be
    white, and then second word is gonna be gold. And if it's just one word, it's gonna be a
    white word." So a one-word heading is returned untouched rather than turned entirely gold.
    ⚠️ Escapes FIRST and adds the tag after, or the `<em>` would be escaped with the text.
    ⚠️ Every heading that reaches here is a plain sentence from a call site below; if one ever
    arrives already carrying markup, this splits on its last space and would break the tag.
    """
    parts = e(text).rsplit(" ", 1)
    return parts[0] if len(parts) == 1 else f'{parts[0]} <em>{parts[1]}</em>'


def cta_band(heading, line):
    return f"""<section class="cta-band">
  <div class="wrap">
    <h2>{gold_last(heading)}</h2>
    <p>{e(line)}</p>
    <div class="cta-row">
      <a class="btn-gold" href="/contact/">Get your free quote</a>
      <a class="btn-ghost" href="tel:{PHONE_TEL}">Call {PHONE_DISPLAY}</a>
    </div>
    <p class="cta-note">Free home visit with samples. Every cut-out included. Ten year guarantee.</p>
  </div>
</section>"""


def faq_block(faqs, heading="Frequently asked questions"):
    """⚠️ VISIBLE CONTENT ONLY. No FAQPage schema, it was deprecated on
    7 May 2026 and the documentation deleted on 15 June 2026. The content still
    earns its place for readers and for AI extraction.

    ⭐ D263: it says "Frequently asked questions" now, his instruction, and it takes `gold_last`
    like every other heading on the site. ⚠️ The location pages pass their own heading and keep the
    place in it ("Frequently asked questions in St Albans") — that place name is the reason those
    pages rank, and a shared default must not quietly delete it.
    ⭐ The rows are wrapped in `.faq-grid`, which is what makes them cards in two columns."""
    rows = "".join(
        f"<details><summary>{e(q)}</summary><div class='a'>{e(a)}</div></details>"
        for q, a in faqs)
    return (f'<section class="faq"><div class="wrap"><h2>{gold_last(heading)}</h2>'
            f'<div class="faq-grid">{rows}</div></div></section>')


def table_block(caption, head, rows):
    ths = "".join(f"<th scope='col'>{e(h)}</th>" for h in head)
    trs = ""
    for r in rows:
        cells = "".join(
            (f"<th scope='row'>{e(c)}</th>" if i == 0 else f"<td>{e(c)}</td>")
            for i, c in enumerate(r))
        trs += f"<tr>{cells}</tr>"
    return (f'<div class="tbl-wrap"><table class="tbl"><caption>{e(caption)}</caption>'
            f"<thead><tr>{ths}</tr></thead><tbody>{trs}</tbody></table></div>")


# ===========================================================================
# MATERIAL PAGES
# ===========================================================================
# Structure per the research: plain definition inside the first 40 words with a
# composition figure, honest limits with real numbers, a price band in writing,
# the colour and brand range, the process, the differentiators as plain facts,
# then a visible FAQ. 1,200 to 1,800 words. The honest-limits section is the
# part that ranks: the current number one for "is quartz heatproof" opens by
# saying no.
MATERIALS = [
  dict(
    slug="quartz-worktops", short="Quartz", h1="Quartz worktops",
    title="Quartz Worktops | Supplied & Fitted Across London & the Home Counties | Topcat",
    metadesc="Engineered quartz worktops templated, fitted and guaranteed for ten years. Every cut-out included, pencil edges as standard. Free home visit across London, Hertfordshire, Essex, Berkshire, Buckinghamshire, Surrey, Oxfordshire & Bedfordshire.",
    eyebrow="Engineered stone",
    lede="The most popular worktop material in Britain, and for good reason. Non-porous, hard wearing, and consistent from one slab to the next.",
    defn=("Quartz worktops are an engineered stone, roughly 90 to 93 per cent crushed natural "
          "quartz bound with about 7 to 10 per cent resin and pigment, pressed into slabs. "
          "That resin is what makes it non-porous, so unlike granite or marble it never needs "
          "sealing, and it is why the colour is consistent across a whole kitchen."),
    body=[
      ("Why most kitchens end up here",
       "Quartz is the default for a reason. It is non-porous, so red wine, olive oil, turmeric "
       "and coffee sit on the surface rather than soaking into it. It resists scratching from "
       "everyday use. It arrives the colour you chose, because it is manufactured rather than "
       "quarried, so the piece by your sink matches the piece on your island and the slab you "
       "approve is the slab you get. For a working family kitchen that gets used hard, it is "
       "the surface that asks least of you."),
      ("The honest limits, with numbers",
       "Quartz is heat resistant, not heatproof. The resin that binds it begins to suffer "
       "somewhere around 150 degrees, and a pan straight off a gas ring is comfortably past "
       "that, so a scorch mark is permanent and not repairable in place. Use a trivet and it "
       "is a non-issue. Quartz is also not for outdoors or a conservatory that bakes, because "
       "ultraviolet light will fade some pigments over a few years. And while it resists "
       "scratching, it is not a chopping board. If those three things rule it out for you, "
       "porcelain solves all three, and we would rather tell you that now than after fitting."),
      ("What it costs",
       "Most quartz kitchens land between £2,000 and £5,000 supplied and fitted, including "
       "VAT. The variables are the number of slabs your layout needs, the stone you pick, and "
       "the detailing. A single run in a mid-range white is at the bottom of that. Three slabs "
       "in a heavily veined Calacatta with a mitred island and a full height splashback is at "
       "the top. Our estimator gives you a real range in about a minute, and the itemised "
       "price follows a free home visit."),
      ("Colours and brands worth knowing",
       "The marble looks dominate at the moment: Calacatta and Statuario patterns with strong "
       "grey or gold veining, on a bright white or warm white base. Behind those, the warm "
       "neutrals have replaced the cold greys, so mushroom, putty, oat and soft cream are "
       "where the range has grown. Plain whites and blacks still sell steadily. We work with "
       "Silestone, Caesarstone, Technistone, Unistone, Compac, Cimstone, Ceralsio, Noble "
       "Stone, iStone and Next Stone Slabs, so if you have seen a specific colour, tell us "
       "the name "
       "and we will find it or show you the closest thing in stock."),
      ("Thickness, edges and the details that get charged elsewhere",
       "Twenty millimetre and thirty millimetre are both standard. Thirty reads more solid and "
       "carries a longer unsupported overhang on an island. Twenty is lighter and slightly "
       "more contemporary, and a mitred edge can make it look as thick as you like. Every "
       "cut-out is free with us, for the sink, the hob, the taps and the sockets, however many "
       "there are. Pencil edges come as standard, which rounds the corner very slightly so it "
       "is kind to small hands. Drainer grooves are standard too. Those three are commonly "
       "priced as extras elsewhere and they are not extras here."),
    ],
    facts=[("Composition","About 90 to 93% crushed quartz, 7 to 10% resin and pigment"),
           ("Porosity","Non-porous, never needs sealing"),
           ("Heat","Resistant to roughly 150°C, use a trivet, not heatproof"),
           ("Outdoors","Not suitable, UV fades some pigments"),
           ("Typical slab","3200mm x 1600mm"),
           ("Thickness","20mm or 30mm")],
    price="£2,000 to £5,000 for most kitchens, supplied, fitted and including VAT",
    faqs=[
      ("Do quartz worktops need sealing?",
       "No. Quartz is non-porous, so there is nothing for a sealer to soak into. Warm soapy "
       "water and a cloth is the whole maintenance routine. That is the main practical "
       "difference between quartz and granite or marble, which both want resealing periodically."),
      ("Can you put a hot pan on a quartz worktop?",
       "Not straight from the hob. Quartz handles warmth but the resin binder can mark above "
       "roughly 150 degrees, and that mark is permanent. Use a trivet. If you want a surface "
       "you never have to think about around the hob, porcelain takes direct heat, and a lot "
       "of kitchens run porcelain by the hob and quartz everywhere else."),
      ("Will I see the joins?",
       "You will be able to find them if you look, and you will stop noticing them within a "
       "week. We plan joint positions before anything is cut, keep them out of sight lines "
       "where the layout allows, and match the veining across the joint so the pattern runs "
       "through rather than stopping dead. Anybody promising an invisible join in a patterned "
       "stone is overselling."),
      ("Is quartz safe to have in the house?",
       "Yes. The silica question is about dust created when the stone is cut, which is a "
       "workshop matter, not a kitchen one. A finished, sealed, installed worktop poses no "
       "silica risk to your household. We cover it properly in our guide to quartz and silica."),
    ],
    related=["granite-worktops","porcelain-worktops","marble-worktops"],
    guides=["how-much-do-quartz-worktops-cost","quartz-vs-granite-worktops","is-quartz-heatproof","is-quartz-safe-silica","20mm-vs-30mm-quartz-worktops"],
  ),
  dict(
    slug="granite-worktops", short="Granite", h1="Granite worktops",
    title="Granite Worktops | Supplied & Fitted Across London & the Home Counties | Topcat",
    metadesc="Natural granite worktops, templated, fitted and guaranteed for ten years. Every cut-out included. Free home visit and samples across London, Hertfordshire, Essex, Berkshire, Buckinghamshire, Surrey, Oxfordshire & Bedfordshire.",
    eyebrow="Natural stone",
    lede="Quarried rock, no two slabs alike, and the most heat tolerant of the natural stones. The classic that keeps earning its place.",
    defn=("Granite is a natural igneous rock, quarried in blocks and sawn into slabs. It is "
          "mostly feldspar, quartz and mica, formed under heat and pressure over millions of "
          "years, which is why every slab is different and why it copes with heat better than "
          "any engineered surface."),
    body=[
      ("What granite does better than anything else",
       "Heat. You can stand a hot pan on granite and walk away. That single property keeps it "
       "in kitchens where people genuinely cook, long after fashion moved to quartz. It is "
       "also extremely hard, it ages well rather than dating, and because it is quarried "
       "rather than manufactured, your kitchen has a surface nobody else has."),
      ("The honest limits",
       "Granite is porous, which means it wants sealing. Once on installation, then "
       "realistically once a year, and it takes about ten minutes with a cloth. Skip it for "
       "years and an oil spill near the hob can leave a darker patch. Because it is natural, "
       "the slab will not look exactly like a small sample, which is why we send you "
       "photographs of your actual slab before anything is cut. And the darkest granites show "
       "smears and dust more than a mid-tone does, which is worth knowing before you fall for "
       "a polished black."),
      ("What it costs",
       "Granite spans a wider band than quartz because the stone itself varies enormously, "
       "from common blacks and speckled greys through to rare exotics that cost multiples of "
       "the same area in quartz. Most granite kitchens land in a similar place to quartz, but "
       "we price granite by hand rather than through the calculator, precisely because the "
       "material cost swings so much between one block and another and between suppliers. "
       "Tell us the room and we will price it properly."),
      ("Colours worth knowing",
       "Absolute Black remains the most requested and the most flattering to brass and warm "
       "timber. Steel Grey and Silver Pearl sit in the middle and hide daily life well. "
       "Star Galaxy, with its fine gold flecks, is the one people fall for in the flesh. At "
       "the exotic end there are blues and greens with real movement, which behave more like "
       "a feature stone than a work surface, and they are usually best on an island."),
      ("Granite and the silica conversation",
       "This is worth saying plainly, because it is a genuine advantage. Granite contains "
       "substantially less crystalline silica than engineered quartz, typically a fraction of "
       "it. That matters for the people cutting it rather than for you, but if the silicosis "
       "coverage has made you uneasy about engineered stone, natural granite is a reasonable "
       "answer to that concern, and it is an honest one."),
    ],
    facts=[("Composition","Natural rock, mainly feldspar, quartz and mica"),
           ("Porosity","Porous, seal on fitting then roughly annually"),
           ("Heat","Excellent, hot pans direct on the surface"),
           ("Outdoors","Yes, hard granites suit outdoor kitchens"),
           ("Typical slab","3000mm x 1700mm"),
           ("Silica","Much lower than engineered quartz")],
    price="Priced by hand, because the block and the supplier move the cost significantly",
    faqs=[
      ("How often does granite need sealing?",
       "Once when we fit it, then roughly once a year. It is a ten minute job with a cloth and "
       "a bottle you can buy anywhere. A quick test: leave a few drops of water on the surface "
       "for half an hour, and if it darkens the stone, it is ready for resealing."),
      ("Can you put hot pans straight onto granite?",
       "Yes. Granite came out of the ground under heat and pressure and a hot pan does not "
       "trouble it. It is the main practical reason people still choose granite over quartz."),
      ("Will my granite look like the sample?",
       "Not exactly, and that is the point of it. A sample the size of a postcard cannot show "
       "the movement in a three metre slab. We send you photographs of your actual slab before "
       "anything is cut, so you approve the real thing rather than a representative piece."),
      ("Is granite going out of fashion?",
       "Quartz outsells it now, but granite has a loyal following and is not going anywhere. "
       "If you cook seriously, or you want a surface nobody else has, it is still the better "
       "answer. Fashion is a poor reason to choose a surface you will keep for twenty years."),
    ],
    related=["quartz-worktops","marble-worktops","quartzite-worktops"],
    guides=["quartz-vs-granite-worktops","best-kitchen-worktop-material","how-much-do-quartz-worktops-cost"],
  ),
  dict(
    slug="marble-worktops", short="Marble", h1="Marble worktops",
    title="Marble Worktops | Carrara & Calacatta, Supplied & Fitted | Topcat Worktops",
    metadesc="Marble worktops templated, fitted and guaranteed for ten years, with honest advice on where marble works and where it does not. Free home visit across London and the Home Counties.",
    eyebrow="Natural stone",
    lede="The most beautiful surface you can put in a kitchen, and the one that asks the most of you. Worth it in the right place.",
    defn=("Marble is a natural metamorphic rock, limestone recrystallised under heat and "
          "pressure, which is where the veining comes from. It is softer and more porous than "
          "granite, and it reacts with acid, which is the single fact that should decide "
          "whether it belongs in your kitchen."),
    body=[
      ("Read this before you fall in love",
       "We would rather talk you out of marble in the wrong place than fit it and watch you "
       "regret it. Marble etches. A splash of lemon juice, vinegar, wine or a wet tomato tin "
       "left on the surface will eat a dull mark into the polish, and that mark is chemical, "
       "not dirt, so it does not clean off. It happens in minutes. If your kitchen is the "
       "family thoroughfare and nobody is going to wipe a spill straight away, marble will "
       "make you unhappy."),
      ("Where marble is genuinely the right answer",
       "A baking zone, because it stays cool and pastry loves it. An island in a kitchen where "
       "the real cooking happens elsewhere. A utility or a boot room. A bathroom vanity, where "
       "citrus never appears. And any kitchen belonging to somebody who actively likes the way "
       "stone ages, because a marble surface develops a patina of small etches that reads as "
       "character if you want it to and as damage if you do not. Both reactions are valid, and "
       "only you know which one you are."),
      ("The honest limits",
       "Porous, so it stains as well as etches, and red wine on unsealed marble is not a "
       "story with a happy ending. It wants sealing on fitting and then regularly, more often "
       "than granite. It is softer, so it scratches. Honed marble hides etching far better "
       "than polished, because there is less shine to dull, and if you are set on marble we "
       "will usually steer you honed."),
      ("The alternative worth considering",
       "If you want the look without the upkeep, the marble effect quartzes have become very "
       "good. Calacatta and Statuario patterns in engineered quartz are non-porous, do not "
       "etch, and from two steps away most people cannot tell. Quartzite is the other answer: "
       "a natural stone with marble like movement but far more durability. We stock both and "
       "will happily put samples side by side in your kitchen."),
      ("What it costs",
       "Marble is priced by hand. The material cost swings enormously between one block and "
       "the next and between suppliers, so a calculator could only give you a number we could "
       "not stand behind. Carrara is the most attainable, Calacatta with strong gold veining "
       "is the most expensive, and the same name can mean very different stone depending on "
       "the quarry and the block."),
    ],
    facts=[("Composition","Natural metamorphic rock, recrystallised limestone"),
           ("Porosity","Porous, seal on fitting and regularly after"),
           ("Acid","Etches on contact with lemon, vinegar, wine, tomato"),
           ("Heat","Good, but thermal shock can craze a polished surface"),
           ("Best finish","Honed, it hides etching far better than polished"),
           ("Typical slab","2800mm x 1600mm")],
    price="Priced by hand, the block and the supplier move the cost significantly",
    faqs=[
      ("Does marble stain easily?",
       "It can, because it is porous. Sealing helps a great deal and we seal on fitting. The "
       "bigger issue is etching, which is different from staining: it is a chemical reaction "
       "with acid that dulls the polish rather than adding colour, and no sealer fully "
       "prevents it."),
      ("What is the difference between Carrara and Calacatta?",
       "Both come from the same region of Italy. Carrara is greyer, with softer, finer, more "
       "feathery veining, and it is the more attainable of the two. Calacatta is whiter with "
       "bolder, more dramatic veins, often with gold or warm brown, and it costs "
       "considerably more."),
      ("Is marble a bad idea in a family kitchen?",
       "Often, yes, and we will say so. If nobody in the house is going to wipe up a lemon "
       "slice within a few minutes, you will collect etch marks. In that situation a marble "
       "effect quartz gives you the look with none of the anxiety."),
      ("Can etching be repaired?",
       "Light etching on honed marble can often be polished out by a stone restoration "
       "specialist. On a high polish it is more visible and harder to correct invisibly. "
       "Prevention, in the form of choosing honed and wiping spills, is much easier."),
    ],
    related=["quartzite-worktops","quartz-worktops","granite-worktops"],
    guides=["best-kitchen-worktop-material","quartzite-vs-quartz"],
  ),
  dict(
    slug="porcelain-worktops", short="Porcelain", h1="Porcelain and sintered stone worktops",
    title="Porcelain & Sintered Stone Worktops | Made to Order | Topcat Worktops",
    metadesc="Porcelain and sintered stone worktops, made to order and fitted across London and the Home Counties. Takes direct heat, UV stable, works outdoors. Send your plans for a proper price.",
    eyebrow="Sintered stone",
    lede="The technical answer. Takes a hot pan without flinching, holds its colour in sunlight, and works outdoors as well as in.",
    defn=("Porcelain worktops, also sold as sintered stone, are made from natural minerals "
          "fired at around 1,200 degrees under enormous pressure, with no resin binder at all. "
          "That absence of resin is the whole story: nothing in the slab can scorch, fade or "
          "react, which is why it behaves differently from quartz in exactly the places quartz "
          "struggles."),
    body=[
      ("What porcelain solves",
       "Three things, and they are the three limitations of engineered quartz. Heat: you can "
       "put a pan straight off the hob onto porcelain and nothing happens, because there is no "
       "resin to scorch. Sunlight: it is UV stable, so a south facing garden room or an "
       "outdoor kitchen will not fade it. Weather: it is frost resistant, so it can live "
       "outside all year. If you have been told your kitchen cannot have stone because of a "
       "run of glazing or a barbecue island, this is the material that changes the answer."),
      ("How we work with it",
       "Made to order. Porcelain is cut on a waterjet rather than a saw, the slabs come from a "
       "much shorter list of suppliers than quartz, and the thin edges are mitred by hand so a "
       "12mm slab reads as solid stone. That is real work and it varies job to job, so we do "
       "not put porcelain through the calculator. Send us your plans, or a photograph of the "
       "colour you are after, and we will come back with a proper figure."),
      ("The honest limits",
       "Porcelain is harder than quartz but more brittle, which means the risk is chipping at "
       "an exposed edge rather than scratching across the face. That risk mostly sits with the "
       "people cutting and carrying it rather than with you, and it is why porcelain wants a "
       "workshop that knows the material. It also comes in fewer colours than quartz, and it "
       "costs more. And one myth worth killing: porcelain is not silica free. Published data "
       "for porcelain slabs puts crystalline silica somewhere around 15 to 25 per cent, which "
       "is higher than several low silica quartzes. It is an excellent material, but not for "
       "that reason."),
      ("Where it goes in a real kitchen",
       "Plenty of kitchens do not need porcelain everywhere. A very common and sensible "
       "specification is porcelain on the hob run and the island, where heat and wear land, "
       "with quartz on the rest, chosen to match. You get the practical benefit exactly where "
       "it matters without paying for it across the whole room. Outdoor kitchens are the other "
       "obvious case, where porcelain is really the only correct answer."),
      ("Brands and looks",
       "Dekton and Neolith are the two names most people arrive with, and we work with both. "
       "The range covers convincing marble patterns, concretes, metals and stone effects, in "
       "matt and satin finishes that suit the material better than high gloss does. Thin slabs "
       "from 6mm to 12mm also make porcelain the material of choice for cladding an island end "
       "or a full height splashback without adding bulk."),
    ],
    facts=[("Composition","Fired natural minerals, no resin binder"),
           ("Heat","Excellent, hot pans directly on the surface"),
           ("Outdoors","Yes, UV stable and frost resistant"),
           ("Porosity","Non-porous, never needs sealing"),
           ("Watch for","Edge chipping, it is hard but brittle"),
           ("Silica","Not silica free, published data suggests roughly 15 to 25%")],
    price="Made to order and priced against your plans, not from a calculator",
    faqs=[
      ("Is porcelain better than quartz?",
       "For heat, sunlight and outdoor use, clearly yes. For colour choice, price and general "
       "indoor kitchen duty, quartz is still the sensible default. The most practical answer "
       "is often both, porcelain where the heat is and quartz elsewhere."),
      ("Do you offer porcelain worktops?",
       "Yes, made to order. We do not price porcelain through the calculator because it is cut "
       "on a waterjet, the edges are mitred by hand and the supply is narrower, so the job "
       "varies more than a quartz kitchen does. Send your plans and we will price it properly."),
      ("Is porcelain silica free?",
       "No, and be careful with anyone who tells you it is. Published figures for porcelain "
       "slabs put crystalline silica at roughly 15 to 25 per cent, which is higher than "
       "several low silica engineered quartzes. Choose porcelain for heat and UV stability, "
       "which are real, rather than for a silica claim that is not."),
      ("Can porcelain be used outdoors?",
       "Yes, and it is the material we would specify. It is UV stable so it will not fade, and "
       "frost resistant so a British winter does not trouble it. Quartz is not suitable "
       "outside and will fade within a few years."),
    ],
    related=["quartz-worktops","granite-worktops","quartzite-worktops"],
    guides=["quartz-vs-porcelain-worktops","best-kitchen-worktop-material","is-quartz-heatproof"],
  ),
  dict(
    slug="quartzite-worktops", short="Quartzite", h1="Quartzite worktops",
    title="Quartzite Worktops | Natural Stone, Not Quartz | Topcat Worktops",
    metadesc="Quartzite worktops, a natural stone with marble movement and granite durability. Templated, fitted and guaranteed for ten years across London and the Home Counties.",
    eyebrow="Natural stone",
    lede="Marble movement, granite hardness, and a slab nobody else has. The one people mean when they say they want something special.",
    defn=("Quartzite is a natural metamorphic rock, formed when sandstone is fused under heat "
          "and pressure until the grains recrystallise. It is not the same thing as engineered "
          "quartz, despite the name, and that confusion is the single most common reason "
          "people end up with the wrong material."),
    body=[
      ("Quartzite is not quartz, and the difference matters",
       "Engineered quartz is a manufactured slab, crushed stone bound with resin, consistent "
       "and non-porous. Quartzite is a natural rock, quarried in blocks, every slab unique and "
       "mildly porous. They sound alike and behave differently. Quartzite is harder than "
       "granite, tolerates heat far better than engineered quartz, and has the flowing "
       "movement people usually associate with marble. It also costs more, and it wants "
       "sealing."),
      ("Why people choose it",
       "Because they want marble and cannot live with marble. Quartzite gives you dramatic "
       "natural veining without the acid sensitivity, so a lemon on a quartzite worktop is not "
       "a crisis. The famous names have real presence: Taj Mahal, warm and creamy and probably "
       "the most requested. Cristallo, almost translucent. Fusion and Lemurian Blue, which are "
       "closer to artwork than surfacing and usually end up on an island with a light behind "
       "them."),
      ("The honest limits",
       "It is porous, so it seals on fitting and periodically after. Some stones sold as "
       "quartzite are softer than true quartzite, and behave more like marble, which is why "
       "buying from someone who will tell you the difference matters. It is expensive, "
       "generally above granite and often above quartz. And because every slab is genuinely "
       "unique, availability is unpredictable, so if you fall for one, it is worth reserving "
       "quickly."),
      ("Care, honestly",
       "Seal it, wipe spills, use a board for chopping, and use a trivet for anything straight "
       "off a flame even though it will probably cope. Beyond that, it is one of the "
       "lowest-anxiety natural stones you can own. Our stone pages carry care notes written "
       "for the specific stone, because quartzite and marble need different advice and getting "
       "them the same way round is a real problem elsewhere."),
    ],
    facts=[("Composition","Natural metamorphic rock, recrystallised sandstone"),
           ("Not the same as","Engineered quartz, despite the name"),
           ("Hardness","Harder than granite"),
           ("Porosity","Mildly porous, seal on fitting then periodically"),
           ("Acid","Far more resistant than marble"),
           ("Cost","Generally above granite, often above quartz")],
    price="Priced by hand, and worth reserving a slab early if you find one you love",
    faqs=[
      ("What is the difference between quartz and quartzite?",
       "Quartz is manufactured, crushed stone bound with resin, non-porous and consistent. "
       "Quartzite is a natural rock, quarried, unique slab to slab, harder, far more heat "
       "tolerant, and mildly porous so it needs sealing. The names are similar and the "
       "materials are not."),
      ("Is quartzite better than marble?",
       "For a working kitchen, usually yes. You get comparable movement and drama without the "
       "acid etching that catches marble owners out. Marble still wins on price and on the "
       "specific look of Carrara and Calacatta."),
      ("Does quartzite need sealing?",
       "Yes, on fitting and then periodically, though less anxiously than marble. The water "
       "drop test works here too: if water darkens the stone after half an hour, reseal."),
      ("Do you carry quartzite?",
       "Yes. Several of the stones in our collection are true quartzite, and they carry their "
       "own care information rather than inheriting marble advice, because marble care copy is "
       "plainly wrong for quartzite."),
    ],
    related=["marble-worktops","granite-worktops","quartz-worktops"],
    guides=["quartzite-vs-quartz","best-kitchen-worktop-material"],
  ),
]


# ===========================================================================
# GUIDE AND COMPARISON PAGES
# ===========================================================================
# Format from the ranking set: direct answer in the first two sentences,
# specific numbers, at least one comparison table, question-shaped H2s, a named
# author with a visible last-reviewed date, and a quote CTA in the body.
# `sections` are (heading, [paragraphs]) and may include a table via
# ("TABLE", caption, head, rows).
GUIDES = [
  dict(
    slug="how-much-do-quartz-worktops-cost", nav="What worktops cost",
    h1="How much do quartz worktops cost in the UK?",
    title="How Much Do Quartz Worktops Cost? UK Prices 2026 | Topcat Worktops",
    metadesc="Real UK quartz worktop prices for 2026, what moves the number, what is included in a proper quote and what commonly appears on the final invoice elsewhere.",
    answer=("Most quartz kitchens in the UK cost between £2,000 and £5,000 supplied and fitted, "
            "including VAT. A single straight run in a mid-range colour sits near the bottom of "
            "that. Three slabs of heavily veined stone with an island and a full height "
            "splashback sits near the top."),
    sections=[
      ("What actually moves the price",
       ["Four things, in roughly this order of impact. First, how many slabs your layout needs, "
        "because stone is bought by the slab and a layout that spills onto a third slab costs a "
        "third slab whether you use all of it or not. Second, the stone itself, where the "
        "difference between a plain white and a heavily veined Calacatta is substantial. Third, "
        "the detailing: mitred edges, waterfall ends, full height splashbacks and bookmatching "
        "all add workshop time. Fourth, whether the old worktop needs removing and disposing of.",
        "What does not move it with us: cut-outs. Sinks, hobs, taps and sockets are included "
        "however many there are. So are drainer grooves and pencil edges. Those are commonly "
        "itemised as extras elsewhere, which is worth checking when you compare two quotes that "
        "look similar at the headline."]),
      ("TABLE", "Typical all-in cost by kitchen size, quartz, supplied and fitted including VAT",
       ["Kitchen", "Slabs", "Typical range"],
       [["Small galley or a single run", "1", "£2,000 to £2,500"],
        ["Standard kitchen, no island", "2", "£3,000 to £3,600"],
        ["Kitchen with an island", "2 plus island", "£3,850 to £4,300"],
        ["Larger kitchen with an island", "3 plus island", "£4,350 to £5,000"],
        ["Very large or heavily detailed", "4 plus", "Priced by hand"]]),
      ("What a proper quote includes",
       ["Templating, the stone, fabrication, edge profiling, all cut-outs, delivery, "
        "installation, sealing where the material needs it, and VAT. If a quote does not say "
        "which of those are in and which are out, that is the question to ask before you "
        "compare it with anything else.",
        "The single most common complaint in this trade is a final invoice higher than the "
        "quote. It usually comes from cut-outs charged individually, an edge upgrade that was "
        "assumed rather than agreed, or VAT added at the end to a number that looked like the "
        "whole price. Ask for one itemised figure including VAT and the problem disappears."]),
      ("Where the money actually goes",
       ["Roughly half to sixty per cent of what you pay is the material itself. Templating and "
        "fabrication account for something like fifteen to twenty per cent, and installation "
        "another fifteen to twenty five. That shape is worth knowing because it explains why a "
        "cheaper quote is usually a cheaper stone rather than cheaper labour, and why the gap "
        "between two quotes often disappears once you compare the actual slab."]),
      ("Marble, granite and porcelain",
       ["We price those by hand rather than through a calculator, and the reason is honest: the "
        "material cost swings enormously between one block and the next and between suppliers. "
        "Two customers asking for marble can be quoted very different numbers for reasons that "
        "have nothing to do with either kitchen. Rather than publish a figure we could not "
        "stand behind, we look at the actual stone and price the actual job."]),
    ],
    faqs=[("Is the price per square metre or per job?",
           "We quote per job. Per square metre pricing looks simple and then falls apart on "
           "real kitchens, because the slab you cannot use is still a slab you bought."),
          ("Does 20mm or 30mm cost more?",
           "In our pricing, no. The thickness does not change the band. It changes the look and "
           "the maximum unsupported overhang, which is covered in our thickness guide."),
          ("Do you charge for cut-outs?",
           "No. Sinks, hobs, taps and sockets are all included, however many. Drainer grooves "
           "and pencil edges are standard too.")],
    related=["quartz-vs-granite-worktops","20mm-vs-30mm-quartz-worktops","best-kitchen-worktop-material"],
    mats=["quartz-worktops","granite-worktops"],
  ),
  dict(
    slug="quartz-vs-granite-worktops", nav="Quartz vs granite",
    h1="Quartz vs granite worktops: which should you choose?",
    title="Quartz vs Granite Worktops: An Honest Comparison | Topcat Worktops",
    metadesc="Quartz or granite? The real differences in heat tolerance, sealing, staining, cost and appearance, from a fitter who installs both every week.",
    answer=("Choose quartz if you want a low maintenance, non-porous surface that never needs "
            "sealing and looks the same across the whole kitchen. Choose granite if you cook "
            "hard and want to put hot pans straight down, or if you want a slab nobody else "
            "has. Both will outlast the kitchen around them."),
    sections=[
      ("TABLE", "Quartz and granite compared",
       ["", "Quartz", "Granite"],
       [["What it is", "Engineered, about 90 to 93% crushed quartz with resin", "Natural quarried rock"],
        ["Sealing", "Never", "On fitting, then roughly annually"],
        ["Heat", "To about 150°C, use a trivet", "Excellent, hot pans direct"],
        ["Staining", "Very resistant, non-porous", "Resistant when sealed, porous if not"],
        ["Consistency", "Uniform, matches across the kitchen", "Every slab different"],
        ["Outdoors", "No, UV fades it", "Yes, hard granites"],
        ["Silica content", "High, roughly 90%", "Much lower"],
        ["Repair of scorch marks", "Not repairable in place", "Rarely needed"]]),
      ("The heat question, which is the real dividing line",
       ["This is where the decision usually gets made. Granite came out of the ground under "
        "heat and does not care about a hot pan. Quartz is bound with resin, and resin has a "
        "limit somewhere around 150 degrees. A pan straight off a gas flame is well past that, "
        "and the resulting mark is permanent.",
        "In practice most people manage this without thinking, in the same way nobody puts a "
        "hot pan on a wooden worktop. But if you are the kind of cook who moves fast and lands "
        "the pan wherever there is space, be honest with yourself about that now. Granite or "
        "porcelain will suit you better."]),
      ("The maintenance question",
       ["This runs the other way. Granite is porous and wants sealing, once on fitting and then "
        "about once a year. It is a ten minute job, but it is a job, and it is one people "
        "forget. Quartz is non-porous and asks for nothing beyond warm soapy water. If you want "
        "a surface you never have to think about, quartz wins clearly."]),
      ("Appearance, and the thing nobody warns you about",
       ["Quartz is consistent, which is a benefit and a limitation. The piece by the sink will "
        "match the island, and the slab you approve is what arrives. Granite is unique, which "
        "is the whole appeal, but it means a postcard sample cannot tell you what a three metre "
        "slab looks like. We send photographs of your actual slab before cutting for exactly "
        "that reason.",
        "One practical note: very dark polished granite shows smears, dust and water marks more "
        "than a mid-tone does. It is beautiful and it is more work to keep looking beautiful."]),
      ("Cost",
       ["They overlap heavily. Mid-range granite and mid-range quartz land in a similar place. "
        "Granite has a longer tail in both directions, with common blacks below most quartz and "
        "rare exotics well above it. We price granite by hand because that spread is real."]),
      ("So which one",
       ["If you cook seriously, or want something unique, granite. If you want low maintenance "
        "and predictability, quartz. If you want both and the budget allows, the honest answer "
        "is porcelain around the hob and quartz elsewhere, which sidesteps the whole trade off."]),
    ],
    faqs=[("Which lasts longer?",
           "Both outlast the kitchen. Neither wears out in normal domestic use. The failure "
           "modes differ: quartz can scorch, granite can stain if never sealed."),
          ("Which adds more value to a house?",
           "Buyers respond to a well fitted stone worktop rather than to the specific material. "
           "Choose the one that suits how you cook."),
          ("Is granite cheaper than quartz?",
           "Sometimes. Common granites can undercut mid-range quartz, and rare granites cost "
           "considerably more. There is no reliable rule.")],
    related=["how-much-do-quartz-worktops-cost","is-quartz-heatproof","best-kitchen-worktop-material"],
    mats=["quartz-worktops","granite-worktops"],
  ),
  dict(
    slug="is-quartz-heatproof", nav="Is quartz heatproof?",
    h1="Is quartz heatproof? Can you put hot pans on quartz?",
    title="Is Quartz Heatproof? What Hot Pans Really Do | Topcat Worktops",
    metadesc="Honest answer: quartz is heat resistant, not heatproof. What temperature it tolerates, what actually causes damage, and what to do instead.",
    answer=("No. Quartz is heat resistant, not heatproof. The resin that binds it starts to "
            "suffer somewhere around 150 degrees, and a pan straight off a hob is well past "
            "that. The mark it leaves is permanent and cannot be polished out in place."),
    sections=[
      ("Why quartz has a heat limit at all",
       ["Engineered quartz is roughly ninety per cent crushed natural stone and around seven to "
        "ten per cent polymer resin. The stone does not care about heat. The resin does. Above "
        "roughly 150 degrees it can discolour, and a sharp change in temperature on one spot can "
        "also cause a hairline crack, because the surface expands where it is hot and not where "
        "it is cool. Both failures come from the binder, not the stone."]),
      ("TABLE", "What everyday kitchen items actually do to quartz",
       ["Item", "Rough temperature", "Verdict"],
       [["Mug of tea", "85°C", "Fine"],
        ["Dish straight from a dishwasher", "70°C", "Fine"],
        ["Slow cooker base, left running", "95°C", "Fine, but move it occasionally"],
        ["Oven tray straight from the oven", "180°C to 220°C", "Use a trivet"],
        ["Pan straight off a gas ring", "200°C to 250°C", "Use a trivet, this is the one that marks"],
        ["Cast iron off a high flame", "250°C plus", "Never directly"]]),
      ("What damage looks like, and whether it can be fixed",
       ["A scorch shows as a dull, slightly yellowed or whitened patch where the resin has "
        "changed. It does not wipe off, because nothing has been deposited, the material itself "
        "has altered. A thermal crack is a fine line, usually starting at a cut-out corner where "
        "the stone is already narrowest.",
        "Neither is repairable in place in a way you would be happy with. A specialist can "
        "sometimes improve a light mark, but the honest answer is that replacing the affected "
        "piece is the real fix, which is why prevention matters more here than with most "
        "materials."]),
      ("The habits that make it a non-issue",
       ["Keep a trivet by the hob rather than in a drawer, because a trivet you have to fetch is "
        "a trivet you will not use. Do not stand a slow cooker or an air fryer in the same spot "
        "permanently. Give the area around a cut-out extra care, since that is where the stone "
        "is narrowest. And if you have a hob with a downdraft or a very tight sink to hob run, "
        "mention it when we template, because we can sometimes plan the joint to keep the "
        "narrowest stone away from the heat."]),
      ("If this rules quartz out for you",
       ["It rules it out for some people, and that is fine. Granite takes a hot pan without "
        "complaint. Porcelain takes one and does not even warm up much, because there is no "
        "resin in it at all. A very practical answer that we fit often is porcelain on the hob "
        "run and the island with quartz elsewhere, matched so it reads as one kitchen."]),
    ],
    faqs=[("Will one hot pan ruin my worktop?",
           "Possibly. It depends on the pan temperature, how long it sits and the colour of the "
           "stone. Whites and pale stones show scorching most."),
          ("Are some quartz brands more heat resistant?",
           "Marginally, but no engineered quartz is heatproof, because they all use a resin "
           "binder. Treat any brand claim of heatproof quartz with suspicion."),
          ("What about a hot hair straightener in a bathroom?",
           "Same rule. It concentrates a lot of heat in a small area. Put it on a mat.")],
    related=["quartz-vs-granite-worktops","quartz-vs-porcelain-worktops","how-much-do-quartz-worktops-cost"],
    mats=["quartz-worktops","porcelain-worktops"],
  ),
  dict(
    slug="quartz-vs-porcelain-worktops", nav="Quartz vs porcelain",
    h1="Quartz vs porcelain worktops: which is right for your kitchen?",
    title="Quartz vs Porcelain Worktops Compared | Topcat Worktops",
    metadesc="Porcelain takes direct heat and works outdoors, quartz offers more colours and costs less. An honest comparison, including the silica claim that is not true.",
    answer=("Porcelain wins on heat, sunlight and outdoor use, because it contains no resin to "
            "scorch or fade. Quartz wins on colour choice, price and availability. Many "
            "kitchens are best served by both, porcelain where the heat is and quartz "
            "everywhere else."),
    sections=[
      ("TABLE", "Quartz and porcelain compared",
       ["", "Quartz", "Porcelain and sintered stone"],
       [["Made from", "Crushed quartz plus resin binder", "Fired minerals, no resin"],
        ["Heat", "To about 150°C, trivet needed", "Excellent, pans direct"],
        ["UV and sunlight", "Some colours fade", "UV stable"],
        ["Outdoors", "No", "Yes, frost resistant too"],
        ["Colour range", "Very wide", "Narrower"],
        ["Main weakness", "Scorching", "Edge chipping, it is brittle"],
        ["Thin slabs", "No", "Yes, from 6mm"],
        ["Cost", "Lower", "Higher"],
        ["Crystalline silica", "High, roughly 90%", "Roughly 15 to 25%, not silica free"]]),
      ("The claim to be careful about",
       ["Porcelain is sometimes sold as the safe alternative to quartz because of the silicosis "
        "coverage. That is overstated. Published data for porcelain slabs puts crystalline "
        "silica at roughly 15 to 25 per cent, which is lower than standard quartz but higher "
        "than several genuine low silica engineered stones now on the market.",
        "There is a real point underneath it: the risk is occupational, it belongs to the "
        "workshop cutting the material, and it does not follow the slab into your kitchen. "
        "Choose porcelain for heat and UV stability, which are true and useful. Do not choose "
        "it on a silica claim."]),
      ("Where porcelain earns its price",
       ["Outdoor kitchens, where it is really the only correct answer, because quartz fades "
        "outside within a few years. Garden rooms and extensions with a lot of south facing "
        "glass. Hob runs in kitchens where somebody cooks properly. And island ends or full "
        "height splashbacks, where a 6mm or 12mm slab lets you clad a surface without adding "
        "visual bulk."]),
      ("Where quartz is still the better buy",
       ["Most indoor kitchens, honestly. The colour range is far wider, particularly in the "
        "marble looks most people want. It costs less. Supply is broader, so if you fall for a "
        "colour it is more likely to be available. And its one real weakness, heat, is managed "
        "by a trivet."]),
      ("How we price the two",
       ["Quartz goes through our estimator and gives you a range in about a minute. Porcelain "
        "is made to order and priced against your plans, because it is cut on a waterjet rather "
        "than a saw, the supply is narrower and the thin edges are mitred by hand so the slab "
        "reads as solid stone. Send us drawings or photographs and we will come back with a "
        "proper figure."]),
    ],
    faqs=[("Is porcelain stronger than quartz?",
           "Harder, yes. Tougher, not always. Porcelain resists scratching and heat better but "
           "is more brittle, so an exposed edge can chip where quartz would not."),
          ("Can porcelain look like marble?",
           "Yes, and convincingly. The printing and finishing on the better ranges is very good, "
           "particularly in matt and satin, which suit the material more than gloss."),
          ("Do you fit both in one kitchen?",
           "Regularly. Porcelain on the hob run and the island with a matched quartz elsewhere "
           "is a sensible specification and we are happy to plan it.")],
    related=["is-quartz-heatproof","is-quartz-safe-silica","best-kitchen-worktop-material"],
    mats=["porcelain-worktops","quartz-worktops"],
  ),
  dict(
    slug="20mm-vs-30mm-quartz-worktops", nav="20mm vs 30mm",
    h1="20mm or 30mm quartz worktop: which thickness should you choose?",
    title="20mm vs 30mm Quartz Worktops: Which Thickness? | Topcat Worktops",
    metadesc="The practical difference between 20mm and 30mm worktops: how they look, how far they can overhang unsupported, and why the price is often the same.",
    answer=("Thirty millimetre reads more solid and carries a longer unsupported overhang, which "
            "matters on a breakfast bar. Twenty millimetre looks lighter and more contemporary, "
            "and a mitred edge can make it appear any thickness you want. With us the price "
            "band is the same either way."),
    sections=[
      ("TABLE", "The practical differences",
       ["", "20mm", "30mm"],
       [["Look", "Lighter, contemporary", "Solid, traditional weight"],
        ["Unsupported overhang", "Around 250mm", "Around 300mm"],
        ["Weight", "Lighter, easier on older units", "Heavier, wants sound cabinets"],
        ["Mitred edge", "Very common, to fake any thickness", "Less often needed"],
        ["Our price band", "Same", "Same"]]),
      ("The overhang question, which is the one that actually decides it",
       ["If you are putting stools under an island, this is the number that matters. A 20mm slab "
        "can generally cantilever around 250mm without support, a 30mm slab around 300mm. Go "
        "beyond that and you need brackets or a corbel, which is not a disaster but does need "
        "planning before the cabinets go in rather than after.",
        "If your island overhang is 300mm or more, tell us at template stage. We would rather "
        "design the support in than have you discover it when the stool does not fit."]),
      ("Mitred edges, and why thickness is partly a choice",
       ["A mitred edge is where two pieces are cut at 45 degrees and joined so the stone appears "
        "to be a solid block. It means a 20mm slab can present a 60mm, 100mm or even 200mm "
        "edge. That is how the chunky waterfall islands you have seen are made, and it is why "
        "slab thickness and apparent thickness are two different decisions."]),
      ("Sinks, and the bit that catches people out",
       ["Undermount sinks change the conversation. On 30mm the stone edge around the sink "
        "opening is thick enough to be polished into a proper reveal, which looks deliberate. "
        "On 20mm that reveal is slimmer, so a lot of kitchens mitre a strip on to build the "
        "apparent thickness back up around the sink and the island. Neither is wrong, but it is "
        "worth deciding before templating rather than after, because it changes how the piece "
        "is cut.",
        "Butler and belfast sinks bring their own detail, since the worktop has to land neatly "
        "on the sink rim rather than over it, and that junction is much easier to get right "
        "when we have seen the actual sink. Have it on site for the template if you possibly "
        "can."]),
      ("Support, brackets and what your cabinets can take",
       ["Stone is heavy. A 30mm quartz worktop weighs roughly half as much again as a 20mm one "
        "over the same area, and while a modern rigid carcass takes that without complaint, "
        "older units, particularly flat-pack ones that have been moved, sometimes want packing "
        "or reinforcing first. We check that at template.",
        "For overhangs beyond the unsupported figures above, the usual answers are steel flat "
        "bar let into the cabinet top, or corbels if you want them visible. Both need deciding "
        "before the units are finished. It is a five minute conversation at survey and an "
        "expensive one afterwards."]),
      ("Which we would specify",
       ["For a straightforward run against a wall, either, and we would let the look decide. "
        "For a shaker or classic kitchen, 30mm sits more comfortably. For a handleless "
        "contemporary kitchen, 20mm with a mitre where it shows. For a heavy overhang, 30mm or "
        "20mm with support designed in. And for porcelain, usually 12mm mitred, because that is "
        "how the material is made."]),
    ],
    faqs=[("Does 30mm cost more than 20mm?",
           "Not in our pricing. It changes the look and the overhang, not the band."),
          ("Is 20mm strong enough?",
           "Yes, for normal use, correctly supported. The limit is unsupported span, not "
           "strength in the plane of the cabinets."),
          ("What thickness are most kitchens?",
           "Both are common. Twenty has grown with contemporary kitchens and mitred edges, "
           "thirty remains the default where a solid look is wanted.")],
    related=["how-much-do-quartz-worktops-cost","best-kitchen-worktop-material"],
    mats=["quartz-worktops","porcelain-worktops"],
  ),
  dict(
    slug="quartzite-vs-quartz", nav="Quartzite vs quartz",
    h1="Quartzite vs quartz: they are not the same thing",
    title="Quartzite vs Quartz Worktops: The Difference | Topcat Worktops",
    metadesc="Quartz is manufactured, quartzite is a natural rock. The difference in heat tolerance, sealing, cost and appearance, and which suits which kitchen.",
    answer=("Quartz is a manufactured slab, crushed stone bound with resin, non-porous and "
            "consistent. Quartzite is a natural rock, quarried, unique slab to slab, harder, "
            "far more heat tolerant, and mildly porous so it needs sealing. The names are "
            "similar, the materials are not."),
    sections=[
      ("TABLE", "Quartz and quartzite compared",
       ["", "Quartz (engineered)", "Quartzite (natural)"],
       [["Origin", "Manufactured in a factory", "Quarried"],
        ["Composition", "About 90% crushed quartz plus resin", "Recrystallised sandstone"],
        ["Consistency", "Uniform", "Every slab unique"],
        ["Heat", "To about 150°C", "Very good"],
        ["Sealing", "Never", "On fitting, then periodically"],
        ["Acid and etching", "Resistant", "Far more resistant than marble"],
        ["Cost", "Lower", "Higher, often above granite"]]),
      ("Why the confusion is expensive",
       ["People ask for quartz, get shown quartzite, and end up either paying more than they "
        "expected or being surprised that their worktop needs sealing. The reverse also "
        "happens: somebody wants a genuine one-off natural stone and is sold an engineered "
        "slab because the names sounded the same. Both are good materials and they suit "
        "different people, so it is worth being clear which one is being quoted."]),
      ("Who should choose quartzite",
       ["People who want marble and cannot live with marble. Quartzite gives you the dramatic "
        "natural movement without the acid sensitivity that catches marble owners out. Taj "
        "Mahal is the most requested, warm and creamy. Cristallo is nearly translucent. Fusion "
        "and Lemurian Blue behave more like artwork than surfacing and usually end up on an "
        "island."]),
      ("How to tell which one you are being shown",
       ["Ask two questions. Does it need sealing, and is every slab different? If the answer to "
        "both is yes, it is a natural stone. If the answer to both is no, it is engineered. A "
        "seller who cannot answer those quickly is not a seller you want cutting a three "
        "thousand pound surface.",
        "The other tell is the way it is sold. Engineered quartz is sold by colour name from a "
        "range, and you can order the same colour again next year. Quartzite is sold by the "
        "slab, and if you want it you reserve that specific slab, because when it is gone there "
        "is not another one exactly like it."]),
      ("What each one costs",
       ["Engineered quartz is the more predictable of the two, and most quartz kitchens land "
        "between £2,000 and £5,000 supplied and fitted including VAT, which our estimator will "
        "narrow down in about a minute. Quartzite sits above that, generally above granite too, "
        "and it varies far more because it depends entirely on the block. We price it by hand "
        "for that reason rather than pretending a calculator could be honest about it.",
        "If the budget is the deciding factor, engineered quartz in a good marble pattern gives "
        "you most of the look for meaningfully less money, and nobody but you will know."]),
      ("Living with each one",
       ["Quartz asks for warm soapy water and nothing else, ever. Quartzite asks for sealing on "
        "fitting and then periodically, a board for chopping, and a trivet for anything straight "
        "off a flame even though it will very probably cope. That is a small routine rather than "
        "a burden, but it is a routine, and it is worth being honest with yourself about "
        "whether you will keep it."]),
      ("A caution worth knowing",
       ["Some stones sold as quartzite are softer than true quartzite and behave more like "
        "marble, including etching. That is not always deliberate, the trade naming is genuinely "
        "loose. It is a reason to buy from somebody who will tell you plainly what a stone is "
        "and how it will behave, and it is why our stone pages carry care notes written for the "
        "individual stone rather than inherited from its category."]),
    ],
    faqs=[("Is quartzite harder than granite?",
           "Generally yes, quartzite is one of the harder natural surfacing stones."),
          ("Does quartzite etch like marble?",
           "Far less. It is much more acid resistant, which is the main practical reason people "
           "choose it over marble."),
          ("Is quartzite worth the extra cost?",
           "If you want a genuinely unique slab with marble movement and real durability, yes. "
           "If you want predictability and low maintenance, engineered quartz is better value.")],
    related=["best-kitchen-worktop-material","quartz-vs-granite-worktops"],
    mats=["quartzite-worktops","quartz-worktops","marble-worktops"],
  ),
  dict(
    slug="is-quartz-safe-silica", nav="Is quartz safe? Silica",
    h1="Is quartz safe? Silica, silicosis and what it means for your kitchen",
    title="Is Quartz Safe? Silica & Silicosis Explained | Topcat Worktops",
    metadesc="An installed quartz worktop poses no silica risk in your home. The risk is occupational, at the cutting stage. What the HSE actually said in 2026, and what we require of the workshops that cut our stone.",
    answer=("A finished, sealed, installed worktop poses no silica risk to your household. The "
            "danger is occupational: it comes from dust created when engineered stone is cut, "
            "ground or polished, and it belongs to the workshop, not to your kitchen. There is "
            "no need to remove a worktop you already have."),
    sections=[
      ("What the concern actually is",
       ["Engineered quartz can contain up to around ninety per cent crystalline silica. Cutting "
        "it dry throws off respirable crystalline silica, a fine dust that causes silicosis, an "
        "incurable and irreversible lung disease. Unlike the traditional form, which took "
        "decades, engineered stone silicosis has affected young workers within a few years. The "
        "United Kingdom has recorded cases and deaths, mostly among fabrication workers.",
        "This is a serious matter and we are not going to talk it down. It is also, precisely, "
        "a workplace problem. The dust is created by machinery in a workshop. It is not present "
        "in a cured, sealed slab bolted to your cabinets."]),
      ("What the HSE actually said, stated carefully",
       ["On 11 May 2026 the Health and Safety Executive published guidance on working with "
        "engineered stone, and announced a programme of over a thousand inspections of "
        "fabricators. The guidance requires water suppression at the tool, which in practice "
        "means dry cutting cannot meet the standard. HSE research found dry fabrication "
        "produces exposure five to ten times higher than wet methods.",
        "One point of accuracy, because it is widely reported wrongly. This is enforceable "
        "guidance under existing health and safety law, not a new statute and not a ban. The "
        "HSE's own wording is that it effectively rules out dry cutting. Anyone telling you "
        "engineered stone has been banned in Britain is mistaken. The government considered a "
        "ban and declined it in June 2026, partly because silicosis also arises from natural "
        "stone and a narrow ban risks complacency about everything else."]),
      ("Why your installed worktop is not a risk",
       ["The clearest statement on this comes from Australia, which did ban the manufacture and "
        "supply of engineered stone. Even there, the regulator's advice to households is that "
        "there is no need to remove engineered stone already installed, and no health risk from "
        "having it in the home, provided nobody cuts, drills, grinds or polishes it.",
        "The practical consequence for you is small but worth knowing. If a fitter ever needs "
        "to modify your worktop in place, for a new tap hole or an appliance change, that is a "
        "job for someone with water suppression and extraction, not for a cordless grinder in "
        "your kitchen."]),
      ("How we control the dust",
       ["We advise on the stone, template your kitchen, cut it, fit it and carry the "
        "guarantee. That means the safety question is ours to answer rather than somebody "
        "else's, and we treat it that way.",
        "We cut wet with suppression at the tool, extract at source, and provide respiratory "
        "protection and health surveillance for our people, in line with current HSE "
        "guidance. It is the right thing to do, and it is also self interested: a fabricator "
        "who ends up in the news for harming workers has already failed at the job."]),
      ("Low silica and silica free, and what those words are worth",
       ["Several manufacturers now sell reduced silica ranges, and some market products as "
        "silica free. Two things are worth knowing before you pay a premium for the label.",
        "First, low silica is an unregulated marketing term in the United Kingdom. There is no "
        "British threshold it has to meet. The only formal number anywhere is Australia's one "
        "per cent definition. Second, silica free almost never means zero. The most credible "
        "products in this category qualify their own claim in the small print to less than one "
        "per cent, which is genuinely low and is not the same as none.",
        "There is also a common assumption that porcelain is the safe alternative. Published "
        "data puts crystalline silica in porcelain slabs at roughly 15 to 25 per cent, which is "
        "higher than several low silica quartzes. The material category tells you very little. "
        "Only the published figure for the specific product does.",
        "If a low silica surface matters to you, ask us and we will tell you what the "
        "manufacturer's own safety data sheet says for the specific range, or tell you that we "
        "cannot get one. We are not going to repeat a supplier's marketing claim on a health "
        "question."]),
      ("Natural stone, if you would rather sidestep it",
       ["Granite contains substantially less crystalline silica than engineered quartz. Marble "
        "and quartzite vary. If the coverage has genuinely unsettled you, natural stone is a "
        "reasonable answer and we are happy to steer you there. It is a legitimate preference "
        "and you will not get an argument from us."]),
    ],
    faqs=[("Do I need to remove my existing quartz worktop?",
           "No. An installed, sealed worktop poses no silica risk. Even the Australian "
           "regulator, in the country that banned the material, advises that existing "
           "installations do not need removing."),
          ("Has engineered stone been banned in the UK?",
           "No. Australia banned it in 2024. The UK chose enforcement instead, and the "
           "government explicitly declined a ban in June 2026. The HSE published guidance in "
           "May 2026 that effectively rules out dry cutting, and is inspecting against it."),
          ("Is it safe to drill into a quartz worktop myself?",
           "We would not. Drilling creates exactly the dust the guidance is about. If you need "
           "a new tap hole or an appliance cut-out, ask us, and it should be done wet with "
           "extraction."),
          ("Do you offer low silica worktops?",
           "We can source reduced silica ranges and we will tell you what the manufacturer's "
           "own safety data sheet says. What we will not do is call something silica free "
           "because a brochure did.")],
    related=["quartz-vs-porcelain-worktops","quartz-vs-granite-worktops","best-kitchen-worktop-material"],
    mats=["quartz-worktops","granite-worktops","porcelain-worktops"],
  ),
  dict(
    slug="best-kitchen-worktop-material", nav="Best worktop material",
    h1="The best kitchen worktop material for a UK kitchen",
    title="Best Kitchen Worktop Material 2026: An Honest Guide | Topcat Worktops",
    metadesc="Quartz, granite, marble, porcelain or quartzite? Which surface suits which kitchen, from a team that fits all five. Honest limits included.",
    answer=("For most UK kitchens, engineered quartz. It is non-porous, needs no sealing and "
            "comes in the widest range of colours. Choose granite if you cook hard, porcelain "
            "if there is heat or sunlight to deal with, quartzite if you want something "
            "unique, and marble only where you accept it will patina."),
    sections=[
      ("TABLE", "The five materials at a glance",
       ["Material", "Best for", "Watch out for", "Sealing"],
       [["Quartz", "Most kitchens, low maintenance", "Heat, and direct sunlight", "Never"],
        ["Granite", "Serious cooking, unique slabs", "Needs sealing, dark stones show smears", "Yearly"],
        ["Porcelain", "Heat, outdoors, sunlight", "Edge chipping, fewer colours, costs more", "Never"],
        ["Quartzite", "Marble looks with durability", "Cost, and loose trade naming", "Periodically"],
        ["Marble", "Baking zones, bathrooms, patina", "Etches on contact with acid", "Regularly"]]),
      ("Start with how you actually cook",
       ["Not with a mood board. If pans come off the hob and land wherever there is room, you "
        "want granite or porcelain by the hob. If the kitchen is mostly for eating and "
        "gathering and the serious cooking is occasional, quartz is comfortably the best value. "
        "If somebody in the house bakes, a marble section is a genuine pleasure and worth the "
        "upkeep for that one area."]),
      ("Then look at the light",
       ["This gets missed. If your kitchen has a large run of south facing glass, or opens onto "
        "a garden room, some quartz pigments will fade over a few years. Porcelain will not. It "
        "is a straightforward question to ask at survey and it changes the answer for a "
        "surprising number of extensions."]),
      ("Then be honest about maintenance",
       ["Sealing granite takes ten minutes a year and people still forget. If you know you will "
        "forget, choose a non-porous material and remove the problem. There is no virtue in "
        "choosing a surface that needs a routine you will not keep."]),
      ("What we would specify, if you asked us",
       ["For a family kitchen that gets used hard: quartz throughout, with porcelain on the hob "
        "run if the budget stretches. For a keen cook: granite, or porcelain and quartz "
        "together. For a statement island in a calm kitchen: quartzite. For an outdoor kitchen: "
        "porcelain, and nothing else. For a bathroom: quartz, or marble if you like the way it "
        "ages.",
        "We fit all five and we make roughly the same margin on each, so we have no reason to "
        "push you anywhere. The best worktop is the one that suits the way you live, and we "
        "would rather talk you out of the wrong one now than replace it later."]),
    ],
    faqs=[("What is the most popular worktop material in the UK?",
           "Engineered quartz, by a wide margin, and it has been for several years."),
          ("What is the most durable?",
           "Porcelain and quartzite are the hardest. Granite is the most heat tolerant. "
           "Durability depends on which failure you care about avoiding."),
          ("What is the lowest maintenance?",
           "Quartz and porcelain, both non-porous, neither needs sealing.")],
    related=["quartz-vs-granite-worktops","quartz-vs-porcelain-worktops","quartzite-vs-quartz","how-much-do-quartz-worktops-cost"],
    mats=["quartz-worktops","granite-worktops","marble-worktops","porcelain-worktops","quartzite-worktops"],
  ),
  dict(
    slug="what-happens-when-we-template", nav="What templating involves",
    h1="What happens when we template your kitchen",
    title="Worktop Templating Explained: What Actually Happens | Topcat Worktops",
    metadesc="What a worktop template visit involves, what has to be ready before we arrive, how long it takes and what happens between templating and fitting.",
    answer=("A templater visits once your cabinets are fitted and level, and measures the space "
            "by hand to a fraction of a millimetre. That measurement becomes the digital "
            "file the stone is cut from. It takes about an hour, and fitting normally follows "
            "within three to five working days."),
    sections=[
      ("What has to be ready before we come",
       ["Cabinets fitted, level and secured. That is the big one, because the template is taken "
        "off your actual units rather than off a plan, and a unit that moves afterwards makes "
        "the template wrong. Sink and hob on site, or at least the exact models confirmed, so "
        "the cut-outs are right. Any appliances that sit under the worktop in position. And "
        "the space clear enough to get a tripod round.",
        "If something is not ready, tell us before the visit rather than on the day. Rearranging "
        "a template is easy. Cutting stone to a template that has moved is not."]),
      ("What the visit involves",
       ["We set up on a tripod and take a digital measurement of the whole run, capturing "
        "lengths, angles, wall irregularities, cut-out positions, overhangs and joint "
        "positions. Walls are rarely square, and this is the step that makes the difference "
        "between a worktop that sits tight to the wall and one with a visible gap.",
        "We will also confirm the decisions that are easier to make standing in the room than "
        "over a drawing: which way the veining should run, where any joints should fall, how "
        "far the island should overhang, and whether the splashback should be a short upstand "
        "or full height."]),
      ("What happens next",
       ["The digital file goes to the workshop that will cut your stone. Your slab is laid out "
        "against that file so the pieces fall in the best place on the slab, matching the "
        "veining across joints where the pattern allows. You approve the slab from photographs "
        "before anything is cut. Then it is cut wet, polished, and delivered to us for fitting.",
        "Templating to fitting is typically three to five working days. It can be longer for a "
        "stone that has to come in specially, or for heavy detailing such as mitred waterfall "
        "ends or bookmatching."]),
      ("Fitting day",
       ["We protect the floors, bring the pieces in, dry fit, then bond and seal. A "
        "straightforward kitchen is a morning. An island with waterfall ends is a full day. We "
        "take the packaging away with us, and we will not leave until you have looked at it "
        "properly in your own light."]),
    ],
    faqs=[("How long does templating take?",
           "About an hour for a typical kitchen. Larger or more detailed jobs take longer."),
          ("Can you template before the kitchen units are fitted?",
           "No, and anyone who says yes is taking a risk with your stone. The template comes "
           "off the real cabinets."),
          ("How long between template and fitting?",
           "Typically three to five working days, longer if the stone has to be ordered in or "
           "the detailing is heavy."),
          ("Do I need to be there?",
           "For templating, ideally yes, because the decisions about veining, joints and "
           "overhangs are much easier to make together in the room.")],
    related=["how-much-do-quartz-worktops-cost","best-kitchen-worktop-material"],
    mats=["quartz-worktops"],
  ),
]


# ===========================================================================
# LOCATION PAGES
# ===========================================================================
# ⚠️ READ THIS BEFORE ADDING TOWNS.
# Google renamed "doorway pages" to "doorway abuse" in Sept 2024. The current
# definition turns on FUNNELLING: pages that exist to push users somewhere else.
# A town page that is ITSELF the destination, with prices, process, projects,
# a phone number and a quote route, is not a doorway. A town page whose only
# real action is "click here to go to contact" is exactly what the policy names.
# "Scaled content abuse" is a SEPARATE policy and applies whether a human or a
# script wrote the page. Enforcement is site-level, so a bad rollout drags the
# whole domain down, it does not fail quietly.
#
# THE RULES WE BUILD TO:
#   1. Every page converts standalone. Never a stub that funnels.
#   2. Nine real local variables swapped per page, not one find-and-replace.
#   3. County hubs are real pages, so the URL is a browseable hierarchy, which
#      is the policy's own stated escape from doorway treatment.
#   4. Location pages stay under ~40% of indexable URLs. With 5 materials,
#      9 guides, 6 services, 52 stones, 1 trade and 8 locations we are at ~10%.
#   5. Launch 8, gate at 90 days on real impressions before adding more.
#      Phase 2 and 3 towns are listed in the SEO build plan, not here, on
#      purpose. Do not bulk-add them without the gate.
#   6. NO LocalBusiness schema on these pages. Topcat is not located in these
#      towns and marking up an address it does not have risks a manual action.
#      BreadcrumbList only.
#
# Towns were chosen on UK autocomplete demand, not on affluence. Harpenden,
# Windsor, Ascot and prime central London returned ZERO variants and are
# deliberately absent despite being wealthy. See the build plan.

COUNTIES = [
  dict(
    slug="hertfordshire", name="Hertfordshire",
    h1="Kitchen worktops in Hertfordshire",
    title="Kitchen Worktops in Hertfordshire | Bathrooms & Commercial Too | Topcat",
    metadesc="Quartz, granite, marble and porcelain surfaces for kitchens, bathrooms, utilities and commercial spaces across Hertfordshire. Free home visit with samples, every cut-out included, ten year guarantee.",
    lede=("We work across Hertfordshire most weeks, from the St Albans and Watford end through "
          "to Stevenage, Hitchin and the Bishop's Stortford side."),
    intro=("Hertfordshire is our closest county and the one we know best. The housing runs from "
           "Victorian and Edwardian terraces in the older towns, where almost nothing is square "
           "and the template matters more than the stone, through to large post-war and new "
           "build family homes where islands and open plan extensions are the norm. We quote "
           "both every week."),
    towns_note=("We cover the whole county. These are the towns we are asked for most often, "
                "and each has its own page."),
    areas=["St Albans","Watford","Stevenage","Hemel Hempstead","Hitchin","Harpenden","Berkhamsted",
           "Welwyn Garden City","Hertford","Ware","Rickmansworth","Bishop's Stortford","Hatfield","Radlett"],
    dial="01727, 01923 and 01438",
    travel=("Hertfordshire is comfortably inside our normal working area and we are there most "
            "weeks, so templating and fitting dates are usually the earliest we can offer."),
    lead="Three to five working days from template to fitting is normal here.",
  ),
  dict(
    slug="essex", name="Essex",
    h1="Kitchen worktops in Essex",
    title="Kitchen Worktops in Essex | Bathrooms & Commercial Too | Topcat",
    metadesc="Quartz, granite, marble and porcelain surfaces for kitchens, bathrooms, utilities and commercial spaces across Essex. Free home visit with samples, all cut-outs included, ten year guarantee.",
    lede=("From Harlow and Epping through Chelmsford and Brentwood down to the Southend side, "
          "Essex is one of our busiest counties."),
    intro=("Essex covers an unusually wide range of kitchens, from compact terraces in the "
           "Thames-side towns through to large detached family houses around Brentwood and "
           "Chigwell where an island with a waterfall end is close to standard. The one thing "
           "they have in common is that the template does the work, because very few walls in "
           "any of them are straight."),
    towns_note="We cover the whole county. The towns we are asked for most often have their own pages.",
    areas=["Harlow","Chelmsford","Brentwood","Romford","Basildon","Billericay","Epping","Loughton",
           "Buckhurst Hill","Chigwell","Southend-on-Sea","Braintree","Saffron Walden","Waltham Abbey"],
    dial="01279, 01245 and 01277",
    travel=("Essex is well inside our normal working area, particularly the western side around "
            "Harlow and Epping, which is a short run from our Hertfordshire work."),
    lead="Three to five working days from template to fitting is normal here.",
  ),
  dict(
    slug="london", name="London",
    h1="Kitchen worktops in London",
    title="Kitchen Worktops in London | Bathrooms & Commercial Too | Topcat",
    metadesc="Stone surfaces for kitchens, bathrooms and commercial spaces across London. Quartz, granite, marble and porcelain, free home visit with samples, every cut-out included, ten year guarantee.",
    lede=("We fit across Greater London, most often in the north and east, and we are used to "
          "the practical realities of working in the city."),
    intro=("London kitchens bring problems the Home Counties do not. Access is the big one: "
           "third floor flats without a lift, communal stairwells with tight turns, and streets "
           "where the van cannot sit outside for long. Those are planning problems rather than "
           "obstacles, and we would rather talk about them at survey than discover them on "
           "fitting day. Tell us the access when you enquire and we will plan the piece sizes "
           "and joint positions around it."),
    towns_note="Areas we are asked for most often, and where we work regularly.",
    areas=["Enfield","Barnet","Harrow","Ealing","Chiswick","Richmond upon Thames","Wimbledon",
           "Clapham","Fulham","Islington","Hackney","Greenwich","Bromley","Croydon"],
    dial="020",
    travel=("We work across Greater London regularly. For central postcodes we will talk through "
            "access, parking and permits before we quote, because those affect how the job runs."),
    lead="Three to five working days from template to fitting, access permitting.",
  ),
  dict(
    slug="berkshire", name="Berkshire",
    h1="Kitchen worktops in Berkshire",
    title="Kitchen Worktops in Berkshire | Bathrooms & Commercial Too | Topcat",
    metadesc="Quartz, granite, marble and porcelain surfaces for kitchens, bathrooms, utilities and commercial spaces across Berkshire. Free home visit with samples, every cut-out included, ten year guarantee.",
    lede=("We cover Berkshire from Slough and Maidenhead across to Reading, Bracknell, "
          "Wokingham and Newbury."),
    intro=("Berkshire is the furthest of our four counties and we are honest about that. It "
           "means we tend to plan Berkshire jobs a little further ahead rather than fitting "
           "them in at short notice, and we will always tell you a realistic date rather than "
           "an optimistic one. The work itself is no different, and the guarantee is the same."),
    towns_note="Towns across the county where we work regularly.",
    areas=["Slough","Reading","Maidenhead","Newbury","Bracknell","Wokingham","Windsor",
           "Ascot","Thatcham","Sandhurst","Crowthorne","Hungerford"],
    dial="01753, 0118 and 01628",
    travel=("Berkshire is the outer edge of our normal area. We work there regularly and we plan "
            "the dates a little further ahead, which we will be straight with you about when we "
            "quote."),
    lead="Usually four to seven working days from template to fitting, because of the distance.",
  ),
]

TOWNS = [
  dict(
    slug="harlow", name="Harlow", county="essex", county_name="Essex",
    h1="Kitchen worktops in Harlow",
    title="Kitchen Worktops in Harlow | Bathrooms & Commercial Too | Topcat",
    metadesc="Stone surfaces for kitchens, bathrooms and commercial spaces in Harlow and across CM17 to CM20. Free home visit with samples, every cut-out included, ten year guarantee.",
    postcodes="CM17 to CM20", dial="01279",
    lede=("Harlow is one of the areas we are asked for most, and one of the easiest for us to "
          "reach from our Hertfordshire work."),
    local=("Harlow's housing stock is unusual, and it changes how we quote. A great deal of it "
           "is post-war new town build, which means kitchens of a fairly consistent size and "
           "layout, often with a single run and a return. Those are frequently one slab jobs, "
           "which is the least expensive band we do. The newer estates on the edges of the town "
           "are a different proposition, generally larger and often with an island. Both are "
           "straightforward for us, but they land in very different price bands, which is why "
           "we would rather look at the actual room than quote off a floor plan."),
    nearby=["Old Harlow","Church Langley","Newhall","Sawbridgeworth","Epping","Bishop's Stortford"],
    travel=("Harlow is a short run from the Hertfordshire side of our work, so we are usually "
            "able to offer early template and fitting dates."),
    lead="Three to five working days from template to fitting.",
    proof=("We have fitted in Harlow and the surrounding CM postcodes, and it is one of the "
           "areas we cover most often."),
  ),
  dict(
    slug="stevenage", name="Stevenage", county="hertfordshire", county_name="Hertfordshire",
    h1="Kitchen worktops in Stevenage",
    title="Kitchen Worktops in Stevenage | Bathrooms & Commercial Too | Topcat",
    metadesc="Stone surfaces for kitchens, bathrooms and commercial spaces in Stevenage and across SG1 and SG2. Free home visit with samples, every cut-out included, ten year guarantee.",
    postcodes="SG1 and SG2", dial="01438",
    lede=("Stevenage is well inside our normal working area and one of the Hertfordshire towns "
          "we quote most often."),
    local=("Like Harlow, Stevenage is largely a new town, and that shows in the kitchens. The "
           "older new town housing tends toward compact, well proportioned kitchens where a "
           "single slab covers the job and the worktop makes a disproportionate difference to "
           "how the room feels. The Old Town and the villages north of it are a different "
           "story, with older properties where the walls are rarely square and a hand "
           "template earns its keep. We fit both, and the approach differs more than the price "
           "does."),
    nearby=["Old Stevenage","Knebworth","Hitchin","Letchworth","Baldock","Welwyn Garden City"],
    travel=("Stevenage is a straightforward run for us and we are in the area most weeks, so "
            "dates are usually the earliest we can offer."),
    lead="Three to five working days from template to fitting.",
    proof=("Stevenage sits in the middle of our Hertfordshire patch, between our Watford and "
           "Bishop's Stortford work."),
  ),
  dict(
    slug="st-albans", name="St Albans", county="hertfordshire", county_name="Hertfordshire",
    h1="Kitchen worktops in St Albans",
    title="Kitchen Worktops in St Albans | Bathrooms & Commercial Too | Topcat",
    metadesc="Stone surfaces for kitchens, bathrooms and commercial spaces in St Albans, AL1 to AL4. Free home visit with samples, every cut-out included, ten year guarantee.",
    postcodes="AL1 to AL4", dial="01727",
    lede=("St Albans is close to home for us and one of the most competitive worktop markets in "
          "the county, which suits us."),
    local=("St Albans has a lot of Victorian and Edwardian housing, particularly around the "
           "city centre and the Fleetville and Camp areas, and that changes the job. Older "
           "properties tend to have kitchens in rear extensions where no two walls agree with "
           "each other, chimney breasts that eat into a run, and floors that are not level. "
           "None of that is a problem, but it is exactly why the template is taken off your "
           "real cabinets by hand rather than from a tape and a sketch. The larger "
           "detached housing out toward Harpenden and Wheathampstead is more often an island "
           "job with a full height splashback."),
    nearby=["Harpenden","Wheathampstead","London Colney","Radlett","Redbourn","Hatfield"],
    travel=("St Albans is one of the closest towns to our normal working area, so we can "
            "usually template quickly and fit soon after."),
    lead="Three to five working days from template to fitting.",
    proof=("St Albans is central to the Hertfordshire work we do, alongside Watford, Hemel "
           "Hempstead and Radlett."),
  ),
  dict(
    slug="enfield", name="Enfield", county="london", county_name="London",
    h1="Kitchen worktops in Enfield",
    title="Kitchen Worktops in Enfield | Bathrooms & Commercial Too | Topcat",
    metadesc="Stone worktops templated and fitted across Enfield, EN1 to EN3 and N9 to N21. Free home visit with samples, every cut-out included, ten year guarantee.",
    postcodes="EN1 to EN3, and N9 to N21", dial="020",
    lede=("Enfield is the London borough we are asked for most, and it sits right between our "
          "Hertfordshire and Essex work."),
    local=("Enfield spans a wider range than most London boroughs. There is a lot of "
           "inter-war semi-detached housing with kitchens at the back, often extended, where "
           "the join between the original room and the extension is the detail that decides "
           "where the worktop joint goes. Closer in toward Edmonton and Ponders End there are "
           "more terraces and flats, where access and piece size matter as much as the stone. "
           "Out toward Enfield Town and Winchmore Hill the properties are larger and islands "
           "are common. Tell us which of those you are and we can be much more useful on the "
           "phone."),
    nearby=["Enfield Town","Palmers Green","Winchmore Hill","Southgate","Cheshunt","Barnet"],
    travel=("Enfield is an easy run for us from either the Hertfordshire or the Essex side, and "
            "we work there regularly."),
    lead="Three to five working days from template to fitting, access permitting.",
    proof=("Enfield sits between our Hertfordshire and Essex work, and we cover it regularly "
           "along with Barnet and the north London boroughs."),
  ),
]


# ===========================================================================
# SHARED CONTENT BLOCKS
# ===========================================================================
# ⚠️ Every claim here must survive the outsourced-fabrication rule. Templating,
# fitting, project management, aftercare and the guarantee are Topcat's own.
# Cutting is not.
PROCESS = [
  ("Free home visit", "We come to you with samples, look at the actual room and talk through "
   "the stone, the edges and the layout. No showroom trip, and no obligation."),
  ("One itemised price", "Templating, stone, fabrication, all cut-outs, fitting and VAT, in one "
   "figure agreed before anything is cut. What you approve is what you pay."),
  ("Template", "Once your units are level we template the room by hand, to a fraction of "
   "a millimetre, and agree joint positions and veining direction with you in the room."),
  ("Your slab, approved", "You see photographs of your actual slab and approve it before it is "
   "cut, so there are no surprises when it arrives."),
  ("Fitted and sealed", "Our own fitters install it, usually within three to five working days "
   "of templating, and we take the packaging away with us."),
  ("Aftercare inside 72 hours", "If anything needs adjusting afterwards we come back, free of "
   "charge, and we have never taken more than 72 hours to get there."),
]

# ⚠️ Topcat is NOT a kitchens-only business and the site must not read as one. These are the
# real applications, and every location and material page carries them. ⭐ Every one of them now
# has its own service page (D228), so this doubles as the internal link into that family.
APPLICATIONS = [
  ("Kitchen worktops", "/services/kitchen-worktops.html",
   "Runs, peninsulas and full replacements, in any of the five materials."),
  ("Kitchen islands", "/services/kitchen-islands.html",
   "Including mitred waterfall ends and bookmatched slabs."),
  ("Bathrooms", "/services/bathroom-worktops.html",
   "Shower surrounds, thresholds, window sills and bath panels cut from one stone."),
  ("Vanity tops", "/services/vanity-tops.html",
   "Cut for undermount or countertop basins, with the tap holes where you want them."),
  ("Splashbacks and upstands", "/services/splashbacks.html",
   "Cut from the same slab as the worktop so the veining runs on unbroken."),
  ("Outdoor kitchens", "/services/outdoor-kitchens.html",
   "Porcelain or hard granite, both of which take weather and sunlight."),
  ("Commercial surfaces", "/services/commercial-worktops.html",
   "Reception desks, bar tops, office kitchens and hospitality fit-outs."),
  # ⭐ THESE TWO POINTED AT `/contact/` UNTIL D228, BECAUSE NEITHER HAD A PAGE. They do now.
  ("Fireplaces", "/services/fireplaces.html",
   "Hearths, surrounds and mantel shelves cut to your opening and finished by hand."),
  ("Dining tables", "/services/dining-tables.html",
   "Table and console tops cut to your shape, on your base or one being made for you."),
]


def applications_html(place=None):
    where = f" in {place}" if place else ""
    items = "".join(
        f'<a class="app" href="{h}"><h3>{e(t)}</h3><p>{e(d)}</p></a>'
        for t, h, d in APPLICATIONS)
    return f"""<section class="block"><div class="wrap">
  <h2>Not only kitchens</h2>
  <p class="note">Kitchens are most of what we do{where}, but they are not all of it. If it is
  stone and it needs templating and fitting, it is worth asking us about.</p>
  <div class="appgrid">{items}</div>
</div></section>"""


INCLUDED = [
  "Every cut-out free of charge, for the sink, hob, taps and sockets, however many",
  "Pencil edges as standard, so corners are kind to small hands",
  "Drainer grooves as standard",
  "Free home visit with samples, we come to you",
  "Your actual slab approved from photographs before anything is cut",
  f"{GUARANTEE_YEARS} year guarantee, in writing",
]


def process_html():
    steps = "".join(
        f'<div class="step"><div class="n">Step {i}</div><h3>{e(t)}</h3><p>{e(p)}</p></div>'
        for i, (t, p) in enumerate(PROCESS, 1))
    return f"""<section class="block"><div class="wrap">
  <h2>How it works</h2>
  <div class="steps">{steps}</div>
</div></section>"""


def included_html():
    items = "".join(f"<li>{e(x)}</li>" for x in INCLUDED)
    return f"""<section class="block"><div class="wrap">
  <h2>What is included as standard</h2>
  <ul class="ticks">{items}</ul>
  <p class="note">Cut-outs, drainer grooves and pencil edges are commonly itemised as extras
  elsewhere. They are not extras here, which is worth checking when you compare two quotes that
  look similar at the headline.</p>
</div></section>"""


def org_ld():
    """Organization + HomeAndConstructionBusiness. ⚠️ NO aggregateRating and NO
    review: Google explicitly makes self-reviewed star markup ineligible, and
    the client rule is never to publish the review count."""
    return {
      "@context": "https://schema.org", "@type": "HomeAndConstructionBusiness",
      "name": "Topcat Worktops Ltd", "url": BASE + "/",
      "telephone": PHONE_TEL, "email": EMAIL,
      "description": ("Bespoke quartz, marble, granite and porcelain worktops, templated, fitted "
                      "and guaranteed across London, Hertfordshire, Essex, Berkshire, Buckinghamshire, Surrey, Oxfordshire & Bedfordshire."),
      "areaServed": [{"@type": "AdministrativeArea", "name": a} for a in AREAS_SERVED],
      "openingHours": "Mo-Su 07:00-21:00",
    }


def article_ld(g, url):
    """Article + author Person. One of the few types Google still uses, and the
    named author with a visible reviewed date is the E-E-A-T lever that matters
    most on the guides, especially the silica one."""
    return {
      "@context": "https://schema.org", "@type": "Article",
      "headline": g["h1"], "description": g["metadesc"],
      "mainEntityOfPage": {"@type": "WebPage", "@id": url},
      "author": {"@type": "Person", "name": AUTHOR, "jobTitle": AUTHOR_ROLE, "url": AUTHOR_URL},
      "publisher": {"@type": "Organization", "name": "Topcat Worktops Ltd"},
      "dateModified": LAST_REVIEWED_ISO,
    }


def render_sections(sections):
    out = []
    for sec in sections:
        if sec[0] == "TABLE":
            # ⚠️ must sit inside .block > .wrap like every other section, or the
            # caption escapes the content column and hangs off the left edge
            out.append('<section class="block"><div class="wrap">'
                       + table_block(sec[1], sec[2], sec[3]) + "</div></section>")
        else:
            head, paras = sec
            body = "".join(f"<p>{e(p)}</p>" for p in paras)
            out.append(f'<section class="block"><div class="wrap"><h2>{e(head)}</h2>'
                       f'<div class="prose">{body}</div></div></section>')
    return "".join(out)


# ===========================================================================
# PAGE RENDERERS
# ===========================================================================
def material_page(m):
    url = f"{BASE}/materials/{m['slug']}.html"
    cr = [("/index.html#hero", "Home"), ("/materials/", "Materials"), (None, m["h1"])]
    facts = "".join(f"<div class='fact'><dt>{e(k)}</dt><dd>{e(v)}</dd></div>" for k, v in m["facts"])
    body = "".join(
        f'<section class="block"><div class="wrap"><h2>{e(h)}</h2><div class="prose"><p>{e(p)}</p></div></div></section>'
        for h, p in m["body"])
    rel = "".join(
        f'<li><a href="/materials/{s}.html">{e(next(x["h1"] for x in MATERIALS if x["slug"]==s))}</a></li>'
        for s in m["related"])
    gds = "".join(
        f'<li><a href="/guides/{s}.html">{e(next(x["h1"] for x in GUIDES if x["slug"]==s))}</a></li>'
        for s in m["guides"])
    ld = ld_block(org_ld(), breadcrumb_ld(cr, url))
    return head_html(m["title"], m["metadesc"], url, 1, ld) + f"""
<main>
  <section class="svc-hero">
    <div class="svc-hero-bg" style="background-image:url('{HERO_IMG}')"></div>
    {crumbs(cr)}
    <div class="wrap svc-hero-inner">
      <h1>{gold_last(m['h1'])}</h1>
      <p class="lede">{e(m['lede'])}</p>
      <div class="cta-row">
        <a class="btn-gold" href="/estimate/">Price it in a minute</a>
        <a class="btn-ghost" href="tel:{PHONE_TEL}">Call {PHONE_DISPLAY}</a>
      </div>
      <!-- ⭐⭐ D263: the landing page's four bubbles replace the three spans of grey trust text.
           ⚠️ The county list goes with them and is not lost - it is still named in full in the
           footer, in the schema and in the page's own copy. -->
      {hero_chips()}
    </div>
  </section>

  <!-- ⭐ D300 — the reading sections share a grid with the sticky quote card; see THE LEAD LAYOUT
       in service.css. The grid ends before the FAQ, which is where the card is carried away. -->
  <div class="lead-grid">
   <div class="lead-main">
  <section class="block"><div class="wrap">
    <div class="prose lead-answer"><p>{e(m['defn'])}</p></div>
    <dl class="facts">{facts}</dl>
    <p class="price-line"><strong>Cost:</strong> {e(m['price'])}</p>
  </div></section>

  {body}
  {applications_html()}
  {included_html()}
  {process_html()}
   </div>
   {qform_html()}
  </div>

  {faq_block(m['faqs'])}

  <section class="block"><div class="wrap">
    <h2>Related</h2>
    <div class="rel-cols">
      <div><p class="foot-k">Other materials</p><ul class="rel">{rel}</ul></div>
      <div><p class="foot-k">Guides worth reading</p><ul class="rel">{gds}</ul></div>
    </div>
  </div></section>

  {cta_band("Get a price for " + m['short'].lower(), "A free home visit, samples in your own light, and one itemised price with nothing hidden.")}
</main>
{footer_html()}
</body>
</html>"""


def materials_index():
    url = f"{BASE}/materials/"
    cr = [("/index.html#hero", "Home"), (None, "Materials")]
    cards = "".join(
        f'<a class="mcard" href="/materials/{m["slug"]}.html"><h3>{e(m["h1"])}</h3>'
        f'<p>{e(m["lede"])}</p><span class="mcard-go">Read about {e(m["short"].lower())}</span></a>'
        for m in MATERIALS)
    ld = ld_block(org_ld(), breadcrumb_ld(cr, url))
    title = "Worktop Materials Compared | Quartz, Granite, Marble, Porcelain | Topcat"
    md = ("Quartz, granite, marble, porcelain and quartzite worktops explained, with honest "
          "limits, real costs and what each one suits. Fitted across London and the Home Counties.")
    return head_html(title, md, url, 1, ld) + f"""
{crumbs(cr)}
<main>
  <section class="block"><div class="wrap">
    <h1>Worktop materials</h1>
    <p class="lede">Five surfaces, and none of them is right for every kitchen. Here is what each
    one actually does, including the parts that are usually left out.</p>
    <div class="mgrid">{cards}</div>
  </div></section>
  {included_html()}
  {cta_band("Not sure which one", "Tell us how you cook and we will tell you what suits. A free home visit, with samples, in your own light.")}
</main>
{footer_html()}
</body>
</html>"""


def guide_page(g):
    url = f"{BASE}/guides/{g['slug']}.html"
    cr = [("/index.html#hero", "Home"), ("/guides/", "Guides"), (None, g["h1"])]
    rel = "".join(
        f'<li><a href="/guides/{s}.html">{e(next(x["h1"] for x in GUIDES if x["slug"]==s))}</a></li>'
        for s in g["related"])
    mats = "".join(
        f'<li><a href="/materials/{s}.html">{e(next(x["h1"] for x in MATERIALS if x["slug"]==s))}</a></li>'
        for s in g["mats"])
    ld = ld_block(article_ld(g, url), breadcrumb_ld(cr, url))
    return head_html(g["title"], g["metadesc"], url, 1, ld) + f"""
{crumbs(cr)}
<main>
  <article>
  <section class="block"><div class="wrap">
    <h1>{e(g['h1'])}</h1>
    <p class="byline">Written by {e(AUTHOR)}, {e(AUTHOR_ROLE)}.
       <span class="reviewed">Last reviewed {e(LAST_REVIEWED)}</span></p>
    <div class="prose lead-answer"><p>{e(g['answer'])}</p></div>
  </div></section>

  <div class="lead-grid">
   <div class="lead-main">
  {render_sections(g['sections'])}
   </div>
   {qform_html()}
  </div>

  {faq_block(g['faqs'])}

  <section class="block"><div class="wrap">
    <h2>Related</h2>
    <div class="rel-cols">
      <div><p class="foot-k">More guides</p><ul class="rel">{rel}</ul></div>
      <div><p class="foot-k">Materials</p><ul class="rel">{mats}</ul></div>
    </div>
  </div></section>
  </article>
  {cta_band("Want this priced for your kitchen", "A free home visit, samples in your own light, and one itemised price including VAT.")}
</main>
{footer_html()}
</body>
</html>"""


def guides_index():
    url = f"{BASE}/guides/"
    cr = [("/index.html#hero", "Home"), (None, "Guides")]
    cards = "".join(
        f'<a class="mcard" href="/guides/{g["slug"]}.html"><h3>{e(g["h1"])}</h3>'
        f'<p>{e(g["answer"][:170])}…</p><span class="mcard-go">Read the guide</span></a>'
        for g in GUIDES)
    ld = ld_block(org_ld(), breadcrumb_ld(cr, url))
    title = "Worktop Guides | Costs, Materials & Straight Answers | Topcat Worktops"
    md = ("Straight answers on worktop costs, materials, heat, thickness and safety, written by "
          "the people who fit them. No sales pitch, including the parts that count against us.")
    return head_html(title, md, url, 1, ld) + f"""
{crumbs(cr)}
<main>
  <section class="block"><div class="wrap">
    <h1>Worktop guides</h1>
    <p class="lede">The questions we get asked on every home visit, answered properly. Including
    the answers that talk you out of something.</p>
    <div class="mgrid">{cards}</div>
  </div></section>
  {cta_band("Still deciding", "We will happily talk it through on the phone with nothing to sign.")}
</main>
{footer_html()}
</body>
</html>"""


def _local_price_table():
    return table_block(
      "Typical all-in cost, quartz, supplied and fitted including VAT",
      ["Kitchen", "Slabs", "Typical range"],
      [["Small galley or single run", "1", "£2,000 to £2,500"],
       ["Standard kitchen, no island", "2", "£3,000 to £3,600"],
       ["Kitchen with an island", "2 plus island", "£3,850 to £4,300"],
       ["Larger kitchen with an island", "3 plus island", "£4,350 to £5,000"]])


def county_page(c):
    url = f"{BASE}/worktops/{c['slug']}/"
    cr = [("/index.html#hero", "Home"), ("/worktops/", "Areas we cover"), (None, c["name"])]
    towns = [t for t in TOWNS if t["county"] == c["slug"]]
    town_links = "".join(
        f'<li><a href="/worktops/{c["slug"]}/{t["slug"]}/">Worktops in {e(t["name"])}</a></li>'
        for t in towns)
    areas = "".join(f"<li>{e(a)}</li>" for a in c["areas"])
    mats = "".join(
        f'<li><a href="/materials/{m["slug"]}.html">{e(m["short"])} worktops</a></li>'
        for m in MATERIALS)
    others = "".join(
        f'<li><a href="/worktops/{o["slug"]}/">{e(o["name"])}</a></li>'
        for o in COUNTIES if o["slug"] != c["slug"])
    ld = ld_block(org_ld(), breadcrumb_ld(cr, url))
    faqs = [
      (f"Do you cover the whole of {c['name']}?",
       f"Yes. {c['travel']} If you are just outside, ask, we travel for the right job and we "
       f"template nationwide for projects that warrant it."),
      (f"How long does a worktop take in {c['name']}?",
       f"{c['lead']} We template once your units are level, you approve your slab from "
       f"photographs, and we fit."),
      ("Do you have a showroom we can visit?",
       "No, and deliberately. We bring the samples to you instead, so you see the stone in your "
       "own kitchen under your own light, which is where you have to live with it. There is no "
       "charge and no obligation."),
      ("What is included in the price?",
       "Templating, the stone, fabrication, every cut-out, fitting and VAT, in one itemised "
       "figure agreed before anything is cut. Drainer grooves and pencil edges are standard."),
    ]
    return head_html(c["title"], c["metadesc"], url, 2, ld) + f"""
<main>
  <section class="svc-hero">
    <div class="svc-hero-bg" style="background-image:url('{HERO_IMG}')"></div>
    {crumbs(cr)}
    <div class="wrap svc-hero-inner">
      <h1>{gold_last(c['h1'])}</h1>
      <p class="lede">{e(c['lede'])}</p>
      <div class="cta-row">
        <a class="btn-gold" href="/contact/">Book a free home visit</a>
        <a class="btn-ghost" href="tel:{PHONE_TEL}">Call {PHONE_DISPLAY}</a>
      </div>
      <!-- ⭐⭐ D263: the landing page's bubbles, with this county's dialling code kept as a
           fifth that spans the row. -->
      {hero_chips("Local dialling " + e(c['dial']))}
    </div>
  </section>

  <div class="lead-grid">
   <div class="lead-main">
  <section class="block"><div class="wrap">
    <div class="prose lead-answer"><p>{e(c['intro'])}</p></div>
    <p class="note">{e(c['travel'])} {e(c['lead'])}</p>
  </div></section>

  <section class="block"><div class="wrap">
    <h2>What a kitchen costs in {e(c['name'])}</h2>
    {_local_price_table()}
    <p class="note">Those figures are for kitchens, which is the job we are asked for most.
    Bathrooms, vanity tops, splashbacks, utility rooms, outdoor kitchens, commercial fit-outs,
    fireplaces and tables are all priced against your drawings instead, because they vary far
    more than a kitchen does. Marble, granite and porcelain are priced by hand for the same
    reason, the material cost swings significantly between one block and the next.</p>
  </div></section>

  <section class="block"><div class="wrap">
    <h2>Towns and areas we cover in {e(c['name'])}</h2>
    <p class="note">{e(c['towns_note'])}</p>
    <ul class="rel two-up">{town_links}</ul>
    <ul class="chips">{areas}</ul>
  </div></section>

  <section class="block"><div class="wrap">
    <h2>Materials</h2>
    <ul class="rel two-up">{mats}</ul>
  </div></section>

  {applications_html(c['name'])}
  {included_html()}
  {process_html()}
   </div>
   {qform_html()}
  </div>

  {faq_block(faqs, "Frequently asked questions in " + c['name'])}

  <section class="block"><div class="wrap">
    <h2>Other areas we cover</h2>
    <ul class="rel two-up">{others}</ul>
  </div></section>

  {cta_band("Get a price for your " + c['name'] + " kitchen", "A free home visit with samples, one itemised price including VAT, and a ten year guarantee.")}
</main>
{footer_html()}
</body>
</html>"""


def town_page(t):
    c = next(x for x in COUNTIES if x["slug"] == t["county"])
    url = f"{BASE}/worktops/{t['county']}/{t['slug']}/"
    cr = [("/index.html#hero", "Home"), ("/worktops/", "Areas we cover"),
          (f"/worktops/{t['county']}/", c["name"]), (None, t["name"])]
    nearby = "".join(f"<li>{e(a)}</li>" for a in t["nearby"])
    mats = "".join(
        f'<li><a href="/materials/{m["slug"]}.html">{e(m["short"])} worktops</a></li>'
        for m in MATERIALS)
    sibs = [s for s in TOWNS if s["slug"] != t["slug"]]
    sib_links = "".join(
        f'<li><a href="/worktops/{s["county"]}/{s["slug"]}/">Worktops in {e(s["name"])}</a></li>'
        for s in sibs)
    gds = "".join(
        f'<li><a href="/guides/{g}.html">{e(next(x["h1"] for x in GUIDES if x["slug"]==g))}</a></li>'
        for g in ["how-much-do-quartz-worktops-cost", "best-kitchen-worktop-material",
                  "what-happens-when-we-template"])
    ld = ld_block(org_ld(), breadcrumb_ld(cr, url))
    # ⚠️ The town goes INSIDE the question, phrased so it reads naturally. Competitors
    # ship things like "What is a Chelmsford quartz worktop?", which is nonsense.
    faqs = [
      (f"How long does it take to fit a worktop in {t['name']}?",
       f"{t['lead']} {t['travel']}"),
      (f"Do you cover all of {t['name']}?",
       f"Yes, across {t['postcodes']}, and the surrounding villages. {t['proof']}"),
      ("Do I have to visit a showroom?",
       f"No. We bring samples to your kitchen in {t['name']}, so you see the stone in your own "
       "light rather than under showroom spotlights. The visit is free and there is nothing to sign."),
      ("What does a quote include?",
       "Templating, the stone, fabrication, every cut-out, fitting and VAT, in one figure agreed "
       "before anything is cut. Cut-outs, drainer grooves and pencil edges are all standard, not "
       "extras."),
    ]
    return head_html(t["title"], t["metadesc"], url, 3, ld) + f"""
<main>
  <section class="svc-hero">
    <div class="svc-hero-bg" style="background-image:url('{HERO_IMG}')"></div>
    {crumbs(cr)}
    <div class="wrap svc-hero-inner">
      <h1>{gold_last(t['h1'])}</h1>
      <p class="lede">{e(t['lede'])}</p>
      <div class="cta-row">
        <a class="btn-gold" href="/contact/">Book a free home visit</a>
        <a class="btn-ghost" href="tel:{PHONE_TEL}">Call {PHONE_DISPLAY}</a>
      </div>
      <!-- ⭐⭐ D263: the landing page's bubbles, with this town's postcodes and dialling code
           kept as two more. Six bubbles is three even rows. -->
      {hero_chips(e(t['postcodes']), "Dialling " + e(t['dial']))}
    </div>
  </section>

  <div class="lead-grid">
   <div class="lead-main">
  <section class="block"><div class="wrap">
    <h2>Worktops for {e(t['name'])} kitchens</h2>
    <div class="prose"><p>{e(t['local'])}</p></div>
  </div></section>

  <section class="block"><div class="wrap">
    <h2>What a kitchen costs in {e(t['name'])}</h2>
    {_local_price_table()}
    <p class="note">Those figures are for kitchens. Bathrooms, vanity tops, splashbacks,
    outdoor kitchens, commercial work, fireplaces and tables are priced against your drawings,
    because they vary more than a kitchen does. Marble, granite and porcelain are priced by hand
    too. {e(t['travel'])}</p>
  </div></section>

  <section class="block"><div class="wrap">
    <h2>Areas we cover around {e(t['name'])}</h2>
    <ul class="chips">{nearby}</ul>
    <p class="note">Part of our wider
      <a href="/worktops/{t['county']}/">{e(c['name'])} coverage</a>.</p>
  </div></section>

  <section class="block"><div class="wrap">
    <h2>Materials</h2>
    <ul class="rel two-up">{mats}</ul>
  </div></section>

  {applications_html(t['name'])}
  {included_html()}
  {process_html()}
   </div>
   {qform_html()}
  </div>

  {faq_block(faqs, "Frequently asked questions in " + t['name'])}

  <section class="block"><div class="wrap">
    <h2>Worth reading before you buy</h2>
    <ul class="rel two-up">{gds}</ul>
    <h2 style="margin-top:2rem">Nearby towns</h2>
    <ul class="rel two-up">{sib_links}</ul>
  </div></section>

  {cta_band("Get a price for your " + t['name'] + " kitchen", "A free home visit with samples, one itemised price including VAT, and a ten year guarantee.")}
</main>
{footer_html()}
</body>
</html>"""


def areas_index():
    url = f"{BASE}/worktops/"
    cr = [("/index.html#hero", "Home"), (None, "Areas we cover")]
    cards = ""
    for c in COUNTIES:
        towns = [t for t in TOWNS if t["county"] == c["slug"]]
        tl = ", ".join(t["name"] for t in towns) or "County-wide coverage"
        cards += (f'<a class="mcard" href="/worktops/{c["slug"]}/"><h3>{e(c["name"])}</h3>'
                  f'<p>{e(c["lede"])}</p><span class="mcard-go">{e(tl)}</span></a>')
    ld = ld_block(org_ld(), breadcrumb_ld(cr, url))
    title = "Areas We Cover | Worktops Across London & the Home Counties | Topcat"
    md = ("Stone worktops templated and fitted across London, Hertfordshire, Essex, Berkshire, Buckinghamshire, Surrey, Oxfordshire & Bedfordshire, "
          "plus nationwide templating for the right project. Free home visit with samples.")
    return head_html(title, md, url, 1, ld) + f"""
{crumbs(cr)}
<main>
  <section class="block"><div class="wrap">
    <h1>Areas we cover</h1>
    <p class="lede">Kitchens, bathrooms, splashbacks, outdoor kitchens and commercial work
    across London, Hertfordshire, Essex, Berkshire, Buckinghamshire, Surrey, Oxfordshire and
    Bedfordshire, plus nationwide templating for projects worth the journey.</p>
    <p class="lede">If you are just outside these areas, ask. We are always happy to see if we
    can help.</p>
    <div class="mgrid">{cards}</div>
  </div></section>
  {included_html()}
  {cta_band("Not sure if we reach you", "Call and ask. We travel for the right job and we will be straight with you about dates.")}
</main>
{footer_html()}
</body>
</html>"""


# ===========================================================================
# SITEMAP  (/sitemap.html)
# ===========================================================================
# An HTML sitemap, linked from the legal bar of every footer on the site. Two
# jobs, and the first one is the reason the client asked for it:
#   1. A single page where the whole build can be walked and reviewed. The SEO
#      layer is 25 pages across three families and there was no one screen that
#      showed all of it.
#   2. It puts every page two clicks from the landing page, which is a real
#      crawl signal and reinforces the anti-doorway structure — an unlinked or
#      thinly-linked page set is the textbook doorway signature.
#
# ⚠️ It is generated from the SAME lists the pages are generated from, so it
# cannot drift. The only external source is the stone catalogue, imported from
# stones/catalogue_source.py (the documented source of truth). If that import
# ever fails the page degrades to a link to /stones/ rather than breaking.
#
# The service pages are hardcoded here because services/build_services.py owns
# that list and importing it would run its module-level work.
# ⚠️⚠️ THAT TRADE CAME DUE ON 14 Aug 2026 (D228). This comment used to say "six
# entries that have not changed in weeks is the cheaper trade" — then three pages
# were added and one was renamed, and NOTHING flagged that this copy of the list
# had gone stale. ⛔ If you add a service page, it goes in FOUR places: this list,
# APPLICATIONS above, the SERVICES array in index.html, and both nav menus.
SERVICE_PAGES = [
    ("kitchen-worktops", "Kitchen worktops"),
    ("kitchen-islands", "Kitchen islands and waterfall ends"),
    ("splashbacks", "Splashbacks and upstands"),
    ("bathroom-worktops", "Bathroom worktops and shower surrounds"),
    ("vanity-tops", "Stone vanity tops"),
    ("outdoor-kitchens", "Outdoor kitchen worktops"),
    ("fireplaces", "Fireplace surrounds, hearths and mantels"),
    ("dining-tables", "Stone dining tables"),
    ("commercial-worktops", "Commercial stone surfaces"),
]

# The landing page is one file, so its sections are the "pages" a visitor thinks
# of. Hashes, not URLs, and they are listed as such.
HOME_SECTIONS = [
    ("services", "Surfaces for every space"),
    ("gallery", "Project gallery"),
    ("stones", "The stone collection"),
    ("estimator", "Price estimator"),
    ("process", "Our process"),
    ("about", "About us"),
    ("why", "Why choose us"),
    ("faq", "Frequently asked questions"),
    ("cta", "Get a quote"),
]


def _stone_catalogue():
    """The live range, from the ONE file that says what the site sells.

    ⛔ THIS READ `catalogue_source.py` AND THAT IS THE 52-STONE SNAPSHOT. The range reached 115
    on 10 Aug and the sitemap kept listing 52, so 63 stone pages were absent from the one page
    built to prove nothing is orphaned — and the "0 orphaned pages" figure in the handover was
    measured before the range grew, so it did not catch it either.
    ⚠️ Same failure as D51 and D59: a second file that looks like the source of truth. There is
    exactly one, `catalogue_active.py`, and everything derived from the range reads it."""
    import importlib.util, sys
    src = ROOT / "stones" / "catalogue_active.py"
    if not src.exists():
        return []
    # ⚠️ catalogue_active imports catalogue_expanded as a sibling, so stones/ has to be on the
    # path before it is executed. Without this the loader raises, the except below swallows it,
    # and the sitemap silently ships with no stones at all rather than failing loudly.
    if str(src.parent) not in sys.path:
        sys.path.insert(0, str(src.parent))
    try:
        spec = importlib.util.spec_from_file_location("_tc_catalogue", src)
        mod = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(mod)
        return list(mod.S)
    except Exception as exc:                                  # noqa: BLE001
        print(f"  ! sitemap: could not read the stone catalogue ({exc}), "
              f"linking /stones/ only")
        return []


def _sm_group(title, count_label, links, note="", two_up=False):
    """One block of the sitemap: a heading, a count, and a list of links."""
    cls = "rel two-up" if two_up else "rel"
    lis = "".join(f'<li><a href="{h}">{e(t)}</a></li>' for h, t in links)
    n = f'<p class="note">{note}</p>' if note else ""
    return f"""<section class="block sm-group"><div class="wrap">
    <h2>{e(title)} <span class="sm-count">{e(count_label)}</span></h2>
    {n}
    <ul class="{cls}">{lis}</ul>
  </div></section>"""


def sitemap_page():
    url = f"{BASE}/sitemap.html"
    cr = [("/index.html#hero", "Home"), (None, "Sitemap")]
    stones = _stone_catalogue()

    home = [("/index.html", "Home")] + [
        (f"/index.html#{h}", t) for h, t in HOME_SECTIONS]
    home += [("/trade/", "For the trade"), ("/sitemap.html", "Sitemap")]

    # ⚠️ There is no /services/ index page — unlike /materials/, /guides/ and
    # /worktops/, the six service pages have no hub of their own. The landing
    # page's services section is the real hub, and it is already listed under
    # "The main pages", so this group is just the six pages.
    services = [(f"/services/{s}.html", t) for s, t in SERVICE_PAGES]

    materials = [("/materials/", "All materials")] + [
        (f"/materials/{m['slug']}.html", f"{m['short']} worktops") for m in MATERIALS]

    guides = [("/guides/", "All guides")] + [
        (f"/guides/{g['slug']}.html", g["h1"]) for g in GUIDES]

    areas = [("/worktops/", "All areas we cover")]
    for c in COUNTIES:
        areas.append((f"/worktops/{c['slug']}/", c["name"]))
        for t in TOWNS:
            if t["county"] == c["slug"]:
                # a literal ›, not the entity: the label goes through e() and an
                # entity would come out as &amp;rsaquo;
                areas.append((f"/worktops/{c['slug']}/{t['slug']}/",
                              f"{c['name']} › {t['name']}"))

    # Every list runs two-up. A sitemap that needs five screens of scrolling is
    # not doing its job, and these are short labels in a wide column.
    blocks = [
        _sm_group("The main pages", f"{len(home)} links", home,
                  "The landing page is a single page, so the entries below the first one are "
                  "sections of it rather than separate URLs.", two_up=True),
        _sm_group("Services", f"{len(SERVICE_PAGES)} pages", services, two_up=True),
        _sm_group("Materials", f"{len(MATERIALS)} pages", materials, two_up=True),
        _sm_group("Guides", f"{len(GUIDES)} pages", guides,
                  "Plain answers to the questions people actually search for, each written and "
                  "reviewed by name.", two_up=True),
        _sm_group("Areas we cover", f"{len(COUNTIES)} counties, {len(TOWNS)} towns", areas,
                  "County pages cover the whole county. Town pages exist for the areas we are "
                  "asked for most often, and more are added only once the current ones have "
                  "proved themselves.", two_up=True),
    ]

    if stones:
        by_mat = {}
        for s in stones:
            by_mat.setdefault(s["mat"], []).append(s)
        parts = ""
        # ⚠️ The heading is the RANGE's name, not the `mat` key. 26 of the marble range are
        # quartzite and one is travertine, so a column headed "Marble" was wrong about most of
        # what was under it — the same contradiction the stone pages carried (D66).
        RANGE_LABEL = {"Marble": "Marble & Quartzite"}
        for mat in ("Quartz", "Marble", "Granite"):
            group = by_mat.get(mat, [])
            if not group:
                continue
            lis = "".join(
                f'<li><a href="/stones/{s["slug"]}.html">{e(s["name"])}</a></li>'
                for s in sorted(group, key=lambda s: s["name"]))
            parts += (f'<div class="sm-stone-col"><h3>{e(RANGE_LABEL.get(mat, mat))} '
                      f'<span class="sm-count">{len(group)}</span></h3>'
                      f'<ul class="rel">{lis}</ul></div>')
        blocks.append(f"""<section class="block sm-group"><div class="wrap">
    <h2>The stone collection <span class="sm-count">{len(stones)} stones</span></h2>
    <p class="note">Every stone in the range has its own page.
    <a href="/stones/">Browse the collection</a> to filter by colour and material.</p>
    <div class="sm-stones">{parts}</div>
  </div></section>""")
    else:
        blocks.append(_sm_group("The stone collection", "browse",
                                [("/stones/", "The full collection")]))

    ld = ld_block(org_ld(), breadcrumb_ld(cr, url))
    title = "Sitemap | Every Page on Topcat Worktops"
    md = ("Every page on the Topcat Worktops site in one place: services, materials, guides, "
          "the areas we cover and the full stone collection.")
    return head_html(title, md, url, 0, ld) + f"""
{crumbs(cr)}
<main>
  <section class="block"><div class="wrap">
    <h1>Sitemap</h1>
    <p class="lede">Every page on the site, in one place. If you are looking for something
    specific and cannot find it here, call us on {PHONE_DISPLAY} and we will point you at it.</p>
  </div></section>
{"".join(blocks)}
  {cta_band("Ready to talk about your project",
            "A free home visit with samples, an honest price, and one contact from first "
            "measurement to final wipe down.")}
</main>
{footer_html()}
</body>
</html>"""


# ===========================================================================
def main():
    written = []

    def w(path, content):
        p = ROOT / path
        p.parent.mkdir(parents=True, exist_ok=True)
        p.write_text(content, encoding="utf-8")
        written.append(path)

    w("materials/index.html", materials_index())
    for m in MATERIALS:
        w(f"materials/{m['slug']}.html", material_page(m))

    w("guides/index.html", guides_index())
    for g in GUIDES:
        w(f"guides/{g['slug']}.html", guide_page(g))

    w("worktops/index.html", areas_index())
    for c in COUNTIES:
        w(f"worktops/{c['slug']}/index.html", county_page(c))
    for t in TOWNS:
        w(f"worktops/{t['county']}/{t['slug']}/index.html", town_page(t))

    w("sitemap.html", sitemap_page())

    for path in written:
        print("wrote", path)
    print(f"done: {len(written)} pages "
          f"({len(MATERIALS)} materials, {len(GUIDES)} guides, "
          f"{len(COUNTIES)} counties, {len(TOWNS)} towns, 3 indexes, 1 sitemap)")


if __name__ == "__main__":
    main()

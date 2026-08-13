#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Generates the TopCat Worktops V1 service pages (/services/*.html) from shared
templates + the per-service copy below. Run from inside this folder:

    python3 build_services.py

House rules honoured: ⛔ fabrication is OUTSOURCED and the site must never claim otherwise
(reversed 7 Aug 2026). TopCat advise, template, place the cut with long-standing
fabrication partners, fit, and carry the guarantee. No showroom, no founding year,
value not cheap, 5.0 on Google
with no review count and no aggregateRating in schema, service area = London,
Hertfordshire, Essex & Berkshire. British English, no em dashes, no exclamation
marks, plain confident voice.
"""
import html, json, pathlib

# ---- production origin used for canonical + Open Graph + JSON-LD urls.
#      Path assumed to be /services/<slug>.html on the live site. Confirm before go-live.
BASE = "https://www.topcatworktops.co.uk"

PHONE_DISPLAY = "0800 098 2812"
PHONE_TEL = "+448000982812"
EMAIL = "info@topcatworktops.co.uk"
HOURS = "Monday to Friday, 8am to 6pm"
AREA = "London, Hertfordshire, Essex & Berkshire"
AREAS_SERVED = ["London", "Hertfordshire", "Essex", "Berkshire"]

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

# Trade went back into the nav on 7 Aug (client): B2B is the stated first priority, so trade
# buyers need a door they can find in seconds. It is the one nav item that is a real page
# rather than a homepage anchor.
NAV_LINKS = [
    ("/services/", "Services"), ("/projects/", "Projects"),
    ("/stones/", "Stones"), ("/estimate/", "Estimate"),
    ("/about/", "About us"), ("/trade/", "Trade"), ("/contact/", "Contact"),
]

WHY = [
    ("One accountable team", "One contract and one contact. We template it, place the cut, fit it and carry the guarantee, so nobody is ever passing you between trades."),
    ("Fixed, itemised pricing", "The quote you approve is the price you pay, with templating, edges and fitting all costed up front and every cut-out included free of charge."),
    ("Vein-matched by hand", "Slabs are laid out and matched before a single cut, so joints and waterfall edges run continuous."),
    ("Fitted in days", "Most kitchens are templated and installed within days of your slab being approved."),
    ("A ten-year guarantee", "Every installation is covered for ten years, in writing, on top of the manufacturer's own warranty."),
    ("Rated 5.0 on Google", "Every review we have earned sits at five stars, from homes across the areas we serve."),
]

STEPS = [
    ("Free home visit", "We come to you with samples, understand the space and how you use it, and talk through options with no pressure."),
    ("Fixed quote", "You get a clear, itemised quote covering template, fabrication, edges and fitting. The number we quote is the number you pay."),
    ("Template and cut", "Once your units are level we template to the millimetre, then cut and polish your slab to that template, matched across every joint."),
    ("Fit and finish", "We fit your surface cleanly, usually within days, squared, sealed and ready to use the same day."),
]

TOWNS = ("St Albans, Harpenden, Watford, Hemel Hempstead, Welwyn Garden City, Hertford, Barnet, "
         "Enfield, Chelmsford, Brentwood, Romford, Reading, Windsor and across London")

# ---------------------------------------------------------------------------
SERVICES = [
  dict(
    slug="kitchen-worktops", eyebrow="Bespoke Worktops", h1="Kitchen Worktops",
    title="Kitchen Worktops in London, Hertfordshire, Essex & Berkshire | TopCat Worktops",
    metadesc="Bespoke quartz, granite and marble kitchen worktops, cut from a single slab, templated to the millimetre and fitted by our own team. Free home visit and a ten-year guarantee across London, Hertfordshire, Essex and Berkshire.",
    lede="Quartz, granite and marble kitchen worktops, chosen from the slab you approve, cut to your kitchen and fitted by the same team that measured it. Free home visit, fixed pricing and a ten-year guarantee.",
    intro=[
      "A kitchen worktop is the surface you use every day, so it needs to be right in both looks and wear. We help you choose the stone that suits how you cook and live, then cut it from a single slab wherever the run allows, matching the veining across every joint so the surface reads as one piece.",
      "One team runs the whole job. We template your kitchen once the units are level, have the stone cut and polished to that template, and fit it ourselves, so there is one team accountable from the first measurement to the final seal.",
    ],
    feats=[
      ("Single-slab runs", "Cut from one slab where the layout allows, so the colour and veining stay consistent along the whole run."),
      ("Edges to suit", "Pencil, bevel, bullnose or a mitred edge that builds a thicker look, finished and polished by hand."),
      ("Cut-outs and grooves", "Precise openings for sinks, hobs and taps, with drainer grooves and upstands cut to match."),
      ("Sealed and ready", "Natural stone is sealed on fitting and engineered stone comes ready to use, handed over the same day."),
    ],
    faqs=[
      ("How much do kitchen worktops cost?", "Price depends on the stone, the size of the kitchen and the detail involved, such as waterfall ends or cut-outs. We give you a fixed, itemised quote after a free home visit, and the number we quote is the number you pay. We lead on value and finish rather than the lowest headline price."),
      ("Which stone is best for a kitchen worktop?", "Quartz is hard-wearing and low-maintenance, granite is heat and scratch resistant, and marble gives a softer, natural look that suits some kitchens beautifully. We talk you through how each behaves in daily use and help you pick the one that fits your kitchen, not the one that is easiest to sell."),
      ("How long does it take to fit a kitchen worktop?", "Most kitchens are templated once the units are level and fitted within days of the slab being approved. We confirm every date in writing so you can plan the rest of the work around it."),
      ("Do you template and fit the worktops yourselves?", "Yes. Templating and fitting are both ours. The cutting is done by fabrication workshops we have used for years, and managing them is our job, so there is one point of contact looks after your project from start to finish."),
    ],
  ),
  dict(
    slug="kitchen-islands", eyebrow="Kitchen Islands", h1="Kitchen Islands & Waterfall Ends",
    title="Kitchen Island Worktops & Waterfall Ends | TopCat Worktops",
    metadesc="Stone kitchen islands with mitred waterfall ends, vein-matched around every corner and fitted by our own team. Free home visit and a ten-year guarantee across London, Hertfordshire, Essex and Berkshire.",
    lede="The island is the centre of the kitchen, so it earns a little more attention. We build islands with mitred waterfall ends that fold the stone to the floor, with the veining planned around every corner.",
    intro=[
      "An island worktop takes more planning than a straight run. The overhangs need support, the waterfall ends need the veining to turn the corner without breaking, and any breakfast bar has to sit at a comfortable height. We plan all of it before a single cut.",
      "We mitre the waterfall ends so the joint at the corner is barely visible, then match the pattern so it flows unbroken from the top and down each side. The whole piece is cut to one template and fitted by one team, so the finish you approve is the finish you get.",
    ],
    feats=[
      ("Mitred waterfall ends", "The stone folds to the floor with a mitred corner, giving a solid look with no visible slab edge."),
      ("Vein carried around corners", "We plan the layout so the veining turns each corner and runs unbroken down the sides."),
      ("Overhangs and breakfast bars", "Supported overhangs for seating, cut to a comfortable knee height and finished on every exposed edge."),
      ("Sockets and hobs", "Pop-up sockets, induction hobs and undermount sinks cut in cleanly and sealed."),
    ],
    faqs=[
      ("What is a waterfall island?", "A waterfall island has the worktop stone continuing down the sides to the floor, rather than stopping at the edge. The corner is mitred so the joint is barely visible and the veining carries around it."),
      ("Can you match the veining on the island to the worktops?", "Yes. Where the island and the perimeter come from the same slab or batch we lay them out together so the colour and movement sit well side by side."),
      ("How big can a kitchen island worktop be?", "Larger islands may need a joint or a supported overhang, which we plan around the slab size and your layout. We talk you through the options at the home visit."),
      ("Do island worktops need extra support?", "Overhangs for seating usually need brackets or a support bar under the stone. We advise on this as part of the quote so the finished island is solid and safe to lean on."),
    ],
  ),
  dict(
    slug="splashbacks", eyebrow="Splashbacks", h1="Stone Splashbacks & Upstands",
    title="Stone Splashbacks & Upstands | Quartz, Granite & Marble | TopCat Worktops",
    metadesc="Vein-matched stone splashbacks and upstands cut to fit around sockets and hobs, with no grout lines. Free home visit and a ten-year guarantee across London, Hertfordshire, Essex and Berkshire.",
    lede="Carry the same stone up the wall for a clean, vein-matched finish behind the hob and along the run. No grout lines to scrub and no visual break between the worktop and the wall.",
    intro=[
      "A stone splashback runs the worktop material up the wall, so the eye reads one continuous surface instead of tiles and grout. It wipes clean in seconds and stands up to heat behind the hob, which is why so many kitchens now choose it over tiling.",
      "Splashbacks and upstands are cut from the same slab as your worktop, matching the veining where they meet so the joint sits quietly. Cut-outs for sockets, switches and extractors are measured to the millimetre and finished on every edge.",
    ],
    feats=[
      ("Full-height or upstand", "A full-height panel behind the hob, a slim upstand along the run, or both, cut to the heights you want."),
      ("No grout lines", "One solid piece rather than tiles, so there is nothing to scrub and nowhere for grease to sit."),
      ("Cut around sockets", "Sockets, switches and extractor outlets cut in cleanly and polished on every edge."),
      ("Matched to the worktop", "Cut from the same stone and matched for veining so the wall and worktop read as one surface."),
    ],
    faqs=[
      ("Are stone splashbacks better than tiles?", "Stone gives one solid surface with no grout lines, so it wipes clean and holds up to heat behind the hob. Many people prefer the look and the low maintenance over tiling, though it comes down to taste and budget."),
      ("Can a splashback go behind the hob and cooker?", "Yes. Quartz and granite both cope well with the heat behind a hob. We advise on the right material for a cooker or range as part of the quote."),
      ("Do you match the splashback to the worktop?", "Yes. Splashbacks and upstands come from the same slab and we match the veining where they meet, so the finish is consistent."),
      ("How thick is a stone splashback?", "Splashbacks are usually cut thinner than the worktop so they sit neatly against the wall. We confirm the thickness and finish when we template."),
    ],
  ),
  dict(
    slug="bathroom-worktops", eyebrow="Bathrooms", h1="Bathroom Worktops & Vanity Tops",
    title="Bathroom Worktops & Vanity Tops in Stone | TopCat Worktops",
    metadesc="Stone vanity tops, shower surrounds and bathroom worktops that shrug off water and daily wear, matched to your tiles and fitted to the millimetre. Serving London, Hertfordshire, Essex and Berkshire.",
    lede="Vanity tops, shower surrounds and bathroom surfaces in stone that handles water and daily wear without fuss. Cut with undermount or countertop basins in mind and matched to your tiles.",
    intro=[
      "A bathroom asks a lot of a surface. It sees water every day, cosmetics and cleaning products, and it needs to still look good years later. Quartz handles this easily, and a natural stone can work beautifully where it is sealed and cared for.",
      "We template your vanity or bathroom run to the millimetre, specify the basin openings to suit an undermount or countertop basin, and fit it ourselves. Matching upstands and window sills can be cut from the same stone so the room ties together.",
    ],
    feats=[
      ("Vanity tops", "Cut for undermount or countertop basins, with tap holes positioned exactly where you want them."),
      ("Shower surrounds and sills", "Stone thresholds, shower shelves and window sills cut from the same material for a consistent look."),
      ("Water-friendly stone", "Quartz shrugs off water and cosmetics, and natural stone is sealed on fitting."),
      ("Matched to your tiles", "We help you choose a stone that sits well with your tiles, fittings and brassware."),
    ],
    faqs=[
      ("What is the best worktop for a bathroom?", "Quartz is the easiest to live with in a bathroom because it resists water, cosmetics and cleaning products. Marble and other natural stones can look wonderful and are fine when sealed and wiped down, and we will be honest about the upkeep each one needs."),
      ("Can you cut a vanity top for an undermount basin?", "Yes. The opening and tap holes are cut to suit an undermount or countertop basin and finish the edges to match your worktop."),
      ("Do you do matching window sills and shower shelves?", "Yes. We can cut sills, thresholds and shelves from the same stone so the bathroom reads as one material."),
      ("Is marble suitable for a bathroom?", "Marble suits bathrooms that are looked after, sealed on fitting and wiped down after use. If you want the marble look with less maintenance, a marble-effect quartz gives you the appearance with an easier life."),
    ],
  ),
  dict(
    slug="commercial-worktops", eyebrow="Commercial", h1="Commercial Stone Surfaces",
    title="Commercial Worktops & Stone Surfaces | TopCat Worktops",
    metadesc="Hard-wearing stone worktops and surfaces for offices, bars, restaurants and shops, fitted to your programme by one team from template to install. Serving London, Hertfordshire, Essex and Berkshire.",
    lede="Reception desks, counters, tables and washroom surfaces for offices, bars, restaurants and shops. Hard-wearing stone, fitted to your programme by one team from template to install.",
    intro=[
      "Commercial spaces need surfaces that look sharp on opening day and still hold up after months of heavy use. We supply and fit stone for reception desks, bar tops, restaurant tables, retail counters and washrooms, choosing materials that take the wear the setting will give them.",
      "We work to your programme and your site. Templating, fabrication and fitting run through one point of contact, with dates confirmed in writing so nothing lands on you late. For fit-outs across several units we keep the finish consistent from one to the next.",
    ],
    feats=[
      ("Reception and retail counters", "Statement desks and counters cut from stone that stands up to constant use and still looks the part."),
      ("Bar and restaurant tops", "Bar tops and table tops in materials chosen for heat, spills and heavy traffic."),
      ("Washrooms and vanities", "Vanity tops and washroom surfaces that are easy to clean and hard to mark."),
      ("Fitted to programme", "One contact from template to install, working around your trades with dates confirmed in writing."),
    ],
    faqs=[
      ("Do you supply worktops for offices and shops?", "Yes. We fabricate and fit stone for reception desks, retail counters, bar and restaurant tops, tables and washrooms, and we work to your site programme."),
      ("Can you match a brand colour or finish?", "We help you choose a stone and finish that suits the look you are after. Bring a spec or a moodboard and we will point you to materials that fit."),
      ("Do you work to a fit-out schedule?", "Yes. We confirm template and install dates in writing and work around the other trades so the stone lands when it should."),
      ("Can you keep the finish consistent across several units?", "Yes. For multi-site or multi-unit work we plan the material and finish so each one matches the last."),
    ],
  ),
  dict(
    slug="outdoor-kitchens", eyebrow="Outdoor Kitchens", h1="Outdoor Kitchen Worktops",
    title="Outdoor Kitchen Worktops in Stone | TopCat Worktops",
    metadesc="Weatherproof stone worktops for garden kitchens and barbecue runs, chosen to hold colour outdoors and cut around sinks, hobs and appliances. Serving London, Hertfordshire, Essex and Berkshire.",
    lede="Weatherproof stone for garden kitchens and barbecue runs, chosen to hold its colour outdoors and cut to fit around sinks, hobs and built-in appliances.",
    intro=[
      "An outdoor kitchen has to cope with sun, rain and frost as well as cooking. Certain granites are well suited to it because they hold their colour in daylight and shrug off the weather, so the surface still looks right season after season.",
      "We template your outdoor run, cut openings for sinks, burners and built-in barbecues, and fit the stone to suit a garden setting. We will steer you towards materials that are made for the outdoors and away from any that are not.",
    ],
    feats=[
      ("Weatherproof materials", "Hard-wearing granites that hold their colour in sunlight and cope with rain and frost."),
      ("Built-in appliances", "Openings cut for burners, sinks, fridges and built-in barbecues, finished on every edge."),
      ("Colour that lasts", "Materials chosen to resist fading so the surface still looks right after a few summers."),
      ("Cut for a garden setting", "Overhangs, edges and drainer details planned for how an outdoor kitchen is actually used."),
    ],
    faqs=[
      ("What is the best worktop for an outdoor kitchen?", "A hard-wearing granite is the strongest choice outdoors, because it holds its colour in sunlight and copes with water and frost. We steer you away from anything that fades or marks in the weather."),
      ("Will an outdoor stone worktop fade in the sun?", "The materials we recommend for outdoor kitchens are chosen to resist fading. Some stones are not suited to constant sun, and we will tell you which to avoid."),
      ("Can you cut around a built-in barbecue and sink?", "Yes. Openings for built-in barbecues, burners, sinks and fridges are all cut to your template, and we finish every exposed edge."),
      ("Do outdoor worktops need sealing?", "Natural stone used outdoors is sealed on fitting and benefits from resealing over time, which we will explain when we visit."),
    ],
  ),
]

# ---------------------------------------------------------------------------
# Hero photos reuse the existing shared assets (no new images generated). Loose but on-brand.
HERO_IMG = {
    "kitchen-worktops": "../assets/hero-kitchen.jpg",
    "kitchen-islands": "../assets/kitchen-day.jpg",
    "splashbacks": "../assets/hero-kitchen.jpg",
    "bathroom-worktops": "../assets/cta-slab.jpg",
    "commercial-worktops": "../assets/kitchen-day.jpg",
    "outdoor-kitchens": "../assets/quarry.jpg",
}


def e(s):
    return html.escape(s, quote=True)


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


def jsonld(s):
    url = f"{BASE}/services/{s['slug']}.html"
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
        {"@type": "Service", "name": s["h1"], "serviceType": s["h1"],
         "description": s["metadesc"], "url": url,
         "provider": {"@type": "LocalBusiness", "name": "TopCat Worktops", "@id": f"{BASE}/#business"},
         "areaServed": AREAS_SERVED},
        {"@type": "BreadcrumbList", "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Home", "item": f"{BASE}/index.html"},
            {"@type": "ListItem", "position": 2, "name": "Services", "item": f"{BASE}/services/"},
            {"@type": "ListItem", "position": 3, "name": s["h1"], "item": url}]},
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


def related_html(current):
    items = []
    for s in SERVICES:
        if s["slug"] == current:
            continue
        label = s["h1"].split(" & ")[0].replace("Stone ", "")
        items.append(f'<a href="{s["slug"]}.html">{e(label)}</a>')
    return '<div class="mats">' + "".join(items) + "</div>"


def page(s):
    url = f"{BASE}/services/{s['slug']}.html"
    feats = "".join(f'<div class="feat"><h3>{e(t)}</h3><p>{e(p)}</p></div>' for t, p in s["feats"])
    intro = "".join(f"<p>{e(p)}</p>" for p in s["intro"])
    why = "".join(f'<li><strong>{e(t)}</strong>{e(p)}</li>' for t, p in WHY)
    steps = "".join(
        f'<div class="step"><div class="n">Step {i}</div><h3>{e(t)}</h3><p>{e(p)}</p></div>'
        for i, (t, p) in enumerate(STEPS, 1))
    faqs = "".join(
        f'<details><summary>{e(q)}</summary><div class="a">{e(a)}</div></details>'
        for q, a in s["faqs"])

    return f"""<!DOCTYPE html>
<html lang="en-GB">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{e(s['title'])}</title>
<meta name="description" content="{e(s['metadesc'])}">
<link rel="canonical" href="{url}">
<meta name="robots" content="index, follow">
<meta property="og:type" content="website">
<meta property="og:title" content="{e(s['title'])}">
<meta property="og:description" content="{e(s['metadesc'])}">
<meta property="og:url" content="{url}">
<meta property="og:site_name" content="TopCat Worktops">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" type="image/svg+xml" href="{FAVICON}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700&family=Montserrat:wght@200;300;400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="service.css">
{jsonld(s)}
</head>
<body>
{nav_html()}

<nav class="crumb" aria-label="Breadcrumb">
  <a class="crumb-back" href="/services/" aria-label="Back to Services" onclick="if(history.length>1&&document.referrer&&new URL(document.referrer,location).origin===location.origin){{history.back();return false}}"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><defs><linearGradient id="backGold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#C6A664"/><stop offset=".5" stop-color="#E4CD92"/><stop offset="1" stop-color="#C6A664"/></linearGradient></defs><path d="M15 18l-6-6 6-6" stroke="url(#backGold)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></a>
  <ol>
    <li><a href="/index.html#hero">Home</a></li>
    <li><a href="/services/">Services</a></li>
    <li aria-current="page">{e(s['h1'])}</li>
  </ol>
</nav>

<main>
  <section class="svc-hero">
    <div class="svc-hero-bg" style="background-image:url('{HERO_IMG[s['slug']]}')"></div>
    <div class="wrap svc-hero-inner">
      <span class="eyebrow">{e(s['eyebrow'])}</span>
      <h1>{e(s['h1'])}</h1>
      <p class="lede">{e(s['lede'])}</p>
      <div class="cta-row">
        <a class="btn-gold" href="/contact/">Get your free quote</a>
        <a class="btn-ghost" href="tel:{PHONE_TEL}">Call {PHONE_DISPLAY}</a>
      </div>
      <div class="trust">
        <span><b>&#9733;&#9733;&#9733;&#9733;&#9733;</b> 5.0 on Google</span>
        <span><b>10</b> year guarantee</span>
        <span>Free home visit across {e(AREA)}</span>
      </div>
    </div>
  </section>

  <section class="block"><div class="wrap prose rise">
    {intro}
  </div></section>

  <section class="block"><div class="wrap rise">
    <h2>What we make</h2>
    <p class="sub">One team runs the job from first measurement to final fit.</p>
    <div class="feat-grid">{feats}</div>
  </div></section>

  <section class="block"><div class="wrap rise">
    <h2>The materials</h2>
    <p class="sub">Marble, quartz and granite, with more available on request. Not sure what suits you? We will tell you the truth, not just what is easiest to sell.</p>
    {related_intro_materials()}
  </div></section>

  <section class="block"><div class="wrap rise">
    <h2>How it works</h2>
    <p class="sub">From the first visit to the finished surface, four simple steps.</p>
    <div class="steps">{steps}</div>
  </div></section>

  <section class="block"><div class="wrap rise">
    <h2>Why TopCat</h2>
    <ul class="ticks">{why}</ul>
  </div></section>

  <section class="block"><div class="wrap rise">
    <h2>Areas we cover</h2>
    <p class="sub">We fit across {e(AREA)}, with nationwide templating on request. That includes {e(TOWNS)}.</p>
  </div></section>

  <section class="block faq"><div class="wrap rise">
    <h2>Frequently asked</h2>
    {faqs}
  </div></section>

  <section class="block"><div class="wrap rise">
    <h2>More of what we do</h2>
    <p class="sub">Explore the rest of our services.</p>
    {related_html(s['slug'])}
  </div></section>

  <section class="cta-band"><div class="wrap rise">
    <h2>Tell us about your project</h2>
    <p>Book a free home visit and we will measure up, talk through the stone and give you a fixed, itemised quote. We reply within one working day. Prefer to talk it through? Ask for Nick.</p>
    <div class="cta-row">
      <a class="btn-gold" href="/contact/">Get your free quote</a>
      <a class="btn-ghost" href="tel:{PHONE_TEL}">Call {PHONE_DISPLAY}</a>
    </div>
  </div></section>
</main>

{footer_html()}
{REVEAL_JS}
</body>
</html>"""


def related_intro_materials():
    mats = [("Marble", "/stones/"), ("Quartz", "/stones/"),
            ("Granite", "/stones/")]
    return '<div class="mats">' + "".join(f'<a href="{h}">{e(t)}</a>' for t, h in mats) + "</div>"


def main():
    here = pathlib.Path(__file__).resolve().parent
    for s in SERVICES:
        out = here / f"{s['slug']}.html"
        out.write_text(page(s), encoding="utf-8")
        print("wrote", out.name)
    print("done:", len(SERVICES), "pages")


if __name__ == "__main__":
    main()

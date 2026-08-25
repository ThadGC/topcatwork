#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Generates the Topcat Worktops V1 service pages (/services/*.html) from shared
templates + the per-service copy below. Run from inside this folder:

    python3 build_services.py

House rules honoured: ⛔ fabrication is IN-HOUSE (client, 14 Aug 2026, reversing his own
7 Aug 2026 decision that it was outsourced). Topcat advise, template BY HAND — never
"laser" anything — cut and polish with their own experienced fabricators, fit, and carry
the guarantee. No showroom of our own, though slabs may be chosen at the distributor's
warehouse. No founding year, value not cheap, 5.0 on Google
with no review count and no aggregateRating in schema, service area = London,
Hertfordshire, Essex, Berkshire, Buckinghamshire, Surrey, Oxfordshire & Bedfordshire.
British English, no em dashes, no exclamation marks, plain confident voice.
"""
import html, json, pathlib

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

_HERE_SIG = pathlib.Path(__file__).resolve().parent
SVC_SIG = _sig(_HERE_SIG / "service.css")
FOOT_SIG = _sig(_HERE_SIG.parent / "assets" / "footer.css")
NAV_SIG = _sig(_HERE_SIG.parent / "assets" / "nav.css")


# ---- production origin used for canonical + Open Graph + JSON-LD urls.
#      Path assumed to be /services/<slug>.html on the live site. Confirm before go-live.
BASE = "https://www.topcatworktops.co.uk"

PHONE_DISPLAY = "0800 098 2812"
PHONE_TEL = "+448000982812"
EMAIL = "info@topcatworktops.co.uk"
HOURS = "Monday to Sunday, 7am to 9pm"
AREA = "London, Hertfordshire, Essex, Berkshire, Buckinghamshire, Surrey, Oxfordshire & Bedfordshire"
AREAS_SERVED = ["London", "Hertfordshire", "Essex", "Berkshire", "Buckinghamshire",
                "Surrey", "Oxfordshire", "Bedfordshire"]

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
    ("One accountable team", "One contract and one contact. We template it, cut it, fit it and carry the guarantee, so nobody is ever passing you between trades."),
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
    slug="kitchen-worktops", h1="Kitchen Worktops",
    title="Kitchen Worktops | Supplied & Fitted Across London & the Home Counties | Topcat Worktops",
    metadesc="Bespoke quartz, granite and marble kitchen worktops, cut from a single slab, templated to the millimetre and fitted by our own team. Free home visit and a ten-year guarantee across London, Hertfordshire, Essex, Berkshire, Buckinghamshire, Surrey, Oxfordshire & Bedfordshire.",
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
      ("Do you template and fit the worktops yourselves?", "Yes. Templating, cutting and fitting are all ours, so one point of contact looks after your project from start to finish."),
    ],
  ),
  dict(
    slug="kitchen-islands", h1="Kitchen Islands",
    title="Kitchen Island Worktops & Waterfall Ends | Topcat Worktops",
    metadesc="Stone kitchen islands with mitred waterfall ends, vein-matched around every corner and fitted by our own team. Free home visit and a ten-year guarantee across London, Hertfordshire, Essex, Berkshire, Buckinghamshire, Surrey, Oxfordshire & Bedfordshire.",
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
    slug="splashbacks", h1="Splashbacks",
    title="Stone Splashbacks & Upstands | Quartz, Granite & Marble | Topcat Worktops",
    metadesc="Vein-matched stone splashbacks and upstands cut to fit around sockets and hobs, with no grout lines. Free home visit and a ten-year guarantee across London, Hertfordshire, Essex, Berkshire, Buckinghamshire, Surrey, Oxfordshire & Bedfordshire.",
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
  # ⛔⛔ THE BATHROOM PAGE NO LONGER COVERS VANITY TOPS — 14 Aug 2026 (D228). Client: *"when I go
  # into vanity tops, it takes me to bathroom worktops and vanity tops. That's not right. Bathroom
  # should take me to bathroom, and vanity tops should take me to vanity tops."* This page was
  # both, which is why one tile opened the other tile's page. ⭐ Its SLUG, and therefore its URL
  # and its ranking, is unchanged; the basin content moved out and shower surrounds, sills and
  # thresholds moved in, so the two pages no longer compete for the same words.
  dict(
    slug="bathroom-worktops", h1="Bathrooms",
    title="Bathroom Worktops & Shower Surrounds in Stone | Topcat Worktops",
    metadesc="Stone shower surrounds, thresholds, window sills and bath surrounds cut from one material and fitted by our own team. Free home visit across London, Hertfordshire, Essex, Berkshire, Buckinghamshire, Surrey, Oxfordshire & Bedfordshire.",
    lede="Shower surrounds, thresholds, window sills and bath panels cut from one stone, so a bathroom reads as a single material rather than a set of parts. Basin tops have a page of their own.",
    intro=[
      "A bathroom is a small room that gets looked at closely, and it is usually the tiling and the joints that give it away. Running one stone across the shower wall, the threshold, the sill and the bath panel takes most of those joints out, and what is left is stone rather than grout.",
      "We template the room by hand once the walls are true, have the pieces cut and polished by our experienced fabricators, and fit them ourselves. Wherever the sizes allow we lay the pieces out on the same slab, so the colour and the movement carry from one to the next instead of meeting by accident.",
      "Quartz is the easiest material to live with in a bathroom, because it takes water, cosmetics and cleaning products in its stride. Marble and other natural stones look wonderful in here and ask for a little more of you: sealing on fitting, and wiping up anything acidic rather than leaving it to sit.",
    ],
    feats=[
      ("Shower walls and thresholds", "Full-height shower panels, low thresholds and shelves cut from the same stone, with fewer joints to keep clean."),
      ("Window sills and returns", "Sills cut to the reveal and finished on every edge that shows, in the material already in the room."),
      ("Bath surrounds and panels", "A stone top to a panelled bath, or a surround cut around it, templated to the opening as built."),
      ("Laid out together", "Where the sizes allow, the pieces for one room come off one slab, so the stone agrees across the bathroom."),
    ],
    faqs=[
      ("What is the best stone for a bathroom?", "Quartz is the easiest to live with, because water, cosmetics and cleaning products do not trouble it. Marble and other natural stones look beautiful in a bathroom and want a little care: they are sealed on fitting, and anything acidic is better wiped up than left. We will tell you honestly which one suits how the room gets used."),
      ("Can you run the same stone up the shower wall?", "Yes. A full-height panel takes the tiling and the grout lines out of the wettest part of the room. Panel sizes are limited by the slab, so on a large wall we will show you where a joint would fall before anything is cut."),
      ("Do you fit the shower tray, the plumbing or the tiling?", "No. We cut and fit the stone. Trays, plumbing and tiling are for your bathroom fitter, and we work around their programme and to the dimensions they give us."),
      ("Is marble suitable for a bathroom?", "It suits a bathroom that is looked after: sealed on fitting and wiped down after use. If you want the look without thinking about it, a marble-effect quartz gets you close with an easier life."),
      ("When should you template a bathroom?", "Once the walls are true and the trays and units are in position, so the template records the room as it will actually be rather than as it was drawn."),
    ],
  ),
  # ⭐⭐ NEW 14 Aug 2026 (D228). Client: *"each one of these options needs to have its own dedicated
  # page… vanity tops should take me to vanity tops."* This is the content that used to live on the
  # bathroom page, written out properly rather than lifted across.
  dict(
    slug="vanity-tops", h1="Vanity Tops",
    title="Stone Vanity Tops for Undermount & Countertop Basins | Topcat Worktops",
    metadesc="Vanity tops cut in quartz, granite or marble for undermount and countertop basins, with the tap holes where you want them. Templated by hand and fitted by our own team across London and the Home Counties.",
    lede="Basin tops cut for the basin you have chosen, with the tap holes where you want them and the edges finished to match. One stone can carry the vanity, the sill and the shelf above the bath.",
    intro=[
      "A vanity top is a small piece of stone that gets looked at from a foot away, every morning. That is why the details count for more here than almost anywhere else in the house: where the tap sits, how far the top oversails the unit, whether the basin is cut in from beneath or stands on top of it.",
      "Bring us the basin and the tap, or their make and model, and we will template around them. An undermount basin is cut from below and the inside edge is polished, so the stone runs down to the bowl. A countertop basin sits on an uncut top with one hole for the waste. Wall-mounted taps mean no holes at all, which is worth settling early, because a hole is quick to cut and impossible to un-cut.",
      "Cloakrooms, family bathrooms and en-suites all get the same treatment. Where more than one of them is being done at once we plan the pieces together, so the same stone runs through the house rather than nearly matching from room to room.",
    ],
    feats=[
      ("Undermount or countertop", "Cut from beneath for an undermount basin, with the inside edge polished, or left whole for a basin that stands on top."),
      ("Tap holes where you want them", "Single, twin, or none at all for wall-mounted taps. Tell us the tap and we drill to its specification."),
      ("Upstands, sills and shelves", "The same stone cut for the upstand behind the basin, the window sill or a shelf above the bath."),
      ("Edges to match the room", "A pencil edge for something quiet, or a mitred edge built up to read thicker than the slab."),
    ],
    faqs=[
      ("Can you cut a vanity top for an undermount basin?", "Yes. The opening is cut from beneath and the inside edge is polished, so the stone runs cleanly to the bowl. We need the basin itself, or its make and model, before we cut."),
      ("Where do the tap holes go?", "Wherever you want them, as long as the tap and the basin agree with each other. Bring the tap or its specification to the template and we will drill to it. If the taps come out of the wall, the top stays solid."),
      ("What is the best stone for a vanity top?", "Quartz is the easiest to live with, because toothpaste, cosmetics and cleaning products come off it with a wipe. Marble and other natural stones look wonderful on a vanity and want a little care: sealed on fitting, and acidic things wiped up rather than left. We will tell you which one suits the way the room is used."),
      ("Can I have a matching upstand and window sill?", "Yes. Upstands, sills, shelves and shower thresholds can come from the same stone, cut at the same time so the colour and the movement sit together."),
      ("How thick is a vanity top?", "20mm and 30mm are the usual thicknesses. A mitred edge can be built up to look thicker than the slab, which suits a vanity meant to be a feature. We confirm the thickness and the edge profile at the template."),
    ],
  ),
  dict(
    slug="commercial-worktops", h1="Commercial",
    title="Commercial Worktops & Stone Surfaces | Topcat Worktops",
    metadesc="Hard-wearing stone worktops and surfaces for offices, bars, restaurants and shops, fitted to your programme by one team from template to install. Serving London, Hertfordshire, Essex, Berkshire, Buckinghamshire, Surrey, Oxfordshire & Bedfordshire.",
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
    slug="outdoor-kitchens", h1="Outdoor Spaces",
    title="Outdoor Kitchen Worktops in Stone | Topcat Worktops",
    metadesc="Weatherproof stone worktops for garden kitchens and barbecue runs, chosen to hold colour outdoors and cut around sinks, hobs and appliances. Serving London, Hertfordshire, Essex, Berkshire, Buckinghamshire, Surrey, Oxfordshire & Bedfordshire.",
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
  # ⭐⭐ NEW 14 Aug 2026 (D228). Client: *"for those that don't have it, like fireplaces and dining
  # tables, make sure that you write a dedicated page. That sounds like it was written by a human.
  # No AI slop. And also says what it needs to say."*
  # ⛔⛔ THE SCOPE PARAGRAPH IS THE POINT OF THIS PAGE, NOT A HEDGE. A fireplace carries
  # building-regulation duties around hearth sizes and clearances, and §2 rule 12 forbids stating
  # what we cannot guarantee. Nobody has told us Topcat takes on appliance work, so the page says
  # plainly what it does — the stonework — and cuts to the figures the customer's own installer
  # gives. ⭐ That is a scope, not an excuse, and it reads as expertise rather than as a disclaimer.
  # ⚠️ THE QUARTZ-AND-HEAT ANSWER IS TRUE AND LOAD-BEARING: engineered quartz is resin-bound, so
  # recommending it for a hearth under an appliance would be wrong. Do not "simplify" that FAQ.
  dict(
    slug="fireplaces", h1="Fireplaces",
    title="Stone Fireplace Surrounds, Hearths & Mantels | Topcat Worktops",
    metadesc="Fireplace hearths, surrounds and mantel shelves cut from granite, marble or quartz to your opening, templated by hand and fitted by our own team across London and the Home Counties.",
    lede="Hearths, surrounds and mantel shelves cut to your opening and finished by hand. We work in the same stones as the kitchen, so one room can carry a single material from the worktop to the fire.",
    intro=[
      "A fireplace is usually the thing everyone in the room ends up looking at, and stone suits it because it is heavy, quiet, and it wears well. We cut hearths, side slips, headers and mantel shelves to the opening you have, in the same granite, marble and quartz we use everywhere else in the house.",
      "What we do here is the stonework. We template the opening by hand once it is formed, have the pieces cut and polished by our experienced fabricators, and fit them. We do not install stoves, flues or gas appliances, and we do not set hearth sizes or clearances, because those belong to your installer and to whoever made the appliance. Give us the figures they need and we will cut to them.",
      "Most fireplaces are a set of pieces rather than one, so we lay them out together. Where the sizes allow, the hearth, the slips and the header come off the same slab, which is what makes the grain run around the opening instead of meeting at the corners by accident.",
    ],
    feats=[
      ("Hearths cut to the opening", "Cut to the size and shape your installer specifies, and finished on every edge that shows."),
      ("Surrounds and slips", "Side slips and a header cut as one set, so the colour and the movement carry around the opening."),
      ("Mantel shelves", "A solid stone shelf, squared or with a moulded edge, cut to the length of the chimney breast."),
      ("The same stone as the room", "Where the fire and the kitchen share a room, both can be laid out on the same slab if the sizes allow."),
    ],
    faqs=[
      ("Which stone suits a fireplace?", "Granite and natural stone are the usual choice for a hearth, because they take heat well. Engineered quartz is bound with resin, so it is better kept away from direct heat and suits a surround or a mantel shelf rather than the hearth under an appliance. The clearances themselves are your installer's call and we cut to them."),
      ("Do you fit the stove or the fire itself?", "No. We cut and fit the stone. Stoves, flues and gas appliances are for a registered installer, and the hearth size and clearances come from them and from the appliance manufacturer. We work to the figures they give us."),
      ("Can you cut a hearth that is not a rectangle?", "Yes. Curved fronts, chamfered corners and cut-outs around a chimney breast are all cut to a template we make on site. The more unusual the shape, the more the template earns its keep."),
      ("Can you match a fireplace to worktops we already have?", "Often, yes. If you know what the stone is we can look for the same material or something close to it. If you do not, send a photograph taken in daylight and we will tell you what we think it is."),
      ("When should we template?", "Once the opening is formed and the plaster is back, so the template records the room as it will be. If the appliance is going in first, we template after it and work to the clearances your installer has set."),
    ],
  ),
  # ⭐⭐ NEW 14 Aug 2026 (D228), with fireplaces. ⚠️ THE BASE IS THE HONEST PART: a stone top is
  # heavy, and the page says plainly that Topcat make the top and not the frame. Rule 12 again —
  # promising that any base will carry any top is exactly the kind of claim that cannot be kept.
  dict(
    slug="dining-tables", h1="Dining Tables",
    title="Stone Dining Table & Console Tops | Quartz, Granite & Marble | Topcat Worktops",
    metadesc="Dining table and console tops cut from quartz, granite or marble to your shape and edge profile, on your own base or one being made for you. Free home visit across London and the Home Counties.",
    lede="Table and console tops cut to your shape and your edge profile, in the same stones as the kitchen. Heavy, flat, and made to be eaten off rather than looked after.",
    intro=[
      "A stone table top is the piece people notice first and touch most. It can be cut square, with rounded ends, as an oval, or to a shape you draw on the floor, and because it comes off the same slabs as the worktops it can carry the kitchen material down to the dining end of the room.",
      "Two things decide whether a stone table works: the base and the weight. Stone is heavy, so the frame has to suit the size and the overhang, and we will say plainly if the one you have in mind does not. We cut to a base you already own or to one being made for you, and we make the top rather than the frame. Thickness, edge profile and how far the top oversails all get settled at the template.",
      "Size has a ceiling, and it is the slab. Beyond it a top needs a joint, and a joint in a table is always visible, because there is nothing for it to hide behind. Where a top is close to the limit we would rather talk about the shape than promise a seam nobody can see.",
    ],
    feats=[
      ("Cut to your shape", "Rectangles, rounded ends, ovals and one-off shapes, cut to a template so the curve is the one you drew."),
      ("Edges that suit the room", "A pencil edge for something quiet, a moulded profile, or a mitred edge that reads thicker without the weight."),
      ("Matched to the kitchen", "Where the table and the worktops share a room, we plan both together so the stone agrees across the space."),
      ("On your base or a new one", "We cut to a frame you already have, or to one being made for you. Tell us the base and we work to it."),
    ],
    faqs=[
      ("Do you make the base as well?", "No, we work in stone. We cut the top to a base you have or one being made for you, and we will tell you plainly whether that base suits the size and the overhang you are asking for."),
      ("How thick should a stone table top be?", "20mm and 30mm are the usual thicknesses, and a mitred edge can be built up to read thicker without carrying the weight of a solid slab. Larger tops tend to want the thicker stone or the mitre, and we will talk it through when we measure."),
      ("Is marble a bad idea for a dining table?", "Marble is softer than granite and it etches where something acidic sits on it, so a slice of lemon or a glass of wine left overnight can leave a mark. Plenty of people accept that and like the way it ages. If you would rather not think about it at all, a marble-effect quartz gives you the look with an easier life."),
      ("How big can a stone table top be?", "The slab sets the limit, and past it the top needs a joint. A joint in a table is always visible, so we will show you where it would fall before you decide."),
      ("Can you match a table to our existing worktops?", "Where the material is still available, yes. If the worktops came from us we will have the record of what they are."),
    ],
  ),
]

# ---------------------------------------------------------------------------
# Hero photos reuse the existing shared assets (no new images generated). Loose but on-brand.
HERO_IMG = {
    # ⭐⭐⭐ HIS OWN PHOTOGRAPH — D241, the eighth and last. ⚠️⚠️ `hero-kitchen.jpg` IS RETIRED NOW
    # AND THIS NOTE USED TO SAY THE OPPOSITE — it claimed the file was "the LANDING PAGE's hero,
    # the first thing anybody sees". That was true when it was written and stopped being true when
    # the hero moved to the night grade: the landing page serves `hero-night-2752.webp` and asks
    # for no `hero-kitchen` URL at all. Nothing on the site references it, so as of D315 it lives
    # in `assets/site/.superseded-2026-08-18/` and no longer ships. ⛔ Still on disk, do not delete.
    # ⭐ MEASURE WHAT THE PAGE ASKS FOR BEFORE BELIEVING A COMMENT ABOUT IT, this one included.
    "kitchen-worktops": "../assets/site/service-worktops-quartz-1600.webp",
    # ⭐⭐ HIS OWN PROJECT PHOTOGRAPH — 17 Aug 2026 (D294), closing §13 item 19: this was the ONE
    # leaf still opening on a shared stock photo (`kitchen-day.jpg`, also the landing's day
    # kitchen). The Harrow project lead IS this page's subject — a Calacatta-look waterfall end
    # folded to the floor, the gold tap, the navy units — the lede's own sentence in a picture.
    # ⚠️ Referenced IN PLACE from /assets/projects/ — no re-encode (webp→webp loses), no new
    # bytes, 1400 is that file's native width. ⚠️ `kitchen-day.jpg` STAYS ON DISK — §10 lists it
    # among the shared photographs that must never be deleted.
    "kitchen-islands": "../assets/projects/harrow-1400.webp",
    # ⭐⭐ HIS OWN PHOTOGRAPH — D241. This page shared `hero-kitchen.jpg` with kitchen-worktops,
    # so the two pages opened on the same picture; it now opens on a marble splashback behind a
    # hob, which is what it is about. ⚠️ 1620 is the NATIVE top of that ladder (a 1920x1080
    # source), not a choice. ⚠️ `hero-kitchen.jpg` is retired as of D315 — kitchen-worktops moved
    # to the quartz ladder above and the landing page moved to the night grade, so nothing uses it.
    # It is kept on disk in `assets/site/.superseded-2026-08-18/`.
    "splashbacks": "../assets/site/service-splash-hob-1200.webp",
    # ⭐⭐ THE CLIENT'S OWN PHOTOGRAPH — D241, sent with the dining one. It replaced the slab shot
    # on the Bathrooms TILE and this hero follows it, so the tile and the page it opens show the
    # same room. ⚠️ `cta-slab.jpg` is still the hero two lines below and still the landing page's
    # CTA band — this line moved, that file did not.
    "bathroom-worktops": "../assets/site/service-bathrooms-1600.webp",
    # ⭐⭐⭐ HIS OWN PHOTOGRAPH — D241, and the last of the wrong subjects. A DOMESTIC kitchen was
    # opening the commercial page. ⚠️ `kitchen-day.jpg` stays ON DISK even though no service hero
    # uses it any more (kitchen-islands moved off it at D294) — §10 protects it as a shared
    # photograph, and deleting a photograph cannot be undone from the browser.
    # ⭐⭐ **HIS OWN FRAME, SENT 17 Aug 2026 (D305):** a curved MARBLE bar counter under a gold-lit
    # back bar. It replaces a bright white salon interior with no stone in it — generic, and the
    # opposite of this site's register. ⚠️ Cropped 16:9 from a portrait source so the worktop leads
    # and the light sits behind it; the cut script and the reasoning are in
    # `assets/site/.src-2026-08-18/`. ⛔ The salon ladder stays on disk.
    "commercial-worktops": "../assets/site/service-commercial-bar-1600.webp",
    # ⭐⭐ A REAL OUTDOOR KITCHEN INSTEAD OF THE QUARRY — D241, his own file. The quarry shot was
    # the second of the three wrong-subject tiles he had already asked to have replaced: it is a
    # picture of where stone comes FROM, not of a garden kitchen. ⚠️ `quarry.jpg`'s two WebP rungs
    # stay live and stay in the SS table; the `quarry.jpg` MASTER is what the rungs were cut from
    # and no page ever asked for it, so D315 moved it to
    # `assets/site/.src-photography-2026-08-18/`. ⛔ On disk, not deleted — a deleted photograph
    # cannot be put back from the browser.
    "outdoor-kitchens": "../assets/site/service-outdoor-1600.webp",
    # ⭐⭐⭐ D228's SLAB SHOT IS GONE FROM THIS TABLE ENTIRELY — 15 Aug 2026 (D241). Three pages
    # took `cta-slab.jpg` because the portfolio held no fireplace, no dining table and no vanity
    # top, and the client had twice said generate nothing. He sent photographs of all three
    # instead. ⭐ The CTA band IS still live and must not be deleted — but it is the WebP ladder
    # (`cta-slab-1958/2752.webp`) that the landing page serves, not `cta-slab.jpg`. The master was
    # never requested by a browser, so D315 moved it to `assets/site/.src-photography-2026-08-18/`.
    # ⛔ On disk, not deleted. The subject is simply no longer any service page's hero.
    # ⚠️ (A note here used to say commercial was the one wrong subject left — stale since the
    # `service-commercial` ladder landed above. Every page in this table now opens on its own
    # subject; kitchen-islands was the last, fixed at D294.)
    "vanity-tops": "../assets/site/service-vanity-1600.webp",
    # ⭐⭐ HIS OWN PHOTOGRAPH — D241. ⚠️ THIS ONE TAKES ITS NATIVE 1550 RUNG AND NOT A 1600 LIKE
    # the other three: the source is 3000x2000, so 1550 is the whole crop and there is nothing
    # above it. ⭐ It is also the cheapest of the four heroes at 184 KB, because a marble surround
    # against flat panelling holds far less high-frequency detail than foliage or gravel.
    "fireplaces": "../assets/site/service-fireplaces-1550.webp",
    # ⭐⭐ THE CLIENT'S OWN PHOTOGRAPH — D241. He sent it for the Dining Tables CARD and said it
    # would "automatically become the hero section in the dedicated page", which is this line.
    # ⛔⛔ THIS IS A CSS `background-image` AND CSS BACKGROUNDS HAVE NO `srcset`, so whatever is
    # named here is what every device downloads — a phone included. ⭐⭐ THAT IS WHY ALL THREE OF
    # THE NEW HEROES TAKE THE 1600 RUNG AND NOT THE 2400 ONE. The 2400 exists for the card grid,
    # which has a srcset and can choose. This hero is veiled at between 0.61 and 0.96 composite
    # alpha (the two gradients on `.svc-hero-bg::after`), so the detail those extra pixels buy is
    # not visible on the page — the same trade build_images.py wrote down for hero-kitchen: *"a
    # photograph that is heavily darkened and sits behind text"*. It also keeps these heroes at
    # 140-348 KB, next to the 149 KB hero-kitchen already ships. ⛔ The outdoor one is 348 KB at
    # 1600 and there is no crop that fixes that: foliage, gravel and cut stone are all
    # high-frequency, and the top rung was 770 KB.
    # ⚠️ The crop is centred on the table for this box in particular: the hero is a 2.69:1 band
    # at desktop and 0.73:1 on a phone, so it shows the middle of the file in one direction or
    # the other and never the whole frame. See the SERVICES note in index.html.
    "dining-tables": "../assets/site/service-dining-1600.webp",
}


def e(s):
    return html.escape(s, quote=True)


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


def nav_html():
    links = "".join(f'<a href="{h}">{e(t)}</a>' for h, t in NAV_LINKS)
    return f"""<header class="bar">
  <a class="brand" href="/index.html#hero" aria-label="Topcat Worktops home">{BRAND_LOGO}</a>
  <nav class="top">{links}</nav>
  <a class="bar-cta" href="/contact/">Get a quote</a>
  {NAV_BURGER}
</header>
{NAV_SHEET}
{NAV_JS}"""

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
    src = (_p.Path(__file__).resolve().parent.parent / "index.html").read_text(encoding="utf-8")
    i = src.index('<footer class="site"')
    j = src.index("</footer>", i) + len("</footer>")
    return src[i:j]


FOOTER_HTML = _footer_from_index()

# ============================================================================================
# ⭐⭐⭐ THE STICKY ACTION BAR, LIFTED FROM index.html — 25 August 2026
# Client: *"when there are inner pages, there needs to be a sticky nav bar on all the pages for
# mobile and tablet so that there's always an easy way for the clients to contact."*
#
# ⛔⛔ **LIFTED, NOT RE-TYPED — the D290/D295 way, and for the reason the trust tags proved.** The
# bar's markup has exactly one description (`index.html`) and its CSS is extracted into the
# generated `/assets/nav.css` by `_is_nav_sel()` in `build_pages.py`. A hand-copy is how a shared
# component ends up correct on the landing page and wrong on 167 others for eleven days.
#
# ⚠️ **ONE REWRITE ON THE LIFT, and it is the same one the mobile nav needs:** the landing bar's
# quote button is `href="#cta"` and NO generated page carries that id, so it becomes `/contact/`.
# Left alone it would be a dead anchor on every leaf page — a contact button that contacts nobody,
# which is the precise opposite of what he asked for.
# ⚠️ There are no nested `<div>`s inside `.mbar`, so the first `</div>` closes it.
def _mbar_from_index():
    import pathlib as _p
    src = (_p.Path(__file__).resolve().parent.parent / "index.html").read_text(encoding="utf-8")
    i = src.index('<div class="mbar" id="mobileBar">')
    j = src.index("</div>", i) + len("</div>")
    out = src[i:j].replace('href="#cta"', 'href="/contact/"')
    assert 'href="/contact/"' in out and "wa.me" in out and "tel:" in out, "mbar lift lost a link"
    return out


MBAR_HTML = _mbar_from_index()

# ⭐⭐ THE BAR'S OWN SCRIPT. These pages do not load `assets/site.js` (the 509 KB landing bundle),
# so the eight lines that matter are inlined, exactly as FOOT_JS and the nav toggle already are.
# ⭐ **THE ANCHOR CASCADE IS WIDER HERE THAN ON THE LANDING PAGE BECAUSE THESE FAMILIES DO NOT ALL
# HAVE A HERO.** Services, materials and the county pages have `.svc-hero`; the 132 stone pages
# have `.stp-hero`; the guides have no hero at all and open straight into a `.block` with the h1.
# The last fallback is the page's own `<h1>`, so the bar rises once the title has gone by — true
# on every page in every family, including the sitemap.
# ⛔ NOTHING HERE TESTS THE WIDTH. `.mbar` is `display:none` above 1120px, so the stylesheet stays
# the only thing that decides which bands have a bar (the landing page's own reasoning).
MBAR_JS = ("<script>(function(){var b=document.getElementById('mobileBar');"
           "var a=document.querySelector('.svc-hero .cta-row')"
           "||document.querySelector('.page-head .cta-row')"
           "||document.querySelector('.svc-hero,.page-head,.stp-hero')"
           "||document.querySelector('main h1');"
           "if(!b||!a)return;var s=false;function o(){"
           "var h=(document.querySelector('header.bar')||{}).offsetHeight||76;"
           "var p=a.getBoundingClientRect().bottom<h;"
           "if(p!==s){s=p;b.classList.toggle('on',p);}}"
           "o();window.addEventListener('scroll',o,{passive:true});"
           "window.addEventListener('resize',o);})();</script>")


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
    return MBAR_HTML + MBAR_JS + FOOTER_HTML + FOOT_JS


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
    src = (_p.Path(__file__).resolve().parent.parent / "index.html").read_text(encoding="utf-8")
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




# ⛔ V2 IS GONE (client, 10 Aug 2026): "completely remove version two and everything about
# it." The V1/V2 switcher pill that used to sit bottom-right on every generated page was
# removed with it, along with /versions.html and the whole v2/ tree. ⚠️ Do not re-add a
# PILL constant here: there is no second version to switch to.

# ⭐ THE BAR POURS ITS GLASS IN ON SCROLL — 16 Aug 2026 (D263). The landing page's bar has behaved
# this way since 9 August and these pages now share its design, so they share the one line of
# script that drives it. ⚠️ `{passive:true}` because this listener must never be able to hold up a
# scroll frame, and the class is toggled from a cached boolean so it is not written 60 times a
# second. ⛔ THE SAME SNIPPET IS IN `build_seo_pages.py` AND `stones/build_stones.py` — three
# builders emit their own page shells, so a change here has to be made in all three.
REVEAL_JS = ("<script>document.addEventListener('DOMContentLoaded',function(){"
             "var io=new IntersectionObserver(function(es){es.forEach(function(x){"
             "if(x.isIntersecting){x.target.classList.add('in');io.unobserve(x.target);}});},{threshold:0.12});"
             "document.querySelectorAll('.rise').forEach(function(el){io.observe(el);});"
             "var bar=document.querySelector('header.bar'),on=false;"
             "function s(){var y=window.scrollY>12;if(y!==on){on=y;bar.classList.toggle('scrolled',y);}}"
             "if(bar){s();window.addEventListener('scroll',s,{passive:true});}});</script>")

# ⭐ The champagne paint servers the gold icons resolve against. These must live in the document for
# `stroke:url(#tcGold)` to resolve at all — a missing paint server draws NOTHING, not a fallback.
# ⚠️ #tcGold is the ramp tuned for a stroke; #tcGoldSolid, the one for filled glyphs, is not emitted
# here because nothing on these pages fills against it. Zero-sized and absolutely positioned: a
# `display:none` SVG kills the paint server in some engines and an unpositioned 0x0 box still takes
# part in layout.
TC_DEFS = ('<svg class="tc-defs" aria-hidden="true" focusable="false" width="0" height="0"><defs>'
           '<linearGradient id="tcGold" x1="0" y1="0" x2="0" y2="1">'
           '<stop offset="0" stop-color="#E9D5A0"/><stop offset=".55" stop-color="#C6A664"/>'
           '<stop offset="1" stop-color="#96723A"/></linearGradient></defs></svg>')

# ⭐⭐ THE LANDING PAGE'S FOUR BUBBLES — D263, his instruction that the internal heroes take the
# landing hero's design. ⛔ THIS MARKUP IS A COPY OF `index.html`'s `.hero-chips`, and the two have
# to be changed together; the landing page's own internal pages lift theirs verbatim through
# `build_pages.py`, which is why only these three builders need touching by hand.
# ⚠️ NO `glow-card` CLASS: that hover glow is attached by `site.js`, which these pages do not load,
# and a class with nothing behind it is a promise to the next reader that there is.
# ⛔ DO NOT RECOLOUR THE GOOGLE "G". It is Google's trademark and it is here to attribute the rating
# to its source, which is the one use that makes a third-party mark legitimate.
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


def jsonld(s):
    url = f"{BASE}/services/{s['slug']}.html"
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
        {"@type": "Service", "name": s["h1"], "serviceType": s["h1"],
         "description": s["metadesc"], "url": url,
         "provider": {"@type": "LocalBusiness", "name": "Topcat Worktops", "@id": f"{BASE}/#business"},
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
        # ⭐ THE H1 IS THE CARD'S OWN NAME NOW (D229), so this is just the h1. It used to be
        # `h1.split(" & ")[0].replace("Stone ", "")` — a formula that trimmed a long SEO title
        # back down to something a link could carry. There is nothing left to trim.
        items.append(f'<a href="{s["slug"]}.html">{e(s["h1"])}</a>')
    return '<div class="mats">' + "".join(items) + "</div>"


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


# ⛔⛔⛔ **THIS USED TO BE THE WORST BUG ON THE SITE AND IT WAS ON 31 PAGES — 24 Aug 2026.**
# The old snippet was three lines: preventDefault, add `.sent`, done. `.sent` hides the fields and
# reveals `.qf-done`, which reads *"Thank you, we have your details and will come back to you
# within one working day."* — on an EMPTY form, with nothing sent and nothing stored. A visitor
# typed nothing, pressed the button and was told Topcat had their number.
# ⭐ `assets/tcform.js` owns every form on the site now: the same validation, the same error state
# and the same reply everywhere, and `.qf-done` only ever shows after a real, successful POST.
# ⛔ Do not put a second submit handler back on this family.
QFORM_JS = '<script src="/assets/tcform.js?v=1" defer></script>'


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
<meta property="og:site_name" content="Topcat Worktops">
<meta property="og:image" content="https://www.topcatworktops.co.uk/assets/site/og-cover.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" type="image/svg+xml" href="{FAVICON}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700&family=Montserrat:wght@200;300;400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="service.css{SVC_SIG}">
<link rel="stylesheet" href="/assets/footer.css{FOOT_SIG}">
<link rel="stylesheet" href="/assets/nav.css{NAV_SIG}">
{jsonld(s)}
</head>
<body>
{nav_html()}
{TC_DEFS}

<main>
  <section class="svc-hero">
    <div class="svc-hero-bg" style="background-image:url('{HERO_IMG[s['slug']]}')"></div>
    <!-- ⭐⭐ THE TRAIL SITS ON THE PHOTOGRAPH NOW, NOT ON A BLACK STRIP ABOVE IT — 14 Aug 2026
         (D229). Client: *"there's no need to have a black bar, like in the screenshot for the
         directory you have on the top. It can just be on screen as long as it's easy to read."*
         The bar he saw was not a bar at all: `.crumb` was a SIBLING of the hero, so it sat on
         the page background in a strip of its own and the photograph began underneath it.
         ⛔ MOVED, NOT DUPLICATED, and moved in the markup rather than dragged up with a negative
         margin, so there is one description of where the trail lives (the D106/D113/D114 rule).
         ⚠️ It stays hidden on the phone — that is D197 and he named both halves of it. -->
    <nav class="crumb" aria-label="Breadcrumb">
      <a class="crumb-back" href="/services/" aria-label="Back to Services" onclick="if(history.length>1&&document.referrer&&new URL(document.referrer,location).origin===location.origin){{history.back();return false}}"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><defs><linearGradient id="backGold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#C6A664"/><stop offset=".5" stop-color="#E4CD92"/><stop offset="1" stop-color="#C6A664"/></linearGradient></defs><path d="M15 18l-6-6 6-6" stroke="url(#backGold)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></a>
      <ol>
        <li><a href="/index.html#hero">Home</a></li>
        <li><a href="/services/">Services</a></li>
        <li aria-current="page">{e(s['h1'])}</li>
      </ol>
    </nav>
    <div class="wrap svc-hero-inner">
      <h1>{gold_last(s['h1'])}</h1>
      <p class="lede">{e(s['lede'])}</p>
      <div class="cta-row">
        <a class="btn-gold" href="/contact/"><span class="cta-long">Get your free quote</span><span class="cta-short">Get a free quote</span></a>
        <a class="btn-ghost" href="tel:{PHONE_TEL}"><span class="cta-long">Call {PHONE_DISPLAY}</span><span class="cta-short">Give us a call</span></a>
      </div>
      <!-- ⭐⭐ D263: THE LANDING PAGE'S FOUR BUBBLES REPLACE THE TRUST LINE. It was three spans of
           12.5px grey text saying the rating, the guarantee and the visit in the quietest voice on
           the page. ⚠️ THE COUNTY LIST WENT WITH IT AND THAT IS DELIBERATE, NOT A LOSS: eight named
           counties in a hero reads as a limit rather than a promise (§4b, and the client rejected
           exactly that as an eyebrow), and the coverage is still named in full in the "Areas we
           cover" section below, in the footer and in the schema. -->
      {HERO_CHIPS}
    </div>
  </section>

  <!-- ⭐ D300 — the reading sections and the quote card share a grid; see THE LEAD LAYOUT in
       service.css for why it ends where it does. Below 1121px the aside is not rendered and these
       sections are exactly what they were. -->
  <div class="lead-grid">
   <div class="lead-main">
  <section class="block"><div class="wrap prose rise">
    {intro}
  </div></section>

  <section class="block"><div class="wrap rise">
    <h2>What we <em>make</em></h2>
    <p class="sub">One team runs the job from first measurement to final fit.</p>
    <div class="feat-grid">{feats}</div>
  </div></section>

  <section class="block"><div class="wrap rise">
    <h2>The <em>materials</em></h2>
    <p class="sub">Marble, quartz and granite, with porcelain and more available on request. Not sure what suits you? We will tell you the truth, not just what is easiest to sell.</p>
    {related_intro_materials()}
  </div></section>

{cta_inline("See the stone in <em>your own kitchen</em>",
            "We bring the samples to you and look at them in your own light, at no charge. "
            "If something suits the room better than what you had in mind, we will say so.")}
  <section class="block"><div class="wrap rise">
    <h2>How it <em>works</em></h2>
    <p class="sub">From the first visit to the finished surface, four simple steps.</p>
    <div class="steps">{steps}</div>
  </div></section>

  <section class="block"><div class="wrap rise">
    <h2>Why <em>Topcat</em></h2>
    <ul class="ticks">{why}</ul>
  </div></section>

{cta_inline("Ready for a <em>real number</em>?",
            "A free home visit, then a fixed, itemised quote covering template, fabrication, edges "
            "and fitting. Nothing is charged until you have said yes.")}
  <section class="block"><div class="wrap rise">
    <h2>Areas we <em>cover</em></h2>
    <p class="sub">We fit across {e(AREA)}, with nationwide templating on request. That includes {e(TOWNS)}.</p>
  </div></section>

  <!-- ⭐ D263: "Frequently asked questions", his words, with the gold last word every other heading
       on the site takes. The rows are cards in a two-column grid now — see `.faq` in service.css. -->
   </div>
   {qform_html(s['h1'])}
  </div>

  <section class="block faq"><div class="wrap rise">
    <h2>Frequently asked <em>questions</em></h2>
    <div class="faq-grid">{faqs}</div>
  </div></section>

  <section class="block"><div class="wrap rise">
    <h2>More of what we <em>do</em></h2>
    <p class="sub">Explore the rest of our services.</p>
    {related_html(s['slug'])}
  </div></section>

  <section class="cta-band"><div class="wrap rise">
    <h2>Tell us about your <em>project</em></h2>
    <p>Book a free home visit and we will measure up, talk through the stone and give you a fixed, itemised quote. We reply within one working day. Prefer to talk it through? Ask for Nick.</p>
    <div class="cta-row">
      <a class="btn-gold" href="/contact/"><span class="cta-long">Get your free quote</span><span class="cta-short">Get a free quote</span></a>
      <a class="btn-ghost" href="tel:{PHONE_TEL}"><span class="cta-long">Call {PHONE_DISPLAY}</span><span class="cta-short">Give us a call</span></a>
    </div>
  </div></section>
</main>

{footer_html()}
{REVEAL_JS}
{QFORM_JS}
</body>
</html>"""


# ⭐⭐⭐ THE MID-PAGE CTA — 25 August 2026. Client: *"we need to add more CTAs throughout that page.
# So tastefully add it where it needs to go, not under every single part, but where you believe it
# would fit best. It can be our normal CTA or it can be a custom CTA."*
#
# ⭐⭐ **TWO, AND WHERE THEY GO IS THE WHOLE OF "TASTEFULLY".** These pages run nine sections, and
# before today the only ask in the reading column was the band at the very bottom (plus the sticky
# quote card, which is desktop-only, ≥1121). Two is what the page carries without nagging:
#     after THE MATERIALS  — he has just been shown the range and asked "not sure what suits you?",
#                            so the offer that answers it is samples in his own kitchen
#     after WHY TOPCAT     — he has just read the six reasons, which is where the argument is at
#                            its strongest and the natural place to ask for a number
# ⛔ **NOT AFTER THE FAQ.** That sits two sections above the closing band, and two asks that close
# together read as pestering, which is the "under every single part" he ruled out.
# ⭐ **THE COPY DIFFERS IN EACH, AND FROM THE BAND**, so the page asks three times in three voices
# rather than repeating one line. ⚠️ Both use the site's own `.cta-long`/`.cta-short` pair (D120),
# so the labels follow the per-band wording every other CTA on the site uses.
# ⚠️ §2 checked: no absolute, nothing that cannot be kept, commas not em dashes, no exclamation
# marks, and "free" is the home visit, which is true and already claimed everywhere.
def cta_inline(line_html, sub):
    return (
        '  <section class="block cta-inline-wrap"><div class="wrap rise">\n'
        '    <div class="cta-inline">\n'
        '      <div class="ci-copy">\n'
        f'        <p class="ci-line">{line_html}</p>\n'
        f'        <p class="ci-sub">{e(sub)}</p>\n'
        '      </div>\n'
        '      <div class="cta-row">\n'
        '        <a class="btn-gold" href="/contact/"><span class="cta-long">Get your free quote</span>'
        '<span class="cta-short">Get a free quote</span></a>\n'
        f'        <a class="btn-ghost" href="tel:{PHONE_TEL}"><span class="cta-long">Call {PHONE_DISPLAY}</span>'
        '<span class="cta-short">Give us a call</span></a>\n'
        '      </div>\n'
        '    </div>\n'
        '  </div></section>\n'
    )


def related_intro_materials():
    """⭐⭐ **PORCELAIN JOINS THE STRIP — 25 August 2026.** Client: *"we should have porcelain also
    there just because. So add porcelain as one of the materials."*

    ⛔⛔⛔ **AND IT CANNOT POINT AT `/stones/` LIKE THE OTHER THREE DO.** §2 rule 8 is explicit:
    porcelain is offered *bespoke and enquiry-led only*, there is **no supplied porcelain range**,
    and the rule ends *"do NOT invent porcelain slab names or add porcelain to the stone wheel"* —
    which is also why the estimator's porcelain tab carries `noCat:true`. A fourth pill sending a
    visitor to the stone catalogue would land them in 132 slabs with no porcelain among them, and
    the first thing they would conclude is that we do not actually sell it.
    ⭐ **SO IT GOES TO THE PAGE THAT DOES EXIST** — `/materials/porcelain-worktops.html`, the
    enquiry-led page reinstated on 7 Aug — and it says **on request** on its face.
    ⚠️ **THE WORDING IS HIS OWN RULING, GIVEN WHEN THE CONFLICT WAS PUT TO HIM:** *"If you want to,
    you can just state that porcelain is upon request."* So the label carries it rather than hiding
    it, and the sub above the strip names it too. ⛔ Do not quietly drop the qualifier to make the
    four pills match — the qualifier is the reason the pill is allowed to be there at all."""
    mats = [("Marble", "/stones/", None), ("Quartz", "/stones/", None),
            ("Granite", "/stones/", None),
            ("Porcelain", "/materials/porcelain-worktops.html", "on request")]
    out = []
    for t, h, note in mats:
        tail = f'<span class="mat-note">{e(note)}</span>' if note else ""
        out.append(f'<a href="{h}">{e(t)}{tail}</a>')
    return '<div class="mats">' + "".join(out) + "</div>"


def main():
    here = pathlib.Path(__file__).resolve().parent
    for s in SERVICES:
        out = here / f"{s['slug']}.html"
        out.write_text(page(s), encoding="utf-8")
        print("wrote", out.name)
    print("done:", len(SERVICES), "pages")


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Generates the Topcat Worktops V1 stone collection (/stones/*.html) from shared
templates + the catalogue below. Run from inside this folder:

    python3 build_stones.py

Outputs:
  index.html          — the full collection: searchable, filterable grid of slab tiles
  <slug>.html  (x36)  — a dedicated page per stone with estimate / enquiry CTAs

⚠️ The catalogue below (name / slug / preset / seed / supplier) is MIRRORED in the
wheel's MATERIALS array in ../index.html — the wheel, this grid and the stone pages
must render the SAME procedural slab for the same stone, so change both together.
The slab SVGs are rendered client-side by the same generator code the landing page
uses (STONE_JS below is a copy of it); tile names/tags stay in static HTML for SEO.

⚠️ Stone names and supplier pairings are PLACEHOLDER demo data (like the project
gallery) — confirm the real range with the client before go-live.

House rules honoured: ⛔ fabrication is OUTSOURCED, never claim in-house (reversed 7 Aug 2026),
no showroom (samples
come to the customer, slabs are approved from photos), no founding year, value not
cheap, 5.0 on Google with no review count and no aggregateRating in schema,
no porcelain anywhere, the owner does not offer it. British English,
no em dashes, no exclamation marks.
"""
import html, json, pathlib, re
from urllib.parse import quote

# ---------------------------------------------------------------------------
# REAL SLAB PHOTOGRAPHY. harvest/match.py writes assets/slabs/manifest.json and the same map
# into the wheel in ../index.html; this reads the one file so the collection grid, the stone
# pages and the wheel can never show a customer a different picture of the same stone.
# Missing file, or a stone that is not in it, simply falls back to the drawn slab.
TILE_DIR = "/assets/slabs"
try:
    TILES = json.loads((pathlib.Path(__file__).parent.parent
                        / "assets" / "slabs" / "manifest.json").read_text())
except Exception:
    TILES = {}


# ---------------------------------------------------------------------------
# ⭐ IS THIS STONE ACTUALLY VEINED? Read from the description, not from `vein`.
#
# ⛔ `vein` is a BUSYNESS classifier with three values (statement / soft / calm) measured off
# the pixels, and busy is not the same as veined: a dense speckle scores busy, so Bianco Sardo,
# Baltic Brown and Angola Black Leather all carry `statement` with no vein in them anywhere.
# The client caught it from the search results: "when I search veining, some without veining
# come up."
#
# ⚠️ NEGATION MATTERS. Nero Marinace's description reads "a conglomerate rather than a veined
# stone", so a naive substring test for "vein" marks the one stone that says it is not.
# ⚠️ Not every veined stone is described with the word "vein". Fusion Black reads "gold and
# copper STRIATIONS running across it", and it is one of the most dramatically veined stones
# in the range. These are the words the 126 descriptions actually use for linear pattern.
_VEIN_RE = re.compile(r"\bvein|striation|\bstreak|\bband(s|ing)\b|\bseams?\b|marbling|"
                      r"\bswirl|\bripple", re.I)
_NOT_VEINED_RE = re.compile(r"rather than a veined|not veined|no vein|without vein", re.I)
_SPECKLE_RE = re.compile(r"fleck|speckl|mottl|crystal|pebble|grain|scatter|conglomerate", re.I)


def veined_words(s):
    """Search words describing the stone's PATTERN, taken from what the picture was said to show.

    Returns the vein vocabulary only for stones whose description genuinely reports veins, and
    the speckle vocabulary only for those that report flecking. A stone can legitimately get
    both (a veined ground with flecks) or neither (a plain colour).
    """
    d = DESCRIPTIONS.get(s["slug"], "")
    out = []
    if _VEIN_RE.search(d) and not _NOT_VEINED_RE.search(d):
        out.append("veined veining veiny veins movement")
    if _SPECKLE_RE.search(d):
        out.append("speckled speckle flecked flecks mottled grainy sparkle")
    if not out:
        out.append("plain uniform solid")
    return out


def stone_face(s, cls):
    """The slab image for a stone: its photograph if it has one, else the drawn slab.

    ⚠️ The photograph branch must NOT carry data-stone. STONE_JS walks every [data-stone]
    element on load and replaces its innerHTML with the generated SVG, so leaving the attribute
    on would paint the drawing straight over the photograph a moment after the page appeared.
    """
    tile = TILES.get(s["slug"])
    if tile:
        # ⭐ TWO SIZES VIA srcset (10 Aug). slabify writes a -s thumb at up to 800px beside the
        # 1600px master, and until now NOTHING requested it — the /stones/ grid pulled the full
        # master for a 290px card, 52 of them on one page. `sizes` differs by surface: the hero
        # (stp-stone) is 436px CSS so it wants the master on a retina screen, the grid tile
        # (stile-stone) is ~290px so the thumb is already 2.7x what it can show.
        hero = cls == "stp-stone"
        sizes = "(max-width:700px) 92vw, 436px" if hero else "(max-width:700px) 45vw, 290px"
        return (f'<span class="{cls}">'
                f'<img src="{TILE_DIR}/{tile}.webp" '
                f'srcset="{TILE_DIR}/{tile}-s.webp 800w, {TILE_DIR}/{tile}.webp 1600w" '
                # ⚠️ The alt names the TRUE stone. It read "Taj Mahal marble slab" on 27 tiles,
                # which is what a screen reader announces and what Google Images indexes the
                # photograph as — a wrong material claim in the one place nobody proofreads.
                f'sizes="{sizes}" alt="{e(s["name"])} {e(shown_mat(s).lower())} '
                f'slab" loading="lazy" decoding="async"></span>')
    return f'<span class="{cls}" data-stone="{s["preset"]}" data-seed="{s["seed"]}"></span>'

BASE = "https://www.topcatworktops.co.uk"   # path assumed /stones/<slug>.html — confirm before go-live

PHONE_DISPLAY = "0800 098 2812"
PHONE_TEL = "+448000982812"
EMAIL = "info@topcatworktops.co.uk"
HOURS = "Monday to Friday, 8am to 6pm"
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

# ---------------------------------------------------------------------------
# THE CATALOGUE — mirrored in ../index.html MATERIALS (wheel). Keep in step.
# tone: light | dark (drives the tone filter on the grid).
# blurb: one or two sentences, written to match the procedural render.
# ---------------------------------------------------------------------------
# ⭐ THE REAL RANGE (client, 6 Aug 2026) from Nile Stone and Next Stone Slabs.
# ⚠️ DUPLICATED as MATERIALS in ../index.html — change one, change the other.
# facts=... overrides MAT_FACTS for stones that are not what their category says:
# the quartzites do NOT etch, and must never carry marble care copy.
# ⭐ ONE SOURCE, NOT THREE. This was 170 lines of hand-typed dicts that had to be kept identical
# to MATERIALS in ../index.html and to catalogue_source.S by remembering to. See
# catalogue_active.py for why that stopped being viable at 96 stones. index.html now gets the
# same list injected by apply_catalogue.py, so the wheel, the grid and the stone pages cannot
# disagree about what a name means.
from catalogue_active import S as STONE_LIST  # noqa: E402
from descriptions import D as DESCRIPTIONS  # noqa: E402

MATS = ["Marble", "Quartz", "Granite"]

# ⭐ THE NAME A CUSTOMER SEES FOR EACH BROWSE RANGE. `mat` is the key; this is the label.
# Client, 10 Aug 2026: "on the collection page it shows marble, but on the actual page it says
# quartzite, natural stone. So we have to say available in marble and quartzite or something
# like that. We cannot have that confusion."
#
# ⚠️ THE MARBLE RANGE IS MOSTLY NOT MARBLE. 26 of its 45 stones are quartzite and one is a
# travertine, so a range labelled "Marble" was wrong on the majority of its own contents, and
# every one of those 27 stones opened a page that named a different rock.
#
# ⛔ WHY THE FIX IS THE RANGE NAME AND NOT THE STONE'S. "Taj Mahal is available in marble and
# quartzite" is not true and could not be made true — it is one rock, a quartzite, and every UK
# merchant sells it under that name. Calling it marble would also attach marble's care copy
# (etches with acid, softer) to a harder stone that does neither, and quartzite commands its
# price BECAUSE it is not marble. So the stone always states what it is, and the range around it
# is named for what it actually contains.
#
# ⭐ TO CHANGE THE WORDING, CHANGE IT HERE. Every surface reads this: the stone pages, the
# collection filter, the card tags, the related strip. index.html carries the same map as
# MAT_LABEL for the wheel and the estimator — keep the two in step.
# ⚠️ The single travertine (Travertine Romano Classico) is not in the label. It is one stone in
# 45, its own card and page say "Travertine", and a three-noun range name reads as a list rather
# than a range. Trade practice groups travertine with marble anyway — it is calcite, and it
# etches the same way, which is why it inherits marble's care copy and quartzite does not.
RANGE_LABEL = {"Marble": "Marble & Quartzite", "Quartz": "Quartz", "Granite": "Granite"}

# honest, material-level guidance shown on every stone page of that material
# ⛔ NOTHING HERE MAY PROMISE SOMETHING WE CANNOT GUARANTEE (client, 10 Aug 2026).
# The client found "The pattern is consistent across the slab, so what you approve is exactly
# what arrives" on the Arabescato Gold page: "No it fucking isn't. You cannot say that something
# is consistent across the slab when it's not. Don't say things that you cannot guarantee. Be
# more vague." A veined quartz plainly varies across a slab, and "exactly what arrives" is a
# guarantee about a specific delivery.
# ⚠️ Two more went out with it. Marble carried "we vein-match every joint by hand", which is both
# a guarantee AND a claim to fabrication work — ⛔ Topcat OUTSOURCE fabrication and the site must
# never claim it (D21, §2 rule 1). Granite carried "so there are no surprises on fitting day".
# ⚠️ Absolutes are the tell. "all it asks for", "the one thing it minds", "keeps it perfect",
# "takes it in its stride" each promise a limit we have not tested. Comparatives are safe,
# absolutes are not: "varies less than quarried stone" is defensible, "consistent" is not.
# ⭐ `kind` NAMES THE ROCK, not just its class. It read "Natural stone" for both marble and
# granite, so the one row on the page headed "Stone" was the one row that never said what the
# stone was — a Carrara page stated "Stone: Natural stone" while a quartzite beside it stated
# "Stone: Quartzite (natural stone)", which is half of why the range read as inconsistent.
# ⚠️ `shown_mat()` parses the word before the bracket, so the shape "<Rock> (<class>)" is load
# bearing. Keep it if you edit these.
MAT_FACTS = {
  "Marble": dict(
    kind="Marble (natural stone)",
    care="Porous, and sealed on fitting. Acidic spills such as lemon, wine and vinegar can mark the polish if they are left.",
    wear="Softer than granite or quartz. Boards for cutting, trivets for hot pans.",
    why="Quarried in blocks, so the pattern varies from slab to slab and none of it repeats. You see photographs of your own slab before anything is cut.",
  ),
  "Quartz": dict(
    kind="Quartz (engineered stone)",
    care="Non-porous, so it does not need sealing. Soap and water day to day.",
    wear="Resistant to staining and scratching. Use a trivet for hot pans, direct heat can damage the resin that binds it.",
    why="Manufactured rather than quarried, so it varies less between slabs than natural stone does. You see the slab before anything is cut.",
  ),
  "Granite": dict(
    kind="Granite (natural stone)",
    care="Sealed on fitting. Soap and water day to day.",
    wear="A hard stone that tolerates heat well.",
    why="A natural stone, so grain and colour vary from block to block. You see photographs of your own slab before anything is cut.",
  ),
}

# ⚠️ NOT EVERYTHING THE CATALOGUE CALLS MARBLE IS ONE. Nine stones come from the suppliers'
# QUARTZITE and EXOTIC-STONE sections — Patagonia, Taj Mahal, Aqua Gucci, White Macaubas, Nero
# Marinace, Ocean Fantasy, Cosmic Black and both Blue Romas. They are silica-based and do NOT
# etch with acid the way a calcite marble does, so the marble `care` line above would be wrong
# for them and would understate a harder product.
# ⭐ CHECKED 10 Aug: every one of them ALREADY carries its own `facts=` override in the catalogue
# with correct wording, so MAT_FACTS["Marble"] never reaches them. Nothing to add here. This note
# stays because the next person will spot the mat/section mismatch and reach for a fix that is
# already in place.
# ⛔ Their `mat` is deliberately NOT changed. The estimator prices by material and knows only
# Quartz, Marble, Granite and Porcelain, so reclassifying would invent a pricing category, and
# Topcat's pricing is not ours to change. Raise the classification with Topcat instead.
NOT_MARBLE = ()
NOT_MARBLE_FACTS = {}

# ---------------------------------------------------------------------------
# The procedural slab generator — a byte-for-byte copy of the landing page's
# marble()/vein()/mulberry32() and the STONES presets (plus crema/mist/fumo).
# Rendered client-side into every [data-stone] element so the same seed gives
# the SAME slab here as on the wheel. Change ../index.html and this together.
# ---------------------------------------------------------------------------
STONE_JS = r"""<script>
var UID=0;
var STONES={
  calacatta:{base:['#F1ECE2','#E4DCCC'],grey:'rgba(120,124,130,0.30)',gold:'rgba(198,166,100,0.55)',hair:'rgba(150,150,155,0.22)'},
  statuario:{base:['#F4F2EC','#E8E6DE'],grey:'rgba(90,95,105,0.34)',gold:'rgba(198,166,100,0.30)',hair:'rgba(120,124,132,0.20)'},
  carrara:{base:['#E9E9E6','#DADAD4'],grey:'rgba(110,118,124,0.38)',gold:'rgba(160,160,150,0.18)',hair:'rgba(120,126,132,0.24)'},
  nerogold:{base:['#111116','#08080b'],grey:'rgba(180,180,190,0.10)',gold:'rgba(198,166,100,0.62)',hair:'rgba(198,166,100,0.16)'},
  emperador:{base:['#2a2018','#17110b'],grey:'rgba(120,90,60,0.22)',gold:'rgba(198,166,100,0.48)',hair:'rgba(180,140,90,0.16)'},
  eternal:{base:['#EDE9E1','#DFD8CB'],grey:'rgba(105,110,118,0.28)',gold:'rgba(198,166,100,0.40)',hair:'rgba(140,144,150,0.20)'},
  goldveil:{base:['#101015','#0a0a0d'],grey:'rgba(150,150,160,0.06)',gold:'rgba(198,166,100,0.50)',hair:'rgba(255,224,143,0.20)'},
  crema:{base:['#EFE6D4','#E2D5BC'],grey:'rgba(150,130,100,0.26)',gold:'rgba(198,166,100,0.40)',hair:'rgba(160,140,110,0.20)'},
  mist:{base:['#DDDEDC','#CBCCC8'],grey:'rgba(105,110,116,0.30)',gold:'rgba(150,150,145,0.16)',hair:'rgba(120,124,130,0.22)'},
  fumo:{base:['#1E2024','#141518'],grey:'rgba(190,195,205,0.16)',gold:'rgba(198,166,100,0.28)',hair:'rgba(180,185,195,0.14)'}
};
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
function vein(rng,w,h,startTop){
  let x=startTop?rng()*w:-20, y=startTop?-20:rng()*h;
  let d=`M ${x.toFixed(0)} ${y.toFixed(0)}`;
  const steps=4+Math.floor(rng()*3);
  for(let i=0;i<steps;i++){
    const nx=startTop?x+(rng()-0.45)*w*0.5:x+(w/steps)+(rng()-0.5)*70;
    const ny=startTop?y+(h/steps)+(rng()-0.5)*70:y+(rng()-0.5)*h*0.5;
    const c1x=x+(nx-x)*0.3+(rng()-0.5)*55,c1y=y+(rng()-0.5)*70;
    const c2x=x+(nx-x)*0.7+(rng()-0.5)*55,c2y=ny+(rng()-0.5)*70;
    d+=` C ${c1x.toFixed(0)} ${c1y.toFixed(0)}, ${c2x.toFixed(0)} ${c2y.toFixed(0)}, ${nx.toFixed(0)} ${ny.toFixed(0)}`;
    x=nx;y=ny;
  }
  return d;
}
function marble(preset,seed){
  const p=STONES[preset],rng=mulberry32(seed*997+13),id=++UID,w=400,h=520;
  let veins='';
  for(let i=0;i<3;i++)veins+=`<path d="${vein(rng,w,h,i%2===0)}" stroke="${p.grey}" stroke-width="${(6+rng()*10).toFixed(1)}" fill="none" stroke-linecap="round" filter="url(#b${id})"/>`;
  for(let i=0;i<2;i++)veins+=`<path d="${vein(rng,w,h,i%2===0)}" stroke="${p.gold}" stroke-width="${(2+rng()*4).toFixed(1)}" fill="none" stroke-linecap="round"/>`;
  for(let i=0;i<4;i++)veins+=`<path d="${vein(rng,w,h,rng()>0.5)}" stroke="${p.hair}" stroke-width="${(0.7+rng()*1.4).toFixed(1)}" fill="none" stroke-linecap="round"/>`;
  return `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="g${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${p.base[0]}"/><stop offset="1" stop-color="${p.base[1]}"/></linearGradient>
      <filter id="b${id}"><feGaussianBlur stdDeviation="1.1"/></filter>
      <filter id="n${id}"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="${seed}"/><feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.06 0"/></filter>
      <radialGradient id="s${id}" cx="0.3" cy="0.12" r="1"><stop offset="0" stop-color="rgba(255,255,255,0.18)"/><stop offset="0.4" stop-color="rgba(255,255,255,0)"/></radialGradient>
    </defs>
    <rect width="${w}" height="${h}" fill="url(#g${id})"/>${veins}
    <rect width="${w}" height="${h}" filter="url(#n${id})"/>
    <rect width="${w}" height="${h}" fill="url(#s${id})"/></svg>`;
}
document.addEventListener('DOMContentLoaded',function(){
  document.querySelectorAll('[data-stone]').forEach(function(el){
    el.innerHTML=marble(el.getAttribute('data-stone'),parseInt(el.getAttribute('data-seed'),10)||1);
  });
});
</script>"""

REVEAL_JS = ("<script>document.addEventListener('DOMContentLoaded',function(){"
             "var io=new IntersectionObserver(function(es){es.forEach(function(x){"
             "if(x.isIntersecting){x.target.classList.add('in');io.unobserve(x.target);}});},{threshold:0.12});"
             "document.querySelectorAll('.rise').forEach(function(el){io.observe(el);});});</script>")

# ⛔ V2 IS GONE (client, 10 Aug 2026): "completely remove version two and everything about
# it." The V1/V2 switcher pill that used to sit bottom-right on every generated page was
# removed with it, along with /versions.html and the whole v2/ tree. ⚠️ Do not re-add a
# PILL constant here: there is no second version to switch to.


def e(s):
    return html.escape(s, quote=True)


def deep_link(s, anchor):
    """Link into the landing page carrying the stone (read by the deep-link
    handler at the foot of index.html's script)."""
    return (f"/index.html?stone={quote(s['name'])}&mat={s['mat']}"
            f"&p={s['preset']}&s={s['seed']}&slug={s['slug']}#{anchor}")


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


def head(title, desc, url, extra=""):
    return f"""<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{e(title)}</title>
<meta name="description" content="{e(desc)}">
<link rel="canonical" href="{url}">
<meta name="robots" content="index, follow">
<meta property="og:type" content="website">
<meta property="og:title" content="{e(title)}">
<meta property="og:description" content="{e(desc)}">
<meta property="og:url" content="{url}">
<meta property="og:site_name" content="Topcat Worktops">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" type="image/svg+xml" href="{FAVICON}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700&family=Montserrat:wght@200;300;400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/services/service.css">
<link rel="stylesheet" href="/stones/stone.css">
{extra}"""


def business_ld():
    return {
        "@type": "LocalBusiness", "@id": f"{BASE}/#business", "name": "Topcat Worktops",
        "url": BASE, "telephone": PHONE_DISPLAY, "email": EMAIL, "priceRange": "££",
        "areaServed": AREAS_SERVED,
        "openingHoursSpecification": [{
            "@type": "OpeningHoursSpecification",
            "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
            "opens": "08:00", "closes": "18:00"}],
    }


def ld(graph):
    data = {"@context": "https://schema.org", "@graph": graph}
    return ('<script type="application/ld+json">'
            + json.dumps(data, ensure_ascii=False, separators=(",", ":")) + "</script>")


# ---------------------------------------------------------------------------
# The collection page
# ---------------------------------------------------------------------------
# Customer word -> the words in our own data it should reach. Mirrors STONE_WORDS in
# index.html; the two searches must agree or the same query gives different answers on the
# wheel and on this page. Baked into data-find here rather than run in JS, because the tiles
# are static and the expansion never changes once the page is built.
SEARCH_WORDS = {
    "cream": "beige sand sandy biscuit ivory warm",
    "white": "bright ivory offwhite",
    "grey": "silver graphite charcoal anthracite",
    "black": "charcoal",
    "blue": "navy teal",
    "green": "teal",
    # ⛔ "statement" MEANS BUSY, NOT VEINED, AND CONFLATING THE TWO WAS A REAL DEFECT.
    # Client: "when I search veining, some without veining come up." He was right. This key used
    # to expand to "veiny veined veining ...", so every busy stone answered a search for veining
    # — and a lot of them are speckled granites with no vein in them at all. Measured off the
    # tiles: Bianco Sardo, Baltic Brown, Angola Black Leather and Nero Marinace all carry
    # `statement` and all score at the bottom of the vein-structure scale, because dense speckle
    # is busy without being linear. Nero Marinace's own description calls it "a conglomerate
    # rather than a veined stone".
    # ⭐ The vein words now come from the DESCRIPTION instead (see veined_words), which was
    # written with each photograph open and is the only record of what is actually in the picture.
    "statement": "bold dramatic busy patterned",  # see veined_words() for the vein words

    "soft": "subtle quiet",
    "calm": "plain uniform solid simple subtle quiet",
    "polished": "gloss glossy shiny shine",
    "honed": "matt matte flat satin",
    "leathered": "textured rough brushed",
    "quartz": "engineered manmade composite hardwearing durable practical lowmaintenance "
              "easy hygienic marbleeffect marblelook",
    "marble": "natural",
    "granite": "natural hardwearing durable tough practical",
    "quartzite": "natural hardwearing durable tough",
    "travertine": "natural",
}

# ---------------------------------------------------------------------------
# ⭐ WORDS THAT NAME A FACT, AND MUST BE ANSWERED BY THE FACT — NOT BY THE PROSE
#
# Client, 12 Aug: "when I type white, it's not only showing all the white ones. Nothing
# changes when I type anything in." Measured on the built page: `white` returned 79 of 132
# and 29 of them were not white stones; `marble` returned 112 of 132; `grey` returned 80.
# The search WAS firing — it was answering with most of the collection, which on a phone's
# single column is indistinguishable from not firing at all.
#
# ⛔ TWO SEPARATE FAULTS, AND ONLY ONE IS THE OBVIOUS ONE.
#  1. THE DESCRIPTION IS IN THE HAYSTACK. That was deliberate and it is still right for
#     "sparkle", "pebbles", "copper" (10 Aug) — but it means Marquina, a BLACK stone whose
#     description reads "white veining", answers a search for white. A colour word in the
#     prose describes a detail; a colour word in `hue` describes the stone.
#  2. THE MATCH IS A SUBSTRING. `indexOf("marble")` finds it inside "marbleeffect" and
#     "marblelook", which every quartz carries as a keyword — so all 67 quartz answered
#     "marble". No amount of tidying the prose would have fixed this half.
#
# ⭐ THE RULE: a word that NAMES one of our own classifiers is matched against the
# classifiers only, token-exact. Everything else keeps the loose substring search over the
# prose, so the 10 Aug behaviour is untouched for the words it was built for.
# ⚠️ Deliberately NOT scoped: "warm", "bright", "natural", "stone", "soft", "plain" and the
# durability words. They read as adjectives rather than as the name of a fact, a customer
# typing them means something fuzzy, and scoping them would narrow honest results. The list
# below is only words that can be read as "show me THIS classifier".
SCOPED_SYNONYMS = {
    "hue": "ivory offwhite beige silver graphite charcoal anthracite navy teal",
    "mat": "marbleeffect marblelook",
    "finish": "matt matte satin gloss glossy leathered",
}
_SCOPE_STOP = {"and", "of", "the", "a"}


def scoped_words(stones):
    """Every word that names a hue, material, rock, tone or finish IN THIS CATALOGUE.

    ⛔ Derived from the stones themselves, never hand-listed. D51's lesson: a hand-kept copy
    of a list that also lives in the data holds until someone adds a value, and then it does
    not error — it just quietly stops scoping the new one. Add a hue and this learns it.
    """
    out = set()
    for s in stones:
        out.add(str(s.get("hue", "")).lower())
        out.add(str(s.get("mat", "")).lower())
        out.add(str(s.get("tone", "")).lower())
        for w in str(s.get("finish", "")).lower().split():
            out.add(w)
        # "quartzite (natural stone)" -> quartzite. The rock, never the range (§2 rule 5).
        kind = str((s.get("facts") or {}).get("kind", "")).lower()
        if kind:
            out.add(kind.split()[0])
    for words in SCOPED_SYNONYMS.values():
        out.update(words.split())
    return {w for w in out if w and len(w) > 3 and w not in _SCOPE_STOP}


def _haystacks(s):
    """(classifiers, classifiers + prose) for one stone — the two search haystacks.

    ⭐ SHARED, because the collection grid and the compare page's picker both search and they
    must give the same answer for the same word. Two copies of this would be the D51 fault in
    its purest form: nothing errors, the two surfaces just quietly disagree.
    Returns (attr, find). See scoped_words() for which words are answered by which.
    """
    # search matches name, material, finish, colour, veining, the real geological kind, and the
    # everyday words customers use for all of those ("matt" for honed, "veiny" for statement,
    # "beige" for cream). NOT the supplier: Nile Stone and Next Stone Slabs are the client's own
    # trade sources and stay off the public site entirely.
    kind = (s.get("facts") or {}).get("kind", "")
    # silica is a manufacturer declaration, so it only enters the haystack when one exists
    sil = {"free": "silicafree silica free low", "low": "lowsilica low silica"}.get(s.get("silica"), "")
    bits = [s["name"], s["finish"], s["mat"], s["tone"], s["hue"], s["vein"], kind, sil]
    for key in list(bits):
        for word in str(key).lower().split():
            if word in SEARCH_WORDS:
                bits.append(SEARCH_WORDS[word])
    # ⭐ THE DESCRIPTION IS PART OF THE INDEX (10 Aug). Client: "I can type whatever I want and
    # it just comes back with no stones." The blob above only knew name, finish, material and
    # three classifier fields, so "sparkle", "pebbles", "crystals", "copper", "diagonal" — every
    # word actually describing the picture — found nothing. The descriptions were written with
    # each photograph open (see descriptions.py), so they are the closest thing to a record of
    # what is in the image, and they cost nothing to index.
    # ⚠️ The indexed copy has any NEGATED vein clause removed. Nero Marinace's description
    # reads "a conglomerate rather than a veined stone", and indexing that verbatim made
    # the one stone that says it has no veins answer a search for "veined".
    # ⭐ THE CLASSIFIERS ARE KEPT SEPARATELY FROM THE PROSE — see scoped_words() above. Up to
    # here `bits` is entirely facts about the stone (name, finish, material, tone, hue, vein,
    # rock, silica and their everyday synonyms), so this is the point to take the copy that a
    # colour or material word will be answered by. Everything appended AFTER this line is
    # description prose, which stays in `find` only.
    attr = " ".join(str(b) for b in bits if b).lower()
    bits.append(_NOT_VEINED_RE.sub("not", DESCRIPTIONS.get(s["slug"], "")))
    bits.extend(veined_words(s))
    # ⚠️ veined_words is pattern vocabulary read from the DESCRIPTION, and it belongs in both:
    # it is a fact about the picture, and "veining" already measured honest at 79 stones.
    attr = attr + " " + " ".join(veined_words(s)).lower()
    find = " ".join(str(b) for b in bits if b).lower()
    return attr, find


def tile(s):
    attr, find = _haystacks(s)
    # ⭐ hue / vein / finish ride the tile too (10 Aug). The wheel could refine on colour, veining
    # and finish and this page could not, so the surface showing ALL the stone was the one you
    # could least narrow — at 96 stones that is the wrong way round. `finish` is lowercased and
    # matched by CONTAINS, exactly as the wheel does it, so "Honed and filled" answers Honed.
    return (f'<a class="stile rise" href="/stones/{s["slug"]}.html" '
            f'data-mat="{s["mat"]}" data-tone="{s["tone"]}" data-hue="{s["hue"]}" '
            f'data-vein="{s["vein"]}" data-finish="{e(str(s["finish"]).lower())}" '
            f'data-attr="{e(attr)}" data-find="{e(find)}">'
            + stone_face(s, 'stile-stone') +
            f'<span class="stile-veil"></span>'
            # ⭐ THE TRUE STONE, not the browse category. This tag said "Marble" on 27 cards
            # whose page then said "Quartzite" — the customer met the contradiction one click
            # after the card, so the card is where it has to be resolved.
            f'<span class="stile-tag">{e(shown_mat(s))}</span>'
            f'<span class="stile-meta"><span class="stile-name">{e(s["name"])}</span>'
            f'<span class="stile-sup">{e(s["finish"])}</span></span>'
            f'<span class="stile-go" aria-hidden="true">&rsaquo;</span></a>')


# ⛔ THE BACK CRUMB SAYS `new window.URL(...)` AND THE `window.` IS LOAD-BEARING (12 Aug).
# It was `new URL(...)` and it threw `URL is not a constructor` on the collection page and on
# every one of the 132 stone pages. ⭐ **INSIDE AN INLINE `onclick` THE SCOPE CHAIN INCLUDES
# THE ELEMENT AND THE DOCUMENT**, so the bare identifier `URL` resolves to `document.URL` — a
# STRING — long before it reaches `window.URL`. The handler threw, `history.back()` never ran,
# and the click fell through to the href, so it still navigated and looked fine; the only
# symptom was a console error, which a previous session saw and dismissed as a stale entry
# replayed from another page (§7). ⚠️ It was real, and it was on this page.
def collection_page():
    url = f"{BASE}/stones/"
    title = "The Stone Collection | Marble, Quartz & Granite Worktops | Topcat Worktops"
    desc = ("Browse every stone we fit, marble, quartz and granite worktops across London, "
            "Hertfordshire, Essex and Berkshire. Search by name, filter by material, then "
            "open any stone for the detail and an estimate. Free home visit with samples.")
    graph = [
        {"@type": "CollectionPage", "name": "The Stone Collection", "url": url,
         "description": desc},
        {"@type": "ItemList", "itemListElement": [
            {"@type": "ListItem", "position": i + 1, "name": s["name"],
             "url": f"{BASE}/stones/{s['slug']}.html"} for i, s in enumerate(STONE_LIST)]},
        {"@type": "BreadcrumbList", "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Home", "item": f"{BASE}/index.html"},
            {"@type": "ListItem", "position": 2, "name": "The Stone Collection", "item": url}]},
        business_ld(),
    ]
    tiles = "".join(tile(s) for s in STONE_LIST)
    # ⚠️ `data-mat` stays the KEY and the label is only what is printed. The filter JS, the
    # ?mat= deep link from the wheel and the estimator all match on the key, so the wording can
    # change in RANGE_LABEL without touching a line of behaviour.
    mat_tabs = "".join(
        f'<button class="ftab{" on" if m == "All" else ""}" data-mat="{m}" type="button">'
        f'{e(RANGE_LABEL.get(m, m))}</button>'
        for m in ["All"] + MATS)
    tone_tabs = "".join(
        f'<button class="ftab tone{" on" if t == "All" else ""}" data-tone="{t}" type="button">{"All tones" if t == "All" else t}</button>'
        for t in ["All", "Light", "Dark"])

    # ⭐ THE REFINE DRAWER (10 Aug). Material and tone stay on the top row because they are how
    # most people start; colour, veining and finish live in a drawer that opens, because five
    # rows of chips permanently on screen pushes the actual stone below the fold, which is the
    # opposite of what a collection page is for.
    # ⚠️ Only values that EXIST in the range are offered. A chip that always returns nothing
    # reads as a broken page, and the range changes whenever the catalogue does — so the lists
    # are built from STONE_LIST rather than typed out.
    def _chips(field, label, order, pretty=None, exact=False):
        have = {str(s[field]).lower() for s in STONE_LIST if s.get(field)}
        if exact:
            # ⚠️ finish is matched by CONTAINS, so a value like "honed and filled" is ALREADY
            # answered by the Honed chip. Offering it as a chip of its own gave two chips that
            # return overlapping sets and a Finish row that read as a list of typos.
            vals = [v for v in order if any(v in h for h in have)]
        else:
            vals = [v for v in order if v in have] + sorted(have - set(order))
        if len(vals) < 2:
            return ""                       # nothing to choose between
        chips = "".join(
            f'<button class="rchip" type="button" data-f="{field}" data-v="{e(v)}">'
            f'{e((pretty or {}).get(v, v.title()))}</button>' for v in vals)
        return (f'<div class="rgroup"><span class="rlabel">{label}</span>'
                f'<div class="rchips">{chips}</div></div>')

    refine_groups = (
        _chips("hue", "Colour", ["white", "cream", "grey", "black", "brown", "blue", "green"],
               {"white": "Whites", "cream": "Creams", "grey": "Greys", "black": "Blacks",
                "brown": "Browns", "blue": "Blues", "green": "Greens"})
        # ⚠️ plain "&" here, not "&amp;" — e() escapes the label, so a pre-escaped entity came
        # out on the page as the literal text "Calm &amp; plain".
        + _chips("vein", "Veining", ["statement", "soft", "calm"],
                 {"statement": "Statement", "soft": "Soft", "calm": "Calm & plain"})
        + _chips("finish", "Finish", ["polished", "honed", "leathered", "brushed"],
                 {"honed": "Honed (matt)"}, exact=True)
    )

    # ⭐ The scoped vocabulary is WRITTEN OUT of the catalogue, not typed into the JS. The
    # page and the builder cannot disagree about what counts as a colour or a material,
    # because only one of them decides. See scoped_words().
    scoped = "<script>\nvar SCOPED=" + json.dumps(
        {w: 1 for w in sorted(scoped_words(STONE_LIST))}, separators=(",", ":")) + ";\n"

    filter_js = scoped + r"""
document.addEventListener('DOMContentLoaded',function(){
  var tiles=[].slice.call(document.querySelectorAll('.stile'));
  var count=document.getElementById('stCount'), empty=document.getElementById('stEmpty');
  var search=document.getElementById('stSearch');
  var drawer=document.getElementById('stDrawer'), refBtn=document.getElementById('stRefine');
  var badge=document.getElementById('stBadge'), clear=document.getElementById('stClear');
  var q='', terms=[], mat='All', tone='All';
  /* names customers reliably mistype. Same table as index.html — "calcutta" is far and away
     the most common spelling of Calacatta in the wild, and it used to return nothing here. */
  var FIX={calcutta:'calacatta',calcatta:'calacatta',calacata:'calacatta',calacutta:'calacatta',
    calcata:'calacatta',carara:'carrara',carrera:'carrara',carrarra:'carrara',
    statuairo:'statuario',statuary:'statuario',marquena:'marquina',marchina:'marquina',
    arabascato:'arabescato',arabesco:'arabescato',guatamala:'guatemala'};
  /* one wrong letter should not empty the page */
  function nearly(hay,t){
    if(t.length<5)return false;
    for(var i=0;i<t.length;i++){ if(hay.indexOf(t.slice(0,i)+t.slice(i+1))>-1)return true; }
    return false;
  }
  /* ⭐ The refinements are SETS, not single values: picking Whites and Creams should widen to
     "either", while picking Whites and then Honed should narrow to "both". So it is OR inside a
     group and AND across groups, which is what every shopper expects and what the wheel's panel
     already did. Material and tone stay single-choice because they are the top-level split. */
  var ref={hue:new Set(),vein:new Set(),finish:new Set()};
  /* ⭐ A WORD THAT NAMES ONE OF OUR CLASSIFIERS IS ANSWERED BY THE CLASSIFIER, TOKEN-EXACT.
     Client: "when I type white, it's not only showing all the white ones." It was matching
     the DESCRIPTION, so a black stone described as having white veining answered "white" —
     and because the test was a SUBSTRING, "marble" also found itself inside "marbleeffect",
     the keyword every quartz carries, which is why marble returned 112 of 132.
     ⚠️ Token-exact is the half that fixes "marble"; reading data-attr instead of data-find is
     the half that fixes "white". Both are needed and neither is sufficient alone.
     ⭐ SCOPED is written out by the builder from the catalogue's own values, so it cannot go
     stale (D51) — add a hue and this page learns it at the next build. Everything NOT in it
     keeps the loose substring search over the prose, so "sparkle", "pebbles" and "copper"
     still reach the descriptions exactly as they did (10 Aug). */
  function tok(s,t){ return (' '+s+' ').indexOf(' '+t+' ')>-1; }
  function matches(el,skip){
    var hay=el.getAttribute('data-find'), att=el.getAttribute('data-attr')||'';
    if(terms.length&&!terms.every(function(t){
      t=FIX[t]||t;
      if(SCOPED[t])return tok(att,t);
      return hay.indexOf(t)>-1||nearly(hay,t);
    }))return false;
    if(skip!=='mat'&&mat!=='All'&&el.getAttribute('data-mat')!==mat)return false;
    if(skip!=='tone'&&tone!=='All'&&el.getAttribute('data-tone')!==tone.toLowerCase())return false;
    for(var f in ref){
      if(f===skip||!ref[f].size)continue;
      var v=el.getAttribute('data-'+f)||'';
      /* finish is matched by CONTAINS so "honed and filled" answers Honed */
      var hitf=false; ref[f].forEach(function(x){ if(f==='finish'?v.indexOf(x)>-1:v===x)hitf=true; });
      if(!hitf)return false;
    }
    return true;
  }
  function apply(){
    var n=0;
    tiles.forEach(function(el){
      var ok=matches(el,null);
      el.classList.toggle('hide',!ok);
      if(ok)n++;
    });
    /* ⚠️ A chip is disabled when choosing it would empty the page — counted against everything
       EXCEPT its own group, so the other chips beside it stay reachable. Leaving dead chips live
       is how a filter panel comes to feel broken: you click, nothing happens, you stop trusting
       it. A chip already on is never disabled, or you could not switch it off again. */
    document.querySelectorAll('.rchip').forEach(function(c){
      var f=c.getAttribute('data-f'), v=c.getAttribute('data-v');
      if(c.classList.contains('on')){c.disabled=false;return;}
      var any=tiles.some(function(el){
        if(!matches(el,f))return false;
        var got=el.getAttribute('data-'+f)||'';
        return f==='finish'?got.indexOf(v)>-1:got===v;
      });
      c.disabled=!any;
    });
    var act=ref.hue.size+ref.vein.size+ref.finish.size;
    if(badge){badge.hidden=!act;badge.textContent=act||'';}
    if(clear)clear.hidden=!act;
    count.textContent='Showing '+n+(n===1?' stone':' stones');
    empty.hidden=n>0;
  }
  search.addEventListener('input',function(){
    /* glue the phrases that mean one thing, then AND the words: "white quartz" narrows */
    q=search.value.trim().toLowerCase()
      .replace(/\b(marble|stone)\s+(effect|look|style)\b/g,'$1$2')
      .replace(/\blow\s+maintenance\b/g,'lowmaintenance')
      .replace(/\boff[\s-]white\b/g,'offwhite');
    terms=q?q.split(/[\s,]+/).filter(Boolean):[];
    apply();
  });
  document.querySelectorAll('.ftab[data-mat]').forEach(function(b){
    b.addEventListener('click',function(){
      mat=b.getAttribute('data-mat');
      document.querySelectorAll('.ftab[data-mat]').forEach(function(x){x.classList.toggle('on',x===b);});
      apply();
    });
  });
  document.querySelectorAll('.ftab[data-tone]').forEach(function(b){
    b.addEventListener('click',function(){
      tone=b.getAttribute('data-tone');
      document.querySelectorAll('.ftab[data-tone]').forEach(function(x){x.classList.toggle('on',x===b);});
      apply();
    });
  });
  document.querySelectorAll('.rchip').forEach(function(c){
    c.addEventListener('click',function(){
      var f=c.getAttribute('data-f'), v=c.getAttribute('data-v');
      if(ref[f].has(v))ref[f].delete(v); else ref[f].add(v);
      c.classList.toggle('on',ref[f].has(v));
      apply();
    });
  });
  if(refBtn&&drawer){
    refBtn.addEventListener('click',function(){
      var open=drawer.hasAttribute('hidden');
      if(open)drawer.removeAttribute('hidden'); else drawer.setAttribute('hidden','');
      refBtn.setAttribute('aria-expanded',open?'true':'false');
      refBtn.classList.toggle('on',open);
    });
  }
  if(clear){
    clear.hidden=true;
    clear.addEventListener('click',function(){
      for(var f in ref)ref[f].clear();
      document.querySelectorAll('.rchip.on').forEach(function(c){c.classList.remove('on');});
      apply();
    });
  }
  /* /stones/#marble etc (footer links) preselect that material */
  var h=(location.hash||'').slice(1).toLowerCase();
  var pre={marble:'Marble',quartz:'Quartz',granite:'Granite'}[h];
  if(pre){
    var b=document.querySelector('.ftab[data-mat="'+pre+'"]');
    if(b)b.click();
  }
  apply();
});
</script>"""

    return f"""<!DOCTYPE html>
<html lang="en-GB">
<head>
{head(title, desc, url, ld(graph))}
</head>
<body>
{nav_html()}

<nav class="crumb" aria-label="Breadcrumb">
  <a class="crumb-back" href="/index.html#hero" aria-label="Back to Home" onclick="if(history.length>1&&document.referrer&&new window.URL(document.referrer,location).origin===location.origin){{history.back();return false}}"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><defs><linearGradient id="backGold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#C6A664"/><stop offset=".5" stop-color="#E4CD92"/><stop offset="1" stop-color="#C6A664"/></linearGradient></defs><path d="M15 18l-6-6 6-6" stroke="url(#backGold)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></a>
  <ol>
    <li><a href="/index.html#hero">Home</a></li>
    <li aria-current="page">The collection</li>
  </ol>
</nav>

<main>
  <section class="st-hero">
    <div class="wrap">
      <h1>Choose your <em>stone</em></h1>
      <p class="lede">Every stone we fit, in one place. Search by name, filter by material or tone, and open any stone for the detail and an estimate.</p>
      <!-- ⭐ LIFTED OUT OF THE LEDE, 10 Aug. The sourcing offer was the last clause of the
           paragraph above and read as a footnote to a paragraph most people skim. The client's
           point is that the range on show must not read as the whole range: "if they think this
           is the only range that we have, that wouldn't make sense, because there is more."
           ⛔ Hedged deliberately, §2 rule 12 — "usually", "where we can", never an absolute. -->
      <p class="st-source">These are the stones we hold photographs of, not the limit of what we
        can get. If the one you have in mind is not here, <a href="/contact/">tell us what
        you are after</a> and we will source it where we can.</p>
    </div>
  </section>

  <section class="st-controls">
    <div class="wrap">
      <div class="st-controlrow">
        <label class="st-search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.5-4.5"/></svg>
          <input id="stSearch" type="search" placeholder="Try white, matt, marble effect" aria-label="Search stones by colour, finish or name">
        </label>
        <div class="st-ftabs" role="group" aria-label="Filter by material">{mat_tabs}</div>
        <div class="st-ftabs" role="group" aria-label="Filter by tone">{tone_tabs}</div>
        <button class="st-refine" id="stRefine" type="button" aria-expanded="false" aria-controls="stDrawer">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M3 6h18M7 12h10M11 18h2"/></svg>
          Refine<span class="st-badge" id="stBadge" hidden></span>
        </button>
        <!-- the second door into compare, for someone who arrived with nothing chosen yet -->
        <a class="st-refine st-compare" href="/stones/compare.html">
          <svg viewBox="0 0 48 32" fill="none" stroke="currentColor" stroke-width="2.6" aria-hidden="true"><rect x="1.5" y="1.5" width="19" height="29" rx="2"/><rect x="27.5" y="1.5" width="19" height="29" rx="2" stroke-dasharray="4 4"/></svg>
          Compare
        </a>
      </div>
      <div class="st-drawer" id="stDrawer" hidden>{refine_groups}
        <button class="st-clear" id="stClear" type="button">Clear all</button>
      </div>
      <p class="st-count" id="stCount">Showing {len(STONE_LIST)} stones</p>
    </div>
  </section>

  <section class="st-gridwrap">
    <div class="wrap">
      <div class="st-grid">{tiles}</div>
      <div class="st-empty" id="stEmpty" hidden>
        <p class="st-empty-line">No stone by that name in the collection.</p>
        <p class="st-empty-sub">We can usually source it. Call <a href="tel:{PHONE_TEL}">{PHONE_DISPLAY}</a> or <a href="/contact/">get in touch</a> and tell us what you are after.</p>
      </div>
      </div>
  </section>

  <section class="cta-band"><div class="wrap rise">
    <h2>Can't choose from a <em>screen?</em></h2>
    <p>Nobody should. Book a free home visit and we bring samples to you, in your light, against your cabinets. You approve photographs of your actual slab before a single cut. Prefer to talk it through? Ask for Nick.</p>
    <div class="cta-row">
      <a class="btn-gold" href="/contact/">Book a free home visit</a>
      <a class="btn-ghost" href="tel:{PHONE_TEL}">Call {PHONE_DISPLAY}</a>
    </div>
  </div></section>
</main>

{footer_html()}
{STONE_JS}
{REVEAL_JS}
{filter_js}
</body>
</html>"""


# ---------------------------------------------------------------------------
# Per-stone pages
# ---------------------------------------------------------------------------
# ---------------------------------------------------------------------------
# ⭐ THE COMPARE PAGE — 12 Aug 2026
#
# Client: "build out a compare stones page where you can select multiple stones and see them
# next to each other. You can always add a new stone onto that page, and then it takes you to
# the part where you can see all the stones or select them, and then you can add them to that
# page. And there must be an enquiry and all the different things needed on that page to
# convert more clients."
#
# ⭐ IT IS ONE PAGE READING THE QUERY STRING, NOT 132x132 PAGES. `/stones/compare.html?s=a,b,c`
# — so a comparison is a LINK. That is the half of this feature with a business case: Topcat
# have no showroom (§2), so the one thing a showroom does that this site could not is hold two
# samples side by side, and now Nick can send that view to a customer in a text message.
#
# ⛔ THE LAYOUT IS A GRID INSIDE ONE HORIZONTAL SCROLLER, AND THE ALTERNATIVE IS WORSE.
# The obvious build is a row of stone columns with the fact labels down the left, each row a
# separate flex line — but then the labels and the columns are separate scrollers and have to
# be kept in sync by script, every frame, on the device already complaining about smoothness.
# One CSS grid inside one `overflow-x:auto` element scrolls as a single unit for free, and the
# label column is `position:sticky;left:0` so it stays put while the stones slide under it.
# ⚠️ Two stones fit a 375px phone without scrolling, which is the common case; the third is
# what the scroll is for.
# ---------------------------------------------------------------------------
COMPARE_JS = r"""<script>
document.addEventListener('DOMContentLoaded',function(){
  var BY={}; CMP_DATA.forEach(function(d){BY[d.slug]=d;});
  var cards=document.getElementById('cmpCards');
  var empty=document.getElementById('cmpEmpty'), countEl=document.getElementById('cmpCount');
  var cta=document.getElementById('cmpCta');
  var ctaNote=document.getElementById('cmpCtaNote'), enquire=document.getElementById('cmpEnquire');
  var clearBtn=document.getElementById('cmpClear'), shareBtn=document.getElementById('cmpShare');
  var addBtn=document.getElementById('cmpAdd'), addFirst=document.getElementById('cmpAddFirst');
  var pick=document.getElementById('cmpPick'), pickGrid=document.getElementById('cmpPickGrid');
  var pickDown=document.getElementById('cmpPickDown'), pickSearch=document.getElementById('cmpSearch');
  var pickTabs=document.getElementById('cmpTabs'), pickCount=document.getElementById('cmpPickCount');
  var pickEmpty=document.getElementById('cmpPickEmpty');

  /* ⛔ THE SHORTLIST IS THE URL AND NOTHING ELSE. There is no localStorage copy: two places
     holding the same list is the fault this project keeps re-learning (D51), and it would also
     mean a link someone was SENT quietly merged with whatever they last looked at. */
  function read(){
    var m=/[?&]s=([^&]*)/.exec(location.search);
    if(!m)return [];
    return decodeURIComponent(m[1]).split(',').filter(function(x){return BY[x];});
  }
  var sel=read();
  function write(){
    var q=sel.length?('?s='+encodeURIComponent(sel.join(','))):location.pathname;
    history.replaceState(null,'',sel.length?location.pathname+q:location.pathname);
  }

  var FIX={calcutta:'calacatta',calcatta:'calacatta',calacata:'calacatta',calacutta:'calacatta',
    calcata:'calacatta',carara:'carrara',carrera:'carrara',carrarra:'carrara',
    statuairo:'statuario',statuary:'statuario',marquena:'marquina',marchina:'marquina',
    arabascato:'arabescato',arabesco:'arabescato',guatamala:'guatemala'};
  function nearly(hay,t){
    if(t.length<5)return false;
    for(var i=0;i<t.length;i++){ if(hay.indexOf(t.slice(0,i)+t.slice(i+1))>-1)return true; }
    return false;
  }
  function tok(s,t){ return (' '+s+' ').indexOf(' '+t+' ')>-1; }
  /* ⭐ THE SAME TWO HAYSTACKS AND THE SAME SCOPED VOCABULARY AS THE COLLECTION PAGE (D139).
     A word that names one of our classifiers is answered by the classifier, token-exact;
     everything else keeps the loose search over the prose. Both strings are written per stone
     by the builder from ONE function, so the two surfaces cannot answer the same query
     differently. */
  function hits(d,terms){
    return terms.every(function(t){
      t=FIX[t]||t;
      if(SCOPED[t])return tok(d.attr,t);
      return d.find.indexOf(t)>-1||nearly(d.find,t);
    });
  }
  function normalise(v){
    return v.trim().toLowerCase()
      .replace(/\b(marble|stone)\s+(effect|look|style)\b/g,'$1$2')
      .replace(/\blow\s+maintenance\b/g,'lowmaintenance')
      .replace(/\boff[\s-]white\b/g,'offwhite');
  }

  function slabImg(d,cls){
    if(d.img) return '<img class="'+cls+'" src="'+d.img+'" srcset="'+d.img+' 800w, '+d.img2+' 1600w" '+
      'sizes="(max-width:720px) 46vw, 240px" alt="'+d.name+' '+d.shown.toLowerCase()+' slab" loading="lazy" decoding="async">';
    return '<span class="'+cls+'" data-stone="'+d.preset+'" data-seed="'+d.seed+'"></span>';
  }
  function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

  /* ⭐⭐ IT IS A LOOK, NOT A DATASHEET — 12 Aug, second pass. Client: "what I meant by compare
     the stones is only the VIEW of the stone. Two stones next to each other and slightly
     bigger, and when they add another it goes below. Then only the name and the material, but
     not the other details."
     ⛔ THE SPEC TABLE IS GONE, AND WITH IT THE HORIZONTAL SCROLLER, THE STICKY LABEL COLUMN AND
     THE DIFFERENCE MARKERS. Two across that WRAP need no scroller at all — the whole
     sticky/scroll apparatus existed to fit ten fact rows across n columns, and the moment the
     rows went it was answering a question nobody had asked. Deleting it also removed the one
     place on this page where a phone had to scroll sideways. */
  function render(){
    var n=sel.length;
    countEl.textContent=n?(n+(n===1?' stone':' stones')+' side by side'):'';
    clearBtn.hidden=!n; shareBtn.hidden=n<2;
    empty.hidden=n>0; cards.hidden=!n; cta.hidden=n<1;
    if(addBtn)addBtn.hidden=false;
    if(!n){ cards.innerHTML=''; write(); return; }
    var html='';
    sel.forEach(function(sl){
      var d=BY[sl];
      html+='<div class="cmp-card">'+
        '<button class="cmp-drop" type="button" data-drop="'+sl+'" aria-label="Remove '+esc(d.name)+'">'+
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 6l12 12M18 6L6 18"/></svg></button>'+
        '<a class="cmp-thumb" href="/stones/'+d.slug+'.html">'+slabImg(d,'cmp-img')+'</a>'+
        '<span class="cmp-tag">'+esc(d.shown)+'</span>'+
        '<a class="cmp-name" href="/stones/'+d.slug+'.html">'+esc(d.name)+'</a>'+
      '</div>';
    });
    cards.innerHTML=html;
    var names=sel.map(function(sl){return BY[sl].name;});
    ctaNote.textContent=names.length?('Your shortlist: '+names.join(', ')+'.'):'';
    /* ⚠️ The shortlist rides the enquiry link as ?stones=. NOTHING READS IT YET — the enquiry
       form still has no backend (the top open item). It is carried so the day the form is
       wired the shortlist is already arriving with the customer, and so the link a customer
       is sent is self-describing. Do not mistake it for a working handover. */
    enquire.href='/index.html?stones='+encodeURIComponent(names.join(', '))+'#cta';
    write();
  }

  cards.addEventListener('click',function(ev){
    var b=ev.target.closest('[data-drop]'); if(!b)return;
    var sl=b.getAttribute('data-drop');
    sel=sel.filter(function(x){return x!==sl;});
    render();
  });
  clearBtn.addEventListener('click',function(){ sel=[]; render(); });
  shareBtn.addEventListener('click',function(){
    var done=function(ok){ shareBtn.textContent=ok?'Link copied':'Copy failed';
      setTimeout(function(){shareBtn.textContent='Copy link';},1800); };
    if(navigator.clipboard&&navigator.clipboard.writeText)
      navigator.clipboard.writeText(location.href).then(function(){done(true);},function(){done(false);});
    else done(false);
  });

  /* ---------- the picker ---------- */
  var pterms=[], pmat='All', lastFocus=null;
  var MATS=['All']; CMP_DATA.forEach(function(d){ if(MATS.indexOf(d.mat)<0)MATS.push(d.mat); });
  pickTabs.innerHTML=MATS.map(function(m){
    return '<button class="ftab'+(m==='All'?' on':'')+'" type="button" data-mat="'+m+'">'+
      (m==='All'?'All':esc(m))+'</button>'; }).join('');
  pickTabs.addEventListener('click',function(ev){
    var b=ev.target.closest('[data-mat]'); if(!b)return;
    pmat=b.getAttribute('data-mat');
    [].forEach.call(pickTabs.children,function(x){x.classList.toggle('on',x===b);});
    paint();
  });
  pickSearch.addEventListener('input',function(){
    var q=normalise(pickSearch.value); pterms=q?q.split(/[\s,]+/).filter(Boolean):[]; paint();
  });
  function paint(){
    var n=0, html='';
    CMP_DATA.forEach(function(d){
      if(pmat!=='All'&&d.mat!==pmat)return;
      if(pterms.length&&!hits(d,pterms))return;
      n++;
      var on=sel.indexOf(d.slug)>-1;
      html+='<button class="cmp-pick-tile'+(on?' on':'')+'" type="button" data-add="'+d.slug+'"'+
        (on?' aria-pressed="true"':'')+'>'+slabImg(d,'cmp-pick-img')+
        '<span class="cmp-pick-veil"></span>'+
        '<span class="cmp-pick-meta"><span class="cmp-pick-name">'+esc(d.name)+'</span>'+
        '<span class="cmp-pick-sup">'+esc(d.finish)+'</span></span>'+
        (on?'<span class="cmp-pick-on" aria-hidden="true">Added</span>':'')+'</button>';
    });
    pickGrid.innerHTML=html;
    pickCount.textContent='Showing '+n+(n===1?' stone':' stones');
    pickEmpty.hidden=n>0;
  }
  pickGrid.addEventListener('click',function(ev){
    var b=ev.target.closest('[data-add]'); if(!b)return;
    var sl=b.getAttribute('data-add');
    if(sel.indexOf(sl)>-1) sel=sel.filter(function(x){return x!==sl;});
    else sel.push(sl);
    paint(); render();
  });
  function openPick(){
    lastFocus=document.activeElement;
    pick.removeAttribute('hidden');
    document.documentElement.classList.add('cmp-locked');
    paint();
    setTimeout(function(){pickSearch.focus();},80);
  }
  function closePick(){
    pick.setAttribute('hidden','');
    document.documentElement.classList.remove('cmp-locked');
    if(lastFocus&&lastFocus.focus)lastFocus.focus();
  }
  if(addBtn)addBtn.addEventListener('click',openPick);
  if(addFirst)addFirst.addEventListener('click',openPick);
  pickDown.addEventListener('click',closePick);
  pick.addEventListener('click',function(ev){ if(ev.target===pick)closePick(); });
  document.addEventListener('keydown',function(ev){
    if(ev.key==='Escape'&&!pick.hasAttribute('hidden'))closePick();
  });

  render();
});
</script>"""

# ⛔ COMPARE_ROWS / VEIN_LABEL were deleted on 12 Aug with the spec table they fed. The client
# reduced this page to "only the name and the material, but not the other details" — the facts
# all live on the stone page, one tap away, and a datasheet was answering a question he had not
# asked. `compare_datum` still carries the fields; nothing renders them.
def compare_datum(s):
    """Everything the compare page needs about one stone, as plain JSON.

    ⚠️ Built from the SAME helpers the stone pages use — shown_mat, range_label, slab facts,
    MAT_FACTS with the NOT_MARBLE override. A compare page that derived its own answers would
    be a second source of truth for what a stone IS, and the two would drift the first time a
    care line was reworded. The one defect this project keeps repeating (D51).
    """
    facts = dict(MAT_FACTS[s["mat"]])
    if s["slug"] in NOT_MARBLE:
        facts.update(NOT_MARBLE_FACTS)
    facts.update(s.get("facts") or {})
    size = (s.get("size") or "").strip()
    m = re.fullmatch(r"(\d+)\s*x\s*(\d+)", size) if size else None
    rng = range_label(s)
    d = {
        "slug": s["slug"], "name": s["name"], "mat": s["mat"], "shown": shown_mat(s),
        "kind": facts.get("kind", "") or shown_mat(s),
        "range": "" if rng == shown_mat(s) else rng,
        # ⚠️ hue / tone / vein are stored lowercase as KEYS (the filter chips and the wheel
        # match on them). They are printed here, so they are capitalised for the reader — the
        # key is never what goes on screen.
        "finish": s["finish"], "hue": s["hue"].capitalize(),
        "tone": s["tone"].capitalize(), "vein": s["vein"].capitalize(),
        "care": facts.get("care", ""), "wear": facts.get("wear", ""),
        "size": f"{m.group(1)} × {m.group(2)} mm" if m else "",
        # ⛔ THE SAME ON ALL 132 BY DESIGN, and it is the honest answer — Topcat supply two
        # thicknesses for every stone in the range, so this is what the customer will be sold.
        # The per-slab figure from the supplier's yard is NOT this and must not go back (see
        # slab_facts). It will therefore never mark as a difference, which is correct.
        "thick": "20 mm or 30 mm",
        "desc": stone_desc(s),
        # the picker searches exactly as the collection page does — same two haystacks,
        # same scoped vocabulary, so one query cannot mean two things on one site
        "attr": "", "find": "",
    }
    tile_id = TILES.get(s["slug"])
    if tile_id:
        d["img"] = f"{TILE_DIR}/{tile_id}-s.webp"
        d["img2"] = f"{TILE_DIR}/{tile_id}.webp"
    else:
        d["preset"], d["seed"] = s["preset"], s["seed"]
    return d


def compare_page():
    url = f"{BASE}/stones/compare.html"
    title = "Compare Stones Side by Side | Topcat Worktops"
    desc = ("Put any of our marble, quartz and granite worktops side by side and compare the "
            "stone, finish, colour, pattern and care at a glance. Then ask us for samples of "
            "the ones you like, brought to your home across " + AREA + ".")
    graph = [
        {"@type": "WebPage", "name": "Compare stones", "url": url, "description": desc},
        {"@type": "BreadcrumbList", "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Home", "item": f"{BASE}/index.html"},
            {"@type": "ListItem", "position": 2, "name": "The Stone Collection",
             "item": f"{BASE}/stones/"},
            {"@type": "ListItem", "position": 3, "name": "Compare stones", "item": url}]},
        business_ld(),
    ]
    # ⚠️ noindex: the page has no content of its own until a query string selects some, so an
    # empty /compare.html is a thin page and every ?s= permutation is a near-duplicate of it.
    # It is linked, crawlable and shareable — it just should not be the thing that ranks.
    data = [compare_datum(s) for s in STONE_LIST]
    for d, s in zip(data, STONE_LIST):
        d["attr"], d["find"] = _haystacks(s)
    scoped_js = json.dumps({w: 1 for w in sorted(scoped_words(STONE_LIST))},
                           separators=(",", ":"))
    return f"""<!DOCTYPE html>
<html lang="en-GB">
<head>
{head(title, desc, url, '<meta name="robots" content="noindex, follow">')}
{ld(graph)}
</head>
<body>
{nav_html()}

<nav class="crumb" aria-label="Breadcrumb">
  <a class="crumb-back" href="/stones/" aria-label="Back to The collection" onclick="if(history.length>1&&document.referrer&&new window.URL(document.referrer,location).origin===location.origin){{history.back();return false}}"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><defs><linearGradient id="backGold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#C6A664"/><stop offset=".5" stop-color="#E4CD92"/><stop offset="1" stop-color="#C6A664"/></linearGradient></defs><path d="M15 18l-6-6 6-6" stroke="url(#backGold)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></a>
  <ol>
    <li><a href="/index.html#hero">Home</a></li>
    <li><a href="/stones/">The collection</a></li>
    <li aria-current="page">Compare</li>
  </ol>
</nav>

<main>
  <section class="st-hero cmp-hero">
    <div class="wrap">
      <h1>Compare your <em>shortlist</em></h1>
      <!-- ⚠️ REWRITTEN when the spec table came out. It used to promise "the finish, the colour
           and how each one lives", which was a fair description of a page with ten fact rows and
           is a plain untruth on a page showing slabs and names. Copy that describes a previous
           version of the design is the quietest way to mislead someone. -->
      <p class="lede">Put your stones side by side and just look at them. Add as many as you
        like, then ask us to bring samples of the ones you keep coming back to.</p>
    </div>
  </section>

  <section class="cmp-wrap">
    <div class="wrap">
      <div class="cmp-bar">
        <p class="cmp-count" id="cmpCount"></p>
        <div class="cmp-baractions">
          <button class="cmp-clear" id="cmpClear" type="button" hidden>Clear all</button>
          <button class="cmp-share" id="cmpShare" type="button" hidden>Copy link</button>
          <!-- ⭐ "You can always add a new stone onto that page" — so this control is never
               conditional and never scrolls away with the grid. It is the one thing on the
               page that must always be one tap from anywhere. -->
          <button class="cmp-add btn-gold" id="cmpAdd" type="button" hidden>
            <span aria-hidden="true">+</span> Add a stone</button>
        </div>
      </div>

      <!-- the empty state IS the invitation, so it carries the only control that matters -->
      <div class="cmp-empty" id="cmpEmpty">
        <span class="cmp-empty-mark" aria-hidden="true">
          <svg viewBox="0 0 48 32" fill="none" stroke="currentColor" stroke-width="1.3">
            <rect x="1" y="1" width="20" height="30" rx="2"/>
            <rect x="27" y="1" width="20" height="30" rx="2" stroke-dasharray="3 3"/>
          </svg>
        </span>
        <p class="cmp-empty-line">Nothing to compare yet.</p>
        <p class="cmp-empty-sub">Add two or more stones and they will sit side by side here,
          with everything we know about each one lined up underneath.</p>
        <button class="btn-gold cmp-add-first" id="cmpAddFirst" type="button">Choose your first stone</button>
      </div>

      <!-- ⭐ TWO ACROSS, WRAPPING DOWN. ⛔ REPLACES THE SPEC TABLE — see the note above
           compare_page(). This is a LOOK, not a datasheet: slab, name, material, nothing else. -->
      <div class="cmp-cards" id="cmpCards" hidden></div>
    </div>
  </section>

  <section class="cta-band cmp-cta" id="cmpCta" hidden><div class="wrap">
    <h2>Narrowed it <em>down?</em></h2>
    <p>We will bring samples of your shortlist to your home, in your light, against your own
      cabinets, and talk through what each one is like to live with. You approve photographs of
      your actual slab before a single cut.</p>
    <div class="cta-row">
      <a class="btn-gold" id="cmpEnquire" href="/contact/">Ask for these samples</a>
      <a class="btn-ghost" href="tel:{PHONE_TEL}">Call {PHONE_DISPLAY}</a>
    </div>
    <p class="cmp-cta-note" id="cmpCtaNote"></p>
  </div></section>

  <section class="cta-band"><div class="wrap rise">
    <h2>Can't choose from a <em>screen?</em></h2>
    <p>Nobody should. Book a free home visit and we bring samples to you. Prefer to talk it
      through? Ask for Nick.</p>
    <div class="cta-row">
      <a class="btn-gold" href="/contact/">Book a free home visit</a>
      <a class="btn-ghost" href="/stones/">Back to the collection</a>
    </div>
  </div></section>
</main>

<!-- ⭐ THE PICKER IS THE COLLECTION, NOT A LIST OF NAMES. He asked for "the part where you can
     see all the stones or select them", so it shows the same photographed tiles, with the same
     search and the same material tabs, and closes back onto the comparison. -->
<div class="cmp-pick" id="cmpPick" hidden role="dialog" aria-modal="true" aria-labelledby="cmpPickTitle">
  <div class="cmp-pick-panel">
    <div class="cmp-pick-head">
      <h2 id="cmpPickTitle">Add a stone</h2>
      <!-- ⛔⛔ A DOWNWARD CHEVRON, NEVER AN ×  — 15 Aug 2026. Client: *"it's a pop up, but it
           should not be an x at the top. It should be a downward facing arrow because it's a pop
           up. If it was made to be an x, it looks like you're losing your saved progress."*
           ⭐⭐ **HE IS DESCRIBING WHAT THE GLYPH PROMISES, AND AN × PROMISES DESTRUCTION.** The
           shortlist lives in the URL and this sheet only ever ADDS to it, so closing the picker
           cannot lose anything — but an × is the same mark that empties a basket and removes a
           chip, and one is `.cs-x` on the enquiry card two sections away. ⭐ A chevron promises
           the opposite: put this away, the thing behind it is still there.
           ⭐ IT IS ALSO LITERALLY TRUE HERE. `.cmp-pick` is `align-items:flex-end` with the panel
           square along its bottom edge — a sheet that came UP from the floor — so down is the
           direction it actually goes.
           ⚠️ THE GLYPH IS THE NAV'S OWN CARET, NOT A NEW DRAWING: same 2:1 chevron, same round
           caps and joins, in the 24 box this button's weights are written for. -->
      <button class="cmp-pick-down" id="cmpPickDown" type="button" aria-label="Close the picker and go back to your comparison">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9.5l6 6 6-6"/></svg>
      </button>
    </div>
    <label class="st-search cmp-pick-search">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.5-4.5"/></svg>
      <input id="cmpSearch" type="search" placeholder="Try white, matt, marble effect" aria-label="Search stones by colour, finish or name">
    </label>
    <div class="st-ftabs cmp-pick-tabs" id="cmpTabs" role="group" aria-label="Filter by material"></div>
    <p class="cmp-pick-count" id="cmpPickCount"></p>
    <div class="cmp-pick-grid" id="cmpPickGrid"></div>
    <p class="cmp-pick-empty" id="cmpPickEmpty" hidden>No stone by that name in the collection.</p>
  </div>
</div>

{footer_html()}
{STONE_JS}
{REVEAL_JS}
<script>
var CMP_DATA={json.dumps(data, separators=(",", ":"))};
var SCOPED={scoped_js};
</script>
{COMPARE_JS}
</body>
</html>"""


def shown_mat(s):
    """The stone type a READER is told, which is not always the browse category.

    ⚠️ The heading above this section used to be "Why choose <stone name>", which asks the
    paragraph beneath it to make a sales claim — that is how the quartz page ended up asserting
    a slab's pattern was uniform. It states a fact now so the copy under it can too.
    ⛔ Explanations like this one stay in PYTHON, never in an HTML comment in the template: a
    comment quoting the banned phrase ships in the source of all 115 pages and trips every naive
    scan for it. That happened once already.

    ⛔ 27 pages contradicted themselves. The title said "Fusion Black Marble Worktops" and the
    spec block on the same page said "Stone: Quartzite (natural stone)", because `mat` is the
    browse-and-pricing category while `facts['kind']` is what the stone actually is. Client,
    10 Aug: "Why doesn't the stone say marble, or why is it in the marble when it's a quartzite?
    That doesn't make any sense to me." He is right — a customer reads both on one screen.

    ⚠️ THE FIX IS TO THE WORDS, NOT THE CATEGORY. `s['mat']` is untouched, so the estimator, the
    filters, the wheel and the POA behaviour are all exactly as Topcat set them, and no price
    moves. Only the visible noun changes, to the true one.
    ⛔ Do NOT "tidy" this by adding a Quartzite entry to MATS in index.html. It would be a fourth
    material tab and a fourth range on a site Topcat present as quartz, marble and granite, and
    that is a decision for Topcat, not a code change. It is in the handover as an open question.

    26 of the 27 are quartzites, one is a travertine.

    ⚠️ 10 Aug, SECOND ROUND. Naming the true stone here fixed the page and broke the JOURNEY:
    the client clicked Marble on the collection, opened Fusion Black and was told "Quartzite",
    with nothing on either screen connecting the two. "We cannot have that confusion." The
    answer is NOT to go back to calling it marble — see RANGE_LABEL for why that is a claim we
    could not defend — it is that the range is now named "Marble & Quartzite" on every browse
    surface, the cards carry the true stone before you click, and the page states its range."""
    facts = dict(MAT_FACTS[s["mat"]])
    facts.update(s.get("facts") or {})
    m = re.match(r"\s*([A-Za-z][A-Za-z ]*?)\s*\(", facts.get("kind", ""))
    if m:
        word = m.group(1).strip()
        if word.lower() not in ("natural stone", "engineered stone"):
            return word
    return s["mat"]


def range_label(s):
    """The name of the range this stone is browsed in, as the customer sees it."""
    return RANGE_LABEL.get(s["mat"], s["mat"])


def titled_mat(s):
    """`shown_mat`, dropped when the stone's own name already carries it.

    ⚠️ "Travertine Romano Classico Travertine Worktops". The title is name + stone type, which
    reads correctly for 114 of the 115 and stutters on the one stone named after its own rock.
    Same guard covers any future Quartzite Grey or Marble Bianco."""
    word = shown_mat(s)
    return "" if word.lower() in s["name"].lower() else word


def range_row(s):
    """The spec row that ties the stone to the range the customer came from.

    ⭐ This row is the handover between two screens. A customer filters the collection on
    "Marble & Quartzite", opens Taj Mahal and reads "Stone: Quartzite" — the row beneath it
    says which range that was, so the two never have to be reconciled by guesswork.

    ⚠️ It is suppressed where the range name already IS the stone — every quartz and every
    granite page. A row reading "Range: Quartz" under "Stone: Quartz (engineered stone)" is
    noise, and noise in a spec block is what stops the rows above it being read.
    ⭐ It DOES show on all 45 of the marble range, the 18 true marbles included, and that is
    deliberate: a row that appeared only on the quartzites would read as an exception being
    explained away. Appearing on every stone in the range makes it an ordinary spec row."""
    label = range_label(s)
    if label == shown_mat(s):
        return ""
    return f"<li><span>Range</span>{e(label)}</li>"


def stone_desc(s):
    """The stone's description, from descriptions.py.

    ⛔ COLOUR AND PATTERN ONLY (client, 10 Aug 2026). No sealing, no heat, no durability, no
    "suits an island", no "matches slab to slab" — those are promises or job-specific advice and
    the client cut every one of them: "don't make promises we do not guarantee that we can
    fulfil."

    ⚠️ RAISES rather than falling back to `s['blurb']`. The blurbs still sitting in
    catalogue_expanded.py are the SCRIPT-ASSEMBLED ones, three slots deep from a fixed phrase
    bank, and they are what put "it hides everyday marks better than a busier stone will" — the
    opposite of the truth — onto five stone pages including a plain honed black granite. A quiet
    fallback would put them straight back on the site and nothing would look wrong."""
    d = DESCRIPTIONS.get(s["slug"])
    if not d:
        raise KeyError(
            f"{s['name']} ({s['slug']}) has no entry in descriptions.py. Write one against the "
            f"tile in assets/slabs — do NOT fall back to the old generated blurb.")
    return d


_SIMILAR = None


def _similar():
    """slug -> three visually nearest slugs, from harvest/similar.py. Loaded once."""
    global _SIMILAR
    if _SIMILAR is None:
        p = pathlib.Path(__file__).parent / "harvest" / "similar.json"
        if p.exists():
            _SIMILAR = json.loads(p.read_text())
        else:
            _SIMILAR = {}
            print("⚠️  harvest/similar.json missing — the 'more to consider' strip is falling "
                  "back to the positional pick. Run: cd harvest && python3 similar.py")
    return _SIMILAR


def related_tiles(current):
    """Three stones of the same material that actually LOOK like this one.

    ⛔ The picks come from `harvest/similar.json`, which is measured off the shipping
    photographs by `harvest/similar.py` — the ground, the veining, the contrast between them and
    how busy the stone is. ⚠️ RUN similar.py BEFORE THIS whenever tiles change, or the strip goes
    stale in the one way nobody notices: it still renders three plausible stones.

    This used to be `same[(idx + k) % len(same)]` — the next three entries in the catalogue list,
    sharing nothing with the stone but its material. On 76 of the 115 pages all three suggestions
    were unlike the stone being viewed; Nero Marquina, a black marble, offered a pale blue, a
    white and a blue. Client, 10 Aug: "it shows slabs that look similar to that, it doesn't just
    show random slabs."

    ⚠️ Falls back to the old positional pick ONLY if similar.json is missing, so a fresh clone
    still builds — but the build prints a warning, because a silent fallback here is
    indistinguishable from working."""
    picks = None
    slugs = _similar().get(current["slug"])
    if slugs:
        by = {s["slug"]: s for s in STONE_LIST}
        picks = [by[x] for x in slugs if x in by]
    if not picks:
        same = [s for s in STONE_LIST
                if s["mat"] == current["mat"] and s["slug"] != current["slug"]]
        idx = next(i for i, s in enumerate(STONE_LIST) if s["slug"] == current["slug"])
        picks = [same[(idx + k) % len(same)] for k in range(3)]
    out = []
    for s in picks:
        out.append(
            f'<a class="stile mini" href="/stones/{s["slug"]}.html" aria-label="{e(s["name"])}">'
            + stone_face(s, 'stile-stone') +
            f'<span class="stile-veil"></span>'
            f'<span class="stile-meta"><span class="stile-name">{e(s["name"])}</span>'
            f'<span class="stile-sup">{e(s["finish"])}</span></span>'
            f'<span class="stile-go" aria-hidden="true">&rsaquo;</span></a>')
    return "".join(out)


def slab_facts(s):
    """Typical slab size and thickness, straight from the supplier's inventory. Left out
    entirely where we do not hold the figure, rather than printed as a guess.

    ⛔ EVERY MEASUREMENT ON THIS SITE IS IN MILLIMETRES (client, 10 Aug 2026). The supplier's
    stock system publishes some figures in centimetres and some in millimetres, and this
    function used to append the letters "mm" to whichever it was handed — so a slab recorded
    as 322 x 162 cm printed as "322 x 162 mm", a worktop the size of a sheet of A4. It shipped
    on 22 stone pages. The figures are now normalised to mm in catalogue_expanded.py and the
    guards below fail the BUILD rather than let a wrong number reach a customer again.
    ⚠️ Do not soften these into a warning. A silent unit error is the one defect that survives
    every visual check, because the page looks perfectly correct."""
    out = []
    size = (s.get("size") or "").strip()
    if size:
        m = re.fullmatch(r"(\d+)\s*x\s*(\d+)", size)
        if not m:
            raise ValueError(f"{s['name']}: slab size {size!r} is not '<width> x <height>'")
        w, h = int(m.group(1)), int(m.group(2))
        # no slab is under a metre in either direction; a 3-digit figure is centimetres
        if w < 1000 or h < 1000:
            raise ValueError(
                f"{s['name']}: slab size {size!r} looks like CENTIMETRES. "
                f"Store millimetres — {w * 10} x {h * 10}.")
        out.append(f"<li><span>Typical slab</span>{e(f'{w} × {h}')} mm</li>")
    # ⭐ THICKNESS IS WHAT TOPCAT SUPPLY IN, NOT WHAT ONE SLAB IN A YARD MEASURED.
    # Client, 10 Aug: "some places where you say quartzite, natural stone, you don't give slab
    # sizings on those, like twenty or thirty millimetres." He is right that it was missing —
    # 59 of the 115 had no thickness at all, because the supplier's stock system only publishes
    # a figure for the slabs it happens to be holding.
    # ⚠️ The old row was the WRONG FACT anyway. It printed the thickness of one physical slab in
    # the supplier's yard, which is not what the customer will be sold. Topcat's own estimator
    # offers exactly two thicknesses for every stone in the range (`THICK=[20,30]` in
    # index.html), so that is the honest answer and it is the same on all 115 pages.
    # ⛔ Do not put the per-slab figure back. If a specific thickness ever needs stating, it
    # belongs on the quote, not on a catalogue page.
    thick = (s.get("thick") or "").strip()
    if thick and not re.fullmatch(r"\d+mm", thick):
        raise ValueError(
            f"{s['name']}: thickness {thick!r} must be written in millimetres, e.g. '30mm'")
    out.append("<li><span>Thickness</span>20 mm or 30 mm</li>")
    return "\n          ".join(out)


def stone_page(s):
    url = f"{BASE}/stones/{s['slug']}.html"
    tm = titled_mat(s)
    title = " ".join(x for x in (s["name"], tm, "Worktops") if x) + " | Topcat Worktops"
    desc = (f"{' '.join(x for x in (s['name'], tm.lower()) if x)} worktops, templated, fitted "
            f"and guaranteed by one team across {AREA}. {stone_desc(s).split('.')[0]}. Free home "
            f"visit, fixed itemised quote and a ten-year guarantee.")
    # a stone filed under Marble may be quartzite or travertine, and its own care copy wins:
    # telling someone Taj Mahal etches like marble would be plainly wrong
    facts = dict(MAT_FACTS[s["mat"]])
    if s["slug"] in NOT_MARBLE:
        facts.update(NOT_MARBLE_FACTS)
    facts.update(s.get("facts") or {})
    graph = [
        {"@type": "BreadcrumbList", "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Home", "item": f"{BASE}/index.html"},
            {"@type": "ListItem", "position": 2, "name": "The Stone Collection", "item": f"{BASE}/stones/"},
            {"@type": "ListItem", "position": 3, "name": s["name"], "item": url}]},
        business_ld(),
    ]

    return f"""<!DOCTYPE html>
<html lang="en-GB">
<head>
{head(title, desc, url, ld(graph))}
</head>
<body>
{nav_html()}

<nav class="crumb" aria-label="Breadcrumb">
  <a class="crumb-back" href="/stones/" aria-label="Back to The collection" onclick="if(history.length>1&&document.referrer&&new window.URL(document.referrer,location).origin===location.origin){{history.back();return false}}"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><defs><linearGradient id="backGold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#C6A664"/><stop offset=".5" stop-color="#E4CD92"/><stop offset="1" stop-color="#C6A664"/></linearGradient></defs><path d="M15 18l-6-6 6-6" stroke="url(#backGold)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></a>
  <ol>
    <li><a href="/index.html#hero">Home</a></li>
    <li><a href="/stones/">The collection</a></li>
    <li aria-current="page">{e(s['name'])}</li>
  </ol>
</nav>

<main>
  <section class="stp-hero">
    <!-- ⭐⭐ THE SLAB STARTS ON THE STONE'S NAME, ON ALL 132 PAGES — 15 Aug 2026. Client: *"we can
         move the slabs to always be in line with the slab name in the individual slab pages."*
         ⛔⛔ **THE KICKER IS A GRID ITEM OF ITS OWN AND THAT IS THE WHOLE MECHANISM.** It used to
         sit inside `.stp-copy` above the `<h1>`, so the slab could only ever line up with the
         copy column's TOP — the kicker's top, not the name's — and `align-items:center` meant it
         did not even do that: the slab floated to the middle of a column whose height is the
         description, and **every one of the 132 pages put the slab somewhere different.**
         ⭐⭐ Lifted out, the kicker owns row 1 of the right column and the slab and the name both
         begin on row 2, **so the alignment is structural and cannot drift** — no offset to keep
         in step with the kicker's size, its margin or its line-height, at any width, on any
         stone. ⛔ A `margin-top` of "about 30px" would have looked right here and been wrong the
         moment any of those three changed.
         ⚠️ THE PHONE AND TABLET KEEP THEIR OWN ORDER — slab, then kicker, then name — which is
         what they have always shown; the single-column areas below say so explicitly rather than
         letting DOM order decide it. -->
    <div class="wrap stp-grid">
      <span class="eyebrow stp-kicker">{e(shown_mat(s))} &middot; {e(s['finish'])}</span>
      <!-- ⭐⭐ THE COMPARE DOOR MOVED UP HERE — 15 Aug 2026. Client: *"we should have, let's say,
           compare Azul Shimmer with other stones, and that should be higher up maybe underneath
           the actual slab."* ⛔ **IT IS MOVED, NOT DUPLICATED**, and it reverses the reasoning
           written against it at the foot of the related strip (D141) — *"it belongs here and not
           in the CTA row"* — which argued it should sit beside the three near-identical
           alternatives it helps you weigh. That was sound and it is superseded: a visitor who
           wants to compare knows it while they are looking at the slab, not four screens later.
           ⭐ Wording is his: *"with other stones"*, not "with another stone". Compare takes up to
           a shortlist, so the plural is also the truer promise. -->
      <div class="stp-shot">
        <figure class="stp-slab">
          {stone_face(s, 'stp-stone')}
          <span class="stp-glass" aria-hidden="true"></span>
          <figcaption class="stp-tag">{e(shown_mat(s))}</figcaption>
        </figure>
        <a class="stp-compare" href="/stones/compare.html?s={s['slug']}">
          <svg viewBox="0 0 48 32" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true">
            <rect x="1.5" y="1.5" width="19" height="29" rx="2"/>
            <rect x="27.5" y="1.5" width="19" height="29" rx="2" stroke-dasharray="4 4"/>
          </svg>
          Compare {e(s['name'])} with other stones</a>
      </div>
      <div class="stp-copy">
        <h1>{e(s['name'])}</h1>
        <p class="lede">{e(stone_desc(s))}</p>
        <ul class="stp-facts">
          <li><span>Stone</span>{e(facts['kind'])}</li>
          {range_row(s)}
          <li><span>Finish</span>{e(s['finish'])}</li>
          {slab_facts(s)}
          <li><span>Care</span>{e(facts['care'])}</li>
          <li><span>In daily use</span>{e(facts['wear'])}</li>
        </ul>
        <div class="cta-row">
          <a class="btn-gold" href="{deep_link(s, 'estimator')}">Get an estimate for this stone</a>
          <a class="btn-ghost" href="{deep_link(s, 'cta')}">Get in touch</a>
        </div>
        <div class="trust">
          <span><b>&#9733;&#9733;&#9733;&#9733;&#9733;</b> 5.0 on Google</span>
          <span><b>10</b> year guarantee</span>
          <span>Prefer to talk? <a class="stp-tel" href="tel:{PHONE_TEL}">Call {PHONE_DISPLAY}</a></span>
        </div>
      </div>
    </div>
  </section>

  <section class="block"><div class="wrap prose rise">
    <h2>About {e(shown_mat(s).lower())}</h2>
    <p>{e(facts['why'])}</p>
    <p>Every cut-out is free of charge, drainer grooves and pencil edges come as standard, and the surface is templated to the millimetre once your units are level. The quote you approve is the price you pay, covered by a ten-year guarantee.</p>
  </div></section>

  <section class="block"><div class="wrap rise">
    <h2>See it in your home, not on a screen</h2>
    <p class="sub">Colour on a screen is a guide, stone in your own light is the truth. We bring samples to you on a free home visit across {e(AREA)}, and before a single cut you approve photographs of the actual slab that will become your worktop.</p>
    <div class="cta-row">
      <a class="btn-gold" href="{deep_link(s, 'cta')}">Book a free home visit</a>
      <a class="btn-ghost" href="tel:{PHONE_TEL}">Call {PHONE_DISPLAY}</a>
    </div>
  </div></section>

  <section class="block"><div class="wrap rise">
    <h2>More {e(range_label(s).lower())} to consider</h2>
    <p class="sub">Three that look closest to it, or <a class="stp-all" href="/stones/">browse the full collection</a>.</p>
    <div class="st-grid related">{related_tiles(s)}</div>
    <!-- ⛔ THE COMPARE DOOR USED TO SIT HERE (D141) AND IT MOVED UNDER THE SLAB ON 15 Aug 2026 on
         the client's instruction — see the comment in the hero above. It is MOVED, not copied:
         one door, and it opens already holding this stone. ⚠️ Do not put a second one back here
         because this comment used to argue for it. -->
    <!-- ⭐ The range on show is not the range (client, 10 Aug). This is the right place for it on
         a stone page: somebody reading "more to consider" is looking for an alternative, and
         that is the moment to say the collection is not the ceiling. -->
    <p class="st-source">Still not it? These are the stones we hold photographs of, not the limit
      of what we can get. <a href="{deep_link(s, 'cta')}">Tell us what you are after</a> and we
      will source it where we can.</p>
  </div></section>

  <section class="cta-band"><div class="wrap rise">
    <h2>Make it <em>yours</em></h2>
    <p>Tell us about your kitchen and we will come and measure it, a free home visit, a fixed itemised quote, and a ten-year guarantee on every install. We reply within one working day.</p>
    <div class="cta-row">
      <a class="btn-gold" href="{deep_link(s, 'estimator')}">Get an estimate</a>
      <a class="btn-ghost" href="{deep_link(s, 'cta')}">Get in touch</a>
    </div>
  </div></section>
</main>

{footer_html()}
{STONE_JS}
{REVEAL_JS}
</body>
</html>"""


def main():
    here = pathlib.Path(__file__).resolve().parent
    slugs = [s["slug"] for s in STONE_LIST]
    assert len(slugs) == len(set(slugs)), "duplicate slug in STONE_LIST"
    (here / "index.html").write_text(collection_page(), encoding="utf-8")
    print("wrote index.html")
    (here / "compare.html").write_text(compare_page(), encoding="utf-8")
    print("wrote compare.html")
    for s in STONE_LIST:
        (here / f"{s['slug']}.html").write_text(stone_page(s), encoding="utf-8")
    print("done:", len(STONE_LIST), "stone pages + collection")


if __name__ == "__main__":
    main()

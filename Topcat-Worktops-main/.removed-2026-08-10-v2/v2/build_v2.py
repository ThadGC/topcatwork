# -*- coding: utf-8 -*-
"""Builds every V2 page from one design system + structured content."""
import io, os, json, re

ROOT = "/Users/thadeusgous/Documents/TOPCAT WORKTOPS/Topcat-Worktops-main/Website Demo/v2"
PHONE = "0800 098 2812"
TEL = "+448000982812"
EMAIL = "info@topcatworktops.co.uk"
TOWNS = ("across London, Hertfordshire, Essex and Berkshire, from St Albans, Harpenden, "
         "Watford and Barnet to Chelmsford, Brentwood, Reading and Windsor, with nationwide "
         "templating available across the UK.")

MARK = ('<svg class="bmark" viewBox="0 0 494 489" fill="none" aria-hidden="true">'
        '<path d="M0,0 L414,0 L406,15 L397,31 L224,32 L224,225 L217,233 L208,242 L204,241 '
        'L189,226 L189,31 L17,31 L5,10 Z" fill="currentColor" transform="translate(40,40)"/>'
        '<path d="M0,0 L129,0 L129,178 L133,180 L160,207 L167,201 L173,195 L177,195 L184,203 '
        'L189,207 L218,178 L220,177 L221,0 L350,0 L348,5 L333,30 L332,31 L255,31 L255,191 '
        'L223,223 L215,230 L202,243 L208,250 L242,284 L236,291 L228,299 L220,306 L197,329 '
        'L189,336 L176,349 L172,347 L160,335 L152,328 L138,314 L130,307 L108,285 L110,281 '
        'L147,244 L145,240 L135,230 L127,223 L106,202 L98,195 L95,192 L95,31 L17,31 L9,18 '
        'L0,2 Z M174,265 L155,284 L157,288 L174,305 L181,299 L194,286 L192,282 L175,265 Z" '
        'fill="currentColor" transform="translate(72,100)"/></svg>')

SEAL = ('<svg viewBox="0 0 200 200" fill="none" aria-hidden="true">'
        '<circle cx="100" cy="100" r="92" stroke="currentColor" stroke-width="1.2" opacity="0.5"/>'
        '<circle cx="100" cy="100" r="84" stroke="currentColor" stroke-width="0.6" opacity="0.35"/>'
        '<path d="M100 44 L100 96" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>'
        '<path d="M78 96 L100 96 L122 96 L100 124 Z" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/>'
        '<path d="M100 124 L100 150" stroke="currentColor" '
        'stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"/>'
        '<rect x="93" y="131" width="14" height="14" transform="rotate(45 100 138)" '
        'stroke="currentColor" stroke-width="1.6"/></svg>')

SURFACES = [("kitchens", "Kitchens"), ("bathrooms", "Bathrooms"),
            ("commercial", "Commercial"), ("outdoor", "Outdoor kitchens")]
MATERIALS = [("quartz", "Quartz"), ("marble", "Marble"),
             ("granite", "Granite")]
AREAS = [("st-albans", "St Albans"), ("harpenden", "Harpenden"), ("watford", "Watford"),
         ("hemel-hempstead", "Hemel Hempstead"), ("barnet", "Barnet"), ("enfield", "Enfield")]


def nav(p):
    """p = relative prefix to v2 root."""
    sur = "".join('<a href="%ssurfaces/%s.html">%s</a>' % (p, s, n) for s, n in SURFACES)
    mat = "".join('<a href="%smaterials/%s.html">%s</a>' % (p, s, n) for s, n in MATERIALS)
    return """<nav class="nav">
  <a class="brand" href="{p}index.html" aria-label="TopCat Worktops, home">
    {mark}
    <span><span class="bname">TOPCAT</span><span class="bsub">WORKTOPS</span></span>
  </a>
  <div class="nav-links">
    <div class="has-menu"><button aria-expanded="false">Surfaces <span aria-hidden="true">&#9662;</span></button>
      <div class="menu">{sur}</div></div>
    <div class="has-menu"><button aria-expanded="false">Materials <span aria-hidden="true">&#9662;</span></button>
      <div class="menu">{mat}</div></div>
    <a href="{p}process.html">Process</a>
    <a href="{p}projects.html">Projects</a>
    <a href="{p}origin.html">Origin</a>
    <a href="{p}about.html">About</a>
    <a href="{p}trade.html">Trade</a>
    <a href="{p}faq.html">FAQ</a>
  </div>
  <div class="nav-cta">
    <a href="tel:{tel}" class="btn btn-ghost">{phone}</a>
    <a href="{p}contact.html" class="btn btn-gold">Get a quote</a>
  </div>
  <button class="burger" aria-label="Menu" aria-expanded="false"><span></span><span></span><span></span></button>
</nav>
<div class="mnav">
  <span class="mn-k">Surfaces</span>
  {msur}
  <span class="mn-k">Materials</span>
  {mmat}
  <span class="mn-k">Studio</span>
  <a href="{p}process.html">Process</a>
  <a href="{p}origin.html">Origin</a>
  <a href="{p}projects.html">Projects</a>
  <a href="{p}about.html">About</a>
  <a href="{p}guarantee.html">Guarantee</a>
  <a href="{p}care.html">Care</a>
  <a href="{p}trade.html">Trade</a>
  <a href="{p}faq.html">FAQ</a>
  <a href="{p}contact.html">Get a quote</a>
</div>""".format(p=p, mark=MARK, sur=sur, mat=mat,
                 msur="".join('<a href="%ssurfaces/%s.html">%s</a>' % (p, s, n) for s, n in SURFACES),
                 mmat="".join('<a href="%smaterials/%s.html">%s</a>' % (p, s, n) for s, n in MATERIALS),
                 tel=TEL, phone=PHONE)


def footer(p):
    sur = "".join('<li><a href="%ssurfaces/%s.html">%s</a></li>' % (p, s, n) for s, n in SURFACES)
    mat = "".join('<li><a href="%smaterials/%s.html">%s</a></li>' % (p, s, n) for s, n in MATERIALS)
    return """<footer class="foot">
  <div class="foot-grid">
    <div>
      <a class="brand" href="{p}index.html" style="margin-bottom:16px">{mark}
        <span><span class="bname">TOPCAT</span><span class="bsub">WORKTOPS</span></span></a>
      <p class="body-muted" style="font-size:.86rem;max-width:32ch">A London and Hertfordshire stone studio, cutting and fitting bespoke surfaces for kitchens, bathrooms and commercial rooms.</p>
      <p class="foot-strap">Surfaces worth building around</p>
      <div style="display:flex;gap:16px;margin-top:14px">
        <a href="https://www.instagram.com/topcatworktops/" target="_blank" rel="noopener" aria-label="Topcat Worktops on Instagram" style="font-size:.72rem;letter-spacing:.16em;text-transform:uppercase">Instagram</a>
        <a href="https://www.linkedin.com/company/topcat-worktops/" target="_blank" rel="noopener" aria-label="Topcat Worktops on LinkedIn" style="font-size:.72rem;letter-spacing:.16em;text-transform:uppercase">LinkedIn</a>
      </div>
    </div>
    <div><div class="foot-k">Surfaces</div><ul>{sur}</ul></div>
    <div><div class="foot-k">Materials</div><ul>{mat}
      <li><a href="{p}care.html">Care &amp; maintenance</a></li>
      <li><a href="{p}origin.html">Origin</a></li></ul></div>
    <div>
      <div class="foot-k">Studio</div>
      <ul>
        <li><a href="tel:{tel}">{phone}</a></li>
        <li><a href="mailto:{email}">{email}</a></li>
        <li><a href="{p}about.html">About us</a></li>
        <li><a href="{p}guarantee.html">Guarantee</a></li>
        <li><a href="{p}trade.html">Trade enquiries</a></li>
        <li><a href="{p}contact.html">Get a quote</a></li>
      </ul>
      <div class="foot-k" style="margin-top:22px">Hours</div>
      <p class="body-muted" style="font-size:.82rem">Monday to Friday, 8am to 6pm</p>
    </div>
  </div>
  <div class="foot-grid" style="margin-top:clamp(28px,4vh,44px)">
    <div style="grid-column:1/-1">
      <div class="foot-k">Areas we cover</div>
      <p class="areas-line">{towns} <a href="{p}areas.html" style="color:var(--champagne)">See all areas</a></p>
    </div>
  </div>
  <div class="foot-base">
    <span>&copy; 2026 TopCat Worktops Ltd. All rights reserved.</span>
    <span>Version 2 &middot; <a href="/index.html">View version 1</a></span>
  </div>
</footer>
<div class="mobile-bar">
  <a href="tel:{tel}">Call the studio</a>
  <a href="{p}contact.html" class="pri">Get a quote</a>
</div>
<div class="vpill"><a href="/index.html">V1</a><a href="/v2/index.html" class="on">V2</a></div>
<script src="{p}assets/brand.js"></script>""".format(
        p=p, mark=MARK, sur=sur, mat=mat, tel=TEL, phone=PHONE, email=EMAIL, towns=TOWNS)


def head(title, desc, p, canon, extra_ld=None):
    ld = ""
    if extra_ld:
        ld = '<script type="application/ld+json">%s</script>' % json.dumps(extra_ld, ensure_ascii=False)
    return """<!doctype html>
<html lang="en-GB">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<meta name="description" content="{desc}">
<meta name="theme-color" content="#0B0B0D">
<link rel="canonical" href="https://www.topcatworktops.co.uk/{canon}">
<meta property="og:type" content="website">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta property="og:locale" content="en_GB">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 494 489'%3E%3Cpath d='M0,0 L414,0 L406,15 L397,31 L224,32 L224,225 L217,233 L208,242 L204,241 L189,226 L189,31 L17,31 L5,10 Z' fill='%23C6A664' transform='translate(40,40)'/%3E%3C/svg%3E">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700&family=Montserrat:wght@300;400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="{p}assets/brand.css">
{ld}
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<div class="vein-rail" aria-hidden="true"><span class="track"></span><span class="fill"></span><span class="bob"></span></div>
{nav}
<main id="main">""".format(title=title, desc=desc, p=p, canon=canon, ld=ld, nav=nav(p))


def phead(eyebrow, h1, lead, crumbs, p, stone=None):
    c = '<div class="crumb"><a href="%sindex.html">Home</a>' % p
    for label, href in crumbs:
        c += '<span class="sep">/</span>' + (('<a href="%s">%s</a>' % (href, label)) if href else '<span>%s</span>' % label)
    c += '</div>'
    bg = ''
    if stone:
        bg = ('<div style="position:absolute;inset:0;opacity:.16" data-stone="%s" data-seed="%d" aria-hidden="true"></div>'
              '<div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(11,11,13,.86),rgba(11,11,13,.97))" aria-hidden="true"></div>'
              % (stone, abs(hash(h1)) % 9000))
    return """<header class="phead">
  {bg}<div class="hero-glow" aria-hidden="true"></div>
  <div class="phead-inner">
    {c}
    <p class="eyebrow rise">{eyebrow}</p>
    <h1 class="rise" style="--d:60ms;max-width:20ch">{h1}</h1>
    <p class="lead rise" style="--d:140ms;max-width:56ch">{lead}</p>
  </div>
</header>""".format(bg=bg, c=c, eyebrow=eyebrow, h1=h1, lead=lead)


def prose(inner, cls="sect", narrow=True):
    return '<section class="%s"><div class="%s"><div class="prose rise">%s</div></div></section>' % (
        cls, "wrap-narrow" if narrow else "wrap", inner)


def cards(title, sub, items, cls="sect on-slate", cols="g3", eyebrow=None):
    h = '<div class="wrap"><div class="center" style="margin-bottom:clamp(32px,5vh,54px)">'
    if eyebrow:
        h += '<p class="eyebrow center rise">%s</p>' % eyebrow
    h += '<h2 class="rise" style="--d:60ms;max-width:22ch;margin-inline:auto">%s</h2>' % title
    if sub:
        h += '<p class="lead rise" style="--d:140ms">%s</p>' % sub
    h += '</div><div class="grid %s">' % cols
    for i, (t, d) in enumerate(items):
        h += ('<div class="card rise" style="--d:%dms"><h3>%s</h3><p>%s</p></div>' % (i * 70, t, d))
    h += '</div></div>'
    return '<section class="%s">%s</section>' % (cls, h)


def faq_block(items, title="Common questions", cls="sect"):
    h = ('<div class="wrap-narrow"><div class="center" style="margin-bottom:clamp(26px,4vh,42px)">'
         '<h2 class="rise">%s</h2></div><div class="rise">' % title)
    for q, a in items:
        h += ('<div class="faq-item"><button class="faq-q">%s<span class="ind"></span></button>'
              '<div class="faq-a"><div><p>%s</p></div></div></div>' % (q, a))
    h += '</div></div>'
    return '<section class="%s">%s</section>' % (cls, h)


def cta(p, title="Tell us about your room", line=None):
    line = line or ("A free home visit, a fixed itemised quote, and a ten-year guarantee on every "
                    "install. We reply within one working day.")
    return """<section class="sect on-slate-2">
  <div class="wrap center">
    <p class="eyebrow center rise">Get started</p>
    <h2 class="rise" style="--d:60ms;max-width:20ch;margin-inline:auto">{title}</h2>
    <p class="lead rise" style="--d:140ms">{line}</p>
    <div class="btn-row rise" style="--d:220ms;margin-top:28px">
      <a href="{p}contact.html" class="btn btn-gold">Get your free quote</a>
      <a href="tel:{tel}" class="btn btn-ghost">{phone}</a>
    </div>
  </div>
</section>""".format(title=title, line=line, p=p, tel=TEL, phone=PHONE)


def close(p):
    return "</main>\n" + footer(p) + "\n</body>\n</html>\n"


def write(relpath, html):
    full = os.path.join(ROOT, relpath)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    io.open(full, "w", encoding="utf-8").write(html)
    return relpath


PAGES = []

# ============================================================== INDEX (inject)
IDX_SRC = os.path.join(os.path.dirname(os.path.abspath(__file__)), "index.src.html")
idx_path = os.path.join(ROOT, "index.html")
if os.path.exists(IDX_SRC):
    idx = io.open(IDX_SRC, encoding="utf-8").read()
else:                                   # first run: stash the source with placeholders
    idx = io.open(idx_path, encoding="utf-8").read()
    io.open(IDX_SRC, "w", encoding="utf-8").write(idx)
assert "<!--#NAV#-->" in idx and "<!--#FOOTER#-->" in idx
io.open(idx_path, "w", encoding="utf-8").write(
    idx.replace("<!--#NAV#-->", nav("")).replace("<!--#FOOTER#-->", footer("")))
PAGES.append("index.html")

# ============================================================== MATERIAL PAGES
MAT = {
 "quartz": dict(
  name="Quartz", stone="quartz",
  title="Quartz Worktops in St Albans, Hertfordshire &amp; London | TopCat",
  desc="Bespoke quartz worktops supplied and fitted across St Albans, Hertfordshire and London. Non-porous, never needs sealing, fixed itemised pricing and a ten-year guarantee.",
  h1="Quartz worktops, the <em>sensible default</em>",
  lead="Non-porous, hard-wearing and consistent slab to slab. For most busy kitchens it is the surface we would put in our own homes.",
  intro=["<p class=\"lead\">Engineered quartz is roughly ninety-three per cent crushed natural quartz bound with a small amount of resin. That mix is why it behaves so well in a real kitchen: it is non-porous, so it never needs sealing, it resists staining, and the colour is consistent from one slab to the next.</p>",
         "<p>It is also the reason we fit more quartz than anything else. If you want the look of Calacatta marble without spending the next twenty years worrying about a glass of red wine, quartz is the honest answer.</p>"],
  good=["Non-porous, so it never needs sealing", "Excellent stain resistance for everyday kitchen life",
        "Consistent colour and pattern, so a sample represents the slab",
        "Huge range, including convincing marble-effect designs",
        "Hygienic and easy to live with, ideal for families"],
  watch=["Use a trivet: the resin can scorch above roughly 150&deg;C",
         "Not for outdoors or strong direct sunlight, as UV can fade some colours over time",
         "Wipe strongly coloured spills such as curry, red wine or turmeric before they dry",
         "Very dark, high-gloss finishes show fingerprints and water marks more readily"],
  best="Busy family kitchens, utility rooms, bathrooms and anywhere that wants a beautiful surface with the least possible upkeep.",
  faqs=[("Do quartz worktops need sealing?","No. Quartz is non-porous and never needs sealing, which is one of its biggest practical advantages over natural stone. Day to day it needs nothing more than warm soapy water or a mild pH-neutral spray and a soft cloth."),
        ("Can you put a hot pan on quartz?","Best not to. The resin that binds quartz can scorch or discolour above roughly 150 degrees, and a pan straight from the hob can leave a permanent mark. Always use a trivet. If you want to put pans down without thinking, granite is the better choice."),
        ("Does quartz scratch or chip?","It is very scratch-resistant in normal use, but no surface is scratch-proof, so cut on a board. The most vulnerable point is a sharp edge or the corner beside the sink, where a heavy dropped pan can chip it. Most chips can be repaired invisibly by a professional."),
        ("Is quartz safe to have in my home?","Yes. A finished, sealed quartz worktop is inert and completely safe to live with and prepare food on. The silica risk in the news is occupational, affecting people who cut stone, which is why fabrication is cut wet with full dust suppression to current HSE standards."),
        ("Is quartz cheaper than granite?","They overlap heavily and it varies by colour and range. Mid-range quartz and granite are broadly comparable, though quartz often works out slightly better over time because it never needs resealing.")]),
 "marble": dict(
  name="Marble", stone="calacatta",
  title="Marble Worktops in St Albans, Hertfordshire &amp; London | TopCat",
  desc="Bespoke marble worktops, Calacatta, Carrara and Statuario, supplied and fitted across Hertfordshire and London. Honest advice on etching, patina and care.",
  h1="Marble, the real thing, <em>honestly explained</em>",
  lead="Nothing else looks like it. It is also the material we give the most honest advice on, because we would rather guide you well than fit a surface you come to resent.",
  intro=["<p class=\"lead\">Marble is quarried natural stone, prized for its veining: Calacatta with its bold gold and grey, Carrara with its soft feathered grey, Statuario with its bright white field. No two slabs are the same, and the good ones are genuinely beautiful in a way engineered stone cannot quite reach.</p>",
         "<p>It is also porous and reacts to acid. Lemon juice, vinegar, wine and some cleaners will etch it, leaving a dull mark in the polish. That is not damage in the structural sense, and it can often be re-polished, but it is a change, and it will happen.</p>",
         "<p>Plenty of people love that. A marble worktop that has been cooked on for ten years develops a patina, a record of the life lived around it. If that sounds like character to you, marble is a joy. If it sounds like a fault, we will show you a marble-effect quartz instead and you will be happier for it.</p>"],
  good=["Genuinely unique: your slab exists once","The most beautiful veining of any surface, especially Calacatta",
        "Naturally cool, which is why pastry chefs prefer it","Ages into a patina that many owners come to love",
        "A true statement piece for an island or a bathroom"],
  watch=["It etches: acids dull the polish, and that is normal behaviour, not a defect",
         "Porous, so it needs sealing once or twice a year","Wipe spills promptly, especially wine, citrus and oil",
         "Softer than granite, so it marks more easily","Best avoided as a hard-working family kitchen surface unless you want the patina"],
  best="Islands, bathrooms and vanity tops, baking areas, and anyone who wants the real thing and accepts a living finish.",
  faqs=[("What is the difference between etching and staining?","Etching is a change to the surface polish caused by something acidic, and it looks like a dull patch. Staining is discolouration caused by something soaking in, which sealing helps prevent. Etching can often be re-polished out; a stain needs drawing out with a poultice."),
        ("How often does marble need sealing?","Once or twice a year for most kitchens, and more often on a heavily used island. It is a quick job you can do yourself with a proprietary stone sealer, and we will show you how before we leave."),
        ("Can I have the marble look without the maintenance?","Yes, and for many households that is the right call. Marble-effect quartz has come a very long way, and the best Calacatta-look ranges are convincing even close up. It is non-porous, never needs sealing and will not etch."),
        ("Is marble suitable for a bathroom?","Very much so. Bathrooms see far less acid than kitchens, so marble behaves beautifully on a vanity top, and it is where we most often recommend it without hesitation.")]),
 "granite": dict(
  name="Granite", stone="granite",
  title="Granite Worktops in St Albans, Hertfordshire &amp; London | TopCat",
  desc="Bespoke granite worktops supplied and fitted across Hertfordshire and London. Heat-tolerant, hard-wearing natural stone with a one-off slab every time.",
  h1="Granite, the <em>dependable classic</em>",
  lead="Quarried natural rock that takes heat, takes wear, and looks like nothing that came out of a factory. The choice for people who distrust anything man-made.",
  intro=["<p class=\"lead\">Granite is an igneous rock, formed under heat and pressure, and it behaves accordingly. It is hard, it tolerates heat far better than quartz, and every slab is a one-off. It has been quietly reliable in British kitchens for decades.</p>",
         "<p>It is slightly porous, so it takes a seal, and it carries considerably less crystalline silica than engineered quartz, which is worth knowing given how much attention that subject now gets.</p>"],
  good=["Excellent heat tolerance, far more forgiving than quartz","Extremely hard-wearing and difficult to scratch",
        "Every slab is unique, from near-black to speckled and flowing","Lower crystalline silica content than engineered quartz",
        "Ages well and stays looking right for decades"],
  watch=["Porous, so it needs sealing once or twice a year","Patterns are busier than most quartz, which not everyone wants",
         "Darker polished granites show water spots and fingerprints","You should view the actual slab, as samples rarely represent the movement"],
  best="Hard-working kitchens, keen cooks, utility and boot rooms, and anyone who wants natural stone that asks very little in return.",
  faqs=[("Can you put a hot pan on granite?","Granite copes with heat far better than quartz and will not scorch from a hot pan in normal use. We still suggest a trivet as good practice, mostly to protect the sealer and to avoid thermal shock on a very cold surface."),
        ("Does granite need sealing?","Yes, once or twice a year depending on use. It is a simple job with a proprietary sealer. A quick test: leave a small pool of water on the surface for a few minutes, and if it darkens the stone, it is ready for resealing."),
        ("Is granite out of fashion?","It went quieter while quartz took over, but good granite has never stopped being a sound choice, and darker honed and leathered finishes look thoroughly current. Fashion is a poor reason to choose a surface you will keep for twenty years.")]),
}

for slug, m in MAT.items():
    faq_ld = {"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [
        {"@type": "Question", "name": re.sub("<[^>]+>", "", q),
         "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in m["faqs"]]}
    body = head(m["title"], m["desc"], "../", "materials/%s.html" % slug, faq_ld)
    body += phead("The material", m["h1"], m["lead"],
                  [("Materials", None), (m["name"], None)], "../", m["stone"])
    body += """<section class="sect"><div class="wrap"><div class="grid g2" style="gap:clamp(30px,5vw,64px);align-items:start">
      <div class="prose rise">%s</div>
      <div class="rise" style="--d:120ms"><div class="slab-frame" data-stone="%s" data-seed="%d" style="aspect-ratio:3/4" data-tilt></div>
      <p style="font-size:.66rem;letter-spacing:.2em;text-transform:uppercase;color:var(--faint);margin-top:12px;text-align:center">%s &middot; every slab generated, like every slab quarried</p></div>
    </div></div></section>""" % ("".join(m["intro"]), m["stone"], abs(hash(slug)) % 9000, m["name"])
    body += """<section class="sect on-slate"><div class="wrap"><div class="grid g2">
      <div class="rise"><h2 style="margin-bottom:18px">What it does <em>well</em></h2><div class="prose"><ul>%s</ul></div></div>
      <div class="rise" style="--d:100ms"><h2 style="margin-bottom:18px">What to <em>watch</em></h2><div class="prose"><ul>%s</ul></div></div>
    </div>
    <div class="card rise" style="margin-top:clamp(26px,4vh,40px)"><h3>Best suited to</h3><p>%s</p></div>
    </div></section>""" % ("".join("<li>%s</li>" % x for x in m["good"]),
                           "".join("<li>%s</li>" % x for x in m["watch"]), m["best"])
    body += faq_block(m["faqs"], "%s, answered" % m["name"])
    body += cta("../", "Thinking about %s?" % m["name"],
                "Tell us how you use the room and we will tell you honestly whether this is the right stone for it.")
    body += close("../")
    PAGES.append(write("materials/%s.html" % slug, body))

# ============================================================== SURFACE PAGES
SUR = {
 "kitchens": dict(
  name="Kitchens", stone="calacatta",
  title="Kitchen Worktops in St Albans, Hertfordshire &amp; London | TopCat Worktops",
  desc="Bespoke kitchen worktops in quartz, marble and granite. Islands, waterfall ends and splashbacks, fitted across Hertfordshire and London.",
  h1="Kitchen worktops, <em>cut for your room</em>",
  lead="The surface the whole kitchen is built around. Islands, runs, waterfall ends and full-height splashbacks, vein-matched so the room reads as one piece.",
  intro=["<p class=\"lead\">A kitchen worktop is the most-touched surface in the house and the one thing that judges everything else in the room. Get it right and the cabinets, the lighting and the floor all look considered. Get it wrong and thousands of pounds of good joinery starts to look cheap.</p>",
         "<p>We cut worktops, islands, breakfast bars, upstands and full-height splashbacks from the same slab wherever the layout allows, so the veining runs on rather than restarting at every join. On an island with mitred waterfall ends we plan the pattern around the corner, so it folds down the side instead of stopping at the edge.</p>"],
  items=[("Worktop runs","Cut to your cabinets, with polished cut-outs for sinks, hobs and sockets, and edge profiles chosen to suit the room rather than the price list."),
         ("Islands and waterfall ends","Mitred so the stone folds to the floor, with the veining planned around each corner so the pattern flows unbroken down the side."),
         ("Full-height splashbacks","The same stone carried up the wall. No grout lines behind the hob, and nothing to scrub."),
         ("Breakfast bars and overhangs","Designed with the right support built in at templating stage, so a generous overhang stays safe as well as elegant."),
         ("Drainer grooves and sills","Milled beside the sink, with matching window sills and shelves to tie the room together."),
         ("Undermount sinks","Fitted beneath the stone for a clean line and an easy wipe-down, which solid stone makes possible.")],
  faqs=[("Do my units need to be fitted before you template?","Yes. Your units must be fully fitted, level and secure, with the sink, hob and tap on site, because we template off the real cabinets. Templating too early is the single most common cause of delays and errors, so we always confirm you are ready before we book it."),
        ("How long does a kitchen take?","From templating, most kitchens are fitted within days, and the fit itself is usually a few hours to a single day. Larger kitchens and islands with waterfall ends take longer, and we confirm dates in writing when you order."),
        ("Do you remove the old worktop?","We can remove and take away your existing worktop. Tell us in advance so it is included in the quote rather than appearing as a surprise on the day."),
        ("Who reconnects the sink and hob?","Plumbing, gas and electrics are reconnected by a qualified plumber or electrician, either yours or one we arrange. We always agree who is doing what before install day so nothing is missed.")]),
 "bathrooms": dict(
  name="Bathrooms", stone="statuario",
  title="Bathroom Worktops &amp; Vanity Tops | Marble &amp; Quartz | St Albans &amp; London",
  desc="Bespoke bathroom surfaces: vanity tops, basin surrounds, bath panels and shower thresholds in marble, quartz and granite, fitted across Hertfordshire and London.",
  h1="Bathrooms and <em>vanity tops</em>",
  lead="The room where marble behaves best. Vanity tops, basin surrounds, bath panels, shelves and shower thresholds, cut from the same slabs as our kitchens.",
  intro=["<p class=\"lead\">Bathrooms are the quiet success story of stone. They see far less acid than a kitchen, so materials we would gently steer you away from beside a hob, marble above all, are perfectly at home on a vanity top.</p>",
         "<p>A bathroom also uses less material than a kitchen, which means the beautiful slab that felt extravagant across ten square metres becomes very reasonable across two. It is the cheapest way to own real marble.</p>"],
  items=[("Vanity tops","Cut around your basin, with undermount, countertop or inset options, and upstands to protect the wall behind."),
         ("Basin surrounds","Polished openings and precise tap holes, finished so the edges feel right under a hand."),
         ("Bath panels and surrounds","Stone carried down the side of the bath for a solid, built-in look."),
         ("Shower thresholds and benches","Hard-wearing, water-shedding stone in the wettest part of the room."),
         ("Shelves and niches","Matching shelves and recessed niches cut from offcuts of your main slab."),
         ("Full wall cladding","Slim stone panels for a seamless wall with no grout lines.")],
  faqs=[("Is marble a good idea in a bathroom?","Yes, and it is where we recommend it most freely. Bathrooms see far less acid than kitchens, so the etching that worries people beside a hob is rarely an issue here. Seal it once or twice a year and it will look beautiful for decades."),
        ("What is best for a family bathroom?","Quartz. It is non-porous, needs no sealing and copes well with toothpaste, cosmetics and the general chaos of a shared bathroom."),
        ("Can you match my kitchen stone?","Often, yes. If we fitted your kitchen we can usually work from the same range, and sometimes the same block, so the two rooms speak to each other."),
        ("Do you do small jobs?","We do. A single vanity top is a perfectly normal enquiry, and it is often how people try us before a bigger project.")]),
 "commercial": dict(
  name="Commercial", stone="nero",
  title="Commercial Stone Surfaces | Bars, Receptions &amp; Hospitality | London &amp; Herts",
  desc="Commercial stone surfaces for hospitality, retail and offices: bar tops, reception desks, tables and washrooms, fitted to your programme.",
  h1="Commercial and <em>hospitality surfaces</em>",
  lead="Reception desks, bar and counter tops, tables and washrooms. Surfaces that take a public beating and still look right on the day of the photo shoot.",
  intro=["<p class=\"lead\">A commercial surface has a harder life than any kitchen. It gets leaned on, spilled on, wheeled into and cleaned with things no domestic worktop ever meets, and it has to keep looking expensive while it happens.</p>",
         "<p>That changes the specification. We lean towards hard granites for public-facing surfaces, plan the edge details around real traffic, and design the joins so a damaged section can be replaced without redoing the whole run. We work to a programme and we turn up on the date we agreed, because on a fit-out the schedule is the product.</p>"],
  items=[("Bar and counter tops","Long runs with planned joins, tough edge details and materials chosen to survive citrus, alcohol and constant wiping."),
         ("Reception desks","The first surface a visitor touches. Usually a statement stone, mitred for weight and lit to show the vein."),
         ("Restaurant and cafe tables","Cut to size in granite or quartz, easy to sanitise between covers."),
         ("Washrooms","Vanity runs, splashbacks and shelves that stand up to heavy public use and industrial cleaners."),
         ("Retail displays and plinths","Stone for display furniture, window plinths and till points."),
         ("Cladding and feature walls","Slim stone panels for lifts, columns and feature walls without the weight of a full slab.")],
  faqs=[("Do you work to a fit-out programme?","Yes. We template, fabricate and fit to your dates, confirm them in writing, and keep you posted so nothing lands on you on site. Late or wrong is a disaster on a fit-out, not an inconvenience, and we treat it that way."),
        ("Can you handle multiple units?","Yes. Consistency across units is exactly what developers and operators need, so we plan slab yield across the whole job rather than unit by unit, which keeps the finish uniform."),
        ("Which material for a busy bar?","Usually a hard granite. It takes heat and abuse, and shrugs off the citrus and alcohol that destroy the polish on marble."),
        ("Do you offer trade terms?","We do. See the trade page for how accounts, pricing and lead times work, or call the studio and ask for the trade team.")]),
 "outdoor": dict(
  name="Outdoor kitchens", stone="granite",
  title="Outdoor Kitchen Worktops | Weatherproof Granite | Herts &amp; London",
  desc="Outdoor kitchen worktops in hard-wearing granite: colourfast in sunlight, frost-proof and heat-resistant. Designed and fitted across Hertfordshire and London.",
  h1="Outdoor kitchens that <em>survive a British year</em>",
  lead="A hard, dense granite holds its colour in sunlight, shrugs off frost, and takes a pan straight off the burner. Most of what else goes outside is a compromise.",
  intro=["<p class=\"lead\">Outdoor kitchens have stopped being a novelty, and the material question outdoors is much simpler than indoors: a hard, dense granite, and very little else.</p>",
         "<p>Standard quartz should never go outside. The resin that makes it so well behaved in a kitchen is exactly what UV attacks, and colours can fade unevenly within a couple of summers. Granite has no resin in it at all, which is why it holds its colour in sunlight, comes through winter frost-proof, and is unbothered by a barbecue.</p>"],
  items=[("Barbecue and burner runs","Heat-tolerant surfaces that take direct pans and hot grill parts without scorching."),
         ("Pizza-oven surrounds","Stone that lives happily beside serious heat."),
         ("Outdoor bars and serving counters","Weatherproof surfaces with drainage details designed in."),
         ("Sinks and prep areas","Polished cut-outs and falls that shed water rather than pooling it."),
         ("Garden tables and benches","Solid stone tops on existing or new bases."),
         ("Cladding for outdoor units","Matching panels so the whole run reads as one built piece.")],
  faqs=[("Can I use quartz outdoors?","We would not recommend it. UV can fade the resin in engineered quartz, and the change is often patchy and permanent. Granite is the right answer outside, and we will say so even though quartz is usually the cheaper sale."),
        ("Will granite survive frost?","Yes. A dense, well-sealed granite is frost-proof, which is one of the main reasons it dominates outdoor work in this country."),
        ("Can I put the barbecue straight on it?","Granite handles very high temperatures, so hot pans and grill parts are not a problem. We still design in a sensible landing area rather than relying on the surface to take everything."),
        ("Does an outdoor kitchen need different support?","It does. Outdoor units move with temperature and are often built from blockwork or steel frames, so we check the substrate and design the fixing and the falls before we cut anything.")]),
}

for slug, s in SUR.items():
    faq_ld = {"@context":"https://schema.org","@type":"FAQPage","mainEntity":[
        {"@type":"Question","name":re.sub("<[^>]+>","",q),
         "acceptedAnswer":{"@type":"Answer","text":a}} for q,a in s["faqs"]]}
    b = head(s["title"], s["desc"], "../", "surfaces/%s.html" % slug, faq_ld)
    b += phead("Where it goes", s["h1"], s["lead"],
               [("Surfaces", None), (s["name"], None)], "../", s["stone"])
    b += ('<section class="sect"><div class="wrap-narrow"><div class="prose rise">%s</div></div></section>'
          % "".join(s["intro"]))
    b += cards("What we cut for <em>%s</em>" % s["name"].lower(), None, s["items"], "sect on-slate", "g3")
    b += faq_block(s["faqs"], "%s, answered" % s["name"])
    b += cta("../", "Planning something like this?")
    b += close("../")
    PAGES.append(write("surfaces/%s.html" % slug, b))

# ============================================================== ABOUT
b = head("About TopCat Worktops | A London &amp; Hertfordshire Stone Studio",
         "A stone studio built on years in the trade. Who we are, how we work, and why we will tell you when a cheaper material is the better answer.",
         "", "about.html")
b += phead("Our story", "Old hands, <em>exacting standards</em>",
           "Years in the trade, in every joint and every edge.", [("About", None)], "", "calacatta")
b += prose("""
<p class="lead">We built TopCat because we had spent years watching the trade overcharge for work that was not always better. The quotes were opaque, the process was vague, and the person who sold the job was rarely the person who turned up to fit it.</p>
<p>We thought the whole thing could be calmer. Not cheaper for its own sake, calmer: a clear price, straight answers, one person who knows your job, and a standard of fit you can run a hand along and feel. That is the entire business plan, and it has turned out to be enough.</p>
<h2>What we actually do</h2>
<p>We are a stone studio. We advise on the material, template your room to a fraction of a millimetre, plan the slab layout and the seam positions, and cut, polish and fit every surface ourselves.</p>
<p>Everything happens in-house, from the first visit to the final fit. Nothing is farmed out: the same people who measure your room cut and polish your slab in our own workshop and fit it, all cut wet to current HSE safety standards. One team touches your stone from start to finish, and every piece is checked and signed off before it reaches your home. That single line of accountability is exactly why the joins and the edges come out the way they do.</p>
<h2>Ask for Nick</h2>
<p>Most of our work arrives through people who were recommended to us, and almost every review mentions the same name. Nick looks after each project personally, from the first conversation to the final wipe-down. If you call the studio, that is who you will speak to, and he will still be your contact on install day.</p>
<p>It is a small thing that turns out to matter enormously. Nobody wants to explain their kitchen three times to three different people, and nobody wants to find out on the day that the fitter has never seen the job before.</p>
<h2>What we believe</h2>
<ul>
<li><strong>Mastery.</strong> Years in the trade, not months. It shows in the joints and the edges, which is exactly where it is hardest to fake.</li>
<li><strong>Certainty.</strong> A clear price, a clear timeline, straight answers and a guarantee in writing. The reassurance is as much the product as the stone.</li>
<li><strong>Beauty.</strong> We sweat the surface and everything around it: the edge profile, the joins, the way it meets the wall. If it does not look right, it is not finished.</li>
<li><strong>Candour.</strong> We will tell you what suits your room, even when that is a cheaper quartz instead of the marble you came in for. It is the quickest way to earn trust, and most of the trade will not do it.</li>
<li><strong>Permanence.</strong> Good stone outlasts whatever is fashionable now. We fit it to last twenty years and more, not to look good in one photograph.</li>
</ul>
""")
b += cta("", "Come and talk to us", "No pressure and no jargon. We will look at the room, talk through what suits, and leave you with a price that holds.")
b += close("")
PAGES.append(write("about.html", b))

# ============================================================== PROCESS
steps = [("Talk it through","We come to you, look at the room and listen to how you actually use it. This is where we ask the awkward questions: do you cook with a lot of acid, do you put pans down without thinking, is there a south-facing window over the run. The answers change what we recommend."),
 ("Choose your stone","You browse the collection in our online stone gallery, and on veined stone we send you photographs of your actual slab to approve before anything is cut, so the movement and depth are exactly what you signed off."),
 ("A price that holds","One itemised quote: templating, fabrication, edge profiles, cut-outs, splashbacks, delivery, fitting and VAT. Everything on one page, and the number we quote is the number you pay."),
 ("Templating","Once your units are fitted, level and secure, we laser-template the room to a fraction of a millimetre, capturing every measurement, cut-out, overhang and join. It takes about an hour for a standard kitchen and produces the digital file the cut is driven from."),
 ("Slab layout","Your template is laid over photographs of your actual slab so we can position each piece for the best yield and, more importantly, plan where the veining falls. This is where we decide that the gold runs across the island rather than dying in a corner."),
 ("Fabrication","Your slab is cut and polished in our own workshop, on CNC and waterjet machinery, always cut wet with full dust suppression to current HSE standards. The final edge profiling and polish is finished by hand, because that last pass is still a human job."),
 ("Fitting","Our own fitters install it, usually within days of templating. Floors and units protected, joins bonded and colour-matched, everything squared, sealed and cleaned up behind us. Most kitchens are done in a day."),
 ("Afterwards","You get the written guarantee, your Origin card and a straight answer on the phone whenever you need one. If something is not right, we come back.")]
b = head("Our Process | From Slab Selection to Templating and Fitting | TopCat Worktops",
         "How a bespoke stone surface gets made: consultation, slab approval, a fixed quote, laser templating, wet-cut fabrication and fitting within days.",
         "", "process.html")
b += phead("The process", "A process <em>without surprises</em>",
           "Eight steps from the first conversation to the day you get your room back. You will always know what happens next and what it costs.",
           [("Process", None)], "", "carrara")
b += '<section class="sect"><div class="wrap"><div class="grid g2">'
for i, (t, d) in enumerate(steps):
    b += ('<div class="card rise" style="--d:%dms"><span class="no">%02d</span><h3>%s</h3><p>%s</p></div>'
          % (i * 60, i + 1, t, d))
b += '</div></div></section>'
b += prose("""
<h2>How long does it all take?</h2>
<p>From the first visit to a finished room is typically three to five weeks, and most of that is you deciding. Once you have chosen and your units are in, templating to fitting is usually within days. The fit itself is a few hours to a single day for most kitchens.</p>
<h2>What we need from you</h2>
<ul>
<li>Units fitted, level and secure before we template. This is the big one.</li>
<li>Your sink, hob and tap on site at templating, so we cut the openings to the real thing.</li>
<li>Base cupboards emptied on fitting day, and a clear route from the door to the room.</li>
<li>A decision on who reconnects plumbing, gas and electrics, which we will agree with you in advance.</li>
</ul>
<h2>Why templating comes after the units</h2>
<p>Cabinets are never perfectly square and walls are never perfectly straight, and a stone surface has no tolerance for guessing. Templating off finished, levelled units is the only way to get joins that close properly and a run that sits flat. Templating early is the most common cause of delay in this trade, and it is entirely avoidable.</p>
""", cls="sect on-slate")
b += cta("")
b += close("")
PAGES.append(write("process.html", b))

# ============================================================== ORIGIN
b = head("Origin | Where Your Stone Came From | TopCat Worktops",
         "Origin is our provenance system: every slab traced from quarry to room, with the block number, the character of the stone and the date it was fitted, recorded in writing.",
         "", "origin.html")
b += phead("Origin", "Where your stone <em>came from</em>",
           "Every slab traced from the hillside it was cut out of to the room it was fitted in.",
           [("Origin", None)], "", "calacatta")
b += prose("""
<p class="lead">Every worktop starts in a quarry, months before it reaches you. The stone is cut out of the hillside in huge blocks, and running through the white is a thin vein of gold. That vein is the whole point: it is what makes the stone Calacatta Gold rather than ordinary marble, and it falls differently in every slab.</p>
<p>We did not design it. The earth did, over millions of years. Our job is to choose the slab where the gold falls right, and fit it properly.</p>
<h2>What an Origin card records</h2>
<ul>
<li><strong>The stone.</strong> Its proper name, not a marketing one.</li>
<li><strong>The quarry.</strong> Where in the world it came out of the ground.</li>
<li><strong>The block.</strong> The block reference and the month it was cut.</li>
<li><strong>The character.</strong> A plain description of your slab's field and veining.</li>
<li><strong>The set.</strong> Where it was fitted, and when.</li>
</ul>
<h2>Why we bother</h2>
<p>Partly because it is genuinely interesting, and partly because it solves a real problem. Stone is the one product where the sample is never quite the thing you get, and that uncertainty is the single biggest source of anxiety in the whole purchase. Writing down exactly which block your surface came from turns an anonymous slab into a specific object with a history.</p>
<p>It also keeps us honest. If the paperwork says Carrara, the stone is Carrara.</p>
""")
b += '<section class="sect on-slate"><div class="wrap center"><div class="rise" style="display:flex;justify-content:center"><div class="origin-card" data-tilt><span class="oc-k">Origin &middot; No. TC-2041</span><div class="oc-name">Calacatta Gold</div><dl><dt>Quarry</dt><dd>Carrara, Tuscany</dd><dt>Block</dt><dd>CV-118, cut March 2026</dd><dt>Character</dt><dd>White field, grey and gold vein</dd><dt>Set</dt><dd>Harpenden, within days</dd></dl><svg class="oc-seal" viewBox="0 0 200 200" fill="none" aria-hidden="true">' + SEAL[SEAL.index('>')+1:]
b += '</div></div><p class="body-muted" style="margin:26px auto 0;max-width:44ch">An example card. Yours arrives with the guarantee, and a copy stays with us.</p></div></section>'
b += cta("")
b += close("")
PAGES.append(write("origin.html", b))

# ============================================================== GUARANTEE
b = head("Our Guarantee | Ten-Year Workmanship Cover | TopCat Worktops",
         "A ten-year workmanship guarantee on every install, plus the manufacturer warranty on your stone. What is covered, what is not, and how to make a claim.",
         "", "guarantee.html")
b += phead("The certainty", "Guaranteed, <em>in writing</em>",
           "A ten-year workmanship guarantee on every install, on top of the manufacturer's warranty on your stone.",
           [("Guarantee", None)], "", "statuario")
b += prose("""
<p class="lead">A worktop is a twenty-year purchase, so the cover behind it should be in writing before you pay a penny. Here it is, in plain terms.</p>
<h2>What we guarantee</h2>
<ul>
<li><strong>Our workmanship, for ten years.</strong> The fit, the joins, the bonding and the sealing of the installation itself.</li>
<li><strong>The template.</strong> If a piece does not fit because we measured it wrong, that is ours to put right, at our cost.</li>
<li><strong>Damage caused by us.</strong> If we chip or crack a surface while fitting it, we repair or replace it.</li>
<li><strong>The price.</strong> The itemised quote you approve is the amount you pay. No day-of extras.</li>
</ul>
<h2>What the manufacturer guarantees</h2>
<p>Branded engineered stone carries its own warranty against manufacturing defects, commonly ten to twenty-five years and lifetime on some ranges. That cover sits with the manufacturer, which means it is not dependent on us at all. We register it in your name and hand you the paperwork.</p>
<h2>What is not covered</h2>
<p>We would rather be plain about this than bury it. Guarantees do not cover damage from use: heat marks from a pan put straight down on quartz, chips from a dropped pan, scratches from cutting directly on the surface, damage from bleach or other harsh chemicals, or alterations made by someone else after we left. Natural stone will also change over time, and etching or patina on marble is normal behaviour rather than a fault.</p>
<h2>How to claim</h2>
<p>Call the studio. In most cases we will come and look at it ourselves, and a great many issues, small chips especially, can be repaired in place rather than replaced.</p>
""")
b += '<section class="sect on-slate"><div class="wrap"><div class="seal-row rise" style="justify-content:center;text-align:center;flex-direction:column"><svg class="seal" viewBox="0 0 200 200" fill="none" aria-hidden="true">' + SEAL[SEAL.index('>')+1:]
b += '<p style="font-family:var(--serif);text-transform:uppercase;letter-spacing:.28em;font-size:.72rem;color:var(--champagne);margin-top:18px">The Stone-Grade Seal</p><p class="body-muted" style="max-width:46ch;margin:10px auto 0">It goes on the corner of your quote, your invoice and your install sign-off. It means this was done properly, and it is backed.</p></div></div></section>'
b += cta("")
b += close("")
PAGES.append(write("guarantee.html", b))

# ============================================================== CARE
b = head("Caring for Stone Worktops | Cleaning, Sealing &amp; Everyday Use | TopCat",
         "How to clean and care for quartz, marble and granite worktops: what to use, what to avoid, how often to seal, and how to deal with marks.",
         "", "care.html")
b += phead("Aftercare", "Living with <em>stone</em>",
           "None of it is difficult, and most of it is the same for every material. Here is what actually matters.",
           [("Care", None)], "", "carrara")
b += prose("""
<h2>Every day, whatever you have</h2>
<ul>
<li>Warm soapy water or a mild pH-neutral spray, and a soft cloth. That is genuinely it.</li>
<li>Use a board. Cutting directly on stone dulls your knives faster than it marks the surface, but neither is a good outcome.</li>
<li>Use a trivet, especially on quartz. See below for why.</li>
<li>Wipe strongly coloured or acidic spills before they dry: red wine, curry, turmeric, citrus, coffee, oil.</li>
</ul>
<h2>Never, on anything</h2>
<ul>
<li>Bleach, ammonia, oven cleaner, drain cleaner or limescale remover.</li>
<li>Scourers, wire wool or abrasive cream cleaners.</li>
<li>Vinegar or lemon on natural stone, which will etch it.</li>
</ul>
<h2>Quartz</h2>
<p>Non-porous, so it never needs sealing. Its one real weakness is heat: the resin binding it can scorch above roughly 150&deg;C, and that mark is usually permanent, so a trivet is not a suggestion. For a dried-on mark, a non-abrasive cream cleaner or a proper stone cleaner will normally lift it.</p>
<h2>Marble</h2>
<p>Seal it once or twice a year. Wipe acidic spills immediately. Expect etching, which is a dulling of the polish rather than a stain, and which can often be re-polished. Many owners stop noticing after the first year and come to like the patina; if you suspect you will not, tell us before we cut anything.</p>
<h2>Granite</h2>
<p>Seal once or twice a year. A simple test: leave a small pool of water on the surface for five minutes, and if the stone darkens underneath, it is ready for resealing. Otherwise it asks for very little.</p>
<h2>If something goes wrong</h2>
<p>Call us before you experiment. Most chips can be repaired in place, most marks come out with the right product, and the wrong product is how a small problem becomes a permanent one.</p>
""")
b += cta("", "Still got a question?", "We would rather you rang and asked than guessed. Advice on your own surface is free, whether we fitted it or not.")
b += close("")
PAGES.append(write("care.html", b))

# ============================================================== TRADE
b = head("Trade &amp; Contract Stone Surfaces | Designers, Builders &amp; Developers | TopCat",
         "A stone partner for kitchen designers, builders and developers. Trade pricing, reliable lead times and consistent quality across every unit.",
         "", "trade.html")
b += phead("For the trade", "An extension of <em>your team</em>",
           "For kitchen designers, builders, developers and architects who need a stone partner that turns up on the date it agreed.",
           [("Trade", None)], "", "nero")
b += prose("""
<p class="lead">You are putting your name on our work. That is the whole relationship, and we treat it that way.</p>
<p>Late or wrong is not an inconvenience on a live job, it is a day of idle labour, a difficult conversation with your client, and a dent in a reputation you spent years building. Most of what we do for trade clients is simply removing that risk.</p>
""", cls="sect")
b += cards("What you get from <em>us</em>", None, [
 ("Reliable to a schedule","We work around your programme, confirm every date in writing, and tell you early if anything moves. You should never have to chase us for a status."),
 ("Consistent across units","Slab yield planned across the whole job rather than unit by unit, so the finish is uniform from plot to plot and there are no callbacks."),
 ("Trade pricing, protected","Genuinely competitive trade terms, quoted so they stay yours and never appear in front of your client."),
 ("One accountable contact","Template to fit through a single point. No handovers, no finger-pointing, and one number to ring when something needs sorting."),
 ("Drawings and samples","Templates, drawings and samples to help you present the options and close your own client with confidence."),
 ("Safe, compliant fabrication","Everything is cut and finished in-house and wet to current HSE standards, so there is no third party in the chain and no supplier problem to become your reputation problem."),
], "sect on-slate", "g3")
b += prose("""
<h2>Who we work with</h2>
<ul>
<li><strong>Kitchen designers and studios.</strong> Discreet, white-label service available where you want to own the client relationship entirely.</li>
<li><strong>Builders and kitchen fitters.</strong> We work to your site schedule and template around your programme rather than ours.</li>
<li><strong>Developers.</strong> Consistency and value engineering across multiple units, with predictable pricing and lead times.</li>
<li><strong>Architects and interior designers.</strong> Bespoke and complex work, awkward dimensions, and materials specified to match a scheme.</li>
</ul>
<h2>Opening an account</h2>
<p>Call the studio and ask for the trade team, or send the drawings over and we will come back with a price and a realistic date. Most trade clients try us on one job and stay for the next.</p>
""", cls="sect")
b += cta("", "Talk to the trade team", "Send us the drawings and we will come back with a price and a date you can build a programme around.")
b += close("")
PAGES.append(write("trade.html", b))

# ============================================================== PROJECTS
PROJ = [("Calacatta-look quartz island","Harpenden","Quartz","A galley kitchen reimagined around a single bookmatched island. The veining runs unbroken from the waterfall edge, across the top and down the other side.","kitchen-day.jpg",None),
 ("Dark kitchen, veined worktop","North London","Quartz","Low light, brass fittings and a pale vein that catches it. Full-height splashback behind the hob so there is no grout line in the busiest part of the room.","hero-kitchen.jpg",None),
 ("Polished slab edge detail","St Albans","Marble","A mitred edge built up to look forty millimetres thick, with the gold vein carried around the corner rather than stopping at it.","cta-slab.jpg",None),
 ("Statuario vanity top","Radlett","Marble",'A single vanity run with an undermount basin and a slim upstand. Bathrooms are where marble behaves best, and where it costs least.',None,"statuario"),
 ("Bar and back counter","Hertfordshire","Granite","A hospitality fit-out in dense granite, specified for citrus, alcohol and constant wiping, with joins planned so a section can be replaced without redoing the run.",None,"nero"),
 ("Outdoor kitchen run","Welwyn","Granite","A garden kitchen in dense granite: colourfast in sunlight, frost-proof through winter, and happy to take a pan straight off the burner.",None,"granite")]
b = head("Recent Projects | Stone Worktops in Hertfordshire &amp; London | TopCat Worktops",
         "Recent stone surfaces fitted across St Albans, Harpenden, Watford and North London: kitchen islands, bathrooms, bars and outdoor kitchens in quartz, marble and granite.",
         "", "projects.html")
b += phead("Recent work", "Rooms we have <em>finished</em>",
           "Real installs across Hertfordshire and North London. The stone is always the hero, and we stay out of the shot.",
           [("Projects", None)], "", "calacatta")
b += '<section class="sect"><div class="wrap"><div class="grid g3">'
for i, (t, place, mat, d, img, stone) in enumerate(PROJ):
    vis = ('<img src="../assets/%s" alt="%s, %s">' % (img, t, place)) if img else ''
    attr = ('data-stone="%s" data-seed="%d"' % (stone, 400 + i * 37)) if stone else ''
    b += ('<article class="card card-media rise" style="--d:%dms">'
          '<div class="cm-visual" %s>%s</div>'
          '<div class="cm-body"><span class="no">%s &middot; %s</span><h3>%s</h3><p>%s</p></div></article>'
          % (i * 70, attr, vis, mat, place, t, d))
b += '</div></div></section>'
b += cta("", "Planning something like this?")
b += close("")
PAGES.append(write("projects.html", b))

# ============================================================== REVIEWS
REVIEWS = [("Judy Z.","10/10 experience. I had Nick as my point of contact for the end to end stone worktop work, and it was an extremely smooth process. From the beginning Nick was professional, responsive and polite. The team came in the next week to measure and ordered the stone right away, so it was ready for installation three to four days after templating. On installation day the team spent about an hour and a half and did a clean job. There was a window corner which was not originally planned to have any stone cover, but they brought the extra material and cut it perfectly on the day."),
 ("Jhanzeb Chaudhry","I am so happy I went with TopCat Worktops for my kitchen. I had visited a few kitchen showrooms before and was honestly shocked at how expensive the quotes were. TopCat came in considerably cheaper, and the quality and service were absolutely amazing. Nik was brilliant from the start, super helpful, always available to answer my questions even out of hours, and guided me through the whole process with real care. On installation day the team arrived on time and did a fantastic job. The finish is flawless."),
 ("Maheen Amjad","TopCat Worktops came highly recommended by our interior designer, and they certainly did not disappoint. As we are based in Scotland, everything was handled over the phone and email, but Nick made the whole process incredibly easy. He was always quick to respond, answered all our questions, and helped us choose the right worktop without any pressure. We always felt well looked after despite being hundreds of miles away."),
 ("Tabrez Chaudhry","Spoke to Nik who was transparent and responsive. The pricing is super competitive and we actually ended up saving close to a thousand pounds on our quartz worktop. The only thing I could fault was that the install team arrived ten minutes late on the day, but they called me ahead of time to let me know. The kitchen looks stunning and is the envy of all of our friends."),
 ("Cherif","Excellent service, quick responses, and my quartz kitchen worktop was installed within 48 hours from my initial conversation with Nick."),
 ("Joel Brizman","Highly recommended. TopCat replaced our old kitchen worktop with a new quartz worktop. The process was quick and seamless. From the initial visit, their friendly staff took care to understand our vision and our requirements, which included a one-source solution covering removal and disposal of the old worktop and a complete refit of our existing plumbing and electric hob. The installation was smooth and efficient, with the installers taking great care to ensure there was no damage to surroundings."),
 ("Abbas","We recently chose a Calacatta Viola worktop from TopCat Worktops and could not be happier with the result. The team were helpful throughout the whole process and made everything easy from start to finish. The installation was carried out professionally and the worktop looks absolutely stunning in our kitchen."),
 ("Maria Shahsawar","Really pleased with our new kitchen worktops. Nick was brilliant from start to finish, very responsive, patient while we decided on colours and materials, and provided a free no-obligation quote with no pressure at all. The quality of the worktops and installation is excellent. The team were professional, tidy, and completed everything to a high standard."),
 ("Davinder Dhillon","I have just had my quartz worktop installed and I am already thrilled with how it looks and feels. The finish is smooth, modern, and really elevates the whole kitchen. The craftsmanship is excellent: clean edges, seamless joints, and a perfect fit around the sink and hob."),
 ("Kav Patel","Very pleased with the service provided. Whilst our project took longer than expected, TopCat were very patient with us and delivered amazing worktops to complement our kitchen. A big shout out to Nick who we started the journey with."),
 ("Kinga Skubiszewska","Excellent experience from start to finish. Professional, responsive, and easy to work with throughout the project. Communication was clear, the work was completed to a high standard, and the entire process was handled efficiently."),
 ("Ali Jaffer","Really happy with their work. Nick was really helpful and transparent about the whole process, easy communication and a flawless finish. Would definitely recommend."),
 ("Naied Khan","Had kitchen worktops and back splash done. Work was done professionally with special attention to detail. Everything was done within the time frame, and I am very happy with the results and the suggestions that were recommended."),
 ("Farah Remadna","Excellent service from start to finish. Everything was completed perfectly with great attention to detail. The team was friendly, professional, and easy to work with."),
 ("Megan Webb","Excellent service and a wonderful company to work with. I would recommend to anyone."),
 ("Han L.","Splashback was phenomenal, quick responses, reasonable pricing. Would recommend.")]
rev_ld = {"@context":"https://schema.org","@type":"LocalBusiness","name":"TopCat Worktops Ltd",
          "review":[{"@type":"Review","author":{"@type":"Person","name":n},
                     "reviewRating":{"@type":"Rating","ratingValue":"5","bestRating":"5"},
                     "reviewBody":q} for n,q in REVIEWS]}
b = head("Reviews | Rated 5.0 on Google | TopCat Worktops",
         "Real, unedited Google reviews for TopCat Worktops from kitchens across Hertfordshire and North London. Rated 5.0.",
         "", "reviews.html", rev_ld)
b += phead("What people say", "Rated <em>5.0</em> on Google",
           "Every review below is real and unedited, left by clients across London and the Home Counties.",
           [("Reviews", None)], "", "carrara")
b += '<section class="sect"><div class="wrap"><div class="rev-masonry">'
for i, (n, q) in enumerate(REVIEWS):
    b += ('<div class="rev rise" style="--d:%dms"><div class="stars">&#9733;&#9733;&#9733;&#9733;&#9733;</div>'
          '<p class="quote">%s</p><div class="who">%s<span class="where">Google review</span></div></div>'
          % (min(i, 6) * 60, q, n))
b += '</div></div></section>'
b += cta("")
b += close("")
PAGES.append(write("reviews.html", b))

# ============================================================== FAQ
FAQS = [
 ("Cost","How much do stone worktops cost?","It depends on the material, the size of the room and the detailing such as waterfall ends, splashbacks and cut-outs. Most kitchens fall within a clear range, and your exact itemised price, covering templating, fabrication, fitting and VAT, follows a free home visit. The number we quote is the number you pay."),
 ("Cost","Are there any hidden costs?","No. Your quote itemises templating, precision cutting, edge profiles, cut-outs, delivery, installation and VAT before any work begins. If you want the old worktop removed and taken away, tell us in advance and it goes on the quote rather than appearing on the day."),
 ("Cost","Why are you cheaper than the kitchen showroom?","Because a kitchen retailer adds their margin on top of a fabricator's price. Going directly to a stone studio removes that layer. We are not trying to be the cheapest quote you get, but we are usually a good deal better value than a showroom for the same slab."),
 ("Materials","Quartz, granite or marble, which is right for me?","There is no single best; it depends on how you live. Quartz suits most busy kitchens. Granite is natural and very heat-tolerant. Marble is the most beautiful but it etches and patinas, and a hard granite is what we put outdoors. Tell us how you cook and we will steer you honestly."),
 ("Materials","Can I have the marble look without the maintenance?","Yes, and for many households it is the right call. Marble-effect quartz has come a long way and the best Calacatta-look ranges are convincing even close up. It is non-porous, never needs sealing and will not etch."),
 ("Everyday use","Can I put a hot pan straight onto a quartz worktop?","Best not to, always use a trivet. The resin that binds quartz can scorch above roughly 150 degrees and the mark is usually permanent. Granite copes with heat far better, and if you want to put pans down without thinking we will point you there."),
 ("Everyday use","Do stone worktops scratch, stain or chip?","Quartz and granite resist scratching and staining very well, though no surface is scratch-proof, so use a board. The most vulnerable point on any stone is a sharp edge or the corner beside the sink, where a heavy dropped pan can chip it. Most chips can be repaired invisibly in place."),
 ("Care","Do quartz worktops need sealing, and how do I clean them?","Quartz is non-porous and never needs sealing. Day to day it needs warm soapy water or a mild pH-neutral spray and a soft cloth. Avoid bleach, scourers and harsh chemicals. Natural stone such as granite and marble does benefit from resealing once or twice a year."),
 ("Design","Will I be able to see the joins?","Some rooms need a join because slabs come in a maximum size. We place seams with intent, usually near a sink or in a corner, and match the veining across them so the pattern flows. Most clients cannot find them once the work is in."),
 ("Design","What thickness should I choose, 20mm or 30mm?","Twenty millimetres reads slimmer and more contemporary, thirty feels chunkier and more solid. Both perform identically. If you want a really substantial look, a mitred edge can make a twenty millimetre slab appear forty or more."),
 ("Design","What is a waterfall island?","It is where the stone continues vertically down the side of an island to the floor. It uses more material and needs mitred joints, so it costs more, but it is the single most effective way to make an island look built rather than placed."),
 ("Process","Do my kitchen units need to be fitted before you template?","Yes. Units must be fully fitted, level and secure, with the sink, hob and tap on site, because we template off the real cabinets. Templating too early is the most common cause of delays and errors."),
 ("Process","How long does the whole thing take?","From the first visit to a finished room is typically three to five weeks, and most of that is you deciding. Once your units are in, templating to fitting is usually within days, and the fit itself is a few hours to a day for most kitchens."),
 ("Process","Do you remove the old worktop and reconnect the sink and hob?","We can remove and take away your old worktop; just tell us in advance so it is in the quote. Plumbing, gas and electrics are reconnected by a qualified plumber or electrician, either yours or one we arrange, agreed before install day."),
 ("Process","Do I get to choose my exact slab?","For plain and consistent quartz the colour is uniform batch to batch, so a sample represents it faithfully. For heavily veined quartz, marble, granite and quartzite we send you photographs of the actual slab to approve, so the piece you fell for is the piece you get."),
 ("Trust","Who will be coming into my home?","Our own fitting team, with a named contact who keeps you informed at every stage. You will not meet a stranger on install day who has never seen the job before."),
 ("Trust","What guarantee do I get?","A ten-year workmanship guarantee on the installation, plus the manufacturer's warranty on branded stone, which we register in your name. It is all set out in writing before you pay anything."),
 ("Safety","Are quartz worktops safe to have at home?","Yes. A finished, sealed worktop is inert and completely safe to live with and prepare food on. The silica risk reported in the news is occupational, affecting people who cut stone, which is why all fabrication is cut wet with full dust suppression to current HSE standards."),
 ("Areas","Which areas do you cover?","We cover London, Hertfordshire, Essex and Berkshire, from St Albans, Harpenden and Watford to Barnet, Chelmsford, Brentwood, Reading and Windsor, and we offer nationwide templating across the UK. Not sure if we reach you? Ask, and we will tell you straight."),
 ("Areas","Do you only do kitchens?","No. Kitchens are where most people meet us, but the same stone, templating and fitters go into bathrooms and vanity tops, commercial spaces such as bars, reception desks and hospitality counters, and outdoor kitchens in granite."),
]
faq_ld = {"@context":"https://schema.org","@type":"FAQPage","mainEntity":[
    {"@type":"Question","name":q,"acceptedAnswer":{"@type":"Answer","text":a}} for _,q,a in FAQS]}
b = head("Frequently Asked Questions | Stone Worktops | TopCat Worktops",
         "Straight answers on cost, materials, heat, sealing, seams, templating, guarantees, safety and the areas we cover.",
         "", "faq.html", faq_ld)
b += phead("Questions", "Answers, <em>set in stone</em>",
           "Everything people actually ask us, answered plainly. If yours is not here, ring the studio and ask.",
           [("FAQ", None)], "", "carrara")
groups = []
for tag, q, a in FAQS:
    if not groups or groups[-1][0] != tag:
        groups.append((tag, []))
    groups[-1][1].append((q, a))
b += '<section class="sect"><div class="wrap-narrow">'
for gi, (tag, items) in enumerate(groups):
    b += '<h2 class="rise" style="margin:%s 0 8px">%s</h2><div class="rise">' % ("0" if gi == 0 else "clamp(34px,5vh,54px)", tag)
    for q, a in items:
        b += ('<div class="faq-item"><button class="faq-q">%s<span class="ind"></span></button>'
              '<div class="faq-a"><div><p>%s</p></div></div></div>' % (q, a))
    b += '</div>'
b += '</div></section>'
b += cta("")
b += close("")
PAGES.append(write("faq.html", b))

# ============================================================== CONTACT
b = head("Get a Quote | Stone Worktops in St Albans, Hertfordshire &amp; London | TopCat",
         "Tell us about your room and we will come and measure it. Free home visit, a fixed itemised quote and a ten-year guarantee. Call 0800 098 2812.",
         "", "contact.html")
b += phead("Get started", "Tell us about <em>your room</em>",
           "A free home visit, a fixed itemised quote, and a ten-year guarantee on every install. We reply within one working day.",
           [("Contact", None)], "", "calacatta")
b += """<section class="sect"><div class="wrap"><div class="grid g2" style="gap:clamp(30px,5vw,64px);align-items:start">
  <div class="rise">
    <h2 style="margin-bottom:18px">Reach us <em>directly</em></h2>
    <div style="display:grid;gap:18px;margin-bottom:30px">
      <a href="tel:{tel}" style="display:flex;gap:14px;align-items:center">
        <span style="color:var(--champagne)">&#9670;</span>
        <span><span style="font-size:.6rem;letter-spacing:.28em;text-transform:uppercase;color:var(--faint);display:block">Phone the studio</span>
        <span style="font-family:var(--serif);font-size:1.3rem;letter-spacing:.06em">{phone}</span></span></a>
      <a href="mailto:{email}" style="display:flex;gap:14px;align-items:center">
        <span style="color:var(--champagne)">&#9670;</span>
        <span><span style="font-size:.6rem;letter-spacing:.28em;text-transform:uppercase;color:var(--faint);display:block">Email</span>
        <span style="font-size:1rem">{email}</span></span></a>
      <div style="display:flex;gap:14px;align-items:flex-start">
        <span style="color:var(--champagne)">&#9670;</span>
        <span><span style="font-size:.6rem;letter-spacing:.28em;text-transform:uppercase;color:var(--faint);display:block">Studio hours</span>
        <span style="font-size:1rem">Monday to Friday, 8am to 6pm</span></span></div>
      <div style="display:flex;gap:14px;align-items:flex-start">
        <span style="color:var(--champagne)">&#9670;</span>
        <span><span style="font-size:.6rem;letter-spacing:.28em;text-transform:uppercase;color:var(--faint);display:block">Based in</span>
        <span style="font-size:1rem">St Albans, Hertfordshire</span></span></div>
    </div>
    <div class="card"><h3>What happens next</h3>
      <p>We reply within one working day, usually the same one. We will ask a few questions about the room, arrange a free visit at a time that suits, and bring samples so you can see the stone in your own light. There is no obligation at any point, and nothing is cut until you have approved both the slab and the price.</p></div>
  </div>
  <form class="form rise" style="--d:120ms" data-demo novalidate>
    <div class="form-row">
      <input type="text" name="name" placeholder="Your name" autocomplete="name" required>
      <input type="tel" name="phone" placeholder="Phone" autocomplete="tel">
    </div>
    <div class="form-row">
      <input type="email" name="email" placeholder="Email" autocomplete="email" required>
      <input type="text" name="postcode" placeholder="Postcode" autocomplete="postal-code">
    </div>
    <select name="type" aria-label="What is the project?">
      <option value="">What are we surfacing?</option>
      <option>Kitchen</option><option>Bathroom</option><option>Commercial space</option>
      <option>Outdoor kitchen</option><option>Trade or contract enquiry</option><option>Something else</option>
    </select>
    <select name="material" aria-label="Material">
      <option value="">Material, if you know (optional)</option>
      <option>Quartz</option><option>Marble</option><option>Granite</option>
      <option>Not sure, please advise</option>
    </select>
    <textarea name="message" placeholder="Your room, your timings, anything you are unsure about"></textarea>
    <button type="submit" class="btn btn-gold" style="width:100%">Send my enquiry</button>
    <p class="note form-reply">We reply within one working day. This is a demo form, so nothing is sent.</p>
  </form>
</div></div></section>""".format(tel=TEL, phone=PHONE, email=EMAIL)
b += close("")
PAGES.append(write("contact.html", b))

# ============================================================== AREAS (regions + towns)
# proximity controls the honest "how we reach you" paragraph:
#   home  = Hertfordshire base   near = North/Greater London   cover = further, home visit + nationwide templating
REGIONS = [
 ("hertfordshire", "Hertfordshire", "Hertfordshire", "home",
  "Our home county. We are based here, so Hertfordshire jobs are the ones we reach fastest, template at the shortest notice and come back to most easily.",
  ["st-albans","harpenden","watford","hemel-hempstead","welwyn-garden-city","hatfield",
   "hertford","berkhamsted","rickmansworth","bushey","borehamwood","radlett",
   "potters-bar","stevenage","hitchin","bishops-stortford"]),
 ("london", "North &amp; Greater London", "North &amp; Greater London", "near",
  "An easy run from our Hertfordshire base. We work right across North and Greater London, from the border boroughs into the city.",
  ["barnet","enfield","finchley","hampstead","highgate","muswell-hill",
   "harrow","edgware","winchmore-hill","cockfosters"]),
 ("essex", "Essex", "Essex", "cover",
  "We cover Essex with home visits and, where it helps, nationwide templating, so the distance never slows the job down.",
  ["chelmsford","brentwood","epping","loughton","chigwell","buckhurst-hill",
   "colchester","basildon","southend-on-sea","billericay","braintree"]),
 ("berkshire", "Berkshire", "Berkshire", "cover",
  "The Thames Valley is well worth the journey. We pair a home visit with nationwide templating so a Berkshire postcode is no obstacle to a perfect fit.",
  ["reading","windsor","maidenhead","bracknell","slough","newbury","wokingham","ascot"]),
]

TOWN = {
 # ---- Hertfordshire ----
 "st-albans": ("St Albans","hertfordshire","Our home county's cathedral city, and the area we know best.",
   "Roman streets, Victorian terraces off Hatfield Road and larger houses around Clarence Park, with a great many side-return extensions where the kitchen becomes the whole back of the house. Period walls here are rarely square, which is exactly why templating off finished units matters so much."),
 "harpenden": ("Harpenden","hertfordshire","One of the areas we work in most often, a short run up the road.",
   "Affluent commuter homes and ambitious kitchen extensions, where the island is usually the centrepiece and often wants a bookmatched waterfall end. Harpenden clients tend to know exactly what they want, which we enjoy."),
 "watford": ("Watford","hertfordshire","Easy to reach, with a real mix of work.",
   "From new-build apartment kitchens and rental refurbishments to substantial family houses in Cassiobury. It is one of the areas where we fit the most bathroom and vanity work alongside kitchens."),
 "hemel-hempstead": ("Hemel Hempstead","hertfordshire","A regular run, for homeowners and trade alike.",
   "A lot of post-war housing being brought up to date, where a worktop replacement alone transforms a kitchen without a full refit. We do a good deal of worktop-only work here."),
 "welwyn-garden-city": ("Welwyn Garden City","hertfordshire","The garden city, and a steady stream of work.",
   "Handsome interwar and mid-century homes with well-proportioned kitchens, where warm neutral quartz and honed finishes tend to suit the light beautifully."),
 "hatfield": ("Hatfield","hertfordshire","Right next to our home patch.",
   "A mix of Old Hatfield character homes and newer developments, with plenty of first-time renovators after a durable, low-maintenance surface that will not date."),
 "hertford": ("Hertford","hertfordshire","The county town, with period property in abundance.",
   "Georgian and Victorian houses around the centre where marble and marble-effect quartz feel right at home, and where careful templating earns its keep on old walls that were never straight."),
 "berkhamsted": ("Berkhamsted","hertfordshire","A short hop west, and a discerning market.",
   "Characterful homes along the high street and up into the hills, with owners who want a statement island and are happy to view the actual slab before we cut it."),
 "rickmansworth": ("Rickmansworth","hertfordshire","On the Hertfordshire and London fringe.",
   "Larger detached houses and a lot of open-plan kitchen-diners, where the worktop has to look right from the sofa as well as from the sink."),
 "bushey": ("Bushey","hertfordshire","Between Watford and the London border.",
   "A broad mix of family housing, with strong demand for dark quartz and granite in contemporary rear extensions."),
 "borehamwood": ("Borehamwood","hertfordshire","Familiar territory on the London edge.",
   "Post-war and newer housing with compact, hard-working kitchens, where non-porous quartz is the natural, no-fuss choice."),
 "radlett": ("Radlett","hertfordshire","One of the county's most sought-after villages.",
   "Substantial homes and serious kitchens, where bookmatched islands and full-height splashbacks are the norm rather than the exception."),
 "potters-bar": ("Potters Bar","hertfordshire","On the northern edge of Greater London.",
   "Comfortable suburban housing with a steady appetite for both worktop replacements and full kitchen refits."),
 "stevenage": ("Stevenage","hertfordshire","North Hertfordshire, and a regular run.",
   "New-town housing and the surrounding villages, with a lot of value-conscious renovators after durable quartz that still looks the part."),
 "hitchin": ("Hitchin","hertfordshire","A handsome market town to the north.",
   "Period cottages and Georgian frontages around the market square, where careful seam planning and vein matching matter most."),
 "bishops-stortford": ("Bishop's Stortford","hertfordshire","On the Hertfordshire and Essex border.",
   "Well-heeled commuter homes and country properties, with plenty of ambitious kitchen extensions reaching for a statement stone."),
 # ---- London ----
 "barnet": ("Barnet","london","One of our busiest areas outside Hertfordshire.",
   "Large Edwardian and 1930s houses with generous kitchens, plus a steady stream of loft and rear extensions. Darker stones and dramatic veining do particularly well in these rooms."),
 "enfield": ("Enfield","london","North London, and an easy run for us.",
   "A broad mix of family housing and open-plan kitchen-diners, where full-height splashbacks are popular so the worktop reads well from the living space."),
 "finchley": ("Finchley","london","Classic North London family territory.",
   "Substantial semis and terraces with period detail, where marble-effect quartz gives the look without the upkeep a busy family kitchen would punish."),
 "hampstead": ("Hampstead","london","For the surfaces that simply have to be perfect.",
   "High-value period homes and discerning owners, often specifying real marble for an island or a bathroom and happy to accept its living finish."),
 "highgate": ("Highgate","london","Village London at its most exacting.",
   "Georgian and Victorian houses where provenance and finish matter, and where we most often send photographs of the actual slab to approve before a single cut."),
 "muswell-hill": ("Muswell Hill","london","Edwardian North London at its best.",
   "Wide bay-fronted houses with knocked-through kitchens, where a generous island in warm-veined quartz ties the whole space together."),
 "harrow": ("Harrow","london","West of the city, with a real mix of work.",
   "From suburban semis to larger detached homes, with strong demand for hard-wearing granite and quartz in family kitchens."),
 "edgware": ("Edgware","london","On the North-West London edge.",
   "Comfortable suburban housing with practical kitchens, where non-porous, no-maintenance surfaces win almost every time."),
 "winchmore-hill": ("Winchmore Hill","london","Leafy Enfield, and a favourite patch.",
   "Handsome period housing and conservation-area homes, where careful edge profiles and matching splashbacks finish a room properly."),
 "cockfosters": ("Cockfosters","london","Right on our doorstep at the top of the line.",
   "Large interwar houses with room for an island, and owners who appreciate a bookmatched waterfall end."),
 # ---- Essex ----
 "chelmsford": ("Chelmsford","essex","Essex's county city, and a regular destination.",
   "A fast-growing city of new developments and established suburbs, with a strong appetite for contemporary quartz and granite in open-plan kitchens."),
 "brentwood": ("Brentwood","essex","Affluent Essex, and serious kitchens.",
   "Large detached homes where the island is the showpiece, and where statement veining and waterfall ends are in constant demand."),
 "epping": ("Epping","essex","On the Essex and London fringe, easy for us to reach.",
   "Period cottages and substantial family homes near the forest, with plenty of ambitious extensions after a natural or natural-look stone."),
 "loughton": ("Loughton","essex","West Essex, and a discerning market.",
   "Big houses and bigger kitchens, where bookmatched islands and full-height splashbacks are simply expected."),
 "chigwell": ("Chigwell","essex","One of Essex's most sought-after spots.",
   "Grand homes and high specifications, where real marble and premium granite both feature heavily."),
 "buckhurst-hill": ("Buckhurst Hill","essex","Leafy west Essex, close to the London border.",
   "Period and new-build family homes alike, with strong demand for low-maintenance quartz in hard-working kitchens."),
 "colchester": ("Colchester","essex","Britain's oldest recorded town, and worth the trip.",
   "Historic property and a growing ring of new housing, where we combine a home visit with nationwide templating to make the distance a non-issue."),
 "basildon": ("Basildon","essex","Central Essex, a practical market.",
   "New-town and suburban housing with value-conscious renovators after durable quartz that lasts and looks good."),
 "southend-on-sea": ("Southend-on-Sea","essex","On the Essex coast.",
   "Seafront apartments and family homes, where non-porous, salt-air-friendly surfaces make quartz and granite the sensible picks."),
 "billericay": ("Billericay","essex","Comfortable mid-Essex.",
   "Spacious family housing with room for an island, and a steady flow of full kitchen refits."),
 "braintree": ("Braintree","essex","North Essex, and a regular run.",
   "A mix of period and new housing, with plenty of first-time renovators after a durable, fuss-free worktop."),
 # ---- Berkshire ----
 "reading": ("Reading","berkshire","The Thames Valley hub, well worth the journey.",
   "A large, mixed market from Victorian terraces to riverside new-builds, where we pair a home visit with nationwide templating so distance never delays the job."),
 "windsor": ("Windsor","berkshire","Royal Berkshire at its most prestigious.",
   "High-value period homes and river frontages, often specifying marble or premium granite and expecting a flawless finish."),
 "maidenhead": ("Maidenhead","berkshire","Affluent riverside Berkshire.",
   "Large family homes and new riverside developments, with strong demand for statement islands in bold-veined stone."),
 "bracknell": ("Bracknell","berkshire","Modern Berkshire, practical and fast-growing.",
   "New-build and suburban housing where clean, contemporary quartz in warm neutrals is the popular choice."),
 "slough": ("Slough","berkshire","Well-connected east Berkshire.",
   "A busy, varied market with a lot of value-focused renovation, where hard-wearing quartz offers the best return."),
 "newbury": ("Newbury","berkshire","A west Berkshire market town.",
   "Period property and surrounding villages, where natural stone and natural-look quartz suit the character homes."),
 "wokingham": ("Wokingham","berkshire","Prosperous central Berkshire.",
   "Comfortable family housing with generous kitchens, where a durable, low-maintenance island is almost always the brief."),
 "ascot": ("Ascot","berkshire","Berkshire at its most exclusive.",
   "Substantial homes and high specifications, where premium granite and real marble both feature, and where approving your exact slab from detailed photographs is part of the pleasure."),
}

REG_NAME = {r[0]: r[1] for r in REGIONS}
PROX = {
 "home":  "Because this is our home county, we can usually be with you quickly for the first visit, template at short notice when a schedule moves, and come back easily if anything ever needs attention.",
 "near":  "It is an easy run from our Hertfordshire base, so first visits and templating happen quickly, and we are never far away if you need us afterwards.",
 "cover": "We cover this area with home visits, and where it helps we use nationwide templating, so the distance never slows the job down or compromises the fit.",
}

# ---- top-level areas.html : regions + full town list ----
b = head("Areas We Cover | Stone Worktops Across London, Herts, Essex &amp; Berkshire | TopCat",
         "Bespoke stone worktops across London, Hertfordshire, Essex and Berkshire, plus nationwide templating. Find your town and get a free home visit.",
         "", "areas.html")
b += phead("Where we work", "London, Hertfordshire, <em>Essex &amp; Berkshire</em>",
           "We are based in Hertfordshire and fit across London and the Home Counties, with nationwide templating available across the UK. Find your area below.",
           [("Areas", None)], "", "carrara")
b += '<section class="sect"><div class="wrap">'
for ri, (rslug, rname, rem, prox, rlead, towns) in enumerate(REGIONS):
    b += ('<div class="rise" style="margin-bottom:clamp(30px,4vh,50px)">'
          '<div class="grid g2" style="align-items:end;margin-bottom:20px">'
          '<div><span class="eyebrow">Region</span>'
          '<h2 style="margin:0"><a href="areas/%s.html" style="color:inherit">%s</a></h2></div>'
          '<p class="body-muted" style="font-size:.9rem">%s</p></div>'
          '<div class="grid g4">' % (rslug, rname, rlead))
    for si, tslug in enumerate(towns):
        tname = TOWN[tslug][0]
        b += ('<a href="areas/%s.html" class="chip" style="justify-content:space-between">%s '
              '<span aria-hidden="true" style="color:var(--champagne)">&rarr;</span></a>' % (tslug, tname))
    b += '</div></div>'
b += ('<div class="card rise"><h3>Beyond the Home Counties</h3><p>%s If your postcode is not listed, '
      'it does not mean we cannot help, it just means we have not written the page yet. Ring the studio and ask.</p></div>' % TOWNS.capitalize())
b += '</div></section>'
b += cta("")
b += close("")
PAGES.append(write("areas.html", b))

# ---- region hub pages ----
for rslug, rname, rem, prox, rlead, towns in REGIONS:
    ld = {"@context":"https://schema.org","@type":"HomeAndConstructionBusiness",
          "name":"TopCat Worktops Ltd","telephone":TEL,
          "url":"https://www.topcatworktops.co.uk/areas/%s.html" % rslug,
          "areaServed":{"@type":"AdministrativeArea","name":rname.replace("&amp;","&")},
          "address":{"@type":"PostalAddress","addressLocality":"St Albans","addressRegion":"Hertfordshire","addressCountry":"GB"}}
    b = head("Stone Worktops in %s | Quartz, Marble &amp; Granite | TopCat" % rname.replace("&amp;","&"),
             "Bespoke stone worktops across %s, in quartz, marble and granite. Free home visit, fixed itemised quote and a ten-year guarantee." % rname.replace("&amp;","&"),
             "../", "areas/%s.html" % rslug, ld)
    b += phead("Areas we cover", "Stone worktops across <em>%s</em>" % rem,
               rlead, [("Areas","../areas.html"), (rname, None)], "../", "calacatta")
    b += ('<section class="sect"><div class="wrap-narrow"><div class="prose rise">'
          '<p class="lead">We supply and fit bespoke worktops and surfaces throughout %s, for kitchens, '
          'bathrooms, commercial rooms and outdoor kitchens, in quartz, marble and granite.</p>'
          '<p>%s</p></div></div></section>' % (rname.replace("&amp;","&"), PROX[prox]))
    b += '<section class="sect on-slate"><div class="wrap"><div class="center" style="margin-bottom:clamp(28px,4vh,44px)"><h2 class="rise">Towns we cover in %s</h2></div><div class="grid g3">' % rname.replace("&amp;","&")
    for si, tslug in enumerate(towns):
        tname, _, hook, _ = TOWN[tslug]
        b += ('<a href="%s.html" class="card card-link rise" style="--d:%dms"><h3>%s</h3><p>%s</p>'
              '<span class="card-foot"><span class="tlink">Worktops in %s <span class="arw">&rarr;</span></span></span></a>'
              % (tslug, min(si,6)*60, tname, hook, tname))
    b += '</div></div></section>'
    b += cta("../", "Getting a quote in %s" % rname.replace("&amp;","&"))
    b += close("../")
    PAGES.append(write("areas/%s.html" % rslug, b))

# ---- individual town pages ----
for tslug, (tname, rslug, hook, detail) in TOWN.items():
    rname = REG_NAME[rslug]
    prox = dict((r[0], r[3]) for r in REGIONS)[rslug]
    siblings = [s for s in dict((r[0], r[5]) for r in REGIONS)[rslug] if s != tslug][:4]
    ld = {"@context":"https://schema.org","@type":"HomeAndConstructionBusiness",
          "name":"TopCat Worktops Ltd","telephone":TEL,
          "url":"https://www.topcatworktops.co.uk/areas/%s.html" % tslug,
          "areaServed":{"@type":"Place","name":tname},
          "address":{"@type":"PostalAddress","addressLocality":"St Albans","addressRegion":"Hertfordshire","addressCountry":"GB"}}
    b = head("Stone Worktops in %s | Quartz, Marble &amp; Granite | TopCat Worktops" % tname,
             "Bespoke quartz, marble and granite worktops supplied and fitted in %s. Free home visit, a fixed itemised quote and a ten-year guarantee." % tname,
             "../", "areas/%s.html" % tslug, ld)
    b += phead("Areas we cover", "Stone worktops in <em>%s</em>" % tname, hook,
               [("Areas","../areas.html"), (rname.replace("&amp;","&"), "../areas/%s.html" % rslug), (tname, None)],
               "../", "calacatta")
    b += ('<section class="sect"><div class="wrap-narrow"><div class="prose rise">'
          '<p class="lead">We supply and fit bespoke worktops and surfaces throughout %s, in quartz, marble, '
          'and granite, for kitchens, bathrooms, commercial rooms and outdoor kitchens.</p>'
          '<p>%s</p>'
          '<h2>How it works in %s</h2>'
          '<p>We come to you for the first visit, bring samples so you can see the stone in the light of your own '
          'room, and leave you with a fixed, itemised quote covering templating, fabrication, edges, cut-outs, '
          'fitting and VAT. Once your units are level we template to a fraction of a millimetre, and most rooms '
          'are fitted within days of that.</p>'
          '<p>%s</p></div></div></section>' % (tname, detail, tname, PROX[prox]))
    b += cards("What we fit in %s" % tname, None, [
        ("Kitchen worktops","Runs, islands, waterfall ends, breakfast bars and full-height splashbacks, vein-matched across every join."),
        ("Bathrooms and vanity tops","Vanity tops, basin surrounds, bath panels and shelves, in the material best suited to a wet room."),
        ("Commercial surfaces","Bar and counter tops, reception desks, tables and washrooms, fitted to your programme."),
    ], "sect on-slate", "g3")
    # nearby towns internal linking
    if siblings:
        b += '<section class="sect-tight"><div class="wrap"><h3 class="rise" style="margin-bottom:16px">Nearby areas</h3><div class="btn-row rise">'
        b += '<a href="../areas/%s.html" class="chip">All of %s</a>' % (rslug, rname.replace("&amp;","&"))
        for s in siblings:
            b += '<a href="%s.html" class="chip">%s</a>' % (s, TOWN[s][0])
        b += '</div></div></section>'
    b += cta("../", "Getting a quote in %s" % tname,
             "Ring the studio or send a few details and we will arrange a free visit at a time that suits you.")
    b += close("../")
    PAGES.append(write("areas/%s.html" % tslug, b))

print("built %d pages:" % len(PAGES))
for p in sorted(PAGES):
    print("  ", p)

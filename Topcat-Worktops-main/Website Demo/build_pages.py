#!/usr/bin/env python3
"""
build_pages.py — the internal pages, composed from the landing page's own parts.
================================================================================
13 August 2026 (D190). Client: *"we need to now restructure the website to have the internal
pages... then we can add the rest of the website sections from the landing page in as global
sections... just understand how websites are laid out and do it perfectly."*

WHY IT WORKS THIS WAY
---------------------
`index.html` is one file with an inline <style> and an inline <script>. That is the design the
client has signed off and iterated on for three weeks, and it is the ONLY place the site's look
lives. So the internal pages are not written against a copy of it — this script LIFTS the real
thing out at build time:

    index.html  ──┬─→ assets/site.css   (the whole <style>, verbatim)
                  ├─→ assets/site.js    (the whole <script>, verbatim)
                  └─→ header / mobile nav / sticky bar / WhatsApp / footer / <section> blocks

and every page is composed from those parts. There is exactly one source for the chrome, so a
page cannot drift from the landing page, and a fix to either reaches all of them on the next run.

⛔ THE RULE THAT FALLS OUT OF THAT: to change an internal page's LOOK, edit `index.html`'s
   <style> and re-run this. Never hand-edit a generated file — it is overwritten.

⚠️ EVERY FILE THIS WRITES IS GENERATED. The header of each says so.

⚠️ `assets/site.css` and `assets/site.js` are served `public, max-age=300` by dev-server.js, so a
   change can take up to five minutes to show. `index.html` itself is `no-cache` and updates at
   once — which is why the landing page and an internal page can briefly disagree. Bust it with
   `?v=` in the browser, and warn the client before asking him to look.

RUN
---
    cd "Website Demo" && python3 build_pages.py
"""

import hashlib
import html
import os
import re
import sys


# ⚠️ ADDED 14 Aug 2026 (D232) FOR THE TWO NEW TRADE SECTIONS. This file had no escaping helper
# because every section template was a hand-written literal; the new sections build their markup
# from data lists, so the text goes through here. ⛔ The older templates are deliberately NOT
# retro-fitted — they contain intentional entities (`&middot;`, `&#9733;`) that escaping would
# print as literal text.

# ⭐⭐ SPLIT THE FOOTER'S RULES OUT OF THE LANDING STYLESHEET (D290).
# ⚠️ A rule counts as the footer's if its SELECTOR mentions `foot` — which catches `#footer`,
#    every `.foot-*` and `footer.site` — or the brand lockup the footer reuses. Media queries are
#    walked and rebuilt with only their footer rules, so a query that carries one survives and one
#    that carries none is dropped.
def _css_rules(text):
    """Split a stylesheet into top-level rules, keeping comments attached and never
    breaking inside one — the same walk the CSS gate in §8 does."""
    out, buf, depth, i = [], "", 0, 0
    while i < len(text):
        if text.startswith("/*", i):
            j = text.find("*/", i + 2)
            if j == -1:
                buf += text[i:]
                break
            buf += text[i:j + 2]
            i = j + 2
            continue
        buf += text[i]
        if text[i] == "{":
            depth += 1
        elif text[i] == "}":
            depth -= 1
            if depth == 0:
                out.append(buf)
                buf = ""
        i += 1
    if buf.strip():
        out.append(buf)
    return out


def _strip_comments(text):
    out, i = [], 0
    while i < len(text):
        if text.startswith("/*", i):
            j = text.find("*/", i + 2)
            if j == -1:
                break
            i = j + 2
            continue
        out.append(text[i])
        i += 1
    return "".join(out)


def _rule_head(rule):
    """The selector, with the rule's leading comment removed.

    ⛔⛔⛔ STRIP THE COMMENTS *BEFORE* SPLITTING ON `{`, NOT AFTER, AND THIS COST A ROUND.
    `_css_rules` keeps each rule's leading comment attached, and one of this file's footer
    comments quotes the client saying *"the footer parts should be centre"* in a block that also
    contains a BRACE. Splitting the raw text on its first `{` therefore cut inside the COMMENT:
    the head came back as half a sentence, the real selector `#footer .foot-grid` was never
    tested, and the phone footer's whole `grid-template-areas` rule was silently dropped from the
    generated stylesheet. The footer then auto-placed into three columns instead of the named
    grid, which is the exact fault this was meant to fix."""
    return _strip_comments(rule).split("{", 1)[0]


def _is_nav_sel(head):
    # ⭐ D295: the mobile burger + overlay component. `.mn-` catches every submenu class
    # (mn-group, mn-toggle, mn-sub, mn-row, mn-cta, mn-alt, mn-pair); `nav-open` catches the
    # `html.nav-open` state rules. ⚠️ Deliberately NOT here: `header.bar .bar-cta` and
    # `header.bar{--barH}` — bar rules belong to each family's own bar, and service.css takes
    # its own ≤1120 pair by hand.
    return (".nav-burger" in head) or (".mobile-nav" in head) or (".mn-" in head) or ("nav-open" in head)


def _nav_css(css):
    # ⭐ Same shape as _footer_css below, same comment-stripped output, same inheritance pinning
    # (D290's transplant trap: the overlay renders on pages whose body says 300/1.6 where the
    # landing says 400/1.5).
    keep = []
    for rule in _css_rules(css):
        head = _rule_head(rule)
        if head.strip().startswith("@media"):
            body = _strip_comments(rule)
            inner = body[body.index("{") + 1:body.rindex("}")]
            hits = [r for r in _css_rules(inner) if _is_nav_sel(_rule_head(r))]
            if hits:
                keep.append(head + "{" + "".join(hits) + "}")
        elif _is_nav_sel(head):
            keep.append(rule)
    m = re.search(r"(?:^|[}\s])body\s*\{([^}]*)\}", _strip_comments(css), re.M)
    if m:
        DEFAULTS = {"font-weight": "normal", "letter-spacing": "normal"}
        inherit = []
        for prop in ("font-family", "font-size", "font-weight",
                     "line-height", "letter-spacing"):
            d = re.search(r"(?:^|;)\s*%s\s*:\s*([^;}]+)" % prop, m.group(1))
            if d:
                inherit.append("%s:%s" % (prop, d.group(1).strip()))
            elif prop in DEFAULTS:
                inherit.append("%s:%s" % (prop, DEFAULTS[prop]))
        if inherit:
            keep.insert(0, ".mobile-nav{%s}" % ";".join(inherit))
    # ⚠️ Comments stripped from the output, exactly as _footer_css does below.
    return _strip_comments("".join(keep))


def _is_footer_sel(head):
    return ("foot" in head) or ("brand-stack" in head) or ("brand-logo" in head)


def _footer_css(css):
    keep = []
    for rule in _css_rules(css):
        head = _rule_head(rule)
        if head.strip().startswith("@media"):
            # ⚠️ the OPENING brace of the query is the first one after the comments are gone
            body = _strip_comments(rule)
            inner = body[body.index("{") + 1:body.rindex("}")]
            hits = [r for r in _css_rules(inner) if _is_footer_sel(_rule_head(r))]
            if hits:
                keep.append(head + "{" + "".join(hits) + "}")
        elif _is_footer_sel(head):
            keep.append(rule)
    # ⭐⭐⭐ AND THE FOOTER IS TOLD WHAT IT INHERITS. It is a component transplanted onto pages
    # dressed by a DIFFERENT stylesheet, and `service.css` sets `body{line-height:1.6}` where this
    # page sets 1.5. Nothing in the footer's own rules says otherwise, so every line in it came
    # out 1.6 on the generated pages: measured at 375, the column links ran 22.4px against 21,
    # and the footer finished **28px taller** than the same markup on the landing page. Pinning
    # the one inherited value it actually depends on is the whole fix — and it is READ FROM THIS
    # PAGE'S OWN `body` rule, not typed in, so it cannot drift from the thing it is copying.
    # ⛔ IT IS NOT JUST LINE-HEIGHT. `service.css` also sets `body{font-weight:300}` where this
    #    page sets 400, and the legal row came out 3px narrower for it. Every INHERITABLE text
    #    property the landing body declares is pinned, or the next one to differ is another round.
    m = re.search(r"(?:^|[}\s])body\s*\{([^}]*)\}", _strip_comments(css), re.M)
    if m:
        # ⛔⛔ WHERE THIS PAGE DECLARES NOTHING, PIN THE CSS INITIAL — DO NOT LEAVE IT OPEN.
        #    That is the trap this went round twice on: the landing `body` never sets
        #    `font-weight`, so it is the browser's 400 — while `service.css` sets 300, and an
        #    unset property inherits the HOST page's value, not this one's. "The landing page
        #    does not say" and "the footer should not care" are different statements.
        DEFAULTS = {"font-weight": "normal", "letter-spacing": "normal"}
        inherit = []
        for prop in ("font-family", "font-size", "font-weight",
                     "line-height", "letter-spacing"):
            d = re.search(r"(?:^|;)\s*%s\s*:\s*([^;}]+)" % prop, m.group(1))
            if d:
                inherit.append("%s:%s" % (prop, d.group(1).strip()))
            elif prop in DEFAULTS:
                inherit.append("%s:%s" % (prop, DEFAULTS[prop]))
        if inherit:
            keep.insert(0, "#footer{%s}" % ";".join(inherit))

    # ⚠️ COMMENTS ARE STRIPPED FROM THE OUTPUT. They are the reasoning behind the rules and they
    # belong in index.html, where they are read; shipped, they were 62 KB of the 77 this file
    # weighed, on all 167 pages that link it (open item 20 is the same complaint about the
    # generated pages' own markup).
    return _strip_comments("".join(keep))

def e(s):
    return html.escape(str(s), quote=True)

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, "index.html")

GENERATED = ("<!-- ⛔ GENERATED BY build_pages.py — DO NOT EDIT THIS FILE BY HAND.\n"
             "     Every part of it comes from index.html; edit that and re-run the script. -->")


# ── reading the landing page ────────────────────────────────────────────────────────────────────

def read_source():
    with open(SRC, encoding="utf-8") as fh:
        return fh.read()


def between(src, start_marker, end_marker, inclusive=True, start_at=0):
    """The slice from start_marker to end_marker. Raises rather than returning junk — a silent
    empty partial would produce a page that renders but has no header, which is far harder to
    spot than a build that stops."""
    i = src.find(start_marker, start_at)
    if i < 0:
        raise SystemExit("build_pages.py: could not find %r in index.html" % start_marker[:60])
    j = src.find(end_marker, i + len(start_marker))
    if j < 0:
        raise SystemExit("build_pages.py: could not find %r after %r" % (end_marker[:40], start_marker[:40]))
    return src[i:j + len(end_marker)] if inclusive else src[i + len(start_marker):j]


def section(src, sid):
    """One top-level <section> out of <main>, by id.

    ⚠️ Relies on index.html's own indentation: sections open at two spaces and close with a
    matching `\\n  </section>`. That is stable across the whole file and is checked by the
    assertion below — if the file is ever reformatted this raises instead of truncating.
    """
    m = re.search(r'\n  <section[^>]*\bid="%s"[^>]*>' % re.escape(sid), src)
    if not m:
        raise SystemExit("build_pages.py: no <section id=%r> in index.html" % sid)
    end = src.find("\n  </section>", m.end())
    if end < 0:
        raise SystemExit("build_pages.py: <section id=%r> is never closed at indent 2" % sid)
    block = src[m.start():end + len("\n  </section>")]
    if block.count("<section") != block.count("</section>"):
        raise SystemExit("build_pages.py: section %r came out unbalanced" % sid)
    # ⛔⛔ **BALANCED IS NOT THE SAME AS CORRECT — D262.** `#faq` closed at column 0 instead of two
    # spaces, so this search ran past its end and took the whole `#cta` section with it: two opens,
    # two closes, balanced, and /about/ and /contact/ shipped the enquiry card twice for weeks.
    # A second top-level `<section` inside one section is impossible in this file, so it is the
    # signal that the end marker was missed.
    # ⚠️ `block` STARTS WITH ITS OWN OPENING TAG, newline included, so the count is 1 when correct.
    if block.count("\n  <section") > 1:
        raise SystemExit("build_pages.py: section %r swallowed the section after it — check that "
                         "its </section> is indented two spaces" % sid)
    return block.strip("\n")


# ── the parts ───────────────────────────────────────────────────────────────────────────────────

def extract(src):
    p = {}
    p["css"] = between(src, "<style>", "</style>", inclusive=False)
    # ⛔⛔⛔ **EVERY MARKUP MARKER BELOW IS SEARCHED FROM THE END OF THE <style> BLOCK, NOT FROM
    # BYTE 0 — 14 Aug 2026 (D237), AND IT COST A BUILD.** These are plain string searches, and
    # index.html's stylesheet is one enormous commented document: a CSS comment that quotes an
    # element's opening tag matches the marker BEFORE the real element does. It happened to
    # `<svg class="tc-defs"` — a note explaining that the sprite must be kept named it in full, so
    # `defs` came back as 240KB of stylesheet and every internal page rendered its own CSS as
    # visible text. ⭐ The markup all lives after `</style>`, so starting there makes the whole
    # class of accident impossible rather than fixing the one comment that caused it.
    body = src.index("</style>")
    # the page's own behaviour script is the LAST <script> block, after </main>
    tail = src.index("</main>")
    p["js"] = between(src, "<script>", "</script>", inclusive=False, start_at=tail)
    p["header"] = between(src, '<header class="bar"', "</header>", start_at=body)
    p["mobile_nav"] = between(src, '<nav class="mobile-nav"', "</nav>", start_at=body)
    # sticky bar + floating WhatsApp: everything between the menu and <main>, comments included
    after_nav = src.index("</nav>", src.index('<nav class="mobile-nav"', body)) + len("</nav>")
    p["floats"] = src[after_nav:src.index("<main>", body)].strip("\n")
    p["footer"] = between(src, '  <footer class="site"', "  </footer>", start_at=body)
    # the gold gradient paint servers the icons resolve against — they live in the hero on the
    # landing page, so any page without the hero has to carry its own copy or every icon goes black
    p["defs"] = between(src, '<svg class="tc-defs"', "</svg>", start_at=body)
    # ⭐ D193: the hero's trust bubbles, lifted whole so the internal page heads show the same four
    # the landing page does.
    # ⛔⛔ **`hero-el` AND ITS `--hd` MUST BE STRIPPED, AND THIS COST A ROUND.** `.hero-el` is the
    # hero's staged entrance: `opacity:0` with a translate, released by a class the HERO gets on
    # load. There is no hero on these pages, so the release never comes and the bubbles render at
    # **opacity 0** — present in the DOM, 89px tall, holding their own space, and completely
    # invisible. It reads as "the chips did not get inserted", which is the wrong thing to go
    # looking for. The page head does not want a staged entrance anyway; it is the first thing on
    # the page.
    chips = between(src, '<div class="hero-chips', "</span>\n        </div>")
    # ⛔⛔ **THIS WAS AN EXACT STRING MATCH ON `--hd:1040ms` UNTIL 14 Aug 2026 (D237), AND A RETIME
    # WOULD HAVE BROKEN IT SILENTLY.** `str.replace` with no match does nothing and raises nothing,
    # so the day the hero's stagger changed, every internal page would have shipped its bubbles
    # still wearing `hero-el` — opacity 0, holding their space, invisible, and looking for all the
    # world like the chips had not been inserted. The delay moved to 880ms that same day.
    # ⭐ A regex takes the class and ANY `--hd`, so the two files cannot drift apart again.
    chips = re.sub(r' hero-el" style="--hd:\d+ms"', '"', chips, count=1)
    p["chips"] = "      " + chips
    for sid in ("reviews", "services", "gallery", "stones", "estimator",
                "process", "about", "why", "faq", "cta"):
        p["s_" + sid] = section(src, sid)
    # ⛔⛔ **THE ESTIMATOR'S STONE-PICKER MODAL LIVES OUTSIDE `#estimator`, AND MISSING IT COST A
    # ROUND.** It is a SIBLING of the section — a full-screen dialog has to be, or the section's own
    # stacking context traps it — so `section("estimator")` did not pick it up and /estimate/
    # shipped an estimator whose IIFE wired `estModalX`, `estStoneSearch` and the rest against
    # nulls. It threw at the IIFE's closing brace, which points at no useful line at all.
    # ⭐ Carried WITH the section rather than as its own stack key: nothing should ever be able to
    # put the estimator on a page and leave its dialog behind.
    p["s_estimator"] += "\n\n" + between(src, '  <div class="est-modal" id="estModal"', "\n  </div>")
    return p


# ── the pages ───────────────────────────────────────────────────────────────────────────────────
# Each entry: slug (directory under Website Demo/), <title>, meta description, crumb label,
# eyebrow, H1 (with <em> for the champagne word), the standfirst, and the section stack.
#
# ⚠️ THE STACK IS THE WHOLE DESIGN DECISION ON EACH PAGE. The client asked for "the rest of the
# website sections from the landing page in as global sections", which is not the same as all of
# them on all of them: a page that repeats the entire landing page teaches a customer that the nav
# does nothing. Each page leads with the thing it is named for, supports it with the two or three
# sections that answer the next question, and closes on the enquiry block.

# ── the trade page's own body ───────────────────────────────────────────────────────────────────
# ⭐ THE TRADE PAGE IS THE ONE PAGE WITH BESPOKE SECTIONS, because it sells to a different reader.
# Client: *"trade, especially having a dedicated page that looks amazing... the trade page also
# needs to have its own dedicated form."*
# ⭐⭐ **NOT ONE NEW CSS CLASS WAS INVENTED FOR IT.** `.trade-grid` / `.trade-card` / `.trade-prompt`
# and the whole `.cta-card` / `.cta-form` kit are already in the site's stylesheet, so this page is
# assembled from components the client has already approved on other surfaces. A trade page built
# out of new parts would drift away from the brand the moment either one was tuned.
# ⚠️ The copy is lifted from the trade page that already existed — it is the client's positioning
# and it was not rewritten, only re-set into the site's own design.

TRADE_WHAT = [
    ("Reliable to a schedule",
     "We work around your site and confirm every date in writing. If your programme moves, tell us "
     "and we move with it rather than sending you to the back of a queue."),
    ("Consistent across units",
     "The same finish, unit after unit, whether it is one kitchen or forty. Slabs are reserved and "
     "matched up front so a later plot does not arrive looking like a different scheme."),
    ("Trade pricing, protected",
     "Competitive terms that hold, quoted so they stay yours for the length of the project. No "
     "renegotiation halfway through and no quiet uplift between plots."),
    ("One accountable contact",
     "Template to fit through a single point, with drawings and samples to help you pitch. You "
     "chase one person and that person has the answer."),
    ("Safe, compliant cutting",
     "Every piece is cut wet, with extraction at the tool, to current HSE guidance, so a "
     "workshop's practices never become your reputation problem."),
    ("Ten years, in writing",
     "Every install carries our ten year guarantee on top of the manufacturer's own warranty, and "
     "the aftercare visit sits inside 72 hours if anything needs attention."),
]

TRADE_WHO = [
    ("Kitchen designers",
     "Samples and drawings to close the sale, honest steers on what suits the client's life, and a "
     "fit that reflects on your design rather than on our diary."),
    ("Builders and fit-out contractors",
     "One less trade to manage. We template when the units are genuinely ready and fit when we "
     "said we would."),
    ("Property developers",
     "Repeatable specification across plots, reserved slabs so the last unit matches the first, "
     "and pricing held for the length of the scheme."),
    ("Architects and specifiers",
     "Straight answers on what a stone will and will not do, so what is drawn is what can be "
     "built and signed off."),
]


def trade_cards(items, cls="trade-card"):
    # ⭐⭐ `.trade-stone` IS THE SAME BLACK MARBLE THE REVIEW CARDS AND THE WHY TILES CARRY —
    # 14 Aug 2026 (D231). Client: *"we don't have this kind of design across the entire site…
    # redesign it based on our design language in the home page."* The home page's answer to a
    # grid of reason tiles is `.wy-r`: a stone-backed panel, veiled until the copy is the
    # brightest thing on it. Filled by `marbleFill()` from the IIFE in index.html, per card,
    # from its own seed, so no two cards carry the same slab.
    # ⚠️ EMPTY AND `aria-hidden` — it is decoration, and a screen reader reading a slab is noise.
    out = []
    for title, body in items:
        out.append('        <article class="%s rise">\n'
                   '          <div class="trade-stone" aria-hidden="true"></div>\n'
                   '          <h3>%s</h3>\n'
                   '          <p>%s</p>\n'
                   '        </article>' % (cls, title, body))
    return "\n".join(out)


# ⛔⛔ THE BODY COPY IS NO LONGER INSIDE `.section-head` — 14 Aug 2026 (D230). Client: *"why is it
# all the text like that? Why don't you just spread it across so it matches up with the rest of the
# thing and just the title maybe stays like that?"*
# ⭐⭐ THE CAUSE IS A COMPONENT USED FOR SOMETHING IT WAS NEVER SHAPED FOR. `.section-head` is
# `text-align:center` and `.section-sub` is `max-width:52ch` — that pairing is built for a title
# and ONE short line under it, which is all the landing page ever asks of it. Three full paragraphs
# of body copy poured into it gave a 547px centred ribbon down the middle of a 1200px page.
# ⭐ The title still centres, which is what he asked for. The prose sits in TWO columns spanning
# the same width as the cards below it, so it lines up with the rest of the section, and each
# column is still about one 52ch measure wide — spreading it across as one line would run past 100
# characters and be harder to read than what it replaced.
# ⚠️ The closing line spans both columns: it is the summary, and a summary that starts halfway
# down column two reads as an orphan.
TRADE_WHAT_SECTION = """  <section class="section" id="tradeWhat">
    <div class="section-head rise">
      <!-- ⛔⛔ "ONE TRADE OFF YOUR CRITICAL PATH" IS DEAD — 14 Aug 2026 (D233). Client: *"I hate the
           title that says one trade off your critical path. What does that even mean? The trade
           page is for essentially other people to use Topcat to do the work for them, and also for
           bigger companies to buy their services. So there should be, like, something trade with
           Topcat, something that just speaks to what this is for."*
           ⭐⭐ HE IS RIGHT TWICE OVER. "Critical path" is construction programme jargon, and half
           the audience he just named — kitchen designers, developers — do not talk that way. And
           "One trade off" reads as "one trade-off" on first sight, which says the opposite of what
           it means. **A heading that has to be parsed is a heading that has failed.**
           ⭐ HIS OWN WORDS, AND THE BRAND TAKES THE GOLD. It sits under an H1 that says "Trade", so
           this answers the H1 rather than repeating it: trade WITH US, and the paragraph below says
           what that gets you. ⛔ Do not put the jargon back anywhere on this page — it was in four
           places and all four are changed. -->
      <h2 class="section-title">Trade with <em>Topcat</em></h2>
    </div>
    <div class="trade-lede rise">
      <p class="section-sub">Most of the problems we get called in to solve are not stone problems,
        they are coordination problems. A supplier who templated too early. A fitter who did not
        turn up. A joint that does not match the sample the client signed off. When those things go
        wrong, the problem usually lands on you, on your programme, your client and your
        reputation. That is exactly what we are here to prevent. With Topcat, we manage the process
        from advice and templating through to fabrication and installation, keeping the
        responsibility with us rather than passing it down the line.</p>
      <p class="section-sub trade-lede-close"><b>One team. One point of contact. One less thing to
        chase.</b></p>
    </div>
    <div class="trade-grid">
{cards}
    </div>
  </section>"""

TRADE_WHO_SECTION = """  <section class="section" id="tradeWho">
    <div class="section-head rise">
      <h2 class="section-title">Built around how you <em>actually work</em></h2>
    </div>
    <div class="trade-grid">
{cards}
    </div>
  </section>"""

# ⚠️ THE FORM IS DELIBERATELY NOT WIRED, AND THAT IS THE CLIENT'S OWN INSTRUCTION (13 Aug 2026):
# *"right now, we are mostly working on the design of the site, the buttons and the forms and all
# those things. We will tie them where they need to be once the time is right."* So the send button
# is `type="button"` rather than a submit — a submit with no action would reload the page under him
# mid-review and read as a bug. One attribute to change on the day it is connected.
TRADE_CTA_SECTION = """  <section id="tradeCta">
    <div class="cta-card rise">
      <div class="cta-copy">
        <h2 class="cta-title">Open a <em>trade account</em></h2>
        <p class="cta-line">Tell us what you are working on and we will come back with terms, lead
          times and a single point of contact. One worktop or a 150 unit build, a dedicated
          project manager who can be on site from templating to fit.</p>
        <div class="cta-reach">
          <div class="cta-or">Or reach us directly</div>
          <ul class="cta-lines">
            <li>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M4 5c0-1 1-2 2-2h2l2 5-2 1a12 12 0 006 6l1-2 5 2v2c0 1-1 2-2 2A16 16 0 014 5z"/></svg>
              <a class="cta-tel" href="tel:+448000982812">0800 098 2812</a>
            </li>
            <li>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3.6 6.5 8.4 6 8.4-6"/></svg>
              <a href="mailto:info@topcatworktops.co.uk">info@topcatworktops.co.uk</a>
            </li>
            <li>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="12" cy="12" r="8.6"/><path d="M12 7v5.3l3.4 2"/></svg>
              <span>Monday to Sunday, 7am to 9pm</span>
            </li>
          </ul>
          <div class="cta-trust">
            <div class="cta-rate">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#C6A664" d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.3 5.9 20.6l1.4-6.8L2.2 9.1l6.9-.8z"/></svg>
              <span class="r-txt"><span class="r-src">Google Reviews</span><span class="r-score">5.0 &#9733;&#9733;&#9733;&#9733;&#9733;</span></span>
            </div>
            <div class="cta-rate">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#C6A664" d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.3 5.9 20.6l1.4-6.8L2.2 9.1l6.9-.8z"/></svg>
              <span class="r-txt"><span class="r-src">Guarantee</span><span class="r-score">Ten years</span></span>
            </div>
          </div>
        </div>
      </div>
      <form class="cta-form" id="tradeForm" novalidate>
        <div class="cta-row">
          <input type="text" name="name" placeholder="Your name" autocomplete="name">
          <input type="text" name="company" placeholder="Company" autocomplete="organization">
        </div>
        <div class="cta-row">
          <input type="email" name="email" placeholder="Email address" autocomplete="email">
          <input type="tel" name="phone" placeholder="Phone number" autocomplete="tel">
        </div>
        <div class="cta-row">
          <select name="role" aria-label="What you do">
            <option value="">What you do</option>
            <option>Kitchen designer or retailer</option>
            <option>Builder or fit-out contractor</option>
            <option>Property developer</option>
            <option>Architect or specifier</option>
            <option>Something else</option>
          </select>
          <select name="volume" aria-label="Rough volume">
            <option value="">Rough volume</option>
            <option>One kitchen</option>
            <option>2 to 10 units</option>
            <option>10 to 40 units</option>
            <option>40 plus, or a rolling programme</option>
          </select>
        </div>
        <!-- ⭐ D267: "Message", the same as the enquiry card's. He said "all of the forms at the
             bottom", and the trade form is the other one — it is a different block (TRADE_CTA_SECTION)
             and would otherwise have been the one place still asking the long way. -->
        <textarea name="message" placeholder="Message"></textarea>
        <button type="button" class="cta-send">Open a trade account</button>
        <p class="cta-reply">We reply the same working day. Nothing is charged and nothing is
          committed until you have seen the terms.</p>
      </form>
    </div>
  </section>"""

# ⭐⭐ TWO SECTIONS THE TRADE PAGE DID NOT HAVE — 14 Aug 2026 (D232). Client: *"make sure the page
# actually has everything that we need, and it looks better and functions better, has more sections
# to it maybe."* What a trade buyer could not find here: **what Topcat actually supplies** (the page
# linked to neither /services/ nor /stones/ anywhere), and **answers to the operational questions**
# a specifier asks before they will risk a client on a new supplier.
# ⛔⛔ EVERY ANSWER BELOW IS ALREADY TRUE AND ALREADY CLAIMED SOMEWHERE ON THIS SITE. Trade terms,
# payment and minimum order are NOT among them — §2 rule 12 forbids stating what we cannot
# guarantee, and the client has never supplied them. The terms question is answered honestly, by
# pointing at the form, which is exactly what the CTA already promises.
# ⛔ NO `FAQPage` SCHEMA. Google deprecated it on 7 May 2026 and it is on the dead-types list.
# ⚠️ THE NINE SERVICE LINKS ARE A SIXTH COPY OF THE SERVICE LIST (see the D228 note in
# build_seo_pages.py). If a tenth service is ever added, it goes here too.
TRADE_SCOPE = [
    ("Kitchen worktops", "/services/kitchen-worktops.html"),
    ("Kitchen islands", "/services/kitchen-islands.html"),
    ("Splashbacks", "/services/splashbacks.html"),
    ("Bathrooms", "/services/bathroom-worktops.html"),
    ("Vanity tops", "/services/vanity-tops.html"),
    ("Outdoor spaces", "/services/outdoor-kitchens.html"),
    ("Fireplaces", "/services/fireplaces.html"),
    ("Dining tables", "/services/dining-tables.html"),
    ("Commercial", "/services/commercial-worktops.html"),
]

TRADE_FAQ = [
    ("Can you deal with our client directly?",
     "Either way. We can speak to your customer, take them through the stone and handle the "
     "template appointment, or stay behind you and deal only with your office. Tell us which at "
     "the start and we will keep to it."),
    ("How much notice do you need?",
     "We template once the units are level, and most kitchens are fitted within days of the slab "
     "being approved. Dates go in writing so you can plan the trades around them."),
    ("Can you hold a slab for a later plot?",
     "Yes. Slabs are reserved and matched up front, so a plot finishing months after the first one "
     "does not arrive looking like a different scheme."),
    ("Who templates and fits it?",
     "Our own team, and the stone is cut and polished by our experienced fabricators. There is no "
     "third party in the middle to point at when something needs sorting."),
    ("Do you supply samples for client presentations?",
     "Yes. We bring samples to the visit and can leave them with you or with your client while the "
     "scheme is being decided."),
    ("What are your trade terms?",
     "They depend on what you are working on, so we would rather quote them than post them. Send us "
     "the project and we will come back with terms, lead times and a single point of contact."),
]

TRADE_SCOPE_SECTION = """  <section class="section" id="tradeScope">
    <div class="section-head rise">
      <h2 class="section-title">Everything you can <em>specify</em></h2>
      <p class="section-sub">One supplier across the whole job, so a scheme does not have to be
        split between three of them.</p>
    </div>
    <div class="trade-scope rise">
{links}
    </div>
    <div class="trade-scope-foot rise">
      <a class="btn-ghost" href="/stones/">Browse the stone catalogue</a>
      <a class="btn-ghost" href="/projects/">See recent installations</a>
    </div>
  </section>"""

TRADE_FAQ_SECTION = """  <section class="section" id="tradeFaq">
    <div class="section-head rise">
      <h2 class="section-title">Trade <em>questions</em></h2>
    </div>
    <div class="trade-faq rise">
{rows}
    </div>
  </section>"""


def trade_scope_links(items):
    return "\n".join(
        '      <a class="trade-scope-link" href="%s">%s</a>' % (href, e(name))
        for name, href in items)


def trade_faq_rows(items):
    return "\n".join(
        '      <details class="trade-q">\n'
        '        <summary>%s<span class="trade-q-mark" aria-hidden="true"></span></summary>\n'
        '        <div class="trade-a">%s</div>\n'
        '      </details>' % (e(q), e(a))
        for q, a in items)


CUSTOM = {
    "c_tradeWhat": TRADE_WHAT_SECTION.format(cards=trade_cards(TRADE_WHAT)),
    "c_tradeWho": TRADE_WHO_SECTION.format(cards=trade_cards(TRADE_WHO)),
    "c_tradeScope": TRADE_SCOPE_SECTION.format(links=trade_scope_links(TRADE_SCOPE)),
    "c_tradeFaq": TRADE_FAQ_SECTION.format(rows=trade_faq_rows(TRADE_FAQ)),
    "c_tradeCta": TRADE_CTA_SECTION,
}


PAGES = [
    dict(
        slug="services",
        title="Worktop Services | Kitchens, Islands, Splashbacks &amp; More | Topcat Worktops",
        desc="Kitchen worktops, islands, splashbacks, bathrooms, commercial surfaces and outdoor "
             "kitchens in quartz, granite and marble. Templated and fitted by our own team across "
             "London and the Home Counties.",
        crumb="Services",
        h1="Services",
        # ⚠️ "SIX WAYS" UNTIL D228 AND IT HAD BEEN WRONG SINCE D206 PUT THE RANGE AT EIGHT. The
        # number in a sentence like this ages the moment the range moves; if a ninth service is
        # ever added, this line is one of the places that has to move with it.
        lead="Eight ways we work in stone, from a single kitchen run to a full commercial fit-out. Every one of them starts the same way: we come to you, we template to the millimetre, and our own team fits it. Choose the space you are working on and we will show you how it is done.",
        stack=["s_services", "s_process", "s_why", "s_reviews", "s_cta"],
    ),
    dict(
        slug="projects",
        title="Our Projects | Kitchen Worktop Installations | Topcat Worktops",
        desc="Recent worktop projects across London, Hertfordshire, Essex, Berkshire, Buckinghamshire, Surrey, Oxfordshire & Bedfordshire. See the "
             "stone, the space and how each one was templated and fitted.",
        crumb="Projects",
        h1="Projects",
        # ⚠️ REWRITTEN 14 Aug 2026 (D211) BECAUSE IT HAD BECOME UNTRUE. It promised "the stone
        # named on every one and the story of how it was cut and fitted" — written when the cards
        # were placeholders sharing one invented story. The real portfolio names no stone on most
        # projects and five of the seven have no written story at all, so the page was advertising
        # something the gallery below it does not contain. ⛔ The fix is the sentence, not the data.
        lead="A finished kitchen is the only honest sample. These are ours, real installations with the place, the work and the date on every one.",
        stack=["s_gallery", "s_reviews", "s_process", "s_cta"],
    ),
    dict(
        slug="estimate",
        title="Worktop Cost Estimator | Quartz, Granite &amp; Marble | Topcat Worktops",
        desc="Type in your sizes and see them laid out on real slabs. An honest range for quartz "
             "worktops in seconds, with your exact price after a free home visit.",
        crumb="Estimate",
        h1="Estimate",
        lead="What a worktop costs comes down to the stone, the shape of the run and how many slabs the cut actually needs. This works all three out on real slabs of the stone you pick, so the range you see is the one we would quote from.",
        stack=["s_estimator", "s_stones", "s_process", "s_cta"],
    ),
    dict(
        slug="about",
        title="About Topcat Worktops | One Contract, One Contact | Topcat Worktops",
        desc="Who we are and how we work. One team from the first measurement to the last seal, "
             "with a ten year guarantee behind it.",
        crumb="About us",
        h1="About us",
        lead="You will deal with the same people from the first measurement to the last seal. We advise on the stone, we source the slab, we template it, we fit it, and we answer for all of it afterwards.",
        stack=["s_about", "s_why", "s_reviews", "s_faq", "s_cta"],
    ),
    dict(
        slug="contact",
        title="Contact Topcat Worktops | Free Home Visit &amp; Quote | Topcat Worktops",
        desc="Tell us about your project and we will come to you. Free home visit, samples "
             "brought to your kitchen, and a quote with no pressure behind it.",
        crumb="Contact",
        h1="Contact",
        lead="Send us the room, the rough sizes or just a photograph, and we will come back to you with what it takes. The home visit is free, we bring the samples to your kitchen, and nothing is charged until you have said yes.",
        # ⭐ D262: THE REVIEWS COME BEFORE THE QUESTIONS. Client: *"on the dedicated contact us
        # page, put the review section above the [frequently asked questions] section."* ⭐ It is
        # also the better argument on this page of all of them: the form is the ask, other people
        # vouching for us is what earns the answer to it, and the FAQ is the leftover objections —
        # so proof now sits directly under the form rather than three screens below it.
        stack=["s_cta", "s_reviews", "s_faq"],
    ),
    dict(
        slug="trade",
        title="Trade Worktops | Supply &amp; Fit for Designers and Developers | Topcat Worktops",
        desc="Stone worktops supplied and fitted for kitchen designers, builders, building "
             "contractors, developers and architects. Dates confirmed in writing, one contact "
             "from template to fit, and a ten year guarantee on every install.",
        crumb="Trade",
        h1="Trade",
        # ⭐ the client's own rewrite, 14 Aug 2026: "building contractors" added to the list, and
        # "we can deal with your customer directly" is the line he wanted leading the offer.
        lead="Stone worktops supplied and fitted for kitchen designers, builders, building contractors, developers and architects. We can deal with your customer directly, template, fabricate, fit and carry the guarantee, work to your programme, and turn up on the date we agreed.",
        # ⭐ D232 added `c_tradeScope` and `c_tradeFaq`. ORDER IS THE ARGUMENT A TRADE BUYER MAKES:
        # what you get → who it is for → what you can specify → who says so → how it runs →
        # the questions in the way → the form. Scope sits before the reviews because a specifier
        # checks the range is wide enough before they care whether other people liked it, and the
        # FAQ sits last before the form because it is the last set of objections.
        stack=["c_tradeWhat", "c_tradeWho", "c_tradeScope", "s_reviews", "s_process",
               "c_tradeFaq", "c_tradeCta"],
    ),
]


# ── the template ────────────────────────────────────────────────────────────────────────────────

HEAD = """<!DOCTYPE html>
<html lang="en-GB">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{title}</title>
<meta name="description" content="{desc}">
<link rel="canonical" href="https://www.topcatworktops.co.uk/{slug}/">
<meta name="robots" content="index, follow">
<meta property="og:type" content="website">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta property="og:url" content="https://www.topcatworktops.co.uk/{slug}/">
<meta property="og:site_name" content="Topcat Worktops">
<meta property="og:image" content="https://www.topcatworktops.co.uk/assets/site/og-cover.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" type="image/svg+xml" href="/assets/brand/favicon.svg">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700&family=Montserrat:wght@200;300;400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/assets/site.css?v={cssv}">
<script type="application/ld+json">
{{
 "@context": "https://schema.org",
 "@type": "BreadcrumbList",
 "itemListElement": [
  {{"@type":"ListItem","position":1,"name":"Home","item":"https://www.topcatworktops.co.uk/"}},
  {{"@type":"ListItem","position":2,"name":"{crumb}","item":"https://www.topcatworktops.co.uk/{slug}/"}}
 ]
}}
</script>
</head>
<body>
{generated}
"""

# ⛔ D193: NO EYEBROW, and the H1 is the page's NAME. The client on the first version: *"if they
# click on services, the main title is services with a description of the services that they do."*
# The eyebrow went with it — once the title is the label, an eyebrow above it says the same word
# twice in two sizes. The selling line lives in the description now.
# ⭐ `{chips}` is the hero's own `.hero-chips` markup, lifted verbatim by extract(). Reusing the
# markup rather than re-typing it means the Google mark, the rating and the two reason bubbles can
# never drift from the landing page's — and the phone's 2×2 grid (D186) comes along for free.
PAGE_HEAD_BLOCK = """  <section class="page-head">
    <div class="page-head-in">
      <nav class="page-crumb" aria-label="Breadcrumb">
        <a href="/">Home</a><span>/</span>{crumb}
      </nav>
      <h1>{h1}</h1>
      <p>{lead}</p>
{chips}
    </div>
  </section>
"""

DIVIDER = '  <div class="section-divider" aria-hidden="true"><span class="sd-line"></span></div>'


def build_page(parts, page):
    body = [HEAD.format(generated=GENERATED, **page)]
    body.append(parts["header"])
    body.append(parts["mobile_nav"])
    body.append(parts["floats"])
    # ⭐ D195: the Projects page runs the gallery as a plain column at every width. The class is
    # the whole switch — see `.pg-col #gallery` in index.html for why it is CSS and not a
    # matchMedia in the script.
    body.append("\n<main%s>\n" % (' class="pg-col"' if "s_gallery" in page["stack"] else ""))
    # the paint servers the gold icons resolve against — see extract()
    body.append("    " + parts["defs"] + "\n")
    body.append(PAGE_HEAD_BLOCK.format(chips=parts["chips"], **page))
    for i, key in enumerate(page["stack"]):
        # ⛔⛔ NO DIVIDER BEFORE THE FIRST SECTION — D193, and this is the client's "why the fuck
        # are there two dividers". `.page-head` draws its own curved hairline at its bottom edge,
        # so emitting a `.section-divider` here too put two rules across the page ~35px apart.
        # The head's edge IS the first seam. Every later seam still gets its divider.
        if i:
            body.append(DIVIDER)
        # `s_` keys are lifted out of the landing page; `c_` keys are this build's own sections
        body.append(parts[key] if key in parts else CUSTOM[key])
    body.append("\n")
    body.append(parts["footer"])
    body.append("\n</main>\n")
    # ⭐⭐ THE SHARED FORM MODULE — 24 Aug 2026. Four of these seven pages carry a form
    # (contact, about, projects, trade) and it is the same file the landing page and all 31
    # SEO/service pages load, so it is one description and one cache entry for the whole site.
    # ⛔ Never inline a second copy of the validation into a page family.
    body.append('<script src="/assets/tcform.js?v=1" defer></script>\n')
    body.append('<script src="/assets/site.js?v=%s" defer></script>\n</body>\n</html>\n' % page["_jsv"])
    return "\n".join(body)


def main():
    src = read_source()
    parts = extract(src)

    assets = os.path.join(HERE, "assets")
    os.makedirs(assets, exist_ok=True)

    css_note = ("/* ⛔ GENERATED BY build_pages.py from index.html's <style> block. Do not edit.\n"
                "   Change the landing page's stylesheet and re-run the script. */\n")
    js_note = ("/* ⛔ GENERATED BY build_pages.py from index.html's <script> block. Do not edit.\n"
               "   Change the landing page's script and re-run the script. */\n")

    with open(os.path.join(assets, "site.css"), "w", encoding="utf-8") as fh:
        fh.write(css_note + parts["css"])
    with open(os.path.join(assets, "site.js"), "w", encoding="utf-8") as fh:
        fh.write(js_note + parts["js"])

    # ⭐⭐⭐ AND THE FOOTER'S OWN STYLESHEET — 17 Aug 2026 (D290). Client: *"the inner pages footer
    # on mobile doesn't look like the hero section foot on mobile. Just make sure that the footer
    # are consistent on every device all across the site, the same as on the landing page."*
    # ⛔⛔ THE MARKUP WAS ONLY HALF THE PROBLEM. Three builders each hand-wrote their own footer
    # and all three had drifted; those are lifted from index.html now. But the service, stone and
    # SEO pages do NOT load site.css — they are dressed by `services/service.css`, which carries
    # **19 footer rules against this page's 93**. Lifting the markup alone rendered the Instagram
    # icon at ~500px, because service.css has no `.foot-social svg` sizing to give it.
    # ⛔ AND LINKING site.css THERE IS NOT THE ANSWER: it is 572 KB of landing-page stylesheet
    # that would restyle everything else on those pages.
    # ⭐ So the footer-scoped rules are split out here, from the SAME <style> block, and the three
    # builders link this after service.css. One source, generated, cannot drift.
    # ⚠️ THE MEDIA QUERIES COME WITH IT. Four of them carry footer rules — 34 of the 93 — and a
    # footer that is only correct at one width is the bug being fixed, not a fix.
    foot_css = _footer_css(parts["css"])
    with open(os.path.join(assets, "footer.css"), "w", encoding="utf-8") as fh:
        fh.write("/* \u26d4 GENERATED BY build_pages.py — the footer-scoped rules out of\n"
                 "   index.html's <style>. Do not edit; change the landing page and re-run. */\n"
                 + foot_css)

    # ⭐⭐ ONE MOBILE NAV, GENERATED FROM THE LANDING PAGE — 17 Aug 2026 (D295), §13 item 7.
    # Below 1121px the generated leaf pages hid `nav.top` and replaced it with NOTHING: 170-odd
    # pages where a phone customer had no way to move around the site beyond "Get a quote". The
    # burger + full-screen overlay has existed on the landing page (and therefore the seven
    # internal pages) since D184/D194, so this is the D290 footer mechanism applied again: the
    # nav-scoped rules are split out of the SAME <style> block into a second generated sheet,
    # and the three leaf builders lift the markup and inline the toggle JS themselves.
    # ⚠️ THE SAME INHERITANCE PINNING APPLIES — the overlay is a component transplanted onto
    # pages dressed by service.css (D290's trap), so `.mobile-nav` pins the landing body's own
    # inheritable text properties.
    nav_css = _nav_css(parts["css"])
    with open(os.path.join(assets, "nav.css"), "w", encoding="utf-8") as fh:
        fh.write("/* \u26d4 GENERATED BY build_pages.py — the mobile-nav rules out of\n"
                 "   index.html's <style>. Do not edit; change the landing page and re-run. */\n"
                 + nav_css)

    # ⛔⛔ CONTENT-HASHED URLS, AND THIS IS NOT HOUSEKEEPING — IT IS THE FIX FOR A REAL BUG.
    # dev-server.js serves assets `public, max-age=300` while index.html is `no-cache`. The first
    # build of these pages spent three rounds looking at a JavaScript error that had ALREADY been
    # fixed on disk, because the browser was holding a five-minute-old site.js. The hash changes
    # whenever the file's bytes change, so the URL changes with it and a stale copy can never be
    # served again — on the dev server, on the client's phone, or on whatever host it ends up on.
    # ⚠️ 10 hex characters of sha1 is plenty here; this is cache identity, not security.
    cssv = hashlib.sha1(parts["css"].encode("utf-8")).hexdigest()[:10]
    jsv = hashlib.sha1(parts["js"].encode("utf-8")).hexdigest()[:10]

    written = ["assets/site.css (%d KB, v=%s)" % (len(parts["css"]) // 1024, cssv),
               "assets/site.js (%d KB, v=%s)" % (len(parts["js"]) // 1024, jsv)]

    for page in PAGES:
        page["cssv"] = cssv
        page["_jsv"] = jsv
        out_dir = os.path.join(HERE, page["slug"])
        os.makedirs(out_dir, exist_ok=True)
        out = os.path.join(out_dir, "index.html")
        html = build_page(parts, page)
        with open(out, "w", encoding="utf-8") as fh:
            fh.write(html)
        written.append("%s/index.html (%d KB, %d sections)"
                       % (page["slug"], len(html) // 1024, len(page["stack"])))

    print("build_pages.py wrote:")
    for w in written:
        print("  •", w)
    return 0


if __name__ == "__main__":
    sys.exit(main())

# START HERE — 13 August 2026, end of the INTERNAL PAGES ROUND

Read this, then `HANDOVER.md` **§D** (the decision register, newest first — this round is
**D179–D196**) and **§2** (the standing rules, especially **rule 9** and **rule 15**). That is about
fifteen minutes and it is enough to work safely.

> ⚠️ **This replaces the previous version of this same file**, which covered the performance and
> hero round (D162–D178). Everything in it that still matters is carried below.

---

## 0. ⛔⛔ THE ONE THING TO READ FIRST: THE SITE IS SEVEN PAGES NOW, AND ONE SCRIPT BUILDS SIX OF THEM

**`Website Demo/build_pages.py`** composes `/services/`, `/projects/`, `/estimate/`, `/about/`,
`/contact/` and `/trade/` **out of the landing page's own parts**:

```
index.html  ──┬─→ assets/site.css   (the whole <style>, verbatim)
              ├─→ assets/site.js    (the whole <script>, verbatim)
              └─→ header / mobile nav / sticky bar / WhatsApp / footer / <section> blocks
```

⭐⭐ **NOTHING IS COPIED AND NOTHING IS RE-WRITTEN.** There is exactly one source for the chrome, so
a page cannot drift from the design, and a fix reaches all seven on the next run.

```bash
cd "Website Demo" && python3 build_pages.py
```

⛔⛔ **TO CHANGE AN INTERNAL PAGE'S LOOK, EDIT `index.html`'s `<style>` AND RE-RUN THE SCRIPT.
NEVER HAND-EDIT A GENERATED FILE — IT IS OVERWRITTEN.** Each one says so in its first line.

⭐ New page components (`.page-head`, `.nav-menu`, `.mn-sub`) live in `index.html`'s stylesheet even
though the landing page never renders them. That costs it nothing — no element matches — and it is
what keeps one stylesheet for the whole site.

---

## 1. ⛔⛔ THE THREE BUGS THIS ARCHITECTURE PRODUCED — ALL THREE WILL COME BACK

### 1. ⛔⛔⛔ THE SHARED SCRIPT IS FLAT TOP-LEVEL CODE, SO ONE NULL KILLS THE WHOLE FILE

`assets/site.js` is not a series of IIFEs. One `wheel.addEventListener(...)` on a null throws at the
top level and **every `const` declared below it stays in the temporal dead zone for the life of the
page**.

⭐⭐ **THE SYMPTOM NAMES THE WRONG THING.** It reports
`Cannot access 'glowItems' before initialization` from three unrelated subsystems. The real fault is
the first throw, hundreds of lines earlier.

⭐ **`orNull()` at the top of the script is the fix**: it hands back a **detached element inside a
detached parent**, so `addEventListener`, `classList`, `style`, `innerHTML` and one step up to
`parentElement` all answer harmlessly. ⛔ **Do NOT use it where the code already tests truthiness** —
a stub is truthy, so it turns a deliberately skipped block into a running one.

⚠️ **THE PARENT HALF ONLY FAILED ABOVE 720px**, because that is the branch of `metrics()` that reads
the rail width. **Test every width before believing this file.**

### 2. ⛔⛔ RELATIVE PATHS DO NOT SURVIVE MOVING TO A SUBDIRECTORY

`assets/site/…` from `/services/` asks for `/services/assets/…`. Worse: **a `url()` resolves against
the STYLESHEET's address, not the page's**, so `url('assets/stone-floor.webp')` inside
`/assets/site.css` asked for `/assets/assets/…` and the page floor silently vanished on every
internal page. **51 references are root-relative now. Keep them that way.**

### 3. ⛔⛔ THE FIVE-MINUTE ASSET CACHE SERVED A JS ERROR THAT WAS ALREADY FIXED ON DISK

Assets are `public, max-age=300`; `index.html` is `no-cache`. Three rounds were spent looking at a
stale `site.js`. ⭐ **Closed permanently: the asset URLs are content-hashed** (`site.js?v=<sha1>`), so
a changed file always has a changed URL — on the dev server, on his phone, and on whatever host this
ends up on.

---

## 2. ⭐ THE FREEZE PROBE — RE-MEASURED AFTER EVERY EDIT THIS ROUND

**The landing page, verified at the end of the round:**

| Signal | 375×812 | 768×1024 | 1440×900 |
|---|---|---|---|
| document height | **14285** | **18418** | **14641** |
| element count | — | **2622** | **2622** |
| `.gal-scroll` height | (static) | **5632** | **4950** |
| `--galMode` | `phone` | `(unset)` | `(unset)` |
| `.gal-static` on `#gallery` | **true** | **false** | **false** |
| `feTurbulence` in document | — | — | **60** |

⭐⭐ **768 AND 1440 ARE THE SAME NUMBERS THEY WERE BEFORE THIS ROUND STARTED.** Everything structural
landed either on the phone or on the new pages. Element count moved 2577 → 2622: the `.gs-swap`
wrapper, the nav menu's eight links, the menu's three CTAs and the two mobile submenus. Every step
accounted.

### ⛔ THE PROCEDURE — USE THIS VERSION

**1. Probe with `scrollTo({top:y, behavior:'instant'})`. Always.** `<html>` carries
`scroll-behavior:smooth`, so every plain `scrollTo()` in a probe ANIMATES.
**2. At 768, park at `galScrollTop + 2000` and CONVERGE** — poll card widths until three consecutive
reads agree. Settles in ~9s. A fixed wait passes spuriously.
**3. Sample in ≤24s chunks** — `javascript_tool` times out at 30s.
⭐ **CHECK `--galMode` AND `.gal-static` FIRST AND YOU MAY NOT NEED ANY OF IT.**

---

## 3. ⛔ SCOPE — THE TABLET IS NEXT, AND HE HAS NOT CALLED IT YET

**HE SAID: *"we are now going to work on the tablet version of the site, after you have created the
internal pages."* THE PAGES ARE DONE. ⛔ HE STILL HAS NOT SAID GO — and mid-round he said
*"we haven't started working on the tablet version, so don't worry about that."* WAIT FOR IT.**

| Band | What it gets | Status |
|---|---|---|
| **≤ 720px** | the mobile build | ⭐ live scope |
| **721–1120px** | the old tablet/fallback layouts | ⛔ **frozen — NEXT, on his word** |
| **≥ 1121px** | the desktop composition | ⛔ **frozen, signed off (D91)** |

⭐⭐ **THE INTERNAL PAGES ARE THE ONE EXEMPTION AND HE GRANTED IT EXPLICITLY:** *"when I spoke about
the internal dedicated pages, I mean, this happens for desktop, tablet, and mobile."* Work on the
PAGES at any width. Work on the LANDING PAGE only on the phone.

⚠️ `index.html` is one file with **inline CSS**, so nearly every rule is unscoped. ⛔ **Landing-page
mobile work goes inside `@media(max-width:720px)`. Never edit a base rule to fix mobile** — unless
the element does not render above 720px at all (`.nav-burger`, `.mbar`), which is why D184's burger
change was safe in the base rule.

⭐ **HE UNFREEZES BY NAMING AN ITEM, MID-MESSAGE** — this round the desktop nav bar's quote button
(D181). ⚠️ **When the boundary is unclear, take the reversible reading and tell him you did.**

---

## 4. ⛔ THE LINK, AND THE HOST QUESTION HE HAS NOT ANSWERED

```bash
cd "Website Demo" && nohup caffeinate -ims node dev-server.js > /tmp/topcat-server.log 2>&1 &
```

**Give him `http://192.168.1.102:5501`** — re-check with `ipconfig getifaddr en0`.

⭐ **THE SERVER IS DETACHED ON PURPOSE (PPID 1).** ⛔ **DO NOT `preview_stop` IT, DO NOT KILL IT TO
RESTART.** Verify with `lsof -nP -iTCP:5501 -sTCP:LISTEN`. **PID 5158, untouched across six rounds.**

⭐⭐ **EVERY SAVE TO `index.html` RELOADS HIS PHONE.** Tell him before a run of edits.

### ⚠️⚠️ HE IS REVIEWING ON `thadeusg3.sg-host.com`, NOT ON THE LAN LINK

His screenshot on 13 Aug carried that URL. **It was serving the END OF THE PREVIOUS ROUND** —
verified by diffing markers against the local file. **ASK HIM AGAIN HOW FILES GET THERE.** Until that
is answered, anything you build may be invisible to him, and he will report bugs you already fixed.

⛔ Otherwise **all of §4 is dev-server only.** No production host is chosen.

---

## 5. ⭐ THE CODE IS ON GITHUB, AND IT IS PUBLIC

**https://github.com/ThadGC/topcatwork** — **5 commits on `main`, HEAD `4e123a6`, 13 Aug.**

⚠️ **HE CHOSE PUBLIC KNOWINGLY.** Do not re-litigate it unprompted. ⛔ 18 files name Nile Stone and
Next Stone Slabs — §2 rule 9's buying list, now indexed. A private repo with collaborators gives his
devs identical access; the offer stands.

⭐ **USE `git status --porcelain` AS A SCOPE PROOF** before every commit.

⛔ **GITIGNORE PATTERNS MUST BE `**/`-ANCHORED** — a pattern with a slash is anchored to the repo
root and the site lives at `Topcat-Worktops-main/Website Demo/…`.

⚠️⚠️ **"NOT RENDERED" IS NOT "REMOVED", AND THIS REPO IS PUBLIC.** If he asks for content to come
off, delete it from what ships.

---

## 6. ⛔ THE INTEGRITY RULE — still the one that matters most

> "These names cannot be wrong. If someone googles it and sees it looks different here, then we
> have a big problem."

```bash
cd "Website Demo/stones" && python3 harvest/verify.py
```

> 132 stones, 132 with a photograph, 132 pages on disk — ✅ PASS *(last run 13 Aug)*

⚠️ It covers the STONES only. **Nothing in it looks at the landing page or the new pages.**
`NOT_A_STONE` is the exemption list — keep it exact.

⭐ Both go-live copy scans pass: rule 1 returns nothing, rule 11's centimetres scan returns only
`index.html` — **Judy Z.'s "10cm", the documented exception.**
⚠️ Run the scans with `grep -Ev "(^|/)v2/|\.removed|\.bak"` or archived files report as live.

### ⭐⭐ AND THE CSS GATE — RUN IT AFTER EVERY CSS EDIT

```bash
cd "Website Demo" && python3 -c "
import re
css=re.search(r'<style>(.*?)</style>',open('index.html',encoding='utf-8').read(),re.S).group(1)
i=0;bad=0
while i<len(css):
    if css.startswith('/*',i):
        j=css.find('*/',i+2)
        if j==-1: bad+=1;break
        i=j+2;continue
    if css.startswith('*/',i): bad+=1;i+=2;continue
    i+=1
print('comment issues:',bad,'| braces:',css.count('{')-css.count('}'))"
```

**It must print `0` and `0`.** See §8.1.

---

## 7. ⭐ WHERE THINGS STAND

### The pages

| Page | State |
|---|---|
| **`/`** | the landing page, unchanged above 720px |
| **`/services/`** | hub: the six service tiles, process, why, reviews, enquiry |
| **`/projects/`** | ⭐ the gallery as a **plain column at every width** (D195), reviews, process, enquiry |
| **`/estimate/`** | the estimator **and its stone-picker modal**, the wheel, process, enquiry |
| **`/about/`** | Nick and Rimsha, why, reviews, FAQ, enquiry |
| **`/contact/`** | the enquiry block, FAQ, reviews |
| **`/trade/`** | ⭐ **rebuilt** — six benefit cards, four audiences, reviews, process, its own trade form |
| **`/stones/`** | ⚠️ **NOT rebuilt.** The collection page already IS the stones page; the nav points at it |
| `/materials/` `/guides/` `/worktops/` `/sitemap.html` | the SEO layer, nav repointed only |

### The phone

| Section | State |
|---|---|
| **Top nav** | three bare stripes sized to the logo, no box (D184); bottom line carries the hero's curve, small (D183); **logo goes to `/`** (D194) |
| **Burger menu** | seven links; **Services and Stones have expanding carets** (D194); three CTAs at the foot — Get a free quote / WhatsApp / Call us (D185) |
| **Hero** | photo 30% darker (D187); **both buttons 76%** — "Get a free quote" over "Give us a call" (D188); four bubbles in a **2×2 grid** (D186) |
| **Reviews** | dark card, 15 reviews, no entrance |
| **Services** | popularity order, tiles link to their page, photographs at full brightness |
| **Stone selector** | ⭐ **now ABOVE the project gallery** (D179), phone only |
| **Project gallery** | plain natively-scrolled column of 8 cards, no animation |
| **Estimator** | one piece = one labelled card |
| **Footer** | centred head, badge pills, social row; **logo goes to `/`** |
| **Floating button** | WhatsApp, **bottom corner**, rides the sticky bar when it appears (D180) |
| Sticky bottom bar | Get a quote · Email · Call — quote button now **flat, not milled** (D181) |

---

## 8. ⛔ THE LESSONS THAT COST THE MOST

### 1. ⛔⛔⛔ PROSE APPENDED AFTER A CLOSED `*/` IS BARE CSS, AND IT EATS THE NEXT RULE

The parser discards it AND the rule immediately after it. ⭐⭐ **IT LOOKS EXACTLY LIKE A SPECIFICITY
PROBLEM AND IS NOT ONE.** The tell: the rule is **absent from `document.styleSheets` altogether**.
§6 has the gate.

### 2. ⛔⛔ MOVING A CSS BLOCK: CHECK THE DESTINATION, NOT JUST THE DIFF

D195 lifted the static-gallery rules out of the phone media query — and the first attempt deleted the
block and re-inserted it **at the same index**, so it never left. The diff looked right. The tell was
`.gal-mid` still computing to `display:block` instead of `contents`.

### 3. ⛔⛔ A FLEX COLUMN SQUASHES ITS ROWS BEFORE IT SCROLLS

The menu's sixth submenu link was cut in half. Raising the height cap changed nothing: the panel was
**asking for 216px and rendering at 194**, because the default `flex-shrink:1` let the browser take
22px out of it. ⭐ `flex:none` on every row is the fix; the overflow then goes to the container's
`overflow-y`, which is what it is for.

### 4. ⛔ A COMPONENT LIFTED OUT OF THE HERO BRINGS ITS ENTRANCE WITH IT

The trust bubbles rendered at **opacity 0** on the new pages — present, 89px tall, holding their
space, invisible. `.hero-el` is released by a class the HERO gets on load, and there is no hero on
those pages. It reads as "the markup was not inserted", which is the wrong thing to go looking for.

### 5. ⛔ A DIALOG IS A SIBLING OF ITS SECTION, NOT A CHILD

The estimator's stone-picker lives outside `#estimator` (a full-screen dialog has to, or the
section's stacking context traps it), so extracting the section left it behind and the estimator
wired itself against nulls. **It threw at the IIFE's closing brace — a line number that points at
nothing.**

### 6. ⚠️⚠️ THE PREVIEW PANE GOES `visibilityState:'hidden'` AND FREEZES EVERY TRANSITION AT ZERO

Twenty minutes went into a menu that read `opacity:0` on every row and was styled perfectly. ⭐ **The
proof is `el.getAnimations()`** — a transition sitting at `currentTime:0` in state `running` is a
stopped clock, not a cascade problem. ⭐ **Check `document.visibilityState` FIRST.** A screenshot
still forces a paint; computed styles of animated properties do not.

### 7. ⛔ WHEN A CHANGE HAS A COST SOMEWHERE ELSE, THE COST STAYS BEHIND — FIFTH TIME

D179 moved the stone selector above the gallery, and D158's seam compensation — keyed to a DOM
selector, not a painted position — would have tightened the wrong seam. Previous four: `animPx`,
`--gold-lo`, the FAQ drawer, `#gallery`'s own `margin-top:-70px`.

---

## 9. ⚠️ THE ENVIRONMENT TRAPS

- ⛔⛔⛔ **A STRAY `*/` SILENTLY DELETES THE NEXT CSS RULE.** §8.1, and the gate in §6.
- ⛔⛔ **THE PANE GOES `visibilityState:'hidden'`.** §8.6. `tabs_create` + `navigate` sometimes
  fronts it; often nothing does. Verify by screenshot, not by computed opacity.
- ⛔⛔ **`scroll-behavior:smooth` IS ON `<html>` — EVERY PROBE `scrollTo` ANIMATES.**
- ⛔ **THE PANE SILENTLY RESIZES ITSELF.** A probe read `innerWidth:570` after being set to 375.
  **Read `innerWidth` in the same call as your measurements.**
- ⛔ **A STALE SCREENSHOT WILL DISAGREE WITH LIVE DOM READS, AND THE DOM IS RIGHT.**
- ⛔ **`javascript_tool` TIMES OUT AT 30s.** Split long settles into ≤24s calls.
- ⛔ **THE PANE CANNOT TAP ANYTHING BELOW 768px AND IT FAILS SILENTLY.** Use `el.click()`.
- ⚠️ **THE PANE DOWNSCALES A 1440px VIEWPORT INTO AN ~800px IMAGE** — measure desktop, don't look.
- ⚠️ **The browser console ACCUMULATES ACROSS NAVIGATIONS.** Filter by the current `?v=` hash or you
  will chase an error you already fixed.
- ⛔ **`catalogue_source.py` is a 52-STONE SNAPSHOT, not the range.** `catalogue_active.py` is.
- ⛔ **AN INVENTED DATA VALUE CAN BLANK THE WHOLE SITE.** Valid presets: calacatta, carrara, crema,
  emperador, eternal, fumo, goldveil, mist, nerogold, statuario.
- ⛔ **THE RANGE IS ALPHABETICAL EVERYWHERE (D85). NO DARK STONE ON THE FIRST SCREEN (D86).**
- ⚠️ **`-s.webp` IS 800px, NOT 300.** ⛔ Do NOT run `expand.py`.

---

## 10. ⛔ RULES THAT MUST NOT BE BROKEN

1. ⛔ **A stone's NAME and its PHOTOGRAPH must both match the supplier's own** (§6).
2. ⛔ **Fabrication is OUTSOURCED. Never claim in-house.** Templating, fitting and aftercare ARE
   theirs and may be claimed freely.
3. ⛔ **Never state something we cannot guarantee, and never use an absolute.**
4. ⛔ **Every measurement in millimetres.** The estimator's linear metres of edging is the exception.
5. ⛔ **A stone is called what it is; the range is named for what it contains** — "Marble & Quartzite".
6. ⛔ **Never a bright or gold line across the TOP of a card or section**, anywhere.
7. ⛔ **Suppliers are never named publicly.**
8. **No showroom. Never show the review count. Never signal a young company. Value, not cheap.**
9. **Voice:** quietly confident master. British English, commas not em dashes, no exclamation marks.
10. ⛔ **The logo is the client's artwork and is never re-drawn. Set HEIGHT only.**
11. ⛔ **ONE DEVICE AT A TIME. Only the client unfreezes a band** — see §3.
12. ⛔ **The Google mark stays in its four official colours and the WhatsApp glyph keeps its shape.**
    **The Google "G" is the only multi-colour element on the site, on purpose.**
13. ⭐⭐ **THIS IS A DESIGN BUILD. NEVER RAISE THE MISSING FORM BACKEND AS A BLOCKER.** Client,
    13 Aug: *"right now, we are mostly working on the design of the site, the buttons and the forms
    and all those things. We will tie them where they need to be once the time is right, especially
    the contact forms, especially the WhatsApp working."* Build them so they look and behave right,
    and stop there. ⛔ The trade form's send button is `type="button"` for exactly this reason — a
    submit with no action would reload the page under him mid-review.

---

## 11. OPEN — DO THESE NEXT

### ⭐ The one that blocks everything

1. ⭐⭐ **HOW DO FILES GET TO `thadeusg3.sg-host.com`?** §4. He reviews there; it was a full round
   behind. **Nothing else on this list matters if he cannot see the work.**

### ⭐ Ask him these, they are cheap

2. ⭐⭐ **DOES IT STILL RELOAD, AND IS IT SMOOTHER?** 89 compositing layers and all 63 turbulence
   filters went in the performance round, but **the eviction theory is still unverified on his
   handset.** Asked once, not answered.
3. ⭐⭐ **FACEBOOK, TIKTOK, YOUTUBE?** Only Instagram and LinkedIn exist on his own site. Facebook
   returns 400 and the TikTok handle is an empty stub. ⛔ **Do not guess handles.**
4. ⭐ **THE PHONE'S HERO SUBTITLE DROPPED THE PLACE.** "across London and the Home Counties" is gone
   from the hero on mobile only. It is still in the footer, FAQ, schema and page title.
5. ⚠️ **IS IT RIMSHA OR REMSHA?** He said "Remsha" in a voice note; the page says **Rimsha**.
   ⛔ It is a real person's name on a public page. **Same call taken on Jhanzeb.**
6. ⭐ **Does the brand marquee come off DESKTOP too?** D143 hid it on the phone only.
7. ⚠️ **HAS HE SEEN `/stones/compare.html` WORKING?** The picker was broken from the day it was built.

### The rest

8. ⭐⭐ **THE TABLET ROUND, THE MOMENT HE CALLS IT.** §3. It still has the flip-card grid, black
   review cards, the brand marquee, **and every desktop-shaped thing the phone has fixed** —
   including the animated gallery on the landing page.
9. ⭐ **Photography — the STONES are done. The PEOPLE and the PROJECTS are not.** ⚠️ Say out loud
   that the director portraits and the Why feature shot are placeholders. ⚠️ **Three of the six
   service tiles show the wrong subject** — Bathrooms a bare slab, Outdoor Kitchens a quarry,
   Commercial a kitchen. ⭐ **Now on `/services/` as well as the landing page.**
10. ⚠️ **A live copy problem, HALF fixed.** `SERVICES[0].long` was corrected on 13 Aug — it claimed
    fabrication TopCat outsource AND stated an absolute. ⛔ **The same phrase is still live on the
    six service PAGES** ("Vein-matched by hand"). ⚠️ `verify.py` check 7 does not scan inline data.
11. ⭐ **Pick a production host** and give it brotli + long-lived cache headers.
12. ⭐ Close the licensing question on Caesarstone, CRL and Bloom. ⛔ Classic Quartz Stone is off
    limits. ⭐ **Calacatta Gold is UNRESOLVED** — needs the maker's name from his intro video.

**Still waiting on the client:** whether Quartzite becomes a fourth range, 20mm vs 30mm pricing
(⚠️ the estimator's thickness toggle currently moves no number, which is correct until he rules),
brackets for vanity tops / fireplaces / tables, and the £3k vs £3,850 three-slab discrepancy.

---

## 12. ⭐ HOW THIS CLIENT WORKS

⛔⛔ **DO THE THING HE ASKED FOR, IN THE MESSAGE HE ASKED FOR IT.** He sends asks in runs of four to
eleven and adds more mid-build. Do them in his order. **Say plainly which you are dropping and why.**

⛔⛔ **DO NOT ARGUE YOURSELF OUT OF SOMETHING HE ASKED FOR. THIS ROUND'S WORST MISTAKE.** He asked
for a dropdown in the nav menu; D189 reasoned that a phone cannot hover and that six more links would
push the sheet past one screen, so it built the desktop menu only and **told him the reasoning**. His
reply: *"did I not fucking ask you to create a drop down in the menu?"* ⭐ **The reasoning was
sound and the answer was still wrong**, because it answered a question he had not asked. If he names
a thing, build the thing.

⚠️ **HE CORRECTS THE DIAGNOSIS, NOT JUST THE DESIGN, AND HE IS USUALLY RIGHT.** **Take the report as
data even when the explanation is hedged** — and go and MEASURE before deciding he is describing the
thing you think he is. The "two dividers" was two dividers. The "gigantic gap" was 5632px of runway.

⚠️⚠️ **HE REVERSES HIMSELF FREELY AND FAST — SOMETIMES ONE MESSAGE LATER — AND THAT IS FINE. LOG
IT.** This round: **D180** reversed D173; **D188** reversed D186 one message later; **D194** reversed
D189's own reasoning. ⛔ **Write the reversal into §D WITH THE REASON THE OLD DECISION EXISTED**, or
the next session helpfully rebuilds the thing he just rejected.

⭐ **DELETE, DO NOT OVERRIDE, WHEN REVERTING.** Two competing descriptions of one element is how
D106, D113 and D114 each lost a rule to a later one at equal specificity.

⭐ **HE WILL COMMISSION SOMETHING SPECULATIVELY IF YOU GIVE HIM A WAY OUT.** Offer that shape for
anything open-ended.

⚠️ **HE SWEARS WHEN SOMETHING LOOKS WRONG, AND THE COMPLAINT IS ALWAYS REAL.** Do not get defensive
and do not over-apologise. Find it, name the actual cause, fix it, say what it was.

- **Walk the journey, do not check the page.**
- ⭐ **LOOK AT THE RESULT BEFORE REPORTING IT DONE.** Every fault he found this round was invisible
  to measurement and obvious in a picture.
- **Measure, then claim.** ⚠️ **And if you could not measure it, say so.**
- ⚠️ **HE SOMETIMES SAYS "just push to GitHub, don't tell me you're going to."** Push, then report.

---

## 13. BUDGET AND THE DOCUMENT SET

- **~82 credits** of the client's **100-credit ceiling** spent. About **18 left**. ⭐ **This round
  cost none** — layout, CSS, script and build tooling only, no image generation.

| File | What it is |
|---|---|
| **`HANDOVER.md`** | ⭐ The single current state. §D is the register, **D1–D130 and D132–D196**. §2 the standing rules, §2a the supplier list. ⚠️ **THERE IS NO D131 ROW** |
| **`Website Demo/build_pages.py`** | ⭐⭐ **NEW — builds the six internal pages and the shared assets.** Read its docstring before touching any generated page |
| `Website Demo/assets/site.css` `site.js` | ⛔ **GENERATED. Never edit.** Change `index.html` and re-run |
| `HANDOVER-2026-08-12-ten-ask-mobile-round-start-here.md` | the START HERE two rounds back |
| `Website Demo/index.html.pre-internal-pages.bak` | ⭐ **This round's baseline** — before the pages existed |
| `Website Demo/index.html.pre-galstatic-lift.bak` | before the static-gallery rules left the phone query |
| `Website Demo/index.html.pre-stone-sections.bak` | ⭐ **Holds the LIGHT STONE BANDS version (D161), which he rejected.** Keep it — the only copy |
| `Website Demo/stones/build_stones.py` | Builds the collection, compare.html and 132 stone pages |
| `Website Demo/stones/harvest/verify.py` | ⭐ The nine-check gate. `NOT_A_STONE` is the exemption list |
| `Website Demo/dev-server.js` | Compression, caching, and the reload that keeps scroll position |
| `stones/supplier_names.py` | ⭐ The seven authorised name differences |
| `Docs/topcat-worktops-SEO-LOG.md` | Every URL, title, target query and SEO change |
| `HANDOVER-archive-to-2026-08-06.md` | ⚠️ **Every design the client rejected, in his words.** Read before redesigning anything |

⚠️ **Section numbers in `HANDOVER.md` are referenced from code comments** (`§3`, `§4`, `§5a`, `§6.7`,
`§7.5` are live in `index.html`). **Do not renumber.**

⚠️ **`Website Demo/` holds 68 `index.html.pre-*.bak` files** — gitignored, and a git repo (§5).

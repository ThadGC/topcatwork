# START HERE — 10 August 2026, end of the LOGO, DARK QUARTZ and NAME-INTEGRITY round

Read this, then `HANDOVER.md` **§D** (the decision register, start at **D69–D83**) and **§2**
(the standing rules). That is about fifteen minutes and it is enough to work safely.

> ⚠️ **This replaces the version written after the naming round**, now archived as
> `HANDOVER-2026-08-10-naming-round-start-here.md`. It described a 115-stone range and a
> seven-check gate. Both have moved: the range is **126** and the gate has **nine** checks.

---

## 0. ⛔ RUN THIS BEFORE YOU DEPLOY, AND BEFORE YOU CALL ANYTHING DONE

```bash
cd "Website Demo/stones" && python3 harvest/verify.py
```

> 126 stones, 126 with a photograph, 126 pages on disk — ✅ PASS

**Nine checks now, not seven.** Every one exists because it caught something that was already
live on the client's site:

| # | Catches | The real case behind it |
|---|---|---|
| 1 | same IMAGE, two names | Almond Beige == Calacatta Gold Soft, pixel-identical |
| 2 | same TILE FILE, two stones | Dolce Vita and Dolce Vita Leather both → `dolce-vita.webp` |
| 3 | same STONE, two names | Black Marinace == Nero Marinace, because "nero" is Italian for "black" |
| 4 | stale tile | tiles from an older run still shipping |
| 5 | a page for a stone we no longer sell | four dead pages stayed live and indexable |
| 6 | a measurement that is not millimetres | 22 pages printed `322 x 162 mm` for a slab in centimetres |
| 7 | a promise we cannot keep | 355 hits, including "the pattern is consistent across the slab" |
| 8 | ⭐ a photograph from the WRONG SUPPLIER, or with no provenance | proven by pointing Carrara at a Caesarstone file |
| 9 | ⭐ a NAME that disagrees with the supplier's own title | **15 stones shipped a honed or leathered slab under a plain name** |

⭐ **Checks 8 and 9 are the newest and the most important.** See §2 below.

---

## 1. WHERE IT STANDS

```bash
node "Website Demo/dev-server.js"      # → http://localhost:5501
```

**⚠️ There is no git.** This is a GitHub ZIP, not a clone. Take a dated `*.pre-<thing>.bak`
before any large edit — those backups are the only version control there is.

| | |
|---|---|
| Live pages (non-V2) | **162** |
| The range | **126 stones**, every one with a real supplier photograph and a description written from it |
| Quartz | 61 — ⚠️ **48 light, 13 dark**, of which 3 are black |
| Marble & Quartzite | 45 — ⚠️ **18 marble, 26 quartzite, 1 travertine** |
| Granite | 20 |
| Tiles | smallest **1200px**, 118 of 126 at 1600+ |
| Internal links | 7,763, **0 broken** |

**Desktop design is essentially complete. What is missing is plumbing, photography and the
name-accuracy work below.**

### The two things that actually block go-live

1. ⭐⭐ **The enquiry form has no backend, and it carries file uploads.** `buildEnquiry()` in the
   CTA IIFE assembles a `FormData` and has nowhere to POST. The client was burned by a previous
   agency whose site produced **one client in nine months**, and this engagement will be judged
   on **measurable leads**. There is nothing to measure. Netlify Forms with uploads is the
   obvious fit. **Top open item for five sessions and still not done.**
2. **Photography — the STONES are done. The PEOPLE and the PROJECTS are not.** Three director
   portraits, one Why feature shot, three About work photographs, and eight gallery projects
   that currently reuse service images under invented names and places.

---

## 2. ⛔ THE INTEGRITY RULE — newest, and the one that matters most

The client, after finding a stone whose photograph did not match its name:

> "These names cannot be wrong. If someone googles it and sees it looks different here, then we
> have a big problem. And if someone chooses this one by this name and TopCat somehow shows up
> at the house with a wrong looking slab, then we are fucked."

⭐ **A stone name is only meaningful RELATIVE TO A SUPPLIER.** "Calacatta Gold" is a marketing
name that different manufacturers put on completely different-looking products. So the site can
never be validated against a generic Google image — you would be validating against whoever
ranks that day. **The only defensible test is that the photograph shipped under a name is the one
THAT supplier publishes under THAT name.** Checks 8 and 9 enforce exactly that.

### ⛔ THREE WAYS THIS HAS ALREADY GONE WRONG

1. **Wrong finish under a plain name — 15 stones.** Provenance was correct on every one, and
   they were still wrong, because our name dropped the supplier's finish word. Nile's
   "BELVEDERE LEATHER" was listed as **Belvedere**; "Carrara Honed" as **Carrara**; "Blue Dunes
   Leather" as **Blue Dunes**; "PATAGONIA EXTRA" as **Patagonia**. All renamed to the supplier's
   own title. **Check 9 now fails the build on this.**
2. **Right stone, wrong VIEW.** Calacatta Oro came from the right supplier under the right name
   and still looked like a different stone, because the window was a tight zoom on a quiet patch
   — thin veins on blank white, where the slab is dramatic diagonal copper veining. ⭐ **A tile
   must show the stone at a scale where its PATTERN is recognisable, not merely at the right
   resolution.** No check catches this. Only the eye does.
3. **A rename made by the agent.** Chasing the client's reference, "Calacatta Gold Oro" was
   renamed to "Calacatta Gold" and pointed at a hand-picked crop. ⛔ **Reverted.** The supplier's
   name is the authority and is never "corrected" to match a customer's expectation.

### ⚠️ `stones/supplier_names.py` — the seven authorised differences

Five are the **supplier's own misspellings** of well-known stones, where our spelling is what a
customer googles: `Artic Cream`, `Verde Gautemala`, `Macaubus Fantasy`, `White Eclpyse`,
`Grigio Shimmerr`. Plus `Carrara Jumbo` (JUMBO is a slab FORMAT, not a different stone) and
Travertine Romano Classico's `H/F`.

⭐ **An entry there AUTHORISES the difference** and records the exact string an order must be
placed against. ⛔ The check still fails if that record drifts from the supplier's real title, so
the exception list cannot rot.

---

## 3. ⚠️ THE TRAPS THAT WILL WASTE YOUR SESSION

- ⛔ **`catalogue_source.py` is a 52-STONE SNAPSHOT. It is not the range.** `catalogue_active.py`
  is. Reading the wrong one has caused **four** live defects (D51, D59, D68, D78).
- ⛔ **A SECOND FILE THAT LOOKS LIKE THE SOURCE OF TRUTH IS THIS PROJECT'S RECURRING BUG.** The
  fourth instance was `SLAB_TILES` in index.html: the stone PAGES read `manifest.json` and the
  WHEEL read a separate map only `match.py` wrote, so fourteen stones showed the real photograph
  on their page and a **drawn SVG cartoon** on the wheel. ⚠️ Nothing errored — the drawn fallback
  is by design. `apply_catalogue.py` now derives SLAB_TILES from the manifest and fails the build
  if any stone has no tile.
- ⛔ **AN INVENTED DATA VALUE CAN BLANK THE WHOLE SITE.** `preset:"noir"` — a preset name that
  does not exist — made `marble()` throw at the top of the script, before the reveal observer was
  wired, so every `.rise` element stayed at opacity 0 and the hero, copy and reviews simply were
  not there. `node --check` passed, the build passed, verify passed, every route returned 200.
  `check_presets()` in `apply_catalogue.py` now fails the build on it.
- ⛔ **`[hidden]` LOSES TO ANY AUTHOR `display` RULE.** Three instances: `.st-badge` (found and
  fixed), `.st-drawer` (the Refine button did nothing for its whole life) and `.est-lm` (the
  estimator's metres field showed before a profile was chosen). Any element you hide with
  `hidden` and give a display value needs its own `[hidden]{display:none}`.
- ⛔ **CHECK WHAT IS A DIRECT CHILD OF `<body>` BEFORE ADDING A FIXED BACKGROUND.** The stone
  pages' floor is `body::before` at z-index 0, and `nav.crumb` sits outside `<main>`, so the
  breadcrumb was invisible on all 127 stone pages until the back button was added beside it and
  did not show either.
- ⛔ **THE RANGE IS ALPHABETICAL EVERYWHERE (D85), AND THE WHEEL IS NO LONGER A POPULARITY FAN.**
  `catalogue_active.py` sorts on the displayed name within each material, and that one sort feeds
  the collection grid, the estimator's picker and the wheel. ⚠️ **This reverses D74** — granite
  now opens on **seven dark stones in a row**, which is the wall D74 existed to remove. The client
  has seen it. If he wants the spread back, sort on the FIRST LETTER only and spread tone within
  each letter (his own hedge), which is a change to `_alphabetical` and nothing else.
- ⛔ **THE WHEEL'S SEATING AND ITS ORDER BELONG TOGETHER.** `fanOrder` used to seat rank 0 centre,
  rank 1 left, rank 2 right, outwards — right for a popularity list. Feed an alphabetical list
  into that and the eleven read 9,7,5,3,1,0,2,4,6,8,10: perfectly sorted, invisibly so. It is
  sequential now. ⚠️ Put the centre-out seating back if you ever put popularity order back.
- ⛔ **NO DARK STONE ON THE FIRST SCREEN (D86), AND ALPHABETICAL ORDER CANNOT DO IT ALONE.**
  Granite's longest run of consecutive lights A-to-Z is **three**. `clearOpening()` walks outward
  taking the next light stone each way until it has `OPEN_SPAN` a side, then puts the skipped
  darks back **split half each side** — that split is the balance the client asked for.
  ⚠️ **Measure the visible window before changing OPEN_SPAN.** The wheel shows **9 cards** fully
  at every width tested (912 to 1920); protecting only five put the deferred darks at +4 and +5,
  on screen and both on one side, and the client saw it. ⛔ It applies to the WHEEL only; the
  collection grid stays a plain sorted list — if they ever have to match, MOVE the function rather
  than copying it. Opens on Azul Shimmer / Carrara Honed / Bianco Crystal.
- ⛔ **V2 NO LONGER EXISTS (D87).** The switcher pill, `versions.html`, `index-v2.html` and the
  whole `v2/` tree are in `.removed-2026-08-10-v2/`, outside `Website Demo/`. ⭐ That closes the
  standing risk that V2's un-rewritten in-house-fabrication claims could be published by a
  revival. ⚠️ Older measurements say "non-V2 pages"; that now just means "pages".
- ⛔ **`slabify.py` rewrites every tile it accepts.** After any full run:
  `cp -f stones/harvest/_upscale/installed/*.webp assets/slabs/`
- ⛔ **If you change a crop, sync the restore set FIRST.** `_upscale/installed/` holds the
  *pre-fix* tile and the restore copies it back. Aqua Gucci and Calacatta Gold Oro were each
  "fixed" twice before this was understood.
- ⛔ **NEVER rebuild a crop from `rec["box"]`.** Two earlier steps rebind `im`. Doing it put a
  window into Calacatta Vagli Oro and a ceiling crane into Travertine Romano.
- ⛔ **Do NOT run `expand.py`.** It rebuilds from the original 52 and would delete live stones.
- ⚠️ **Upscaling cannot rescue a small soft source.** Ten CRL tiles were enlarged 2.6x and three
  still had to be dropped. CRL publish 1280×625 slab scans and nothing larger; their 3840px
  assets are installed-room photography.
- ⚠️ **A "warm pixel" metric finds BROWN, not gold.** It picked a busy brown marble three times
  running while hunting for Calacatta Gold, and scored 29% on a kitchen full of light wood units.
- ⚠️ **Explanations belong in Python, never in an HTML comment in the template.**
- ⚠️ **`10cm` in Judy Z.'s review trips the millimetres scan and must stay.** A real customer's
  words. Check every scan hit before acting on it.

---

## 4. THE PIPELINE

```bash
cd "Website Demo/stones"
python3 apply_catalogue.py            # MATERIALS + SLAB_TILES into ../index.html, with guards
python3 harvest/similar.py            # measures tiles -> similar.json. BEFORE build.
python3 build_stones.py               # 126 stone pages + the collection grid
python3 harvest/verify.py             # ⛔ the gate, nine checks
cd .. && python3 build_seo_pages.py   # 26 pages incl. the sitemap; re-run whenever the range changes
```

⭐ **One stone list.** `catalogue_active.py` is the only place that says what the site sells. It
concatenates `catalogue_expanded.py` (the base) with `catalogue_dark.py` (the stones added by
hand on 10 Aug) and then **interleaves dark and light within each material** (D74).

⚠️ `catalogue_dark.py` and `descriptions.py` exist SEPARATELY because `grow.py` regenerates
`catalogue_expanded.py` — which is how the D46 correction was silently reverted.

**Super-resolution** (`upscale.py`, model `bytedance_image_upscale`): ⭐ four stones per job, a
flat 2 credits whatever the input size. ⛔ It does not generate stone; it enlarges the supplier's
own photograph.

---

## 5. ⛔ RULES THAT MUST NOT BE BROKEN

Full list in `HANDOVER.md` §2. The ones that get broken by accident:

1. ⛔ **A stone's NAME and its PHOTOGRAPH must both match the supplier's own** (§2 above).
2. ⛔ **Fabrication is OUTSOURCED. Never claim in-house.** Templating, fitting and aftercare ARE
   theirs and may be claimed freely.
3. ⛔ **Never state something we cannot guarantee, and never use an absolute.** Comparatives are
   safe. Enforced by check 7.
4. ⛔ **Every measurement in millimetres.** The estimator's linear metres of edging is the one
   exception, because it is a pricing unit.
5. ⛔ **A stone is called what it is; the range is named for what it contains** — "Marble &
   Quartzite". `RANGE_LABEL` in build_stones.py and `MAT_LABEL` in index.html.
6. ⛔ **A wrong image under a right name is the worst possible outcome.**
7. ⛔ **The scene gate is a filter, not a guarantee. A contact sheet at 330px minimum, looked at
   by a person, is the only check that catches a forklift in the frame.**
8. ⛔ **Never a bright or gold line across the TOP of a card or section**, anywhere.
9. ⛔ **Suppliers are never named publicly.** Porcelain never goes on the stone wheel.
10. **No showroom. Never show the review count. Never signal a young company. Value, not cheap.**
11. **Voice:** quietly confident master. British English, commas not em dashes, no exclamation
    marks.
12. ⚠️ **Natural stone photography is INDICATIVE and only the copy says so.**
13. ⚠️ `stones/harvest/raw/` is 1.6GB and must not be deployed.

---

## 6. ⚠️ WHAT THE CLIENT HAS NOT SEEN

**Almost everything from 7 August onwards**, plus all of this session. Show it in this order:

1. **The real logo** — nav, footer and favicon, on every page.
2. **The page floor** (§4l) and the stone pages now standing on it.
3. **About and Why — by SCROLLING, not screenshots.** Both builds are motion.
4. **The stones** — the wheel, the collection, a stone page. Biggest visible change.
5. **The SEO layer** — a material page, then a guide, then a town page, in that order.

⚠️ **Say out loud that the three director portraits and the Why feature shot are placeholders.**

---

## 7. OPEN — DO THESE NEXT

1. ⭐ **Confirm the Bloom trade account.** The **six Mirror stones are LIVE** (D89) — White, Cream,
   Grey, Brown, Blue and Black Mirror, from Bloom's own product pages under their own names.
   ⚠️ Licensing on Bloom is open, same question as Caesarstone and CRL.
   ⛔ **The search-the-supplier lesson from that round**: an earlier pass concluded these stones did
   not exist, from one listing page's embedded JSON, and shipped the wrong products. Bloom's own
   **search box** returned all six in one request. **Search the supplier's own search before
   concluding a product does not exist — a category that merely sounds right is not the product.**
2. ⭐⭐ **Build the enquiry form backend.** Nothing else changes whether this is judged a success.
2. ⭐⭐ **Walk the name-and-image audit sheet.** Checks 8 and 9 prove provenance and wording;
   they cannot prove the crop *looks* like the stone. That needs eyes on all 126, our tile beside
   the supplier's own photograph. Calacatta Oro was found that way and there may be more.
3. ⭐ **Calacatta Gold is UNRESOLVED.** The client's intro video is built around it. Nile's quartz
   of that name is grey-veined and their marble of that name is a busy brown; the client's
   reference is a third manufacturer's product. Every harvested supplier has been searched.
   ⭐ **Needs the maker's name from the video, or Nick naming his source.**
4. ⭐ **Close the licensing question on Caesarstone and CRL.** Fourteen live stones come from
   them and `LICENSING.md` says TopCat must BUY from a source for its photography to be
   defensible. The client instructed it directly; get the accounts confirmed before go-live.
   ⛔ A business risk, not a code risk. No scan will catch it.
5. ⭐ **Harvest the four suppliers never touched** — AKG, Bloom, Classic Quartz and
   **Cosentino/Silestone**. Silestone alone likely carries more dark quartz than everything
   added so far. See `HANDOVER.md` §2a for the client's full supplier list and URLs.
6. **Build `/services/`** — the client already assumes it exists. It needs copy he has not seen,
   which is the only reason it was not built.
7. **Have TopCat read the 126 stone descriptions.** No human at TopCat has read them.
8. **The mobile and tablet pass.** Genuinely untouched, and the agreed next phase after desktop.
9. **Real project photographs and names** for the eight `PROJECTS` entries and four people slots.
10. **A clamp-floor sweep, still not done sitewide.**
11. **The popularity ranking is editorial, not TopCat's sales data** (`POPULAR` in index.html).
12. **Confirm live paths before go-live**, and re-run all four compliance scans.

**Still waiting on the client** (full list in §D): whether Quartzite becomes a fourth range, the
20mm vs 30mm price question, brackets for vanity tops / fireplaces / tables, the hero's "Request
a call" demotion (asked four times), and the £3k vs £3,850 three-slab discrepancy.

---

## 8. ⭐ HOW THIS CLIENT FINDS BUGS, AND WHAT IT MEANS FOR YOU

**Every defect of the last four sessions rendered perfectly.** A page showing `322 x 162 mm`
looks no different from `3220 x 1620 mm`. A drawn SVG cartoon under a real stone's name looks
like a slab until you know the range. A blank site looked like a slow load.

He finds them by **walking the site as a customer would**, and by **googling the stone names**.
So:

- **Walk the journey, do not check the page.** Every recent fault lived in the gap between two
  screens that were each individually correct.
- ⭐ **LOOK AT THE RESULT BEFORE REPORTING IT DONE.** Three faults in one session — the invented
  preset, the SVG cartoons, the covered breadcrumb — all passed every automated check and would
  have been caught by opening the page once.
- **Measure, then claim.** "0 orphaned pages" was true when written and false for a week.
- **Write the check that fails the build**, not the note that warns. Nine of them exist now.
- ⚠️ **A guard that fires is usually right.** Check 3 flagged "Calacatta Oro == Calacatta Gold"
  and it was correct to ask. Exceptions get written down with evidence, never quietly widened.

---

## 9. BUDGET AND ENVIRONMENT

- **~80 credits** of the client's **100-credit ceiling** spent, **8 of them this session** (three
  2×2 montages for the dark quartz, one for Calacatta Oro's re-crop). **381 remain in the
  account**, but the client's ceiling is the binding number — about 20 left.
- ⚠️ **Cannot push to GitHub from this machine.** No `.git`, no `gh`, no credential helper.
- ⚠️ **The Browser pane's console replays stale entries.** Instrument a copy instead: write
  `_debug.html` with an error probe in `<head>`, load that, read `window.__ERRS__`. That is how
  the blank-site bug was found in one step.

---

## 10. THE DOCUMENT SET

| File | What it is |
|---|---|
| **`HANDOVER.md`** | ⭐ The single current state. §D is the decision register, **D1–D83**, including every reversal. §2a is the client's supplier list |
| **`stones/supplier_names.py`** | ⭐ The seven authorised name differences and the exact string an order must use |
| **`stones/catalogue_dark.py`** | The stones added by hand on 10 Aug, and **the six candidates rejected, with reasons** |
| `stones/descriptions.py` | The 126 descriptions, with the rules for writing them at the top |
| `Docs/topcat-worktops-SEO-LOG.md` | Every URL, title, target query and SEO change |
| `HANDOVER-2026-08-10-slab-photography-complete.md` | ⭐ How the photography pipeline works. Read §2, §3 and §5 before touching `stones/harvest/` |
| `HANDOVER-2026-08-10-naming-round-start-here.md` | The previous START HERE. Superseded by this file |
| `HANDOVER-archive-to-2026-08-06.md` | ⚠️ **Every design the client rejected, in his words.** Read before redesigning anything |

⚠️ **Section numbers in `HANDOVER.md` are referenced from code comments** (`§3`, `§4`, `§5a`,
`§6.7`, `§7.5` are live in `index.html`). **Do not renumber.**

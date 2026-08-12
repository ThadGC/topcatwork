# START HERE — 10 August 2026, end of the NAMING round

Read this, then `HANDOVER.md` **§D** (the decision register, start at **D56a–D68**) and **§2**
(the standing rules). That is about fifteen minutes and it is enough to work safely.

> ⚠️ **This replaces the version written after the photography session**, which is now archived as
> `HANDOVER-2026-08-10-photography-start-here.md`. It described a 115-stone range with 63
> generated descriptions and a four-check gate. All three of those facts have moved.

---

## 0. ⛔ RUN THIS BEFORE YOU DEPLOY, AND BEFORE YOU CALL ANYTHING DONE

```bash
cd "Website Demo/stones/harvest" && python3 verify.py
```

> 115 stones, 115 with a photograph, 115 pages on disk — ✅ PASS

**Seven checks now, not four**, and they exist because each one caught something that was already
live on the client's site:

| # | Catches | The real case behind it |
|---|---|---|
| 1 | same IMAGE, two names | Almond Beige == Calacatta Gold Soft, pixel-identical |
| 2 | same TILE FILE, two stones | Dolce Vita and Dolce Vita Leather both → `dolce-vita.webp` |
| 3 | same STONE, two names | **Black Marinace == Nero Marinace** — two different photographs of one stone, because "nero" is Italian for "black". A pixel check passes this happily |
| 4 | stale tile | tiles from an older run still shipping after the pipeline started refusing them |
| 5 | a page for a stone we no longer sell | four dead pages stayed live and indexable after their catalogue entries went, invisible to checks 1–4 because those all read the catalogue |
| 6 | a measurement that is not millimetres | 22 pages printed `322 x 162 mm` for a slab recorded in centimetres — a worktop the size of A4 |
| 7 | a promise we cannot keep | 355 hits, including "the pattern is consistent across the slab" on all 45 marble pages |

⚠️ **Same stone in a different FINISH is legitimate** — Absolute Black is genuinely sold polished,
honed, leathered and brushed. ⚠️ **Material is part of the identity key**: the engineered quartz
"Carrara Jumbo" and the natural marble "Carrara Polished" are different products sharing a
marketing name. Remove either nuance and the guard becomes a nuisance that gets switched off.

---

## 1. WHERE IT STANDS

```bash
node "Website Demo/dev-server.js"      # → http://localhost:5501
```

**⚠️ There is no git.** This is a GitHub ZIP, not a clone. Take a dated `*.pre-<thing>.bak` before
any large edit — those backups are the only version control there is.

| | |
|---|---|
| Live pages (non-V2) | **152** — 115 stones + collection, 10 guides, 6 services, 6 materials, 9 location, trade, sitemap, landing |
| The range | **115 stones**, every one with a real supplier photograph and a description written from it |
| Quartz | 50 |
| **Marble & Quartzite** | 45 — ⚠️ **18 marble, 26 quartzite, 1 travertine** |
| Granite | 20 |
| Internal links | 2,716, **0 broken** |

**Desktop design is essentially complete. What is missing is plumbing and photography, not design.**

### The two things that actually block go-live

1. ⭐⭐ **The enquiry form has no backend, and it carries file uploads.** `buildEnquiry()` in the
   CTA IIFE assembles everything into a `FormData` and has nowhere to POST. This is bigger than it
   looks: the client was burned by a previous agency whose site produced **one client in nine
   months**, and this engagement will be judged on **measurable leads**. There is currently nothing
   to measure. Netlify Forms with uploads is the obvious fit. **This has been the top open item for
   four sessions and is still not done.**
2. **Photography — the STONES are finished. The PEOPLE and the PROJECTS are not.** Three director
   portraits (1:2 standing crops, a third of the About collage), one Why feature shot, three About
   work photographs, and eight gallery projects that currently reuse service images under invented
   names and places.

---

## 2. ⛔ THE NAMING RULE — newest, and the one most likely to be undone (D66)

The client pressed **Marble**, opened Fusion Black, and the page said **Quartzite**:

> "On the collection page it shows marble, but on the actual page it says quartzite, natural stone.
> So we have to say available in marble and quartzite or something like that. **We cannot have that
> confusion.**"

⭐ **The rule that came out of it: a stone is always called what it is; the RANGE around it is
named for what it contains.** The range is labelled **"Marble & Quartzite"**.

⛔ **Do not "simplify" this back to Marble.** Both literal alternatives were considered and killed:

| Tempting fix | Why it is wrong |
|---|---|
| "Taj Mahal is available in marble and quartzite" | Not true of any single stone and unfixable — it is one rock. Every UK merchant sells it as quartzite, and one sells an engineered **quartz** imitation under the same name |
| "Just call it natural stone" | Throws away the word customers search, the reason the stone costs what it does, and re-opens D65 — and it attaches marble's care copy (etches with acid, softer) to a stone that does neither |

**Where each name is used:**

- **The range name** — wheel tab, collection filter, estimator tab and picker, sitemap column, and
  the `Range` row on the stone page.
- **The true rock** — wheel readout, collection card tag, estimator's stone line, enquiry chip,
  page title, meta, hero tag, eyebrow, "About …" heading, image `alt`.

⭐ **To change the wording, change two constants**: `RANGE_LABEL` in `stones/build_stones.py` and
`MAT_LABEL` in `index.html`. Everything reads from them.
⛔ **`mat` is the browse-and-pricing key and is never changed to fix a wording problem.** No price,
filter, POA behaviour or deep link moved for any of this.
⚠️ The single **travertine** is deliberately not in the label — one stone in 45, its own card and
page say Travertine, and a three-noun range name reads as a list.

**Still TopCat's call:** whether Quartzite becomes a genuine fourth range. The groundwork is done,
so it is now a small change. **Worth asking Nick whether his customers ask for quartzite by name.**

---

## 3. ⚠️ THE TRAPS THAT WILL WASTE YOUR SESSION

- ⛔ **`catalogue_source.py` is a 52-STONE SNAPSHOT. It is not the range.** `catalogue_active.py`
  is. Reading the wrong one has now caused **three separate live defects** (D51, D59, D68) — the
  most recent left 63 stone pages out of the HTML sitemap, on the page whose entire job is to prove
  nothing is orphaned. ⚠️ **The "0 orphaned pages" figure did not catch it**, because it was
  measured before the range grew and never re-measured. Re-measure claims, do not inherit them.
- ⛔ **`slabify.py` rewrites every tile it accepts, including the 94 upscaled ones.** After any
  full run: `cp -f stones/harvest/_upscale/installed/*.webp assets/slabs/`
- ⛔ **If you change a PIN, purge that stem from the restore set FIRST** — `_upscale/installed/`
  holds the *pre-pin* tile and the restore copies it back over your corrected crop. Aqua Gucci and
  Calacatta Gold Oro were each "fixed" twice before this was spotted.
  `rm -f stones/harvest/_upscale/installed/<stem>*.webp` then edit `upscaled.json` to match.
- ⚠️ **`slabify.py --only <stem>` overwrites the whole of `slabify-report.json`** with that one
  record. It is for eyeballing one stone, never a partial rebuild.
- ⛔ **NEVER rebuild a crop from `rec["box"]`.** Two earlier steps rebind `im`, so `box` is not in
  the original file's coordinate space. Doing it put a **window** into Calacatta Vagli Oro, a
  **ceiling crane** into Travertine Romano and a **stock label** into Colombo Juparana. Ask slabify
  via `process(crop_out=…)`.
- ⛔ **Do NOT run `expand.py`.** It rebuilds from the original 52 and would delete live stones. Use
  `grow.py`, which grows what is already there.
- ⚠️ **A pin must be keyed on the stem the MANIFEST names**, not the catalogue's `tile=`. Pinning
  the wrong one does nothing, silently.
- ⚠️ **Explanations belong in Python, never in an HTML comment in the template.** A comment quoting
  a banned phrase ships in the source of all 115 pages and trips every naive scan.
- ⚠️ **`upscale.py --install` does not populate `_upscale/installed/`.** Sync it by hand or the
  next full run reverts your work.
- ⚠️ **A swallowed exception is worse than a crash.** The sitemap's `except` hid an import error and
  shipped a sitemap with **no stones at all**, exit code 0. Check the output, not the exit code.
- ⚠️ **`10cm` in Judy Z.'s review trips the millimetres scan and must stay.** It is a real
  customer's words. Check every scan hit before acting on it; never edit a review to satisfy one.

---

## 4. THE PIPELINE

```bash
cd "Website Demo/stones"
python3 apply_catalogue.py            # inject MATERIALS (incl. `kind`) into ../index.html
python3 harvest/match.py --prune      # name -> tile, manifest.json + SLAB_TILES
python3 harvest/similar.py            # measures tiles -> similar.json. BEFORE build.
python3 build_stones.py               # 115 stone pages + the collection grid
python3 harvest/verify.py             # ⛔ the gate, seven checks
```

⭐ **One stone list.** `catalogue_active.py` is the only place that says what the site sells.
`build_stones.py` imports it; `apply_catalogue.py` injects it into index.html. It used to be three
hand-synced copies, which is unmaintainable at 115 and fails silently.

⚠️ **The sitemap is generated separately** by `build_seo_pages.py` and reads the same catalogue.
Re-run it whenever the range changes, and check the stone count in its heading.

**Super-resolution** (`upscale.py --plan / --extract / --montage / --split / --install`): ⭐ four
stones per job — the upscaler charges a flat 2 credits whatever the input size, so a 2×2 montage
costs the same as one crop. ~370 credits one-at-a-time → 70. ⛔ It does **not** generate stone; it
enlarges the supplier's own photograph. ⚠️ It is **not** Higgsfield Soul — Soul generates images,
which would produce fake marble under a real stone's name. The model is `bytedance_image_upscale`.

---

## 5. ⛔ RULES THAT MUST NOT BE BROKEN

Full list in `HANDOVER.md` §2. The ones that get broken by accident:

1. ⛔ **Fabrication is OUTSOURCED. Never claim in-house.** Templating, fitting and aftercare ARE
   theirs and may be claimed freely. Cutting and polishing are not.
2. ⛔ **Never state something we cannot guarantee, and never use an absolute.** Comparatives are
   safe, absolutes are not. Enforced by verify check 7.
3. ⛔ **Every measurement in millimetres.** The one exception is the estimator's linear metres of
   edge profile, which is a pricing unit.
4. ⛔ **A stone is called what it is; the range is named for what it contains** (§2 above).
5. ⛔ **A wrong image under a right name is the worst possible outcome.** Material guard by supplier
   *section* (never folder), supplier guard, porcelain refusal, four duplicate guards. All have
   caught live errors.
6. ⛔ **The scene gate is a filter, not a guarantee.** **A contact sheet at 330px minimum, looked at
   by a person, is the only check that catches a forklift in the frame.** 215px is too small — that
   is exactly how eight faults reached the client.
7. ⛔ **Never a bright or gold line across the TOP of a card or section**, anywhere.
8. ⛔ **Suppliers are never named publicly.** Porcelain never goes on the stone wheel.
9. **No showroom, ever. Never show the review count. Never signal a young company. Value, not
   cheap.**
10. **Voice:** quietly confident master. British English, commas not em dashes, no exclamation
    marks.
11. ⚠️ **Natural stone photography is INDICATIVE and only the copy says so.** Every marble and
    granite page carries "You approve photographs of your actual slab before a single cut".
12. ⚠️ `stones/harvest/raw/` is 1.0GB and must not be deployed.

---

## 6. ⚠️ WHAT THE CLIENT HAS NOT SEEN

**Almost everything from 7 August onwards.** That is three design rounds, the entire 25-page SEO
layer, the photography, the copy round and the naming round.

**Show it in this order**, because each sits on top of the last:

1. **The page floor** (§4l) — he steered it over six messages without ever seeing where it landed.
2. **About and Why — by SCROLLING, not screenshots.** Both builds are motion, and the nav bar's
   flash only exists in the moment you leave the top of the page.
3. **The stones** — the wheel, the collection, a stone page. This is the biggest visible change.
4. **The SEO layer** — walk a material page, then a guide, then a town page, in that order. The
   town page only makes sense once the pattern has been seen.

⚠️ **Say out loud that the three director portraits and the Why feature shot are placeholders.**
The Why slot now holds a real photograph and no longer announces itself.

---

## 7. OPEN — DO THESE NEXT

1. ⭐⭐ **Build the enquiry form backend.** Nothing else on this list changes whether the engagement
   is judged a success.
2. ⭐⭐ **Build `/services/` — the client already assumes it exists.** He described the footer's
   Services link as going "to the services page, and all that section of the site". It does not
   exist; the link points at the landing page's services section. It is also the one page family
   without a hub. **It needs copy he has not seen, which is the only reason it was not built.**
3. ⭐ **Have TopCat read the 115 stone descriptions.** Colour and pattern only, written from the
   tiles, but no human at TopCat has read them.
4. **Ask TopCat the two open questions**: should Quartzite be its own range, and do their customers
   ask for it by name?
5. **The estimator's product-type selector** (§6.6) — blocked on Nick supplying brackets for
   anything other than kitchens.
6. **Real project photographs and names** for the eight `PROJECTS` entries, and the four
   people/feature slots.
7. **The mobile and tablet pass.** Genuinely untouched, and it is the agreed next phase after
   desktop. At 375px the sections stack and run well past one screen.
8. **A clamp-floor sweep, still not done sitewide.** Violations have twice been found by a section
   breaking rather than by a sweep. ⚠️ Flat px vertical measures are the worse half and the easier
   half to miss.
9. **Ask Caesarstone, CRL and Cosentino for fabricator asset packs** — the only route to a wider
   granite and marble range. An email, not a code change.
10. **Two supplier photographs still carry faults that are in the ORIGINAL**: Aqua Gucci and Verde
    Alpi (yard marks). Better frames from the supplier would fix them.
11. **The popularity ranking is editorial, not TopCat's sales data** (`POPULAR` in index.html).
    ⚠️ It orders the top 11 per material and should be revisited now the range is 115.
12. **Confirm live paths before go-live**, and re-run all four compliance scans.

**Still waiting on the client** (full list in §D): whether 20mm vs 30mm should change the price,
brackets for vanity tops / fireplaces / tables, the 1-slab-with-island bracket, the hero's "Request
a call" demotion (asked four times), and the £3k vs £3,850 three-slab discrepancy — probably VAT,
a two-minute check with Nick.

---

## 8. ⭐ HOW THIS CLIENT FINDS BUGS, AND WHAT IT MEANS FOR YOU

**Every defect of the last three sessions rendered perfectly.** A page showing `322 x 162 mm` looks
no different from one showing `3220 x 1620 mm`. "The pattern is consistent across the slab" reads
like ordinary marketing. A tab saying "Marble" over a quartzite looks like a tab.

He found several of them himself, by **walking the site as a customer would** — not by reading
code. So:

- **Walk the journey, do not check the page.** Every recent fault lived in the gap between two
  screens that were each individually correct.
- **Measure, then claim.** "0 orphaned pages" was true when written and false for a week.
- **Any list a human typed will go stale.** Two did this session alone. Derive it or delete it.
- **Write the check that fails the build**, not the note that warns. Seven of them exist now
  because a warning would have been ignored.

---

## 9. BUDGET AND ENVIRONMENT

- **~72 credits** of the client's **100-credit ceiling** spent, all on `bytedance_image_upscale`
  (70 on the main run, 2 on the D56a re-crops). **~461 remained at the last count** — re-check
  before spending. ⚠️ The account's free "unlim" allowance shows `available: false` and does not
  cover the upscaler in any case; it is a generation-model allowance.
- ⚠️ **Cannot push to GitHub from this machine.** No `.git`, no `gh`, no credential helper. A fresh
  `git init` shares no ancestry with `github.com/lukecopley6/Topcat-Worktops`, so a push would need
  `--force` and would destroy their history. Confirm with the repo owner first.
- ⚠️ **The Browser pane's console replays stale entries** from earlier loads, including from files
  since deleted, with line numbers that do not match. Do not trust it — instrument a copy instead.
  See `HANDOVER.md` §8.

---

## 10. THE DOCUMENT SET

| File | What it is |
|---|---|
| **`HANDOVER.md`** | ⭐ The single current state. §D is the decision register, D1–D68, **including every reversal**. Read it before re-proposing anything |
| **`stones/descriptions.py`** | The 115 stone descriptions, with the rules for writing them at the top |
| `Docs/topcat-worktops-SEO-LOG.md` | Every URL, title, target query, schema decision and SEO change — written to hand to the client's SEO specialist |
| `HANDOVER-2026-08-10-slab-photography-complete.md` | ⭐ How the photography pipeline actually works. Read §2, §3 and §5 before touching `stones/harvest/` |
| `HANDOVER-2026-08-10-photography-start-here.md` | The previous START HERE. Superseded by this file, kept for its pipeline detail |
| `HANDOVER-2026-08-07-design-round.md` | The scroll builds, the FAQ, the enquiry form's foot |
| `HANDOVER-archive-to-2026-08-06.md` | ⚠️ **Every design the client rejected, in his words.** Read before redesigning anything |

⚠️ **Section numbers in `HANDOVER.md` are referenced from code comments** (`§3`, `§4`, `§5a`,
`§6.7`, `§7.5` are live in `index.html`). **Do not renumber.**

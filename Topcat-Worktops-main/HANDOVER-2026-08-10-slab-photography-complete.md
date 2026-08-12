# Session write-up — real slab photography, finished (9–10 August 2026)

**What was asked:** *"I want you to have every single stone there in its actual pattern and image.
And if someone searches it, it's that exact pattern and image when they look for it so that there's
no fucking mistakes… make sure this image is exactly on each stone page, and everywhere where that
stone needs to show up."* Then, later: *"the 11 stones that show are the UK's top 11 most popular
choices, and the one that displays first must be the most popular of each stone."*

**Where it ended:** **52 of 52 stones carry a real supplier photograph**, on every surface a stone
appears on. The wheel opens on the most popular stone of each material. Two automatic guards now
stand between the catalogue and a wrong image, and both caught errors that were already live.

> For the operational summary — how to re-run it, what the rules are — read
> `HANDOVER-2026-08-10-photography-start-here.md` (renamed when the current
> `HANDOVER-NEXT-CHAT-START-HERE.md` superseded it). **This file is the reasoning.** Read it before changing
> anything in `stones/harvest/`, because most of what looks like a threshold worth tuning here was
> arrived at by looking at several hundred photographs, and the obvious tuning has already failed.

---

## 1. THE FINDING THAT DEFINED THE SESSION

The previous session left 6 of 52 stones photographed and a plan to fix it by harvesting ~2,535
stones from marble.com. That plan was wrong twice over, and the real problem was somewhere else
entirely.

**The images were already on disk.** 43 of the 52 stones had an exact-name photograph from the
client's own suppliers sitting in `raw/` the whole time. **The pipeline was throwing them away.**

Six bugs did it, and — this is the useful part — *five of them were the same mistake wearing a
different hat*:

> **a measurement that condemns a stone for being what it is.**

That sentence is worth keeping. Every gate in `slabify.py` measures a photograph and asks "is this
a usable picture of a slab". The failure mode is a gate that mistakes a property of *the product*
for a fault in *the photograph* — and because stone genuinely spans black to white and plain to
riotous, this happens constantly and silently. Nothing errors. The stone just quietly keeps a
drawing, and nobody counts the ones that never arrived.

---

## 2. THE SIX BUGS

### 2.1 The scene gate could not see a black stone

`classify()` rejected any image where more than 1.5–6% of pixels sat below luminance 40, on the
reasoning that a room "runs from the inside of a cabinet to a blown-out window". A polished black
granite is ~100% below luminance 40.

It removed **Absolute Black Extra (range 12, dark 99.99%), Nero Marquina, Jet Black, Laurent
Black, Angola Black, Azalai Negro, Woodlands, Vanilla Noir, Soft Black, Terra Marron** — the
blackest, flattest, most obviously-a-scan images in the set were the ones it was most confident
about.

**Method that found it:** every one of the 60 images the gate rejected was cropped, labelled with
its measurements and put on a contact sheet, and looked at. **49 of the 60 were flat slab scans.**

The docstring also claimed the separation was complete with no overlap (scans 6–59, kitchens
164–236). That is false on the fuller set: the slab scan **Fusion Wow measures 239** and the
showroom photograph **Carrara Satin measures 251**. No threshold on luminance range can split them.

**Replaced with** per-cell lighting spread (6×6 grid) *and* whole-image straight-line detection,
which is what actually separates a kitchen from a slab: a room is **both** unevenly lit across the
frame **and** full of long straight structure. A slab is at most one of the two.

⚠️ **The thresholds are deliberately looser than the best fit.** An exhaustive search over the 60
hand-labelled images finds a rule catching all 11 rooms and losing only 2 scans — but at 60 samples
and 3 free parameters that is a fitted rule, not a measured one. The numbers in the code sit clear
of that optimum on the permissive side, because **the two errors are not equal**: a room that leaks
through is visible on a contact sheet and gets pulled by hand, while a scan that is wrongly cut is
lost in silence. Leak toward keeping.

### 2.2 "Overexposed" condemned pale and plain stones

`overexposed()` measured the flat share near **each picture's own** 98th percentile. On a dark
stone the "highlight" it measured was not a highlight at all — Absolute Black scored 51.9% "blank"
at a median of 30. The second clause (`med>=228 and spread<=26`) fired on any pale quartz with a
fine even grain, which is a whole product category rather than a fault.

Of the **49 images it rejected, one was genuinely blown.** Same contact-sheet method.

Now it only fires on real clipping (`med>=246 and spread<=8`). The brightest legitimate scan in
that set sat at median 240, spread 19.

### 2.3 The candidate picker preferred tidy over usable

`main()` ranked a stone's frames by crop score and *then* applied the gates — but score is computed
before the resolution, exposure and sharpness checks run. So a small tidy frame (0.928) beat a
large usable one (0.888), won the group, and died on the floor, **taking the stone down with it**
even though a passing candidate was sitting right there. Arabescato Elegance was the proof.

Now: **passing beats scoring**, then bigger beats smaller among the genuinely tied.

⚠️ **`TIE_MARGIN` is 0.02 and it was 0.06, which was too wide and shipped a kitchen.** Arabescato
Gold's lifestyle photograph of a finished island scored .79 at 2712px against a clean warehouse
scan at .825/2004px; at 0.06 the kitchen counted as "equally clean" and won on size. It went out on
a contact sheet with two chairs and a run of cabinets in it. **Score is the safety judgement; size
is only a tie-break.**

### 2.4 The slab finder stopped inside dramatic stones

`find_slab_box()` grows a region outward from the middle while each next row still "looks like" the
core, with the tolerance capped at 70. A stone whose own light-to-dark swing is wider than that
fails its own likeness test, so the walk halts **inside the slab**: Colombo Juparana came out
1214×398 from a 1600×957 photograph, Nero Marquina 1292×605 from 2016×1512. Both are strongly
patterned, which is the whole reason a customer wants them.

Cap raised to 92, and the walk now steps over up to two unlike rows — a dark vein band crossing the
slab reads as "not the core material" for a few rows and then the stone resumes. The warehouse,
when it really arrives, does not relent after two rows.

### 2.5 `MAX_CANDIDATES = 4` truncated the good frame away

Nile publish up to nine pictures of one product and the useful one is not reliably in the first
four. **Cloud Burst listed eight: the first four are all styled kitchens and the fifth is
"CLOUD BURST CLOSE.jpg", a flat close-up of the slab.** The stone had been written off in the
previous handover as "Nile only publish lifestyle shots of it" — while a perfectly good scan sat at
position five, never fetched. Now 10.

### 2.6 Next Stone's harvester discarded every frame after the first

`next_items()` kept a `seen` set and `continue`d on a slug it had already met, so **a second
photograph of a stone was treated as a duplicate and thrown away before it could be scored.**
Tuscany Supreme has four frames across Next's pages and was being judged — and rejected — on one.
Candidates now accumulate per stone, as they always did for Nile.

Two related things surfaced with it: three of Next's six pages were **never read at all** (a
39-image gallery and a second quartz page, both on WordPress.com's default numeric slugs), and the
filename suffix stripper ran once instead of repeatedly, so `tuscany-supreme-ft-1` became
`tuscany-supreme-ft` — a slug of its own — and the extra frames landed in a separate group.

---

## 3. THE RESOLUTION FLOOR WAS MEASURED AGAINST THE WRONG THING

The floor had been raised to 700px so a tile fills the wheel card 1:1 on a retina screen. That is a
fair number and it is correctly derived — the card measures 290×351 CSS at a 1600px viewport, so
581×701 device pixels, and `object-fit: cover` on a square tile scales by the long side.

It also made most of the range unreachable, because Next Stone publish their originals at about
509px on the short side and there is nothing larger behind them.

**Both assumptions behind it were tested, and both failed:**

- **Does a sub-700 tile actually look bad?** Tiles were generated at 432–648px and composited at
  exactly 581×701, the way the browser will show them, and looked at 1:1. They are clean. Slightly
  soft against a 1400px tile if you pixel-peep, and far better than the drawn slab the client has
  twice rejected as an "AI slab look".
- **Are small sources soft sources?** No, and this was the surprise. Blur-response across every
  publishable candidate, by size band:

  | band | n | median sharpness |
  |---|---|---|
  | 380–500px | 68 | 3.8 |
  | 500–600px | 42 | 4.6 |
  | 600–700px | 63 | 4.7 |
  | 700–900px | 32 | 5.3 |
  | 900px+ | 55 | 4.7 |

  A small original here is a small scan of a sharp photograph, not a blurry one. **Pixel count was
  standing in for softness, and softness is already tested directly.**

So the floor is now **340px with a sharpness bar that rises as the source shrinks** — 1.55 at
700px+, 1.80 from 440, 4.00 below that. The stones the strict band lets through measure 5.1 and
6.3; the ones it stops measure 1.2 and 2.9. Nothing lands near the line.

⚠️ **`SCALE_MIN_PX` exists because of this.** The physical-scale re-frame used to guard on
`MIN_SRC_PX`, so dropping the floor to 340 quietly let it start shrinking Next Stone's ~2:1 scans
to 432px, into the strict band, and **four stones that had been shipping stopped**. Two different
questions were wired to one number. Scale consistency is a nicety; it must never cost a tile.

---

## 4. ⛔ THE DECISION NOT TO USE marble.com (D45)

The previous handover called marble.com *"the source that makes the range possible"* and opened by
telling the next session to fetch ~700 pages from it. **That was assessed and reversed.**

- **`LICENSING.md`'s own test is that TopCat must *buy from* a source** for using its photography
  to be defensible — "that reasoning does not stretch to a company TopCat has no account with".
  marble.com is a US countertop retailer. It fails the same test that put Caesarstone and CRL on
  "ask first", and arguably the one that excluded Bloom and AKG as competitors.
- **It was not needed.** The licensed suppliers reached 52 of 52 once the six bugs above were fixed.
- **It would have been wrong for the quartz regardless.** See §5.

**The cheap half is kept.** `harvest/mdc_index.py` indexes all **2,363** marble.com names from a
*single* sitemap request and downloads nothing — the whole catalogue is one fetch, because every
material URL carries its own name in the slug. If the client ever licenses them, matching is ready.

### ⚠️ And an orphaned harvest of it was already running (D47)

A marble.com-only harvest **started at 21:01 by a previous session was still alive** when this one
began, and had pulled 542 files before it was found and killed. Nothing from it reached the site
(verified against the manifest), and `raw/marbledotcom` has been deleted.

**It was missed by the opening sweep** because it runs Python from a heredoc and its command line
never contains the literal string `harvest.py`. **When checking for stray jobs on this project,
grep for the working directory, not the script name.** It had also silently edited `slabify.py`
mid-session, which is why the floor read 700 while the report on disk said 820.

---

## 5. ⭐ THE TWO GUARDS, AND THE LIVE ERRORS THEY CAUGHT

The client's rule is that a wrong image under a right name is the worst possible outcome. `match.py`
already had `ALIAS` (pairs confirmed by eye) and `DENY` (pairs that must never join). That was not
enough, because **names collide across the trade constantly and a human sign-off does not survive
the next person's edit.** Two structural guards now sit behind the eye.

### 5.1 Material — the section, never the folder

An engineered quartz may only wear a quartz photograph, and natural stone a natural one, judged on
**the section the supplier files a product under** (recorded in `catalogue.json`).

⚠️ The first version of this check read the *source folder* and assumed `nile-inv` was all natural
stone. **It is not** — Nile's stock system carries a quartz category too, and the check blocked
eight perfectly good quartz matches. The section is what knows.

**What it caught:** the natural marble **Calacatta Gold Oro** was wearing Next Stone Slabs'
*engineered quartz* "Calacatta Gold". The alias had been inherited from an earlier session marked
*"✅ Confirmed by eye against the source photograph"* — and it was **live on the site**. A customer
choosing natural marble was being shown a quartz.

It also caught the reverse in the making: the catalogue's marble **Carrara** takes the exact-match
branch on its own plain name, so the moment a `carrara` tile existed (Nile's quartz Carrara,
harvested for Carrara Jumbo) it would have taken it.

### 5.2 Supplier — for engineered quartz only

An engineered quartz may only wear **its own maker's** photograph, because the name belongs to the
brand. Natural stone is exempt: there the name is the quarry's, so any supplier's Nero Marquina is
Nero Marquina.

**What it caught:** **Carrara Shimmer** (TopCat buy Nile's; the tile was Next's — and Next's is a
beige banded stone, nothing like "the fine grey grain of Carrara") and **Arabescato Gold** (the
reverse — Nile's 1400px frame was winning on size against the Next product TopCat actually sell).

This is the same reasoning that keeps marble.com out of the quartz range, now expressed in code.

### 5.3 Porcelain

Nile's `top-marazzi` section is Marazzi **porcelain**. The standing client rule is that porcelain
never appears on the stone wheel, so anything from that section is refused outright.

---

## 6. PINS — the short, explicit list of human overrides

Some frames cannot be judged by any measure available here, because what gives them away is knowing
what a slab is. `PINS` in `slabify.py` names the frame and, where needed, the crop. **A pin
overrides the sharpness and clipping gates — never the scene gate.** No crop of a photograph of a
kitchen belongs in a slab selector, whoever signed it off.

| stone | why it needed a hand |
|---|---|
| Bianco Eclypsia Calacatta | the sharpest frame has a pale timber A-frame post down its right edge, almost exactly the colour of the marble — `line_veto` reads it at 2.10 and an edge-colour test ranks it *below* Fusion Black, whose bright band is the actual stone |
| Cristallo | a yard shot with sky above the slab |
| Calacatta Vagli Oro | the only frame there is: a doorway and machinery in the right fifth, a stock label at the top |
| Crema Evora | a plain cream with almost no movement, which *is* the product. Reads 1.2 on blur-response for having nothing to lose. ⚠️ Next's is the QUARTZ; nile-inv's "Crema Evora Polished" is a natural MARBLE of the same name |
| Carrara (quartz) | Nile's Carrara reads 71.6% clipped for being white on white; the grey veining is plainly there. Chosen over the larger frame because that one carries Nile's logo |
| Carrara Shimmer | supplier pin — Nile's, not Next's |
| Arabescato Gold | supplier pin — Next's, not Nile's |

---

## 7. THE SELECTOR, ORDERED BY UK POPULARITY (D48)

`POPULAR` in `index.html` is three lists, one per material, most popular first. `fanOrder()` lays
them out **centre-out** around the wheel's landing slot: rank 1 dead centre, then 2 and 3 either
side, then 4 and 5, outwards.

⚠️ **It has to be centre-out rather than simply sorted.** The wheel is a fan — it shows a window
around the landing slot and wraps at both ends — so a plainly sorted list would put the *least*
popular stones in the left wing, on screen, the moment the section opened.

Verified in the browser: the eleven-card window is exactly the top eleven, in the order
10, 8, 6, 4, 2, **1**, 3, 5, 7, 9, 11.

| material | opens on | why |
|---|---|---|
| Quartz | **Calacatta Oro** | white/off-white leads the UK market, and gold-on-white Calacatta Oro is the specifically named 2026 front runner |
| Marble | **Carrara** | the most popular UK marble on availability, with Calacatta beside it |
| Granite | **Absolute Black Extra** | black granite is the perennial first choice |

`BEST` (the estimator's default stone) is now **derived** from `POPULAR`. It was three hand-written
slugs that had drifted from the wheel's landing card, so a customer coming down from the wheel found
the estimator had quietly changed their stone.

⚠️ **This ranking is evidenced editorial judgement, not TopCat's sales data.** It is one table on
purpose: the moment the client has real figures, reorder the three lists and nothing else changes.

---

## 8. WHAT CHANGED, FILE BY FILE

| file | change |
|---|---|
| `harvest/slabify.py` | `classify()` rewritten; `overexposed()` relaxed to real clipping; `find_slab_box()` tolerance + hysteresis; centre-of-slab fallback for stock photography; graded sharpness bands + `SCALE_MIN_PX`; `PUBLISHABLE` licence gate; `PINS` |
| `harvest/match.py` | material guard, supplier guard, porcelain refusal; `DENY` and `ALIAS` corrections (including removing two inherited aliases that were wrong); `--prune` |
| `harvest/harvest.py` | `MAX_CANDIDATES` 4→10; Next's three unread pages; repeated suffix stripping; candidates accumulate per stone; marble.com `ok=False` |
| `harvest/mdc_index.py` | **new** — indexes marble.com's 2,363 names from one request, downloads nothing |
| `stones/build_stones.py` | `stone_face()` — the 52 stone pages, the collection grid and the related-stones cards now emit the photograph; Misterio Gold corrected |
| `stones/stone.css` | `img` rules beside the existing `svg` ones so a photographed slab fills the frame identically |
| `index.html` | `POPULAR` + `fanOrder()`; `BEST` derived; `SLAB_TILES` (52); the stale "natural stone keeps the drawn slab" comment replaced; Misterio Gold corrected |
| `stones/catalogue_source.py` | Misterio Gold corrected |
| `harvest/LICENSING.md` | marble.com row; the `PUBLISHABLE` gate recorded |

**Backup before this session:** `Website Demo/index.html.pre-slabs.bak`.

⚠️ **`slabify.py` writes a tile for every image it can crop (176), because the suppliers stock
plenty TopCat do not list.** `match.py --prune` leaves only the 52 the manifest points at — 8.1MB
instead of ~28MB inside `assets/`. Run it with `--prune` or the extras deploy.

---

## 9. HOW THIS WAS VERIFIED

Not by the gates. **By looking at every tile that ships, next to the name it ships under.**

That is the only check that can answer the question the client actually cares about, and it caught
things no measure did: the timber post in Bianco Eclypsia, the sky in Cristallo, and — on the final
pass, after the tie-margin change — **Arabescato Gold arriving as a photograph of a kitchen**.

Also verified:

- 52/52 in `manifest.json`, in `SLAB_TILES`, and on 52 stone pages; the three copies of the stone
  list (`catalogue_source.py`, `STONE_LIST`, `MATERIALS`) agree on all 52.
- Every `/assets/slabs/*.webp` reference in built HTML resolves; 0 failed resources in the browser;
  inline JS passes `node --check`.
- No shipping tile comes from an unlicensed source (28 nile-inv, 10 nile, 14 next).
- No cross-material or cross-supplier mismatch remains.
- The wheel lands on rank 1 for all three materials.

Contact sheets kept: `Docs/stone-photography-all-52.png`, `Docs/stone-selector-popularity.png`.

---

## 10. WHAT IS LEFT

1. **The popularity ranking should be replaced with the client's own sales figures** (§7).
2. **Four stones are photographed at 360–400px** — Belvedere 360, Calacatta Vagli Oro 384, Bianco
   Eclypsia 392, Astoria 392. Honest, but soft on the stone-page hero, which is the largest place a
   tile is shown (436×558 CSS, so 1116 device pixels). Better frames from the suppliers would fix
   it; nothing else is needed.
3. **Misterio Gold's corrected copy needs the client's eye** (D46), and a handful of other blurbs
   were written against a drawing rather than the slab — Calacatta Fantastico is called "one of the
   boldest patterns we hold" against a fairly delicate photograph, Sahara Dunes "calm" against a
   bold one.
4. **Calacatta Gold Oro's only usable frame is honed** and the catalogue sells it polished. The
   pattern is the stone's; the gloss is not.
5. **Ask Caesarstone, CRL and Cosentino for their fabricator asset packs.** Still the legitimate
   route to a wider photographed range, and it costs an email.
6. **The expanded 96-stone catalogue is still not switched on** — untouched by this session.
7. ⭐ **The enquiry form still has no backend.** With the stone photography done, that is now the
   single biggest thing standing between this site and the leads the engagement is judged on.

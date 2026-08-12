# Real slab photography, search rewrite, darker floor — 9 August 2026

What changed, what was decided, and the three things that need a client answer.

> ⛔ **SUPERSEDED IN PART — read `HANDOVER-2026-08-10-slab-photography-complete.md` first.**
> The pipeline described here is still the pipeline, and the search rewrite and page floor still
> stand. But two things in this file were overtaken the next day:
>
> - **The marble.com plan was assessed and reversed (D45).** Do not start that harvest. TopCat have
>   no account with them, so it fails `LICENSING.md`'s own test, and it is the wrong source for
>   engineered quartz. It also turned out to be unnecessary — the licensed suppliers reached
>   **52 of 52** once six collection bugs were fixed.
> - **"Natural stone keeps the drawn slab" was reversed by the client (D44).** Every stone is
>   photographed now. The safeguard moved into the copy.
>
> Several thresholds quoted here (the 820/700px floor, the scene gate's "complete separation with
> no overlap", the exposure test) were **measured wrong and have been rebuilt**. Take the numbers
> from the 10 Aug file, not this one.

---

## D. DECISIONS MADE THIS SESSION

| # | Decision | Why |
|---|---|---|
| D1 | **The stone wheel now shows real slab photography where we have it, and the drawn slab where we do not.** One map, `SLAB_TILES` in index.html, decides. | The customer was choosing from an invention. `marble(preset,seed)` is a good-looking generator, but it is not the stone. |
| D2 | **Only the client's own two suppliers were harvested** (Nile Stone, Next Stone Slabs). Nothing from the other eight links. | Using a supplier's photography to sell that supplier's product is the ordinary trade arrangement. Lifting a competitor's is not. See §L. |
| D3 | **Natural stone keeps the drawn slab far more often than quartz does, and that is correct, not a shortfall.** | Quartz is manufactured and consistent, so one photo is honest for the range. Marble/granite/quartzite are unique per block, which is why TopCat already promise photos of the customer's ACTUAL slab. A single stock photo of "Patagonia" would quietly become a promise about veining. |
| D4 | **A stone with no good photograph falls back to the drawn slab. It never gets a doubtful one.** | Client: "without mistakes". A drawn slab reads as indicative. A photo of somebody's kitchen reads as a lie. |
| D5 | **Catalogue expansion built but NOT switched on** (`stones/catalogue_expanded.py`). At the quality floor it proposes Quartz 31, Marble 20, Granite 11. | Client asked for ~50 a category. Only quartz gets near it, and only if the quality bar drops. See §Q2 and §Q4. |
| D6 | **Finish variants are ONE stone, not three.** Absolute Black Honed / Leathered / Brushed is one entry. | Listing them separately pads a range instead of widening it. |
| D7 | **Stone search rewritten to match how customers type**, on the wheel, the estimator picker and `/stones/`. | It was a name substring. "calcutta", "white", "matt", "sparkly", "marble effect" all returned nothing. |
| D8 | **A Finish filter chip group was added** (Polished / Honed / Leathered). | `finish` was in the data from the start with no way to filter on it. |
| D10 | **A border-trim pass was added after the first tiles shipped with a strip of warehouse wall along the top** (client: "this looks like a cropped image"). | Nothing else caught it: the band is low contrast, has no hard line and is not coloured. It measured +10.8 luminance against the core. Now +3.9. |
| D9 | **Page floor darkened by changing the veil COLOUR, not just its alpha** — now `rgba(2,2,4,0.70)`, was `rgba(6,6,9,0.60)`. | Measured: 15% of the old floor was BRIGHTER than the sections sitting on it, which is why it never read as a backdrop. Now 0.5%. Median 9 → 5, top end still 18 so the grain survives. |

**No decisions were reversed this session.** Everything here is new ground.

---

## What is on the site now

- **17 slab tiles** in `assets/slabs/` (3.6MB, ~220KB each, WebP), **every one 1232px or larger**.
- **7 of the current 52 catalogue stones** have a real photograph. The rest draw as before.
- Tiles are square and **never upscaled**.

### ⭐ Q4 THE ONE THAT NEEDS A DECISION: quality versus coverage

The client asked for two things that the supplier images cannot both satisfy — "everything has
to look 4k perfect quality" and a range of 50 a category. **150 stones have a clean, correctly
cropped photograph available. Only 19 of them are big enough to be flawless.** Measured, over
every image the two suppliers publish:

| source floor | stones | on a 600px card |
|---|---|---|
| 1400px | 19 | 2.3x, flawless |
| 1200px | 25 | 2x, retina-sharp |
| **1000px** | **27** | **1.7x, sharp — current setting** |
| 900px | 32 | 1.5x, good |
| 800px | 38 | 1.3x, acceptable |
| 700px | 42 | 1.2x, starting to soften |
| 600px | 84 | visibly soft |
| 400px | 126 | visibly soft |

The floor is set at **1000px**, so nothing soft ships. That is the only honest way to meet
"4k perfect": a stone that cannot clear the bar keeps the **drawn** slab, which is vector and
therefore sharp at any size. A crisp drawing beats a blurry photograph.

**The real fix is better sources, not more processing.** Upscaling invents nothing. Ask
Caesarstone, CRL and Cosentino for their fabricator asset packs (§Q3) — those are print
resolution and licensed. Failing that, a day photographing slabs at the suppliers' warehouses
would cover the whole range at once, and the photographs would be TopCat's own.

⚠️ **Do not "fix" this by lowering `MIN_SRC_PX` in slabify.py.** That is the knob that trades
the client's stated quality bar for a bigger number, and it should only be moved deliberately.


### ⛔ THE CEILING, MEASURED ACROSS EVERY REACHABLE SUPPLIER (9 Aug 2026)

All ten links were harvested (see §L for the three that cannot be reached). 389 unique stones
were found. Then every downloaded image was measured on its short side, because that is what
caps tile sharpness once upscaling is off the table:

| supplier | images | median short side | usable (>=820px) |
|---|---|---|---|
| Nile stock system | 102 | 1146px | 71 |
| Nile marketing site | 136 | 799px | 48 |
| Caesarstone | 45 | 275px | 13 |
| CRL Stone | 70 | 512px | **0** |
| Next Stone Slabs | 36 | 509px | 1 |
| **total** | **389** | | **133** |

**133 images out of 389 are big enough to make a sharp tile, before any content check.** CRL
publish their whole range at 512-625px and not one image clears the bar. Caesarstone publish a
275px nav thumbnail for most colours and a 1920px close-up for only thirteen. After the content
gates (lifestyle shots, blown highlights, soft or angled sources) the survivors land around 32.

**This is a property of the source material, not of the pipeline.** No amount of processing
adds pixels that were never published. Web imagery across the entire UK supplier set cannot
produce 150 stones at the quality the client has asked for. Two routes actually can:

1. **Trade asset packs.** Every one of these brands supplies print-resolution photography to
   accredited fabricators. It is licensed, it is correctly named, and it is one email per
   brand. This is the cheapest and fastest fix by a wide margin.
2. **Photograph the slabs.** A day at Nile's warehouse with a tripod and a grey card would
   cover the natural stone range at any resolution wanted, and the photographs would be
   TopCat's own to keep.

## The pipeline (`stones/harvest/`)

Four steps, each re-runnable:

```bash
cd "Website Demo/stones/harvest"
python3 harvest.py    # pull data + images from permitted suppliers -> raw/
python3 slabify.py    # crop to the slab, level it, write tiles -> ../../assets/slabs/
python3 match.py      # map catalogue stone -> tile, inject SLAB_TILES into index.html
python3 derive.py && python3 expand.py   # measure tiles, propose the expanded range
```

`slabify.py --report` writes a contact sheet of every accept and reject with its reason.

### What was hard, and what the gates are for

Three failures worth not repeating, all documented in the code:

1. **Kitchen photos passed the first gate.** Scoring a window on smoothness does not work — the installed worktop in a lifestyle shot is genuinely as smooth as a slab scan, so the search happily returned whole kitchens. The fix is a **whole-image** test: a slab scan's luminance range measured 6–59, a kitchen 164–236, with nothing in between. No crop of a kitchen photograph belongs in a slab selector.
2. **The colour grading wrecked the stone.** Flat-fielding each RGB channel separately turned Almond Beige orange and mottled Calacatta Classic pink and green. Autocontrast on a scan whose natural range is 20 levels is a twelvefold contrast gain. Now: lighting is corrected as a single **luminance** offset applied equally to R, G and B, contrast gain is capped at 1.18, and **there is no white balance at all** — the stone's colour is the product.
3. **A clean crop is not a usable one.** Baltic Brown passed every content test and still looked wrong, because its source is a bundle on a rack shot at an angle and the crop was being blown up 3×. Hence the resolution floor and a **blur-response** sharpness test (measuring raw detail instead wrongly rejected polished black granite for being plain).

---

## §L LICENSING — read `stones/harvest/LICENSING.md` before enabling any source

- ⛔ **Classic Quartz Stone is blocked in code.** Their robots.txt names ClaudeBot and disallows it, with `Content-Signal: ai-train=no` — an express reservation under Art.4 of the EU DSM directive. Do not re-enable without their written permission.
- ⛔ **Bloom Stones London and AKG Surfaces are fabricators, i.e. direct competitors**, not distributors. Their photography must not go on this site.
- ⚠️ **Caesarstone, CRL, Cosentino, Noble Stone, Fugen: surveyed, not used.** All are brand-owned imagery. `robots.txt` permitting a crawl is not a copyright licence.

---

## 🔜 FUTURE WORK — "save this stone" (client, 9 Aug 2026, DO NOT BUILD YET)

The client wants a **save / shortlist**, explicitly modelled on saving an Instagram reel: tap a
stone, it goes to a saved folder they can come back to. Deliberately parked, not started.

Worth capturing now while the reasoning is fresh:

- **This is a lead capture mechanism, not a convenience feature.** A worktop is chosen over
  weeks and usually by two people. A shortlist that survives the visit is the closest thing to
  a soft enquiry the site can offer, and it is worth measuring as one.
- **Start with `localStorage`, not accounts.** No login, no cookie banner, no personal data,
  and it works on the first visit — which is where most of the value is. A saved list is not
  personal data, so this needs no consent gate at all. Only ask for an email when the customer
  wants the list on another device or sent to them, and at that point it is a genuine lead.
- ⚠️ **Do not add a login for this alone.** The site currently has no accounts, no backend and
  no cookie banner; adding all three to hold six stone names would be the most expensive
  possible version of this feature. The enquiry form has no backend yet either (still one of
  the two go-live blockers), so a server-side shortlist cannot come first.
- **Where it wants to live:** a save control on the wheel card and on each `/stones/` page, a
  count in the header, and a "your shortlist" view that hands the list to the enquiry form
  pre-filled. That last step is the one that turns it into leads.
- **Question for the client:** should a saved shortlist be shareable by link, so one partner can
  send it to the other? That is the highest-value version and it needs no login either.

---

## Questions for the client

**Q1. Switch the expanded catalogue on?** `stones/catalogue_expanded.py` holds 96 stones and is not yet live. Switching it on means `catalogue_source.py`, `MATERIALS` in index.html and `STONE_LIST` in build_stones.py all move together — they are three copies of one list and must not drift. The 44 new stones carry **generated copy** flagged `review=True`: it accurately describes the slab but has not been through the house voice, and should be read before go-live.

**Q2. Granite cannot reach 50.** Nile and Next list 27 granite names between them, and after collapsing finish variants it is 17 usable. Options: accept a shorter granite range, or open an account with another supplier. Marble reaches 29 the same way. **Quartz reaches 50.** Padding these with stones TopCat cannot source would turn a range into an apology.

**Q3. Do TopCat hold trade accounts with Caesarstone, CRL or Cosentino?** If so, ask each for their fabricator asset pack. That is the legitimate route to a much wider photographed range and costs an email. Flip the `ok` flag in `harvest.py` once a licence is confirmed and record it in LICENSING.md.

---

## Files

| Path | What |
|---|---|
| `stones/harvest/harvest.py` | Sources + downloader. Every source carries an `ok` flag and the reason. |
| `stones/harvest/slabify.py` | Crop, gate, level, write tiles. The three failures above are documented in it. |
| `stones/harvest/match.py` | Catalogue → tile, with a DENY list for false friends (Nero Marquina is not Nero Marinace). |
| `stones/harvest/derive.py` | Measures tone/hue/veining off each tile. |
| `stones/harvest/expand.py` | Proposes the expanded range. |
| `stones/harvest/LICENSING.md` | The ten links, one by one, and what may be published. |
| `stones/catalogue_expanded.py` | The 96-stone range. Not live. |
| `assets/slabs/` | 135 tiles + `manifest.json`. |
| `index.html.pre-slabs.bak` | Backup from before this session. |

⚠️ `stones/harvest/raw/` is 735MB of downloaded originals. It is a working folder and must **not** be deployed.

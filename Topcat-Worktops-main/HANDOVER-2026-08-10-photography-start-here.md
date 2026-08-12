# START HERE — 115 stones, image integrity, filtering (10 August 2026)

Read this, then `HANDOVER.md` §D (decision register — start at **D49–D56**) and
`Website Demo/stones/harvest/LICENSING.md`.

> ⚠️ **This replaces the earlier 10 August version**, which described a 119-stone range. Four
> entries were removed as the same stone listed twice — see §3.

---

## 0. ⛔ RUN THIS BEFORE YOU DEPLOY, AND BEFORE YOU CALL ANYTHING DONE

```bash
cd "Website Demo/stones/harvest" && python3 verify.py
```

> 115 stones, 115 with a photograph — ✅ PASS

`verify.py` is new and it is the most important file added this session. The client found **eight
defects on the live site** that the pipeline had passed, and his standing instruction is:

> "make hundred percent sure … that no two pictures are the same and that every stone is exactly
> the stone we're looking for. Like, if they were to Google this, it would look exactly the same
> because it would be detrimental to the company if someone chooses the stone and it's actually
> the wrong stone. We'd be fucked."

It checks **four failures that do not catch each other**:

| # | failure | how it is caught | real example |
|---|---|---|---|
| 1 | same IMAGE, two names | perceptual hash of the finished tile, Hamming ≤ 8 | Almond Beige == Calacatta Gold Soft, pixel-identical |
| 2 | same TILE FILE, two stones | the manifest | Dolce Vita + Dolce Vita Leather both → `dolce-vita.webp` |
| 3 | same STONE, two names | name key with a synonym table | **Black Marinace == Nero Marinace** — two *different* photographs, one stone, because "nero" is Italian for "black". A pixel check passes this happily |
| 4 | stale tile | compared against `slabify-report.json` | tiles from an older run still shipping after the pipeline started refusing them |

⚠️ **Same stone in a DIFFERENT FINISH is legitimate** and must not be flagged — Absolute Black is
genuinely sold polished, honed, leathered and brushed. ⚠️ **Material is part of the identity key**:
the engineered quartz "Carrara Jumbo" and the natural marble "Carrara Polished" are different
products that share a marketing name. Removing either nuance turns the guard into a nuisance and
it will get switched off.

---

## 1. WHERE IT STANDS

**115 stones — Quartz 50, Marble 45, Granite 20 — every one with a real supplier photograph.**

| | this morning | now |
|---|---|---|
| stones | 52 | **115** |
| with a real photograph | 52 | **115** |
| tiles under 600px | 26 | **0** |
| smallest tile | 360px | 880px (Patagonia, deliberate — §4) |
| tiles at 1600px | 0 | **107 of 115** |
| wheel payload | 10.3MB of masters | **4.1MB of thumbs** |

`assets/slabs` is 32MB on disk; a page pulls the 79kB thumbs, not the 199kB masters.

---

## 2. ⛔ THE "OVEREXPOSURE" WAS THE CSS, NOT THE PHOTOGRAPHS (D49)

The client diagnosed this himself and was right. `layout()` and `fanOut()` in index.html both added
`+near*0.10` to `--dim`. `near` is non-zero only for the centre card, so **the selected slab
rendered at `brightness(1.10)` — a 10% boost applied to the photograph.** Calacatta Fantastico sits
at median 235; 1.10× drives it past 255 and clips.

Both call sites are now `Math.min(1, …)`. **Depth may only ever DIM.**

⚠️ Carrara Jumbo and Carrara Shimmer still *measure* ~31% clipped and are **correct** — that is what
a white quartz photographed on white measures. Checked by eye against the alternatives. Do not
"fix" them.

---

## 3. THE RANGE, AND WHY IT IS NOT 150

Quartz reaches 50. Marble and Granite cannot, and that is a **supply** fact:

- Nile and Next list **27 granite names** between them; 20 survive with a usable photograph.
- Marble peaked at 49 and lost four to the duplicate rules below.

⛔ **Four entries were removed as the same stone twice.** Keeping them would have shown a customer
two names for one thing:

| removed | why |
|---|---|
| Dolce Vita Leather | supplier published ONE photograph under both names |
| Mystic Grey Leather | same — cropping them differently only disguised it |
| Bianco Eclypsia Calacatta Leather | no photograph of its own |
| **Black Marinace** | **same stone AND same finish as Nero Marinace** |

⭐ **The rule this establishes:** a finish variant earns a place only if the supplier photographed
it *separately*. Absolute Black in four finishes is fine — four real photographs. Dolce Vita
Leather was not.

**The only routes to a wider range** are another supplier account, or the Caesarstone / CRL /
Cosentino fabricator packs. An email, not a code change.

---

## 4. THE EIGHT DEFECTS THE CLIENT FOUND, AND THE THREE BUGS BEHIND THEM

Every fault was a nile-inv **yard shot** where the slab does not fill the frame. The quartz studio
scans were all clean. `PINS` in `slabify.py` now holds 20 hand-signed crops.

Fixed: an orange **forklift** (Arabescato Corchia Extra Honed), a **stock block and blue "25"**
(Calacatta Gold Oro), **strip-light bars** (Aqua Gucci), a **cut-off slab top** (Calacatta Viola
Honed), **rack poles** (Arctic Cream, Arabescato Corchia Extra, Dover White), **red shutter doors
and a building** (Fusion Wow Multicolour), **lifting straps** (Mystic Grey, Dolce Vita).

### The three bugs, all fixed at the root

1. **No duplicate check existed at all.** Now a perceptual hash of every finished crop, in
   `slabify.main()`, plus one-tile-one-stone in `match.py`.
   ⚠️ **Hamming distance, not equality** — Mystic Grey Leather slipped an equality check at
   distance 2.
2. **Stale tiles shipped.** `match.py` paired stones to any `.webp` on disk, including ones the
   current run had refused. It now only accepts what `slabify-report.json` approved, plus the
   tiles `upscaled.json` records as legitimately rescued.
3. ⚠️ **THE RESTORE STEP WAS OVERWRITING THE FIXES.** This one cost the most time. See §5.

### ⛔ Patagonia is NOT broken stone

The client asked whether it is "supposed to look like just one giant crack". **Yes, the pattern is
genuine** — Patagonia is a Brazilian quartzite of big angular white shards with dark seams, not a
veined marble. But a tight crop lands *inside one shard* and reads as a single crack. Its pin is
deliberately **wide**, which is why it is the one tile under 1200px (880px). Resolution was traded
for the stone being recognisable. Do not "improve" it by cropping tighter.

---

## 5. ⚠️ THE TWO TRAPS THAT WILL WASTE YOUR SESSION

**`slabify.py` rewrites every tile it accepts, including the 93 upscaled ones.** After any full run:

```bash
cp -f stones/harvest/_upscale/installed/*.webp assets/slabs/
```

⛔ **BUT — IF YOU CHANGE A PIN, PURGE THAT STEM FROM THE RESTORE SET FIRST.** `_upscale/installed/`
holds the *pre-pin* tile, and the restore copies it straight back over your corrected crop. Aqua
Gucci and Calacatta Gold Oro were "fixed" twice before this was spotted, and both times the fault
came back looking like the pin had not worked.

```bash
rm -f stones/harvest/_upscale/installed/<stem>*.webp     # then edit upscaled.json to match
```

⚠️ **`slabify.py --only <stem>` overwrites the whole of `slabify-report.json` with that one
record.** It is for eyeballing a single stone, never a partial rebuild — a later `upscale.py
--plan` then sees one stone and reports the job done.

---

## 6. THE PIPELINE

```bash
cd "Website Demo/stones"
python3 apply_catalogue.py            # inject MATERIALS into ../index.html
python3 harvest/match.py --prune      # name -> tile, manifest.json + SLAB_TILES
python3 build_stones.py               # 115 stone pages + the collection grid
python3 harvest/verify.py             # ⛔ the gate
```

⭐ **One stone list.** `stones/catalogue_active.py` is the only place that says what the site
sells; `build_stones.py` imports it and `apply_catalogue.py` injects it into index.html. It used
to be three hand-synced copies, which is unmaintainable at 115 and fails silently.

⛔ **Do NOT run `expand.py`.** It rebuilds from the original 52 and would delete live stones. Use
`grow.py`, which grows what is already there.

### Super-resolution — 93 stones, 70 credits

```bash
python3 upscale.py --plan / --extract / --montage / --split / --install
```

⭐ **Four stones per job.** The upscaler charges a flat 2 credits whatever the input size, so a 2×2
montage of 640px cells costs the same as one crop and lands every stone near 2000px. **~370 credits
one-at-a-time → 70.**

⛔ It does **not** generate stone. It enlarges the supplier's own photograph of a crop slabify
already judged. ⚠️ It is **not** Higgsfield Soul — Soul generates images, which would produce fake
marble under a real stone's name. The model is `bytedance_image_upscale`.

---

## 7. FILTERING (D53)

The `/stones/` collection could filter by material and tone only — the one page showing every stone
was the least narrowable. Colour, Veining and Finish now sit in a **Refine drawer** (a button, not
three permanent chip rows that would push the stone below the fold).

⭐ On both the wheel and the collection, **a chip that would return nothing is dimmed and
unclickable**, counted against every other group's choices so the alternatives beside it stay
reachable. OR inside a group, AND across groups.

---

## 8. ⛔ RULES THAT MUST NOT BE BROKEN

- **A wrong image under a right name is the worst possible outcome.** Material guard (by supplier
  *section*, never folder), supplier guard (a quartz wears its own maker's photo), porcelain
  refusal, and now the four duplicate guards. All have caught live errors.
- ⚠️ **NEVER rebuild a crop from `rec["box"]`.** Two earlier steps rebind `im` — the PIN crop and
  the slab-box crop — so `box` is not in the original file's coordinate space. Doing it put a
  **window** into Calacatta Vagli Oro, a **ceiling crane** into Travertine Romano and a **stock
  label** into Colombo Juparana. Ask slabify via `process(crop_out=…)`.
- ⛔ **A pin runs before everything and is the only thing stopping `carrara__4.jpg`** — a styled
  flat-lay **with a coffee cup and dried flowers on it** — shipping as Carrara Jumbo. It passes
  every automatic gate at score .620.
- ⛔ **The scene gate is a filter, not a guarantee.** Everything in §4 passed it. **A contact sheet
  at 330px minimum, looked at by a person, is the only check that catches these.** 215px is too
  small — that is exactly how eight faults reached the client.
- **Only nile / nile-inv / next may become a published tile** (`PUBLISHABLE`). marble.com stays
  refused (D45).
- **Natural stone photography is INDICATIVE and the copy says so.** Every marble and granite page
  carries "You approve photographs of your actual slab before a single cut" (D44).
- **Porcelain never goes on the stone wheel. Suppliers are never named publicly.**
- ⚠️ `stones/harvest/raw/` is 1.0GB and must not be deployed.

---

## 9. OPEN — DO THESE NEXT

1. ⛔ **Two tiles still carry a supplier-photo fault**, both needing a tighter crop or a better
   frame:
   · **Calacatta Viola** — a thin green lifting strap down the left edge.
   · **Verde Alpi** — a dark polished slab in a lit warehouse; the room reflects in the face and
     there is a light band at the left.
2. ⭐ **63 of the 115 stones carry GENERATED copy** (`review=True` in `catalogue_expanded.py`). It
   describes each slab accurately but has not been through the client's voice. **The single
   biggest thing to read before go-live.**
3. **Three supplier photographs carry defects that are in the ORIGINAL**, not introduced:
   Arabescato Classico (two small blown reflections), Aqua Gucci and Verde Alpi (yard marks).
   Better frames from the supplier would fix them.
4. **Calacatta Gold Oro's only frame is HONED** and the catalogue sells it polished. The pattern
   is the stone's; the gloss is not.
5. **The popularity ranking is editorial, not TopCat's sales data** (`POPULAR` in index.html).
   ⚠️ It orders the top 11 per material and should be revisited now the range is 115.
6. **Ask Caesarstone, CRL and Cosentino for fabricator asset packs** — the only route to a wider
   granite and marble range.
7. ⭐ **The enquiry form still has no backend.** Unchanged, and still the single biggest thing
   between this site and the leads the engagement is judged on.

---

## 10. BUDGET

70 credits of the client's 100-credit ceiling were used, all on `bytedance_image_upscale`.
**463 credits remain.** ⚠️ The account's free "unlim" allowance shows `available: false` and does
not cover the upscaler in any case — it is a generation-model allowance.

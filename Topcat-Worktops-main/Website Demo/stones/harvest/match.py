# -*- coding: utf-8 -*-
"""Decide which harvested tile belongs to which stone in the client's catalogue.

    python3 match.py            # write ../../assets/slabs/manifest.json
    python3 match.py --check    # print the decisions and stop

This is kept apart from slabify.py on purpose. Cropping is a picture problem; this is a
NAMING problem, and naming in the stone trade is a minefield — the same quarry name is reused
by different suppliers for different products, and two stones can differ by one letter and be
nothing alike. Getting it wrong here is worse than having no photo at all, because the site
would confidently show a customer the wrong stone.

So: exact match first, a deliberately high fuzzy cutoff second, an explicit ALIAS table for the
pairs we have actually eyeballed, and a DENY list for the near-misses that fuzzy matching gets
wrong. Anything left over stays on the drawn slab, which is always safe.
"""
import json, os, re, sys, difflib, glob

HERE = os.path.dirname(os.path.abspath(__file__))
TILES = os.path.abspath(os.path.join(HERE, "..", "..", "assets", "slabs"))
sys.path.insert(0, os.path.dirname(HERE))
from catalogue_active import S                                    # noqa: E402

# ⛔ FALSE FRIENDS. Fuzzy matching pairs these up and they are completely different stones.
# Each line is (catalogue stone, harvested tile) that must never be joined.
DENY = {
    ("nero-marquina", "nero-marinace"),      # Spanish black w/ white veins vs a conglomerate
    ("carrara", "carrara-mist"),             # different products in the same family
    ("calacatta-oro-quartz", "calacatta-oro-satin"),   # satin is a separate finish/SKU
    # ⛔ Added 9 Aug 2026, each after looking at the two pictures side by side.
    ("fusion-black", "fusion-blue"),         # the Fusion Blue tile is brown, cream and blue
    ("calacatta-vagli-oro", "calacatta-oro"),  # Vagli Oro is its own quarry name, not a synonym
    # Absolute Black Extra is sold POLISHED. The only Absolute Black tiles harvested are honed
    # and leathered, and both read matt grey rather than glossy black — a difference a customer
    # would spot the moment they saw the slab. It keeps the drawn slab until a polished shot
    # turns up. (The core-matcher would not join these anyway; this records the decision.)
    ("absolute-black-extra", "absolute-black-honed"),
    ("absolute-black-extra", "absolute-black-leather"),
    ("carrara-honed", "carrara"),            # natural marble must never take the quartz tile
}

# ⭐ WHICH KIND OF STONE EACH SOURCE FOLDER PHOTOGRAPHS. This exists to catch, automatically, the
# one mistake that matters most: a natural stone showing an engineered quartz, or the reverse.
# It is not hypothetical — the catalogue's marble "Carrara" silently took Nile's QUARTZ Carrara
# tile on an exact name match, and nothing in the pipeline objected. Names collide across the
# two halves of the trade all the time (there is a "Crema Evora" quartz AND a "Crema Evora"
# marble), so the check is on the SOURCE, which cannot be talked round by a name.
# ⚠️ IT HAS TO BE THE SUPPLIER'S SECTION, NOT THE FOLDER. The first version of this check read
# the source folder and assumed nile-inv was all natural stone. It is not — the stock system
# carries a quartz category too, so the check blocked eight perfectly good quartz matches. What
# actually knows is the section the supplier files a product under, which harvest.py records in
# catalogue.json.
SECTION_KIND = {
    "quartz": "Quartz", "quartz-surfaces": "Quartz", "380-2": "Quartz", "289-2": "Quartz",
    "granite": "Natural", "marble": "Natural", "quartzite": "Natural",
    "exotic": "Natural", "exotic-stone": "Natural", "275-2": "Natural",
    # ⛔ Marazzi is PORCELAIN. Standing client rule: porcelain never appears on the stone wheel,
    # it is bespoke and enquiry-led only. Anything from this section is refused outright.
    "top-marazzi": "Porcelain",
}


def kind_of(mat):
    return "Quartz" if mat == "Quartz" else "Natural"

# ✅ Confirmed by eye against the source photograph. Catalogue slug -> harvested tile slug.
ALIAS = {
    # ⭐ SPELLING, NOT IDENTITY (10 Aug). Three stones in the 96-stone range fell through to the
    # drawn slab purely because the supplier's filename does not spell the product the way the
    # catalogue does. Each was checked against its SECTION before being written here, so the
    # material guard below still has to agree — these only close a spelling gap, they never
    # assert that two different products are the same thing.
    #   · the supplier's own file is misspelt: "eclpyse" for Eclypse
    #   · Nile suffix their Blue Pearl file "-gt"; the section is granite, the catalogue Granite
    #   · "macaubus" for Macaubas. ⚠️ NOT to be confused with `white-macaubas`, which is a
    #     DIFFERENT stone also in the range — hence the exact pairing rather than fuzzy matching.
    "white-eclypse": "white-eclpyse",
    "blue-pearl": "blue-pearl-gt",
    "macaubas-fantasy": "macaubus-fantasy",
    # ⛔ TWO DIFFERENT STONES, ONE WORD APART — the exact collision the guards exist for.
    # The catalogue now carries BOTH a natural MARBLE "Carrara" (nile-inv, section marble, file
    # carrara-polished) and the engineered QUARTZ "Carrara Jumbo" (nile, section quartz, file
    # carrara — jumbo is the slab format, not a different stone). Without this the marble fell
    # through to no tile at all, and the danger in "fixing" it loosely is that it takes the
    # quartz's tile instead and a customer choosing natural marble is shown a quartz. That is
    # precisely what the material guard caught on Calacatta Gold Oro. Pair them EXACTLY.
    "carrara": "carrara-polished",
    # ⛔ "calacatta-gold-oro": "calacatta-gold" WAS HERE, CARRIED AS "confirmed by eye", AND WAS
    # WRONG — it had been live on the site. The catalogue's Calacatta Gold Oro is a natural
    # MARBLE from the stock system; `calacatta-gold` is Next Stone Slabs' ENGINEERED QUARTZ of
    # almost the same name. Two different products, one letter apart in the eye, and a customer
    # picking marble was being shown a quartz. The section guard below is what found it, which
    # is why that guard exists. Removed: the core-matcher then finds calacatta-gold-oro-honed,
    # the actual stone. ⚠️ That frame is HONED and the catalogue sells it polished — the pattern
    # is the stone's, the gloss is not, and it is the only usable frame of it.
    "bianco-eclypsia-calacatta": "bianco-eclypse-polished-calacatta",
    "belvedere-leather": "belvedere-leather",
    "fusion-blue-leather": "fusion-blue",
    "blue-dunes-leather": "blue-dunes",
    # ⛔ "carrara-honed": "carrara" WAS HERE AND HAD TO GO. The catalogue's Carrara is a natural
    # MARBLE and takes the nile-inv `carrara-honed` tile on an exact match. The `carrara` tile is
    # now Nile's engineered QUARTZ Carrara, harvested for Carrara Jumbo below — while that tile
    # did not exist the alias was harmless, and the moment it did it would have quietly handed
    # the marble a photograph of a quartz.
    "carrara-jumbo": "carrara",              # jumbo is the slab format; same Nile quartz pattern
    # ⛔ AND THE MARBLE MUST BE PINNED TOO, or it takes the quartz tile. The catalogue stone is
    # called plainly "Carrara", so norm() gives "carrara" and the EXACT-match branch hands it the
    # `carrara` tile — which is now Nile's engineered quartz. Removing the old alias was not
    # enough; the collision is on the stone's own name. This says which Carrara is which.
    "carrara-honed": "carrara-honed",
    "calacatta-oro-quartz": "calacatta-oro",
    # ⭐ Added 9 Aug 2026. Every one of these was put next to the catalogue name on a contact
    # sheet and looked at before it was written down — the tile stem differs only by the
    # supplier's own filing habit, not by the stone.
    # ⛔ "carrara-shimmer": "carrara-shimmer-2-of-4" REMOVED — that is NEXT'S Carrara Shimmer
    # and Topcat buy theirs from Nile. Two makers, one marketing name, two different products;
    # the Next frame is a beige banded stone, nothing like "the fine grey grain of Carrara".
    "sabbia-beige": "ns-sabbia-beige",                        # "ns-" is Next Stone's file prefix
    # ⛔ WAS "misterio-gold": "misterio-gold-2" — REMOVED 10 Aug. Both files are the SAME
    # photograph (the duplicate guard in slabify now rejects the -2), so the alias pointed at a
    # tile that no longer exists and Misterio Gold fell through to nothing. It matches its own
    # name correctly without help.
    "verde-guatemala": "verde-gautemala",                     # the supplier's own spelling slip
    "travertine-romano-classico": "travertine-romano-classico-h-f",   # honed and filled, as sold
    "patagonia": "patagonia-extra",                           # "Extra" is the grade, same stone
    # Nile list this one under the short name. The tile is warm greys and golds in wide bands
    # across a pale ground, which is the catalogue's own description of Venaria Reale.
    "venaria-reale": "venaria",
}

TILE_SOURCE, TILE_SUPPLIER = {}, {}

# the folder a photograph came from -> the supplier the catalogue names
SOURCE_SUPPLIER = {"nile": "Nile Stone", "nile-inv": "Nile Stone", "next": "Next Stone Slabs"}
CUTOFF = 0.94        # high on purpose; see the module docstring


def norm(x):
    x = x.lower().replace("–", " ").replace("’", "")
    return re.sub(r"\s+", " ", re.sub(r"[^a-z0-9]+", " ", x)).strip()


# Words the stock system appends that describe the SLAB, not the stone: finish, thickness,
# grade, and its own stock shorthand. "ARABESCATO VAGLI ORO HONED" and the catalogue's
# "Arabescato Vagli Oro" are the same stone, so these are stripped before comparing —
# but kept, separately, to break ties when the catalogue names a finish.
FINISH_WORDS = {"honed", "polished", "leather", "leathered", "brushed", "satin", "matt",
                "flamed", "filled", "and"}
NOISE_WORDS = {"ng", "mm", "cm", "2cm", "3cm", "20mm", "30mm", "premium", "select", "first",
               "choice", "new"}


def core(name):
    """The stone's name with slab-describing words taken off the end."""
    words = [w for w in norm(name).split() if w not in NOISE_WORDS]
    while words and words[-1] in FINISH_WORDS:
        words.pop()
    return " ".join(words)


def main():
    have = {os.path.basename(p)[:-5] for p in glob.glob(os.path.join(TILES, "*.webp"))
            if not p.endswith("-s.webp")}

    # ⛔ ONLY TILES THE CURRENT PIPELINE ACCEPTED. What is on disk is not the same question as
    # what slabify approves: a .webp left behind by an EARLIER run survives, and match.py used to
    # happily pair a catalogue stone to it. That is how three stones the pipeline had started
    # refusing were still live on 10 Aug (Fresh Cement, Bianco Eclypsia, Sabbia Beige), and how
    # Dolce Vita Leather and Mystic Grey Leather came back as duplicates minutes after the
    # duplicate guard had rejected them — the guard rejected the tile, the stale file shipped it
    # anyway. Trusting the report closes both.
    # ⚠️ If the report is missing, fall back to the disk rather than matching nothing — but say so,
    # because it means the range is being built on unverified files.
    rp = os.path.join(HERE, "slabify-report.json")
    if os.path.exists(rp):
        ok = {r["slug"] for r in json.load(open(rp)) if r.get("ok")}
        # ⭐ ...PLUS the tiles upscale.py legitimately rescued. Those stones are `rescuable` in the
        # report, not `ok` — slabify refused them for RESOLUTION on a crop it otherwise liked, and
        # super-resolution is exactly the answer to that. They are real, reviewed, installed tiles;
        # `upscaled.json` is the record of which. Without this the rescue work is thrown away on
        # the next match and 12 stones fall back to nothing.
        up = os.path.join(HERE, "upscaled.json")
        if os.path.exists(up):
            ok |= {d["tile"] for d in json.load(open(up)) if d.get("tile")}
        stale = have - ok
        have &= ok
        if stale:
            print(f"    ignoring {len(stale)} stale tile(s) the current run did not accept: "
                  + ", ".join(sorted(stale)[:6]) + (" ..." if len(stale) > 6 else ""))
    else:
        print("    ⚠️ no slabify-report.json — matching against whatever is on disk, unverified")
    # tile -> Quartz | Natural | Porcelain, from the section the supplier files it under
    global TILE_SOURCE, TILE_SUPPLIER
    TILE_SOURCE, TILE_SUPPLIER = {}, {}
    try:
        for r in json.load(open(os.path.join(HERE, "slabify-report.json"))):
            if r.get("ok") and r.get("src"):
                TILE_SUPPLIER[r["slug"]] = SOURCE_SUPPLIER.get(r["src"].split("/")[1])
    except Exception:
        pass
    try:
        for r in json.load(open(os.path.join(HERE, "catalogue.json"))):
            k = SECTION_KIND.get((r.get("section") or "").lower())
            if k:
                TILE_SOURCE.setdefault(r["slug"], k)
    except Exception:
        pass
    by_norm, by_core = {}, {}
    for t in have:
        by_norm.setdefault(norm(t), t)
        by_core.setdefault(core(t), []).append(t)

    manifest, report = {}, []
    claimed = {}      # tile -> the stone that took it; see the one-tile-one-stone block below
    for st in S:
        slug, name = st["slug"], st["name"]
        tile, how = None, ""
        want_finish = norm(st.get("finish") or "").split()
        want_finish = want_finish[0] if want_finish else ""

        if slug in ALIAS and ALIAS[slug] in have:
            tile, how = ALIAS[slug], "alias"
        elif norm(name) in by_norm:
            tile, how = by_norm[norm(name)], "exact"
        elif core(name) in by_core:
            # ⭐ Same stone, different slab wording. Where the stock system offers the stone in
            # several finishes, take the one the CATALOGUE says Topcat sell — showing a honed
            # slab for a stone sold polished is a small lie that a customer would spot in person.
            cands = sorted(by_core[core(name)])
            pick = next((c for c in cands if want_finish and want_finish in norm(c)), None)
            tile = pick or cands[0]
            how = f"core match{' + ' + want_finish if pick else ''}"
        else:
            near = difflib.get_close_matches(core(name), list(by_core), n=1, cutoff=CUTOFF)
            if near:
                cands = sorted(by_core[near[0]])
                pick = next((c for c in cands if want_finish and want_finish in norm(c)), None)
                tile = pick or cands[0]
                how = f"fuzzy {difflib.SequenceMatcher(None, core(name), near[0]).ratio():.2f}"

        if tile and (slug, tile) in DENY:
            report.append((slug, None, f"BLOCKED, would have matched {tile}"))
            continue
        # ⛔ engineered quartz may only wear a quartz photograph, and natural stone a natural one
        if tile and tile in TILE_SOURCE:
            want, got = kind_of(st["mat"]), TILE_SOURCE[tile]
            if got and want != got:
                report.append((slug, None,
                               f"BLOCKED, {want} stone would have taken a {got} photograph "
                               f"({tile})"))
                continue
        # ⛔ ...and an ENGINEERED QUARTZ may only wear ITS OWN MAKER'S photograph. The name of a
        # quartz belongs to the brand, so Nile's "Carrara Shimmer" and Next's "Carrara Shimmer"
        # are two different products that happen to share a marketing name. Natural stone is
        # exempt: there the name is the quarry's, and any supplier's Nero Marquina is Nero
        # Marquina. This is the same reasoning that keeps marble.com out of the quartz range.
        if tile and st["mat"] == "Quartz" and tile in TILE_SUPPLIER:
            got = TILE_SUPPLIER[tile]
            if got and got != st["sup"]:
                report.append((slug, None,
                               f"BLOCKED, {st['sup']} product would have taken a {got} "
                               f"photograph ({tile})"))
                continue
        # ⛔ ONE TILE, ONE STONE. Without this two catalogue names can be handed the SAME .webp and
        # the site shows a customer two identical pictures under two product names — the client
        # spotted exactly that on Dolce Vita / Dolce Vita Leather ("those are the exact fucking
        # same, the same exact image just under a different name"). It happens because core()
        # strips finish words, so "Dolce Vita Leather" and "Dolce Vita" reduce to one key and both
        # match the one photograph the supplier published.
        # ⚠️ The FIRST claimant keeps it, and the catalogue is ordered with the base stone before
        # its finish variants, so the plain product wins and the variant is the one refused. A
        # variant that loses here has no photograph of its own and must be dropped from the range
        # rather than shipped as a twin — see grow.py.
        if tile and tile in claimed:
            report.append((slug, None,
                           f"BLOCKED, {claimed[tile]} already ships this exact photograph ({tile})"))
            continue
        if tile:
            manifest[slug] = tile
            claimed[tile] = slug
        report.append((slug, tile, how or "no tile"))

    if "--check" in sys.argv:
        for slug, tile, how in report:
            mark = "✓" if tile else " "
            print(f" {mark} {slug:34.34} {(tile or '—'):34.34} {how}")
        print(f"\n{len(manifest)}/{len(S)} catalogue stones have a real slab tile")
        return

    os.makedirs(TILES, exist_ok=True)
    with open(os.path.join(TILES, "manifest.json"), "w") as f:
        json.dump(manifest, f, indent=1, sort_keys=True)

    # ⚠️ slabify writes a tile for EVERY image it can crop, which is far more than the catalogue
    # uses — 161 tiles for 47 stones, because the suppliers stock plenty Topcat do not list. The
    # extras are wanted on disk (the expanded range will match against them) but they are 19MB
    # of files no page ever requests, sitting inside assets/ where a deploy would sweep them up.
    # --prune leaves only what the manifest actually points at. Re-run slabify to get them back.
    if "--prune" in sys.argv:
        keep = {t for t in manifest.values()}
        gone = 0
        for p in glob.glob(os.path.join(TILES, "*.webp")):
            stem = os.path.basename(p)[:-5]
            if stem.removesuffix("-s") not in keep:
                os.remove(p)
                gone += 1
        print(f"    pruned {gone} unused tile files")

    # ...and write it straight into the page between the markers, so there is no second copy
    # to fall out of step and no fetch() for a file the site would otherwise have to load.
    inject(manifest)
    print(f"{len(manifest)}/{len(S)} catalogue stones matched -> manifest.json + index.html")


def inject(manifest):
    page = os.path.abspath(os.path.join(HERE, "..", "..", "index.html"))
    src = open(page, encoding="utf-8").read()
    start, end = "/*BEGIN-SLAB-TILES*/", "/*END-SLAB-TILES*/"
    i, j = src.find(start), src.find(end)
    if i < 0 or j < 0:
        raise SystemExit("markers missing in index.html — has SLAB_TILES been removed?")
    body = "{" + ",".join(f'"{k}":"{v}"' for k, v in sorted(manifest.items())) + "}"
    out = src[:i + len(start)] + body + src[j:]
    # cheap ordering assertion: the map has to sit before the first thing that reads it
    if out.index("const SLAB_TILES=") > out.index("function stoneMarkup"):
        raise SystemExit("SLAB_TILES must be declared before stoneMarkup uses it")
    open(page, "w", encoding="utf-8").write(out)
    print(f"    injected {len(manifest)} tiles into index.html "
          f"({len(out) - len(src):+d} bytes)")


if __name__ == "__main__":
    main()

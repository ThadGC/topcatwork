# -*- coding: utf-8 -*-
"""Inject the active catalogue into the wheel's MATERIALS array in ../index.html.

    cd stones && python3 apply_catalogue.py

The wheel needs the range as JS, and it used to be 60 lines of hand-typed object literals kept
identical to STONE_LIST by remembering to. This writes them from `catalogue_active.S`, so there
is exactly one list and the wheel cannot disagree with the stone pages about what a name means.

⚠️ The wheel entry is a SUBSET of the catalogue entry on purpose. It carries only what the fan
and the refine chips read — name, slug, mat, sup, stone (the drawn-slab preset), seed, tone, hue,
vein, finish. Size, thickness and the blurb belong to the stone PAGE and would be dead weight in
a 96-entry array parsed on every landing-page load.

⚠️ `stone:` here is `preset` in the catalogue. Same value, different key, because the wheel's
renderer has called it `stone` since long before the catalogue existed and renaming it would
touch the slab generator.
"""
import json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from catalogue_active import S  # noqa: E402
# ⭐ ONE definition of "what rock is this", imported rather than re-implemented. The wheel used
# to answer it from a hand-typed `QUARTZITE` Set in index.html which had gone stale at 10 slugs
# against a real 26, so two thirds of the quartzites were unfindable by anyone searching the
# word. Anything derived from the catalogue has to be GENERATED from it (D51).
from build_stones import shown_mat  # noqa: E402

INDEX = os.path.abspath(os.path.join(HERE, "..", "index.html"))
MATS = ["Marble", "Quartz", "Granite"]
KEEP = ("name", "slug", "mat", "sup", "seed", "tone", "hue", "vein", "finish")


def entry(s):
    d = {k: s[k] for k in KEEP if s.get(k) is not None}
    d["stone"] = s["preset"]
    # ⚠️ `mat` is the browse-and-pricing KEY, `kind` is what the customer is told the stone is,
    # and on 27 of the 115 they differ. The wheel's readout, its search and the estimator's
    # chip all show `kind`; every filter, price and deep link still matches on `mat`.
    d["kind"] = shown_mat(s)
    order = ("name", "slug", "mat", "kind", "sup", "stone", "seed",
             "tone", "hue", "vein", "finish")
    return "{" + ",".join(f'{k}:{json.dumps(d[k], ensure_ascii=False)}'
                          for k in order if k in d) + "}"


def build():
    out = ["const MATERIALS={"]
    for m in MATS:
        rows = [s for s in S if s["mat"] == m]
        out.append(f"  {m}:[")
        out += [f"    {entry(s)}," for s in rows]
        out.append("  ],")
    out.append("};")
    return "\n".join(out), {m: sum(1 for s in S if s["mat"] == m) for m in MATS}


def check_presets(src):
    """⛔ EVERY `stone` VALUE MUST BE A PRESET THE JS ENGINE ACTUALLY KNOWS.

    This exists because an invented preset name ("noir") was injected on 10 Aug and took the
    WHOLE SITE DOWN. `marble()` does `const p=STONES[preset]` and then reads `p.grey`, so an
    unknown name is `undefined.grey` — a TypeError thrown at the top of the script, before the
    reveal observer is wired. Every `.rise` element stays at opacity 0, so the hero, the copy
    and the reviews are all simply *not there*.

    ⚠️ IT PARSES PERFECTLY. `node --check` passes, the build passes, and the page returns 200.
    The only symptom is a blank-looking site, which is exactly the class of defect this project
    keeps getting bitten by: it renders, so it looks fine to every check that is not this one.
    """
    names = re.findall(r"^\s*([A-Za-z]\w*):\{", re.search(
        r"const STONES=\{(.*?)\n\};", src, re.S).group(1), re.M)
    known = set(names)
    # ⚠️ The catalogue calls it `preset`; only the injected wheel entry renames it to `stone`
    # (see the note at the top of this file). Checking `stone` here would silently pass every
    # row, which is how this guard was written wrong the first time.
    bad = sorted({s["preset"] for s in S if s.get("preset") and s["preset"] not in known})
    if bad:
        raise SystemExit(
            f"⛔ {len(bad)} unknown slab preset(s): {bad}\n"
            f"   the JS engine only knows: {sorted(known)}\n"
            f"   an unknown preset throws inside marble() and blanks the entire page.")
    return len(known)


MANIFEST = os.path.abspath(os.path.join(HERE, "..", "assets", "slabs", "manifest.json"))


def inject_slab_tiles(src):
    """⭐ SLAB_TILES IS DERIVED FROM THE MANIFEST, NEVER HAND-KEPT.

    ⛔ This is the fourth time this project has been bitten by a SECOND place that has to be
    kept in sync by hand (D51, D59, D68, and this). `SLAB_TILES` is the slug -> tile map the
    WHEEL reads, and it was written only by `harvest/match.py`. Fourteen stones were added to
    `manifest.json` — which the stone PAGES read — without match.py being re-run, so the pages
    showed the photograph and the wheel quietly fell back to the DRAWN SVG for the same stone.

    ⚠️ AND THE FALLBACK IS WHY IT SURVIVED. `stone_face()` drops to `marble(preset,seed)` when a
    slug is missing, so nothing 404s, nothing errors and every check passes. The customer just
    sees a cartoon of a slab under a real stone's name, which is the wrong-image-under-a-right-
    name failure the client says would sink them.

    Writing it from the manifest here means the wheel and the pages read the same map, and the
    assertion below fails the build if the catalogue ever names a stone with no tile.
    """
    tiles = json.load(open(MANIFEST))
    have = {s["slug"] for s in S}
    tiles = {k: v for k, v in sorted(tiles.items()) if k in have}
    missing = sorted(have - set(tiles))
    if missing:
        raise SystemExit(
            f"⛔ {len(missing)} stone(s) in the catalogue with no tile in the manifest: "
            f"{missing[:8]}{'...' if len(missing) > 8 else ''}\n"
            f"   the wheel would silently draw an SVG cartoon under a real stone's name.")
    blob = json.dumps(tiles, ensure_ascii=False, separators=(",", ":"))
    i = src.index("/*BEGIN-SLAB-TILES*/")
    j = src.index("/*END-SLAB-TILES*/") + len("/*END-SLAB-TILES*/")
    return (src[:i] + "/*BEGIN-SLAB-TILES*/" + blob + "/*END-SLAB-TILES*/" + src[j:],
            len(tiles))


def main():
    js, counts = build()
    src = open(INDEX, encoding="utf-8").read()
    known = check_presets(src)
    # the block runs from `const MATERIALS={` to the first line that is exactly `};`
    i = src.index("const MATERIALS={")
    j = src.index("\n};", i) + len("\n};")
    src = src[:i] + js + src[j:]
    src, n_tiles = inject_slab_tiles(src)
    open(INDEX, "w", encoding="utf-8").write(src)
    total = sum(counts.values())
    print(f"injected MATERIALS: {counts}  total {total}")
    print(f"injected SLAB_TILES: {n_tiles} tiles, every catalogue stone covered ✓")
    dupes = [s["slug"] for s in S]
    assert len(dupes) == len(set(dupes)), "duplicate slug in the active catalogue"
    print("slugs unique ✓")


if __name__ == "__main__":
    main()

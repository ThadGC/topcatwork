# -*- coding: utf-8 -*-
"""Grow the ACTIVE catalogue toward 50 a category from tiles already accepted on disk.

    python3 grow.py --check     # what would be added, and where each material lands
    python3 grow.py             # rewrite ../catalogue_expanded.py with the additions folded in

⭐ WHY THIS EXISTS RATHER THAN JUST RE-RUNNING expand.py. `expand.py` rebuilds the range from the
ORIGINAL 52 every time. That was right when the 52 were the only thing anyone trusted, but the
active range is now 96 and re-running it produces 78 — it would silently DELETE 18 stones that
are already live, photographed and page-built. This grows what is there instead: every stone
currently in the catalogue is carried through untouched, and additions come only from tiles
slabify has already accepted.

⚠️ TARGETS ARE NOT ALL 50. Quartz and Marble reach it. Granite does not and cannot: Nile and
Next between them list 27 granite names, so 27 is the ceiling on what Topcat can actually sell.
The shortfall is REPORTED, never filled — a range is a promise you can supply it, and a stone
listed that Topcat cannot get turns a lead into an apology. Widening granite needs another
supplier account or the Caesarstone/CRL/Cosentino fabricator packs, not a bigger number here.

⛔ EVERY ADDITION IS THE CLIENT'S OWN SUPPLIERS' STOCK, photographed by them. Nothing is taken
off a competitor's site to pad a count — see LICENSING.md and D45.
"""
import json, os, re, sys, importlib.util

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.dirname(HERE))
sys.path.insert(0, HERE)

TARGETS = {"Quartz": 50, "Marble": 50, "Granite": 50}   # granite will report short; see above


def _expand():
    """Borrow expand.py's naming and copy generators so added stones read the same."""
    spec = importlib.util.spec_from_file_location("expand", os.path.join(HERE, "expand.py"))
    m = importlib.util.module_from_spec(spec)
    saved, sys.argv = sys.argv, ["expand.py", "--check"]
    try:
        spec.loader.exec_module(m)
    except SystemExit:
        pass
    finally:
        sys.argv = saved
    return m


def main():
    ex = _expand()
    from catalogue_active import S as LIVE                      # noqa: E402
    derived = json.load(open(os.path.join(HERE, "derived.json")))
    man = json.load(open(os.path.abspath(os.path.join(
        HERE, "..", "..", "assets", "slabs", "manifest.json"))))
    used_tiles = set(man.values())
    used_slugs = {s["slug"] for s in LIVE}
    # ⚠️ KEYED ON STONE **AND FINISH**, not stone alone. Keying on the stone treats Absolute
    # Black Honed and Absolute Black Leathered as one entry — but the live range already lists
    # Antiq Brown Extra beside Antiq Brown Leather, and Belvedere beside Belvedere Leather,
    # because a polished slab and a leathered slab of the same quarry stone are two different
    # products a customer chooses between and pays differently for. Deduping them away cost 9
    # marbles and 9 granites that Topcat genuinely sell.
    # ⛔ It does still dedupe: the SAME stone in the SAME finish, listed by both suppliers, is
    # one entry. That is padding, and it would show two identical tiles side by side.
    def ident(name, finish):
        return (ex.stone_key(name), (finish or "").lower())

    def finish_of(slug_or_name):
        s = slug_or_name.lower()
        return ("Leathered" if "leather" in s else "Honed" if "honed" in s else
                "Brushed" if "brushed" in s else "Polished")

    seen_stone = {ident(s["name"], s.get("finish") or finish_of(s["slug"])) for s in LIVE}

    SEC = {"granite": "Granite", "marble": "Marble", "quartz": "Quartz",
           "quartzite": "Marble", "exotic": "Marble", "exotic-stone": "Marble",
           "quartz-surfaces": "Quartz", "380-2": "Quartz", "289-2": "Quartz"}

    have = {m: [s for s in LIVE if s["mat"] == m] for m in TARGETS}
    cands = []
    for tile, d in derived.items():
        if tile in used_tiles:
            continue
        mat = SEC.get(d.get("section"))
        if not mat or len(have[mat]) >= TARGETS[mat]:
            pass                                                 # still collect; capped below
        if not mat:
            continue
        name = ex.clean_name(d.get("title") or tile)
        if not name:
            continue
        cands.append((mat, name, tile, d))
    # biggest crop first, so the range grows sharpest-first rather than alphabetically
    px = {}
    for r in json.load(open(os.path.join(HERE, "slabify-report.json"))):
        px[r["slug"]] = r.get("src_px", 0)
    cands.sort(key=lambda c: -px.get(c[2], 0))

    seed = max([s.get("seed", 0) for s in LIVE] or [900]) + 1
    added = {m: [] for m in TARGETS}
    for mat, name, tile, d in cands:
        if len(have[mat]) + len(added[mat]) >= TARGETS[mat]:
            continue
        finish = ("Leathered" if "leather" in tile else "Honed" if "honed" in tile else
                  "Brushed" if "brushed" in tile else "Polished")
        key = ident(name, finish)
        if key in seen_stone:
            continue
        seen_stone.add(key)
        slug = ex.slugify(name)
        base, n = slug, 2
        while slug in used_slugs:
            slug = f"{base}-{n}"; n += 1
        used_slugs.add(slug)
        spec = d.get("spec") or {}
        facts = ex.QZ if (mat == "Marble" and d["section"] in ex.QUARTZITE_SECTIONS) else None
        added[mat].append(dict(
            name=name, slug=slug, mat=mat,
            sup="Nile Stone" if d["source"].startswith("nile") else "Next Stone Slabs",
            preset=d["preset"], seed=seed, tone=d["tone"], hue=d["hue"], vein=d["vein"],
            finish=finish,
            size=(spec.get("size") or "").replace("x", " x ") if spec.get("size") else "",
            thick=spec.get("thickness") or "",
            blurb=ex.blurb(name, mat, d, finish, seed), facts=facts, tile=tile,
            silica=spec.get("silica"), review=True))
        seed += 1

    print(f"{'material':9} {'live':>5} {'+new':>5} {'total':>6}   target")
    for m in ("Quartz", "Marble", "Granite"):
        tot = len(have[m]) + len(added[m])
        flag = "" if tot >= TARGETS[m] else f"   ⚠️ SHORT — supplier stock exhausted at {tot}"
        print(f"  {m:8} {len(have[m]):>5} {len(added[m]):>5} {tot:>6}   {TARGETS[m]}{flag}")
    for m in ("Quartz", "Marble", "Granite"):
        if added[m]:
            print(f"\n{m} additions ({len(added[m])}): " + ", ".join(x["name"] for x in added[m]))

    if "--check" in sys.argv:
        return

    out = []
    for m in ("Quartz", "Marble", "Granite"):
        out += have[m] + added[m]
    p = os.path.abspath(os.path.join(HERE, "..", "catalogue_expanded.py"))
    lines = ['# -*- coding: utf-8 -*-',
             '"""EXPANDED catalogue — grown by harvest/grow.py.',
             '',
             'Every stone here is stock the client\'s own two suppliers hold and have photographed.',
             'The stones that were already live are carried through UNCHANGED, blurbs included.',
             '',
             '⚠️ Entries with review=True have GENERATED copy. It describes the slab accurately but it',
             'has not been through the client\'s voice. Read it before go-live.',
             '',
             '⛔ Granite stops short of 50 and that is a SUPPLY fact, not an omission — Nile and Next',
             'list 27 granite names between them. Do not pad it.',
             '',
             'Regenerate: cd harvest && python3 derive.py && python3 grow.py',
             '"""',
             'from catalogue_source import QZ, TRAV  # noqa: F401',
             '',
             'S = [']
    for m in ("Quartz", "Marble", "Granite"):
        rows = have[m] + added[m]
        lines.append(f'    # ====================== {m.upper()} ({len(rows)})')
        for s in rows:
            bits = []
            for k in ("name", "slug", "mat", "sup", "preset", "seed", "tone", "hue", "vein",
                      "finish", "size", "thick", "tile", "silica", "review", "facts", "blurb"):
                if k not in s:
                    continue
                v = s[k]
                if k == "facts" and v is not None:
                    bits.append("facts=QZ" if v == ex.QZ else "facts=TRAV" if v == ex.TRAV
                                else f"facts={v!r}")
                else:
                    bits.append(f"{k}={v!r}")
            lines.append("    dict(" + ", ".join(bits) + "),")
    lines.append(']')
    open(p, "w", encoding="utf-8").write("\n".join(lines) + "\n")
    print(f"\nwrote {os.path.relpath(p, HERE)}  ({sum(len(have[m]) + len(added[m]) for m in TARGETS)} stones)")


if __name__ == "__main__":
    main()

# -*- coding: utf-8 -*-
"""Grow the catalogue towards 50 stones a category, from the client's own suppliers' stock.

    python3 expand.py --check     # show what the expanded range would be
    python3 expand.py             # write ../catalogue_expanded.py

Client, 9 Aug 2026: "we want around 50 stones in each category ... get the top 50 in the UK of
each, and in that 50 it should include what the client sent."

TWO RULES THIS FOLLOWS, BOTH OF THEM DELIBERATE:

1. ⛔ EVERY ADDED STONE IS SOMETHING THE CLIENT'S OWN TWO SUPPLIERS ACTUALLY STOCK. Nothing is
   copied off a competitor's website to pad a number. A range is a promise that you can supply
   it, and listing a stone Topcat cannot get is a lead that turns into an apology. Every entry
   here is backed by a real slab and, for the natural stone, a real block number.

2. ⭐ THE ORIGINAL 52 ARE CARRIED THROUGH UNTOUCHED, blurbs and all. They were written to the
   client's house voice and checked; regenerating them would be a downgrade. New stones get
   generated copy, which is honest about what the slab looks like but is NOT the same standard,
   and is flagged `review=True` so it can be read before go-live.

⚠️ GRANITE CANNOT REACH 50. Nile and Next between them list 27 granite names, and that is the
   ceiling on what Topcat can actually sell. The shortfall is reported rather than filled: the
   options are to accept a 27-stone granite range, or to open an account with another supplier.
   Quartz and marble both clear 50 comfortably.
"""
import json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.dirname(HERE))
from catalogue_source import S as ORIGINAL, QZ, TRAV          # noqa: E402

TARGET = 50
# where a supplier's section lands in the client's three public categories. Quartzite and the
# "exotic" natural stones are filed under Marble exactly as the original catalogue does, and
# carry the QZ facts override so they are never told they etch.
SECTION_MAT = {"granite": "Granite", "marble": "Marble", "quartz": "Quartz",
               "quartzite": "Marble", "exotic": "Marble",
               "quartz-surfaces": "Quartz", "exotic-stone": "Marble"}
QUARTZITE_SECTIONS = {"quartzite", "exotic", "exotic-stone"}
SKIP_SECTIONS = {"top-marazzi"}      # porcelain: enquiry-led only, never on the stone wheel


def slugify(x):
    return re.sub(r"-+", "-", re.sub(r"[^a-z0-9]+", "-", x.lower())).strip("-")


# Rubbish that rides along in supplier filenames and stock records. These are working
# references, not names a customer should ever be shown: "Taj Mahal 2 Xx", "Ns Sabbia Beige",
# "Blue Pearl Gt", "Arabescato Gold 2 Of 4".
NOISE_RE = [
    (r"\b\d+\s*of\s*\d+\b", ""), (r"\bxx?\b", ""), (r"\bns\b", ""), (r"\bgt\b", ""),
    (r"\bng\b", ""), (r"\bft\b", ""), (r"\bfs\b", ""), (r"\bedited\b", ""),
    (r"\bmin\b", ""), (r"\bmag\b", ""), (r"\bh\s*/\s*f\b", ""), (r"\b\d+\s*(cm|mm)\b", ""),
    (r"\bpolished\b", ""), (r"\(\s*\)", ""), (r"\s{2,}", " "),
    # a bare trailing number is the supplier's shot index ("Taj Mahal 2"), never part of a name
    (r"\s\d{1,2}\s*$", " "),
]
# obvious misspellings in the supplier's own records — they must not reach the website
FIX_NAME = {"eclpyse": "Eclypse", "gautemala": "Guatemala", "macaubus": "Macaubas",
            "arabesccato": "Arabescato", "marquena": "Marquina", "artic": "Arctic",
            "shimmerr": "Shimmer", "cristal": "Cristal"}
# finish words: same stone, different surface. Collapsed to one catalogue entry.
FINISH_RE = r"\b(honed|leather|leathered|brushed|satin|matt|flamed|filled)\b"


def clean_name(raw):
    n = " " + raw.lower() + " "
    for pat, rep in NOISE_RE:
        n = re.sub(pat, rep, n)
    n = re.sub(r"\s+", " ", n).strip()
    words = [FIX_NAME.get(w, w.title()) for w in n.split()]
    return re.sub(r"\s+", " ", " ".join(words)).strip(" -")


def stone_key(name):
    """Identity of the STONE, ignoring which finish this particular slab happens to be.
    Absolute Black Honed / Leather / Brushed are one stone offered three ways, and listing them
    as three is padding a range rather than widening it."""
    return re.sub(r"[^a-z0-9]", "", re.sub(FINISH_RE, "", name.lower()))


# --------------------------------------------------------------------------- copy
# Written as interchangeable clauses rather than whole sentences so the range does not read as
# fifty rewordings of one paragraph. Every clause states something MEASURED off the slab
# (colour, tone, how much veining) or known from the category. Nothing here invents a quarry, a
# country or a history, because those cannot be derived from a photograph and a wrong one would
# be repeated by a salesperson.
GROUND = {
    ("white", "light"): ["a bright white ground", "a clean white ground", "an off white ground"],
    ("cream", "light"): ["a warm cream ground", "a soft beige ground", "a warm off white ground"],
    ("grey", "light"): ["a mid grey ground", "a soft grey ground", "a pale grey ground"],
    ("blue", "light"): ["a cool blue grey ground", "a soft blue grey ground"],
    ("green", "light"): ["a muted green ground", "a soft green ground"],
    ("black", "dark"): ["a near black ground", "a deep black ground"],
    ("brown", "dark"): ["a deep brown ground", "a warm dark ground"],
    ("blue", "dark"): ["a deep blue grey ground", "a dark blue ground"],
    ("green", "dark"): ["a deep green ground"],
    ("grey", "dark"): ["a dark grey ground", "a deep charcoal ground"],
    ("cream", "dark"): ["a darker cream ground"],
    ("white", "dark"): ["a greyed white ground"],
}
MOVEMENT = {
    "statement": ["with bold veining that carries right across the slab",
                  "with strong, confident veining",
                  "with heavy movement running the length of the slab",
                  "with dramatic veining that reads from across the room"],
    "soft": ["with soft veining that keeps its distance",
             "with gentle movement through it",
             "with quiet veining that never takes over",
             "with a soft drift of pattern"],
    "calm": ["with very little movement in it",
             "close to a plain, with barely any pattern",
             "with an even, quiet surface",
             "with almost no veining at all"],
}
CLOSER = {
    "statement": ["It wants a run where you can see it whole, so an island suits it best.",
                  "One long piece shows it at its best, rather than several short ones.",
                  "Bold enough to carry a kitchen on its own without much else competing.",
                  "Best placed where the whole pattern can be read at once."],
    "soft": ["It runs through a whole kitchen without asking for attention.",
             "Easy to live with, and it works against most unit colours.",
             "A safe choice when the cabinetry is doing the talking.",
             "It has interest up close and stays quiet from a distance."],
    "calm": ["Chosen when the worktop is meant to sit back and let the kitchen speak.",
             "It hides everyday marks better than a busier stone will.",
             "The plainest surfaces are the easiest to live with, and this is one of them.",
             "A quiet surface that lets a strong kitchen carry the room."],
}
MAT_NOTE = {
    "Quartz": ["Engineered quartz, so the slab you see is the slab you get.",
               "Engineered quartz: consistent slab to slab, and no sealing to keep up with.",
               "An engineered quartz, hard wearing and non porous."],
    "Granite": ["A granite, so it takes daily kitchen use without complaint.",
                "Granite, which is about as hard wearing as a worktop gets.",
                "A hard granite, sealed on fitting and easy to keep."],
    "Marble": ["A natural marble, and every slab is its own.",
               "Natural marble, so no two slabs are alike.",
               "A natural stone, which means the slab you approve is unique to you."],
}
FINISH_NOTE = {
    "Honed": "Finished honed, so it reads matt and soft rather than glassy.",
    "Leathered": "Finished leathered, so there is a texture you can feel, and it hides marks a polish cannot.",
    "Brushed": "Brushed rather than polished, giving a low sheen and a little texture.",
}


def pick(options, n):
    return options[n % len(options)]


def blurb(name, mat, d, finish, i):
    ground = pick(GROUND.get((d["hue"], d["tone"])) or ["a natural ground"], i)
    move = pick(MOVEMENT[d["vein"]], i + 1)
    close = pick(CLOSER[d["vein"]], i + 2)
    lead = f"{ground.capitalize()} {move}."
    parts = [lead]
    fin = FINISH_NOTE.get(finish)
    parts.append(fin if fin else pick(MAT_NOTE[mat], i))
    parts.append(close)
    return " ".join(parts)


# --------------------------------------------------------------------------- build
def main():
    derived = json.load(open(os.path.join(HERE, "derived.json")))
    manifest_path = os.path.abspath(os.path.join(HERE, "..", "..", "assets", "slabs",
                                                 "manifest.json"))
    existing_tiles = json.load(open(manifest_path)) if os.path.exists(manifest_path) else {}

    kept = {s["slug"] for s in ORIGINAL}
    kept_names = {stone_key(s["name"]) for s in ORIGINAL}
    seen_keys = set()
    used_tiles = set(existing_tiles.values())

    # candidates = every measured tile that is not already spoken for by an original stone
    cands = []
    for slug, d in derived.items():
        if d["section"] in SKIP_SECTIONS or slug in used_tiles:
            continue
        mat = SECTION_MAT.get(d["section"])
        if not mat:
            mat = {"Granite": "Granite", "Marble": "Marble", "Quartz": "Quartz"}.get(
                (d.get("spec") or {}).get("kind"), None)
        if not mat:
            continue
        name = clean_name(d["title"])
        if not name or len(name) < 3:
            continue
        # one entry per STONE, not per finish, and never a second copy of an original
        key = stone_key(name)
        if key in kept_names or key in seen_keys:
            continue
        seen_keys.add(key)
        cands.append((mat, name, slug, d))

    # order: the more usable the picture and the more distinctive the stone, the earlier it goes
    cands.sort(key=lambda c: (-c[3]["edge"], c[1]))

    out = {m: [] for m in ("Quartz", "Marble", "Granite")}
    for s in ORIGINAL:
        out[s["mat"]].append(dict(s, tile=existing_tiles.get(s["slug"]), added=False))

    seed = 900
    for mat, name, slug, d in cands:
        if len(out[mat]) >= TARGET:
            continue
        spec = d.get("spec") or {}
        finish = ("Leathered" if "leather" in slug else
                  "Honed" if "honed" in slug else
                  "Brushed" if "brushed" in slug else "Polished")
        seed += 1
        base = slugify(name)
        st = slugify(name)
        n = 2
        while st in kept:
            st = f"{base}-{n}"
            n += 1
        kept.add(st)
        facts = QZ if (mat == "Marble" and d["section"] in QUARTZITE_SECTIONS) else None
        out[mat].append(dict(
            name=name, slug=st, mat=mat, sup="Nile Stone" if d["source"].startswith("nile")
            else "Next Stone Slabs",
            preset=d["preset"], seed=seed, tone=d["tone"], hue=d["hue"], vein=d["vein"],
            finish=finish,
            size=(spec.get("size") or "").replace("x", " x ") if spec.get("size") else "",
            thick=spec.get("thickness") or "",
            blurb=blurb(name, mat, d, finish, seed), facts=facts, tile=slug,
            # ⚠️ only ever the manufacturer's own declaration, never inferred. None means
            # "no claim", which the filter treats as "not eligible", not "probably fine".
            silica=spec.get("silica"),
            added=True, review=True))

    if "--check" in sys.argv:
        for m in ("Quartz", "Marble", "Granite"):
            got = len(out[m])
            new = sum(1 for x in out[m] if x["added"])
            tiles = sum(1 for x in out[m] if x.get("tile"))
            flag = "" if got >= TARGET else f"   ⚠️ SHORT OF {TARGET} — supplier stock exhausted"
            print(f"{m:9} {got:3} stones ({new} new, {got-new} original)   "
                  f"{tiles} with a real photo{flag}")
        print()
        for m in ("Quartz", "Marble", "Granite"):
            adds = [x['name'] for x in out[m] if x['added']]
            print(f"{m} additions ({len(adds)}): " + ", ".join(adds[:12]) +
                  (" ..." if len(adds) > 12 else ""))
        ex = next((x for m in out for x in out[m] if x["added"]), None)
        if ex:
            print(f"\nexample generated blurb — {ex['name']}:\n  {ex['blurb']}")
        return

    write(out)


def write(out):
    lines = ['# -*- coding: utf-8 -*-',
             '"""EXPANDED catalogue, generated by harvest/expand.py on 9 Aug 2026.',
             '',
             'The client asked for about 50 stones a category. Everything added here is stock the',
             "client's own two suppliers actually hold, so the range stays a promise Topcat can",
             'keep. The original 52 are carried through UNCHANGED, blurbs included.',
             '',
             '⚠️ Entries with review=True have GENERATED copy. It describes the slab accurately but',
             'it has not been through the client\'s voice. Read it before go-live.',
             '',
             'Regenerate: cd harvest && python3 derive.py && python3 expand.py',
             '"""',
             'from catalogue_source import QZ, TRAV  # noqa: F401', '', 'S = [']
    for m in ("Quartz", "Marble", "Granite"):
        lines.append(f'    # {"=" * 22} {m.upper()} ({len(out[m])})')
        for s in out[m]:
            f = s.get("facts")
            fx = "QZ" if f is QZ else ("TRAV" if f is TRAV else "None")
            lines.append("    dict(" + ", ".join([
                f"name={s['name']!r}", f"slug={s['slug']!r}", f"mat={s['mat']!r}",
                f"sup={s['sup']!r}", f"preset={s['preset']!r}", f"seed={s['seed']!r}",
                f"tone={s['tone']!r}", f"hue={s['hue']!r}", f"vein={s['vein']!r}",
                f"finish={s['finish']!r}", f"size={s.get('size') or ''!r}",
                f"thick={s.get('thick') or ''!r}", f"tile={s.get('tile')!r}",
                f"review={bool(s.get('review'))!r}", f"facts={fx}",
                f"blurb={s['blurb']!r}"]) + "),")
    lines.append("]")
    p = os.path.abspath(os.path.join(HERE, "..", "catalogue_expanded.py"))
    open(p, "w", encoding="utf-8").write("\n".join(lines) + "\n")
    tot = sum(len(v) for v in out.values())
    print(f"wrote {tot} stones -> {p}")


if __name__ == "__main__":
    main()

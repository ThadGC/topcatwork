# -*- coding: utf-8 -*-
"""Refuse to ship a range that shows a customer the wrong stone. Run before every deploy.

    cd stones/harvest && python3 verify.py

⭐ WHY. The client's rule is that a wrong image under a right name would sink the company: "if
they were to Google this, it would look exactly the same ... it would be detrimental if someone
chooses the stone and it's actually the wrong stone." Everything here is a check that failed in
real life on 10 Aug and was found by the CLIENT, not by the pipeline.

FOUR DISTINCT FAILURES, AND THEY DO NOT CATCH EACH OTHER:

  1 SAME IMAGE, TWO NAMES      Almond Beige and Calacatta Gold Soft shipped a pixel-identical
                               tile. Caught by a perceptual hash of the finished tile.
  2 SAME TILE FILE, TWO STONES Dolce Vita and Dolce Vita Leather both pointed at dolce-vita.webp,
                               because core() strips finish words. Caught by the manifest.
  3 SAME STONE, TWO NAMES      ⚠️ Black Marinace and Nero Marinace — TWO DIFFERENT PHOTOGRAPHS of
                               ONE stone, listed twice because "nero" is Italian for "black".
                               A pixel check passes this happily. Only a NAME check finds it.
                               ⛔ Same stone in a DIFFERENT FINISH is legitimate and must not be
                               flagged: Absolute Black is genuinely sold polished, honed,
                               leathered and brushed, and the client lists all four.
  4 STALE TILE                 A .webp from an earlier run surviving on disk after the current
                               pipeline started refusing it. Caught against slabify-report.
  5 ORPHAN PAGE                ⚠️ A stone .html still on disk for a stone the catalogue no longer
                               sells. Found 10 Aug: the FOUR duplicates D55b removed were still
                               live and `index, follow` — including black-marinace.html, the
                               exact duplicate check 3 exists to catch. Checks 1-4 all read the
                               CATALOGUE, so a page that outlived its entry is invisible to
                               every one of them. Only a disk listing finds it.
  6 UNIT                       ⛔ Every measurement on this site is in MILLIMETRES (client,
                               10 Aug). The supplier publishes some figures in cm; the page
                               builder appended "mm" to whichever it was handed, so 322 x 162 cm
                               printed as "322 x 162 mm" on 22 pages. A unit error survives every
                               visual check because the page looks perfectly correct.
"""
import json, re, os, re, sys, collections
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
TILES = os.path.abspath(os.path.join(HERE, "..", "..", "assets", "slabs"))
sys.path.insert(0, os.path.dirname(HERE))
from catalogue_active import S                                       # noqa: E402

# words that mean the same stone in another language or a supplier's house style
SYN = {"nero": "black", "noir": "black", "bianco": "white", "blanco": "white",
       "grigio": "grey", "gris": "grey", "gray": "grey", "verde": "green",
       "azul": "blue", "blu": "blue", "rosso": "red", "rojo": "red",
       "oro": "gold", "marron": "brown", "crema": "cream",
       "extra": "", "premium": "", "select": "", "ng": ""}
FINISH = {"honed", "polished", "leather", "leathered", "brushed", "satin", "matt",
          "filled", "and", "jumbo"}


def stone_key(name):
    w = [SYN.get(x, x) for x in re.sub(r"[^a-z0-9 ]", " ", name.lower()).split()]
    return tuple(sorted(x for x in w if x and x not in FINISH))


def phash(p, s=10):
    with Image.open(p) as im:
        g = im.convert("L").resize((s + 1, s), Image.LANCZOS)
    px = list(g.getdata())
    b = 0
    for y in range(s):
        for x in range(s):
            b = (b << 1) | (1 if px[y * (s + 1) + x] < px[y * (s + 1) + x + 1] else 0)
    return b



CONFIRMED_DISTINCT = set()   # nothing needs one: see git-less history in HANDOVER D81

def main():
    man = json.load(open(os.path.join(TILES, "manifest.json")))
    fails = []

    missing = [s["name"] for s in S if s["slug"] not in man]
    if missing:
        fails.append(("no photograph", ", ".join(missing)))

    shared = {t: n for t, n in collections.Counter(man.values()).items() if n > 1}
    for t, _ in shared.items():
        who = [s for s in man if man[s] == t]
        fails.append(("2 · one tile, several stones", f"{t} <- {', '.join(who)}"))

    names = collections.Counter(s["name"] for s in S)
    for n, k in names.items():
        if k > 1:
            fails.append(("duplicate display name", n))

    # 3 · same stone AND same finish under two names
    bykey = collections.defaultdict(list)
    for s in S:
        # ⚠️ MATERIAL IS PART OF THE KEY. An engineered quartz "Carrara" and a natural
        # marble "Carrara" are DIFFERENT PRODUCTS that share a marketing name — that is
        # exactly what the material guard in match.py exists to keep apart, and treating
        # them as one stone here would flag the guard's correct behaviour as a fault.
        bykey[(stone_key(s["name"]), (s.get("finish") or "").lower(), s["mat"])].append(s["name"])
    for (k, fin, mat), group in bykey.items():
        if len(group) > 1 and frozenset(group) not in CONFIRMED_DISTINCT:
            fails.append(("3 · same stone, same finish, two names", f"{' == '.join(group)} [{mat}, {fin}]"))

    # 1 · same photograph under two names
    hashes = {}
    for stone, tile in man.items():
        p = os.path.join(TILES, tile + ".webp")
        if os.path.exists(p):
            hashes[stone] = phash(p)
    seen = list(hashes.items())
    for i in range(len(seen)):
        for j in range(i + 1, len(seen)):
            d = bin(seen[i][1] ^ seen[j][1]).count("1")
            if d <= 8:
                fails.append(("1 · same photograph", f"{seen[i][0]} == {seen[j][0]} (distance {d})"))

    # 4 · stale tiles
    rp = os.path.join(HERE, "slabify-report.json")
    up = os.path.join(HERE, "upscaled.json")
    if os.path.exists(rp):
        ok = {r["slug"] for r in json.load(open(rp)) if r.get("ok")}
        if os.path.exists(up):
            ok |= {d["tile"] for d in json.load(open(up)) if d.get("tile")}
        for stone, tile in man.items():
            if tile not in ok:
                fails.append(("4 · stale tile", f"{stone} -> {tile} not accepted by this run"))


    # 8 · does every photograph trace to THAT supplier's own file under THAT name?
    # ⛔ THE MOST IMPORTANT CHECK ON THE SITE. Client, 10 Aug 2026: "if someone chooses this one
    # by this name and Topcat somehow shows up at the house with a wrong looking slab because the
    # name and the slab didn't look correct, then we are fucked."
    # ⚠️ A stone name is only meaningful RELATIVE TO A SUPPLIER. "Calacatta Gold" is a marketing
    # name that different manufacturers put on completely different-looking products, so the site
    # can never be validated against a generic web image. The only defensible test is this one:
    # the photograph shipped under a name must be the photograph that supplier publishes under it.
    try:
        from supplier_names import SUPPLIER_NAME
    except Exception:
        SUPPLIER_NAME = {}
    SUP_DIR = {"Nile Stone": {"nile", "nile-inv"}, "Next Stone Slabs": {"next"},
               "Caesarstone": {"caesarstone"}, "CRL Stone": {"crl"}, "Noble Stone": {"noblestone"},
               "Bloom Stones London": {"bloom"}}

    def _norm(x):
        x = re.sub(r"\b(polished|honed|leather|leathered|brushed|extra|matt|satin|gloss)\b", " ", x.lower())
        return re.sub(r"[^a-z0-9]+", "", x)

    prov = {r["slug"]: r for r in json.load(open(rp))} if os.path.exists(rp) else {}
    for s in S:
        rec = prov.get(s["slug"]) or prov.get(man.get(s["slug"], ""))
        src = (rec or {}).get("src", "")
        if not src:
            fails.append(("8 · photograph with no provenance",
                          f"{s['name']} has no record of which supplier file it came from"))
            continue
        folder = src.split("/")[1] if src.startswith("raw/") else ""
        allowed = SUP_DIR.get(s["sup"], set())
        if allowed and folder and folder not in allowed:
            fails.append(("8 · photograph from the WRONG SUPPLIER",
                          f"{s['name']} ships {folder}'s photograph, catalogue says {s['sup']}"))
        stem = re.sub(r"__\d+$", "", os.path.splitext(os.path.basename(src))[0])
        a, b = _norm(SUPPLIER_NAME.get(s["slug"], s["name"])), _norm(stem)
        if a and b and a not in b and b not in a:
            fails.append(("8 · name does not match the supplier's file",
                          f"{s['name']} ships '{stem}'. If the supplier spells it differently, "
                          f"record it in stones/supplier_names.py"))


    # 9 · does the NAME match the supplier's own title for the file we ship?
    # ⛔ Check 8 proves the photograph came from the right supplier under a matching filename.
    # This proves the WORDS agree, which is a different and more dangerous failure: fifteen
    # stones shipped a HONED or LEATHERED slab under a plain name, so a customer could choose
    # "Belvedere", ask for Belvedere, and be sent a different finish. Client, 10 Aug: "if someone
    # chooses this one by this name and Topcat shows up at the house with a wrong looking slab,
    # then we are fucked."
    cat_path = os.path.join(HERE, "catalogue.json")
    if os.path.exists(cat_path):
        titles = {}
        for r in json.load(open(cat_path)):
            titles.setdefault(r["slug"], r["title"])
        def _n(x):
            return re.sub(r"[^a-z0-9]+", "", x.lower())
        for s in S:
            rec = prov.get(s["slug"]) or prov.get(man.get(s["slug"], ""))
            if not rec:
                continue
            stem = re.sub(r"__\d+$", "", os.path.splitext(os.path.basename(rec.get("src", "")))[0])
            title = titles.get(stem)
            if not title:
                continue
            # ⭐ An entry in supplier_names.py AUTHORISES the difference: it means a person has
            # checked and written down what the supplier actually calls it (their typo, or a
            # format word like JUMBO). The stone still fails if that record does not match the
            # supplier's real title, so the record cannot drift either.
            recorded = SUPPLIER_NAME.get(s["slug"])
            if recorded is not None:
                if _n(recorded) != _n(title):
                    fails.append(("9 · supplier_names.py is out of date",
                                  f"{s['name']}: recorded '{recorded}', supplier now says '{title}'"))
                continue
            if _n(s["name"]) != _n(title):
                fails.append(("9 · name disagrees with the supplier's title",
                              f"we call it '{s['name']}', the supplier calls {stem} '{title}'"))

    # 5 · a page on disk for a stone the catalogue no longer sells
    pages_dir = os.path.dirname(HERE)
    live = {s["slug"] for s in S}
    # ⚠️ Pages in /stones/ that are NOT a stone. Keep this list exact rather than loosening the
    # check: its whole job is to catch a page for a stone we have stopped selling still sitting
    # on disk and indexable, and every name excused here is a name it can no longer catch.
    # `compare.html` joined it on 12 Aug (D141) — the check fired the moment that page was
    # built, which is the guard working, not the guard being in the way.
    NOT_A_STONE = {"index.html", "compare.html"}
    on_disk = {f[:-5] for f in os.listdir(pages_dir)
               if f.endswith(".html") and f not in NOT_A_STONE}
    for orphan in sorted(on_disk - live):
        fails.append(("5 · page for a stone we no longer sell",
                      f"{orphan}.html is on disk and indexable, but is not in the catalogue"))

    # 6 · every measurement in millimetres
    for s in S:
        size = (s.get("size") or "").strip()
        if size:
            m = re.fullmatch(r"(\d+)\s*x\s*(\d+)", size)
            if not m:
                fails.append(("6 · unit", f"{s['name']}: slab size {size!r} is malformed"))
            elif int(m.group(1)) < 1000 or int(m.group(2)) < 1000:
                fails.append(("6 · unit", f"{s['name']}: slab size {size!r} is CENTIMETRES, "
                                          f"must be millimetres"))
        thick = (s.get("thick") or "").strip()
        if thick and not re.fullmatch(r"\d+mm", thick):
            fails.append(("6 · unit", f"{s['name']}: thickness {thick!r} must be millimetres"))

    # 7 · a promise we cannot keep, on a built page
    # ⛔ Client, 10 Aug, on finding "the pattern is consistent across the slab" live: "You cannot
    # say that something is consistent when it's not. Don't say things that you cannot guarantee.
    # Be more vague." ⚠️ These are ABSOLUTES and GUARANTEES, not ordinary sales copy — each one
    # below was actually on the site. A comparative is fine ("varies less than quarried stone");
    # an absolute is not ("consistent across the slab").
    # ⚠️ `vein-match ... by hand` is here for a second reason: it claims FABRICATION, which
    # Topcat outsource (D21, §2 rule 1).
    BANNED = [
        (r"consistent across the slab", "claims a slab is uniform when veined stone is not"),
        (r"exactly what arrives", "guarantees a specific delivery"),
        (r"no surprises", "guarantees an outcome"),
        (r"vein-?match(es|ing)? every", "guarantees it, and claims fabrication we outsource"),
        (r"sealed for life", "a lifetime claim we have not tested"),
        (r"is all it asks for", "absolute"),
        (r"the one thing it minds", "absolute, implies nothing else affects it"),
        (r"keeps it perfect", "absolute"),
        (r"in its stride", "absolute"),
        (r"\bnever (stains?|scratches|marks|fades)", "absolute"),
        (r"\b(completely|totally|entirely) (stain|scratch|heat|acid)", "absolute"),
        (r"guaranteed to match", "guarantees a match across blocks"),
    ]
    for f in sorted(on_disk):
        p = os.path.join(pages_dir, f + ".html")
        try:
            body = open(p, encoding="utf-8").read()
        except OSError:
            continue
        body = re.sub(r"(?s)<script.*?</script>", " ", body)
        body = re.sub(r"(?s)<!--.*?-->", " ", body)
        text = re.sub(r"(?s)<[^>]+>", " ", body)
        for pat, why in BANNED:
            if re.search(pat, text, re.I):
                fails.append(("7 · promise we cannot keep", f"{f}.html: {pat!r} — {why}"))

    print(f"{len(S)} stones, {len(man)} with a photograph, {len(on_disk)} pages on disk\n")
    if not fails:
        print("✅ PASS — every stone has its own photograph, and no stone appears twice.")
        return 0
    print(f"⛔ {len(fails)} PROBLEM(S):")
    for kind, detail in fails:
        print(f"   [{kind}] {detail}")
    return 1


if __name__ == "__main__":
    sys.exit(main())

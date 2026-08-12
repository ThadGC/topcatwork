# -*- coding: utf-8 -*-
"""Fetch the SUPPLIERS' OWN product descriptions and cache them to supplier_copy.json.

    cd stones/harvest && python3 supplier_copy.py

⭐ WHY. Every stone description on the site was written here rather than sourced. 63 of the 115
were assembled by a script from a fixed phrase bank, which is how "it hides everyday marks better
than a busier stone will" — the opposite of the truth — ended up on five stone pages including a
plain honed black granite. Client, 10 Aug: "every description you write for every single slab must
be researched about that specific slab."

⛔ THE ONLY SAFE RESEARCH SOURCE FOR THIS RANGE IS THE SUPPLIER WHO SELLS IT. For ENGINEERED
QUARTZ the name is a manufacturer's marketing name, not a quarried stone: "Calacatta Classic"
is a different product from a different maker depending on whose catalogue you read. Looking one
up on the open web returns SOMEBODY ELSE'S SLAB under the same words, which is precisely the
wrong-image/wrong-facts-under-a-right-name failure the whole pipeline exists to prevent, and it is
the same reasoning that killed the marble.com plan in D45.

⚠️ Nile's description text was ALREADY being matched by the harvest and thrown away —
`harvest.py:129` reads `description:"(?:[^"\\]|\\.)*"` as a non-capturing skip. This file captures
it instead. Nothing new is downloaded that the pipeline was not already fetching.

⚠️ Descriptions are cached as the supplier's RAW words. They are a research source, not copy to
publish: republishing a supplier's paragraph verbatim is their copyright and duplicate content on
top of it. Read them, verify them against the tile we actually ship, and write our own.
"""
import json, os, re, sys, urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "supplier_copy.json")
sys.path.insert(0, HERE)
from harvest import get, slugify, NILE_BASE                            # noqa: E402


def nile_descriptions():
    """Same bundle the image harvest reads, but keeping the description this time."""
    shell = get(NILE_BASE + "quartz-surfaces")
    m = re.search(r'"(https://www\.nilestone\.co\.uk/client/main\.[a-f0-9]+\.js)"', shell)
    if m:
        bundle_url = m.group(1)
    else:
        m2 = re.search(r'src="(main\.[a-f0-9]+\.js)"', shell)
        if not m2:
            raise RuntimeError("could not locate Nile bundle")
        bundle_url = NILE_BASE + "client/" + m2.group(1)
    js = get(bundle_url)

    pat = re.compile(r'\{id:(\d+),title:"((?:[^"\\]|\\.)*)",'
                     r'description:"((?:[^"\\]|\\.)*)",images:')
    out = {}
    for mm in pat.finditer(js):
        title = mm.group(2).encode().decode("unicode_escape")
        desc = mm.group(3).encode().decode("unicode_escape")
        desc = re.sub(r"<[^>]+>", " ", desc)          # the field carries HTML
        desc = re.sub(r"&nbsp;?", " ", desc)
        desc = re.sub(r"\s+", " ", desc).strip()
        if desc:
            out.setdefault(slugify(title), dict(title=title, source="nile", text=desc))
    return out


def main():
    got = {}
    try:
        n = nile_descriptions()
        got.update(n)
        print(f"nile: {len(n)} descriptions")
    except Exception as e:
        print(f"nile: FAILED {type(e).__name__}: {e}")

    json.dump(got, open(OUT, "w"), indent=1, ensure_ascii=False)
    print(f"wrote {OUT} ({len(got)} records)")

    if got:
        k = sorted(got)[0]
        print(f"\nsample — {got[k]['title']}:\n  {got[k]['text'][:300]}")
    return 0


if __name__ == "__main__":
    sys.exit(main())

# -*- coding: utf-8 -*-
"""Build a NAME INDEX of marble.com's whole materials catalogue, without downloading a thing.

Why this exists. `brands.marbledotcom()` walks the sitemap and then opens the first 140 pages
of each section, which is a blind sweep: ~700 requests that may or may not contain the stones
TopCat actually sells. The client's instruction is the other way round — the suppliers decide
WHICH stones exist, and then we go and find an image of THAT EXACT NAME. So: index first,
match second, fetch only what matched.

One request gets the sitemap. Every material URL carries its own name in the slug
(`/granite-countertops/absolute-black-extra/1234`), so the entire ~2,500-name catalogue can be
indexed for the cost of a single fetch. Nothing here touches a product page.

    python3 mdc_index.py          # write mdc-index.json
"""
import json, os, re, sys
import brands

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "mdc-index.json")

SITEMAPS = [
    "https://marble.com/sitemap_materials.xml",
    "https://marble.com/sitemap.xml",
]

# marble.com's own section -> the material family TopCat sells it as.
SECTIONS = {
    "granite-countertops": "Granite",
    "quartz-countertops": "Quartz",
    "marble-countertops": "Marble",
    "quartzite-countertops": "Quartzite",
    "travertine-countertops": "Travertine",
    "soapstone-countertops": "Soapstone",
    "onyx-countertops": "Onyx",
    "limestone-countertops": "Limestone",
    "dolomite-countertops": "Dolomite",
    "sintered-stone-countertops": "Sintered",
    "porcelain-countertops": "Porcelain",
    "semiprecious-countertops": "Semiprecious",
}


def main():
    locs = []
    for sm in SITEMAPS:
        try:
            found = brands.sitemap_urls(sm, r"marble\.com/[a-z-]+countertops/[^/]+/\d+")
        except Exception as e:
            print(f"  {sm}: {type(e).__name__}: {e}")
            continue
        print(f"  {sm}: {len(found)} material URLs")
        locs += found
        if found:
            break

    rows, seen = [], set()
    for u in sorted(set(locs)):
        m = re.search(r"marble\.com/([a-z-]+countertops)/([^/]+)/(\d+)", u)
        if not m:
            continue
        sec, slug, pid = m.groups()
        if slug in seen:
            continue
        seen.add(slug)
        rows.append(dict(url=u, slug=slug, id=pid, section=sec,
                         kind=SECTIONS.get(sec, sec.split("-")[0].title()),
                         name=slug.replace("-", " ").title()))

    with open(OUT, "w") as f:
        json.dump(rows, f, indent=1, ensure_ascii=False)

    from collections import Counter
    print(f"\nwrote {os.path.basename(OUT)} — {len(rows)} named stones")
    for k, n in Counter(r["kind"] for r in rows).most_common():
        print(f"  {n:5d}  {k}")


if __name__ == "__main__":
    main()

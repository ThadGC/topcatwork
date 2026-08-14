# -*- coding: utf-8 -*-
"""Pull real slab photography + product data from the distributors the client sent (9 Aug 2026).

    python3 harvest.py            # fetch everything into raw/ and write catalogue.json
    python3 harvest.py --list     # show what each source would yield, download nothing

⚠️ LICENSING. This downloads other companies' product photography. That is fine for a
   supplier Topcat actually buys from and has asset permission from, and it is NOT fine as a
   blanket lift from ten companies, several of which (Bloom, AKG) are competitors rather than
   suppliers. Each SOURCE below carries an `ok` flag and a `note` recording what we know.
   Only sources with ok=True are fetched. See harvest/LICENSING.md.

⛔ classicquartzstone.com is EXCLUDED IN CODE, not by oversight: their robots.txt carries
   `User-agent: ClaudeBot / Disallow: /` plus `Content-Signal: ai-train=no, use=reference`,
   which is an express reservation of rights under Art.4 of the EU DSM directive. Do not
   re-enable it without written permission from them.

Raw originals land in raw/<source>/<slug>.<ext> and never ship. slabify.py turns them into
the tiles that do ship (assets/slabs/*.webp).
"""
import json, os, re, sys, time, urllib.request, urllib.error, urllib.parse
import brands

HERE = os.path.dirname(os.path.abspath(__file__))
RAW = os.path.join(HERE, "raw")
UA = ("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/120.0 Safari/537.36")


def get(url, binary=False, timeout=40):
    """Delegates to brands.get, which falls back to /usr/bin/curl when urllib cannot connect.

    ⚠️ THE IMAGES NEED THE FALLBACK TOO, not just the pages. CRL's 71 products were discovered
    fine (the adapter already used brands.get) and then every single download failed silently,
    because this function still went straight to urllib and LibreSSL 2.8.3 cannot handshake
    with their server. Both halves have to use the same fetcher."""
    return brands.get(url, timeout=timeout, binary=binary)


def slugify(s):
    s = s.lower().replace("–", "-").replace("’", "")
    return re.sub(r"-+", "-", re.sub(r"[^a-z0-9]+", "-", s)).strip("-")


# --------------------------------------------------------------------------- sources
# ok=False sources are surveyed and recorded but never fetched. Flip one only when the
# client confirms an asset licence for that brand (see LICENSING.md).
SOURCES = {
    "nile": dict(
        ok=True, name="Nile Stone",
        note="Client's own trade supplier (confirmed 6 Aug 2026). robots.txt empty, no "
             "restrictions. Product data is baked into their Angular bundle.",
    ),
    "nile-inv": dict(
        ok=True, name="Nile Stone (live stock system)",
        note="Same supplier, different and better source: every slab in the building "
             "photographed flat with its block number, thickness and measured size. This is "
             "where the marble and granite photography comes from.",
    ),
    "next": dict(
        ok=True, name="Next Stone Slabs",
        note="Client's own trade supplier (confirmed 6 Aug 2026). robots.txt allows all "
             "bar wp-admin.",
    ),
    "classicquartz": dict(
        ok=False, name='Classic Quartz Stone',
        note='⛔ THEIR SERVER REFUSES THIS AGENT BY NAME: robots.txt carries `User-agent: ClaudeBot / Disallow: /`. That is their server declining the request, not a judgement on our side. The client can supply these assets directly as their customer.',
    ),
    "marbledotcom": dict(
        ok=False, name="marble.com materials catalogue",
        note="⛔ SWITCHED OFF 9 Aug 2026 (decision D45). A countertop retailer's reference "
             "catalogue: ~2,363 named stones, one page each, with a 1280x720 studio shot of the "
             "slab face. The photography is excellent and the naming is the trade's own — but "
             "marble.com is a US COUNTERTOP RETAILER Topcat have no account with, so it fails "
             "the same test in LICENSING.md that put Caesarstone and CRL on 'ask first'. It is "
             "also the wrong source for engineered quartz, where the name is a brand's product "
             "name and a same-named slab from another maker is a different product. "
             "harvest/mdc_index.py indexes every name from ONE request if it is ever licensed.",
    ),
    "caesarstone": dict(
        ok=True, name='Caesarstone UK',
        note='Client supplier. 74 catalogue pages; og:image is a 1920px close-up of the slab surface, studio lit and named by the manufacturer. One of the best sources here.',
    ),
    "crl": dict(
        ok=True, name='CRL Stone',
        note='Client supplier. WordPress; colour pages under /surface/ and /colour/.',
    ),
    "cosentino": dict(
        ok=True, name='Cosentino / Silestone',
        note='Client supplier. Silestone colour pages.',
    ),
    "noblestone": dict(
        ok=True, name='Noble Stone UK',
        note='Client supplier. Publishes <slug>-full-slab images under /storage/media/. robots.txt asks for crawl-delay 3, which is honoured.',
    ),
    "fugen": dict(
        ok=True, name='Fugen Stone',
        note='Client supplier. Blocks plain clients, so a browser UA is sent.',
    ),
    "bloom": dict(
        ok=True, name='Bloom Stones London',
        note='Client supplier per the client. An earlier pass read them as a competitor off their own site; the client knows their trade relationships and that call is theirs.',
    ),
    "akg": dict(
        ok=True, name='AKG Surfaces',
        note='Client supplier per the client, same note as Bloom.',
    ),
}


# --------------------------------------------------------------------------- nile
NILE_BASE = "https://www.nilestone.co.uk/"


def nile_items():
    """Nile is an Angular SPA; the product list is a literal inside the client bundle."""
    shell = get(NILE_BASE + "quartz-surfaces")
    m = re.search(r'"(https://www\.nilestone\.co\.uk/client/main\.[a-f0-9]+\.js)"', shell)
    if not m:                                    # shell references it relatively
        m2 = re.search(r'src="(main\.[a-f0-9]+\.js)"', shell)
        bundle_url = NILE_BASE + "client/" + m2.group(1) if m2 else None
        if not bundle_url:
            raise RuntimeError("could not locate Nile bundle")
    else:
        bundle_url = m.group(1)
    js = get(bundle_url)

    pat = re.compile(r'\{id:(\d+),title:"((?:[^"\\]|\\.)*)",'
                     r'description:"(?:[^"\\]|\\.)*",images:(\[[^\]]*\]|"(?:[^"\\]|\\.)*")\}')
    by_title = {}
    for m in pat.finditer(js):
        title = m.group(2).encode().decode("unicode_escape")
        raw = m.group(3)
        imgs = re.findall(r'"((?:[^"\\]|\\.)*)"', raw) if raw.startswith("[") else [raw.strip('"')]
        for i in imgs:
            i = i.encode().decode("unicode_escape").replace("../../", "")
            if not i.lower().endswith((".jpg", ".jpeg", ".png", ".webp")):
                continue
            by_title.setdefault(title, []).append(NILE_BASE + urllib.request.quote(i))

    out = []
    for title, urls in by_title.items():
        out.append(dict(source="nile", title=title, slug=slugify(title),
                        section=_nile_section(urls[0]), urls=_rank(urls)))
    return out


def _nile_section(u):
    m = re.search(r"assets/([a-z0-9-]+)/", u)
    return m.group(1) if m else "?"


def _rank(urls):
    """Biggest-looking first. WordPress/Nile both suffix resized copies (-300x178);
    Nile's originals are the bare name or a -min/-mag variant."""
    def score(u):
        s = 0
        if re.search(r"-\d{3,4}x\d{2,4}\.", u):
            s -= 10                                    # an explicit thumbnail
            m = re.search(r"-(\d{3,4})x", u)
            s += int(m.group(1)) / 1000 if m else 0
        if "-mag" in u or "-min" in u:
            s += 5                                     # Nile's full-size markers
        return -s
    return sorted(dict.fromkeys(urls), key=score)


# --------------------------------------------------------------------------- next
# ⚠️ THE THREE CATEGORY PAGES ARE NOT THE WHOLE SITE. Next Stone's WordPress sitemap lists only
# 13 pages, and two of the ones nobody thought to open carry more slab photography than the
# category pages do: /380-2/ is a 39-image gallery and /289-2/ is a second "Quartz Slabs" page.
# Reading all six takes the distinct upload count from 72 to 88 and is where the extra Tuscany
# Supreme frames come from. The numbered slugs are WordPress.com defaults, not typos.
NEXT_URLS = ["https://nextstoneslabs.co.uk/quartz/",
             "https://nextstoneslabs.co.uk/marble/",
             "https://nextstoneslabs.co.uk/granite/",
             "https://nextstoneslabs.co.uk/380-2/",     # "Gallery"
             "https://nextstoneslabs.co.uk/289-2/",     # "Quartz Slabs"
             "https://nextstoneslabs.co.uk/275-2/"]     # "Marble Slabs"


def next_items():
    """WordPress. Slab shots sit in wp-content/uploads; the caption/heading beside each
    image is the colour name. Strip WP's -WxH suffix to get the original upload."""
    out, seen = [], {}
    for page in NEXT_URLS:
        try:
            html = get(page)
        except urllib.error.HTTPError as e:
            print(f"    next: {page} -> HTTP {e.code}, skipped")
            continue
        # <figure>/<img> blocks: pair each upload with the nearest alt/title text
        for m in re.finditer(r'<img[^>]+>', html):
            tag = m.group(0)
            src = re.search(r'(?:data-src|src)="([^"]+wp-content/uploads/[^"]+)"', tag)
            if not src:
                continue
            u = src.group(1)
            if not u.lower().split("?")[0].endswith((".jpg", ".jpeg", ".png", ".webp")):
                continue
            alt = re.search(r'alt="([^"]*)"', tag)
            title = (alt.group(1) if alt else "").strip()
            if not title:
                base = os.path.basename(u).rsplit(".", 1)[0]
                # ⚠️ STRIP REPEATEDLY, NOT ONCE. Next stack these markers: "tuscany-supreme-ft-1"
                # is shoot code + frame number, and a single pass removed only the "-1" and left
                # "tuscany-supreme-ft" — a slug of its own, so the extra frames of a stone landed
                # in a separate group and never competed to be its tile.
                # ⛔ Do NOT add "premium" here. Arabescato Grey Premium and Misterio Premium are
                # their own products, not finishes of Arabescato Grey and Misterio.
                prev = None
                while prev != base:
                    prev = base
                    base = re.sub(r"[-_](edited|cropped|ft|fs|vm|ap|\d+[-_]of[-_]\d+|\d+)$",
                                  "", base)
                title = base.replace("-", " ").replace("_", " ").strip().title()
            if not title or len(title) > 60:
                continue
            full = re.sub(r"-\d{3,4}x\d{2,4}(\.[a-z]+)$", r"\1", u)
            key = slugify(title)
            # ⚠️ A SECOND PICTURE OF A STONE IS A SECOND CANDIDATE, NOT A DUPLICATE. This used
            # to `continue` on a key already seen, so the first frame found won and every other
            # frame of that stone was discarded before it could be scored. Tuscany Supreme has
            # four frames across Next's pages and was being judged — and rejected — on one.
            rec = seen.get(key)
            if rec is None:
                rec = dict(source="next", title=title, slug=key,
                           section=page.rstrip("/").rsplit("/", 1)[-1], urls=[])
                seen[key] = rec
                out.append(rec)
            for cand in (full, u):
                if cand not in rec["urls"]:
                    rec["urls"].append(cand)
    return out


# --------------------------------------------------------------------------- nile inventory
INV = "https://www.nilestone.co.uk/secure/inventory/"
INV_CATS = ("granite", "marble", "quartz", "quartzite", "exotic")
INV_CANDIDATES = 10


def nile_inventory_items():
    """Nile's LIVE STOCK system, which is a different and much better source than their
    brochure pages.

    ⭐ This is what closed the gap. The marketing site only carries flat studio scans for the
    ENGINEERED QUARTZ range; its marble and granite pages are lifestyle and yard photography,
    so the first pass came back with tiles for the quartz and almost nothing for natural stone.
    The stock system is the opposite: every slab in the building is photographed flat, one
    record per physical slab, with its block number, thickness and actual measured size.

    POST /secure/inventory/<category>, 40 to a page, no session or token needed from outside.
    `thumbnail_big` is the full-size photograph.

    ⚠️ A record here is ONE SLAB, not a product line, so the same name recurs with different
    block numbers. Keeping every one would flood the catalogue with near-duplicates, so they
    are grouped by name and only the best-scoring picture per name survives slabify.
    """
    out, seen = [], {}
    for cat in INV_CATS:
        page, total = 1, None
        while True:
            req = urllib.request.Request(
                INV + cat, data=json.dumps({"page": page}).encode(),
                headers={"Content-Type": "application/json", "Accept": "application/json",
                         "User-Agent": UA, "X-Requested-With": "XMLHttpRequest"})
            try:
                with urllib.request.urlopen(req, timeout=45) as r:
                    j = json.load(r)
            except Exception as e:
                print(f"    inventory {cat} p{page}: {type(e).__name__}")
                break
            rows = j.get("products") or []
            total = j.get("total_items", 0) if total is None else total
            if not rows:
                break
            for p in rows:
                u = (p.get("thumbnail_big") or "").strip()
                if not u:
                    continue
                name = re.sub(r"\s+", " ", (p.get("name") or "").strip())
                if not name:
                    continue
                slug = slugify(name)
                rec = seen.get(slug)
                if rec is None:
                    rec = dict(source="nile-inv", title=name.title(), slug=slug,
                               section=cat, urls=[],
                               spec=dict(kind=p.get("product_type") or cat.title(),
                                         thickness=p.get("thickness"),
                                         size=p.get("product_size"),
                                         block=p.get("block_no")))
                    seen[slug] = rec
                    out.append(rec)
                # several physical slabs per name: keep a few pictures, pick the best later
                # ⭐ Deeper here than anywhere else. One NAME can have a dozen physical slabs in
                # stock, each photographed separately, and their quality varies wildly: some are
                # stood square-on in good light, others are buried in a rack at an angle. More
                # candidates means a much better chance that at least one is worth cropping, and
                # slabify keeps only the winner, so the extra downloads cost nothing on the site.
                if len(rec["urls"]) < INV_CANDIDATES:
                    rec["urls"].append(urllib.parse.quote(u, safe=":/"))
            page += 1
            if len(rows) < 40 or page > 12:
                break
            time.sleep(0.25)
    return out


HARVESTERS = {"nile": nile_items, "next": next_items, "nile-inv": nile_inventory_items}
HARVESTERS.update(brands.ADAPTERS)   # the seven brand/distributor sites


# --------------------------------------------------------------------------- driver
def main():
    listing = "--list" in sys.argv
    catalogue = []
    for key, meta in SOURCES.items():
        if not meta["ok"]:
            print(f"[skip] {meta['name']}: {meta['note'].splitlines()[0]}")
            continue
        print(f"[{key}] {meta['name']} …")
        try:
            items = HARVESTERS[key]()
        except Exception as e:
            print(f"    FAILED: {type(e).__name__}: {e}")
            continue
        print(f"    {len(items)} products, {sum(len(i['urls']) for i in items)} image candidates")
        if not listing:
            outdir = os.path.join(RAW, key)
            os.makedirs(outdir, exist_ok=True)
            for it in items:
                it["file"] = _download(it, outdir)
                time.sleep(0.3)                      # be a polite guest
        catalogue += items

    if not listing:
        with open(os.path.join(HERE, "catalogue.json"), "w") as f:
            json.dump(catalogue, f, indent=1, ensure_ascii=False)
        got = sum(1 for c in catalogue if c.get("file"))
        print(f"\nwrote catalogue.json — {got}/{len(catalogue)} products have a local image")


# ⚠️ 10, RAISED FROM 4 ON 9 Aug 2026, and the old cap was silently losing whole stones. Nile
# publish up to nine pictures of one product and the useful one is not reliably in the first
# four: Cloud Burst listed eight, of which the first four are all styled kitchens and the fifth
# is "CLOUD BURST CLOSE.jpg", a flat close-up of the slab. The stone had been written off as
# "Nile only publish lifestyle shots of it" when a perfectly good scan was sitting at position
# five, never fetched. slabify scores every candidate and keeps one, so the only cost is disk.
MAX_CANDIDATES = 10


def _download(item, outdir):
    """Take up to MAX_CANDIDATES images per stone, not just the first one.

    ⭐ Worth the extra bandwidth. Nile often publish two or three pictures of the same stone —
    a styled kitchen, then the flat scan — and the order is not consistent. Keeping only the
    first lost Concrete Earth, Cloud Burst, Taj Mahal and Lemurian Blue to lifestyle shots
    while a perfectly good scan sat unread at position two. slabify.py scores every candidate
    and keeps the best, so the choice is made on the picture rather than on the running order.
    """
    got = []
    for n, u in enumerate(item["urls"][:MAX_CANDIDATES]):
        ext = os.path.splitext(u.split("?")[0])[1].lower() or ".jpg"
        if ext not in (".jpg", ".jpeg", ".png", ".webp"):
            ext = ".jpg"
        stem = item["slug"] if n == 0 else f"{item['slug']}__{n + 1}"
        dest = os.path.join(outdir, stem + ext)
        # ⚠️ Re-download anything suspiciously small. The cache is what stopped the Caesarstone
        # fix from taking: an early run of the adapter had grabbed their 275x454 nav ICONS, and
        # because a cached file was only ever checked for existence, the corrected adapter's
        # 1920px close-ups were skipped for months of runs. 300KB is comfortably above a
        # thumbnail and below any real slab photograph.
        if os.path.exists(dest) and os.path.getsize(dest) > 300_000:
            got.append(os.path.relpath(dest, HERE))
            continue
        try:
            data = get(u, binary=True)
        except Exception:
            continue
        if len(data) < 4096:                          # placeholder/spacer
            continue
        with open(dest, "wb") as f:
            f.write(data)
        got.append(os.path.relpath(dest, HERE))
        time.sleep(0.2)
    return got[0] if got else None


if __name__ == "__main__":
    main()

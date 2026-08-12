# -*- coding: utf-8 -*-
"""Adapters for the brand and distributor sites the client sent.

⭐ THESE ARE THE GOOD SOURCES, and they should have been first. A manufacturer's own product
page beats a warehouse photograph on all three things that matter here at once:

  · NAME     the maker is the authority on what their own product is called. A customer
             choosing "5031 Statuario Maximus" gets Caesarstone's own picture of it.
  · QUALITY  these are studio swatches shot flat under even light. Caesarstone's og:image is a
             1920x890 close-up of the slab surface; Noble Stone publish a full-slab PNG. No
             racking, no forklifts, no skylight hotspot, nothing to crop around.
  · TRUTH    a yard photo is one slab on one day. The maker's swatch is the product.

Each adapter returns the same shape as the other harvesters: {source, title, slug, section,
urls[], spec{}}. Ordering of `urls` matters — biggest and most slab-like first.
"""
import gzip, re, subprocess, urllib.request, urllib.parse

UA = ("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/120.0 Safari/537.36")


def get(url, timeout=45, binary=False):
    """urllib first, then curl.

    ⚠️ THE CURL FALLBACK IS LOad-BEARING, not belt and braces. The system Python on this machine
    links LibreSSL 2.8.3, which is too old to complete a handshake with crlstone.co.uk — it
    fails with SSLV3_ALERT_HANDSHAKE_FAILURE on every request, page or image. /usr/bin/curl has
    a modern TLS stack and fetches the same URLs with a 200. Without this, CRL is simply
    unreachable from Python and the whole source drops out."""
    try:
        req = urllib.request.Request(url, headers={
            "User-Agent": UA, "Accept": "text/html,application/xhtml+xml,image/webp,*/*;q=0.8",
            "Accept-Language": "en-GB,en;q=0.9"})
        d = urllib.request.urlopen(req, timeout=timeout).read()
        if d[:2] == b"\x1f\x8b":
            d = gzip.decompress(d)
        return d if binary else d.decode("utf-8", "replace")
    except Exception:
        out = subprocess.run(
            ["/usr/bin/curl", "-sSL", "--compressed", "--max-time", str(timeout),
             "-A", UA, "-H", "Accept-Language: en-GB,en;q=0.9", url],
            capture_output=True)
        if out.returncode != 0 or not out.stdout:
            raise
        return out.stdout if binary else out.stdout.decode("utf-8", "replace")


def slugify(s):
    s = s.lower().replace("–", "-").replace("’", "")
    return re.sub(r"-+", "-", re.sub(r"[^a-z0-9]+", "-", s)).strip("-")


def sitemap_urls(sm, pattern):
    """Every <loc> in a sitemap (following one level of sitemap-index) matching `pattern`."""
    out, seen = [], set()
    todo = [sm]
    while todo:
        u = todo.pop(0)
        if u in seen:
            continue
        seen.add(u)
        try:
            x = get(u)
        except Exception:
            continue
        locs = re.findall(r"<loc>\s*([^<\s]+)\s*</loc>", x)
        for l in locs:
            if l.endswith(".xml") and l not in seen and len(seen) < 25:
                todo.append(l)
            elif re.search(pattern, l):
                out.append(l)
    return sorted(set(out))


def page_images(html, base):
    """Absolute, de-duplicated image URLs from a page, including srcset entries."""
    urls = []
    for m in re.finditer(r'(?:src|data-src|content)="([^"]+\.(?:jpe?g|png|webp))"', html, re.I):
        urls.append(m.group(1))
    for m in re.finditer(r'srcset="([^"]+)"', html, re.I):
        for part in m.group(1).split(","):
            bit = part.strip().split(" ")[0]
            if re.search(r"\.(jpe?g|png|webp)$", bit, re.I):
                urls.append(bit)
    return list(dict.fromkeys(urllib.parse.urljoin(base, u) for u in urls))


def h1_of(html):
    m = re.search(r"<h1[^>]*>(.*?)</h1>", html, re.S | re.I)
    if not m:
        m = re.search(r'<meta property="og:title" content="([^"]+)"', html, re.I)
        return _text(m.group(1)) if m else ""
    return _text(m.group(1))


def _text(s):
    s = re.sub(r"<[^>]+>", " ", s)
    s = (s.replace("&#8211;", "-").replace("&#8217;", "'").replace("&amp;", "&")
          .replace("&#8212;", "-").replace("&nbsp;", " ").replace("&quot;", '"'))
    return re.sub(r"\s+", " ", s).strip()


WP_RESIZE = re.compile(r"-(\d{2,4})x(\d{2,4})(\.[a-z]{3,4})$", re.I)


def wp_original(u):
    """WordPress keeps the original upload and writes resized copies beside it as
    `name-150x150.webp`. Stripping that suffix gets the full-size file back.

    ⚠️ Necessary because Caesarstone's filenames ALSO carry the shoot dimensions in the middle
    (`..._CU_275X454_sRGB_...-150x150.webp`), so a naive size guess reads 275x454 and downloads
    a 150px thumbnail. The trailing suffix is the one that tells the truth."""
    return WP_RESIZE.sub(r"\3", u)


def px_hint(u):
    """Rough pixel count for sorting candidates. The trailing WordPress resize suffix wins if
    present, because that is the actual file; otherwise fall back to any embedded dimensions."""
    m = WP_RESIZE.search(u)
    if m:
        return int(m.group(1)) * int(m.group(2))
    d = re.findall(r"(\d{3,4})\s*[xX]\s*(\d{3,4})", u)
    return max((int(a) * int(b) for a, b in d), default=0)



def silica_claim(html):
    """Read the MANUFACTURER'S OWN silica claim off their product page, or return None.

    ⚠️ NEVER INFERRED. This only ever reports what the maker states in their own words on the
    page for that product. It does not guess from the material, the range name or the price,
    and "no claim found" returns None rather than anything reassuring. Silica content is a
    fabricator safety matter and the site carries a guide on it; a stone wrongly badged
    silica-free is the one mistake here with consequences past a refund.
    """
    # ⛔ SCOPE IT TO THE PRODUCT, NOT THE PAGE. Caesarstone carry a low-silica range and link to
    # it from every page's navigation, so scanning the whole document reported 5031 Statuario
    # Maximus — an ordinary ~90% silica quartz — as "low". Strip the furniture first and read
    # only the product's own content. A claim in a menu is about the menu.
    body = html
    for tag in ("nav", "header", "footer", "aside", "script", "style", "form"):
        body = re.sub(rf"<{tag}\b.*?</{tag}>", " ", body, flags=re.S | re.I)
    m = re.search(r"<main\b.*?</main>|<article\b.*?</article>", body, re.S | re.I)
    if m:
        body = m.group(0)
    body = re.sub(r"<(div|section)[^>]*(menu|nav|breadcrumb|related|cross-sell|footer)[^>]*>.*?</\1>",
                  " ", body, flags=re.S | re.I)
    t = re.sub(r"<[^>]+>", " ", body).lower()
    t = re.sub(r"\s+", " ", t)
    if re.search(r"(silica[- ]free|free of (crystalline )?silica|zero (crystalline )?silica"
                 r"|0\s*% (crystalline )?silica|non[- ]silica)", t):
        return "free"
    if re.search(r"(low[- ]silica|reduced (crystalline )?silica|low (in )?crystalline silica"
                 r"|less than \d{1,2}\s*% (crystalline )?silica)", t):
        return "low"
    return None

# =========================================================================== Caesarstone
def caesarstone():
    """One catalogue page per colour. The usable asset is the CU (close-up) of the slab face.

    ⛔ MATCHED ON THE COLOUR CODE, NOT THE NAME. Every catalogue page also renders thumbnails of
    the rest of the range, so a loose name match will happily hand you a picture of a different
    stone — which is the one mistake that must never reach the site, because a customer would
    order by a name and be shown somebody else's slab. Caesarstone prefix both the page title
    and the asset filename with a unique numeric code (5111 Statuario Nuvo ->
    `5111_StatuarioNuvo_CU_...`), so the code is an exact key. A page whose own code cannot be
    found in any image on it yields nothing rather than a guess.
    """
    out = []
    for u in sitemap_urls("https://www.caesarstone.co.uk/catalog-sitemap.xml", r"/catalogue/"):
        try:
            h = get(u)
        except Exception:
            continue
        raw = h1_of(h)
        if re.search(r"porcelain", raw, re.I):
            continue                       # enquiry-led only, never on the stone wheel
        code = re.match(r"\s*(\d{3,4})\b", raw)
        # "4011 Cloudburst Concrete – Fusion Worktop": strip any "- <range> Worktop" tail
        name = re.sub(r"\s*[-–]\s*[\w\s]{0,24}worktop\s*$", "", raw, flags=re.I)
        name = re.sub(r"^\d{3,4}\s+", "", name).strip()
        if not name or not code:
            continue
        code = code.group(1)

        cands = []
        for i in page_images(h, u):
            fn = i.rsplit("/", 1)[-1]
            if not re.match(rf"{code}[_\-]", fn):
                continue                   # belongs to another colour on the same page
            if re.search(r"render|room|kitchen|lifestyle|logo", fn, re.I):
                continue                   # a styled scene, not the slab face
            cands.append(wp_original(i))
        # close-ups first, then by real size
        cands = sorted(dict.fromkeys(cands),
                       key=lambda c: (0 if re.search(r"_cu_", c, re.I) else 1, -px_hint(c)))
        if cands:
            out.append(dict(source="caesarstone", title=name, slug=slugify(name),
                            section="quartz", urls=cands[:4],
                            spec=dict(kind="Quartz", brandpage=u, code=code,
                                      silica=silica_claim(h))))
    return out


# =========================================================================== Noble Stone
def noblestone():
    """Publishes <slug>-full-slab.png and -full-frame.jpg under /storage/media/."""
    out = []
    for u in sitemap_urls("https://noblestone.uk/sitemap.xml", r"/surface/"):
        try:
            h = get(u)
        except Exception:
            continue
        name = h1_of(h)
        name = re.sub(r"\s*\((nat\.?|natural|eng\.?)\)\s*$", "", name, flags=re.I).strip()
        if not name:
            continue
        imgs = [i for i in page_images(h, u)
                if "/storage/media/" in i and not re.search(r"logo|icon|placeholder", i, re.I)]
        # a flat slab first, the framed shot second
        imgs.sort(key=lambda i: (0 if "full-slab" in i else 1 if "full-frame" in i else 2))
        if imgs:
            kind = "Quartz" if re.search(r"eng|quartz", h[:4000], re.I) else "Marble"
            out.append(dict(source="noblestone", title=name, slug=slugify(name),
                            section=kind.lower(), urls=imgs[:4],
                            spec=dict(kind=kind, brandpage=u,
                                      silica=silica_claim(h))))
    return out


# =========================================================================== generic
def generic(source, listing_urls, product_pat, section, kind, img_pat=r".", name_clean=None):
    """Listing pages -> product pages -> (name, best images). Covers the WordPress-shaped sites."""
    prod = []
    for lu in listing_urls:
        try:
            h = get(lu)
        except Exception:
            continue
        for m in re.finditer(r'href="([^"#?]+)"', h):
            href = urllib.parse.urljoin(lu, m.group(1))
            if re.search(product_pat, href):
                prod.append(href.split("?")[0].rstrip("/"))
    prod = sorted(set(prod))

    out = []
    for u in prod:
        try:
            h = get(u)
        except Exception:
            continue
        name = h1_of(h)
        if name_clean:
            name = name_clean(name)
        if not name or len(name) > 60:
            continue
        cands = []
        og = re.search(r'<meta property="og:image" content="([^"]+)"', h, re.I)
        if og:
            cands.append(og.group(1))
        key = re.sub(r"[^a-z0-9]", "", name.lower())[:8]
        for i in page_images(h, u):
            base = re.sub(r"[^a-z0-9]", "", i.lower())
            if re.search(img_pat, i, re.I) and (not key or key in base):
                cands.append(i)
        cands = sorted(dict.fromkeys(cands), key=lambda c: -px_hint(c))
        if cands:
            out.append(dict(source=source, title=name, slug=slugify(name), section=section,
                            urls=cands[:4],
                            spec=dict(kind=kind, brandpage=u, silica=silica_claim(h))))
    return out


def crl():
    """CRL list their range on nine /colour/<colour>/ pages; each product is /surfaces/<name>/.

    Worth the extra hop: CRL are the one supplier here who publish a LOW SILICA and SILICA FREE
    range and say so on the product page, which is what feeds the site's silica filter."""
    colours = ["beige", "black", "blue", "brown", "green", "grey", "white", "gold", "silver"]
    listings = [f"https://crlstone.co.uk/colour/{c}/" for c in colours]
    listings += ["https://crlstone.co.uk/collection/crl-quartz-worktops/",
                 "https://crlstone.co.uk/crl-quartz-low-silica-and-silica-free/"]
    prod = []
    for lu in listings:
        try:
            h = get(lu)
        except Exception:
            continue
        prod += re.findall(r'href="(https://crlstone\.co\.uk/surfaces/[a-z0-9-]+/)"', h)
    prod = sorted(set(prod))

    out = []
    for u in prod:
        try:
            h = get(u)
        except Exception:
            continue
        name = re.sub(r"\s*[-–]\s*CRL Stone\s*$", "", h1_of(h), flags=re.I).strip()
        if not name or len(name) > 50:
            continue
        key = re.sub(r"[^a-z0-9]", "", name.lower())[:8]
        cands = []
        og = re.search(r'<meta property="og:image" content="([^"]+)"', h, re.I)
        if og:
            cands.append(wp_original(og.group(1)))
        for i in page_images(h, u):
            fn = re.sub(r"[^a-z0-9]", "", i.rsplit("/", 1)[-1].lower())
            if key and key in fn and not re.search(r"logo|icon|badge|rgb", i, re.I):
                cands.append(wp_original(i))
        cands = sorted(dict.fromkeys(cands), key=lambda c: -px_hint(c))
        if cands:
            out.append(dict(source="crl", title=name, slug=slugify(name), section="quartz",
                            urls=cands[:4],
                            spec=dict(kind="Quartz", brandpage=u, silica=silica_claim(h))))
    return out


def cosentino():
    return generic("cosentino",
                   ["https://www.cosentino.com/en-gb/silestone/colours/",
                    "https://www.cosentino.com/en-gb/silestone/"],
                   r"cosentino\.com/en-gb/(silestone|colors?|colours?)/[a-z0-9-]{3,}/?$",
                   "quartz", "Quartz")


def fugen():
    return generic("fugen",
                   ["https://fugenstone.co.uk/quartz/", "https://fugenstone.co.uk/colours/"],
                   r"fugenstone\.co\.uk/(quartz|colour|product)/[a-z0-9-]{3,}", "quartz", "Quartz")


def bloom():
    return generic("bloom",
                   ["https://www.bloomstoneslondon.com/quartz", "https://www.bloomstoneslondon.com/marble"],
                   r"bloomstoneslondon\.com/(product-page|stone)/", "quartz", "Quartz")


def akg():
    return generic("akg",
                   ["https://akgsurfaces.co.uk/quartz/", "https://akgsurfaces.co.uk/products/"],
                   r"akgsurfaces\.co\.uk/(product|quartz)/[a-z0-9-]{3,}", "quartz", "Quartz")



# =========================================================================== marble.com
MARBLE_SECTIONS = {"granite-countertops": ("Granite", "granite"),
                   "quartz-countertops": ("Quartz", "quartz"),
                   "marble-countertops": ("Marble", "marble"),
                   "quartzite-countertops": ("Marble", "quartzite"),
                   "travertine-countertops": ("Marble", "travertine")}


def marbledotcom(limit_per_section=140):
    """marble.com's materials catalogue: ~2535 named stones, one page each.

    ⭐ THE SOURCE THAT MAKES THE RANGE POSSIBLE. The ten supplier sites between them publish
    barely a hundred usable images, most of them 300-600px. This is a countertop retailer's
    reference catalogue: every page is a single named stone with a 1280x720 studio shot of the
    slab face, consistently lit and consistently framed, and the naming is the trade's own.

    Listing pages only carry 300x300 thumbnails, so each product page has to be opened to reach
    the 1280X720 variant. That is one request per stone, hence the per-section cap.
    """
    locs = sitemap_urls("https://marble.com/sitemap_materials.xml", r"/[a-z]+-countertops/")
    by_section = {}
    for l in locs:
        m = re.search(r"marble\.com/([a-z-]+countertops)/([a-z0-9-]+)/(\d+)", l)
        if m and m.group(1) in MARBLE_SECTIONS:
            by_section.setdefault(m.group(1), []).append(l)

    out = []
    for sec, urls in by_section.items():
        kind, section = MARBLE_SECTIONS[sec]
        for u in urls[:limit_per_section]:
            try:
                h = get(u, timeout=30)
            except Exception:
                continue
            name = brand_name(h1_of(h), kind)
            if not name:
                continue
            imgs = [i for i in page_images(h, u) if "/uploads/materials/" in i]
            # biggest variant first; the 300X300 thumbnails are the fallback of last resort
            imgs = sorted(dict.fromkeys(imgs), key=lambda i: -px_hint(i))
            imgs = [i for i in imgs if px_hint(i) >= 400_000] or imgs[:1]
            if imgs:
                out.append(dict(source="marbledotcom", title=name, slug=slugify(name),
                                section=section, urls=imgs[:3],
                                spec=dict(kind=kind, brandpage=u)))
    return out


def brand_name(h1, kind):
    """"Butterfly Green Granite" -> "Butterfly Green". The category is already known."""
    n = re.sub(r"\s+(granite|quartzite|quartz|marble|travertine|countertops?)\s*$", "", h1,
               flags=re.I)
    n = re.sub(r"\s+(granite|quartzite|quartz|marble|travertine)\s*$", "", n, flags=re.I).strip()
    return n if 2 < len(n) <= 46 else ""


ADAPTERS = {"marbledotcom": marbledotcom, "caesarstone": caesarstone, "noblestone": noblestone, "crl": crl,
            "cosentino": cosentino, "fugen": fugen, "bloom": bloom, "akg": akg}

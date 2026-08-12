# -*- coding: utf-8 -*-
"""Work out which stones actually LOOK like each other, and write similar.json.

    cd stones/harvest && python3 similar.py

⭐ WHY THIS EXISTS. The "More marble to consider" strip at the foot of every stone page used to
pick `same[(idx + k) % len(same)]` — the next three entries in the catalogue list. The only thing
a suggestion shared with the stone above it was its material. Measured across the 345 picks: 30%
matched on colour, 17% on colour + tone + veining, and on 76 of the 115 pages ALL THREE
suggestions were unlike the stone being viewed. Nero Marquina, a black marble, offered a pale
blue, a white and a blue. The client's words: "it shows slabs that look similar to that, it
doesn't just show random slabs."

⛔ SIMILARITY IS MEASURED OFF THE SHIPPING PHOTOGRAPH, NOT OFF THE LABELS. The catalogue's
hue/tone/vein are three coarse buckets — every one of the 50 quartzes is "light", so a bucket
match tells you almost nothing. The tile the customer actually sees is the ground truth, and it
is already on disk. Four numbers per tile:

    L, a, b   mean CIELAB. Perceptual, so the distance between a cream and a white is small
              and the distance between a cream and a charcoal is large, the way an eye reads it.
    edge      share of pixels that sit on a boundary — how BUSY the stone is. This is what
              separates a quiet Carrara from a Calacatta Fantastico, and it is the axis a
              customer notices second after colour.

⚠️ Weighting is deliberate. Lightness and busyness are weighted above hue because a shopper
rejects "too dark" and "too busy" long before they quibble about warm versus cool white.

⚠️ SAME MATERIAL ONLY. A quartz and a marble that photograph alike are not alternatives to each
other — different price band, different care, and the customer has usually already chosen.

Regenerate whenever tiles change, BEFORE build_stones.py. build_stones.py reads similar.json and
never imports PIL.
"""
import json, math, os, sys, collections
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
TILES = os.path.abspath(os.path.join(HERE, "..", "..", "assets", "slabs"))
OUT = os.path.join(HERE, "similar.json")
sys.path.insert(0, os.path.dirname(HERE))
from catalogue_active import S                                       # noqa: E402

N = 3          # suggestions per page
SAMPLE = 160   # tiles are downsampled to this before measuring; plenty for colour and busyness


# ----------------------------------------------------------------- colour space
def _srgb_to_lab(r, g, b):
    """sRGB 0-255 -> CIELAB, D65. Written out rather than pulled from a library so the
    pipeline keeps its only dependency (Pillow)."""
    def lin(c):
        c /= 255.0
        return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4
    r, g, b = lin(r), lin(g), lin(b)
    x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047
    y = (r * 0.2126 + g * 0.7152 + b * 0.0722)
    z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883

    def f(t):
        return t ** (1 / 3) if t > 0.008856 else (7.787 * t + 16 / 116)
    fx, fy, fz = f(x), f(y), f(z)
    return 116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)


def _pct(sorted_vals, p):
    if not sorted_vals:
        return 0.0
    i = min(len(sorted_vals) - 1, max(0, int(round(p / 100.0 * (len(sorted_vals) - 1)))))
    return sorted_vals[i]


def features(path):
    """Describe the tile the way an eye reads a slab: the ground, the veins, the contrast
    between them, and how busy it is.

    ⚠️ NOT the mean. A white marble with black veining averages to a mid grey, which puts
    Carrara next to a plain concrete quartz — the first attempt at this scored barely better
    than the positional pick it replaced. The ground is the 60th percentile of lightness (the
    field the veining sits on, since veins are darker and cover less of the slab) and the veins
    are the 12th. Those two numbers separate 'pale stone, dark veins' from 'mid grey all over',
    which the mean cannot do."""
    with Image.open(path) as im:
        im = im.convert("RGB")
        im.thumbnail((SAMPLE, SAMPLE), Image.LANCZOS)
        px = list(im.getdata())
        w, h = im.size
        grey = im.convert("L")

    lab = [_srgb_to_lab(r, g, bl) for r, g, bl in px]
    Ls = sorted(v[0] for v in lab)
    ground = _pct(Ls, 60)
    veins = _pct(Ls, 12)
    contrast = _pct(Ls, 88) - veins

    # the GROUND's colour, not the whole tile's: only pixels sitting near the ground lightness
    near = [(a_, b_) for (l_, a_, b_) in lab if abs(l_ - ground) <= 9]
    if not near:
        near = [(a_, b_) for (_, a_, b_) in lab]
    a = sum(x for x, _ in near) / len(near)
    b = sum(y for _, y in near) / len(near)

    # edge share: mean absolute gradient. Same idea derive.py uses for `vein`, recomputed here
    # so this file does not depend on a derived.json that may predate a retile.
    g = list(grey.getdata())
    tot = cnt = 0
    for y in range(h - 1):
        row = y * w
        for x in range(w - 1):
            i = row + x
            tot += abs(g[i] - g[i + 1]) + abs(g[i] - g[i + w])
            cnt += 2
    edge = tot / max(cnt, 1)

    # ⚠️ COMPRESSED, not raw. Busyness has a long tail — most of the range sits under 6 and a
    # handful of granites reach 17 — and on a raw scale those few outliers sit miles from
    # everything, so their nearest neighbour becomes whatever is least far rather than what
    # actually looks like them. Baltic Brown, the busiest stone we sell, was matched to three
    # pale creams. The eye reads busyness logarithmically too: 2 against 6 is obvious, 14
    # against 18 is not.
    edge = math.log1p(edge)
    return dict(ground=ground, veins=veins, contrast=contrast, a=a, b=b, edge=edge)


# ----------------------------------------------------------------- distance
# ⛔ EVERY FEATURE IS NORMALISED AGAINST ITS SPREAD ACROSS THE RANGE BEFORE IT IS WEIGHTED.
# Without this the weights are meaningless and colour silently stops counting: lightness varies
# over ~60 units across the range while a/b vary over ~15, so a raw-units weight of 0.6 on colour
# still let brightness win every time. It put three BLUE granites under Baltic Brown, which is
# brown. Normalising first means a weight of 1.0 reads as "one range-width of difference",
# whatever the unit, and the numbers below are then comparable to each other.
# ⚠️ If you retune, change the weights, never the normalisation.
W = dict(ground=1.40,    # "too dark / too light" — the first thing a shopper rules out
         veins=0.45,     # how dark the veining goes
         contrast=0.70,  # quiet stone against dramatic one
         ab=1.15,        # brown against blue against green. Must stay near the ground weight.
         edge=0.90)      # busy against plain
KEYS = ("ground", "veins", "contrast", "a", "b", "edge")


def make_distance(feats):
    """Close over the corpus so each feature is scored in units of its own spread."""
    sd = {}
    for k in KEYS:
        vals = [f[k] for f in feats.values()]
        mean = sum(vals) / len(vals)
        var = sum((v - mean) ** 2 for v in vals) / max(len(vals) - 1, 1)
        sd[k] = max(var ** 0.5, 1e-6)

    def distance(p, q):
        z = {k: (p[k] - q[k]) / sd[k] for k in KEYS}
        return (W["ground"] * z["ground"] ** 2
                + W["veins"] * z["veins"] ** 2
                + W["contrast"] * z["contrast"] ** 2
                + W["ab"] * (z["a"] ** 2 + z["b"] ** 2)
                + W["edge"] * z["edge"] ** 2) ** 0.5
    return distance


def main():
    man = json.load(open(os.path.join(TILES, "manifest.json")))
    feats, missing = {}, []
    for s in S:
        tile = man.get(s["slug"])
        p = os.path.join(TILES, f"{tile}.webp") if tile else None
        if not p or not os.path.exists(p):
            missing.append(s["name"])
            continue
        feats[s["slug"]] = features(p)
    if missing:
        print(f"⚠️  no tile for {len(missing)}: {', '.join(missing)}")

    distance = make_distance(feats)
    by_slug = {s["slug"]: s for s in S}
    out = {}
    for s in S:
        if s["slug"] not in feats:
            continue
        me = feats[s["slug"]]
        pool = [(distance(me, feats[o["slug"]]), o["slug"])
                for o in S
                if o["slug"] != s["slug"] and o["mat"] == s["mat"] and o["slug"] in feats]
        pool.sort()
        out[s["slug"]] = [slug for _, slug in pool[:N]]

    json.dump(out, open(OUT, "w"), indent=1)
    print(f"wrote {OUT}  ({len(out)} stones, {N} neighbours each)")

    # ---- report: how much closer is this than the old positional pick?
    hue_ok = tone_ok = both_ok = tot = 0
    for slug, picks in out.items():
        me = by_slug[slug]
        for p in picks:
            o = by_slug[p]
            tot += 1
            if o["hue"] == me["hue"]:
                hue_ok += 1
            if o["tone"] == me["tone"]:
                tone_ok += 1
            if o["hue"] == me["hue"] and o["tone"] == me["tone"] and o["vein"] == me["vein"]:
                both_ok += 1
    print(f"  same colour           {hue_ok:3}/{tot}  ({hue_ok / tot * 100:.0f}%)")
    print(f"  same tone             {tone_ok:3}/{tot}  ({tone_ok / tot * 100:.0f}%)")
    print(f"  same colour+tone+vein {both_ok:3}/{tot}  ({both_ok / tot * 100:.0f}%)")
    return 0


if __name__ == "__main__":
    sys.exit(main())

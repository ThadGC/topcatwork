# -*- coding: utf-8 -*-
"""Read the finished tiles and work out what each stone actually looks like.

    python3 derive.py            # write derived.json
    python3 derive.py --check    # print the table and stop

The catalogue needs tone / hue / veining for every stone, because that is what the filter
chips and the search run on. For the client's original 52 those were set by hand. For a
catalogue three times the size, setting them by hand would be guesswork dressed up as data —
and it would be guesswork about a picture that is sitting right there.

So they are MEASURED off the tile:

    tone    mean luminance, light or dark
    hue     which of the trade's colour families the average pixel falls into, with a
            saturation floor so a near-neutral stone is called grey/white/cream rather than
            being pushed into a colour it does not really have
    vein    how much of the slab is edge rather than field: statement / soft / calm

`preset` is picked to match, so the drawn fallback still resembles the real stone if the tile
is ever missing. It is chosen from the measured tone and hue, not from the name.
"""
import json, os, glob, sys
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
TILES = os.path.abspath(os.path.join(HERE, "..", "..", "assets", "slabs"))

# hue family -> representative (r,g,b) direction, judged on the average pixel
FAMILIES = [
    ("white", (238, 237, 233)), ("cream", (226, 210, 178)), ("grey", (170, 172, 172)),
    ("black", (46, 46, 48)), ("brown", (120, 90, 62)), ("blue", (96, 118, 146)),
    ("green", (96, 124, 100)),
]
# preset for the drawn fallback, keyed (tone, hue)
PRESET = {
    ("light", "white"): "calacatta", ("light", "cream"): "crema", ("light", "grey"): "mist",
    ("light", "blue"): "mist", ("light", "green"): "mist", ("light", "brown"): "crema",
    ("light", "black"): "mist",
    ("dark", "black"): "nerogold", ("dark", "brown"): "emperador", ("dark", "blue"): "fumo",
    ("dark", "green"): "fumo", ("dark", "grey"): "fumo", ("dark", "cream"): "emperador",
    ("dark", "white"): "mist",
}


def measure(path):
    im = Image.open(path).convert("RGB")
    im = im.resize((128, 128), Image.BILINEAR)
    px = list(im.getdata())
    n = len(px)
    r = sum(p[0] for p in px) / n
    g = sum(p[1] for p in px) / n
    b = sum(p[2] for p in px) / n
    L = [(3 * p[0] + 6 * p[1] + p[2]) / 10 for p in px]
    mL = sum(L) / n
    sat = sum(max(p) - min(p) for p in px) / n

    # edge share: how much of the slab is vein rather than field
    e = 0.0
    for y in range(127):
        for x in range(127):
            i = y * 128 + x
            e += abs(L[i] - L[i + 1]) + abs(L[i] - L[i + 128])
    e /= (127 * 127 * 2)

    # ⚠️ RELATIVE chroma, not absolute. Antiq Brown Extra is unmistakably brown and measures a
    # saturation of 1.6, because it is also very dark and at low luminance the gap between the
    # channels is small in absolute terms however warm the stone is. Dividing by brightness asks
    # the right question: how coloured is this FOR ITS DARKNESS.
    mx, mn = max(r, g, b), min(r, g, b)
    chroma = (mx - mn) / max(mx, 1.0)

    if chroma < 0.055:
        # genuinely colourless: name it by brightness and do not invent a tint
        hue = "white" if mL > 178 else ("grey" if mL > 72 else "black")
    elif b >= r and b >= g:
        hue = "blue"
    elif g > r and g > b:
        hue = "green"
    elif mL < 140:
        hue = "brown"
    else:
        hue = "cream" if chroma > 0.085 else ("white" if mL > 190 else "grey")

    # The trade name is evidence, and often better evidence than the average pixel: a brushed
    # Absolute Black photographs at luminance 133 under warehouse lights and measures grey, but
    # nobody shopping for it thinks of it as a grey worktop. Where the supplier has named a
    # colour, that wins.
    low = name_of(path)
    for word, h in NAME_HUE:
        if word in low:
            hue = h
            break

    tone = "dark" if (mL < 118 or hue in ("black", "brown")) else "light"
    vein = "statement" if e >= 3.4 else ("soft" if e >= 1.5 else "calm")
    return dict(tone=tone, hue=hue, vein=vein, lum=round(mL, 1), sat=round(sat, 1),
                chroma=round(chroma, 3), edge=round(e, 2),
                preset=PRESET.get((tone, hue), "mist"))


def name_of(path):
    return " " + os.path.basename(path).lower().replace("-", " ") + " "


# Longest/most specific first — "bianco" must beat nothing, but "blue roma" must not be caught
# by a bare "roma". Checked as substrings of the padded, hyphen-stripped filename.
NAME_HUE = [
    (" nero ", "black"), (" negro ", "black"), (" black ", "black"), (" noir ", "black"),
    (" marron ", "brown"), (" brown ", "brown"), (" marrone ", "brown"), (" tan ", "brown"),
    (" verde ", "green"), (" green ", "green"),
    (" azul ", "blue"), (" blue ", "blue"), (" blu ", "blue"), (" aqua ", "blue"),
    (" bianco ", "white"), (" white ", "white"), (" blanca ", "white"), (" blanco ", "white"),
    (" statuario ", "white"), (" carrara ", "white"), (" calacatta ", "white"),
    (" arabescato ", "white"), (" snow ", "white"),
    (" crema ", "cream"), (" cream ", "cream"), (" beige ", "cream"), (" sahara ", "cream"),
    (" giallo ", "cream"), (" oro ", "cream"), (" gold ", "cream"), (" almond ", "cream"),
    (" grigio ", "grey"), (" grey ", "grey"), (" gray ", "grey"), (" platino ", "grey"),
    (" concrete ", "grey"), (" cement ", "grey"), (" silver ", "grey"),
]


def main():
    cat = {}
    try:
        for c in json.load(open(os.path.join(HERE, "catalogue.json"))):
            cat[c["slug"]] = c
    except Exception:
        pass

    out = {}
    for p in sorted(glob.glob(os.path.join(TILES, "*.webp"))):
        if p.endswith("-s.webp"):
            continue
        slug = os.path.basename(p)[:-5]
        m = measure(p)
        src = cat.get(slug) or cat.get(slug.rsplit("__", 1)[0]) or {}
        m["title"] = src.get("title") or slug.replace("-", " ").title()
        m["section"] = src.get("section", "")
        m["source"] = src.get("source", "")
        m["spec"] = src.get("spec") or {}
        out[slug] = m

    if "--check" in sys.argv:
        print(f"{'tile':38}{'tone':7}{'hue':8}{'vein':11}{'lum':>6}{'sat':>6}{'edge':>7}")
        for k, v in sorted(out.items()):
            print(f"{k[:36]:38}{v['tone']:7}{v['hue']:8}{v['vein']:11}"
                  f"{v['lum']:6}{v['sat']:6}{v['edge']:7}")
        print(f"\n{len(out)} tiles measured")
        return
    json.dump(out, open(os.path.join(HERE, "derived.json"), "w"), indent=1, ensure_ascii=False)
    print(f"measured {len(out)} tiles -> derived.json")


if __name__ == "__main__":
    main()

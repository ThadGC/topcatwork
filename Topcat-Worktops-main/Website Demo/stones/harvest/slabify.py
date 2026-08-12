# -*- coding: utf-8 -*-
"""Turn a distributor's slab photograph into a clean studio slab tile.

    python3 slabify.py                 # process everything in raw/ -> ../../assets/slabs/
    python3 slabify.py --report        # write a contact sheet of accepted + rejected
    python3 slabify.py --only carrara  # single slug, for tuning

WHY THIS IS NOT JUST A CROP (client, 9 Aug): "it has to just be the slab and that pattern
without mistakes ... not some sort of low quality background image of the factory ... it looks
like we actually have the slab on the website in perfect quality."

What arrives in raw/ is four different things, and only two of them are usable:
  1. flat slab scans with a NILE watermark bottom-right   <- ideal, but crop the watermark off
  2. yard photos, slabs on A-frames with straps and racks <- the slab face is usable, the yard is not
  3. kitchen lifestyle shots, no slab in frame at all     <- must be REJECTED, not cropped
  4. styled flat-lays with props on the stone             <- crop away from the props, or reject

So the core is not segmentation, it is a SEARCH: slide a window over the picture and keep the
one that most looks like an uninterrupted piece of stone, then refuse to emit anything if the
best window still is not good enough. A stone that fails falls back to the procedural slab the
site already draws, which is always safe. A wrong photo is much worse than a drawn one.

⚠️ Everything is scored on a ~220px analysis copy with summed-area tables, so the search is
   cheap. There is no numpy on this machine, deliberately keep it that way (pure PIL + lists).
"""
import json, os, sys, math, glob
from PIL import Image, ImageOps, ImageChops, ImageFilter, ImageStat, ImageDraw

HERE = os.path.dirname(os.path.abspath(__file__))
RAW = os.path.join(HERE, "raw")
OUT = os.path.abspath(os.path.join(HERE, "..", "..", "assets", "slabs"))

# ⭐ QUALITY FLOOR (client, 9 Aug: "everything has to look 4k perfect quality"). Tiles are never
# upscaled here, so tile size IS source size.
# ⚠️ THIS COMMENT SAID "the floor is now 1000px" AND THAT WAS NEVER TRUE OF THE CODE — the actual
# floor is MIN_SRC_PX, which is 340, graded by SHARP_BANDS (see ~line 480). The 1000 was left
# behind by the marble.com harvest that edited this file mid-session on 9 Aug (D47). Believing it
# is how a reader concludes the range is already sharp when a third of it is under 600px.
TILE = (1600, 1600)     # square master: composes into any card aspect via background-size:cover
THUMB = (800, 800)      # wheel//stones/ grid — 800 covers a 290px card at DPR 2 with room over
QUALITY = 84            # WebP
AN_W = 220              # analysis width

# ⭐ TWO SIZES SHIP, AND THAT IS THE WHOLE ANSWER TO "SHARP BUT FAST" (client, 10 Aug: "everything
# must be extremely clear with no blurriness, but yet everything must all be optimized, do not make
# the site load slowly"). The two demands only conflict if ONE file has to serve both jobs.
#   · slug.webp    up to 1600px  — the stone-page hero (436x558 CSS = 1116 device px at DPR 2)
#   · slug-s.webp  up to  800px  — the wheel card and the /stones/ grid (290x351 CSS = 701 at DPR 2)
# ⚠️ -s.webp was ALREADY being written and NO PAGE EVER ASKED FOR IT — every surface loaded the
# full master, so a 290px wheel card was pulling a 1400px file. Both are now wired through srcset,
# which is why the range can get sharper and lighter in the same pass.
# ⚠️ The thumb is min(THUMB, master) so it can never UPSCALE a small tile into mush; a 500px stone
# ships a 500px thumb and the browser downscales it, which is sharp. The old code resized every
# tile to a flat 700 and was inventing pixels on exactly the stones that could least afford it.
# A full-slab scan is ~3200mm wide. Cropping the same PHYSICAL area from every slab keeps the
# veining at a consistent scale across the range, which is what makes a set of tiles read as a
# collection rather than a pile of stock photos.
# ⚠️ 1900mm, RAISED FROM 1350 (client, 10 Aug: "some of them are very fucking zoomed in and
# terrible"). 1350 of a 3200mm slab is 42% of the slab width — tight enough to read as a macro
# shot of one vein rather than a photograph of a worktop, which is not how anyone chooses stone.
# 59% shows the pattern repeating, which is what a customer is actually judging. The step only
# ever SHRINKS a box, so raising this makes it fire less often and never crops tighter.
SLAB_MM = 3200.0
CROP_MM = 1900.0


# --------------------------------------------------------------------------- analysis
def analysis(im):
    """Downscale once, return (w, h, L, S, Gx, Gy).
    Gx and Gy are kept APART on purpose: a horizontal cabinet line shows up as a whole row of
    large Gy, and that row-vs-median test is what separates a kitchen from a slab (see
    line_veto). Summed together into one magnitude, that signal disappears."""
    w = AN_W
    h = max(8, round(im.height * w / im.width))
    sm = im.resize((w, h), Image.BILINEAR)
    px = list(sm.getdata())
    L = [(3 * r + 6 * g + b) // 10 for (r, g, b) in px]
    S = [(max(p) - min(p)) for p in px]
    Gx = [0] * (w * h)
    Gy = [0] * (w * h)
    for y in range(h):
        for x in range(w):
            i = y * w + x
            if x + 1 < w:
                Gx[i] = abs(L[i] - L[i + 1])
            if y + 1 < h:
                Gy[i] = abs(L[i] - L[i + w])
    return w, h, L, S, Gx, Gy


def integral(v, w, h):
    """Summed-area table, (w+1)*(h+1)."""
    I = [0] * ((w + 1) * (h + 1))
    for y in range(h):
        row = 0
        for x in range(w):
            row += v[y * w + x]
            I[(y + 1) * (w + 1) + x + 1] = I[y * (w + 1) + x + 1] + row
    return I


def box(I, w, x0, y0, x1, y1):
    W = w + 1
    return I[y1 * W + x1] - I[y0 * W + x1] - I[y1 * W + x0] + I[y0 * W + x0]


# --------------------------------------------------------------------------- scoring
def line_veto(g, w, h, x0, y0, x1, y1, axis):
    """Is there a LONG STRAIGHT EDGE crossing this window?

    This is the test that actually separates a slab from a kitchen, and it took a round of
    failures to find. Scoring a window on average smoothness does not work, because the smooth
    white worktop in a lifestyle shot is genuinely as smooth as a slab scan, and the search
    happily returned entire kitchens. What a kitchen always has and a slab never has is
    STRUCTURE THAT RUNS THE WHOLE WAY ACROSS: a worktop nose, a cabinet line, a window reveal,
    an extractor edge, the strap on a yard A-frame.

    So: sum the perpendicular gradient along each row (or column) of the window and compare the
    worst line with the median. Stone veining wanders, so it never lines up on one row; an edge
    does, and stands out by a mile. Returns the ratio — anything past ~3 is built, not quarried.
    """
    lines = []
    if axis == "row":
        for y in range(y0, y1):
            base = y * w
            lines.append(sum(g[base + x] for x in range(x0, x1)) / max(1, x1 - x0))
    else:
        for x in range(x0, x1):
            lines.append(sum(g[y * w + x] for y in range(y0, y1)) / max(1, y1 - y0))
    if len(lines) < 4:
        return 0.0
    s = sorted(lines)
    med = s[len(s) // 2]
    return (s[-1] / med) if med > 0.35 else (s[-1] / 0.35)


def score(stats, x0, y0, x1, y1):
    """How much does this window look like one uninterrupted piece of stone?
    Returns (score, reasons) — score in 0..1, higher is better."""
    w, h, Ii, Is, Ig, Iss, Igg, Ihot, Gx, Gy, typical = stats
    n = (x1 - x0) * (y1 - y0)
    if n <= 0:
        return 0.0, {}
    mL = box(Ii, w, x0, y0, x1, y1) / n
    mS = box(Is, w, x0, y0, x1, y1) / n
    mG = box(Ig, w, x0, y0, x1, y1) / n
    vS = max(0.0, box(Iss, w, x0, y0, x1, y1) / n - mS * mS) ** 0.5
    vG = max(0.0, box(Igg, w, x0, y0, x1, y1) / n - mG * mG) ** 0.5
    hot = box(Ihot, w, x0, y0, x1, y1) / n          # fraction of frankly coloured pixels

    r = {}
    # 1. stone is close to neutral. Wood props, yellow straps, plants, painted units are not.
    r["neutral"] = clamp(1.0 - (mS - 16) / 44.0)
    # 2. NO coloured object may intrude at all. A pair of wooden spoons is only a few percent of
    #    the frame, so this is a share-of-pixels test, not an average — averages hid them.
    r["nocolourblob"] = clamp(1.0 - hot / 0.012)
    # 3. ⭐ REPRESENTATIVE, NOT BLANDEST. This used to reward smoothness outright, and that was
    #    a design fault rather than a tuning one: the blankest patch of any slab is always the
    #    smoothest, so on a statement stone the search reliably picked the one corner with no
    #    veining in it. Calacatta Fantastico came out as a sheet of near-white with a couple of
    #    stray gold threads, which the client rightly called overexposed — it was not blown, it
    #    was EMPTY, p50 235 and p90 238, three levels of spread across the whole tile.
    #    So aim at the slab's OWN typical amount of movement: a window much calmer than the slab
    #    is unrepresentative, and one much busier is usually an edge or an intrusion.
    tgt = typical
    r["soft"] = clamp(1.0 - max(0.0, mG - tgt * 1.9 - 4) / 20.0)
    r["representative"] = clamp(1.0 - abs(mG - tgt) / (tgt * 1.15 + 1.6))
    # 4. a scene has a few very strong edges among calm areas, so its gradient spread is wide
    #    even where the mean is low.
    r["nostructure"] = clamp(1.0 - (vG - 6) / 26.0)
    # 5. it must carry SOME pattern, but only just. Several real products (Fresh Cement, the
    #    plain beiges) are almost featureless by design, and an earlier, stricter version of
    #    this rejected them for being what they are. classify() now catches genuinely empty
    #    sources, so this only has to exclude dead flat areas.
    r["hastexture"] = clamp((mG - 0.25) / 1.6)
    # 6. mid-tone. Crushed blacks and blown whites carry no usable pattern.
    r["exposed"] = clamp(min(mL - 18, 238 - mL) / 26.0)
    # 7. and nothing man-made running across it, in either direction.
    ratio = max(line_veto(Gy, w, h, x0, y0, x1, y1, "row"),
                line_veto(Gx, w, h, x0, y0, x1, y1, "col"))
    r["noedge"] = clamp(1.0 - (ratio - 2.1) / 2.2)

    s = 1.0
    for k, p in (("neutral", 1.0), ("nocolourblob", 2.0), ("soft", 1.0), ("representative", 1.8),
                 ("nostructure", 1.6), ("hastexture", 1.0), ("exposed", 1.0), ("noedge", 2.4)):
        s *= r[k] ** p
    return s ** (1 / 11.8), r


def clamp(v):
    return 0.0 if v < 0 else (1.0 if v > 1 else v)


def classify(im, cropped=False):
    """Is this whole picture a flat slab scan, or a photograph of a place?

    ⚠️ REWRITTEN 9 Aug 2026 AFTER LOOKING AT WHAT IT WAS ACTUALLY THROWING AWAY. The previous
    version tested global luminance range and deep-shadow share, on the strength of a measured
    "complete separation, no overlap" (scans 6..59, kitchens 164..236). That separation does not
    survive the full harvest, and the cost was severe: of the 60 images it rejected as rooms,
    **49 were flat slab scans**, contact-sheeted and checked one by one. Two failures compounded:

      · THE DEEP-SHADOW TEST CANNOT SEE A BLACK STONE. `dark` counts pixels under luminance 40,
        so a polished black granite scores ~100% and was called a kitchen. It took out every
        dark stone in the range at once — Absolute Black Extra (range 12, dark 99.99%), Jet
        Black, Nero Marquina, Marquina, Laurent Black, Angola Black, Azalai Negro, Woodlands,
        Vanilla Noir, Soft Black, Terra Marron. The blackest, flattest, most obviously-a-scan
        images in the set were the ones it was most confident about.

      · RANGE ALONE DOES NOT SEPARATE THEM. Measured across the same 60: the slab scan
        Fusion Wow runs range 239 and the showroom photograph Carrara Satin runs 251. They
        overlap through the whole upper band, so no threshold on range can split them.

    What does separate them, measured over those 60 hand-labelled images:

        per-cell luminance spread (6x6 grid)   scans   0.0 .. 40.8   rooms 23.7 .. 63.1
        whole-image straight-line ratio        scans   0.0 .. 16.9   rooms  3.1 .. 19.8

    Neither alone is enough; together they are. A room is BOTH unevenly lit across the frame
    (wall vs floor vs cabinet vs window) AND full of long straight structure. A slab is at most
    one of the two — a dramatic stone can be uneven, and a leathered finish can ring the line
    test, but a slab is never both at once.

    ⚠️ THE THRESHOLDS ARE DELIBERATELY LOOSE, and rounder than the best fit. An exhaustive
    search over the 60 finds a rule that catches all 11 rooms and loses only 2 scans, but at
    60 samples and 3 free parameters that is a fitted rule, not a measured one. These numbers
    sit clear of the fitted optimum on the permissive side, because THE TWO ERRORS ARE NOT
    EQUAL: a room that leaks through is visible on the contact sheet and gets pulled by hand,
    while a scan that is wrongly cut is lost in silence and the stone quietly keeps its drawn
    slab. Leak toward keeping. The eye is the last gate here, not this function.
    """
    w, h, L, S, Gx, Gy = analysis(im)
    n = len(L)
    sl = sorted(L)
    rng = sl[int(n * 0.98)] - sl[int(n * 0.02)]
    dark = sum(1 for v in L if v < 40) / n
    blown = sum(1 for v in L if v > 246) / n

    # How unevenly is the frame lit? Mean luminance per cell of a 6x6 grid, then its spread.
    # One material under one light lands tight; a room spreads wide.
    cells = []
    for cy in range(6):
        ys, ye = cy * h // 6, max(cy * h // 6 + 1, (cy + 1) * h // 6)
        for cx in range(6):
            xs, xe = cx * w // 6, max(cx * w // 6 + 1, (cx + 1) * w // 6)
            vals = [L[y * w + x] for y in range(ys, ye) for x in range(xs, xe)]
            if vals:
                cells.append(sum(vals) / len(vals))
    mean = sum(cells) / len(cells)
    lumsd = (sum((c - mean) ** 2 for c in cells) / len(cells)) ** 0.5

    # Long straight structure anywhere in the frame: a worktop nose, a cabinet line, a window
    # reveal. Stone veining wanders and never lines up on one row. See line_veto.
    line = max(line_veto(Gy, w, h, 0, 0, w, h, "row"),
               line_veto(Gx, w, h, 0, 0, w, h, "col"))

    ev = dict(range=rng, dark=round(dark * 100, 2), lumsd=round(lumsd, 1), line=round(line, 2))
    if lumsd >= 40 or (line >= 4.5 and lumsd >= 24):
        return "scene", ev
    if blown > 0.40:
        # e.g. Bianco Shimmer arrives 89% clipped: a white slab shot with no detail left in it.
        # Nothing to recover, and an all-white tile would look like a loading failure.
        return "blown", dict(blown=round(blown * 100, 1))
    return "scan", ev


def find_slab_box(im):
    """Find the slab in a stock photograph of one slab standing on a stand.

    ⭐ This is what unlocked the natural stone. Nile's stock system photographs every slab the
    same way — stood square-on against the warehouse, filling most of the frame, lit flat. The
    slab face in those is excellent material; the warehouse around it is not, and classify()
    rejects the whole picture because floor and roof lights blow the luminance range wide open.

    Because the framing is consistent, the slab does not need to be *segmented*, only *grown*:
    sample the middle of the picture, which is always stone, then walk each edge outward while
    the next row or column still looks like that same material. Stop at the warehouse. Inset a
    little to clear the sawn edge, the corner labels and the stand.

    ⚠️ Only ever called for the stock source, never as a general heuristic. Applied blind it
    would happily "find a slab" in the middle of a kitchen photograph, which is the exact
    mistake classify() exists to prevent.
    """
    w, h, L, S, Gx, Gy = analysis(im)
    cx0, cx1, cy0, cy1 = int(w * .42), int(w * .58), int(h * .42), int(h * .58)
    core = [L[y * w + x] for y in range(cy0, cy1) for x in range(cx0, cx1)]
    if not core:
        return None
    mu = sum(core) / len(core)
    sd = (sum((v - mu) ** 2 for v in core) / len(core)) ** 0.5
    # ⚠️ The 70 cap here used to stop a dramatic stone from ever growing to its own edges. A
    # stone whose own light-to-dark swing is wider than the tolerance fails its own likeness
    # test, so the walk halts inside the slab and returns a thin band of it: Colombo Juparana
    # came out 1214x398 from a 1600x957 photograph, Nero Marquina 1292x605 from 2016x1512.
    # Both are strongly patterned, which is the whole reason a customer wants them.
    tol = max(26.0, min(92.0, 3.2 * sd))

    def like_row(y, x0, x1):
        n = x1 - x0
        return sum(1 for x in range(x0, x1) if abs(L[y * w + x] - mu) < tol) / max(1, n)

    def like_col(x, y0, y1):
        n = y1 - y0
        return sum(1 for y in range(y0, y1) if abs(L[y * w + x] - mu) < tol) / max(1, n)

    # ⚠️ And the walk now steps over a couple of unlike rows instead of stopping at the first.
    # A dark vein band crossing the slab reads as "not the core material" for a few rows and
    # then the stone resumes; a greedy walk treats that vein as the edge of the slab and quits.
    # The warehouse, when it really arrives, does not relent after two rows.
    def walk(like, pos, lo, hi, step, run=2):
        best, bad = pos, 0
        while lo <= pos + step <= hi:
            probe = pos - 1 if step < 0 else pos
            if like(probe) >= 0.72:
                pos += step
                best, bad = pos, 0
            else:
                bad += 1
                if bad > run:
                    break
                pos += step
        return best

    top, bot, left, right = cy0, cy1, cx0, cx1
    top = walk(lambda y: like_row(y, left, right), top, 0, h - 1, -1)
    bot = walk(lambda y: like_row(y, left, right), bot, 0, h - 1, 1)
    left = walk(lambda x: like_col(x, top, bot), left, 0, w - 1, -1)
    right = walk(lambda x: like_col(x, top, bot), right, 0, w - 1, 1)

    bw, bh = right - left, bot - top
    if bw < w * 0.22 or bh < h * 0.22:
        return None                                    # never found a slab worth the name
    # inset: the sawn edge, the stock labels in the top corners and the stand at the foot
    ix, iy = int(bw * 0.07) + 1, int(bh * 0.07) + 1
    left, right, top, bot = left + ix, right - ix, top + iy, bot - iy
    if right - left < 8 or bot - top < 8:
        return None
    sx, sy = im.width / w, im.height / h
    return int(left * sx), int(top * sy), int(right * sx), int(bot * sy)


def find_window(im, fenced=True):
    """Search for the best square-ish stone window. Returns (box_in_full_res, score, reasons).

    `fenced` walls off the bottom-right corner where Nile stamp their logo. ⭐ IT IS NOT FREE AND
    IT IS NOT UNIVERSAL — see the fence block below."""
    w, h, L, S, Gx, Gy = analysis(im)
    G = [Gx[i] + Gy[i] for i in range(w * h)]
    typical = sum(G) / max(1, len(G))       # how much movement THIS slab actually has
    stats = (w, h, integral(L, w, h), integral(S, w, h), integral(G, w, h),
             integral([v * v for v in S], w, h), integral([v * v for v in G], w, h),
             integral([1 if v > 52 else 0 for v in S], w, h), Gx, Gy, typical)

    # Nile stamp their logo bottom-right on the clean scans. Fence off that corner so a
    # window can never include it — cheaper and safer than trying to paint it out.
    #
    # ⭐ ONLY WHERE THERE IS ACTUALLY A LOGO (client, 10 Aug: "most of the pictures in the granite
    # section are blurry"). This fence was applied to EVERY source, and it was the single biggest
    # cause of soft tiles in the range — bigger than the picker, bigger than the floor.
    #
    # The arithmetic: the veto kills any window whose box reaches past 0.80w AND 0.74h. On a 4:3
    # photograph a window of side 0.86*min already spills past both, so EVERY frac above 0.74 is
    # unreachable and the crop is capped at ~0.74 of the short edge no matter how large the
    # original is. That is how Arabescato Elegance shipped a 688px tile cut out of a 4570px
    # photograph, and Concrete Earth 760px out of 4500px.
    #
    # Checked by eye against the corners of all three suppliers: nile stamp "NILE Quartz
    # Surfaces" bottom-right, nile-inv (their stock system) and next do NOT stamp anything.
    # Fencing the two unstamped suppliers bought nothing and cost most of their resolution.
    # ⚠️ Keep this keyed on the SOURCE FOLDER, not on a guess about the picture. If nile-inv ever
    # starts watermarking, add it here — do not try to detect a logo from pixels, because a false
    # negative ships a supplier's brand on the client's website.
    if fenced:
        fence_x0, fence_y0 = int(w * 0.80), int(h * 0.74)
    else:
        fence_x0, fence_y0 = w + 1, h + 1     # unreachable: nothing is ever vetoed

    best = (0.0, None, {})
    # ⚠️ STAY BIG. A smaller window is always smoother, so a mild size preference loses: the
    # search kept returning tiny patches, which then got enlarged to 1024px and showed veining
    # at three or four times life size — the pattern stopped looking like the slab the customer
    # would actually get. The floor is 0.62 of the short edge and the preference is steep.
    for frac in (0.96, 0.86, 0.74, 0.62):
        side = int(min(w, h) * frac)
        if side < 12:
            continue
        step = max(2, side // 8)
        for y0 in range(0, h - side + 1, step):
            for x0 in range(0, w - side + 1, step):
                x1, y1 = x0 + side, y0 + side
                if x1 > fence_x0 and y1 > fence_y0:
                    continue
                s, r = score(stats, x0, y0, x1, y1)
                s *= 0.55 + 0.45 * frac          # steep: a small window must be far cleaner to win
                if s > best[0]:
                    best = (s, (x0, y0, x1, y1), r)

    if not best[1]:
        return None, 0.0, {}, None
    sx, sy = im.width / w, im.height / h
    x0, y0, x1, y1 = best[1]
    return ((int(x0 * sx), int(y0 * sy), int(x1 * sx), int(y1 * sy)), best[0], best[2],
            (stats, sx, sy))


def rescore(bundle, boxpx):
    """Score an arbitrary full-resolution box against an already-computed analysis.

    ⚠️ EXISTS BECAUSE OF A REAL BUG. The physical-scale step re-centres and resizes the winning
    window so every slab is cropped to the same number of millimetres, and it used to do that
    AFTER scoring and never look again. On Baltic Brown the search had correctly found a window
    that dodged the green racking poles; re-centring pulled them straight back in and a tile
    shipped with warehouse scaffolding down both sides. Whatever box is finally cut has to be
    the box that was judged."""
    stats, sx, sy = bundle
    w, h = stats[0], stats[1]
    x0, y0, x1, y1 = boxpx
    a = (max(0, int(x0 / sx)), max(0, int(y0 / sy)),
         min(w, int(x1 / sx)), min(h, int(y1 / sy)))
    if a[2] - a[0] < 4 or a[3] - a[1] < 4:
        return 0.0, {}
    return score(stats, *a)


# --------------------------------------------------------------------------- studio look
def studio(im):
    """Make it read as a lit, flat, evenly-scanned slab rather than a photograph of one.

    ⚠️ EVERYTHING HERE IS DELIBERATELY HUE-PRESERVING, and that is the whole lesson of the
    first attempt. Flat-fielding each RGB channel on its own turned Almond Beige olive and
    mottled Calacatta Classic pink and green, because each channel got a different correction
    and the difference between them IS the colour. Worse, a white-patch white balance is
    actively wrong for this job: the stone's colour is the product. Neutralising a warm cream
    quartz to grey does not fix a cast, it sells the wrong worktop.

    So the lighting is corrected as a single luminance offset applied equally to R, G and B,
    and there is no white balance step at all.

    ⛔ AND IT IS DELIBERATELY LIGHT-HANDED, which is the second lesson. The first version ran
    ImageOps.autocontrast over these tiles. On a slab scan whose whole natural range is about
    20 levels wide, stretching that to 0..255 is a twelve-fold contrast gain: Almond Beige came
    out orange, Calacatta Classic came out mottled teal and pink, every soft gold vein turned to
    rust. Once classify() started rejecting the phone photos, the only sources left were already
    properly exposed studio scans — so the correct amount of grading is nearly none. Crop it
    well, keep the colour honest, put back the bite that downscaling costs, and stop.
    """
    # 1. FLAT-FIELD, ON LUMINANCE ONLY, AND ONLY A THIRD OF THE WAY. Levels out any residual
    #    vignette or lighting fall-off. The same per-pixel offset goes to R, G and B, so
    #    brightness evens out and hue cannot move. Radius stays large or it eats real veining,
    #    which on a Calacatta is genuinely a low-frequency feature.
    rad = max(12, im.width // 4)
    field = im.convert("L").filter(ImageFilter.GaussianBlur(rad))
    mean = ImageStat.Stat(field).mean[0]
    offset = field.point(lambda v, m=mean: max(0, min(255, int(128 + (m - v) * 0.34))))
    im = Image.merge("RGB", [ImageChops.add(ch, offset, scale=1, offset=-128)
                             for ch in im.split()])

    # 2. BOUNDED contrast lift — never a stretch to full range. Aim to widen the p1..p99 spread
    #    towards a comfortable 150 levels, but cap the gain at 1.18 so a naturally flat stone
    #    stays flat and a naturally contrasty one is left alone.
    d = sorted(im.convert("L").getdata())
    lo, hi = d[int(len(d) * 0.01)], d[int(len(d) * 0.99)]
    span = max(1, hi - lo)
    gain = min(1.18, max(1.0, 150.0 / span))
    if gain > 1.005:
        mid = (lo + hi) / 2.0
        lut = [max(0, min(255, int((v - mid) * gain + mid))) for v in range(256)]
        im = Image.merge("RGB", [ch.point(lut) for ch in im.split()])

    # 3. denoise then sharpen. Order matters: sharpening first would amplify sensor grain into
    #    something that looks like a bad quartz speckle. The unsharp is mostly there to give
    #    back the crispness that LANCZOS-ing a 6000px original down to 1024 takes away.
    im = im.filter(ImageFilter.MedianFilter(3))
    im = im.filter(ImageFilter.UnsharpMask(radius=1.6, percent=42, threshold=3))
    return im


# --------------------------------------------------------------------------- driver
ACCEPT = 0.62          # below this we do not trust the crop and fall back to the drawn slab
# ⚠️ MEASURED, not chosen. Next Stone Slabs publish their slab shots at about 509px on the short
# side, so a window taking 62-96% of that lands around 320-490px. A 520px floor threw away 34 of
# their 35 stones for the crime of being a small original. Since tiles are never upscaled, a
# smaller source simply yields a smaller (still sharp) tile, and the cards render at ~200-260px
# anyway — so the floor only has to stop tiles that would be soft at card size.
# ⚠️ 440, MEASURED IN THE BROWSER AGAINST THE ACTUAL CARD, and lowered from 700 on evidence.
#
# The wheel card is the largest place a tile is ever shown. Measured at a 1600px viewport it is
# 290x351 CSS px, so 581x701 device pixels on a retina screen. `object-fit:cover` on a square
# tile in a portrait box scales by the LONG side, so 701 is the number a tile has to hit to be
# pixel-perfect at DPR 2 — which is where the old 700 came from, and it is a fair number.
#
# But it was throwing away most of the range to buy that last bit of crispness. Next Stone Slabs
# publish their originals at about 509px on the short side and there is no larger version behind
# them (checked: the harvester is already reading the un-suffixed WordPress original). At a 700
# floor their whole catalogue is unreachable, and 24 of the client's 52 stones kept a drawing.
#
# So the two assumptions behind the floor were tested rather than argued:
#
#   · DOES A SUB-700 TILE ACTUALLY LOOK BAD? Tiles were generated at 432-648px and composited
#     at exactly 581x701, the way the browser will show them, and looked at 1:1. They are clean.
#     Slightly soft against a 1400px tile if you pixel-peep, and far better than the drawn slab
#     the client has twice rejected as an "AI slab look".
#   · ARE SMALL SOURCES SOFT SOURCES? No, and this was the real surprise. Blur-response measured
#     across every publishable candidate, by size band:
#         380-500px  n=68  median 3.8      700-900px   n=32  median 5.3
#         500-600px  n=42  median 4.6      900-4000px  n=55  median 4.7
#     A small original here is a small scan of a sharp photograph, not a blurry one. Pixel count
#     was standing in for softness, and softness is already tested directly, so test it directly.
#
# 440 caps the upscale at 1.6x to fill the retina card. The Baltic Brown failure that prompted
# the original floor was a ~3x blowup of an angled rack shot, which this still refuses.
MIN_SRC_PX = 340
MIN_SHARP = 1.55       # blur-response ratio; see _sharpness
# ⭐ THE FURTHER A TILE HAS TO STRETCH, THE CRISPER ITS SOURCE MUST BE. One flat floor cannot
# express that, and every argument about where to put it was really an argument about softness.
# So the bar rises as the source shrinks, and the two are decided together:
#
#     >= 700px   1.55   fills the retina card exactly; only genuine blur is refused
#     440-700    1.80   mild stretch, up to 1.6x
#     340-440    4.00   up to 2x, so only a conspicuously crisp original may be used
#
# ⚠️ 1.80 rather than the 2.0 the size bands alone suggested: blur-response cannot separate
# "plain" from "soft" on a stone with no texture — the very case _sharpness exists for — and
# Absolute Black Extra, whose centre crop is visibly crisp, reads 1.87.
# ⚠️ 4.00 is deliberately far above any of them, and it is what makes a 340px floor safe. The
# stones it lets through measure 5.1 and 6.3; the ones it stops measure 1.2 (Crema Evora, whose
# source carries lighting reflections) and 2.9. Nothing lands near the line.
SHARP_BANDS = ((700, 1.55), (440, 1.80), (0, 4.00))
# The physical-scale re-frame may shrink a crop, but never past this — see the guard in
# process(). It is the top of the strict sharpness band, so re-framing can never move a tile
# into a bar it was not judged against.
SCALE_MIN_PX = 440


def sharp_floor(side):
    return next(v for lo, v in SHARP_BANDS if side >= lo)

# Sources whose photography may actually be PUBLISHED. See LICENSING.md and the gate in main().
PUBLISHABLE = {"nile", "nile-inv", "next"}

# ⭐ DUPLICATE GUARD state — see the block in main(). Maps a perceptual hash of the finished crop
# to the stem that claimed it first, so a second stone cannot ship the same photograph.
_SEEN_HASH = {}


def phash(crop, s=10):
    """Perceptual (difference) hash of a FINISHED CROP.

    ⚠️ Hashed on the crop, never on the source file. The supplier publishes the same photograph
    under two product names as two separate files with different bytes, so a checksum of the file
    sees nothing — Almond Beige and Calacatta Gold Soft came from almond-beige.jpg and
    calacatta-gold-soft.jpg and were pixel-identical once cropped. Only the output tells the truth.
    ⛔ And it must be computed INSIDE process(), where the real crop exists — it cannot be rebuilt
    from rec["box"], for the coordinate-space reason in the process() docstring.
    Quantised to a 10x10 gradient so a re-encode or a little crop drift still collides."""
    g = crop.convert("L").resize((s + 1, s), Image.LANCZOS)
    px = list(g.getdata())
    bits = 0
    for y in range(s):
        for x in range(s):
            bits = (bits << 1) | (1 if px[y * (s + 1) + x] < px[y * (s + 1) + x + 1] else 0)
    return bits

# ⭐ Sources that stamp a logo bottom-right, and therefore the ONLY ones whose corner is fenced
# off during the window search. Confirmed by eye against each supplier's corners on 10 Aug: nile
# stamp "NILE Quartz Surfaces"; nile-inv (their stock system) and next stamp nothing. Fencing all
# three capped every crop at ~0.74 of the short edge and was the biggest single cause of soft
# tiles — see the fence block in find_window().
WATERMARKED = {"nile"}

# --------------------------------------------------------------------------- pinned crops
# ⭐ HUMAN-VERIFIED OVERRIDES, and deliberately a very short list.
#
# Every tile that ships was contact-sheeted next to the name it would ship under and looked at.
# Two came back with warehouse furniture in them that no measure here can see, because the thing
# that gives them away is knowing what a slab is rather than how its pixels are distributed:
#
#   · bianco-eclypsia-calacatta  the chosen frame is the sharpest and largest, and has a pale
#     timber A-frame post down its right edge. It is almost exactly the colour of the marble, so
#     line_veto reads it at 2.10 (nothing) and an edge-band colour test ranks it BELOW Fusion
#     Black, whose bright band is the actual stone. A cleaner frame of the same slab exists.
#   · cristallo  every frame is the same yard shot, sky visible above the slab. The stone itself
#     is excellent; the top of the picture is not part of it.
#
# `file` picks the frame. `crop` is (left, top, right, bottom) as fractions, applied before the
# window search, to cut warehouse out of a frame that is otherwise the best one there is.
#
# ⛔ A PIN BYPASSES THE SHARPNESS GATE, and that is the whole point of it: blur-response cannot
# tell "plain" from "soft", so a genuinely featureless stone scores like a blurry one and there
# is no threshold that admits Crema Evora without also admitting real mush. A person has looked
# at each of these at full retina card size and signed it off. Resolution and exposure still
# apply — a pin is a judgement about focus, not a licence to upscale.
PINS = {
    "bianco-eclypsia-calacatta": dict(
        file="bianco-eclypsia-calacatta__2.jpg",
        why="the sharpest frame has a pale timber A-frame post down its right edge, almost "
            "exactly the colour of the marble; this frame is the same slab, clean."),
    "cristallo": dict(
        file="cristallo.jpg", crop=(0, 0.30, 1, 1),
        why="a yard shot with sky above the slab. The stone is excellent, the sky is not."),
    "calacatta-vagli-oro-honed": dict(
        file="calacatta-vagli-oro-honed.jpg", crop=(0, 0.06, 0.82, 1),
        why="the only frame of this stone. A doorway and machinery sit in the right fifth and a "
            "stock label at the very top; the remaining 458px square is clean Calacatta Vagli."),
    # ⛔ SAME NAME, TWO SUPPLIERS, TWO DIFFERENT PRODUCTS. Both Nile and Next sell a "Carrara
    # Shimmer" and an "Arabescato Gold", and slabify groups candidates by NAME, so the frames of
    # both makers' products were competing to be one tile — and in each case the wrong maker's
    # won. Engineered quartz is a manufactured product: the name belongs to the brand, so the
    # photograph must come from the supplier the catalogue says TopCat buy it from.
    "carrara-shimmer": dict(
        file="nile/carrara-shimmer.jpg",
        why="TopCat buy Carrara Shimmer from NILE. Next publish their own Carrara Shimmer and "
            "its frame was winning the group. Nile's own scan reads 64.5% clipped for being a "
            "white product on white; the grey grain is there."),
    "arabescato-gold": dict(
        file="next/arabescato-gold.jpg",
        why="TopCat buy Arabescato Gold from NEXT. Nile publish an Arabescato Gold too and its "
            "1400px frame was winning on size — a different manufacturer's product."),
    "carrara": dict(
        file="carrara__6.png",
        why="Nile's QUARTZ Carrara, which is the pattern Carrara Jumbo is cut from — jumbo is "
            "the slab format, not a different stone. Reads 71.6% clipped for being a white "
            "product on white, and the grey veining is plainly there. This frame is chosen over "
            "the larger carrara__7.jpg because that one carries Nile's logo in the corner. "
            "⚠️ The catalogue's natural marble Carrara is a DIFFERENT stone and takes the "
            "nile-inv carrara-honed tile."),
    # ⛔ THREE CROPS THAT REACHED A CONTACT SHEET WITH THE WAREHOUSE STILL IN THEM (10 Aug).
    # All three are nile-inv yard shots where the slab does not fill the frame, and all three
    # passed `classify` as a scan because the stone itself is the dominant texture. The clean
    # stone IS there in each — it just is not where the window search stopped — so these crop to
    # it by hand rather than losing three marbles from the range.
    # ⚠️ This is the same class of failure as Cristallo's sky and Calacatta Vagli Oro's doorway.
    # The scene gate is a filter, not a guarantee: **a contact sheet of every shipping tile is
    # still the only check that catches this**, and it is not optional.
    # ⛔ FIVE MORE FOUND BY REVIEWING ALL 117 AT 330px ON 10 Aug. Every one is a nile-inv yard
    # shot with rack hardware across the slab — support bars, lifting straps, a stock label.
    # ⚠️ NONE of these were visible on the 215px sheet used earlier. Review at 330px minimum.
    "artic-cream": dict(
        file="artic-cream.jpg", crop=(0.42, 0.10, 0.82, 0.70),
        why="two diagonal SUPPORT BARS cross the slab in an X. The right-of-centre panel between "
            "them is clean."),
    # ⛔ NOT BLOWN HIGHLIGHTS IN THE STONE — SUNLIGHT ON AN INSTALLED WORKTOP. Every flat frame
    # Next publish of this stone is a photograph of a fitted countertop with window light falling
    # across it in diagonal bands, and the fourth frame is a whole-kitchen shot. There is no
    # studio scan. The old tile took the light bands with it and the client saw them.
    # ⚠️ The window below was chosen by measuring, not by eye: a search over three frames for the
    # square with the smallest large-scale brightness sweep. It lands at 22 levels across the
    # window with 0.00% clipping, against 29 and visible streaking for the widest crop. ⭐ 460px
    # is deliberately SMALLER than the 500px the same search found elsewhere in the frame —
    # resolution was traded for even lighting, which is the same call Patagonia's pin makes.
    # ⚠️ Keyed on `arabescato-classico`, NOT the `-ft` stem. The catalogue row still says
    # tile='arabescato-classico-ft', but match.py rewrote the manifest to the plain stem and the
    # MANIFEST is what ships. Pin the stem the manifest names, or the pin silently does nothing.
    "arabescato-classico": dict(
        file="arabescato-classico.jpg", crop=(0.137, 0.079, 0.586, 0.984),
        why="sunlight bands across every frame of this stone; this window is the evenest square "
            "in any of them. ⚠️ A better frame from the supplier is the real fix."),
    "calacatta-viola": dict(
        file="calacatta-viola.jpg", crop=(0.05, 0.25, 0.95, 0.84),
        why="⚠️ RE-PINNED 10 Aug, AND MOVED TO A DIFFERENT FRAME. It was calacatta-viola__2.jpg "
            "windowed to 0.16-0.48, which still clipped one of that frame's two lifting STRAPS: "
            "it shipped as a thin green band down the edge of the tile and the client spotted "
            "it. Narrowing the window there is a trap — the straps run diagonally, so their "
            "innermost point is at the TOP, and a band that is clear at the bottom is not clear "
            "at the top; the widest clean window in that frame is only 512px. "
            "⭐ THIS frame has no straps across the face at all, only an orange lifting clamp "
            "in the top fifth, so cropping below it leaves a clean 1440x708 of pure stone and a "
            "708px square window — nearly double the 368px the old pin could reach. "
            "⚠️ Distinct from calacatta-viola-honed, which is a different frame with its own pin."),
    "mystic-grey": dict(
        file="mystic-grey.jpg", crop=(0.20, 0.34, 0.80, 0.92),
        why="STRAPS cross both upper corners as straight diagonals. The lower middle is clean. "
            "⚠️ Mystic Grey Leather was REMOVED from the range — same photograph, see above."),
    "dolce-vita": dict(
        file="dolce-vita.jpg", crop=(0.08, 0.16, 0.60, 0.88),
        why="an orange STOCK LABEL sits on the top edge right of centre, and the floor shows "
            "below the slab. The left of the slab is clean."),
    "verde-alpi": dict(
        file="verde-alpi__2.jpg", crop=(0.18, 0.16, 0.68, 0.74),
        why="a dark polished green slab standing on TIMBER BEARERS in a lit warehouse — the "
            "bearers show along the bottom and the room reflects in the polish. The upper middle "
            "of the face is the cleanest read of the stone."),
    "aqua-gucci": dict(
        file="aqua-gucci__10.jpg", crop=(0.06, 0.30, 0.94, 0.96),
        why="STRIP LIGHTS reflect off the polished face as three hard white bars across the top "
            "quarter. Client: 'has three fucking white lines going right through it.' The lower "
            "two thirds is clean quartzite."),
    "patagonia-extra": dict(
        file="patagonia-extra.jpg", crop=(0.16, 0.06, 0.84, 0.82),
        why="two yellow LIFTING STRAPS run diagonally across the slab and meet at blue clamps "
            "along the bottom edge. ⚠️ WIDE ON PURPOSE. Patagonia genuinely is a shard-like "
            "quartzite — the big angular white shapes ARE the stone, not damage — but a tight "
            "crop lands inside ONE shard and reads as a single crack across the tile (client: "
            "'looks like just one giant crack'). It only looks like Patagonia when several "
            "shards and the dark seams between them are in frame, so this crop stays wide even "
            "though it costs resolution."),
    "calacatta-gold-oro-honed": dict(
        file="calacatta-gold-oro-honed.jpg", crop=(0.02, 0.08, 0.58, 0.90),
        why="an ORANGE STOCK BLOCK casting a shadow sits on the top edge and a painted blue '25' "
            "fills the top right. Client: 'has this weird brick thing in the top with a shadow.' "
            "The left of the slab is clean. ⚠️ The source is only 1290x697 so the crop is small "
            "and MUST be super-resolved — it is the 'and the picture is blurry' half of the same "
            "complaint. ⚠️ Also still HONED while the catalogue sells this polished (open item)."),
    # ⛔ THREE MORE THE CLIENT CAUGHT ON THE LIVE SITE, 10 Aug — all nile-inv yard shots where the
    # slab does not fill the frame. ⚠️ These are the ones a 215px contact sheet CANNOT catch, and
    # that is the lesson: review the range at card size or larger, never at thumbnail size.
    "arabescato-corchia-extra-honed": dict(
        file="arabescato-corchia-extra-honed.jpg", crop=(0.38, 0.14, 0.68, 0.80),
        why="an ORANGE FORKLIFT stands against the slab at roughly a third across, near the top. "
            "Client: 'what the fuck is that orange thing in the top corner?' The right-of-centre "
            "third of the slab is clean and is what ships."),
    "calacatta-viola-honed": dict(
        file="calacatta-viola-honed.jpg", crop=(0.14, 0.16, 0.90, 0.78),
        why="the slab leans against a rack and the window ran off its TOP EDGE, so the tile "
            "showed the warehouse behind it. Client: 'look at the top part, it's just cut off, "
            "you can see the back of the image.' Pulled inside the slab on all four sides. "
            "⚠️ Only one frame of this stone exists, so a crop is the only available fix."),
    # ⛔ "mystic-grey-leather" PIN REMOVED 10 Aug, and the STONE removed from the range with it.
    # Nile photographed this slab ONCE and published it under both Mystic Grey and Mystic Grey
    # Leather. Cropping the two differently only disguised it — the finished tiles still measured
    # 2 bits apart on a 100-bit perceptual hash. A finish variant earns a place in the range only
    # if the supplier photographed it SEPARATELY; otherwise it is the same picture under a second
    # name, which is what the client objected to. Same call as Dolce Vita Leather.
    "fusion-wow-multicolour": dict(
        file="fusion-wow-multicolour.jpg", crop=(0, 0.34, 0.88, 1),
        why="the top third is a BUILDING — red shutter doors, a rendered wall and a rack post "
            "down the right. The bottom two thirds is clean Fusion Wow and is what ships."),
    "arabescato-corchia-extra": dict(
        file="arabescato-corchia-extra__2.jpg", crop=(0.26, 0, 0.78, 1),
        why="a dark diagonal RACK POLE. ⚠️ Cropping the LEFT off only moved the window right onto a SECOND pole — take the middle band, not one side. On a white marble a straight "
            "dark line reads as a crack in the slab, which is the worst thing it could imply."),
    "dover-white": dict(
        file="dover-white__10.jpg", crop=(0.24, 0, 0.92, 1),
        why="a thin pole. ⚠️ Same trap as Arabescato Corchia: trimming one edge moved the window onto the pole at the other. Middle band only. A straight "
            "line on a white stone reads as a fault."),
    "crema-evora": dict(
        file="crema-evora.jpeg",
        why="a plain cream with almost no movement, which is the product. It reads 1.2 on "
            "blur-response for having nothing to lose, not for being out of focus — checked at "
            "full card size. ⚠️ Next Stone's is the QUARTZ; the nile-inv 'Crema Evora Polished' "
            "is a natural MARBLE of the same name and must never be used for this stone."),
}


def _sharpness(im):
    """Is this crop actually IN FOCUS? Returns a blur-response ratio, not an edge count.

    ⚠️ The obvious measure — how much fine detail is present — is wrong for this job, and
    rejected Absolute Black Honed and Andromeda White on the first try. A polished black granite
    genuinely has almost no texture; that is the product, not a fault in the photograph. Raw
    detail energy cannot tell "plain and sharp" from "busy and blurry".

    So measure the RESPONSE TO BLUR instead: blur the crop slightly and see how much detail that
    destroys. A sharp image loses a lot (ratio well above 1), because it had fine detail to lose.
    An already-soft image barely changes (ratio near 1), whatever its subject. Plain stone and
    busy stone both pass so long as they are in focus, which is the actual question.
    """
    g = im.convert("L").resize((256, 256), Image.BILINEAR)
    soft = g.filter(ImageFilter.GaussianBlur(1.2))
    a, b = list(g.getdata()), list(soft.getdata())

    def energy(px):
        t = 0
        for y in range(1, 255):
            r = y * 256
            for x in range(1, 255):
                i = r + x
                t += abs(4 * px[i] - px[i - 1] - px[i + 1] - px[i - 256] - px[i + 256])
        return t / (254 * 254)

    e_soft = energy(b)
    return (energy(a) / e_soft) if e_soft > 0.02 else 0.0




def overexposed(im):
    """Is this crop mostly featureless highlight? Returns (bad, detail).

    ⚠️ THE THIRD ATTEMPT AT THIS, because the first two measured the wrong thing. Neither the
    mean brightness nor the clipped-pixel count catches it: Calacatta Fantastico and Borghini
    Royal both came out as sheets of near-white with a few gold threads, and BOTH measured 0%
    clipped. Nothing was at 255. The problem is not clipping, it is that most of the tile sits
    in a narrow band at the top of the range with no tonal variation in it — paper, with some
    veining drawn on.

    So measure the share of the picture that carries no detail: pixels sitting within a few
    levels of the tile's own highlight, in a neighbourhood that is equally flat. A real slab has
    grain everywhere, even in its palest areas. A blown one has whole regions of nothing.
    """
    g = im.convert("L").resize((160, 160), Image.BILINEAR)
    px = list(g.getdata())
    d = sorted(px)
    n = len(d)
    hi = d[int(n * 0.98)]
    med = d[n // 2]
    spread = d[int(n * 0.9)] - d[int(n * 0.1)]

    flat = 0
    for y in range(1, 159):
        r = y * 160
        for x in range(1, 159):
            i = r + x
            if px[i] >= hi - 7:
                lap = abs(4 * px[i] - px[i - 1] - px[i + 1] - px[i - 160] - px[i + 160])
                if lap <= 2:
                    flat += 1
    share = flat / (158 * 158)
    detail = dict(blank=round(share * 100, 1), med=med, spread=spread, hi=hi)
    # ⚠️ RELAXED HARD, 9 Aug 2026, after contact-sheeting all 49 images this rejected. Only ONE
    # was actually blown. The other 48 were correctly-exposed scans of stone that is genuinely
    # plain: Absolute Black (blank 51.9%, median 30), Crema Evora (70.7%, median 223), Andromeda
    # White, Calacatta Oro, Borghini Royal, London Grey, the whole Concrete Look range. It was
    # the same mistake `_sharpness` documents two functions down — "a polished black granite
    # genuinely has almost no texture; that is the product, not a fault in the photograph" —
    # and it was condemning pale and plain stones for being pale and plain.
    #
    # Two things were wrong. `hi` is the tile's OWN 98th percentile, so on a dark stone the
    # "highlight" it measures is not a highlight at all: Absolute Black scored 51.9% blank at a
    # median of 30. And the med>=228/spread<=26 clause fires on any pale quartz with a fine even
    # grain, which is a whole product category rather than a fault.
    #
    # So the test is now what the name always claimed: is the picture actually BLOWN OUT. That
    # needs the flat region to genuinely be at the top of the scale, not merely at the top of
    # this picture's range. Across those 49 the brightest legitimate scan sat at median 240 with
    # a spread of 19, so 246/8 clears every one of them and still refuses a white slab shot with
    # the detail burnt off. classify()'s clipping test (>40% of pixels over 246) remains the
    # other half of this, and it is the one that catches the truly hopeless sources.
    bad = (med >= 246 and spread <= 8) or (share > 0.55 and hi >= 250 and spread <= 10)
    return bad, detail


def trim_edges(im):
    """Shave any border band that is not made of the same stone as the middle.

    ⚠️ ADDED AFTER A REAL MISS (client, 9 Aug: "this looks like a cropped image"). The
    Arabescato Elegance tile shipped with a pale strip of warehouse wall along its top edge.
    Nothing already in the pipeline caught it: the band is low-contrast, so it barely moves the
    luminance range, it carries no hard line for line_veto to find, and it is not coloured, so
    the colour-blob test ignored it. But it measured +10 luminance against the core across the
    top twelve rows, and to the eye it instantly reads as a photograph with a wall in it.

    So test the edges directly. Walk in from each side while the outermost row or column sits
    clear of the core's own natural variation, and cut it off. Stone varies, so the threshold is
    a multiple of the slab's own row-to-row spread rather than a fixed number, which keeps a
    genuinely dramatic slab from trimming itself away.
    """
    W, H = im.size
    g = im.convert("L").resize((72, 72), Image.BILINEAR)
    px = list(g.getdata())
    rows = [sum(px[y * 72:(y + 1) * 72]) / 72 for y in range(72)]
    cols = [sum(px[y * 72 + x] for y in range(72)) / 72 for x in range(72)]

    def limit(vals):
        core = sorted(vals[18:54])
        med = core[len(core) // 2]
        spread = (core[-1] - core[0]) or 1.0
        # 0.85 of the core's own full spread: comfortably inside normal veining, well under a
        # wall, a light leak or the sawn edge of the slab
        return med, max(4.5, spread * 0.85)

    rmed, rtol = limit(rows)
    cmed, ctol = limit(cols)
    MAXTRIM = 18                      # never eat more than a quarter from any one side

    top = 0
    while top < MAXTRIM and abs(rows[top] - rmed) > rtol:
        top += 1
    bot = 71
    while (71 - bot) < MAXTRIM and abs(rows[bot] - rmed) > rtol:
        bot -= 1
    left = 0
    while left < MAXTRIM and abs(cols[left] - cmed) > ctol:
        left += 1
    right = 71
    while (71 - right) < MAXTRIM and abs(cols[right] - cmed) > ctol:
        right -= 1

    if (top, left) == (0, 0) and (bot, right) == (71, 71):
        return im
    # one extra cell of margin, because the band always feathers into the stone
    top = min(top + 1, MAXTRIM); left = min(left + 1, MAXTRIM)
    bot = max(bot - 1, 71 - MAXTRIM); right = max(right - 1, 71 - MAXTRIM)
    box = (int(left / 72 * W), int(top / 72 * H),
           int((right + 1) / 72 * W), int((bot + 1) / 72 * H))
    if box[2] - box[0] < W * 0.4 or box[3] - box[1] < H * 0.4:
        return im
    # keep it square: the tile is square, so trimming one axis must trim the other to match
    side = min(box[2] - box[0], box[3] - box[1])
    cx, cy = (box[0] + box[2]) // 2, (box[1] + box[3]) // 2
    return im.crop((cx - side // 2, cy - side // 2, cx + side // 2, cy + side // 2))


def process(path, outdir, report=None, name=None, dry=False, crop_out=None):
    """dry=True scores the candidate without writing anything, so main() can compare the
    several pictures a distributor publishes for one stone and only emit the winner.

    ⭐ crop_out writes the FINAL crop — the exact pixels that become the tile, at native
    resolution — to a path, and is how upscale.py gets something safe to super-resolve.
    ⛔ DO NOT rebuild that crop from rec["box"] instead. `box` is in whatever coordinate space
    `im` had reached by the time find_window ran, and TWO earlier steps rebind `im`: the PIN
    crop, and the slab-box crop that cuts the warehouse away before judging. Applying `box` to
    the original file therefore lands somewhere else entirely — it was tried on 10 Aug and put a
    window back into Calacatta Vagli Oro, a ceiling crane into Travertine Romano and a stock
    label into Colombo Juparana, all of which the shipped tiles had correctly excluded."""
    slug = name or os.path.splitext(os.path.basename(path))[0]
    base = dict(slug=slug, src=os.path.relpath(path, HERE), src_abs=path)
    try:
        im = ImageOps.exif_transpose(Image.open(path)).convert("RGB")
    except Exception as e:
        return dict(base, ok=False, score=0, why=f"unreadable ({type(e).__name__})")

    # The stock system photographs one slab at a time against the warehouse, so crop to the
    # slab FIRST and judge what is inside it. Judging the whole frame would reject every one of
    # them for having a warehouse in it, which is how the first pass ended up with tiles for the
    # quartz and almost nothing for the marble and granite.
    pin = PINS.get(slug)
    on_stand = os.sep + "nile-inv" + os.sep in path
    if on_stand:
        sb = find_slab_box(im)
        if not sb:
            return dict(base, ok=False, score=0, why="no slab found in the stock photo")
        im = im.crop(sb)
    # a pinned crop is applied to whatever we now have: the slab box for stock photography, the
    # whole frame for a flat scan
    if pin and pin.get("crop"):
        l, t, r, b = pin["crop"]
        im = im.crop((int(im.width * l), int(im.height * t),
                      int(im.width * r), int(im.height * b)))

    kind, ev = classify(im, cropped=on_stand)
    # A pin may overrule "blown", never "scene". The clipping test reads 71-76% on Nile's Carrara
    # quartz scans, which is what a white-on-white product measures rather than a fault — the
    # veining is plainly there when you look. It may not overrule scene: no crop of a photograph
    # of a kitchen belongs in a slab selector, whoever signed it off.
    if pin and kind == "blown":
        kind = "scan"
    if kind != "scan":
        why = ("photograph of a room or a yard, not a slab scan" if kind == "scene"
               else "source is clipped white, no pattern left to show")
        return dict(base, ok=False, score=0, kind=kind, evidence=ev,
                    why=f"{why} ({', '.join(f'{k} {v}' for k, v in ev.items())})")

    # Only nile stamp a logo; see the fence block in find_window for why this must not be guessed
    # from the pixels.
    src_folder = os.path.basename(os.path.dirname(os.path.abspath(path)))
    boxpx, s, reasons, bundle = find_window(im, fenced=src_folder in WATERMARKED)

    # ⭐ CENTRE-OF-SLAB FALLBACK, stock photography only. find_window looks for the cleanest
    # square anywhere in the frame, which is the right instinct for a picture that might contain
    # a warehouse — but by then find_slab_box has ALREADY cut this picture down to the slab, and
    # the search is left choosing a small tidy patch of a large clean stone. It was returning a
    # 369px window out of a 1292x605 Nero Marquina, and nothing at all out of a 2990x1994 Fusion
    # Black. Eight of these were cropped centre-square by hand and contact-sheeted: every one was
    # clean, sharp (blur-response 5 to 8) and unmistakably the right stone.
    #
    # So where the slab has already been found, take the middle of it. That is slab by
    # construction — the stock system stands each one square-on and fills the frame — and it
    # keeps the veining at life size instead of enlarging a patch. It still has to survive the
    # exposure, sharpness and resolution gates below, and line_veto still has to agree there is
    # no rack pole or sawn edge running through it.
    if on_stand:
        cw, ch = im.width, im.height
        side = int(min(cw, ch) * 0.94)
        cand = ((cw - side) // 2, (ch - side) // 2, (cw + side) // 2, (ch + side) // 2)
        if side > (boxpx[2] - boxpx[0] if boxpx else 0):
            aw, ah, aL, aS, aGx, aGy = analysis(im.crop(cand))
            straight = max(line_veto(aGy, aw, ah, 0, 0, aw, ah, "row"),
                           line_veto(aGx, aw, ah, 0, 0, aw, ah, "col"))
            if straight < 4.5:
                boxpx = cand
                s2, r2 = rescore(bundle, cand) if bundle else (0.0, {})
                s, reasons = max(s, s2), (r2 or reasons or {})
                s = max(s, ACCEPT)     # the geometry is the evidence here, not the patch score

    # ⭐ A pinned frame falls back to its own middle when the window search comes back empty.
    # find_window scores a near-featureless white field at zero everywhere and fences off the
    # bottom-right corner where Nile put their logo, which between them leave nothing above the
    # floor on Carrara quartz — an image that is, to the eye, a clean scan of the product. The
    # pin already says a person has looked at this frame; the middle of it is the safe crop.
    if not boxpx and pin:
        side = int(min(im.width, im.height) * 0.94)
        boxpx = ((im.width - side) // 2, (im.height - side) // 2,
                 (im.width + side) // 2, (im.height + side) // 2)
        s, reasons = max(s, ACCEPT), (reasons or {})
    if not boxpx:
        return dict(base, ok=False, why="no window", score=0)

    # Keep the physical scale consistent where we can tell what we are looking at: a ~2:1 image
    # is a full-slab scan, so we know roughly how many mm a pixel is worth. ⚠️ The re-framed box
    # is then RE-SCORED and only kept if it is still clean — see rescore().
    x0, y0, x1, y1 = boxpx
    # `bundle` is None when find_window found nothing and the centre-of-slab fallback supplied
    # the box instead. There is no scored analysis to re-judge a re-framed box against, and an
    # unjudged re-frame is exactly the bug rescore() was written to stop, so leave the box alone.
    if bundle and 1.75 <= im.width / im.height <= 2.25:
        want = int(CROP_MM * im.width / SLAB_MM)
        # ⛔ NEVER below the quality floor. This step assumes the picture shows a whole ~3200mm
        # slab, which is true of a yard scan and false of a manufacturer's swatch: Caesarstone
        # publish a 50x70cm CLOSE-UP at 1920x1080, so "42% of the slab width" cut a perfectly
        # good 1036px crop down to 810px and the floor then threw it away. 215 of 360 images
        # died this way, including almost the whole Caesarstone range. Consistent scale is worth
        # having, but not at the cost of the sharpness the client asked for.
        # ⚠️ THIS GUARD IS DELIBERATELY NOT MIN_SRC_PX. It was, and the two are different
        # questions wired to one number: MIN_SRC_PX asks "is this tile worth shipping", this
        # asks "may I make a shippable tile smaller for the sake of consistent scale". Dropping
        # the floor to 340 quietly let this step start firing on Next Stone's ~2:1 scans, where
        # `want` computes to 432 — so a 479px crop was cut to 432, fell into the strict
        # sub-440 sharpness band, and four stones that had been shipping stopped. Scale
        # consistency is a nicety; it must never cost a tile.
        if SCALE_MIN_PX <= want < (x1 - x0):
            cx, cy = (x0 + x1) // 2, (y0 + y1) // 2
            half = want // 2
            cand = (max(0, cx - half), max(0, cy - half),
                    min(im.width, cx + half), min(im.height, cy + half))
            s2, r2 = rescore(bundle, cand)
            if s2 >= min(s, ACCEPT):
                x0, y0, x1, y1 = cand
                s, reasons = s2, r2

    crop = trim_edges(im.crop((x0, y0, x1, y1)))   # cut any wall/edge band before measuring
    if crop_out:
        crop.save(crop_out, "JPEG", quality=96, subsampling=0)

    # ---- RESOLUTION AND SHARPNESS ----
    # ⚠️ A clean crop is not the same as a usable one. Baltic Brown passed every content test and
    # still looked wrong, because its source is a BUNDLE of slabs on a rack shot from an angle:
    # the only pole-free region is small, so it was being blown up about three times to fill a
    # 1024px tile, and it arrived soft and foreshortened. Upscaling cannot invent stone. If the
    # source pixels are not there, or the crop is already soft, fall back to the drawn slab.
    # ⚠️ THESE TWO REJECTIONS CARRY THE BOX, the scene rejections deliberately do not. "Too small"
    # and "too soft" are failures of RESOLUTION on a crop the content tests already liked, and
    # upscale.py can rescue exactly those from the box. A scene rejection means there is a room in
    # the frame — there is nothing there to rescue and handing on a box would invite someone to
    # try. Keep that asymmetry.
    side = min(crop.width, crop.height)
    if side < MIN_SRC_PX:
        return dict(base, ok=False, score=round(s, 3), box=[x0, y0, x1, y1], rescuable=True,
                    why=f"source too small to fill a tile ({side}px, want {MIN_SRC_PX})")
    blown, ev2 = overexposed(crop)
    if blown and pin:
        blown = False        # see PINS: signed off by eye, same reasoning as the clipping test
    if blown:
        return dict(base, ok=False, score=round(s, 3),
                    why=f"washed out, mostly featureless highlight "
                        f"({ev2['blank']}% blank, median {ev2['med']}, spread {ev2['spread']})")
    sharp = _sharpness(crop)
    want_sharp = 0 if pin else sharp_floor(side)     # see PINS: a pin is a signed-off judgement
    if sharp < want_sharp:
        return dict(base, ok=False, score=round(s, 3), box=[x0, y0, x1, y1], rescuable=True,
                    why=f"source is soft, likely shot at an angle "
                        f"(sharpness {sharp:.1f}, want {want_sharp} at {side}px)")

    rec = dict(base, ok=s >= ACCEPT, score=round(s, 3), sharp=round(sharp, 1), src_px=side,
               phash=phash(crop),
               reasons={k: round(v, 2) for k, v in reasons.items()},
               box=[x0, y0, x1, y1])
    if dry:
        return rec
    if not rec["ok"]:
        rec["why"] = "below accept threshold: " + ", ".join(
            f"{k} {v:.2f}" for k, v in sorted(reasons.items(), key=lambda kv: kv[1])[:2])
        if report is not None:
            report.append((slug, crop, rec))
        return rec

    # ⚠️ NEVER UPSCALE. Blowing a 540px crop up to 1024 does not add stone, it adds mush, and
    # mush is exactly what the client said this must not look like. Tiles are square and as
    # large as the source honestly supports, and CSS covers whatever size arrives.
    px = min(TILE[0], max(MIN_SRC_PX, side - side % 8))
    tile = studio(crop.resize((px, px), Image.LANCZOS))
    os.makedirs(outdir, exist_ok=True)
    tile.save(os.path.join(outdir, slug + ".webp"), "WEBP", quality=QUALITY, method=6)
    # ⚠️ min(), NOT a flat resize. This used to be tile.resize(THUMB) unconditionally, so a 360px
    # master was blown up to a 700px "thumb" — inventing pixels on precisely the stones that had
    # none to spare, and then serving that as the wheel card. A small stone now ships a small
    # thumb and lets the browser downscale, which is sharp. Never upscale, at either size.
    tpx = min(THUMB[0], px)
    tile.resize((tpx, tpx), Image.LANCZOS).save(
        os.path.join(outdir, slug + "-s.webp"), "WEBP", quality=QUALITY, method=6)
    rec["tile_px"], rec["thumb_px"] = px, tpx
    rec["bytes"] = os.path.getsize(os.path.join(outdir, slug + ".webp"))
    if report is not None:
        report.append((slug, tile, rec))
    return rec


def main():
    only = None
    if "--only" in sys.argv:
        only = sys.argv[sys.argv.index("--only") + 1]
    want_report = "--report" in sys.argv
    report = [] if want_report else None

    files = sorted(glob.glob(os.path.join(RAW, "*", "*.jp*g")) +
                   glob.glob(os.path.join(RAW, "*", "*.png")) +
                   glob.glob(os.path.join(RAW, "*", "*.webp")))
    # ⛔ LICENCE GATE, and it belongs here rather than in harvest.py. Harvesting is research and
    # may look at anything; TILES ARE PUBLISHED, so only sources cleared in LICENSING.md may
    # become one. Nile Stone and Next Stone Slabs are the client's own trade suppliers, and
    # TopCat selling their product with their photograph is the ordinary trade arrangement.
    # Everything else in raw/ is surveyed-only (Caesarstone, CRL, Cosentino, Noble, Fugen: brand
    # asset packs that have to be asked for) or excluded outright (Bloom and AKG are competing
    # fabricators; Classic Quartz refused this agent by name). Left ungated, slabify happily
    # wrote Caesarstone and Noble Stone tiles into assets/slabs — unpublished only because no
    # catalogue stone happened to match their names, which is luck, not a control.
    if "--all-sources" not in sys.argv:
        files = [f for f in files
                 if os.path.basename(os.path.dirname(f)) in PUBLISHABLE]
    if only:
        files = [f for f in files if only in f]

    # Candidates for one stone arrive as slug.jpg, slug__2.jpg, slug__3.jpg. Group them and let
    # the best picture win, rather than trusting the order the distributor happened to list.
    groups = {}
    for f in files:
        stem = os.path.splitext(os.path.basename(f))[0]
        groups.setdefault(stem.split("__")[0], []).append(f)

    # A pinned stem uses the frame a person chose, and only that one.
    for stem, pin in PINS.items():
        if stem in groups and pin.get("file"):
            # `file` may be "name.jpg" or "source/name.jpg" — the folder form is needed where two
            # suppliers publish the same product name and the tile must come from the right one
            keep = [f for f in groups[stem]
                    if f.replace(os.sep, "/").endswith("/" + pin["file"])]
            if keep:
                groups[stem] = keep

    recs = []
    for i, (stem, cands) in enumerate(sorted(groups.items()), 1):
        tries = [process(f, OUT, None, name=stem, dry=True) for f in cands]
        # ⚠️ A CANDIDATE THAT PASSES BEATS A CANDIDATE THAT SCORES WELL. Ranking on score alone
        # loses stones outright: score measures how clean the crop is, and it is computed before
        # the resolution, exposure and sharpness gates run. So a small tidy picture (score .928)
        # would beat a large usable one (.888), win the group, and then die on the 700px floor —
        # taking the stone down with it even though a perfectly good candidate was sitting right
        # there. Arabescato Elegance was the proof: raw/nile/arabescato-elegance.jpg passes
        # everything, and was passed over for a 486px nile-inv frame that could never ship.
        # Rank by (does it survive every gate, then how clean it is).
        best = max(tries, key=lambda r: (bool(r.get("ok")), r.get("score", 0)))
        # ⭐ ...and among the ones that DO survive, the biggest of the equally-clean wins.
        # Score measures tidiness, not resolution, so a 664px frame scoring .93 was beating an
        # 847px frame of the same slab scoring .91 — and the stone PAGE hero is the largest
        # place a tile is ever shown (436x558 CSS, so 1116 device pixels on a retina screen),
        # which is where those missing pixels are visible.
        #
        # ⚠️ TIE_MARGIN IS 0.02 AND IT WAS 0.06, WHICH WAS TOO WIDE AND SHIPPED A KITCHEN.
        # Arabescato Gold: a lifestyle photograph of a finished island scored .79 at 2712px and
        # a clean warehouse scan of the slab scored .825 at 2004px. At 0.06 the kitchen counted
        # as "equally clean" and won on size alone — it went out on the contact sheet with two
        # chairs and a run of cabinets in it. Score is the safety judgement and size is only a
        # tie-break, so the tie has to be a real one. Anything further apart than 0.02 is a
        # difference of kind, not of framing.
        # ⭐ REPLACED BY A GRADED RANK (client, 10 Aug: "most of the pictures in the granite section
        # are blurry ... if it's not four k HD or at least very clear, fucking fix it").
        #
        # The flat tie margin was the reason the range shipped soft. It let size break a tie and
        # nothing more, so a 552px frame scoring .92 beat a 4835px frame of the SAME SLAB scoring
        # .89 — the margin was 0.02 and the gap was 0.03. Measured across the 52: 37 stones had a
        # materially bigger frame sitting unused in their own source folder, Azul Shimmer and
        # Calacatta Oro by nearly 9x. The pixels were never missing; they were never asked for.
        #
        # Widening TIE_MARGIN is NOT the fix and was already tried — at 0.06 it shipped Arabescato
        # Gold as a photograph of a kitchen. So resolution is scored instead of tie-broken, on a
        # log scale (a DOUBLING of resolution is worth RES_WEIGHT), and score keeps a hard veto:
        #
        #   · MAX_SCORE_GAP  a candidate more than 0.06 below the cleanest passing frame can
        #                    never win, whatever its size. Score is the safety judgement.
        #   · RES_WEIGHT     0.050 per doubling — small enough to lose to a real difference of
        #                    kind, large enough to beat framing noise.
        #
        # ⚠️ CHECKED AGAINST THE KNOWN TRAP before it was committed. Arabescato Gold: the kitchen
        # scores .790 at 2712px, the clean warehouse scan .825 at 2004px.
        #     kitchen .790 + .050*log2(2712/700) = .790 + .098 = .888
        #     scan    .825 + .050*log2(2004/700) = .825 + .076 = .901
        # The scan still wins, and it also wins on MAX_SCORE_GAP independently. Any change to
        # RES_WEIGHT must be re-checked against that pair — it is the case that has actually
        # shipped a wrong picture, and it is only 0.035 of score apart. 0.030 was tried first and
        # was too weak to move anything: on Azul Shimmer a 582px crop scoring .968 beat a 1068px
        # crop of the same slab scoring .933 by nine thousandths.
        RES_WEIGHT = 0.050
        MAX_SCORE_GAP = 0.06
        REF_PX = 700.0

        def _rank(r):
            px = max(1, r.get("src_px", 0))
            lift = math.log(px / REF_PX, 2)
            return r.get("score", 0) + RES_WEIGHT * max(-1.0, min(3.0, lift))

        passing = [r for r in tries if r.get("ok")]
        if passing:
            top = max(r.get("score", 0) for r in passing)
            eligible = [r for r in passing if r.get("score", 0) >= top - MAX_SCORE_GAP]
            best = max(eligible, key=lambda r: (_rank(r), r.get("src_px", 0)))
        # ⭐ NO TWO STONES MAY SHIP THE SAME PHOTOGRAPH (client, 10 Aug, on seeing Dolce Vita and
        # Dolce Vita Leather side by side: "those are the exact fucking same. the same exact image
        # just under a different name. What the fuck?"). He was right, and there were three pairs:
        # Almond Beige / Calacatta Gold Soft were PIXEL-identical, Mystic Grey / Mystic Grey
        # Leather and Dolce Vita / Dolce Vita Leather near enough.
        #
        # ⚠️ THE SOURCE FILES ARE DIFFERENT. This is not the matcher pairing one tile to two
        # names — the supplier has published the SAME photograph under two product names in their
        # own library, so nothing upstream of here can see it. It only shows up by comparing the
        # finished tiles, which is what this does.
        #
        # A stone that cannot find a frame of its own is REJECTED rather than shipped as a
        # twin: two identical tiles under different names is the wrong-image-under-a-right-name
        # failure the whole pipeline exists to prevent, and it is worse than a shorter range.
        if best.get("ok"):
            for attempt in sorted(passing, key=lambda r: -_rank(r)) if passing else [best]:
                h = attempt.get("phash")
                # ⚠️ HAMMING, NOT EQUALITY. An exact dict lookup only catches a byte-identical
                # crop; the supplier's two photographs of one slab differ by a few pixels of
                # framing, which lands 2-4 bits apart on a 100-bit hash. Mystic Grey Leather
                # slipped through an equality check at distance 2 and shipped as a twin of
                # Mystic Grey. 8 bits of 100 is comfortably below any genuinely different stone.
                twin = None
                if h is not None:
                    for seen_h, seen_stem in _SEEN_HASH.items():
                        if bin(seen_h ^ h).count("1") <= 8:
                            twin = seen_stem
                            break
                if twin is None:
                    if h is not None:
                        _SEEN_HASH[h] = stem
                    best = attempt
                    break
                print(f"      ~ {stem}: same photograph as {twin}, trying another frame")
            else:
                best = dict(best, ok=False,
                            why="every frame is a duplicate of another stone's photograph")

        # re-run the winner for real so only it writes a tile
        r = process(best["src_abs"], OUT, report, name=stem) if best.get("ok") else best
        r["candidates"] = len(cands)
        recs.append(r)
        flag = "ok " if r.get("ok") else "REJ"
        extra = f" [{len(cands)} candidates]" if len(cands) > 1 else ""
        print(f"{i:3}/{len(groups)} {flag} {stem[:36]:38} {r.get('score', 0):.3f}{extra} "
              f"{r.get('why', '')}")

    with open(os.path.join(HERE, "slabify-report.json"), "w") as fh:
        json.dump(recs, fh, indent=1)
    ok = [r for r in recs if r.get("ok")]
    print(f"\naccepted {len(ok)}/{len(recs)}   "
          f"avg {sum(r['bytes'] for r in ok) / max(1, len(ok)) / 1024:.0f}KB/tile   -> {OUT}")

    if want_report:
        _sheet(report)


def _sheet(report):
    report.sort(key=lambda t: -t[2].get("score", 0))
    C, TW, TH = 6, 240, 240
    R = math.ceil(len(report) / C)
    sh = Image.new("RGB", (C * TW, R * (TH + 28)), "#1a1a1c")
    d = ImageDraw.Draw(sh)
    for i, (slug, img, rec) in enumerate(report):
        t = img.copy().convert("RGB")
        t.thumbnail((TW - 6, TH - 6))
        x, y = (i % C) * TW, (i // C) * (TH + 28)
        sh.paste(t, (x + 3, y + 3))
        col = "#7ddc8a" if rec.get("ok") else "#ff7a7a"
        d.text((x + 4, y + TH + 2), f"{slug[:30]}", fill=col)
        d.text((x + 4, y + TH + 13), f"{rec.get('score',0):.2f} {rec.get('why','')[:34]}", fill="#999")
    p = os.path.join(HERE, "slabify-report.png")
    sh.save(p)
    print("contact sheet ->", p)


if __name__ == "__main__":
    main()

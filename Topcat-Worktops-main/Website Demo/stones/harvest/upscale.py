# -*- coding: utf-8 -*-
"""Super-resolve the ACCEPTED CROP of a stone that has no larger photograph on disk.

    python3 upscale.py --plan                 # what would be sent, and what it costs
    python3 upscale.py --extract SLUG...      # write the native-resolution crop to _upscale/in/
    python3 upscale.py --install SLUG...      # fold a returned 4K file back into a tile

⭐ WHY THIS EXISTS. 34 of the 52 stones ship a tile under 800px, not because the pipeline threw
resolution away — that was fixed on 10 Aug by making the watermark fence conditional and by
ranking candidates on resolution — but because that is genuinely all the clean slab there is in
the supplier's frame. Next Stone publish originals at ~509px on the short side and there is
nothing behind them. The client's requirement is that nothing looks blurry, so the remaining
route is super-resolution.

⛔ WHAT THIS IS NOT. It does not generate a stone, re-imagine one, or "fix" a pattern. It enlarges
THE SUPPLIER'S OWN PHOTOGRAPH of the crop slabify already judged and accepted. The box is not
re-chosen here — re-framing an accepted box without re-judging it is the bug rescore() exists to
stop, and the same reasoning applies with more force once a model is in the loop.

⚠️ EVERY RESULT MUST BE LOOKED AT next to the original before it ships. A super-resolution model
invents plausible detail, and "plausible detail" on a marble is a vein that is not in the slab
the customer will be sold. Reject anything whose pattern has moved. That check is the whole
reason this is a separate, explicit step and not a stage inside slabify.py.
"""
import json, os, sys, glob
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
WORK = os.path.join(HERE, "_upscale")
IN, OUT = os.path.join(WORK, "in"), os.path.join(WORK, "out")
REPORT = os.path.join(HERE, "slabify-report.json")
MANIFEST = os.path.abspath(os.path.join(HERE, "..", "..", "assets", "slabs", "manifest.json"))

# A tile at or above this many pixels is already sharp on every surface the site shows it on:
# the wheel card is 290x351 CSS (580x702 at DPR 2) and the stone-page hero 436x558 (872x1116).
# Below it, the softness is visible on the card itself, which is where a customer chooses.
TARGET = 1200


def records():
    rep = json.load(open(REPORT))
    man = json.load(open(MANIFEST))
    used = {v: k for k, v in man.items()}          # tile stem -> catalogue slug
    out = []
    for r in rep:
        # `rescuable` is a stone slabify REJECTED for resolution alone, on a crop the content
        # tests already liked (see the rejection block in slabify.process). Those are exactly the
        # stones super-resolution is for, and without this they ship a STALE tile from an older
        # run — the manifest keeps pointing at a .webp on disk that the current pipeline would
        # no longer produce. That is how Fresh Cement, Bianco Eclypsia and Sabbia Beige were
        # still on the site after the pipeline had started refusing them.
        if not (r.get("ok") or r.get("rescuable")) or r["slug"] not in used:
            continue
        # ⚠️ MEASURE THE TILE ON DISK — never trust the report's tile_px. Two ways it lies:
        # it is only written on the real (non-dry) pass, so a PINNED stone can reach the report
        # without it (that hid Fresh Cement at 368px, Bianco Eclypsia at 392 and Sabbia Beige at
        # 480 from the first plan); and once install() has replaced a tile the report still
        # describes the SUPERSEDED one, so every stone already upscaled would be re-listed and
        # paid for twice. The .webp is the only thing that knows what is actually shipping.
        px = 0
        p = os.path.join(os.path.dirname(MANIFEST), r["slug"] + ".webp")
        if os.path.exists(p):
            with Image.open(p) as im:
                px = im.width
        px = px or r.get("tile_px", 0)
        out.append(dict(tile=r["slug"], stone=used[r["slug"]], box=r.get("box"),
                        src_abs=r.get("src_abs"), src_px=r.get("src_px", 0), tile_px=px))
    return out


def plan():
    rs = [r for r in records() if r["tile_px"] and r["tile_px"] < TARGET]
    rs.sort(key=lambda r: r["tile_px"])
    print(f"{'stone':32} {'tile':>5} {'crop':>6}  source")
    for r in rs:
        print(f"{r['stone']:32} {r['tile_px']:>5} {r['src_px']:>6}  {os.path.basename(r['src_abs'])[:40]}")
    print(f"\n{len(rs)} stones under {TARGET}px  ->  {len(rs) * 2} credits at 2/upscale")
    return rs


def _slabify():
    """Import slabify without letting it read our argv."""
    import importlib.util
    spec = importlib.util.spec_from_file_location("slabify", os.path.join(HERE, "slabify.py"))
    m = importlib.util.module_from_spec(spec)
    saved, sys.argv = sys.argv, ["slabify.py"]
    try:
        spec.loader.exec_module(m)
    finally:
        sys.argv = saved
    return m


def extract(slugs):
    """Stage the exact crop slabify would cut, at native resolution.

    ⛔ ASK SLABIFY FOR IT — never rebuild it from rec["box"]. See the crop_out note in
    slabify.process(): two earlier steps rebind `im`, so `box` is not in the original file's
    coordinate space and re-cropping the original lands somewhere else. Doing that shipped a
    window, a ceiling crane and a stock label into three tiles on 10 Aug before a contact sheet
    caught it. Re-running process() costs a second of work and is exact by construction."""
    os.makedirs(IN, exist_ok=True)
    sl = _slabify()
    idx = {r["stone"]: r for r in records()}
    staged = []
    for s in slugs:
        r = idx.get(s)
        if not r:
            print(f"  !! {s}: no record"); continue
        p = os.path.join(IN, s + ".jpg")
        sl.process(r["src_abs"], sl.OUT, None, name=r["tile"], dry=True, crop_out=p)
        if not os.path.exists(p):
            print(f"  !! {s}: process wrote no crop"); continue
        with Image.open(p) as c:
            w, h = c.size
        staged.append(dict(stone=s, path=p, w=w, h=h))
        print(f"  {s:32} {w}x{h} -> {os.path.relpath(p, HERE)}")
    json.dump(staged, open(os.path.join(WORK, "staged.json"), "w"), indent=1)
    return staged


def install(slugs):
    """Fold a returned 4K file back into the tile pair, through slabify's own studio()."""
    sys.path.insert(0, HERE)
    import importlib.util
    spec = importlib.util.spec_from_file_location("slabify", os.path.join(HERE, "slabify.py"))
    sl = importlib.util.module_from_spec(spec)
    saved, sys.argv = sys.argv, ["slabify.py"]
    spec.loader.exec_module(sl)
    sys.argv = saved

    idx = {r["stone"]: r for r in records()}
    done = []
    for s in slugs:
        src = os.path.join(OUT, s + ".png")
        if not os.path.exists(src):
            src = os.path.join(OUT, s + ".jpg")
        if not os.path.exists(src):
            print(f"  !! {s}: nothing in {os.path.relpath(OUT, HERE)}"); continue
        r = idx[s]
        im = Image.open(src).convert("RGB")
        side = min(im.width, im.height)
        px = min(sl.TILE[0], side - side % 8)
        tile = sl.studio(im.crop(((im.width - side) // 2, (im.height - side) // 2,
                                  (im.width + side) // 2, (im.height + side) // 2)
                                 ).resize((px, px), Image.LANCZOS))
        outdir = sl.OUT
        tile.save(os.path.join(outdir, r["tile"] + ".webp"), "WEBP",
                  quality=sl.QUALITY, method=6)
        tpx = min(sl.THUMB[0], px)
        tile.resize((tpx, tpx), Image.LANCZOS).save(
            os.path.join(outdir, r["tile"] + "-s.webp"), "WEBP", quality=sl.QUALITY, method=6)
        done.append(dict(stone=s, tile=r["tile"], was=r["tile_px"], now=px))
        print(f"  {s:32} {r['tile_px']:>5} -> {px}px")
    # provenance: which tiles are super-resolved, so the next session is not guessing
    pf = os.path.join(HERE, "upscaled.json")
    prev = json.load(open(pf)) if os.path.exists(pf) else []
    known = {d["stone"] for d in done}
    json.dump([d for d in prev if d["stone"] not in known] + done, open(pf, "w"), indent=1)
    return done


# ⭐ MONTAGE BATCHING — four stones per upscale instead of one.
#
# The upscaler charges a FLAT 2 credits per job whatever the input size, and returns ~4096px on
# the long edge. A single 500px crop therefore buys 4096px it cannot use (the master tile is
# capped at 1600), and costs the same as four crops packed into one frame: a 2x2 of 640px cells
# is 1312px in, ~4096px out, so every cell lands near 2000px — still comfortably above the
# 1600px master. Same result, a quarter of the credits, a quarter of the uploads.
#
# ⚠️ THE GUTTER IS NOT COSMETIC. A super-resolution model reads context across the whole frame,
# so two stones touching would let one's veining bleed into the other's edge — a wrong pattern on
# a right name, which is the one failure the client says would sink them. Each cell is inset by
# GUTTER of neutral grey and then trimmed back by INSET on the way out, so nothing that touched a
# neighbour is ever kept.
CELL, GUTTER, INSET = 640, 24, 10


def montage(slugs=None):
    """Pack staged crops 4-up and write _upscale/mont/NN.jpg + a map to split them back."""
    staged = json.load(open(os.path.join(WORK, "staged.json")))
    if slugs:
        staged = [s for s in staged if s["stone"] in slugs]
    mdir = os.path.join(WORK, "mont")
    os.makedirs(mdir, exist_ok=True)
    side = CELL * 2 + GUTTER * 3
    plan_out, groups = [], [staged[i:i + 4] for i in range(0, len(staged), 4)]
    for gi, grp in enumerate(groups):
        sheet = Image.new("RGB", (side, side), (128, 128, 128))
        cells = []
        for ci, item in enumerate(grp):
            im = Image.open(item["path"]).convert("RGB")
            s = min(im.width, im.height)
            im = im.crop(((im.width - s) // 2, (im.height - s) // 2,
                          (im.width + s) // 2, (im.height + s) // 2)).resize((CELL, CELL), Image.LANCZOS)
            x = GUTTER + (ci % 2) * (CELL + GUTTER)
            y = GUTTER + (ci // 2) * (CELL + GUTTER)
            sheet.paste(im, (x, y))
            cells.append(dict(stone=item["stone"], x=x, y=y))
        p = os.path.join(mdir, f"{gi:02d}.jpg")
        sheet.save(p, "JPEG", quality=96, subsampling=0)
        plan_out.append(dict(file=p, w=side, h=side, cells=cells))
        print(f"  {os.path.basename(p)}  {side}x{side}  " + ", ".join(c["stone"] for c in cells))
    json.dump(plan_out, open(os.path.join(WORK, "montage.json"), "w"), indent=1)
    print(f"\n{len(groups)} montages -> {len(groups) * 2} credits (vs {len(staged) * 2} one-by-one)")
    return plan_out


def split():
    """Cut each returned 4K montage back into per-stone images in _upscale/out/."""
    plan_in = json.load(open(os.path.join(WORK, "montage.json")))
    os.makedirs(OUT, exist_ok=True)
    n = 0
    for gi, g in enumerate(plan_in):
        got = os.path.join(WORK, "mont", f"{gi:02d}-4k.png")
        if not os.path.exists(got):
            print(f"  !! {gi:02d}: no returned file"); continue
        big = Image.open(got).convert("RGB")
        k = big.width / g["w"]
        for c in g["cells"]:
            x0 = int((c["x"] + INSET) * k); y0 = int((c["y"] + INSET) * k)
            x1 = int((c["x"] + CELL - INSET) * k); y1 = int((c["y"] + CELL - INSET) * k)
            cell = big.crop((x0, y0, x1, y1))
            cell.save(os.path.join(OUT, c["stone"] + ".png"))
            print(f"  {c['stone']:32} {cell.width}x{cell.height}")
            n += 1
    print(f"\n{n} stones split out of {len(plan_in)} montages")


if __name__ == "__main__":
    a = sys.argv[1:]
    if not a or a[0] == "--plan":
        plan()
    elif a[0] == "--extract":
        extract(a[1:] or [r["stone"] for r in plan()])
    elif a[0] == "--montage":
        montage(a[1:] or None)
    elif a[0] == "--split":
        split()
    elif a[0] == "--install":
        install(a[1:] or [d["stone"] for d in json.load(open(os.path.join(WORK, "staged.json")))])

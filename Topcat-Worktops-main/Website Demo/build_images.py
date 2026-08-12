#!/usr/bin/env python3
"""
build_images.py — the responsive-image pipeline for the landing page.  Added 11 Aug 2026 (D109).

WHAT IT DOES, AND WHY EACH PART EXISTS
--------------------------------------
1. EXTRACTS the seven photographs that were pasted into index.html as base64 data URIs.
   391 KB of the page's 1.06 MB was those seven images written out as text.  Base64 cannot be
   cached, cannot be lazy-loaded, cannot be WebP, and it barely compresses — brotli got the
   whole page to 496 KB and 391 KB of that was these.  Pulled out to files, the page's wire
   size falls to about 204 KB.

2. BUILDS A WIDTH LADDER in WebP for every landing-page photograph, so `srcset` can hand a
   phone a small file and a desktop a large one.

⛔ THE ORIGINALS ARE NEVER TOUCHED OR DELETED.  kitchen-day.jpg is referenced by 20 other
   files, hero-kitchen.jpg by 4, quarry.jpg and cta-slab.jpg by 3.  Every ladder is written
   alongside, and the original stays as the last entry in the srcset, so no other page in the
   site can be affected by anything in here and nothing can render worse than it does today.

⚠️ THE LADDER WIDTHS ARE MEASURED, NOT GUESSED.  Each image's requirement is
   `natural_width x cover_scale x 2` for the largest box it actually occupies, sampled by
   scrolling the whole page at 375px and at 1440px.  ⛔ Do not "simplify" these to a uniform
   ladder: several of these images sit in TALL boxes under `object-fit:cover`, where the
   binding constraint is the box's HEIGHT, not its width — quarry.jpg needs only 764px for a
   105x208 box, while cta-slab.jpg needs 4160px for a 476x1161 one.  Reading width alone says
   quarry is 24x oversized and cta-slab is 6x oversized; the second is false.

Run:  python3 build_images.py            (re-runnable, overwrites its own output only)
"""
import base64, io, json, os, re, sys
from PIL import Image

ROOT = os.path.dirname(os.path.abspath(__file__))
HTML = os.path.join(ROOT, 'index.html')
OUT  = os.path.join(ROOT, 'assets', 'site')      # extracted photographs live here
os.makedirs(OUT, exist_ok=True)

WEBP_Q = 85        # ⚠️ 82, 85 and 88 were compared by eye at 4x zoom on quarry.jpg — the most
                   # texture-critical photograph here — against the original, and all three were
                   # indistinguishable. 85 is the cheapest verified level with margin left over.
MIN_STEP = 1.25    # do not emit two rungs within 25% of each other, the browser gains nothing
SAFETY   = 1.25    # ⭐ rungs sit 25% ABOVE the measured requirement, for two reasons.
                   # (1) The requirement was sampled at 375px and 1440px; a handset or window
                   #     between them can ask for slightly more.
                   # (2) A rung sized to the requirement EXACTLY lands the browser on a ~1:1
                   #     second resample, which shifts the cover-crop by a pixel and softens
                   #     very slightly.  Measured: quarry at 764px scored 33 dB against the
                   #     original and at 1000px scored 41 dB — the same picture, better phase.
                   # ⚠️ Do not read those dB figures as quality loss; a 4x zoom on the finest
                   #     detail in the frame showed 764, 1000 and the original as identical.
                   #     PSNR punishes a one-pixel crop offset that no eye can see.

# ── the seven inlined photographs, in document order, with the name each will take ──────────
# ⚠️ Order matters: they are matched positionally against the data URIs found in the file.
INLINE_NAMES = [
    'service-worktops',      # SERVICES[0]  Bespoke Worktops
    'service-islands',       # SERVICES[1]  Kitchen Islands
    'service-splashbacks',   # SERVICES[2]  Splashbacks
    'process-consultation',  # PROCESS[0]
    'process-quote',         # PROCESS[1]
    'process-template',      # PROCESS[2]
    'process-install',       # PROCESS[3]
]

# ── measured requirement, largest box occupied, at 2x DPR ───────────────────────────────────
#    name : (mobile_required_px, desktop_required_px)
REQUIRED = {
    'hero-kitchen':         (2917, 3477),
    'cta-slab':             (1566, 4160),
    'quarry':               ( 414,  764),
    'kitchen-day':          ( 501,  950),
    'team/handshake':       ( 480,  744),
    'team/samples':         ( 198,  309),
    'team/fitting':         ( 198,  309),
    'team/team':            ( 744, 1466),
    'service-worktops':     ( 625, 1659),
    'service-islands':      ( 874, 2322),
    'service-splashbacks':  (1422, 3777),
    'process-consultation': ( 687,  839),
    'process-quote':        ( 687,  864),
    'process-template':     ( 687,  809),
    'process-install':      ( 687, 1025),
}


# ── deliberate exceptions to the measured requirement ───────────────────────────────────────
# ⭐ THE HERO IS THE ONE PLACE THE ARITHMETIC ASKS FOR MORE THAN IS WORTH PAYING.
# It is a 1.79:1 landscape photograph inside a 0.50:1 portrait box under `object-fit:cover`,
# so it scales to fit the box's HEIGHT and roughly 72% of its width is then cropped away
# off-screen.  Honouring 2x DPR literally means shipping a 2917px image to show an 810px
# strip of it.  A pre-cropped portrait variant would be the textbook answer, but the crop
# would have to track `object-position` at every handset width and would change the framing —
# which is a look change, and the look is frozen.  So the phone gets 2000px instead: 1.37x
# effective density on a photograph that is heavily darkened and sits behind text.
# ⚠️ Verified by screenshot diff against the 2750px original before this was kept.
EXTRA_RUNGS = {'hero-kitchen': [1400, 2000]}


def ladder(name, native_w):
    """Rungs to emit for one image: the phone's need, the desktop's need, the native width,
    and any deliberate exception — clamped to the native width, because upscaling adds bytes
    and no detail."""
    mob, desk = REQUIRED.get(name, (native_w, native_w))
    mob, desk = round(mob * SAFETY), round(desk * SAFETY)
    want = {min(mob, native_w), min(desk, native_w)}
    want |= {min(w, native_w) for w in EXTRA_RUNGS.get(name, [])}
    # ⛔ Only carry the native width when something can actually ask for it.  quarry.jpg is
    # 2816px native and its largest box needs 764px — a native rung there is a 342 KB file
    # that no `sizes` expression will ever select.  The untouched original JPEG remains on
    # disk as the fallback either way, so dropping it loses nothing.
    if desk >= native_w / MIN_STEP:
        want.add(native_w)
    out = []
    for w in sorted(want):
        if w < 64:
            continue
        if out and w / out[-1] < MIN_STEP:      # too close to the rung below to be worth a file
            out[-1] = max(out[-1], w)
            continue
        out.append(w)
    return out


def emit(img, name, native_w, report):
    """Write the WebP ladder for one already-open image."""
    rungs = ladder(name, native_w)
    made = []
    for w in rungs:
        h = round(img.height * w / img.width)
        v = img if w == img.width else img.resize((w, h), Image.LANCZOS)
        path = os.path.join(OUT, f'{name.replace("/", "-")}-{w}.webp')
        v.save(path, 'WEBP', quality=WEBP_Q, method=6)
        made.append({'w': w, 'file': os.path.relpath(path, ROOT), 'bytes': os.path.getsize(path)})
    report.append({'name': name, 'native': f'{img.width}x{img.height}', 'rungs': made})
    return made


def main():
    html = open(HTML, encoding='utf-8').read()
    report = []

    # ── 1. extract the inlined photographs ──────────────────────────────────────────────────
    uris = list(re.finditer(r'data:image/(\w+);base64,([A-Za-z0-9+/=]{200,})', html))
    if len(uris) != len(INLINE_NAMES):
        sys.exit(f'⛔ expected {len(INLINE_NAMES)} inlined photographs, found {len(uris)}. '
                 'The file has changed shape — check INLINE_NAMES before running again.')

    freed = 0
    for m, name in zip(uris, INLINE_NAMES):
        raw = base64.b64decode(m.group(2))
        freed += len(m.group(0))
        img = Image.open(io.BytesIO(raw)).convert('RGB')
        # keep the decoded original too, so nothing is ever unrecoverable from the HTML
        img.save(os.path.join(OUT, f'{name}.jpg'), 'JPEG', quality=92, optimize=True)
        emit(img, name, img.width, report)

    # ── 2. ladders for the photographs that are already files ───────────────────────────────
    for rel in ['hero-kitchen.jpg', 'cta-slab.jpg', 'quarry.jpg', 'kitchen-day.jpg',
                'team/handshake.jpg', 'team/samples.jpg', 'team/fitting.jpg', 'team/team.jpg']:
        src = os.path.join(ROOT, 'assets', rel)
        if not os.path.exists(src):
            print(f'  ⚠️  missing, skipped: {rel}')
            continue
        name = rel.rsplit('.', 1)[0]
        img = Image.open(src).convert('RGB')
        emit(img, name, img.width, report)

    json.dump(report, open(os.path.join(OUT, 'manifest.json'), 'w'), indent=1)

    # ── 3. what it bought ───────────────────────────────────────────────────────────────────
    print(f'\n  extracted {len(uris)} inlined photographs — {freed:,} bytes of base64 out of index.html\n')
    print(f'  {"image":<24}{"native":>11}   {"rungs (width → bytes)"}')
    print('  ' + '-' * 74)
    tot_small = 0
    for r in report:
        rungs = '  '.join(f'{x["w"]}→{x["bytes"]/1024:.0f}K' for x in r['rungs'])
        print(f'  {r["name"]:<24}{r["native"]:>11}   {rungs}')
        tot_small += r['rungs'][0]['bytes']
    print('  ' + '-' * 74)
    print(f'  smallest rung of every image, summed (what a phone pulls): {tot_small/1024:.0f} KB')


if __name__ == '__main__':
    main()

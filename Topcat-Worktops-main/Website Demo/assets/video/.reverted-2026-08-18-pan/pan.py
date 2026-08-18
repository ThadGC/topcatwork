#!/usr/bin/env python3
"""
Build the phone and tablet cuts of the intro film as a PANNED crop of the master.

    python3 pan.py            # writes both cuts + posters, then a contact sheet of each

⭐⭐⭐ WHY A PAN AND NOT A FIXED CROP — 18 August 2026 (D316). D312 cut one fixed
864x1080 window at x=680 and the register recorded "a 4:5 crop shows all 864px across the
same 1170, a 1.35x upscale". ⛔⛔ THAT WAS ONLY TRUE OF A 4:5 BOX, AND THE PHONE'S HERO IS
NOT ONE. `.hero-vid` is `object-fit:cover` over a hero that is `max(90vh,…)`, so at 390x844
the box is 390x759 — aspect 0.514, not 0.8. Covering an 0.8 file into an 0.514 box scales to
fill the HEIGHT and throws away the sides:

    864x1080 covered into 390x759  ->  scale 0.7028, rendered 607x759
    visible source width: 555 of 864 px   =   36% of the cut discarded
    master window actually seen: x 835..1389   (the register says 680..1544)
    upscale on a DPR-3 phone: 2.11x, not 1.35x

So the client was right and the cause is arithmetic: the phone has been seeing the middle of
the middle — the island and the kitchen run, with the living room cropped off. His words:
*"it's not optimized for mobile, and it doesn't really leave space for text… it's facing more
towards the kitchen side. It actually needs to face more towards the living room side."*

⭐ THE FIX IS TO CUT AT THE BOX'S OWN ASPECT so `cover` has nothing left to discard, and then
to MOVE the window through the film so each beat is framed on purpose:

    phone   556 x 1080   (0.515 — every phone box measured lands on 0.513-0.514)
    tablet  812 x 1080   (0.752 — an 834x1112 and a 900x1200 tablet are both 0.750)

⚠️ The 2.1x upscale does NOT go away and cannot: the master is 1080 tall and a DPR-3 phone
hero is 2277 device px tall. That is a property of the supplied render, not of the crop. What
the aspect-matched cut buys is that none of the chosen composition is thrown away, and the
file is SMALLER because it carries fewer pixels.

⭐⭐ WHERE THE WINDOW GOES, MEASURED. The lit subject's horizontal centroid was sampled every
half second across all 44.25s (brightness-weighted, 480px proxy):

    t 0-7    ~1020    the quarry wall; the SKY AND MOUNTAINS ARE THE LEFT HALF (x 0..1100)
    t 12-17   1063 -> 1443   the slab swings right as it rotates
    t 17-23   1443 -> 1349   it settles, still right of centre
    t 25       (near black)  the transition
    t 28-32   ~1060    the room, lit, island centred
    t 33-39   (night grade falls, coverage collapses)
    t 40-44   ~1160    the final composition; the worktop is the lit mass

and the final frame's own geography, read off the 1920 master:

    x 0..620     the living room — sofa, rug, city windows
    x 620..700   the bar stools
    x 700..1090  THE ISLAND and its worktop (the product)
    x 1090..1920 the kitchen run — units, sink, backsplash, shelves

⛔ A 556px window cannot hold the living room AND the whole worktop. The worktop wins, because
it is what is being sold; the window ends far enough left to carry the stools and a slice of
living room and to drop the kitchen run entirely, which is the "facing the living room side"
he asked for without losing the subject.
"""

import pathlib
import subprocess
import sys

HERE = pathlib.Path(__file__).resolve().parent
MASTER = HERE / "TC-FINAL-VIDEO-master.mov"
OUT = HERE.parent
MW, MH = 1920, 1080

# ── the pan, one table per band ─────────────────────────────────────────────
# (t seconds, x of the window's LEFT edge in master px). Smoothstepped between rows, so there
# is no corner on any move — the window eases out of one hold and into the next.
# ⚠️ x is the LEFT edge, so the window centre is x + w/2. To sit on the slab at t=17 (centroid
#    1443) a 556 window needs x = 1443 - 278 = 1165.
CUTS = {
    "phone": dict(
        w=556, crf=26, name="topcat-intro-556",
        pan=[
            (0.0,  210),   # the quarry: sky and mountains fill the top, terrace lower right.
                           # ⭐ This is the frame the FIRST TITLE sits on, so it is chosen for
                           #    its sky and not for its stone.
            (6.0,  330),   # the camera pushes in; drift right with it into the marble
            (11.0, 700),   # the face has become a slab, filling the frame
            (17.0, 1165),  # follow the slab right as it rotates (centroid 1443)
            (23.0, 1071),  # it settles (centroid 1349)
            (27.0, 900),   # the transition, near black
            (30.5, 782),   # the room arrives — island centred (lit mass measures x~1060, and a
                           #    556 window centres on it at x = 1060 - 278)
            (44.25, 722),  # ⭐ THE FRAME THE PHONE ENDS ON, chosen by eye against five offsets at
                           #    the shipped size. Its centre is 1000, which is 112px LEFT of the
                           #    1112 the client rejected: the living room reads at the far left,
                           #    the stools and the whole worktop carry the middle with the bowl and
                           #    the plant on it, two pendants hang, and the kitchen RUN is gone.
                           #    ⛔ x=620 was tried first and is wrong — the worktop slides off the
                           #    right edge and reads as a corner rather than a surface.
        ],
    ),
    "tablet": dict(
        w=812, crf=25, name="topcat-intro-812",
        pan=[
            (0.0,  120),
            (6.0,  240),
            (11.0, 550),
            (17.0, 1037),  # 1443 - 406
            (23.0, 943),
            (27.0, 720),
            (30.5, 654),   # island centred: 1060 - 406
            (44.25, 540),  # ⭐ centre 946, i.e. 166px LEFT of the rejected 1112. An 812 window is
                           #    wide enough to hold the living room AND the whole worktop AND all
                           #    three pendants, which is why the tablet can sit further left than
                           #    the phone without losing the subject.
        ],
    ),
}


def expr(pan, w):
    """A crop x expression: smoothstep between the keyframes, clamped to the master."""
    lo, hi = 0, MW - w
    def clamp(v):
        return max(lo, min(hi, v))
    # innermost value is the last hold
    e = "%d" % clamp(pan[-1][1])
    for (t0, x0), (t1, x1) in reversed(list(zip(pan, pan[1:]))):
        x0, x1 = clamp(x0), clamp(x1)
        d = max(1e-6, t1 - t0)
        u = "clip((t-%.4f)/%.4f,0,1)" % (t0, d)
        s = "(%s*%s*(3-2*%s))" % (u, u, u)
        e = "if(lt(t,%.4f), %d+(%d)*%s, %s)" % (t1, x0, x1 - x0, s, e)
    return e


def run(cmd):
    print("  $", " ".join(str(c) for c in cmd)[:150])
    subprocess.run(cmd, check=True)


def main():
    if not MASTER.exists():
        sys.exit("! master not found: %s" % MASTER)
    for band, c in CUTS.items():
        w, name = c["w"], c["name"]
        out = OUT / (name + ".mp4")
        x = expr(c["pan"], w)
        print("\n=== %s: %dx%d, crf %d -> %s" % (band, w, MH, c["crf"], out.name))
        print("    pan:", " → ".join("%.4gs:x%d" % (t, v) for t, v in c["pan"]))
        run(["ffmpeg", "-y", "-v", "error", "-i", str(MASTER), "-an", "-sn", "-dn",
             "-map", "0:v:0",
             # ⚠️ fps FIRST so the crop expression's `t` is the shipped frame's own timestamp,
             #    and the pan is sampled once per shipped frame rather than per master frame.
             "-vf", "fps=12,crop=%d:%d:x='%s':y=0" % (w, MH, x),
             "-c:v", "libx264", "-crf", str(c["crf"]), "-preset", "veryslow",
             "-g", "8", "-bf", "0", "-refs", "4",
             "-pix_fmt", "yuv420p", "-profile:v", "high", "-level", "4.0",
             "-write_tmcd", "0", "-movflags", "+faststart", str(out)])
        # the poster is this cut's own first frame — what the page paints before the film decodes
        png = "/tmp/pan-poster-%s.png" % band
        run(["ffmpeg", "-y", "-v", "error", "-i", str(out), "-frames:v", "1", png])
        # ⚠️ no libwebp in this machine's ffmpeg; PIL writes the WebP (the pipeline's rule)
        subprocess.run([sys.executable, "-c",
                        "from PIL import Image; Image.open(%r).convert('RGB')"
                        ".save(%r,'WEBP',quality=80,method=6)"
                        % (png, str(OUT / (name + "-poster.webp")))], check=True)
        size = out.stat().st_size / 1048576
        print("    %s  %.2f MB" % (out.name, size))


if __name__ == "__main__":
    main()

# Cuts the two director portraits for the About collage's bottom band.
#   crop  : SQUARE, head and shoulders, eye lines aligned, face size matched.
#           ⛔ SQUARE IS NOT A STYLE CHOICE, IT IS THE ONLY SHAPE THAT LETS THEM BE BOTH BIGGER
#           AND STILL STOOD BACK. Nick's frame is 1682 wide with only 190px of paper above his
#           crown, so a WIDER card (5:4 and up) forces a shorter crop, which forces a close-up —
#           the opposite of "not so close to the screen". At 1:1 his head is half the frame.
#   ground: THE STUDIO PAPER STAYS (his instruction). The tone comes down in CSS, not here.
#   skin  : micro-contrast restored and a fine grain laid on, because the AI edit left the
#           faces plastic-smooth.
from PIL import Image, ImageChops, ImageFilter
import os, sys

# ⚠️ D302: reads the COPIES kept beside this script, not a Downloads folder that may
#    not exist on the next machine. The two originals are the same frames as 16 Aug.
SRC=os.path.join(os.path.dirname(os.path.abspath(__file__)),'')
# landmarks read off a measured grid over each source frame, in source pixels
P = {
 'nick':   dict(src=SRC+'nick-source.jpeg',
                crown=190, eye=610, chin=1030, cx=750, side=1600),
 'rimsha': dict(src=SRC+'rimsha-source.jpeg',
                crown=440, eye=960, chin=1390, cx=762, side=1684),
}
# ⭐ THE EYE LINE, as a fraction of the card.
# ⛔⛔ **THEY ARE NO LONGER CUT TO THE SAME VALUE — 17 Aug 2026 (D302).** Client: *"Nick seems
#   slightly further away than Rimsha in the image. So move Rimsha slightly further back in her
#   image so that it matches with Nick in terms of depth. Her hair is also going higher than his,
#   so it's not matching up very well."*
# ⭐⭐ **HE IS READING A REAL NUMBER.** Matching eye lines put her HAIR at 5.75% of the card
#   against Nick's 11.25% — a 13px difference on a 241px card — because she carries 520px of hair
#   above her eyes to his 420. Matching the eyes and matching the head box are different cuts and
#   the pair cannot have both.
# ⛔⛔⛔ **AND "FURTHER BACK" IS CAPPED BY HER OWN FRAME.** Moving her back means a WIDER crop, and
#   an exact hair match at the old eye line needs a 1981px square out of a source that is 1684px
#   wide. Her crop takes the whole width now (1638 → 1684, the maximum square) and the rest of the
#   correction is made by dropping HER eye line alone. ⛔ The alternative was extending the canvas
#   with invented studio paper beside her shoulders, which is retouching a real person's
#   photograph on a public page, and it was rejected for that reason.
# ⭐ 0.398 is the midpoint between matching the eyes (0.375) and matching the hair (0.421), chosen
#   by cutting all four candidates and looking at them side by side at the shipped 241px size: it
#   takes the hair gap from 13px to 5.7px and costs about 5px of eye-line offset, and 5px of eye
#   is far less visible across a pair than 13px of hairline against the card's top edge.
E={'nick':0.375,'rimsha':0.398}
# ⭐ the sides are chosen so face size matches: eye-to-chin is 420px on Nick and 430 on Rimsha,
#   so her crop is 2.4% larger and the two heads come out the same size on the page.
RUNGS=[640,320]

def build(key,p,outdir):
    im=Image.open(p['src']).convert('RGB'); W,H=im.size
    S=p['side']; e=E[key]
    t=p['eye']-e*S; l=p['cx']-S/2
    # ⚠️ the crop is nearly as wide as the frame, so centring on the head runs off the left edge
    #    on both; clamped, each head sits at ~47% instead of 50, the same on both.
    l=max(0,min(l,W-S)); t=max(0,min(t,H-S))
    assert S<=W and S<=H, (key,S,W,H)
    c=im.crop((round(l),round(t),round(l+S),round(t+S)))
    c=c.filter(ImageFilter.UnsharpMask(radius=2.0,percent=46,threshold=3))
    made=[]
    for w in RUNGS:
        r=c.resize((w,w),Image.LANCZOS)
        # ⚠️ grain AFTER the resize or the resample eats it; overlay against 128-centred noise is
        #    identity at 128, so it adds texture without shifting the tone.
        n=Image.effect_noise((w,w),9).convert('RGB')
        r=Image.blend(r,ImageChops.overlay(r,n),0.15)
        f=os.path.join(outdir,'%s-%d.webp'%(key,w))
        r.save(f,'WEBP',quality=85,method=6)
        made.append((f,os.path.getsize(f)))
    print('%-7s %dx%d at %d,%d   crown %.3f  eye %.3f  chin %.3f  headX %.3f  ->  %s' %
          (key,S,S,round(l),round(t),(p['crown']-t)/S,e,(p['chin']-t)/S,(p['cx']-l)/S,
           '  '.join('%s %.1fKB'%(os.path.basename(a),b/1024) for a,b in made)))
    return c

outdir=sys.argv[1] if len(sys.argv)>1 else '.'
prev={k:build(k,p,outdir) for k,p in P.items()}
a=prev['nick'].resize((360,360),Image.LANCZOS); b=prev['rimsha'].resize((360,360),Image.LANCZOS)
s=Image.new('RGB',(734,360),(12,12,16)); s.paste(a,(0,0)); s.paste(b,(374,0)); s.save('pair-preview.png')

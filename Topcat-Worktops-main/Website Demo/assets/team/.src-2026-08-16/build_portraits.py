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

SRC='/Users/thadeusgous/Downloads/'
# landmarks read off a measured grid over each source frame, in source pixels
P = {
 'nick':   dict(src=SRC+'Gemini_Generated_Image_t8snj6t8snj6t8sn.jpeg',
                crown=190, eye=610, chin=1030, cx=750, side=1600),
 'rimsha': dict(src=SRC+'Gemini_Generated_Image_i1u8oai1u8oai1u8.jpeg',
                crown=440, eye=960, chin=1390, cx=762, side=1638),
}
# ⭐ THE EYE LINE, as a fraction of the card. The two are cut to the SAME value, which is what
#   the eye actually reads across a pair. ⛔ ITS CEILING IS NICK'S HEADROOM: 190px of paper over
#   his crown is 11.9% of a 1600 crop, so E cannot exceed 0.262 + 0.119. At 0.375 he keeps 11%
#   of air above his hair and Rimsha keeps 5.8% — she simply has 100px more hair above her eyes,
#   and shrinking her face to even that up would be the wrong trade.
E=0.375
# ⭐ the sides are chosen so face size matches: eye-to-chin is 420px on Nick and 430 on Rimsha,
#   so her crop is 2.4% larger and the two heads come out the same size on the page.
RUNGS=[640,320]

def build(key,p,outdir):
    im=Image.open(p['src']).convert('RGB'); W,H=im.size
    S=p['side']
    t=p['eye']-E*S; l=p['cx']-S/2
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
          (key,S,S,round(l),round(t),(p['crown']-t)/S,E,(p['chin']-t)/S,(p['cx']-l)/S,
           '  '.join('%s %.1fKB'%(os.path.basename(a),b/1024) for a,b in made)))
    return c

outdir=sys.argv[1] if len(sys.argv)>1 else '.'
prev={k:build(k,p,outdir) for k,p in P.items()}
a=prev['nick'].resize((360,360),Image.LANCZOS); b=prev['rimsha'].resize((360,360),Image.LANCZOS)
s=Image.new('RGB',(734,360),(12,12,16)); s.paste(a,(0,0)); s.paste(b,(374,0)); s.save('pair-preview.png')

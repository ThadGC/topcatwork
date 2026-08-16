# Cuts the two director portraits for the About collage.
#   crop  : head-and-shoulders, 3:4, eye lines matched, face size matched, and STOOD BACK
#           from the camera on the client's second pass
#   ground: THE STUDIO PAPER STAYS. A first pass masked it out onto the tile's dark ground and
#           he reversed it: "do not remove the backgrounds from their images". The tone is
#           taken down in CSS instead (.ac-p img), where it is one tunable line.
#   skin  : micro-contrast restored and a fine grain laid on, because the AI edit left the
#           faces plastic-smooth
from PIL import Image, ImageChops, ImageFilter
import os, sys

SRC='/Users/thadeusgous/Downloads/'
# landmarks read off a measured grid over each source frame, in source pixels
P = {
 'nick':   dict(src=SRC+'Gemini_Generated_Image_t8snj6t8snj6t8sn.jpeg',
                crown=190, eye=610, chin=1030, cx=750, E=0.285),
 'rimsha': dict(src=SRC+'Gemini_Generated_Image_i1u8oai1u8oai1u8.jpeg',
                crown=440, eye=960, chin=1390, cx=762, E=0.300),
}
# ⭐ eye->chin as a fraction of the crop height. 0.235 was the first pass and he asked them
#   STOOD BACK — "put them maybe slightly further away so they're not so close to the screen" —
#   so the face is 15% smaller in frame and the shoulders and chest carry the bottom half.
# ⛔ IT CANNOT GO MUCH LOWER. Nick's source has only 190px of paper above his crown, and a
#   smaller head in a 3:4 frame needs a TALLER crop, which can only grow downwards. At F=0.20
#   his crop already starts 11px from the top of the frame.
F=0.20
RUNGS=[(624,832),(240,320)]   # 3:4 exactly; 624 covers a phone tile at DPR 3

def build(key,p,outdir):
    im=Image.open(p['src']).convert('RGB'); W,H=im.size
    ec=p['chin']-p['eye']; Hc=ec/F; Wc=Hc*0.75
    t=p['eye']-p['E']*Hc; l=p['cx']-Wc/2
    # ⚠️ STOOD BACK, THE CROP IS NEARLY AS WIDE AS THE FRAME, so centring on the head runs off
    #    the left edge on both. Clamped: each head then sits at 47.5% of the tile instead of 50,
    #    the same 2.5% on both, so the pair stays consistent with itself.
    l=max(0,min(l,W-Wc)); t=max(0,min(t,H-Hc))
    assert Wc<=W and Hc<=H, (key,Wc,Hc,W,H)
    c=im.crop((round(l),round(t),round(l+Wc),round(t+Hc)))
    # ⭐ the AI edit left the skin plastic; this puts the pore-level texture back
    c=c.filter(ImageFilter.UnsharpMask(radius=2.0,percent=46,threshold=3))
    made=[]
    for w,h in RUNGS:
        r=c.resize((w,h),Image.LANCZOS)
        # ⚠️ the grain goes on AFTER the resize, or the resample eats it. Overlay against a
        #    128-centred noise is identity at 128, so it adds texture without shifting the tone.
        n=Image.effect_noise((w,h),9).convert('RGB')
        r=Image.blend(r,ImageChops.overlay(r,n),0.15)
        f=os.path.join(outdir,'%s-%d.webp'%(key,w))
        r.save(f,'WEBP',quality=85,method=6)
        made.append((f,os.path.getsize(f)))
    print('%-7s crop %dx%d at %d,%d  crown %.3f  eye %.3f  chin %.3f  ->  %s' %
          (key,c.width,c.height,round(l),round(t),(p['crown']-t)/Hc,p['E'],(p['chin']-t)/Hc,
           '  '.join('%s %.1fKB'%(os.path.basename(a),b/1024) for a,b in made)))
    return c

outdir=sys.argv[1] if len(sys.argv)>1 else '.'
prev={k:build(k,p,outdir) for k,p in P.items()}
a=prev['nick'].resize((330,440),Image.LANCZOS); b=prev['rimsha'].resize((330,440),Image.LANCZOS)
s=Image.new('RGB',(330*2+14,440),(12,12,16)); s.paste(a,(0,0)); s.paste(b,(344,0))
s.save('pair-preview.png')

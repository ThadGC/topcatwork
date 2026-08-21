"""holds.py — where does each generation still sit in the film?

    python3 holds.py <film.mp4> <stills_dir>

⛔ THIS IS THE GUIDE'S §4 WITH NO NUMPY. This machine has PIL only (a standing
constraint — see HANDOVER §9), so the phase-correlation camera-speed table is
dropped and the match is done in pure Python over raw greyscale planes.
⭐ That loses NOTHING that matters: the guide's own §4.3 says plate distance is
the only metric needed once plates exist, because it carries registration AND
blur in one number. The motion table was diagnostic.

The metric is the guide's: zero-mean, unit-variance greyscale, mean absolute
difference. Two passes so pure Python can afford it — a coarse sweep over every
frame, then a refine at full working size around the winner.
"""
import os, subprocess, sys
from PIL import Image

COARSE_W = 80          # sweep every frame at this width
FINE_W   = 320         # the guide's working width, used near the winner
FINE_PAD = 14          # frames either side of the coarse winner to refine


def probe(path):
    # ⚠️ parse BY NAME. `-nk=1` returns the fields in the container's own order,
    # not the order they were asked for, and reading them positionally put the
    # frame rate in the frame-count slot on the very first run.
    out = subprocess.check_output([
        'ffprobe','-v','error','-select_streams','v:0',
        '-show_entries','stream=width,height,nb_frames,r_frame_rate',
        '-of','default=nw=1', path]).decode().split()
    kv = dict(x.split('=',1) for x in out if '=' in x)
    num,den = kv['r_frame_rate'].split('/')
    return int(kv['width']), int(kv['height']), int(kv['nb_frames']), float(num)/float(den)


def decode(path, W, H):
    """every frame as a bytes object of length W*H, greyscale"""
    p = subprocess.Popen(['ffmpeg','-v','error','-i',path,
                          '-vf','scale=%d:%d,format=gray'%(W,H),
                          '-f','rawvideo','-pix_fmt','gray','-'],
                         stdout=subprocess.PIPE, bufsize=W*H*64)
    frames=[]
    while True:
        b=p.stdout.read(W*H)
        if len(b)<W*H: break
        frames.append(b)
    p.stdout.close(); p.wait()
    return frames


def zlut(buf):
    """byte -> z-score lookup for one greyscale plane, from its own histogram"""
    hist=[0]*256
    for b in buf: hist[b]+=1
    n=len(buf)
    mean=sum(i*c for i,c in enumerate(hist))/n
    var=sum(c*(i-mean)**2 for i,c in enumerate(hist))/n
    sd=var**0.5 or 1e-6
    return [ (i-mean)/sd for i in range(256) ]


def score(a, la, b, lb):
    """mean |z(a) - z(b)| — the guide's metric"""
    t=0.0
    for x,y in zip(a,b): t+=abs(la[x]-lb[y])
    return t/len(a)


def main():
    film, stills = sys.argv[1], sys.argv[2]
    sw,sh,n,fps = probe(film)
    CH=max(2,int(round(COARSE_W*sh/sw))//2*2)
    FH=max(2,int(round(FINE_W  *sh/sw))//2*2)
    coarse=decode(film,COARSE_W,CH); fine=decode(film,FINE_W,FH)
    n=min(n,len(coarse),len(fine))
    print('film: %dx%d, %d frames, %.4fs at %g fps  (sweep %dx%d, refine %dx%d)'
          %(sw,sh,n,n/fps,fps,COARSE_W,CH,FINE_W,FH))
    cl=[zlut(f) for f in coarse[:n]]
    fl=[zlut(f) for f in fine[:n]]
    win_fr=int(round(fps)); excl=int(round(fps*2))

    print('\n%-24s %-8s %-7s %-9s %-8s %-9s %s'
          %('still','matches','score','next-best','hold','hold t','worst of the pair'))
    rows=[]
    for fn in sorted(os.listdir(stills)):
        if not fn.lower().endswith(('.png','.jpg','.jpeg','.webp')): continue
        im=Image.open(os.path.join(stills,fn)).convert('L')
        qc=im.resize((COARSE_W,CH),Image.LANCZOS).tobytes(); qcl=zlut(qc)
        qf=im.resize((FINE_W,  FH),Image.LANCZOS).tobytes(); qfl=zlut(qf)
        d=[score(coarse[i],cl[i],qc,qcl) for i in range(n)]
        j=min(range(n),key=lambda i:d[i])
        second=min(d[i] for i in range(n) if abs(i-j)>excl) if n>2*excl+1 else float('inf')

        lo=max(0,j-FINE_PAD); hi=min(n-1,j+FINE_PAD)
        df={i:score(fine[i],fl[i],qf,qfl) for i in range(lo,hi+1)}
        jf=min(df,key=lambda i:df[i])
        if df[jf]>0.30 or second/max(d[j],1e-9)<1.6:
            print('%-24s %-8s %-7.3f %-9.3f  NOT IN THIS FILM — wrong still, or the shot was re-rendered'
                  %(fn[:24],'f%d'%jf,df[jf],second)); continue

        # THE CRITERION (guide §4.4): the engine settles up to a full frame short
        # of t, so both f and f-1 must be good. Pick the f whose worse half is best.
        # The LAST frame is unreachable (the seek clamps off the end), so stop at n-2.
        # ⛔⛔ `blo` USED TO BE `max(lo+1, ...)` AND THAT SILENTLY EXCLUDED FRAME 0. It was written
        # that way so `df[f-1]` always existed, but the guide allows f=0 explicitly and scores it
        # ALONE, because a frame that cannot be undershot has no f-1 to be good. On this film the
        # opening still matches f0 better than f1 (0.114 vs 0.150) and the bug cost the frame the
        # page actually opens on. Caught at D323, by measuring the plate that was sitting at 0.92.
        blo=max(lo,jf-win_fr); bhi=min(n-2,jf+win_fr,hi)
        best_f,best_v=None,1e9
        for f in range(blo,bhi+1):
            v=df[f] if f==0 else max(df[f],df.get(f-1,df[f]))
            if v<best_v: best_f,best_v=f,v
        t=best_f/fps
        print('%-24s %-8s %-7.3f %-9.3f f%-7d %-9.4f %.3f'
              %(fn[:24],'f%d'%jf,df[jf],second,best_f,t,best_v))
        rows.append((fn,best_f,t,df[jf],best_v))

    print('\npaste-ready:')
    for fn,f,t,dj,bv in rows:
        print("    { file:'%s', t:%.4f },   /* f%d, plate distance %.3f, worst-of-pair %.3f */"%(fn,t,f,dj,bv))


if __name__=='__main__':
    main()

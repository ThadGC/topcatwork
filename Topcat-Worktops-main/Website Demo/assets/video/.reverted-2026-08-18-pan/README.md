# The panned narrow cuts — reverted 18 August 2026 (D317)

D316 cut two panned windows out of the 16:9 master — `topcat-intro-556.mp4` (phone) and
`topcat-intro-812.mp4` (tablet) — because the phone was being doubly cropped. The client then sent
a purpose-made **9:16 vertical master**, which is a better answer than any crop of a landscape
film, and asked for the tablet to go back to what it was:

> *"revert what you did for mobile and tablet, use this video I sent here for when someone uses
> mobile only… tablet can revert to the way it was cropped before the last change."*

So the site now runs **three files, one per band**:

| band | file | why |
|---|---|---|
| ≤720 phone | `topcat-intro-9x16-864.mp4` | the client's own 9:16 master, 864×1536 |
| 721–1120 tablet | `topcat-intro-864.mp4` | D312's 4:5 crop at x=680, restored |
| ≥1121 desktop | `topcat-intro-1920.mp4` | the 16:9 master |

⭐⭐ **THE ARITHMETIC D316 FOUND IS STILL TRUE AND STILL WORTH KEEPING**, because it is why the 9:16
master is the right fix rather than a nicer crop. `.hero-vid` is `object-fit:cover` over a hero that
is 100vh on the narrow bands, so a 375×812 phone box is aspect **0.462**. Covering a **0.8** file
(the 864 crop) into it fills the height and discards the sides:

```
555 of 864 px survive          36% of the cut thrown away
master window actually seen    x 835..1389  (D312 intended 680..1544)
upscale on a DPR-3 phone       2.11x        (D312's row recorded 1.35x)
```

⚠️ **THAT IS WHY THE TABLET IS FINE ON THE 864 CROP AND THE PHONE WAS NOT.** A tablet box measures
**0.750** against the file's 0.8 — a 6% side loss, nothing. The phone's 0.462 is the outlier, and a
9:16 file at 0.5625 loses about 18% of its width there, centred, which is simply what a 9:16 film
does on a taller-than-9:16 handset.

⛔ Kept on disk, never shipped (dot-prefixed folder). `pan.py` holds the measured pan tables and the
centroid readings if a panned crop is ever wanted again.

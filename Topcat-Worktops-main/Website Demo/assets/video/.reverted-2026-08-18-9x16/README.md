# The client's 9:16 vertical master — used for one round, reverted 18 August 2026 (D318)

He sent `TC FINAL VIDEO 9x16.mp4` and asked for it on mobile only (D317), then reversed it the same
day:

> *"remove the new mobile video I sent and revert it and take it back to what it was the first time
> we cropped the full desktop video to work for mobile."*

So the phone is back on `topcat-intro-864.mp4` — D312's 4:5 crop of the landscape master at x=680,
shared with the tablet, which is the arrangement that has now survived three attempts to improve it.

## What is in here

| File | What |
|---|---|
| `TC-FINAL-VIDEO-9x16-master.mp4` | ⭐ **HIS OWN MASTER.** 1080×1920, 24fps, no audio, 44.250s — the same length as the landscape master, which is why nothing had to be re-timed. ⛔ **DO NOT DELETE.** ⚠️ It is `.gitignore`d (35 MB), so this folder is the only copy **in the repo** — the client has the original he sent, so it is recoverable, but not from a clone |
| `topcat-intro-9x16-864.mp4` | The shipped encode, 864×1536 crf 28, 4.59 MB |
| `topcat-intro-9x16-864-poster.webp` | Its first frame, 83 KB |

## ⭐⭐ The measured encode table, kept because it cost real time

Mean SSIM against his master, each candidate scaled back up to 1080×1920 — the honest question is
how much detail survives, not how two different resolutions compare:

```
1080x1920 crf 28   6.71 MB   0.9907    upscale 1.27x on a DPR-3 phone
 864x1536 crf 27   5.20 MB   0.9895    1.59x
 864x1536 crf 28   4.59 MB   0.9886    1.59x   <- what shipped
 864x1536 crf 29   4.06 MB   0.9877    1.59x
 864x1536 crf 30   3.61 MB   0.9867    1.59x
  720x1280 crf 26  4.52 MB   0.9890    1.90x
```

⭐ **864/crf28 beats 720/crf26 on both counts at the same size** — less upscale for the same bytes.
⚠️ **CRF 28 IS THE KNEE AND THE SSIM COLUMN CANNOT SEE IT**: at 1125 device px the dark pine mass
above the quarry holds its needles at 28 and smears at 29, while SSIM moves 0.0009 across that step.
Judged by eye, which is what §2 requires.

## ⛔ To bring it back

```bash
cd assets/video/.reverted-2026-08-18-9x16
cp topcat-intro-9x16-864.mp4 topcat-intro-9x16-864-poster.webp ..
```
then give the phone its own pair of `data-src-phone` / `data-poster-phone` attributes on `#heroVid`,
restore the three-band picker in the in-place script and in the scrub (`bandKey()`), and add a
`mPhone` change listener beside `mNarrow`. The D317 commit has all of it.

⚠️ **The 36% arithmetic is the reason this was ever built** and it is recorded on the live element's
own comment, not here, because it is still true of the file that ships: a 375×812 phone box is
aspect 0.462, so `cover` on the 0.8 crop discards 36% of its width and upscales 2.11x. That is now a
choice he has made twice rather than something nobody had noticed.

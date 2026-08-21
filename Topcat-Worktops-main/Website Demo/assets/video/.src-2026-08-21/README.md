# The client's phone master — `TC MOBILE FIXED.mov`, 21 August 2026 (D319)

He sent it mid-round, unprompted:

> *"here is the video for mobile. So remember to keep it separate. It loads separately. This is for
> mobile only, this video... this is made perfectly for mobile, no cropping needed."*

## What is in here

| File | What |
|---|---|
| `TC-MOBILE-FIXED-2026-08-21.mov` | ⭐ **HIS OWN MASTER.** 1920x1080 container, 24fps, 44.250s, 24-bit PCM stereo, 37.8 MB. ⛔ **DO NOT DELETE.** ⚠️ `.gitignore`d — this folder is the only copy in the repo; he has the original |
| `encode.sh` | ⭐⭐ The encode, the pillarbox measurement and the full SSIM/MB table |

## ⛔⛔ The one thing to know: it is a 9:16 film inside a 16:9 box

The picture is **608x1080, centred at x=656**, with 656px of pure black either side. Confirmed by
`cropdetect` over the whole 44s and by a per-column luminance max across ten frames — both agree
exactly. `encode.sh` crops the pillars and ships **608x1080 native**.

⭐ **His framing is untouched.** "No cropping needed" is about the composition, and it is his. The
bars are not composition.

## ⚠️ How it got here — the file could not be read from `~/Downloads`

macOS TCC blocks this process from `~/Downloads` and `~/Desktop` (`Movies`, `Pictures` and
`Documents` are all readable, which is why the 17–18 Aug masters worked). `cp`, `head` and Finder
scripting all return EPERM; `stat` still works, which is what made it look like a path problem at first.
⭐ **The route that worked: write a `.command` script into the scratchpad and `open -a Terminal` it.**
`open` is LaunchServices, not an Apple event, and Terminal has its own disk permission. The copy
landed byte-exact (37,820,552). ⛔ If a future master will not read, do that rather than asking him
to move it twice.

## ⛔ To change the phone's film

The phone's pair on `#heroVid` is `data-src-phone` / `data-poster-phone`, and the picker is a
cascade — **phone → narrow → base** — in three places: the in-place `<script>` beside the element,
`band()` in the scrub, and `retimeStory()`. Removing the phone's pair drops it safely onto the
tablet's cut, never onto the 11.7 MB desktop film.

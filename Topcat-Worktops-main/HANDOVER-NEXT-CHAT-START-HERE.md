# START HERE — 18 August 2026, after THE CLEAN-OUT AND THE FILM'S COPY (D315–D318)

Read this, then `HANDOVER.md` **§D** (the register, newest first — this round is **D315–D318**),
**§2** (the standing rules) and **§2s** (SITE SPEED, new and his own words). That is about twenty
minutes and it is enough to work safely.

> ⚠️ **This replaces the previous version of this same file**, which is now
> `HANDOVER-2026-08-18-scroll-film-round-start-here.md` (D310–D314, the round that built the film).
> Everything that still matters is carried below.

> ⭐⭐ **HE SAID THE VIDEO WORK CONTINUES IN THE NEXT CHAT.** §3 is the current state of the film and
> §13 items 1–4 are the video questions still open. Start there.

---

## 0. ⛔⛔⛔ THE ONE THING TO TAKE FROM THIS ROUND

**⭐⭐⭐ I CHANGED THE MOBILE FILM THREE TIMES IN ONE DAY AND HIS FIRST VERSION WON. EVERY REVERSAL
WAS CHEAP FOR EXACTLY ONE REASON: NOTHING WAS EVER DELETED.**

```
D312  one 4:5 crop of the landscape master at x=680, phone and tablet share it
D316  I found `cover` was re-cropping it and cut two PANNED windows, 556 and 812   → reverted
D317  he sent a purpose-made 9:16 master; phone took it, tablet came back to 864   → reverted
D318  "take it back to what it was the first time we cropped the full desktop video"
      ⭐ back to D312 exactly: two cuts, one media query
```

⛔⛔ **AND THE MEASUREMENT THAT STARTED IT IS STILL TRUE OF THE FILE THAT SHIPS.** On a 375×812 phone
the hero is 100vh, so the box is aspect **0.462**; `object-fit:cover` on the 0.8 crop discards
**42% of its width** and upscales **2.26×**, showing about master x 860..1360 — the island and the
kitchen run, living room cropped off. ⚠️ **That is now a choice he has made twice, not something
nobody had noticed**, and it lives on the live `<video>` element's own comment so it cannot go
missing again. The tablet is fine: its box is 0.750 against 0.8, a 6% loss.

⭐⭐ **THE LESSON FOR THE NEXT CHAT: park, never delete.** Both withdrawn attempts are on disk with
READMEs that name the exact attributes and code paths to restore —
`assets/video/.reverted-2026-08-18-pan/` and `assets/video/.reverted-2026-08-18-9x16/`. If he
reverses again, it is a copy and four lines.

---

## 1. ⭐⭐⭐ WHAT THIS ROUND DID (D315–D318)

```
D321  THE DWELL IS THE DISSOLVE (21 Aug) — parked scroll halved (832 -> 412vh, page
      1926 -> 1506vh) and the plates now fade in and out across the park instead of
      snapping. ⛔ The fade CANNOT be widened in film terms: the picture drifts within
      2-7 frames at every hold. Measured, not chosen
D320  THE PLATES (21 Aug) — his six generation stills overlaid on the frames they were
      generated for, and the DESKTOP film now PARKS on each of them. Page 1100 -> 1926vh.
      ⛔ Desktop only; the narrow bands fetch none of it
D319  THE PHONE GETS ITS OWN FILM (21 Aug) — his `TC MOBILE FIXED.mov`, a 9:16 cut that
      arrived PILLARBOXED inside a 1920x1080 box. Pillars cropped, framing untouched.
      Three bands are now three different films. Phone crop loss 42% → 18%
D315  THE CLEAN-OUT — 18.7 MB of unreferenced files off the host, 60.7% of the shipped
      text was code comment and now comes off on the way out, five dead features deleted,
      two real bugs found by the sweep
D316  THE FILM TELLS THE STORY — three titles passed by the camera, a skip control and a
      scroll prompt. ⚠️ Its mobile half is reverted; the copy and the mechanics all stayed
D317  His 9:16 master on the phone (reverted at D318), THE DEAD SCROLL on the hero, and
      SITE SPEED became a standing rule in his own words
D318  The phone goes back to D312's crop
```

---

## 2. ⭐⭐⭐ SITE SPEED IS A STANDING RULE NOW — HIS OWN WORDS

Unprompted, in the middle of a video instruction: *"just make sure you always keep site speed in
mind, that can be added to handover docs as well. **site speed is key**."* It is `HANDOVER.md` **§2s**
and it should be treated as §2 material.

The five things that actually govern it here:

1. ⛔⛔ **TWO FILMS EXIST AND A BAND FETCHES EXACTLY ONE.** An in-place `<script>` beside the
   `<video>` sets `src` and `poster` during PARSE from `data-src-narrow` or the plain attributes.
   ⛔ **A `display:none` VIDEO STILL DOWNLOADS ITS `src` AND ITS `poster`** — CSS decides what is
   painted, the URL decides what is fetched. **Re-verify zero requests for the other band after ANY
   change to that element or that script.** It is the most expensive thing here to get wrong.
2. ⭐ **`preload="none"` in the markup**, flipped to `auto` by the scrub once the band is known.
3. ⭐⭐ **FIRST PAINT COSTS THE POSTER, NOT THE FILM** — 82 KB narrow, 122 KB desktop, each the
   film's own first frame so there is nothing to swap. Judge hero speed by the poster's weight.
4. ⭐⭐ **COMMENTS COME OFF ON THE WAY OUT (D315).** `make_upload.py` strips every `.html`/`.css`/`.js`
   into `upload/` through `strip_for_host.py`; the working files keep every comment. The landing
   page's first load of html+css+js went **2.35 MB → 0.83 MB**. ⛔ Never strip comments from the
   SOURCE to save bytes — they are the design record and the host copy is already handled.
5. ⭐ **NOTHING UNREFERENCED SHIPS.** Dot-prefixed folders never ship, and an unreferenced-asset
   scan is part of the round.

⚠️ **`dev-server.js` COMPRESSES AND THE HOST MAY NOT** — a byte figure read locally is not what a
visitor gets. ⚠️ **A MEDIA ELEMENT'S OWN FETCH OFTEN DOES NOT APPEAR IN `resource` TIMING** (byte
ranges; the dev server answers 206). Prove "the wrong film did not load" by the ABSENCE of the other
band's URL plus `video.getAttribute('src')`, never by finding your own file in the list.

---

## 3. ⭐⭐⭐ THE FILM AS IT STANDS — START THE VIDEO WORK HERE

| band | file | notes |
|---|---|---|
| **≤720** phone | `topcat-intro-608.mp4` | ⭐ **NEW (D319, 21 Aug).** 3.43 MB, 608×1080 — HIS own vertical cut, de-pillarboxed from `TC MOBILE FIXED.mov` |
| **721–1120** tablet | `topcat-intro-864.mp4` | 5.0 MB, 864×1080, the 4:5 crop of the landscape master at **x=680** (D312) |
| **≥1121** desktop | `topcat-intro-1920.mp4` | 11.7 MB, 1920×1080 |

All three are **44.250s at 12fps / 531 frames**, so the scroll maths is identical at every band.
### ⭐⭐⭐ THE DESKTOP HOLD TRACK AND THE PLATES (D320) — READ BEFORE TOUCHING THE FILM

Desktop no longer maps scroll straight to film time. It alternates **dwell** (parked on one of his
stills) and **travel**, and the plates are the reason:

| hold | frame | t | his still | plate distance |
|---|---|---|---|---|
| 1 | f1 | 0.0833 | `Final F1.png` | 0.097 ⚠️ inside a move |
| 2 | f122 | 10.1667 | `final f3.png` | 0.180 ⚠️ inside a move |
| 3 | f206 | 17.1667 | `F4.png` | 0.008 |
| 4 | f277 | 23.0833 | `F5.png` | 0.006 |
| 5 | f472 | 39.3333 | `New F6.png` | 0.058 |
| 6 | f529 | 44.0833 | `New F7 (1).png` | 0.064 — **the hero rests here** |

- ⛔⛔ **`VH_PER_SEC` (22.6) AND THE DWELLS MOVE TOGETHER.** 22.6 is exactly the old linear pace, so
  a flight feels as it always did and the only new time is the dwells. Dwells are **30 / 50 / 50 /
  50 / 50 / 182vh** (D321), and the 182 is the hero's own from D317.
- ⛔⛔⛔ **THE DWELL IS WHERE THE DISSOLVE HAPPENS, SO IT CANNOT BE DELETED.** The plate distance
  doubles within **2–7 frames** at every hold, so a fade widened in FILM terms shows a stale picture
  over a moving one. Parked scroll is the only scroll a dissolve can be honest on. ⚠️ If he asks for
  less dead scroll again, the dial is the dwell LENGTH (and the dissolve gets steeper with it) —
  never the frame window.
- ⛔⛔ **THE SPACER IS THE TRACK PLUS ONE STICKY SCREEN.** Laid out over the bare sum, every dwell
  comes out 5.8% short and the hero's dead scroll silently loses 100vh.
- ⭐ Plate opacity is driven by the footage's distance from the hold **in frames**, never by dwell
  progress. Solid within half a frame, gone by three.
- ⭐ The 0.56 MB of plate is deferred — attached within 6 film-seconds of its hold, the opening one
  on `load`. ⛔ **Below 1121 nothing is painted and no `src` is ever attached.**
- ⚠️ Re-run `.plates-2026-08-21/holds.py` if the film is ever re-cut; a stale hold table parks on
  the wrong frame. The guide itself is versioned at `Docs/Overlay-for-Scroll-Animation-Guide.md`.

⛔ **THE PICKER IS A CASCADE — phone → narrow → base** — used identically by the in-place `<script>`,
`band()` in the scrub and `retimeStory()`. Deleting the phone's pair drops it onto the TABLET's cut,
never onto the 11.7 MB desktop film.
⚠️ **The phone's second story beat is its own: 16.2–24.4, not the tablet's 21.0–27.5.** On his cut
the shot cuts to black at exactly t=16.0 and the kitchen returns at t=25.
⛔ `.htaccess` holds mp4/webm for a **week** and `?v=` is hand-stamped: **re-encode and bump the stamp
in the same edit, poster included.**

### The numbers, and where each one lives

| What | Where | Value |
|---|---|---|
| pace | `--cineH` on `.cine` | **1100vh** desktop · **900vh** tablet · **800vh** phone |
| ⭐ **the dead scroll** | `--cineHold` | **0.1818** · **0.2000** · **0.2125** — **182vh** of hold on the finished hero |
| where the veil starts | `--cineVeilAt` | **38** (film seconds) |
| the veil's floor | `--cineVeilMin` | **0.20** |
| where the hero's copy rises | `INK_AT` in the scrub | 0.93 of the film |

⛔⛔ **THE PACE AND THE DEAD SCROLL MOVE TOGETHER OR THE FILM SPEEDS UP.** The scrub computes
`film = eased/(1 - hold)`, so raising the hold alone squeezes the whole film into less travel. Raise
`--cineH` by exactly the extra hold. Measured after D317: film pace **166px/s against 165px/s**
before, dead scroll **90vh → 182vh**.

### ⭐⭐⭐ THE FILM'S OWN COPY (D316) — three titles, then the hero

```
1.0- 6.0s   It starts as a mountain.
13.5-23.5s  Then one slab, chosen for its veining.       (narrow bands: 21.0-27.5s, at the TOP)
31.5-39.0s  Then the centre of your kitchen.
   → the hero's own words: Surfaces worth building around
```

⚠️ He quoted the hero as *"surfaces for every space"*; its actual words are **"Surfaces worth
building around"** and the chain lands on those.

- ⭐⭐ **THE WORDS ARE PASSED BY THE CAMERA, NOT LAID OVER THE PICTURE.** The layer owns
  `perspective:1000px` and each line runs `translateZ` from −150 to +560 on **`p*p`**, so the
  approach starts as a drift and ends as a pass. ⛔ A `scale()` was the obvious build and reads as a
  zoom, not as depth.
- ⛔⛔ **THE BEATS ARE PER BAND BECAUSE THE COMPOSITION IS.** `data-at-narrow` / `data-out-narrow` /
  `data-vpos-narrow` win below 1121, re-read from `sync()` so a dragged window re-times. The slab
  beat moves later on a narrow crop because **the slab FILLS a narrow frame at t=18** and has laid
  down into black by t=24.
- ⭐⭐⭐ **EACH LINE CARRIES A MEASURED WASH, WHICH IS D313's MECHANISM REUSED.** Behind the opening
  title the band measured **min 1, max 227, p97 219**, so cream ink under the veil's floor came out
  at **1.98:1** — while its MEDIAN was 8.28:1, the identical trap D313 fell into twice. The scrub
  writes each line's `--lg` from the **97th percentile of a 48×4 read of that line's own band**:
  **1.98:1 → 17.87:1 measured.** One `drawImage` per frame, because only one line is ever up.
- ⛔⛔ **MY FIRST WASH WAS THE THING HE HAS REJECTED TWICE.** The gradient was sized LARGER than its
  box (`62% 130%`), so the box clipped it and it landed as a dark band with a straight edge top and
  bottom — a slab of black across the frame. **`farthest-side` with the last stop at 100% ends the
  fade inside the box.** ⭐ And it is light because the sum says it can be: **0.36 of black is what
  AA 4.5:1 costs here**, so the centre is 0.62 and not the 0.94 that read as a plate.
- ⭐ **Skip intro** moves the scroll AND snaps the playhead — without the snap the eased chase runs
  all 44 seconds past the viewer at speed. **The scroll prompt carries the opening title's own alpha**
  so it cannot outlive the words it belongs under.

---

## 4. ⭐⭐⭐ THE CLEAN-OUT (D315) — WHAT CAME OFF, AND THE ONE THING LEFT ON PURPOSE

- **43 shipped files were referenced by nothing** — 18.7 MB. 18 were `.jpg` masters whose live WebP
  ladder is what pages actually serve, 15 fully superseded subjects, 5 gallery frames named in no
  `gallery:[…]` array, 3 supplied logo originals, 2 team photographs referenced nowhere ever.
  ⛔ **None deleted** — each moved into a dot-prefixed folder with a README.
- **60.7% of the shipped text was code comment** — `index.html` 62%, `site.css` 71%, `site.js` 53%.
  Now stripped on the way out (§2 item 4).
- **Five dead features deleted from the source**: the reviews stack view (its two entry points had no
  caller and the deck's own handler already said *"the stack view is gone"*), the old process
  filmstrip, the `.ph*` placeholder scaffolding, `.tailspace`, and the V2 `.reasons` proof bar.
  ⚠️⚠️ **`.reasons` HAD SURVIVED EVERY EARLIER SWEEP BECAUSE OF ITS NAME** — a scan for "reasons"
  hits the live section title "More reasons to choose us" and eight comments. ⭐ **A dead-CSS scan
  has to test a CLASS TOKEN IN A CLASS POSITION, not a word anywhere in the file.**
- **Two real bugs the sweep found**: the eighth project was missing from the `SS` srcset table, so
  Wimbledon shipped its 1400px card to every phone while `wimbledon-560.webp` sat unrequested; and
  `FIT.reviews` pointed at `#reviews .rev-hint`, an element that no longer exists, so reviews was the
  one entry in that table that could only fall through. ⚠️ Nothing links to `#reviews` today, so that
  one was latent.
- ⛔ **ONE DEAD RULE IS KEPT ON PURPOSE**: `seo.css`'s `.foot-legal a.foot-sitemap` matches nothing
  because no footer carries the class any more, so the Sitemap link renders as faint small print.
  **That is a REGRESSION, not dead CSS** — the rule is the design and the hook is what went missing.
  The fix is one attribute in `build_pages.py`, and it changes 176 footers, so **it is his call**.

---

## 5. ⭐ THE FILES THIS ROUND ADDED OR PARKED

| File | What and why |
|---|---|
| `Website Demo/strip_for_host.py` | ⭐⭐ The comment scanners `make_upload.py` calls — CSS, JS and HTML, each aware of strings, template literals and regex. ⛔ Never touches a working file. ⚠️ **Read its foot: it records a FAKE PROOF written there first** |
| `assets/video/.reverted-2026-08-18-pan/` | D316's panned 556/812 cuts, `pan.py`, the measured centroid readings |
| `assets/video/.reverted-2026-08-18-9x16/` | ⭐ **His own 9:16 master** (⛔ `.gitignore`d — this folder is the only copy IN THE REPO; he has the original), its 4.59 MB encode, poster, and the full SSIM/MB table |
| `assets/site/.src-photography-2026-08-18/` | 18 photographic masters whose ladders are live |
| `assets/site/.superseded-2026-08-18/` | 15 retired subjects with no live rung |
| `assets/team/.superseded-2026-08-18/` · `assets/projects/.unused-frames-2026-08-18/` · `assets/brand/.src-supplied/` | 2 unreferenced team shots · 5 unused gallery frames · the 3 supplied logo originals |

⭐ **EVERY ONE OF THOSE FOLDERS HAS A README** saying what is in it and how to bring it back.

---

## 6. ⛔ DELIVERY

```bash
git clone https://github.com/ThadGC/topcatwork.git topcat && cd topcat
cd "Topcat-Worktops-main/Website Demo" && python3 make_upload.py
```

This build serves:

```
/assets/site.css?v=3f7b573c9d      /assets/site.js?v=bc43f7a486
/services/service.css?v=23cff11fdb /assets/footer.css?v=fb17d2d341
/assets/nav.css?v=349149e16f       /stones/stone.css?v=5e7fdddb8d
/seo.css?v=8c1340947e
```

1. Upload the **CONTENTS** of `upload/` into `public_html`. **633 files, 176 HTML pages, 76.6 MB**
   (was 676 files / 98.4 MB before D315).
2. ⚠️ **"SHOW HIDDEN FILES" ON** — `.htaccess` is the caching fix and most clients hide it.
3. ⛔⛔ **FLUSH SITEGROUND'S DYNAMIC CACHE** (Site Tools → Speed → Caching). It sits in front of
   Apache and ignores `.htaccess` entirely.
4. View-source a stone page and check the `?v=` matches.

⭐ **`main` and `origin/main` are identical** and one `git push` moves both refs.
⛔ **NOTHING FROM D291 ONWARD IS LIVE.** The film has never been on the host.

---

## 7. ⛔ THREE DEVICE BANDS

```
   ≤ 720px          721 – 1120px          ≥ 1121px
   the phone   ·   the tablet        ·   the desktop
```
⛔ **THE TABLET-ONLY BLOCK IS STILL LAST IN THE STYLESHEET** (search `THE TABLET BAND`).
⭐ **Widen a phone rule's own query to reach the tablet, never copy it** — that is how the skip
control was cleared of the WhatsApp float on both narrow bands.
⚠️ The film runs at all three bands, so its rules sit at base scope with only `--cineH` and
`--cineHold` per band.

---

## 8. ⛔ THE GATES — RUN THESE

```bash
cd "Website Demo" && python3 build_pages.py                     # FIRST — writes footer.css AND nav.css
cd "Website Demo/services" && python3 build_services.py
cd "Website Demo/stones" && python3 build_stones.py
cd "Website Demo" && python3 build_seo_pages.py
cd "Website Demo/stones" && python3 harvest/verify.py            # 132/132/132 ✅
```

⛔⛔ **NEVER RUN `trade/build_trade.py`** (reverts trade to 1 Aug). ⛔ `build_images.py` /
`patch_images.py` are one-shot.
**The CSS gate** (brace delta 0, comment delta 1 against the file's own baseline of one) and
**`node --check` on all three inline `<script>` blocks** after every edit to `index.html`.
⭐ `make_upload.py` now runs its own gates: `node --check` on **682 stripped scripts** plus balance
and idempotence per file, and it **stops the build** rather than publish a damaged strip.

### ⭐ THE FREEZE PROBE — 1440×900, FRESH LOAD, TAB IN FRONT

| Signal | Value |
|---|---|
| `.gal-scroll` height | **4950** |
| `--revPer` (on `#reviews`) | **3** |
| `feTurbulence` count | **60** |
| `#svcNav` children | **8** |
| elements | **2680** |
| hero ink (`.hero-inner` padding-top) | **86.1828** |
| `#about` height | **704** |
| collage | **497×621** |
| `#footer` height | **504** |
| `.wheel-ui` width | **480** |
| document height | **24443** |
| broken images / overflow / console errors | **0 / none / none** |

⚠️ **ELEMENTS MOVED 2672 → 2680 AND NONE OF IT IS A REGRESSION**: the story layer and its three
lines, the scroll cue's three nodes, and the skip button.
⚠️ **DOCUMENT HEIGHT MOVED 23543 → 24443** — that is D317's dead scroll, 900px of it.
⚠️ **THE ELEMENT COUNT IS ONLY VALID ON A FRESH LOAD** — the weld stage adds ~93 nodes once built.
⚠️ **Filter broken images on `i.src && i.complete && i.naturalWidth===0`** (`#pmShot` has no src).

---

## 9. ⚠️ THE ENVIRONMENT TRAPS — ALL LIVE, SEVEN NEW THIS ROUND

- ⛔⛔⛔ **A SCROLL ANIMATION IS DEAD IN A BACKGROUND TAB.** rAF does not run in a tab that is not in
  front, so the scrub freezes at `currentTime` 0 with a perfectly healthy video. **Front the tab.**
- ⛔⛔⛔ **NEW — TWO TABS DRIFT TO DIFFERENT VIEWPORTS AND EVERY vh-DERIVED NUMBER DRIFTS WITH THEM.**
  A tab set to 1440×900 was later measured at **1382×863** (starting a second `preview_start` server
  re-lays out the pane). Two builds then "differed" in card size, font size and fitted quote length
  when only the viewport had moved. ⭐ **Read `innerWidth`/`innerHeight` in the SAME probe as the
  numbers you are comparing.**
- ⛔⛔ **NEW — A NARROW LOAD LOOKS EXACTLY LIKE A BROKEN PAGE.** `--stoneRaster:on` below 720px
  deliberately swaps the live marble SVG for a cached bitmap, so `feTurbulence` reads **0** and the
  element count drops ~570. A page LOADED narrow and then resized to 1440 keeps the bitmaps. ⭐
  **Fresh tab, resize, THEN load.**
- ⛔⛔ **NEW — AN INLINE STYLE OUTRANKS A CLASS RULE.** `.gone{opacity:0}` could not hide the scroll
  cue because the scrub had written `opacity` inline. **Hand the property back (`style.opacity=''`)
  when the class is meant to take over.**
- ⛔⛔ **NEW — `hidden` DOES NOTHING AGAINST A CLASS-BASED `display`.** `[hidden]{display:none}` is a
  UA rule and `html.cine-on .cine-skip{display:inline-flex}` is more specific. **A class that sets
  `display` must answer for `[hidden]` itself.**
- ⛔⛔ **NEW — A GRADIENT LARGER THAN ITS BOX GETS CLIPPED INTO A BAND WITH A STRAIGHT EDGE.** Use
  `farthest-side` and end the last stop at 100%.
- ⛔ **NEW — `.gitignore` BY NAME, NOT ONLY BY FOLDER.** Parking the 9:16 master out of `.src-*`
  dropped 35 MB straight back into the index. The rule now catches `TC-FINAL-VIDEO-*` in any
  dot-folder.
- ⛔ **NEW — A MEDIA ELEMENT'S FETCH OFTEN IS NOT IN `resource` TIMING.** See §2.
- ⛔⛔ **CONSOLE ERRORS PERSIST ACROSS RELOADS.** Check
  `performance.getEntriesByType('resource')` for `responseStatus >= 400` before believing it.
- ⛔⛔ **A CSS EDIT DOES NOT SHOW UNTIL THE BUILDERS RE-RUN** (`site.css?v=<hash>`).
- ⛔⛔ **THE PANE'S SCREENSHOT SCALES DOWN OR GOES BLACK after `resize_window` + reload.** Fresh tab,
  navigate, resize, shoot **without** reloading.
- ⭐ **`scroll-behavior:smooth` eats programmatic scrolls** — use `scrollTo({top,behavior:'instant'})`.
  ⚠️ **AND THE EASED SCRUB NEEDS ~2.5s TO SETTLE after a big jump.** ⚠️ **Something re-scrolls the
  phone after an instant jump** — pin the position with a short interval while you settle, or you
  will screenshot the wrong frame.
- ⛔ **LAZY IMAGES NEVER FETCH AFTER resize + instant `scrollTo`** — judge by `naturalWidth`.
- ⛔ **`.rise` REVEALS AND THE REVIEWS WALL DO NOT FIRE AFTER AN INSTANT JUMP** — the wall's entrance
  is scroll-driven, so it reads as "0 cards visible". Scroll for real (`computer` scroll) to test it.
- ⛔ **THE WELD STAGE TEARS DOWN PAST THE HAND-OVER** · ⛔ **A `file://` URL WEDGES THE TAB.**
- (Carried) `javascript_tool` runs before async work settles · `node --check` passes deleted
  variables · **no numpy, PIL only; no libwebp in this ffmpeg (PIL does the WebP); the browser
  canvas is the only SVG rasteriser** · valid stone presets: calacatta, carrara, crema, emperador,
  eternal, fumo, goldveil, mist, nerogold, statuario.

---

## 10. ⭐ THE LINK, AND THE SERVER

```bash
cd "Website Demo" && nohup caffeinate -ims node dev-server.js > /tmp/topcat-server.log 2>&1 &
```

**Give him `http://10.101.1.252:5501`** — ⚠️⚠️ **THE IP MOVED TWICE ON 18 AUG** (192.168.1.106 →
10.101.1.252, a different network). **Re-check with `ipconfig getifaddr en0` every session and at the
start of every reply that hands him a link.** A dead link presents as *"most of the images aren't
loading"*, because a cached page keeps rendering while every new lazy image fails.
⭐ **THE SERVER IS DETACHED ON PURPOSE.** ⛔ Do not `preview_stop` it. ⚠️ It DOES need a restart after
any edit to `dev-server.js`.
⭐ **USE `http://localhost:5501` IN THE PREVIEW PANE**, on his instruction.

---

## 11. ⭐ WHERE THINGS STAND

| Page | State |
|---|---|
| **`/`** | opens on his film, scrubbed at every band, **three titles passed by the camera**, skip control, scroll prompt, **182vh of dead scroll on the finished hero**; skeleton bar until the hero leaves |
| **`/about/` + six internal** | the `.page-head` family; directors visible and bright at all bands |
| **`/services/*.html`** | nine leaves, each on its OWN photograph; burger nav ≤1120; quote card ≥1121 |
| **`/stones/`** | 132 pages + collection + compare; white ledes; **no quote card, deliberately** |
| **`/materials/` `/guides/` `/worktops/` `/sitemap.html`** | the 26-page SEO layer; 22 carry the quote card |
| **`/trade/`** | eight sections; CTA carries WhatsApp |
| **all 176 pages** | one footer, one mobile nav, og:image + twitter:card, favicon, hours **Mon–Sun 7am–9pm**, and **no code comments in view-source** |

⚠️ **SHARED PHOTOGRAPHS NOT TO DELETE**: `kitchen-day.jpg`, `hero-night-*`, `og-cover.jpg`,
`team/fitting.jpg`, and everything inside the dot-folders listed in §5.
⚠️ **`cta-slab.jpg` and `hero-kitchen.jpg` ARE NO LONGER LIVE** and the builder comments that said
they were have been corrected — the page serves `cta-slab-2752.webp` and `hero-night-2752.webp`.
⭐ **MEASURE WHAT THE PAGE ASKS FOR BEFORE BELIEVING A COMMENT ABOUT IT.**

---

## 12. ⛔ RULES THAT MUST NOT BE BROKEN

1. ⛔ **Fabrication is IN-HOUSE (D202)** — "our experienced fabricators". It has flipped three times.
2. ⛔ **Never "laser" anything.** They template **by hand**.
3. ⛔ **The brand is "Topcat", one word.**
4. ⛔ **A stone's NAME and PHOTOGRAPH must match the supplier's own.**
5. ⛔ **Never state what we cannot guarantee, and never use an absolute.** A seam is always visible.
6. ⛔ **Every measurement in millimetres.**
7. ⛔ **Never a bright or gold line across the TOP of a card or section.**
8. **No showroom. Never show the review count. Value, not cheap.**
9. **Voice:** quietly confident master. British English, commas not em dashes, no exclamation
   marks, **no AI slop, no jargon**. ⚠️ Customer review quotes are verbatim and exempt.
10. ⛔ **The logo is the client's artwork, never re-drawn, never re-coloured, never generated. Set
    HEIGHT only.** ⚠️ Every supplied lockup is the LIGHT artwork — it needs a dark ground.
11. ⛔⛔ **A mark is never put in a circle, ring, disc or plate.** ⚠️ A control is not a mark.
12. ⛔ **One device at a time unless he says otherwise.**
13. ⭐⭐ **THIS IS A DESIGN BUILD. NEVER RAISE THE MISSING FORM BACKEND AS A BLOCKER.**
14. ⛔⛔ **2 CREDITS MAXIMUM PER GENERATED IMAGE.** ⭐ **The last ten rounds spent nothing.**
15. ⭐⭐⭐ **SITE SPEED IS KEY** — his own words, §2 above and `HANDOVER.md` §2s.

---

## 13. OPEN — DO THESE NEXT

### ⭐⭐⭐ The video, which he said continues in the next chat

1. ⭐⭐⭐ **THE MOBILE FRAMING IS STILL THE 42% CROP.** He has chosen it twice, so do not re-cut it
   unprompted — but he has also complained about it once. **If he raises mobile framing again, the
   options are already measured**: his 9:16 master is parked and ready (§5), and the panned crops are
   too. ⛔ Ask nothing; if he names it, restore in four lines.
2. ⭐⭐⭐ **THE FILM'S PACE AND THE DEAD SCROLL.** `--cineH` 1100/900/800vh and `--cineHold`
   0.1818/0.2/0.2125. Both are one number per band and **they must move together** (§3). This is the
   most likely thing he wants adjusted first.
3. ⭐⭐ **DOES THE FILM WANT SOUND?** The landscape master carries 24-bit PCM; the site drops it and
   nothing on the page can play audio. Never discussed.
4. ⭐ **THE 19 DRONE VIDEOS** (Hornchurch, Rickmansworth) — now that the site carries film, worth
   re-asking about.
5. ⭐ **THE LANDSCAPE-TABLET CROP** — a 1024-wide tablet held landscape shows the crop's middle band
   and clips the pendant tops. Rare, and a landscape-only framing nudge is one line.

### ⭐⭐⭐ The ones that are costing money

6. ⭐⭐⭐ **HOW DO FILES ACTUALLY REACH `thadeusg3.sg-host.com`?** Asked ten times. §6 is exact and
   clone-tested. **Everything from D291 onward is still NOT live, including the entire film.**
7. ⭐⭐⭐ **WHOSE ARGENTO DOES HE SELL?** His reference is a dense flecked grey-white; the site shows
   the supplier's veined marble-look. ⛔ Do not paste the Google image.
8. ⭐⭐ **THE STONE PHOTOGRAPHY AUDIT** — 24 of 132 verified; **92 Nile Stone tiles unverified**.

### ⭐⭐ His call

9. ⭐⭐ **THE PHONE'S BAR** — the skeleton crosses his 11-Aug *"already formed from the top"* ruling.
   **One word puts it back: delete the two `header.bar.preform::after` lines.**
10. ⭐⭐ **THE SITEMAP LINK'S GOLD STYLING** — `seo.css` has the rule, no footer has the hook, so it
    renders as small print (§4). One attribute in `build_pages.py`, 176 footers changed.
11. ⭐⭐ **A QUOTE CARD FOR THE PHONE AND TABLET.** D300 is desktop-only because he said "for desktop
    specifically".
12. ⭐⭐ **Trade terms** — payment, minimum order, lead times, a dedicated contact. **His stated first
    priority.**
13. ⭐⭐ **Two sentences for Nick and Rimsha** · **the credit ceiling** · **Calacatta Gold licensing**
    · **the fireplace scope, with Nick** · **Ali Jaffer and Kav / Uxbridge** (two Drive folders
    matching no project).
14. ⭐ **Confirm the silica / HSE sentence in his own words (D202).**
15. ⭐ **Kitchen islands is not on his service list** — the page is live, linked and dressed (D294).
16. ⭐ **Trustpilot** — recommended against putting 4.0 beside the Google 5.0. He has not ruled.
17. ⚠️ **RIMSHA OR REMSHA?** Still unresolved. Her name is on a public page under her photograph.
18. ⚠️ **THE HORNCHURCH GALLERY SET** — the lead frame is clear, the other 11 were never checked
    frame by frame. Do it before launch.
19. ⚠️ **Two slabs lean blue and nobody has ruled**: `arabescato-grey` (−13.78),
    `calacatta-gold-shimmer` (−12.39).
20. ⭐ **Facebook, TikTok, YouTube?** ⛔ Do not guess handles.

### ⭐ Ready to build

21. ⭐ **Per-stone og:image** (each stone page sharing its own slab photograph) — 132 conversions.
22. ⚠️ **`Next Stone Slabs` is named in one place** — sanctioned by D203. Read D203 before "fixing".
23. ⚠️ **The stale branch `tablet-round-d197-d200`** — deletable once item 6 is answered.
24. ⭐ **Pick a production host**; brotli; check the `.htaccess` cache rules survive it. ⚠️ **The
    video makes this urgent** — 76.6 MB, and the mp4 rules are new and untested on the host.

**Still waiting on the client:** whether Quartzite becomes a fourth range, 20mm vs 30mm pricing,
brackets for vanity tops / fireplaces / tables, and the £3k vs £3,850 three-slab discrepancy.

**CLOSED this round:** the code comments reaching view-source; 18.7 MB of unreferenced uploads; five
dead features; the Wimbledon srcset gap; `FIT.reviews`; the film's copy; the dead scroll; and site
speed as a written rule.

---

## 14. ⭐ HOW THIS CLIENT WORKS

⛔⛔⛔ **DO NOT ARGUE YOURSELF OUT OF SOMETHING HE ASKED FOR, AND DO NOT HAND HIM THE DILEMMA.**
**A real constraint is a problem to solve, not a question to return.**

⛔⛔ **DO NOT ASK HIS PERMISSION. Commit, push, report.**

⭐⭐⭐ **HE REVERSES HIMSELF FREELY AND FAST, AND HE REVERSES YOU FASTER.** This round the mobile film
changed three times in one day and his first version won. **The way to make that cheap is to park
everything and delete nothing**, with a README naming the exact restore path. Log the reversal and
the reason the old decision existed, and rebuild without argument.

⭐⭐ **HE SENDS CORRECTIONS MID-TURN, THREE OR FOUR DEEP.** Finish the one you are on, then take the
next in his order.

⭐⭐ **WHEN YOUR OWN WORK CAUSED THE FAULT, SAY SO IN THE FIRST LINE.** He is fine with that and not
fine with spin. Four of this round's bugs were mine and all four were found by SCREENSHOTTING, not
by reading the code.

⭐ **HE IS USUALLY RIGHT ABOUT THE DIAGNOSIS, NOT JUST THE SYMPTOM.** *"It's facing more towards the
kitchen side"* was a 36% crop nobody had done the arithmetic on.

⚠️ **HE SWEARS WHEN SOMETHING LOOKS WRONG, AND THE COMPLAINT IS ALWAYS REAL.**

- **Walk the journey, do not check the page.** ⭐⭐ **Look at the result before reporting it done.**
- **Measure, then claim** — and if you could not measure it, say so.
- ⭐⭐ **AND CHECK THE VIEWPORT IN THE SAME BREATH AS THE NUMBER.** Two of this round's "regressions"
  were me comparing measurements taken at different widths.

---

## 15. BUDGET AND THE DOCUMENT SET

⭐ **This round spent 0 credits.** Every encode and crop was `ffmpeg`; the films are his own.

| File | What it is |
|---|---|
| **`HANDOVER.md`** | ⭐ The single current state. §D is the register, **D1–D130, D132–D318**. §2 the standing rules, **§2s SITE SPEED**, §2a the supplier list. ⚠️ **THERE IS NO D131 ROW.** ⚠️ Section numbers are referenced from code comments — **do not renumber** |
| **`Website Demo/index.html`** | ⭐⭐ The whole landing design, inline `<style>` and three `<script>` blocks. Search `THE SCROLL FILM`, `THE FILM'S OWN COPY`, `cine-line`, `--cineHold`, `hero-navgrade`, `THE WELD`, `SLAB_V`, `THE TABLET BAND` |
| **`Website Demo/build_pages.py`** | ⭐⭐ The seven internal pages, `site.css`, `site.js`, **`footer.css` and `nav.css`**. ⚠️ **RUN IT FIRST** |
| **`Website Demo/make_upload.py`** | ⭐⭐⭐ Writes a clean `../upload/`. ⚠️ Dot-prefixed folders never ship (D314) and **comments are stripped on the way out** (D315) |
| **`Website Demo/strip_for_host.py`** | ⭐⭐ The comment scanners. ⛔ Never touches a working file. ⚠️ Its foot records a fake proof written there first |
| **`Website Demo/.htaccess`** | ⭐⭐ Cache rules, mp4/webm for a week. ⚠️ A dotfile |
| **`assets/video/`** | ⭐⭐ Two cuts + posters, `.src-2026-08-18/` (landscape master, `encode.sh`), and two `.reverted-*` folders |
| **`assets/footer.css` `assets/nav.css`** | ⛔ **GENERATED.** Never edit |
| **`services/service.css`** | ⭐⭐⭐ Dresses all 167 generated pages. ⛔ No footer rules |
| **`services/build_services.py`** | ⭐ Nine leaves. `HERO_IMG`; `qform_html()` |
| **`build_seo_pages.py`** | ⭐ The 26-page SEO layer and the sitemap |
| **`stones/build_stones.py`** · **`stones/descriptions.py`** | 132 stone pages + collection + compare, carries `SLAB_V` · one line per stone |
| ⛔ **`trade/build_trade.py`** | ⛔⛔ **SUPERSEDED — DO NOT RUN** |
| ⛔ **`build_images.py` `patch_images.py`** | ⛔⛔ **ONE-SHOT, CANNOT RUN AGAIN** |
| `Docs/topcat-worktops-SEO-LOG.md` | Every URL, title and target query |
| `HANDOVER-2026-08-18-scroll-film-round-start-here.md` | ⭐ The START HERE this file replaces (D310–D314) |
| `HANDOVER-archive-to-2026-08-06.md` | ⚠️ **Every design the client rejected, in his words.** Read before redesigning anything |

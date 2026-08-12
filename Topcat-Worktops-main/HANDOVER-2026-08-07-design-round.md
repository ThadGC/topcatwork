# TopCat Worktops — Session Handover, 7 August 2026 (second session)

**Session: the sitemap, the two scroll animations, the FAQ redesign, and the enquiry form's foot.**

This document records **what changed, what happened, what decisions were made and why**, per the
client's standing instruction that every handover is explicit about all four.

Read alongside:
- `HANDOVER.md` — ⭐ **the standing state of the site. Start there in a new chat.** Everything
  below is also folded into it; this file is the narrative and the reasoning.
- `HANDOVER-2026-08-07-seo-build.md` — the earlier session the same day, which built the SEO layer
- `Docs/topcat-worktops-SEO-LOG.md` — the SEO record, written for the client's SEO specialist
- `HANDOVER-archive-to-2026-08-06.md` — every earlier round and every rejected design

**Backups taken:** `Website Demo/index.html.pre-sequence.bak` (before the animation work) and
`Website Demo/index.html.pre-faq-redesign.bak` (before the FAQ, the CTA foot and the card backs).

---

## 1. WHAT THE CLIENT ASKED FOR, IN THEIR OWN WORDS

Six asks across the session, three of them refined mid-flight after seeing the first attempt.
The refinements are the useful part of the record, so they are kept verbatim.

| # | Ask | Refined to |
|---|---|---|
| 1 | *"Add a sitemap into the footer of the site, next to the privacy policy or whatever else is there, so that we can explore all the SEO stuff when needed."* | — |
| 2 | *"As the user scrolls I want it to basically form one by one from the top card. So the top card is obviously angled, so you see the back, then the next one and the next one. Almost animate in one by one semi quickly."* | *"A little bit too fast. It finishes the animation before the user even reaches the end. So slow it down slightly."* |
| 3 | *"Currently when I am on the full screen it hasn't fully animated in. So make sure it always fully animates in and is not tied to the scroll. It's just tied to the view."* | — |
| 4 | *"Now that we have so many questions, we need to redesign that whole section. It has to be incredible, immaculate. Fit with the rest of the design."* | *"Three in each category, either three or four, so it all looks even and nicely spaced."* |
| 5 | *"Add the call us directly button back below the send my enquiry. Or maybe request a call, whatever you think is best. Otherwise we just need to optimise that empty space below the send my enquiry button."* | — |
| 6 | *"The top card and the bottom card showing the back, that's currently just slightly too dark. Make it a lighter card, some grey or faded white that fits within the brand. I want those to stand out a little bit more."* | *"Let's not make it pure white."* → *"Give it a stone design."* |

---

## 2. THE ONE THAT MATTERED MOST: a build that could never finish

Ask 3 read like a taste note. It was a defect, and it is worth understanding because the same
trap is waiting for anything else put on that engine.

**What was happening.** The "More reasons to choose us" mosaic was driven by `scrollSequence()`,
which reads progress off the block's travel through the viewport. Progress only reaches 1 once
the block's top has climbed to `END·vh` — 0.10 of a viewport, near the top of the screen. But the
Why section is built to fit **one screen**. A visitor who frames the whole section, heading and
all, never scrolls the mosaic that high, so the last tiles sat permanently part-built.

**And it got worse on bigger screens**, because a taller window frames the section sooner.
Measured with the section framed:

| Viewport | Mosaic top | Progress reached | Last tile's opacity |
|---|---|---|---|
| 1920 × 1080 | 0.259 vh | 0.81 | **0.82** |
| 1440 × 900 | 0.285 vh | 0.78 | 0.70 |

0.82 is exactly the dim "04" in the client's screenshot. The engine needed 0.10 vh and the reader
was never going to give it.

**The fix.** A second engine, `viewSequence()`, sitting beside `scrollSequence()` and taking the
same `(host, tiles, apply, opts)` contract, so a block can move between the two without touching
its `apply()`. The only difference is what drives the progress figure:

| | `scrollSequence` | `viewSequence` |
|---|---|---|
| clock | scroll **position** | elapsed **time** |
| used by | **About** | **Why** |
| scrolling back up | unwinds | stays built |
| can it fail to finish? | **yes, see above** | no |

The motion itself is unchanged. Only its clock.

⚠️ **About was checked, not assumed.** Its collage sits high in its own section, so with the About
section framed the collage top is at 0.12 vh, progress reaches 0.89 and the last tile saturates.
Verified at both 1080 and 610 viewport heights. **About keeps the scroll lag the client
explicitly asked for on 6 Aug. Do not "fix" it to match.**

**Before putting any block on `scrollSequence`, do this sum:** measure the block's top as a
fraction of vh with its section framed, and check it is below `END`. If it is not, the build will
never finish and you want `viewSequence`.

---

## 3. WHAT ELSE WAS BUILT

### 3.1 `/sitemap.html`, linked from every footer

- **Generated by `build_seo_pages.py`** from the same lists the pages come from, plus
  `stones/catalogue_source.py` for the 52 stones. ⚠️ **Never hand-edit it** — it cannot drift out
  of sync as long as nobody tries.
- Groups: the main pages, 6 services, 5 materials, 9 guides, 4 counties + 4 towns, and all 52
  stones in three columns by material. 591 words.
- Linked from the legal bar of **87 of 89** non-V2 pages. The two without it are `versions.html`
  (the dev version chooser) and `index-v2.html` (stale and unlinked).
- On the landing page it is **first** in the legal bar. ⚠️ Privacy, Terms and Cookies beside it
  are still `href="#"` placeholders waiting on the client's policies. Sitemap is the only one of
  the four that goes anywhere.
- Site total is now **35 indexable pages, ~33,400 words.**

### 3.2 The services helix builds one card at a time

The six cards arrive **in spatial order, top of the spiral first**, over **~1.9 seconds**.

- **The order is computed, not hardcoded** — sorted by resting `d` (signed step from the front)
  descending, so changing `ORDER` cannot silently scramble it. The sequence is: the top card
  showing its back, the angled one below it, the **front** card third, then the two beneath.
  The front card is deliberately *not* first; the client described a path down the spiral.
- ⚠️ **The entrance is a MULTIPLIER inside the existing `render()`, not a second transform
  system.** At `en=1` every added term is identity. **Verified: the seated state is byte-identical
  to before the change** — every transform, `--hxO`, `--hxB` and z-index. A resize, a drag or a
  click mid-arrival all stay correct because the resting geometry is still the only source of
  truth.
- **Slowed after review** (ask 2): 560/150ms → **820/265ms**, and the observer threshold went
  0.25 → **0.42**. Both were needed. Slowing it alone would have moved the same problem later.

### 3.3 The card backs are now a real slab

Black marble on a near-black ground, dimmed to ~62% for depth, disappeared entirely.

- The reverse now runs through **the site's own `marble()` engine**, preset `calacatta` — warm
  off-white, grey structure, gold veining. Literally the same stone the wheel and the estimator
  draw, which is the point. **Not pure white**, which the client ruled out.
- **A different seed per card**, so the six backs are six different slabs rather than one repeat.
- ⚠️ `preserveAspectRatio="none"` plus `background-size:100% 100%`, the same swap the estimator's
  `face()` makes. `marble()` draws a **portrait** slab and these cards are landscape, so slicing
  showed a narrow band and most of the vein network never appeared.
- ⚠️ **Everything inside had to flip with the ground.** Gold type on bone is about 1.6:1 and
  unreadable, so the wordmark is warm charcoal and only the diamond and the rules stay metal.
- ⚠️ **The back face has its own gentler depth ramp**, remapped in CSS off the same `--hxB`:
  `brightness(calc(0.42 + 0.58 * var(--hxB)))`. Doing it here rather than in `render()` means the
  photo faces keep exactly the falloff they were designed with.

### 3.4 The FAQ, rebuilt as a contents page

**The old design was approved at eight questions and worked there.** Twelve broke it: the rail
split into two columns, every row wrapped to two or three lines, and it read as a wall of text
beside a mostly empty panel. ⭐ **Nothing was wrong with it except the number of questions**,
which is worth remembering before treating any approval as permanent.

Three moves, in order of how much they matter:

1. **Four named groups of three.** Four chunks of three is a set a reader can hold; twelve equals
   is not. This is the whole idea, the rest is detail.
2. **Each row shows a short LABEL, not the question.** `What it costs`, not *How much does a stone
   worktop cost?* One line per row is what makes the eye run down a column. The full question is
   on the plate and is the button's `aria-label`, so nothing is lost.
3. **The plate moved from beside the index to beneath it, full width.** A two-sentence answer in a
   tall narrow column is mostly air.

| Group | Rows |
|---|---|
| Price and guarantee | What it costs · Hidden costs · Our guarantee |
| How it works | How long it takes · Who comes to your home · Where we work |
| Your stone | Choosing your stone · Matching your slab · Porcelain and sintered |
| Living with it | Seams and joints · Hot pans and heat · Silica and safety |

⚠️ **The groups must stay EVEN.** The first version was 2/3/3/4 and the short first column read as
a mistake; the client asked for even columns directly. The aftercare question moved to **Price and
guarantee** to balance it, which is also honest — that answer is about coming back free of charge
and the ten year guarantee, a commercial promise rather than a maintenance tip. A thirteenth
question means four rows in *every* group, not five in one.

**The a11y pattern changed, and the reason matters.** It was a `role="tablist"` with a roving
tabindex, which was right for a flat rail of eight. It is wrong now: the questions sit under four
real headings, and **a tablist whose children include headings is invalid ARIA**. Each question is
now a plain `<button>` with `aria-controls` on the plate, the live one carries `aria-current`, and
the plate is `role="region" aria-live="polite"`. Tab walks the twelve; arrows are an enhancement
(Up/Down walk the flat order, Left/Right jump groups). **Do not put `role="tablist"` back without
also flattening the groups.**

### 3.5 The foot of the enquiry form

There was **~119px of dead column** under the submit button. Three things fill it, in the order
someone hesitating over a submit button wants them:

1. **A second way in** — a ghost "Call us on 0800 098 2812" under the gold submit. ⚠️ It is the
   **phone, not a callback request**: `tel:` works today, whereas "request a call" would be a
   second promise with no backend behind it, and the site already has one of those (§7.0). Ghost
   under gold, stacked — a clear primary and secondary, *not* the two co-equal side-by-side
   buttons that split intent in the hero.
2. **"What happens next", three numbered lines.** The unspoken question at a submit button is
   "what am I actually signing up for". Every line restates a promise the page already makes.
3. **The reply promise**, kept, as the last word.

---

## 4. THINGS FOUND IN PASSING, WORTH THE CLIENT AND THE NEXT SESSION KNOWING

### 4.1 ⚠️ The go-live compliance scans were broken and had been for some time

Every scan in the SEO log used `grep -v "^./v2/"` to exclude the dormant V2 build. **BSD grep on
macOS prints `v2/faq.html`, not `./v2/faq.html`**, so the anchored pattern matched nothing and
every scan came back full of V2 hits. Anyone running the checklist would have learned to ignore
its output, which is the worst possible outcome for a checklist.

Fixed to `(^|/)v2/` in both the SEO log §8 and `HANDOVER.md` §2. Under the corrected filter the
scans are clean: the only hits are the two documented exceptions (a code comment recording the
FAQPage removal, and the `sup:` field in the stone data, which is never rendered).

### 4.2 ⚠️ The clamp-floor debt is real and it bit twice

`.cta-form`'s row gap (11px), input padding (12px), textarea floor (76px) and submit padding
(13px) were all **flat px** and could not shrink at all on a short window. That was survivable
while the form was the shorter of the two columns and stopped being survivable the moment
anything went in below the submit button: the section went from 463px to **647px at 1366×610**,
past one screen. All four are vh-aware now and the section is **582px**.

⭐ **Both times this session, a floor violation was found by a section breaking, not by a sweep.**
`HANDOVER.md` §7.8 has been rewritten to say that flat px measures are the worse half of this
problem and the easier half to miss, because they do not look like clamps at all.

### 4.3 There is no `/services/` index page

Materials, guides and areas each have a hub. Services does not — building the sitemap is what
surfaced it. Not a break: the six pages are linked from the landing section, the footer and every
"Not only kitchens" block. But it is the one family without a hub, and a hub would be the natural
landing page for the broader-than-kitchens positioning D23 asked for. **Not built, because it
needs copy the client has not seen.** Logged as open item 17.

---

## 5. WHAT WENT WRONG DURING THE SESSION

Recorded so it is not repeated.

1. **A `const` in its temporal dead zone killed the whole helix.** The entrance's slot ordering
   called `mod()`, which is a `const` arrow function declared further down the same IIFE. It threw
   `Cannot access 'mod' before initialization`, the IIFE died, and every card rendered invisible.
   The modulo is written out inline now. ⚠️ **This IIFE has two of these traps** — `attachGlow`'s
   registry and `marble()`'s `STONES` presets are both consts declared later, which is why the
   card backs are applied in a deferred `setTimeout(…, 0)`.
2. **A hand-picked `min-height` for the FAQ plate was out by 11px at 1366×610**, so the section
   jumped when you picked a question — breaking the one rule that has survived all four versions
   of that section. **Fix adopted: measure it.** `lockPlate()` collapses the plate, runs all
   twelve answers through it, keeps the tallest and pins it. It re-runs on `fonts.ready` (a height
   measured in the fallback font is the wrong height) and on resize, debounced. How tall an answer
   renders depends on viewport width, font size at that width and where lines happen to break —
   nobody can hold that in their head, and the next person to edit an answer would not think to
   re-check it.
3. **The CTA additions blew the one-screen budget** before the clamp-floor fix in §4.2 above.
4. ⚠️ **The Browser pane runs with `document.visibilityState === 'hidden'`, so `requestAnimationFrame`
   is fully paused.** A rAF counter installed from the pane reads **zero frames** between two
   calls. Anything on a time-driven clock appears frozen part-built and you will "find" a bug that
   is not there. The method that works, and the one that verified everything in this session:
   copy the page, insert a shim above `</head>` that swaps rAF for a queue you drain yourself,
   then step the timeline by hand.
   ```js
   window.__q=[];
   window.requestAnimationFrame=function(cb){window.__q.push(cb);return window.__q.length;};
   window.__pump=function(t){var q=window.__q;window.__q=[];q.forEach(function(cb){cb(t);});};
   ```
   ⚠️ **The IntersectionObserver that starts these builds also needs a rendering opportunity**, so
   scroll in one `javascript_tool` call and pump in the *next* one. Pumping in the same call as
   the scroll reads all zeroes. Delete the copy afterwards. Full detail in `HANDOVER.md` §8.

---

## 6. VERIFICATION

All of the following passed at the end of the session.

**Whole site**
- **4,185 internal links checked, 0 broken, 0 orphaned pages** (3,975 before the sitemap).
- JSON-LD valid across all 87 non-V2 pages. Inline JS parses (`node --check`).
- Compliance scans clean under the corrected V2 filter (§4.1).
- All routes 200, including `/sitemap.html`.

**Landing page**
- **Zero JS errors** walking the whole page top to bottom with every rAF path pumped.
- No horizontal scroll at 375 / 1440 / 1920.
- Estimator still opens at £2,000 – £2,500 with four material tabs. Footer 6 columns, legal bar
  four links.

**The two builds, measured rather than eyeballed**
- Why mosaic reaches opacity **1.00 on all six tiles** at 1440×900, 1920×1080 and 1366×610 — from
  the scroll position where the old engine stalled the last tile at 0.82. Stays built on the way
  back up.
- Helix arrives top-first over ~1.9s; **seated state byte-identical** to before the entrance was
  added; all six backs carry a generated slab.

**The FAQ**
- Four even columns of three.
- ⭐ **The plate holds ONE height across all twelve answers at every size tested** — 1440×900 →
  196px, 1366×610 → 164px, 1200×655 → 164px, 1512×824 → 199px, 1920×1080 → 216px, 900×900 →
  176px — with no answer overflowing.
- Tab walks the twelve; arrows step column-wise; Left/Right jump groups; Home/End work; exactly
  one `aria-current`; the full question is each button's accessible name.
- Four columns → two at 1040px → one at 760px, where the plate moves inline under the picked
  question.

**The enquiry form**
- Both columns finish level. Section 582px at 1366×610, against 647px before the clamp fix.

**One-screen rule** — hero, About, Why, FAQ and the contact card each inside one screen at
1366×610, 1200×655, 1512×824, 1440×900 and 1920×1080.

---

## 7. WHAT IS STILL OPEN

Unchanged in priority from the previous session. Nothing here was closed by this one.

1. ⭐⭐ **The enquiry form still has no backend**, and it carries file uploads. Still the
   highest-value technical task on the site. The client was burned by a previous agency, their
   live site produced one client in nine months, and they will judge this engagement on
   **measurable leads**. There is nothing to measure. ⚠️ This session added a "Call us" button to
   that form's foot precisely *because* a callback request would have been a second promise with
   nothing behind it. See `HANDOVER.md` §7.0.
2. **Conversion tracking**, which depends on 1.
3. **Real photography.** Stone catalogue and project gallery are both placeholders, and the
   location pages were built to assemble themselves from real dated projects. Photograph every
   install with its town and date.
4. **Mobile and tablet pass**, still the agreed next phase after desktop.
5. **The estimator's product-type selector**, blocked on Nick supplying non-kitchen brackets.
6. **A `/services/` index page** — new this session, see §4.3.
7. **A real clamp-floor sweep**, see §4.2.
8. **"Request a call" in the hero** still wants demoting to a text link. Raised four times, never
   answered. ⚠️ Not the same thing as the new button in the CTA form: that one is a secondary
   under a primary, which is exactly what the hero's two co-equal buttons are not.
9. **V2 (`/v2/`) was not touched** and still carries in-house fabrication claims and dead schema.

### ⭐ The client has not seen any of this

Nor most of the previous session's work. The full unseen list is in `HANDOVER.md` §7.16.

⚠️ **The animations can only be judged by eye, and only in a real browser** — watch them scroll
it rather than describing it, and see §5.4 above for why the preview pane cannot show them.

⚠️ **The FAQ and the helix card backs each went through client feedback rounds inside this
session, so what is on the page is the third iteration of both.** Show them the current state
rather than the journey.

---

## 8. DECISIONS ADDED TO THE REGISTER

All are in `HANDOVER.md` §D with the client's own words.

| # | Decision |
|---|---|
| D25 | An HTML sitemap at `/sitemap.html`, linked from every footer |
| D26 | The Why mosaic is tied to the VIEW, not the scroll — **partially reverses D11** |
| D27 | The services helix builds as you arrive, one card at a time from the top |
| D28 | The helix arrival is ~1.9s, not 1.16s |
| D29 | The FAQ is a grouped contents page, four categories of three — **supersedes D11b** |
| D30 | The enquiry form gains a "Call us" ghost button and a "what happens next" strip |
| D31 | The helix cards' reverse is a real generated slab, not black marble |

Two rows were also moved to the reversed-and-superseded table with their reasons:
**D11a** (the Why mosaic on scroll position) and **D11b** (the FAQ rail, *"that's perfectly
fine"*). ⚠️ D11b is the instructive one: **it was an approval of a design at a size, not of the
design forever.** The rest of D11 stands.

---

## 9. FILE MAP FOR THE NEXT SESSION

| Path | What it is |
|---|---|
| `HANDOVER.md` | ⭐ **Start here.** The standing state, and everything above folded in. |
| `Website Demo/index.html` | The landing page, hand-authored single file, ~922KB |
| `Website Demo/build_seo_pages.py` | ⭐ Generates materials, guides, areas **and `/sitemap.html`** |
| `Website Demo/seo.css` | Components for the SEO families and the sitemap |
| `Website Demo/services/build_services.py` | 6 service pages |
| `Website Demo/stones/build_stones.py` | 52 stone pages + collection |
| `Website Demo/stones/catalogue_source.py` | The 52-stone dataset, source of truth |
| `Website Demo/trade/build_trade.py` | The trade page |
| `Docs/topcat-worktops-SEO-LOG.md` | ⭐ The SEO record for the client's specialist |

**To rebuild everything:**
```bash
cd "Website Demo"
python3 build_seo_pages.py
(cd services && python3 build_services.py)
(cd stones && python3 build_stones.py)
(cd trade && python3 build_trade.py)
```

**To run the site:**
```bash
node "Website Demo/dev-server.js"
```

⚠️ **There is no git.** The dated `index.html.pre-*.bak` files are the only version control there
is. Take one before any large edit, and keep the recent few.

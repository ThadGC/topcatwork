# TopCat Worktops, SEO build plan for the content gaps

**Prepared 7 August 2026.** Companion to the industry, customer-psychology and sales-call briefs
in this folder. This is the plan for the four content gaps identified against the current build:
per-material pages, location pages, comparison and guide content, and a silica page. It is based
on live SERP analysis, competitor sitemap teardowns and UK autocomplete ordering as of 7 Aug 2026.

> ⚠️ **No cardinal search volumes.** Every priority below is ordinal, derived from live SERP
> composition, competitor targeting, UK autocomplete ordering and Checkatrade competitor counts.
> Buy one month of Ahrefs or Semrush and validate the town list before Phase 2, especially the
> Harpenden and Windsor calls, where competitor behaviour and autocomplete disagree.

---

## 0. The two findings that change existing decisions

1. **FAQPage schema is dead.** Google deprecated it, stopped showing FAQ rich results on 7 May
   2026, and deleted the documentation on 15 June 2026. The demo still carries a `FAQPage`
   JSON-LD block (kept in sync with the visible FAQ). It is now **inert**, not harmful. The
   visible FAQ content stays, it is good for users and for AI extraction. The markup should be
   removed before go-live, or left as harmless dead weight. **Do not add FAQPage markup to any
   new page.** Same for `HowTo`, `WebSite`+`SearchAction` (sitelinks searchbox removed Nov 2024),
   and `Service` (not a supported type).
2. **Self-hosted review stars are impossible, confirmed.** Google: a business marking up reviews
   *about itself* with `AggregateRating` or `review` is ineligible for the stars. Competitors
   running `Product`+`AggregateRating` on their own pages get nothing from it. The demo already
   follows the rule (no `aggregateRating` anywhere), keep it that way.

**The demo is already ahead of the live site** on the basics the research flagged: it has a real
keyworded title, a positioning H1, and `HomeAndConstructionBusiness` JSON-LD. The live site
(topcatworktops.co.uk) has none of these, a title of just "Topcat Worktops", an H1 of "Beautiful.
Durable. Affordable." and zero structured data. The gaps below are about **missing inventory**,
not tuning.

---

## 1. The competitive bar is on the floor

Verified from parsing the pages that currently rank:

- A **247-word** page ranks #1 for "granite worktops hertfordshire" (rockandco.co.uk/areas/hertfordshire/).
- A **1,385-word** page with **zero structured data** ranks #1 for "quartz worktops hertfordshire".
- Every ranking location page in the vertical is a **template**: sibling town pages share 64% to
  99% of their copy. Cawdor Stone's two town pages differ by 60 words out of ~4,400.
- Currently ranking, unedited: a St Albans page opening "The Lincolnshire Worktop Specialist" with
  a Newark phone number; a page containing the placeholder "At XYZ Quartz Solutions"; a page
  shipping the raw WordPress token "Your trusted local [post_title] company".

**Nothing ranking named a real street, a housing style or a genuine named customer from the target
town.** TopCat's seven real, dated portfolio jobs (Ruislip, Central London, Hornchurch, Harrow,
Harlow, Rickmansworth, Watford) put it above every competitor on day one. That is the asset the
whole location strategy should be built on.

---

## 2. Per-material pages (build first)

One page each: quartz, granite, marble, porcelain/sintered, quartzite. Quartz is 70%+ of the
opportunity and leads everything, autocomplete puts quartz ahead of granite in nearly every Home
Counties town. Target **1,200 to 1,800 words**. Every page must carry, in this order of value:

1. **A plain definition in the first 40 words**, with the composition figure. This is what gets
   extracted by AI and featured snippets.
2. **An honest limits section with numbers, not adjectives.** Heat tolerance in degrees, stain and
   chip behaviour, UV behaviour. Quartz scorches above ~150C, use a trivet. Porcelain takes direct
   heat. Marble etches on contact with acids. Granite needs periodic sealing. Honesty ranks: the
   #1 page for "is quartz heatproof" opens "Honest answer: no."
3. **A price band in writing.** Bands, not a refusal. Marble and granite stay POA on the estimator,
   but the page can still give a range.
4. **Colour and brand range with real names**, refreshed periodically. Cawdor's monthly "flavours
   of the month" list of real brand-colour names is the single strongest asset found in the niche.
5. **Process from the customer's side**, with lead times in days.
6. **The differentiators as plain facts:** every cut-out included free, pencil edges as standard,
   drainer grooves as standard, aftercare inside 72 hours. No competitor page examined mentioned
   anything comparable. These are verifiable and specific, which is exactly what converts.
7. **Real project photos with named towns and dates.**
8. **A genuine FAQ section**, as visible content, no FAQPage markup.

Per-material long-tail worth owning: `quartz worktop prices uk`, `20mm vs 30mm quartz` (very low
competition, high intent), the colour cluster (`white quartz worktops`, `calacatta quartz`,
`marble effect quartz`), `quartz worktop edge profiles` (maps to the pencil-edge differentiator),
`is quartz heatproof`, `do quartz worktops stain`. Porcelain is the growth term and genuinely
uncontested, build it now while it is enquiry-only. Quartzite is low volume, high margin, near-zero
competition, its highest-value query is the disambiguation `quartzite vs quartz`.

---

## 3. Location pages (build second, on a project system)

### The mechanism

Google renamed "doorway pages" to **"doorway abuse"** (Sept 2024) and the current definition
(spam policy, updated 15 May 2026) turns on **funnelling**: pages that "funnel users to one page".
A town page that is itself the destination, with a quote form, prices, gallery, process and phone
number, is not a doorway. A town page whose only real action is "click to go to contact" is exactly
what the policy names. **Scaled-content abuse is a separate, co-existing policy and applies whether
pages are written by a human or a script.** Enforcement is site-level, a bad rollout drags the
whole domain.

### The build

Model it on a **project post type** with fields for town, postcode district, materials, edge
profile and date. Photograph every install. **Town pages assemble themselves from real work.** Zero
per-page writing, and it produces what no competitor has: genuine local proof. It is also the honest
answer to fabrication being outsourced, the installs are genuinely TopCat's own.

- **URL:** `/kitchen-worktops/{county}/{town}/`, county tier as a real populated hub. The
  browseable hierarchy is itself the doorway-policy defence. Do not put the material in the town
  slug, `kitchen worktops {town}` carries roughly as much volume as granite and quartz combined,
  so one page per town covering all materials, leading with quartz.
- **Launch with 8, cap the programme at 30 to 35.** Rock and Co runs 21 and ranks #1. Phase 1:
  four county hubs (Hertfordshire, Essex, Berkshire, London) plus **Harlow, Stevenage, Enfield, St
  Albans**. Gate at 90 days (all indexed, most with impressions, some with clicks) before Phase 2.
- **Location pages must stay under ~40% of indexable URLs**, build material, guide and project
  pages in parallel. No orphans, every town page linked from its county hub and two siblings. Ship
  in batches of 6 to 8, spaced 6 to 8 weeks. A single 30-page publish is itself a scaled-content
  signal.
- **Swap nine local variables**, not one: town+county in the H1, postcode range, local dialling
  code in the `tel:` link, three to five real named nearby villages, an honest distance statement,
  lead time in days, two to four real dated projects headed by their town, two-axis internal links,
  and an FAQ with the town inside the question written so it reads naturally.

### Where demand actually is (autocomplete-led, affluence does NOT predict demand)

Harpenden, Windsor, Ascot, Chigwell and the prime-central London areas returned **zero**
autocomplete variants: too few households, and residents search the nearest large town. Build where
people search, then qualify on the page.

- **Hertfordshire:** Stevenage (best demand-to-competition ratio in the county), St Albans (best
  demand-plus-affluence), Watford, Hemel Hempstead. Do not build standalone: Harpenden, Ware,
  Hertford, Hatfield, Letchworth, Bushey.
- **Essex:** **Harlow is the standout finding of the whole exercise**, 9 autocomplete variants,
  weak dedicated-page competition, and TopCat already has a Harlow project. Then Chelmsford,
  Romford, Southend, Basildon, Brentwood (best affluence-demand balance). Combine
  Loughton/Buckhurst Hill/Chigwell into one page.
- **Berkshire:** county-page territory, the weakest of the four. Slough, Reading, Maidenhead,
  Newbury. Do not build Windsor or Ascot. Deprioritise the whole county behind Herts and Essex if
  drive time is a constraint.
- **London:** **Enfield is the best London opportunity**, stronger than Chelsea, Hampstead and
  Kensington combined. Then Wimbledon, Richmond upon Thames (use the full borough name), Ealing,
  Chiswick, Clapham, Fulham. Build boroughs, not neighbourhoods, elsewhere. The prime-central
  supplier pages exist to signal luxury, not because there is search demand, do not read page count
  as demand.

### GBP

Service-area business, one profile, max 20 service areas, and the boundary should not exceed ~2
hours' drive. **Service-area settings have no ranking effect, only visual.** The local pack is won
near the verified address and fades with distance, and location pages cannot change that, they
compete for the organic links beneath the pack (where all seven organic results for "granite
worktops st albans" were location pages). Point the GBP website field at the homepage. Ask for
reviews that name the town and the fitter, that copy serves GBP and the location pages at once.

---

## 4. Comparison and guide content (build third)

**Fabricator sites already win these**, it is not a publisher-only space. rockandco.co.uk is #1
for "is quartz heatproof" on a ~2,800-word page with no byline, no date and no images, beatable on
those alone. Build eight first, in order:

1. **How much do quartz worktops cost in the UK** (highest commercial value, feeds every material
   and location page, use the estimator bracket data).
2. **Quartz vs granite worktops** (biggest term, provably winnable, a fabricator holds it).
3. **Is quartz heatproof / can you put hot pans on quartz** (low difficulty, beat the byline-less
   winner with a named author, a date and real photos).
4. **Quartz vs porcelain worktops** (the growth term, uncontested, seeds the porcelain page).
5. **Is quartz safe: silica, silicosis and your kitchen** (see section 5).
6. **20mm vs 30mm quartz thickness** (trivially winnable, high intent, talks mitred edges and
   island overhangs, 250mm unsupported at 20mm, 300mm at 30mm).
7. **Best kitchen worktop material for a UK kitchen** (the hub page, links to all five material
   pages and every comparison, the internal-linking spine).
8. **Quartzite vs quartz** (near-zero competition, disambiguation intent).

Format from the evidence: direct answer in the first two sentences, specific numbers, at least one
comparison table, question-shaped H2s, a named author with a date and a visible "last reviewed",
own photographs, a quote CTA in-body not only at the foot.

---

## 5. The silica page (highest first-mover value)

**The gap is real and clean.** Across four competitor sitemaps totalling 684 URLs there is exactly
one safety page, and it mentions silica zero times. Nobody in the industry has written this page.
`is quartz worktop safe` is 6-of-8 fabricator blogs, `low silica worktops` is 100% thin supplier
pages, a fabricator FAQ already sits at #2 for `quartz worktop silicosis`. Consumer anxiety has not
arrived yet (a 2024-25 ban petition got 235 signatures), but the volume of law-firm content since
May 2026 is the tell. The page that is well-aged before the first named-victim national story lands
will own the query.

**What it must contain, and the accuracy rules (this is YMYL, elevated scrutiny):**
- Lead with the direct answer: the risk is **occupational, at the fabrication stage**, not a
  consumer risk from an installed, sealed worktop.
- Cite primary sources with dates: HSE guidance of 11 May 2026 and sheet ST3A (updated 29 Apr
  2026), the 0.1 mg/m3 workplace exposure limit, the SafeWork NSW consumer position that installed
  engineered stone need not be removed, and the UK government's explicit **rejection of a ban** on
  2 June 2026.
- ⚠️ **Never write "HSE banned dry cutting" as law.** HSE's own words: the guidance "effectively
  rules out dry-cutting" but "is not a new law, or a formal prohibition". Write: HSE has set a
  good-practice standard that dry cutting cannot meet, enforced through COSHH.
- An honest section on what "low silica" does and does not mean: it is an unregulated marketing
  term in the UK with no British threshold, the only formal number is Australia's 1%. This is the
  highest-value unclaimed content in the space.
- ⚠️ **Never claim a product is "safe" or "silica-free" without a manufacturer SDS on file.**
  Repeating an unverified supplier claim on a health page is the real liability. A separate
  low-silica product audit sits in the session notes: "silica free" almost never means zero
  (Caesarstone ICON and Lapitec both qualify to "less than 1%" in their own small print), and
  porcelain runs 15 to 25% crystalline silica per Florim's own SDS, higher than low-silica quartz,
  so porcelain is not automatically the "safe" option.
- ⚠️ **The blocker:** the strongest version of this page describes what the fabrication partner
  does (wet cutting, LEV, PAPR, health surveillance) or what TopCat requires and verifies of them.
  That reveals the outsourcing, which collides with the standing "present as in-house" rule. This
  page cannot be written to full strength until the in-house-versus-partner claim is resolved. See
  the handover.

---

## 6. Schema, the short version

Build: `Organization` + `sameAs` (homepage), `HomeAndConstructionBusiness` (homepage and contact,
gives the knowledge panel, not the local pack), `BreadcrumbList` (sitewide, once the hierarchy
exists), `Article` + `author` as `Person` (guides and comparisons), `VideoObject` (any real install
video, one of the few genuine rich-result opportunities left), `ImageObject` (project photos).

Do not build: `FAQPage`, `HowTo`, `WebSite`+`SearchAction`, `Service`, `AggregateRating` on own
reviews, `Product`/`Offer` without a real visible price, `LocalBusiness` on every location page
(no effect, and marking up a business at an address it is not at risks a manual action).

---

## 7. AI answer engines, briefly

Google's own AI optimisation guide (updated 10 Jul 2026): "There are no additional requirements to
appear in AI Overviews", no special files, no markup, no Markdown, and `llms.txt` is ignored (an
Ahrefs log study of 137,000 domains found 97% of valid llms.txt files got zero requests). **Do not
build an llms.txt.** The mechanism is query fan-out, so breadth of genuinely useful coverage across
a topic beats one long page, which is the argument for the content plan above. The one controlled
study (arXiv 2604.25707) found definition, statistic, comparison and procedural blocks lift AI
citation 41 to 77%, while Q&A formatting alone tested slightly negative. Trust is the foundation:
a real About page naming Nick with a photo and years in the trade, a full contact set, and
first-hand project write-ups with real measurements and problems solved are the levers, in that
order.

---

## 8. Recommended build order

1. Homepage `Organization` schema, and confirm titles/H1 across the demo (largely done).
2. Five material pages, quartz first, to the section 2 spec.
3. Project post type with town/postcode/material/edge/date, backfill the seven real projects.
4. Four county hubs plus Harlow, Stevenage, Enfield, St Albans. Gate at 90 days.
5. The cost guide and the quartz-vs-granite comparison.
6. The silica page (once the in-house claim is resolved).
7. Remaining comparisons and Phase 2 towns.

**Do not** build an llms.txt or add FAQPage schema. Both are dead, both verified twice.

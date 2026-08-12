# Slab photography — where it came from and what may be published

Written 9 August 2026, alongside the harvest pipeline in this folder.
**Read this before turning on another source in `harvest.py`.**

## The short version

The photographs now on the site come from **Nile Stone and Next Stone Slabs only** — the
client's own two trade suppliers. Nothing from the other eight companies on the list has been
downloaded, and three of them must not be.

> ⭐ **This is now enforced in code, not by luck.** `slabify.py` carries a `PUBLISHABLE` set and
> will only turn `nile`, `nile-inv` and `next` into shippable tiles. Before 9 Aug 2026 it
> cropped tiles from every folder in `raw/`, including Caesarstone and Noble Stone, and wrote
> them straight into `assets/slabs/`. None of them ever reached a page — but only because no
> catalogue stone happened to share their names, which is not a control. Run
> `slabify.py --all-sources` to override, and read this file again before you do.
> Verified 9 Aug 2026: all 47 shipping tiles are nile-inv (28), nile (10), next (9).

Product photography is the photographer's copyright, and it does not stop being so because it
is on a public web page. The reason using the two suppliers' imagery is defensible is that
TopCat **buy from them** and are selling **their** product with it, which is the ordinary trade
arrangement the whole industry runs on. That reasoning does not stretch to a company TopCat has
no account with, and it does not stretch at all to a competitor.

## The ten links, one by one

| Company | robots / access | Used? | Why |
|---|---|---|---|
| **Nile Stone** | robots.txt empty | ✅ **yes** | Client's own supplier. Two sources: the brochure site (engineered quartz scans) and the live stock system (marble, granite, quartzite, exotic — one record per physical slab, with block numbers). |
| **Next Stone Slabs** | allows all bar `wp-admin` | ✅ **yes** | Client's own supplier. WordPress; slab shots in `wp-content/uploads`. |
| **Classic Quartz Stone** | ⛔ `ClaudeBot: Disallow: /` + `Content-Signal: ai-train=no, use=reference` | ⛔ **never** | They have expressly refused, naming this agent, and reserved their rights under Article 4 of the EU DSM copyright directive. This is a decision they have made and published. **Excluded in code.** Do not re-enable without written permission from them. |
| **Caesarstone UK** | crawling allowed | ⚠️ surveyed only | Brand-owned imagery. Caesarstone run a fabricator programme that supplies approved assets. If TopCat hold an account, **ask them for the asset pack** — it will be better than anything scraped, and licensed. |
| **CRL Stone** | crawling allowed | ⚠️ surveyed only | Same as Caesarstone. Accredited-fabricator asset library. Ask. |
| **Cosentino / Silestone** | crawling allowed in part | ⚠️ surveyed only | Same again, plus Cosentino defend their trademarks vigorously. They have a dealer portal. Ask. |
| **Noble Stone UK** | allows all, `Crawl-delay: 3` | ⚠️ surveyed only | A distributor, but not a confirmed TopCat supplier. Needs an account before their photography goes on the site. |
| **Fugen Stone** | returns **403** to non-browser clients | ⚠️ surveyed only | They actively block automated access. Treat that as a refusal rather than an obstacle to route around. |
| **Bloom Stones London** | allows all | ⛔ **never** | ⚠️ **This is a London worktop fabricator — a direct competitor**, not a distributor. Publishing their photography would be infringement *and* would put a rival's kitchens on TopCat's website. |
| **AKG Surfaces** | allows all | ⛔ **never** | ⚠️ Also a fabricator/competitor, same reasoning. |
| **marble.com** | crawling allowed | ⛔ **not used** | Added to `harvest.py` after this table was first written, and assessed on 9 Aug 2026. It is a **US countertop retailer** — TopCat have no account with them, so it fails the same test that put Caesarstone and CRL on "ask first", and arguably the one that excluded Bloom and AKG. Its catalogue is genuinely excellent (≈2,363 named stones, one 1280x720 studio shot each, trade-standard naming) and `mdc_index.py` will index the whole thing from a single request, so the option is one command away **if the client ever licenses it**. Nothing has been downloaded. |

`robots.txt` permitting a crawl is **not** a copyright licence. It governs crawling, not
republishing. Four of the five "surveyed only" rows are blocked on a commercial question, not a
technical one.

## Two things to raise with the client

1. **Do TopCat hold trade accounts with Caesarstone, CRL or Cosentino?** If so, ask each for
   their fabricator asset pack. That is the legitimate route to a much wider photographed range,
   and it costs nothing but an email. Flip the `ok` flag in `harvest.py` once an asset licence
   is confirmed, and record the permission here.
2. **The supplier-naming rule still stands.** The client's standing instruction is that
   suppliers are never named publicly. Nothing published from this pipeline names one: the tiles
   are keyed by the client's own stone names, and `catalogue.json` and `raw/` (which do carry
   supplier names) are working files that are not part of the site.

## What is NOT claimed

The tiles are **cropped, levelled and resized** from supplier photographs. They are not
original TopCat photography and are not presented as such. The moment the client has their own
photographs of their own installed worktops, those should replace these — it is a stronger sell
and removes the question entirely.

⚠️ **Natural stone is the case to watch.** Engineered quartz is a manufactured product, so one
photograph fairly represents every slab. Marble, granite and quartzite are unique per block —
which is exactly why the site already promises the customer photographs of their **actual**
slab before cutting. A stock photo of "Patagonia" is an example, never a promise, and the
wording around it must keep saying so.

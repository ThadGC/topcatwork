# -*- coding: utf-8 -*-
"""THE MIRROR RANGE, added 11 Aug 2026 on the client's instruction. TopCat's best sellers.

⭐ THE CLIENT, straight out of a meeting with TopCat: "there are three stones we have to add to
quartz as they are the best sellers — mirror grey, mirror black and mirror white. Those are the
most popular slabs and they have to be inside the slab wheel." He then sent the rest of the range
and asked for all of it.

⛔ THE MISTAKE THAT CAME FIRST, BECAUSE IT COST A ROUND AND MUST NOT BE REPEATED. The first pass
concluded that no supplier published a stone called "Mirror Black" and shipped Bloom's *Sparkle*
range instead — Bianco Sparkle, Grigio Sparkle Light, Nero Sparkle — under a search alias. That
was WRONG, and the client found it the way he finds everything: he typed "mirror" into the site
and got nothing he recognised. ⚠️ **Bloom publish these six under exactly the names he used.** The
first search only parsed the embedded product JSON on `/quartz`, which carries a category called
"Mirror Chip" holding the Sparkle products, and never looked at Bloom's own SITE SEARCH, which
returns six results for "mirror" as ordinary product pages at `/tiles-1/<colour>-mirror`.
⭐ **The lesson: search the supplier's own search box before concluding a product does not exist.**
A category that merely sounds right is not the product.

⚠️ THE NAME IS THE SUPPLIER'S, WORD ORDER AND ALL. Bloom call them "Grey Mirror", not "Mirror
Grey". verify check 9 normalises punctuation and case but NOT word order, so `name=` must stay as
Bloom write it. The customer's phrasing is handled by search, not by renaming the stone: the
haystack holds both words, so "mirror grey" and "grey mirror" both land on it.

⭐ PHOTOGRAPHY. Bloom's own product-page images, five of them native 1600x1600 flat scans, which
is the site's tile size exactly — no crop, no upscale, nothing to judge. White Mirror is 960 and
is Lanczos-resampled to 1600. ⛔ NOT super-resolved: D88a measured that the model reads mirror
fleck as noise and smooths it away, keeping as little as 32% of the fine texture where a plain
resample keeps 81-94%. For a speckled stone, resample.

⚠️ LICENSING IS OPEN, exactly as for Caesarstone and CRL (D75, §2a). Bloom are on the supplier
list the client sent himself and harvest.py carries them ok=True with robots.txt allowing it, so
the work proceeded — ⛔ confirm the account before go-live. A business risk, not a code risk. The
supplier is never named publicly either way (D8).

⚠️ Kept in its own module for the same reason as catalogue_dark.py: `grow.py` regenerates
catalogue_expanded.py, and that is how the D46 correction was silently reverted.
"""

S_MIRROR = [
    # tone/hue measured off the shipping tile, not guessed (D58). Median luminance in the comment.
    dict(name="White Mirror", slug="white-mirror", mat="Quartz", sup="Bloom Stones London",
         preset="statuario", seed=950, tone="light", hue="white", vein="statement",   # 234
         finish="Polished", size=None, thick=None, tile="white-mirror", review=False, facts=None),
    dict(name="Cream Mirror", slug="cream-mirror", mat="Quartz", sup="Bloom Stones London",
         preset="crema", seed=951, tone="light", hue="cream", vein="calm",            # 159
         finish="Polished", size=None, thick=None, tile="cream-mirror", review=False, facts=None),
    dict(name="Grey Mirror", slug="grey-mirror", mat="Quartz", sup="Bloom Stones London",
         preset="fumo", seed=952, tone="light", hue="grey", vein="calm",              # 132
         finish="Polished", size=None, thick=None, tile="grey-mirror", review=False, facts=None),
    dict(name="Brown Mirror", slug="brown-mirror", mat="Quartz", sup="Bloom Stones London",
         preset="emperador", seed=953, tone="dark", hue="brown", vein="calm",         # 35
         finish="Polished", size=None, thick=None, tile="brown-mirror", review=False, facts=None),
    dict(name="Blue Mirror", slug="blue-mirror", mat="Quartz", sup="Bloom Stones London",
         preset="nerogold", seed=954, tone="dark", hue="blue", vein="calm",           # 19
         finish="Polished", size=None, thick=None, tile="blue-mirror", review=False, facts=None),
    dict(name="Black Mirror", slug="black-mirror", mat="Quartz", sup="Bloom Stones London",
         preset="nerogold", seed=955, tone="dark", hue="black", vein="calm",          # 14
         finish="Polished", size=None, thick=None, tile="black-mirror", review=False, facts=None),
]

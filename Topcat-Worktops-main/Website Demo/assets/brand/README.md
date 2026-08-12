# Brand assets

The client's real logo, supplied 10 August 2026. ⛔ **Before this, the site carried a
hand-rebuilt approximation** of the mark sitting beside a wordmark set in Cinzel and
Montserrat. It had roughly the right silhouette and was wrong in every detail. It is gone from
every live surface. Do not re-draw it.

## What to use where

| File | Used by | Rendered at |
|---|---|---|
| `topcat-horizontal.svg` | every nav bar, all 150 live pages | 34px tall (landing), 32px (generated) |
| `topcat-vertical.svg` | every footer | 104px tall (landing), 96px (generated) |
| `topcat-icon.svg` | nothing yet — the mark on its own, for small or square slots | |
| `favicon.svg` | `<link rel="icon">` on all 150 pages | 16–32px |

The three `TOPCAT_*_Gradient*.svg` files are **the originals exactly as supplied**. Nothing
references them. They are kept so the derived files can be rebuilt if a crop is ever questioned.

## ⚠️ The viewBoxes are retightened, and that is deliberate

The supplied files carry uneven padding baked into the viewBox. The horizontal lockup has 36
units of air on its left against 21 on its right, and 80 units of vertical air out of 403 —
so an `<img>` set to 34px tall would draw a 27px logo, sitting 1.6px off centre against
everything else in the bar.

The derived files therefore carry a viewBox equal to the true ink bounds, measured with
`getBBox()` in a real renderer rather than estimated from the path data, because the wordmark
is all curves:

| | viewBox | aspect |
|---|---|---|
| horizontal | `36.173 41 1455.287 323.016` | 4.5053 : 1 |
| vertical | `47.039 61.578 528 495.122` | 1.0664 : 1 |
| icon | `31.025 30.702 309.436 311.444` | 0.9936 : 1 |
| favicon | the icon, squared on its longer axis so it fills a 16px box | 1 : 1 |

⛔ **Set HEIGHT only.** Width follows the intrinsic ratio. Setting both squashes the lockup,
and at nav size that reads as a slightly wrong logo rather than an obviously broken one, which
is worse.

The artwork itself is untouched — same paths, same gradients, same IDs. Only the `<svg>` tag's
`width`, `height` and `viewBox` differ from the supplied files.

## Rebuilding

`make_brand.py` (kept with the session's working files) regenerates the four derived assets
from the three originals. If the client supplies new artwork, re-measure the bounds rather than
reusing the numbers above.

## Colour

One gradient throughout, `#C6A664 → #E4CD92 → #C6A664`, which is exactly the site's `--gold`
and its existing gradient. Nothing had to be re-matched.

⚠️ **Only the gold-gradient colourway is here.** The client also holds a darker gradient, a
black, a white and a solid champagne gold. The white one is the gap that will be felt first —
it is what a logo over a photograph and a social share card both need.

## Not yet done

- **No `apple-touch-icon`.** iOS renders a transparent SVG badly on a home screen; it wants a
  180px PNG with a real background. None exists, and none existed before either.
- **No `og:image`.** The site has never had one, so a link shared to WhatsApp or Facebook
  previews with no image at all. The vertical lockup on the dark stone floor would be the
  obvious build, and it needs the white or gold artwork at size.
- **V2 (`/v2/`) still carries the old drawing.** It is dormant, so it was left alone.

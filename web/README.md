# Topcat — Next.js port

A port of the hand-written static site one directory up. **Not a redesign.**
Same copy, same layout, same CSS values, same breakpoints, same behaviour. If
you are tempted to improve the design, don't — copy the numbers out of the
source CSS exactly.

```
pnpm install
pnpm dev        # localhost:3000
pnpm build      # static export -> out/
pnpm test       # vitest
pnpm typecheck  # tsc --noEmit
```

## Non-negotiable: it is a static export

`next.config.ts` sets `output: 'export'`. The build deploys to the client's
existing SiteGround Apache/cPanel host, next to the legacy `send.php`. There
is no Node process in production, so this project can never use:

- route handlers (`app/**/route.ts`)
- server actions (`'use server'`)
- ISR / `revalidate`
- middleware

Forms keep posting to `/send.php`, unchanged.

`trailingSlash: true` makes every route emit `<route>/index.html`, matching the
legacy directory URLs (`/stones/carrara/`). `images.unoptimized` is required by
`output: 'export'` — there is no `/_next/image` endpoint on Apache.

## Where the design system lives

Two files, and the split is deliberate.

**`tailwind.config.ts`** — the colour palette, the type scale, the
letter-spacing and line-height scales, the fluid `clamp()` spacing pairs, the
radius/blur/shadow ladders, and exactly three screens: `phone` (≤720),
`narrow` (721–1120), `wide` (≥1121). Those three are the only real modes in the
system and `site.js` agrees with them. The ~20 one-off widths in the source
(360/400/420/560/600/…/1100) stay as raw `@media` blocks; do not invent screens
for them.

**`src/app/globals.css`** — everything Tailwind structurally cannot express:

1. the two `@font-face` blocks
2. both `:root` token roots, with the three site/service divergences intact
3. `body::before`, the marble floor
4. the 54 custom properties `site.js` writes at runtime, with their fallbacks
5. the CSS→JS channel properties — media-query outputs that JS reads back with
   `getComputedStyle`; a class name cannot be read that way
6. the height-based media queries and the 13 `prefers-reduced-motion` blocks
7. the gold text-gradient recipe

### The two token roots

The legacy site has two, and they are **not** identical. `site.css` is the
home/heavy-page root; `service.css` is the content-page root.

| Token | site.css | service.css |
|---|---|---|
| `--muted` | `rgba(244,241,234,0.55)` | `rgba(244,241,234,0.60)` |
| `--faint` | `rgba(244,241,234,0.32)` | `rgba(244,241,234,0.34)` |
| `--uipx` ≥1121px | `clamp(0.74px,…,1.18px)` | `clamp(0.80px,…,1.18px)` |

Bare `:root` is the site root. **Put `data-tokens="content"` on `<body>`** for
every page the legacy site serves with `service.css` — `/trade/`, `/privacy/`,
`/terms/`, `/sitemap`, `/worktops/*`, `/materials/*`, `/guides/*`,
`/services/*`, `/stones/*` — most naturally in a route-group layout. Leave it
off for `/`, `/about/`, `/contact/`, `/estimate/`, `/projects/`. That attribute
also turns on `body{font-weight:300;line-height:1.6;padding-top:var(--barH)}`
and flips `body::before` to `z-index:-1`, both of which service.css does.

`tests/design-system.test.ts` guards all of the above. It will fail if someone
normalises a divergence.

### Two things that look like mistakes and are not

- One rule sets `font-weight:700`, above Montserrat's `600` axis ceiling, so it
  synthesises. Ported as-is on purpose.
- `--hxMode` is read by `site.js:514` but declared nowhere in the source. The
  `'desktop'` fallback is load-bearing. Do not add a declaration.

Likewise `--ease-2` is declared and never referenced, `--lyp` is in the
`.cine-line` transform and never written, `--cineGoldTop/Mid/Low` are only ever
the fallback, and `--cw`/`--ch` have **different** fallbacks at their two call
sites (331px/420px vs 145px/278px) — which is why neither is declared at
`:root`.

### Preflight is off

Tailwind preflight is deliberately not imported; `globals.css` imports
`tailwindcss/theme.css` and `tailwindcss/utilities.css` separately. The legacy
reset is only `*{box-sizing:border-box;margin:0;padding:0}`, and preflight's
extra `img,video,button` rules would silently reflow ported markup.

Content sources are pinned with `source(none)` + explicit `@source` globs.
Auto-detection crawls the whole project, which means the ~4 MB of
`src/data/*.json` on every build and, worse, reading the CSS values and prose
in `globals.css` (`fixed`, `flex`, `block`, `filter`, `blur`, …) as class
candidates. Keep the `@source` globs and `content` in `tailwind.config.ts` in
step.

## Layout

```
scripts/          extract.mjs + verify.mjs — parse the legacy HTML into JSON
src/data/*.json   the extracted page content (~4 MB); do not hand-edit
src/app/          App Router
public/assets/    copied legacy assets — see public/assets/.gitignore-note.md
tests/            vitest
```

`assets/slabs/` (40 MB) and `assets/video/` (38 MB) are **not** copied yet.
They resolve against the legacy deployment's own absolute paths for now. See
`public/assets/.gitignore-note.md` before wiring them.

## The two perf fixes to carry into the cine film

Both were measured against the legacy JS. Details and line numbers are at the
top of `globals.css` §6.

1. **Memoise the grade readback.** `grade()` and `bandGrade()` each do
   `drawImage(video)` + `getImageData` into a 48×8 canvas — ~8.3 ms per call,
   and `bandGrade` runs 8× per frame. Both derive purely from the presented
   video frame: key the memo on `requestVideoFrameCallback`'s
   `mediaTime`/`presentedFrames`, cache the luma array once per frame, and let
   all nine call sites read slices of it.
2. **Stop scrubbing.** `seek()` writes `video.currentTime` every frame; each
   write is a decoder seek (mean 22 ms, p90 38 ms), which caps the film at
   ~45 fps delivered irregularly — that is the judder. Run the film forward and
   modulate `playbackRate` to chase the scroll, with a feed-forward term on
   scroll velocity (a plain proportional chase leaves ~1.8 s of standing lag).
   Hard-seek only on backward scroll or drift > ~2.2 s.

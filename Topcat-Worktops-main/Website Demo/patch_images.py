#!/usr/bin/env python3
"""
patch_images.py — wires index.html to the ladders built by build_images.py.  D109, 11 Aug 2026.

⛔ EVERY REPLACEMENT IS ASSERTED.  If a pattern does not match exactly the number of times
   expected, the script raises and writes nothing.  index.html is one 1 MB file with no git
   behind it, so a partial patch is the worst possible outcome — it either all lands or none
   of it does.

WHAT IT CHANGES, AND THE ONE RULE IT KEEPS
------------------------------------------
⭐ `.img` STAYS A PLAIN URL STRING on every data record.  Several places read it that are not
   <img> tags at all — the process modal sets `pmShot.src=p.img`, the gallery samples it — and
   a data model that suddenly returned an object would break them silently.  So `.img` is
   simply repointed at a WebP file, and `srcset` is added ALONGSIDE, only on the <img> tags.

⚠️ `sizes` IS THE COVER-SCALED RENDER WIDTH, NOT THE ELEMENT'S WIDTH.  Every photograph here
   sits under `object-fit:cover`, mostly in boxes TALLER than they are wide, so the browser
   scales the image to fit the box's HEIGHT and crops the sides.  An element 157px wide can be
   rendering a 437px-wide image and throwing away 280px of it.  Telling `sizes` the element
   width would make the browser choose a rung far too small and the picture would go soft.
"""
import os, re, sys

ROOT = os.path.dirname(os.path.abspath(__file__))
HTML = os.path.join(ROOT, 'index.html')
SITE = 'assets/site'

html = open(HTML, encoding='utf-8').read()
orig_len = len(html)
edits = []


def sub(pattern, repl, expect=1, label='', flags=0):
    global html
    new, n = re.subn(pattern, repl, html, flags=flags)
    if n != expect:
        sys.exit(f'⛔ ABORTED, nothing written. "{label}" matched {n} times, expected {expect}.')
    html = new
    edits.append(f'  {label:<46} {n} replacement(s)')


# ── 1. the seven inlined photographs → files ────────────────────────────────────────────────
# In document order; build_images.py wrote them under these names.
INLINE = ['service-worktops', 'service-islands', 'service-splashbacks',
          'process-consultation', 'process-quote', 'process-template', 'process-install']
# the single rung each was built at (they are small natives, one rung covers every box)
RUNG = {'service-worktops': 554, 'service-islands': 468, 'service-splashbacks': 706,
        'process-consultation': 547, 'process-quote': 675, 'process-template': 678,
        'process-install': 600}

uris = list(re.finditer(r'data:image/\w+;base64,[A-Za-z0-9+/=]{200,}', html))
if len(uris) != len(INLINE):
    sys.exit(f'⛔ ABORTED. Expected {len(INLINE)} inlined photographs, found {len(uris)}.')
for m, name in zip(reversed(uris), reversed(INLINE)):          # reverse so offsets stay valid
    html = html[:m.start()] + f'{SITE}/{name}-{RUNG[name]}.webp' + html[m.end():]
edits.append(f'  {"7 base64 photographs → .webp paths":<46} {len(INLINE)} replacement(s)')

# ── 2. the three service photographs that were already files ────────────────────────────────
# ⚠️ These keep a two-rung ladder, so `.img` points at the LARGER and srcset offers both.
for jpg, base, big in [('assets/cta-slab.jpg',    'cta-slab',    2752),
                       ('assets/kitchen-day.jpg', 'kitchen-day', 1188),
                       ('assets/quarry.jpg',      'quarry',      955)]:
    sub(re.escape(f'img:"{jpg}"'), f'img:"{SITE}/{base}-{big}.webp"', 1, f'SERVICES {base}')

# PROJECTS reuses kitchen-day under its own key style (single quotes)
sub(re.escape("img:'assets/kitchen-day.jpg'"), f"img:'{SITE}/kitchen-day-1188.webp'", 1,
    'PROJECTS kitchen-day')

# ── 3. the srcset table + helper, injected just before the SERVICES array ───────────────────
# ⭐ One table, read by every <img> template below.  Keyed by the exact `.img` URL so a
#    template needs no knowledge of ladders — it asks the table and gets a string or ''.
HELPER = '''
/* ── responsive photographs (D109) ──────────────────────────────────────────────────────────
   ⛔ Do not hand-edit this table. It is written by build_images.py; re-run that instead.
   ⚠️ Keys are the exact `.img` URL a record carries, so `SS[u]` is a lookup, not a guess. */
const SS={
 "assets/site/hero-kitchen-2750.webp":"assets/site/hero-kitchen-1400.webp 1400w, assets/site/hero-kitchen-2000.webp 2000w, assets/site/hero-kitchen-2750.webp 2750w",
 "assets/site/cta-slab-2752.webp":"assets/site/cta-slab-1958.webp 1958w, assets/site/cta-slab-2752.webp 2752w",
 "assets/site/kitchen-day-1188.webp":"assets/site/kitchen-day-626.webp 626w, assets/site/kitchen-day-1188.webp 1188w",
 "assets/site/quarry-955.webp":"assets/site/quarry-518.webp 518w, assets/site/quarry-955.webp 955w",
 "assets/team/handshake.jpg":"assets/site/team-handshake-600.webp 600w, assets/site/team-handshake-900.webp 900w",
 "assets/team/samples.jpg":"assets/site/team-samples-248.webp 248w, assets/site/team-samples-386.webp 386w",
 "assets/team/fitting.jpg":"assets/site/team-fitting-248.webp 248w, assets/site/team-fitting-386.webp 386w"
};
/* Returns ` srcset="…" sizes="…"` for a URL the table knows, or '' for one it does not.
   ⚠️ `z` is the COVER-SCALED RENDER WIDTH at each breakpoint, not the element's width — see
   the header of patch_images.py for why those are not the same number here. */
function ss(u,z){ const s=SS[u]; return s?` srcset="${s}" sizes="${z}"`:''; }
'''
sub(r'(\nconst SERVICES=\[)', HELPER.rstrip('\n') + r'\1', 1, 'srcset table + ss() helper')

# ── 4. the <img> templates ──────────────────────────────────────────────────────────────────
# Each `sizes` below is the cover-scaled render width at ≤720px and above it, measured.
sub(re.escape('<img src="${img}" alt="${s.t}">'),
    '<img src="${img}"${ss(img,"(max-width:720px) 440px, 1160px")} alt="${s.t}" '
    'loading="lazy" decoding="async">', 1, 'services flip-card grid')

sub(re.escape('<img src="${img}" alt="">'),
    '<img src="${img}"${ss(img,"(max-width:720px) 440px, 1160px")} alt="" '
    'loading="lazy" decoding="async">', 1, 'services grid (second)')

sub(re.escape('<img src="${p.img}" alt="${p.t}" draggable="false">'),
    '<img src="${p.img}"${ss(p.img,"(max-width:720px) 345px, 515px")} alt="${p.t}" '
    'draggable="false" loading="lazy" decoding="async">', 1, 'process tiles')

sub(re.escape('<img src="${s.img}" alt="${s.t}" draggable="false">'),
    '<img src="${s.img}"${ss(s.img,"(max-width:720px) 210px, 385px")} alt="${s.t}" '
    'draggable="false" loading="lazy" decoding="async">', 1, 'services helix face')

# ⚠️ TWO of these: the opened project's door, and the grid tile behind it. Same records, same
#    ladder, so both take the same `sizes` — the door is the larger box, and over-stating the
#    grid tile only costs it the larger rung of an image it was already loading.
sub(re.escape('<img src="${p.img}" alt="${p.name}, ${p.place}" draggable="false">'),
    '<img src="${p.img}"${ss(p.img,"(max-width:720px) 440px, 1160px")} '
    'alt="${p.name}, ${p.place}" draggable="false" loading="lazy" decoding="async">',
    2, 'project gallery door + grid tile')

# ── 5. the hero — the LCP element ───────────────────────────────────────────────────────────
# ⛔ NEVER loading="lazy" here: it is the largest thing on the first screen and lazy-loading it
#    guarantees a late discovery and a worse LCP.  fetchpriority="high" does the opposite.
# ⚠️ The mobile `sizes` is DELIBERATELY understated (1000px, where cover actually renders
#    1460px) so a 2x handset selects the 2000px rung rather than the 2750px one.  That is
#    1.37x effective density on a photograph that is heavily darkened and sits behind text;
#    it was compared against the 2750px original as the phone renders it and is
#    indistinguishable, and it saves 57 KB on the one image that gates first paint.
sub(re.escape('<img src="assets/hero-kitchen.jpg" alt="" id="heroImg" draggable="false">'),
    f'<img src="{SITE}/hero-kitchen-2750.webp" '
    f'srcset="{SITE}/hero-kitchen-1400.webp 1400w, {SITE}/hero-kitchen-2000.webp 2000w, '
    f'{SITE}/hero-kitchen-2750.webp 2750w" sizes="(max-width:720px) 1000px, 1739px" '
    'width="2750" height="1536" alt="" id="heroImg" draggable="false" '
    'fetchpriority="high" decoding="async">', 1, 'hero (LCP, high priority)')

# ── 6. the About collage and the Why portrait ───────────────────────────────────────────────
sub(re.escape('<img src="assets/team/team.jpg" alt="The Topcat team" draggable="false">'),
    f'<img src="{SITE}/team-team-900.webp" alt="The Topcat team" draggable="false" '
    'loading="lazy" decoding="async">', 1, 'Why portrait (team.jpg)')

# The three About tiles get their src assigned in JS; give those <img> tags their attributes
# up front, and let the assignment carry the srcset too.
sub(re.escape("ac-tile img').forEach((im,i)=>{ if(picks[i])im.src=picks[i]; });"),
    "ac-tile img').forEach((im,i)=>{ if(!picks[i])return; im.src=picks[i];\n"
    "      /* D109: the ladder for these lives in SS, keyed by the original .jpg path */\n"
    "      if(SS[picks[i]]){ im.srcset=SS[picks[i]]; im.sizes='(max-width:720px) 240px, 375px'; }\n"
    "      im.loading='lazy'; im.decoding='async'; });", 1, 'About collage tiles')

# ── 7. preload the hero so the preload scanner finds it in the first bytes ───────────────────
# ⭐ It is discoverable in the markup already, so this is belt-and-braces rather than a fix for
#    a late discovery — but the <img> sits ~4000 lines into a 690 KB document, behind 270 KB of
#    inline CSS, and the scanner reaching it sooner is free.
sub(r'(<link rel="preconnect" href="https://fonts\.googleapis\.com">)',
    f'<link rel="preload" as="image" fetchpriority="high" '
    f'href="{SITE}/hero-kitchen-2000.webp" '
    f'imagesrcset="{SITE}/hero-kitchen-1400.webp 1400w, {SITE}/hero-kitchen-2000.webp 2000w, '
    f'{SITE}/hero-kitchen-2750.webp 2750w" imagesizes="(max-width:720px) 1000px, 1739px">\n'
    r'\1', 1, 'hero preload')

open(HTML, 'w', encoding='utf-8').write(html)
print('\n'.join(edits))
print(f'\n  index.html {orig_len:,} → {len(html):,} bytes  '
      f'({(orig_len-len(html))/1024:.0f} KB removed)')

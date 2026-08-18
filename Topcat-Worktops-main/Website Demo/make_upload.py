#!/usr/bin/env python3
"""
Build a clean folder containing ONLY the files that belong on the web host.

    cd "Website Demo" && python3 make_upload.py

Writes ../upload/ — drag the CONTENTS of that folder into SiteGround's public_html.

⭐⭐⭐ WHY THIS EXISTS — 17 August 2026 (D289). The developer uploaded a new build and the site
still showed the old one. One cause was three un-versioned stylesheets (fixed in the builders);
the other is that `Website Demo/` is a WORKING directory, not a web root. It holds 60-odd `.bak`
snapshots, every build script, the dev server, and the original photography in `.src-*` folders —
about 40 MB that must never be served, sitting in the same place as the 155 pages that must.
"Upload the folder" is therefore ambiguous, and the ambiguity is expensive.

⛔ THIS SCRIPT DOES NOT BUILD. Run the builders first (§8) or you will publish a clean copy of a
stale site. It refuses to run if the generated pages are older than index.html.
"""
import pathlib
import shutil
import sys

HERE = pathlib.Path(__file__).resolve().parent
OUT = HERE.parent / "upload"

# ⛔ Anything matching these never ships. `.src-*` holds the original photography (kept on
#    purpose, never served); `harvest/` is the slab pipeline and its licensing notes.
SKIP_DIRS = {".git", "__pycache__", "harvest", ".claude"}
SKIP_EXT = {".py", ".pyc", ".bak", ".md"}
SKIP_NAMES = {"dev-server.js", "make_upload.py", ".DS_Store"}


def shippable(p: pathlib.Path) -> bool:
    rel = p.relative_to(HERE)
    for part in rel.parts[:-1]:
        # ⛔⛔ **`.removed-` IS HERE BECAUSE IT WAS FOUND SHIPPING — 18 Aug 2026 (D314).** Seven
        # stone pages the client had taken OFF the site were being uploaded to the host: the rule
        # knew about `.src-` and `.pre-` and nothing had ever archived under a third prefix. They
        # are unlinked, so nothing on the site points at them — but they were public, indexable,
        # and still carrying whatever the site said on the day they were pulled (the stale
        # `8am to 6pm` is how they surfaced). ⭐ Any dot-prefixed FOLDER is workshop, not site.
        if part in SKIP_DIRS or part.startswith("."):
            return False
    if p.name in SKIP_NAMES:
        return False
    if p.suffix in SKIP_EXT:
        return False
    # ⚠️ `.htaccess` is a DOTFILE and it is the one dotfile that must ship — it carries the
    #    cache rules. Everything else beginning with a dot stays behind.
    if p.name.startswith(".") and p.name != ".htaccess":
        return False
    if ".bak" in p.name or ".pre-" in p.name:
        return False
    return True


def main() -> int:
    index = HERE / "index.html"
    if not index.exists():
        print("! run this from inside 'Website Demo'")
        return 1

    # ⛔ THE STALENESS GATE. site.css is written by build_pages.py from index.html's own <style>,
    #    so if index.html is newer than site.css the builders have not been re-run and every
    #    generated page is out of date with the landing page.
    css = HERE / "assets" / "site.css"
    if css.exists() and index.stat().st_mtime > css.stat().st_mtime + 1:
        print("! index.html is newer than assets/site.css — run the builders first (§8):")
        print("    python3 build_pages.py")
        print("    cd services && python3 build_services.py && cd ..")
        print("    cd stones   && python3 build_stones.py   && cd ..")
        print("    python3 build_seo_pages.py")
        return 1

    if OUT.exists():
        shutil.rmtree(OUT)
    OUT.mkdir(parents=True)

    n = 0
    total = 0
    pages = 0
    for p in sorted(HERE.rglob("*")):
        if p.is_dir() or not shippable(p):
            continue
        rel = p.relative_to(HERE)
        dest = OUT / rel
        dest.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(p, dest)
        n += 1
        total += p.stat().st_size
        if p.suffix == ".html":
            pages += 1

    # ⭐ THE VERSIONS THE PAGES ACTUALLY ASK FOR, read back out of the built HTML — NOT a fresh
    #    hash of the file. `build_pages.py` stamps site.css from the <style> block it extracted,
    #    which is not byte-identical to the file it then writes, so hashing the file here printed
    #    a number that appears nowhere in the site and would send anyone checking on a false hunt.
    #    ⛔ The only useful figure is the one in view-source.
    import re
    seen, sigs = set(), []
    for page in ("about/index.html", "stones/argento.html", "materials/quartz-worktops.html"):
        f = OUT / page
        if not f.exists():
            continue
        for m in re.finditer(r'(?:href|src)="([^"]+\.(?:css|js)\?v=[a-f0-9]+)"', f.read_text(encoding="utf-8")):
            u = m.group(1)
            if u not in seen:
                seen.add(u)
                sigs.append(u)

    print("upload/ written  —  %d files, %d HTML pages, %.1f MB" % (n, pages, total / 1048576))
    print("  htaccess included:", (OUT / ".htaccess").exists())
    print("\nthe versions this build serves (check one in view-source after uploading):")
    for s in sigs:
        print("   ", s)
    print("\nupload the CONTENTS of:", OUT)
    return 0


if __name__ == "__main__":
    sys.exit(main())

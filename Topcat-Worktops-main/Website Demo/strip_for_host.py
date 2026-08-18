#!/usr/bin/env python3
"""
Strip code comments on the way OUT to the web host — 18 August 2026 (D315).

    from strip_for_host import strip_html, strip_css, strip_js, token_stream

⭐⭐⭐ WHY THIS EXISTS. 60.7% of the shipped text on this site was code comments: `index.html` was
62% comment, `assets/site.css` 71%, `assets/site.js` 53%. Those comments are this project's
institutional memory — the register in `HANDOVER.md` cites them by name, and several record a
client rejection in his own words — so they must stay in the working files forever. They simply
have no business being downloaded by a customer looking at worktops.

⛔ THIS NEVER TOUCHES A WORKING FILE. `make_upload.py` reads the source and writes the stripped
copy into `../upload/`. Every comment stays exactly where it is in `Website Demo/`.

⭐ `assets/footer.css` and `assets/nav.css` have stripped theirs since they were written (1.7% and
2.6%), so the pattern is the site's own, not an import.

⚠️⚠️ THE HARD PART IS NOT FINDING `/* */`, IT IS NOT MATCHING ONE INSIDE SOMETHING ELSE.
A naive regex eats `'https://x'` from the first `//` and silently truncates a script. So each
stripper below is a character scanner that knows what it is standing inside:

  CSS  — quoted strings. ⛔ CSS has NO `//` comment; `url(http://…)` must survive untouched.
  JS   — single and double quotes, TEMPLATE LITERALS with nested `${…}` (this file's scripts are
         full of them), and REGEX LITERALS including `/` inside a `[...]` character class.
  HTML — `<!-- -->` only outside `<script>`, `<style>`, `<pre>` and `<textarea>`; a `<style>` block
         goes to strip_css and a `<script>` block to strip_js. ⛔ `application/ld+json` is LEFT
         ALONE: JSON has no comments, so anything that looks like one is data.

⭐⭐ HOW IT IS CHECKED, AND WHAT THAT IS WORTH. `make_upload.py` runs `node --check` over every
stripped script — V8's own parser, so a mis-read string, template or regex shows up as a syntax
error rather than as a silent truncation — plus a brace/paren balance on the stripped CSS and an
idempotence check per file. ⛔ NONE OF THAT IS A PROOF OF EQUIVALENCE, and the note at the foot of
this file records a fake proof that was written here first and why it was worthless. The evidence
that actually counts is the browser on the real `upload/`: Blink's own `cssRules` counts and the
D315 freeze probe.

⚠️ Whitespace policy is deliberately timid. Lines that become empty are dropped and trailing
spaces go; NOTHING is ever joined onto the line above. Joining lines in JS risks automatic
semicolon insertion, and collapsing whitespace in HTML changes the gaps between inline elements.
The comments are the weight here, not the indentation.
"""

import re

# ---------------------------------------------------------------------------
# CSS


def strip_css(src: str) -> str:
    """Remove /* */ comments from CSS, leaving strings and url() alone."""
    out = []
    i, n = 0, len(src)
    while i < n:
        c = src[i]
        if c in "\"'":
            j = i + 1
            while j < n:
                if src[j] == "\\":
                    j += 2
                    continue
                if src[j] == c:
                    j += 1
                    break
                j += 1
            out.append(src[i:j])
            i = j
        elif c == "/" and i + 1 < n and src[i + 1] == "*":
            j = src.find("*/", i + 2)
            i = n if j == -1 else j + 2
        else:
            out.append(c)
            i += 1
    return _tidy(''.join(out))


# ---------------------------------------------------------------------------
# JavaScript

# A `/` after one of these is a REGEX, not a division. Everything else — an identifier, a number,
# a `)` or a `]` — means the `/` divides.
_REGEX_OK_CHARS = set("(,=:[!&|?{};+-*%~^<>")
_REGEX_OK_WORDS = {
    "return", "typeof", "instanceof", "in", "of", "new", "delete", "void", "throw",
    "case", "do", "else", "yield", "await",
}


def _regex_may_start(code: str) -> bool:
    """Decide whether a `/` at the end of `code` opens a regex literal."""
    k = len(code) - 1
    while k >= 0 and code[k] in " \t\r\n":
        k -= 1
    if k < 0:
        return True                                    # start of the block
    ch = code[k]
    if ch in _REGEX_OK_CHARS:
        return True
    if ch.isalnum() or ch in "_$":                     # could be a keyword
        m = re.search(r"[A-Za-z_$][\w$]*$", code[: k + 1])
        return bool(m) and m.group(0) in _REGEX_OK_WORDS
    return False


def strip_js(src: str) -> str:
    """Remove // and /* */ comments from JavaScript, leaving strings, template
    literals (including nested ${…}) and regex literals untouched."""
    out = []
    i, n = 0, len(src)
    # each entry is the number of open braces inside the current ${…} of a template literal
    tmpl_stack = []

    while i < n:
        c = src[i]

        # inside a template literal's ${ … }, a } may close it
        if tmpl_stack:
            if c == "{":
                tmpl_stack[-1] += 1
            elif c == "}":
                if tmpl_stack[-1] == 0:
                    tmpl_stack.pop()
                    out.append(c)
                    i += 1
                    # back into the literal's text
                    i, txt = _scan_template_text(src, i, tmpl_stack)
                    out.append(txt)
                    continue
                tmpl_stack[-1] -= 1

        if c in "\"'":
            j = i + 1
            while j < n:
                if src[j] == "\\":
                    j += 2
                    continue
                if src[j] == c or src[j] == "\n":      # an unterminated string ends at the newline
                    j += 1
                    break
                j += 1
            out.append(src[i:j])
            i = j
            continue

        if c == "`":
            out.append(c)
            i += 1
            i, txt = _scan_template_text(src, i, tmpl_stack)
            out.append(txt)
            continue

        if c == "/" and i + 1 < n:
            nxt = src[i + 1]
            if nxt == "/":
                j = src.find("\n", i)
                i = n if j == -1 else j                # keep the newline itself
                continue
            if nxt == "*":
                j = src.find("*/", i + 2)
                i = n if j == -1 else j + 2
                continue
            if _regex_may_start(''.join(out)):
                j, lit = _scan_regex(src, i)
                out.append(lit)
                i = j
                continue

        out.append(c)
        i += 1

    return _tidy(''.join(out))


def _scan_template_text(src: str, i: int, tmpl_stack: list):
    """Consume a template literal's TEXT from i, stopping after a closing ` or at a ${."""
    n = len(src)
    start = i
    while i < n:
        if src[i] == "\\":
            i += 2
            continue
        if src[i] == "`":
            return i + 1, src[start:i + 1]
        if src[i] == "$" and i + 1 < n and src[i + 1] == "{":
            tmpl_stack.append(0)
            return i + 2, src[start:i + 2]
        i += 1
    return n, src[start:n]


def _scan_regex(src: str, i: int):
    """Consume a regex literal starting at the `/` at i. Returns (next index, literal)."""
    n = len(src)
    j = i + 1
    in_class = False
    while j < n:
        c = src[j]
        if c == "\\":
            j += 2
            continue
        if c == "\n":                                  # not a regex after all — a stray slash
            return i + 1, src[i]
        if in_class:
            if c == "]":
                in_class = False
        elif c == "[":
            in_class = True
        elif c == "/":
            j += 1
            while j < n and (src[j].isalpha()):        # flags
                j += 1
            return j, src[i:j]
        j += 1
    return i + 1, src[i]


# ---------------------------------------------------------------------------
# HTML

_RAW = re.compile(r"<(script|style|pre|textarea)\b([^>]*)>", re.I)


def strip_html(src: str) -> str:
    """Remove HTML comments outside raw-text elements; strip inline <style> and
    <script> bodies with the CSS/JS strippers. JSON-LD is left alone."""
    out = []
    i, n = 0, len(src)
    while i < n:
        m = _RAW.search(src, i)
        if not m:
            out.append(_strip_html_comments(src[i:]))
            break
        out.append(_strip_html_comments(src[i:m.start()]))
        tag, attrs = m.group(1).lower(), m.group(2)
        close = re.compile(r"</%s\s*>" % tag, re.I).search(src, m.end())
        end = close.start() if close else n
        body = src[m.end():end]

        if tag == "style":
            body = strip_css(body)
        elif tag == "script":
            # ⛔ a JSON-LD block is DATA. Leave every byte of it.
            if "json" in attrs.lower():
                pass
            elif "src=" in attrs.lower():
                pass                                   # external, no body worth touching
            else:
                body = strip_js(body)
        # pre / textarea: body is content the user sees — never touched

        out.append(src[m.start():m.end()])
        out.append(body)
        out.append(src[end:close.end()] if close else "")
        i = close.end() if close else n
    return ''.join(out)


def _strip_html_comments(chunk: str) -> str:
    """Drop <!-- --> from a run of markup. Conditional comments are kept."""
    out = []
    i, n = 0, len(chunk)
    while i < n:
        j = chunk.find("<!--", i)
        if j == -1:
            out.append(chunk[i:])
            break
        out.append(chunk[i:j])
        if chunk.startswith("<!--[if", j):             # IE conditional — keep it whole
            k = chunk.find("-->", j)
            k = n if k == -1 else k + 3
            out.append(chunk[j:k])
            i = k
            continue
        k = chunk.find("-->", j + 4)
        i = n if k == -1 else k + 3
    return _tidy_html(''.join(out))


# ---------------------------------------------------------------------------
# whitespace — timid on purpose (see the header)


def _tidy(s: str) -> str:
    """Drop lines that are now empty and trailing spaces. Never joins lines."""
    lines = [ln.rstrip() for ln in s.split("\n")]
    return "\n".join(ln for ln in lines if ln != "")


def _tidy_html(s: str) -> str:
    """Same, but a run of markup may legitimately be pure whitespace between two
    inline elements — so a chunk that is ONLY whitespace is left as it is."""
    if s.strip() == "":
        return s
    lines = [ln.rstrip() for ln in s.split("\n")]
    kept = [ln for ln in lines if ln != ""]
    # keep one leading/trailing newline if the original had one, so tags don't fuse
    lead = "\n" if s[:1] == "\n" else ""
    tail = "\n" if s[-1:] == "\n" else ""
    return lead + "\n".join(kept) + tail


# ---------------------------------------------------------------------------
# the checks
#
# ⛔⛔ AN EARLIER VERSION OF THIS SECTION WAS A FAKE PROOF AND IT IS WORTH RECORDING WHY.
# It compared "the token stream of the original" against "the token stream of the stripped file"
# — but it computed BOTH by running the scanner below. Any bug in the scanner appeared identically
# on both sides, so the assertion passed by construction and proved precisely nothing. A check
# that cannot fail is worse than no check, because it reads like a guarantee.
#
# ⭐ What follows only claims what it can. The real evidence is INDEPENDENT of this file:
#   1. `node --check` on every stripped script — V8's own parser, not mine. A mis-scanned string,
#      template or regex almost always lands as a syntax error there.
#   2. The browser, on the actual upload: `document.styleSheets[].cssRules.length` is Blink's own
#      CSS parse, and the D315 freeze probe re-measures the page's real geometry.
# Both are run by hand at build time and recorded in the register — see HANDOVER.md §D, D315.


def balance_report(src: str, kind: str) -> dict:
    """Cheap structural sanity on a STRIPPED file. Catches the loud failures: a comment that ate
    a brace, or a string the scanner walked off the end of."""
    if kind == "css":
        body = src
    else:
        body = src
    return {
        "braces": body.count("{") - body.count("}"),
        "parens": body.count("(") - body.count(")"),
        "brackets": body.count("[") - body.count("]"),
        "comment_open_left": body.count("/*") - body.count("*/"),
        "html_comment_left": body.count("<!--") - body.count("-->"),
    }


def is_idempotent(src: str, kind: str) -> bool:
    """Stripping twice must equal stripping once. Not a proof of correctness, but a scanner that
    mis-reads its own output fails here."""
    f = {"css": strip_css, "js": strip_js, "html": strip_html}[kind]
    once = f(src)
    return f(once) == once

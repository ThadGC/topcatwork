# -*- coding: utf-8 -*-
"""THE ONE PLACE THAT SAYS WHICH STONES THE SITE SELLS, AND IN WHAT ORDER.

⭐ Why this file exists. The range used to live in THREE hand-kept copies — `catalogue_source.S`,
`STONE_LIST` in build_stones.py, and `MATERIALS` in index.html — each carrying its own comment
telling the next person to remember to update the other two. That held at 52 stones because
someone checked it by hand every time. It does not hold at 96, and a drift between them does not
error: the wheel simply shows a different slab from the stone page under the same name, which is
the wrong-image-under-a-right-name failure the client says would sink them.

Now: this module is the source, `build_stones.py` imports it, and `apply_catalogue.py` injects the
same list into index.html between the STONE-LIST markers. Nothing is typed twice.

⚠️ TO SWITCH THE RANGE, CHANGE THE IMPORT BELOW AND NOTHING ELSE, then run:
      cd stones && python3 apply_catalogue.py && python3 harvest/match.py --prune \\
          && python3 build_stones.py

    catalogue_source    the original 52, every blurb written in the client's voice and checked
    catalogue_expanded  96 stones (Quartz 50, Marble 29, Granite 17) — the 52 carried through
                        untouched, plus 44 more the suppliers actually stock. The added entries
                        carry review=True because their copy is GENERATED and has not been
                        through the client's voice yet.

⛔ 50 A CATEGORY IS REACHED FOR QUARTZ ONLY, and that is a supply fact, not a shortfall in the
   work. The client's two licensed suppliers list 27 granite names and 27 marble names between
   them; after the ones with no usable photograph are dropped the natural-stone pool is what it
   is. Padding either list would mean either listing stone TopCat cannot actually get, or taking
   photographs from a supplier they have no account with — LICENSING.md rules the second one out
   and the first turns a lead into an apology. The route to a wider granite range is an account
   with another supplier, or the Caesarstone/CRL/Cosentino fabricator packs.
"""
from catalogue_expanded import S as _BASE  # noqa: F401
from catalogue_dark import S_DARK          # noqa: F401
from catalogue_mirror import S_MIRROR      # noqa: F401

# ⭐ THE DARK QUARTZ (client, 10 Aug 2026). Kept in their own module because `grow.py`
# regenerates catalogue_expanded.py, and a generator overwriting the range is exactly how the
# D46 correction was silently reverted. See catalogue_dark.py for why they exist and for the
# licensing note that is still open on Caesarstone and CRL.
_RAW = _BASE + S_DARK + S_MIRROR


# ---------------------------------------------------------------------------
# ⭐ THE RANGE IS IN ALPHABETICAL ORDER (client, 10 Aug 2026 — D85)
# ---------------------------------------------------------------------------
# Client: "we should probably be smarter and order all the slabs in the slab wheel and in the
# collection thing in alphabetical order, because that would make it easier for people to
# navigate. And if they already want one."
#
# ⛔ THIS REVERSES D74, WHICH WAS ALSO HIS INSTRUCTION, AND THE TWO CANNOT BOTH BE HAD.
# D74 was "make sure to spread them in between, don't keep all the dark next to each other."
# A name tells you nothing about a stone's colour, so sorting by name puts the tone wherever
# the alphabet leaves it. Measured on the alphabetical order this file now produces:
#
#     Quartz  ........D...D..........................DD....DD.D.DDD....DD.D   longest run 3
#     Marble  ....DD...........D.....DDDD.DD..DD..D.D...DD.                  longest run 4
#     Granite DDDDDDD...D...D.DD..                                           longest run 7
#
# ⚠️ GRANITE OPENS ON SEVEN DARK STONES IN A ROW, which is the exact wall D74 was created to
# remove — it has moved from the end of granite to the front of it. Four of the seven are
# Absolute Black in four finishes and one more is Angola Black, so alphabetical at least keeps
# the same stone's finishes together, which is defensible in a way the old clump was not.
# ⭐ THE CLIENT HAS BEEN SHOWN THE NUMBERS. If he wants the spread back, the answer is not to
# undo this file: it is to sort on the FIRST LETTER only and spread tone within each letter,
# which he offered ("possibly only worry about the first letter") and which is a change to
# _alphabetical below, not to anything that consumes it.
#
# ⛔ WHAT KEEPS A DARK STONE OFF THE LANDING CARD IS NOT THIS FILE. The wheel picks where to
# open (`landingIndex` in index.html) and it skips forward until the card and the two after it
# are light. Do not try to solve that here by reordering the catalogue.
#
# ⭐ This is an ORDERING change and nothing else. No stone is added, removed, recoloured or
# reclassified, and `tone` is untouched — it is still what the filter runs on, and it is still
# what `derive.measure` read off the photograph (D58).
#
# ⚠️ SORTED ON THE DISPLAYED NAME, CASE-FOLDED, not on the slug. The slug is a URL and drifts
# from the name on purpose in several places — `calacatta-oro-quartz` is displayed "Calacatta
# Oro", `arctic-cream` ships the supplier's misspelled tile `artic-cream` — so sorting on it
# would put stones in an order the customer cannot see any logic in. The name is what is
# printed on the card, so the name is what it sorts on.
def _alphabetical(rows):
    """Sort each material's stones A-Z by displayed name, leaving the material blocks in place.

    ⚠️ Per material, not across the whole list. The collection grid renders every stone in this
    order and filters client-side, so sorting the whole catalogue as one list would interleave
    quartz, marble and granite through the "All" view and break the one thing that view is good
    at. Each range is alphabetical WITHIN itself, which is what a customer looking for a name
    actually needs.
    """
    order, seen = [], []
    for s in rows:
        if s["mat"] not in seen:
            seen.append(s["mat"])
    for mat in seen:
        order.extend(sorted((s for s in rows if s["mat"] == mat),
                            key=lambda s: s["name"].casefold()))
    return order


S = _alphabetical(_RAW)

# A rebuild that silently dropped or duplicated a stone would be invisible on the page and
# fatal in the catalogue, so the merge is checked rather than trusted.
assert len(S) == len(_RAW), f"the sort changed the count: {len(_RAW)} -> {len(S)}"
assert {s["slug"] for s in S} == {s["slug"] for s in _RAW}, "the sort changed which stones ship"

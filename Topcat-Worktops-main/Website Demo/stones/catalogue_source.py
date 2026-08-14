# -*- coding: utf-8 -*-
"""The real Topcat range, taken from the two suppliers the client sent (6 Aug 2026).
Nile specs are live from their inventory API; Next Stone publish no specs.
Blurbs are ours, house style: British English, no em dashes, no exclamation marks.
QZ = quartzite, which is NOT marble and must never be told it etches."""

QZ = dict(kind="Quartzite (natural stone)",
          care="Sealed on fitting and resealed periodically. Far less porous than marble, and it does not etch the way marble does, so citrus and wine are not the worry they would be on a Calacatta.",
          wear="A very hard stone, harder than granite on most slabs. It takes daily kitchen use well. Boards for cutting and a trivet for hot pans are still sensible.")
TRAV = dict(kind="Travertine (natural stone)",
            care="Honed and filled, then sealed on fitting and resealed periodically. Wipe acidic spills promptly.",
            wear="Softer than marble and more open in texture, so it wears to a patina rather than staying pristine. It suits a kitchen that wants an older, lived-in look.")

# name, slug, preset, seed, tone, hue, vein, finish, size, thick, blurb, [facts override]
S = []
def add(mat, sup, name, slug, preset, seed, tone, hue, vein, finish, size, thick, blurb, facts=None):
    S.append(dict(name=name, slug=slug, mat=mat, sup=sup, preset=preset, seed=seed, tone=tone,
                  hue=hue, vein=vein, finish=finish, size=size, thick=thick, blurb=blurb, facts=facts))

N, NX = "Nile Stone", "Next Stone Slabs"

# ============================================================ QUARTZ (24)
add("Quartz", N, "Almond Beige", "almond-beige", "crema", 201, "light", "cream", "calm", "Polished", "3220 x 1620", "20mm",
    "A warm beige with very little movement, closer to a plain than a marble. It sits well with oak and cream units, and it hides crumbs better than a white ever will.")
add("Quartz", N, "Arabescato Capri", "arabescato-capri", "calacatta", 202, "light", "white", "statement", "Polished", "3220 x 1620", "30mm",
    "White with broad grey veins that fork and double back, the way Arabescato does in the quarry. Bold enough to carry a whole island on its own.")
add("Quartz", N, "Arabescato Elegance", "arabescato-elegance", "statuario", 203, "light", "white", "soft", "Polished", "3220 x 1620", "20mm",
    "The same Arabescato drawing, drawn lighter. Grey veining on a bright white ground, with enough restraint to run through a whole kitchen without shouting.")
add("Quartz", N, "Azul Shimmer", "azul-shimmer", "mist", 204, "light", "blue", "calm", "Polished", "3220 x 1620", "20mm",
    "A cool blue grey with a fine sparkle in the surface that catches under downlights. Unusual for quartz, and it reads darker in daylight than it does under a spot.")
add("Quartz", N, "Borghini Royal", "borghini-royal", "calacatta", 205, "light", "white", "statement", "Polished", "3220 x 1620", "20mm",
    "Warm gold and grey veining on an off white ground, after Calacatta Borghini. The gold picks up brass handles and warm lighting rather than fighting them.")
add("Quartz", N, "Blue Lagoon", "blue-lagoon", "carrara", 206, "light", "blue", "statement", "Polished", "3220 x 1620", "20mm",
    "A white ground cut through with blue grey veining, cooler than the Calacattas and a change from the usual gold. It suits a painted kitchen in a deep blue or green.")
add("Quartz", N, "Calacatta Fantastico", "calacatta-fantastico", "calacatta", 207, "light", "white", "statement", "Polished", "3220 x 1620", "20mm",
    "Heavy, confident veining in grey and warm gold across a bright white ground. One of the boldest patterns we hold, so it wants a run where you can see it whole.")
add("Quartz", N, "Calacatta Oro", "calacatta-oro-quartz", "eternal", 208, "light", "cream", "statement", "Polished", "3220 x 1620", "20mm",
    "Warm gold veins running through a soft white, the quartz reading of Calacatta Oro. Gold rather than grey, so it warms a room instead of cooling it.")
add("Quartz", N, "Calacatta Gold Soft", "calacatta-gold-soft", "eternal", 209, "light", "cream", "soft", "Polished", "3220 x 1620", "20mm",
    "The Calacatta gold veining held back and softened to a whisper across an off white ground. For a kitchen that wants marble without the argument.")
add("Quartz", N, "Grigio Fantasy", "grigio-fantasy", "mist", 210, "light", "grey", "soft", "Polished", "3220 x 1620", "20mm",
    "Mid grey with a loose, drifting pattern rather than clean veins. It hides marks well and pairs with almost any unit colour.")
add("Quartz", N, "Concrete Earth", "concrete-earth", "mist", 211, "light", "grey", "calm", "Polished", "3220 x 1620", "20mm",
    "A concrete finish with a warm earth undertone, nearly free of pattern. Industrial without being cold.")
add("Quartz", N, "Cloud Burst", "cloud-burst", "eternal", 212, "light", "grey", "soft", "Polished", "3220 x 1620", "30mm",
    "Soft grey shapes that gather and break like weather across a pale ground. Quiet from a distance, and interesting up close.")
add("Quartz", N, "Carrara Shimmer", "carrara-shimmer", "carrara", 213, "light", "white", "soft", "Polished", "3220 x 1620", "30mm",
    "The fine grey grain of Carrara with a faint shimmer worked into the surface. A familiar white that does not read as flat.")
add("Quartz", N, "Carrara Jumbo", "carrara-jumbo", "carrara", 214, "light", "white", "soft", "Polished", "3220 x 1620", "20mm",
    "Carrara veining on a jumbo slab, which is the whole point of it. Fewer joints across a long run, and more of the pattern in one piece.")
add("Quartz", NX, "Sahara Dunes", "sahara-dunes", "crema", 215, "light", "cream", "calm", "Polished", "", "",
    "Warm sand tones drifting in soft bands, closer to desert stone than to marble. It brings warmth to a kitchen with a lot of white in it.")
add("Quartz", NX, "Crema Evora", "crema-evora", "crema", 216, "light", "cream", "calm", "Polished", "", "",
    "A gentle cream with a fine, even grain. One of the easiest surfaces to live with, and forgiving of a busy family kitchen.")
add("Quartz", NX, "Crema Venato", "crema-venato", "crema", 217, "light", "cream", "soft", "Polished", "", "",
    "Cream with a soft veining that runs in one clear direction. Warmer than a grey marble and quieter than a gold one.")
add("Quartz", NX, "Crema Tempest", "crema-tempest", "crema", 218, "light", "cream", "statement", "Polished", "", "",
    "Cream with more weather in it, veins gathering and scattering across the slab. It suits a long island where the pattern has room to move.")
add("Quartz", NX, "Arabescato Gold", "arabescato-gold", "eternal", 219, "light", "white", "statement", "Polished", "", "",
    "Arabescato veining carried in gold rather than grey, on a bright white ground. Warm, and confident without being loud.")
add("Quartz", NX, "Sabbia Beige", "sabbia-beige", "crema", 220, "light", "cream", "calm", "Polished", "", "",
    "A sandy beige with almost no movement. Chosen when the worktop is meant to sit back and let the cabinetry do the talking.")
add("Quartz", NX, "Arabescato Grey", "arabescato-grey", "carrara", 221, "light", "grey", "statement", "Polished", "", "",
    "The Arabescato pattern in cool greys, drawn on a soft white. It works against dark units and pale floors alike.")
add("Quartz", NX, "Tuscany Supreme", "tuscany-supreme", "crema", 222, "light", "cream", "soft", "Polished", "", "",
    "A warm cream ground with fine, layered veining. It reads as an older, softer marble rather than a bright modern white.")
# ⚠️ CORRECTED 9 Aug 2026 AGAINST THE SUPPLIER'S OWN PHOTOGRAPH, and the client should read
# the new sentence. This was written as a dark brown statement stone before anyone had seen it.
# Next Stone Slabs' own file for it (misterio-gold-2-2-of-4.jpg, the same "N of 4" shoot
# numbering they use across the range) is a pale cream ground with fine gold veining. tone,
# hue, vein and preset all said dark/brown/statement, so the stone was answering the "dark"
# filter and then showing the customer something pale.
add("Quartz", NX, "Misterio Gold", "misterio-gold", "crema", 223, "light", "cream", "calm", "Polished", "", "",
    "A soft cream ground with fine gold veining drifting across it. Warm without being heavy, and it settles in beside oak, brass and painted units.")
add("Quartz", NX, "Fresh Cement", "fresh-cement", "mist", 224, "light", "grey", "calm", "Polished", "", "",
    "A pale, even cement finish with no veining at all. The plainest surface we hold, and the one that lets a strong kitchen speak.")

# ============================================================ MARBLE CATEGORY (20)
add("Marble", N, "Arabescato Vagli Oro", "arabescato-vagli-oro", "calacatta", 301, "light", "white", "statement", "Honed", "3150 x 2000", "20mm",
    "Quarried at Vagli in the Apuan Alps, with broad grey veins and a gold thread running alongside them. Honed rather than polished, so the surface is matt and soft to the touch.")
add("Marble", N, "Calacatta Gold Oro", "calacatta-gold-oro", "calacatta", 302, "light", "white", "statement", "Polished", "3000 x 1650", "20mm",
    "The marble most people ask for by name. A bright white ground with warm gold veining running through it, quarried above Carrara.")
add("Marble", N, "Calacatta Viola", "calacatta-viola", "goldveil", 303, "dark", "brown", "statement", "Polished", "", "",
    "Deep burgundy and plum veining across a white ground, quite unlike any other Calacatta. It is a statement stone and it knows it, so one piece is usually enough.")
add("Marble", N, "Calacatta Vagli Oro", "calacatta-vagli-oro", "calacatta", 304, "light", "white", "statement", "Honed", "3050 x 2000", "20mm",
    "Calacatta from the Vagli quarries with a warm gold vein, finished honed. Less reflective than a polish, and kinder to fingerprints.")
add("Marble", N, "Fantastico Arni", "fantastico-arni", "statuario", 305, "light", "white", "statement", "Honed", "2900 x 2000", "20mm",
    "From the Arni basin above Carrara, with generous grey veining on a white ground. Honed, so it reads soft rather than glassy.")
add("Marble", N, "Nero Marquina", "nero-marquina", "nerogold", 306, "dark", "black", "statement", "Polished", "", "",
    "Spanish black marble with sharp white veins cutting across it. Dramatic, and best used where it can be seen whole rather than in small pieces.")
add("Marble", N, "Rainforest Brown", "rainforest-brown", "emperador", 307, "dark", "brown", "statement", "Polished", "2500 x 1500", "20mm",
    "An Indian marble with brown and cream veining that branches like tree roots. Every slab is different, and the pattern is the reason to choose it.")
add("Marble", N, "Verde Guatemala", "verde-guatemala", "fumo", 308, "dark", "green", "statement", "Polished", "2450 x 1520", "20mm",
    "Deep green with white veining running through it, quarried in India despite the name. A strong colour, and one that has come back into fashion.")
add("Marble", N, "Travertine Romano Classico", "travertine-romano-classico", "crema", 309, "light", "cream", "soft", "Honed and filled", "3150 x 1550", "20mm",
    "Roman travertine in warm beige, with the fine horizontal banding travertine is known for. Honed and filled, for a softer and older look than marble.", TRAV)
add("Marble", N, "Carrara", "carrara-honed", "carrara", 310, "light", "white", "soft", "Honed", "3050 x 1800", "30mm",
    "The familiar soft white Carrara with its fine grey grain, finished honed. The quietest marble we hold, and the most forgiving.")
add("Marble", N, "Bianco Eclypsia Calacatta", "bianco-eclypsia-calacatta", "calacatta", 311, "light", "white", "statement", "Polished", "3270 x 1960", "20mm",
    "A quartzite that reads like a Calacatta, white with grey and gold veining, but considerably harder than marble and far less prone to etching.", QZ)
add("Marble", N, "Belvedere", "belvedere-leather", "emperador", 312, "dark", "brown", "soft", "Leathered", "3400 x 2000", "20mm",
    "Finished leathered rather than polished, so the surface has a texture you can feel. Warm greys and browns, and it hides marks better than any polish.", QZ)
add("Marble", N, "Blue Roma", "blue-roma", "mist", 313, "light", "blue", "soft", "Polished", "", "",
    "A quartzite in cool blue grey with white veining drifting through it. Unusual, hard wearing, and a genuine alternative to a grey marble.", QZ)
add("Marble", N, "Cristallo", "cristallo", "statuario", 314, "light", "white", "calm", "Polished", "3400 x 2000", "20mm",
    "A pale quartzite with a crystalline surface that catches light. Often backlit on an island end, where the stone almost glows.", QZ)
add("Marble", N, "Fusion Blue", "fusion-blue-leather", "goldveil", 315, "dark", "blue", "statement", "Leathered", "3250 x 1950", "30mm",
    "Blue, rust and cream running in bands across the slab, finished leathered. One of the most striking stones we hold, and no two pieces are alike.", QZ)
add("Marble", N, "Fusion Black", "fusion-black", "nerogold", 316, "dark", "black", "statement", "Polished", "", "",
    "The darker Fusion, black with copper and grey movement running through it. Best on an island where the whole pattern can be read at once.", QZ)
add("Marble", N, "Lemurian Blue", "lemurian-blue", "fumo", 317, "dark", "blue", "soft", "Polished", "3200 x 1720", "20mm",
    "A quartzite with blue and gold flecks scattered through a grey ground. It changes considerably depending on the light it sits under.", QZ)
add("Marble", N, "Patagonia", "patagonia", "mist", 318, "light", "grey", "statement", "Polished", "3350 x 2000", "20mm",
    "Large crystal shapes in white, grey and amber, more like a cross section of rock than a veined marble. A feature stone, usually chosen for one piece rather than a whole kitchen.", QZ)
add("Marble", N, "Taj Mahal", "taj-mahal", "crema", 319, "light", "cream", "calm", "Polished", "3600 x 1950", "20mm",
    "A warm cream quartzite with soft, subtle veining. It has the calm of a limestone and the hardness of a quartzite, which is why it has become so popular.", QZ)
add("Marble", N, "Venaria Reale", "venaria-reale", "eternal", 320, "light", "cream", "soft", "Polished", "3300 x 2000", "20mm",
    "Warm greys and golds moving in wide bands across a pale ground. Softer than Patagonia, and easier to run through a whole kitchen.", QZ)

# ============================================================ GRANITE (8)
add("Granite", N, "Absolute Black Extra", "absolute-black-extra", "nerogold", 401, "dark", "black", "calm", "Polished", "3300 x 1950", "30mm",
    "A true black granite with no visible grain, quarried in India and graded Extra for consistency. The plainest and hardest working surface in the range.")
add("Granite", N, "Antiq Brown Extra", "antiq-brown-extra", "emperador", 402, "dark", "brown", "calm", "Polished", "3200 x 1780", "20mm",
    "Deep brown with a fine black and gold fleck. Warm, forgiving of marks, and a good match for oak and walnut units.")
add("Granite", N, "Azul Platino", "azul-platino", "mist", 403, "light", "grey", "calm", "Polished", "", "",
    "A Spanish granite in soft platinum grey with a fine even grain. Understated, and one of the easiest granites to build a kitchen around.")
add("Granite", N, "Astoria", "astoria", "crema", 404, "light", "cream", "soft", "Polished", "", "",
    "Cream and gold with a gentle flowing grain. Warmer than most granites, and closer to a marble in feel while keeping granite's hardness.")
add("Granite", N, "Bianco Crystal", "bianco-crystal", "statuario", 405, "light", "white", "calm", "Polished", "3200 x 1950", "30mm",
    "A pale granite with a crystalline sparkle running through it, white and grey together. Bright, and it holds its colour under artificial light.")
add("Granite", N, "Blue Dunes", "blue-dunes-leather", "fumo", 406, "dark", "blue", "soft", "Leathered", "3300 x 1980", "30mm",
    "Blue and grey drifting in wide bands, finished leathered so the texture is soft underhand. It hides fingerprints in a way a polish cannot.")
add("Granite", N, "Colonial Cream", "colonial-cream", "crema", 407, "light", "cream", "calm", "Polished", "", "",
    "Cream with a soft grey and garnet fleck, an Indian granite that has been a steady seller for years. Warm, practical and quiet.")
add("Granite", N, "Colombo Juparana", "colombo-juparana", "crema", 408, "light", "cream", "soft", "Polished", "", "",
    "Cream and gold with a long flowing grain that runs the length of the slab. A busy stone, and one that suits a traditional kitchen.")

if __name__ == "__main__":
    from collections import Counter
    c = Counter(x["mat"] for x in S)
    print("total", len(S), dict(c))
    assert len({x["slug"] for x in S}) == len(S), "duplicate slug"
    assert len({x["seed"] for x in S}) == len(S), "duplicate seed"
    print("hues:", sorted({x["hue"] for x in S}))
    print("finishes:", sorted({x["finish"] for x in S}))
    print("quartzite/travertine overrides:", sum(1 for x in S if x["facts"]))

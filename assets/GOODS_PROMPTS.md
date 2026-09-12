# Warengrafiken – eingebautes Imagegen-Werkzeug

Die Assets wurden für das Projekt erzeugt und in assets kopiert. Keine Originalsprites extrahiert.

## Generierung – goods-atlas-v1.png (Entwurf, nicht eingebunden)

Use case: stylized-concept. Asset type: a production-ready 6 columns by 4 rows sprite atlas for a small isometric settlement game inspired by early-2000s painted PC strategy graphics. Generate a landscape 1536x1024 image, genuinely transparent background, exactly 24 evenly spaced square cells, NO grid lines, NO text, NO labels. Each object centered in its own 256x256 cell occupying 65% of cell, never crossing cells. Warm painted pre-rendered miniature style, crisp readable silhouettes, top-left lighting, view down at 30 degrees; not flat vector icons, no frames, no UI. These goods will be carried on a tiny worker's shoulder and shown beside buildings, so each cell depicts one compact physical load with readable material texture. Exact order left-to-right: ROW 1: two brown timber logs with cut ends; bundle of golden sawn planks; gray building stone block; tied wheat sheaf; cream flour sack; round brown bread loaf. ROW 2: two silvery fish; small wooden water bucket; small pink pig; red meat cut; small pile black coal; gray iron ore with rusty veins. ROW 3: gold-veined ore; yellow sulfur mineral; dark silver iron ingot; golden gold ingot; hammer and saw bound together; steel sword. ROW 4: wooden bow; wicker basket of food; axe; hammer; shovel; sickle. Consistent scale and padded crop. Original artwork, without copying any specific game's sprites.

## Hintergrundkorrektur – goods-atlas-v2.png (Entwurf, nicht eingebunden)

Edit only the background of this exact 1536x1024 6-column 4-row sprite atlas. Remove ALL brown/gray backdrop and ALL drop shadows. Background must be actual transparent alpha, not a painted checkerboard, not a colored background. Preserve all 24 objects, their material detail, their exact positions, same pixel dimensions and row/column ordering. Isolate the object edges cleanly. No other changes.

Das Resultat enthielt einen gemalten Schachbretthintergrund, keine Alpha-Transparenz (`sips -g hasAlpha`: no).

## Color-Key-Korrektur – goods-atlas-keyed-v3.png (eingebunden)

Change only the checkerboard background to perfectly flat solid pure magenta RGB(255,0,255), hex #ff00ff. This is a color-key sprite sheet for a game renderer. No gradients, no shadows, no checkerboard, no halos, no texture in the magenta. Preserve exact 1536x1024 layout of 6 columns x 4 rows and all 24 foreground objects. Every background pixel must be flat magenta. Keep objects unchanged.

Der Renderer importiert das Color-Key-Bild einmal, entfernt die Schlüsselfarbe im Canvas, normalisiert die etwas ungleichmäßigen Reihen und verwendet anschließend einen kleinen gemeinsamen Atlas für Figuren, Gebäudewaren und Menüicons. Die Quelldatei bleibt unverändert.

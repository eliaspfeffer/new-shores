# Grafikreferenzen und aktueller Abgleich

## Nachtrag 13. September: getrennte Ufer für Seed-Karten

[Original-Kartenansicht der PC-Mission-CD](https://www.siedler4.com/grafik/mcd/screens/4.jpg), gefunden über Bildersuche und vollständig im Browser visuell betrachtet: türkisfarbenes Wasser, schmale sandgelbe Ufer, mehrere voneinander getrennte Wasserflächen. Nur Landschaftsreferenz, keine Fraktionsgebäude daraus abgeleitet. Die neuen Karten sind eigene Layouts; keinerlei Originalkarten oder Sprites extrahiert.

Der bisherige Renderer verband den ersten Uferpunkt jeder Zeile zu einer einzigen Küste. Bei Seen entstand damit fälschlich ein Wasserstreifen über Land. Neue Seed-Karten zeichnen stattdessen nur tatsächliche Land-Wasser-Kanten getrennt, mit schmaler Sand-/Lichtkante und den vorhandenen eigenen Gras-/Wassertexturen. Die klassische Karte behält ihren bisherigen geglätteten Küstenrenderer. Neue Raster-Ufergrafiken, weiche Original-Terrainübergänge, Höhen und Wasseranimation bleiben offen.

> Neuer Nachtrag: [Geologie, Figurenmenü und prozedurale Bau-/Arbeitsanimationen](AKTIVITAET_UPDATE.md). Vorhandene eigene Rastergrafiken weiterverwendet, Originalbild erneut betrachtet. Keine Behauptung vollständig verglichener Original-Animationsfolgen.

> Neuerer UI-/Waren-/Erkundungsabgleich: [AUSBAU_AKTUELL.md](AUSBAU_AKTUELL.md). Schwarzer Erkundungsnebel und ein neues Warengrafikset sind inzwischen implementiert; ältere „offen“-Angaben unten beschreiben den früheren Stand.

## Nachtrag: rote Gebietsgrenzen

Die roten Grenzmarkierungen im vom Nutzer gelieferten Original-Screenshot sind die visuelle Vorlage. Die bisherigen blauen Rechtecke sind durch kleine rote, schattierte Grenzpunkte ersetzt, einschließlich der Küstenfelder. Die Punkte folgen dem tatsächlichen Gebiet von Lager, besetzten Türmen und Pionieren; neutrale Felder und das Innere des Gebiets erhalten keine Grenzpunkte. Andere Besitzer werden hier bernsteinfarben unterschieden. Es gibt noch keine einheitliche wählbare Spielerfarbpalette. Die Grenze bezeichnet Besitz, nicht den Erkundungsstand; schwarzer Erkundungsnebel bleibt offen. Hintergrund: [Handbuch](https://www.mogelpower.de/manuals/Die_Siedler_IV_Handbuch.pdf), Abschnitt „Ihre Siedlung vergrößern“.

## Nachtrag: Bauplatzpunkte

Nutzer-Screenshot vom 12. September 2026 visuell ausgewertet: kleine plastisch schattierte grün/türkise und gelbe Punkte liegen auf möglichen Bauplätzen. Das [Originalhandbuch, Seite 36](https://www.mogelpower.de/manuals/Die_Siedler_IV_Handbuch.pdf#page=19) bestätigt: Die Farbe bezeichnet den Planieraufwand, nicht die verfügbaren Materialien.

Implementiert: grün-türkise Bauplatzpunkte nur bei ausgewähltem Gebäude, berechnet mit derselben Standortprüfung wie das Bauen. Berücksichtigt eigenes Territorium, Belegung, Wasser und gebäudespezifische Rohstoffnähe bzw. entdeckte Vorkommen. Standortliste wird zwischengespeichert; außerhalb der Ansicht wird nicht gezeichnet. Beim Inspizieren oder Verändern eines Arbeitsbereichs verschwinden die Punkte. Materialmangel steht getrennt im Hinweis. Punkte liegen unter Figuren und Vegetation. Gelb/Rot für Planieraufwand bleiben ausstehend, bis das Höhen-/Planierersystem tatsächlich existiert. Kein neues Rasterbild nötig: die kleine UI-Markierung wird direkt im Spielrenderer gezeichnet.

Stand: 12. September 2026. Wunsch des Nutzers: vor Grafikänderungen immer das Original recherchieren, nicht nach bloßer Erinnerung arbeiten.

## Tatsächlich angesehene Originalbilder

- [Wald, Wasser und Figuren – Settlers IV Screenshot](https://images.igdb.com/igdb/image/upload/t_screenshot_huge/sc756m.jpg), gefunden über die Bildersuche. Im Browser vollständig betrachtet: kräftiges gelbgrünes Gras mit feinen Flecken; einzeln erkennbare Baumkronen und Stämme; offene Lichtungen; hellblaues Wasser; kleine Figuren und Warenhaufen.
- [Gebäude und Siedlung – Gamezone](https://www.gamezone.de/Die-Siedler-4-Spiel-21498/Tests/Die-Siedler-4-im-Gamezone-Test-987819/), [betrachtetes Bild](https://www.gamezone.de/screenshots/970x546/2002/08/siedler4.jpg). Im Browser betrachtet: markante Gebäudesilhouetten, verschiedenfarbige Dächer, Stein/Fachwerk, enge Produktionsbereiche, stark unterschiedliche Gebäudegrößen.
- [Ubisoft: History Edition](https://www.ubisoft.com/en-us/games/the-settlers-iv-history-edition) dient der Versionszuordnung, nicht als Ersatz für eine betrachtete Einzelgrafik.

Die direkten Bildabrufe des Web-Lesers scheiterten; beide Originalbilder waren im integrierten Browser zugänglich und wurden dort visuell ausgewertet. Es wurden keine Originalsprites heruntergeladen oder aus Screenshots ausgeschnitten.

## Änderung dieses Durchlaufs

| Grafikgruppe | Umsetzung | Noch offen |
|---|---|---|
| Wiese | Neue zusammenhängende grün-gelbe Rastertextur statt wiederholter detailreicher Kachelbilder | Weitere Landschafts-/Bodenarten und exakter Vergleich bei Originalauflösung |
| Bäume | Neue Eiche, Weide, Birke und Nadelbaum, größere lesbare Kronen, variierende Größen/Positionen innerhalb der vorhandenen Baumfelder | Vollständiger Originalartenkatalog, Baumalter und Fällanimationen |
| Kleine Naturgrafiken | Felsen, Busch, Schilf und Blumen erneuert | Weitere Umweltobjekte, Tiere und jahreszeitliche Varianten |
| Wasser/Küste | Zusammenhängende Wassertextur und geglätteter Küstenverlauf, keine separaten rechteckigen Wasserbilder mehr | Ufertexturen, Animation, Übergänge für beliebige Karten und weitere Wasserarten |
| Zeichenreihenfolge | Gesamter Boden zuerst; danach Gebäude, Vegetation und Figuren. Boden wird ansichtsabhängig zwischengespeichert | Allgemeine Tiefensortierung großer Objekte und gemessene CPU/GPU-/RAM-Last |
| Gebäude | Referenzbild betrachtet, in diesem Durchlauf nicht ersetzt | Pro Gebäudetyp und Volk passende Referenz suchen, Silhouette/Palette/Größe nachbilden |
| Figuren, UI, Ressourcen | Bestehende Grafiksets unverändert | Einzelvergleich aller Berufe, Animationsphasen, Ressourcen-Icons, Schaltflächen und Menüs |

Die Nature-Atlas-Erzeugung scheiterte zunächst an einem Netzwerkfehler und gelang beim zweiten Versuch. Bei der Sichtprüfung wurde ein zu enger Baum-Bildausschnitt korrigiert. Alte Grafiken bleiben erhalten. Spielstand, Ressourcenobjekte, Wegsuche und Produktionsregeln wurden nicht verändert.

## Assets und Prüfung

Mit dem eingebauten Bildgenerierungswerkzeug und dem Imagegen-Skill erzeugt und eingebunden:

- `assets/grass-reference-v2.png`
- `assets/nature-reference-v2.png`
- `assets/water-reference-v2.png`

Prompts: `assets/ART_PROMPTS.md`, Abschnitt „Referenzabgleich Landschaft“. Die neue Darstellung ist eine Annäherung, keine pixelgenaue Rekonstruktion.

`node tests/simulation.mjs`, `node tests/strategy.mjs` und `npm run build` bestehen. Browserprüfung mit geladenem Spielstand: Wald, Boden, Küste, laufende Arbeiter und sichtbare Warenproduktion; keine Konsolenfehler. Keine quantitative Leistungs-/Speichermessung.

## Arbeitsweise für weitere Grafikgruppen

Mobile UI vom 12. September 2026: iPhone-Militäransicht von The Settlers visuell geprüft; runde untere Befehle, freie Kartenmitte, Pause oben und Zoom rechts als Anordnungsreferenz. Eigenständige CSS-Umsetzung, keine neue Rastergrafikfamilie und keine kopierten Originalbuttons. [Quelle, Bedienungsunterschiede und Prüfung](MOBILE.md).

Lazarett-Update vom 12. September 2026: Römisches Originalgebäude vorab visuell geprüft; eigene transparente Dreistufenserie mit blauem Dach, Steinsäulen und Eingangsvorbau. [Quelle, Generierungsprompt und Grenzen](assets/HOSPITAL_PROMPT.md). Fundament, Rohbau und Fertigzustand im laufenden Spiel geprüft. Keine Originalsprites übernommen; eigene Heiler-Sprites und vollständige Behandlungsanimation bleiben offen.

Baustufen-Update vom 12. September 2026: [Quellen, neu generierte Bildpaare, Prüfung und Grenzen](AUTONOMIE_BAUPHASEN.md). Eigenständige Fundament-/Rohbau-Assets für 23 Gebäudetypen, nicht aus Originalgrafiken ausgeschnitten.

1. Originalversion und Volk des gewünschten Assets benennen.
2. Passende Screenshots suchen und wirklich ansehen. Quellen dokumentieren; nicht bloß Suchergebnisbeschreibungen verwenden.
3. Kamerawinkel, Silhouette, Farbfamilie, Größe relativ zu Figuren und Nachbargebäuden sowie Animation unterscheiden.
4. Neue Assets in einer einheitlichen Familie anfertigen, bestehende Varianten nicht löschen.
5. Im Spiel bei gleicher Zoomstufe vergleichen und Ausschnitte/Transparenz/Tiefensortierung prüfen.
6. Nur tatsächlich überarbeitete Gruppen als erledigt markieren; unbekannte Details nicht als originalgetreu ausgeben.

# Grafikreferenzen und aktueller Abgleich

## Nachtrag 22. September 2026: mobile Befehlsmedaillons

Die noch gemischten Text-, SVG- und Waren-Symbole für Nahrung, Bergbau und Metall, Seefahrt, Grundberufe sowie die mobilen Siedlerbefehle wurden durch eine neue, zusammenhängende 4×4-Familie aus warmen Elfenbein-/Messingmedaillons ersetzt. Grundlage bleiben die in diesem Dokument vollständig betrachteten Original-Screenshots der runden Siedler-IV-Menüknöpfe; die Symbole selbst sind eigenständige Projektgrafiken und keine extrahierten Originalassets. Atlasbelegung, unveränderter Built-in-Imagegen-Prompt und Einschränkung sind in [assets/MOBILE_COMMANDS_PROMPT.md](assets/MOBILE_COMMANDS_PROMPT.md) festgehalten. Bestehende Grafiken wurden nicht überschrieben.

23. September 2026: Die unveränderten vorhandenen Gebäudezeichnungen im Daumen-Baukatalog verwenden nun ebenfalls den einheitlichen elfenbein-/messingfarbenen Doppelring mit vier goldenen Akzenten. Hafen und Werft benutzen für „Seefahrt verwalten“ das bereits erzeugte Seefahrt-Medaillon. Es wurde kein Gebäudeasset verändert oder neu generiert.

## Nachtrag 22. September 2026: römisch inspirierte Seefahrt

Vor der Generierung wurden die statischen Originalbilder der römischen [Hafenanlage](https://www.siedlercommunity.de/media/die-siedler-IV-4/gebaeude/roemer/Hafen.png), [Werft](https://www.siedlercommunity.de/media/die-siedler-IV-4/gebaeude/roemer/Werft.png), des [Handelsschiffs](https://www.siedlercommunity.de/media/die-siedler-IV-4/schiffe/Roemer-Handelsschiff.png) und [Kriegsschiffs](https://www.siedlercommunity.de/media/die-siedler-IV-4/schiffe/Roemer-Kriegsschiff.png) im Browser vollständig betrachtet. Übernommen wurden nur die allgemeine Materialhierarchie, isometrische Leserichtung und deutlich unterschiedlichen Silhouetten.

Implementiert sind vier eigenständige transparente Bilddateien: `assets/harbor-comic-v1.png`, `assets/shipyard-comic-v1.png`, `assets/ships-roman-comic-v1.png` (Waren-, Truppen- und Kriegsschiff) und `assets/messenger-skiff-comic-v1.png`. Keine Originalpixel oder ausgeschnittenen Screenshots sind enthalten. Prompts und Runtime-Zuordnung stehen in [assets/NAVAL_PROMPT.md](assets/NAVAL_PROMPT.md).

## Nachtrag 20. September 2026: Fähre

Für die neue Fähre wurde die vollständig betrachtete [römische Landung mit Schiff aus Die Siedler IV](https://www.old-games.ru/game/screenshots/10163.html) als Referenz für Farbigkeit, Holzrumpf und isometrische Lesbarkeit verwendet. Das transparente Sprite ist eine eigenständige kompakte Ein-Feld-Fähre, kein kopiertes oder als original behauptetes Spielasset. Prompt, Ausgabe und Einschränkungen stehen in [assets/FERRY_PROMPT.md](assets/FERRY_PROMPT.md). Beide Kartenachsen verwenden wie die Brücke Original und horizontale Spiegelung; die laufende Menüansicht wurde visuell geprüft.

## Nachtrag 20. September 2026: begehbare Holzbrücke

Für die neue ein Feld lange Holzbrücke wurde kein eindeutig belegtes Brückenasset der PC-Fassung gefunden. Stattdessen wurden Originalbilder von Küste, Hafen und Transportschiffen vollständig betrachtet; Quellen, finaler Built-in-Imagegen-Prompt und Einschränkungen stehen in [assets/BRIDGE_PROMPT.md](assets/BRIDGE_PROMPT.md). Das neue transparente Sprite ist eigenständig, verwendet warmes Holz, helle Steinwiderlager und eine kräftige isometrische Comic-Silhouette. Es ersetzt keine vorhandene Grafik. Beide Achsen, Kartenansicht und laufende Überquerung wurden im Spiel geprüft; eine originalgetreue Siedler-IV-Brücke wird nicht behauptet.

## Nachtrag 20. September 2026: Leuchtturm und KI-Entdeckung

Vor der Umsetzung wurde nach einem Leuchtturm der PC-Fassung von *Die Siedler IV* beziehungsweise der römischen Gebäudefamilie gesucht. In den gefundenen und vollständig betrachteten Siedlungsbildern ([Gamezone: römische Siedlung](https://www.gamezone.de/Die-Siedler-4-Spiel-21498/Tests/Die-Siedler-4-im-Gamezone-Test-987819/), [Holarse: Küstensiedlung mit Schiff](https://holarse.de/wiki/die_siedler_iv)) war kein eindeutig belegbarer Leuchtturm zu sehen. Deshalb wird kein angeblich originales Gebäude nachgebildet. Der neue Leuchtturm ist ein eigenes transparentes Raster-Sprite: heller römisch inspirierter Steinturm, Terrakotta-Dächer und warmes Leuchtfeuer. Vorhandene Rasteratlanten wurden nicht ersetzt; Bauzustände verwenden weiterhin das bestehende neutrale Fundament. Quellen, Prompt und Einschränkungen stehen in [assets/LIGHTHOUSE_PROMPT.md](assets/LIGHTHOUSE_PROMPT.md).

Umgesetzt sind Spielmechanik und eigenständige Comic-Grafik, nicht eine originalgetreue Siedler-IV-Leuchtturmgrafik. Ein direkter Vergleich mit einem belegten Originalasset bleibt offen.

## Nachtrag: einheitliche große Befehlsmedaillons

15. September 2026: Die vier vom Nutzer angehängten aktuellen UI-Ausschnitte und die bereits dokumentierten Gameloft-Handybilder wurden direkt als Größen-, Anordnungs- und Kontrastreferenz verwendet. Nachrichten, Karte, Eckbefehle und Kontextaktionen verwenden nun dieselbe große Medaillongröße mit separaten, kontrastreichen Pergamentbeschriftungen. Einfache Gebäude öffnen keinen Einstellungsdialog mehr; ihre maximal drei Aktionen stehen zusammen mit „Auswahl aufheben“ unten links. Nur die Kaserne und Werkzeugschmiede öffnen über Rekrutieren beziehungsweise Herstellen ein Untermenü. Vorhandene eigene Befehlsmedaillons wurden skaliert; keine Originalgrafik wurde kopiert und keine neue Rastergrafikfamilie eingeführt.

## Nachtrag: direkte Turmsteuerung und Kohlekarren

15. September 2026: Nutzerreferenzen der Gameloft-Handyfassung erneut als UI-Vorlage genutzt: schwebende Turm-Sprechblase, Rundknöpfe, helle Menüs. Desktop und Touch verwenden nun dieselben unteren Befehle, aber weiterhin getrennte Eingabe-/Renderereinstellungen. Spielstand- und Siedlungsübersicht erhalten Pergamentoberflächen. Turmdächer zeigen vorhandene eigene Soldatensprites entsprechend der Besatzung. Kein neuer Original-Turm-Assetvergleich und kein Architekturtausch.

Römische Kohlemine über Websuche gefunden und das [statische Originalbild](https://www.siedlercommunity.de/media/die-siedler-IV-4/gebaeude/roemer/Kohlemine.png) im Browser visuell angesehen. Eigene leere/volle Kohlekarren mit Arbeiter erzeugt: [Prompt und Einschränkungen](assets/MINER_CARTS_PROMPT.md). Transparenz technisch geprüft. Nur Kohlearbeiter verwenden dieses Set; weitere Berufsanimationen und die Original-Animationsfolgen bleiben offen.

## Nachtrag 15. September: Gebäudemenüs und Befehlsbilder

Die bereits visuell geprüften Nutzerbilder der Gameloft-Handyfassung sind die passende Referenz für diesen UI-Pass: Pergament, plastische Rundknöpfe und große Mengenwahl. 16 eigenständige Rastermedaillons erzeugt und in mobile Befehle sowie Gebäudedialoge eingebunden; [Prompt und Versionsquellen](assets/COMMAND_MEDALLIONS_PROMPT.md). Menüs auf 1400×900 und 844×390 mit dem bereitgestellten Spielstand visuell geprüft. Nicht sämtliche Spezialbefehle wurden durch neue Bilder ersetzt.

Bei großem Wohnhaus, Lazarett und Industriegebäuden ausschließlich den Zeichenanker anhand der tatsächlichen sichtbaren Unterkante des vorhandenen Atlas korrigiert. Kein Gebäudeasset ersetzt. Die Gebäude und Bodenwaren wurden im laufenden Spiel betrachtet. Keine Behauptung vollständig originalgetreuer Fraktionsarchitektur.

## Nachtrag: breites Startmenü mit Dialogen

Auf Nutzerwunsch die vorhandene Comic-Holzkarte zur breiten Zweispalten-Navigation umgebaut: Titel links, große Aktionen rechts; Spielziel, Farbe und Karte im Dialog „Neue Siedlung“. Die angehängte eigene Laptop-Ansicht dient als direkte Layout-Fehlerreferenz, die bereits dokumentierten Gameloft-Holztafeln bleiben die Stilreferenz. Keine Rastergrafikfamilie geändert, keine Originalassets extrahiert. Hauptmenü und laufendes Spiel bei 894×612, 1400×900 und 844×390 visuell geprüft, Hauptmenü zusätzlich bei 390×844 funktional geprüft. Kontraste der Dialogfelder nach der ersten Sichtprüfung korrigiert. Keine Behauptung pixelidentischer Originalmenüs.

## Nachtrag 14. September: freundliche Comic-Menüoberflächen

Referenzsuche nach „The Settlers Gameloft iPhone menu buttons“: [mobile MobyGames-Galerie](https://www.mobygames.com/game/54165/the-settlers/) als Versionshinweis. Visuell erneut vollständig betrachtet wurden die Nutzerbilder 1 (Gameloft-Startmenü mit hellen Holztafeln) und 7 (mobile Militärgebäude, plastische Rundknöpfe). Umgesetzt als eigene CSS-Oberflächen: helle Holzkarte, dunkle Konturen, warme Druckknöpfe, Pergamentdialoge und kräftigere mobile Rundknöpfe. Keine Originalsprites kopiert, keine Rastergrafiken verändert. Der Redesign-Skill wurde für gezielte Oberflächen-/Kontrastkorrekturen im bestehenden CSS verwendet; Nutzerreferenzen haben Vorrang vor allgemeinen Stilvorgaben.

Startansicht und laufendes Spiel in 894×612 und 844×390 visuell geprüft; schwache Textkontraste im ersten Durchgang korrigiert. Bestehendes Landschaftstitelbild bleibt erhalten. Weitere Spezialdialoge und sämtliche Originalsymbole sind nicht vollständig neu gestaltet; kein pixelidentischer Nachbau.

## Nachtrag 14. September: mobile Daumen-Menüs

Die 30 vom Nutzer angehängten Screenshots der Gameloft-Handyfassung wurden als direkte UI-Referenz visuell betrachtet. Anordnung, Kategorien, Pergamentblätter, Waren-Seiten und Kontextbefehle sind in [MOBILE_REFERENCE_AUDIT.md](MOBILE_REFERENCE_AUDIT.md) einzeln den Bildern zugeordnet. Keine Änderungen an Rastergrafikfamilien, keine kopierten Original-Sprites, keine Vermischung mit der Desktop-Seitenleiste. Neue eigene CSS-Rahmen und kleine SVG-Befehlssymbole; vorhandene Gebäude-/Waren-/Einheitenatlanten bleiben erhalten. Vollständige Originalsymbol-Abdeckung, zusätzliche Berufe und das Startmenü bleiben offen.

## Nachtrag 13. September: Bodenwaren / Bergung

[PC-Screenshot mit Maya-Figuren und Warenhaufen](https://images.igdb.com/igdb/image/upload/t_screenshot_huge/sc756m.jpg) erneut im isolierten Browser vollständig visuell betrachtet: flach gestapelte gelbbraune Hölzer, graue Stein-/dunkle Kohlehaufen und kleine helle Waren liegen dicht bei den Figuren auf dem Boden. Nur allgemeine Warenanordnung übernommen, keine Maya-Figuren oder Fraktionsgebäude als römische Vorlagen verwendet. Die Haufen im Prototyp benutzen die bestehenden eigenen Waren-/Werkzeugatlanten unverändert, in kleinen versetzten Stapeln mit Mengenanzeige. Kein Ausschnitt aus dem Originalbild und keine neue Rastergrafikfamilie. Tiefensortierung und Darstellung im Desktop-/Touch-Spiel überprüft; vollständiger warenweiser Originalvergleich bleibt offen.

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

13.09.2026: Römisches großes Wohnhaus und Kohlemine auf Siedlercommunity visuell geprüft. Eigene neue Dreistufen-Residenz und produktionsgebundene Fördermechanik; [Quellen, Prompt, implementierte Teile und offene Originalvergleiche](assets/RESIDENCES_PROMPT.md). Kleine Residenz unverändert. Keine Originalbilder als Spielassets übernommen.

Mobile UI vom 12. September 2026: iPhone-Militäransicht von The Settlers visuell geprüft; runde untere Befehle, freie Kartenmitte, Pause oben und Zoom rechts als Anordnungsreferenz. Eigenständige CSS-Umsetzung, keine neue Rastergrafikfamilie und keine kopierten Originalbuttons. [Quelle, Bedienungsunterschiede und Prüfung](MOBILE.md).

Lazarett-Update vom 12. September 2026: Römisches Originalgebäude vorab visuell geprüft; eigene transparente Dreistufenserie mit blauem Dach, Steinsäulen und Eingangsvorbau. [Quelle, Generierungsprompt und Grenzen](assets/HOSPITAL_PROMPT.md). Fundament, Rohbau und Fertigzustand im laufenden Spiel geprüft. Keine Originalsprites übernommen; eigene Heiler-Sprites und vollständige Behandlungsanimation bleiben offen.

Baustufen-Update vom 12. September 2026: [Quellen, neu generierte Bildpaare, Prüfung und Grenzen](AUTONOMIE_BAUPHASEN.md). Eigenständige Fundament-/Rohbau-Assets für 23 Gebäudetypen, nicht aus Originalgrafiken ausgeschnitten.

1. Originalversion und Volk des gewünschten Assets benennen.
2. Passende Screenshots suchen und wirklich ansehen. Quellen dokumentieren; nicht bloß Suchergebnisbeschreibungen verwenden.
3. Kamerawinkel, Silhouette, Farbfamilie, Größe relativ zu Figuren und Nachbargebäuden sowie Animation unterscheiden.
4. Neue Assets in einer einheitlichen Familie anfertigen, bestehende Varianten nicht löschen.
5. Im Spiel bei gleicher Zoomstufe vergleichen und Ausschnitte/Transparenz/Tiefensortierung prüfen.
6. Nur tatsächlich überarbeitete Gruppen als erledigt markieren; unbekannte Details nicht als originalgetreu ausgeben.

## Mobile Referenzpass · 14. September 2026

Visuell geprüft: die acht vom Nutzer bereitgestellten Vergleichsbilder, insbesondere mobile Militärbefehle (Bild 4), Gebäudeaktionen (6/7) und die eigene Safari-Ansicht (1). Versionsabgleich durch Suche: [Gamelofts offizieller iPhone/iPod-Touch-Trailer](https://www.youtube.com/watch?v=6XsLoy_XwgY), [Pocket Gamer zur mobilen Veröffentlichung](https://www.pocketgamer.com/the-settlers-iphone/gameloft-brings-the-settlers-to-iphone/). Keine PC-Fraktionsgrafik als mobile Gebäudereferenz ausgegeben.

Implementiert ausschließlich mobil: nähere Standardkamera (1,15), Rückkehr zur Siedlung, kompakte runde Kontextbefehle mit Beschriftung, schmalere Ressourcenleiste, einmalig geglättete und kontrastärmere Darstellung der vorhandenen Grastextur sowie niedrig aufgelöste, interpolierte Nebelmaske ohne Abhängigkeit vom Canvas-Blurfilter. Keine Rasterassets ersetzt oder aus Originalbildern ausgeschnitten. Simulation, Weltgeometrie und gespeicherte Kameras bleiben erhalten.

Noch offen: fraktionsspezifische mobile Architektur, abwechslungsreichere Wald-/Felsgruppen, weitere natürliche Geländeübergänge und echte iPhone-/Safari-Hardwareprüfung. Der Renderpass ist keine vollständige grafische Übereinstimmung mit dem Original.

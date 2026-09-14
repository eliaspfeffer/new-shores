# Handy-Menüs: Abgleich mit den 30 Nutzer-Screenshots

Stand: 14. September 2026. Referenz sind die im Auftrag angehängten, visuell betrachteten Screenshots 1–30 aus einem Video der Gameloft-Handyfassung „Die Siedler“ (Titelbild: © 2011 Gameloft). Es lag kein Video-Link vor; keine Behauptung, das Video selbst gesehen zu haben. Dies ist nicht die Desktop-Oberfläche von Siedler IV. Die bestehende eigene Spielgrafik und Mengenbalance wurden erhalten.

## Umgesetzt

| Referenz | Umsetzung |
| --- | --- |
| 3, 6, 14, 24 | Haus unten links, Siedler unten rechts; freie Kartenmitte; nach Auswahl kontextabhängige Befehle |
| 2, 6, 7 | Fünf Baukategorien, große runde Gebäudeknöpfe in bis zu zwei Reihen beim linken Daumen; eigener Gebäudeatlas |
| 4, 5 | Gebäudedaten und tatsächliche Baukosten auf Pergament; Bauplatz antippen, Vorschau, Haken unten links und Abbruch unten rechts; kein Bau durch den ersten Kartentipp |
| 8, 10, 14, 24, 28 | Brief oben links: aktueller Hinweis und echtes Nachrichtenjournal, blätterbar |
| 15 | Aufklappbare größere Minikarte mit eigenem Schließen-Knopf; bestehende Kartennavigation bleibt erhalten |
| 16, 27 | Ausgewählte Einheiten nach Typ und Rang gruppiert mit Anzahl oben anstelle der Warenleiste |
| 17–21 | Pfeil in der Warenleiste: vier Seiten mit je bis zu acht tatsächlich vorhandenen Warenarten, laufend aktualisierte Bestände |
| 9, 13 | Turm: geschützter Abrissdialog, Soldaten hinein/heraus, tatsächliche Besatzungs- und Ankunftszahlen |
| 11, 12 | Kaserne: vorhandene drei Einheitentypen × drei Ränge auf einer Seite; +1/+5/−1/−5/0 und Bestätigung führen echte Kasernenaufträge aus |
| 22, 23 | Sieben Werkzeugarten; endliche Mengenaufträge je Schmiede mit +1/+5/−1/−5/0. Ohne weitere Aufträge keine zusätzliche Produktion. Automatik lässt wieder das knappste Werkzeug herstellen |
| 24–26 | Siedlermenü mit gesamtem Feldmilitär, Siedlerfinder, Grundberufen und Spezialisten. Geologen/Pioniere über vorhandene Werkzeug-/Trägerprüfung ausbilden |
| 27 | Spezialisten werden wieder Träger; das ausgecheckte Werkzeug liegt physisch am Standort und kann geborgen werden, keine Sofortgutschrift oder Verdopplung |
| 29, 30 | Grundberufe-Übersicht mit vorhandenen Trägern/Bauarbeitern und Trägerreserve. Aktuell automatische Arbeitseinteilung wird ausdrücklich erklärt |

Bedienung, Betriebsübersicht, weitere Siedlerbefehle und Warenverteilung bleiben im Pausenmenü erreichbar. „Details → Weitere Einstellungen“ erhält die bisherigen fortgeschrittenen Gebäude-/Lagerregeln. Nur diese erweiterten Ansichten verwenden weiterhin die vorhandenen längeren Einstellungsmenüs. Das Standardspiel zeigt mobil keine Desktop-Seitenleiste.

## Bewusst nicht als vollständig ausgegeben

- Keine pixelidentischen Original-UI-Sprites: eigene CSS-Rahmen, SVG-/Textsymbole und vorhandene eigene Rasteratlanten. Die Bilder des Videomachers wurden weder extrahiert noch ins Spiel eingebaut.
- Screenshot 1: das hölzerne Startmenü ist noch nicht nachgebaut; dieser Lauf betrifft die Oberfläche innerhalb der Partie.
- Keine Gärtner, Diebe oder eigenständigen Planierer. Keine manuelle dauerhafte Berufswarteschlange für Träger/Bauarbeiter; diese arbeiten auftragsabhängig automatisch.
- Spezialisten werden bei Bestätigung nach aktueller Verfügbarkeit ausgebildet, nicht als zukünftige Warteschlange gespeichert. Reicht die Verfügbarkeit nicht aus, meldet das Spiel die tatsächlich ausgebildete Anzahl.
- Keine zusätzlichen Original-Turmgrößen, Hauptmänner oder Völker-Einheiten. Ein Turm hat hier drei Plätze; Wohnhäuser bieten hier vier bzw. zwölf Plätze, nicht die Originalzahlen.
- Vier Waren-Seiten für 27 implementierte Warentypen, nicht fünf Seiten mit nicht implementierten Originalwaren. Keine vollständige grafische Besatzungs-Sprechblase mit einzeln animierten Ein-/Ausgangsporträts.
- „Automatik ∞“ bei Werkzeugen bedeutet laufende bedarfsgesteuerte Produktion, nicht endlose Bestellung der zuletzt geöffneten einzelnen Werkzeugart. Mengenänderungen ersetzen die offene Menge dieser Art; bereits begonnene Werkzeuge werden zu Ende produziert.
- Keine echte iPhone-/Safari-Hardwareprüfung, keine Zusage einer überall gleichen Bildrate.

## Verifikation

- `node tests/simulation.mjs`, `node tests/strategy.mjs`, `npm test` (37 Testdateien), `npm run build`.
- `tests/browser/mobile-thumb.cjs`: echter Menüfluss, Kategorien, Gebäudeinformation, Bestätigung vor Platzierung, Warenblättern, Nachricht, Karte, Spezialist/Werkzeugablage, Werkzeugauftrag, Kasernenauftrag, Turmbefehle, 667×320.
- `tests/browser/mobile.cjs`: Produktionsbuild, native emulierte Touch-Gesten für Verschieben/Pinch/Auswahl, Speichern, Offline-Neustart, Kamerawiederherstellung, Hochformat-Hinweis und unveränderte Desktop-Seitenleiste.
- `tests/browser/building-settings.cjs`: erweiterte Einstellungen auf Desktop und Handy einschließlich Betrieb, Priorität, Arbeitsgebiet, Abriss-Abbruch, Lagerziel, Werkzeugwahl, Reload und Speicherausfall.
- Neue Tests für endliche Werkzeugproduktion ohne Überproduktion, Rückkehr zur Automatik, physische Werkzeugablage ohne Doppelgutschrift sowie Validierung/Speichern von Werkzeugmengen. Alte Speicherstände bleiben lesbar.

Die Browser verwenden isolierte Testkontexte und eigene kleine Szenarien. Persönliche lokale oder Server-Spielstände wurden dafür nicht überschrieben. Screenshots der tatsächlichen laufenden Menü-/Bauansichten wurden visuell geprüft.

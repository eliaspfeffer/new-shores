# Aktueller Ausbau – 12. September 2026

Dieser Stand ergänzt und überholt Teile von STRATEGIE_AUSBAU.md, BEDIENUNG_UPDATE.md und dem historischen Feature-Audit. Der Gesamtauftrag „alles fertig“ ist **nicht abgeschlossen**. macOS-Verpackung und Leistungsmessungen wurden ausdrücklich ausgeklammert und nicht durchgeführt.

## Tatsächlich implementiert

1. **Erkundung und Kriegsnebel:** Eigenes Lager, Gebäude und lebende eigene Siedler erzeugen Sicht. Unbekanntes Gelände ist schwarz, früher gesehenes Gelände bleibt gedämpft bekannt. Gegner sind außerhalb aktueller Sicht weder sichtbar noch anklickbar; auch die Minikarte verrät sie nicht. Erkundung wird gespeichert. Besitzgrenzen und Sicht bleiben getrennte Systeme. Bestehende Spielstände ohne Erkundungsdaten beginnen mit Sicht um die vorhandene Siedlung, ohne Gebäude oder Waren zu verlieren.
2. **Waren als Gegenstände:** Neue zusammenhängende Grafikfamilie mit Holz, Brettern, Stein, Nahrung, Erzen, Barren, Werkzeugen und Waffen. Getragene Ware sitzt abhängig von der Laufrichtung vor/hinter dem Körper und bewegt sich mit dem Träger. Vor dem Abholen reservierte Ware ist nicht am Körper sichtbar. Eingangsbestände und fertige Ausgangswaren werden an Gebäuden gezeichnet. Es sind keine vollständigen originalen Trageanimationen oder acht separat gemalten Ansichten je Gegenstand.
3. **PC-orientierte Seitenleiste:** Minikarte oben links, vier Hauptbereiche Bauen/Siedler/Waren/Betriebe, fünf bebilderte Baukategorien, zweispaltige Gebäudebilder, Detailbereich und kompakte Vorräte unten. Die verstreuten rechten Einheitenfenster und die alte Transporttafel sind ersetzt. Gebäudeinspektion ist in die Seitenleiste integriert. Hauptbereiche, Gebäudenamen, Waren und wesentliche Aktionen sind deutsch; einige Spielmeldungen und Tutorialtexte bleiben englisch. Das ist eine referenzorientierte Annäherung, keine vollständige Rekonstruktion des Originalmenüs.
4. **Facharbeiter:** Produktionsbetriebe und Förster benötigen einen realen zugewiesenen Siedler mit einem ausgegebenen Werkzeug. Er geht zum Betrieb und arbeitet dort; Produktion wartet auf seine Ankunft. Zwei Zivilisten werden für Logistik freigehalten. Stopp, manueller Marschauftrag und Abriss lösen die Zuordnung auf und geben das Werkzeug zurück. Personalzuordnung wird gespeichert, Gebäudeindizes werden bei Abriss korrigiert. Werkzeuge bleiben ein generischer Vorrat; die sichtbaren Hämmer/Sicheln sind nicht separate Werkzeugbestände.
5. **Direkttransport:** Träger können fertige Waren unmittelbar von einem Betrieb zu einem anderen bringen. Die Weglängen entscheiden zwischen verfügbarem Lagerbestand und passender Betriebsware. Mengen werden einmal reserviert und einmal abgeliefert. Material für Baustellen bleibt über das zentrale Lager reserviert. Keine zusätzlichen frei platzierbaren Lager oder Handelsrouten.
6. **Betriebsübersicht:** Zeigt Baustellen, fehlendes Personal/Werkzeug, fehlende Inputs, Produktionsfortschritt, angehaltene Betriebe und wartende Ausgangswaren. Anklicken zentriert den Betrieb und öffnet seine Aktionen. Keine vollständige statistische Produktionshistorie.
7. **Militär und Auswahl:** Drei Rekrutierungsränge für vorhandene Schwertkämpfer/Bogenschützen; höhere Ränge kosten Gold und verändern Trefferpunkte/Schaden. Eigene Balance: Rang II ein Gold, Rang III zwei Gold, 55/75/95 HP. Nicht als Originalwerte verifiziert. Pioniere/Geologen können wieder Träger werden und geben ihr Werkzeug zurück. Ctrl/Cmd + 1–9 speichert eine Auswahlgruppe, die Ziffer ruft sie ab; Gruppen werden gespeichert. Bestehende Werkzeug-Hotkeys gelten, wenn unter der Ziffer keine Gruppe gespeichert ist.
8. **Nachwachsender Wald:** Neue Bäume beginnen klein und benötigen 120 Simulationssekunden bis zur Fällreife. Bestehende Bäume ohne Altersdaten gelten als ausgewachsen. Alter und Vegetation bleiben im Spielstand erhalten. Wachstumsdauer ist eigene Balance, nicht verifizierte Originalzeit.
9. **Spielstände:** Save-Version 6, drei lokale Plätze, Datei-Export und -Import, Versions-/Karten-/Vorrats-/Referenzprüfung vor dem Laden. Eine Sicherheitskopie des aktuellen Stands wird vor einem Slot-/Dateiladevorgang angelegt und kann wiederhergestellt werden. Ladefehler versuchen die vorherige Kopie zurückzuladen. Keine Cloud oder native App erforderlich.

## Prüfergebnisse

Alle folgenden Befehle erfolgreich:

```
node tests/exploration.mjs
node tests/workforce.mjs
node tests/savegames.mjs
node tests/interaction.mjs
node tests/strategy.mjs
node tests/simulation.mjs
npm run build
```

Abgedeckt sind unter anderem Sicht ohne Gegner-Leaks, Erkundungsspeicherung, Tragebeginn nach Abholung, Werkzeuge/Personalreserve, direkte Lieferungen ohne Doppelzählung, Rangkosten ohne Teilabbuchung bei Goldmangel, Spezialistenrückwandlung, ungültige Save-Daten, Materialbau, Abriss-/Liefer-/Besatzungsindizes, integrierte Produktion mit Personal, gespeicherte Personalzuordnung und Werkzeugrückgabe genau einmal.

Browserprüfung am vorhandenen lokalen Spielstand: Minikarte/Nebel, Warenbilder, Kategorien, Betriebsübersicht, Zentrieren und Sägewerksinspektion mit Personalstatus, Slot 3 speichern und laden. Slot 3 enthält jetzt den Prüfstand der vorhandenen Siedlung. Bestehende Gebäude wurden nicht für QA abgerissen. Im Protokoll keine JavaScript-Fehler. Layoutregressionen (überbreite Ressourcenleiste, sichtbar gewordene ausgeblendete Gebäudekarten) wurden gefunden und korrigiert. Spiel nach QA pausiert.

Datei-Import/-Export und reale mobile Hardwaregesten sind implementiert, aber nicht vollständig durch die Browser-Dateidialoge bzw. auf einem echten Touchgerät durchgetestet. Militär- und Direkttransport-Erweiterungen sind simulationsgetestet; kein vollständiger militärischer Browser-Durchlauf.

## Weiterhin offen – nicht als erledigt markiert

- Höhen/Gebirge, Planierung, verschiedene Gebäudegrundflächen und weitere Landschaftstypen.
- Einzelne Felder mit Säen/Wachsen/Ernten und laufendem Bauern, sichtbare Tierzucht, Wildtiere/Jagd.
- Berufsspezifische Werkzeugbestände für alle Berufe, komplette Arbeits-/Trage-/Kampf-/Sterbeanimationen.
- Zusätzliche Lager, frei liegende Waren, Handel, Esel und vollständige Verteilungs-/Stau-/Wegeregeln.
- Nahrungsvorlieben statt fester Minenrezepte; weitere Originalproduktionen und Schwefelverwendung.
- Weitere Soldaten, Hauptmänner, Sanitäter, vollständige Garnisons-/Turm-/Burg-/Kampfkraftregeln, Geschosse, Heilung und Formationen.
- Wirtschaftlich aufbauende Gegner-KI, Angriffsplanung, Diplomatie/Bündnisse.
- Völker mit eigenen Gebäuden, Berufen, Waren und Fähigkeiten; zusätzliche Spezialisten.
- Religion, Alkoholketten, Tempel, Opfer, Mana und Wunder.
- Schiffe, Häfen, Werften, Fahrzeuge, Kriegsmaschinen und Transport-/Landungsregeln.
- Dunkles Volk, Verderbnis, Morbus und zugehörige Gegenmaßnahmen.
- Kampagnen, Missionslogik, Sieg/Niederlage, Gefechtskonfiguration, Kartenwahl/-editor, Schwierigkeit, Mehrspieler.
- Geräusche/Musik, Gebäudeanimationen, weitere Umweltgrafiken und vollständiger Detailabgleich mit Originalaufnahmen.
- Vollständige deutsche Texte, weitere Original-Untermenüs, Wegpunktketten und echte Mobilgeräteprüfung.

## Referenzen und neue Grafiken

- Der Nutzer-Screenshot wurde erneut visuell betrachtet: Minikarte oben links, Gold-/Steinrahmen, Gebäudebilder in zwei Spalten, Waren unter dem Baubereich, schwarze unerkundete Fläche und getrennte rote Besitzgrenze.
- [Zusätzlich betrachteter Original-Screenshot](https://images.igdb.com/igdb/image/upload/t_screenshot_huge/sc756m.jpg): PC-Ansicht mit Maya-Figuren; als Referenz für allgemeine UI-Anordnung und unterscheidbare Holz-/Stein-/Kohlewaren, nicht als römische Figurenreferenz verwendet.
- [Originalhandbuch](https://www.mogelpower.de/manuals/Die_Siedler_IV_Handbuch.pdf), Abschnitte Spielmenü und Militär: Menüstruktur, verschiedene Soldatenstärken und Gold für höherwertige Rekrutierung. Die konkreten Balancezahlen dieser Implementierung sind eigene Annäherungen.
- Eingebundenes Originalasset: `assets/goods-atlas-keyed-v3.png`. Mit dem eingebauten Imagegen-Werkzeug erzeugt; Magenta wird beim einmaligen Laden im Renderer transparent behandelt. Die ersten zwei Ergebnisse hatten keine echte Alpha-Transparenz und wurden nicht eingebunden. Sie bleiben als Entwürfe erhalten. Kein Originalsprite wurde extrahiert.
- Prompts: `assets/GOODS_PROMPTS.md`.

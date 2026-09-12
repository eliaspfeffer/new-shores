# Aktueller Ausbau – 12. September 2026

Dieser Stand ergänzt und überholt Teile von STRATEGIE_AUSBAU.md, BEDIENUNG_UPDATE.md und dem historischen Feature-Audit. Der Gesamtauftrag „alles fertig“ ist **nicht abgeschlossen**. macOS-Verpackung und Leistungsmessungen wurden ausdrücklich ausgeklammert und nicht durchgeführt.

## Lagerregeln und Umlagerung

- Direkt im Lagerhaus je Produktionsware: Annehmen, Vorrat auffüllen (10), nicht annehmen oder ins Hauptlager räumen. Alte Spielstände ohne Regeln nehmen weiterhin alle bisherigen Produktionswaren an.
- Auffüllen und Räumen sind reale Trägerwege mit Abholung und Lieferung. Bereits reservierte/in Bewegung befindliche Einheiten zählen zum Auffüllziel; Regeln ändern keine schon zugesagten Transporte. Produktionsanlieferungen können den Zielvorrat überschreiten, zehn ist kein Kapazitätslimit.
- Anhalten verhindert neue Lageraufträge; unterwegs befindliche Waren werden noch geliefert. Abriss erstattet nur unreservierte Bestände; Transporte zu einem abgerissenen Ziel kehren zum Hauptlager zurück. Regeln, Mengen und laufende Wege werden gespeichert und geprüft.
- Die Auffüllmenge zehn ist eine eigene feste Vorgabe, keine verifizierte Originaleinstellung. Frei wählbare Zielmengen, beliebige Lager-zu-Lager-Routen, Esel und vollständige Verteilungsregeln fehlen weiterhin.
- Prüfung: 18 Testsuiten, Simulation-/Strategietests und Build bestanden. Browserprüfungen in separatem Kontext; keine persönlichen Spielstände verändert.

## Gebäudegebundene Bedienung

- Gebäudeklick zeigt zusätzlich zur Seitenansicht eine verankerte Karte am Gebäude: aktueller Status, Warenbilder/Mengen und Zugang zu den Einstellungen. Bestände, Besatzung und Baufortschritt werden ohne erneutes Anklicken aktualisiert.
- Rekrutierung und Rangwahl sind aus dem allgemeinen Siedlermenü zur angeklickten Kaserne verschoben. Eine angehaltene oder unfertige Kaserne kann darüber keine Soldaten ausbilden. Waffen und Gold werden weiterhin aus dem Hauptlager bezahlt.
- „Besatzung heraus“ steht nur beim fertiggestellten Turm; ohne Besatzung ist der Button deaktiviert. Arbeitsgebiete bleiben bei Holzfäller/Steinmetz/Förster, Werkzeugaufträge bei der Schmiede. Unpassende Produktionsaktionen bei fertigen Wohnhäusern/Türmen/Hauptlager sind ausgeblendet. Globale Transportpriorität und Spezialistenbefehle bleiben im Hauptmenü.
- Dachklicks priorisieren das vorn gezeichnete Gebäude statt eines dahinterliegenden Bodenfelds. Keine Originalgrafiken verändert oder übernommen; die neue Infokarte ist eine eigene Bedienlösung.
- Prüfung: 17 Testsuiten, Simulation, Strategie und Build. Isolierter Browser-Klicktest für Kaserne, Rangkosten, Produktionsstopp, Turmfreigabe und Schließen der Gebäudekarte; Screenshot visuell geprüft. Keine Tests am persönlichen Spielstand.

## Neuester Stand: Minennahrung, Werkzeuge, Lager, Patrouillen und Spielziele

Die folgenden Angaben ersetzen ältere Einschränkungen im historischen Protokoll:

- **Minennahrung:** Kohle bevorzugt Brot, Eisen/Schwefel Fleisch und Gold Fisch. Eine bevorzugte Portion ermöglicht zehn Abbauzyklen, andere Nahrung zwei. Pro Zyklus wird eine Einheit aus dem endlichen Vorkommen gewonnen. Träger liefern auch Ersatznahrung physisch; Restversorgung bleibt gespeichert. Grundlage: Originalhandbuch, gedruckte Seite 42. Zeiten und Erfolgsausbeute sind eigene Balance, kein vollständiges Originalmodell.
- **Sieben Werkzeugbestände:** Axt, Hammer, Schaufel, Sense, Spitzhacke, Säge und Angel. Ausgabe passend zum Beruf; werkzeugfreie Berufe benötigen kein generisches Werkzeug mehr. Baufacharbeiter und Spezialisten erhalten ebenfalls die passende Sorte. Die Schmiede produziert eine gewählte Sorte oder automatisch die knappste; ein begonnenes Werkstück wird nicht bei Auswahlwechsel verwandelt. Alte Werkzeugkisten bleiben als kompatibler Ersatz nutzbar. Rückgabe und Abriss erstatten die tatsächlich ausgegebene Sorte. Grundlage: Werkzeugtabelle im Originalhandbuch, Seiten 62–64.
- **Eigenständige neue Werkzeugbilder:** Transparenter Atlas für die sieben Sorten, im Menü und als getragene Ware eingebunden. Keine Originalsprites extrahiert. Quellen, exakter Generierungsprompt und Grenzen: [TOOLS_PROMPT.md](assets/TOOLS_PROMPT.md).
- **Zusätzliche Lagerhäuser:** 24 baubare Typen. Produktionswaren gehen zum nächsten erreichbaren aktiven Lager; Werkstätten können ihren Bedarf daraus abholen. Separate physische Bestände, sichtbare Waren, Inspektion, Abrisserstattung und Save/Reload. Laufende Lieferungen werden bei Lagerabriss zum Hauptlager umgeleitet. Baustoffe, Gold, Waffen und Werkzeuge bleiben für die bisherigen Zahlungsregeln zentral. Annahmefilter und Umlagerungen zum/vom Hauptlager sind inzwischen implementiert; vollständige Original-Verteilungsregeln fehlen. Das Lager nutzt vorhandene eigene Lagerkunst und wiederverwendete Baustufen; keine 24 individuellen Baustufenpaare.
- **Patrouillen:** Freie Schwertkämpfer/Bogenschützen pendeln zwischen Start und Ziel; Nahkontakt unterbricht den Lauf für Kampf, danach wird fortgesetzt. Ctrl/Cmd + Rechtsklick sowie ein antippbarer Patrouillenbutton. Anhalten/neuer Laufauftrag beendet die Schleife. Blockierte Wege brechen mit Meldung ab, Endpunkte bleiben gespeichert. Noch keine Formationspatrouillen oder frei gezeichnete Rundkurse.
- **Spielziele:** Im Startmenü freies Spiel, eigener Wirtschaftsauftrag oder Außenposten-Eroberung wählbar. Tatsächliche Gebäude-/Waren-/Gegnerzähler im Pausenmenü; Sieg/Niederlage pausiert, wird gespeichert und erlaubt danach freies Weiterspielen. Niederlage bei Verlust aller eigenen Siedler oder des Hauptlagers. Alte Spielstände bleiben freies Spiel. Das sind zwei eigene Herausforderungen auf der vorhandenen Karte, keine nachgebaute Originalkampagne und keine vollständige Gefechtskonfiguration.
- **Zwischenprüfung:** 16 automatisierte Testsuiten und Build bestanden. Isolierte Browserprüfungen für Schmiedeauftrag, Werkzeugtransport, Ersatznahrung sowie Lagertransport, gespeicherte Bestände und Weiterlieferung an eine Mühle bestanden. Ebenso Patrouillenbedienung/Lauf/Anhalten/Reload und Szenarioauswahl, Zielanzeige sowie Speicherung/Bestätigung eines künstlich herbeigeführten Siegs. Letzteres prüft den Zustandswechsel, keinen vollständigen Kampagnendurchlauf. Der vorhandene Browser-Kernlooptest für Geologe, Holzfällen, Minen-/Wohnhausbau und Baustufen bestand erneut. Persönliche Spielstände wurden dabei nicht verändert.

## Nachgeführt nach dem Außeneinsatz-Update

Die Datei war zuvor nicht vollständig aktuell. Die folgenden Ergänzungen ersetzen widersprechende ältere Angaben weiter unten:

- **Spezialisten:** Geologen und Pioniere arbeiten nach einem Zielauftrag autonom im Gebiet. Der Pionier beansprucht genau ein angrenzendes Feld je Arbeitsschritt. Anhalten beendet die Automatik; alte Spielstände behalten bereits gewonnenes Land.
- **Arbeitsbereiche:** Dichtes Punktzentrum und lockerere äußere Punktringe statt Fliesenraster.
- **Baustufen:** Für alle 23 baubaren Gebäudetypen eigene Fundament-/Rohbaubilder, darüber das von unten wachsende Endbild. Alte Brettstreben entfernt. Die Bildübergänge sind nicht vollständig originalgetreu.
- **Arbeitsplatzwege:** Personal geht hinein, arbeitet und bringt fertige Ware zum Ausgang; tatsächliche Produktion steuert die Arbeitsbewegungen.
- **Außeneinsätze:** Bauern säen bis zu vier einzelne Felder, warten auf Wachstum, ernten und bringen Getreide zurück. Förster laufen zur Pflanzstelle, Fischer ans Ufer. Reservierung, Rücktransport, Abbruch/Abriss und Save/Reload sind implementiert. Feldgrafik und Animationen bleiben vereinfacht. Details: [AUSSENEINSAETZE.md](AUSSENEINSAETZE.md).
- **Autosave:** Alle fünf Sekunden sowie beim Verlassen; automatisches Fortsetzen inklusive Kamera nach Neuladen. Vorheriger Autosave wird gesichert und bei beschädigtem Hauptstand automatisch geladen. Zusätzlicher Wiederherstellungsbutton.
- **Audio:** Erste zuschaltbare Arbeitseffekte existieren; vollständige Geräuschkulisse und Musik fehlen.
- **Prüfung dieses Zwischenstands:** Neun Testsuiten und Build bestanden. Isolierter Browser-Test für Außeneinsätze, Warenankunft und Feld-Save/Reload bestanden. Separater Autosave-Browsertest bestanden. Das ist kein Nachweis vollständiger Originaltreue.

Die frühere Prüfung am persönlichen Spielstand unter „Prüfergebnisse“ ist ein historisches Protokoll, keine Aussage über den heutigen Inhalt von Speicherplatz 3.

## Neuester Ausbau: Wegpunktketten und Geschosse

- **Wegpunktketten:** Shift + Rechtsklick hängt bis zu 32 Ziele an. Normale neue Marschbefehle ersetzen die Kette; Anhalten löscht sie. Zivile Siedler erledigen ihre aktuelle Lieferung zuerst, Werkstattpersonal verlässt den Betrieb nach Rückkehr in den Wartezustand. Unerreichbare Folgeziele werden übersprungen. Die Kette wird gespeichert und beim Laden validiert. Spezialisten führen ihre autonomen Arbeiten bis zum nächsten Wartezustand aus; eine Turmbesatzung bleibt im Turm. Zweipunktpatrouillen sind inzwischen implementiert; vollständige Original-Formationen fehlen.
- **Bogenschützen:** Sichtbare Pfeile mit Flugzeit statt sofortigem Fernkampfschaden. Einschlag, tote Ziele und Speicherung laufender Geschosse werden behandelt. Flugbahn, Verfolgung bewegter Ziele und Schadenswerte sind vereinfacht; keine vollständige Original-Ballistik, Deckung oder Gebäudebeschuss-Regeln.
- **Tests:** Elf Testsuiten, explizite Simulation-/Strategietests und Build bestanden. Zusätzlich Bedien-/Kampftest im isolierten Browser für Shift-Rechtsklick, Marschfolge und Pfeilschaden.

## Tatsächlich implementiert

1. **Erkundung und Kriegsnebel:** Eigenes Lager, Gebäude und lebende eigene Siedler erzeugen Sicht. Unbekanntes Gelände ist schwarz, früher gesehenes Gelände bleibt gedämpft bekannt. Gegner sind außerhalb aktueller Sicht weder sichtbar noch anklickbar; auch die Minikarte verrät sie nicht. Erkundung wird gespeichert. Besitzgrenzen und Sicht bleiben getrennte Systeme. Bestehende Spielstände ohne Erkundungsdaten beginnen mit Sicht um die vorhandene Siedlung, ohne Gebäude oder Waren zu verlieren.
2. **Waren als Gegenstände:** Neue zusammenhängende Grafikfamilie mit Holz, Brettern, Stein, Nahrung, Erzen, Barren, Werkzeugen und Waffen. Getragene Ware sitzt abhängig von der Laufrichtung vor/hinter dem Körper und bewegt sich mit dem Träger. Vor dem Abholen reservierte Ware ist nicht am Körper sichtbar. Eingangsbestände und fertige Ausgangswaren werden an Gebäuden gezeichnet. Es sind keine vollständigen originalen Trageanimationen oder acht separat gemalten Ansichten je Gegenstand.
3. **PC-orientierte Seitenleiste:** Minikarte oben links, vier Hauptbereiche Bauen/Siedler/Waren/Betriebe, fünf bebilderte Baukategorien, zweispaltige Gebäudebilder, Detailbereich und kompakte Vorräte unten. Die verstreuten rechten Einheitenfenster und die alte Transporttafel sind ersetzt. Gebäudeinspektion ist in die Seitenleiste integriert. Hauptbereiche, Gebäudenamen, Waren und wesentliche Aktionen sind deutsch; einige Spielmeldungen und Tutorialtexte bleiben englisch. Das ist eine referenzorientierte Annäherung, keine vollständige Rekonstruktion des Originalmenüs.
4. **Facharbeiter:** Produktionsbetriebe und Förster benötigen einen realen zugewiesenen Siedler mit einem ausgegebenen Werkzeug. Er geht zum Betrieb und arbeitet dort; Produktion wartet auf seine Ankunft. Zwei Zivilisten werden für Logistik freigehalten. Stopp, manueller Marschauftrag und Abriss lösen die Zuordnung auf und geben das Werkzeug zurück. Personalzuordnung wird gespeichert, Gebäudeindizes werden bei Abriss korrigiert. Aktuell werden sieben Werkzeugsorten berufsspezifisch ausgegeben; siehe neuester Stand oben.
5. **Direkttransport:** Träger können fertige Waren unmittelbar von einem Betrieb zu einem anderen bringen. Die Weglängen entscheiden zwischen verfügbarem Lagerbestand und passender Betriebsware. Mengen werden einmal reserviert und einmal abgeliefert. Material für Baustellen bleibt über das zentrale Lager reserviert. Zusätzliche Lager sind inzwischen implementiert; Handelsrouten fehlen weiterhin.
6. **Betriebsübersicht:** Zeigt Baustellen, fehlendes Personal/Werkzeug, fehlende Inputs, Produktionsfortschritt, angehaltene Betriebe und wartende Ausgangswaren. Anklicken zentriert den Betrieb und öffnet seine Aktionen. Keine vollständige statistische Produktionshistorie.
7. **Militär und Auswahl:** Drei Rekrutierungsränge für vorhandene Schwertkämpfer/Bogenschützen; höhere Ränge kosten Gold und verändern Trefferpunkte/Schaden. Eigene Balance: Rang II ein Gold, Rang III zwei Gold, 55/75/95 HP. Nicht als Originalwerte verifiziert. Pioniere/Geologen können wieder Träger werden und geben ihr Werkzeug zurück. Ctrl/Cmd + 1–9 speichert eine Auswahlgruppe, die Ziffer ruft sie ab; Gruppen werden gespeichert. Bestehende Werkzeug-Hotkeys gelten, wenn unter der Ziffer keine Gruppe gespeichert ist.
8. **Nachwachsender Wald:** Neue Bäume beginnen klein und benötigen 120 Simulationssekunden bis zur Fällreife. Bestehende Bäume ohne Altersdaten gelten als ausgewachsen. Alter und Vegetation bleiben im Spielstand erhalten. Wachstumsdauer ist eigene Balance, nicht verifizierte Originalzeit.
9. **Spielstände:** Save-Version 6, drei lokale Plätze, Datei-Export und -Import, Versions-/Karten-/Vorrats-/Referenzprüfung vor dem Laden. Eine Sicherheitskopie des aktuellen Stands wird vor einem Slot-/Dateiladevorgang angelegt und kann wiederhergestellt werden. Ladefehler versuchen die vorherige Kopie zurückzuladen. Keine Cloud oder native App erforderlich.

## Frühere Prüfergebnisse (historisches Protokoll)

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
- Sichtbare Tierzucht, Wildtiere/Jagd; originalgetreue Darstellung/Balance der inzwischen funktionalen Feldphasen.
- Werkzeuge für noch fehlende Berufe; komplette Arbeits-/Trage-/Kampf-/Sterbeanimationen.
- Frei wählbare Zielmengen/Lager-zu-Lager-Routen, frei liegende Waren, Handel, Esel und vollständige Verteilungs-/Stau-/Wegeregeln; eigene Lagerbaustufen.
- Weitere Originalproduktionen, originale Abbauwahrscheinlichkeiten und Schwefelverwendung.
- Weitere Soldaten, Hauptmänner, Sanitäter, vollständige Garnisons-/Turm-/Burg-/Kampfkraftregeln, originalgetreue Geschossregeln, Heilung und Formationen.
- Wirtschaftlich aufbauende Gegner-KI, Angriffsplanung, Diplomatie/Bündnisse.
- Völker mit eigenen Gebäuden, Berufen, Waren und Fähigkeiten; zusätzliche Spezialisten.
- Religion, Alkoholketten, Tempel, Opfer, Mana und Wunder.
- Schiffe, Häfen, Werften, Fahrzeuge, Kriegsmaschinen und Transport-/Landungsregeln.
- Dunkles Volk, Verderbnis, Morbus und zugehörige Gegenmaßnahmen.
- Originalkampagnen, komplexe Missionsskripte, vollständige Gefechtskonfiguration, Kartenwahl/-editor, Schwierigkeit, Mehrspieler. Erste eigene Spielziele/Sieg-/Niederlagenzustände sind implementiert, siehe oben.
- Vollständige Geräuschkulisse/Musik, berufsspezifische Gebäudeanimationen, weitere Umweltgrafiken und vollständiger Detailabgleich mit Originalaufnahmen.
- Vollständige deutsche Texte, weitere Original-Untermenüs, Formationen/mehrteilige Patrouillen und echte Mobilgeräteprüfung.

## Referenzen und neue Grafiken

- Der Nutzer-Screenshot wurde erneut visuell betrachtet: Minikarte oben links, Gold-/Steinrahmen, Gebäudebilder in zwei Spalten, Waren unter dem Baubereich, schwarze unerkundete Fläche und getrennte rote Besitzgrenze.
- [Zusätzlich betrachteter Original-Screenshot](https://images.igdb.com/igdb/image/upload/t_screenshot_huge/sc756m.jpg): PC-Ansicht mit Maya-Figuren; als Referenz für allgemeine UI-Anordnung und unterscheidbare Holz-/Stein-/Kohlewaren, nicht als römische Figurenreferenz verwendet.
- [Originalhandbuch](https://www.mogelpower.de/manuals/Die_Siedler_IV_Handbuch.pdf), Abschnitte Spielmenü und Militär: Menüstruktur, verschiedene Soldatenstärken und Gold für höherwertige Rekrutierung. Die konkreten Balancezahlen dieser Implementierung sind eigene Annäherungen.
- Eingebundenes eigenständiges Asset: `assets/goods-atlas-keyed-v3.png`. Mit dem eingebauten Imagegen-Werkzeug erzeugt; Magenta wird beim einmaligen Laden im Renderer transparent behandelt. Die ersten zwei Ergebnisse hatten keine echte Alpha-Transparenz und wurden nicht eingebunden. Sie bleiben als Entwürfe erhalten. Kein Originalsprite wurde extrahiert.
- Prompts: `assets/GOODS_PROMPTS.md`.

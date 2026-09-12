# Spielbarer Strategie-Ausbau — Stand 12. September 2026

> Neuerer Stand: [AUSBAU_AKTUELL.md](AUSBAU_AKTUELL.md). Erkundung, Facharbeiter, Direkttransport, Rangrekrutierung, Warenbilder, Seitenmenü und Save-Slots wurden inzwischen ergänzt. Die folgenden Tabellen dokumentieren den vorherigen Meilenstein.

Dies ist der aktuelle Abgleich. Die älteren Audits beschreiben frühere Versionen. **Keine 100-%-Entsprechung:** Das Projekt hat jetzt einen spielbaren Strategie-Kern, aber noch keine vollständige Nachbildung von The Settlers IV. PC-Grundspiel, Erweiterungen, Settlers United und iPhone-Port sind außerdem nicht identisch. Eine Prozentzahl ohne abgeschlossene Spezifikation und Referenztests wäre irreführend.

## In diesem Durchlauf implementiert

| Bereich | Tatsächlich ausführbares Verhalten | Einschränkung |
|---|---|---|
| Figuren | Acht aus der isometrischen Bewegungsrichtung berechnete Ansichten; eigene Zivilisten-, Schwertkämpfer-, Bogenschützen-, Pionier- und Geologenbilder. Zivilisten und Bogenschützen wechseln Laufbilder. Ladungen und Auswahl sind sichtbar. | Noch keine vollständigen Arbeits-, Kampf-, Todes- und Laufanimationssätze pro Beruf. Schwertkämpfer/Spezialisten haben pro Richtung eine Pose. |
| Rekrutierung | Freier Träger wird mit Werkzeug zum Spezialisten; Kaserne plus Schwert/Bogen erzeugt einen Soldaten. Keine zusätzlichen Personen aus dem Nichts. | Ein generischer Werkzeugtyp; keine Soldatenränge. |
| Befehle | Einzelwahl, typbezogener Auswahlrahmen mit Militärvorrang, Rechtsklickziel am Mac, Zielantippen auf Touch; Halt. | Keine Formationen, Gruppen-Hotkeys, Wegpunktketten oder vollständigen Auswahlmodifikatoren. |
| Kampf | Schwertkämpfer kämpfen in Nahdistanz, Bogenschützen auf Distanz; Trefferpunkte, Angriffspausen, tote Einheiten und ein feindlicher Außenposten. | Eigene Balancewerte; keine strategische Gegner-KI, Pfeilflugbahn oder vollständige Kampfkraftformel. |
| Türme | Schwertkämpfer greifen feindliche Türme an, erobern und besetzen sie. Besatzung kann über das Einheitenmenü wieder herausgeholt werden. | Noch keine Originalkapazitäten, Turmbogenschützen oder vollständigen Folgeregeln bei Gebietsverlust. |
| Territorium | Heimatgebiet, neutrales und gegnerisches Gebiet; sichtbare Grenzmarken. Besetzte Türme erzeugen Einfluss. Neubauten sind auf eigenes Gebiet beschränkt. | Radien/Konfliktauflösung angenähert. Keine Gebäudevernichtung beim Verlust des Umlands. |
| Pioniere | Ziel erreichen, Arbeitszeit abwarten, angrenzendes neutrales Land beanspruchen. | Keine automatische Grenzkolonne und kein Verschieben ungeschützter Feindgrenzen. |
| Geologen | Nach dem Marsch untersuchen sie die Umgebung und markieren endliche Kohle-, Eisen-, Gold- und Schwefelvorkommen. | Vorkommen liegen auf der vorhandenen Graskarte; echtes Gebirgsgelände fehlt. |
| Minen | Nur neben entdecktem passendem Vorkommen baubar; verbrauchen gelieferte Nahrung und erschöpfen Vorräte. | Spezifische Nahrung ist hier Voraussetzung, nicht das vollständige Originalsystem aus Nahrungsvorlieben und Förderleistung. |
| Gebäudelieferungen | Träger reservieren Input, laufen über das Lager zum Ziel und füllen lokale Puffer. Produktion verbraucht erst dort vorhandene Waren. | Ein zentrales Lager; Abholung wird intern beim Auftrag reserviert. Noch keine verteilten Außenlager. |
| Baustellen | Kosten werden als Material reserviert; Träger liefern Bretter und Stein; erst danach baut ein Arbeiter. Materialien werden einmal verbraucht. | Keine Planierung, Planiererwerkzeuge, großen Gebäudegrundrisse oder Original-Warteschlangen. |
| Speichern | Save-Version 5 speichert Reserven, Puffer, laufende Lieferungen/Befehle, Einheiten, Besatzung, Entdeckungen und Pionieransprüche. | Ein Browser-Spielstand, kein Slot-/Dateisystem. |
| Bedienung | Baukategorien Grundversorgung/Nahrung/Metall/Militär/Stadt, Einheitenmenü, Vorräte und Transportfokus. | Nicht das vollständige Originalmenü; Schmuckbauten fehlen. |

## Implementierte Warenketten

- Baum → Holzfäller → Holz → Sägewerk → Bretter → Baustellen.
- Felsen → Steinmetz → Stein → Baustellen.
- Wasserwerk → Wasser.
- Getreide → Mühle → Mehl; Mehl + Wasser → Bäckerei → Brot.
- Getreide + Wasser → Schweinezucht → Schweine → Metzger → Fleisch.
- Küstenfischerei → Fisch.
- Brot → Kohlemine → Kohle; Fleisch → Eisenmine → Eisenerz; Fisch → Goldmine → Golderz; Brot → Schwefelmine → Schwefel.
- Kohle + Eisenerz → Eisenschmelze → Eisen.
- Kohle + Golderz → Goldschmelze → Gold.
- Kohle + Eisen → Werkzeugschmiede → Werkzeuge oder Waffenschmiede → Schwerter.
- Bretter → Bogenmacher → Bögen.
- Werkzeuge → Pionier/Geologe; Schwert/Bogen + Kaserne → Soldat.

Gold und Schwefel werden produziert, haben aber noch keinen vollständigen nachgeschalteten Verbrauch: Ränge, Spezialwaffen und Kriegsmaschinen fehlen. Die zusätzlichen Wirtschaftsbetriebe produzieren noch zeitgesteuert statt mit dauerhaft zugewiesenen sichtbaren Facharbeitern. Deshalb heißen diese Ketten **spielbar**, nicht **vollständig originalgetreu**. Die frühere pauschale Ernährung aller Einwohner wurde entfernt; Nahrung wird in den Minen verbraucht. Alte generische Nahrung bleibt nur als Altbestand im Save.

## So lässt sich der neue Stand spielen

1. Spielstand fortsetzen oder neues Spiel beginnen. Ältere Saves vor Version 5 bekommen einmalig einen Mindestbestand von 16 Brettern sowie vier Werkzeuge, sofern Werkzeuge noch fehlen, damit die geänderten Baukosten keinen Neustart erzwingen. Neue Spiele beginnen mit 24 Brettern und vier Werkzeugen.
2. Grundversorgung bauen: Holzfäller, Sägewerk und Steinmetz. Baustellen warten sichtbar auf Bretter/Stein. Vorräte nicht vollständig in Wohnhäuser investieren.
3. Unter „Units & economy“ einen Geologen rekrutieren und zur Untersuchung schicken. Die Testkarte enthält Vorkommen westlich, östlich, nordöstlich und südwestlich der Siedlung. Sie sind vor der Untersuchung nicht markiert.
4. Nahrung/Wasser und die passende Mine bauen. In den Gebäudeinformationen stehen vorhandene lokale Inputs. Rohstoffe erscheinen im zentralen Vorrat erst nach Rücktransport.
5. Metall und Waffen herstellen, Kaserne bauen und Soldaten rekrutieren. Pioniere arbeiten an der neutralen Grenze. Schwertkämpfer können Türme besetzen bzw. den roten Außenposten im Nordosten angreifen.
6. Im Pause-Menü speichern. Zum Entlassen einer Turmbesatzung zuerst den eigenen Turm inspizieren, dann „Release garrison“ wählen.

## Was für eine vollständige Originalentsprechung noch fehlt

Diese Liste enthält die bislang identifizierten Lücken, keine Garantie, dass jedes Originaldetail bereits bekannt ist.

1. **Völker und Varianten:** Römer, Wikinger, Maya, Trojaner mit unterschiedlichen Gebäuden, Berufen, Einheiten, Rezepten, Werten und Fähigkeiten; klare Trennung von Grundspiel, Erweiterungen und iPhone-Version.
2. **Wirtschaftsarbeiter:** dauerhafte Berufszuweisung, konkrete Äxte/Hämmer/Schaufeln/Sägen/Sensen usw., Werkzeugaustausch, Facharbeitermangel und realer Aufenthalt in Betrieben.
3. **Landwirtschaft/Natur:** Säen, Wachstum, Reife, Ernten auf einzelnen Feldern; arbeitende Bauern und Tierhaltung; langsames Baumwachstum, Jagd, Wildtiere und volksspezifische Tierarten.
4. **Wirtschaftsdetails:** Originalmengen, Zeiten, Input-/Outputgrenzen, Nahrungspräferenzen, vollständige Verteilungsregeln, Auslastungsstatistiken, Produktionsverbote und alternative Produktionswahl.
5. **Bau:** Planierer und Bodenhöhe, Materialbeschaffung pro Baustellenphase, Originalkosten/-dauer, Gebäudegrundrisse, vollständige Bauprioritätsregeln, Abriss und Erstattung.
6. **Transport:** mehrere Lager, freie Warenhaufen, direkte Lieferketten zwischen Betrieben, Arbeitsgebiete für alle Berufe, volle Prioritätsmatrix, Stau-/Umwegregeln sowie genaue Straßenbildung und -erosion.
7. **Militäreinheiten:** drei Ränge, Hauptmänner, Sanitäter, Axtkämpfer, Blasrohrschützen, Rucksackkatapultisten und volksabhängige Unterschiede.
8. **Kampfregeln:** Original-Lebenspunkte/-schaden/-tempo, Angriffs- und Verteidigungskraft, ökonomische Kampfkraft, Geschosse, Zielwahl, Verfolgung, Heilung, Gelände-/Gebäuderegeln, Formationen und Gruppenbefehle.
9. **Militärgebäude:** weitere Turmtypen und Burgen, Kapazitäten, Garnisonsverwaltung, Fernkampf aus Türmen, exakte Eroberungsregeln und Gebäudeverlust nach Grenzverschiebung.
10. **Weitere Spezialisten:** Diebe, Saboteure, Gärtner, Priester sowie vollständige Funktionen und Spezialistenrückwandlung.
11. **Religion:** Alkoholketten, Tempel, Opfer, Mana und volksspezifische Wunder.
12. **Schiffe und Fahrzeuge:** Werften, Häfen, Fähren/Transporte, Handelsschiffe, Kriegsschiffe, Kriegsmaschinen und Landungs-/Transportregeln.
13. **Handel:** Marktplätze, Esel, Handelsrouten, Austausch und verbündete Wirtschaft.
14. **Welt:** Gebirge/Höhen, Schnee, Sümpfe, dunkles Land, vollständige Wasserkanten, Brücken-/Passierbarkeitsregeln, Erkundung und Kriegsnebel.
15. **Gegner:** wirtschaftlich aufbauende KI, Rekrutierung, Angriffsplanung, Verteidigung, Diplomatie und Bündnisse. Der rote Außenposten ist nur ein defensives Testszenario.
16. **Dunkles Volk:** Morbus, Verderbnis, besondere Einheiten, Umwandlung und passende Siegbedingungen.
17. **Spielmodi:** Kampagnen, Missionen, Tutorials, Gefechte, freie Karten, Karteneditor, Schwierigkeitsgrade, Sieg/Niederlage, Ergebnisstatistik und Mehrspieler.
18. **Oberfläche/Eingabe:** komplettes Original-Menüschema einschließlich Zierbauten, Bauvorschauen/-radien, sämtliche Hotkeys, STRG/SHIFT-Auswahl, Gruppen speichern/abrufen, Mehrfingerprüfung auf echten iOS-Geräten und Geräteeinstellungen.
19. **Präsentation:** eigenständige Animationen für sämtliche Berufe und Aktionen, Gebäudeanimationen, Audio, Musik, Umweltleben, Effekte und wesentlich abwechslungsreichere Landschaft. Der Kartenuntergrund wurde diesmal nicht neu gestaltet.
20. **Technik:** nativer macOS-Start/Packaging, exportierbare Save-Slots, umfassende Save-Validierung, Langzeittests, große Armeen/Karten, CPU/GPU-/RAM-Messungen und Regressionstests gegen Original-Aufzeichnungen.

## Verifikation

- `node tests/simulation.mjs`: Stillstand, Wegsuche, Holzfällen, Lieferung, Straßen, Bau nach physischer Materiallieferung sowie Wiederherstellung von Lieferladung und Territorium.
- `node tests/strategy.mjs`: Grenzbauregel, Pionier, Geologe, Minenvalidierung, Rekrutierung, Marsch, Kampf, Turmeroberung/-besatzung/-freigabe, lokale Versorgung, sämtliche implementierten Rezepte, acht Richtungen und Strategie-State-Restore.
- `npm run build`: Produktionsbuild mit den neuen Atlanten.
- Browser: alter Spielstand geladen; Geologe rekrutiert und befohlen; Eisenvorkommen nach Untersuchung sichtbar; Sägewerk platziert, Materiallieferungen, Fertigstellung, lokale Holzversorgung und Rücklieferung fertiger Bretter geprüft. Keine Browser-Konsolenfehler. Manueller Save bestätigt; Spiel anschließend pausiert. Die Tests sind keine vollständige Durchspielprüfung aller Originalmechaniken.
- Echte Mehrfingerbedienung, kompletter militärischer Aufbau im Browser und Hardwarelast sind noch nicht vermessen.

## Referenzen und Art

Das [Originalhandbuch](https://manualmachine.com/gamespc/thesettlersiv/1119087-user-manual/) dient als Strukturreferenz. Die grundlegenden Spezialisten-/Turmregeln wurden mit [Pionier](https://docs.settlers-united.com/settler-iv-wiki-en/units/pioneer), [Geologe](https://docs.settlers-united.com/settler-iv-wiki-en/units/geologist) und [Schwertkämpfer](https://docs.settlers-united.com/settler-iv-wiki-en/units/swordsman) abgeglichen. Community-/UBO-Werte werden nicht pauschal als ursprüngliche Spielwerte behandelt.

Der Bildgenerierungs-Skill wurde für drei neue Originalatlanten genutzt; die eingebauten Bildwerkzeuge erzeugten `assets/workers-directions-v1.png`, `assets/specialists-directions-v1.png` und `assets/industry-strategy-v1.png`. Sie sind im Spiel eingebunden. Die Prompts stehen in `assets/ART_PROMPTS.md`. Es wurden keine Originalsprites extrahiert.

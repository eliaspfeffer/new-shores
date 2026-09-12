# Autonomie und gemalte Baustufen — 12. September 2026

## Umgesetzt

- Ein Zielauftrag legt für Geologen und Pioniere ein Arbeitsgebiet mit zehn Feldern Radius fest. Geologen untersuchen mehrere erreichbare Felsstellen ohne dieselbe Probe ständig zu wiederholen. Pioniere wählen selbstständig angrenzendes neutrales Land; fremdes Territorium ist ausgeschlossen.
- Sind keine geeigneten Stellen verfügbar, warten Spezialisten und prüfen nach acht Simulationssekunden erneut. Kein zielloses Herumlaufen. Ein neues Ziel ersetzt das Gebiet; Anhalten beendet die Automatik. Mehrere Spezialisten reservieren ihre aktuellen Arbeitsstellen. Rückverwandlung und erneute Ausbildung löschen alte Aufträge.
- Arbeitsgebiet und Suchfortschritt bleiben im Spielstand erhalten. Ältere aktive Spezialistenaufträge werden beim Laden ergänzt.
- Alle 23 baubaren Gebäudetypen besitzen nun eigene generierte Fundament- und Rohbaubilder. Ab 15 % wächst der Rohbau von unten nach oben, ab 60 % wird das bestehende fertige Gebäude auf dieselbe Weise eingeblendet. Die bisher prozedural darübergezeichneten Brettstreben sind entfernt. Tatsächliche Baumaterial-Lieferungen bleiben bestehen.
- Werkstattpersonal hat echte Zustände für Eingang, Hineingehen, Arbeiten und Heraustragen. Fertige Waren sind erst am Ausgang für Träger verfügbar. Ohne Material, passenden Rohstoff oder bei Stilllegung wird nicht weitergearbeitet. Ein- und Ausgangswaren werden sichtbar getragen; Arbeitseffekte bleiben an echte Produktionszustände gekoppelt.

## Grafik und Quellen

Vor dem Erzeugen wurde der [Original-Screenshot bei Gamezone](https://www.gamezone.de/screenshots/970x546/2002/08/siedler4.jpg) visuell angesehen: römische Gebäude, Holzrahmen, rote Dächer, kleine Arbeiter. Ein einzelnes Standbild belegt ausdrücklich nicht den vollständigen originalen Bauablauf.

Mit dem Imagegen-Skill wurden eigene Zwischenstadien passend zu unseren vorhandenen Gebäuden erstellt, keine Originalsprites extrahiert. [Exakte Prompts und Herkunft](assets/CONSTRUCTION_PROMPTS.md). Neue Dateien:

- [Basisgebäude](assets/construction-basic-key-v1.png)
- [Nahrungswirtschaft](assets/construction-economy-key-v1.png)
- [Industrie und Militär](assets/construction-industry-key-v1.png)

Das zunächst eingebrannte Schachbrett wurde durch einen editierbaren Farbschlüssel-Hintergrund ersetzt. Dieser wird einmal beim Laden transparent importiert. Alle 23 zugeschnittenen Bildpaare wurden als Kontaktbogen visuell geprüft; ein tatsächlicher Hausbau zusätzlich im laufenden Spiel. Kleine Farbsäume und nicht exakt deckungsgleiche Silhouetten zwischen generierter Baustufe und älterem Endbild sind noch möglich.

## Prüfungen

- Acht Testsuiten: Simulation, Strategie, Exploration, Eingabe, Savegames, Personal, Aktivitäten und neue Autonomie-/Baustufen-Tests.
- Browser-Aktivitätstest: tatsächlicher Geologenauftrag, Entdeckung, legaler Minenbau, fehlendes Brot, Hausbau mit Lieferungen, Holzfällen, Save/Reload und Audio-Schalter; keine JavaScript-Seitenfehler.
- Browser-Autonomietest: ein Pionierauftrag mit tatsächlicher Wegfindung, mehrere Ansprüche, Anhalten und erneute Ausbildung.
- Produktionsbuild. Keine macOS-Paketierung, kein quantitativer Leistungstest.

## Weiter offen — nicht als originalgetreu fertig ausgeben

Die Arbeitsplatzdarstellung verwendet weiterhin die vorhandenen Figuren und vereinfachte Werkzeugbewegungen, keine vollständigen berufsspezifischen Original-Animationssequenzen oder gebäudespezifische Innenräume. Förster, Bauern und Fischer brauchen noch echte individuelle Außeneinsätze; Feldphasen und Tierhaltung fehlen weiterhin. Hinzu kommen die großen offenen Systeme aus [README](README.md): aufbauende Gegner-KI, vollständige Völker, Höhen/Planierung, weitere Militärsysteme, Schiffe/Handel, Religion, Kampagnen, Siegbedingungen und Mehrspieler. Dies ist kein vollständiger Nachbau des Originals.

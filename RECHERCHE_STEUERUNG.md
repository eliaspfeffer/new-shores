# Recherche und Umsetzung: Siedler, Wege und Bedienung

Stand: 12. September 2026. Der Prototyp ist weiterhin keine vollständige Nachbildung. Die Prozentangabe 99 % wäre unbelegt. Der bisherige Feature-Audit enthält außerdem historische Zustände; dieser Bericht beschreibt die Änderungen dieses Durchlaufs.

## Tatsächlich ausgewertete Anleitungen

Das [Originalhandbuch](https://manualmachine.com/gamespc/thesettlersiv/1119087-user-manual/) beschreibt getrennte Bau-, Siedler-, Produktions- und Statistikmenüs, kontextabhängige Gebäudebefehle, Bauarbeiter, Träger und direkt steuerbare Spezialisten/Soldaten. Linke Maustaste und Auswahlrahmen dienen der Auswahl, rechte Maustaste erteilt Befehle. Gewöhnliche Arbeitskräfte bekommen ihre Aufträge automatisch. Das gesamte Kampf-, Gruppen- und Spezialistensystem fehlt im Prototyp weiterhin.

Die folgenden drei Videos von UltimateSpinDash wurden über ihre deutschen automatischen Untertitel gelesen. Der erste Abruf scheiterte; mit einem zweiten Abruf ausschließlich der Untertitel gelang die Auswertung. Automatische Transkripte enthalten erkennbare Zahl- und Wortfehler; unsichere Angaben werden deshalb nicht als exakte Originalkonstanten übernommen.

- [Wege und Gelände](https://www.youtube.com/watch?v=uYNPbIgU88k): Träger bilden und erhalten Straßen auch ohne Ladung. Bauarbeiter, Soldaten und Spezialisten tun das nicht. Wege haben zwei Stufen, verkürzen Trägerlaufzeiten und können bei Nichtbenutzung verschwinden. Zehn Überquerungen für den ersten Staubpfad sind im Transkript klar; beim Pflasterschwellwert ist die Erkennung uneindeutig. Die aktuelle Implementierung verwendet dafür vorläufig 50. Der Verfall beginnt hier nach zehn Minuten ohne Nutzung und ist eine Annäherung, keine exakt rekonstruierte Originalregel.
- [Die ideale Holzproduktion](https://www.youtube.com/watch?v=Hi9LV7J26yk): Holz ist eine Kette aus Förster, Holzfäller und Sägewerk. Laufstrecken, gemeinsam genutzte Arbeitsbereiche und Gebäudeabstände beeinflussen die Leistung. Das Video untersucht verschiedene Anordnungen statt nur feste Gebäudequoten zu empfehlen. Holzfäller benötigen Zeit am Baum; das bloße Verschwinden von Bäumen durch einen globalen Timer trifft das Verhalten nicht. Baumwachstum und volksspezifische Sägewerkzyklen werden im Prototyp weiterhin nicht originalgetreu simuliert.
- [Optimale Getreidefarm](https://www.youtube.com/watch?v=WnfWlJgWQYI): Arbeitsbereich und Weglänge beeinflussen die Ernte. Bauern säen und ernten, reife Felder und Lagerkapazitäten sind relevant. Der Prototyp besitzt noch keinen solchen Feldzyklus; die Farm bleibt eine vereinfachte zeitbasierte Produktion.

Zusätzlich gelesen:

- [Gameloft: offizielles Controls Tutorial](https://www.youtube.com/watch?v=bpFq0FkGY94), englische automatische Untertitel vollständig ausgewertet: bestätigt Einfinger-Kartenbewegung, rechten Zoomregler, Minimap-Sprung und Zweifinger-Auswahl. Die Originalauswahl bevorzugt Militär und wählt einen Einheitentyp; diese Typregel fehlt hier noch, da Spezialisten und Militär fehlen. Das Original besitzt sechs Baumenü-Zweige (Grundgebäude, Nahrung, Metall, Militär, Stadt, Ziergebäude) sowie ein getrenntes Siedlermenü für Berufszuweisung. Der Prototyp hat weiterhin eine flache Gebäudeleiste, keine nachgebildeten vollständigen Menüs. Die erläuterten Metall-, Waffen- und Gebietseroberungssysteme sind ebenfalls noch offen.
- [Settlers United: Gelände und Straßen](https://docs.settlers-united.com/settler-iv-wiki-en/basics/terrain-and-roads): bestätigt Gras → Staubpfad → Pflaster sowie 9/8/7 Ticks pro Feld. Wege verhindern Baumpflanzung. Die Implementierung übernimmt das Geschwindigkeitsverhältnis, nicht die ursprüngliche Tickfrequenz.
- [Baustellenpriorität](https://docs.settlers-united.com/settler-iv-wiki-en/basics/buildsite-priority): unterscheidet Planierer-, Material- und Bauarbeiterwarteschlangen. Der neue Prioritätsknopf bevorzugt hier Bauaufträge; die separate Materialversorgung ist noch nicht umgesetzt.
- [Arbeitsbereiche](https://docs.settlers-united.com/settler-iv-wiki-en/basics/working-radius): erläutert die Auswirkungen von Gebäudeeingängen und Arbeitsbereichslage. Änderbare Bereiche wirken hier auf Holzfäller, Steinmetze und Förster; Farmfelder fehlen noch.
- [148Apps: iPhone-Test von 2009](https://www.148apps.com/the-settlers-iphone/settlers/): beschreibt Zweifinger-Auswahlrahmen, anschließendes Antippen eines Ziels, Handtaste zum Verlassen der Auswahl und einen Zoomregler rechts. Deshalb wurde das zunächst eingebaute Pinch-Zoom durch Zweifinger-Auswahl ersetzt. Bewegen ausgewählter Spezialisten bleibt ausstehend.

## Änderungen am ausführbaren Spiel

- Keine Kreisformel mehr: Arbeiter stehen zunächst still, wechseln gelegentlich zu freien Ruheplätzen und übernehmen Aufträge.
- Wegsuche um Wasser, Gebäude, Bäume und Felsen; diagonales Durchschlüpfen zwischen blockierten Ecken ist verhindert. Unzugängliche Ziele liefern keinen Weg.
- Holzfäller/Steinmetze gehen an die Ressource, arbeiten dort und bringen das Ergebnis zur Hütte. Ein Träger holt es ab und bringt es zum Lager.
- Verkehr zählt Feldübergänge, nicht Renderframes. Straßen folgen benutzten Kanten; häufigere Nutzung verändert Breite/Farbe und Laufkosten. Das Straßenbauwerkzeug wurde entfernt.
- Verwendete Straßen beeinflussen spätere Routen. Förster pflanzen nicht auf ausgetretenen Wegen.
- Neue Wohnhäuser erzeugen auch tatsächliche Arbeiterobjekte, nicht nur eine höhere Zahl im HUD.
- Produktionsstopp, vereinfachte Baupriorität und Arbeitsbereich lassen sich am Gebäude bedienen. Materialbedarf und wartende Ausgaben werden beim Inspizieren erklärt.
- Linke Maustaste: Auswahlrahmen; rechte Maustaste ziehen: Kamera; Rad: Zoom am Mauszeiger; Pfeiltasten: Kamera.
- Touch: ein Finger verschiebt, zwei Finger markieren; rechter Regler zoomt; Handtaste hebt Auswahl auf. Markierte gewöhnliche Arbeiter lassen sich inspizieren, aber nicht als Soldaten befehligen.
- Save-Version 4 enthält Gelände, Arbeiterpositionen, laufende Aufgaben, Ladung, Wege und Gebäudeeinstellungen. Im Titelbildschirm läuft die Simulation nicht mehr und überschreibt keinen Spielstand.

## Prüfung und weiterhin fehlender Umfang

`node tests/simulation.mjs` prüft Ruheverhalten, Bau, Fällen, Lieferung, Verkehr sowie Aufgabe/Ladung nach Save/Load. Der Produktionsbuild wird separat geprüft. Wasserumwege und unerreichbare Ziele wurden direkt gegen die Wegsuche getestet.

Noch offen: exakte Straßenverfallskonstanten, dauerhaft zugewiesene Berufe und Werkzeuge, baustellenbezogener Materialtransport, lokale Versorgungspuffer für alle Produktionsketten, Farmwachstum, Minen/Metalle/Waffen, vollständige Spezialisten- und Soldatensteuerung einschließlich Gruppen und Wegpunkten, Territorium/Nebel, Kampf/KI, Schiffe, Handel, Religion, Völker, Kampagnen und Mehrspieler. Diese Funktionen sind nicht durch die vorliegenden Änderungen abgedeckt.

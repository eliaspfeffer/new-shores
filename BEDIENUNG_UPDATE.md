# Bedienungsstand – 12. September 2026

## Umgesetzt

- Touchpad: zweifingeriges Scrollen verschiebt die Karte horizontal und vertikal. Pinch bzw. Ctrl/Alt/Meta + Scrollen zoomt am Mauszeiger. Klickziehen wählt Einheiten, Rechtsziehen verschiebt die Karte. Shift ergänzt die Auswahl.
- Eigene Zivilisten und Spezialeinheiten können angeklickt und auf freie Fläche geschickt werden. Der Knopf „Move selected“ erzwingt einen Zielauftrag, auch wenn dort ein Gebäude liegt. Beschäftigte Träger schließen ihre Lieferung ab, bevor sie den Wegauftrag ausführen. Danach nehmen Zivilisten bei Bedarf wieder Wirtschaftsaufträge an.
- Untätige Arbeiter laufen nicht mehr zufällig umher. Alte gespeicherte Leerlauf-Wege werden beendet.
- Gebäude sind auch über ihre sichtbaren Dachflächen anklickbar. Produktionsstopp und Priorität bleiben verfügbar.
- Holzfäller, Förster und Steinmetz besitzen ein sichtbares Arbeitsgebiet. Zentrum auf eigenem Grasland, maximal acht Rasterfelder Manhattan-Abstand; Arbeitsradius drei. Förster pflanzen, Holzfäller fällen. Steinmetz-Bauplätze und dessen Arbeitsgebiet erfordern nahe Steine.
- Abrissdialog zeigt die konkrete Rückgabe, pausiert während der Entscheidung und erlaubt Abbrechen. Verbrauchtes Baumaterial wird zur Hälfte (abgerundet), unbenutzte Vorräte und unterwegs befindliche Waren vollständig erstattet. Liefer- und Besatzungsreferenzen werden nach Entfernung korrigiert. Wohnplätze und Turmterritorien werden aktualisiert.

## Verifikation

`node tests/interaction.mjs`, `node tests/simulation.mjs`, `node tests/strategy.mjs` und `npm run build` erfolgreich.

Abgedeckt: Scroll-/Zoom-Zuordnung, zivile Zielaufträge und aufgeschobene Aufträge, 120 Sekunden Leerlauf ohne Wanderung, Produktion/Bau/Transport, Speichern/Laden, Arbeitsgebietsprüfung, Dachtreffer, Steinverfügbarkeit, Abriss ohne doppelte Erstattung und Indexkorrektur bei Lieferungen/Besatzungen.

Im integrierten Browser geprüft: gespeicherte Siedlung, Dachauswahl des Holzfällers, Abrissvorschau mit Abbruch, Arbeitsgebietsmarkierung und zivile Auswahl/Zielklick. Keine Browserfehler protokolliert. Bestehende Gebäude nicht für QA abgerissen; der tatsächliche Abriss ist simulationsgetestet. Physische Mac-Touchpad-Gesten bleiben vom Nutzer zu prüfen; ihre Ereigniszuordnung ist automatisiert getestet.

## Bewusste Grenzen

- Das zentrale Lager bleibt geschützt, da Transport und Startwirtschaft davon abhängen.
- Abrissrückgaben landen sofort im Lager; es gibt noch keine sichtbaren Rücktransport-Aufträge.
- Gebäudetreffer nutzen großzügige Begrenzungsflächen statt pixelgenauer Transparenzmasken.
- Keine Behauptung vollständiger Originaltreue. Diese Änderung betrifft die Bedienung und die genannten Arbeits-/Abrissregeln, keine neue Grafikfamilie.

Referenz für den grundsätzlichen Abrisswert: [Die Siedler IV – Handbuch](https://www.mogelpower.de/manuals/Die_Siedler_IV_Handbuch.pdf). Rundung, direkte Lagerrückgabe und Arbeitsgebietsgrenzen sind Implementierungsentscheidungen dieser Hommage.

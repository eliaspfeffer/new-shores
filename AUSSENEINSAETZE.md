# Außeneinsätze — geprüfter Zwischenstand

Nach Freigabe des Speichers wurde der unterbrochene Ausbau repariert und geprüft.

## Funktionsumfang

- Bauern suchen freie Stellen, säen bis zu vier Felder, warten auf Wachstum, ernten und tragen zwei Getreide zum Hof zurück. Erst dort können Träger die Ernte übernehmen.
- Förster laufen zu einer freien Pflanzstelle. Ein neuer Baum entsteht erst nach ihrer Arbeit vor Ort und wächst anschließend mit dem bestehenden Baumalter-System.
- Fischer suchen erreichbares Land oder Strand direkt am Wasser, angeln und tragen den Fang zur Hütte zurück.
- Arbeitsstellen werden zwischen Personen reserviert. Felder und aktive Arbeitsorte sind nicht überbaubar. Ein freier Rückweg wird vor dem Arbeitsauftrag geprüft.
- Ohne freie Arbeitsstelle oder bei wartender Ausgangsware steht das Personal still und prüft später erneut.
- Nach Stopp, Umzuweisung oder Abriss bleibt bereits gesammelte Außenware beim Siedler und wird ins Lager zurückgetragen. Kein sofortiges Gutschreiben aus der Ferne.
- Felder, Wachstum, Arbeitsschritt und getragene Ernte werden mitgespeichert. Ältere Werkstatt-Zustände dieser drei Berufe wechseln in den Außeneinsatzbetrieb, ohne bereits fertige Ausgangsware erneut zu erzeugen.

## Prüfung

Neun Testsuiten (`npm test`), explizite Simulation-/Strategietests und Produktionsbuild bestanden. Der neue isolierte Browser-Test verwendet vorbereitete Gebäude und eine freigeräumte Testlandschaft, aber echte Wegfindung, Arbeitszeiten, Träger, Rendering und Save/Reload. Er prüft Pflanzung, Getreideernte, Fischfang und tatsächliche Warenankunft im Lager. Er ersetzt keinen Durchlauf mit selbst aufgebauter kompletter Nahrungskette. Keine Änderungen am persönlichen Browser-Spielstand durch QA.

## Grenzen

Dies ist ein funktionaler erster Ausbau, keine originalgetreue Animationsrekonstruktion. Felder bestehen derzeit aus gezeichneten Furchen und wachsenden Halmen; Figuren nutzen vorhandene Laufbilder und vereinfachte Werkzeuge/Angelbewegungen. Vier Felder und die Wachstums-/Arbeitszeiten sind eigene Balancewerte. Tierhaltung, Jagd und die übrigen großen Systeme (Gegnerwirtschaft, Völker, Militär-Erweiterungen, Schiffe/Handel, Religion, Kampagnen, Mehrspieler) bleiben offen.

Die vorherigen Änderungen an Einzel-Feld-Pionieren, Punktmarkierungen und Autosave/automatischem Fortsetzen bleiben erhalten. Der wegen Speicherknappheit entfernte `dist`-Ordner wurde durch den erfolgreichen Build wieder erzeugt.

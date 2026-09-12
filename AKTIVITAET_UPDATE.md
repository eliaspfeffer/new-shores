# Geologen, Bauphasen und Arbeitsdetails

Stand: 12. September 2026. Ergänzung zum bisherigen Funktionsaudit, kein vollständiges Original-Remake.

## Ursache und Änderung

- **Geologe:** Bisher waren vier Vorkommen unter normaler Wiese verborgen. Nach einem Auftrag gab es nur eine einmalige Radiusprüfung. Jetzt zeigen graue, walkbare Felsflächen mögliche Suchgebiete, ohne vorab den Rohstoff zu verraten. Der Geologe läuft eine endliche Reihe erreichbarer Bodenproben ab, untersucht jeweils vier Simulationssekunden und entdeckt nur nahe Vorkommen. Bei blockiertem Ziel versucht er einen erreichbaren Nachbarplatz. Nach Ende oder „Anhalten“ läuft er nicht weiter. Fundschilder zeigen Warenbild und Restvorrat. Neue Befehle ersetzen die alte Suche; Warteschlange und Fortschritt bleiben im Spielstand erhalten.
- **Bedienung:** Siedler → Geologen ausbilden oder „Geologen finden & auswählen“ → „nächstes Felsgebiet untersuchen“. Alternativ selbst ein Gebiet anklicken. Die automatische Zielwahl nutzt nur bekannte, unerforschte Gebiete. Minen bleiben an den passenden entdeckten Vorrat und eigenes Gebiet gebunden.
- **Siedlermenü:** Vier Rekrutierungstypen mit den vorhandenen eigenen Figurenbildern, Bestandszahlen und Werkzeug-/Waffensymbolen. Auswahlstatus zeigt den Geologenauftrag und abgeschlossene Proben.
- **Baukosten:** Warenbilder mit Zahlen in Gebäudekarten, Hover-/Tastaturfokus-Informationen und Bauplatzhinweis. Die Hover-Information zeigt bei Produktionsgebäuden auch die reale Rezeptur mit Bildern.
- **Baustellen:** Fundament, aufsteigendes Mauerwerk, Gerüst/Dachstuhl und Dachausbau statt durchscheinendem vollständigem Gebäude. Die Grafik wird von unten nach oben freigelegt; Materialtransporte und echte Bauarbeit treiben den Fortschritt. Bauphasenname im Gebäude- und Betriebsstatus.
- **Arbeitsdetails:** Gerichtete Werkzeugbewegungen, kleine Späne/Staubpartikel und Rauch bei aktiven heißen Betrieben. Nur tatsächliche Arbeitszustände animieren; fehlende Inputs, erschöpfte Minen, volle Ausgänge und angehaltene Betriebe stoppen die Arbeitsdarstellung. Ein gefällter Baum kippt um und blendet aus; der Effekt erzeugt keine zusätzlichen Waren.
- **Sound:** Eigene kurze, synthetisierte Arbeits-, Fund-, Fäll- und Fertigstellungseffekte. Im Pausenmenü einschaltbar, standardmäßig aus. Keine Originalsounds, kein automatischer Audiostart. Nur sichtbare Tätigkeiten erzeugen Geräusche; gleichartige Ereignisse sind begrenzt.
- **Betriebe:** Meldet fehlende ausgewachsene Bäume, erschöpfte Steine/Vorkommen und fehlenden Pflanzplatz. Keine zusätzliche Flut von Popup-Warnungen.
- **GitHub:** Repository auf privat umgestellt. Das kann vorher angefertigte Kopien nicht zurückholen.

## Referenzen und Grenzen

Verhaltensreferenz: [Originalhandbuch, Abschnitte 6, 7 und 10.2](https://www.mogelpower.de/manuals/Die_Siedler_IV_Handbuch.pdf). Geologen werden in die Berge geschickt und melden Rohstoffe; diese Grundregel ist umgesetzt. Suchraster, Reichweite, Mengen und Zeiten sind eigene Prototypwerte.

Erneut im Browser betrachtetes [Originalbild](https://images.igdb.com/igdb/image/upload/t_screenshot_huge/sc756m.jpg): kleine erkennbare Figuren, bildbasierte Menüs und Waren, gelbgrüne Landschaft. Dieses Bild zeigt keine vollständigen Bau- oder Fällsequenzen und ist deshalb **kein Nachweis** originalgetreuer Animationen. Es wurden keine Originalsprites ausgeschnitten. Die bestehenden eigenen Atlasgrafiken bleiben erhalten; keine neue Rastergrafik erzeugt.

Die grauen Flächen sind eine sichtbare Geologie-Überlagerung, noch kein echtes Höhen-/Berg-/Planierungssystem. Die Gebäude verwenden weiterhin einen fertigen Sprite mit Aufbau-/Gerüst-Rendering, nicht pro Gebäudetyp neu gezeichnete Zwischenstufen. Die Figuren haben Werkzeug-/Körperbewegungen, noch keine vollständigen berufsspezifischen Animationsatlanten oder individuell animierte Werkstatt-Innenräume. Fischer, Landwirtschaft und Förster benötigen weiterhin umfassendere reale Arbeitswege und Feld-/Pflanzphasen.

Weitere große Lücken bleiben: eigenständig wirtschaftende Gegner-KI, vollständige Völker und Spezialisten, Religion, Schiffe/Handel, vollständige Militärsysteme, Kampagnen, Siegbedingungen und Mehrspieler. Siehe auch [bisheriges Audit](AUSBAU_AKTUELL.md). „Alles wie das Original“ ist damit ausdrücklich noch nicht erreicht.

## Prüfung

- `npm test`: sieben Testsuiten einschließlich neuer Tests zu Suchaufträgen, blockierten Zielen, mehreren Proben, JSON-Fortsetzung, Halt, Fund-/Minentypen und arbeitsabhängiger Animation.
- `npm run build` sowie die bisherigen separaten Simulations-/Strategietests.
- `tests/browser/activity.cjs`: isolierter Chrome-/Playwright-Kontext; echte UI-Aktionen für Ausbildung, Suche, Fund, Materiallieferung, Hausbau, Wohnplätze, Holzfäller/Fällereignis, anschließenden Minenbau mit Personal und fehlendem Brot, Speichern/Laden und Audio ein/aus. Playwright muss separat verfügbar sein, z. B. über `NODE_PATH`; kein Bestandteil von `npm test`. Die einmal pro Simulationssekunde aktualisierte Betriebsanzeige wird vor ihrer Prüfung abgewartet.
- Die erste Browserprüfung entdeckte einen Initialisierungsfehler im Figurenmenü, der behoben wurde. Ein alternativer Aufnahmeweg war erforderlich, weil das Chrome-DevTools-Screenshotwerkzeug wiederholt hing. Die lokalen Playwright-Screenshots wurden visuell geprüft.
- Audio-Aktivierung und Deaktivierung technisch geprüft; keine Hörabnahme, keine echten iPhone-Tests, kein Leistungstest.

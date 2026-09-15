# Spielbarkeit und Gerätewechsel · 15. September 2026

- Fischerhütten akzeptieren eigenes sandiges Ufer; Vorschau und tatsächliche Standortprüfung stimmen überein. Erkundung allein ersetzt weiterhin keinen Gebietsbesitz.
- Neue Gebäudepopups mit 16 eigenen generierten Bildsymbolen, Mengenwahl, sichtbarer Priorität und gesperrtem Besetzen voller Türme. Bestehende Sammelpunkte, Ausbildungswarteschlangen, Lagerregeln und Turmfeuer bleiben zugänglich.
- Sichtbare Atlasunterkanten als Bodenanker für Industrie, großes Wohnhaus und Lazarett. Desktop-Auswahl zeigt Figuren und Mengen oben anstelle der Rohstoffe.
- Maximal 15 Nachrichten; alte Routineeinträge werden bei der Migration herausgefiltert. Länger bestehende Engpässe werden mit Gebäude und Koordinaten gemeldet.
- Abgeholte Waren gehen bei Bedarf direkt zum erreichbaren Verbraucher; Menge bleibt erhalten. Auch die Versorgersuche bevorzugt fertige Produzentenware.
- Bestehende mineralische Gebiete erhalten einmalig weitere endliche Vorkommen; abgebaute Vorkommen werden nicht aufgefüllt. Geologen führen eine endliche Folge mehrerer Proben aus.
- Rechtsklick auf das Turmdach zielt auf den Turm, damit Schwertkämpfer den bestehenden Eroberungsauftrag erhalten.
- JSON-Import direkt aus dem Hauptmenü. Bisherige lokale Insel wird gesichert. Angemeldete importierte Insel wird automatisch als eigene Serverinsel angelegt.
- Automatische Synchronisierung alle 15 Sekunden und beim Wechsel in den Hintergrund. Beim Zurückkehren oder Neuladen wird ein neuerer Serverstand geladen, sofern keine ungesendeten lokalen Spieländerungen existieren. Bei parallelen Änderungen bleiben beide Fassungen erhalten und die Synchronisierung pausiert zur Auswahl. Bestehende zusätzliche Inseln und Freigaben werden nicht gelöscht.

## Prüfung

44 Node-Testdateien erfolgreich; darunter Simulation, Strategie, exakte direkte Zweierlieferung, Küstenbauplätze, einmalige Mineralmigration, Journalgrenze und Schutz ungesendeter Cloud-Spielstände. Produktionsbuild erfolgreich.

Browserprüfung bei 1400×900 und 844×390: Nutzer-JSON importiert, 35 Gebäude und 98 Arbeiter erhalten, 13 statt 4 Vorkommen nach Migration; Mengenwahl, Priorität, volle Türme und Einheitenleiste geprüft, Screenshots visuell betrachtet. Keine Seitenfehler.

Mit isoliertem temporären QA-Konto am echten Kontoserver: Registrierung, automatische Inselanlage, Login und Übernahme auf zweitem Gerät, Hintergrundspeichern und automatisches Laden der neueren Revision zurück auf Gerät eins geprüft. Nur die dafür angelegten QA-Daten anschließend entfernt. Der private Nutzer-Spielstand ist kein Repository-Testfixture.

Kein Ausbau des Mehrspielermodus. Kein CPU-Server-Spielzyklus: Simulation bleibt im Browser; der Server verarbeitet Konten und gespeicherte Snapshots. Keine Zusage absoluter Sicherheit oder eines pixelidentischen Originalnachbaus.

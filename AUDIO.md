# Audio – Stand 13. September 2026

Yippee-Update: Die drei Rufe der Quellaufnahme sind anhand ihrer Stillepausen getrennt (Details in SOURCES.md). Drei wechselnde Einzeldateien statt des bisherigen einzelnen Ausschnitts, weiterhin nur ein Ruf pro Ereignis. Insgesamt jetzt zehn dekodierte Aufnahmen. Der Yippee-Hörprobebutton wechselt beim erneuten Abspielen nach der Dreisekunden-Sperre zum nächsten Ruf.

## Neue echte Aufnahmen (CC0, keine Original-Siedler-Dateien)

Acht kurze MP3-Dateien ersetzen die synthetischen Profile für Holzhacken, Bau-/Werkstatthammer, Stein-/Minen-/Schmiedehämmer, Baumfall sowie Jubel bei Bauabschluss und Geologenfund. Holz/Metall verwenden jeweils zwei wechselnde Varianten. Die Zuordnung ist eine eigene klangliche Annäherung, kein vollständiger Original-Hörvergleich. Übrige Klänge und Musik bleiben synthetisch.

Prüfung dieses Updates: 37 Node-Testdateien, Simulation, Strategie und Build bestanden. Isolierte Desktop-/667×375-Touch-Läufe prüfen acht dekodierte Aufnahmen, fünf Sample-Hörproben (kein Oszillatorersatz), Signal am Audiobus, Lautstärkenspeicherung, Mute/Resume, einen Kontext und erneutes Laden/Decodieren im Offline-Modus. Bau-/Bevölkerungs-/Steintransport-Kernloop ebenfalls auf beiden Größen geprüft. Screenshots des Tonmenüs visuell geprüft. Keine Behauptung eines subjektiven Hörvergleichs oder Tests auf echter iPhone-Hardware.

Quellen und Bearbeitung sind in [assets/audio/SOURCES.md](assets/audio/SOURCES.md) dokumentiert: rubberduck (Holz/Metall), kheetor (Baumfall), Sadiquecat (selbst eingesprochener „Yippee“-Ruf). Alle drei Quellseiten weisen ausdrücklich CC0 aus. Keine Originalspiel-Aufnahmen oder ungeklärten YouTube-Meme-Reuploads.

Pause → Musik & Geräusche → Ton einschalten: anschließend fünf Hörprobe-Buttons. Acht Dateien werden einmalig in denselben Audiokontext dekodiert und wiederverwendet. Kein Autoplay, keine zusätzliche Audioinstanz, weiterhin maximal 32 Stimmen insgesamt. Gestaffelte Ereignis-Drosselung; Jubel frühestens alle drei Sekunden je Ereignistyp. Lade-/Dekodierfehler behalten synthetische Ersatzklänge und werden im Tonmenü angezeigt. Alle Assets sind im Build/Offline-Cache enthalten; kein Kontakt zu Quellplattformen beim Spielen. Musik und Natur sind unabhängig regelbar.

Die folgenden Abschnitte beschreiben den vorherigen Synthese-Grundstand; die Aussagen „keine Downloads“ und „keine externen Audio-Abhängigkeiten“ werden durch die oben dokumentierten, lokal mitgelieferten CC0-Aufnahmen ergänzt.

## Demo-/YouTube-Recherche

- Historische Siedler-IV-Demo: https://www.ausgamers.com/files/download/438/settlers-4-demo ; am Prüftag Wartungsseite, Download nicht geprüft. https://forest.watch.impress.co.jp/article/2001/05/09/game130.html dokumentiert die damalige Demo. Keine kostenlose offizielle Vollversion oder Freigabe der Original-Sounds zur Einbettung nachgewiesen; keine Demo ausgeführt oder Originalassets übernommen.
- Gefundene YouTube-Treffer: https://www.youtube.com/watch?v=U_Rhq4uBga8 (Holzhammer, Beschreibung verweist für Nutzung auf Patreon), https://www.youtube.com/watch?v=THk80t-jagY (Yippee-Reupload, ohne eindeutige Einzelquelle). Nicht verwendet. Stattdessen explizit freigegebene Aufnahmen direkt von den Autoren bezogen.

## Referenz und Grenze

Das [Originalhandbuch, Abschnitt Sound-Menü](https://manualmachine.com/gamespc/thesettlersiv/1119087-user-manual/) belegt getrennte Musik-, Geräusch- und Voice-Chat-Lautstärken. Es enthält **kein vollständiges Verzeichnis einzelner Sounddateien**. Die Originalaufnahmen wurden nicht übernommen, und ein vollständiger Hörvergleich ist nicht erfolgt. Diese Implementierung ist eine originale, synthetische Klangkulisse, keine klangidentische Rekonstruktion.

## Eingebaut

- Eigene zyklische 64-Schlag-Komposition: ruhige Melodie, gezupfte Dreiklangsbegleitung und Bass; keine Originalmelodie.
- Eigene Effektprofile für Holzhacken, Baumfall, Stein-/Bergbau, Graben, Ernten, Angeln, Bauhämmer, Sägen, Mühle, Feuer/Öfen, Wasserwerk, Schweine, Schmiede und Heilung.
- Alle aktuell vorhandenen Produktionsrezepte haben eine Klangzuordnung. Verwandte Berufe teilen bewusst Profile; keine einzigartige Aufnahme pro Gebäude.
- Geologenarbeit und separater Fundklang; Pionierarbeit; Bauplatz, Fertigstellung und Abriss.
- Schritte nur bei tatsächlicher Positionsänderung; Aufnahme/Ablage nur bei Wechsel der tatsächlich sichtbaren Ladung, nicht bereits bei Warenreservierung.
- Nahkampfschlag, Bogenabschuss, Geschosseinschlag, Tod und Turmeroberung; Sieg-/Niederlagenmotiv.
- Gedämpfte Meldungstöne und Schaltflächenklicks; Wind/Vogel-Intervalle und Wasserrauschen bei sichtbarer küstennaher Kartenmitte.
- Sicht-/Bildschirmfilter und Stereo-Positionierung für lokale Arbeits-/Kampfgeräusche. Musik und allgemeine Naturintervalle laufen im Pausenmenü weiter.

## Bedienung, Offline und Ressourcen

Pause öffnen → **Musik & Geräusche** → **Ton einschalten**. Drei Regler: Musik, Soundeffekte, Natur. Lautstärken werden separat vom Spielstand gespeichert. Nach Neuladen ist erneut eine bewusste Aktivierung nötig (auch iOS-Autoplay-Regeln). Beim Verbergen der Seite wird der Audiokontext angehalten.

Keine Downloads oder externen Audio-Abhängigkeiten; nach Installation des aktuellen Offline-Caches auch offline nutzbar. Ein Audiokontext, ein wiederverwendeter Rauschpuffer, maximal 32 gleichzeitige Stimmen, Ereignis-Drosselung und Freigabe beendeter Audioknoten. Kein Leistungstest durchgeführt.

## Noch nicht originalgleich

- Authentische Instrumentalaufnahmen, längere variierende Musikstücke, situations-/volksspezifische Originalkompositionen, Sprachaufnahmen und individuelle Tier-/Menschenlaute.
- Geräusche nicht implementierter Systeme (etwa Schiffe, Kriegsmaschinen, Religion/Wunder, Dunkles Volk und weitere Völker/Produktionsketten).
- Vollständige Original-Soundliste und akustischer A/B-Vergleich; Syntheseprofile sind stilisierte Annäherungen.
- Echte iPhone-/Safari-Hörprüfung; Browserprüfung erfolgt mit Chromium im Touch-Querformat.

## Prüfung

`tests/sound.mjs`: Rezeptabdeckung, gültige Profile, Opt-in, Lautstärkengrenzen, fehlende Audio-Unterstützung.
`tests/browser/audio.cjs`: isolierte Desktop-/Touch-Profile, tatsächliches Signal per Analyser, Aktivierung, Mute/Resume, ein Kontext, Tabwechsel, Lautstärkenspeicherung und Reload ohne Autoplay.
Simulation, Strategie und Produktionsbuild ebenfalls geprüft. Persönliche Spielstände nicht verändert.

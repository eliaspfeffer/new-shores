# Audio – Stand 12. September 2026

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

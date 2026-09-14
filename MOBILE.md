# Mobile Querformat-Version

## Aktuell: Daumen-Menüs nach den Nutzer-Screenshots

Diese Fassung ersetzt die unten beschriebene ältere Fünf-Button-Leiste: **Haus unten links, Siedler unten rechts**. Das Haus öffnet Kategorien und große Gebäudeknöpfe. Nach der Gebäudeinformation zunächst einen Bauplatz antippen, dann links bestätigen oder rechts abbrechen. Brief oben links für Nachrichten; Warenpfeil oben für blätterbare Bestände; ausgewählte Einheiten ersetzen die Warenanzeige. Türme, Kasernen und Werkzeugschmieden haben eigene Kontext- und Mengenmenüs.

Die bisherigen erweiterten Befehle bleiben im Pausenmenü unter Betriebsübersicht, Weitere Siedlerbefehle und Warenverteilung erreichbar. Gebäudedetails bieten Weitere Einstellungen. Neue Werkzeugmengen werden gespeichert; Spezialisten legen ihr Werkzeug beim Zurückverwandeln wirklich am Boden ab. Referenzzuordnung und noch fehlende Originalberufe/-Menüs: [MOBILE_REFERENCE_AUDIT.md](MOBILE_REFERENCE_AUDIT.md). Kein pixelidentischer Nachbau, keine echte iPhone-Hardwareprüfung.

Aktuell hostet der private Server den unten verlinkten Spielstand der Anwendung. Für den ersten Download muss **der Server**, nicht der Mac, erreichbar sein. Die späteren Mac-/Port-4176-Angaben sind die historische lokale Hosting-Alternative.

## Referenz-Überarbeitung · 14. September 2026

- Neue mobile Partien starten bei Zoom 1,15; gespeicherte Kameras werden nicht überschrieben. Der Hausknopf rechts zentriert das eigene Hauptlager und stellt den näheren Ausschnitt her. Pinch/Zoom reichen mobil jetzt bis 1,85.
- Fünf runde Übersichtsbuttons statt sieben dauerhaft sichtbarer Befehle und großem Rahmen. Bei ausgewählten Siedlern erscheinen Ziel/Halt; bei Gebäuden verfügbare Details/Betrieb/Arbeitsbereich/Abriss. Übersicht kehrt zur normalen Leiste zurück. Abriss bleibt durch den bisherigen Dialog mit Rückgabe abgesichert.
- Weniger kleinteiliges Gras aus vorhandener Textur, weich interpolierter Nebel ohne Canvas-Filterabhängigkeit. Desktop, Grafikdateien und Spielstände unverändert.
- Geprüft durch `tests/browser/mobile.cjs` und `tests/browser/mobile-reference.cjs`: native emulierte Touchgesten, Gebäudeknöpfe, Menü-Rückwege, gespeicherte Kamera, Offline-Neustart, kurze Querformatansichten und Desktop-Abgrenzung. Keine echte iPhone-Hardwareprüfung.

Aktueller Server-Link: https://hermes.tailee79a6.ts.net:9444/?mobile=1 (Tailscale erforderlich). Die nachstehenden ursprünglichen Mac-Hosting-Angaben beschreiben die lokale Alternative, nicht diesen Server. Bestehende Server-Spielstände können über „Konto & Inseln“ synchronisiert werden; Offline-Stände bleiben gerätelokal.

Die gleiche vollständige Simulation mit eigener Touch-Oberfläche, kein verkürzter Demo-Modus. `/?mobile=1` erzwingt die mobile Ansicht; Geräte mit primärer Touch-Eingabe erhalten sie automatisch. Desktop ohne diesen Parameter bleibt unverändert.

## iPhone starten

1. Auf dem iPhone Tailscale mit demselben Tailnet verbinden und den privaten HTTPS-Spiel-Link in Safari öffnen. Der Mac und der lokale Vorschauprozess müssen für den ersten Download erreichbar sein.
2. Im Querformat spielen. Bei Hochformat erscheint ein Drehhinweis; die Simulation hält währenddessen an. Safari lässt sich nicht zuverlässig zwangsweise drehen, deshalb Ausrichtungssperre gegebenenfalls ausschalten.
3. Im Pausenmenü auf „Offline bereit“ warten (aktuell etwa 28 MB Spielgrafiken und Code). Safari → Teilen → Zum Home-Bildschirm. Nach dem Hinzufügen die Home-Bildschirm-Version einmal online öffnen und dort erneut den Offline-Status prüfen.
4. Danach kann die zwischengespeicherte Version ohne Tailscale, Internet oder laufenden Mac starten. iOS kann Websitedaten bei Speichermangel oder manueller Löschung entfernen; wichtige Spielstände zusätzlich exportieren. Auf einem echten iPhone wurde diese Installation noch nicht geprüft.

Spielstände sind pro Gerät und Webadresse gespeichert, nicht über Tailscale synchronisiert. Einen Mac-Spielstand über Export/Import übertragen. Safari und die Home-Bildschirm-App können unterschiedliche Datenspeicher verwenden. Bestehende Desktop-Spielstände wurden nicht verändert.

## Bedienung

- Ein Finger zieht die Karte, zwei Finger zoomen und verschieben sie.
- „Markieren“ aktiviert den Auswahlrahmen mit einem Finger. Erneutes Antippen kehrt zur Kartennavigation zurück. In diesem Modus erzeugt ein Tipp auf leeren Boden keinen Marschbefehl.
- Einheit antippen, „Ziel“ und anschließend Ziel antippen; „Halt“ beendet ihre Aufträge. Die Hand löscht Auswahl und Werkzeugmodus.
- Untere Befehlsleiste öffnet Bauen, Siedler, Waren oder Betriebe. Ausklappbare Menüs statt der ständig belegten Desktop-Seitenleiste; Gebäudebilder und Kosten bleiben vorhanden. Nach Auswahl eines Gebäudes schließt das Menü zur Platzierung.
- Ein Gebäude antippen öffnet seine regulären Einstellungen. Arbeitsgebiet/Befehlswahl gibt die Karte wieder frei. „Zur Karte“ schließt das Menü ohne die Simulation zurückzusetzen.
- „Gebäudeeinstellungen öffnen“ zeigt zusätzlich ein eigenes, scrollbar bedienbares Fenster. Schließen oder Escape kehrt zur Übersicht zurück; Arbeitsgebiet und Abriss verlassen das Fenster für den nächsten Schritt. Das Hauptlager hat keinen solchen Knopf, weil es automatisch arbeitet und geschützt ist. Betrieb/Priorität bestätigen Änderungen und melden auch Speicherfehler.
- Minikarte rechts oben einblenden; daneben große Zoomknöpfe. Hauptbefehle mindestens 44 CSS-Pixel, Berücksichtigung der iPhone-Sicherheitsränder.
- Patrouillierenden Soldaten auswählen → Siedler → Rundroute bearbeiten: Punkte entfernen, auf/ab verschieben oder die Route umkehren. Bei mehreren ausgewählten Soldaten zunächst die Kennung im Editor wählen. Nummerierte Kartenverbindungen zeigen ihre Befehlspunkte, nicht den exakten Laufweg.
- Lager → Gebäudeeinstellungen → Quellen nach Priorität: bis zu acht Quellen hinzufügen, entfernen oder auf/ab sortieren. Die erste lieferfähige, erreichbare Quelle wird verwendet. „Einzelquelle“ ersetzt die ganze Liste; ohne Quellen bleibt das Auffüllen ausgesetzt. Bestehende Zusagen werden weiterhin ausgeliefert.

## Referenz und Grenzen

Visuell angesehen: [The Settlers für iPhone, Militäransicht](https://images.sftcdn.net/images/t_app-cover-l%2Cf_auto/p/35bdc8a0-a48f-11e6-a501-00163ec9f5fa/508127746/the-settlers-screenshot.jpg), verlinkt von [Softonic](https://the-settlers.fr.softonic.com/iphone). Zugehörige Veröffentlichung: [Pocket Gamer – The Settlers iPhone](https://www.pocketgamer.com/the-settlers-iphone/). Die mobile Gameloft-Fassung wird dort „The Settlers“ genannt, nicht die Desktop-Oberfläche von IV.

Übernommen als Anordnungsidee: freie Kartenmitte, warme metallisch gerahmte runde Befehle unten, Pause oben und Zoom rechts. Alle Bedienelemente selbst mit CSS/Symbolen umgesetzt, vorhandene eigene Spielgrafiken wiederverwendet; keine Original-UI-Sprites kopiert. Pinch und expliziter Auswahlmodus sind eigene Bedienentscheidungen, keine Behauptung identischer Originalgesten.

## Hosting und Aktualisierung

`npm run build` erstellt den Offline-Worker samt vollständiger Dateiliste und Inhaltsversion. Alte Offline-Caches werden nach Aktivierung einer neuen Version bereinigt. Eine geladene Spielversion wird nicht während einer Partie ausgetauscht: für Aktualisierungen online öffnen, anschließend sämtliche Spiel-Fenster/Home-Bildschirm-Instanzen schließen und erneut starten.

Der aktuelle Tailscale-Serve-Endpunkt leitet privat auf `127.0.0.1:4176` weiter; kein Funnel und keine öffentliche Freigabe. Neustart nach beendetem Vorschauprozess:

```sh
__VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS=macbook.tailee79a6.ts.net npm run preview -- --host 127.0.0.1 --port 4176 --strictPort
```

Serve bleibt im Hintergrund konfiguriert. [Tailscale-Referenz](https://tailscale.com/docs/reference/tailscale-cli/serve). [WebKit zur Home-Bildschirm-Unterstützung](https://webkit.org/blog/17333/webkit-features-in-safari-26-0/).

## Prüfung

22 Simulationstestsuiten sowie separate Simulation/Strategie und Build bestanden. Chromium mit iPhone-Abmessungen und echten emulierten Touch-Ereignissen: Menüs, Verschieben, Pinch, Markiermodus, Save/Load, Neustart bei abgeschaltetem Netzwerk und Querformat-Hinweis. HTTPS-Endpunkt antwortet mit 200. Keine Aussage über bereits bestandene reale iPhone-/Safari-Hardwareprüfung; kein Leistungstest.

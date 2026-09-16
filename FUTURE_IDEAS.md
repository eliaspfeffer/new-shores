# New Shores – Zukunfts-Backlog

Stand: 16. September 2026

> Dieses Dokument sammelt ausschließlich spätere Arbeiten. In diesem Durchgang wird **keines** der folgenden Features implementiert und kein bestehendes Spielverhalten verändert.

## 1. Aktuelle Fehler und UI-Nacharbeiten

### 1.1 „Auswahl aufheben“ auf dem Laptop

- Der sichtbare Button hebt die aktuelle Auswahl derzeit nicht zuverlässig auf.
- `Escape` funktioniert als Umweg, darf aber nicht erforderlich sein.
- Spätere Abnahmekriterien:
  - Ein Klick leert Einheiten- und Gebäudeauswahl sofort.
  - Auswahlrahmen, Kontextaktionen, Gebäudekarte und Statuszeile verschwinden konsistent.
  - Gleiches Verhalten mit Maus, Touch und Tastatur.

### 1.2 Fehlende einheitliche Comic-Symbole

- „Auswahl aufheben“ benötigt ein eigenes Comic-Medaillon anstelle des jetzigen Hand-Emojis.
- Alle noch vorhandenen Text-, Emoji- oder generischen Symbole inventarisieren.
- Für jede Hauptaktion ein zum vorhandenen Set passendes Medaillon erstellen.
- Größe, Rand, Lichtquelle, Druckzustand, Deaktivierung und Beschriftung auf Laptop und Mobilgerät vereinheitlichen.
- Bereits vorhandene eigene Bilder bewahren; neue Bildfamilien nach `GRAPHICS_REFERENCE.md` mit Referenz und Quellenvermerk erstellen.

### 1.3 Direkte Gebäudebefehle und Untermenüs

- Einfache Gebäude behalten höchstens vier direkt sichtbare Befehle unten links und öffnen kein zusätzliches Einstellungsmenü.
- Untermenüs nur für tatsächlich komplexe Auswahlvorgänge, beispielsweise Rekrutierung oder die Wahl einer herzustellenden Ware.
- Waffenschmiede: Herstellungs-Untermenü fehlt beziehungsweise lässt sich noch nicht öffnen.
- Bogenschmiede: Herstellungs-Untermenü fehlt beziehungsweise lässt sich noch nicht öffnen.
- In beiden Schmieden sollen Auftrag, verfügbare Rohstoffe, Warteschlange und herstellbare Ware verständlich sichtbar sein.
- Keine doppelt vorhandenen Aktionen zwischen unterer Leiste und Dialog.

## 2. Sichtbare Ausbildung in der Kaserne

- Ein freier Siedler wird für einen konkreten Rekrutierungsauftrag reserviert.
- Er läuft sichtbar zur ausgewählten Kaserne und durch deren Eingang hinein.
- Erst nach absolvierter Ausbildungszeit werden Waffe und gegebenenfalls Gold verbraucht beziehungsweise endgültig gebucht.
- Derselbe Siedler verlässt die Kaserne sichtbar als gewählter Krieger und läuft zum Sammelpunkt.
- Kein zufälliges Erscheinen eines neuen Kriegers an einer beliebigen Position.
- Speichern und Neuladen muss jede Phase erhalten: unterwegs, im Gebäude, Ausbildung, Ausgang und Sammelpunkt.
- Abbruch, Abriss, blockierter Eingang und fehlende Ressourcen benötigen definierte, verlustfreie Zustände.

## 3. Seefahrt und neue Gebäude

### 3.1 Hafen

- Küstengebäude mit gültiger Wasserzufahrt und einem landseitigen Warenanschluss.
- Bau, Lagerung, Be- und Entladung sowie Schiffsaufträge müssen physisch sichtbar sein.
- Ein Hafen darf keine Wasserroute anbieten, wenn sie durch Küste oder Inseln blockiert ist.

### 3.2 Werft und Schiffstypen

- Werft oder Hafen-Unterfunktion zur Herstellung von Schiffen.
- **Warenschiff:** transportiert definierte Warenmengen zwischen Häfen.
- **Truppentransporter:** transportiert Krieger und gegebenenfalls Spezialisten.
- **Kriegsschiff:** kämpft auf See und schützt Transportwege.
- Für jeden Typ: Baukosten, Bauzeit, Besatzung, Kapazität, Schaden, Reichweite, Reparatur und Verlustregeln festlegen.
- Be- und Entladung darf Waren oder Personen nie duplizieren; unterbrochene Fahrten müssen speicherbar sein.

## 4. Einzelspieler-Leuchtturm und KI-Inseln

- Ein eigener, klar erkennbarer **Erkundungsleuchtturm** erschließt eine weitere Inselwelt.
- Nach Fertigstellung beziehungsweise einem bestätigten Erkundungsauftrag wird eine neue, anders aussehende Insel erzeugt.
- Die Insel wird an einer freien, stabilen Weltposition relativ zur Heimatinsel platziert.
- Beispiel: Eine nordöstlich entdeckte KI-Insel bleibt dauerhaft nordöstlich und wechselt nach Neuladen oder einem späteren Multiplayer-Beitritt nicht ihre Position.
- Die Minikarte beziehungsweise Weltkarte erweitert ihren Ausschnitt und zeigt Inseln, Seewege, Häfen und Sichtbarkeit.

### 4.1 Fortschrittsabhängige Gegner-KI

- Keine reine Attrappe aus Turm und wenigen Soldaten.
- Beim Erzeugen wird der Fortschritt der eigenen Zivilisation bewertet, unter anderem anhand von:
  - Einwohnerzahl und Wohnraum,
  - Anzahl und Stufe der Produktionsketten,
  - vorhandenen Rohstoffen und Werkzeugen,
  - erkundetem Gebiet,
  - Militärstärke, Rängen und besetzten Türmen,
  - Häfen, Schiffen und bisheriger Spielzeit.
- Daraus entsteht eine vergleichbar entwickelte KI-Siedlung mit vollständiger Wirtschaft, Logistik, Bauplanung und Militär.
- Die KI entwickelt sich anschließend weiter und erhält keine unsichtbaren unbegrenzten Waren.
- Verschiedene Seeds, Küstenformen, Vegetation und Ressourcenverteilungen sorgen für unterschiedliche Inseln.
- Schwierigkeit und Aufholmechanik müssen begrenzt sein: glaubwürdiger Gegner statt exakter Kopie oder unfairer Ressourcenbeschaffung.

## 5. Multiplayer-Leuchtturm und gemeinsame Inselwelt

- Ein zweiter, größerer und optisch eindeutig anderer **Multiplayer-Leuchtturm** verbindet die eigene Insel mit einer gemeinsamen Welt.
- Die eigene bestehende Insel wird übernommen; Bauwerke, Waren und relative Nachbarinseln bleiben erhalten.
- Der Beitritt darf lokale KI-Inseln nicht verschieben oder überschreiben.
- Der Server weist dem gesamten bestehenden Inselverbund einen freien Bereich zu, statt nur die Heimatinsel einzeln neu anzuordnen.
- Andere Spieler erhalten eigene Inselverbünde in ausreichendem Abstand, ohne Überlappungen oder unerreichbare Seewege.
- Weltkoordinaten sind serverseitig stabil und für alle Beteiligten identisch.

### 5.1 Weltkarte und räumliche Konsistenz

- Lokale Inselpositionen werden als unveränderliche relative Koordinaten eines Verbunds gespeichert.
- Beim Multiplayer-Beitritt bekommt der Verbund lediglich einen globalen Ursprungspunkt.
- Beispiel: `globale Position = Ursprung des Spielerverbunds + lokale Inselposition`.
- Platzierung berücksichtigt Inselausdehnung, Sicherheitsabstand, Schifffahrtskorridore und bereits belegte Regionen.
- Weltkarte lädt entfernte Regionen stufenweise, ohne die komplette Welt permanent zu rendern.
- Unterschiedliche Inselgrafik und Landschaftsseeds bleiben deterministisch, damit alle Geräte dieselbe Welt sehen.

### 5.2 Live-Synchronisation

- Andere Spieler sehen relevante Änderungen zeitnah: Schiffe, Einheiten, Kämpfe, Gebäude, Warenübergaben und Nachrichten.
- Der Server ist maßgeblich für Besitz, Positionen, Ressourcen, Kampf und Handel; Clients dürfen diese Daten nicht selbst verbindlich festlegen.
- Ereignisbasierte Übertragung statt ständiger kompletter Spielstände.
- Sichtbarer Bereich und nahe Inseln erhalten häufigere Aktualisierungen; entfernte Regionen werden gröber simuliert.
- Interpolation auf dem Client hält Bewegungen flüssig, ohne extrem hohe Netz- oder CPU-Last.
- Wiederverbindung, Paketverlust, doppelte Ereignisse und Versionskonflikte benötigen feste Regeln.
- Handy und Laptop desselben Accounts dürfen nicht gleichzeitig widersprüchliche Befehle erzeugen.

### 5.3 Beitritt, Anwesenheit und Nachrichtenhinweise

- Beim Erscheinen eines neuen benachbarten Spielers erzeugt das Nachrichtensystem einen auffälligen Hinweis, beispielsweise „Eine neue Siedlung ist in deiner Nähe aufgetaucht“.
- Der Nachrichtenbutton zeigt große, gut erkennbare Ausrufezeichen für neue wichtige Ereignisse.
- Unterscheidung zwischen Information, Warnung, Angriff, Handel und diplomatischer Nachricht.
- Hinweise müssen anklickbar sein und zur betreffenden Insel, Einheit oder Position springen.
- Nur die letzten relevanten Nachrichten behalten; Spam zusammenfassen und wiederholte Ereignisse begrenzen.

## 6. Boten und Diplomatie

- Spieler können einen Boten mit einer kurzen Nachricht zu einer bekannten fremden Insel schicken.
- Der Bote startet sichtbar an einem passenden Gebäude oder Hafen, reist physisch und kann sein Ziel verfehlen beziehungsweise aufgehalten werden.
- Empfänger sehen Absender, Ankunftszeit und Nachricht im Nachrichtenmenü.
- Spätere Erweiterungen: Handelsangebot, Bündnisanfrage, Friedensangebot, Warnung und Geschenk.
- Missbrauchsschutz: Längenlimit, Rate-Limit, Blockieren/Stummschalten und serverseitige Inhaltsvalidierung.
- Private Kontaktdaten dürfen nicht automatisch offengelegt werden.

## 7. Leistung, Sicherheit und Betrieb

- Simulation in feste, messbare Teilsysteme zerlegen; keine vollständige Weltberechnung in jedem Renderframe.
- Inseln ohne aktive Spieler serverseitig mit reduzierter Frequenz oder ereignisbasiert fortschreiben.
- Sichtbare Animationen bleiben clientseitig, während spielentscheidende Ergebnisse serverseitig validiert werden.
- Räumliche Indizes für Einheiten, Inseln, Türme und Schiffe verwenden, damit Näheabfragen nicht alle Objekte durchsuchen.
- Obergrenzen für Einheiten, Schiffe, Nachrichten und offene Aufträge definieren.
- Netzwerkprotokoll versionieren und alte Clients kontrolliert ablehnen oder migrieren.
- Authentifizierung, Sitzungsprüfung, Berechtigungen und Rate-Limits für alle Multiplayer-Aktionen.
- Keine fremden Inselstände, E-Mail-Adressen, Sitzungen oder privaten Serverdaten in der öffentlichen Serverliste ausgeben.
- Regelmäßige Backups, atomare Speicherungen und Wiederherstellungstests einplanen.
- CPU-, Speicher- und Datenverkehrsbudgets für Server, Vercel-Variante, Laptop und Mobilgeräte messen.

## 8. Sinnvolle spätere Umsetzungsetappen

1. Die vier aktuellen UI-/Funktionsfehler aus Abschnitt 1 beheben.
2. Sichtbare Kasernenausbildung mit speicherbaren Zuständen fertigstellen.
3. Lokale Weltkoordinaten, mehrere Inseln und erweiterte Karte ohne Multiplayer entwickeln.
4. Hafen, Wasserwege und ein Warenschiff als kleinsten vollständigen Seefahrt-Vertikalschnitt bauen.
5. Erkundungsleuchtturm und eine echte fortschrittsabhängige KI-Insel ergänzen.
6. Serverautoritative Welt- und Ereignisstruktur entwickeln und Lasttests durchführen.
7. Multiplayer-Leuchtturm, stabilen Inselverbund-Beitritt und Live-Synchronisation aktivieren.
8. Truppentransporter, Kriegsschiff, Kampf, Handel, Boten und Diplomatie schrittweise ergänzen.

Jede Etappe braucht eigene Simulationstests, Speicher-/Migrationsprüfungen, Browserprüfungen auf Laptop und Mobilgerät sowie einen Test mit einer bereits bestehenden Insel. Multiplayer wird erst als fertig bezeichnet, wenn zwei getrennte Geräte dieselbe serverautoritativ gespeicherte Welt nach Verbindungsabbruch konsistent fortsetzen können.

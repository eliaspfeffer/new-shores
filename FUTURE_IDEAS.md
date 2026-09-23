# New Shores – Zukunfts-Backlog

Stand: 22. September 2026

> Dieses Dokument sammelt spätere Arbeiten und konkretisiert bereits umgesetzte Ausbaustufen. Der folgende Leuchtturm-/KI-Insel-Stand ist implementiert; weiterführende See- und Mehrspielersysteme bleiben Backlog.

## Umgesetzt: Leuchtturm und separate KI-Insel

- Die KI-Siedlung liegt nicht mehr in einem viereckigen Wassergraben auf der Heimatinsel. Bestehende 50×50-Spielstände werden kompatibel um einen verdeckten 72×72-Reserveozean erweitert.
- Vor Fertigstellung des Leuchtturms bleibt diese gesamte Zone vollständig schwarz. Normale Gebäude, Einheiten und Erkundung können sie nicht vorzeitig aufdecken; dadurch ist weder leeres Gelände noch eine vorab fehlende Insel sichtbar.
- Erst beim Leuchtturmabschluss wird abhängig vom Standort des Leuchtturms eine freie Stelle im unerforschten Reserveozean gewählt und dort eine eigenständige, annähernd runde Insel mit unregelmäßigem Küstenrand und umlaufendem Wasser erzeugt. Es liegt vorher keine fertige Gegnerinsel unter dem Nebel.
- Die Insel erhält Wald, Stein und zusätzliche Kohle-, Eisen-, Gold- und Schwefelvorkommen. Die Vorkommen bleiben geologisch unentdeckt, bis sie regulär untersucht werden.
- Bestehender KI-Außenposten und Soldaten werden auf die neue Insel versetzt; weitere Gebäude und Soldaten skalieren weiterhin etwas unterhalb der Spielersiedlung.
- Das Leuchtfeuer deckt die komplette Inselzone dauerhaft auf. Eine einzelne schmale, zum auslösenden Leuchtturm ausgerichtete Passage akzeptiert wahlweise Holzbrücke oder Fähre; ohne Überfahrt bleibt die Insel für die normale Wegsuche isoliert.
- [x] Jeder weitere fertiggestellte Erkundungsleuchtturm entdeckt eine freie, bislang unerforschte und unbeanspruchte Wasserzone. Jede Insel erhält eigene Rohstoffe und eine kleinere, lokal skalierte KI-Siedlung.
- [x] Unbekanntes Meer einschließlich der Fläche außerhalb der lokalen Kartenränder wird vollständig schwarz maskiert; nur aktiv sichtbare Felder schneiden den Nebel auf.
- Inselposition, Gelände, Rohstoffe, KI-Ausbau, Sichtbarkeit und Überfahrt werden gespeichert. Alte Spielstände ohne entdeckte KI-Insel erhalten weiterhin erst durch den Leuchtturm die neue Insel.
- [x] Schwertkämpfer können nach ausgeschalteter naher Verteidigung auch gegnerische Wirtschafts-, Wohn- und Lagergebäude direkt einnehmen. Waren und Produktionszustand bleiben physisch erhalten; Wohnhäuser übertragen ihre Kapazität und die neue Eigentümerschaft wird gespeichert.
- [x] Weit entfernte KI-Inseln erhalten eine gespeicherte, sichtbare Kette aus Landstegen bis zum Spielergebiet. Die einzelnen Wasserlücken lassen sich mit mehreren normalen Brücken oder Fähren überqueren; bestehende Inseln werden beim Laden nachgerüstet.

## Umgesetzt: Spielstand-Vorschauen und unterscheidbare Rohstofffelder

- Jeder neu gespeicherte Spielstand enthält ein kompaktes Kartenbild der momentan erforschten Welt. Nicht erkundete Felder bleiben darin schwarz; Gelände, Küsten, Gebäude, Bäume, Felsen und Rohstofffelder des sichtbaren Bereichs sind erkennbar.
- Die Vorschau wird bei jedem Speichern neu erstellt und direkt auf der jeweiligen Spielstandkarte gezeigt. Ältere Spielstände ohne Bild bleiben weiterhin ladbar.
- Steinbruchfelsen und Bodenschätze sind nun als eigene Comic-Silhouetten lesbar: heller Stein, schwarze Kohle, rostrot geädertes Eisenerz, goldene Quarzadern und gelber Schwefel. Die geologische Markeranzeige verwendet dieselben klaren Formen.

## 1. Aktuelle Fehler und UI-Nacharbeiten

### 1.1 „Auswahl aufheben“ auf dem Laptop

**[x] Umgesetzt und browsergeprüft:** Der Medaillon-Knopf leert Einheiten- und Gebäudeauswahl, Kartenkarte und Kontextstatus mit derselben Routine wie `Escape`.

- Der sichtbare Button hebt die aktuelle Auswahl derzeit nicht zuverlässig auf.
- `Escape` funktioniert als Umweg, darf aber nicht erforderlich sein.
- Spätere Abnahmekriterien:
  - Ein Klick leert Einheiten- und Gebäudeauswahl sofort.
  - Auswahlrahmen, Kontextaktionen, Gebäudekarte und Statuszeile verschwinden konsistent.
  - Gleiches Verhalten mit Maus, Touch und Tastatur.

### 1.2 Fehlende einheitliche Comic-Symbole

**[x] Für die spielrelevanten Daumen-Menüs umgesetzt:** „Auswahl aufheben“ verwendet das vorhandene Comic-Medaillon. Nahrung, Bergbau und Metall, Seefahrt, Grundberufe, Siedler finden, Spezialisten, Träger, Bauarbeiter, Pioniere, Geologen, Markieren, Ziel zuweisen, Halt und Rückkehr zum Träger verwenden nun eine gemeinsame neue Comic-Medaillonfamilie. Die Siedlersuche gruppiert Berufe und Spezialisten und kann damit beispielsweise alle Pioniere mit einem Knopf auswählen. Die doppelte Auswahlanzeige im hellen Desktop-Menü ist entfernt.

- [x] „Auswahl aufheben“ verwendet ein eigenes Comic-Medaillon anstelle des Hand-Emojis.
- [x] Spielrelevante Text-, Emoji- und generische Symbole der Daumen-Menüs inventarisiert.
- [x] Für die fehlenden Hauptaktionen passende Medaillons erstellt.
- [x] Größe, Rand, Lichtquelle, Druckzustand, Deaktivierung und Beschriftung auf Laptop und Mobilgerät vereinheitlicht.
- [x] Bereits vorhandene eigene Bilder bewahrt; neue Bildfamilie mit Referenz- und Promptvermerk dokumentiert.

### 1.3 Direkte Gebäudebefehle und Untermenüs

**[x] Umgesetzt:** Einfache Aktionen bleiben direkt; Kaserne, Waffen- und Bogenschmiede öffnen nur für Warteschlangen, Stückzahl und Produktionsauftrag ein Untermenü. Rohstoffe und Auftragsstand sind sichtbar.

- Einfache Gebäude behalten höchstens vier direkt sichtbare Befehle unten links und öffnen kein zusätzliches Einstellungsmenü.
- Untermenüs nur für tatsächlich komplexe Auswahlvorgänge, beispielsweise Rekrutierung oder die Wahl einer herzustellenden Ware.
- Waffenschmiede: Herstellungs-Untermenü fehlt beziehungsweise lässt sich noch nicht öffnen.
- Bogenschmiede: Herstellungs-Untermenü fehlt beziehungsweise lässt sich noch nicht öffnen.
- In beiden Schmieden sollen Auftrag, verfügbare Rohstoffe, Warteschlange und herstellbare Ware verständlich sichtbar sein.
- Keine doppelt vorhandenen Aktionen zwischen unterer Leiste und Dialog.

### 1.4 Zielbefehle starten teilweise erst beim zweiten Versuch

**[x] Umgesetzt und durch Strategietests abgedeckt:** Jeder berechtigten Einheit wird beim ersten Klick ein eigenes erreichbares Formationsziel zugewiesen; nicht erreichbare Einheiten werden gemeldet.

- Bei einer ausgewählten Gruppe laufen gelegentlich nicht alle Einheiten nach der ersten Zielzuweisung los.
- Erst eine zweite Zuweisung desselben oder eines anderen Ziels setzt die übrigen Einheiten in Bewegung.
- Später untersuchen, ob einzelne Einheiten wegen alter Laufwege, Arbeitszustände, Gruppenformationen, blockierter Startfelder oder einer vorzeitig geleerten Auswahl keinen Auftrag erhalten.
- Spätere Abnahmekriterien:
  - Jede berechtigte ausgewählte Einheit erhält den ersten gültigen Zielbefehl genau einmal.
  - Unerreichbare Einheiten werden sichtbar gemeldet, statt den Befehl still zu ignorieren.
  - Beschäftigte Siedler zeigen verständlich an, ob der Befehl sofort gilt oder nach Abschluss der aktuellen Tätigkeit ausgeführt wird.
  - Maus, Touch, gemischte Einheitengruppen und gespeicherte/neu geladene Gruppen verhalten sich identisch.

### 1.5 Ungültige Arbeitsbereiche unmittelbar farblich anzeigen

**[x] Umgesetzt:** Vorschau und Bestätigung verwenden dieselbe Prüfung. Gültige Punkte sind grüne Kreise, ungültige rote Rauten mit Kontur und Textgrund.

- Beim Festlegen eines Arbeitsbereichs, beispielsweise für einen Holzfäller, bleiben die Vorschaupunkte derzeit auch dann grün, wenn der gewählte Bereich außerhalb der zulässigen Reichweite liegt.
- Ungültige beziehungsweise nicht erreichbare Punkte sollen unmittelbar **rot** dargestellt werden, damit der Grund schon auf der Karte erkennbar ist und nicht erst aus einem Text gelesen werden muss.
- Gültige Punkte bleiben grün; der gerade anvisierte Mittelpunkt erhält zusätzlich eine eindeutige Kontur.
- Bei teilweise gültigen Bereichen werden die einzelnen Punkte getrennt bewertet: nutzbar grün, unzulässig rot.
- Mögliche Gründe wie zu große Entfernung, fremdes Gebiet, Wasser, blockierter Weg oder fehlende passende Ressource dürfen unterschiedliche Symbole oder kurze Hinweise erhalten, müssen aber mindestens durch Rot als ungültig erkennbar sein.
- Die Farbwahl benötigt neben Rot/Grün zusätzlich Form, Kontur oder Symbol, damit sie auch bei Rot-Grün-Sehschwäche verständlich bleibt.
- Spätere Abnahmekriterien:
  - Die Vorschau ändert sich ohne zusätzlichen Klick während Mausbewegung beziehungsweise Touch-Auswahl.
  - Ein ungültiger Punkt kann nicht versehentlich als gültiger Arbeitsbereich bestätigt werden.
  - Holzfäller, Förster, Steinmetz und alle weiteren Gebäude mit einstellbarem Arbeitsbereich verwenden dieselbe Logik.
  - Kartenzoom, mobile Ansicht und Laptop-Ansicht zeigen denselben Gültigkeitszustand.

### 1.6 „Siedler finden“ nach Kategorien statt Einzelpersonen

**[x] Umgesetzt:** Desktop und Mobil gruppieren standardmäßig nach Beruf/Einheit und zeigen Gesamt-, Aktiv- und Leerlaufzahl. Ein Klick markiert und fokussiert die Gruppe; einzelne Personen liegen in einer bewusst geöffneten Detailansicht.

- Das Menü listet derzeit einzelne Figuren wie „Holzfäller #0“ und „Holzfäller #4“ auf und wird bei größeren Siedlungen unnötig voll.
- Die erste Ebene soll stattdessen zusammengefasste Berufs- und Einheitengruppen zeigen, beispielsweise:
  - Holzfäller,
  - Förster,
  - Träger,
  - Bauarbeiter,
  - Bergleute nach Minentyp,
  - Schmiede nach Betrieb,
  - Pioniere und Geologen,
  - Schwertkämpfer, Bogenschützen und Sanitäter.
- Jede Kategorie zeigt die Anzahl der vorhandenen, aktiven und gegebenenfalls untätigen Siedler.
- Ein Klick auf „Holzfäller“ markiert alle eigenen Holzfäller gleichzeitig auf der Karte und passt den Kartenausschnitt so an, dass die Gruppe sinnvoll sichtbar ist.
- Die markierten Figuren erhalten eine deutliche gemeinsame Hervorhebung; ihre Arbeitsgebäude können optional mit markiert werden.
- Eine zweite, bewusst aufgerufene Detailstufe darf einzelne Personen anzeigen, falls später eine bestimmte Figur gesucht werden soll. Sie ist nicht die Standardansicht.
- Filter für „untätig“, „blockiert“, „unterwegs“ und „im Gebäude“ können die Kategorieansicht ergänzen, ohne die Hauptliste mit Einzelpersonen zu überladen.
- Spätere Abnahmekriterien:
  - Die Länge der ersten Menüebene hängt von den vorhandenen Kategorien ab, nicht von der gesamten Einwohnerzahl.
  - Eine Kategorieauswahl erfasst wirklich alle lebenden eigenen Siedler dieses Berufs, einschließlich momentan laufender oder im Betrieb befindlicher Personen.
  - Laptop- und Mobilansicht verwenden dieselbe Gruppierungs- und Auswahlregel.
  - Nach Schließen des Menüs bleibt die Gruppenauswahl sichtbar und kann direkt einen gemeinsamen Befehl erhalten, sofern der Beruf dies erlaubt.

## 2. Wuselfaktor, Abstand und Gruppenbewegung

**[x] Umgesetzt:** Räumlich begrenztes Ausweichen, natürliche Stellplätze sowie eine goldener-Winkel-Verteilung für Gruppen verhindern den gemeinsamen Zielpunkt. Weg- und Kampflogik bleiben davon getrennt; Speichern lädt gültige getrennte Positionen.

- Laufende Siedler und Soldaten dürfen nicht dauerhaft ineinander stehen oder optisch zu einer einzigen Figur verschmelzen.
- Einheiten sollen beim Gehen, Warten, Arbeiten und Ankommen kleine natürliche Abstände einhalten.
- Gruppen brauchen individuelle, leicht variierende Zielpositionen rund um den befohlenen Punkt statt eines gemeinsamen exakten Mittelpunkts.
- Begegnende Einheiten sollen einander weich ausweichen, ohne auf Wegen unnatürlich weit auseinanderzuspringen.
- Engstellen, Gebäudeeingänge, Baustellen und Be-/Entladepunkte brauchen Warteschlangen beziehungsweise kurzlebige Stellplätze.
- Das Ausweichen darf keine Sackgassen, Endlosschleifen oder starkes Zittern erzeugen.
- Kleine zufällige Standpositionen und dezente Leerlaufbewegungen erhöhen den Wuselfaktor, dürfen aber keine Arbeits- oder Kampfbefehle verändern.
- Formation und Kampfreichweite bleiben spielerisch verbindlich; die optische Streuung darf keine Treffer, Besitzprüfung oder Wegerreichbarkeit verfälschen.
- Die Berechnung soll räumlich begrenzt bleiben: nur nahe Einheiten berücksichtigen, damit große Siedlungen auf Handy und Laptop flüssig bleiben.
- Spätere Abnahmekriterien:
  - Eine größere Gruppe erreicht ihr Ziel verteilt und ohne sichtbare vollständige Überlagerung.
  - Gegenverkehr auf schmalen Wegen löst sich selbstständig auf.
  - Nach Speichern und Neuladen bleiben Einheiten an gültigen, getrennten Positionen und arbeiten weiter.
  - Die Änderung wird mit großen Zivilisten- und Militärgruppen auf Mobilgerät und Laptop auf Bildrate und CPU-Last geprüft.

## 3. Sichtbare Ausbildung in der Kaserne

**[x] Umgesetzt:** Rekrutierungen sind als speicherbare Warteschlange mit Ausbildungstakt, exakten Kosten, Abbruch, Pause und Sammelpunkt umgesetzt. Ein konkreter freier Träger wird reserviert, läuft sichtbar zum Eingang, verschwindet nur während der Ausbildung im Gebäude und verlässt dieselbe Kaserne als Soldat. Abbruch und Abriss geben den reservierten Träger verlustfrei am Eingang frei.

- Ein freier Siedler wird für einen konkreten Rekrutierungsauftrag reserviert.
- Er läuft sichtbar zur ausgewählten Kaserne und durch deren Eingang hinein.
- Erst nach absolvierter Ausbildungszeit werden Waffe und gegebenenfalls Gold verbraucht beziehungsweise endgültig gebucht.
- Derselbe Siedler verlässt die Kaserne sichtbar als gewählter Krieger und läuft zum Sammelpunkt.
- Kein zufälliges Erscheinen eines neuen Kriegers an einer beliebigen Position.
- Speichern und Neuladen muss jede Phase erhalten: unterwegs, im Gebäude, Ausbildung, Ausgang und Sammelpunkt.
- Abbruch, Abriss, blockierter Eingang und fehlende Ressourcen benötigen definierte, verlustfreie Zustände.

## 4. Seefahrt und neue Gebäude

**[x] Spielbarer Seefahrt-Vertikalschnitt:** Orientierte Holzbrücken und Fähren verbinden echte Wasserlücken. Zusätzlich gibt es Hafen und Werft mit eigener Comic-Grafik sowie frei fahrende Waren-, Truppen- und Kriegsschiffe. Bauaufträge, Kosten, Wasserwege, Ladung, Passagiere und laufende Fahrten werden gespeichert.

### 4.1 Hafen

**[x] Umgesetzt:** Der Hafen benötigt eine freie Küste, besitzt ein lokales Ziellager und bietet direkte Aufträge für priorisierte Waren, Massentransport naher Truppen und Botenboote. Ohne durchgängige Wasserroute startet kein Auftrag.

- Küstengebäude mit gültiger Wasserzufahrt und einem landseitigen Warenanschluss.
- Bau, Lagerung, Be- und Entladung sowie Schiffsaufträge müssen physisch sichtbar sein.
- Ein Hafen darf keine Wasserroute anbieten, wenn sie durch Küste oder Inseln blockiert ist.

### 4.2 Werft und Schiffstypen

**[x] Umgesetzt:** Die Werft reserviert Bretter und Eisen atomar und baut in einer gespeicherten Warteschlange Warenschiffe (64 Waren), Truppentransporter (40 Einheiten) und Kriegsschiffe. Schiffswerte, Bauzeit, Trefferpunkte, Geschwindigkeit, Reichweite und Schaden liegen zentral in `src/naval.js`. Unterbrochene Fahrten, Ladung und Passagierkennungen bleiben im Spielstand erhalten; Waren werden beim Start abgezogen und erst am Ziel gutgeschrieben.

**[x] Direkte Schiffssteuerung und physischer Personentransport:** Eigene Schiffe sind auf der Karte anklickbar und erhalten anschließend per Klick auf ein Wasserfeld ein gespeichertes Fahrziel. Ausgewählte freie Personen laufen zunächst zur Küste, verschwinden erst dort im Truppentransporter und laufen nach der Ankunft vom Schiff auf das Land. Kapazität, Wegfindung und unterbrochene Fahrten verhindern Doppelungen.

- Werft oder Hafen-Unterfunktion zur Herstellung von Schiffen.
- **Warenschiff:** transportiert definierte Warenmengen zwischen Häfen.
- **Truppentransporter:** transportiert Krieger und gegebenenfalls Spezialisten.
- **Kriegsschiff:** kämpft auf See und schützt Transportwege.
- Für jeden Typ: Baukosten, Bauzeit, Besatzung, Kapazität, Schaden, Reichweite, Reparatur und Verlustregeln festlegen.
- Be- und Entladung darf Waren oder Personen nie duplizieren; unterbrochene Fahrten müssen speicherbar sein.

## 5. Einzelspieler-Leuchtturm und KI-Inseln

- [x] Ein eigener, klar erkennbarer **Erkundungsleuchtturm** erschließt eine weitere Inselwelt.
- [x] Nach Fertigstellung beziehungsweise einem bestätigten Erkundungsauftrag wird eine neue, anders aussehende Insel erzeugt.
- [x] Die Insel wird an einer freien, stabilen Weltposition relativ zur Heimatinsel platziert.
- [x] Beispiel: Eine nordöstlich entdeckte KI-Insel bleibt dauerhaft nordöstlich und wechselt nach Neuladen nicht ihre Position. Multiplayer-Beitritt bleibt ein späteres Thema.
- Die Minikarte beziehungsweise Weltkarte erweitert ihren Ausschnitt und zeigt Inseln, Seewege, Häfen und Sichtbarkeit.

### 5.1 Fortschrittsabhängige Gegner-KI

**[~] Teilweise umgesetzt:** Jede entdeckte Insel erhält abhängig von Spielerfortschritt eine etwas schwächere, gespeicherte Siedlung mit Rohstoffen, Wirtschaftsgebäuden, Türmen und Militär. Ausbau und Gefechtsverhalten laufen weiter; eine vollständig physische KI-Warenwirtschaft ohne begrenzte Aufbauhilfen bleibt offen.

**[x] Eroberung umgesetzt:** Größere KI-Inseln besitzen umfangreiche Steinreserven. Sind alle gegnerischen Soldaten und Türme beseitigt, zieht ein eigener Schwertkämpfer am Siedlungsmast nach vier Sekunden die gegnerische Fahne ein und setzt die eigene. Danach wechseln sämtliche Inselgebäude und das Inselgebiet den Besitzer; Gebäude- und KI-Vorräte gehen verlustfrei ins Spielerinventar über. Die eroberte Kaserne rekrutiert keine Gegner mehr.

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

## 6. Multiplayer-Leuchtturm und gemeinsame Inselwelt

**[~] Produktionsfähiger Koop-Grundstand:** Konten können Inseln teilen, Einladungen und Rollen vergeben, atomar Waren senden, Anwesenheit live sehen, Nachrichten austauschen und neue Revisionen sofort übernehmen. Eine 45-Sekunden-Steuerlease verhindert widersprüchliche gleichzeitige Befehle von Handy und Laptop. Die globale räumliche MMO-Welt mit mehreren unabhängig gleichzeitig simulierten Völkern bleibt bewusst offen.

- Ein zweiter, größerer und optisch eindeutig anderer **Multiplayer-Leuchtturm** verbindet die eigene Insel mit einer gemeinsamen Welt.
- Die eigene bestehende Insel wird übernommen; Bauwerke, Waren und relative Nachbarinseln bleiben erhalten.
- Der Beitritt darf lokale KI-Inseln nicht verschieben oder überschreiben.
- Der Server weist dem gesamten bestehenden Inselverbund einen freien Bereich zu, statt nur die Heimatinsel einzeln neu anzuordnen.
- Andere Spieler erhalten eigene Inselverbünde in ausreichendem Abstand, ohne Überlappungen oder unerreichbare Seewege.
- Weltkoordinaten sind serverseitig stabil und für alle Beteiligten identisch.

### 6.1 Weltkarte und räumliche Konsistenz

- Lokale Inselpositionen werden als unveränderliche relative Koordinaten eines Verbunds gespeichert.
- Beim Multiplayer-Beitritt bekommt der Verbund lediglich einen globalen Ursprungspunkt.
- Beispiel: `globale Position = Ursprung des Spielerverbunds + lokale Inselposition`.
- Platzierung berücksichtigt Inselausdehnung, Sicherheitsabstand, Schifffahrtskorridore und bereits belegte Regionen.
- Weltkarte lädt entfernte Regionen stufenweise, ohne die komplette Welt permanent zu rendern.
- Unterschiedliche Inselgrafik und Landschaftsseeds bleiben deterministisch, damit alle Geräte dieselbe Welt sehen.

### 6.2 Live-Synchronisation

**[~] Für gemeinsames Inselspiel umgesetzt:** Server-Sent Events übertragen Anwesenheit, Nachrichten, Sperrstatus und neue Spielstandrevisionen. Besitz- und Revisionsprüfung erfolgen serverseitig. Bewegungen einzelner Figuren werden weiterhin als geprüfter Inselstand statt als hochfrequenter Ereignisstrom synchronisiert.

- Andere Spieler sehen relevante Änderungen zeitnah: Schiffe, Einheiten, Kämpfe, Gebäude, Warenübergaben und Nachrichten.
- Der Server ist maßgeblich für Besitz, Positionen, Ressourcen, Kampf und Handel; Clients dürfen diese Daten nicht selbst verbindlich festlegen.
- Ereignisbasierte Übertragung statt ständiger kompletter Spielstände.
- Sichtbarer Bereich und nahe Inseln erhalten häufigere Aktualisierungen; entfernte Regionen werden gröber simuliert.
- Interpolation auf dem Client hält Bewegungen flüssig, ohne extrem hohe Netz- oder CPU-Last.
- Wiederverbindung, Paketverlust, doppelte Ereignisse und Versionskonflikte benötigen feste Regeln.
- Handy und Laptop desselben Accounts dürfen nicht gleichzeitig widersprüchliche Befehle erzeugen.

### 6.3 Beitritt, Anwesenheit und Nachrichtenhinweise

**[x] Für freigegebene Inseln umgesetzt:** Das Kontofenster zeigt Live-Anwesenheit, Steuerstatus und die letzten typisierten Nachrichten (Nachricht, Handel, Warnung, Diplomatie), ohne E-Mail-Adressen offenzulegen.

- Beim Erscheinen eines neuen benachbarten Spielers erzeugt das Nachrichtensystem einen auffälligen Hinweis, beispielsweise „Eine neue Siedlung ist in deiner Nähe aufgetaucht“.
- Der Nachrichtenbutton zeigt große, gut erkennbare Ausrufezeichen für neue wichtige Ereignisse.
- Unterscheidung zwischen Information, Warnung, Angriff, Handel und diplomatischer Nachricht.
- Hinweise müssen anklickbar sein und zur betreffenden Insel, Einheit oder Position springen.
- Nur die letzten relevanten Nachrichten behalten; Spam zusammenfassen und wiederholte Ereignisse begrenzen.

## 7. Boten und Diplomatie

**[x] Umgesetzt:** Bekannte Mitspieler einer freigegebenen Insel können kurze typisierte Nachrichten senden; Länge, Berechtigung und Rate sind serverseitig begrenzt. Im Inselspiel kann ein Hafen zusätzlich ein physisches, gespeichertes Botenboot zur nächsten erreichbaren Gegnerinsel schicken. Die Nachricht erscheint erst bei Ankunft; das Boot bleibt als leichtes, angreifbares Seeobjekt sichtbar.

- Spieler können einen Boten mit einer kurzen Nachricht zu einer bekannten fremden Insel schicken.
- Der Bote startet sichtbar an einem passenden Gebäude oder Hafen, reist physisch und kann sein Ziel verfehlen beziehungsweise aufgehalten werden.
- Empfänger sehen Absender, Ankunftszeit und Nachricht im Nachrichtenmenü.
- Spätere Erweiterungen: Handelsangebot, Bündnisanfrage, Friedensangebot, Warnung und Geschenk.
- Missbrauchsschutz: Längenlimit, Rate-Limit, Blockieren/Stummschalten und serverseitige Inhaltsvalidierung.
- Private Kontaktdaten dürfen nicht automatisch offengelegt werden.

## 8. Leistung, Sicherheit und Betrieb

**[x] Produktionsbasis umgesetzt:** Sitzungen und Einmal-Token werden nur gehasht gespeichert; Schreibzugriffe prüfen Origin, Content-Type, Rolle, Revision und Größenlimits. Passwortprüfung, API-Aufrufe, Nachrichten und offene Streams sind begrenzt. Der Dienst läuft unprivilegiert, nur auf Loopback und mit erweitertem systemd-Sandboxing. Tägliche PostgreSQL-Sicherungen werden unmittelbar per `pg_restore --list` geprüft und 14 Tage aufbewahrt. Ein externer Penetrationstest und quantitative Langzeit-Lastmessungen bleiben naturgemäß fortlaufende Betriebsaufgaben.

## 9. Konten, Auffindbarkeit und heller Menüstil

- [x] Registrierung und Anmeldung mit gesalzenem Passwort-Hash und sicheren Sitzungs-Cookies.
- [x] E-Mail-Verifizierung und Einmal-Link zum Zurücksetzen, sobald `RESEND_API_KEY`, `MAIL_FROM` und `APP_ORIGIN` gesetzt sind; ohne Mailkonfiguration bleibt die bestehende Registrierung kompatibel statt Nutzer auszusperren.
- [x] Passwortänderung mit aktuellem Passwort, Widerruf anderer Sitzungen und passwortbestätigte Kontolöschung.
- [x] Konto-, Mehrspieler-, Start- und Befehlsoberflächen verwenden den hellen Pergament-/Holzstil; alte dunkle Dialogflächen wurden ersetzt.
- [x] Suchmaschinen-Grundlagen: kanonische URL, Sprachvarianten, Open Graph, strukturierte Videospiel-Daten, Sitemap, `robots.txt`, `llms.txt`, beschreibender Inhalt, FAQ und transparente Fanprojekt-Abgrenzung.
- [ ] Vollständiges deutsches Impressum und eine juristisch geprüfte Datenschutzerklärung ergänzen, sobald ladungsfähige Betreiberanschrift und gewünschte Kontaktangaben vorliegen. Diese Daten werden nicht erfunden.

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

## 10. Sinnvolle spätere Umsetzungsetappen

1. Die aktuellen UI-/Funktionsfehler aus Abschnitt 1 beheben.
2. Gruppenbefehle zuverlässig machen und kollisionsarme Wuselbewegung aus Abschnitt 2 entwickeln.
3. Sichtbare Kasernenausbildung mit speicherbaren Zuständen fertigstellen.
4. Lokale Weltkoordinaten, mehrere Inseln und erweiterte Karte ohne Multiplayer entwickeln.
5. Hafen, Wasserwege und ein Warenschiff als kleinsten vollständigen Seefahrt-Vertikalschnitt bauen.
6. Erkundungsleuchtturm und eine echte fortschrittsabhängige KI-Insel ergänzen.
7. Serverautoritative Welt- und Ereignisstruktur entwickeln und Lasttests durchführen.
8. Multiplayer-Leuchtturm, stabilen Inselverbund-Beitritt und Live-Synchronisation aktivieren.
9. Truppentransporter, Kriegsschiff, Kampf, Handel, Boten und Diplomatie schrittweise ergänzen.

Jede Etappe braucht eigene Simulationstests, Speicher-/Migrationsprüfungen, Browserprüfungen auf Laptop und Mobilgerät sowie einen Test mit einer bereits bestehenden Insel. Multiplayer wird erst als fertig bezeichnet, wenn zwei getrennte Geräte dieselbe serverautoritativ gespeicherte Welt nach Verbindungsabbruch konsistent fortsetzen können.

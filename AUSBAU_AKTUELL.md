# Aktueller Ausbau – 13. September 2026

Dieser Stand ergänzt und überholt Teile von STRATEGIE_AUSBAU.md, BEDIENUNG_UPDATE.md und dem historischen Feature-Audit. Der Gesamtauftrag „alles fertig“ ist **nicht abgeschlossen**. macOS-Verpackung und Leistungsmessungen wurden ausdrücklich ausgeklammert und nicht durchgeführt.

## Eroberungsfolgen für zivile Gebäude und physische Warenbergung

- Neue optionale Regel im Pausenmenü: „Zivile Gebäude bei Gebietsverlust zerstören“. Standard **aus**, auch für bestehende Spiele. Einschalten erfordert Bestätigung und legt eine in der Speicherbibliothek ladbare „Sicherung vor den Eroberungsfolgen“ an. Bereits auf feindlichem Gebiet stehende zivile Gebäude werden nach Bestätigung ebenfalls erfasst; keine stillschweigende Migration.
- Betriebe, Lager, Wohnhäuser und Baustellen auf tatsächlich feindlich besessenem Gelände werden entfernt. Hauptlager und Türme sind ausgenommen. Reiner Verlust ins neutrale Gebiet zerstört nichts. Die Regel gilt für eigene und feindliche Zivilgebäude; mehrere schützende Gebietseinflüsse werden über die bestehende Gebietsberechnung berücksichtigt.
- Baustoffrückgabe wie beim bisherigen Abriss (50 % verbaut, abgerundet); unbenutzte Reserven, Eingangs-/Lagerbestände und fertige Ausgangswaren bleiben als physische Haufen zurück. Kein Sofortbonus ins Hauptlager. Nicht darstellbare importierte Sonderbestände verhindern die Zerstörung des betreffenden Gebäudes, statt gelöscht zu werden.
- Betroffene Facharbeiter und Bau-/Transportarbeiter verlieren ihre Gebäudeaufträge, nicht ihr Leben oder ihre Eigentümerschaft. Werkzeuge und wirkliche Fracht liegen am jeweiligen Ort; noch nicht abgeholte Reservierungen am Abholort. Rein dargestellte Innenraumwaren werden nicht doppelt gezählt. Fremde Zivilisten bedienen nicht die eigene Wirtschaft. Patienten-/Soldatenbefehle, Besatzungen, Facharbeiter- und Lagerindizes werden korrigiert. Der Verlust fertiggestellter eigener Wohnhäuser entfernt deren vier Wohnplätze.
- Eigene freie Träger bergen erreichbare Haufen ausschließlich über eigenes Gebiet. Laden während der Bergung und spätere Gebietsrückeroberung bleiben möglich. Eingeschaltete Eroberungsfolgen benötigen Spielstandversion **8**; alte Versionen 1–7 bleiben lesbar, ältere Clients müssen vor Version 8 aktualisiert werden. Der Server und Warenlieferungen unterstützen Version 8 ohne Rückstufung.
- **Eigene Annäherung:** keine vollständigen Original-Eroberungs-/Obdachlosigkeitsregeln, Brand-/Einsturz-/Fluchtanimationen oder wirtschaftlich bergende Gegner. Keine neuen Rasterassets; vorhandene eigene Warenbilder weiterverwendet. Die Regel bleibt unabhängig vom freiwilligen Abriss-Schalter.

Referenz: [Originalhandbuch, Kapitel 8 und 9](https://manualmachine.com/gamespc/thesettlersiv/1119087-user-manual/) beschreibt den Verlust ziviler Betriebe und zurückbleibende Rohstoffe nach Eroberung sowie Wohnraumverlust. Die obigen Ausnahmen und Mengen sind eigene Implementierungsregeln. Verifikation: 35 Node-Tests, separate Simulation/Strategie, Build, PostgreSQL-API-/Lieferungstests. Isolierte Desktop-/667×375-Touch-Läufe kämpfen gegen eine echte Turmbesatzung, erobern den Turm, prüfen Lagerverlust, Sicherung, Warenbilanz und Bergung über Reload. Screenshots visuell geprüft; persönlicher Spielstand unverändert.

## Asynchrone Warenlieferungen zwischen Serverinseln

- Konto & Inseln → Warenlieferungen: Besitzer können 1–100 Standardwaren aus ihrem Hauptlager an eine andere freigegebene Insel senden. Die Zielinsel muss Lieferungen ausdrücklich einschalten; eine angenommene Einladung ist zusätzlich erforderlich. Ansicht genügt zum Liefern, berechtigt aber nicht zum Abbuchen fremder Bestände.
- Abbuchung, Ziel-Warenhaufen, beide Spielstandversionen und Historie werden in einer Datenbanktransaktion geändert. Eine gespeicherte Auftragskennung verhindert doppelte Buchungen bei Wiederholung nach Verbindungsabbruch.
- Lieferplätze werden auf freiem, erreichbarem eigenem Gelände nahe dem Hauptlager gesucht. Empfängerbestände steigen erst nach echter Abholung und Lagerankunft durch Träger. Kein Platz oder unzureichender Bestand: keine Teilbuchung.
- Empfänger müssen die neue Serverfassung laden. Ältere lokale Fassungen werden durch Versionskonflikte am Überschreiben gehindert. Ungeklärte Sendungen halten die Synchronisierung an und können sicher erneut geprüft werden. Die letzten Sendungen sind im Kontomenü einsehbar.
- **Eigene asynchrone Geschenkregel, kein originalgetreuer Echtzeit-Handel:** Schiffe, Esel, Reisezeiten, Tauschangebote und gemeinsame Nachbarinseln bleiben offen. Lieferungen benötigen Netzwerk und erzeugen Spielstandversion 7.
- Geprüft: 34 Node-Tests, Simulation, Strategie, Build, PostgreSQL-Transaktionstests sowie zwei getrennte Konten auf Desktop und 667×375-Touch. Absichtlich verlorene Versandantwort, einmalige Abbuchung, Empfänger-Konfliktschutz, physische Abholung und genau ein Beleg bestanden. Nur erfasste QA-Konten wurden anschließend entfernt.

## Bodenwaren: echte Bergung nach freiwilligem Abriss

- Pausenmenü → „Abrissmaterial von Trägern bergen“. Standard bleibt **aus**, auch für bestehende Spiele. Nur künftige Abrisse wechseln zwischen bisheriger Sofortgutschrift und Bodenwaren. Bereits liegende Waren werden auch nach Ausschalten fertig abgeholt.
- Gleiche Rückgabemengen wie bisher: verbautes Material anteilig, unbenutzte Waren/Werkzeuge vollständig. Standardwaren liegen am ehemaligen Gebäudeplatz statt sofort im Lager zu erscheinen. Nicht standardisierte/fractionale importierte Altbestände bleiben zur Erhaltung direkt gutgeschrieben; keine Bestände absichtlich gelöscht.
- Bis zu zwei freie eigene Träger übernehmen reservierte Einzelwaren. Keine doppelte Reservierung der letzten Ware; sichtbare Fracht erst nach tatsächlicher Abholung. Wege und Lager müssen erreichbar sein und durch eigenes Territorium führen. Werkzeug-/Baustoffwaren gehen wie bisher ins Hauptlager, geeignete Produktionswaren ins nächste annehmende Lager.
- Bestand wird am Haufen bei Abholung abgezogen und erst bei tatsächlicher Lagerankunft gutgeschrieben. Blockierte Rückwege warten mit Fracht; Lagerrückbau führt zur Neuplanung. Noch nicht abgeholte Aufträge lassen sich durch ein manuelles Ziel unterbrechen. Falls ein Bergungsträger stirbt, bleibt seine Ware am Standort liegen.
- Haufen erscheinen mit den vorhandenen eigenen Warenbildern und Mengenanzeige; Anklicken ohne Einheitenauswahl nennt den Inhalt. Bauplatzprüfung, Förster-/Feldplanung und Starthilfe lassen Bodenwaren frei. Transportwege bilden Laufspuren. Pile-/Auftragsdaten werden mitgespeichert.
- Aktive Bergungsregel, Haufen oder laufende Bergungsfrachten verwenden Spielstandversion **7**. Alte Versionen 1–6 bleiben lesbar; ältere Spielclients müssen aktualisiert werden, bevor sie Version 7 laden können. Ohne neue Zustände bleiben Speicherstände Version 6.
- **Noch offen:** sonstige frei abgelegte Waren, Diebe und Handelsrouten/Esel. Optionale Zerstörung ziviler Gebäude nach Gebietsübernahme ist inzwischen ergänzt, siehe oben. Eigene Begrenzung auf zwei Träger/eine Ware und der Opt-in-Schalter sind keine verifizierten Originalregeln.

Referenz: [Originalhandbuch, Kapitel 6 und 8](https://manualmachine.com/gamespc/thesettlersiv/1119087-user-manual/) beschreibt automatische Träger und wiederverwendbare Materialien nach Gebäudeverlust; Bildabgleich in `GRAPHICS_REFERENCE.md`. Prüfung: 33 Node-Tests, Simulation/Strategie/Build, integrierte Mengenbilanz und Speichern mitten in Abholung/Rücktransport, blockierte Wege, Lagerrückbau, Reservierung, Tod/Neuzustellung. Desktop-/667×375-Touch-Kernloop über echten Abriss, Haufen, Umschalten, Reload und vollständige Lieferung bestanden. Persönliche Spielstände nicht verändert.

## Privater Server, Konten, Insel-Freigaben und aufgeräumte Siedlerbedienung

- Getrennter Dienst auf `openclaw`, HTTPS-Tailscale-Port 9444, eigene Datenbank/Rolle im vorhandenen PostgreSQL. Health-App bleibt auf ihrem bisherigen Port/Dienst und ihrer Datenbank. Kein öffentlicher Funnel, kein Clerk-/OMS-Credential-Recycling.
- Eigene E-Mail-/Passwort-Konten, Registrierung, serverseitige Sitzungen und gesalzene scrypt-Passwort-Hashes. Der persönliche localhost:4176-Export ist im Konto als „Seenland · vom Mac übertragen“ vorhanden; die ursprüngliche Siedlung blieb pausiert und unverändert.
- Serverinseln speichern/laden, Online-Autosync alle 30 Sekunden für explizit gebundene Inseln, manuell bestätigte Synchronisierung, Offline-Weiterarbeit, Konfliktstopp statt Überschreiben neuerer Fassungen, fünf vorherige Serverversionen und lokale Sicherung vor Inselwechsel. Lokale Imports/Neustart trennen die Serverbindung.
- Einmalige Einladungscodes, sieben Tage gültig, Ansicht oder Bearbeitung, Besitzerübersicht mit entziehbaren Freigaben. **Asynchrones gemeinsames Weiterspielen, noch kein gleichzeitiger Echtzeit-Mehrspieler.** Freunde benötigen zusätzlich passend beschränkten Tailscale-Zugang.
- Siedler-Unterbereiche Ausbilden/Finden/Befehle/Militär mit Symbolen; vorhandene Siedlergrafiken bleiben erhalten. Suche nach Namen/Beruf/Nummer, direkte Auswahl und Kamerafokus für Pionier, Geologe usw. Befehle abhängig von passender Auswahl; Langtexte unter Bedienungshilfe. Keine neue Rastergrafikfamilie oder Originalidentität behauptet.
- **Weiter offen aus dem Server-/Freunde-Auftrag:** benachbartes Insel-Spawning auf gemeinsamer Karte, getrennte menschliche Spielerwirtschaften in synchroner Simulation, Freundschaft/Diplomatie, Echtzeit-Handelsrouten, E-Mail-Verifizierung/-Passwortwiederherstellung und regelmäßige externe Datenbank-Backups. Asynchrone Gütersendungen sind oben beschrieben. Registrierung/Freigaben ersetzen diese Systeme nicht.

Betrieb und Grenzen: `SERVER_BETRIEB.md`. Prüfung: 32 Node-Tests, Simulation, Strategie, Build; echter PostgreSQL-API-Test mit isoliertem Testschema; Desktop-/667×375-Touch-Browserläufe für Registrierung/Login, Inseltransfer zwischen Geräten, Autosave-Konfliktstopp, Offline-Reload und Spezialistenmenü. Temporäre QA-Konten/Inseln anschließend entfernt. Kein Test hat den persönlichen Server-Spielstand verändert. Ältere Aussagen unten zu ausschließlich lokalen Spielständen werden durch diesen Abschnitt überholt.

## Anfängerkarte: erreichbare Startversorgung und Reparatur laufender Spiele

- Fehlerursache: Die klassische Karte platzierte Stein nur an drei weit entfernten Felsgruppen. Anders als die neuen Seed-Karten besaß sie keine garantierte Steinversorgung innerhalb des Startterritoriums.
- Neue klassische Spiele prüfen nun nach der Gebietsberechnung Holz und Stein samt freien Bauplätzen im Umkreis von acht Feldern des Hauptlagers. Fehlende Steine werden als ein endliches Vorkommen mit 80 Einheiten ergänzt, fehlendes Holz als kleine Baumgruppe. Bau- und Abbauwege müssen vollständig durch eigenes Gebiet führen; die vorgeschlagenen Betriebsstandorte werden bei der Prüfung gegenseitig als Hindernisse berücksichtigt.
- Keine vorhandenen Bäume, Felsen, Gebäude, Wege, Felder oder Arbeiter werden entfernt/verschoben. Aktuelle Laufwege und Arbeitsziele werden für neue Platzierungen ausgespart. Neue Seed-Karten behalten ihre vorhandenen Startvorräte; deren Eigentum/Bauzugang wird mitgeprüft.
- **Bestehendes Spiel ohne Neustart:** Pausenmenü → „Einmalige Starthilfe: Holz & Stein im eigenen Gebiet“. Erst nach Bestätigung werden fehlende erreichbare Rohstoffe ergänzt. Das Lager erhält mindestens 14 Bretter und 6 Stein sowie je eine Axt, Spitzhacke, Säge und einen Hammer, damit Holzfäller, Steinmetz, Sägewerk und Förster auch nach aufgebrauchten Anfangsvorräten gebaut/besetzt werden können. Höhere vorhandene Bestände werden nicht reduziert. Dies ist eine ausdrücklich eigene Reparatur-/Starthilferegel, kein Originalspielmechanismus.
- Vor der Hilfe wird eine separate Sicherung angelegt, in der Speicherbibliothek als „Sicherung vor der Starthilfe“ ladbar. Die einmalige Nutzung wird gespeichert. Gibt es keine geeigneten freien eigenen Flächen für beide Betriebe, werden Ergänzungen zurückgenommen und die Hilfe bleibt unbenutzt. Ausgebautes oder erschöpftes Gelände wird nicht bei jedem Laden automatisch aufgefüllt.
- Kein persönlicher Browser-Spielstand wurde direkt verändert. Die Hilfe muss im betroffenen Spiel bestätigt werden; vorhandene Arbeitskräfte und freie eigene Bauflächen bleiben Voraussetzung.

Prüfung: 31 Node-Testsuiten, separate Simulation/Strategie und Build bestanden. Neuer isolierter Desktop-/Touch-Browserlauf bestätigt nahen Stein auf der klassischen Karte, repariert einen alten Stand ohne eigene Steine und ohne Baumaterial/Werkzeuge, baut den Steinmetz am vorgeschlagenen Platz und wartet auf echte Steinlieferungen. Erhalt der Gebäude/Wege, separate ladbare Sicherung, einmalige Nutzung und Reload geprüft; Darstellung visuell angesehen. Keine persönliche Speicherung geändert.

## Kartenwahl und reproduzierbare Seed-Landschaften

- Vor einer neuen Siedlung stehen **Klassische Karte**, **Waldküste** und **Seenland** zur Auswahl. Die klassische Landschaft bleibt erhalten und wurde inzwischen um eine geprüfte Startversorgung ergänzt, siehe oben. Die beiden neuen Typen erzeugen aus einem ganzzahligen Seed (0–4294967295) unterschiedliche Wald-/Felsverteilungen, Küsten und beim Seenland einen zusätzlichen See. „Neuen Seed würfeln“ wählt einen neuen Wert; gleicher Typ und Seed reproduzieren die Ausgangslandschaft. Nicht jeder Neustart würfelt automatisch.
- Alle Karten bleiben 50 × 50 Felder groß. Hauptlager, Startarbeiter, Gegneraußenposten und die vier Bodenvorkommen behalten vorerst feste Ankerpositionen und Mengen. Freigehaltene Laufkorridore, Starterholz/-stein und erreichbare Ufer sichern die bestehende Wirtschafts- und Eroberungslogik. Die Korridore sind keine vorgefertigten Straßen; Laufspuren entstehen weiterhin durch Transporte.
- Seed und Kartentyp stehen im Pausenmenü und werden zusammen mit den tatsächlichen Geländefeldern, Bäumen, Steinen und nun auch Landschaftsdetails gespeichert. Beim Laden wird die gespielte Welt übernommen, **nicht neu generiert**. Alte Spielstände ohne Kartenmetadaten bleiben lesbar und behalten ihre gespeicherte Landschaft.
- Kartenwechsel läuft über „Speichern & Hauptmenü“, neue Auswahl und bestätigten Neustart. Der bisherige Stand bleibt unter der bestehenden Vor-dem-Laden-Sicherung erhalten. Ungültige Seeds verhindern den Start. Desktop und mobiles Querformat besitzen dieselben funktionalen Steuerelemente.
- Beim visuellen Prüfen wurde die alte Ein-Küstenlinien-Annahme entdeckt: getrennte Seen wurden durch einen falschen Wasserstreifen über Land verbunden. Neue Karten zeichnen nun nur tatsächliche Land-Wasser-Grenzen. Bestehende eigene Texturen weiterverwendet, keine Rasterassets ersetzt; [visuell geprüfte Originalreferenz und verbleibende Grafikabweichungen](GRAPHICS_REFERENCE.md).

Die Layouts sind eigene Generatorregeln, keine Originalkarten. Höhen/Gebirge, Planierung, natürliche weiche Uferübergänge, Größenwahl, Insel-/Schiffskarten, frei variierende Start-/Mineralpositionen, Karteneditor und vollständige Gefechtskonfiguration bleiben offen.

Prüfung: 30 Node-Testsuiten, separate Simulation/Strategie und Produktionsbuild bestanden. 166 generierte Karten prüfen deterministische Unterschiede, freie Startanker, erreichbare Holz-/Steinvorräte, Vorkommen, Gegner und Angelufer. Isolierte Desktop-/667×375-Touch-Browserläufe bauen auf einer neuen Seed-Karte tatsächlich Holzfäller und Steinmetz, warten auf Warenlieferung, laden dieselbe Landschaft wieder und wechseln mit Sicherung auf einen anderen Kartentyp. Bestehende Speicherbibliothek-/Menüregressionen ebenfalls auf beiden Ansichten bestanden. Darstellung nach Uferkorrektur visuell geprüft; keine persönlichen Spielstände verwendet, keine Leistungsmessung oder echte iPhone-Hardwareprüfung.

## Optionale gegnerische Turmangriffe

- Im Pausenmenü separat einschaltbar; bei neuen und alten Spielständen zunächst aus. Die Verteidigungs-KI muss ebenfalls eingeschaltet sein. Abschalten beendet laufende Angriffe mit einem Rückweg statt mit Teleportation.
- Alle 60 Simulationssekunden prüfen vorhandene gesunde, untätige gegnerische Schwertkämpfer/Bogenschützen nahe Türme. Garnisonen werden nicht ausgehoben, keine Soldaten oder Waffen erzeugt. Ein Trupp umfasst höchstens sechs erreichbare Feldsoldaten und benötigt mindestens einen Schwertkämpfer.
- Ziele müssen höchstens acht Felder von einem beteiligten Feldsoldaten entfernt sein. Die eigene vereinfachte Stärkeabschätzung berücksichtigt Besatzung und Feldverteidiger im Fünffeldradius. Keine Sichtstrahlprüfung, kein historisch verifizierter KI-Algorithmus.
- Soldaten erhalten wirkliche Laufaufträge. Schwertkämpfer verwenden die bestehende Besatzungs-/Eroberungslogik; Bogenschützen begleiten sie und kämpfen mit vorhandenen Geschossen gegen Feldsoldaten. Nach Eroberung kann der Schwertkämpfer einziehen; übrige Angreifer laufen zum Ausgangspunkt zurück.
- Unter 30 % Gesundheit, bei zerstörtem/erobertem Ziel oder nach 90 Sekunden Einsatz erfolgt Rückzug ohne eigene Gegenangriffe. Ein unerreichbarer Rückweg lässt die Einheit stehen. Ausgangspunkt, Zielkoordinaten, Einsatzphase und Planungszeit werden gespeichert und validiert. Zielkoordinaten verhindern verwechselte Ziele nach Abriss anderer Gebäude.
- Dies ist begrenzte Angriffsplanung mit einer endlichen Armee, **keine wirtschaftlich aufbauende Gegner-KI**. Gegnerische Rekrutierung, Nachschub, Aufklärungsgedächtnis, koordinierte Belagerungsformationen und Diplomatie bleiben offen. Keine Assets ersetzt.

Referenz: [Originalhandbuch, 6.4](https://manualmachine.com/gamespc/thesettlersiv/1119087-user-manual/) beschreibt direkte Angriffe auf militärische Gebäude sowie Gruppen. Auswahlheuristik, Zahlenwerte und Zeitgrenzen oben sind eigene Spielregeln, keine Rekonstruktion der Original-KI.

Prüfung: 29 Node-Testsuiten, separate Simulation/Strategie und Produktionsbuild bestanden. Isolierte Desktop- und 667×375-Touch-Browserläufe prüfen echte Annäherung, Eroberung/Besetzung, unveränderte Soldatenzahl sowie Menüschalter und Reload; beide Ansichten visuell geprüft. Ein dabei entdeckter Rückzug vor dem Einquartieren wurde korrigiert und als Regressionstest ergänzt. Persönliche Spielstände unangetastet. Der Gesamtausbau bleibt offen.

## Turmverteidigung und Kämpfe gegen Besatzungen

- Bogenschützen können wie Schwertkämpfer eigene Türme besetzen und damit Gebiet sichern. Die bestehende Kapazitätsgrenze gilt für die gemischte Besatzung.
- Stationierte Bogenschützen schießen echte, zeitlich fliegende Geschosse auf nahe gegnerische Feldsoldaten. Schäden entstehen erst beim Einschlag; tote oder inzwischen einquartierte Ziele werden verworfen.
- Im Turmmenü lässt sich das automatische Feuer einstellen und wieder freigeben. Bereits fliegende Pfeile bleiben unterwegs. Einstellung und Abklingzeit bleiben gespeichert.
- Beim Sturm eines gegnerischen Turms kämpfen Schwertkämpfer zuerst gegen die tatsächlich vorhandenen Besatzungsmitglieder. Verteidiger schlagen zurück; Verluste reduzieren Besatzung und Territorialwirkung. Erst danach greift die bisherige Gebäude-Eroberungsphase. Der Sieger kann anschließend einziehen.
- Der reine Marschbefehl löst keinen Sturmangriff aus. Bogenschützen können Türme besetzen und von außen unterstützen, führen in dieser Annäherung aber keine Sturmangriffe aus.
- Neue Spiele enthalten einen tatsächlichen Bogenschützen im gegnerischen Startturm. Alte Spielstände werden nicht um zusätzliche Einheiten ergänzt: historische, nur als Zähler gespeicherte Besatzungen behalten ihre bisherige vereinfachte Gebäude-Verteidigung.

Referenz: [Originalhandbuch, Kapitel 13.2.1–13.2.2](https://manualmachine.com/gamespc/thesettlersiv/1119087-user-manual/) beschreibt die Besetzung durch Schwertkämpfer/Bogenschützen und den geschützten Fernkampf aus Türmen. Reichweite fünf Felder, Schussabstand 1,5 Sekunden, Schadenswerte und die verbleibende Gebäude-HP-Phase sind eigene Annäherungen. Keine originalidentische Belagerungssimulation, keine Burgen/großen Türme, keine Sichtstrahlprüfung und keine neue Garnisonsgrafik.

Prüfung: 28 Node-Testsuiten, separate Simulation/Strategie, Produktionsbuild und isolierte Desktop-/Touch-Browserprüfungen für tatsächlichen Pfeilschaden, Feuerpause und Reload. Der Sturmtest prüft Verteidigerverlust, Gegenwehr, Marschschutz, Eroberung und anschließende Besetzung. Darstellung visuell geprüft; persönliche Spielstände nicht benutzt. Der Gesamtauftrag bleibt unvollständig.

## Gegnerische taktische Verteidigung

Lazarett und Vollheilung waren bereits implementiert; dieser Lauf ergänzt stattdessen die bislang passiven gegnerischen Feldsoldaten.

- Gegnerische Soldaten erkennen gegnerische Militärkräfte bis acht Felder Entfernung, verfolgen sie mit realen Laufwegen und kämpfen mit der bestehenden Nahkampf-/Geschosslogik.
- Ihr gespeicherter Ausgangspunkt begrenzt die Verfolgung: Ziele jenseits von zwölf Feldern zum Ausgangspunkt werden nicht verfolgt. Nach Kontaktverlust wird höchstens vier Entscheidungsintervalle lang die letzte bekannte Position geprüft, danach kehren sie zurück. Ohne Bedrohung stehen sie still.
- Bogenschützen versuchen Abstand zu halten; stark Verwundete ziehen sich zum Ausgangspunkt zurück. Keine kostenlose Heilung, keine neuen Einheiten oder Ressourcen.
- Reaktion höchstens einmal pro Simulationssekunde je Gegner. Unpassierbare Wege lösen keine Teleportation aus. Rückzug und Abstandhalten unterbrechen das eigene Feuern zugunsten der Bewegung.
- Im Pausenmenü über „Gegnerische Verteidigungs-KI“ abschaltbar. Einstellung, Ausgangspunkt, letzte bekannte Position und laufender Auftrag bleiben im Spielstand erhalten. Abgeschaltete KI beendet ihre Bewegungsaufträge beim Fortsetzen.
- Die neue Bewegungsphase verwendet vorhandene Richtungs-/Laufbilder und Bewegungsgeräusche. Keine Grafiken ersetzt.

Referenz: [Originalhandbuch, 6.4 und 13.2.2](https://manualmachine.com/gamespc/thesettlersiv/1119087-user-manual/) beschreibt Wache/Patrouille und Bogenschützen als Distanzkämpfer. Wahrnehmungsradius, Verfolgungsgrenze, Rückzugsgrenze von 30 % und Suchdauer sind **eigene, nicht originalverifizierte Regeln**. Wahrnehmung verwendet Entfernung, keine Sichtstrahlprüfung hinter Hindernissen.

Dies ist ein taktisches Verteidigungsmodul, **keine vollständige Gegner-KI**: Wirtschaftsausbau, Rekrutierung, koordinierte Großangriffe, gegnerische Gebäudeeroberung, Spezialistenangriffe und Diplomatie bleiben offen. Es werden nur bereits vorhandene Feldsoldaten gesteuert.

Prüfung: 27 Node-Testsuiten, separate Simulation/Strategie, Produktionsbuild und isolierte Desktop-/Touch-Browserprüfungen für echte Annäherung, Speicherung, Abschalten und Reload. Darstellung visuell geprüft; persönliche Spielstände unangetastet. Fortsetzung bleibt aktiv, da die Großsysteme weiterhin fehlen.

## Zehn ergänzte Wirtschafts-, Militär- und Bedienfunktionen

1. **Kasernenwarteschlangen:** Bis 20 Aufträge mit jeweils 1–20 Schwertkämpfern, Bogenschützen oder Sanitätern, Rang 1–3. Nach acht Simulationssekunden wird ein erreichbarer freier Träger mit den vorhandenen Rekrutierungsregeln umgewandelt. Waffen/Gold werden erst dann abgezogen; Anhalten, fehlende Waren, Trägerreserve oder unerreichbarer Eingang blockieren den nächsten Abschluss. Abbrechen kostet keine Waren. Die direkte Sofortausbildung bleibt zusätzlich erhalten.
2. **Sammelpunkte:** Pro Kaserne ein erkundeter, begehbarer und vom Eingang erreichbarer Punkt über X/Y-Eingabe. Neu ausgebildete Warteschlangen-Soldaten laufen von ihrer aktuellen Position über den Kaserneneingang zum Ziel; keine Teleportation. Ist der Weg später blockiert, bleiben sie am Eingang. Innenraum-Ausbildungsanimation und Zielwahl durch Kartenklick sind noch offen.
3. **Turmkapazität:** Neue Besatzungen sind auf drei Schwertkämpfer begrenzt. Überschüssige Ankömmlinge bleiben draußen. Bestehende alte übervolle Besatzungen werden nicht gelöscht; der Grenzwert ist eine eigene Regel.
4. **Einzelne Besatzungsmitglieder entlassen:** Im Turmmenü namentlich/mit Kennung auswählbar. Der Soldat erscheint am Eingang, Besatzung und Territorialwirkung werden aktualisiert.
5. **Armeeübersicht:** Eigene lebende Soldaten einschließlich Garnisonen, mit Kennung, Zustand und Lebenspunkten. Anklicken zentriert die Karte und wählt den Soldaten bzw. seinen Turm.
6. **Untätige Siedler finden:** Übersicht wirklich freier Träger sowie angehaltener Geologen/Pioniere, mit Auswahl und Kamerasprung. Träger mit Aufträgen, Ladung oder Arbeitgeber erscheinen nicht als frei.
7. **Meldungsjournal:** Die letzten 100 Hinweise mit Spielzeit; direkt aufeinanderfolgende gleiche Meldungen werden zusammengefasst. Im Siedler- und Pausenmenü erreichbar und im Spielstand enthalten. Es protokolliert vorhandene Hinweise, keine zusätzliche vollumfängliche Ereignisdiagnose.
8. **Begrenzte Produktionsaufträge:** 0–999 weitere vollständige Zyklen oder unbegrenzt, in allen 20 produzierenden Betrieben einschließlich Außenarbeit und Abbau. Angefangene Zyklen zählen mit; 0 hält weitere Arbeit an, fertige Waren werden weiter transportiert. Bei Bauern zählt die Ernte, nicht die Aussaat. Jeder Zyklus liefert die bestehende Chargenmenge, nicht zwingend eine einzelne Ware. Fertige Aufträge werden im Betriebsstatus angezeigt.
9. **Trägerreserve für Ausbildung:** Einstellbar von 0–50 wirklich freien Trägern, gilt für direkte Rekrutierung und Warteschlangen. Keine rückwirkende Entlassung bestehender Soldaten; Facharbeiteranstellung behält ihre bisherigen separaten Logistikregeln. Alte Spielstände starten mit Reserve 0.
10. **Kamera beim Laden:** Auch beim Laden aus Speicherplätzen/Import/Zwischenspeicher werden Position und Zoom wiederhergestellt, nicht nur beim automatischen Fortsetzen. Ungültige Kamerawerte werden ignoriert.

Warteschlangen, Sammelpunkte, Restzyklen, Trägerreserve und Journal werden gespeichert und beim Import geprüft. Keine Originalsprites geändert. Die vorhandenen Holz-/Gold-Menüs wurden um echte Steuerelemente mit Touch-Zielen und Statusanzeigen ergänzt.

Prüfung: 26 Node-Testsuiten, separate Simulation/Strategie, Produktionsbuild und isolierte Desktop-/667×375-Touch-Browserläufe. Neue Tests prüfen Kosten, Laufwege, Abbruch, Reserve, Kapazität, individuelle Entlassung, Produktionsstopps innen/außen, Journal, Kamera und Wiederherstellung. Bestehende Speicher- und Gebäudemenü-Browsertests ebenfalls bestanden. Keine persönliche Speicherung verändert.

**Weiter offen:** WLAN-Mehrspieler mit getrennten menschlichen Spielerwirtschaften, Völkerwahl und Netzwerksynchronisation, sowie die weiter unten aufgeführten großen Originalsysteme. Diese zehn Ergänzungen sind kein abgeschlossener Originalklon.

## Fünf ergänzte Menü-, Speicher- und Farbfunktionen

1. **Speichern & Hauptmenü:** Rückkehr aus dem Pausenmenü ohne laufende Hintergrundsimulation. Bei Speicherfehler bleibt das Spiel geöffnet. Fortsetzen lädt den Stand; eine neue Siedlung legt nach Bestätigung eine Sicherung an und initialisiert eine frische Welt.
2. **Spielstandübersicht im Haupt- und Pausenmenü:** Autosave, drei Speicherplätze, Zwischenspeicher und vorhandene Sicherungen mit Datum, Spielzeit, Gebäude-/Siedlerzahl. Leere und ungültige Einträge sind nicht ladbar. Laden bewahrt den vorherigen Stand und öffnet die geladene Welt pausiert.
3. **Benannte Speicherplätze:** Sichern unter einem eigenen Namen und Umbenennen bis 48 Zeichen. Namen stehen im einzelnen Spielstand, nicht nur in separaten Metadaten. Bestehende Speicherplatzknöpfe behalten vergebene Namen beim Überschreiben.
4. **Zwischenspeicher:** Eigener Platz mit F5/Schnellspeichern und F9/Schnellladen, zusätzlich Touch-Knöpfe im Pausenmenü. Vorheriger Zwischenspeicher bleibt separat erhalten. Laden erfordert Bestätigung. Auf Mac-Tastaturen gegebenenfalls Fn verwenden.
5. **Spielerfarbe:** Rot, Blau, Grün oder Violett vor Spielbeginn sowie im Pausenmenü. Farbe wird gespeichert und für Grenzpunkte, Minikartenmarkierungen, Einheitenbalken und Auswahlmarkierungen verwendet. Der bestehende KI-Gegner erhält eine andere Farbe. Kleidung und Gebäude-Sprites werden nicht umgefärbt; alte Spielstände erhalten Blau.

Die vorhandene Holz-/Gold-Gestaltung bleibt erhalten; neue Dialoge besitzen erreichbare Schließen-/Fokuszustände, mobile 44-Pixel-Bedienelemente und erkennbare Fehler-/Leerzustände. Keine Rastergrafiken geändert.

**Noch kein WLAN-Mehrspieler:** Es gibt weiterhin keine Netzwerksynchronisation, Lobby, getrennten menschlichen Spielerwirtschaften oder Völkerwahl. Die Farbauswahl allein ist ausdrücklich kein Mehrspielermodus. Speicherstände bleiben lokal pro Gerät/Browser-Ursprung.

Prüfung: 25 Node-Testsuiten einschließlich Speicherbibliothek/Farbvalidierung, separate Simulation/Strategie und Produktionsbuild. Isolierte Desktop-/667×375-Touch-Browserprüfungen für Hauptmenürückkehr, Speichern, Umbenennen, Laden, Sicherungserhalt, Schnellzugriffe, Farbwechsel, vollen Speicher, Reload und frischen Spielstart. Persönliche Spielstände bleiben unverändert.

## Sechs ergänzte Routen- und Lagerfunktionen

1. Einzelne Patrouillenpunkte entfernen, solange mindestens zwei übrig bleiben.
2. Punkte mit Auf-/Ab-Knöpfen umsortieren.
3. Rundroute umkehren. Diese drei Änderungen gelten für den im Siedlermenü gewählten eigenen Soldaten; sein Standort bleibt unverändert. Ein noch vorhandenes aktuelles Ziel bleibt das nächste Ziel. Wird es gelöscht, folgt der nächste verbleibende Punkt. Alle neu entstehenden Wegabschnitte einschließlich Rückweg und Anreise werden vor Übernahme auf Erreichbarkeit geprüft; ungültige Änderungen bleiben ohne Wirkung.
4. Ausgewählte Patrouillen zeigen nummerierte Punkte und gestrichelte Verbindungen auf der Karte. Gleiche Routen werden zusammengefasst; höchstens 16 unterschiedliche ausgewählte Routen werden gleichzeitig gezeichnet, unter dem Nebel. Verbindungen sind Befehlsfolgen, keine Behauptung des genauen Laufpfads.
5. Lager können bis zu acht eigene Bezugsquellen enthalten. Hinzufügen und Entfernen im Gebäude-/Einstellungsmenü. Eine leere Liste pausiert das Auffüllen ohne stillen Rückgriff aufs Hauptlager. Die bestehende Einzelquellenwahl bleibt als ausdrücklich beschrifteter Listen-Ersatz verfügbar.
6. Quellen sind per Auf-/Ab-Knopf priorisierbar. Träger prüfen diese Reihenfolge und weichen bei erschöpfter, gesperrter, unfertiger oder unerreichbarer Quelle aus. Zielvorräte der Quelle und bereits zugesagte Mengen bleiben berücksichtigt. Waren werden weiterhin körperlich abgeholt und geliefert, nicht sofort eingebucht.

Geänderte Aufträge/Listen werden gespeichert. Alte Saves mit einer einzelnen `storageSource` bleiben lesbar; neue Listen werden auf Grenzen, Duplikate, Eigentum und Referenzen geprüft. Abriss entfernt die Quelle und korrigiert verschobene Gebäudeindizes; laufende Lieferungen behalten die bisherigen Rückleitungsregeln.

Eigene Komfort-/Logistikerweiterungen, keine verifizierte originalidentische Bedienung oder Handelsmechanik. Keine Rastergrafiken geändert. Handel zwischen Spielern, Esel und starre Formationspatrouillen bleiben offen.

Prüfung: 23 Testsuiten, separate Simulation/Strategie und Produktionsbuild bestanden. Neue Prüfungen decken abgewiesene/unmögliche Routenedits, tatsächliche umgekehrte Umläufe, Quellenpriorität, leere/angehaltene/blockierte Quellen, geschützte Vorräte, Warenbilanz, Abrissreferenzen und alte/ungültige Saves ab. Desktop- und 667×375-Touch-Browserläufe prüfen alle neuen Bedienelemente, echte Lieferungen aus zwei Quellen und Wiederherstellung nach Reload. Bestehende Gebäude-/Mobile-/Offline-Browserprüfungen ebenfalls bestanden; Darstellung visuell geprüft, keine Browserfehler. Persönliche Spielstände unverändert; reale iPhone-Hardware bleibt ungeprüft.

## Fünf ergänzte Punkte der Gebäudebedienung

1. „Gebäudeeinstellungen“ öffnet ein deutlich abgegrenztes natives Dialogfenster mit Gebäudename, eigener Grafik, Live-Status und den tatsächlichen bestehenden Steuerelementen. Keine duplizierten Attrappen oder separaten Zustände.
2. Beim geschützten Hauptlager werden beide Einstellungsöffner ausgeblendet und durch eine Erklärung ersetzt. Andere Gebäude besitzen mindestens eine reale Aktion, etwa Abriss; es werden keine künstlichen Einstellungen erfunden.
3. Betrieb und Priorität zeigen ihren Zustand mit `aria-pressed` und melden Änderung sowie Speichererfolg bzw. Speicherfehler innerhalb der Ansicht.
4. Desktop und mobiles Querformat: eigener Öffner in der Gebäudeansicht, 44-Pixel-Bedienelemente im Dialog, scrollbar, Schließen/Escape mit Fokusrückgabe. Arbeitsgebiet und Abriss geben die Karte bzw. Bestätigung frei. Bestehende Modalebene korrigiert, damit die mobile Seitenleiste keine Bestätigungsklicks abfängt.
5. Neuer isolierter Browser-Regressionslauf für Desktop und 667×375 Touch-Ansicht: Öffnen, Hauptlagerschutz, echte Änderungen, Escape/Schließen, Arbeitsgebiet/Abriss, Werkzeugauftrag, Lagerregel/Zielvorrat und Wiederherstellung nach Reload. Kein Zugriff auf persönliche Spielstände.

Zusätzlich beim Prüfen gefunden: Der veraltete Aufruf einer nicht mehr vorhandenen Worker-Zeichenfunktion bei noch ungeladenem Atlas konnte den Renderloop abbrechen. Bis die vorhandenen Grafiken geladen sind, wartet diese Zeichnung jetzt auf das nächste Bild. Keine Grafikfamilie ersetzt; keine neue Originaltreue behauptet.

Prüfung: 22 Testsuiten, separate Simulation und Strategie, Produktionsbuild, neuer Desktop-/Touch-Dialogtest einschließlich simuliertem Speicherfehler sowie bestehender mobiler Offline-/Gestenlauf bestanden. Beide Dialogansichten visuell geprüft. Reale iPhone-Hardware bleibt ungeprüft; kein Leistungstest.

## Mobile Querformat-Oberfläche und Offline-Spiel

- Eigene mobile Ansicht unter `/?mobile=1`, automatisch auf primären Touchgeräten: untere große Befehlsleiste, ausklappbare Menüs, Ressourcen oben, Minikarte und Zoom rechts. Referenz der iPhone-Fassung visuell angesehen, eigene CSS-Bedienelemente statt kopierter Originalgrafiken. Desktop bleibt erhalten.
- Einfinger-Kartenbewegung, Zweifinger-Pinch und separater Einfinger-Auswahlrahmen. Ziel-/Halt-Befehle, Gebäudemenüs und Arbeitsgebiet bleiben funktional. Hochformat zeigt Drehhinweis und hält die Simulation an.
- Produktionsbuild mit Manifest, Offline-Dateicache und automatischem lokalem Save/Load; privater Tailscale-HTTPS-Endpunkt eingerichtet. Ca. 28 MB Erstdownload. Keine automatische geräteübergreifende Spielstand-Synchronisierung, Export/Import verwenden.
- Browserprüfung für mobile Gesten und Offline-Neustart bestanden; 22 Testsuiten, Simulation/Strategie und Build ebenfalls. Reales iPhone/Safari und Installation vom Home-Bildschirm noch nicht auf Hardware geprüft. Details, Quellen, Installations- und Updatehinweise: [MOBILE.md](MOBILE.md).

## Lazarett mit Heiler und Vollheilung

- Prüfung: 22 Testsuiten, separate Simulation/Strategie, Produktionsbuild und Diff-Prüfung bestanden. Isolierter Browserlauf prüft Platzierung/Kosten, echte Baustofflieferung und Bau, Heileranreise, Patientenruf, serielle Heilung, Betriebspause, Save/Reload bis Vollheilung und Abriss ohne Browserfehler. Drei Baustufen visuell geprüft; persönliche Spielstände unverändert.
- Als 25. baubares Gebäude im Militärmenü: 3 Bretter und 3 Stein. Reguläre Baustofflieferung und Bauarbeiter errichten das Gebäude; eigene Fundament-, Rohbau- und Fertiggrafik mit Aufbau von unten nach oben. Keine Gebäude- oder Warenattrappe.
- Ein freier Siedler übernimmt den Beruf Heiler ohne Werkzeug und läuft zum Lazarett. Die bestehende Reserve von zwei freien Logistikarbeitern gilt weiterhin. Heiler wartet am Eingang, arbeitet nur bei tatsächlicher Behandlung und wird bei Stilllegung oder Abriss wieder freier Träger.
- Ausgewählte Soldaten per Marschbefehl zum Gebäude schicken, oder im angeklickten Lazarett „Verwundete rufen“ verwenden. Letzteres holt erreichbare eigene verwundete Soldaten im Umkreis von 12 Feldern und ersetzt ihre bisherigen Laufaufträge. Keine Feinde, Toten oder Turmbesatzungen. Patienten müssen tatsächlich ankommen; stationäre Behandlung heilt nur einen Patienten gleichzeitig bis zur vollen Gesundheit.
- Ein begonnener Patient wird durch später Eintreffende nicht verdrängt. Neue Befehle/Anhalten können seinen Aufenthalt beenden. Betriebspause und fehlender Heiler stoppen die Heilung; Patienten dürfen weiterhin von Feinden getroffen werden. Bei Abriss werden Heiler und Gebäudeaufträge freigegeben. Auftrag, Heilungsstand und aktueller Patient bleiben gespeichert.
- Live-Gebäudekarte zeigt Heilerbereitschaft, Anzahl beauftragter Patienten und Trefferpunkte der aktuellen Behandlung. Heiler verwendet noch die vorhandene Siedlergrafik mit einfacher, nur bei Behandlung aktiver Handbewegung. Eine vollständige Innenraum-/Liege-/Behandlungsanimation und eigene Heiler-Sprites bleiben offen; Behandlung erfolgt derzeit sichtbar am Eingang.
- Eigene Balance: 2 Trefferpunkte je Simulationssekunde, ein Behandlungsplatz, 12 Felder für den Rufbutton. Das sind keine verifizierten Originalwerte. [Originalhandbuch](https://www.mogelpower.de/manuals/Die_Siedler_IV_Handbuch.pdf), Militärgebäude und Tabellen: römische Baukosten 3 Holz/3 Stein und Heiler ohne Werkzeug. [Gebäudeübersicht](https://www.siedlercommunity.de/siedler4/gebaeude/) beschreibt langsame Heilung bis 100 %.
- Bildquelle vor der Erzeugung visuell geprüft: römisches Lazarett mit blauem gestuftem Dach, Säulen und Eingangsvorbau. Eigene neue Bildserie: `assets/hospital-stages-v1.png`; Quelle, genauer Prompt und Grenzen in `assets/HOSPITAL_PROMPT.md`. Originalbaustufen nicht einzeln rekonstruiert. Keine Originalsprites übernommen.

## Mehrteilige Patrouillen

- Rundrouten aus 2 bis 8 Punkten einschließlich Start für freie Schwertkämpfer, Bogenschützen und Sanitäter. Die Soldaten laufen die Punkte zyklisch ab; alte Zweipunkt-Saves pendeln unverändert. Kampf unterbricht die Bewegung, danach wird die Strecke fortgesetzt.
- Ctrl/Cmd + Rechtsklick oder „Patrouille“ startet die Route. Shift + Ctrl/Cmd + Rechtsklick oder „Patrouillenpunkt hinzufügen“ plus Kartentipp erweitert eine bestehende Route ohne laufende Strecke zurückzusetzen. Die Seitenleiste zeigt die nummerierte Punktfolge der ausgewählten Patrouillen.
- Neue Punkte werden auf Erreichbarkeit vom bisherigen Endpunkt und zurück zum Start geprüft. Doppelte Punkte, mehr als acht Punkte und unerreichbare Ergänzungen werden ohne Änderung der bisherigen Route abgelehnt. Später blockierte Laufwege beenden die Patrouille mit Meldung. Anhalten/neuer Marschbefehl beendet die Schleife. Beim Wechsel eines Sanitäters zur Patrouille wird der alte Heilungsauftrag bereinigt.
- Speichert Punktfolge, Folgeindex und laufenden Weg; Ladeprüfung akzeptiert alte zwei- und neue mehrteilige Routen und weist ungültige Indizes/Längen zurück.
- Eigene Komforterweiterung: Die genaue Mehrpunkt-Bedienung und Achtpunktgrenze sind im erneut geprüften [Originalhandbuch](https://www.mogelpower.de/manuals/Die_Siedler_IV_Handbuch.pdf) nicht belegt. Keine Behauptung originalidentischer Patrouillensteuerung. Keine Rastergrafiken geändert. Punktweises Löschen/Umsortieren ist inzwischen ergänzt; starre Formationspatrouillen bleiben offen.
- Prüfung: 21 Testsuiten einschließlich zyklischer Vierpunktroute, Fortsetzung, ungültiger Ergänzungen und Save-Prüfung; Simulation, Strategie, Build und Diff-Prüfung bestanden. Isolierter Browserlauf für beide Eingabewege, sichtbare Punktfolge, Speicherung/Neuladen und anschließenden Umlauf bestanden; Screenshot visuell geprüft, keine Browserfehler oder persönlichen Save-Änderungen.

## Sanitäter und Feldheilung

- Sanitäter sind in einer fertigen, aktiven Kaserne in drei Rängen rekrutierbar: ein Schwert, zusätzlich 0/1/2 Gold. Es wird ein eigener freier lebender Träger umgeschult, kein zusätzlicher Siedler erzeugt. Sie sind angreifbare Militäreinheiten mit schwachem Nahkampf und unterstützen Auswahlgruppen, Marschziele und Patrouillen.
- Im Stand suchen sie erreichbare eigene verwundete Soldaten im Umkreis von fünf Kartenfeldern auf. Behandlung erfolgt nur innerhalb 1,5 Feldern und schrittweise bis exakt 75 % der maximalen Trefferpunkte. Tote, Feinde, der Sanitäter selbst und Turmbesatzungen sind ausgeschlossen. Ohne Patienten stehen sie still. Neue Marschbefehle/Patrouillen haben Vorrang; „Nur marschieren“ verhindert auch automatische Heilungsausflüge. „Anhalten“ bricht einen laufenden Weg ab, die lokale Patientensuche bleibt im Verteidigungsmodus aktiv.
- „Nur Verwundete behalten“ oder Rücktaste entfernt gesunde Einheiten aus der aktuellen Auswahl, um den Rückzug verwundeter Soldaten zu erleichtern. Trefferpunkte, Sanitäterrang und laufende Versorgungswege werden gespeichert und fortgesetzt. Verlorene/tote Patienten brechen den Weg ab.
- Quelle: [Originalhandbuch, Militär, gedruckte Seiten 48–49 und Einheitentabelle](https://www.mogelpower.de/manuals/Die_Siedler_IV_Handbuch.pdf). Die 75-%-Grenze, schwacher Nahkampf, Schwert und drei Ränge sind dort belegt. Reichweiten, 3/4/5 Heilpunkte je 1,2 Sekunden und die vorhandenen 55/75/95 Trefferpunkte sind eigene Balance, keine verifizierten Originalwerte.
- Darstellung bewusst noch unvollständig: vorhandene richtungsabhängige Soldatengrafik mit „S“-Kennzeichnung und kurzem Versorgungspuls. Kein eigener Sanitäter-Sprite oder vollständige Behandlungsanimation; dafür ist noch ein passender visueller Einzelabgleich nötig. Keine Originalgrafiken übernommen oder neue Rastergrafiken erzeugt.
- Prüfung: 21 Testsuiten, Simulation, Strategie und Build bestanden. Isolierter Browserlauf: Kaserne anklicken, Rang-II-Sanitäter rekrutieren, Schwert/Gold abbuchen, Verwundeten tatsächlich erreichen, während der Heilung speichern/neuladen, bis 75 % weiterheilen und Verwundetenauswahl bedienen. Screenshot visuell geprüft; keine Browserfehler, keine persönlichen Saves verändert.
- Lazarett mit Heiler und Vollheilung ist inzwischen ergänzt, siehe oben. Eigene Sanitätergrafiken/Animationen, Hauptmänner und die übrigen unten aufgeführten Systeme bleiben offen. Der Gesamtauftrag bleibt unvollständig.

## Militärbefehle: Rückzug und verteilte Marschziele

- Ausgewählte Soldaten können zwischen „Gegner bekämpfen“ und „Nur marschieren“ wechseln. Im Marschmodus unterbricht Gegnerkontakt den Lauf nicht; eigene Angriffe und Angriffe auf feindliche Türme unterbleiben. Feindlicher Schaden und bereits abgefeuerte Geschosse bleiben wirksam. Der Modus bleibt gespeichert; ältere Spielstände behalten das bisherige Kampfverhalten.
- Kompakte Marschziele, Reihe oder Block im Siedlermenü. Reihe/Block vergeben unterschiedliche erreichbare Zielplätze an Schwertkämpfer und Bogenschützen. Bei Wasser, Hindernissen oder Kartenrand werden nahe Ersatzplätze gesucht; ohne erreichbaren Platz bleibt die betreffende Einheit zurück. Das sind Zielaufstellungen, keine starren Formationen während des Laufens. Gebäudebefehle, Patrouillen und angehängte Shift-Wegpunkte behalten ihre bisherigen Regeln.
- Eigene vereinfachte Bedienung, keine vollständig nachgebildeten Original-Kampfregeln. Hauptmänner, weitere Soldatentypen und koordinierte Original-Formationen bleiben offen. Sanitäter/Feldheilung und Lazarett sind inzwischen ergänzt, siehe oben.
- Prüfung: 20 Testsuiten, Simulation-/Strategietests und Build bestanden. Isolierter Browserlauf für Moduswahl, drei unterschiedliche Zielplätze, Rückzug an einem Gegner vorbei ohne Gegenangriff und Speicherung; keine persönlichen Spielstände verändert.

## Lagerregeln und Umlagerung

**Erweitert:** Zielvorräte lassen sich nun pro Ware von 0 bis 999 einstellen (alte Spielstände: 10). Jedes Lager kann das Hauptlager oder ein anderes eigenes Lager als Auffüllquelle verwenden. Ein Quelllager gibt für Umlagerungen nur Überschüsse über seinen eigenen aktiven Zielvorrat frei; das verhindert Pendeltransporte zwischen gegenseitigen Auffüllquellen. Verbrauch durch Produktionsbetriebe bleibt davon unabhängig. Wird die Quelle abgerissen, werden künftige Aufträge auf das Hauptlager zurückgesetzt; bestehende Transportmengen bleiben erhalten. Quellen und Mengen werden gespeichert und validiert. Bedienung und echte Lieferungen zwischen zwei Lagern mit Änderung der Zielmenge im Browser getestet; 19 Testsuiten und Build bestanden. Die schmale Darstellung der Quellen-/Zielmengenbeschriftung wurde bei der visuellen Prüfung korrigiert.

- Direkt im Lagerhaus je Produktionsware: Annehmen, Vorrat auffüllen (einstellbar; Standard 10), nicht annehmen oder ins Hauptlager räumen. Alte Spielstände ohne Regeln nehmen weiterhin alle bisherigen Produktionswaren an.
- Auffüllen und Räumen sind reale Trägerwege mit Abholung und Lieferung. Bereits reservierte/in Bewegung befindliche Einheiten zählen zum Auffüllziel; Regeln ändern keine schon zugesagten Transporte. Produktionsanlieferungen können den Zielvorrat überschreiten, zehn ist kein Kapazitätslimit.
- Anhalten verhindert neue Lageraufträge; unterwegs befindliche Waren werden noch geliefert. Abriss erstattet nur unreservierte Bestände; Transporte zu einem abgerissenen Ziel kehren zum Hauptlager zurück. Regeln, Mengen und laufende Wege werden gespeichert und geprüft.
- Die Standard-Auffüllmenge zehn und die Obergrenze 999 sind eigene Vorgaben, keine verifizierten Originaleinstellungen. Mehrere priorisierte Quellen je Lager sind inzwischen ergänzt. Handel zwischen Spielern, Esel und vollständige Original-Verteilungsregeln fehlen weiterhin.
- Prüfung: 18 Testsuiten, Simulation-/Strategietests und Build bestanden. Browserprüfungen in separatem Kontext; keine persönlichen Spielstände verändert.

## Gebäudegebundene Bedienung

- Gebäudeklick zeigt zusätzlich zur Seitenansicht eine verankerte Karte am Gebäude: aktueller Status, Warenbilder/Mengen und Zugang zu den Einstellungen. Bestände, Besatzung und Baufortschritt werden ohne erneutes Anklicken aktualisiert.
- Rekrutierung und Rangwahl sind aus dem allgemeinen Siedlermenü zur angeklickten Kaserne verschoben. Eine angehaltene oder unfertige Kaserne kann darüber keine Soldaten ausbilden. Waffen und Gold werden weiterhin aus dem Hauptlager bezahlt.
- „Besatzung heraus“ steht nur beim fertiggestellten Turm; ohne Besatzung ist der Button deaktiviert. Arbeitsgebiete bleiben bei Holzfäller/Steinmetz/Förster, Werkzeugaufträge bei der Schmiede. Unpassende Produktionsaktionen bei fertigen Wohnhäusern/Türmen/Hauptlager sind ausgeblendet. Globale Transportpriorität und Spezialistenbefehle bleiben im Hauptmenü.
- Dachklicks priorisieren das vorn gezeichnete Gebäude statt eines dahinterliegenden Bodenfelds. Keine Originalgrafiken verändert oder übernommen; die neue Infokarte ist eine eigene Bedienlösung.
- Prüfung: 17 Testsuiten, Simulation, Strategie und Build. Isolierter Browser-Klicktest für Kaserne, Rangkosten, Produktionsstopp, Turmfreigabe und Schließen der Gebäudekarte; Screenshot visuell geprüft. Keine Tests am persönlichen Spielstand.

## Neuester Stand: Minennahrung, Werkzeuge, Lager, Patrouillen und Spielziele

Die folgenden Angaben ersetzen ältere Einschränkungen im historischen Protokoll:

- **Minennahrung:** Kohle bevorzugt Brot, Eisen/Schwefel Fleisch und Gold Fisch. Eine bevorzugte Portion ermöglicht zehn Abbauzyklen, andere Nahrung zwei. Pro Zyklus wird eine Einheit aus dem endlichen Vorkommen gewonnen. Träger liefern auch Ersatznahrung physisch; Restversorgung bleibt gespeichert. Grundlage: Originalhandbuch, gedruckte Seite 42. Zeiten und Erfolgsausbeute sind eigene Balance, kein vollständiges Originalmodell.
- **Sieben Werkzeugbestände:** Axt, Hammer, Schaufel, Sense, Spitzhacke, Säge und Angel. Ausgabe passend zum Beruf; werkzeugfreie Berufe benötigen kein generisches Werkzeug mehr. Baufacharbeiter und Spezialisten erhalten ebenfalls die passende Sorte. Die Schmiede produziert eine gewählte Sorte oder automatisch die knappste; ein begonnenes Werkstück wird nicht bei Auswahlwechsel verwandelt. Alte Werkzeugkisten bleiben als kompatibler Ersatz nutzbar. Rückgabe und Abriss erstatten die tatsächlich ausgegebene Sorte. Grundlage: Werkzeugtabelle im Originalhandbuch, Seiten 62–64.
- **Eigenständige neue Werkzeugbilder:** Transparenter Atlas für die sieben Sorten, im Menü und als getragene Ware eingebunden. Keine Originalsprites extrahiert. Quellen, exakter Generierungsprompt und Grenzen: [TOOLS_PROMPT.md](assets/TOOLS_PROMPT.md).
- **Zusätzliche Lagerhäuser:** 24 baubare Typen. Produktionswaren gehen zum nächsten erreichbaren aktiven Lager; Werkstätten können ihren Bedarf daraus abholen. Separate physische Bestände, sichtbare Waren, Inspektion, Abrisserstattung und Save/Reload. Laufende Lieferungen werden bei Lagerabriss zum Hauptlager umgeleitet. Baustoffe, Gold, Waffen und Werkzeuge bleiben für die bisherigen Zahlungsregeln zentral. Annahmefilter und Umlagerungen zum/vom Hauptlager sind inzwischen implementiert; vollständige Original-Verteilungsregeln fehlen. Das Lager nutzt vorhandene eigene Lagerkunst und wiederverwendete Baustufen; keine 24 individuellen Baustufenpaare.
- **Patrouillen:** Anfangs Zweipunkt-Pendeln; inzwischen Rundrouten mit bis zu acht Punkten und Sanitäter-Unterstützung, siehe neuester Abschnitt oben. Formationspatrouillen bleiben offen.
- **Spielziele:** Im Startmenü freies Spiel, eigener Wirtschaftsauftrag oder Außenposten-Eroberung wählbar. Tatsächliche Gebäude-/Waren-/Gegnerzähler im Pausenmenü; Sieg/Niederlage pausiert, wird gespeichert und erlaubt danach freies Weiterspielen. Niederlage bei Verlust aller eigenen Siedler oder des Hauptlagers. Alte Spielstände bleiben freies Spiel. Das sind zwei eigene Herausforderungen auf der vorhandenen Karte, keine nachgebaute Originalkampagne und keine vollständige Gefechtskonfiguration.
- **Zwischenprüfung:** 16 automatisierte Testsuiten und Build bestanden. Isolierte Browserprüfungen für Schmiedeauftrag, Werkzeugtransport, Ersatznahrung sowie Lagertransport, gespeicherte Bestände und Weiterlieferung an eine Mühle bestanden. Ebenso Patrouillenbedienung/Lauf/Anhalten/Reload und Szenarioauswahl, Zielanzeige sowie Speicherung/Bestätigung eines künstlich herbeigeführten Siegs. Letzteres prüft den Zustandswechsel, keinen vollständigen Kampagnendurchlauf. Der vorhandene Browser-Kernlooptest für Geologe, Holzfällen, Minen-/Wohnhausbau und Baustufen bestand erneut. Persönliche Spielstände wurden dabei nicht verändert.

## Nachgeführt nach dem Außeneinsatz-Update

Die Datei war zuvor nicht vollständig aktuell. Die folgenden Ergänzungen ersetzen widersprechende ältere Angaben weiter unten:

- **Spezialisten:** Geologen und Pioniere arbeiten nach einem Zielauftrag autonom im Gebiet. Der Pionier beansprucht genau ein angrenzendes Feld je Arbeitsschritt. Anhalten beendet die Automatik; alte Spielstände behalten bereits gewonnenes Land.
- **Arbeitsbereiche:** Dichtes Punktzentrum und lockerere äußere Punktringe statt Fliesenraster.
- **Baustufen:** Für alle 23 baubaren Gebäudetypen eigene Fundament-/Rohbaubilder, darüber das von unten wachsende Endbild. Alte Brettstreben entfernt. Die Bildübergänge sind nicht vollständig originalgetreu.
- **Arbeitsplatzwege:** Personal geht hinein, arbeitet und bringt fertige Ware zum Ausgang; tatsächliche Produktion steuert die Arbeitsbewegungen.
- **Außeneinsätze:** Bauern säen bis zu vier einzelne Felder, warten auf Wachstum, ernten und bringen Getreide zurück. Förster laufen zur Pflanzstelle, Fischer ans Ufer. Reservierung, Rücktransport, Abbruch/Abriss und Save/Reload sind implementiert. Feldgrafik und Animationen bleiben vereinfacht. Details: [AUSSENEINSAETZE.md](AUSSENEINSAETZE.md).
- **Autosave:** Alle fünf Sekunden sowie beim Verlassen; automatisches Fortsetzen inklusive Kamera nach Neuladen. Vorheriger Autosave wird gesichert und bei beschädigtem Hauptstand automatisch geladen. Zusätzlicher Wiederherstellungsbutton.
- **Audio:** Erste zuschaltbare Arbeitseffekte existieren; vollständige Geräuschkulisse und Musik fehlen.
- **Prüfung dieses Zwischenstands:** Neun Testsuiten und Build bestanden. Isolierter Browser-Test für Außeneinsätze, Warenankunft und Feld-Save/Reload bestanden. Separater Autosave-Browsertest bestanden. Das ist kein Nachweis vollständiger Originaltreue.

Die frühere Prüfung am persönlichen Spielstand unter „Prüfergebnisse“ ist ein historisches Protokoll, keine Aussage über den heutigen Inhalt von Speicherplatz 3.

## Neuester Ausbau: Wegpunktketten und Geschosse

- **Wegpunktketten:** Shift + Rechtsklick hängt bis zu 32 Ziele an. Normale neue Marschbefehle ersetzen die Kette; Anhalten löscht sie. Zivile Siedler erledigen ihre aktuelle Lieferung zuerst, Werkstattpersonal verlässt den Betrieb nach Rückkehr in den Wartezustand. Unerreichbare Folgeziele werden übersprungen. Die Kette wird gespeichert und beim Laden validiert. Spezialisten führen ihre autonomen Arbeiten bis zum nächsten Wartezustand aus; eine Turmbesatzung bleibt im Turm. Zweipunktpatrouillen sind inzwischen implementiert; vollständige Original-Formationen fehlen.
- **Bogenschützen:** Sichtbare Pfeile mit Flugzeit statt sofortigem Fernkampfschaden. Einschlag, tote Ziele und Speicherung laufender Geschosse werden behandelt. Flugbahn, Verfolgung bewegter Ziele und Schadenswerte sind vereinfacht; keine vollständige Original-Ballistik, Deckung oder Gebäudebeschuss-Regeln.
- **Tests:** Elf Testsuiten, explizite Simulation-/Strategietests und Build bestanden. Zusätzlich Bedien-/Kampftest im isolierten Browser für Shift-Rechtsklick, Marschfolge und Pfeilschaden.

## Tatsächlich implementiert

1. **Erkundung und Kriegsnebel:** Eigenes Lager, Gebäude und lebende eigene Siedler erzeugen Sicht. Unbekanntes Gelände ist schwarz, früher gesehenes Gelände bleibt gedämpft bekannt. Gegner sind außerhalb aktueller Sicht weder sichtbar noch anklickbar; auch die Minikarte verrät sie nicht. Erkundung wird gespeichert. Besitzgrenzen und Sicht bleiben getrennte Systeme. Bestehende Spielstände ohne Erkundungsdaten beginnen mit Sicht um die vorhandene Siedlung, ohne Gebäude oder Waren zu verlieren.
2. **Waren als Gegenstände:** Neue zusammenhängende Grafikfamilie mit Holz, Brettern, Stein, Nahrung, Erzen, Barren, Werkzeugen und Waffen. Getragene Ware sitzt abhängig von der Laufrichtung vor/hinter dem Körper und bewegt sich mit dem Träger. Vor dem Abholen reservierte Ware ist nicht am Körper sichtbar. Eingangsbestände und fertige Ausgangswaren werden an Gebäuden gezeichnet. Es sind keine vollständigen originalen Trageanimationen oder acht separat gemalten Ansichten je Gegenstand.
3. **PC-orientierte Seitenleiste:** Minikarte oben links, vier Hauptbereiche Bauen/Siedler/Waren/Betriebe, fünf bebilderte Baukategorien, zweispaltige Gebäudebilder, Detailbereich und kompakte Vorräte unten. Die verstreuten rechten Einheitenfenster und die alte Transporttafel sind ersetzt. Gebäudeinspektion ist in die Seitenleiste integriert. Hauptbereiche, Gebäudenamen, Waren und wesentliche Aktionen sind deutsch; einige Spielmeldungen und Tutorialtexte bleiben englisch. Das ist eine referenzorientierte Annäherung, keine vollständige Rekonstruktion des Originalmenüs.
4. **Facharbeiter:** Produktionsbetriebe und Förster benötigen einen realen zugewiesenen Siedler mit einem ausgegebenen Werkzeug. Er geht zum Betrieb und arbeitet dort; Produktion wartet auf seine Ankunft. Zwei Zivilisten werden für Logistik freigehalten. Stopp, manueller Marschauftrag und Abriss lösen die Zuordnung auf und geben das Werkzeug zurück. Personalzuordnung wird gespeichert, Gebäudeindizes werden bei Abriss korrigiert. Aktuell werden sieben Werkzeugsorten berufsspezifisch ausgegeben; siehe neuester Stand oben.
5. **Direkttransport:** Träger können fertige Waren unmittelbar von einem Betrieb zu einem anderen bringen. Die Weglängen entscheiden zwischen verfügbarem Lagerbestand und passender Betriebsware. Mengen werden einmal reserviert und einmal abgeliefert. Material für Baustellen bleibt über das zentrale Lager reserviert. Zusätzliche Lager sind inzwischen implementiert; Handelsrouten fehlen weiterhin.
6. **Betriebsübersicht:** Zeigt Baustellen, fehlendes Personal/Werkzeug, fehlende Inputs, Produktionsfortschritt, angehaltene Betriebe und wartende Ausgangswaren. Anklicken zentriert den Betrieb und öffnet seine Aktionen. Keine vollständige statistische Produktionshistorie.
7. **Militär und Auswahl:** Drei Rekrutierungsränge für vorhandene Schwertkämpfer/Bogenschützen; höhere Ränge kosten Gold und verändern Trefferpunkte/Schaden. Eigene Balance: Rang II ein Gold, Rang III zwei Gold, 55/75/95 HP. Nicht als Originalwerte verifiziert. Pioniere/Geologen können wieder Träger werden und geben ihr Werkzeug zurück. Ctrl/Cmd + 1–9 speichert eine Auswahlgruppe, die Ziffer ruft sie ab; Gruppen werden gespeichert. Bestehende Werkzeug-Hotkeys gelten, wenn unter der Ziffer keine Gruppe gespeichert ist.
8. **Nachwachsender Wald:** Neue Bäume beginnen klein und benötigen 120 Simulationssekunden bis zur Fällreife. Bestehende Bäume ohne Altersdaten gelten als ausgewachsen. Alter und Vegetation bleiben im Spielstand erhalten. Wachstumsdauer ist eigene Balance, nicht verifizierte Originalzeit.
9. **Spielstände:** Save-Version 6, drei lokale Plätze, Datei-Export und -Import, Versions-/Karten-/Vorrats-/Referenzprüfung vor dem Laden. Eine Sicherheitskopie des aktuellen Stands wird vor einem Slot-/Dateiladevorgang angelegt und kann wiederhergestellt werden. Ladefehler versuchen die vorherige Kopie zurückzuladen. Keine Cloud oder native App erforderlich.

## Frühere Prüfergebnisse (historisches Protokoll)

Alle folgenden Befehle erfolgreich:

```
node tests/exploration.mjs
node tests/workforce.mjs
node tests/savegames.mjs
node tests/interaction.mjs
node tests/strategy.mjs
node tests/simulation.mjs
npm run build
```

Abgedeckt sind unter anderem Sicht ohne Gegner-Leaks, Erkundungsspeicherung, Tragebeginn nach Abholung, Werkzeuge/Personalreserve, direkte Lieferungen ohne Doppelzählung, Rangkosten ohne Teilabbuchung bei Goldmangel, Spezialistenrückwandlung, ungültige Save-Daten, Materialbau, Abriss-/Liefer-/Besatzungsindizes, integrierte Produktion mit Personal, gespeicherte Personalzuordnung und Werkzeugrückgabe genau einmal.

Browserprüfung am vorhandenen lokalen Spielstand: Minikarte/Nebel, Warenbilder, Kategorien, Betriebsübersicht, Zentrieren und Sägewerksinspektion mit Personalstatus, Slot 3 speichern und laden. Slot 3 enthält jetzt den Prüfstand der vorhandenen Siedlung. Bestehende Gebäude wurden nicht für QA abgerissen. Im Protokoll keine JavaScript-Fehler. Layoutregressionen (überbreite Ressourcenleiste, sichtbar gewordene ausgeblendete Gebäudekarten) wurden gefunden und korrigiert. Spiel nach QA pausiert.

Datei-Import/-Export und reale mobile Hardwaregesten sind implementiert, aber nicht vollständig durch die Browser-Dateidialoge bzw. auf einem echten Touchgerät durchgetestet. Militär- und Direkttransport-Erweiterungen sind simulationsgetestet; kein vollständiger militärischer Browser-Durchlauf.

## Weiterhin offen – nicht als erledigt markiert

- Höhen/Gebirge, Planierung, verschiedene Gebäudegrundflächen und weitere Landschaftstypen.
- Sichtbare Tierzucht, Wildtiere/Jagd; originalgetreue Darstellung/Balance der inzwischen funktionalen Feldphasen.
- Werkzeuge für noch fehlende Berufe; komplette Arbeits-/Trage-/Kampf-/Sterbeanimationen.
- Frei liegende Waren, Handel zwischen Spielern, Esel und vollständige Verteilungs-/Stau-/Wegeregeln; eigene Lagerbaustufen. Mehrere priorisierte Lagerquellen sind implementiert.
- Weitere Originalproduktionen, originale Abbauwahrscheinlichkeiten und Schwefelverwendung.
- Weitere Soldaten, Hauptmänner, eigene Heiler-/Sanitätergrafiken und vollständige Behandlungsanimationen, vollständige Garnisons-/Turm-/Burg-/Kampfkraftregeln, originalgetreue Geschossregeln und Formationen. Mobile Feldheilung bis 75 % und Lazarett/Vollheilung sind implementiert, siehe oben.
- Wirtschaftlich aufbauende Gegner-KI, umfassende Angriffs-/Belagerungsplanung und Diplomatie/Bündnisse. Optionale lokale Turmangriffe mit vorhandenen Truppen sind inzwischen ergänzt, siehe oben.
- Völker mit eigenen Gebäuden, Berufen, Waren und Fähigkeiten; zusätzliche Spezialisten.
- Religion, Alkoholketten, Tempel, Opfer, Mana und Wunder.
- Schiffe, Häfen, Werften, Fahrzeuge, Kriegsmaschinen und Transport-/Landungsregeln.
- Dunkles Volk, Verderbnis, Morbus und zugehörige Gegenmaßnahmen.
- Originalkampagnen, komplexe Missionsskripte, vollständige Gefechtskonfiguration, Karteneditor, weitere Kartentypen/-größen, Schwierigkeit und Mehrspieler. Kartenwahl mit zwei Seed-Layouts sowie erste eigene Spielziele/Sieg-/Niederlagenzustände sind implementiert, siehe oben.
- Eigene Musik und synthetische Arbeits-/Transport-/Bau-/Kampf-/Naturgeräusche samt Lautstärkereglern sind implementiert, siehe [AUDIO.md](AUDIO.md). Noch offen: vollständiger Original-Hörvergleich, Sprachaufnahmen, weitere Musikvarianten und Audio noch fehlender Spielsysteme; außerdem berufsspezifische Gebäudeanimationen und weitere Umweltgrafiken.
- Vollständige deutsche Texte, weitere Original-Untermenüs, Formationspatrouillen und echte Mobilgeräteprüfung. Mehrteilige Patrouillen einschließlich punktweisem Löschen/Umsortieren und Umkehren sind implementiert, siehe oben.

## Referenzen und neue Grafiken

- Der Nutzer-Screenshot wurde erneut visuell betrachtet: Minikarte oben links, Gold-/Steinrahmen, Gebäudebilder in zwei Spalten, Waren unter dem Baubereich, schwarze unerkundete Fläche und getrennte rote Besitzgrenze.
- [Zusätzlich betrachteter Original-Screenshot](https://images.igdb.com/igdb/image/upload/t_screenshot_huge/sc756m.jpg): PC-Ansicht mit Maya-Figuren; als Referenz für allgemeine UI-Anordnung und unterscheidbare Holz-/Stein-/Kohlewaren, nicht als römische Figurenreferenz verwendet.
- [Originalhandbuch](https://www.mogelpower.de/manuals/Die_Siedler_IV_Handbuch.pdf), Abschnitte Spielmenü und Militär: Menüstruktur, verschiedene Soldatenstärken und Gold für höherwertige Rekrutierung. Die konkreten Balancezahlen dieser Implementierung sind eigene Annäherungen.
- Eingebundenes eigenständiges Asset: `assets/goods-atlas-keyed-v3.png`. Mit dem eingebauten Imagegen-Werkzeug erzeugt; Magenta wird beim einmaligen Laden im Renderer transparent behandelt. Die ersten zwei Ergebnisse hatten keine echte Alpha-Transparenz und wurden nicht eingebunden. Sie bleiben als Entwürfe erhalten. Kein Originalsprite wurde extrahiert.
- Prompts: `assets/GOODS_PROMPTS.md`.

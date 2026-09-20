# Mineral- und Steinaufschlüsse · 20. September 2026

## Referenz und Einordnung

Vor der neuen Grafikfamilie wurden die vollständig betrachteten Mineralvorkommens-Abbildungen der [Settlers United Siedler-IV-Minenmechanik](https://docs.settlers-united.com/siedler-iv-wiki-de/tipps-und-tricks/minenmechanik) sowie die römischen Minengebäude und Waren der [Siedlercommunity](https://www.siedlercommunity.de/siedler4/gebaeude/) als Referenz geprüft. Die Quellen zeigen die fünf getrennten Vorkommen Stein, Kohle, Eisen, Gold und Schwefel und bestätigen, dass sie im Original als unterschiedliche Ressourcen behandelt werden. Sie dienen für die Unterscheidbarkeit, nicht als zu kopierende Pixelvorlage.

## Implementierte eigene Grafik

`mineral-outcrops-comic-v1.png` ist ein eigenes, transparentes Fünfer-Spriteblatt. Es enthält von links nach rechts hellen gebrochenen Stein, dunkle Kohle, rostrot geädertes Eisenerz, goldene Quarzadern und gelbe Schwefelkristalle. Das Blatt wird in `src/mineral-art.js` feldweise ausgeschnitten und sowohl für abbaubare Felsen als auch für geologische Vorkommen verwendet. Es ersetzt weder Original-Siedler-IV-Dateien noch ältere eigene Naturatlanten.

## Built-in-Imagegen-Prompt

> Transparentes horizontales Spriteblatt mit fünf klar getrennten isometrischen Comic-Rohstoffaufschlüssen: heller gebrochener Stein, schwarze Kohle, dunkler Fels mit rostrot-orangen Eisenadern, brauner Fels mit deutlichen goldgelben Quarzadern, ockerfarbener Fels mit zitronengelben Schwefelkristallen. Einheitliche Oberlichtquelle, dunkle braune Kontur, weicher Bodenschatten, keine Schrift, Schilder, Figuren, Gebäude oder UI.

## Grenzen

Die Silhouetten und Farben sind eine eigenständige Comic-Interpretation, keine pixelidentische Nachbildung der PC-Grafiken. Eine Prüfung bei Spielzoom, Transparenz und Nebel erfolgt zusammen mit dem gesamten Implementierungsdurchlauf.

# Recorded effects — 2026-09-13

These are **not The Settlers IV recordings**. All three authors explicitly release these recordings under CC0 1.0: https://creativecommons.org/publicdomain/zero/1.0/

| Runtime files | Author / original | Source |
|---|---|---|
| wood-hammer-1/2.mp3 | rubberduck, wood_hammer_01/02.ogg | https://opengameart.org/content/100-cc0-metal-and-wood-sfx |
| wood-hit-1/2.mp3 | rubberduck, wood_hit_01/02.ogg | same pack |
| metal-hammer-1/2.mp3 | rubberduck, hammer_01/02.ogg | same pack |
| tree-fall.mp3 | kheetor, chop-tree-fall.ogg | https://opengameart.org/content/tree-chop-fall-thud |
| cheer-1/2/3.mp3 | Sadiquecat, Yippee - Multi-Take, sound 810904 | https://freesound.org/people/Sadiquecat/sounds/810904/ |

Downloads: https://opengameart.org/sites/default/files/100-CC0-wood-metal-SFX.zip ; https://opengameart.org/sites/default/files/chop-tree-fall.ogg ; public preview https://cdn.freesound.org/previews/810/810904_5287430-lq.mp3 . The Freesound original FLAC requires login; we used the openly playable, CC0-covered MP3 preview, not an authenticated download.

Conversions: FFmpeg mono 44.1 kHz MP3 at 96 kbps. Wood/metal files retain their whole recording. Tree fall trimmed to first 2.4 seconds (trailing silence removed). Cheer takes 1.86–2.74 seconds from the author's own multi-take recording. No original-game audio or unidentified meme/reupload was used. CC0 permits modification and redistribution; attribution retained voluntarily.

Mapping: wood impacts for chopping, wood hammers for construction/crafting, metal hammers for quarry/mines/smithing, creak/thud for tree fall, cheer for completed buildings and mineral discoveries. These are authored approximations, not an original game's verified sound-event map. Separate variants rotate rather than layering synthetic effects over recordings.

Update: split all three spoken takes into separate runtime variants. FFmpeg silencedetect (-35 dB, minimum 0.15 s) locates the two inter-take gaps at 1.352667–1.890854 s and 2.621979–3.204500 s. Split boundaries fall in those gaps (about 1.62 s and 2.91 s); excess silence is trimmed while retaining roughly 40–50 ms around speech. Final source windows: 0–1.40 s, 1.85–2.67 s, 3.16–3.91 s. Each event plays one file, never the three-take recording. The former cheer.mp3 is preserved but no longer referenced/bundled.

# New Shores naval asset prompts

Generated 2026-09-22 with the built-in image generation model after visually inspecting the original Roman harbor, shipyard, merchant ship and warship listed in `GRAPHICS_REFERENCE.md`. These are new assets; no original game pixels are included.

## `harbor-comic-v1.png`

> Create one original isometric 3/4-view Roman-inspired harbor building asset for the cozy hand-painted comic strategy game New Shores. Pale round stone harbor tower, red terracotta roof and red/yellow trim, long sturdy wooden loading pier with posts, crane, barrels, rope and small cargo crates. Clear silhouette at tiny gameplay scale, warm sunlight from upper left, detailed painterly outlines, transparent background, no text, no UI, no people, no water plane, no shadow rectangle. Inspired only by the readable materials and silhouette of a classic Roman settlement harbor; do not copy any existing game asset.

## `shipyard-comic-v1.png`

> Create one original isometric 3/4-view Roman-inspired shipyard asset for New Shores in the same cozy hand-painted comic strategy style. Open wooden slipway/platform, small red-and-yellow plaster workshop with terracotta roof, timber crane, rope, stacked planks and a partially framed wooden hull. Strong readable silhouette at small game scale, warm upper-left light, transparent background, no text, no UI, no water plane, no people, no rectangular backdrop. Original design, not a copy.

## `ships-roman-comic-v1.png`

> Create a transparent horizontal sprite strip containing exactly three separate original isometric Roman-inspired ships for New Shores, evenly spaced and never overlapping: LEFT merchant cargo ship with broad deck, amphorae/crates and cream-red square sail; CENTER troop transport with roomy open deck, shields along rail and cream-red sail; RIGHT warship with elevated bow/stern, reinforced hull, oars and red/cream sail. Same camera angle and scale, bow pointing upper right, cozy hand-painted comic strategy style, warm upper-left light, crisp dark outlines, readable at 100 px, transparent background, no water, no labels, no UI, no people. Do not copy existing game sprites.

## `messenger-skiff-comic-v1.png`

> Create one original small isometric courier skiff for New Shores: compact light wooden rowboat with two oars, sealed parchment chest and a tiny red pennant, Roman-inspired hand-painted comic strategy style, 3/4 view with bow upper right, warm upper-left light, readable at 70 px, transparent background, no water plane, no text, no UI, no people, no rectangular shadow. Original design.

Runtime mapping: `src/main.js` loads the two building images directly, crops the ship strip at columns 0/1/2 for merchant/transport/warship, and draws the courier skiff separately.

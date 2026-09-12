# New Shores — Settlers IV / iPhone Feature Audit

> Historischer Audit, nicht aktueller Funktionsstand. Der verbindliche neue Abgleich und die verbleibenden Lücken stehen in [STRATEGIE_AUSBAU.md](STRATEGIE_AUSBAU.md). Insbesondere Militär, Pioniere, Geologen, Territorien und Metallketten wurden inzwischen als vereinfachte Systeme ergänzt.

Updated 12 September 2026. This is a behavioral coverage ledger, not a claim of asset or code equivalence. `New Shores` uses original art and code. “Reference” means the 2001 PC game and, where noted, the narrower 2009 iPhone adaptation.

## Scope verdict

The current build is a complete **peaceful economy vertical slice**, not a complete recreation of either commercial game. It contains terrain, construction, workers, transport, nine production/housing buildings, consumption, saving, speed controls, help, and a tutorial. It does **not** yet contain the original’s campaigns, civilizations, full tool/metal/food economy, specialists, territory, fog, combat, ships, trade, religion, Dark Tribe, multiplayer, or victory systems.

The iPhone version itself was not feature-identical to the PC release: it offered 21 campaign missions but omitted Skirmish, Freeplay, and multiplayer.[3] Therefore this audit treats “PC IV,” “iPhone,” and “homage target” separately.

## Status key

- **Implemented** — playable and simulated now.
- **Partial / adapted** — working subset or intentionally altered rule.
- **Missing** — reference mechanic not present.
- **Out of vertical slice** — documented, but deliberately deferred because it is a separate game-scale system.

## 1. Core play and modes

| Feature | How the reference plays | New Shores status |
|---|---|---|
| Indirect economic control | The player places buildings and sets policy; ordinary settlers are assigned by AI rather than selected directly.[1][4] | **Implemented.** Workers self-select construction and delivery tasks. |
| Real-time simulation | Production, movement, and construction continue together; settlement health depends on linked chains.[1][4] | **Implemented.** Pausable real-time loop with 1×/2×/4× speed. |
| Starting settlement | Maps begin with settlers, tools, materials, and a small settlement.[1] | **Partial.** Storehouse, five workers, food, wood, stone, and beds; no starting tools. |
| Campaign | PC IV has race campaigns plus a Dark Tribe campaign; the iPhone version has 21 missions.[1][3] | **Missing / out of slice.** One tutorial sandbox only. |
| Tutorial missions | PC manual recommends extensive tutorials; iPhone’s first three Roman missions teach the game.[2][3] | **Partial.** Five-step in-world tutorial. |
| Free maps / free settle | PC supports configurable non-campaign maps and Free Settle.[1] | **Partial.** One endless local sandbox, no setup screen or map choice. |
| Conflict, cooperation, economy, settlefest, ranking modes | PC Free Maps/multiplayer provides distinct objectives and victory rules.[1] | **Missing / out of slice.** |
| Skirmish / multiplayer | PC supports AI opponents, LAN and online play; iPhone omitted Skirmish, Freeplay and multiplayer.[1][2][3] | **Missing / out of slice.** |
| Difficulty, starting goods, victory setup | PC lets players configure opponents, starting materials, and victory conditions.[1] | **Missing.** |
| Random maps / map editor | Added to PC by Mission CD and included in later editions.[1] | **Partial.** Deterministic organic generator, no seed picker/editor. |

## 2. Camera, selection, information, and control

| Feature | Reference behavior | New Shores status |
|---|---|---|
| Isometric map | Dense readable settlement viewed from a fixed isometric angle. | **Implemented.** Original 2:1 isometric canvas renderer. |
| Pan and zoom | iPhone uses touch navigation but reviews criticized limited zoom range.[3] | **Implemented.** Drag to pan, wheel/pinch-equivalent browser zoom range 0.5–1.45. |
| Tap/click building inspection | iPhone identifies a building and exposes missing inputs when tapped.[3] | **Partial.** Building name, construction %, description, and road state; no full input/output buffer panel. |
| Build menus and categories | PC has multiple building submenus; iPhone streamlines a heavily icon-driven interface.[2][3] | **Partial.** One scrollable dock with ten actions; no category hierarchy. |
| Tooltips / help | Extended tooltips and help are core onboarding aids; iPhone provides a pause-menu help section.[2][3] | **Implemented subset.** Help modal, costs, descriptions, and placement errors. |
| Profession selection | iPhone has a profession menu and multi-touch group selection.[3] | **Missing.** Workers are not manually reassigned. |
| Production and goods control | PC lets players set goods transport priority and production decisions.[1][2] | **Partial.** Six-item transport-priority control; no target stock or per-building stoppage. |
| Minimap | Strategic overview and navigation. | **Implemented.** Clickable, throttled minimap showing terrain, forests, roads, and buildings. |
| Notifications | The iPhone review specifically notes weak economic-blockage notifications.[3] | **Partial improvement.** Toasts for deliveries, completion, low food, and placement; no persistent alerts queue. |
| Save/load | Long missions require persistence. | **Implemented.** Versioned local save, Continue, five-second autosave, resource depletion and priorities persisted. |

## 3. Terrain, world, and readable life

| Feature | Reference behavior | New Shores status |
|---|---|---|
| Organic landmasses and coasts | Play spaces contain grassland, shoreline, water, mountains, and shaped regions rather than a rectangular tile carpet. | **Implemented in current milestone.** A ground-filling 50×50 mainland keeps map borders outside the normal viewport, with a distant river coast and directional original shore art. |
| Forest ecosystems | Trees form readable forests; woodcutters remove them and foresters replenish them. | **Implemented.** Clustered woodland belts, felling, regrowth, and clearing constraints. |
| Mountains and deposits | Geologists prospect mountain ground for coal, iron, gold, sulfur, and stone sites.[1][3][4] | **Partial.** Clustered, exhaustible surface stone; no mountains, geologist, signs, or underground ores. |
| Water economy | Sea supports fish, landing docks, ferries, trade ships, and warships.[1][2] | **Partial.** Coast placement and fishing only. |
| Fog of war / exploration | Specialists reveal and expand the usable map; pioneers are important early explorers.[4] | **Missing.** Entire island visible. |
| Territory ownership | Pioneers dig borders and military buildings claim/hold land.[1] | **Missing.** One unrestricted friendly island. |
| Corrupted terrain | Dark Tribe spreads shadow terrain; gardeners reclaim it.[1][2] | **Missing / out of slice.** |
| Environmental density | Tiny props, vegetation, active settlers, stock and production signals make the map feel alive. | **Partial.** Trees, rock outcrops, flowers, berries/mushrooms, logs/stumps, reeds, workers; lacks wildlife, crop-stage art, smoke, flags, shore fauna. |
| Weather / day-night | Not a defining documented PC IV economy rule. | **Not targeted.** Warm static daylight preserves readability. |

## 4. Construction, labor, and logistics

| Feature | Reference behavior | New Shores status |
|---|---|---|
| Site leveling and construction phases | Diggers level a site, carriers deliver materials, then builders construct it.[4] | **Partial.** Visible scaffolding and worker trip/progress; no distinct leveling job or delivered-material piles. |
| Material costs | Wood/planks and stone are required for construction.[2][4] | **Implemented subset.** Wood and stone paid at placement; planks produced but not yet used in costs. |
| Autonomous carriers | Serfs transport materials and products through the settlement.[1][4] | **Implemented.** Workers collect ready goods and carry them home. |
| Free walking | Settlers IV ordinary settlers do **not** need roads; AI pathfinds freely in owned territory.[1] | **Implemented for the slice.** Carriers cross open country; a connected road provides a deliberate route but is not required. |
| Goods priority | Player decides which goods get carrier attention first.[1][2] | **Implemented subset.** Click an inventory good to make it priority 1. |
| Local building buffers | Production stalls when required inputs are missing; inspection reveals shortages.[3] | **Partial.** Global stocks gate cycles; no per-building input/output storage. |
| Warehouses / storage areas | Central and distributed storage organize goods and carrier routes. | **Partial.** One storehouse, no secondary warehouses or stock policies. |
| Marketplaces and land trade | Marketplaces establish routes between settlement areas; donkey caravans move goods.[1][2] | **Missing.** |
| Sea transport | Docks, trade ships, and ferries connect otherwise separated regions.[1] | **Missing.** |
| Congestion and carrier capacity | Economy quality emerges from distance, available carriers, and transport priorities.[1][4] | **Partial.** Five carriers and real travel time; no congestion/collision, role counts, or carrier tools. |

## 5. Population, food, tools, and production

| Chain / rule | Reference behavior | New Shores status |
|---|---|---|
| Population growth | Residences create new settlers; larger housing yields more.[1][4] | **Implemented subset.** A residence adds four beds and two people. |
| Worker assignment | Idle settlers become needed builders, carriers, building workers, specialists, or soldiers.[1][4] | **Partial.** Shared worker pool; buildings do not permanently employ professions. |
| Food purpose | PC IV food is particularly needed to keep miners working.[2] | **Adapted.** Settlement-wide periodic consumption; no miner ration types. |
| Timber | Woodcutter fells trees; forester replants them. | **Implemented.** Exhaustible trees and regrowth. |
| Sawmill / boards | Timber is processed into construction material. | **Implemented.** Wood → two planks, though planks are not yet consumed. |
| Stone | Stonecutters gather building stone. | **Implemented.** Exhaustible quarry clusters. |
| Grain → flour → bread | Farms grow grain, mills grind flour, bakeries produce food. | **Implemented simplified chain.** Grain → flour → food with timed production. |
| Fishing | Fisher produces food near water. | **Implemented.** Coastal validation and timed food output. |
| Ranch/meat chain | Farms and ranches contribute food for miners.[2] | **Missing.** No animal husbandry, slaughterhouse, or meat. |
| Water supply | Waterworker/wells support race-specific food or alcohol chains.[2] | **Missing.** |
| Coal and metal ores | Mines provide coal and metals.[2][4] | **Missing.** |
| Smelting | Smelters turn ores into metal bars.[2][4] | **Missing.** |
| Toolsmith | Tools are manufactured from metal/coal, and professions need the correct tool.[2][3] | **Missing.** This is a major economic-depth gap. |
| Weaponsmith | Weapons are produced through the metal chain for recruitment.[2][4] | **Missing.** |
| Gold and soldier rank | Gold/economic value contributes to military strength and ranked soldiers.[1] | **Missing.** |
| Alcohol and sacrifice | Race-specific alcoholic drinks are produced and offered to gods for magic.[2] | **Missing.** |
| Race-specific recipes | Romans, Vikings, Mayans, and Trojans vary in construction, alcohol, vehicles, magic, and military details.[1][2][5] | **Missing.** One original culture only. |

## 6. Specialists, territory, religion, and combat

| Feature | Reference behavior | New Shores status |
|---|---|---|
| Pioneer | Directable specialist expands territory at borders.[1][4] | **Missing.** |
| Geologist | Directable specialist surveys mountains and marks deposits.[1][3][4] | **Missing.** |
| Thief | Scouts enemy territory and steals goods.[1] | **Missing.** |
| Gardener | Reclaims Dark Tribe-corrupted land and is required for that campaign’s decisive objectives.[1] | **Missing.** |
| Saboteur | Multiplayer specialist destroys enemy buildings.[1] | **Missing.** |
| Priests and magic | Alcohol sacrifice powers race-specific divine effects.[2] | **Missing.** |
| Barracks recruitment | An idle settler plus the required weapon becomes a soldier.[3][4] | **Missing.** |
| Swordsmen, bowmen, ranks | Player recruits multiple soldier types/ranks; PC IV exposes rank choice from the start.[1] | **Missing.** |
| Squad leaders and specialist fighters | PC IV adds tactical specialist units and leaders.[1] | **Missing.** |
| Military buildings / borders | Towers and other military structures secure and expand territory. | **Visual-only / missing system.** Guard tower can be built but does not claim land or fight. |
| Offensive strength / eyecatchers | Settlement economic/aesthetic value affects offensive strength; eyecatcher balance changed in the Trojan expansion.[1][2] | **Missing.** |
| War machines and warships | Armies include race-specific machines and naval combat.[1][2] | **Missing.** |
| Enemy AI and conquest | Most maps culminate in territory capture or special objective completion.[1] | **Missing / out of slice.** |
| Dark Tribe | Morbus’s faction corrupts green land and cannot be solved solely by ordinary conquest.[1][2][5] | **Missing / out of slice.** |

## 7. Buildings presently playable

| Building | Current function | Functional? |
|---|---|---|
| Storehouse | Delivery destination and settlement center | Yes |
| Woodcutter | Removes nearby tree; yields timber | Yes |
| Stonecutter | Depletes nearby rock; yields stone | Yes |
| Residence | Adds beds and settlers | Yes |
| Guard tower | Constructible landmark | **Cosmetic system gap:** no territory/combat |
| Forester | Plants a tree on nearby open grass | Yes |
| Sawmill | Converts wood to planks | Yes |
| Wheat farm | Produces grain | Yes, simplified (no field stages) |
| Windmill | Converts grain to flour | Yes |
| Bakery | Converts flour to food | Yes |
| Fisher hut | Produces food when placed near water | Yes |

## 8. Current vertical-slice definition of done

The peaceful slice is complete only when all of these remain true in a browser test:

1. Start a new island, pan, zoom, inspect, and use the minimap.
2. Place a woodcutter beside a forest, connect it, watch a worker fell and deliver timber.
3. Place a stonecutter by an outcrop, watch depletion and delivery.
4. Run wood → planks and grain → flour → food chains with visible workers.
5. Place a coastal fisher only where water is in reach.
6. Construct a residence and observe population/beds increase.
7. Observe food consumption and shortage feedback.
8. Change transport priority and see the ordering persist.
9. Reload and Continue without losing buildings, roads, stocks, depleted trees/rocks, tutorial progress, or Eco mode.
10. Run without console errors and remain usable in Eco mode.

## 9. Recommended implementation sequence

1. **Finish the economy simulation:** per-building buffers, stop/start controls, visible shortages, tools, coal, iron, smelter, toolsmith, plank construction costs.
2. **Correct IV-style logistics:** free pathfinding in owned territory; roads become optional speed/visual infrastructure instead of a hard requirement.
3. **Add land systems:** mountains, geologist prospecting, fog, pioneers, border/territory claiming, functional towers.
4. **Deepen food:** field growth/harvest, water supply, ranch/meat, miner-specific feeding.
5. **Add peaceful trade:** extra warehouses, markets, donkey routes, docks and cargo ships.
6. **Only then add combat:** barracks, weapons, soldier ranks, capture, enemy AI, objective/victory framework.
7. **Game-scale content:** civilizations, distinct building sets, campaigns, magic, Dark Tribe, naval warfare, multiplayer. These are separate milestones, not polish tasks.

## Sources

[1] [The Settlers IV gameplay and modes overview](https://en.wikipedia.org/wiki/The_Settlers_IV) — synthesis citing the original Blue Byte instruction manual; modes, settlers, specialists, roads, trade, ships, campaigns, expansion systems.

[2] [The Settlers IV user manual transcription](https://manualmachine.com/gamespc/thesettlersiv/1119087-user-manual/) — primary manual content; economic chains, tools, food, alcohol, trade, combat, tutorial and interface.

[3] [Pocket Gamer: The Settlers iPhone review](https://www.pocketgamer.com/the-settlers-iphone/review/) — contemporary iPhone review; 21 missions, touch/UI behavior, queues, building inspection, geologists, omitted modes.

[4] [GameSpot: Settlers IV preview](https://www.gamespot.com/articles/settlers-iv-preview/1100-2672967/) — contemporary explanation of indirect control, construction labor, profession conversion, exploration, metal chain, barracks, and housing.

[5] [Ubisoft: The Settlers IV History Edition](https://www.ubisoft.com/en-us/games/the-settlers-iv-history-edition) — official confirmation of the modern edition’s Romans, Vikings, Mayans, Trojans, Dark Tribe and Morbus.

### Research limits

The original manual is the strongest mechanical source but some online copies are scans/transcriptions and race-specific numeric balance is not consistently extractable. The iPhone review confirms its content structure and omissions but is not a complete manual. Accordingly, this audit claims feature families and player-facing behavior, not undocumented exact costs, cycle times, AI constants, or campaign scripts.

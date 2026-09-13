// CC0 recordings; exact sources, authors and edits are in assets/audio/SOURCES.md.
const woodHammer=[new URL('../assets/audio/wood-hammer-1.mp3',import.meta.url).href,new URL('../assets/audio/wood-hammer-2.mp3',import.meta.url).href];
const woodHit=[new URL('../assets/audio/wood-hit-1.mp3',import.meta.url).href,new URL('../assets/audio/wood-hit-2.mp3',import.meta.url).href];
const metalHammer=[new URL('../assets/audio/metal-hammer-1.mp3',import.meta.url).href,new URL('../assets/audio/metal-hammer-2.mp3',import.meta.url).href];
const cheer=[new URL('../assets/audio/cheer.mp3',import.meta.url).href];
export const sampleEffects={
  chop:{files:woodHit,gain:.28,cooldown:.32},
  build:{files:woodHammer,gain:.3,cooldown:.25},
  craft:{files:woodHammer,gain:.22,cooldown:.25},
  quarry:{files:metalHammer,gain:.2,cooldown:.35},
  anvil:{files:metalHammer,gain:.24,cooldown:.35},
  fall:{files:[new URL('../assets/audio/tree-fall.mp3',import.meta.url).href],gain:.32,cooldown:1.2},
  complete:{files:cheer,gain:.24,cooldown:3},
  discovery:{files:cheer,gain:.2,cooldown:3},
};

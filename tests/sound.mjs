import assert from 'node:assert/strict';
import {createSound,effects,productionSounds} from '../src/sound.js';
import {recipes} from '../src/strategy.js';
for(const type of Object.keys(recipes))assert(effects[productionSounds[type]],type+' audio coverage');
for(const [kind,values] of Object.entries(effects)){assert.equal(values.length,3);assert(values.every(Number.isFinite),kind);assert(values[0]>0);}
const sound=createSound();assert.equal(sound.enabled,false);assert.equal(sound.play('chop'),false);
sound.setVolume('music',-1);assert.equal(sound.levels.music,0);sound.setVolume('effects',8);assert.equal(sound.levels.effects,1);
sound.setVolume('music',NaN);assert.equal(sound.levels.music,0);assert.equal(await sound.setEnabled(true),false,'unsupported browser fails safely');
console.log('PASS: every production recipe mapped, valid effects, opt-in, bounded volumes and unsupported audio fallback');

import assert from 'node:assert/strict';
import {hasWaterNear} from '../src/coast.js';

const land=Array.from({length:50},()=>Array(50).fill('grass'));
assert.equal(hasWaterNear(land,{x:2,y:25},3,{worldEdge:true}),true,'lighthouse may stand behind two land tiles at the left world coast');
assert.equal(hasWaterNear(land,{x:25,y:2},3,{worldEdge:true}),true,'top world coast is treated like sea');
assert.equal(hasWaterNear(land,{x:47,y:25},3,{worldEdge:true}),true,'right world coast is treated like sea');
assert.equal(hasWaterNear(land,{x:25,y:47},3,{worldEdge:true}),true,'bottom world coast is treated like sea');
assert.equal(hasWaterNear(land,{x:3,y:25},3,{worldEdge:true}),false,'three intervening land tiles are too far from sea');
assert.equal(hasWaterNear(land,{x:2,y:25},2),false,'ordinary coastal production does not use the virtual world-edge sea');
land[25][20]='water';assert.equal(hasWaterNear(land,{x:23,y:25},3,{worldEdge:true}),true,'real water is accepted at the same radius');
console.log('PASS: lighthouse coast radius and symmetric virtual sea beyond all four world edges');

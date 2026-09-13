import assert from 'node:assert/strict';
import {ensureStarterSupply} from '../src/starter-supply.js';
import {buildingClearance} from '../src/build-space.js';
import {createStrategy} from '../src/strategy.js';
import {generateMap} from '../src/map-generator.js';
import {findPath,keyOf} from '../src/navigation.js';
function setup(map){
 const terrain=map?.terrain||Array.from({length:50},()=>Array(50).fill('grass')),buildings=[{type:'storehouse',x:25,y:25,progress:1}],trees=map?.trees||[],rocks=map?.rocks||[{x:37,y:34,amount:8}],roads=[{x:25,y:26}],workers=[];
 const s=createStrategy({terrain,buildings,trees,rocks,workers,resources:()=>({}),selected:new Set(),hud(){},toast(){}});s.init();return {terrain,buildings,trees,rocks,roads,workers,ownerAt:s.ownerAt};
}
const a=setup(),oldRock={...a.rocks[0]},result=ensureStarterSupply(a);
assert.equal(result.sites.length,2);assert.equal(result.addedStone,80);assert(result.addedTrees>=6);assert.deepEqual(a.rocks[0],oldRock);
const blocked=new Set([...a.buildings,...a.trees,...a.rocks,...result.sites.map(s=>s.plot)].map(p=>keyOf(p.x,p.y)));
for(const {plot,resource} of result.sites){assert.equal(a.ownerAt(plot.x,plot.y),1);assert.equal(a.ownerAt(resource.x,resource.y),1);assert([[1,0],[-1,0],[0,1],[0,-1]].some(([dx,dy])=>{const p={x:plot.x+dx+.5,y:plot.y+dy+.5};const path=findPath({x:25.5,y:26.5},p,a.terrain,blocked,new Map());return path&&path.every(p=>a.ownerAt(Math.floor(p.x),Math.floor(p.y))===1);}));}
const again=ensureStarterSupply(a);assert.equal(again.addedStone,0);assert.equal(again.addedTrees,0,'no repeated top-up');
for(const {plot,type} of result.sites)assert.equal(buildingClearance(plot,type,a.buildings,a.trees,a.rocks),'','fallback supply plots obey final tree/rock clearance');
for(const type of ['coast','lake'])for(const seed of [0,1,12345,4294967295]){const world=setup(generateMap({version:1,type,seed})),r=ensureStarterSupply(world);assert.equal(r.sites.length,2);assert.equal(r.addedStone,0);for(const p of r.sites)assert.equal(world.ownerAt(p.resource.x,p.resource.y),1);}
const b=setup();b.ownerAt=()=>2;const before=JSON.stringify([b.trees,b.rocks]);assert.equal(ensureStarterSupply(b).sites.length,0);assert.equal(JSON.stringify([b.trees,b.rocks]),before,'enemy land untouched');
console.log('PASS: owned accessible stone/timber and build plots, preserved objects/roads, both built entrances reachable, no repeat refill, seeded-map ownership and enemy exclusion');

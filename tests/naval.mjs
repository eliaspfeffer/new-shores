import assert from 'node:assert/strict';
import {createNaval,nearestWater,waterRoute,shipSpecs} from '../src/naval.js';

const terrain=Array.from({length:18},(_,y)=>Array.from({length:18},(_,x)=>x<6||x>11?'grass':'water'));
const buildings=[
  {type:'shipyard',x:5,y:4,owner:1,progress:1},
  {type:'harbor',x:5,y:8,owner:1,progress:1},
  {type:'harbor',x:12,y:8,owner:1,progress:1},
  {type:'tower',x:12,y:4,owner:2,progress:1},
];
const workers=Array.from({length:45},(_,id)=>({id,x:5,y:8,owner:1,unit:id%3?'swordsman':'archer',phase:'guard',hp:55}));
const resources={planks:100,iron:100,wood:20};const state={};const notices=[];
const naval=createNaval({terrain,buildings,workers,state,stock:()=>resources,notify:m=>notices.push(m)});
assert(nearestWater(terrain,buildings[0]));assert(waterRoute(terrain,{x:6.5,y:4.5},{x:11.5,y:8.5}));
assert(naval.enqueue(buildings[0],'merchant'));assert.equal(resources.planks,100-shipSpecs.merchant.planks);naval.tick(30);assert.equal(naval.state.ships[0].type,'merchant');
assert(naval.sendCargo(buildings[1],'wood',12));assert.equal(resources.wood,8);for(let i=0;i<20;i++)naval.tick(1);assert.equal(buildings[2].stored.wood,12);
assert(naval.enqueue(buildings[0],'transport'));naval.tick(38);assert(naval.transportTroops(buildings[1]));assert.equal(naval.state.ships.find(s=>s.type==='transport').passengers.length,40);for(let i=0;i<20;i++)naval.tick(1);assert.equal(workers.filter(w=>w.embarkedShip!==undefined).length,0);assert.ok(workers.some(w=>w.x>11));
assert(naval.sendCourier(buildings[1],'Frieden?'));for(let i=0;i<20;i++)naval.tick(1);assert(notices.some(n=>n.includes('Frieden?')));
const snapshot=JSON.parse(JSON.stringify(state.naval));state.naval={version:1,ships:[],nextId:1};naval.restore(snapshot);assert.ok(state.naval.ships.length>=2);
console.log('PASS: shipbuilding, saved water routes, cargo conservation, mass troop transport and physical courier');

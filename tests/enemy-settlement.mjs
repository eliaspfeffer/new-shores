import assert from 'node:assert/strict';
import {createEnemySettlement,playerStrength} from '../src/enemy-settlement.js';
import {findPath} from '../src/navigation.js';

const terrain=Array.from({length:50},()=>Array(50).fill('grass'));
const buildings=[{type:'storehouse',owner:1,x:25,y:25,progress:1},{type:'sawmill',owner:1,x:24,y:25,progress:1},{type:'farm',owner:1,x:23,y:25,progress:1},{type:'tower',owner:2,x:37,y:14,progress:1,garrison:0}];
const workers=[{id:0,owner:1,x:25,y:26,role:'carrier',phase:'idle'},{id:1,owner:2,x:37,y:15,unit:'swordsman',hp:55,phase:'guard'}];
const state={};let revealed=0,recalculated=0,message='';
const ai=createEnemySettlement({state,buildings,workers,terrain,trees:[],rocks:[],notify:m=>message=m,reveal:()=>revealed++,recalculate:()=>recalculated++});
assert.deepEqual(playerStrength(buildings,workers),{economy:2,army:0,targetBuildings:4,targetArmy:3});
assert.equal(ai.discover({x:40,y:20}),true);assert.equal(ai.discover({x:40,y:20}),false);
assert.equal(state.enemySettlement.discovered,true);assert.ok(buildings.filter(b=>b.owner===2).length<=playerStrength(buildings,workers).targetBuildings+1);
assert.equal(workers.filter(w=>w.owner===2&&w.unit).length,3);assert.ok(revealed>0);assert.ok(recalculated>0);assert.match(message,/Brücke/);
assert.equal(terrain[14][31],'water');
assert.equal(findPath({x:30.5,y:14.5},{x:37.5,y:14.5},terrain,new Set(),new Map()),null,'water ring isolates the enemy island');
terrain[14][31]='bridge';assert.ok(findPath({x:30.5,y:14.5},{x:37.5,y:14.5},terrain,new Set(),new Map()),'one bridge opens a real route to the island');
state.enemySettlement.grace=0;state.enemySettlement.recruitClock=74;ai.tick(2);assert.equal(state.enemyRaids,true);
console.log('PASS lighthouse creates a bounded weaker opponent on a genuinely isolated island; one bridge opens the route');

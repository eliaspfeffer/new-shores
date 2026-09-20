import assert from 'node:assert/strict';
import {createEnemySettlement,playerStrength} from '../src/enemy-settlement.js';

const terrain=Array.from({length:50},()=>Array(50).fill('grass'));
const buildings=[{type:'storehouse',owner:1,x:25,y:25,progress:1},{type:'sawmill',owner:1,x:24,y:25,progress:1},{type:'farm',owner:1,x:23,y:25,progress:1},{type:'tower',owner:2,x:37,y:14,progress:1,garrison:0}];
const workers=[{id:0,owner:1,x:25,y:26,role:'carrier',phase:'idle'},{id:1,owner:2,x:37,y:15,unit:'swordsman',hp:55,phase:'guard'}];
const state={};let revealed=0,recalculated=0,message='';
const ai=createEnemySettlement({state,buildings,workers,terrain,trees:[],rocks:[],notify:m=>message=m,reveal:()=>revealed++,recalculate:()=>recalculated++});
assert.deepEqual(playerStrength(buildings,workers),{economy:2,army:0,targetBuildings:4,targetArmy:3});
assert.equal(ai.discover({x:40,y:20}),true);assert.equal(ai.discover({x:40,y:20}),false);
assert.equal(state.enemySettlement.discovered,true);assert.ok(buildings.filter(b=>b.owner===2).length<=playerStrength(buildings,workers).targetBuildings+1);
assert.equal(workers.filter(w=>w.owner===2&&w.unit).length,3);assert.ok(revealed>0);assert.ok(recalculated>0);assert.match(message,/etwas schwächer/);
state.enemySettlement.grace=0;state.enemySettlement.recruitClock=74;ai.tick(2);assert.equal(state.enemyRaids,true);
console.log('PASS lighthouse discovery creates a bounded, weaker opponent and enables delayed pressure');

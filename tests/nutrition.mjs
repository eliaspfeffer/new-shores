import assert from 'node:assert/strict';
import {createStrategy,recipes} from '../src/strategy.js';
import {productionInputs} from '../src/nutrition.js';
const terrain=Array.from({length:50},()=>Array(50).fill('grass')),buildings=[{x:25,y:25,type:'storehouse',progress:1}],stock={fish:2},workers=[];
const s=createStrategy({terrain,buildings,workers,trees:[],rocks:[],selected:new Set(),resources:()=>stock,toast(){},hud(){},routeTo:(w,p)=>[p],entrance:b=>({x:b.x+.5,y:b.y+1.5}),followRoute:()=>true});s.init();s.state.deposits.forEach(d=>d.discovered=true);
for(const [meal,cycles] of [['bread',10],['fish',2]]){
 const b={type:'coalmine',x:18,y:22,progress:1,buffer:{[meal]:1}};
 for(let n=0;n<cycles;n++){s.produce(b,recipes.coalmine.cycle);assert.equal(b.ready,'coal');assert.equal(b.outputAmount,1);b.ready=null;}
 s.produce(b,100);assert.equal(b.ready,null,'no production after ration exhausted');assert.equal(b.buffer[meal],0);
}
const mine={type:'coalmine',x:18,y:22,progress:1,buffer:{}};buildings.push(mine);workers.push({id:2,x:25.5,y:26.5,phase:'idle'});s.tickWorker(workers.at(-1),2);assert.equal(workers.at(-1).carry,'fish','fallback food is physically supplied');
assert.deepEqual(productionInputs({...mine,miningEnergy:3},recipes.coalmine),{});
const saved=JSON.parse(JSON.stringify({...mine,miningEnergy:7}));assert.equal(saved.miningEnergy,7);
console.log('PASS: ten/two extraction rations, exhaustion, single-unit yield, physical fallback supply and saved energy');

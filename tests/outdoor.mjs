import assert from 'node:assert/strict';
import {createOutdoor} from '../src/outdoor.js';
import {createWorkforce} from '../src/workforce.js';
import {recipes} from '../src/strategy.js';
const terrain=Array.from({length:20},()=>Array(20).fill('grass'));
for(let y=0;y<20;y++){terrain[y][15]='shore';terrain[y][16]='water';}
const buildings=[{x:5,y:5,type:'farm',progress:1},{x:10,y:10,type:'forester',progress:1},{x:14,y:5,type:'fisher',progress:1}],trees=[],workers=buildings.map((b,id)=>({id,x:b.x+.5,y:b.y+1.5,phase:'staffWait',employerIndex:id,workTool:true})),stock={tools:0};
const api={terrain,buildings,trees,workers,rocks:[],roads:[],recipes,resources:()=>stock,entrance:b=>({x:b.x+.5,y:b.y+1.5}),routeTo:(w,p)=>[p],followRoute(w){Object.assign(w,w.route?.at(-1));return true;}};
const outdoor=createOutdoor(api),wf=createWorkforce({...api,outdoor});
for(let i=0;i<150;i++)wf.update(1);
assert.equal(buildings[0].ready,'grain');assert.equal(buildings[2].ready,'fish');assert.ok(trees.length>0);assert.ok(buildings[0].fields.length<=4);
assert.equal(workers[0].phase,'fieldWait');assert.equal(workers[2].phase,'fieldWait','output must be collected before another trip');
const count=trees.length;buildings[1].stopped=true;wf.update(1);wf.update(20);assert.equal(trees.length,count,'stopped forester no longer plants');
// Interrupted cargo stays on the settler, not in global inventory or a deleted building.
Object.assign(workers[0],{phase:'fieldReturn',workCarry:'grain',outdoorJob:null});buildings[0].ready=null;
const snapshot=JSON.parse(JSON.stringify({workers,buildings}));assert.equal(snapshot.workers[0].workCarry,'grain');
wf.beforeDemolish(0);assert.equal(workers[0].phase,'recoverCargo');assert.equal(workers[0].carry,'grain');assert.equal(stock.grain,undefined);
console.log('PASS: field growth/harvest, shoreline fishing, planting, output backpressure, stop and preserved cargo on demolition');

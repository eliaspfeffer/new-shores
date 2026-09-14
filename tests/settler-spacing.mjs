import assert from 'node:assert/strict';
import {createSettlerSpacing} from '../src/settler-spacing.js';
const terrain=Array.from({length:20},()=>Array(20).fill('grass'));
const workers=Array.from({length:20},(_,id)=>({id,x:10.5,y:10.5,phase:'idle'}));
const blocked=new Set(['9,9']);terrain[8].fill('water');
const move=(w,x,y,dt)=>{const d=Math.hypot(x-w.x,y-w.y),s=Math.min(d,dt*.72);if(d){w.x+=(x-w.x)/d*s;w.y+=(y-w.y)/d*s;}return s>=d;};
const tick=createSettlerSpacing({workers,terrain,blocked:()=>blocked,move});
for(let i=0;i<1500;i++)tick(.05);
for(const w of workers){assert.notEqual(Math.floor(w.y),8);assert.ok(!blocked.has(Math.floor(w.x)+','+Math.floor(w.y)));for(const other of workers)if(other!==w)assert.ok(Math.hypot(w.x-other.x,w.y-other.y)>=.4,'idle crowd separates');}
const settled=JSON.stringify(workers);for(let i=0;i<300;i++)tick(.05);assert.equal(JSON.stringify(workers),settled,'no endless drifting');
workers.push({id:25,x:10.5,y:10.5,phase:'inbound',carry:'wood',route:[{x:12,y:12}]},{id:26,x:10.5,y:10.5,phase:'working',task:{}},{id:27,x:10.5,y:10.5,phase:'idle',inside:true});
const busy=JSON.stringify(workers.slice(-3));for(let i=0;i<100;i++)tick(.05);assert.equal(JSON.stringify(workers.slice(-3)),busy,'cargo, jobs and indoor staff untouched');
console.log('PASS: crowd separation, non-grid stable positions, obstacles, no drift and active-job priority');

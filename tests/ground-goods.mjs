import assert from 'node:assert/strict';
import {createGroundGoods,validateGroundGoods,pileTotal} from '../src/ground-goods.js';
import {findPath} from '../src/navigation.js';
import {rerouteStorageAfterDemolition} from '../src/storage.js';
import {parseSave} from '../src/savegames.js';
const point=p=>p&&p.x>=0&&p.y>=0&&p.x<12&&p.y<12;
function fixture(){
  const state={groundPiles:[]},workers=[0,1,2].map(id=>({id,x:2.5,y:2.5,phase:'idle'})),buildings=[{type:'storehouse',x:1,y:1,progress:1}],stock={},terrain=Array.from({length:12},()=>Array(12).fill('grass')),blocked=new Set(['1,1']);let enemy=false,blockHome=false;
  const entrance=b=>blockHome?null:{x:b.x+.5,y:b.y+1.5},routeTo=(from,to)=>findPath(from,to,terrain,blocked,new Map());
  const followRoute=w=>{const p=w.route?.[w.routeIndex++];if(p){w.x=p.x;w.y=p.y;}return w.routeIndex>=w.route.length;};
  const api={state,workers,buildings,resources:()=>stock,obstacles:()=>blocked,entrance,routeTo,followRoute,ownerAt:x=>enemy&&x>=5?2:1},goods=createGroundGoods(api);
  const tick=()=>{for(const w of workers)if(!goods.tick(w,.5))goods.assign(w,.5);};
  return {state,workers,buildings,stock,terrain,blocked,goods,tick,api,setEnemy:v=>enemy=v,setBlocked:v=>blockHome=v};
}
{
 const f=fixture();f.goods.drop({x:6,y:5},{stone:2,planks:3});assert.equal(pileTotal(f.state.groundPiles[0]),5);
 f.tick();assert.equal(f.workers.filter(w=>w.phase==='salvagePickup').length,2);assert.ok(f.workers.every(w=>!w.carry));assert.equal(f.state.groundPiles[0].goods.stone,2);
 for(let i=0;i<200;i++)f.tick();assert.deepEqual(f.stock,{stone:2,planks:3});assert.equal(f.state.groundPiles.length,0);assert.ok(f.workers.every(w=>w.phase==='idle'));
}
{
 const f=fixture();f.goods.drop({x:6,y:5},{stone:1});f.tick();assert.equal(f.workers.filter(w=>w.salvageTarget).length,1,'one item cannot have two collectors');
 f.workers[0].manualTarget={x:3,y:3};f.tick();assert.equal(f.workers[0].phase,'idle');assert.equal(f.goods.at(6,5).goods.stone,1,'manual cancellation before pickup preserves goods');
 f.setEnemy(true);for(let i=0;i<30;i++)f.tick();assert.equal(f.goods.at(6,5).goods.stone,1);assert.deepEqual(f.stock,{});
}
{
 const f=fixture();f.goods.drop({x:6,y:5},{stone:1});f.setBlocked(true);for(let i=0;i<10;i++)f.tick();assert.ok(f.workers.every(w=>!w.salvageTarget));f.setBlocked(false);
 while(!f.workers.some(w=>w.phase==='salvageReturn'))f.tick();const w=f.workers.find(w=>w.carry);assert.equal(w.carryAmount,1);assert.equal(f.state.groundPiles.length,0);
 const saved=JSON.parse(JSON.stringify({state:f.state,workers:f.workers}));validateGroundGoods(saved.state,saved.workers,point);
 f.workers.splice(0,f.workers.length,...saved.workers);Object.assign(f.state,saved.state);f.setBlocked(true);f.workers.find(w=>w.carry).route=null;f.workers.find(w=>w.carry).salvageRouteClock=0;
 for(let i=0;i<20;i++)f.tick();assert.deepEqual(f.stock,{});assert.equal(f.workers.filter(w=>w.carry).length,1,'blocked cargo remains on carrier');
 f.setBlocked(false);for(let i=0;i<50;i++)f.tick();assert.equal(f.stock.stone,1);
}
{
 const f=fixture();f.buildings.push({type:'warehouse',x:6,y:4,progress:1,owner:1});f.blocked.add('6,4');f.goods.drop({x:6,y:6},{wood:1});
 while(!f.workers.some(w=>w.phase==='salvageReturn'))f.tick();const w=f.workers.find(w=>w.carry);assert.equal(w.storageIndex,1);
 f.buildings.splice(1,1);f.blocked.delete('6,4');rerouteStorageAfterDemolition(f.workers,1,f.buildings,f.api.entrance,f.api.routeTo);
 assert.equal(w.phase,'salvageReturn');for(let i=0;i<50;i++)f.tick();assert.equal(f.stock.wood,1);
}
{
 const f=fixture();f.goods.drop({x:6,y:5},{stone:1});while(!f.workers.some(w=>w.carry))f.tick();const w=f.workers.find(w=>w.carry);w.dead=true;f.tick();assert.equal(f.state.groundPiles.reduce((n,p)=>n+pileTotal(p),0),1);assert.equal(w.carry,null);
}
{
 const s={version:7,resources:{wood:1},buildings:[{type:'storehouse',x:1,y:1,progress:1}],roads:[],workers:[],strategy:{physicalSalvage:true,groundPiles:[{x:3,y:3,goods:{stone:2}}]}};
 assert.equal(parseSave(JSON.stringify(s),['storehouse']).strategy.groundPiles[0].goods.stone,2);
 assert.throws(()=>parseSave(JSON.stringify({...s,version:6}),['storehouse']));
 for(const goods of [{stone:-1},{stone:0},{stone:1.5},{imaginary:1}])assert.throws(()=>parseSave(JSON.stringify({...s,strategy:{groundPiles:[{x:3,y:3,goods}]}}),['storehouse']));
 assert.throws(()=>validateGroundGoods({groundPiles:[...s.strategy.groundPiles,...s.strategy.groundPiles]},[],point));
 assert.throws(()=>validateGroundGoods({},[{phase:'salvageReturn',carry:'stone',carryAmount:2}],point));
}
console.log('PASS: physical salvage conservation, exclusive reservations, manual cancellation, territory, blocked paths, in-flight reload, depot demolition, dead-carrier drop and save validation');

import assert from 'node:assert/strict';
import {createStrategy} from '../src/strategy.js';
import {setProductionOrder} from '../src/production-orders.js';
import {createJournal} from '../src/command-journal.js';
import {restoreCamera} from '../src/camera-save.js';
import {parseSave} from '../src/savegames.js';
import {createOutdoor} from '../src/outdoor.js';
const terrain=Array.from({length:50},()=>Array(50).fill('grass')),buildings=[{type:'storehouse',x:25,y:25,progress:1},{type:'barracks',x:26,y:25,progress:1}],workers=Array.from({length:6},(_,id)=>({id,x:25.5,y:26.5,phase:'idle',t:0})),resources={swords:10,bows:10,gold:20,people:6},selected=new Set([5]);
let blocked=false;
const entrance=b=>({x:b.x+.5,y:b.y+1.5}),routeTo=(w,p)=>blocked?null:[{...p}],followRoute=w=>{const p=w.route?.[w.routeIndex++];if(p){w.x=p.x;w.y=p.y;}return w.routeIndex>=w.route.length;};
const api={terrain,buildings,workers,resources:()=>resources,trees:[],rocks:[],routeTo,entrance,followRoute,selected,toast(){},hud(){},isSeen:()=>true,hasWater:()=>true};
const strategy=createStrategy(api),b=buildings[1];strategy.recalculate();
assert(strategy.armyOrders.reserve(2));assert(!strategy.armyOrders.reserve(-1));
assert(strategy.armyOrders.rally(b,{x:28,y:28}));assert(!strategy.armyOrders.rally(b,{x:80,y:1}));
assert(strategy.armyOrders.enqueue(b,'archer',2,2));assert(!strategy.armyOrders.enqueue(b,'wizard',1,1));assert(!strategy.armyOrders.enqueue(b,'archer',1,0));
strategy.tick(4);assert.equal(b.recruitQueue[0].progress,4);assert.equal(resources.bows,10);
assert.equal(workers[0].phase,'recruitTraining');assert.equal(workers[0].inside,true);
b.stopped=true;strategy.tick(8);assert.equal(b.recruitQueue[0].progress,4);b.stopped=false;
strategy.tick(4);assert.equal(resources.bows,9);assert.equal(resources.gold,19);assert.equal(b.recruitQueue[0].count,1);assert.deepEqual([...selected],[5]);
const soldier=workers[0];assert.equal(soldier.unit,'archer');assert.deepEqual({x:soldier.x,y:soldier.y},entrance(b),'soldier leaves through the barracks door');assert.deepEqual(soldier.route,[{x:28.5,y:28.5}]);
for(let i=0;i<4;i++)strategy.tickWorker(soldier,1);assert.equal(soldier.x,28.5);assert.equal(soldier.y,28.5);
assert(strategy.armyOrders.cancel(b,0));assert.equal(resources.bows,9,'cancel has no goods charge');
strategy.armyOrders.enqueue(b,'swordsman',1,10);for(let i=0;i<10;i++)strategy.tick(8);assert.equal(workers.filter(w=>!w.unit).length,2,'carrier reserve retained');assert.equal(b.recruitQueue[0].count,7);
const tower={type:'tower',x:24,y:24,progress:1,owner:1,garrison:0};buildings.push(tower);
for(let i=0;i<4;i++){const w={id:20+i,unit:'swordsman',hp:55,owner:1,phase:'action',x:24.5,y:25.5,order:{building:2},wait:0};workers.push(w);strategy.tickWorker(w,1);}
assert.equal(tower.garrison,3);assert.equal(workers.at(-1).phase,'guard');assert(!workers.at(-1).garrisonIndex);
blocked=true; // release needs an entrance, not a path, and keeps remaining occupants.
assert(strategy.releaseOne(tower,20));assert.equal(tower.garrison,2);assert.equal(workers.find(w=>w.id===20).garrisonIndex,undefined);assert(!strategy.releaseOne(tower,20));blocked=false;
const mill={type:'mill',x:23,y:23,progress:1,buffer:{grain:3},work:0};buildings.push(mill);
assert(setProductionOrder(mill,1));strategy.produce(mill,10);assert.equal(mill.productionRemaining,0);assert.equal(mill.ready,'flour');assert.equal(mill.buffer.grain,2);
mill.ready=null;strategy.produce(mill,100);assert.equal(mill.buffer.grain,2);assert.equal(mill.ready,null);assert(setProductionOrder(mill,null));strategy.produce(mill,10);assert.equal(mill.buffer.grain,1);
assert(!setProductionOrder(tower,1));assert(!setProductionOrder(mill,-1));
const journal=createJournal();journal.add('Bau fertig',3);journal.add('Bau fertig',4);assert.equal(journal.list()[0].count,2);for(let i=0;i<120;i++)journal.add('Meldung '+i,i);assert.equal(journal.list().length,15);const copy=createJournal();copy.restore(journal.list());assert.deepEqual(copy.list(),journal.list());
const camera={x:123,y:456,zoom:1};assert(restoreCamera(camera,{x:0,y:0,zoom:.5}));assert.deepEqual(camera,{x:0,y:0,zoom:.5});assert(!restoreCamera(camera,{x:Infinity,y:0,zoom:1}));
const save={version:6,resources,buildings,roads:[],workers:workers.map(w=>({...w,task:undefined})),strategy:strategy.state,journal:journal.list()};
assert(parseSave(JSON.stringify(save),['storehouse','barracks','tower','mill']));
assert.throws(()=>parseSave(JSON.stringify({...save,journal:[{text:'x',time:-1,count:1}]}),['storehouse','barracks','tower','mill']));
assert.throws(()=>parseSave(JSON.stringify({...save,strategy:{carrierReserve:51}}),['storehouse','barracks','tower','mill']));
const restored=JSON.parse(JSON.stringify(b));assert.equal(restored.recruitQueue[0].count,7);assert.deepEqual(restored.rallyPoint,{x:28,y:28});
for(const [type,kind] of [['farm','harvest'],['fisher','fish'],['forester','plant']]){
 const fieldBuilding={type,x:5,y:5,productionRemaining:1,fields:[{x:6,y:6,age:35}]},fieldWorker={id:500,x:6.5,y:6.5,phase:'fieldWork',outdoorJob:{x:6,y:6,kind},outdoorTime:0},fieldTrees=[];
 const outdoor=createOutdoor({terrain,buildings:[fieldBuilding],workers:[fieldWorker],trees:fieldTrees,rocks:[],roads:[],routeTo,entrance,followRoute});
 outdoor.update(fieldWorker,fieldBuilding,12);assert.equal(fieldBuilding.productionRemaining,0);
 assert.equal(type==='forester'?fieldTrees.length:fieldBuilding.outputAmount,type==='forester'?1:2);
 fieldBuilding.ready=null;for(let i=0;i<10;i++)outdoor.update(fieldWorker,fieldBuilding,12);
 assert.equal(fieldWorker.phase,'fieldWait');assert.equal(fieldWorker.outdoorJob,null);assert.equal(fieldBuilding.ready,null);
}
strategy.restore({initialized:true,claims:[],deposits:[],projectiles:[]});assert.equal(strategy.state.carrierReserve,0,'legacy load clears reserve');
console.log('PASS: timed training, exact costs, pause/block/reserve, rally routes, selection preservation, cancellation, tower cap/release, indoor/outdoor finite batches, journal, camera and save validation');

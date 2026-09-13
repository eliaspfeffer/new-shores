import assert from 'node:assert/strict';
import {lostCivilianBuildings,collapseCivilian} from '../src/conquest-losses.js';
import {territoryOwners} from '../src/territory.js';
import {parseSave} from '../src/savegames.js';
const home={type:'storehouse',x:5,y:5,progress:1},site={type:'warehouse',owner:2,x:24,y:25,progress:1,paidCost:{planks:4,stone:2},stored:{coal:3},buffer:{iron:1},ready:'wood',outputAmount:2},tower={type:'tower',owner:2,x:25,y:25,progress:1,garrison:1};
const buildings=[home,site,tower,{type:'warehouse',owner:1,x:7,y:6,progress:1,storageSources:[0],storageSource:0}],workers=[
 {id:0,x:24.5,y:26.5,phase:'staffExit',employerIndex:1,workTool:'hammer',workCarry:'wood',inside:false},
 {id:1,x:23.5,y:24.5,phase:'supply',supplyIndex:1,carry:'iron',routeIndex:0,pickupEnd:2,route:[{x:5.5,y:6.5},{x:5.5,y:6.5}]},
 {id:2,x:20.5,y:25.5,phase:'inbound',task:site,carry:'stone',carryAmount:2,jobTool:'pickaxe'},
 {id:3,x:25.5,y:26.5,phase:'garrison',garrisonIndex:2,unit:'swordsman',order:{building:2}},
 {id:4,x:7.5,y:7.5,phase:'staffWork',employerIndex:3},
 {id:5,x:26.5,y:26.5,phase:'action',unit:'swordsman',order:{building:1}},
];
const terrain=Array.from({length:50},()=>Array(50).fill('grass'));
let owners=territoryOwners(terrain,buildings);assert.deepEqual(lostCivilianBuildings(buildings,(x,y)=>owners[y][x]),[]);
tower.owner=1;owners=territoryOwners(terrain,buildings);assert.deepEqual(lostCivilianBuildings(buildings,(x,y)=>owners[y][x]),[site]);
assert.deepEqual(lostCivilianBuildings(buildings,()=>0),[],'neutral loss alone is not capture');
assert.deepEqual(lostCivilianBuildings(buildings,()=>2),[buildings[3]],'own civilian buildings can be lost too, not just enemy sites');
const drops=[],resources={beds:12},api={buildings,workers,definitions:{},entrance:b=>({x:b.x+.5,y:b.y+1.5}),routeTo:(a,b)=>[b],drop:(p,g)=>drops.push({x:p.x,y:p.y,goods:g}),resources};
assert.equal(collapseCivilian(site,api),true);assert.equal(buildings.length,3);assert.equal(workers[3].garrisonIndex,1);assert.equal(workers[3].order.building,1);assert.equal(workers[4].employerIndex,2);assert.equal(workers[5].order,null);
assert.equal(workers[0].employerIndex,undefined);assert.equal(workers[0].carry,null);assert.equal(workers[2].task,null);
const totals={};for(const d of drops)for(const[k,n]of Object.entries(d.goods))totals[k]=(totals[k]||0)+n;
assert.deepEqual(totals,{hammer:1,iron:2,pickaxe:1,stone:3,planks:2,coal:3,wood:2},'indoor display cargo is not duplicated');
assert.equal(drops.find(d=>d.goods.iron===1).x,5.5,'uncollected reservation stays at the source');
assert.equal(collapseCivilian(site,api),false,'no repeat refund');assert.equal(collapseCivilian(tower,api),false);assert.equal(collapseCivilian(home,api),false);
const donor={type:'warehouse',x:26,y:27,progress:1,stored:{}},otherSupply={id:6,x:23.5,y:25.5,phase:'supply',supplyIndex:2,carry:'coal',routeIndex:0,pickupEnd:1,route:[{x:26.5,y:28.5}]};
buildings.push(donor);workers.push(otherSupply);assert(collapseCivilian(donor,api));assert.equal(otherSupply.carry,null);assert.equal(otherSupply.supplyIndex,undefined);assert.equal(drops.at(-2).goods.coal,1,'cancel uncollected source reservation even when destination survives');
const house={type:'house',x:28,y:25,progress:1,completed:true,owner:1,paidCost:{planks:2}};buildings.push(house);assert.equal(collapseCivilian(house,api),true);assert.equal(resources.beds,8);
const legacy={type:'warehouse',x:28,y:25,progress:1,stored:{custom:2}};buildings.push(legacy);assert.equal(collapseCivilian(legacy,api),false);buildings.pop();
const cargoSite={type:'warehouse',x:28,y:25,progress:1},oddCargo={id:7,x:27.5,y:25.5,phase:'inbound',task:cargoSite,carry:'custom',carryAmount:2};buildings.push(cargoSite);workers.push(oddCargo);assert.equal(collapseCivilian(cargoSite,api),false,'unknown imported in-flight goods are preserved too');assert.equal(oddCargo.carry,'custom');workers.pop();buildings.pop();
const snapshot={version:8,resources,buildings,workers,roads:[],strategy:{conquestLosses:true}};assert.equal(parseSave(JSON.stringify(snapshot),['storehouse','warehouse','tower']).version,8);
assert.throws(()=>parseSave(JSON.stringify({...snapshot,version:7}),['storehouse','warehouse','tower']));assert.throws(()=>parseSave(JSON.stringify({...snapshot,strategy:{conquestLosses:'yes'}}),['storehouse','warehouse','tower']));
console.log('PASS conquest losses: hostile-only civilians, protected military/home, physical stock/tool/cargo conservation, source reservations, index repair, beds, legacy preservation and version 8');

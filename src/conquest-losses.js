import {housingCapacity} from './housing.js';
import {demolitionRefund} from './interaction.js';
import {goodsOrder,hasVisibleCargo} from './goods.js';
import {rerouteStorageAfterDemolition} from './storage.js';

// Own approximation of S4 land capture: civilian sites collapse only on hostile
// owned ground. Neutral ground and military buildings are intentionally exempt.
export function lostCivilianBuildings(buildings,ownerAt){
  return buildings.filter((b,i)=>i>0&&!['storehouse','tower'].includes(b.type)&&ownerAt(b.x,b.y)>0&&ownerAt(b.x,b.y)!==(b.owner||1));
}
export function collapseCivilian(b,api){
  const {buildings,workers,definitions,entrance,routeTo,drop,resources}=api,index=buildings.indexOf(b);
  if(index<1||['storehouse','tower'].includes(b.type))return false;
  const goods=demolitionRefund(b,definitions[b.type],[],index);
  // Never silently discard nonstandard or fractional imported goods.
  if(Object.entries(goods).some(([k,n])=>!goodsOrder.includes(k)||!Number.isSafeInteger(n)||n<0))return false;
  const door=entrance(b);
  const reservedHere=w=>{const p=w.route?.[Math.max(0,(w.pickupEnd||1)-1)];return w.carry&&!hasVisibleCargo(w)&&door&&p&&Math.hypot(p.x-door.x,p.y-door.y)<.01;};
  const affected=workers.filter(w=>w.employerIndex===index||w.task===b||w.supplyIndex===index||reservedHere(w));
  const cargoAmount=w=>w.carryAmount||(w.phase==='supply'?1:b.outputAmount||2);
  if(affected.some(w=>w.carry&&(!goodsOrder.includes(w.carry)||!Number.isSafeInteger(cargoAmount(w))||cargoAmount(w)<1)||String(w.phase).startsWith('field')&&w.workCarry&&!goodsOrder.includes(w.workCarry)))return false;
  for(const w of affected){
    for(const key of ['workTool','jobTool'])if(w[key]){drop(w,{[typeof w[key]==='string'?w[key]:'tools']:1});delete w[key];}
    if(w.carry){const source=hasVisibleCargo(w)?w:w.route?.[Math.max(0,(w.pickupEnd||1)-1)]||w;drop(source,{[w.carry]:cargoAmount(w)});}
    // Field cargo has already been removed from its resource, unlike indoor
    // input/output display goods that still belong to the building buffer.
    if(w.phase.startsWith('field')&&w.workCarry)drop(w,{[w.workCarry]:1});
    if(w.inside){const p=entrance(b);if(p){w.x=p.x;w.y=p.y;}}
    for(const key of ['employerIndex','profession','inside','workCarry','outdoorJob','outdoorTime','supplyIndex','carryAmount','pickupEnd','storageIndex'])delete w[key];
    w.carry=null;w.task=null;w.gather=null;w.route=null;w.phase=w.unit?'guard':'idle';w.role=w.unit||'carrier';
  }
  for(const w of workers){
    for(const key of ['employerIndex','supplyIndex','garrisonIndex'])if(w[key]>index)w[key]--;
    if(w.order?.building===index){w.order=null;w.route=null;w.phase=w.unit?'guard':'idle';}else if(w.order?.building>index)w.order.building--;
  }
  buildings.splice(index,1);
  rerouteStorageAfterDemolition(workers,index,buildings,entrance,routeTo);
  drop(b,goods);
  if(housingCapacity(b)&&b.completed&&(b.owner||1)===1)resources.beds=Math.max(0,resources.beds-housingCapacity(b));
  return true;
}

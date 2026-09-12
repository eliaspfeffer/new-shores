export const depotGoods=['wood','grain','flour','bread','fish','water','pigs','meat','coal','ironOre','goldOre','sulfur','iron'];
export const storageModes=['accept','collect','reject','evacuate'];
export function storageTarget(b,item){return b.storageTargets?.[item]??10;}
export function acceptsGoods(b,item){return depotGoods.includes(item)&&['accept','collect'].includes(b.storageRules?.[item]||'accept');}
export function chooseStorage(worker,item,buildings,entrance,routeTo){
  const candidates=buildings.map((b,index)=>({b,index})).filter(({b,index})=>index===0||b.type==='warehouse'&&(b.owner||1)===1&&b.progress>=1&&!b.stopped&&acceptsGoods(b,item));
  return candidates.map(({b,index})=>{const p=entrance(b);return {index,route:p&&routeTo(worker,p)};}).filter(c=>c.route).sort((a,b)=>a.route.length-b.route.length)[0]||null;
}
// Reservations leave stored stock once a complete pickup+delivery route exists.
// A rule change does not cancel cargo already promised to a carrier.
export function tickStorageTransfer(w,dt,buildings,resources,entrance,routeTo,followRoute,workers=[]){
  if(w.dead||w.unit||w.employerIndex!==undefined)return false;
  if(w.phase==='relocateStock'){
    w.t=(w.t||0)+dt;
    if(followRoute(w,dt)){const depot=buildings[w.storageIndex],stock=depot?.type==='warehouse'&&(depot.owner||1)===1?(depot.stored??={}):resources;stock[w.carry]=(stock[w.carry]||0)+(w.carryAmount||1);w.carry=null;w.task=null;w.route=null;w.phase='idle';delete w.storageIndex;delete w.carryAmount;delete w.pickupEnd;}
    return true;
  }
  if(w.phase!=='idle'||w.carry||w.manualTarget||w.waypoints?.length)return false;
  w.storageRetry=(w.storageRetry||0)-dt;if(w.storageRetry>0)return false;w.storageRetry=2;
  const home=entrance(buildings[0]);if(!home)return false;
  for(const b of buildings){if(b.type!=='warehouse'||(b.owner||1)!==1||b.progress<1||b.stopped)continue;
    for(const item of depotGoods){if(b.storageRules?.[item]!=='evacuate'||!(b.stored?.[item]>0))continue;
      const source=entrance(b),pickup=source&&routeTo(w,source),delivery=source&&routeTo(source,home);if(!pickup||!delivery)continue;
      b.stored[item]--;Object.assign(w,{phase:'relocateStock',role:'carrier',carry:item,carryAmount:1,pickupEnd:pickup.length,route:[...pickup,...delivery],routeIndex:0,task:null});return true;
    }
  }
  for(let index=1;index<buildings.length;index++){const b=buildings[index];if(b.type!=='warehouse'||(b.owner||1)!==1||b.progress<1||b.stopped)continue;
    const sourceIndex=b.storageSource||0,donor=buildings[sourceIndex];
    if(sourceIndex===index||!donor||(donor.owner||1)!==1||donor.stopped||donor.progress<1||sourceIndex!==0&&donor.type!=='warehouse')continue;
    const sourceStock=sourceIndex===0?resources:donor.stored||{},source=entrance(donor);if(!source)continue;
    for(const item of depotGoods){if(b.storageRules?.[item]!=='collect')continue;
      // Preserve the donor's own target. Two collecting depots cannot drain one another.
      const reserve=sourceIndex!==0&&donor.storageRules?.[item]==='collect'?storageTarget(donor,item):0;if((sourceStock[item]||0)<=reserve)continue;
      const pending=workers.filter(o=>!o.dead&&o.carry===item&&o.storageIndex===index).reduce((n,o)=>n+(o.carryAmount||1),0);if((b.stored?.[item]||0)+pending>=storageTarget(b,item))continue;
      const dest=entrance(b),pickup=routeTo(w,source),delivery=dest&&routeTo(source,dest);if(!pickup||!delivery)continue;
      sourceStock[item]--;Object.assign(w,{phase:'relocateStock',role:'carrier',carry:item,carryAmount:1,storageIndex:index,pickupEnd:pickup.length,route:[...pickup,...delivery],routeIndex:0,task:null});return true;
    }
  }
  return false;
}
export function rerouteStorageAfterDemolition(workers,index,buildings,entrance,routeTo){
  for(const b of buildings){if(b.storageSource===index)b.storageSource=0;else if(b.storageSource>index)b.storageSource--;}
  for(const w of workers){
    if(w.storageIndex===index){w.storageIndex=0;const home=entrance(buildings[0]);w.route=home&&routeTo(w,home);w.routeIndex=0;if(!w.route)w.phase='recoverCargo';}
    else if(w.storageIndex>index)w.storageIndex--;
  }
}

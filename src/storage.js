export const depotGoods=['wood','grain','flour','bread','fish','water','pigs','meat','coal','ironOre','goldOre','sulfur','iron'];
export function chooseStorage(worker,item,buildings,entrance,routeTo){
  const candidates=buildings.map((b,index)=>({b,index})).filter(({b,index})=>index===0||b.type==='warehouse'&&(b.owner||1)===1&&b.progress>=1&&!b.stopped&&depotGoods.includes(item));
  return candidates.map(({b,index})=>{const p=entrance(b);return {index,route:p&&routeTo(worker,p)};}).filter(c=>c.route).sort((a,b)=>a.route.length-b.route.length)[0]||null;
}
export function rerouteStorageAfterDemolition(workers,index,buildings,entrance,routeTo){
  for(const w of workers){
    if(w.storageIndex===index){w.storageIndex=0;const home=entrance(buildings[0]);w.route=home&&routeTo(w,home);w.routeIndex=0;if(!w.route)w.phase='recoverCargo';}
    else if(w.storageIndex>index)w.storageIndex--;
  }
}

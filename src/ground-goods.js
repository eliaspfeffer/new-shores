import {goodsOrder} from './goods.js';
import {freeCarrier} from './army-orders.js';
import {chooseStorage,acceptsGoods} from './storage.js';

export const pileTotal=pile=>Object.values(pile.goods).reduce((sum,n)=>sum+n,0);
export function validateGroundGoods(state,workers,point){
  if(state?.physicalSalvage!==undefined&&typeof state.physicalSalvage!=='boolean')throw new Error('Ungültige Bergungsregel.');
  const piles=state?.groundPiles;if(piles!==undefined){
    if(!Array.isArray(piles)||piles.length>2500)throw new Error('Ungültige Bodenwaren.');const seen=new Set();
    for(const pile of piles){const key=pile?.x+','+pile?.y;if(!point(pile)||!Number.isInteger(pile.x)||!Number.isInteger(pile.y)||seen.has(key)||!pile.goods||Array.isArray(pile.goods)||Object.entries(pile.goods).length===0||Object.entries(pile.goods).some(([k,n])=>!goodsOrder.includes(k)||!Number.isSafeInteger(n)||n<1))throw new Error('Ungültiger Warenhaufen.');seen.add(key);}
  }
  for(const w of workers||[]){
    if(w.salvageTarget!==undefined&&(!point(w.salvageTarget)||!Number.isInteger(w.salvageTarget.x)||!Number.isInteger(w.salvageTarget.y)||!goodsOrder.includes(w.salvageTarget.item)))throw new Error('Ungültiger Bergungsauftrag.');
    if(w.phase==='salvagePickup'&&(!w.salvageTarget||w.carry||w.unit||w.employerIndex!==undefined))throw new Error('Ungültige Warenabholung.');
    if(w.phase==='salvageReturn'&&(!goodsOrder.includes(w.carry)||w.carryAmount!==1||w.unit||w.employerIndex!==undefined))throw new Error('Ungültige Bergungsfracht.');
  }
}
export function createGroundGoods(api){
  const {state,workers,buildings,entrance,routeTo,followRoute,ownerAt}=api;
  const piles=()=>state.groundPiles??=[];
  const at=(x,y)=>piles().find(p=>p.x===Math.floor(x)&&p.y===Math.floor(y));
  const owned=p=>ownerAt(Math.floor(p.x),Math.floor(p.y))===1;
  const safeRoute=(from,to)=>{const route=routeTo(from,to);return owned(from)&&owned(to)&&route?.every(owned)?route:null;};
  const storage=(w,item)=>chooseStorage(w,item,buildings,entrance,safeRoute);
  const usable=w=>{const blocked=api.obstacles?.();return owned(w)&&w.route&&w.route.slice(w.routeIndex||0).every(p=>owned(p)&&!blocked?.has(Math.floor(p.x)+','+Math.floor(p.y)));};
  function drop(point,goods){
    const entries=Object.entries(goods).filter(([k,n])=>goodsOrder.includes(k)&&Number.isSafeInteger(n)&&n>0);if(!entries.length)return null;
    let pile=at(point.x,point.y);if(!pile){pile={x:Math.floor(point.x),y:Math.floor(point.y),goods:{}};piles().push(pile);}
    for(const [key,n] of entries)pile.goods[key]=(pile.goods[key]||0)+n;api.changed?.();return pile;
  }
  function cancel(w){delete w.salvageTarget;delete w.salvageRouteClock;w.route=null;w.phase='idle';w.salvageRetry=2;}
  function tick(w,dt){
    if(!['salvagePickup','salvageReturn'].includes(w.phase))return false;
    if(w.dead){if(w.phase==='salvageReturn'&&w.carry)drop(w,{[w.carry]:w.carryAmount});w.carry=null;delete w.carryAmount;delete w.storageIndex;cancel(w);return true;}
    w.t=(w.t||0)+dt;
    if(w.route&&(!owned(w)||!w.route.slice(w.routeIndex||0).every(owned))){w.route=null;w.salvageRouteClock=0;}
    if(w.phase==='salvagePickup'){
      const target=w.salvageTarget,pile=target&&at(target.x,target.y);
      if(!pile||!pile.goods[target.item]||!owned(pile)||w.manualTarget||w.waypoints?.length){cancel(w);return true;}
      const destination={x:pile.x+.5,y:pile.y+.5};
      w.salvageRouteClock=(w.salvageRouteClock||0)-dt;
      if(w.salvageRouteClock<=0){if(!usable(w)){w.route=safeRoute(w,destination);w.routeIndex=0;}w.salvageRouteClock=2;}
      if(!w.route){cancel(w);return true;}
      if(followRoute(w,dt)){
        const delivery=storage(w,target.item);if(!delivery){cancel(w);return true;}
        // Ownership and stock were rechecked after travel; cargo exists only now.
        const item=target.item;pile.goods[item]--;if(!pile.goods[item])delete pile.goods[item];if(!pileTotal(pile))piles().splice(piles().indexOf(pile),1);
        Object.assign(w,{phase:'salvageReturn',role:'carrier',carry:item,carryAmount:1,storageIndex:delivery.index,route:delivery.route,routeIndex:0,salvageRouteClock:2});delete w.salvageTarget;api.changed?.();
      }return true;
    }
    w.salvageRouteClock=(w.salvageRouteClock||0)-dt;
    if(w.salvageRouteClock<=0){const b=buildings[w.storageIndex],validStorage=b&&(w.storageIndex===0||b.type==='warehouse'&&(b.owner||1)===1&&b.progress>=1&&!b.stopped&&acceptsGoods(b,w.carry));if(!validStorage||!usable(w)){const delivery=storage(w,w.carry);w.route=delivery?.route||null;w.routeIndex=0;w.storageIndex=delivery?.index??0;}w.salvageRouteClock=2;}
    // Never teleport cargo when an entrance is blocked or territory is lost.
    if(w.route&&followRoute(w,dt)){
      const b=buildings[w.storageIndex],stock=b?.type==='warehouse'?(b.stored??={}):api.resources();
      stock[w.carry]=(stock[w.carry]||0)+w.carryAmount;
      api.delivered?.(w.carry,w.carryAmount);w.carry=null;delete w.carryAmount;delete w.storageIndex;cancel(w);api.changed?.();
    }return true;
  }
  function assign(w,dt){
    if(!freeCarrier(w)||w.waypoints?.length||!piles().length)return false;
    w.salvageRetry=(w.salvageRetry||0)-dt;if(w.salvageRetry>0)return false;w.salvageRetry=2;
    if(workers.filter(o=>!o.dead&&['salvagePickup','salvageReturn'].includes(o.phase)).length>=2)return false;
    for(const pile of [...piles()].filter(owned).sort((a,b)=>Math.hypot(a.x-w.x,a.y-w.y)-Math.hypot(b.x-w.x,b.y-w.y))){
      for(const item of Object.keys(pile.goods)){
        const reserved=workers.filter(o=>!o.dead&&o.phase==='salvagePickup'&&o.salvageTarget?.x===pile.x&&o.salvageTarget?.y===pile.y&&o.salvageTarget.item===item).length;if(pile.goods[item]<=reserved)continue;
        const destination={x:pile.x+.5,y:pile.y+.5},route=safeRoute(w,destination);if(!route||!storage(destination,item))continue;
        Object.assign(w,{phase:'salvagePickup',role:'carrier',task:null,route,routeIndex:0,salvageTarget:{x:pile.x,y:pile.y,item},salvageRouteClock:2});return true;
      }
    }return false;
  }
  return {drop,at,piles,tick,assign};
}

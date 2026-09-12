export const towerCapacity=3;
export const militaryTypes=['swordsman','archer','medic'];
export const freeCarrier=w=>!w.dead&&(w.owner||1)===1&&!w.unit&&!w.carry&&!w.task&&!w.manualTarget&&w.employerIndex===undefined&&w.phase==='idle';
export function createArmyOrders(api){
  const {buildings,workers,state,stock,entrance,routeTo,recruit}=api;
  const valid=b=>buildings.includes(b)&&(b.owner||1)===1&&b.type==='barracks';
  function enqueue(b,type,rank,count){
    if(!valid(b)||!militaryTypes.includes(type)||![1,2,3].includes(rank)||!Number.isInteger(count)||count<1||count>20)return false;
    b.recruitQueue??=[];if(b.recruitQueue.length>=20)return false;
    b.recruitQueue.push({type,rank,count,progress:0});return true;
  }
  function cancel(b,index){if(!valid(b)||!Number.isInteger(index)||!b.recruitQueue?.[index])return false;b.recruitQueue.splice(index,1);return true;}
  function rally(b,point){
    if(!valid(b))return false;if(point===null){delete b.rallyPoint;return true;}
    if(!point||!Number.isInteger(point.x)||!Number.isInteger(point.y)||api.terrain[point.y]?.[point.x]!=='grass'||api.visible&&!api.visible(point.x,point.y))return false;
    const door=entrance(b);if(!door||!routeTo(door,{x:point.x+.5,y:point.y+.5}))return false;
    b.rallyPoint={x:point.x,y:point.y};return true;
  }
  function tick(dt){
    for(const b of buildings){if(!valid(b)||b.stopped||b.progress<1||!b.recruitQueue?.length)continue;
      const q=b.recruitQueue[0],resource=q.type==='archer'?'bows':'swords';
      const available=workers.filter(freeCarrier);
      if(available.length<=(state.carrierReserve||0)){b.recruitStatus='Wartet auf freie Träger / Trägerreserve';continue;}
      if((stock()[resource]||0)<1||(stock().gold||0)<q.rank-1){b.recruitStatus='Wartet auf Waffen / Gold';continue;}
      const door=entrance(b),w=door&&available.find(w=>routeTo(w,door));
      if(!w){b.recruitStatus='Kaserneneingang nicht erreichbar';continue;}
      q.progress=Math.min(8,q.progress+dt);b.recruitStatus='Ausbildung '+Math.floor(q.progress/8*100)+' %';
      if(q.progress<8)continue;
      const approach=routeTo(w,door);if(!approach)continue;
      const soldier=recruit(q.type,q.rank,b,{candidate:w,preserveSelection:true});
      if(!soldier)continue;
      const target=b.rallyPoint&&{x:b.rallyPoint.x+.5,y:b.rallyPoint.y+.5},outbound=target&&routeTo(door,target);
      Object.assign(soldier,{phase:'command',route:[...approach,...(outbound||[])],routeIndex:0,order:{x:Math.floor((outbound?target:door).x),y:Math.floor((outbound?target:door).y),building:-1},wait:0});
      q.count--;q.progress=0;if(!q.count)b.recruitQueue.shift();
      b.recruitStatus=b.recruitQueue.length?'Nächste Ausbildung':'Warteschlange fertig';
    }
  }
  function reserve(value){if(!Number.isInteger(value)||value<0||value>50)return false;state.carrierReserve=value;return true;}
  return {enqueue,cancel,rally,tick,reserve};
}

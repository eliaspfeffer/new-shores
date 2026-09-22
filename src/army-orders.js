export const towerCapacity=3;
export const militaryTypes=['swordsman','archer','medic'];
export const freeCarrier=w=>!w.dead&&(w.owner||1)===1&&!w.unit&&!w.carry&&!w.task&&!w.manualTarget&&w.employerIndex===undefined&&w.phase==='idle';
export function createArmyOrders(api){
  const {buildings,workers,state,stock,entrance,routeTo,followRoute,recruit}=api;
  const valid=b=>buildings.includes(b)&&(b.owner||1)===1&&b.type==='barracks';
  function enqueue(b,type,rank,count){
    if(!valid(b)||!militaryTypes.includes(type)||![1,2,3].includes(rank)||!Number.isInteger(count)||count<1||count>20)return false;
    b.recruitQueue??=[];if(b.recruitQueue.length>=20)return false;
    b.recruitQueue.push({type,rank,count,progress:0});return true;
  }
  function releaseTrainee(q,b){
    const w=workers.find(w=>w.id===q?.traineeId);if(!w)return;
    const door=entrance(b);if(door){w.x=door.x;w.y=door.y;}delete w.inside;delete w.recruitBuilding;
    Object.assign(w,{phase:'idle',route:null,routeIndex:0,task:null});delete q.traineeId;
  }
  function cancel(b,index){if(!valid(b)||!Number.isInteger(index)||!b.recruitQueue?.[index])return false;releaseTrainee(b.recruitQueue[index],b);b.recruitQueue.splice(index,1);return true;}
  function releaseAll(b){for(const q of b?.recruitQueue||[])releaseTrainee(q,b);b.recruitQueue=[];}
  function rally(b,point){
    if(!valid(b))return false;if(point===null){delete b.rallyPoint;return true;}
    if(!point||!Number.isInteger(point.x)||!Number.isInteger(point.y)||api.terrain[point.y]?.[point.x]!=='grass'||api.visible&&!api.visible(point.x,point.y))return false;
    const door=entrance(b);if(!door||!routeTo(door,{x:point.x+.5,y:point.y+.5}))return false;
    b.rallyPoint={x:point.x,y:point.y};return true;
  }
  function tick(dt){
    for(const b of buildings){if(!valid(b)||b.progress<1||!b.recruitQueue?.length)continue;
      const q=b.recruitQueue[0],resource=q.type==='archer'?'bows':'swords';
      const door=entrance(b);let w=workers.find(w=>w.id===q.traineeId&&!w.dead);
      if(!w){
        const available=workers.filter(freeCarrier);
        if(available.length<=(state.carrierReserve||0)){b.recruitStatus='Wartet auf freie Träger / Trägerreserve';continue;}
        w=door&&available.find(w=>routeTo(w,door));if(!w){b.recruitStatus='Kaserneneingang nicht erreichbar';continue;}
        const route=routeTo(w,door);q.traineeId=w.id;q.progress=0;Object.assign(w,{phase:'recruitInbound',route,routeIndex:0,recruitBuilding:buildings.indexOf(b)});
      }
      if(w.phase==='recruitInbound'){
        b.recruitStatus='Rekrut auf dem Weg zur Kaserne';
        if(!followRoute(w,dt))continue;
        Object.assign(w,{x:door.x,y:door.y,phase:'recruitTraining',route:null,routeIndex:0,inside:true});
      }
      if(w.phase!=='recruitTraining'){releaseTrainee(q,b);continue;}
      if(b.stopped){b.recruitStatus='Ausbildung angehalten';continue;}
      if((stock()[resource]||0)<1||(stock().gold||0)<q.rank-1){b.recruitStatus='Rekrut wartet in der Kaserne auf Waffen / Gold';continue;}
      q.progress=Math.min(8,q.progress+dt);b.recruitStatus='Ausbildung '+Math.floor(q.progress/8*100)+' %';
      if(q.progress<8)continue;
      const soldier=recruit(q.type,q.rank,b,{candidate:w,preserveSelection:true,reserved:true});
      if(!soldier)continue;
      const target=b.rallyPoint&&{x:b.rallyPoint.x+.5,y:b.rallyPoint.y+.5},outbound=target&&routeTo(door,target);
      delete soldier.inside;delete soldier.recruitBuilding;
      Object.assign(soldier,{x:door.x,y:door.y,phase:outbound?.length?'command':'guard',route:outbound||null,routeIndex:0,order:outbound?{x:Math.floor(target.x),y:Math.floor(target.y),building:-1}:null,wait:0});
      q.count--;q.progress=0;delete q.traineeId;if(!q.count)b.recruitQueue.shift();
      b.recruitStatus=b.recruitQueue.length?'Nächste Ausbildung':'Warteschlange fertig';
    }
  }
  function reserve(value){if(!Number.isInteger(value)||value<0||value>50)return false;state.carrierReserve=value;return true;}
  return {enqueue,cancel,releaseAll,rally,tick,reserve};
}

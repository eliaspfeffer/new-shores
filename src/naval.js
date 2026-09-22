export const shipSpecs={
  merchant:{name:'Warenschiff',planks:10,iron:2,time:30,capacity:64,hp:120,speed:1.25},
  transport:{name:'Truppentransporter',planks:12,iron:4,time:38,capacity:40,hp:150,speed:1.15},
  warship:{name:'Kriegsschiff',planks:18,iron:8,time:50,capacity:0,hp:240,speed:1.05,damage:14,range:4},
};

const cardinal=[[1,0],[-1,0],[0,1],[0,-1]];
const key=p=>Math.floor(p.x)+','+Math.floor(p.y);
export function nearestWater(terrain,point,radius=4){
  let best=null,distance=Infinity;
  for(let y=Math.max(0,point.y-radius);y<Math.min(terrain.length,point.y+radius+1);y++)for(let x=Math.max(0,point.x-radius);x<Math.min(terrain[y].length,point.x+radius+1);x++){
    if(terrain[y][x]!=='water')continue;const d=Math.hypot(x-point.x,y-point.y);if(d<distance){distance=d;best={x:x+.5,y:y+.5};}
  }
  return best;
}
export function waterRoute(terrain,start,end){
  if(!start||!end)return null;const a={x:Math.floor(start.x),y:Math.floor(start.y)},goal={x:Math.floor(end.x),y:Math.floor(end.y)},queue=[a],came=new Map([[key(a),null]]);
  for(let i=0;i<queue.length&&i<10000;i++){
    const p=queue[i];if(p.x===goal.x&&p.y===goal.y){const route=[];let cursor=p;while(cursor){route.push({x:cursor.x+.5,y:cursor.y+.5});cursor=came.get(key(cursor));}return route.reverse().slice(1);}
    for(const [dx,dy] of cardinal){const n={x:p.x+dx,y:p.y+dy},k=key(n);if(came.has(k)||terrain[n.y]?.[n.x]!=='water')continue;came.set(k,p);queue.push(n);}
  }
  return null;
}

export function createNaval(api){
  const {terrain,buildings,workers,state,stock,notify}=api;
  const naval=state.naval??=( {version:1,ships:[],nextId:1} );
  naval.ships??=[];naval.nextId??=1;
  const own=b=>(b.owner||1)===1;
  const dock=b=>nearestWater(terrain,b,4);
  function enqueue(yard,type){
    const spec=shipSpecs[type];if(!spec||!buildings.includes(yard)||yard.type!=='shipyard'||!own(yard)||yard.progress<1)return false;
    yard.shipQueue??=[];if(yard.shipQueue.length>=8)return false;
    const resources=stock();if((resources.planks||0)<spec.planks||(resources.iron||0)<spec.iron)return false;
    resources.planks-=spec.planks;resources.iron-=spec.iron;yard.shipQueue.push({type,progress:0});return true;
  }
  function idle(type,near){return naval.ships.filter(s=>s.owner===1&&s.type===type&&s.status==='idle').sort((a,b)=>Math.hypot(a.x-near.x,a.y-near.y)-Math.hypot(b.x-near.x,b.y-near.y))[0];}
  function sail(ship,target,status,onArrival){const route=waterRoute(terrain,ship,target);if(!route)return false;Object.assign(ship,{route,routeIndex:0,status,targetStatus:status,onArrival});return true;}
  function sendCargo(harbor,item,amount=12){
    const from=dock(harbor),ship=from&&idle('merchant',from),target=buildings.filter(b=>b!==harbor&&b.type==='harbor'&&own(b)&&b.progress>=1&&dock(b)).sort((a,b)=>Math.hypot(a.x-harbor.x,a.y-harbor.y)-Math.hypot(b.x-harbor.x,b.y-harbor.y))[0];
    const n=Math.min(shipSpecs.merchant.capacity,Math.max(1,Math.floor(amount)),stock()[item]||0);if(!ship||!target||!n)return false;
    stock()[item]-=n;ship.cargo={item,amount:n};if(!sail(ship,dock(target),'cargo',buildings.indexOf(target))){stock()[item]+=n;delete ship.cargo;return false;}return true;
  }
  function transportTroops(harbor){
    const from=dock(harbor),ship=from&&idle('transport',from),enemy=buildings.filter(b=>(b.owner||1)!==1&&b.progress>=1&&dock(b)).sort((a,b)=>Math.hypot(a.x-harbor.x,a.y-harbor.y)-Math.hypot(b.x-harbor.x,b.y-harbor.y))[0];if(!ship||!enemy)return false;
    const troops=workers.filter(w=>!w.dead&&(w.owner||1)===1&&['swordsman','archer','medic'].includes(w.unit)&&w.garrisonIndex===undefined&&!w.embarkedShip&&Math.hypot(w.x-harbor.x,w.y-harbor.y)<=18).slice(0,shipSpecs.transport.capacity);if(!troops.length)return false;
    ship.passengers=troops.map(w=>w.id);for(const w of troops){w.embarkedShip=ship.id;w.phase='embarked';w.route=null;}
    if(!sail(ship,dock(enemy),'transport',buildings.indexOf(enemy))){for(const w of troops){delete w.embarkedShip;w.phase='guard';}ship.passengers=[];return false;}return true;
  }
  function sendCourier(harbor,message='Wir ersuchen um friedlichen Handel.'){
    const start=dock(harbor),enemy=buildings.filter(b=>(b.owner||1)!==1&&b.progress>=1&&dock(b)).sort((a,b)=>Math.hypot(a.x-harbor.x,a.y-harbor.y)-Math.hypot(b.x-harbor.x,b.y-harbor.y))[0];if(!start||!enemy||(stock().planks||0)<1)return false;
    stock().planks--;const ship={id:naval.nextId++,type:'courier',owner:1,x:start.x,y:start.y,hp:30,maxHp:30,status:'idle',message};naval.ships.push(ship);
    if(!sail(ship,dock(enemy),'courier',buildings.indexOf(enemy))){naval.ships.pop();stock().planks++;return false;}return true;
  }
  function arrive(ship){
    if(ship.targetStatus==='cargo'){const target=buildings[ship.onArrival];if(ship.cargo){if(target&&target.type==='harbor'){target.stored??={};target.stored[ship.cargo.item]=(target.stored[ship.cargo.item]||0)+ship.cargo.amount;notify?.(`${ship.cargo.amount} ${ship.cargo.item} per Warenschiff geliefert`);}else stock()[ship.cargo.item]=(stock()[ship.cargo.item]||0)+ship.cargo.amount;}delete ship.cargo;}
    if(ship.targetStatus==='transport'){
      const target=buildings[ship.onArrival],land=target&&nearestLand(terrain,target),base={x:land?.x??(target?target.x+.5:ship.x),y:land?.y??(target?target.y+.5:ship.y)};for(const [i,id] of (ship.passengers||[]).entries()){const w=workers.find(w=>w.id===id);if(!w)continue;delete w.embarkedShip;Object.assign(w,{x:base.x+(i%5)*.14,y:base.y+Math.floor(i/5)*.14,phase:'guard',route:null,order:null});}notify?.(`${ship.passengers?.length||0} Truppen auf der Gegnerinsel angelandet`);ship.passengers=[];
    }
    if(ship.targetStatus==='courier'){notify?.('Botenboot angekommen: '+ship.message);ship.status='complete';return;}
    ship.status='idle';ship.route=null;ship.routeIndex=0;delete ship.targetStatus;delete ship.onArrival;
  }
  function tick(dt){
    for(const yard of buildings){if(yard.type!=='shipyard'||!own(yard)||yard.progress<1||yard.stopped||!yard.shipQueue?.length)continue;const q=yard.shipQueue[0],spec=shipSpecs[q.type],spawn=dock(yard);if(!spec||!spawn){yard.shipStatus='Keine freie Wasserzufahrt';continue;}q.progress+=dt;yard.shipStatus=`${spec.name}: ${Math.min(100,Math.floor(q.progress/spec.time*100))} %`;if(q.progress<spec.time)continue;naval.ships.push({id:naval.nextId++,type:q.type,owner:1,x:spawn.x,y:spawn.y,hp:spec.hp,maxHp:spec.hp,status:'idle',route:null,routeIndex:0});yard.shipQueue.shift();yard.shipStatus=yard.shipQueue.length?'Nächstes Schiff':'Werftauftrag fertig';notify?.(spec.name+' ist vom Stapel gelaufen');}
    for(let i=naval.ships.length-1;i>=0;i--){const ship=naval.ships[i];if(ship.status==='complete'){naval.ships.splice(i,1);continue;}const point=ship.route?.[ship.routeIndex];if(point){const spec=shipSpecs[ship.type]||{speed:1.6},dx=point.x-ship.x,dy=point.y-ship.y,d=Math.hypot(dx,dy),step=spec.speed*dt;if(d<=step){ship.x=point.x;ship.y=point.y;ship.routeIndex++;if(ship.routeIndex>=ship.route.length)arrive(ship);}else{ship.x+=dx/d*step;ship.y+=dy/d*step;}}
      if(ship.type==='warship'&&ship.status==='idle'){const target=workers.find(w=>!w.dead&&(w.owner||1)!==ship.owner&&Math.hypot(w.x-ship.x,w.y-ship.y)<=shipSpecs.warship.range);ship.cooldown=Math.max(0,(ship.cooldown||0)-dt);if(target&&!ship.cooldown){target.hp-=shipSpecs.warship.damage;ship.cooldown=2;if(target.hp<=0)target.dead=true;}}
    }
  }
  function restore(saved=state.naval){if(saved&&saved!==naval){naval.version=saved.version||1;naval.ships=Array.isArray(saved.ships)?saved.ships:[];naval.nextId=Number.isInteger(saved.nextId)?saved.nextId:1;}state.naval=naval;naval.ships=naval.ships.filter(s=>shipSpecs[s.type]||s.type==='courier');}
  return {state:naval,enqueue,sendCargo,transportTroops,sendCourier,tick,restore,dock};
}

function nearestLand(terrain,point,radius=4){
  for(let r=1;r<=radius;r++)for(let y=point.y-r;y<=point.y+r;y++)for(let x=point.x-r;x<=point.x+r;x++)if(['grass','shore'].includes(terrain[y]?.[x]))return {x:x+.5,y:y+.5};return null;
}

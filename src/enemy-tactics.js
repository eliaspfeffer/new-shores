// Local perception and bounded defense, not a full economic opponent.
export function updateEnemyTactics(w,dt,api){
  if((w.owner||1)===1||w.dead||w.garrisonIndex!==undefined||!api.isMilitary(w)||!api.routeTo)return;
  if(!api.enabled){if(w.phase==='enemyMove'){w.phase='guard';w.route=null;}delete w.tactics;return;}
  if(!['guard','enemyMove'].includes(w.phase))return;
  const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
  const t=w.tactics??={home:{x:w.x,y:w.y},mode:'guard',clock:0,lost:0};
  t.clock-=dt;if(t.clock>0)return;t.clock=1;
  const hostiles=api.workers.filter(o=>!o.dead&&o.garrisonIndex===undefined&&(o.owner||1)!==(w.owner||1)&&api.isMilitary(o)&&distance(w,o)<=8&&distance(t.home,o)<=12);
  const target=hostiles.sort((a,b)=>distance(w,a)-distance(w,b))[0];
  const move=(point,mode)=>{
    const x=Math.floor(point.x),y=Math.floor(point.y);
    if(!['grass','shore'].includes(api.terrain[y]?.[x]))return false;
    const route=api.routeTo(w,point);if(!route)return false;
    w.route=route;w.routeIndex=0;w.phase='enemyMove';t.mode=mode;return true;
  };
  const stop=mode=>{w.phase='guard';w.route=null;t.mode=mode;};
  const home=()=>{if(distance(w,t.home)>.6){if(!move(t.home,'return'))stop('blocked');}else stop('guard');};
  if(w.hp<(w.maxHp||55+((w.rank||1)-1)*20)*.3){t.lastSeen=null;t.lost=0;if(distance(w,t.home)>1){if(!move(t.home,'retreat'))stop('wounded');}else stop('wounded');return;}
  if(target){
    t.lastSeen={x:target.x,y:target.y};t.lost=0;
    const d=distance(w,target),range=w.unit==='archer'?3.6:1.25;
    if(w.unit==='archer'&&d<2){const length=Math.max(.01,d),p={x:w.x+(d<.01?1:(w.x-target.x)/length)*2,y:w.y+(w.y-target.y)/length*2};if(distance(p,t.home)<=12&&move(p,'withdraw'))return;}
    if(d<=range){stop('engage');return;}
    const length=Math.max(.01,d),p={x:target.x+(w.x-target.x)/length*(range-.2),y:target.y+(w.y-target.y)/length*(range-.2)};
    if(!move(p,'pursue'))stop('blocked');return;
  }
  if(t.lastSeen&&t.lost<4){t.lost++;if(distance(w,t.lastSeen)>.6){if(!move(t.lastSeen,'search'))stop('blocked');}else stop('search');return;}
  t.lastSeen=null;t.lost=0;home();
}

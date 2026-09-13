export function tickTowerDefenders(dt,{workers,buildings,projectiles,onEvent,isMilitary}){
  for(const w of workers){
    if(w.dead||w.garrisonIndex===undefined)continue;
    w.cooldown=Math.max(0,(w.cooldown||0)-dt);
    const b=buildings[w.garrisonIndex];
    if(!b||b.type!=='tower'||b.progress<1||b.destroyed||(b.owner||1)!==(w.owner||1)||b.holdFire||w.unit!=='archer'||w.cooldown)continue;
    const origin={x:b.x+.5,y:b.y+.5};
    const target=workers.filter(o=>!o.dead&&o.garrisonIndex===undefined&&(o.owner||1)!==(w.owner||1)&&isMilitary(o)&&Math.hypot(o.x-origin.x,o.y-origin.y)<=5).sort((a,c)=>Math.hypot(a.x-origin.x,a.y-origin.y)-Math.hypot(c.x-origin.x,c.y-origin.y))[0];
    if(!target)continue;
    projectiles.push({...origin,fromX:origin.x,fromY:origin.y,targetId:target.id,owner:w.owner||1,damage:7*(1+((w.rank||1)-1)*.4),age:0});
    w.cooldown=1.5;onEvent?.('bow',origin);
  }
}
export function fightTowerDefender(attacker,b,{workers,buildings,damage,onEvent}){
  const index=buildings.indexOf(b),defender=workers.find(w=>!w.dead&&w.garrisonIndex===index&&(w.owner||1)===(b.owner||1));
  if(!defender)return false;
  if(attacker.wait<1.2)return true;
  attacker.wait=0;onEvent?.('hit',b);
  damage(defender,10*(1+((attacker.rank||1)-1)*.4));
  if(!defender.dead&&!defender.cooldown){damage(attacker,(defender.unit==='archer'?4:9)*(1+((defender.rank||1)-1)*.4));defender.cooldown=1.2;}
  return true;
}

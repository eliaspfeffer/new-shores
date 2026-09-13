// Optional, finite-army raids. Timings and strength estimates are our own balance.
export function createEnemyRaids(api){
  const {workers,buildings,state,routeTo,entrance}=api;
  const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
  const health=w=>w.maxHp||55+((w.rank||1)-1)*20;
  const field=w=>!w.dead&&(w.owner||1)!==1&&w.garrisonIndex===undefined&&['swordsman','archer'].includes(w.unit);
  function returnHome(w){
    const home=w.raid.home,route=routeTo(w,home);
    w.order=null;w.route=route;w.routeIndex=0;w.phase=route?'command':'guard';
    w.raid.stage='return';delete w.tactics;
    if(!route)delete w.raid;
  }
  function tick(dt){
    const enabled=state.enemyRaids===true&&state.tacticalAI!==false;
    for(const w of workers.filter(w=>w.raid)){
      if(w.dead||w.garrisonIndex!==undefined){delete w.raid;continue;}
      const r=w.raid;
      if(r.stage==='return'){
        if(distance(w,r.home)<.7||w.phase==='guard'){delete w.raid;delete w.tactics;w.phase='guard';w.route=null;w.order=null;}
        continue;
      }
      r.age=Math.min(90,r.age+dt);
      const target=buildings.find(b=>b.type==='tower'&&b.x===r.target.x&&b.y===r.target.y&&!b.destroyed&&b.progress>=1);
      // Let the normal action phase occupy the just-captured tower before returning.
      if(enabled&&target&&(target.owner||1)===(w.owner||1)&&w.unit==='swordsman'&&w.phase==='action'&&w.hp>=health(w)*.3&&r.age<90&&(target.garrison||0)<api.capacity&&distance(w,entrance(target)||target)<1.6)continue;
      if(!enabled||!target||(target.owner||1)===(w.owner||1)||w.hp<health(w)*.3||r.age>=90){returnHome(w);continue;}
      // Rebind by coordinates after demolition shifts building indices.
      if(w.unit==='swordsman'&&w.order)w.order.building=buildings.indexOf(target);
    }
    if(!enabled){state.raidClock=0;return;}
    state.raidClock=Math.min(60,(state.raidClock||0)+dt);if(state.raidClock<60)return;state.raidClock=0;
    const available=workers.filter(w=>field(w)&&!w.raid&&w.hp>=health(w)*.7&&w.phase==='guard'&&!w.patrol&&(!w.tactics||w.tactics.mode==='guard'));
    for(const owner of new Set(available.map(w=>w.owner||1))){
      if(workers.some(w=>w.raid&&(w.owner||1)===owner))continue;
      const army=available.filter(w=>(w.owner||1)===owner);
      // Targets must be within local soldier perception; no whole-map knowledge.
      const targets=buildings.filter(b=>b.type==='tower'&&!b.destroyed&&b.progress>=1&&(b.owner||1)!==owner&&army.some(w=>distance(w,b)<=8)).sort((a,b)=>(a.garrison||0)-(b.garrison||0));
      for(const target of targets){
        const door=entrance(target);if(!door)continue;
        const squad=army.filter(w=>distance(w,target)<=12).map(w=>({w,route:routeTo(w,door)})).filter(o=>o.route).slice(0,6);
        const defenders=workers.filter(w=>!w.dead&&(w.owner||1)!==owner&&(w.garrisonIndex===buildings.indexOf(target)||w.garrisonIndex===undefined&&['swordsman','archer','medic'].includes(w.unit)&&distance(w,target)<=5));
        const resistance=defenders.reduce((n,w)=>n+w.hp,0)+Math.max(0,(target.garrison||0)-defenders.filter(w=>w.garrisonIndex!==undefined).length)*55;
        if(!squad.some(o=>o.w.unit==='swordsman')||squad.reduce((n,o)=>n+o.w.hp,0)<resistance*1.25+20)continue;
        for(const {w,route} of squad){
          w.raid={home:{x:w.x,y:w.y},target:{x:target.x,y:target.y},stage:'attack',age:0};
          delete w.tactics;w.waypoints=[];w.route=route;w.routeIndex=0;w.phase='command';w.wait=0;
          w.order={x:target.x,y:target.y,building:w.unit==='swordsman'?buildings.indexOf(target):-1};
        }
        api.notify?.(target,squad.length);break;
      }
    }
  }
  return {tick};
}

// Outdoor production is performed by the assigned worker, never by a building timer.
export function createOutdoor(api){
  const {terrain,buildings,trees,rocks,roads,workers,routeTo,entrance,followRoute}=api;
  const handles=b=>['farm','forester','fisher'].includes(b.type);
  const free=(x,y,shore=false)=>(terrain[y]?.[x]==='grass'||shore&&terrain[y]?.[x]==='shore')&&!api.occupied?.(x,y)&&![...trees,...rocks,...roads,...buildings].some(o=>o.x===x&&o.y===y);
  const reserved=(x,y,w)=>workers.some(o=>o!==w&&o.outdoorJob?.x===x&&o.outdoorJob?.y===y);
  function sites(b,w){
    const a=b.area||b,result=[];b.fields??=[];
    for(let dy=-3;dy<=3;dy++)for(let dx=-3;dx<=3;dx++){
      const x=a.x+dx,y=a.y+dy;if(!free(x,y,b.type==='fisher')||reserved(x,y,w))continue;
      const field=buildings.flatMap(o=>o.fields||[]).find(f=>f.x===x&&f.y===y);
      if(b.type==='farm'){
        if(field&&b.fields.includes(field)&&field.age>=35)result.push({x,y,kind:'harvest'});
        else if(!field&&b.fields.length<4)result.push({x,y,kind:'sow'});
      }else if(!field&&b.type==='forester')result.push({x,y,kind:'plant'});
      else if(b.type==='fisher'&&[[1,0],[-1,0],[0,1],[0,-1]].some(([dx,dy])=>terrain[y+dy]?.[x+dx]==='water'))result.push({x,y,kind:'fish'});
    }
    return result.sort((a,c)=>(a.kind==='harvest'?-100:0)-(c.kind==='harvest'?-100:0)+Math.hypot(a.x-w.x,a.y-w.y)-Math.hypot(c.x-w.x,c.y-w.y));
  }
  function grow(dt){for(const b of buildings)for(const f of b.fields||[])f.age=Math.min(35,(f.age||0)+dt);}
  function update(w,b,dt){
    if(!handles(b))return false;
    if(w.phase==='staffTravel')return true;
    if(!w.phase.startsWith('field')){w.phase='fieldWait';w.inside=false;w.route=null;w.workCarry=null;b.outputInTransit=false;b.work=0;}
    if(w.phase==='fieldWait'){
      w.outdoorRetry=(w.outdoorRetry||0)-dt;if(b.ready||b.productionRemaining===0||w.outdoorRetry>0)return true;w.outdoorRetry=3;
      for(const job of sites(b,w)){const route=routeTo(w,{x:job.x+.5,y:job.y+.5});if(!route)continue;
        // Confirm the return path before committing to an outdoor job.
        const door=entrance(b);if(!door||!routeTo({x:job.x+.5,y:job.y+.5},door))continue;
        w.outdoorJob=job;w.route=route;w.routeIndex=0;w.phase='fieldTravel';break;
      }
    }
    if(w.phase==='fieldTravel'&&followRoute(w,dt)){w.phase='fieldWork';w.outdoorTime=0;w.route=null;}
    if(w.phase==='fieldWork'){
      if(b.productionRemaining===0)return true;
      const j=w.outdoorJob;if(!j){w.phase='fieldWait';return true;}
      w.outdoorTime=(w.outdoorTime||0)+dt;
      if(w.outdoorTime<(j.kind==='fish'?12:j.kind==='harvest'?6:5))return true;
      if(j.kind==='plant'&&free(j.x,j.y)){trees.push({x:j.x,y:j.y,age:0,v:((j.x*17+j.y*31)%100)/100});if(b.productionRemaining>0)b.productionRemaining--;}
      if(j.kind==='sow'&&free(j.x,j.y)&&!buildings.some(o=>o.fields?.some(f=>f.x===j.x&&f.y===j.y)))b.fields.push({x:j.x,y:j.y,age:0});
      if(j.kind==='harvest'){const i=b.fields.findIndex(f=>f.x===j.x&&f.y===j.y&&f.age>=35);if(i>=0){b.fields.splice(i,1);w.workCarry='grain';}}
      if(j.kind==='fish')w.workCarry='fish';
      if(w.workCarry&&b.productionRemaining>0)b.productionRemaining--;
      w.phase='fieldReturn';w.route=null;w.outdoorJob=null;
    }
    if(w.phase==='fieldReturn'){
      if(!w.route){w.outdoorRetry=(w.outdoorRetry||0)-dt;if(w.outdoorRetry>0)return true;w.outdoorRetry=3;const door=entrance(b);w.route=door&&routeTo(w,door);w.routeIndex=0;}
      if(w.route&&followRoute(w,dt)){
        if(w.workCarry){b.ready=w.workCarry;b.outputAmount=2;w.workCarry=null;}
        w.phase='fieldWait';w.route=null;w.outdoorRetry=0;
      }
    }
    return true;
  }
  return {handles,grow,update};
}

// Sub-tile parking; active work and transport always take priority.
export function createSettlerSpacing({workers,terrain,blocked,move}){
  const targets=new WeakMap();let clock=0;
  const visible=w=>!w.dead&&!w.inside&&w.garrisonIndex===undefined;
  const free=w=>visible(w)&&['idle','guard','staffWait'].includes(w.phase)&&!w.carry&&!w.task&&!w.autoWork;
  const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
  function clear(a,b,obstacles){
    const n=Math.max(1,Math.ceil(distance(a,b)/.12));
    for(let i=1;i<=n;i++){const x=Math.floor(a.x+(b.x-a.x)*i/n),y=Math.floor(a.y+(b.y-a.y)*i/n);if(!['grass','shore'].includes(terrain[y]?.[x])||obstacles.has(x+','+y))return false;}
    return true;
  }
  function tick(dt){
    clock-=dt;const allBlocked=blocked(),pioneerBlocked=blocked({unit:'pioneer'}),obstacles=w=>w.unit==='pioneer'?pioneerBlocked:allBlocked;
    if(clock<=0){
      clock=.3;const occupied=new Map();
      const add=p=>{const k=Math.floor(p.x)+','+Math.floor(p.y);if(!occupied.has(k))occupied.set(k,[]);occupied.get(k).push(p);};
      const room=(p,w)=>{for(let y=Math.floor(p.y)-1;y<=Math.floor(p.y)+1;y++)for(let x=Math.floor(p.x)-1;x<=Math.floor(p.x)+1;x++)for(const o of occupied.get(x+','+y)||[])if(o.w!==w&&distance(o,p)<.42)return false;return true;};
      for(const w of workers)if(visible(w))add({x:w.x,y:w.y,w});
      for(const w of workers){
        if(!free(w)){targets.delete(w);continue;}
        const old=targets.get(w);if(old&&room(old,w)){add({...old,w});continue;}
        const centered=Math.abs(w.x%1-.5)<.015&&Math.abs(w.y%1-.5)<.015;
        if(room(w,w)&&!centered){targets.delete(w);continue;}
        const angle=(w.id*2.3999632297)%(Math.PI*2);let target=null;
        for(let ring=1;ring<=7&&!target;ring++)for(let j=0;j<12;j++){
          const a=angle+j*Math.PI/6,r=ring*.34,p={x:w.x+Math.cos(a)*r,y:w.y+Math.sin(a)*r};
          if(room(p,w)&&clear(w,p,obstacles(w))){target=p;break;}
        }
        if(target){targets.set(w,target);add({...target,w});}else targets.delete(w);
      }
    }
    for(const w of workers){const p=targets.get(w);if(!p||!free(w))continue;
      if(!clear(w,p,obstacles(w))){targets.delete(w);continue;}
      if(move(w,p.x,p.y,dt))targets.delete(w);
    }
  }
  tick.moving=w=>free(w)&&targets.has(w);
  return tick;
}

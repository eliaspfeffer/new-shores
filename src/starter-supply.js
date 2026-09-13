import {findPath,keyOf} from './navigation.js';
// Only add resources to free, owned ground. Never remove or move existing objects.
export function ensureStarterSupply({terrain,buildings,trees,rocks,roads,workers,ownerAt}){
  const home=buildings[0],result={addedTrees:0,addedStone:0,sites:[]};if(!home)return result;
  const occupied=new Set([...buildings,...trees,...rocks,...roads,...workers.filter(w=>!w.dead).map(w=>({x:Math.floor(w.x),y:Math.floor(w.y)})),...buildings.flatMap(b=>b.fields||[])].map(p=>keyOf(p.x,p.y)));
  for(const w of workers)if(!w.dead)for(const p of [...(w.route||[]),w.workSite,w.outdoorJob,w.manualTarget].filter(Boolean))occupied.add(keyOf(Math.floor(p.x),Math.floor(p.y)));
  const reserved=[];
  const obstacles=()=>new Set([...buildings,...trees,...rocks,...reserved].map(p=>keyOf(p.x,p.y)));
  const adjacent=p=>[[0,1],[1,0],[-1,0],[0,-1]].map(([x,y])=>({x:p.x+x,y:p.y+y}));
  const owned=p=>terrain[p.y]?.[p.x]==='grass'&&ownerAt(p.x,p.y)===1;
  const free=p=>owned(p)&&!occupied.has(keyOf(p.x,p.y));
  const center=p=>({x:p.x+.5,y:p.y+.5});
  const start=adjacent(home).find(p=>owned(p)&&!obstacles().has(keyOf(p.x,p.y)));if(!start)return result;
  const route=(a,b,blocked)=>{const path=findPath(center(a),center(b),terrain,blocked,new Map());return path&&path.every(p=>ownerAt(Math.floor(p.x),Math.floor(p.y))===1);};
  const plots=[];for(let y=Math.max(1,home.y-8);y<=Math.min(terrain.length-2,home.y+8);y++)for(let x=Math.max(1,home.x-8);x<=Math.min(terrain[y].length-2,home.x+8);x++)if(Math.hypot(x-home.x,y-home.y)>=3&&Math.hypot(x-home.x,y-home.y)<=8&&free({x,y}))plots.push({x,y});
  plots.sort((a,b)=>Math.hypot(a.x-home.x,a.y-home.y)-Math.hypot(b.x-home.x,b.y-home.y));
  for(const [type,list] of [['quarry',rocks],['woodcutter',trees]]){
    let found=null;
    for(const plot of plots){
      if(!free(plot))continue;
      const base=obstacles();base.add(keyOf(plot.x,plot.y));
      const doors=adjacent(plot).filter(p=>owned(p)&&!base.has(keyOf(p.x,p.y))&&route(start,p,base));if(!doors.length)continue;
      const nearby=list.find(p=>owned(p)&&(type==='quarry'?p.amount>0:p.age===undefined||p.age>=120)&&Math.abs(p.x-plot.x)+Math.abs(p.y-plot.y)<=3&&adjacent(p).some(q=>owned(q)&&!base.has(keyOf(q.x,q.y))&&route(doors[0],q,base)));
      if(nearby){found={type,plot,resource:{x:nearby.x,y:nearby.y},added:false};break;}
    }
    if(!found)for(const plot of plots){
      if(!free(plot))continue;
      const candidates=adjacent(plot).filter(free);
      for(const resource of candidates){
        const blocked=obstacles();blocked.add(keyOf(plot.x,plot.y));blocked.add(keyOf(resource.x,resource.y));
        const door=adjacent(plot).find(p=>owned(p)&&!blocked.has(keyOf(p.x,p.y))&&route(start,p,blocked));
        if(!door||!adjacent(resource).some(p=>owned(p)&&!blocked.has(keyOf(p.x,p.y))&&route(door,p,blocked)))continue;
        const item=type==='quarry'?{...resource,amount:80}:{...resource,v:.6};list.push(item);occupied.add(keyOf(resource.x,resource.y));
        if(type==='quarry')result.addedStone+=80;else result.addedTrees++;
        found={type,plot,resource,added:true};break;
      }
      if(found)break;
    }
    if(found&&type==='woodcutter'&&found.added){
      for(let dy=-3;dy<=3&&result.addedTrees<8;dy++)for(let dx=-3;dx<=3&&result.addedTrees<8;dx++){
        const p={x:found.plot.x+dx,y:found.plot.y+dy};if(!free(p)||!dx&&!dy||Math.abs(dx)+Math.abs(dy)>3)continue;
        const blocked=obstacles();blocked.add(keyOf(found.plot.x,found.plot.y));blocked.add(keyOf(p.x,p.y));
        const door=adjacent(found.plot).find(q=>owned(q)&&!blocked.has(keyOf(q.x,q.y))&&route(start,q,blocked));
        if(!door||![...trees.filter(t=>Math.abs(t.x-found.plot.x)+Math.abs(t.y-found.plot.y)<=3),p].every(t=>adjacent(t).some(q=>owned(q)&&!blocked.has(keyOf(q.x,q.y))&&route(door,q,blocked))))continue;
        trees.push({...p,v:.6});occupied.add(keyOf(p.x,p.y));result.addedTrees++;
      }
    }
    if(found){occupied.add(keyOf(found.plot.x,found.plot.y));reserved.push(found.plot);result.sites.push(found);}
  }
  return result;
}

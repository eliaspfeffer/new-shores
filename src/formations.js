export const formationTypes=['compact','line','block'];
export function formationOrders(origin,units,mode,terrain,routeTo){
  const result=new Map(),used=new Set(),width=mode==='line'?units.length:Math.ceil(Math.sqrt(units.length));
  units.forEach((w,i)=>{
    const desired={x:origin.x+i%width-Math.floor(width/2),y:origin.y+Math.floor(i/width)};
    // Nearby fallback cells retain unique destinations when an ideal slot is blocked.
    for(let r=0;r<=6;r++)for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){
      if(result.has(w.id))return;if(Math.max(Math.abs(dx),Math.abs(dy))!==r)continue;
      const x=desired.x+dx,y=desired.y+dy,key=x+','+y;if(terrain[y]?.[x]!=='grass'||used.has(key))continue;
      const point={x:x+.5,y:y+.5},route=routeTo(w,point);if(!route)continue;
      used.add(key);result.set(w.id,{point,route});return;
    }
  });
  return result;
}

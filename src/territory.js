// Shared ownership calculation for the simulation and server-side delivery placement.
export function territoryOwners(terrain,buildings,claims=[]){
  const owners=terrain.map(row=>row.map(()=>0)),strengths=terrain.map(row=>row.map(()=>-Infinity));
  const sources=[...buildings.filter(b=>b.progress>=1&&!b.destroyed&&(b.type==='storehouse'||b.type==='tower'&&b.garrison>0)).map(b=>({...b,r:b.type==='storehouse'?12:9})),...claims.map(c=>({...c,r:c.single?0:2.5,owner:1}))];
  for(const b of sources)for(let y=Math.max(0,Math.floor(b.y-b.r));y<Math.min(terrain.length,b.y+b.r+1);y++)for(let x=Math.max(0,Math.floor(b.x-b.r));x<Math.min(terrain[y].length,b.x+b.r+1);x++){const power=b.r-Math.hypot(b.x-x,b.y-y);if(power>=0&&power>strengths[y][x]){strengths[y][x]=power;owners[y][x]=b.owner||1;}}
  return owners;
}

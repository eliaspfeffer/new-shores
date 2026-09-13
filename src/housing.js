export const housingCapacity=b=>b.type==='largehouse'?12:b.type==='house'?4:0;
// Existing finished residences never receive another population grant on load.
export function finishHousing(b,resources){
  const capacity=housingCapacity(b);if(!capacity)return false;
  resources.beds+=capacity;b.spawnRemaining=capacity;b.spawnClock=0;return true;
}
export function updateHousing(dt,buildings,workers,resources,entrance){
  for(const b of buildings){
    if(!housingCapacity(b)||b.progress<1||(b.owner||1)!==1||b.stopped||!(b.spawnRemaining>0))continue;
    b.spawnClock=Math.min(2,(b.spawnClock||0)+dt);
    if(b.spawnClock<2||resources.people>=resources.beds||workers.length>=10000)continue;
    const door=entrance(b);if(!door)continue;
    const id=workers.reduce((max,w)=>Math.max(max,w.id),-1)+1;
    workers.push({id,x:b.x+.55,y:b.y+.65,homeX:door.x,homeY:door.y,phase:'manual',route:[door],routeIndex:0,task:null,t:0,carry:null});
    resources.people++;b.spawnRemaining--;b.spawnClock=0;
  }
}

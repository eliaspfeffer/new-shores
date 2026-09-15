// Add finite satellite seams once. Never refill depleted seams or move a saved building.
export function expandMineralRegions(state,terrain,buildings){
  if(state.mineralRegionsVersion===1)return;
  const anchors=[...(state.deposits||[])];
  const offsets=[[4,0],[0,4],[-4,0],[0,-4],[4,4],[-4,-4],[4,-4],[-4,4]];
  for(const anchor of anchors){
    let added=0;
    for(const [dx,dy] of offsets){
      const x=anchor.x+dx,y=anchor.y+dy;
      if(terrain[y]?.[x]!=='grass'||buildings.some(b=>Math.hypot(b.x-x,b.y-y)<3.5)||state.deposits.some(d=>Math.hypot(d.x-x,d.y-y)<3.5))continue;
      state.deposits.push({x,y,type:anchor.type,amount:240,initialAmount:240,discovered:false});
      if(++added===3)break;
    }
  }
  state.mineralRegionsVersion=1;
}

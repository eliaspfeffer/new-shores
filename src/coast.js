export function hasWaterNear(terrain,point,radius=2,{worldEdge=false}={}){
  for(let dy=-radius;dy<=radius;dy++)for(let dx=-radius;dx<=radius;dx++){
    const y=point.y+dy,x=point.x+dx,row=terrain[y],tile=row?.[x];
    if(tile==='water'||worldEdge&&(tile==='void'||!row||x<0||x>=row.length))return true;
  }
  return false;
}

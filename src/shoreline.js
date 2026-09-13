// Each segment borders real water. Never join unrelated lakes across land.
export function shoreEdges(terrain){
  const edges=[];
  for(let y=0;y<terrain.length;y++)for(let x=0;x<terrain[y].length;x++){
    if(!['grass','shore'].includes(terrain[y][x]))continue;
    for(const [dx,dy,a,b] of [[1,0,[x+1,y],[x+1,y+1]],[0,1,[x+1,y+1],[x,y+1]],[-1,0,[x,y+1],[x,y]],[0,-1,[x,y],[x+1,y]]])
      if(terrain[y+dy]?.[x+dx]==='water')edges.push([a,b]);
  }
  return edges;
}

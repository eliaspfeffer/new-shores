// Dust at 10 crossings is stated in uYNPbIgU88k. Paving at 50 is provisional:
// the automatic transcript is ambiguous; the 9/8/7 tick ratio is documented separately.
export const keyOf = (x, y) => `${x},${y}`;
export function roadStage(visits = 0) { return visits >= 50 ? 2 : visits >= 10 ? 1 : 0; }
export function walkSpeed(visits = 0) { return 9 / [9, 8, 7][roadStage(visits)]; }

export function findPath(start, goal, terrain, blocked = new Set(), traffic = new Map()) {
  const sx = Math.floor(start.x), sy = Math.floor(start.y), gx = Math.floor(goal.x), gy = Math.floor(goal.y);
  const startKey = keyOf(sx, sy), endKey = keyOf(gx, gy);
  const passable = (x, y) => ['grass', 'shore', 'bridge'].includes(terrain[y]?.[x]) && (!blocked.has(keyOf(x,y)) || keyOf(x,y) === startKey);
  if (!passable(gx, gy)) return null;
  const open = [{x:sx,y:sy,g:0,f:0}], best = new Map([[startKey,0]]), parent = new Map();
  const h = (x,y) => Math.hypot(gx-x,gy-y) * 7/9;
  while (open.length) {
    let index=0;
    for(let i=1;i<open.length;i++) if(open[i].f<open[index].f) index=i;
    const node=open.splice(index,1)[0], key=keyOf(node.x,node.y);
    if(node.g>best.get(key)) continue;
    if(key===endKey) {
      const path=[]; let cursor=key;
      while(cursor!==startKey) { const [x,y]=cursor.split(',').map(Number); path.push({x:x+.5,y:y+.5}); cursor=parent.get(cursor); }
      path.reverse(); if(!path.length)path.push({x:gx+.5,y:gy+.5}); return path;
    }
    for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,-1],[1,-1],[-1,1]]) {
      const x=node.x+dx,y=node.y+dy;
      if(!passable(x,y)||(dx&&dy&&(!passable(node.x+dx,node.y)||!passable(node.x,node.y+dy))))continue;
      const next=keyOf(x,y),g=node.g+Math.hypot(dx,dy)/walkSpeed(traffic.get(next));
      if(g>=(best.get(next)??Infinity))continue;
      best.set(next,g);parent.set(next,key);open.push({x,y,g,f:g+h(x,y)});
    }
  }
  return null;
}

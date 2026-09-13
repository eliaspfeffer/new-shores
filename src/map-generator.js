// Versioned original layouts, not reproductions of the original game's maps.
export const mapTypes={classic:'Klassische Karte',coast:'Waldküste',lake:'Seenland'};
export const validMapConfig=c=>c&&c.version===1&&Object.hasOwn(mapTypes,c.type)&&Number.isInteger(c.seed)&&c.seed>=0&&c.seed<=4294967295;
export function generateMap(config){
  if(!validMapConfig(config)||config.type==='classic')throw new Error('Ungültige Generatorkarte');
  const size=50,terrain=[],trees=[],rocks=[],details=[],clear=new Set();
  const random=(x,y,salt=0)=>{let n=(Math.imul(x+1,374761393)^Math.imul(y+1,668265263)^Math.imul(salt+1,1274126177)^config.seed)>>>0;n=Math.imul(n^(n>>>13),1274126177);return ((n^(n>>>16))>>>0)/4294967296;};
  const noise=(x,y,salt)=>{const a=Math.floor(x/4),b=Math.floor(y/4),u=x/4-a,v=y/4-b,e=t=>t*t*(3-2*t),s=e(u),t=e(v);return (random(a,b,salt)*(1-s)+random(a+1,b,salt)*s)*(1-t)+(random(a,b+1,salt)*(1-s)+random(a+1,b+1,salt)*s)*t;};
  const lake={x:12+random(0,0)*5,y:13+random(1,0)*7,rx:4+random(2,0)*3,ry:4+random(3,0)*3};
  for(let y=0;y<size;y++){terrain[y]=[];for(let x=0;x<size;x++){
    const edge=40+Math.sin(y*.19+random(4,0)*6)*2+(noise(x,y,4)-.5)*3;
    const inLake=config.type==='lake'&&((x-lake.x)/lake.rx)**2+((y-lake.y)/lake.ry)**2<1;
    terrain[y][x]=x>edge||inLake?'water':'grass';
  }}
  const disk=(cx,cy,r)=>{for(let y=Math.max(0,cy-r);y<=Math.min(49,cy+r);y++)for(let x=Math.max(0,cx-r);x<=Math.min(49,cx+r);x++)if(Math.hypot(x-cx,y-cy)<=r){terrain[y][x]='grass';clear.add(x+','+y);}};
  // Fixed start anchors retain existing scenario/mineral rules. Clear approaches are
  // walkable land, not prebuilt roads; traffic still creates paths during play.
  disk(25,25,4);disk(37,14,3);
  const anchors=[[18,22],[31,26],[30,18],[18,31],[37,14],[23,31],[27,30]];
  for(const [tx,ty] of anchors){disk(tx,ty,2);let x=25,y=25;while(x!==tx||y!==ty){if(x!==tx)x+=Math.sign(tx-x);else y+=Math.sign(ty-y);disk(x,y,1);}}
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){
    if(terrain[y][x]!=='grass')continue;
    if(!clear.has(x+','+y)&&[[1,0],[-1,0],[0,1],[0,-1]].some(([dx,dy])=>terrain[y+dy]?.[x+dx]==='water'))terrain[y][x]='shore';
  }
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){
    if(terrain[y][x]!=='grass'||clear.has(x+','+y))continue;
    const forest=noise(x+7,y+9,1),stone=noise(x,y,2);
    if(forest>.47&&random(x,y,3)>.25)trees.push({x,y,v:random(x,y,7)});
    else if(stone>.72&&random(x,y,5)>.6)rocks.push({x,y,amount:4+Math.floor(random(x,y,8)*4)});
    else if(random(x,y,6)>.82)details.push({x,y,type:Math.floor(random(x,y,9)*3)});
  }
  // Guaranteed starter timber and stone, with a free accessible edge for workers.
  for(const [cx,cy,kind] of [[21,31,'tree'],[29,30,'rock']]){
    disk(cx,cy,3);
    for(const list of [trees,rocks,details])for(let i=list.length-1;i>=0;i--)if(Math.hypot(list[i].x-cx,list[i].y-cy)<=3)list.splice(i,1);
    for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
      const x=cx+dx,y=cy+dy;
      if(kind==='tree')trees.push({x,y,v:random(x,y,7)});else rocks.push({x,y,amount:6});
    }
  }
  return {terrain,trees,rocks,details};
}

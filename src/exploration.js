// Exploration is separate from ownership. Seen land remains known after scouts leave.
export function createExploration(width,height){
  const size=width*height,explored=new Uint8Array(size),visible=new Uint8Array(size);
  const remote=new Uint8Array(size);
  let revision=0;
  const index=(x,y)=>{x=Math.floor(x);y=Math.floor(y);return x>=0&&y>=0&&x<width&&y<height?y*width+x:-1;};
  const seen=(x,y)=>explored[index(x,y)]===1;
  const sees=(x,y)=>visible[index(x,y)]===1;
  function update(buildings,workers){
    const next=new Uint8Array(remote);
    const sources=buildings.filter(b=>(b.owner||1)===1&&!b.destroyed).map(b=>({x:b.x+.5,y:b.y+.5,r:b.type==='storehouse'?13:b.type==='tower'&&b.garrison>0?10:5}));
    for(const w of workers)if((w.owner||1)===1&&!w.dead&&w.garrisonIndex===undefined)sources.push({x:w.x,y:w.y,r:w.unit?5:3});
    for(const s of sources)for(let y=Math.max(0,Math.floor(s.y-s.r));y<Math.min(height,Math.ceil(s.y+s.r));y++)for(let x=Math.max(0,Math.floor(s.x-s.r));x<Math.min(width,Math.ceil(s.x+s.r));x++)if(Math.hypot(x+.5-s.x,y+.5-s.y)<=s.r)next[y*width+x]=1;
    let changed=false;for(let i=0;i<size;i++){if(next[i]!==visible[i])changed=true;visible[i]=next[i];if(next[i]&&!explored[i]){explored[i]=1;changed=true;}}
    if(changed)revision++;
  }
  function revealCircle(cx,cy,r){let changed=false;for(let y=Math.max(0,Math.floor(cy-r));y<Math.min(height,Math.ceil(cy+r+1));y++)for(let x=Math.max(0,Math.floor(cx-r));x<Math.min(width,Math.ceil(cx+r+1));x++)if(Math.hypot(x-cx,y-cy)<=r){const i=y*width+x;if(!remote[i]||!explored[i])changed=true;remote[i]=1;explored[i]=1;}if(changed)revision++;}
  function restore(data){explored.fill(0);visible.fill(0);remote.fill(0);if(Array.isArray(data))for(const i of data)if(Number.isInteger(i)&&i>=0&&i<size)explored[i]=1;revision++;}
  return {seen,sees,update,revealCircle,restore,save:()=>Array.from(explored.entries()).filter(([,v])=>v).map(([i])=>i),get revision(){return revision;}};
}

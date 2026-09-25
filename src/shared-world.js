// Nine island sites on one compact sea. Generated land stays within the first
// 50 tiles of each legacy map; four sea tiles separate neighbouring sites.
export const SHARED_WORLD_SIZE=162;
export const SHARED_WORLD_STRIDE=54;
export const SHARED_WORLD_CAPACITY=9;
export const SHARED_WORLD_CELL_SIZE=50;
const OLD_WORLD_SIZE=228,OLD_WORLD_STRIDE=76;

export function worldSlotOrigin(slot){
  if(!Number.isInteger(slot)||slot<0||slot>=SHARED_WORLD_CAPACITY)throw new Error('Ungültiger Weltplatz.');
  return {x:2+(slot%3)*SHARED_WORLD_STRIDE,y:2+Math.floor(slot/3)*SHARED_WORLD_STRIDE};
}

export function promoteIslandToWorld(original,slot){
  const origin=worldSlotOrigin(slot),size=original.worldSize||original.terrain?.length||50;
  if(![50,72].includes(size))throw new Error('Diese Insel kann nicht in die gemeinsame Welt übertragen werden.');
  const copy=structuredClone(original),terrain=Array.from({length:SHARED_WORLD_SIZE},()=>Array(SHARED_WORLD_SIZE).fill('water'));
  for(let y=0;y<Math.min(size,SHARED_WORLD_CELL_SIZE);y++)for(let x=0;x<Math.min(size,SHARED_WORLD_CELL_SIZE);x++)terrain[y+origin.y][x+origin.x]=original.terrain?.[y]?.[x]||'water';
  copy.terrain=terrain;copy.worldSize=SHARED_WORLD_SIZE;copy.mode='multiplayer';copy.worldSlot=slot;
  delete copy.mapPreview;
  if(Array.isArray(original.exploration))copy.exploration=original.exploration.map(i=>(Math.floor(i/size)+origin.y)*SHARED_WORLD_SIZE+i%size+origin.x);
  const shift=(value)=>{
    if(!value||typeof value!=='object')return;
    if(Array.isArray(value)){for(const item of value)shift(item);return;}
    if(Number.isFinite(value.x)&&Number.isFinite(value.y)){value.x+=origin.x;value.y+=origin.y;}
    for(const [a,b] of [['homeX','homeY'],['fromX','fromY'],['targetX','targetY']])if(Number.isFinite(value[a])&&Number.isFinite(value[b])){value[a]+=origin.x;value[b]+=origin.y;}
    for(const [key,item] of Object.entries(value))if(key!=='terrain'&&key!=='mapPreview'&&key!=='camera'&&key!=='exploration')shift(item);
  };
  for(const key of ['buildings','roads','trees','rocks','details','workers','strategy'])shift(copy[key]);
  if(copy.camera&&Number.isFinite(copy.camera.x)&&Number.isFinite(copy.camera.y)){
    const zoom=Number.isFinite(copy.camera.zoom)?copy.camera.zoom:1;
    copy.camera.x-=(origin.x-origin.y)*44*zoom;
    copy.camera.y-=(origin.x+origin.y)*22*zoom;
  }
  // Traffic is cosmetic. Old coordinate keys would point at another island.
  copy.traffic=[];copy.trailEdges=[];copy.trafficLastUsed=[];
  return copy;
}

export function repackWorld(original,slot){
  if(original.worldSize!==OLD_WORLD_SIZE)throw new Error('Keine ältere Multiplayer-Welt.');
  const copy=structuredClone(original),terrain=Array.from({length:SHARED_WORLD_SIZE},()=>Array(SHARED_WORLD_SIZE).fill('water'));
  for(let oldSlot=0;oldSlot<SHARED_WORLD_CAPACITY;oldSlot++){
    const oldX=2+(oldSlot%3)*OLD_WORLD_STRIDE,oldY=2+Math.floor(oldSlot/3)*OLD_WORLD_STRIDE;
    const next=worldSlotOrigin(oldSlot);
    for(let y=0;y<SHARED_WORLD_CELL_SIZE;y++)for(let x=0;x<SHARED_WORLD_CELL_SIZE;x++)terrain[next.y+y][next.x+x]=original.terrain?.[oldY+y]?.[oldX+x]||'water';
  }
  const coordinate=n=>n-Math.max(0,Math.min(2,Math.floor((n-2)/OLD_WORLD_STRIDE)))*(OLD_WORLD_STRIDE-SHARED_WORLD_STRIDE);
  const shift=value=>{
    if(!value||typeof value!=='object')return;
    if(Array.isArray(value)){for(const item of value)shift(item);return;}
    if(Number.isFinite(value.x)&&Number.isFinite(value.y)){value.x=coordinate(value.x);value.y=coordinate(value.y);}
    for(const [a,b] of [['homeX','homeY'],['fromX','fromY'],['targetX','targetY']])if(Number.isFinite(value[a])&&Number.isFinite(value[b])){value[a]=coordinate(value[a]);value[b]=coordinate(value[b]);}
    for(const [key,item] of Object.entries(value))if(key!=='terrain'&&key!=='camera'&&key!=='exploration'&&key!=='mapPreview')shift(item);
  };
  for(const key of ['buildings','roads','trees','rocks','details','workers','strategy'])shift(copy[key]);
  const old=2+(slot%3)*OLD_WORLD_STRIDE,oldY=2+Math.floor(slot/3)*OLD_WORLD_STRIDE,next=worldSlotOrigin(slot);
  if(copy.camera&&Number.isFinite(copy.camera.x)&&Number.isFinite(copy.camera.y)){
    const zoom=Number.isFinite(copy.camera.zoom)?copy.camera.zoom:1,dx=next.x-old,dy=next.y-oldY;
    copy.camera.x-=(dx-dy)*44*zoom;copy.camera.y-=(dx+dy)*22*zoom;
  }
  if(Array.isArray(copy.exploration))copy.exploration=[...new Set(copy.exploration.map(i=>{
    const x=coordinate(i%OLD_WORLD_SIZE),y=coordinate(Math.floor(i/OLD_WORLD_SIZE));
    return x>=0&&y>=0&&x<SHARED_WORLD_SIZE&&y<SHARED_WORLD_SIZE?Math.floor(y)*SHARED_WORLD_SIZE+Math.floor(x):-1;
  }).filter(i=>i>=0))];
  copy.terrain=terrain;copy.worldSize=SHARED_WORLD_SIZE;copy.worldSlot=slot;
  copy.traffic=[];copy.trailEdges=[];copy.trafficLastUsed=[];
  delete copy.mapPreview;
  return copy;
}

export function visibleIslandState(row){
  const slot=row.world_slot,origin=worldSlotOrigin(slot),snapshot=row.snapshot;
  const within=p=>p&&p.x>=origin.x&&p.y>=origin.y&&p.x<origin.x+SHARED_WORLD_CELL_SIZE&&p.y<origin.y+SHARED_WORLD_CELL_SIZE;
  const pick=key=>(snapshot[key]||[]).filter(within);
  return {id:row.id,slot,revision:row.revision,name:row.name,color:snapshot.playerColor||'blue',origin,
    terrain:snapshot.terrain?.slice(origin.y,origin.y+SHARED_WORLD_CELL_SIZE).map(line=>line.slice(origin.x,origin.x+SHARED_WORLD_CELL_SIZE))||[],
    buildings:pick('buildings').map(({type,x,y,progress,owner,garrison,stopped})=>({type,x,y,progress,owner,garrison,stopped})),
    trees:pick('trees'),rocks:pick('rocks'),details:pick('details'),roads:pick('roads'),
    workers:(snapshot.workers||[]).filter(w=>!w.dead&&(w.owner||1)===1).map(({id,x,y,unit,role,phase,t,direction,hp,maxHp,rank,carry})=>({id,x,y,unit,role,phase,t,direction,hp,maxHp,rank,carry})),
    ships:(snapshot.strategy?.naval?.ships||[]).filter(s=>(s.owner||1)===1).map(({id,x,y,type,status,hp})=>({id,x,y,type,status,hp}))};
}

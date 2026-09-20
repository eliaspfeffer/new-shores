const layout=[[-2,2,'warehouse'],[2,2,'house'],[-3,-1,'woodcutter'],[3,-1,'quarry'],[-2,-3,'sawmill'],[2,-3,'barracks'],[0,4,'farm'],[-4,2,'tower'],[4,2,'tower']];
// Islands sit on the outer rim of the current playable world.  The fog masks
// the surrounding ocean, so their position is not telegraphed before a beacon
// is complete; a larger world can later reuse the stable islandIndex values.
const ISLAND={landRadius:5,hiddenRadius:9};
const military=w=>!w.dead&&(w.owner||1)===2&&['swordsman','archer'].includes(w.unit);
export function playerStrength(buildings,workers){const economy=buildings.filter(b=>(b.owner||1)===1&&b.progress>=1&&!['storehouse','lighthouse'].includes(b.type)).length,army=workers.filter(w=>!w.dead&&(w.owner||1)===1&&['swordsman','archer'].includes(w.unit)).length;return {economy,army,targetBuildings:Math.min(100,Math.max(4,Math.floor(economy*.82))),targetArmy:Math.min(100,Math.max(3,Math.floor(Math.max(army,4)*.82)))}}
export function createEnemySettlement(api){
 const {state,buildings,workers,terrain,trees,rocks,details=[],notify,reveal,isSeen=()=>false,ownerAt=()=>0,recalculate,terrainChanged=()=>{}}=api;
 const nextId=()=>Math.max(-1,...workers.map(w=>w.id))+1,free=(x,y)=>terrain[y]?.[x]==='grass'&&!buildings.some(b=>Math.hypot(b.x-x,b.y-y)<1.5);
 const random=(x,y,s=0)=>{let n=(Math.imul(x+1,374761393)^Math.imul(y+1,668265263)^Math.imul(s+1,1274126177))>>>0;n=Math.imul(n^(n>>>13),1274126177);return ((n^(n>>>16))>>>0)/4294967296;};
 function clear(x,y,r=1.5){for(const list of [trees,rocks,details])for(let i=list.length-1;i>=0;i--)if(Math.hypot(list[i].x-x,list[i].y-y)<r)list.splice(i,1);}
 function addBuilding(x,y,type){if(!free(x,y))return false;clear(x,y);buildings.push({type,name:'KI '+type,owner:2,x,y,progress:1,completed:true,hp:type==='tower'?100:60,garrison:0});return true;}
 function addSoldier(type,home){workers.push({id:nextId(),x:home.x+.5,y:home.y+1.5,unit:type,owner:2,rank:1,maxHp:55,hp:55,phase:'guard',t:0});}
 const settlements=()=>[state.enemySettlement,...(state.enemySettlements||[])].filter(Boolean);
 const islandFor=ai=>({...ISLAND,x:ai.center.x,y:ai.center.y});
 // Do not conceal pre-existing terrain.  The global fog renderer masks the
 // ocean outside current vision; candidate selection below protects explored
 // or claimed player land from ever becoming a generated island.
 function prepare(){}
 function nextIsland(){
   const used=settlements().map(ai=>ai.center),candidates=[];
   for(let y=7;y<terrain.length-7;y+=2)for(let x=7;x<terrain[0].length-7;x+=2){
     if(used.some(p=>Math.hypot(p.x-x,p.y-y)<16))continue;
     let water=0,valid=true;
     for(let dy=-7;dy<=7&&valid;dy++)for(let dx=-7;dx<=7;dx++)if(dx*dx+dy*dy<=49){const tx=x+dx,ty=y+dy;if(isSeen(tx,ty)||ownerAt(tx,ty)||(buildings.some(b=>(b.owner||1)===1&&Math.hypot(b.x-tx,b.y-ty)<1.5))){valid=false;break;}if(terrain[ty]?.[tx]==='water')water++;}
     if(valid&&water>=70)candidates.push({x,y,water});
   }
   return candidates.sort((a,b)=>b.water-a.water||a.y-b.y||a.x-b.x)[0]||null;
 }
 function makeIsland(ai){if(ai.islandCreated)return;const island=islandFor(ai),{x:cx,y:cy}=ai.center;clear(cx,cy,8);
  for(let y=cy-7;y<=cy+7;y++)for(let x=cx-7;x<=cx+7;x++)if(terrain[y]?.[x]){const d=Math.hypot((x-cx)*1.04,y-cy),edge=island.landRadius+(random(x,y,1)-.5)*1.15;terrain[y][x]=d<=edge?(d>edge-1?'shore':'grass'):'water';}
  terrain[cy][cx-7]='grass';terrain[cy][cx-6]='water';terrain[cy][cx-5]='shore';ai.bridgeHint={x:cx-6,y:cy};
  for(let y=cy-4;y<=cy+4;y++)for(let x=cx-4;x<=cx+4;x++)if(terrain[y]?.[x]==='grass'&&Math.hypot(x-cx,y-cy)>2.2){const n=random(x,y,4);if(n>.72)trees.push({x,y,v:random(x,y,5)});else if(n<.15)rocks.push({x,y,amount:6+Math.floor(random(x,y,6)*5)});else if(n>.58)details.push({x,y,type:Math.floor(random(x,y,7)*3)});}
  state.deposits??=[];for(const [dx,dy,type,amount] of [[-3,1,'coal',70],[3,1,'ironOre',60],[0,-4,'goldOre',45],[0,4,'sulfur',45]])if(!state.deposits.some(d=>d.x===cx+dx&&d.y===cy+dy))state.deposits.push({x:cx+dx,y:cy+dy,type,amount,discovered:false,enemyIsland:true});
  ai.islandCreated=true;terrainChanged();
 }
 function discover(){const islandIndex=settlements().length,spot=nextIsland();if(!spot){notify('Kein unerforschtes, unbeanspruchtes Meer für eine weitere Insel gefunden. Erkunde oder beanspruche dort kein neues Küstengebiet.');return false;}const island={...ISLAND,...spot},score=playerStrength(buildings,workers),first=!state.enemySettlement;const ai={version:3,islandIndex,discovered:true,center:{x:island.x,y:island.y},growthClock:0,recruitClock:0,grace:180,targetBuildings:first?score.targetBuildings:Math.max(2,Math.floor(score.targetBuildings/2)),targetArmy:first?score.targetArmy:Math.max(1,Math.floor(score.targetArmy/2))};if(first)state.enemySettlement=ai;else (state.enemySettlements??=[]).push(ai);makeIsland(ai);
  const legacy=first&&buildings.find(b=>(b.owner||1)===2&&b.type==='tower');if(legacy){legacy.x=island.x-4;legacy.y=island.y+2;clear(legacy.x,legacy.y);}if(first)for(const w of workers)if((w.owner||1)===2){w.x=island.x+.5;w.y=island.y+1.5;delete w.garrisonIndex;w.phase='guard';}
  let made=buildings.filter(b=>(b.owner||1)===2&&Math.hypot(b.x-ai.center.x,b.y-ai.center.y)<9).length;for(const [dx,dy,type] of layout){if(made>=ai.targetBuildings)break;if(addBuilding(ai.center.x+dx,ai.center.y+dy,type))made++;}const home=buildings.find(b=>(b.owner||1)===2&&b.type==='warehouse'&&Math.hypot(b.x-ai.center.x,b.y-ai.center.y)<9)||ai.center;const islandArmy=()=>workers.filter(w=>military(w)&&Math.hypot(w.x-ai.center.x,w.y-ai.center.y)<9);while(islandArmy().length<ai.targetArmy)addSoldier(islandArmy().length%3===2?'archer':'swordsman',home);
  reveal(ai.center.x,ai.center.y,island.hiddenRadius);recalculate();notify(`Leuchtfeuer entdeckt KI-Insel ${islandIndex+1}: ${made} Gebäude und ${islandArmy().length} Soldaten. Baue Brücke oder Fähre an der schmalen Überfahrt.`);return true;
}
 function restore(){for(const ai of settlements()){let island=islandFor(ai);if(ai.version<2){const old={...ai.center};for(let y=old.y-6;y<=old.y+6;y++)for(let x=old.x-6;x<=old.x+6;x++)if(terrain[y]?.[x]==='water'&&Math.max(Math.abs(x-old.x),Math.abs(y-old.y))===6)terrain[y][x]='grass';ai.islandIndex=0;ai.center={x:42,y:10};island=islandFor(ai);ai.islandCreated=false;const enemy=buildings.filter(b=>(b.owner||1)===2);enemy.forEach((b,i)=>{const slot=layout[i%layout.length];b.x=island.x+slot[0];b.y=island.y+slot[1];});for(const w of workers)if((w.owner||1)===2){w.x=island.x+.5;w.y=island.y+1.5;delete w.garrisonIndex;w.phase='guard';}}ai.version=3;makeIsland(ai);reveal(ai.center.x,ai.center.y,island.hiddenRadius);}prepare();}
 function tick(dt){for(const ai of settlements()){const island=islandFor(ai);reveal(ai.center.x,ai.center.y,island.hiddenRadius);ai.grace=Math.max(0,(ai.grace||0)-dt);ai.growthClock=(ai.growthClock||0)+dt;ai.recruitClock=(ai.recruitClock||0)+dt;const score=playerStrength(buildings,workers);ai.targetBuildings=Math.max(ai.targetBuildings||0,score.targetBuildings);ai.targetArmy=Math.max(ai.targetArmy||0,score.targetArmy);if(ai.growthClock>=90){ai.growthClock=0;const count=buildings.filter(b=>(b.owner||1)===2&&Math.hypot(b.x-ai.center.x,b.y-ai.center.y)<9).length;if(count<ai.targetBuildings){const c=layout.find(([dx,dy])=>free(ai.center.x+dx,ai.center.y+dy));if(c)addBuilding(ai.center.x+c[0],ai.center.y+c[1],c[2]);recalculate();}}if(ai.recruitClock>=75){ai.recruitClock=0;const count=workers.filter(w=>military(w)&&Math.hypot(w.x-ai.center.x,w.y-ai.center.y)<9).length;if(count<ai.targetArmy){const home=buildings.find(b=>(b.owner||1)===2&&b.type==='warehouse'&&Math.hypot(b.x-ai.center.x,b.y-ai.center.y)<9)||ai.center;addSoldier(count%3===2?'archer':'swordsman',home);}}if(ai.grace<=0&&workers.filter(w=>military(w)&&Math.hypot(w.x-ai.center.x,w.y-ai.center.y)<9).length>=3)state.enemyRaids=true;}}
 return {prepare,discover,restore,tick};
}

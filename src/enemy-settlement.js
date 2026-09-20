// A deliberately bounded opponent economy. It mirrors the player's progress at
// a discount instead of simulating a second full transport network.
const layout=[[-2,2,'warehouse'],[2,2,'house'],[-3,-1,'woodcutter'],[3,-1,'quarry'],[-2,-3,'sawmill'],[2,-3,'barracks'],[0,4,'farm'],[-4,3,'tower'],[4,3,'tower']];
const military=w=>!w.dead&&(w.owner||1)===2&&['swordsman','archer'].includes(w.unit);

export function playerStrength(buildings,workers){
  const economy=buildings.filter(b=>(b.owner||1)===1&&b.progress>=1&&!['storehouse','lighthouse'].includes(b.type)).length;
  const army=workers.filter(w=>!w.dead&&(w.owner||1)===1&&['swordsman','archer'].includes(w.unit)).length;
  return {economy,army,targetBuildings:Math.min(100,Math.max(4,Math.floor(economy*.82))),targetArmy:Math.min(100,Math.max(3,Math.floor(Math.max(army,4)*.82)))};
}

export function createEnemySettlement(api){
  const {state,buildings,workers,terrain,trees,rocks,details=[],notify,reveal,recalculate,terrainChanged=()=>{}}=api;
  const nextId=()=>Math.max(-1,...workers.map(w=>w.id))+1;
  const free=(x,y)=>terrain[y]?.[x]==='grass'&&!buildings.some(b=>Math.hypot(b.x-x,b.y-y)<1.5);
  function clear(x,y){for(const list of [trees,rocks])for(let i=list.length-1;i>=0;i--)if(Math.hypot(list[i].x-x,list[i].y-y)<1.5)list.splice(i,1);}
  function addBuilding(x,y,type){if(!free(x,y))return false;clear(x,y);buildings.push({type,name:'KI '+type,owner:2,x,y,progress:1,completed:true,hp:type==='tower'?100:60,garrison:0});return true;}
  function addSoldier(type,home,garrisonIndex){const w={id:nextId(),x:home.x+.5,y:home.y+1.5,unit:type,owner:2,rank:1,maxHp:55,hp:55,phase:'guard',t:0};if(garrisonIndex!==undefined){w.phase='garrison';w.garrisonIndex=garrisonIndex;buildings[garrisonIndex].garrison=(buildings[garrisonIndex].garrison||0)+1;}workers.push(w);}
  function makeIsland(ai){if(ai.islandCreated)return;const {x:cx,y:cy}=ai.center;
    for(let y=cy-6;y<=cy+6;y++)for(let x=cx-6;x<=cx+6;x++)if(Math.max(Math.abs(x-cx),Math.abs(y-cy))===6&&terrain[y]?.[x]&&!buildings.some(b=>b.x===x&&b.y===y)){terrain[y][x]='water';for(const list of [trees,rocks,details])for(let i=list.length-1;i>=0;i--)if(list[i].x===x&&list[i].y===y)list.splice(i,1);}
    ai.islandCreated=true;ai.bridgeHint={x:cx-6,y:cy};terrainChanged();
  }
  function discover(lighthouse){
    if(state.enemySettlement?.discovered)return false;
    const existing=buildings.find(b=>(b.owner||1)===2&&b.type==='tower')||{x:37,y:14};
    const score=playerStrength(buildings,workers),ai={version:1,discovered:true,center:{x:existing.x,y:existing.y},growthClock:0,recruitClock:0,grace:180,targetBuildings:score.targetBuildings,targetArmy:score.targetArmy};
    state.enemySettlement=ai;makeIsland(ai);
    let made=buildings.filter(b=>(b.owner||1)===2).length;
    for(const [dx,dy,type] of layout){if(made>=score.targetBuildings)break;if(addBuilding(ai.center.x+dx,ai.center.y+dy,type))made++;}
    const home=buildings.find(b=>(b.owner||1)===2&&b.type==='warehouse')||existing;
    while(workers.filter(military).length<score.targetArmy)addSoldier(workers.filter(military).length%3===2?'archer':'swordsman',home);
    reveal(ai.center.x,ai.center.y,13);recalculate();
    notify(`Leuchtfeuer entdeckt eine KI-Insel: ${made} Gebäude und ${workers.filter(military).length} Soldaten. Baue eine Brücke über den schmalen Wassergraben.`);
    return true;
  }
  function restore(){const ai=state.enemySettlement;if(ai?.discovered){makeIsland(ai);reveal(ai.center.x,ai.center.y,13);}}
  function tick(dt){const ai=state.enemySettlement;if(!ai?.discovered)return;reveal(ai.center.x,ai.center.y,13);ai.grace=Math.max(0,(ai.grace||0)-dt);ai.growthClock=(ai.growthClock||0)+dt;ai.recruitClock=(ai.recruitClock||0)+dt;
    const score=playerStrength(buildings,workers);ai.targetBuildings=Math.max(ai.targetBuildings||0,score.targetBuildings);ai.targetArmy=Math.max(ai.targetArmy||0,score.targetArmy);
    if(ai.growthClock>=90){ai.growthClock=0;const count=buildings.filter(b=>(b.owner||1)===2).length;if(count<ai.targetBuildings){const candidate=layout.find(([dx,dy])=>free(ai.center.x+dx,ai.center.y+dy));if(candidate)addBuilding(ai.center.x+candidate[0],ai.center.y+candidate[1],candidate[2]);recalculate();}}
    if(ai.recruitClock>=75){ai.recruitClock=0;const count=workers.filter(military).length;if(count<ai.targetArmy){const home=buildings.find(b=>(b.owner||1)===2&&b.type==='warehouse')||ai.center;addSoldier(count%3===2?'archer':'swordsman',home);}}
    if(ai.grace<=0&&workers.filter(military).length>=3)state.enemyRaids=true;
  }
  return {discover,restore,tick};
}

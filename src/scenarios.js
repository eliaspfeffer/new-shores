// Original challenge objectives for this homage, not reproductions of campaign maps.
export const scenarios={
  sandbox:{name:'Freies Siedeln',description:'Ohne Siegbedingung oder Zeitlimit.'},
  economy:{name:'Eine blühende Siedlung',description:'Baue die Brotversorgung und zwei Wohnhäuser auf. Lagere 8 Brot und 12 Bretter ein.'},
  conquest:{name:'Der rote Außenposten',description:'Erobere alle gegnerischen Türme und besiege die gegnerischen Soldaten.'}
};
export function createScenario(mode='sandbox'){return {mode:scenarios[mode]?mode:'sandbox',status:'active',acknowledged:false};}
export function objectives(state,buildings,workers,resources){
  const own=b=>(b.owner||1)===1&&!b.destroyed,finished=type=>buildings.filter(b=>own(b)&&b.type===type&&b.progress>=1).length;
  const total=key=>(resources[key]||0)+buildings.filter(own).reduce((n,b)=>n+(b.stored?.[key]||0),0);
  if(state.mode==='economy')return [
    ...['farm','mill','bakery','waterworks'].map(type=>({key:type,current:Math.min(1,finished(type)),target:1})),
    {key:'house',current:Math.min(2,finished('house')),target:2},
    {key:'bread',current:Math.min(8,total('bread')),target:8},
    {key:'planks',current:Math.min(12,total('planks')),target:12}
  ];
  if(state.mode==='conquest')return [
    {key:'enemyTowers',current:buildings.filter(b=>!own(b)&&!b.destroyed&&b.type==='tower').length,target:0},
    {key:'enemyTroops',current:workers.filter(w=>!w.dead&&(w.owner||1)!==1&&['swordsman','archer','medic'].includes(w.unit)).length,target:0}
  ];
  return [];
}
export function advanceScenario(state,buildings,workers,resources,elapsed){
  if(state.mode==='sandbox'||state.status!=='active')return false;
  const alive=workers.some(w=>!w.dead&&(w.owner||1)===1),goals=objectives(state,buildings,workers,resources);
  const lost=!alive||!buildings.some(b=>(b.owner||1)===1&&!b.destroyed&&b.type==='storehouse');
  if(lost||goals.length&&goals.every(g=>g.current===g.target)){state.status=lost?'defeat':'victory';state.finishedAt=elapsed;state.acknowledged=false;return true;}
  return false;
}

// Playable strategy layer. Balance values are prototype values, not original S4 constants.
import {updateEnemyTactics} from './enemy-tactics.js';
import {createArmyOrders,freeCarrier,towerCapacity} from './army-orders.js';
import {editedPatrol} from './patrol-edit.js';
import {productionInputs,feedMiner} from './nutrition.js';
import {checkoutTool,returnTool,nextTool,toolTypes} from './tools.js';
import {formationOrders,formationTypes} from './formations.js';
export const recipes = {
  sawmill:{inputs:{wood:1},output:'planks',amount:2,cycle:8},
  waterworks:{inputs:{},output:'water',amount:3,cycle:8},
  farm:{inputs:{},output:'grain',amount:2,cycle:35},
  mill:{inputs:{grain:1},output:'flour',amount:2,cycle:10},
  bakery:{inputs:{flour:1,water:1},output:'bread',amount:2,cycle:12},
  fisher:{inputs:{},output:'fish',amount:2,cycle:12,coastal:true},
  pigfarm:{inputs:{grain:1,water:1},output:'pigs',amount:1,cycle:20},
  butcher:{inputs:{pigs:1},output:'meat',amount:2,cycle:10},
  coalmine:{inputs:{bread:1},output:'coal',amount:1,cycle:12,deposit:'coal'},
  ironmine:{inputs:{meat:1},output:'ironOre',amount:1,cycle:14,deposit:'ironOre'},
  goldmine:{inputs:{fish:1},output:'goldOre',amount:1,cycle:16,deposit:'goldOre'},
  sulfurmine:{inputs:{meat:1},output:'sulfur',amount:1,cycle:16,deposit:'sulfur'},
  smelter:{inputs:{coal:1,ironOre:1},output:'iron',amount:1,cycle:12},
  goldsmelter:{inputs:{coal:1,goldOre:1},output:'gold',amount:1,cycle:14},
  toolsmith:{inputs:{coal:1,iron:1},output:'tools',amount:1,cycle:12},
  weaponsmith:{inputs:{coal:1,iron:1},output:'swords',amount:1,cycle:14},
  bowmaker:{inputs:{planks:2},output:'bows',amount:1,cycle:14},
};
export const extraBuildings = {
  waterworks:['Waterworks','water'],pigfarm:['Pig farm','pigs'],butcher:['Butcher','meat'],
  coalmine:['Coal mine','coal'],ironmine:['Iron mine','ironOre'],goldmine:['Gold mine','goldOre'],sulfurmine:['Sulfur mine','sulfur'],
  smelter:['Iron smelter','iron'],goldsmelter:['Gold smelter','gold'],toolsmith:['Toolsmith','tools'],
  weaponsmith:['Weaponsmith','swords'],bowmaker:['Bow maker','bows'],barracks:['Barracks',null],
};
export function facing8(dx,dy){return (Math.round(Math.atan2((dx+dy)*.5,dx-dy)/(Math.PI/4))+8)%8;}
export function createStrategy(api){
  const {workers,buildings,terrain,trees,rocks,routeTo,entrance,followRoute,toast}=api;
  const state={version:1,claims:[],deposits:[],projectiles:[],initialized:false};
  let owners=[],clock=0;
  const stock=()=>api.resources();
  const own=b=>(b.owner||1)===1;
  const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
  const isMilitary=w=>['swordsman','archer','medic'].includes(w.unit);
  const maxHealth=w=>w.maxHp||(isMilitary(w)?55+((w.rank||1)-1)*20:30);
  const healable=(w,o)=>o!==w&&alive(o)&&isMilitary(o)&&(o.owner||1)===(w.owner||1)&&o.garrisonIndex===undefined&&o.hp>0&&o.hp<maxHealth(o)*.75;
  function clearHealing(w){delete w.healTargetId;delete w.healRetry;w.healPulse=0;if(w.phase==='healTravel'){w.phase='guard';w.route=null;}}
  function heal(w,dt){
    w.healPulse=Math.max(0,(w.healPulse||0)-dt);
    if(w.combatStance==='march'){clearHealing(w);return false;}
    if(!['guard','healTravel'].includes(w.phase)||w.patrol)return false;
    if(w.phase==='healTravel'){
      const target=workers.find(o=>o.id===w.healTargetId);
      if(!target||!healable(w,target)||dist(w,target)>6){clearHealing(w);return false;}
      if(dist(w,target)<=1.5){w.phase='guard';w.route=null;}
      else if(followRoute(w,dt)){clearHealing(w);return true;}
      else return true;
    }
    const near=workers.filter(o=>healable(w,o)&&dist(w,o)<=1.5).sort((a,b)=>a.hp/maxHealth(a)-b.hp/maxHealth(b))[0];
    if(near){if(!w.cooldown){const amount=Math.min(2+(w.rank||1),maxHealth(near)*.75-near.hp);near.hp+=amount;w.cooldown=1.2;w.healPulse=1;w.healTargetId=near.id;w.direction=facing8(near.x-w.x,near.y-w.y);}return true;}
    // Idle medics seek nearby patients. Explicit movement orders and patrols take priority.
    if(w.phase!=='guard'||w.patrol)return false;
    w.healRetry=(w.healRetry||0)-dt;if(w.healRetry>0)return false;w.healRetry=2;
    for(const target of workers.filter(o=>healable(w,o)&&dist(w,o)<=5).sort((a,b)=>dist(w,a)-dist(w,b))){const route=routeTo(w,{x:target.x,y:target.y});if(!route)continue;Object.assign(w,{healTargetId:target.id,phase:'healTravel',route,routeIndex:0});return true;}
    delete w.healTargetId;return false;
  }
  function selectWounded(){for(const id of api.selected){const w=workers.find(o=>o.id===id);if(!w||!own(w)||!alive(w)||!isMilitary(w)||!(w.hp<maxHealth(w)))api.selected.delete(id);}api.hud();}
  const alive=w=>!w.dead;
  function init(){
    if(state.initialized)return;state.initialized=true;
    for(const k of ['water','bread','fish','pigs','meat','coal','ironOre','goldOre','sulfur','iron','gold','tools','swords','bows'])stock()[k]??=0;
    // Finite deposits near the initial settlement, discovered by geologists.
    state.deposits=[{x:18,y:22,type:'coal',amount:120},{x:31,y:26,type:'ironOre',amount:100},{x:30,y:18,type:'goldOre',amount:80},{x:18,y:31,type:'sulfur',amount:80}];
    const site={x:37,y:14};
    for(const list of [trees,rocks])for(let i=list.length-1;i>=0;i--)if(dist(list[i],site)<3)list.splice(i,1);
    buildings.push({...site,type:'tower',name:'Red outpost',owner:2,progress:1,completed:true,hp:100,garrison:1});
    workers.push({id:nextId(),x:38.5,y:14.5,unit:'swordsman',owner:2,hp:55,phase:'guard',t:0});
    recalculate();
  }
  function nextId(){return Math.max(-1,...workers.map(w=>w.id))+1;}
  function recalculate(){
    owners=terrain.map(row=>row.map(()=>0));const strengths=terrain.map(row=>row.map(()=>-Infinity));
    const sources=[...buildings.filter(b=>b.progress>=1&&!b.destroyed&&(b.type==='storehouse'||b.type==='tower'&&b.garrison>0)).map(b=>({...b,r:b.type==='storehouse'?12:9})),...state.claims.map(c=>({...c,r:c.single?0:2.5,owner:1}))];
    for(const b of sources)for(let y=Math.max(0,Math.floor(b.y-b.r));y<Math.min(terrain.length,b.y+b.r+1);y++)for(let x=Math.max(0,Math.floor(b.x-b.r));x<Math.min(terrain[y].length,b.x+b.r+1);x++){const power=b.r-dist(b,{x,y});if(power>=0&&power>strengths[y][x]){strengths[y][x]=power;owners[y][x]=b.owner||1;}}
  }
  function ownerAt(x,y){return owners[y]?.[x]||0;}
  function recruit(type,rank=1,barracks=null,options={}){
    if(!['pioneer','geologist','swordsman','archer','medic'].includes(type))return false;
    rank=Math.max(1,Math.min(3,Math.floor(Number(rank)||1)));
    const military=isMilitary({unit:type}),resource=military?(type==='archer'?'bows':'swords'):'tools';
    if(military&&barracks&&(!buildings.includes(barracks)||!own(barracks)||barracks.type!=='barracks'||barracks.progress<1||barracks.stopped))return toast('Diese Kaserne ist noch nicht einsatzbereit');
    if(military&&!buildings.some(b=>own(b)&&b.type==='barracks'&&b.progress>=1&&!b.stopped))return toast('Build an active barracks first');
    const eligible=workers.filter(freeCarrier);if(eligible.length<=(state.carrierReserve||0))return toast('Trägerreserve erreicht');
    const w=options.candidate&&eligible.includes(options.candidate)?options.candidate:eligible[0];
    if(!w)return toast('No idle carrier available');
    if(military&&(stock()[resource]||0)<1)return toast('Need 1 '+resource);
    const gold=military?rank-1:0;if((stock().gold||0)<gold)return toast('Benötigt '+gold+' Gold für Rang '+rank);
    const specialTool=military?null:checkoutTool(stock(),type);if(specialTool===false)return toast(type==='geologist'?'Benötigt einen Hammer':'Benötigt eine Schaufel');
    if(military)stock()[resource]--;if(gold)stock().gold-=gold;const maxHp=military?55+(rank-1)*20:30;Object.assign(w,{unit:type,specialTool,rank:military?rank:1,maxHp,owner:1,role:type,hp:maxHp,phase:'guard',task:null,route:null});
    clearAutonomy(w);if(!options.preserveSelection){api.selected.clear();api.selected.add(w.id);}api.hud();toast(type+' ready — select a destination');return w;
  }
  function command(g,append=false,targets=null,formation='compact'){
    if(!g||!Number.isInteger(g.x)||!Number.isInteger(g.y)||!terrain[g.y]?.[g.x])return false;
    const chosen=targets||workers.filter(w=>api.selected.has(w.id)&&own(w)&&alive(w));if(!chosen.length)return false;
    const b=buildings.find(b=>b.x===g.x&&b.y===g.y&&(own(b)||!api.isVisible||api.isVisible(b.x,b.y)));
    const spreading=!append&&!b&&formationTypes.includes(formation)&&formation!=='compact';
    const spread=spreading?formationOrders(g,chosen.filter(isMilitary),formation,terrain,routeTo):null;
    let issued=0;
    chosen.forEach((w,i)=>{
      if(!targets)delete w.patrol;
      if(append&&(w.manualTarget||!['idle','guard'].includes(w.phase))){w.waypoints??=[];if(w.waypoints.length<32){w.waypoints.push({x:g.x,y:g.y});issued++;}return;}
      if(spreading&&isMilitary(w)&&!spread.has(w.id))return;
      let target=spread?.get(w.id)?.point||(b?entrance(b):{x:g.x+.5+(i%3)*.15,y:g.y+.5+Math.floor(i/3)*.15});
      if(!target)return;let route=spread?.get(w.id)?.route||routeTo(w,target);if(!route&&['geologist','pioneer'].includes(w.unit)){target=entrance(g);route=target&&routeTo(w,target);}if(!route)return;
      if(!append&&!targets)w.waypoints=[];
      if(!w.unit){if(w.phase==='manual'){w.phase='idle';w.route=null;}w.manualTarget=target;issued++;return;}
      if(w.garrisonIndex!==undefined){const old=buildings[w.garrisonIndex];if(old)old.garrison=Math.max(0,(old.garrison||0)-1);delete w.garrisonIndex;}
      clearHealing(w);Object.assign(w,{route,routeIndex:0,phase:'command',order:{x:g.x,y:g.y,building:b?buildings.indexOf(b):-1},wait:0});
      if(['geologist','pioneer'].includes(w.unit)){w.autoWork=true;w.workArea={x:g.x,y:g.y,radius:10};w.workRetry=0;w.surveyVisited=[];w.workSite=null;w.surveyStatus='Unterwegs ins Arbeitsgebiet';}
      if(w.unit==='geologist'){w.surveyQueue=surveySites(g);w.surveyDone=0;}issued++;
    });recalculate();api.hud();toast(issued?`${issued} Einheiten beauftragt`:'Ziel ist nicht erreichbar');return true;
  }
  function stop(){for(const w of workers)if(api.selected.has(w.id)){clearHealing(w);delete w.patrol;w.waypoints=[];delete w.manualTarget;if(w.unit){w.route=null;w.order=null;w.surveyQueue=[];w.workSite=null;w.autoWork=false;w.surveyStatus='Angehalten';w.phase='guard';}else if(w.phase==='manual'){w.route=null;w.phase='idle';}}}
  function isRocky(x,y){return state.deposits.some(d=>dist(d,{x,y})<=2.7);}
  function surveySites(origin){const sites=[],radius=origin.radius||10;for(let y=Math.max(0,origin.y-radius);y<=Math.min(terrain.length-1,origin.y+radius);y++)for(let x=Math.max(0,origin.x-radius);x<=Math.min(terrain[y].length-1,origin.x+radius);x++)if(dist(origin,{x,y})<=radius&&terrain[y][x]==='grass'&&isRocky(x,y)&&(x+y)%2===0)sites.push({x,y});return sites.sort((a,b)=>dist(a,origin)-dist(b,origin));}
  function reserveSite(w,site){return !workers.some(o=>o!==w&&!o.dead&&o.autoWork&&o.unit===w.unit&&o.workSite?.x===site.x&&o.workSite?.y===site.y);}
  function nextSurvey(w){
    const visited=new Set(w.surveyVisited||[]);if(!w.surveyQueue?.length&&w.autoWork)w.surveyQueue=surveySites(w.workArea).filter(s=>!visited.has(s.x+','+s.y));
    while(w.surveyQueue?.length){const site=w.surveyQueue.shift();if(visited.has(site.x+','+site.y)||!reserveSite(w,site))continue;let p={x:site.x+.5,y:site.y+.5},route=routeTo(w,p);if(!route){p=entrance(site);route=p&&routeTo(w,p);}if(!route)continue;Object.assign(w,{workSite:site,route,routeIndex:0,phase:'command',wait:0,surveyStatus:'Autonom: nächste Bodenprobe'});return true;}
    w.phase='guard';w.route=null;w.workSite=null;w.workRetry=8;w.surveyStatus='Arbeitsgebiet untersucht oder blockiert · wartet';return false;
  }
  function neutralFrontier(g){return terrain[g.y]?.[g.x]==='grass'&&ownerAt(g.x,g.y)===0&&[[1,0],[-1,0],[0,1],[0,-1]].some(([dx,dy])=>ownerAt(g.x+dx,g.y+dy)===1);}
  function nextPioneer(w){
    const area=w.workArea;if(!area)return false;const sites=[];
    for(let y=Math.max(1,area.y-area.radius);y<Math.min(terrain.length-1,area.y+area.radius+1);y++)for(let x=Math.max(1,area.x-area.radius);x<Math.min(terrain[y].length-1,area.x+area.radius+1);x++){const s={x,y};if(dist(s,area)<=area.radius&&neutralFrontier(s)&&reserveSite(w,s))sites.push(s);}
    sites.sort((a,b)=>dist(a,w)+dist(a,area)*.3-dist(b,w)-dist(b,area)*.3);
    for(const site of sites){const target={x:site.x+.5,y:site.y+.5},route=routeTo(w,target);if(!route)continue;Object.assign(w,{workSite:site,route,routeIndex:0,phase:'command',order:{...site,building:-1},wait:0,surveyStatus:'Autonom: nächste Grenzfläche'});return true;}
    w.phase='guard';w.route=null;w.workSite=null;w.workRetry=8;w.surveyStatus='Keine erreichbare neutrale Grenzfläche im Arbeitsgebiet';return false;
  }
  function surveyNearest(){const w=workers.find(w=>api.selected.has(w.id)&&w.unit==='geologist'&&!w.dead);if(!w)return toast('Zuerst einen Geologen auswählen');const sites=state.deposits.filter(d=>!d.discovered&&(!api.isSeen||api.isSeen(d.x,d.y))).sort((a,b)=>dist(a,w)-dist(b,w));for(const d of sites){const p=entrance(d);if(p&&routeTo(w,p))return command(d);}toast('Kein erreichbares, unerforschtes Felsgebiet bekannt. Karte erkunden oder Ziel selbst zuweisen.');return false;}
  function depositFor(b){return state.deposits.find(d=>d.discovered&&d.type===recipes[b.type]?.deposit&&d.amount>0&&dist(b,d)<=2);}
  function placement(g,type){if(ownerAt(g.x,g.y)!==1)return 'Build inside your territory; use a pioneer to expand';if(recipes[type]?.deposit&&!depositFor({...g,type}))return 'Geologist must discover the matching deposit nearby';return '';}
  function tickWorker(w,dt){
    if(w.dead||w.garrisonIndex!==undefined)return true;
    if(api.tacticalAI)updateEnemyTactics(w,dt,{enabled:state.tacticalAI!==false,workers,terrain,routeTo,isMilitary});
    if(w.patrol&&w.phase==='guard'){
      const target=w.patrol.points[w.patrol.next],route=routeTo(w,{x:target.x+.5,y:target.y+.5});
      if(route){w.route=route;w.routeIndex=0;w.phase='patrol';w.patrol.next=(w.patrol.next+1)%w.patrol.points.length;}
      else {delete w.patrol;toast('Patrouille beendet: Laufweg blockiert');}
    }
    if(w.waypoints?.length&&!w.manualTarget&&['idle','guard'].includes(w.phase)&&!w.carry)command(w.waypoints.shift(),false,[w]);
    if(!w.unit&&w.manualTarget&&w.phase==='idle'){const route=routeTo(w,w.manualTarget);delete w.manualTarget;if(route){w.route=route;w.routeIndex=0;w.phase='manual';}else toast('Queued destination is now blocked');}
    if(w.phase==='manual'){w.t=(w.t||0)+dt;if(followRoute(w,dt)){w.route=null;w.phase='idle';}return true;}
    if(w.unit){
      w.t=(w.t||0)+dt;w.cooldown=Math.max(0,(w.cooldown||0)-dt);
      if(w.autoWork&&w.workArea&&w.phase==='guard'){w.workRetry=(w.workRetry||0)-dt;if(w.workRetry<=0){if(w.unit==='pioneer')nextPioneer(w);if(w.unit==='geologist')nextSurvey(w);}}
      if(w.unit==='medic'&&heal(w,dt))return true;
      const enemy=isMilitary(w)&&w.combatStance!=='march'&&!['retreat','withdraw'].includes(w.tactics?.mode)?workers.find(o=>alive(o)&&isMilitary(o)&&(o.owner||1)!==(w.owner||1)&&o.garrisonIndex===undefined&&dist(w,o)<(w.unit==='archer'?4:1.4)):null;
      if(enemy){if(!w.cooldown){api.onEvent?.(w.unit==='archer'?'bow':'hit',w);const damage=(w.unit==='archer'?7:w.unit==='medic'?4:10)*(1+((w.rank||1)-1)*.4);if(w.unit==='archer')state.projectiles.push({x:w.x,y:w.y,fromX:w.x,fromY:w.y,targetId:enemy.id,owner:w.owner||1,damage,age:0});else damageUnit(enemy,damage);w.cooldown=1.2;w.direction=facing8(enemy.x-w.x,enemy.y-w.y);}return true;}
      if(w.phase==='patrol'){if(followRoute(w,dt)){w.phase='guard';w.route=null;}return true;}
      if(w.phase==='enemyMove'){if(followRoute(w,dt)){w.phase='guard';w.route=null;}return true;}
      if(w.phase==='command'&&followRoute(w,dt)){w.phase='action';w.wait=0;}
      if(w.phase==='action'){
        w.wait+=dt;const b=buildings[w.order?.building];
        if(isMilitary(w)&&b?.type==='hospital'&&own(b)){
          if(w.hp>=maxHealth(w)){w.phase='guard';w.order=null;toast('Soldat vollständig genesen');}return true;
        }else if(w.unit==='swordsman'&&b?.type==='tower'){
          if(!own(b)){if(w.combatStance==='march'){w.phase='guard';w.order=null;return true;}if(w.wait>=1.2){b.hp=(b.hp??100)-12;w.wait=0;if(b.hp<=0){b.owner=1;b.hp=100;b.garrison=0;api.onEvent?.('capture',b);toast('Outpost captured');recalculate();}}}
          else {if((b.garrison||0)>=towerCapacity){w.phase='guard';w.order=null;toast('Turm voll: maximal '+towerCapacity+' Soldaten');return true;}b.garrison=(b.garrison||0)+1;w.garrisonIndex=buildings.indexOf(b);w.phase='garrison';recalculate();}
        }else if(w.unit==='geologist'){
          w.surveyStatus='Untersucht Boden · '+Math.min(100,Math.floor(w.wait/4*100))+' %';
          if(w.wait>=4){const names={coal:'Kohle',ironOre:'Eisenerz',goldOre:'Golderz',sulfur:'Schwefel'};let found=false;for(const d of state.deposits)if(!d.discovered&&dist(w,d)<2.2){d.discovered=true;found=true;toast('Geologe: '+names[d.type]+' gefunden – '+d.amount+' Vorrat. Passende Mine in der Nähe bauen.');api.onEvent?.('discovery',d);}w.surveyDone=(w.surveyDone||0)+1;const site=w.workSite||w.order;if(site){w.surveyVisited??=[];const key=site.x+','+site.y;if(!w.surveyVisited.includes(key))w.surveyVisited.push(key);}if(found){w.surveyStatus='Vorkommen gefunden';}nextSurvey(w);}
        }
        else if(w.unit==='pioneer'){w.surveyStatus='Versetzt Grenze · '+Math.min(100,Math.floor(w.wait/4*100))+' %';if(w.wait>=4){const g=w.order;if(g&&neutralFrontier(g)){state.claims.push({x:g.x,y:g.y,single:true});w.claimsMade=(w.claimsMade||0)+1;recalculate();}w.phase='guard';if(w.autoWork)nextPioneer(w);}}
        else if(!['geologist','pioneer'].includes(w.unit)&&w.wait>1)w.phase='guard';
      }return true;
    }
    // Input logistics are actual journeys, with goods reserved only after a route exists.
    if(w.phase==='supply'){
      w.t=(w.t||0)+dt;
      if(followRoute(w,dt)){const b=buildings[w.supplyIndex];if(b&&own(b)){b.buffer??={};b.buffer[w.carry]=(b.buffer[w.carry]||0)+1;}else stock()[w.carry]=(stock()[w.carry]||0)+1;w.carry=null;w.phase='idle';w.supplyIndex=null;w.route=null;}return true;
    }
    if(w.phase==='idle'&&!w.carry){
      w.supplyRetry=(w.supplyRetry||0)-dt;if(w.supplyRetry>0)return false;w.supplyRetry=2;
      const home=entrance(buildings[0]);
      const indices=buildings.map((_,i)=>i).sort((a,b)=>(buildings[b].priority?1:0)-(buildings[a].priority?1:0));
      const rank=k=>{const n=api.priority?.().indexOf(k)??-1;return n<0?999:n;};
      for(const i of indices){const b=buildings[i],construction=b.progress<1,r=construction&&b.materials?{inputs:b.materials}:recipes[b.type];if(!r||construction&&!b.materials||b.stopped||!construction&&b.productionRemaining===0||!own(b))continue;
        const available={...stock()};for(const p of buildings)if(own(p)){if(p.ready&&!p.outputInTransit)available[p.ready]=(available[p.ready]||0)+1;if(!p.stopped&&p.progress>=1)for(const [k,n] of Object.entries(p.stored||{}))available[k]=(available[k]||0)+n;}
        for(const [item,amount] of Object.entries(productionInputs(b,r,available)).sort(([a],[b])=>rank(a)-rank(b))){
          const pending=workers.filter(o=>o.phase==='supply'&&o.supplyIndex===i&&o.carry===item).length;
          const source=construction?b.reserved:stock();
          if((b.buffer?.[item]||0)+pending>=amount*(construction?1:2))continue;
          const dest=entrance(b);if(!dest)continue;
          const candidates=[];if(home&&source?.[item]>0)candidates.push({point:home,source});
          if(!construction)for(const depot of buildings)if(depot.type==='warehouse'&&own(depot)&&depot.progress>=1&&!depot.stopped&&depot.stored?.[item]>0){const p=entrance(depot);if(p)candidates.push({point:p,source:depot.stored});}
          if(!construction&&api.directSupply)for(const producer of buildings)if(producer!==b&&own(producer)&&producer.progress>=1&&!producer.outputInTransit&&producer.ready===item&&!workers.some(o=>o.task===producer)){const p=entrance(producer);if(p)candidates.push({point:p,producer});}
          const routes=candidates.map(c=>({...c,pickup:routeTo(w,c.point),delivery:routeTo(c.point,dest)})).filter(c=>c.pickup&&c.delivery).sort((a,b)=>(a.pickup.length+a.delivery.length)-(b.pickup.length+b.delivery.length));
          const chosen=routes[0];if(!chosen)continue;const {pickup,delivery}=chosen;
          // Reserve stock now; cargo is not rendered until reaching storage.
          if(chosen.producer){const p=chosen.producer;p.outputAmount=(p.outputAmount||2)-1;if(p.outputAmount===0)p.ready=null;}else chosen.source[item]--;
          Object.assign(w,{phase:'supply',role:'carrier',carry:item,supplyIndex:i,pickupEnd:pickup.length,route:[...pickup,...delivery],routeIndex:0});api.hud();return true;
        }
      }
    }return false;
  }
  function produce(b,dt){
    if(api.outdoor?.handles(b))return true;
    const r=recipes[b.type];if(!r)return false;
    if(api.hasStaff&&!api.hasStaff(b))return true;
    if(!own(b)||b.stopped||b.productionRemaining===0||b.progress<1||b.ready||r.coastal&&!api.hasWater(b))return true;
    const d=r.deposit?depositFor(b):null;if(r.deposit&&!d)return true;
    if(r.deposit){if(!feedMiner(b))return true;}else if(Object.entries(r.inputs).some(([k,n])=>(b.buffer?.[k]||0)<n))return true;
    if(b.type==='toolsmith'&&!b.activeTool)b.activeTool=toolTypes.includes(b.toolChoice)?b.toolChoice:nextTool(stock());
    b.work=(b.work||0)+dt;if(b.work<r.cycle)return true;b.work=0;
    if(r.deposit)b.miningEnergy--;else for(const [k,n] of Object.entries(r.inputs))b.buffer[k]-=n;
    if(b.productionRemaining>0)b.productionRemaining--;if(d)d.amount--;b.ready=b.type==='toolsmith'?b.activeTool:r.output;delete b.activeTool;b.outputAmount=d?1:r.amount;return true;
  }
  function damageUnit(target,damage){if(target.dead)return;target.hp-=damage;if(target.hp<=0){target.hp=0;target.dead=true;api.onEvent?.('death',target);api.selected.delete(target.id);if(own(target))stock().people=Math.max(0,(stock().people||0)-1);}}
  const armyOrders=createArmyOrders({buildings,workers,state,stock,entrance,routeTo,recruit,terrain,visible:api.isSeen});
  function tick(dt){
    armyOrders.tick(dt);
    for(const [index,b] of buildings.entries())if(b.type==='hospital'){
      b.healingActive=false;if(!own(b)||b.progress<1||b.stopped||!api.hasStaff?.(b))continue;
      const eligible=w=>alive(w)&&own(w)&&isMilitary(w)&&w.phase==='action'&&w.order?.building===index&&w.hp>0&&w.hp<maxHealth(w)&&dist(w,entrance(b)||b)<1.6;
      const w=workers.find(w=>w.id===b.patientId&&eligible(w))||workers.find(eligible);
      if(w){b.patientId=w.id;w.hp=Math.min(maxHealth(w),w.hp+dt*2);b.healingActive=true;}else delete b.patientId;
    }
    state.projectiles??=[];
    for(let i=state.projectiles.length-1;i>=0;i--){const p=state.projectiles[i],target=workers.find(w=>w.id===p.targetId&&!w.dead&&w.garrisonIndex===undefined);p.age+=dt;if(!target||p.age>5){state.projectiles.splice(i,1);continue;}const dx=target.x-p.x,dy=target.y-p.y,d=Math.hypot(dx,dy),step=dt*7;if(d<=step){api.onEvent?.('hit',target);damageUnit(target,p.damage);state.projectiles.splice(i,1);}else{p.x+=dx/d*step;p.y+=dy/d*step;}}
    clock+=dt;if(clock<1)return;clock=0;recalculate();api.hud();
  }
  function restore(s){state.tacticalAI=s?.tacticalAI!==false;state.carrierReserve=s?.carrierReserve??0;if(s)Object.assign(state,s);else {state.initialized=false;init();}for(const w of workers)if(['geologist','pioneer'].includes(w.unit)&&w.autoWork===undefined&&w.order){w.autoWork=true;w.workArea={x:w.order.x,y:w.order.y,radius:10};w.surveyVisited??=[];w.workRetry=0;}recalculate();}
  function release(b){if(!b||!own(b))return toast('Select your occupied tower first');const index=buildings.indexOf(b),p=entrance(b);if(!p)return toast('Tower entrance blocked');for(const w of workers)if(w.garrisonIndex===index){delete w.garrisonIndex;Object.assign(w,{x:p.x,y:p.y,phase:'guard',order:null});}b.garrison=0;recalculate();}
  function releaseOne(b,id){
    if(!buildings.includes(b)||b.type!=='tower'||!own(b))return false;
    const index=buildings.indexOf(b),w=workers.find(w=>w.id===id&&!w.dead&&own(w)&&w.garrisonIndex===index),p=entrance(b);
    if(!w||!p)return false;
    delete w.garrisonIndex;Object.assign(w,{x:p.x,y:p.y,phase:'guard',order:null,route:null});delete w.patrol;w.waypoints=[];
    b.garrison=Math.max(0,(b.garrison||0)-1);recalculate();api.hud();return true;
  }
  function readyToBuild(b){return !b.materials||b.materialsSpent||Object.entries(b.materials).every(([k,n])=>(b.buffer?.[k]||0)>=n);}
  function sendWounded(b){
    if(!buildings.includes(b)||b.type!=='hospital'||!own(b)||b.progress<1||b.stopped)return false;
    const p=entrance(b),targets=workers.filter(w=>alive(w)&&own(w)&&isMilitary(w)&&w.garrisonIndex===undefined&&w.hp>0&&w.hp<maxHealth(w)&&dist(w,b)<=12&&p&&routeTo(w,p));
    if(!targets.length){toast('Keine erreichbaren Verwundeten im Umkreis von 12 Feldern');return false;}
    for(const w of targets){delete w.patrol;w.waypoints=[];}
    return command(b,false,targets);
  }
  function clearAutonomy(w){w.autoWork=false;w.waypoints=[];delete w.workArea;delete w.workSite;delete w.surveyQueue;delete w.surveyVisited;delete w.surveyStatus;w.workRetry=0;}
  function returnSpecialists(){let n=0;for(const w of workers)if(api.selected.has(w.id)&&own(w)&&alive(w)&&['pioneer','geologist'].includes(w.unit)){clearAutonomy(w);delete w.unit;delete w.order;delete w.rank;w.role='carrier';w.phase='idle';w.route=null;returnTool(stock(),w.specialTool||'tools');delete w.specialTool;n++;}api.hud();toast(n+' Spezialisten sind wieder Träger');return n;}
  function patrol(g,append=false){
    if(!g||!Number.isInteger(g.x)||!Number.isInteger(g.y)||!terrain[g.y]?.[g.x])return false;
    let count=0;
    for(const w of workers)if(api.selected.has(w.id)&&own(w)&&alive(w)&&isMilitary(w)&&w.garrisonIndex===undefined){
      const start={x:Math.floor(w.x),y:Math.floor(w.y)},target={x:g.x,y:g.y};
      if(append){
        const p=w.patrol;if(!p||p.points.length>=8||p.points.some(o=>o.x===g.x&&o.y===g.y))continue;
        const last=p.points.at(-1),first=p.points[0],center=o=>({x:o.x+.5,y:o.y+.5});
        if(!routeTo(center(last),center(target))||!routeTo(center(target),center(first)))continue;
        // If the old final point is next/underway, visit the appended point before returning.
        if(p.next===0)p.next=p.points.length;
        p.points.push(target);count++;continue;
      }
      if(start.x===target.x&&start.y===target.y||!routeTo(w,{x:g.x+.5,y:g.y+.5}))continue;
      clearHealing(w);w.patrol={points:[start,target],next:1};w.waypoints=[];delete w.manualTarget;w.order=null;w.route=null;w.phase='guard';count++;
    }
    toast(count?count+(append?' Patrouillen um einen Punkt erweitert':' Soldaten auf Patrouille'):append?'Bestehende Patrouille wählen: maximal 8 unterschiedliche, erreichbare Punkte':'Erreichbares Ziel und freie Soldaten auswählen');api.hud();return count>0;
  }
  function setCombatStance(stance){if(!['defend','march'].includes(stance))return false;let n=0;for(const w of workers)if(api.selected.has(w.id)&&own(w)&&alive(w)&&isMilitary(w)){w.combatStance=stance;n++;}toast(n+' Soldaten: '+(stance==='march'?'nur marschieren, kein Gegenangriff':'Gegner in Reichweite bekämpfen'));api.hud();return n>0;}
  function editPatrol(id,action,index){const w=workers.find(w=>w.id===id&&api.selected.has(id)&&own(w)&&alive(w)&&isMilitary(w)&&w.garrisonIndex===undefined);const changed=w&&editedPatrol(w,action,index,routeTo);if(!changed){toast('Route unverändert: mindestens 2 Punkte und vollständig erreichbarer Rundweg nötig');return false;}clearHealing(w);w.patrol=changed;w.route=null;w.routeIndex=0;w.order=null;w.phase='guard';api.hud();toast('Patrouille geändert');return true;}
  return {armyOrders,releaseOne,towerCapacity,state,init,restore,tick,tickWorker,produce,recruit,command,patrol,editPatrol,stop,release,ownerAt,placement,recalculate,isMilitary,readyToBuild,returnSpecialists,depositFor,isRocky,surveyNearest,setCombatStance,selectWounded,sendWounded};
}

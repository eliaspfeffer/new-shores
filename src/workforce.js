// Permanent workshop staff are real settlers; two civilians remain available for logistics.
import {productionInputs} from './nutrition.js';
import {checkoutTool,returnTool,checkoutWorkshopTool} from './tools.js';
export function createWorkforce(api){
  const {workers,buildings,recipes,entrance,routeTo,followRoute}=api;
  let recruitmentClock=0;
  const valid=b=>b&&(b.owner||1)===1&&b.progress>=1&&!b.stopped;
  function release(w,refundTool=true){const cargo=w.phase.startsWith('field')?w.workCarry:null,b=buildings[w.employerIndex];if(b?.workerId===w.id)delete b.workerId;if(b){b.outputInTransit=false;const p=entrance(b);if(p&&w.inside){w.x=p.x;w.y=p.y;}}delete w.inside;delete w.workCarry;delete w.outdoorJob;delete w.outdoorTime;delete w.employerIndex;delete w.profession;w.task=null;w.route=null;w.phase=cargo?'recoverCargo':'idle';if(cargo){w.carry=cargo;w.role='carrier';}if(w.workTool){if(refundTool)returnTool(api.resources(),w.workTool);delete w.workTool;}}
  function hasStaff(b){const i=buildings.indexOf(b);return workers.some(w=>!w.dead&&w.employerIndex===i&&(w.phase==='staffWork'||w.phase.startsWith('field')));}
  function update(dt){
    api.outdoor?.grow(dt);
    for(const w of workers){if(w.employerIndex===undefined)continue;const b=buildings[w.employerIndex];
      if(w.dead){if(b?.workerId===w.id)delete b.workerId;if(b)b.outputInTransit=false;delete w.employerIndex;continue;}
      if(w.waypoints?.length&&['fieldWait','staffWait'].includes(w.phase)){release(w);continue;}
      if(!b||(b.owner||1)!==1||b.progress<1||w.manualTarget){release(w);continue;}
      // Pausing a workshop does not turn its specialist back into a carrier.
      if(b.stopped)continue;
      w.t=(w.t||0)+dt;
      if(w.phase==='staffTravel'&&followRoute(w,dt)){w.phase=api.moveInside?'staffWait':'staffWork';w.route=null;}
      else if(!['staffWork','staffTravel','staffWait','staffEnter','staffExit'].includes(w.phase)&&!w.phase.startsWith('field')){release(w);continue;}
      if(b.type==='hospital'){if(w.phase==='staffWait')w.phase='staffWork';continue;}
      if(api.outdoor?.update(w,b,dt))continue;
      if(!api.moveInside)continue;
      const recipe=recipes[b.type],inputs=productionInputs(b,recipe),available=!b.ready&&(!api.canWork||api.canWork(b))&&Object.entries(inputs).every(([k,n])=>(b.buffer?.[k]||0)>=n);
      const door=entrance(b),desk={x:b.x+.55,y:b.y+.65};
      if(w.phase==='staffWait'&&available){w.phase='staffEnter';w.workCarry=Object.keys(inputs).find(k=>b.buffer?.[k]>0)||null;}
      if(w.phase==='staffEnter'&&api.moveInside(w,desk,dt)){w.phase='staffWork';w.inside=true;w.workCarry=null;}
      if(w.phase==='staffWork'&&(!available||b.ready)){w.phase='staffExit';w.inside=false;w.workCarry=b.ready||null;if(b.ready)b.outputInTransit=true;}
      if(w.phase==='staffExit'&&door&&api.moveInside(w,door,dt)){w.phase='staffWait';w.workCarry=null;w.inside=false;b.outputInTransit=false;}
    }
    recruitmentClock+=dt;if(recruitmentClock<2)return;recruitmentClock=0;
    for(let i=0;i<buildings.length;i++){const b=buildings[i];if(!valid(b)||(!recipes[b.type]&&!['forester','hospital','woodcutter','quarry'].includes(b.type))||workers.some(w=>!w.dead&&(w.employerIndex===i||w.task===b)))continue;
      if(workers.filter(w=>!w.dead&&(w.owner||1)===1&&!w.unit&&w.employerIndex===undefined).length<=2)break;
      const w=workers.find(w=>!w.dead&&(w.owner||1)===1&&!w.unit&&w.employerIndex===undefined&&w.phase==='idle'&&!w.carry&&!w.manualTarget);if(!w)break;
      const p=entrance(b),route=p&&routeTo(w,p);if(!route)continue;
      const tool=api.miningState?checkoutWorkshopTool(api.resources(),b.type,api.miningState):checkoutTool(api.resources(),b.type);if(tool===false)continue;
      Object.assign(w,{employerIndex:i,profession:b.type,workTool:tool,phase:'staffTravel',role:b.type,task:null,route,routeIndex:0});b.workerId=w.id;
    }
  }
  function beforeDemolish(index){for(const w of workers){if(w.employerIndex===index)release(w,false);else if(w.employerIndex>index)w.employerIndex--;}}
  function status(b){const w=workers.find(w=>!w.dead&&w.employerIndex===buildings.indexOf(b));return !w?'Kein Facharbeiter / Werkzeug':w.phase==='fieldTravel'?'Unterwegs zum Arbeitsort':w.phase==='fieldReturn'?'Kehrt zum Betrieb zurück':w.phase==='fieldWork'?({chop:'Fällt einen Baum',quarry:'Baut Stein ab',sow:'Sät aus',harvest:'Erntet Getreide',plant:'Pflanzt einen Baum',fish:'Angelt am Ufer'}[w.outdoorJob?.kind]||'Arbeitet draußen'):w.phase==='fieldWait'?'Wartet auf Ernte, freien Arbeitsort oder Abholung':w.phase==='staffTravel'?'Facharbeiter unterwegs':w.phase==='staffEnter'?'Bringt Vorräte an den Arbeitsplatz':w.phase==='staffExit'?'Bringt Waren zum Ausgang':w.phase==='staffWait'?'Facharbeiter wartet am Eingang':'Facharbeiter arbeitet';}
  return {update,hasStaff,beforeDemolish,release,status(b){const w=workers.find(w=>!w.dead&&w.employerIndex===buildings.indexOf(b));if(b.stopped&&w)return 'Betrieb angehalten; Facharbeiter bleibt zugeordnet';if(w?.phase==='fieldWait'&&api.outdoor?.status)return api.outdoor.status(w,b);return status(b);}};
}

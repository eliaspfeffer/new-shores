// Permanent workshop staff are real settlers; two civilians remain available for logistics.
export function createWorkforce(api){
  const {workers,buildings,recipes,entrance,routeTo,followRoute}=api;
  let recruitmentClock=0;
  const valid=b=>b&&(b.owner||1)===1&&b.progress>=1&&!b.stopped;
  function release(w,returnTool=true){const b=buildings[w.employerIndex];if(b?.workerId===w.id)delete b.workerId;delete w.employerIndex;delete w.profession;w.task=null;w.route=null;w.phase='idle';if(w.workTool){if(returnTool)api.resources().tools=(api.resources().tools||0)+1;delete w.workTool;}}
  function hasStaff(b){const i=buildings.indexOf(b);return workers.some(w=>!w.dead&&w.employerIndex===i&&w.phase==='staffWork');}
  function update(dt){
    for(const w of workers){if(w.employerIndex===undefined)continue;const b=buildings[w.employerIndex];
      if(w.dead){if(b?.workerId===w.id)delete b.workerId;delete w.employerIndex;continue;}
      if(!valid(b)||w.manualTarget){release(w);continue;}
      w.t=(w.t||0)+dt;
      if(w.phase==='staffTravel'&&followRoute(w,dt)){w.phase='staffWork';w.route=null;}
      else if(!['staffWork','staffTravel'].includes(w.phase))release(w);
    }
    recruitmentClock+=dt;if(recruitmentClock<2)return;recruitmentClock=0;
    for(let i=0;i<buildings.length;i++){const b=buildings[i];if(!valid(b)||(!recipes[b.type]&&b.type!=='forester')||workers.some(w=>!w.dead&&w.employerIndex===i))continue;
      if(workers.filter(w=>!w.dead&&!w.unit&&w.employerIndex===undefined).length<=2)break;
      const w=workers.find(w=>!w.dead&&!w.unit&&w.employerIndex===undefined&&w.phase==='idle'&&!w.carry&&!w.manualTarget);if(!w)break;
      if(!(api.resources().tools>0))break;const p=entrance(b),route=p&&routeTo(w,p);if(!route)continue;
      api.resources().tools--;Object.assign(w,{employerIndex:i,profession:b.type,workTool:true,phase:'staffTravel',role:b.type,task:null,route,routeIndex:0});b.workerId=w.id;
    }
  }
  function beforeDemolish(index){for(const w of workers){if(w.employerIndex===index)release(w,false);else if(w.employerIndex>index)w.employerIndex--;}}
  return {update,hasStaff,beforeDemolish,release};
}

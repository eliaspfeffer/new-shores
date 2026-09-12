import {storageSources} from './storage.js';
import './route-controls.css';

export function initRouteControls({workers,selected,buildings,getBuilding,strategy,save,toast}){
  const patrol=document.createElement('section');patrol.id='patrol-editor';document.querySelector('#patrol-status').after(patrol);
  const sources=document.createElement('section');sources.id='storage-sources-editor';document.querySelector('.storage-source-label').after(sources);
  const single=document.querySelector('#storage-source');single.parentElement.firstChild.textContent='Einzelquelle (ersetzt die Liste)';
  single.addEventListener('change',()=>{const b=getBuilding();if(b?.type==='warehouse'){b.storageSources=[Number(single.value)];}},true);
  let chosen=null,patrolKey='',sourceKey='';
  function refresh(){
    const units=workers.filter(w=>selected.has(w.id)&&!w.dead&&(w.owner||1)===1&&w.patrol);
    if(!units.some(w=>w.id===chosen))chosen=units[0]?.id;
    const key=JSON.stringify([chosen,units.map(w=>[w.id,w.patrol.points])]);
    if(key!==patrolKey){patrolKey=key;const w=units.find(w=>w.id===chosen);patrol.innerHTML=w?'<h3>Rundroute bearbeiten</h3><label>Soldat <select id="patrol-editor-unit">'+units.map(w=>'<option value="'+w.id+'"'+(w.id===chosen?' selected':'')+'>'+w.id+'</option>').join('')+'</select></label><p>Änderungen gelten nur für diesen Soldaten. Mindestens zwei Punkte bleiben erhalten.</p><ol>'+w.patrol.points.map((p,i)=>'<li><span>'+(i+1)+'. '+p.x+', '+p.y+'</span><button data-patrol-op="up" data-index="'+i+'" aria-label="Punkt '+(i+1)+' nach oben" '+(i===0?'disabled':'')+'>↑</button><button data-patrol-op="down" data-index="'+i+'" aria-label="Punkt '+(i+1)+' nach unten" '+(i===w.patrol.points.length-1?'disabled':'')+'>↓</button><button data-patrol-op="remove" data-index="'+i+'" aria-label="Punkt '+(i+1)+' entfernen" '+(w.patrol.points.length===2?'disabled':'')+'>×</button></li>').join('')+'</ol><button data-patrol-op="reverse">Rundroute umkehren</button><p>Gestrichelte Kartenlinien verbinden die Befehlspunkte, nicht den genauen Laufweg.</p>':'<p>Patrouillierende Soldaten auswählen, um ihre Rundroute zu bearbeiten.</p>';}
    const b=getBuilding();if(!b||b.type!=='warehouse')return;
    const list=storageSources(b),candidates=buildings.map((d,i)=>({d,i})).filter(({d,i})=>d!==b&&(i===0||d.type==='warehouse'&&(d.owner||1)===1));
    const label=i=>i===0?'Hauptlager':'Lager '+buildings[i]?.x+', '+buildings[i]?.y;
    const sk=JSON.stringify([buildings.indexOf(b),list,b.progress<1,candidates.map(({d,i})=>[i,d.x,d.y,d.stopped,d.progress>=1])]);
    if(sk!==sourceKey){sourceKey=sk;const disabled=b.progress<1?' disabled':'';sources.innerHTML='<h3>Quellen nach Priorität</h3><p>Von oben nach unten: leere, angehaltene oder unerreichbare Quellen werden übersprungen. Eigene Zielvorräte bleiben geschützt. Bereits zugesagte Lieferungen laufen weiter.</p><ol>'+list.map((id,i)=>'<li><span>'+(i+1)+'. '+label(id)+'</span><button data-source-op="up" data-index="'+i+'" aria-label="Quelle '+(i+1)+' bevorzugen"'+(i===0?' disabled':disabled)+'>↑</button><button data-source-op="down" data-index="'+i+'" aria-label="Quelle '+(i+1)+' zurückstufen"'+(i===list.length-1?' disabled':disabled)+'>↓</button><button data-source-op="remove" data-index="'+i+'" aria-label="Quelle '+(i+1)+' entfernen"'+disabled+'>×</button></li>').join('')+'</ol>'+(!list.length?'<p>Keine Quelle: Auffüllen pausiert, bis du eine hinzufügst.</p>':'')+'<label>Weitere Quelle<select id="storage-source-candidate"'+disabled+'>'+candidates.filter(({i})=>!list.includes(i)).map(({i})=>'<option value="'+i+'">'+label(i)+'</option>').join('')+'</select></label><button data-source-op="add"'+(list.length>=8||!candidates.some(({i})=>!list.includes(i))?' disabled':disabled)+'>Quelle hinzufügen</button>';}
  }
  patrol.addEventListener('change',e=>{if(e.target.id==='patrol-editor-unit'){chosen=Number(e.target.value);refresh();}});
  patrol.addEventListener('click',e=>{const button=e.target.closest('[data-patrol-op]');if(button&&!button.disabled&&strategy.editPatrol(chosen,button.dataset.patrolOp,Number(button.dataset.index))){save();refresh();}});
  sources.addEventListener('click',e=>{const button=e.target.closest('[data-source-op]'),b=getBuilding();if(!button||button.disabled||!b||b.type!=='warehouse'||b.progress<1)return;const list=[...storageSources(b)],i=Number(button.dataset.index),action=button.dataset.sourceOp;
    if(action==='add'){const candidate=document.querySelector('#storage-source-candidate');if(!candidate||candidate.value==='')return;const id=Number(candidate.value),donor=buildings[id];if(!donor||donor===b||list.includes(id)||list.length>=8||id!==0&&(donor.type!=='warehouse'||(donor.owner||1)!==1))return;list.push(id);}
    else{if(!Number.isInteger(i)||i<0||i>=list.length)return;if(action==='remove')list.splice(i,1);else{const j=i+(action==='up'?-1:1);if(j<0||j>=list.length)return;[list[i],list[j]]=[list[j],list[i]];}}
    b.storageSources=list;b.storageSource=list[0]??0;toast(save()?'Lagerquellen gespeichert':'Lagerquellen geändert, aber nicht gespeichert');refresh();
  });
  return {refresh};
}

export function drawPatrolRoutes(ctx,workers,selected,iso){
  const routes=new Set();ctx.save();
  for(const w of workers){if(!selected.has(w.id)||w.dead||(w.owner||1)!==1||!w.patrol)continue;const key=JSON.stringify(w.patrol.points);if(routes.has(key))continue;if(routes.size>=16)break;routes.add(key);
    const points=w.patrol.points.map(p=>iso(p.x+.5,p.y+.5));ctx.strokeStyle='#f2d881';ctx.lineWidth=2;ctx.setLineDash([6,5]);ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.closePath();ctx.stroke();ctx.setLineDash([]);
    for(const [i,p] of points.entries()){ctx.fillStyle='#293421';ctx.beginPath();ctx.arc(p.x,p.y,10,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.fillStyle='#fff0b4';ctx.font='bold 12px system-ui';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(String(i+1),p.x,p.y);}
  }
  ctx.restore();return routes.size;
}

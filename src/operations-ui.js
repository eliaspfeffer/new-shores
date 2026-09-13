import './operations-ui.css';
import {supportsProductionOrder,setProductionOrder} from './production-orders.js';
import {freeCarrier} from './army-orders.js';
export function initOperationsUI(api){
  const {strategy,workers,buildings,names}=api;let previous=null,lastList='';
  const defense=document.createElement('button');defense.id='enemy-tactics-toggle';defense.className='text-button';
  const syncDefense=()=>{defense.textContent='Gegnerische Verteidigungs-KI: '+(strategy.state.tacticalAI!==false?'an':'aus');defense.setAttribute('aria-pressed',String(strategy.state.tacticalAI!==false));};
  defense.onclick=()=>{strategy.state.tacticalAI=strategy.state.tacticalAI===false;syncDefense();api.save();};
  document.querySelector('#power-button').after(defense);syncDefense();
  const panel=document.createElement('section');panel.id='operations-building';panel.innerHTML='<section id="training-orders"><h3>Ausbildungswarteschlange</h3><p>8 Sekunden je Soldat. Waffen und Gold erst bei Abschluss; anschließend Weg über die Kaserne zum Sammelpunkt.</p><label>Einheit<select id="queue-type"><option value="swordsman">Schwertkämpfer</option><option value="archer">Bogenschütze</option><option value="medic">Sanitäter</option></select></label><label>Rang<select id="queue-rank"><option>1</option><option>2</option><option>3</option></select></label><label>Anzahl<input id="queue-count" type="number" min="1" max="20" value="1"></label><button id="enqueue-training">Ausbildung einreihen</button><p id="training-status"></p><div id="training-list"></div><h3>Sammelpunkt</h3><label>X<input id="rally-x" type="number" min="0" max="49"></label><label>Y<input id="rally-y" type="number" min="0" max="49"></label><button id="set-rally">Sammelpunkt setzen</button><button id="clear-rally">Am Kaserneneingang sammeln</button><p id="rally-status"></p></section><section id="tower-roster"><h3>Turmbesatzung</h3><p id="tower-count"></p><div id="tower-soldiers"></div></section><section id="production-order"><h3>Produktionsauftrag</h3><p>Weitere vollständige Produktionszyklen. Ein schon begonnener Zyklus zählt mit. 0 pausiert; vorhandene Waren werden weiter abgeholt.</p><label>Zyklen<input id="production-cycles" type="number" min="0" max="999" value="10"></label><button id="set-production-order">Auftrag setzen</button><button id="clear-production-order">Unbegrenzt produzieren</button><p id="production-order-status"></p></section><p id="operations-feedback" role="status"></p>';
  document.querySelector('#building-actions').after(panel);
  const q=s=>panel.querySelector(s),act=fn=>{const okay=fn();q('#operations-feedback').textContent=okay?(api.save()?'Auftrag gespeichert':'Geändert, aber Speichern fehlgeschlagen'):'Nicht möglich: Auswahl, Menge oder Erreichbarkeit prüfen';refresh();};
  const fire=document.createElement('button');fire.id='tower-fire';q('#tower-roster').append(fire);fire.onclick=()=>act(()=>{const b=api.building();if(b?.type!=='tower'||(b.owner||1)!==1)return false;b.holdFire=!b.holdFire;return true;});
  q('#enqueue-training').onclick=()=>act(()=>strategy.armyOrders.enqueue(api.building(),q('#queue-type').value,Number(q('#queue-rank').value),Number(q('#queue-count').value)));
  q('#set-rally').onclick=()=>act(()=>q('#rally-x').value!==''&&q('#rally-y').value!==''&&strategy.armyOrders.rally(api.building(),{x:Number(q('#rally-x').value),y:Number(q('#rally-y').value)}));
  q('#clear-rally').onclick=()=>act(()=>strategy.armyOrders.rally(api.building(),null));
  q('#set-production-order').onclick=()=>act(()=>q('#production-cycles').value!==''&&setProductionOrder(api.building(),Number(q('#production-cycles').value)));
  q('#clear-production-order').onclick=()=>act(()=>setProductionOrder(api.building(),null));
  const reserve=document.createElement('label');reserve.className='carrier-reserve';reserve.innerHTML='Freie Träger bei Ausbildung behalten <input id="carrier-reserve" type="number" min="0" max="50" value="0"><small>Gilt für sofortige Ausbildung und Warteschlangen; beschäftigt keine zusätzlichen Träger.</small>';document.querySelector('#return-specialists').after(reserve);
  const reserveInput=reserve.querySelector('input');reserveInput.onchange=()=>{if(reserveInput.value===''||!strategy.armyOrders.reserve(Number(reserveInput.value)))api.notify('Trägerreserve: ganze Zahl von 0 bis 50');else api.save();reserveInput.value=strategy.state.carrierReserve||0;};
  const dialog=document.createElement('dialog');dialog.id='operations-dialog';dialog.innerHTML='<header><h2>Siedlungsübersicht</h2><button id="close-operations">Schließen ×</button></header><label>Ansicht<select id="operations-view"><option value="army">Armee</option><option value="idle">Untätige Arbeiter & Spezialisten</option><option value="journal">Meldungsjournal</option></select></label><div id="operations-list"></div>';document.body.append(dialog);
  dialog.addEventListener('keydown',e=>e.stopPropagation());dialog.querySelector('#close-operations').onclick=()=>dialog.close();
  dialog.querySelector('#operations-view').onchange=()=>{lastList='';refreshOverview();};
  function open(view){dialog.querySelector('#operations-view').value=view;lastList='';refreshOverview();dialog.showModal();}
  for(const [id,label,view] of [['open-army','Armeeübersicht','army'],['find-idle','Untätige Siedler finden','idle'],['open-journal','Meldungsjournal','journal']]){
    const button=document.createElement('button');button.id=id;button.textContent=label;button.onclick=()=>open(view);reserve.after(button);
  }
  const journalButton=document.createElement('button');journalButton.className='text-button';journalButton.id='pause-journal';journalButton.textContent='Meldungsjournal';journalButton.onclick=()=>open('journal');document.querySelector('#save-button').after(journalButton);
  function refreshOverview(){
    const view=dialog.querySelector('#operations-view').value,list=dialog.querySelector('#operations-list');
    const entries=view==='journal'?api.journal.list().slice().reverse():workers.filter(w=>!w.dead&&(w.owner||1)===1&&(view==='army'?strategy.isMilitary(w):freeCarrier(w)||['geologist','pioneer'].includes(w.unit)&&w.phase==='guard'&&!w.autoWork));
    const signature=JSON.stringify([view,entries.map(w=>view==='journal'?w:[w.id,w.unit,w.hp,w.phase,w.garrisonIndex])]);if(signature===lastList)return;lastList=signature;list.replaceChildren();
    if(!entries.length){const p=document.createElement('p');p.textContent=view==='journal'?'Noch keine Meldungen.':'Keine passenden Einheiten.';list.append(p);}
    for(const w of entries){const row=document.createElement('div');row.className='operations-row';
      if(view==='journal'){row.textContent=Math.floor(w.time/60)+':'+String(Math.floor(w.time%60)).padStart(2,'0')+' · '+w.text+(w.count>1?' ×'+w.count:'');}
      else{const button=document.createElement('button');button.dataset.focusUnit=w.id;button.textContent=(names[w.unit]||'Träger')+' #'+w.id+' · '+(w.garrisonIndex!==undefined?'im Turm':w.phase)+(strategy.isMilitary(w)?' · '+Math.ceil(w.hp)+' LP':'');button.onclick=()=>{dialog.close();api.focus(w);};row.append(button);}
      list.append(row);
    }
  }
  function refresh(){
    syncDefense();
    const b=api.building();panel.hidden=!b||(b.owner||1)!==1;
    if(document.activeElement!==reserveInput)reserveInput.value=strategy.state.carrierReserve||0;
    if(b){
      q('#training-orders').hidden=b.type!=='barracks';q('#tower-roster').hidden=b.type!=='tower';q('#production-order').hidden=!supportsProductionOrder(b.type);
      if(previous!==b){previous=b;q('#rally-x').value=b.rallyPoint?.x??b.x;q('#rally-y').value=b.rallyPoint?.y??b.y;q('#production-cycles').value=b.productionRemaining??10;q('#operations-feedback').textContent='';}
      q('#training-status').textContent=b.recruitQueue?.length?(b.stopped?'Kaserne angehalten':b.recruitStatus||'Wartet auf Ausbildung'):'Keine Aufträge';
      const list=q('#training-list'),signature=JSON.stringify(b.recruitQueue||[]);
      if(list.dataset.signature!==signature){list.dataset.signature=signature;list.replaceChildren();for(const [i,order] of (b.recruitQueue||[]).entries()){const row=document.createElement('div');row.textContent=order.count+' × '+names[order.type]+' · Rang '+order.rank+' ';const cancel=document.createElement('button');cancel.textContent='Abbrechen';cancel.onclick=()=>act(()=>strategy.armyOrders.cancel(api.building(),i));row.append(cancel);list.append(row);}}
      q('#rally-status').textContent=b.rallyPoint?'Ziel: '+b.rallyPoint.x+', '+b.rallyPoint.y:'Kein Sammelpunkt – Kaserneneingang';
      q('#production-order-status').textContent=b.productionRemaining===undefined?'Unbegrenzt':b.productionRemaining===0?'Auftrag fertig / pausiert':b.productionRemaining+' Zyklen verbleiben';
      const occupants=workers.filter(w=>!w.dead&&w.garrisonIndex===buildings.indexOf(b)),tower=q('#tower-soldiers'),ids=occupants.map(w=>w.id).join(',');
      q('#tower-count').textContent=(b.garrison||0)+' / '+strategy.towerCapacity+' Plätze';
      fire.textContent=b.holdFire?'Turmfeuer freigeben':'Turmfeuer einstellen';fire.setAttribute('aria-pressed',String(Boolean(b.holdFire)));
      if(tower.dataset.ids!==ids){tower.dataset.ids=ids;tower.replaceChildren();for(const w of occupants){const button=document.createElement('button');button.textContent=(names[w.unit]||'Soldat')+' #'+w.id+' entlassen';button.dataset.releaseUnit=w.id;button.onclick=()=>act(()=>strategy.releaseOne(api.building(),w.id));tower.append(button);}}
    }
    if(dialog.open)refreshOverview();
  }
  refresh();return {refresh};
}

import './unit-menu.css';
export function matchingUnits(workers,query,names){
  const search=query.trim().toLocaleLowerCase('de');return workers.filter(w=>!w.dead&&(w.owner||1)===1&&(!search||[(names[w.unit]||names[w.role]||'Siedler'),w.id,w.profession||''].join(' ').toLocaleLowerCase('de').includes(search)));
}
export function initUnitMenu(api){
  const panel=document.querySelector('#units-section .units-panel');if(!panel)return null;
  const tabs=document.createElement('nav');tabs.className='unit-subtabs';tabs.setAttribute('aria-label','Siedlerbereiche');
  const sections=new Map();for(const [key,icon,label] of [['train','♟','Ausbilden'],['find','⌕','Finden'],['orders','➜','Befehle'],['army','⚔','Militär']]){
    const button=document.createElement('button');button.dataset.unitTab=key;button.innerHTML='<span aria-hidden="true">'+icon+'</span><small>'+label+'</small>';button.setAttribute('aria-pressed',String(key==='train'));tabs.append(button);
    const section=document.createElement('section');section.dataset.unitSection=key;section.hidden=key!=='train';sections.set(key,section);button.onclick=()=>{for(const [id,s] of sections)s.hidden=id!==key;tabs.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));refresh();};
  }
  const help=document.createElement('details');help.className='unit-help';help.innerHTML='<summary>Bedienung & Tastenkürzel</summary>';
  for(const p of [...panel.querySelectorAll(':scope > p')]){if(p.id==='unit-status')continue;if(p.id==='patrol-status')sections.get('army').append(p);else help.append(p);}
  panel.append(...sections.values());
  const move=(selector,key,label,icon)=>{const element=document.querySelector(selector);if(!element)return;if(label){element.title=element.title||element.textContent;element.innerHTML='<span class="unit-command-symbol" aria-hidden="true">'+icon+'</span><small>'+label+'</small>';element.classList.add('unit-command');}sections.get(key).append(element);};
  move('.unit-buttons','train');
  for(const [selector,key,label,icon] of [['#move-units','orders','Ziel','➜'],['#halt-units','orders','Anhalten','■'],['#return-specialists','orders','Zum Träger','♟'],['#survey-nearest','orders','Bodenschätze','⌖'],['#patrol-units','army','Patrouille','⟳'],['#extend-patrol','army','Wegpunkt','＋'],['#find-geologist','find','Geologen','⌕'],['#find-idle','find','Untätige','⌕'],['#open-army','army','Armee','⚔'],['#open-journal','orders','Meldungen','≡']])move(selector,key,label,icon);
  move('#military-orders','army');move('#patrol-editor','army');
  const reserve=document.querySelector('#carrier-reserve')?.closest('label');if(reserve)sections.get('train').append(reserve);
  const hint=document.createElement('p');hint.textContent='Ein freier Träger + Werkzeug. Soldaten bildest du direkt in einer Kaserne aus.';help.prepend(hint);
  const ordersHint=document.createElement('p');ordersHint.textContent='Spezialisten einmal ins Arbeitsgebiet schicken. Pionier und Geologe arbeiten dort selbständig weiter.';help.append(ordersHint);
  const label=document.createElement('label');label.className='unit-search-label';label.textContent='Siedler suchen';const input=document.createElement('input');input.id='unit-search';input.type='search';input.placeholder='Pionier, Geologe, Beruf oder Nummer';input.autocomplete='off';label.append(input);
  const results=document.createElement('div');results.id='unit-search-results';results.setAttribute('aria-live','polite');sections.get('find').prepend(label,results);input.oninput=()=>refresh(true);
  panel.prepend(tabs);panel.append(...sections.values(),help);let signature='';
  function refresh(force=false){
    const selected=api.workers.filter(w=>api.selected.has(w.id)&&!w.dead&&(w.owner||1)===1),special=selected.some(w=>['pioneer','geologist'].includes(w.unit)),military=selected.some(api.military);
    for(const id of ['move-units','halt-units'])document.getElementById(id).disabled=!selected.length;
    document.querySelector('#return-specialists').disabled=!special;document.querySelector('#survey-nearest').disabled=!selected.some(w=>w.unit==='geologist');document.querySelector('#patrol-units').disabled=!military;
    if(sections.get('find').hidden&&!force)return;
    const matches=matchingUnits(api.workers,input.value,api.names),key=JSON.stringify(matches.map(w=>[w.id,w.unit,w.role,w.phase,api.selected.has(w.id)]));if(key===signature&&!force)return;signature=key;results.replaceChildren();
    if(!matches.length){results.textContent='Keine passenden eigenen Siedler. Spezialisten kannst du unter Ausbilden anlegen.';return;}
    for(const w of matches){const button=document.createElement('button');button.className='unit-result';button.dataset.findUnit=w.id;button.setAttribute('aria-label',(api.names[w.unit]||api.names[w.role]||'Siedler')+' '+w.id+' auswählen und auf Karte zeigen');const sprite=document.createElement('span');sprite.className='unit-preview';sprite.style.cssText=api.art(w.unit||w.role);sprite.setAttribute('aria-hidden','true');const text=document.createElement('span');text.textContent=(api.names[w.unit]||api.names[w.role]||'Siedler')+' #'+w.id;button.append(sprite,text);button.onclick=()=>api.focus(w);results.append(button);}
  }
  refresh();return {refresh};
}

import './mobile-thumb.css';
import {commandArt} from './command-art.js';

// Mobile presentation only. All mutations go through the live simulation API.
export function initThumbUI(mobile,api){
  mobile.thumb=true;
  const $=s=>document.querySelector(s),game=$('#game-screen');
  const el=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e;};
  const paths={'⌂':'M2 11 12 2 22 11H19V22H14V15H10V22H5V11Z','♟':'M12 2a4 4 0 1 0 0 8 4 4 0 0 0 0-8M8 11H16L21 22H3Z','⚒':'M3 3H12V8H9L6 22H2L6 8H3ZM17 3H22V5H20V22H18V5H17Z','⚔':'M4 1 13 12 11 14 2 4ZM3 13 11 21 13 19 5 11ZM20 1 11 12 13 14 22 4ZM21 13 13 21 11 19 19 11Z','anvil':'M2 7H22L18 12H14V17L19 20V22H5V20L10 17V12H6Z','✉':'M2 5H22V19H2ZM3 6 12 13 21 6V8L12 15 3 8Z'};
  const iconHTML=value=>commandArt(value)||(paths[value]?'<svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor" fill-rule="evenodd" aria-hidden="true"><path d="'+paths[value]+'"/></svg>':value);
  const button=(label,icon,fn,cls='thumb-button')=>{const b=el('button',cls);b.setAttribute('aria-label',label);b.title=label;b.innerHTML='<span class="thumb-icon" aria-hidden="true">'+iconHTML(icon)+'</span>';b.append(el('small','',label));b.onclick=fn;return b;};
  const art=(type,unit=false)=>'<span class="thumb-art" style=\''+(unit?api.unitArt(type):api.buildArt(type))+'\'></span>';
  let page='map',category='basic',sheetRender=null,sheetKey='',lastContext='',lastRefresh=0;
  const root=el('nav','thumb-ui');root.setAttribute('aria-label','Mobile Spielbefehle');game.append(root);
  const left=button('Bauen','⌂',()=>navigate('build'),'thumb-button thumb-left');left.id='thumb-left';
  const right=button('Siedler','♟',()=>navigate('units'),'thumb-button thumb-right');right.id='thumb-right';
  const actions=el('div','thumb-actions'),caption=el('div','thumb-caption','Siedlung');root.append(left,right,actions,caption);
  const sheet=el('dialog','thumb-sheet');sheet.id='thumb-sheet';sheet.setAttribute('aria-labelledby','thumb-sheet-title');
  const title=el('h2','', '');title.id='thumb-sheet-title';const body=el('div','thumb-sheet-body'),footer=el('footer','thumb-sheet-footer');sheet.append(title,body,footer);game.append(sheet);
  const hideSidebar=()=>document.documentElement.classList.remove('mobile-panel');
  function closeSheet(){sheetRender=null;if(sheet.open)sheet.close();}
  function openSheet(name,draw){closeSheet();title.textContent=name;body.replaceChildren();footer.replaceChildren(button('Zurück','✓',closeSheet));draw(body,footer);sheet.showModal();}
  sheet.addEventListener('cancel',()=>{sheetRender=null;});sheet.addEventListener('keydown',e=>e.stopPropagation());
  sheet.addEventListener('click',e=>{if(e.target!==sheet)return;const r=sheet.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeSheet();});
  function clear(){mobile.pendingSite=null;mobile.placing=false;api.clear();hideSidebar();mobile.select=false;page='map';closeSheet();lastContext='';refresh(true);}
  function navigate(next){closeSheet();hideSidebar();api.clear();mobile.pendingSite=null;mobile.placing=false;page=next;lastContext='';refresh(true);}
  function advanced(panel){closeSheet();$('#resume-button').click();page='advanced';api.panel(panel);document.documentElement.classList.add('mobile-panel');lastContext='';}
  function setCorner(b,label,icon,fn){b.setAttribute('aria-label',label);b.title=label;b.querySelector('.thumb-icon').innerHTML=iconHTML(icon);b.querySelector('small').textContent=label;b.onclick=fn;b.disabled=false;}
  const invoke=id=>{const source=document.getElementById(id);if(source&&!source.disabled){source.click();hideSidebar();lastContext='';}};
  const categories=[['basic','⚒','Grundgebäude'],['food',api.good('meat'),'Nahrung'],['metal','anvil','Bergbau & Metall'],['military','⚔','Militärgebäude'],['town','⌂','Wohnhäuser & Lager']];
  function categoryMenu(key){category=key;page='catalog';document.querySelector('[data-category="'+key+'"]').click();hideSidebar();lastContext='';refresh(true);}
  function buildInfo(type){const source=$('.building-card[data-tool="'+type+'"]');openSheet(api.buildName(type),(content,foot)=>{
    const summary=el('div','thumb-build-summary');summary.innerHTML=art(type)+'<div>'+source.querySelector('.building-cost').innerHTML+'</div>';content.append(summary,el('p','thumb-description',source.querySelector('.building-purpose').textContent));
    foot.prepend(button('Bauen','⚒',()=>{closeSheet();api.clear();source.click();hideSidebar();mobile.placing=true;mobile.pendingSite=null;page='placement';lastContext='';refresh(true);}));
  });}
  function paged(name,items,drawItem,index=0){openSheet(name+' · '+(index+1)+' / '+Math.max(1,Math.ceil(items.length/8)),(content,foot)=>{
    const grid=el('div','thumb-grid');for(const item of items.slice(index*8,index*8+8))grid.append(drawItem(item));content.append(grid);
    if(index)foot.prepend(button('Vorherige Seite','◀',()=>paged(name,items,drawItem,index-1)));
    if((index+1)*8<items.length)foot.append(button('Nächste Seite','▶',()=>paged(name,items,drawItem,index+1)));
    if(!items.length)content.append(el('p','','Noch keine passenden Siedler vorhanden.'));
  });}
  function goods(){paged('Warenmenü',api.goods(),key=>{const cell=el('div','thumb-good');cell.innerHTML=api.good(key)+'<b data-thumb-stock="'+key+'">'+Math.floor(api.stock()[key]||0)+'</b>';cell.append(el('span','',api.goodName(key)));return cell;});}
  function findUnits(filter=()=>true,name='Siedler finden'){const workers=api.workers().filter(filter);paged(name,workers,w=>button(api.unitName(w)+' #'+w.id,art(w.unit||w.role,true),()=>{closeSheet();api.select([w]);page='map';lastContext='';refresh(true);},'thumb-choice'));}
  function requestCount(name,icon,have,need,apply,max=20,initial=0){let count=initial;openSheet(name,(content,foot)=>{
    const summary=el('div','thumb-request-summary');summary.innerHTML=icon;summary.append(el('p','','Vorhanden: '+have));const amount=el('strong','','Auftrag: '+count);summary.append(amount);
    const controls=el('div','thumb-quantity');for(const n of [1,5,-1,-5])controls.append(button((n>0?'+':'')+n,String(n>0?'+'+n:n),()=>{count=Math.max(0,Math.min(max,count+n));amount.textContent='Auftrag: '+count;}));
    controls.append(button('Zurücksetzen','0',()=>{count=0;amount.textContent='Auftrag: 0';}));
    content.append(summary,controls,el('p','thumb-description',need));foot.prepend(button('Auftrag bestätigen','✓',()=>{const result=apply(count);if(result!==false)closeSheet();}));
  });}
  function specialists(){const types=['geologist','pioneer'];openSheet('Spezialisten anwerben',(content)=>{
    const grid=el('div','thumb-grid');for(const type of types)grid.append(button(api.unitName({unit:type}),art(type,true),()=>requestCount('Spezialisten anwerben',art(type,true),api.workers().filter(w=>w.unit===type).length,'Benötigt freie Träger und '+(type==='pioneer'?'Schaufeln':'Hämmer')+'. Verfügbare Ausbildungen werden sofort ausgeführt.',n=>api.recruit(type,1,n)),'thumb-choice'));
    content.append(grid,el('p','thumb-description','Gärtner und Diebe sind noch nicht implementiert.'));
  });}
  function basicJobs(){openSheet('Grundberufe',(content,foot)=>{
    const grid=el('div','thumb-grid');for(const role of ['carrier','builder'])grid.append(button(role==='carrier'?'Träger':'Bauarbeiter',art(role,true),()=>findUnits(w=>!w.unit&&(w.role===role||role==='carrier'&&!w.profession),'Grundberufe: '+(role==='carrier'?'Träger':'Bauarbeiter')),'thumb-choice'));
    content.append(grid,el('p','thumb-description','Träger und Bauarbeiter werden derzeit automatisch nach Aufträgen eingeteilt. Ein eigener Planiererberuf fehlt noch.'));
    foot.append(button('Trägerreserve','♟',()=>requestCount('Trägerreserve',art('carrier',true),api.reserve(),'So viele freie Träger nicht zu Soldaten/Spezialisten ausbilden.',n=>api.setReserve(n),50)));
  });}
  function military(b){openSheet('Krieger rekrutieren',(content)=>{const grid=el('div','thumb-grid thumb-military');for(const type of ['swordsman','archer','medic'])for(const rank of [1,2,3])grid.append(button(api.unitName({unit:type})+' '+rank,art(type,true),()=>requestCount('Krieger rekrutieren',art(type,true),api.workers().filter(w=>w.unit===type&&w.rank===rank).length,'Rang '+rank+' · 1 freie Person, 1 '+(type==='archer'?'Bogen':'Schwert')+' und '+(rank-1)+' Gold pro Auftrag. Ausbildung in dieser Kaserne.',n=>api.enqueue(b,type,rank,n)),'thumb-choice'));content.append(grid);});}
  function tools(b){paged('Werkzeuge anfordern',api.tools(),type=>button(api.goodName(type),api.good(type),()=>requestCount('Werkzeuge anfordern',api.good(type),api.stock()[type]||0,'Offene Menge für diese Schmiede. Benötigt Eisen und Kohle. Ein bereits begonnenes Werkzeug wird fertiggestellt.',n=>api.orderTool(b,type,n),999,b.toolOrders?.[type]||0),'thumb-choice'));footer.append(button('Automatik','∞',()=>{api.autoTools(b);closeSheet();}));}
  function buildingDetails(b){openSheet(api.buildName(b.type),(content,foot)=>{
    const summary=el('div','thumb-build-summary');summary.innerHTML=art(b.type);content.append(summary);
    const status=el('p','thumb-description');content.append(status);sheetRender=()=>{status.textContent=api.buildStatus(b);};sheetRender();
    if(b.type!=='storehouse')foot.append(button('Gebäudemenü','⌂',()=>{closeSheet();invoke('building-settings');}));
  });}
  const mail=button('Nachrichten','✉',()=>{const entries=[{text:api.quest()},...api.messages().slice().reverse()];let i=0;const show=()=>openSheet('Nachrichten · '+(i+1)+' / '+entries.length,(content,foot)=>{content.append(el('p','thumb-message',entries[i].text));if(i)foot.prepend(button('Neuere Nachricht','◀',()=>{i--;show();}));if(i+1<entries.length)foot.append(button('Ältere Nachricht','▶',()=>{i++;show();}));});show();},'thumb-button thumb-mail');game.append(mail);
  const dropdown=button('Alle Waren anzeigen','▼',goods,'thumb-dropdown');dropdown.id='thumb-goods';$('#mobile-resources .resource-bar').insertBefore(dropdown,$('#speed-button'));
  const help=button('Bedienung','?',()=>{closeSheet();invoke('help-button');});
  $('#resume-button').parentElement.append(help);
  for(const [panel,label] of [['economy','Betriebsübersicht'],['units','Weitere Siedlerbefehle'],['goods','Warenverteilung']]){const b=el('button','text-button',label);b.onclick=()=>advanced(panel);help.before(b);}
  const selection=el('div','thumb-selection');selection.hidden=true;$('#mobile-resources .resource-bar').append(selection);
  const mapClose=button('Minikarte schließen','×',()=>document.documentElement.classList.remove('mobile-map-open'),'thumb-button thumb-map-close');$('.sidebar-map').append(mapClose);
  if(!mobile.enabled)game.append(button('Karte','⌕',()=>document.documentElement.classList.toggle('mobile-map-open'),'thumb-button thumb-map-toggle'));
  mobile.stagePlacement=g=>{mobile.pendingSite={...g};page='placement';lastContext='';refresh(true);};
  mobile.cancelPlacement=clear;
  function refresh(force=false){
    const now=performance.now();if(!force&&now-lastRefresh<120)return;lastRefresh=now;
    const state=api.state(),selected=api.workers().filter(w=>state.selected.has(w.id)),b=state.building;
    const selectionKey=selected.map(w=>(w.unit||w.role)+':'+(w.rank||1)).sort().join(',');
    if(selectionKey!==sheetKey){sheetKey=selectionKey;selection.replaceChildren();const counts=new Map();for(const w of selected){const key=(w.unit||w.role||'carrier')+':'+(w.rank||1);const row=counts.get(key)||{w,count:0};row.count++;counts.set(key,row);}for(const {w,count} of counts.values()){const cell=el('span','thumb-selected-type');cell.innerHTML=art(w.unit||w.role||'carrier',true)+'<b>'+count+'</b>';cell.title=api.unitName(w)+' · Rang '+(w.rank||1);selection.append(cell);}}
    selection.hidden=!selected.length;$('#mobile-resources').classList.toggle('has-selection',Boolean(selected.length));
    for(const e of sheet.querySelectorAll('[data-thumb-stock]'))e.textContent=Math.floor(api.stock()[e.dataset.thumbStock]||0);
    if(sheet.open)sheetRender?.();
    // Selection changes caused by map taps return to context commands, never a desktop sidebar.
    if(b||selected.length){if(['build','units','catalog'].includes(page))page='map';if(page!=='advanced')hideSidebar();}
    if(mobile.placing&&state.tool==='inspect'){mobile.placing=false;mobile.pendingSite=null;page='map';}
    const mode=mobile.placing?'placement':page==='map'?(selected.length?'selected':b?'building':'map'):page;
    const pendingReason=mode==='placement'?(mobile.pendingSite?api.placementReason(mobile.pendingSite):'Bauplatz auf der Karte antippen'):'';
    const key=JSON.stringify([mode,category,b?.type,b?.x,b?.y,b?.stopped,b?.priority,b?.progress>=1,b?.garrison,b?.type==='tower'?api.towerSpace(b):null,selected.map(w=>w.unit),mobile.select,mobile.pendingSite,pendingReason]);if(!force&&key===lastContext)return;lastContext=key;
    root.dataset.mode=mode;actions.replaceChildren();left.hidden=false;right.hidden=false;
    setCorner(left,'Bauen','⌂',()=>navigate('build'));setCorner(right,'Siedler','♟',()=>navigate('units'));caption.textContent='Siedlung';
    const add=(label,icon,fn,disabled=false)=>{const control=button(label,icon,fn);control.disabled=disabled;actions.append(control);return control;};
    if(mode==='map')add('Siedlungsübersicht','⌂',()=>invoke('open-army'));
    if(mode==='build'){caption.textContent='Baumenü';setCorner(left,'Abbrechen','×',clear);for(const [key,icon,label] of categories)add(label,icon,()=>categoryMenu(key));}
    if(mode==='catalog'){caption.textContent=categories.find(c=>c[0]===category)[2];actions.classList.add('catalog');setCorner(left,'Zurück','×',()=>navigate('build'));for(const source of document.querySelectorAll('.building-card:not([hidden])')){const type=source.dataset.tool;add(api.buildName(type),art(type),()=>buildInfo(type));}}
    else actions.classList.remove('catalog');
    if(mode==='units'){caption.textContent='Siedler';setCorner(right,'Abbrechen','×',clear);add('Alle Militäreinheiten','⚔',()=>{api.select(api.workers().filter(w=>api.military(w)&&w.garrisonIndex===undefined),false);page='map';lastContext='';});add('Siedler finden','⌕',()=>findUnits());add('Grundberufe',api.good('hammer'),basicJobs);add('Spezialisten anwerben','♟+',specialists);}
    if(mode==='selected'){caption.textContent=selected.length+' Siedler ausgewählt';setCorner(left,'Auswahl aufheben','✋',clear);setCorner(right,'Siedlermenü','♟',()=>{api.clear();page='units';lastContext='';});add('Markieren','⌗',()=>{mobile.select=!mobile.select;lastContext='';});add('Ziel zuweisen','➜',()=>invoke('move-units'));add('Halt','■',()=>invoke('halt-units'));if(selected.some(w=>['pioneer','geologist'].includes(w.unit)))add('Zum Träger','➜♟',()=>{api.returnSpecialists();lastContext='';});}
    if(mode==='building'){
      caption.textContent=api.buildName(b.type)+' · '+api.buildStatus(b);setCorner(left,'Auswahl aufheben','✋',clear);right.hidden=true;
      if(b.type==='tower')return;
      if(b.type!=='storehouse'){
        add('Abriss','✹',()=>invoke('demolish-building'));
        const productive=!['house','largehouse'].includes(b.type);
        if(productive)add(b.stopped?'Fortsetzen':'Anhalten',b.stopped?'▶':'Ⅱ',()=>invoke('production-toggle'));
        if(b.type==='barracks')add('Krieger rekrutieren','⚔',()=>military(b));
        else if(b.type==='toolsmith')add('Werkzeuge herstellen',api.good('hammer'),()=>tools(b));
        else if(['woodcutter','quarry','forester'].includes(b.type))add('Arbeitsbereich','◎',()=>invoke('area-toggle'));
        else if(productive)add(b.priority?'Priorität: hoch':'Priorität: normal','↑',()=>invoke('priority-toggle')).setAttribute('aria-pressed',String(Boolean(b.priority)));
      }
    }
    if(mode==='placement'){caption.textContent=pendingReason||api.buildName(state.tool)+' · Bauplatz bestätigen';setCorner(left,'Bau bestätigen','✓',()=>{if(mobile.pendingSite)api.place(mobile.pendingSite);lastContext='';refresh(true);});left.disabled=Boolean(pendingReason);setCorner(right,'Bau abbrechen','×',clear);}
  }
  const oldRefresh=mobile.refresh;mobile.refresh=()=>{oldRefresh?.();refresh();};
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!sheet.open){clear();}});
  refresh(true);
}

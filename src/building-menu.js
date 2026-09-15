import './building-settings.css';
import './building-menu.css';
import {commandArt} from './command-art.js';
import {supportsProductionOrder,setProductionOrder} from './production-orders.js';

// One live building and its existing handlers; no duplicate simulation state.
export function initBuildingSettings({getBuilding,name,api}){
  const q=s=>document.querySelector(s),panel=q('#info-panel');
  const launcher=document.createElement('button');launcher.id='open-building-settings';launcher.textContent='Gebäudemenü öffnen';panel.before(launcher);
  const dialog=document.createElement('dialog');dialog.id='building-settings-dialog';dialog.className='building-menu';
  dialog.innerHTML='<header><h2 id="building-settings-title"></h2><button class="building-menu-close" aria-label="Gebäudemenü schließen">'+commandArt('×')+'</button></header><div id="building-settings-content"></div><footer><button class="building-menu-back" aria-label="Zurück">'+commandArt('✓')+'</button><p role="status"></p></footer>';
  dialog.setAttribute('aria-labelledby','building-settings-title');q('#game-screen').append(dialog);
  const body=dialog.querySelector('#building-settings-content'),title=dialog.querySelector('h2'),feedback=dialog.querySelector('[role=status]');
  let current=null,screen='home',signature='',moved=[];
  const art=(type,unit=false)=>'<span class="building-menu-art" style=\''+(unit?api.unitArt(type):api.buildArt(type))+'\'></span>';
  function restore(){for(const [node,parent,next] of moved)parent.insertBefore(node,next?.parentNode===parent?next:null);moved=[];}
  function close(){restore();dialog.close();}
  function begin(label){restore();body.replaceChildren();title.textContent=label;feedback.textContent='';}
  function button(label,icon,action,disabled=false){const b=document.createElement('button');b.className='building-menu-choice';b.innerHTML=commandArt(icon)||icon;const text=document.createElement('span');text.textContent=label;b.append(text);b.disabled=disabled;b.onclick=action;return b;}
  function invoke(id){const source=q('#'+id);if(source&&!source.disabled)source.click();}
  function quantity(label,icon,initial,max,apply,description){screen='quantity';begin(label);let count=initial;const summary=document.createElement('div');summary.className='building-menu-summary';summary.innerHTML=icon;const number=document.createElement('strong');const update=()=>number.textContent='Im Auftrag: '+count;update();summary.append(number);body.append(summary);const grid=document.createElement('div');grid.className='building-menu-grid quantity';for(const n of [1,5,-1,-5])grid.append(button((n>0?'+':'')+n,n>0?'+':'-',()=>{count=Math.max(0,Math.min(max,count+n));update();}));body.append(grid);const p=document.createElement('p');p.textContent=description;body.append(p,button('Auftrag bestätigen','✓',()=>{if(apply(count)!==false)home();}));}
  function production(){const b=current;quantity('Waren herstellen',art(b.type),b.productionRemaining??10,999,n=>{if(!setProductionOrder(b,n))return false;return api.save();},'Anzahl weiterer Fertigungen. 0 beendet den Auftrag; bereits fertige Waren werden weiterhin abgeholt.');body.append(button('Unbegrenzt herstellen','▶',()=>{setProductionOrder(b,null);api.save();home();}));}
  function military(){screen='military';begin('Krieger rekrutieren');const grid=document.createElement('div');grid.className='building-menu-grid';for(const type of ['swordsman','archer','medic'])for(const rank of [1,2,3])grid.append(button(api.unitName({unit:type})+' · Rang '+rank,art(type,true),()=>quantity('Krieger rekrutieren',art(type,true),0,20,n=>api.enqueue(current,type,rank,n),'Je Einheit: 1 freier Träger, 1 '+(type==='archer'?'Bogen':'Schwert')+' und '+(rank-1)+' Gold.')));body.append(grid,button('Ausbildungsaufträge & Sammelpunkt','⚔',()=>section('Ausbildung & Sammelpunkt','#training-orders')));}
  function tools(){screen='tools';begin('Werkzeuge anfordern');const grid=document.createElement('div');grid.className='building-menu-grid';for(const type of api.tools())grid.append(button(api.goodName(type),api.good(type),()=>quantity(api.goodName(type)+' herstellen',api.good(type),current.toolOrders?.[type]||0,999,n=>api.orderTool(current,type,n),'Benötigt Eisen und Kohle. Vorhanden: '+(api.stock()[type]||0))));body.append(grid,button('Werkzeuge automatisch herstellen','▶',()=>{api.autoTools(current);home();}));}
  function section(label,selector){screen='section';begin(label);const node=q(selector);if(node){moved.push([node,node.parentNode,node.nextSibling]);body.append(node);}}
  function home(){screen='home';begin(name(current));const summary=document.createElement('div');summary.className='building-menu-summary';summary.innerHTML=art(current.type);const status=document.createElement('p');status.dataset.buildingMenuStatus='';status.textContent=api.buildStatus(current);summary.append(status);body.append(summary);const grid=document.createElement('div');grid.className='building-menu-grid';body.append(grid);
    if(current.type==='storehouse')return;
    const add=(label,icon,fn,disabled)=>grid.append(button(label,icon,fn,disabled));
    add(current.stopped?'Fortsetzen':'Anhalten',current.stopped?'▶':'Ⅱ',()=>{invoke('production-toggle');home();});
    const priority=button(current.priority?'Priorität: hoch':'Priorität: normal','↑',()=>{invoke('priority-toggle');home();});priority.setAttribute('aria-pressed',String(!!current.priority));grid.append(priority);
    if(current.type==='barracks')add('Krieger rekrutieren','⚔',military,current.progress<1);
    else if(current.type==='toolsmith')add('Werkzeuge anfordern',api.good('hammer'),tools,current.progress<1);
    else if(supportsProductionOrder(current.type))add('Waren herstellen','⚒',production,current.progress<1);
    if(current.type==='tower'){add('Soldaten hinein','⇧',()=>{api.fillTower(current);home();},current.progress<1||api.towerSpace(current)===0);add('Soldaten heraus','⇩',()=>{api.release(current);home();},!current.garrison);add('Besatzung & Turmfeuer','♟',()=>section('Turmbesatzung','#tower-roster'));}
    if(['woodcutter','quarry','forester'].includes(current.type))add('Arbeitsgebiet','⌕',()=>{close();invoke('area-toggle');},current.progress<1);
    if(current.type==='warehouse')add('Warenannahme',api.good('wood'),()=>section('Warenannahme','#warehouse-rules'));
    if(current.type==='hospital')add('Verwundete zurückrufen','♟',()=>invoke('hospital-recall'),current.progress<1||current.stopped);
    add('Gebäude abreißen','✹',()=>{close();invoke('demolish-building');});body.scrollTop=0;
  }
  function sync(){const b=getBuilding();launcher.hidden=!b;q('#building-settings').hidden=!b;if(!dialog.open)return;if(b!==current){close();return;}const next=JSON.stringify([b.stopped,b.priority,b.garrison,b.progress>=1,b.type==='tower'?api.towerSpace(b):0]);if(screen==='home'&&next!==signature){signature=next;home();}const status=body.querySelector('[data-building-menu-status]');if(status)status.textContent=api.buildStatus(b);}
  function open(){current=getBuilding();if(!current)return;home();dialog.showModal();sync();}
  launcher.onclick=open;q('#building-settings').onclick=open;dialog.querySelector('header button').onclick=close;dialog.querySelector('footer button').onclick=()=>screen==='home'?close():home();dialog.addEventListener('cancel',e=>{e.preventDefault();close();});dialog.addEventListener('close',restore);dialog.addEventListener('keydown',e=>e.stopPropagation());
  panel.classList.add('building-controls-source');
  return {open,close,sync,feedback(message,saved){feedback.textContent=message+(saved?'':' · Speichern fehlgeschlagen');}};
}

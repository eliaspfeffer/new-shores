import './mobile.css';
import {initThumbUI} from './mobile-thumb.js';
export const mobile={enabled:new URLSearchParams(location.search).get('mobile')==='1'||matchMedia('(pointer:coarse)').matches,select:false};
document.documentElement.classList.toggle('mobile',mobile.enabled);
export function initMobile({panel,reset,zoom,save,center,context,thumbApi}){
  if(!mobile.enabled)return;
  const game=document.querySelector('#game-screen'),sidebar=document.querySelector('#command-sidebar');
  const bar=document.createElement('nav');bar.id='mobile-controls';bar.setAttribute('aria-label','Touch-Befehle');
  bar.innerHTML='<button data-panel="build"><span>⌂</span>Bauen</button><button data-panel="units"><span>♟</span>Siedler</button><button id="touch-select" aria-pressed="false"><span>⌗</span>Markieren</button><button id="touch-move"><span>➜</span>Ziel</button><button id="touch-stop"><span>■</span>Halt</button><button data-panel="goods"><span>▰</span>Waren</button><button data-panel="economy"><span>⚒</span>Betriebe</button>';
  game.append(bar);
  const caption=document.createElement('div');caption.id='mobile-context-label';bar.append(caption);
  const overview=document.createElement('button');overview.id='mobile-overview';overview.innerHTML='<span>↩</span>Übersicht';overview.hidden=true;overview.onclick=()=>document.querySelector('#clear-selection').click();bar.prepend(overview);
  for(const [target,symbol,label] of [['building-settings','⚙','Details'],['area-toggle','◎','Bereich'],['production-toggle','Ⅱ','Betrieb'],['demolish-building','×','Abriss']]){
    const button=document.createElement('button');button.dataset.buildingAction=target;button.innerHTML='<span>'+symbol+'</span>'+label;button.setAttribute('aria-label',label);button.hidden=true;
    button.onclick=()=>{document.getElementById(target)?.click();hide();};bar.insertBefore(button,caption);
  }
  let contextKey='';
  mobile.refresh=()=>{
    const state=context(),menu=document.documentElement.classList.contains('mobile-panel');
    const actions=[...bar.querySelectorAll('[data-building-action]')];
    const availability=actions.map(b=>{const source=document.getElementById(b.dataset.buildingAction);return source&&!source.hidden&&!source.disabled;});
    const mode=menu?'menu':state.count?'units':state.building&&availability.some(Boolean)?'building':'map';
    const key=JSON.stringify([mode,state.name,state.count,state.stopped,mobile.select,availability]);if(key===contextKey)return;contextKey=key;
    bar.dataset.context=mode;
    overview.hidden=!['building','units'].includes(mode);
    bar.querySelectorAll('[data-panel]').forEach(b=>b.hidden=mode==='building'||mode==='units'&&!['build','units'].includes(b.dataset.panel));
    document.getElementById('touch-move').hidden=mode!=='units';document.getElementById('touch-stop').hidden=mode!=='units';
    actions.forEach((b,i)=>{b.hidden=mode!=='building'||!availability[i];if(b.dataset.buildingAction==='production-toggle')b.setAttribute('aria-pressed',String(state.stopped));});
    caption.textContent=mode==='building'?state.name:mode==='units'?state.count+' Siedler ausgewählt':mobile.select?'Siedler markieren':'Siedlung';
  };
  const close=document.createElement('button');close.id='mobile-close';close.textContent='Zur Karte ×';sidebar.prepend(close);
  const hide=()=>document.documentElement.classList.remove('mobile-panel');close.onclick=hide;
  bar.querySelectorAll('[data-panel]').forEach(b=>b.onclick=()=>{panel(b.dataset.panel);document.documentElement.classList.add('mobile-panel');});
  document.querySelector('#touch-select').onclick=()=>{mobile.select=!mobile.select;reset();hide();document.querySelector('#touch-select').setAttribute('aria-pressed',String(mobile.select));};
  document.querySelector('#touch-move').onclick=()=>{mobile.select=false;document.querySelector('#touch-select').setAttribute('aria-pressed','false');document.querySelector('#move-units').click();hide();};
  document.querySelector('#touch-stop').onclick=()=>document.querySelector('#halt-units').click();
  const clearMode=()=>{mobile.select=false;document.querySelector('#touch-select').setAttribute('aria-pressed','false');};
  document.querySelector('#clear-selection').addEventListener('click',clearMode);
  sidebar.addEventListener('click',e=>{if(e.target.closest('.building-card,#area-toggle,#move-units,#patrol-units,#extend-patrol')){clearMode();hide();}});
  const top=document.createElement('div');top.id='mobile-resources';top.append(document.querySelector('.resource-bar'));game.append(top);
  const mapButton=document.createElement('button');mapButton.id='mobile-map';mapButton.textContent='⌖';mapButton.setAttribute('aria-label','Minikarte anzeigen');mapButton.onclick=()=>document.documentElement.classList.toggle('mobile-map-open');game.append(mapButton);
  game.append(document.querySelector('.sidebar-map'));
  const zoomButtons=document.createElement('div');zoomButtons.id='mobile-zoom';zoomButtons.innerHTML='<button aria-label="Vergrößern">+</button><button aria-label="Verkleinern">−</button>';game.append(zoomButtons);zoomButtons.children[0].onclick=()=>zoom(1.15);zoomButtons.children[1].onclick=()=>zoom(1/1.15);
  const home=document.createElement('button');home.id='mobile-center';home.textContent='⌂';home.setAttribute('aria-label','Siedlung zentrieren');home.onclick=center;zoomButtons.append(home);
  const rotate=document.createElement('aside');rotate.id='rotate-device';rotate.innerHTML='<span>↻</span><h2>Bitte iPhone drehen</h2><p>New Shores wird im Querformat gespielt.<br>Falls nötig, die Ausrichtungssperre ausschalten.</p>';document.body.append(rotate);
  const orientation=()=>{const portrait=innerHeight>innerWidth;document.documentElement.classList.toggle('mobile-portrait',portrait);if(portrait)save();};addEventListener('resize',orientation);orientation();
  const help=document.createElement('p');help.textContent='Mobil: Ein Finger verschiebt die Karte, zwei Finger zoomen. „Markieren“ schaltet auf Auswahlrahmen per Ziehen um. Einheit antippen, dann „Ziel“ und das Ziel antippen. Gebäude antippen öffnet seine Einstellungen. Menüs mit „Zur Karte“ schließen.';const oldHelp=[...document.querySelectorAll('.help-copy p')].find(p=>p.textContent.startsWith('Touch:'));if(oldHelp)oldHelp.replaceWith(help);else if(!thumbApi)document.querySelector('.help-copy').append(help);
  if(thumbApi)initThumbUI(mobile,thumbApi);
}
export async function initOffline({save=()=>false}={}){
  const status=document.createElement('p');status.id='offline-status';status.setAttribute('role','status');document.querySelector('#save-button').after(status);
  const install=document.createElement('p');install.textContent='iPhone: Safari → Teilen → Zum Home-Bildschirm. Einmal online warten, bis „Offline bereit“ erscheint. Offline bleiben Änderungen auf diesem Gerät. Am Server-Link synchronisiert „Konto & Inseln“ geladene eigene/freigegebene Serverstände online; vor Gerätewechsel „Jetzt synchronisieren“. Export bleibt als unabhängige Sicherung verfügbar.';status.after(install);
  if(!import.meta.env.PROD||!('serviceWorker' in navigator)||!isSecureContext){status.textContent='Offline-Modus benötigt den HTTPS-Spiel-Link (Produktionsbuild).';return;}
  status.textContent='Offline-Dateien werden gespeichert …';
  try{const registration=await navigator.serviceWorker.register('/sw.js',{updateViaCache:'none'});await navigator.serviceWorker.ready;status.textContent='Offline bereit · Spiel und Grafiken auf diesem Gerät gespeichert';navigator.storage?.persist?.().catch(()=>{});
    const offer=()=>{if(!registration.waiting||document.querySelector('#game-update'))return;const button=document.createElement('button');button.id='game-update';button.className='text-button';button.textContent='Neue Version laden (Spielstand sichern)';button.onclick=()=>{if(!save())return;navigator.serviceWorker.addEventListener('controllerchange',()=>location.reload(),{once:true});registration.waiting?.postMessage('ACTIVATE_UPDATE');};status.after(button);};
    offer();registration.addEventListener('updatefound',()=>{registration.installing?.addEventListener('statechange',offer);});
    document.addEventListener('visibilitychange',()=>{if(!document.hidden)registration.update().catch(()=>{});});
  }catch{status.textContent='Offline-Download fehlgeschlagen. Online neu laden und erneut versuchen.';}
}

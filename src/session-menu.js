import './session-menu.css';
import {createSaveLibrary} from './save-library.js';
import {playerColors} from './player-colors.js';
export function initSessionMenu(api){
  const library=createSaveLibrary(localStorage,api.parse);
  const dialog=document.createElement('dialog');dialog.id='save-library-dialog';
  dialog.innerHTML='<header><div><small>DEINE SIEDLUNGEN</small><h2>Spielstände</h2></div><button id="close-save-library" aria-label="Spielstände schließen">Schließen ×</button></header><p>Nur auf diesem Gerät gespeichert. Beim Laden bleibt der vorherige Stand als Sicherung erhalten.</p><div id="save-library-list"></div><p id="save-library-feedback" role="status" aria-live="polite"></p>';
  document.body.append(dialog);
  const feedback=message=>dialog.querySelector('#save-library-feedback').textContent=message;
  dialog.addEventListener('keydown',e=>e.stopPropagation());
  dialog.querySelector('#close-save-library').onclick=()=>dialog.close();
  const run=action=>{try{action();}catch(e){feedback(e.message);}};
  function refresh(){
    const list=dialog.querySelector('#save-library-list');list.replaceChildren();
    for(const item of library.list()){
      const row=document.createElement('article');row.dataset.saveKey=item.key;
      const heading=document.createElement('strong');heading.textContent=item.data?.saveName||item.label;
      const summary=document.createElement('p');
      summary.textContent=item.error?'Nicht ladbar: '+item.error:item.empty?'Noch kein Spielstand':item.label+' · '+(Number.isFinite(item.data.savedAt)?new Date(item.data.savedAt).toLocaleString('de-DE'):'Datum unbekannt')+' · '+Math.floor((item.data.elapsed||0)/60)+' Min. · '+item.data.buildings.length+' Gebäude · '+(item.data.resources.people||0)+' Siedler';
      row.append(heading,summary);
      const controls=document.createElement('div');controls.className='save-library-actions';
      const load=document.createElement('button');load.textContent='Laden';load.disabled=!item.data;load.dataset.loadSave=item.key;
      load.onclick=()=>run(()=>{const snapshot=library.read(item.key);if(!snapshot)throw new Error('Spielstand nicht mehr vorhanden');if(!confirm('Diesen Spielstand laden? Der aktuelle Stand wird vorher gesichert.'))return;if(api.restore(snapshot.text)){dialog.close();api.resumeLoaded();}else feedback('Laden fehlgeschlagen. Dein bisheriger Stand bleibt erhalten.');});
      controls.append(load);
      if(item.writable){
        const name=document.createElement('input');name.maxLength=48;name.value=item.data?.saveName||item.label;name.setAttribute('aria-label',item.label+' benennen');
        const store=document.createElement('button');store.textContent='Hier sichern';store.disabled=!api.hasSession();store.onclick=()=>run(()=>{if(item.data&&!confirm('Diesen Speicherplatz überschreiben?'))return;const text=api.capture();if(!text)throw new Error('Sichern fehlgeschlagen');library.write(item.key,text,name.value);refresh();feedback('Spielstand gesichert');api.refreshSlots();});
        const rename=document.createElement('button');rename.textContent='Umbenennen';rename.disabled=!item.data;rename.onclick=()=>run(()=>{library.rename(item.key,name.value);refresh();feedback('Name gespeichert');api.refreshSlots();});
        controls.append(name,store,rename);
      }
      row.append(controls);list.append(row);
    }
  }
  const open=()=>{refresh();feedback('');dialog.showModal();};
  document.querySelectorAll('[data-store-slot]').forEach(button=>{button.onclick=()=>{try{
    const key='new-shores-slot-'+button.dataset.storeSlot,current=library.read(key);
    if(current&&!confirm('Diesen Speicherplatz überschreiben?'))return;
    const text=api.capture();if(!text)return;
    library.write(key,text,current?.data.saveName);api.refreshSlots();api.notify('Speicherplatz gesichert');
  }catch(e){api.notify('Speicherplatz konnte nicht gesichert werden: '+e.message);}};});
  for(const [anchor,id,label] of [['#continue-game','open-title-saves','Spielstände & Zwischenspeicher'],['#save-slots','open-pause-saves','Spielstände verwalten']]){
    const button=document.createElement('button');button.className='text-button';button.id=id;button.textContent=label;button.onclick=open;document.querySelector(anchor).after(button);
  }
  const home=document.createElement('button');home.id='return-main-menu';home.className='text-button';home.textContent='Speichern & Hauptmenü';home.onclick=()=>{if(!api.leave())api.notify('Hauptmenü nicht geöffnet: Spielstand konnte nicht gesichert werden.');};document.querySelector('#restart-button').before(home);
  function quickSave(){if(!api.hasSession())return;try{const text=api.capture();if(!text)return;library.write('new-shores-quicksave',text,'Zwischenspeicher');api.notify('Zwischenspeicher gesichert');}catch(e){api.notify('Zwischenspeichern fehlgeschlagen: '+e.message);}}
  function quickLoad(){try{const saved=library.read('new-shores-quicksave');if(!saved)return api.notify('Der Zwischenspeicher ist noch leer');if(!confirm('Zwischenspeicher laden? Der aktuelle Stand wird vorher gesichert.'))return;if(api.restore(saved.text))api.resumeLoaded();}catch(e){api.notify('Schnellladen fehlgeschlagen: '+e.message);}}
  for(const [id,label,action] of [['quick-save','Zwischenspeichern · F5',quickSave],['quick-load','Zwischenspeicher laden · F9',quickLoad]]){const b=document.createElement('button');b.id=id;b.className='text-button';b.textContent=label;b.onclick=action;home.before(b);}
  addEventListener('keydown',e=>{if(!api.isActive()||document.querySelector('dialog[open]')||['INPUT','SELECT','TEXTAREA'].includes(e.target?.tagName))return;if(e.key==='F5'||e.key==='F9'){e.preventDefault();if(e.key==='F5')quickSave();else quickLoad();}});
  const colors=[];
  for(const [anchor,id] of [['#scenario-description','new-player-color'],['#power-button','current-player-color']]){
    const label=document.createElement('label');label.className='player-color-picker';label.textContent='Deine Spielerfarbe ';
    const select=document.createElement('select');select.id=id;select.setAttribute('aria-label',id==='new-player-color'?'Farbe für neue Siedlung':'Aktuelle Spielerfarbe');
    for(const [key,value] of Object.entries(playerColors)){const option=document.createElement('option');option.value=key;option.textContent=value.name;select.append(option);}
    select.value=api.getColor();select.onchange=()=>{if(id==='current-player-color'){api.setColor(select.value);if(!api.capture())api.notify('Farbe geändert, aber Speichern fehlgeschlagen');}else api.setNewColor(select.value);};
    label.append(select);document.querySelector(anchor).after(label);colors.push(select);
  }
  return {sync(){for(const select of colors)select.value=api.getColor();}};
}

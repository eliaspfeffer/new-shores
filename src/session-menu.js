import './session-menu.css';
import {createSaveLibrary} from './save-library.js';
import {playerColors} from './player-colors.js';
export function initSessionMenu(api){
  const library=createSaveLibrary(localStorage,api.parse);
  const isIsland=item=>item.key==='new-shores-save'||/^new-shores-slot-[1-3]$/.test(item.key);
  const savedIslands=()=>library.list().filter(item=>isIsland(item)&&item.data?.mapPreview);
  const dialog=document.createElement('dialog');dialog.id='save-library-dialog';
  dialog.innerHTML='<header><div><small>DEINE SIEDLUNGEN</small><h2>Spielstände</h2></div><button id="close-save-library" aria-label="Spielstände schließen">Schließen ×</button></header><p class="save-library-intro">Nur vorhandene Spielstände mit Kartenbild werden angezeigt.</p><div id="save-library-list"></div><p id="save-library-feedback" role="status" aria-live="polite"></p>';
  document.body.append(dialog);
  const importLabel=document.createElement('label');importLabel.className='save-import';importLabel.textContent='Spielstand aus JSON-Datei übernehmen ';const file=document.createElement('input');file.type='file';file.accept='.json,application/json';file.id='title-import-save';importLabel.append(file);dialog.querySelector('#save-library-list').after(importLabel);
  file.onchange=async()=>{const selected=file.files?.[0];if(!selected)return;try{if(selected.size>8_000_000)throw new Error('Datei ist zu groß');if(api.restore(await selected.text())){dialog.close();api.resumeLoaded();}else feedback('Spielstand konnte nicht geladen werden.');}catch(e){feedback(e.message);}finally{file.value='';}};
  const feedback=message=>dialog.querySelector('#save-library-feedback').textContent=message;
  dialog.addEventListener('keydown',e=>e.stopPropagation());
  dialog.querySelector('#close-save-library').onclick=()=>dialog.close();
  const run=action=>{try{action();}catch(e){feedback(e.message);}};
  function refresh(){
    const list=dialog.querySelector('#save-library-list');list.replaceChildren();
    const items=savedIslands();
    if(!items.length){const empty=document.createElement('p');empty.className='save-library-empty';empty.textContent='Noch keine gespeicherten Karten.';list.append(empty);return;}
    for(const item of items){
      const row=document.createElement('article');row.dataset.saveKey=item.key;
      const preview=document.createElement('img');preview.className='save-map-preview';preview.src=item.data.mapPreview;preview.alt='Kartenansicht von '+(item.data.saveName||item.label);preview.width=320;preview.height=220;row.append(preview);
      const titleRow=document.createElement('div');titleRow.className='save-card-heading';
      const heading=document.createElement('button');heading.type='button';heading.className='save-card-title';heading.textContent=item.data.saveName||item.label;heading.title='Spielstand umbenennen';
      const pencil=document.createElement('button');pencil.type='button';pencil.className='save-card-icon';pencil.textContent='✎';pencil.setAttribute('aria-label','Spielstand umbenennen');pencil.title='Spielstand umbenennen';
      const remove=document.createElement('button');remove.type='button';remove.className='save-card-icon save-card-remove';remove.textContent='×';remove.setAttribute('aria-label','Spielstand löschen');remove.title='Spielstand löschen';
      titleRow.append(heading,pencil,remove);row.append(titleRow);
      const summary=document.createElement('p');
      summary.textContent=(Number.isFinite(item.data.savedAt)?new Date(item.data.savedAt).toLocaleString('de-DE'):'Datum unbekannt')+' · '+Math.floor((item.data.elapsed||0)/60)+' Min. · '+item.data.buildings.length+' Gebäude · '+(item.data.resources.people||0)+' Siedler';
      row.append(summary);
      const controls=document.createElement('div');controls.className='save-library-actions';
      const load=document.createElement('button');load.textContent='Laden';load.dataset.loadSave=item.key;
      load.onclick=()=>run(()=>{const snapshot=library.read(item.key);if(!snapshot)throw new Error('Spielstand nicht mehr vorhanden');if(!confirm('Diesen Spielstand laden? Der aktuelle Stand wird vorher gesichert.'))return;if(api.restore(snapshot.text)){dialog.close();api.resumeLoaded();}else feedback('Laden fehlgeschlagen. Dein bisheriger Stand bleibt erhalten.');});
      controls.append(load);
      const editor=document.createElement('form');editor.className='save-card-editor';editor.hidden=true;
      const name=document.createElement('input');name.maxLength=48;name.value=item.data.saveName||item.label;name.setAttribute('aria-label','Name des Spielstands');
      const saveName=document.createElement('button');saveName.type='submit';saveName.textContent='Speichern';saveName.setAttribute('aria-label','Name speichern');
      const cancel=document.createElement('button');cancel.type='button';cancel.textContent='Abbrechen';cancel.setAttribute('aria-label','Umbenennen abbrechen');
      editor.append(name,saveName,cancel);
      const beginRename=()=>{titleRow.hidden=true;editor.hidden=false;name.focus();name.select();};
      heading.onclick=beginRename;pencil.onclick=beginRename;
      cancel.onclick=()=>{editor.hidden=true;titleRow.hidden=false;name.value=item.data.saveName||item.label;};
      editor.onsubmit=e=>{e.preventDefault();run(()=>{library.rename(item.key,name.value);refresh();feedback('Name gespeichert');api.refreshSlots();});};
      remove.onclick=()=>run(()=>{const title=item.data.saveName||item.label;if(!confirm('„'+title+'“ wirklich löschen?'))return;library.remove(item.key);refresh();feedback('Spielstand gelöscht');api.refreshSlots();});
      row.append(editor);
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
  for(const [anchor,id,label] of [['#save-slots','open-pause-saves','Spielstände verwalten']]){
    const button=document.createElement('button');button.className='text-button';button.id=id;button.textContent=label;button.onclick=open;document.querySelector(anchor).after(button);
  }
  const continueGame=document.querySelector('#continue-game'),continueDirect=continueGame.onclick;
  continueGame.onclick=event=>savedIslands().length>1?open():continueDirect?.call(continueGame,event);
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

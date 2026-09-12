import './building-settings.css';

// Move the actual controls, never clone them: one set of handlers and one building state.
export function initBuildingSettings({getBuilding,name}){
  const panel=document.querySelector('#info-panel'),home=panel.parentElement;
  const launcher=document.createElement('button');launcher.id='open-building-settings';launcher.textContent='Gebäudeeinstellungen öffnen';home.prepend(launcher);
  const notice=document.createElement('p');notice.id='building-settings-notice';notice.textContent='Das Hauptlager arbeitet automatisch und ist geschützt. Hier gibt es keine veränderbaren Einstellungen.';home.prepend(notice);
  const feedback=document.createElement('p');feedback.id='building-action-feedback';feedback.setAttribute('role','status');feedback.setAttribute('aria-live','polite');document.querySelector('#building-actions').before(feedback);
  const dialog=document.createElement('dialog');dialog.id='building-settings-dialog';dialog.setAttribute('aria-labelledby','building-settings-title');
  dialog.innerHTML='<header><div><small>GEBÄUDEEINSTELLUNGEN</small><h2 id="building-settings-title"></h2></div><button id="close-building-settings" autofocus aria-label="Gebäudeeinstellungen schließen">Schließen ×</button></header><div id="building-settings-content"></div>';
  document.querySelector('#game-screen').append(dialog);
  let returnFocus=null,current=null;
  const available=()=>Boolean(getBuilding()&&getBuilding().type!=='storehouse');
  function sync(){const b=getBuilding();if(current!==b){feedback.textContent='';current=b;}const enabled=available();launcher.hidden=!enabled;notice.hidden=enabled;document.querySelector('#building-settings').hidden=!enabled;document.querySelector('#building-settings-title').textContent=b?name(b):'';if(!enabled&&dialog.open)close();}
  function close(){if(!dialog.open)return;home.append(panel);dialog.close();if(returnFocus?.isConnected)returnFocus.focus({preventScroll:true});}
  function open(){sync();if(!available()||dialog.open)return;returnFocus=document.activeElement;document.querySelector('#building-settings-content').append(panel);dialog.showModal();document.querySelector('#building-settings-content').scrollTop=0;}
  launcher.onclick=open;document.querySelector('#building-settings').onclick=open;document.querySelector('#close-building-settings').onclick=close;
  dialog.addEventListener('cancel',e=>{e.preventDefault();close();});
  dialog.addEventListener('keydown',e=>e.stopPropagation());
  dialog.addEventListener('click',e=>{if(e.target===dialog)close();});
  dialog.addEventListener('close',()=>{if(!dialog.open&&panel.parentElement!==home)home.append(panel);});
  for(const id of ['area-toggle','demolish-building'])document.querySelector('#'+id).addEventListener('click',()=>{close();if(id==='area-toggle')document.documentElement.classList.remove('mobile-panel');});
  addEventListener('resize',()=>{if(document.documentElement.classList.contains('mobile')&&innerHeight>innerWidth)close();});
  return {sync,open,close,feedback(message,saved){feedback.textContent=message+(saved?' · gespeichert':' · nicht gespeichert: Browserspeicher prüfen');feedback.dataset.error=String(!saved);}};
}

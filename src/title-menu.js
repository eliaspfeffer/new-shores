import './title-menu.css';
export function initTitleMenu(){
  const card=document.querySelector('.title-card');
  const setup=document.createElement('dialog');setup.id='new-settlement-dialog';setup.className='title-popup';setup.setAttribute('aria-labelledby','new-settlement-title');
  setup.innerHTML='<header><h2 id="new-settlement-title">Neue Siedlung</h2><button type="button" aria-label="Neue Siedlung schließen">Zurück ×</button></header><div class="setup-grid"></div>';
  setup.querySelector('header button').onclick=()=>{sessionStorage.removeItem('new-shores-multiplayer-pending');setup.close();};
  document.body.append(setup);
  const grid=setup.querySelector('.setup-grid');
  for(const selector of ['.scenario-picker','#scenario-description','.player-color-picker','#map-options']){const node=card.querySelector(selector);if(node)grid.append(node);}
  const start=document.querySelector('#new-game');setup.append(start);
  start.addEventListener('click',()=>{if(document.querySelector('#game-screen').classList.contains('active'))setup.close();});
  setup.addEventListener('keydown',e=>e.stopPropagation());
  const intro=document.createElement('div');intro.className='title-intro';
  for(const selector of ['.eyebrow','h1','.subtitle']){const node=card.querySelector(selector);if(node)intro.append(node);}
  const nav=document.createElement('nav');nav.className='title-actions';nav.setAttribute('aria-label','Hauptmenü');
  const create=document.createElement('button');create.id='open-new-settlement';create.className='wood-button';create.textContent='Singleplayer';create.onclick=()=>setup.showModal();nav.append(create);
  const multiplayer=document.createElement('button');multiplayer.id='multiplayer-entry';multiplayer.className='wood-button';multiplayer.textContent='Multiplayer';multiplayer.onclick=()=>document.dispatchEvent(new CustomEvent('new-shores-cloud-open',{detail:{mode:'multiplayer'}}));nav.append(multiplayer);
  const authRow=document.createElement('div');authRow.className='title-auth-actions';
  const login=card.querySelector('.account-entry');if(login){login.textContent='Login';authRow.append(login);}
  const register=document.createElement('button');register.className='text-button register-entry';register.textContent='Registrieren';register.hidden=document.documentElement.classList.contains('cloud-authenticated');register.onclick=()=>document.dispatchEvent(new CustomEvent('new-shores-cloud-open',{detail:{mode:'register'}}));authRow.append(register);nav.append(authRow);
  for(const selector of ['#continue-game','#open-title-saves']){const node=card.querySelector(selector);if(node)nav.append(node);}
  card.prepend(intro,nav);card.classList.add('title-hub');
  const info=document.querySelector('#seo-info-dialog');
  if(info){const title=info.querySelector('#seo-info-title'),sections=[...info.querySelectorAll('[data-info-content]')],names={game:'Spiel & Technik',privacy:'Datenschutz',about:'Über das Projekt'};info.querySelector('header button').onclick=()=>info.close();for(const button of document.querySelectorAll('[data-info-panel]'))button.onclick=()=>{const key=button.dataset.infoPanel;title.textContent=names[key];for(const section of sections)section.hidden=section.dataset.infoContent!==key;info.showModal();};info.addEventListener('keydown',e=>e.stopPropagation());}
}

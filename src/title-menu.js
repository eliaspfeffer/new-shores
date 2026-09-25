import './title-menu.css';
import titleCityImage from '../assets/gameplay-islands.png';
export function initTitleMenu(){
  const card=document.querySelector('.title-card');
  const setup=document.createElement('dialog');setup.id='new-settlement-dialog';setup.className='title-popup';setup.setAttribute('aria-labelledby','new-settlement-title');
  setup.innerHTML='<header><h2 id="new-settlement-title">Neue Siedlung</h2><button type="button" aria-label="Neue Siedlung schließen">Zurück ×</button></header><div class="setup-grid"></div>';
  const modeNote=document.createElement('p');modeNote.className='setup-mode-note';modeNote.textContent='Diese Insel wird nach dem Start mit deinem Multiplayer-Konto verbunden.';modeNote.hidden=true;setup.querySelector('header').after(modeNote);
  setup.querySelector('header button').onclick=()=>{sessionStorage.removeItem('new-shores-multiplayer-pending');setup.close();};
  document.body.append(setup);
  const grid=setup.querySelector('.setup-grid');
  for(const selector of ['.scenario-picker','#scenario-description','.player-color-picker','#map-options']){const node=card.querySelector(selector);if(node)grid.append(node);}
  const start=document.querySelector('#new-game');setup.append(start);
  start.addEventListener('click',()=>{if(document.querySelector('#game-screen').classList.contains('active'))setup.close();});
  setup.addEventListener('keydown',e=>e.stopPropagation());
  const authChoice=document.createElement('dialog');authChoice.id='singleplayer-auth-choice';authChoice.className='title-popup compact-popup';authChoice.setAttribute('aria-labelledby','singleplayer-auth-title');authChoice.innerHTML='<header><h2 id="singleplayer-auth-title">Save your city</h2></header><p>Register / login to save your state. Otherwise your city gets lost when deleting cookies.</p><div class="auth-choice-actions"><button type="button" data-auth-choice="skip">Skip</button><button type="button" data-auth-choice="login">Login / Register</button></div>';document.body.append(authChoice);
  const openSetup=multiplayer=>{
    setup.dataset.mode=multiplayer?'multiplayer':'singleplayer';
    setup.querySelector('#new-settlement-title').textContent=multiplayer?'Neue Multiplayer-Insel':'Neue Siedlung';
    setup.querySelector('header button').setAttribute('aria-label',multiplayer?'Multiplayer-Insel schließen':'Neue Siedlung schließen');
    start.textContent=multiplayer?'MULTIPLAYER STARTEN':'SIEDLUNG GRÜNDEN';
    modeNote.hidden=!multiplayer;
    setup.showModal();
  };
  const intro=document.createElement('div');intro.className='title-intro';
  card.querySelector('.eyebrow')?.remove();
  for(const selector of ['h1','.subtitle']){const node=card.querySelector(selector);if(node)intro.append(node);}
  const cityAnimation=document.createElement('img');cityAnimation.className='title-city-animation';cityAnimation.src=titleCityImage;cityAnimation.alt='Mehrere Inseln und Siedlungen in der Multiplayer-Welt von New Shores';cityAnimation.width=720;cityAnimation.height=405;intro.append(cityAnimation);
  const nav=document.createElement('nav');nav.className='title-actions';nav.setAttribute('aria-label','Hauptmenü');
  const openSingleplayer=()=>{sessionStorage.removeItem('new-shores-multiplayer-pending');openSetup(false);};
  document.addEventListener('new-shores-singleplayer-setup',openSingleplayer);
  authChoice.querySelector('[data-auth-choice="skip"]').onclick=()=>{authChoice.close();openSingleplayer();};
  authChoice.querySelector('[data-auth-choice="login"]').onclick=()=>{authChoice.close();document.dispatchEvent(new CustomEvent('new-shores-cloud-open',{detail:{mode:'singleplayer'}}));};
  const create=document.createElement('button');create.id='open-new-settlement';create.className='wood-button';create.textContent='Singleplayer';create.onclick=()=>document.documentElement.classList.contains('cloud-authenticated')?openSingleplayer():authChoice.showModal();nav.append(create);
  document.addEventListener('new-shores-multiplayer-setup',()=>openSetup(true));
  document.addEventListener('new-shores-multiplayer-continue',()=>document.querySelector('#continue-game').click());
  const multiplayer=document.createElement('button');multiplayer.id='multiplayer-entry';multiplayer.className='wood-button';multiplayer.textContent='Multiplayer';multiplayer.onclick=()=>document.dispatchEvent(new CustomEvent('new-shores-cloud-open',{detail:{mode:'multiplayer'}}));nav.append(multiplayer);
  card.querySelector('.account-entry')?.remove();
  const register=card.querySelector('.register-entry');register?.remove();
  const continueGame=card.querySelector('#continue-game');if(continueGame)nav.append(continueGame);
  card.prepend(intro,nav);card.classList.add('title-hub');
  const info=document.querySelector('#seo-info-dialog');
  if(info){const title=info.querySelector('#seo-info-title'),sections=[...info.querySelectorAll('[data-info-content]')],names={game:'Spiel & Technik',privacy:'Datenschutz',about:'Über das Projekt'};info.querySelector('header button').onclick=()=>info.close();for(const button of document.querySelectorAll('[data-info-panel]'))button.onclick=()=>{const key=button.dataset.infoPanel;title.textContent=names[key];for(const section of sections)section.hidden=section.dataset.infoContent!==key;info.showModal();};info.addEventListener('keydown',e=>e.stopPropagation());}
}

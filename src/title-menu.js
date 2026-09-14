import './title-menu.css';
export function initTitleMenu(){
  const card=document.querySelector('.title-card');
  const setup=document.createElement('dialog');setup.id='new-settlement-dialog';setup.className='title-popup';setup.setAttribute('aria-labelledby','new-settlement-title');
  setup.innerHTML='<header><h2 id="new-settlement-title">Neue Siedlung</h2><button type="button" aria-label="Neue Siedlung schließen">Zurück ×</button></header><div class="setup-grid"></div>';
  setup.querySelector('header button').onclick=()=>setup.close();
  document.body.append(setup);
  const grid=setup.querySelector('.setup-grid');
  for(const selector of ['.scenario-picker','#scenario-description','.player-color-picker','#map-options']){const node=card.querySelector(selector);if(node)grid.append(node);}
  const start=document.querySelector('#new-game');setup.append(start);
  start.addEventListener('click',()=>{if(document.querySelector('#game-screen').classList.contains('active'))setup.close();});
  setup.addEventListener('keydown',e=>e.stopPropagation());
  const intro=document.createElement('div');intro.className='title-intro';
  for(const selector of ['.eyebrow','h1','.subtitle']){const node=card.querySelector(selector);if(node)intro.append(node);}
  const nav=document.createElement('nav');nav.className='title-actions';nav.setAttribute('aria-label','Hauptmenü');
  const create=document.createElement('button');create.id='open-new-settlement';create.className='wood-button';create.textContent='Neue Siedlung';create.onclick=()=>setup.showModal();nav.append(create);
  for(const selector of ['#continue-game','#open-title-saves','.account-entry']){const node=card.querySelector(selector);if(node)nav.append(node);}
  card.prepend(intro,nav);card.classList.add('title-hub');
}

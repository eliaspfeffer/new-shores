import './map-menu.css';
import {mapTypes,validMapConfig} from './map-generator.js';
export function initMapMenu(api){
  const panel=document.createElement('fieldset');panel.id='map-options';
  panel.innerHTML='<legend>Karte für die neue Siedlung</legend><label>Landschaft<select id="map-type"></select></label><label>Seed<input id="map-seed" type="number" min="0" max="4294967295" step="1" value="1"></label><button id="random-map-seed" type="button">Neuen Seed würfeln</button><p>50 × 50 Felder. Gleicher Typ + Seed = gleiche Startlandschaft. Fortsetzen verändert deine Karte nicht.</p><p id="map-options-error" role="status"></p>';
  document.querySelector('#new-game').before(panel);
  const type=panel.querySelector('#map-type'),seed=panel.querySelector('#map-seed'),random=panel.querySelector('#random-map-seed');
  for(const [value,label] of Object.entries(mapTypes)){const o=document.createElement('option');o.value=value;o.textContent=label;type.append(o);}
  const sync=()=>{seed.disabled=random.disabled=type.value==='classic';panel.querySelector('#map-options-error').textContent='';};type.onchange=sync;
  seed.oninput=()=>{panel.querySelector('#map-options-error').textContent='';};
  random.onclick=()=>{seed.value=crypto.getRandomValues(new Uint32Array(1))[0];seed.oninput();};sync();
  const current=document.createElement('p');current.id='current-map';document.querySelector('#scenario-progress').after(current);
  function refresh(){const c=api.current();current.textContent='Karte: '+mapTypes[c.type]+(c.type==='classic'?'':' · Seed '+c.seed)+' · 50 × 50';}
  function read(){const c={version:1,type:type.value,seed:type.value==='classic'?0:Number(seed.value)};if(seed.value===''&&c.type!=='classic'||!validMapConfig(c)){panel.querySelector('#map-options-error').textContent='Bitte einen ganzzahligen Seed von 0 bis 4294967295 eingeben.';return null;}return c;}
  function restore(c){if(validMapConfig(c)){type.value=c.type;seed.value=c.seed;sync();}refresh();}
  refresh();return {read,restore,refresh};
}

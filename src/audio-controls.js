export function initAudioControls(sound){
  const panel=document.createElement('details');panel.id='audio-settings';panel.innerHTML='<summary>Musik & Geräusche</summary><button id="sound-button" class="text-button" aria-pressed="false">Ton einschalten</button>';
  let preferences={};try{preferences=JSON.parse(localStorage.getItem('new-shores-audio'))||{};}catch{}
  const persist=()=>{try{localStorage.setItem('new-shores-audio',JSON.stringify(sound.levels));}catch{}};
  for(const [key,label] of Object.entries({music:'Musik',effects:'Soundeffekte',ambience:'Natur'})){
    if(Number.isFinite(preferences[key]))sound.setVolume(key,preferences[key]);
    const row=document.createElement('label');row.style.cssText='display:flex;align-items:center;gap:8px;min-height:44px';row.textContent=label;
    const input=document.createElement('input');input.type='range';input.min='0';input.max='100';input.value=Math.round(sound.levels[key]*100);input.setAttribute('aria-label',label);input.style.cssText='min-width:0;width:110px;height:44px';input.oninput=()=>{sound.setVolume(key,Number(input.value)/100);persist();};row.append(input);panel.append(row);
  }
  document.querySelector('#power-button').after(panel);
  let wanted=false;const button=panel.querySelector('button');
  button.onclick=async()=>{wanted=!wanted;const enabled=await sound.setEnabled(wanted);wanted=enabled;button.textContent=enabled?'Ton ausschalten':'Ton einschalten';button.setAttribute('aria-pressed',String(enabled));};
  document.addEventListener('visibilitychange',()=>{sound.setEnabled(wanted&&!document.hidden);});
  document.addEventListener('click',e=>{if(e.target.closest('button')&&!panel.contains(e.target))sound.play('click',.4);});
}

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
  const description=document.createElement('p');description.textContent='Echte CC0-Aufnahmen: Holz, Bauhammer, Metall, Baumfall und Jubel. Übrige Klänge bleiben synthetisch.';panel.append(description);
  const preview=document.createElement('div');preview.style.cssText='display:flex;gap:6px;flex-wrap:wrap';
  for(const [kind,label] of [['chop','Holz'],['build','Hammer'],['anvil','Metall'],['fall','Baumfall'],['complete','Yippee']]){
    const test=document.createElement('button');test.className='text-button';test.style.cssText='min-height:44px;min-width:56px';test.dataset.audioPreview=kind;test.textContent=label;test.title='Hörprobe: '+label;test.disabled=true;test.onclick=()=>sound.play(kind,.8);preview.append(test);
  }
  panel.append(preview);
  const status=document.createElement('p');status.id='audio-sample-status';status.setAttribute('role','status');status.textContent='Hörproben nach dem Einschalten verfügbar.';panel.append(status);
  let wanted=false;const button=panel.querySelector('button');
  button.onclick=async()=>{wanted=!wanted;const enabled=await sound.setEnabled(wanted);wanted=enabled;button.textContent=enabled?'Ton ausschalten':'Ton einschalten';button.setAttribute('aria-pressed',String(enabled));preview.querySelectorAll('button').forEach(b=>b.disabled=true);if(!enabled)return;
    status.textContent='Aufnahmen werden vorbereitet …';await sound.whenSamplesReady();const d=sound.diagnostics;status.textContent=d.sampleFailures?'Einige Aufnahmen fehlen; Ersatzklänge bleiben aktiv.':d.samples+' Aufnahmen bereit · CC0';preview.querySelectorAll('button').forEach(b=>b.disabled=!sound.enabled);
  };
  document.addEventListener('visibilitychange',()=>{sound.setEnabled(wanted&&!document.hidden);});
  document.addEventListener('click',e=>{if(e.target.closest('button')&&!panel.contains(e.target))sound.play('click',.4);});
}

// CC0 recorded Foley with procedural fallbacks and original procedural music.
import {sampleEffects} from './audio-samples.js';
export const productionSounds={sawmill:'saw',waterworks:'water',farm:'harvest',mill:'mill',bakery:'fire',fisher:'fish',pigfarm:'pig',butcher:'chop',coalmine:'quarry',ironmine:'quarry',goldmine:'quarry',sulfurmine:'quarry',smelter:'fire',goldsmelter:'fire',toolsmith:'anvil',weaponsmith:'anvil',bowmaker:'saw',forester:'dig',hospital:'heal'};
export const effects={
  chop:[.16,650,90],quarry:[.22,2700,740],fall:[1.1,460,55],dig:[.18,500,100],harvest:[.25,1700,110],
  fish:[.35,1300,260],build:[.17,950,220],saw:[.48,1900,140],mill:[.6,500,85],fire:[.55,800,70],
  water:[.55,1600,310],pig:[.25,0,380],anvil:[.3,2100,1200],craft:[.18,800,240],heal:[.4,0,520],
  survey:[.25,2200,820],discovery:[.7,0,880],step:[.08,600,65],pickup:[.12,750,150],drop:[.2,850,95],
  bow:[.18,2400,330],hit:[.16,1200,160],death:[.45,450,90],capture:[.7,0,440],
  complete:[.7,0,660],place:[.17,900,180],demolish:[.8,700,75],click:[.06,0,440],notice:[.25,0,550],
  victory:[1.2,0,660],defeat:[1,0,165],bird:[.3,0,2100],wind:[2,450,0],surf:[2,1000,0],
};
export function createSound() {
  let context,enabled=false,timer,noise,voices=0,beat=0,next=0,ambientAt=0,revision=0;
  const recent=new Map(),buses={},levels={music:.35,effects:.7,ambience:.3};
  const samples=new Map(),variants=new Map();let sampleLoad,sampleFailures=0,samplePlays=0;
  function loadSamples(){
    if(sampleLoad)return sampleLoad;
    sampleLoad=Promise.all([...new Set(Object.values(sampleEffects).flatMap(s=>s.files))].map(async url=>{
      const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),12000);
      try{const response=await fetch(url,{signal:controller.signal});if(!response.ok)throw new Error('Audio download failed');
        const data=await response.arrayBuffer();if(data.byteLength>500000)throw new Error('Audio too large');
        const buffer=await context.decodeAudioData(data);if(buffer.duration>5)throw new Error('Audio too long');samples.set(url,buffer);
      }catch{sampleFailures++;}finally{clearTimeout(timeout);}
    }));return sampleLoad;
  }
  function recorded(kind,volume,pan,bus){
    const spec=sampleEffects[kind],available=spec?.files.map(url=>samples.get(url)).filter(Boolean);if(!available?.length)return false;
    if(voices>=32||volume<=0||!levels[bus])return true;
    const index=variants.get(kind)||0;variants.set(kind,index+1);
    const source=context.createBufferSource(),gain=context.createGain(),panner=context.createStereoPanner();
    source.buffer=available[index%available.length];gain.gain.value=volume*spec.gain;panner.pan.value=Math.max(-1,Math.min(1,pan));
    source.connect(gain);gain.connect(panner);panner.connect(buses[bus]);voices++;samplePlays++;
    source.onended=()=>{voices--;source.disconnect();gain.disconnect();panner.disconnect();};source.start();return true;
  }
  function voice(frequency,duration,volume,bus,at,noiseCut=0,pan=0){
    if(voices>=32||volume<=0||!levels[bus])return;
    voices++;
    const gain=context.createGain(),filter=context.createBiquadFilter(),panner=context.createStereoPanner();
    const source=noiseCut?context.createBufferSource():context.createOscillator();
    if(noiseCut){source.buffer=noise;source.loop=true;filter.type='lowpass';filter.frequency.value=noiseCut;}
    else{source.type=bus==='music'?'triangle':'sine';source.frequency.setValueAtTime(frequency,at);filter.frequency.value=3500;}
    gain.gain.setValueAtTime(.0001,at);gain.gain.exponentialRampToValueAtTime(Math.max(.0001,volume),at+.015);gain.gain.exponentialRampToValueAtTime(.0001,at+duration);
    panner.pan.value=Math.max(-1,Math.min(1,pan));source.connect(filter);filter.connect(gain);gain.connect(panner);panner.connect(buses[bus]);
    source.start(at);source.stop(at+duration);source.onended=()=>{voices--;source.disconnect();filter.disconnect();gain.disconnect();panner.disconnect();};
  }
  function schedule(){
    if(!enabled||context.state!=='running')return;
    const now=context.currentTime;if(next<now)next=now+.03;
    const roots=[48,53,55,48,57,53,55,48],melody=[0,4,7,12,9,7,4,2,0,7,9,12,14,12,7,4];
    while(next<now+.3){const root=roots[Math.floor(beat/8)%8],note=root+[0,7,12,7][beat%4];
      voice(440*2**((note-69)/12),1.3,.055,'music',next);
      if(beat%2===0)voice(440*2**((root+12+melody[(beat/2)%16]-69)/12),1.25,.026,'music',next);
      if(beat%8===0)voice(440*2**((root-12-69)/12),3,.04,'music',next);
      next+=.625;beat++;
    }
    if(now>ambientAt){play('wind',.35,0,'ambience');play('bird',.25,Math.sin(beat),'ambience');ambientAt=now+7;}
  }
  async function setEnabled(value){
    const request=++revision;enabled=Boolean(value);clearInterval(timer);
    try{if(enabled){if(!context){context=new (globalThis.AudioContext||globalThis.webkitAudioContext)();
      for(const category of Object.keys(levels)){buses[category]=context.createGain();buses[category].gain.value=levels[category];buses[category].connect(context.destination);}
      noise=context.createBuffer(1,context.sampleRate*2,context.sampleRate);const data=noise.getChannelData(0);let seed=73;for(let i=0;i<data.length;i++){seed=(seed*16807)%2147483647;data[i]=seed/1073741824-1;}
    }await context.resume();if(request!==revision)return enabled;loadSamples();next=context.currentTime+.03;schedule();timer=setInterval(schedule,150);}else if(context)await context.suspend();}catch{if(request===revision){enabled=false;clearInterval(timer);}}return enabled;
  }
  function play(kind,volume=1,pan=0,bus='effects'){
    if(!enabled||!context||context.state!=='running'||!effects[kind])return false;
    if(!(bus in levels)||!Number.isFinite(volume)||!Number.isFinite(pan))return false;
    const now=context.currentTime;if(now-(recent.get(kind)??-20)<(sampleEffects[kind]?.cooldown??(kind==='step'?.2:.12)))return false;recent.set(kind,now);
    const [duration,cut,freq]=effects[kind];volume=Math.max(0,Math.min(1,volume));
    if(recorded(kind,volume,pan,bus))return true;
    if(cut)voice(0,duration,.09*volume,bus,now,cut,pan);
    if(freq)voice(freq,duration,.055*volume,bus,now,0,pan);
    if(['complete','discovery','capture','victory','defeat'].includes(kind))for(let i=1;i<3;i++)voice(freq*(kind==='defeat'?[1,.84,.75][i]:[1,1.25,1.5][i]),duration,.04*volume,bus,now+i*.13,0,pan);
    return true;
  }
  function setVolume(category,value){if(!(category in levels)||!Number.isFinite(value))return;levels[category]=Math.max(0,Math.min(1,value));if(context)buses[category].gain.setTargetAtTime(levels[category],context.currentTime,.05);}
  return {setEnabled,play,setVolume,whenSamplesReady:()=>sampleLoad||Promise.resolve(),get levels(){return {...levels};},get enabled(){return enabled;},get diagnostics(){return {state:context?.state||'locked',voices,beat,samples:samples.size,sampleFailures,samplePlays};}};
}

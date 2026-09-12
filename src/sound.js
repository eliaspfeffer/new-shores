// Original synthesized effects; no downloaded game audio. No audio before opt-in.
export function createSound() {
  let context, enabled=false;
  const recent=new Map();
  async function setEnabled(value) {
    enabled=Boolean(value);
    try {
      if(enabled){context??=new (globalThis.AudioContext||globalThis.webkitAudioContext)();await context.resume();}
      else if(context) await context.suspend();
    } catch { enabled=false; }
    return enabled;
  }
  function play(kind, volume=1) {
    if(!enabled || !context || context.state!=='running')return;
    const now=context.currentTime;
    if(now-(recent.get(kind)??-10)<(kind==='chop'?.3:.16))return;
    recent.set(kind,now);
    const duration=kind==='fall'?.65:kind==='complete'?.35:.09;
    const gain=context.createGain();gain.gain.setValueAtTime(.035*Math.min(1,volume),now);gain.gain.exponentialRampToValueAtTime(.0001,now+duration);gain.connect(context.destination);
    if(['chop','quarry','fall','dig','harvest'].includes(kind)){
      const buffer=context.createBuffer(1,Math.ceil(context.sampleRate*duration),context.sampleRate),data=buffer.getChannelData(0);
      for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1)*(1-i/data.length);
      const source=context.createBufferSource(),filter=context.createBiquadFilter();source.buffer=buffer;filter.type='lowpass';filter.frequency.value=kind==='quarry'?2400:kind==='fall'?450:900;source.connect(filter);filter.connect(gain);source.start();source.onended=()=>{source.disconnect();filter.disconnect();gain.disconnect();};
    } else {
      const oscillator=context.createOscillator();oscillator.type='sine';oscillator.frequency.setValueAtTime(kind==='complete'?660:kind==='survey'?880:190,now);oscillator.frequency.exponentialRampToValueAtTime(kind==='complete'?990:100,now+duration);oscillator.connect(gain);oscillator.start();oscillator.stop(now+duration);oscillator.onended=()=>{oscillator.disconnect();gain.disconnect();};
    }
  }
  return {setEnabled,play,get enabled(){return enabled;}};
}

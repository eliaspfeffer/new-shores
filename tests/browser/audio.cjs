const {chromium}=require('playwright');const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true});try{
for(const mobile of [false,true]){
 const context=await browser.newContext({viewport:mobile?{width:667,height:375}:{width:1400,height:900},hasTouch:mobile,isMobile:mobile}),page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{const Native=window.AudioContext;window.audioContexts=[];window.AudioContext=class extends Native{constructor(...args){super(...args);this.probe=this.createAnalyser();this.probe.connect(this.destination);window.audioContexts.push(this);}createGain(){const n=super.createGain(),connect=n.connect.bind(n);n.connect=(target,...args)=>connect(target===this.destination?this.probe:target,...args);return n;}};});
 await page.goto('http://localhost:4176/'+(mobile?'?mobile=1':''));
 await page.click('#new-game');await page.click('#dismiss-quest');
 await page.click('#pause-button');
 await page.locator('#audio-settings').evaluate(el=>el.open=true);
 await page.locator('#sound-button').scrollIntoViewIfNeeded();await page.click('#sound-button');
 await page.waitForFunction(()=>window.audioContexts[0]?.state==='running');
 await page.waitForFunction(()=>document.querySelector('#audio-sample-status')?.textContent==='10 Aufnahmen bereit · CC0');
 await page.evaluate(()=>{window.recordedAudio=[];const a=window.audioContexts[0],make=a.createBufferSource.bind(a);a.createBufferSource=()=>{const n=make(),start=n.start.bind(n);n.start=(...args)=>{if(n.buffer&&!n.loop)window.recordedAudio.push({duration:n.buffer.duration,peak:Math.max(...n.buffer.getChannelData(0).subarray(0,10000).map(Math.abs))});return start(...args);};return n;};});
 await page.getByLabel('Musik',{exact:true}).fill('0');await page.getByLabel('Natur',{exact:true}).fill('0');
 for(const kind of ['chop','build','anvil','fall','complete']){await page.locator('[data-audio-preview="'+kind+'"]').scrollIntoViewIfNeeded();await page.click('[data-audio-preview="'+kind+'"]');}
 assert.equal(await page.evaluate(()=>window.recordedAudio.length),5,'real decoded recordings, not oscillator fallback');
 const cheerDurations=[await page.evaluate(()=>window.recordedAudio.at(-1).duration)];
 for(let i=0;i<2;i++){const at=await page.evaluate(()=>window.audioContexts[0].currentTime),count=await page.evaluate(()=>window.recordedAudio.length);await page.waitForFunction(t=>window.audioContexts[0].currentTime>=t+3.1,at);await page.click('[data-audio-preview="complete"]');assert.equal(await page.evaluate(()=>window.recordedAudio.length),count+1);cheerDurations.push(await page.evaluate(()=>window.recordedAudio.at(-1).duration));}
 assert.equal(new Set(cheerDurations).size,3,'three different single-call variants rotate');assert(cheerDurations.every(d=>d>.6&&d<1.5),'no full three-call recording');
 await page.click('[data-audio-preview="build"]');
 await page.waitForFunction(()=>{const a=window.audioContexts[0].probe,d=new Float32Array(a.fftSize);a.getFloatTimeDomainData(d);return d.some(v=>Math.abs(v)>.001);});
 await page.getByLabel('Musik',{exact:true}).fill('22');
 assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('new-shores-audio')).music),.22);
 await page.screenshot({path:'/tmp/new-shores-audio-'+(mobile?'mobile':'desktop')+'.png'});
 await page.click('#sound-button');await page.waitForFunction(()=>window.audioContexts[0]?.state==='suspended');
 await page.click('#sound-button');await page.waitForFunction(()=>window.audioContexts[0]?.state==='running');
 assert.equal(await page.evaluate(()=>window.audioContexts.length),1);
 await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));});
 await page.waitForFunction(()=>window.audioContexts[0]?.state==='suspended');
 await page.evaluate(()=>{delete document.hidden;document.dispatchEvent(new Event('visibilitychange'));});
 await page.waitForFunction(()=>window.audioContexts[0]?.state==='running');
 await page.reload();await page.waitForSelector('#game-screen.active');await page.click('#pause-button');
 assert.equal(await page.evaluate(()=>window.audioContexts.length),0,'no autoplay on reload');
 assert.equal(await page.getByLabel('Musik',{exact:true}).inputValue(),'22');
 await page.locator('#audio-settings').evaluate(el=>el.open=true);await page.locator('#sound-button').scrollIntoViewIfNeeded();await page.click('#sound-button');await page.waitForFunction(()=>document.querySelector('#audio-sample-status')?.textContent==='10 Aufnahmen bereit · CC0');
 if(await page.evaluate(()=>Boolean(navigator.serviceWorker))){await page.evaluate(()=>navigator.serviceWorker.ready);await context.setOffline(true);await page.reload();await page.waitForSelector('#game-screen.active');await page.click('#pause-button');await page.locator('#audio-settings').evaluate(el=>el.open=true);await page.locator('#sound-button').scrollIntoViewIfNeeded();await page.click('#sound-button');await page.waitForFunction(()=>document.querySelector('#audio-sample-status')?.textContent==='10 Aufnahmen bereit · CC0');await context.setOffline(false);}
 assert.deepEqual(errors,[]);console.log('PASS audio '+(mobile?'mobile':'desktop')+': ten decoded recordings, five sample previews, signal, volume persistence, mute/resume, one context, reload and offline');await context.close();
}
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});

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
 await page.reload();await page.waitForSelector('#game-screen.active');
 assert.equal(await page.evaluate(()=>window.audioContexts.length),0,'no autoplay on reload');
 assert.equal(await page.getByLabel('Musik',{exact:true}).inputValue(),'22');
 assert.deepEqual(errors,[]);console.log('PASS audio '+(mobile?'mobile':'desktop')+': unlock, volume persistence, mute/resume, single context, safe reload');await context.close();
}
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});

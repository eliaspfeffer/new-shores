const {chromium}=require('playwright');const {randomUUID}=require('node:crypto');const assert=require('node:assert/strict');const cleanup=require('./cleanup-server.cjs');
const origin=process.env.NEW_SHORES_URL||'https://settler.eliaspfeffer.de';
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true}),ids=[];try{
 const desktop=await browser.newContext({viewport:{width:1400,height:900}}),mobile=await browser.newContext({viewport:{width:844,height:390},hasTouch:true,isMobile:true});
 const pc=await desktop.newPage(),phone=await mobile.newPage(),errors=[];for(const p of [pc,phone]){p.on('dialog',d=>d.accept());p.on('pageerror',e=>errors.push(e.message));}
 const email='qa-'+randomUUID()+'@example.invalid',password=randomUUID()+'-test';
 async function auth(p,action){await p.goto(origin+'/?mobile=1');await p.locator('.account-entry').click();await p.locator('#cloud-auth [name=email]').fill(email);await p.locator('#cloud-auth [name=password]').fill(password);await p.locator('#cloud-auth [value='+action+']').click();await p.locator('#cloud-account').waitFor({state:'visible'});}
 async function cloud(p){if(!await p.locator('#pause-modal').isVisible())await p.locator('#pause-button').click();await p.locator('#pause-modal [data-cloud-open]').click();}
 async function handoff(p){await p.locator('#cloud-handoff').click();await p.waitForFunction(()=>document.querySelector('#cloud-feedback').textContent.startsWith('Gesichert und pausiert'));}
 async function load(p){await p.locator('#cloud-refresh').click();try{await Promise.all([p.waitForEvent('domcontentloaded'),p.locator('[data-cloud-island]').click()]);}catch(e){console.log('Load feedback:',await p.locator('#cloud-feedback').textContent());throw e;}await p.waitForFunction(()=>document.querySelector('#game-screen').classList.contains('active'));}
 await auth(pc,'register');ids.push(await pc.evaluate(async()=>(await(await fetch('/api/me')).json()).id));
 // Retried registration with the same credentials reuses the account safely.
 const retried=await pc.evaluate(async credentials=>{const r=await fetch('/api/register',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(credentials)});return {status:r.status,data:await r.json()};},{email,password});assert.equal(retried.status,200);assert.equal(retried.data.id,ids[0]);
 const wrong=await pc.evaluate(async credentials=>{const r=await fetch('/api/register',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(credentials)});return r.status;},{email,password:password+'different'});assert.equal(wrong,409);
 await pc.locator('#cloud-close').click();await pc.locator('#open-new-settlement').click();await pc.locator('#new-player-color').selectOption('red');await pc.locator('#new-game').click();await pc.locator('#game-screen.active').waitFor();await cloud(pc);
 await pc.locator('#cloud-name').fill('QA Gerätewechsel');await pc.locator('#cloud-create').click();await pc.locator('[data-cloud-island]').waitFor();await handoff(pc);
 const original=await pc.evaluate(()=>JSON.parse(localStorage.getItem('new-shores-save')));
 await auth(phone,'login');await load(phone);const loaded=await phone.evaluate(()=>JSON.parse(localStorage.getItem('new-shores-save')));assert.equal(loaded.playerColor,'red');assert.deepEqual(loaded.mapConfig,original.mapConfig);assert.equal(loaded.buildings.length,original.buildings.length);
 await phone.locator('#pause-button').click();await phone.locator('#current-player-color').selectOption('green');await cloud(phone);await handoff(phone);
 // Back on the PC: load newest server revision, not stale local data.
 await load(pc);assert.equal(await pc.evaluate(()=>JSON.parse(localStorage.getItem('new-shores-save')).playerColor),'green');
 await cloud(pc);await pc.screenshot({path:'/tmp/device-transfer-desktop.png'});await phone.screenshot({path:'/tmp/device-transfer-mobile.png'});
 assert.deepEqual(errors,[]);console.log('PASS live HTTPS registration/retry/wrong-password protection, PC → phone → PC with real save state and handoff');
}finally{await browser.close();cleanup(ids);}})().catch(e=>{console.error(e);process.exitCode=1;});

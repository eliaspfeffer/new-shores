const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,channel:'chrome'});
try{
 const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://localhost:5175/?qa=autosave');await page.click('#new-game');await page.click('#dismiss-quest');
 await page.evaluate(()=>{window.__newShores.resources.wood=73;window.__newShores.camera.x=700;});
 await page.waitForFunction(()=>JSON.parse(localStorage.getItem('new-shores-save')||'null')?.resources.wood===73);
 await page.evaluate(()=>window.__newShores.resources.wood=74);
 await page.reload();await page.waitForSelector('#game-screen.active');
 assert.equal(await page.evaluate(()=>window.__newShores.resources.wood),74);
 assert.equal(await page.evaluate(()=>window.__newShores.camera.x),700);
 assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('new-shores-autosave-backup')).resources.wood),73);
 // Reload must not replace the corrupt fixture with a pagehide save. Navigate out first.
 await page.goto('about:blank');
 await page.addInitScript(()=>{if(!sessionStorage.getItem('qa-corrupted')){localStorage.setItem('new-shores-save','broken');sessionStorage.setItem('qa-corrupted','1');}});
 await page.goto('http://localhost:5175/?qa=autosave');await page.waitForSelector('#game-screen.active');
 assert.equal(await page.evaluate(()=>window.__newShores.resources.wood),74);
 assert.deepEqual(errors,[]);
 console.log('PASS: timed autosave, pagehide save, automatic resume, camera, backup rotation and corrupt-save recovery');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});

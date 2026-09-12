const {chromium}=require('playwright');const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,channel:'chrome'});try{
const p=await browser.newPage({viewport:{width:1400,height:900}}),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto('http://localhost:5175/?qa=hospital');await p.click('#new-game');await p.click('#dismiss-quest');
await p.evaluate(()=>{const g=window.__newShores;for(const list of [g.trees,g.rocks])for(let i=list.length-1;i>=0;i--)if(Math.hypot(list[i].x-25,list[i].y-25)<10)list.splice(i,1);g.camera.zoom=1;g.camera.x=750;g.camera.y=-650;});
await p.click('[data-command-tab="build"]');await p.click('[data-category="military"]');await p.click('[data-tool="hospital"]');const before=await p.evaluate(()=>({...window.__newShores.resources}));
await p.locator('#world').click({position:{x:750,y:516}});assert.equal(await p.evaluate(()=>window.__newShores.resources.planks),before.planks-3);assert.equal(await p.evaluate(()=>window.__newShores.resources.stone),before.stone-3);
await p.screenshot({path:'/tmp/new-shores-hospital-foundation.png'});
await p.waitForFunction(()=>window.__newShores.buildings.find(b=>b.type==='hospital')?.progress>.5,null,{timeout:45000});await p.screenshot({path:'/tmp/new-shores-hospital-shell.png'});
await p.waitForFunction(()=>{const g=window.__newShores;return g.workforce.hasStaff(g.buildings.find(b=>b.type==='hospital'));},null,{timeout:20000});
await p.evaluate(()=>{const g=window.__newShores;g.workers.push({id:500,unit:'swordsman',owner:1,x:22.5,y:26.5,hp:70,maxHp:100,phase:'guard',combatStance:'march'},{id:501,unit:'archer',owner:1,x:23.5,y:26.5,hp:70,maxHp:100,phase:'guard',combatStance:'march'});});
await p.click('[data-tool="inspect"]');await p.locator('#world').click({position:{x:750,y:481}});await p.waitForSelector('#hospital-recall:not([hidden])');await p.click('#hospital-recall');
await p.waitForFunction(()=>window.__newShores.workers.find(w=>w.id===501).hp>72,null,{timeout:15000});assert.equal(await p.evaluate(()=>window.__newShores.workers.find(w=>w.id===500).hp),70);
await p.click('#production-toggle');const stoppedHp=await p.evaluate(()=>window.__newShores.workers.find(w=>w.id===501).hp);await p.evaluate(()=>window.__newShores.strategy.tick(2));assert.equal(await p.evaluate(()=>window.__newShores.workers.find(w=>w.id===501).hp),stoppedHp);await p.click('#production-toggle');
await p.waitForFunction(()=>window.__newShores.buildings.find(b=>b.type==='hospital')?.healingActive,null,{timeout:15000});
await p.screenshot({path:'/tmp/new-shores-hospital.png'});await p.click('#pause-button');await p.click('#save-button');await p.reload();await p.waitForSelector('#game-screen.active');await p.click('#speed-button');await p.click('#speed-button');
await p.waitForFunction(()=>window.__newShores.workers.filter(w=>w.id===500||w.id===501).every(w=>w.hp===100&&w.phase==='guard'),null,{timeout:25000});
await p.locator('#world').click({position:{x:750,y:481}});await p.click('#demolish-building');await p.click('#confirm-demolition');assert.equal(await p.evaluate(()=>window.__newShores.buildings.some(b=>b.type==='hospital')),false);assert.equal(await p.evaluate(()=>window.__newShores.workers.some(w=>w.profession==='hospital')),false);
assert.deepEqual(errors,[]);console.log('PASS: hospital placement/cost, actual supplies/construction and healer staffing, recall, serial healing, stopped clinic, save/reload to full healing, demolition and no browser errors');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});

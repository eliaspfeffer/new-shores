const {chromium}=require('playwright');const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,channel:'chrome'});try{
const p=await browser.newPage({viewport:{width:1400,height:900}}),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto('http://localhost:5175/?qa=healing');await p.click('#new-game');await p.click('#dismiss-quest');
await p.evaluate(()=>{const g=window.__newShores;for(const list of [g.trees,g.rocks])for(let i=list.length-1;i>=0;i--)if(Math.hypot(list[i].x-25,list[i].y-25)<10)list.splice(i,1);g.buildings.push({type:'barracks',x:26,y:26,progress:1,completed:true});Object.assign(g.resources,{swords:2,gold:2});g.camera.zoom=1;g.camera.x=750;g.camera.y=-650;});
await p.locator('#world').click({position:{x:750,y:481}});await p.waitForSelector('#barracks-recruitment:not([hidden])');await p.selectOption('#soldier-rank','2');await p.click('[data-recruit="medic"]');
assert.equal(await p.evaluate(()=>window.__newShores.resources.swords),1);assert.equal(await p.evaluate(()=>window.__newShores.resources.gold),1);
await p.evaluate(()=>{const g=window.__newShores,m=g.workers.find(w=>w.unit==='medic');Object.assign(m,{x:23.5,y:23.5,phase:'guard',route:null});g.workers.push({id:400,x:26.5,y:23.5,unit:'swordsman',owner:1,hp:10,maxHp:100,phase:'guard',combatStance:'march'});});
await p.waitForFunction(()=>window.__newShores.workers.find(w=>w.id===400).hp>10,null,{timeout:15000});
await p.click('#pause-button');await p.click('#save-button');await p.reload();await p.waitForSelector('#game-screen.active');
assert.ok(await p.evaluate(()=>window.__newShores.workers.some(w=>w.unit==='medic'&&w.rank===2)));
await p.waitForFunction(()=>window.__newShores.workers.find(w=>w.id===400).hp===75,null,{timeout:40000});
await p.click('[data-command-tab="units"]');await p.evaluate(()=>{const g=window.__newShores;g.selectedWorkers.clear();g.selectedWorkers.add(g.workers.find(w=>w.unit==='medic').id);g.selectedWorkers.add(400);});await p.click('#select-wounded');assert.deepEqual(await p.evaluate(()=>[...window.__newShores.selectedWorkers]),[400]);
await p.screenshot({path:'/tmp/new-shores-healing.png'});assert.deepEqual(errors,[]);console.log('PASS: barracks medic card/rank/cost, real approach, healing resumed after reload, 75% cap, wounded selection and no browser errors');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});

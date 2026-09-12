const {chromium}=require('playwright');const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,channel:'chrome'});try{
const p=await browser.newPage({viewport:{width:1400,height:900}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
await p.goto('http://localhost:5175/?qa=orders-combat');await p.click('#new-game');await p.click('#dismiss-quest');
await p.evaluate(()=>{const g=window.__newShores;for(const list of [g.trees,g.rocks,g.roads])for(let i=list.length-1;i>=0;i--)if(Math.hypot(list[i].x-25,list[i].y-25)<8)list.splice(i,1);g.workers.push({id:200,unit:'swordsman',owner:1,x:22.5,y:23.5,hp:55,phase:'guard',t:0});g.selectedWorkers.clear();g.selectedWorkers.add(200);g.camera.zoom=1;g.camera.x=750;g.camera.y=-650;});
for(const [i,g] of [[0,{x:23,y:23}],[1,{x:24,y:23}],[2,{x:26,y:23}]]){if(i)await p.keyboard.down('Shift');await p.locator('#world').click({button:'right',position:{x:750+(g.x-g.y)*44,y:-650+(g.x+g.y+1)*22}});if(i)await p.keyboard.up('Shift');}
assert.equal(await p.evaluate(()=>window.__newShores.workers.find(w=>w.id===200).waypoints.length),2);
await p.waitForFunction(()=>{const w=window.__newShores.workers.find(w=>w.id===200);return Math.floor(w.x)===26&&w.phase==='guard';},null,{timeout:20000});
await p.evaluate(()=>{const g=window.__newShores;g.workers.push({id:201,unit:'archer',owner:1,x:25.5,y:23.5,hp:55,phase:'guard',t:0},{id:202,unit:'swordsman',owner:2,x:28.5,y:23.5,hp:55,phase:'guard',t:0});});
await p.waitForFunction(()=>window.__newShores.strategy.state.projectiles.length>0);
await p.screenshot({path:'/tmp/new-shores-projectiles.png'});
await p.waitForFunction(()=>window.__newShores.workers.find(w=>w.id===202).hp<55);
assert.deepEqual(errors,[]);console.log('PASS: real Shift-right-click chain, sequential movement, visible projectile flight and delayed damage');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});

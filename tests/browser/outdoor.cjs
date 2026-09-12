// Controlled isolated-world fixture, real simulation/pathfinding/rendering and save/reload.
const {chromium}=require('playwright');const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,channel:'chrome'});try{
 const p=await browser.newPage({viewport:{width:1400,height:900}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto('http://localhost:5175/?qa=outdoor');await p.click('#new-game');await p.click('#dismiss-quest');
 await p.evaluate(()=>{const g=window.__newShores;for(const list of [g.trees,g.rocks,g.roads])for(let i=list.length-1;i>=0;i--)if(Math.hypot(list[i].x-25,list[i].y-25)<10)list.splice(i,1);
 for(let y=18;y<=32;y++)for(let x=18;x<=33;x++)g.terrain[y][x]=x===33?'water':x===32?'shore':'grass';
 for(const [type,x,y] of [['farm',22,23],['forester',26,29],['fisher',31,23]])g.buildings.push({type,x,y,progress:1,completed:true});
 for(let i=0;i<4;i++)g.workers.push({id:100+i,x:25.5,y:26.5,phase:'idle',t:0});g.resources.tools=8;
 g.camera.zoom=1;g.camera.x=760;g.camera.y=-620;
 });
 await p.click('#speed-button');await p.click('#speed-button');
 await p.waitForFunction(()=>window.__newShores.buildings.some(b=>b.type==='farm'&&b.fields?.length),null,{timeout:40000});
 await p.waitForFunction(()=>window.__newShores.workers.some(w=>w.profession==='fisher'&&w.phase==='fieldWork'),null,{timeout:40000});
 await p.waitForFunction(()=>window.__newShores.trees.some(t=>t.age!==undefined),null,{timeout:40000});
 await p.waitForFunction(()=>window.__newShores.resources.grain>0,null,{timeout:60000});
 await p.waitForFunction(()=>window.__newShores.resources.fish>0,null,{timeout:30000});
 await p.screenshot({path:'/tmp/new-shores-outdoor.png'});
 await p.click('#pause-button');await p.click('#save-button');
 const before=await p.evaluate(()=>JSON.parse(localStorage.getItem('new-shores-save')).buildings.find(b=>b.type==='farm').fields.length);
 await p.reload();await p.waitForSelector('#game-screen.active');
 assert.equal(await p.evaluate(()=>window.__newShores.buildings.find(b=>b.type==='farm').fields.length),before);
 assert.deepEqual(errors,[]);console.log('PASS: real outdoor routes, planted trees, field harvest, grain/fish delivery, rendering and save/reload');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});

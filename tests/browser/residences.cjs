const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true});try{for(const mobile of [false,true]){
 const context=await browser.newContext({viewport:mobile?{width:667,height:375}:{width:1400,height:900},hasTouch:mobile,isMobile:mobile}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://localhost:5175/'+(mobile?'?mobile=1':''));await page.click('#new-game');await page.click('#dismiss-quest');
 await page.evaluate(()=>{const g=window.__newShores;g.trees.splice(0);g.rocks.splice(0);g.buildings.splice(1);g.buildings.push({type:'largehouse',name:'Test residence',x:28,y:25,progress:.98},{type:'quarry',x:25,y:28,progress:1,completed:true});g.rocks.push({x:25,y:30,amount:80});g.camera.zoom=1;g.camera.x=innerWidth/2-100;g.camera.y=innerHeight/2-1170;});
 await page.click('#speed-button');await page.click('#speed-button');
 await page.waitForFunction(()=>window.__newShores.buildings[1].progress===1,null,{timeout:30000});
 await page.waitForFunction(()=>window.__newShores.buildings[1].spawnRemaining===0&&window.__newShores.resources.stone>20,null,{timeout:60000});
 const state=await page.evaluate(()=>{const g=window.__newShores;return {people:g.resources.people,beds:g.resources.beds,staff:g.workers.filter(w=>w.employerIndex===2).length,rock:g.rocks[0].amount};});assert.equal(state.people,20);assert.equal(state.beds,24);assert.equal(state.staff,1);assert(state.rock<80);
 await page.screenshot({path:'/tmp/new-shores-residences-'+(mobile?'mobile':'desktop')+'.png'});await page.click('#pause-button');await page.click('#save-button');await page.reload();await page.waitForSelector('#game-screen.active');assert.equal(await page.evaluate(()=>window.__newShores.buildings[1].spawnRemaining),0);assert.deepEqual(errors,[]);await context.close();console.log('PASS residences '+mobile+': construction, 12 visible exits, dedicated quarryman, reduced rock, delivered stone, reload');
}}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});

const {chromium}=require('playwright');const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,channel:'chrome'});try{
 const context=await browser.newContext({viewport:{width:844,height:390},hasTouch:true,isMobile:true,deviceScaleFactor:2});const p=await context.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto(process.env.GAME_URL||'http://localhost:4176/?mobile=1');await p.click('#new-game');
 await p.waitForFunction(()=>document.querySelector('#offline-status').textContent.startsWith('Offline bereit'));
 const click=name=>p.getByRole('button',{name,exact:true}).click();
 assert.equal(await p.locator('#command-sidebar').isVisible(),false);
 await click('Bauen');await click('Grundgebäude');await click('Holzfäller');await p.locator('#thumb-sheet').getByRole('button',{name:'Bauen',exact:true}).click();await click('Bau abbrechen');
 const cdp=await context.newCDPSession(p);const touch=(type,points)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:points});
 const camera=async()=>{await p.click('#pause-button');await p.click('#save-button');const c=await p.evaluate(()=>JSON.parse(localStorage.getItem('new-shores-save')).camera);await p.click('#resume-button');return c;};
 const before=await camera();await touch('touchStart',[{x:400,y:170}]);await touch('touchMove',[{x:460,y:190}]);await touch('touchEnd',[]);assert((await camera()).x>before.x+40);
 const z=(await camera()).zoom;await touch('touchStart',[{x:350,y:160},{x:450,y:160}]);await touch('touchMove',[{x:320,y:160},{x:480,y:160}]);await touch('touchEnd',[]);assert((await camera()).zoom>z);
 await click('Siedler');await click('Siedler finden');await p.locator('#thumb-sheet .thumb-choice').first().click();await click('Markieren');const marking=(await camera()).x;await touch('touchStart',[{x:300,y:130}]);await touch('touchMove',[{x:500,y:240}]);await touch('touchEnd',[]);assert.equal((await camera()).x,marking);
 await p.screenshot({path:'/tmp/new-shores-mobile-map.png'});await p.click('#pause-button');await p.click('#save-button');const saved=await p.evaluate(()=>localStorage.getItem('new-shores-save'));assert(saved);await p.reload();
 await context.setOffline(true);await p.reload();await p.waitForSelector('#game-screen.active');const restored=await p.evaluate(()=>JSON.parse(localStorage.getItem('new-shores-save')));assert.deepEqual(restored.camera,JSON.parse(saved).camera);assert.deepEqual(restored.buildings,JSON.parse(saved).buildings);assert(await p.locator('.thumb-ui').isVisible());
 await p.setViewportSize({width:390,height:844});await p.locator('#rotate-device').waitFor({state:'visible'});await p.setViewportSize({width:667,height:375});await p.locator('#rotate-device').waitFor({state:'hidden'});const l=await p.locator('#thumb-left').boundingBox(),r=await p.locator('#thumb-right').boundingBox();assert(l.x>=0&&r.x+r.width<=667);await p.screenshot({path:'/tmp/new-shores-mobile-small.png'});
 assert.deepEqual(errors,[]);console.log('PASS: thumb menu, placement cancel, native pan/pinch/selection, save/offline reload, portrait gate and safe corners');await context.close();
 const desktop=await browser.newPage({viewport:{width:1400,height:900}});desktop.on('pageerror',e=>errors.push(e.message));await desktop.goto('http://localhost:4176/');await desktop.click('#new-game');assert(await desktop.locator('#command-sidebar').isVisible());assert.equal(await desktop.locator('.thumb-ui').count(),0);await desktop.screenshot({path:'/tmp/new-shores-desktop-after-mobile.png'});assert.deepEqual(errors,[]);console.log('PASS: desktop sidebar retained, no mobile overlay or runtime errors');await desktop.close();
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});

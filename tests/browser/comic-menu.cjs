const {chromium}=require('playwright');const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,channel:'chrome'});try{
 for(const viewport of [{width:894,height:612},{width:844,height:390}]){
  const context=await browser.newContext({viewport,hasTouch:true,isMobile:true});const p=await context.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
  await p.goto('http://localhost:5175/?mobile=1');await p.waitForSelector('#title-screen.active');
  const bounds=await p.locator('.title-card').boundingBox();assert.ok(bounds.x+bounds.width<viewport.width-15,'background outside card is available');
  await p.mouse.move(viewport.width-15,viewport.height/2);await p.mouse.wheel(0,420);
  await p.waitForFunction(()=>document.querySelector('#title-screen').scrollTop>100);
  assert.equal(await p.locator('.title-card').evaluate(e=>e.scrollTop),0,'no nested card scroll');
  await p.locator('#title-screen').evaluate(e=>e.scrollTop=0);
  const cdp=await context.newCDPSession(p),x=viewport.width-15;
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y:viewport.height-60}]});
  for(let i=1;i<=8;i++)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y:viewport.height-60-i*25}]});
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  await p.waitForFunction(()=>document.querySelector('#title-screen').scrollTop>40);
  await p.locator('#title-screen').evaluate(e=>e.scrollTop=0);await p.screenshot({path:'/tmp/comic-title-'+viewport.width+'.png'});
  await p.click('#new-game');await p.waitForSelector('#game-screen.active');await p.waitForFunction(()=>window.__newShores.workers.some(w=>Math.abs(w.x%1-.5)>.05));
  await p.screenshot({path:'/tmp/comic-game-'+viewport.width+'.png'});assert.deepEqual(errors,[]);
  console.log('PASS '+viewport.width+': outer wheel/touch scroll, game start and sub-tile positions');await context.close();
 }
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});

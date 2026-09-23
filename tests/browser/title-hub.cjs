const {chromium}=require('playwright');const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true});try{
 for(const [width,height,mobile] of [[894,612,false],[1400,900,false],[844,390,true],[390,844,true]]){
  const context=await browser.newContext({viewport:{width,height},hasTouch:mobile,isMobile:mobile});const p=await context.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
  await p.goto((process.env.NEW_SHORES_URL||'http://localhost:5176')+'/?mobile='+(mobile?'0':'1'),{waitUntil:'domcontentloaded'});
  await p.locator('.title-hub').waitFor();assert.equal(await p.locator('html').evaluate(e=>e.classList.contains('mobile')),mobile);
  await p.locator('#multiplayer-entry').waitFor();assert.equal(await p.locator('.register-entry').textContent(),'Registrieren');assert.equal(await p.locator('.seo-features img').count(),3);
  assert.ok(await p.locator('.title-hub').evaluate(e=>e.getBoundingClientRect().bottom<=innerHeight+1),'play choices must fit in the first viewport');
  await p.screenshot({path:'/tmp/title-hub-'+width+'.png'});
  await p.locator('#open-new-settlement').click();await p.locator('#new-settlement-dialog').waitFor({state:'visible'});
  if(!mobile)assert.ok(await p.locator('#new-settlement-dialog').evaluate(e=>e.scrollHeight<=e.clientHeight+1),'desktop setup fits');
  await p.screenshot({path:'/tmp/title-setup-'+width+'.png'});
  await p.locator('#new-game').click();await p.locator('#game-screen.active').waitFor();assert.equal(await p.locator('#new-settlement-dialog').isVisible(),false);
  await p.screenshot({path:'/tmp/title-game-'+width+'.png'});assert.deepEqual(errors,[]);console.log('PASS '+width+'×'+height+': automatic mode, no main-menu scroll, setup popup and game');await context.close();
 }
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});

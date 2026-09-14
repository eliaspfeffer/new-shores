const {chromium}=require('playwright');const {randomUUID}=require('node:crypto');const assert=require('node:assert/strict');const cleanup=require('./cleanup-server.cjs');
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true}),ids=[];try{
 for(const mobile of [false,true]){
  const context=await browser.newContext({viewport:mobile?{width:844,height:390}:{width:1400,height:900},hasTouch:mobile,isMobile:mobile});
  const p=await context.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
  await p.goto('https://hermes.tailee79a6.ts.net:9444/?mobile='+(mobile?'1':'0'),{waitUntil:'domcontentloaded'});
  await p.locator('.account-entry').click();await p.locator('#cloud-auth').waitFor({state:'visible'});
  const email='qa-'+randomUUID()+'@example.invalid',password=randomUUID()+'-test';
  await p.locator('[name=email]').fill(email);await p.locator('[name=password]').fill(password);
  await p.locator('#cloud-auth [value=register]').click();await p.locator('#cloud-account').waitFor({state:'visible'});
  const user=await p.evaluate(async()=>await(await fetch('/api/me')).json());assert.equal(user.email,email);ids.push(user.id);
  const cookie=(await context.cookies()).find(c=>c.name==='ns_session');assert.ok(cookie.httpOnly&&cookie.secure);assert.equal(cookie.sameSite,'Strict');
  await p.locator('#cloud-logout').click();await p.locator('#cloud-auth').waitFor({state:'visible'});
  await p.locator('[name=email]').fill(email);await p.locator('[name=password]').fill(password);await p.locator('#cloud-auth [value=login]').click();await p.locator('#cloud-account').waitFor({state:'visible'});
  await p.screenshot({path:'/tmp/new-shores-auth-'+(mobile?'mobile':'desktop')+'.png'});
  await p.locator('#cloud-close').click();await p.locator('#open-new-settlement').click();await p.locator('#new-game').click();await p.locator('#world').waitFor({state:'visible'});
  assert.deepEqual(errors,[]);console.log('PASS '+(mobile?'mobile':'desktop')+': visible account entry, registration, secure session, logout/login and game start');await context.close();
 }
}finally{await browser.close();cleanup(ids);}})().catch(e=>{console.error(e);process.exitCode=1;});

const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
  const browser=await chromium.launch({channel:'chrome',headless:true});
  for(const mobile of [false,true]){
    const context=await browser.newContext({viewport:mobile?{width:667,height:375}:{width:1400,height:900},isMobile:mobile,hasTouch:mobile});
    const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.goto('http://localhost:4176/'+(mobile?'?mobile=1':''));await page.locator('#new-game').click();await page.locator('#dismiss-quest').click();
    const open=async()=>{await page.locator(mobile?'#mobile-controls [data-panel="units"]':'[data-command-tab="units"]').click();};await open();
    await page.locator('[data-recruit="pioneer"]').click();await page.locator('[data-recruit="geologist"]').click();
    assert.equal(await page.locator('#patrol-units').isVisible(),false);
    await page.locator('[data-unit-tab="find"]').click();await page.locator('#unit-search').fill('Pionier');
    assert.equal(await page.locator('[data-find-unit]').count(),1);await page.locator('[data-find-unit]').click();
    await open();await page.locator('[data-unit-tab="orders"]').click();assert.equal(await page.locator('#return-specialists').isEnabled(),true);assert.equal(await page.locator('#survey-nearest').isEnabled(),false);
    await page.locator('[data-unit-tab="find"]').click();await page.locator('#unit-search').fill('Geologe');await page.locator('[data-find-unit]').click();
    await open();await page.locator('[data-unit-tab="orders"]').click();assert.equal(await page.locator('#survey-nearest').isEnabled(),true);
    await page.screenshot({path:'/tmp/new-shores-units-'+(mobile?'mobile':'desktop')+'.png'});
    await page.locator('[data-unit-tab="find"]').click();await page.locator('#unit-search').fill('nicht vorhanden');assert.match(await page.locator('#unit-search-results').innerText(),/Keine passenden/);
    assert.deepEqual(errors,[]);console.log('PASS unit menu '+(mobile?'mobile':'desktop'));await context.close();
  }await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});

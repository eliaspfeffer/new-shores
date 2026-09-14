const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
  const browser=await chromium.launch({channel:'chrome',headless:true});
  try{
    const context=await browser.newContext({viewport:{width:844,height:390},hasTouch:true,isMobile:true});
    const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.goto('http://localhost:4176/?mobile=1');await page.click('#new-game');await page.click('#dismiss-quest');
    await page.waitForSelector('#mobile-controls[data-context="map"]');
    assert.equal(await page.locator('#mobile-controls button:visible').count(),5);
    await page.click('#pause-button');await page.click('#save-button');
    const fixture=await page.evaluate(()=>{
      const s=JSON.parse(localStorage.getItem('new-shores-save'));if(s.camera.zoom!==1.15)throw Error('Wrong initial mobile zoom');
      s.buildings.push({type:'woodcutter',x:27,y:26,progress:1,owner:1,work:0});return JSON.stringify(s);
    });
    await page.addInitScript(s=>{if(!sessionStorage.getItem('reference-fixture')){localStorage.setItem('new-shores-save',s);sessionStorage.setItem('reference-fixture','1');}},fixture);
    await page.reload();await page.waitForSelector('#game-screen.active');await page.click('#mobile-center');
    await page.screenshot({path:'/tmp/new-shores-mobile-reference-map.png'});
    await page.click('#mobile-controls [data-panel="economy"]');
    await page.locator('#economy-report button').last().click();await page.click('#mobile-close');
    await page.waitForSelector('#mobile-controls[data-context="building"]');
    await page.screenshot({path:'/tmp/new-shores-mobile-reference-context.png'});
    await page.click('[data-building-action="production-toggle"]');
    await page.waitForSelector('[data-building-action="production-toggle"][aria-pressed="true"]');
    await page.click('[data-building-action="building-settings"]');assert(await page.locator('#building-settings-dialog').isVisible());await page.click('#close-building-settings');
    await page.click('[data-building-action="demolish-building"]');assert(await page.locator('#demolition-modal').isVisible());await page.click('#cancel-demolition');
    await page.click('[data-building-action="area-toggle"]');assert.equal(await page.locator('#command-sidebar').isVisible(),false);
    await page.click('#mobile-overview');await page.waitForSelector('#mobile-controls[data-context="map"]');
    await page.click('#touch-select');await page.waitForFunction(()=>document.querySelector('#mobile-context-label').textContent==='Siedler markieren');await page.click('#touch-select');
    await page.setViewportSize({width:667,height:320});const box=await page.locator('#mobile-controls').boundingBox();assert(box.x>=58&&box.x+box.width<=609);
    assert.deepEqual(errors,[]);await context.close();
    console.log('PASS: mobile close default, five round overview commands, building context, pause/details/area/demolition, return navigation, marking label and short landscape bounds');
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});

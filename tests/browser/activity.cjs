// Run with Playwright available on NODE_PATH; uses an isolated browser context.
const {chromium}=require('playwright');
const fs=require('node:fs');
const assert=require('node:assert/strict');
(async()=>{
  const browser=await chromium.launch({headless:true,channel:'chrome'});
  try {
    const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.goto('http://localhost:5175/?qa=activity-browser');
    await page.waitForFunction(()=>Boolean(window.__newShores));
    await page.click('#new-game');await page.click('#dismiss-quest');
    await page.click('[data-command-tab="units"]');
    assert.equal(await page.locator('.unit-preview').count(),4);
    await page.click('[data-recruit="geologist"]');await page.click('#survey-nearest');
    await page.click('#speed-button');await page.click('#speed-button');
    await page.waitForFunction(()=>window.__newShores.strategy.state.deposits.some(d=>d.discovered),null,{timeout:60000});
    console.log('PASS: real geologist command, movement and mineral discovery');
    await page.click('#find-geologist');
    fs.mkdirSync('/tmp/new-shores-activity-qa',{recursive:true});
    await page.screenshot({path:'/tmp/new-shores-activity-qa/geologist.png',timeout:15000});
    // Actual construction using the same legal sites that the menu displays.
    await page.click('[data-command-tab="build"]');
    await page.click('[data-category="town"]');await page.click('[data-tool="house"]');
    const target=await page.evaluate(()=>{const g=window.__newShores,c=g.camera;return g.getBuildSites('house').map(s=>({...s,sx:c.x+(s.x-s.y)*44*c.zoom,sy:c.y+(s.x+s.y+1)*22*c.zoom})).filter(s=>s.sx>300&&s.sx<1250&&s.sy>140&&s.sy<700).sort((a,b)=>Math.hypot(a.x-25,a.y-25)-Math.hypot(b.x-25,b.y-25))[0];});
    assert.ok(target,'reachable visible building site exists');
    await page.locator('#world').click({position:{x:target.sx,y:target.sy}});
    await page.click('[data-tool="inspect"]');
    await page.waitForFunction(({x,y})=>window.__newShores.buildings.some(b=>b.x===x&&b.y===y&&b.progress>.18),target,{timeout:60000});
    await page.screenshot({path:'/tmp/new-shores-activity-qa/construction.png',timeout:15000});
    await page.waitForFunction(({x,y})=>window.__newShores.buildings.some(b=>b.x===x&&b.y===y&&b.progress===1),target,{timeout:30000});
    assert.ok(await page.evaluate(()=>window.__newShores.resources.beds>12));
    await page.click('[data-category="basic"]');await page.click('[data-tool="woodcutter"]');
    const logger=await page.evaluate(()=>{const g=window.__newShores,c=g.camera;return g.getBuildSites('woodcutter').map(s=>({...s,sx:c.x+(s.x-s.y)*44*c.zoom,sy:c.y+(s.x+s.y+1)*22*c.zoom})).filter(s=>s.sx>300&&s.sx<1250&&s.sy>140&&s.sy<700).sort((a,b)=>Math.hypot(a.x-25,a.y-25)-Math.hypot(b.x-25,b.y-25))[0];});
    assert.ok(logger);await page.locator('#world').click({position:{x:logger.sx,y:logger.sy}});await page.click('[data-tool="inspect"]');
    await page.waitForFunction(()=>window.__newShores.workers.some(w=>w.phase==='working'&&w.gather?.type==='woodcutter'),null,{timeout:60000});
    await page.screenshot({path:'/tmp/new-shores-activity-qa/woodcutting.png',timeout:15000});
    await page.waitForFunction(()=>window.__newShores.particles.some(p=>p.kind==='fall'),null,{timeout:30000});
    console.log('PASS: real woodcutter job and tree-fall event');
    await page.click('[data-category="metal"]');await page.click('[data-tool="coalmine"]');
    const mineSite=await page.evaluate(()=>{const g=window.__newShores,c=g.camera;return g.getBuildSites('coalmine').map(s=>({...s,sx:c.x+(s.x-s.y)*44*c.zoom,sy:c.y+(s.x+s.y+1)*22*c.zoom})).find(s=>s.sx>300&&s.sx<1250&&s.sy>140&&s.sy<700);});
    assert.ok(mineSite,'discovered deposit has a genuinely buildable mine site');
    await page.locator('#world').click({position:{x:mineSite.sx,y:mineSite.sy}});await page.click('[data-tool="inspect"]');
    await page.waitForFunction(()=>window.__newShores.buildings.some(b=>b.type==='coalmine'&&b.progress===1),null,{timeout:60000});
    await page.waitForFunction(()=>window.__newShores.workers.some(w=>w.profession==='coalmine'&&w.phase==='staffWork'),null,{timeout:60000});
    await page.click('[data-command-tab="economy"]');
    await page.waitForFunction(()=>document.querySelector('#economy-report').innerText.includes('Brot'),null,{timeout:5000});
    console.log('PASS: discovery unlocks legal mine placement, construction, staffing and missing-food feedback');
    await page.click('#pause-button');await page.click('#save-button');
    const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('new-shores-save')));
    assert.ok(saved.strategy.deposits.some(d=>d.discovered));assert.ok(saved.workers.find(w=>w.unit==='geologist').surveyQueue);
    await page.click('#sound-button');assert.equal(await page.locator('#sound-button').getAttribute('aria-pressed'),'true');
    await page.click('#sound-button');assert.equal(await page.locator('#sound-button').getAttribute('aria-pressed'),'false');
    await page.reload();await page.waitForFunction(()=>Boolean(window.__newShores));await page.click('#continue-game');
    assert.ok(await page.evaluate(()=>window.__newShores.strategy.state.deposits.some(d=>d.discovered)));
    assert.deepEqual(errors,[]);
    console.log('PASS: material deliveries, staged construction, housing, survey save/reload, audio opt-in/out, zero page errors');
  } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});

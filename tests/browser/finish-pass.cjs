const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true});try{
for(const mobile of [false,true]){
 const context=await browser.newContext({viewport:mobile?{width:844,height:390}:{width:1400,height:900},hasTouch:mobile,isMobile:mobile});const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://localhost:5176/?mobile='+(mobile?1:0));
 if(process.env.NEW_SHORES_SAVE){await page.locator('#open-new-settlement').click();await page.locator('[data-auth-choice="skip"]').click();await page.locator('#new-game').click();await page.locator('#pause-button').click();await page.locator('#open-pause-saves').click();await page.locator('#title-import-save').setInputFiles(process.env.NEW_SHORES_SAVE);await page.locator('#game-screen.active').waitFor();await page.locator('#resume-button').click();}
 else{await page.locator('#open-new-settlement').click();await page.locator('#new-game').click();}
 await page.waitForFunction(()=>window.__newShores?.buildings.length>0);
 if(await page.locator('#quest-panel').isVisible())await page.locator('#dismiss-quest').click();
 const counts=await page.evaluate(()=>({buildings:__newShores.buildings.length,workers:__newShores.workers.length,deposits:__newShores.strategy.state.deposits.length}));
 if(process.env.NEW_SHORES_SAVE){const original=JSON.parse(fs.readFileSync(process.env.NEW_SHORES_SAVE,'utf8'));assert.equal(counts.buildings,original.buildings.length);assert.equal(counts.workers,original.workers.length);assert.ok(counts.deposits>original.strategy.deposits.length);}
 // Use the existing economic overview's real inspection handler.
 const inspect=async type=>{await page.evaluate(type=>{document.querySelector('[data-command-tab="economy"]').click();const i=__newShores.buildings.findIndex(b=>b.type===type&&(b.owner||1)===1);document.querySelector('[data-building-index="'+i+'"]').click();document.querySelector('#building-settings').click();},type);await page.locator('#building-settings-dialog').waitFor({state:'visible'});};
 await inspect('woodcutter');const menu=page.locator('#building-settings-dialog');await menu.getByRole('button',{name:/Priorität:/}).click();assert.equal(await menu.getByRole('button',{name:'Priorität: hoch',exact:true}).getAttribute('aria-pressed'),'true');await menu.getByRole('button',{name:'Waren herstellen',exact:true}).click();await menu.getByRole('button',{name:'+5',exact:true}).click();await menu.getByRole('button',{name:'Auftrag bestätigen',exact:true}).click();assert.equal(await page.evaluate(()=>__newShores.buildings.find(b=>b.type==='woodcutter').productionRemaining),15);
 await page.screenshot({path:'/tmp/new-shores-finished-menu-'+(mobile?'mobile':'desktop')+'.png'});await menu.getByRole('button',{name:'Gebäudemenü schließen',exact:true}).click();
 await inspect('tower');await page.evaluate(()=>{const b=__newShores.buildings.find(b=>b.type==='tower'&&(b.owner||1)===1);b.garrison=__newShores.strategy.towerCapacity;});await page.waitForTimeout(500);assert.ok(await menu.getByRole('button',{name:'Soldaten hinein',exact:true}).isDisabled());await menu.getByRole('button',{name:'Gebäudemenü schließen',exact:true}).click();
 await page.evaluate(()=>{for(const w of __newShores.workers.filter(w=>w.unit==='swordsman'&&!w.dead).slice(0,3))__newShores.selectedWorkers.add(w.id);});await page.waitForTimeout(500);
 await page.locator(mobile?'.thumb-selection':'.selected-unit-bar').waitFor({state:'visible',timeout:5000}).catch(async e=>{console.log(await page.evaluate(()=>{let n=document.querySelector('.selected-unit-bar'),a=[];while(n){const s=getComputedStyle(n);a.push([n.tagName,n.id,n.className,s.display,s.visibility,n.getBoundingClientRect().toJSON()]);n=n.parentElement;}return a;}));throw e;});await page.screenshot({path:'/tmp/new-shores-finished-world-'+(mobile?'mobile':'desktop')+'.png'});
 assert.deepEqual(errors,[]);console.log('PASS '+(mobile?'mobile':'desktop')+' JSON import, building popups, quantity, priority, tower capacity, selected portraits; '+JSON.stringify(counts));await context.close();
}
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});

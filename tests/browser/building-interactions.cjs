const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true});try{
for(const mobile of [false,true]){
 const page=await browser.newPage({viewport:mobile?{width:844,height:390}:{width:1400,height:900},hasTouch:mobile,isMobile:mobile}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://localhost:5176/?mobile='+(mobile?1:0));
 await page.locator('#open-title-saves').click();await page.locator('#title-import-save').setInputFiles('/Users/eliaspfeffer/Downloads/new-shores-spielstand 2.json');await page.locator('#resume-button').click();
 if(await page.locator('#dismiss-quest').isVisible())await page.locator('#dismiss-quest').click();
 const clickBuilding=async type=>{const p=await page.evaluate(type=>{const b=__newShores.buildings.find(b=>b.type===type&&(b.owner||1)===1),c=__newShores.camera;c.zoom=1;c.x=innerWidth*.6-(b.x-b.y)*44;c.y=innerHeight*.65-(b.x+b.y+1)*22;return{x:innerWidth*.6,y:innerHeight*.65-35};},type);await page.mouse.click(p.x,p.y);};
 await clickBuilding('woodcutter');const menu=page.locator('#building-settings-dialog');await menu.waitFor({state:'visible'});await page.mouse.click(3,3);await menu.waitFor({state:'hidden'});
 await clickBuilding('tower');await page.locator('#tower-quick-actions').waitFor({state:'visible'});assert.equal(await menu.isVisible(),false);
 assert.match(await page.locator('#building-map-card p').innerText(),/\d+ \/ \d+ Soldaten/);
 await page.screenshot({path:'/tmp/tower-bubble-'+mobile+'.png'});
 await page.locator('#tower-quick-actions [aria-label="Soldaten heraus"]').click();await page.waitForTimeout(350);assert.equal(await page.locator('#tower-quick-actions [aria-label="Soldaten heraus"]').isDisabled(),true);
 await page.locator('#close-building-card').click();
 await page.locator('#pause-button').click();await page.locator('#pause-modal').getByRole('button',{name:'Spielstände',exact:true}).click();
 while(!await page.locator('#open-pause-saves').isVisible())await page.locator('#pause-modal').getByRole('button',{name:'Weitere →',exact:true}).click();
 await page.locator('#open-pause-saves').click();await page.screenshot({path:'/tmp/friendly-saves-'+mobile+'.png'});assert.deepEqual(errors,[]);
 console.log('PASS direct building click, backdrop dismissal, tower bubble and save library '+mobile);await page.close();
}
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});

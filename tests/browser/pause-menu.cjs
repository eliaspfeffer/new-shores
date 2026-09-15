const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
  const browser=await chromium.launch({channel:'chrome',headless:true});
  try{for(const [width,height,mobile] of [[542,612,0],[1400,900,0],[844,390,1]]){
    const page=await browser.newPage({viewport:{width,height}}),errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.goto((process.env.NEW_SHORES_URL||'http://localhost:5176')+'/?mobile='+mobile);
    await page.locator('#open-new-settlement').click();await page.locator('#new-game').click();
    await page.locator('#pause-button').click();
    const menu=page.locator('#pause-modal');
    async function fits(){
      const result=await menu.evaluate(el=>{const card=el.querySelector('.modal-card'),r=card.getBoundingClientRect();return {fits:r.top>=0&&r.bottom<=innerHeight&&r.left>=0&&r.right<=innerWidth,overflow:card.scrollHeight>card.clientHeight+2};});
      assert.deepEqual(result,{fits:true,overflow:false},`${width}×${height}: ${await menu.innerText()}`);
    }
    await fits();await page.screenshot({path:`/tmp/pause-${width}.png`});
    for(const category of ['Einstellungen','Spielstände','Spiel & Hilfe']){
      await menu.getByRole('button',{name:category,exact:true}).click();
      do{await fits();if(!await menu.getByRole('button',{name:'Weitere →',exact:true}).count())break;await menu.getByRole('button',{name:'Weitere →',exact:true}).click();}while(true);
      await menu.getByRole('button',{name:'← Zurück',exact:true}).click();
    }
    await menu.getByRole('button',{name:'Einstellungen',exact:true}).click();
    await menu.getByRole('button',{name:'Musik & Geräusche',exact:true}).click();await fits();
    await page.keyboard.press('Escape');await menu.getByRole('button',{name:'Einstellungen',exact:true}).click();
    await menu.getByRole('button',{name:'Hörproben',exact:true}).click();await fits();
    await page.keyboard.press('Escape');await menu.getByRole('button',{name:'Einstellungen',exact:true}).click();
    await menu.getByRole('button',{name:'Weitere →',exact:true}).click();await menu.getByRole('button',{name:'Spielregeln',exact:true}).click();await fits();
    await page.keyboard.press('Escape');await menu.getByRole('button',{name:'Spielstände',exact:true}).click();
    await menu.locator('#save-button').click();assert.ok(await page.evaluate(()=>localStorage.getItem('new-shores-save')));
    await page.keyboard.press('Escape');await menu.locator('#resume-button').click();await menu.waitFor({state:'hidden'});
    assert.deepEqual(errors,[]);await page.close();console.log(`Pause menu ${width}×${height}: passed`);
  }}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});

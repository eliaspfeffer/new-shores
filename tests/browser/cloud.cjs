const {chromium}=require('playwright');
const {randomUUID}=require('node:crypto');
const assert=require('node:assert/strict');
const {execFileSync}=require('node:child_process');
const origin=process.env.NEW_SHORES_URL||'https://hermes.tailee79a6.ts.net:9444';
(async()=>{
  const browser=await chromium.launch({channel:'chrome',headless:true}),testIds=[];
  try{for(const mobile of [false,true]){
    const email='qa-'+randomUUID()+'@example.invalid',password=randomUUID()+'-test';
    const options={viewport:mobile?{width:667,height:375}:{width:1400,height:900},hasTouch:mobile,isMobile:mobile};
    const first=await browser.newContext(options),page=await first.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept());
    await page.goto(origin+'/?mobile='+(mobile?'1':'0'));await page.locator('#title-screen [data-cloud-open]').click();
    await page.locator('#cloud-auth [name=email]').fill(email);await page.locator('#cloud-auth [name=password]').fill(password);await page.locator('#cloud-auth [value=register]').click();await page.locator('#cloud-account').waitFor({state:'visible'});
    const me=await page.evaluate(async()=>await(await fetch('/api/me')).json());testIds.push(me.id);
    await page.locator('#cloud-close').click();await page.locator('#new-game').click();await page.locator('#dismiss-quest').click();await page.locator('#pause-button').click();await page.locator('#pause-modal [data-cloud-open]').click();
    await page.locator('#cloud-name').fill('QA Island');await page.locator('#cloud-create').click();await page.locator('[data-cloud-island]').waitFor();
    await page.locator('#cloud-sync').click();await page.waitForFunction(()=>document.querySelector('#cloud-feedback').textContent.startsWith('Synchronisiert'));
    const source=await page.evaluate(()=>JSON.parse(localStorage.getItem('new-shores-save')));
    const second=await browser.newContext(options),phone=await second.newPage();phone.on('dialog',d=>d.accept());phone.on('pageerror',e=>errors.push(e.message));
    await phone.goto(origin+'/?mobile='+(mobile?'1':'0'));await phone.locator('#title-screen [data-cloud-open]').click();await phone.locator('#cloud-auth [name=email]').fill(email);await phone.locator('#cloud-auth [name=password]').fill(password);await phone.locator('#cloud-auth [value=login]').click();await phone.locator('[data-cloud-island]').click();
    await phone.waitForFunction(()=>localStorage.getItem('new-shores-cloud-binding')&&document.querySelector('#game-screen').classList.contains('active'));
    const loaded=await phone.evaluate(()=>JSON.parse(localStorage.getItem('new-shores-save')));assert.equal(loaded.buildings.length,source.buildings.length);assert.deepEqual(loaded.mapConfig,source.mapConfig);
    await phone.locator('#pause-button').click();await phone.locator('#pause-modal [data-cloud-open]').click();await phone.locator('#cloud-sync').click();await phone.waitForFunction(()=>document.querySelector('#cloud-feedback').textContent.startsWith('Synchronisiert'));
    await phone.screenshot({path:'/tmp/new-shores-cloud-'+(mobile?'mobile':'desktop')+'.png'});
    await page.locator('#cloud-sync').click();await page.waitForFunction(()=>/anderen Gerät geändert|Versionskonflikt/.test(document.querySelector('#cloud-feedback').textContent));
    await phone.locator('#cloud-close').click();await phone.waitForFunction(()=>document.querySelector('#offline-status')?.textContent.startsWith('Offline bereit'),{timeout:60000});
    await second.setOffline(true);await phone.reload();await phone.waitForFunction(()=>document.querySelector('#game-screen').classList.contains('active'));assert.equal(await phone.locator('#world').isVisible(),true);
    assert.deepEqual(errors,[]);console.log('PASS cloud '+(mobile?'mobile':'desktop')+': registration/login, save, device transfer, sync, conflict protection, offline reload');await first.close();await second.close();
  }}finally{
    await browser.close();
    if(testIds.length){const script=`import pg from '/opt/new-shores/node_modules/pg/lib/index.js';const pool=new pg.Pool({connectionString:process.env.DATABASE_URL});const ids=${JSON.stringify(testIds)};const c=await pool.connect();try{await c.query('BEGIN');for(const id of ids){const p=(await c.query('SELECT email FROM players WHERE id=$1',[id])).rows[0];if(!p?.email.startsWith('qa-')||!p.email.endsWith('@example.invalid'))throw Error('Refuse non-test cleanup');await c.query('DELETE FROM island_members WHERE player_id=$1 OR island_id IN (SELECT id FROM islands WHERE owner_id=$1)',[id]);await c.query('DELETE FROM invitations WHERE island_id IN (SELECT id FROM islands WHERE owner_id=$1)',[id]);await c.query('DELETE FROM island_history WHERE island_id IN (SELECT id FROM islands WHERE owner_id=$1)',[id]);await c.query('DELETE FROM islands WHERE owner_id=$1',[id]);await c.query('DELETE FROM sessions WHERE player_id=$1',[id]);await c.query('DELETE FROM players WHERE id=$1',[id]);}await c.query('COMMIT');console.log('Removed only the temporary QA accounts and islands.');}catch(e){await c.query('ROLLBACK');throw e;}finally{c.release();await pool.end();}`;
      console.log(execFileSync('ssh',['openclaw','node --env-file=/etc/new-shores.env --input-type=module'],{input:script,encoding:'utf8'}));}
  }
})().catch(e=>{console.error(e);process.exit(1)});

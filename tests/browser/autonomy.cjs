// Isolated browser; exercise actual pathfinding and simulation, not instant mocked routes.
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
  const browser=await chromium.launch({headless:true,channel:'chrome'});
  try{
    const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.goto('http://localhost:5175/?qa=autonomy');
    await page.click('#new-game');await page.click('#dismiss-quest');
    await page.click('[data-command-tab="units"]');await page.click('[data-recruit="pioneer"]');
    const issued=await page.evaluate(()=>{
      const g=window.__newShores;
      for(let y=15;y<36;y++)for(let x=15;x<40;x++)if(g.terrain[y][x]==='grass'&&g.strategy.ownerAt(x,y)===0&&[[1,0],[-1,0],[0,1],[0,-1]].some(([dx,dy])=>g.strategy.ownerAt(x+dx,y+dy)===1))if(g.strategy.command({x,y}))return true;
      return false;
    });assert.ok(issued);
    await page.click('#speed-button');await page.click('#speed-button');
    await page.waitForFunction(()=>window.__newShores.strategy.state.claims.length>=3,null,{timeout:60000});
    await page.click('#halt-units');
    assert.equal(await page.evaluate(()=>window.__newShores.workers.find(w=>w.unit==='pioneer').autoWork),false);
    await page.click('#return-specialists');
    assert.equal(await page.evaluate(()=>window.__newShores.workers.some(w=>w.unit==='pioneer')),false);
    await page.click('[data-recruit="pioneer"]');
    assert.equal(await page.evaluate(()=>window.__newShores.workers.find(w=>w.unit==='pioneer').workArea),undefined);
    assert.deepEqual(errors,[]);
    console.log('PASS: single pioneer order, actual pathfinding, three autonomous claims, halt, return and clean re-recruitment');
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});

const {chromium}=require('playwright');
const {execFileSync}=require('node:child_process');
const fs=require('node:fs');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 try{
  const results=[];
  for(const version of ['before','after']){
   const source=version==='before'?execFileSync('git',['show','f4416bf:src/main.js'],{encoding:'utf8'}):fs.readFileSync('src/main.js','utf8');
   const context=await browser.newContext({viewport:{width:844,height:390},isMobile:true,hasTouch:true});
   const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.route('**/src/main.js*',route=>route.fulfill({contentType:'text/javascript',body:source.replaceAll('import.meta.env.DEV','true')+'\nglobalThis.__renderQA=render;globalThis.__pauseQA=()=>{paused=true;};'}));
   await page.goto('http://localhost:5175/?mobile=1');await page.click('#new-game');await page.click('#dismiss-quest');
   await page.waitForFunction(()=>performance.getEntriesByType('resource').some(e=>e.name.includes('nature-reference-v2')));
   await page.evaluate(()=>{__pauseQA();const g=__newShores;for(let id=g.workers.length;id<200;id++)g.workers.push({id,x:24+(id%8)*.2,y:25+Math.floor(id/8)*.1,phase:'idle',role:'carrier',t:0});});
   for(const zoom of [.5,1.15]){
    const result=await page.evaluate(zoom=>{
     const g=__newShores;g.camera.zoom=zoom;g.camera.x=innerWidth/2;g.camera.y=innerHeight/2-51*22*zoom;
     for(let i=0;i<8;i++)__renderQA();
     const times=[];let atlasReads=0,draws=0;const original=CanvasRenderingContext2D.prototype.drawImage;
     CanvasRenderingContext2D.prototype.drawImage=function(image,...args){draws++;if(image?.src?.includes('nature-reference'))atlasReads++;return original.call(this,image,...args);};
     try{for(let i=0;i<40;i++){const start=performance.now();__renderQA();times.push(performance.now()-start);}}finally{CanvasRenderingContext2D.prototype.drawImage=original;}
     times.sort((a,b)=>a-b);return {zoom,medianMs:times[20],p95Ms:times[38],atlasReads,draws,workers:g.workers.length};
    },zoom);
    results.push({version,...result});
    if(version==='after'){assert.equal(result.atlasReads,0,'steady-state nature rendering reuses bounded mipmaps');await page.screenshot({path:'/tmp/new-shores-zoom-'+zoom+'.png'});}
   }
   assert.deepEqual(errors,[]);await context.close();
  }
  console.log(JSON.stringify(results,null,2));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});

const {chromium}=require('playwright');const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,channel:'chrome'});try{
 for(const mobile of [false,true]){
  const context=await browser.newContext({viewport:mobile?{width:844,height:390}:{width:1400,height:900},hasTouch:mobile,isMobile:mobile});
  const p=await context.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
  const url='http://localhost:5175/?qa=reload-work'+(mobile?'&mobile=1':'');await p.goto(url);await p.click('#new-game');await p.click('#pause-button');await p.click('#save-button');
  const fixture=await p.evaluate(()=>{
   const s=JSON.parse(localStorage.getItem('new-shores-save'));
   s.terrain=Array.from({length:50},()=>Array(50).fill('grass'));s.trees=[{x:9,y:14,v:.3},{x:14,y:10,v:.5},{x:15,y:10,v:.4}];s.rocks=[{x:16,y:10,amount:5}];s.roads=[];s.details=[];
   s.strategy.claims=[];s.strategy.deposits=[];s.strategy.projectiles=[];s.strategy.groundPiles=[];s.strategy.enemyRaids=false;
   s.buildings=[{type:'storehouse',x:5,y:10,progress:1},{type:'woodcutter',x:8,y:12,progress:1,workerId:2},{type:'house',x:10,y:12,progress:.2,materials:{planks:2},buffer:{planks:0},materialsSpent:true},{type:'sawmill',x:12,y:12,progress:1,workerId:3,buffer:{wood:2},work:1}];
   s.workers=[
    {id:0,role:'carrier',phase:'inbound',x:8.5,y:10.5,t:2,carry:'wood',carryAmount:2,taskIndex:-1,route:[{x:7.5,y:10.5},{x:6.5,y:11.5},{x:5.5,y:11.5}],routeIndex:0},
    {id:1,role:'builder',phase:'working',x:10.5,y:13.5,t:2,wait:0,taskIndex:2},
    {id:2,role:'woodcutter',profession:'woodcutter',phase:'fieldWork',employerIndex:1,workTool:'axe',x:9.5,y:13.5,t:2,outdoorJob:{x:9,y:14,kind:'chop'},outdoorTime:4,taskIndex:-1},
    {id:3,role:'sawmill',profession:'sawmill',phase:'staffWork',employerIndex:3,workTool:'saw',inside:true,x:12.55,y:12.65,t:2,taskIndex:-1},
    {id:4,role:'carrier',phase:'idle',x:6.5,y:11.5,t:2,taskIndex:-1},
    {id:5,role:'pioneer',unit:'pioneer',specialTool:'shovel',phase:'command',x:13.5,y:10.5,t:2,taskIndex:-1,owner:1,autoWork:true,workArea:{x:15,y:10,radius:5},workSite:{x:14,y:10},order:{x:14,y:10,building:-1},route:[{x:14.5,y:10.5}],routeIndex:0,wait:0}
   ];s.resources.people=6;s.resources.beds=20;s.camera={x:700,y:-350,zoom:1};s.ecoMode=false;
   return JSON.stringify(s);
  });
  await p.goto('about:blank');await p.addInitScript(f=>{if(!sessionStorage.getItem('reload-work-fixture')){localStorage.setItem('new-shores-save',f);sessionStorage.setItem('reload-work-fixture','yes');}},fixture);
  await p.goto(url);await p.waitForSelector('#game-screen.active');
  await p.waitForFunction(()=>__newShores.workers[0].x<8.4&&__newShores.buildings[2].progress>.2);
  await p.reload();await p.waitForSelector('#game-screen.active');
  const before=await p.evaluate(()=>({wood:__newShores.resources.wood,t:__newShores.workers[0].t,progress:__newShores.buildings[2].progress,outdoor:__newShores.workers[2].outdoorTime,claim:__newShores.workers[5].claimsMade||0}));
  await p.waitForFunction(b=>__newShores.workers[0].t>b.t&&__newShores.buildings[2].progress>b.progress&&(__newShores.workers[2].outdoorTime>b.outdoor||__newShores.workers[2].phase==='fieldReturn'),before,{timeout:10000});
  await p.waitForFunction(()=>__newShores.workers[0].carry===null&&__newShores.buildings[2].progress===1&&(__newShores.workers[5].claimsMade||0)>0,null,{timeout:25000});
  assert.deepEqual(errors,[]);await p.screenshot({path:'/tmp/new-shores-reload-work-'+(mobile?'mobile':'desktop')+'.png'});console.log('PASS '+(mobile?'mobile':'desktop')+': real reload continues cargo, construction, outdoor work and pioneer orders');await context.close();
 }
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});

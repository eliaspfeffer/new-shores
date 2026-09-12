import {parseSave} from './savegames.js';
import {constructionStage,workActivity} from './activity.js';
import {createSound} from './sound.js';
import {createWorkforce} from './workforce.js';
import {createExploration} from './exploration.js';
import {goodsOrder,goodsNames,buildingNames,hasVisibleCargo,cargoPose,createGoodsArt} from './goods.js';
import {findPath, keyOf, roadStage, walkSpeed} from './navigation.js';
import {createStrategy, recipes, extraBuildings, facing8} from './strategy.js';
import {wheelAction,demolitionRefund} from './interaction.js';
const directionAtlas=new Image();directionAtlas.src=new URL('../assets/workers-directions-v1.png',import.meta.url).href;
const industryAtlas=new Image();industryAtlas.src=new URL('../assets/industry-strategy-v1.png',import.meta.url).href;
const specialistAtlas=new Image();specialistAtlas.src=new URL('../assets/specialists-directions-v1.png',import.meta.url).href;
const canvas = document.querySelector('#world');
const ctx = canvas.getContext('2d');
const grassTexture=new Image();grassTexture.src=new URL('../assets/grass-reference-v2.png',import.meta.url).href;
const natureAtlas=new Image();natureAtlas.src=new URL('../assets/nature-reference-v2.png',import.meta.url).href;
const waterTexture=new Image();waterTexture.src=new URL('../assets/water-reference-v2.png',import.meta.url).href;
let grassPattern=null,waterPattern=null,groundCacheKey='',terrainRevision=0;
const groundCache=document.createElement('canvas');
grassTexture.onload=()=>{grassPattern=ctx.createPattern(grassTexture,'repeat');groundCacheKey='';};
waterTexture.onload=()=>{waterPattern=ctx.createPattern(waterTexture,'repeat');groundCacheKey='';};
const spriteAtlas = new Image();
spriteAtlas.src = new URL('../assets/island-sprites-runtime.png', import.meta.url).href;
const terrainAtlas = new Image();
terrainAtlas.src = new URL('../assets/terrain-atlas-runtime.png', import.meta.url).href;
const workerAtlas = new Image();
workerAtlas.src = new URL('../assets/workers-atlas-runtime.png', import.meta.url).href;
const economyAtlas = new Image();
economyAtlas.src = new URL('../assets/economy-buildings-runtime.png', import.meta.url).href;
const coastAtlas = new Image();
coastAtlas.src = new URL('../assets/coast-details-runtime.png', import.meta.url).href;
const title = document.querySelector('#title-screen');
const game = document.querySelector('#game-screen');
const minimap = document.querySelector('#minimap');
const miniCtx = minimap.getContext('2d');
const TILE_W=88,TILE_H=44, MAP_W=50,MAP_H=50;
let dpr=1, camera={x:0,y:0,zoom:1}, drag=null, selectedTool='inspect', hovered=null, paused=false, speed=1, last=0, autosave=0, renderCount=0, ecoMode=true;
let resources={wood:24,stone:20,food:18,people:8,beds:12,planks:24,grain:0,flour:0,tools:4};
let productionClock=0, hungerClock=0, elapsed=0;
let priorityOrder=['food','wood','stone','grain','planks','flour'];
const terrain=[], buildings=[], roads=[], particles=[], workers=[];
const exploration=createExploration(MAP_W,MAP_H);
const goodsArt=createGoodsArt(new URL('../assets/goods-atlas-keyed-v3.png',import.meta.url).href,url=>{document.documentElement.style.setProperty('--goods-atlas',`url("${url}")`);});
const trees=[], rocks=[], details=[];
const traffic=new Map(), trailEdges=new Map(), trafficLastUsed=new Map();
const controlGroups={};
const unitNames={carrier:'Träger',builder:'Bauarbeiter',pioneer:'Pionier',geologist:'Geologe',swordsman:'Schwertkämpfer',archer:'Bogenschütze'};
const sound=createSound();
function audibleEvent(kind,point){if(paused||document.hidden||!active||!exploration.sees(point.x,point.y))return;const p=iso(point.x,point.y);if(p.x>240&&p.x<innerWidth&&p.y>0&&p.y<innerHeight)sound.play(kind);}
let active=false, inspectedWorker=null, inspectedBuilding=null, settingArea=false,commandMode=false;let demolitionTarget=null,demolitionWasPaused=false;
const pointers=new Map(), selectedWorkers=new Set(); let pinch=null, selectionBox=null;
function obstacles(){return new Set([...trees,...rocks,...buildings].map(o=>keyOf(o.x,o.y)))}
function routeTo(w,target){return findPath(w,target,terrain,obstacles(),traffic)}
function entrance(b){const blocked=obstacles();return [{x:b.x+.5,y:b.y+1.5},{x:b.x+1.5,y:b.y+.5},{x:b.x-.5,y:b.y+.5},{x:b.x+.5,y:b.y-.5}].find(p=>['grass','shore'].includes(terrain[Math.floor(p.y)]?.[Math.floor(p.x)])&&!blocked.has(keyOf(Math.floor(p.x),Math.floor(p.y))))}
function recordWalk(w,x,y){if(w.role!=='carrier'||!['outbound','inbound','supply'].includes(w.phase))return;const k=keyOf(Math.floor(x),Math.floor(y)),prev=w.lastTile;w.lastTile=k;if(w.gather||w.task?.progress<1)return;if(!prev||prev===k||terrain[Math.floor(y)]?.[Math.floor(x)]!=='grass')return;traffic.set(k,Math.min(60,(traffic.get(k)||0)+1));trafficLastUsed.set(k,elapsed);const edge=[prev,k].sort().join('|');trailEdges.set(edge,Math.min(60,(trailEdges.get(edge)||0)+1));}
function drawTrail(x,y){const k=keyOf(x,y),n=traffic.get(k)||0;if(n<3)return;const p=iso(x+.5,y+.5);ctx.save();ctx.lineCap='round';for(const [dx,dy] of [[1,0],[0,1],[1,1],[-1,1]]){const nk=keyOf(x+dx,y+dy),v=trailEdges.get([k,nk].sort().join('|'))||0;if(v<3)continue;const q=iso(x+dx+.5,y+dy+.5);ctx.globalAlpha=Math.min(.8,v/18);ctx.lineWidth=(roadStage(n)===2?12:8)*camera.zoom;ctx.strokeStyle=roadStage(n)===2?'#a49a7f':'#b59965';ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(q.x,q.y);ctx.stroke();}ctx.restore();}
const buildDefs={
  woodcutter:{name:'Woodcutter',icon:'🪓',wood:3,stone:1,cycle:8,copy:'A woodcutter walks to nearby trees and fells them. Carriers deliver the timber to storage; output depends on walking distance.'},
  quarry:{name:'Stonecutter',icon:'⛏',wood:3,stone:2,cycle:11,copy:'A stonecutter works exposed rock. Carriers collect the stone and deliver it to storage; output depends on walking distance.'},
  house:{name:'Residence',icon:'⌂',wood:5,stone:2,copy:'Adds room for four settlers.'},
  tower:{name:'Guard Tower',icon:'♜',wood:6,stone:6,copy:'Extends the safe reach of your settlement.'},
  forester:{name:'Forester',icon:'♧',wood:3,stone:1,cycle:10,output:'trees',copy:'Plants new trees in nearby clear ground.'},
  sawmill:{name:'Sawmill',icon:'▱',wood:5,stone:2,cycle:8,input:'wood',output:'planks',copy:'Turns one timber into two building planks.'},
  farm:{name:'Wheat Farm',icon:'≋',wood:5,stone:2,cycle:9,output:'grain',copy:'Harvests two grain from cultivated fields.'},
  mill:{name:'Windmill',icon:'✣',wood:5,stone:5,cycle:8,input:'grain',output:'flour',copy:'Grinds one grain into two sacks of flour.'},
  bakery:{name:'Bakery',icon:'◒',wood:5,stone:4,cycle:8,input:'flour',output:'food',copy:'Bakes one flour into three portions of food.'},
  fisher:{name:'Fisher Hut',icon:'⌁',wood:4,stone:1,cycle:10,output:'food',copy:'Catches two portions of food from coastal water.'}
};
for(const [type,[name,output]] of Object.entries(extraBuildings))buildDefs[type]={name,icon:type==='barracks'?'⚔':'⚒',wood:4,stone:3,cycle:recipes[type]?.cycle,output,copy:recipes[type]?`Requires ${Object.entries(recipes[type].inputs).map(([k,n])=>n+' '+k).join(', ')||'no input goods'}. Produces ${recipes[type].amount} ${output}. Inputs arrive by carrier.`:'Recruit soldiers using the Units panel; weapons and an idle carrier are required.'};
const strategy=createStrategy({workers,buildings,terrain,trees,rocks,routeTo,entrance,followRoute,toast,hasWater,resources:()=>resources,priority:()=>priorityOrder,selected:selectedWorkers,hud:updateHud,isVisible:(x,y)=>exploration.sees(x,y),isSeen:(x,y)=>exploration.seen(x,y),directSupply:true,hasStaff:b=>workforce.hasStaff(b),onEvent:audibleEvent});
const workforce=createWorkforce({workers,buildings,recipes,entrance,routeTo,followRoute,resources:()=>resources});
let quest=0;
const quests=[
  'Our people need timber. Build a woodcutter near the forest.',
  'Watch the carriers: repeated journeys form paths automatically.',
  'The hills are rich in stone. Build a stonecutter near the rocks.',
  'Our little colony is alive. Build a residence for new settlers.',
  'The morning is ours. Keep building—and enjoy the sound of work.'
];

function seeded(x,y){let n=Math.sin(x*127.1+y*311.7)*43758.5;return n-Math.floor(n)}
function smoothNoise(x,y,scale=4){
  const gx=x/scale,gy=y/scale,x0=Math.floor(gx),y0=Math.floor(gy),tx=gx-x0,ty=gy-y0;
  const ease=n=>n*n*(3-2*n),sx=ease(tx),sy=ease(ty);
  const a=seeded(x0+17,y0+31),b=seeded(x0+18,y0+31),c=seeded(x0+17,y0+32),d=seeded(x0+18,y0+32);
  return (a+(b-a)*sx)*(1-sy)+(c+(d-c)*sx)*sy;
}
function initWorld(){
  const cx=Math.floor(MAP_W/2),cy=Math.floor(MAP_H/2);
  for(let y=0;y<MAP_H;y++){
    terrain[y]=[];
    for(let x=0;x<MAP_W;x++){
      const riverBank=44.2+Math.sin(y*.38)*1.35+(smoothNoise(x+8,y+2,4)-.5)*1.5;
      terrain[y][x]=x>riverBank+1?'void':x>riverBank?'water':x>riverBank-.9?'shore':'grass';
    }
  }
  // Compose forest belts and stone outcrops instead of sprinkling props uniformly.
  for(let y=0;y<MAP_H;y++)for(let x=0;x<MAP_W;x++){
    if(terrain[y][x]!=='grass')continue;
    const homeDistance=Math.hypot(x-cx,y-cy);
    const forest=smoothNoise(x+7,y+19,3.1)*.72+smoothNoise(x+41,y+3,7)*.28;
    const ridge=Math.min(Math.hypot(x-10,y-16),Math.hypot(x-37,y-34),Math.hypot(x-35,y-11));
    if(homeDistance>3.1&&forest>.50&&seeded(x+61,y+2)>.22)trees.push({x,y,v:seeded(x+2,y)});
    else if(homeDistance>3&&ridge<2.55&&seeded(x+5,y+8)>.38)rocks.push({x,y,amount:4+Math.floor(seeded(x+8,y)*3)});
    else if(homeDistance>2.5&&seeded(x+29,y+43)>.83)details.push({x,y,type:Math.floor(seeded(x+71,y+11)*3)});
  }
  buildings.push({type:'storehouse',name:'Storehouse',x:cx,y:cy,progress:1,copy:'The heart of your settlement. Goods are stored and distributed here.'});

  for(let i=0;i<8;i++)workers.push({role:'carrier',id:i,x:cx-1.5+(i%4),y:cy+1.5+Math.floor(i/4),homeX:cx+.5,homeY:cy+1.5,phase:'idle',task:null,t:seeded(i,2)*2,carry:null});
}
function iso(x,y){return {x:(x-y)*TILE_W/2*camera.zoom+camera.x,y:(x+y)*TILE_H/2*camera.zoom+camera.y}}
function screenToGrid(sx,sy){const x=(sx-camera.x)/camera.zoom,y=(sy-camera.y)/camera.zoom;return {x:Math.floor(y/TILE_H+x/TILE_W),y:Math.floor(y/TILE_H-x/TILE_W)}}
function diamond(x,y,fill,stroke){const p=iso(x,y),w=TILE_W/2*camera.zoom,h=TILE_H/2*camera.zoom;ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(p.x+w,p.y+h);ctx.lineTo(p.x,p.y+h*2);ctx.lineTo(p.x-w,p.y+h);ctx.closePath();ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=Math.max(1,camera.zoom);ctx.stroke();}}
function atlasCell(image,index,p,w,h,anchorX=.5,anchorY=.82){if(!image.complete||!image.naturalWidth)return false;const sw=image.naturalWidth/4,sh=image.naturalHeight/2,sx=(index%4)*sw,sy=Math.floor(index/4)*sh,z=camera.zoom;ctx.drawImage(image,sx,sy,sw,sh,p.x-w*z*anchorX,p.y-h*z*anchorY,w*z,h*z);return true}
function coastDirection(x,y){
  const water=(dx,dy)=>['water','void'].includes(terrain[y+dy]?.[x+dx]);
  if(water(-1,0))return 0;
  if(water(0,-1))return 1;
  if(water(1,0))return 2;
  return 3;
}
function drawTerrainTile(x,y,type,noise){
  if(type==='void'||type==='water'){diamond(x,y,waterPattern||'#479b9d',waterPattern||'#479b9d');return;}
  if(type==='grass'){diamond(x,y,grassPattern||'#719e32',grassPattern||'#719e32');return;}
  if(type==='shore')return;
  const p=iso(x+.5,y+.5);
  if(type==='shore'&&atlasCell(coastAtlas,coastDirection(x,y),p,103,103,.5,.5))return;
  const index=type==='water'?4:noise>.86?7:noise>.58?1:noise>.3?0:2;
  if(atlasCell(terrainAtlas,index,p,101,101,.5,.5))return;
  diamond(x,y,type==='water'?'#3c9db5':type==='shore'?'#dcc681':'#6d9d50','#315f40');
}
function drawCachedGround(){
  const key=[camera.x,camera.y,camera.zoom,canvas.width,canvas.height,terrainRevision,Boolean(grassPattern),Boolean(waterPattern),terrainAtlas.complete,coastAtlas.complete].join('|');
  if(key!==groundCacheKey){
    if(grassPattern)grassPattern.setTransform(new DOMMatrix([camera.zoom*.35,0,0,camera.zoom*.35,camera.x,camera.y]));
    if(waterPattern)waterPattern.setTransform(new DOMMatrix([camera.zoom*.3,0,0,camera.zoom*.3,camera.x,camera.y]));
    ctx.fillStyle=waterPattern||'#479b9d';ctx.fillRect(0,0,canvas.width/dpr,canvas.height/dpr);
    for(let y=0;y<MAP_H;y++)for(let x=0;x<MAP_W;x++){const p=iso(x+.5,y+.5);if(p.x<-110||p.x>innerWidth+110||p.y<-110||p.y>innerHeight+110)continue;drawTerrainTile(x,y,terrain[y][x],seeded(x,y));}
    drawCoastline();
    if(groundCache.width!==canvas.width||groundCache.height!==canvas.height){groundCache.width=canvas.width;groundCache.height=canvas.height;}
    const cacheCtx=groundCache.getContext('2d');cacheCtx.clearRect(0,0,groundCache.width,groundCache.height);cacheCtx.drawImage(canvas,0,0);groundCacheKey=key;
  }else ctx.drawImage(groundCache,0,0,canvas.width/dpr,canvas.height/dpr);
}
function drawCoastline(){
  const points=[];for(let y=0;y<MAP_H;y++){const x=terrain[y].indexOf('shore');if(x<0)continue;points.push(iso(x+.5+(seeded(y,73)-.5)*.16,y+.5));}
  if(points.length<2)return;const z=camera.zoom;
  const stroke=(color,width,offsetX=0,offsetY=0)=>{ctx.beginPath();ctx.moveTo(points[0].x+offsetX*z,points[0].y+offsetY*z);for(let i=1;i<points.length;i++){const a=points[i-1],b=points[i];ctx.quadraticCurveTo(a.x+offsetX*z,a.y+offsetY*z,(a.x+b.x)/2+offsetX*z,(a.y+b.y)/2+offsetY*z);}const last=points.at(-1);ctx.lineTo(last.x+offsetX*z,last.y+offsetY*z);ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle=color;ctx.lineWidth=width*z;ctx.stroke();};
  stroke('#b8ae67',55);stroke('#d1c78c',40,5,2);stroke(waterPattern||'#479b9d',45,19,9);
}
function drawSprite(index,p,size,anchor=.86){if(!spriteAtlas.complete||!spriteAtlas.naturalWidth)return false;const sw=spriteAtlas.naturalWidth/4,sh=spriteAtlas.naturalHeight/2,sx=(index%4)*sw,sy=Math.floor(index/4)*sh;const h=size*(sh/sw),z=camera.zoom;ctx.drawImage(spriteAtlas,sx,sy,sw,sh,p.x-size*z/2,p.y-h*z*anchor,size*z,h*z);return true}
function groundShadow(p,w=34){const z=camera.zoom;ctx.beginPath();ctx.ellipse(p.x,p.y+5*z,w*z,8*z,0,0,Math.PI*2);ctx.fillStyle='#1738163d';ctx.fill()}
function natureSprite(index,p,size){if(!natureAtlas.complete||!natureAtlas.naturalWidth)return false;const top=index<4,rect=top?[[0,.27],[.275,.225],[.51,.24],[.77,.23]][index]:[(index%4)/4,.25],sx=natureAtlas.naturalWidth*rect[0],sw=natureAtlas.naturalWidth*rect[1],sy=natureAtlas.naturalHeight*(top?0:.6),sh=natureAtlas.naturalHeight*(top?.58:.4),z=camera.zoom;ctx.drawImage(natureAtlas,sx,sy,sw,sh,p.x-size*z/2,p.y-size*z*.94,size*z,size*z);return true;}
function drawTree(o){const p=iso(o.x+.5+(seeded(o.x+3,o.y)-.5)*.4,o.y+.5+(seeded(o.x,o.y+9)-.5)*.4);groundShadow(p,19);if(o.fallLife!==undefined){const fraction=1-o.fallLife/1.5;ctx.save();ctx.translate(p.x,p.y);ctx.rotate((o.v>.5?1:-1)*Math.min(1,fraction)*1.4);ctx.globalAlpha=Math.min(1,o.fallLife*2);natureSprite(Math.floor((o.v||0)*4)%4,{x:0,y:0},105);ctx.restore();return;}const growth=o.age===undefined?1:.25+.75*Math.min(1,o.age/120);const species=Math.floor((o.v??seeded(o.x,o.y))*4)%4;if(natureSprite(species,p,[108,116,99,104][species]*(.88+seeded(o.x+1,o.y)*.22)*growth))return;drawSprite(o.v>.53?1:0,p,86);}
function drawRock(o){const p=iso(o.x+.5,o.y+.5);groundShadow(p,18);if(natureSprite(4,p,71))return;drawSprite(2,p,70,.8);}
function drawDetail(o){const p=iso(o.x+.5,o.y+.5);const wet=hasWater(o),index=wet?6:o.type===0?5:7;const size=wet?35:o.type===0?34:20;natureSprite(index,p,size);}
function buildingArt(b,p,size){const industryIndex=Object.keys(extraBuildings).indexOf(b.type);if(industryIndex>=0)return gridSprite(industryAtlas,industryIndex%4,Math.floor(industryIndex/4),4,4,p,size);const base={storehouse:3,woodcutter:4,quarry:5,house:6,tower:7}[b.type];const extra={forester:0,sawmill:1,farm:2,mill:3,bakery:4,fisher:5}[b.type];if(base!==undefined)return drawSprite(base,p,size,b.type==='tower'?.88:.83);if(extra!==undefined)return atlasCell(economyAtlas,extra,p,size,size,.5,.84);return false}
function buildingShape(b){const p=iso(b.x+.5,b.y+.5),z=camera.zoom;const size=b.type==='tower'?96:116;if(b.progress<1){drawConstruction(b,p,size);return;}
  groundShadow(p,b.type==='tower'?27:37);if(buildingArt(b,p,size))return;
  const palettes={storehouse:['#dfc88e','#a34425'],woodcutter:['#a8733f','#63391f'],quarry:['#b8ad8e','#66594d'],house:['#ead29f','#b44729'],tower:['#aaa58f','#6d3824']};const c=palettes[b.type]||['#c9ad78','#6d4327'];
  if(b.type==='tower'){ctx.fillStyle=c[0];ctx.fillRect(p.x-15*z,p.y-48*z,30*z,48*z);ctx.fillStyle=c[1];ctx.beginPath();ctx.moveTo(p.x-22*z,p.y-48*z);ctx.lineTo(p.x,p.y-65*z);ctx.lineTo(p.x+22*z,p.y-48*z);ctx.closePath();ctx.fill();}
  else {ctx.fillStyle=c[0];ctx.fillRect(p.x-25*z,p.y-29*z,50*z,30*z);ctx.fillStyle=c[1];ctx.beginPath();ctx.moveTo(p.x-31*z,p.y-29*z);ctx.lineTo(p.x,p.y-52*z);ctx.lineTo(p.x+31*z,p.y-29*z);ctx.closePath();ctx.fill();ctx.fillStyle='#3a2418';ctx.fillRect(p.x-5*z,p.y-15*z,10*z,16*z);if(b.type==='woodcutter'){ctx.fillStyle='#a8793c';ctx.fillRect(p.x+24*z,p.y-6*z,27*z,5*z);}}
}
function drawRoad(r){const p=iso(r.x+.5,r.y+.5);if(atlasCell(terrainAtlas,5,p,101,101,.5,.5))return;diamond(r.x,r.y,'#a88a55','#80693f')}
function drawConstruction(b,p,size){
  const z=camera.zoom,progress=b.progress;groundShadow(p,32);diamond(b.x,b.y,'#64583dcc','#b7a079');
  // Stone foundation, rising walls, timber frame, then roof. Never ghost the finished roof.
  for(let i=0;i<8;i++){const a=i*Math.PI/4;goodsArt.draw(ctx,'stone',p.x+Math.cos(a)*29*z,p.y+Math.sin(a)*12*z,13*z);}
  const height=size*z*1.15*Math.max(0,(progress-.12)/.88);
  if(height>0){ctx.save();ctx.beginPath();ctx.rect(p.x-size*z/2,p.y+size*z*.2-height,size*z,height);ctx.clip();buildingArt(b,p,size);ctx.restore();}
  if(progress>.18&&progress<.94){const top=p.y-Math.min(size*.75,12+progress*size*.72)*z;ctx.save();ctx.strokeStyle='#73502c';ctx.lineWidth=3*z;
    for(const dx of [-35,-13,13,35]){ctx.beginPath();ctx.moveTo(p.x+dx*z,p.y+6*z);ctx.lineTo(p.x+dx*z,top);ctx.stroke();}
    for(let y=p.y-5*z;y>top;y-=16*z){ctx.beginPath();ctx.moveTo(p.x-38*z,y);ctx.lineTo(p.x+38*z,y);ctx.stroke();}
    ctx.strokeStyle='#c19755';ctx.lineWidth=2*z;ctx.beginPath();ctx.moveTo(p.x-35*z,p.y+4*z);ctx.lineTo(p.x+35*z,top);ctx.stroke();ctx.restore();}
  ctx.fillStyle='#24291c';ctx.fillRect(p.x-28*z,p.y+17*z,56*z,4*z);ctx.fillStyle='#e5bd61';ctx.fillRect(p.x-28*z,p.y+17*z,56*z*progress,4*z);
}
function oldDrawWorker(w){const p=iso(w.x,w.y);let frame=0;if(w.carry==='wood')frame=3;else if(w.carry==='stone')frame=4;else if(w.phase==='working')frame=w.task?.type==='woodcutter'?5:w.task?.type==='quarry'?6:7;else if(w.phase==='outbound'||w.phase==='inbound'||w.phase==='relocating')frame=Math.floor(w.t*4)%2?1:2;if(inspectedWorker===w.id||selectedWorkers.has(w.id)){ctx.strokeStyle='#fff08a';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(p.x,p.y,10*camera.zoom,5*camera.zoom,0,0,Math.PI*2);ctx.stroke();}groundShadow(p,5);atlasCell(workerAtlas,frame,p,34,34,.5,.9);if(w.carry&&!['wood','stone'].includes(w.carry)){const z=camera.zoom;ctx.beginPath();ctx.arc(p.x+7*z,p.y-11*z,3*z,0,Math.PI*2);ctx.fillStyle={planks:'#c69a55',grain:'#d7b84c',flour:'#eee3bf',food:'#c8813c'}[w.carry]||'#c69a55';ctx.fill();ctx.strokeStyle='#6a4324';ctx.stroke()}}
function renderWorld(){ctx.clearRect(0,0,canvas.width/dpr,canvas.height/dpr);drawCachedGround();drawGeology();drawBuildSites();const key=(x,y)=>x+','+y,roadMap=new Map(roads.map(o=>[key(o.x,o.y),o])),rockMap=new Map(rocks.map(o=>[key(o.x,o.y),o])),detailMap=new Map(details.map(o=>[key(o.x,o.y),o])),buildingMap=new Map(buildings.map(o=>[key(o.x,o.y),o])),treeMap=new Map([...trees,...particles.filter(p=>p.kind==='fall').map(p=>({...p,fallLife:p.life}))].filter(o=>!buildingMap.has(key(o.x,o.y))).map(o=>[key(o.x,o.y),o])),workerMap=new Map();for(const w of workers){const k=key(Math.floor(w.x),Math.floor(w.y));if(!workerMap.has(k))workerMap.set(k,[]);workerMap.get(k).push(w)}ctx.save();for(let s=0;s<MAP_W+MAP_H;s++)for(let y=0;y<MAP_H;y++){const x=s-y;if(x<0||x>=MAP_W)continue;const p=iso(x+.5,y+.5);if(p.x<-150||p.x>innerWidth+150||p.y<-170||p.y>innerHeight+120)continue;const k=key(x,y),t=terrain[y][x],noise=seeded(x,y);if(t==='void')continue;drawTrail(x,y);const road=roadMap.get(k),rock=rockMap.get(k),tree=treeMap.get(k),detail=detailMap.get(k),building=buildingMap.get(k);if(road)drawRoad(road);if(detail&&!road&&!building&&!tree&&!rock)drawDetail(detail);if(rock)drawRock(rock);if(tree)drawTree(tree);if(building&&((building.owner||1)===1||exploration.sees(x,y))){buildingShape(building);drawBuildingGoods(building);}for(const worker of workerMap.get(k)||[])drawWorker(worker)}if(hovered&&hovered.x>=0&&hovered.y>=0&&hovered.x<MAP_W&&hovered.y<MAP_H&&terrain[hovered.y][hovered.x]!=='void')diamond(hovered.x,hovered.y,selectedTool==='inspect'?'#fff2':'#f7d65a55','#ffe47a');ctx.restore();if(selectionBox){ctx.strokeStyle='#f9df83';ctx.fillStyle='#ffdc6020';ctx.lineWidth=1;const b=selectionBox;ctx.fillRect(b.a.x,b.a.y,b.b.x-b.a.x,b.b.y-b.a.y);ctx.strokeRect(b.a.x,b.a.y,b.b.x-b.a.x,b.b.y-b.a.y);}if(++renderCount%8===0)renderMinimap()}
function renderMinimap(){const w=minimap.width,h=minimap.height,cw=w/MAP_W,ch=h/MAP_H;miniCtx.fillStyle='#080b07';miniCtx.fillRect(0,0,w,h);for(let y=0;y<MAP_H;y++)for(let x=0;x<MAP_W;x++){if(!exploration.seen(x,y))continue;const type=terrain[y][x];miniCtx.fillStyle=type==='water'?'#4b9ab0':type==='shore'?'#d8c17a':'#638f47';miniCtx.globalAlpha=exploration.sees(x,y)?1:.35;miniCtx.fillRect(x*cw,y*ch,Math.ceil(cw),Math.ceil(ch));}miniCtx.globalAlpha=1;for(const b of buildings){if(!exploration.sees(b.x,b.y))continue;miniCtx.fillStyle=(b.owner||1)===2?'#e64b39':'#f2dfad';miniCtx.fillRect(b.x*cw-1,b.y*ch-1,cw+2,ch+2);}for(const worker of workers){if(worker.dead||!exploration.sees(worker.x,worker.y))continue;miniCtx.fillStyle=(worker.owner||1)===2?'#e64b39':'#eee9bb';miniCtx.fillRect(worker.x*cw,worker.y*ch,1,1);}const center=screenToGrid(innerWidth/2,innerHeight/2);miniCtx.strokeStyle='#fff1b5';miniCtx.lineWidth=1;miniCtx.strokeRect((center.x-3)*cw,(center.y-3)*ch,cw*6,ch*6);}

function resize(){dpr=Math.min(devicePixelRatio,ecoMode?1:1.25);canvas.width=innerWidth*dpr;canvas.height=innerHeight*dpr;canvas.style.width=innerWidth+'px';canvas.style.height=innerHeight+'px';ctx.setTransform(dpr,0,0,dpr,0,0);if(!camera.x){camera.zoom=Math.max(.58,Math.min(.76,innerWidth/1900));camera.x=innerWidth/2;camera.y=innerHeight/2-((MAP_W+MAP_H)/2+1)*TILE_H/2*camera.zoom;}}
function update(dt){if(paused||!active)return;const step=dt*speed;elapsed+=step;strategy.tick(step);workforce.update(step);updateWorkers(step);exploration.update(buildings,workers);productionClock+=step;hungerClock+=step;if(productionClock>=1){productionClock-=1;runProduction(1);for(const tree of trees)if(tree.age!==undefined&&tree.age<120)tree.age=Math.min(120,tree.age+1);for(const [k,v] of traffic){if(elapsed-(trafficLastUsed.get(k)??elapsed)>600){traffic.set(k,Math.max(0,v-.02));}}}if(hungerClock>=24){hungerClock-=24;updateHud()}updateWorkSounds();for(let i=particles.length-1;i>=0;i--){particles[i].life-=step;if(particles[i].life<=0)particles.splice(i,1);}autosave+=dt;if(autosave>5){save();autosave=0}}
function nearby(list,b,radius=3){const area=b.area||b;return list.some(o=>(list!==trees||o.age===undefined||o.age>=120)&&Math.abs(o.x-area.x)+Math.abs(o.y-area.y)<=radius)}
function adjacentRoads(b){return roads.filter(r=>Math.abs(r.x-b.x)+Math.abs(r.y-b.y)<=1)}
function findRoadPath(a,b){const starts=adjacentRoads(a),goals=new Set(adjacentRoads(b).map(r=>`${r.x},${r.y}`));if(!starts.length||!goals.size)return null;const open=[...starts],seen=new Set(open.map(r=>`${r.x},${r.y}`)),parent=new Map();while(open.length){const r=open.shift(),key=`${r.x},${r.y}`;if(goals.has(key)){const path=[r];let cursor=key;while(parent.has(cursor)){cursor=parent.get(cursor);const [x,y]=cursor.split(',').map(Number);path.unshift({x,y})}return path}for(const n of roads){const nk=`${n.x},${n.y}`;if(!seen.has(nk)&&Math.abs(n.x-r.x)+Math.abs(n.y-r.y)===1){seen.add(nk);parent.set(nk,key);open.push(n)}}}return null}
function roadConnected(a,b){return Boolean(findRoadPath(a,b))}
function taskRoute(task,w){
  delete w.pickupEnd;w.gather=null;w.role=task.progress<1?'builder':'carrier';
  if(task.progress>=1&&['woodcutter','quarry'].includes(task.type)&&!task.ready){
    const area=task.area||task,list=task.type==='woodcutter'?trees:rocks;
    const candidates=list.filter(o=>(list!==trees||o.age===undefined||o.age>=120)&&Math.abs(o.x-area.x)+Math.abs(o.y-area.y)<=3&&!workers.some(other=>other!==w&&other.gather?.x===o.x&&other.gather?.y===o.y)).sort((a,b)=>Math.hypot(a.x-w.x,a.y-w.y)-Math.hypot(b.x-w.x,b.y-w.y));
    for(const source of candidates){const target=entrance(source);if(!target)continue;const route=routeTo(w,target);if(route){w.role=task.type;w.gather={x:source.x,y:source.y,type:task.type};return route;}}
    return null;
  }
  const target=entrance(task);return target?routeTo(w,target):null;
}
function hasWater(b){for(let y=-2;y<=2;y++)for(let x=-2;x<=2;x++)if(terrain[b.y+y]?.[b.x+x]==='water')return true;return false}
function findPlantSite(b){for(let radius=1;radius<=3;radius++)for(let dy=-radius;dy<=radius;dy++)for(let dx=-radius;dx<=radius;dx++){const x=(b.area||b).x+dx,y=(b.area||b).y+dy;if(terrain[y]?.[x]==='grass'&&roadStage(traffic.get(keyOf(x,y)))===0&&!trees.some(t=>t.x===x&&t.y===y)&&!rocks.some(r=>r.x===x&&r.y===y)&&!buildings.some(o=>o.x===x&&o.y===y)&&!roads.some(r=>r.x===x&&r.y===y)){return {x,y}}}return null}
function growTree(b){const site=findPlantSite(b);if(!site)return false;trees.push({...site,v:seeded(site.x+elapsed,site.y),age:0});return true;}
function runProduction(dt){for(const b of buildings){if(strategy.produce(b,dt))continue;const def=buildDefs[b.type];if(b.progress<1||!def?.cycle||['woodcutter','quarry'].includes(b.type))continue;let valid=!b.stopped&&(b.type!=='forester'||workforce.hasStaff(b));if(valid)b.work=(b.work||0)+dt;if(b.type==='woodcutter')valid=valid&&nearby(trees,b);if(b.type==='quarry')valid=valid&&nearby(rocks,b);if(b.type==='fisher')valid=valid&&hasWater(b);if(def.input)valid=valid&&resources[def.input]>0;if(valid&&b.work>=def.cycle&&!b.ready){b.work=0;if(def.input)resources[def.input]--;if(def.output==='trees'){growTree(b);toast('Forester planted a tree');updateHud()}else b.ready=def.output||(b.type==='woodcutter'?'wood':b.type==='quarry'?'stone':null);if(b.type==='woodcutter'){const i=trees.findIndex(t=>Math.abs(t.x-(b.area||b).x)+Math.abs(t.y-(b.area||b).y)<=3);if(i>=0)trees.splice(i,1)}if(b.type==='quarry'){const r=rocks.find(o=>Math.abs(o.x-(b.area||b).x)+Math.abs(o.y-(b.area||b).y)<=3);if(r&&--r.amount<=0)rocks.splice(rocks.indexOf(r),1)}}}}
function moveWorker(w,tx,ty,dt){const dx=tx-w.x,dy=ty-w.y,d=Math.hypot(dx,dy);if(d<.01)return true;const step=Math.min(d,dt*.72*(w.role==='carrier'?walkSpeed(traffic.get(keyOf(Math.floor(w.x),Math.floor(w.y)))):1));w.facing=dx-dy<0?-1:1;w.direction=facing8(dx,dy);w.x+=dx/d*step;w.y+=dy/d*step;recordWalk(w,w.x,w.y);return step>=d}
function pickTask(){const construction=buildings.filter(b=>(b.owner||1)===1&&b.progress<1&&strategy.readyToBuild(b)&&!b.stopped&&!workers.some(w=>w.task===b)).sort((a,b)=>(b.priority?1:0)-(a.priority?1:0))[0];if(construction)return construction;return buildings.filter(b=>(b.owner||1)===1&&!b.stopped&&(b.ready||(b.progress>=1&&b.type==='woodcutter'&&nearby(trees,b))||(b.progress>=1&&b.type==='quarry'&&nearby(rocks,b)))&&!workers.some(w=>w.task===b)).sort((a,b)=>priorityOrder.indexOf(a.ready)-priorityOrder.indexOf(b.ready))[0]||null}
function deliveryAmount(item){return item==='food'?3:2}
function followRoute(w,dt){const point=w.route?.[w.routeIndex];if(!point)return true;if(moveWorker(w,point.x,point.y,dt))w.routeIndex++;return w.routeIndex>=w.route.length}
function updateWorkers(dt){
  for(const w of workers){
    if(w.employerIndex!==undefined)continue;
    if(strategy.tickWorker(w,dt))continue;
    w.t+=dt;
    if(w.phase==='relocating'){w.phase='idle';w.route=null;}
    if(w.phase==='idle'){
      if(w.phase==='idle'){w.retry=(w.retry||0)-dt;if(w.retry<=0){w.retry=1;const task=pickTask();if(task){const route=taskRoute(task,w);if(route){w.task=task;w.route=route;w.routeIndex=0;w.phase='outbound';continue;}}}}
      continue;
    }
    if(!w.task&&w.phase!=='inbound'){w.phase='idle';continue;}
    if(w.phase==='outbound'&&followRoute(w,dt)){w.phase='working';w.wait=0;const target=w.gather||w.task;if(target)w.direction=facing8(target.x+.5-w.x,target.y+.5-w.y);}
    if(w.phase==='working'){
      w.wait+=dt;
      if(w.task.stopped){w.gather=null;w.task=null;w.phase='idle';continue;}if(w.task.progress<1){if(w.task.materials&&!w.task.materialsSpent){if(!strategy.readyToBuild(w.task))continue;for(const [k,n] of Object.entries(w.task.materials))w.task.buffer[k]-=n;w.task.materialsSpent=true;}w.task.progress=Math.min(1,w.task.progress+dt*.12);if(w.task.progress<1)continue;}
      if(w.wait<(w.gather?12:2.5))continue;
      if(!w.task.completed){w.task.completed=true;completed(w.task);}
      w.carry=w.task.ready||null;w.task.ready=null;
      if(w.gather){const list=w.gather.type==='woodcutter'?trees:rocks,index=list.findIndex(o=>o.x===w.gather.x&&o.y===w.gather.y);if(index>=0){if(w.gather.type==='woodcutter'){particles.push({...list[index],kind:'fall',life:1.5});audibleEvent('fall',list[index]);list.splice(index,1);}else if(--list[index].amount<=0)list.splice(index,1);w.carry=w.gather.type==='woodcutter'?'wood':'stone';}w.gather=null;}
      const home=entrance(['woodcutter','quarry'].includes(w.role)?w.task:buildings[0]);w.route=home?routeTo(w,home):null;
      if(!w.route){w.wait=0;w.task.ready=w.carry;w.carry=null;w.task=null;w.phase='idle';continue;}
      w.routeIndex=0;w.phase='inbound';
    }
    if(w.phase==='inbound'&&followRoute(w,dt)){
      if(w.carry){if(['woodcutter','quarry'].includes(w.role)){w.task.ready=w.carry;}else{const amount=w.task?.outputAmount||deliveryAmount(w.carry);resources[w.carry]=(resources[w.carry]||0)+amount;toast(`Delivered ${amount} ${w.carry}`);if(w.carry==='wood'&&quest===1)setQuest(2);updateHud();}}
      w.carry=null;w.task=null;w.route=null;w.phase='idle';w.rest=8+w.id;w.role='carrier';
    }
  }
}
function loop(t){if(document.hidden||!active){last=t;requestAnimationFrame(loop);return}const frameMs=paused?250:ecoMode?42:33;if(last&&t-last<frameMs){requestAnimationFrame(loop);return}const dt=Math.min(.066,(t-last)/1000||0);last=t;update(dt);render();requestAnimationFrame(loop)}
function toast(msg){document.querySelectorAll('.toast').forEach(x=>x.remove());const el=document.createElement('div');el.className='toast';el.textContent=msg;game.append(el);setTimeout(()=>el.remove(),2200)}
function setQuest(n){quest=Math.max(quest,n);document.querySelector('#quest-text').textContent=quests[quest];document.querySelector('#quest-panel').classList.remove('hidden')}
function completed(b){audibleEvent('complete',b);toast(`${b.name} completed`);if(b.type==='woodcutter'&&quest===0)setQuest(1);if(b.type==='quarry'&&quest<=2)setQuest(3);if(b.type==='house'){resources.beds+=4;if(resources.people<resources.beds){const added=Math.min(2,resources.beds-resources.people);resources.people+=added;const h=entrance(b)||entrance(buildings[0]);for(let i=0;i<added;i++)workers.push({id:workers.length,x:h.x,y:h.y,homeX:h.x,homeY:h.y,phase:'idle',task:null,t:0,carry:null});}setQuest(4)}updateHud()}
function baseUpdateHud(){for(const k of Object.keys(resources)){const el=document.querySelector(`#${k}-count`),stock=document.querySelector(`#${k}-stock`);if(el)el.textContent=Math.floor(resources[k]);if(stock)stock.textContent=Math.floor(resources[k])}priorityOrder.forEach((k,i)=>{const el=document.querySelector(`#${k}-priority`);if(el)el.textContent=i+1})}
function placementReason(g,type=selectedTool){if(!exploration.seen(g.x,g.y))return 'Erkunde dieses Gebiet zuerst';const territoryReason=strategy.placement(g,type);if(territoryReason)return territoryReason;if(g.x<1||g.y<1||g.x>=MAP_W-1||g.y>=MAP_H-1)return 'Too close to the shore';if(terrain[g.y]?.[g.x]!=='grass')return 'Buildings need clear grass';if(buildings.some(b=>b.x===g.x&&b.y===g.y)||roads.some(r=>r.x===g.x&&r.y===g.y))return 'That tile is occupied';if(rocks.some(r=>r.x===g.x&&r.y===g.y)||trees.some(t=>t.x===g.x&&t.y===g.y))return 'Clear ground required: trees or rocks occupy this site';if(type==='woodcutter'&&!nearby(trees,g))return 'Woodcutters must be near trees';if(type==='quarry'&&!nearby(rocks,g))return 'Stonecutters must be near rock';if(type==='fisher'&&!hasWater(g))return 'Fishers must be near the coast';return ''}
function canPlace(g){return !placementReason(g)}
function place(g){if(selectedTool==='road'){const reason=placementReason(g,'road');if(reason)return toast(reason);roads.push(g);if(quest===1)setQuest(2);toast('Road placed');save();return}const d=buildDefs[selectedTool];if(!d)return;const reason=placementReason(g);if(reason)return toast(reason);if(resources.planks<d.wood||resources.stone<d.stone)return toast(`Need ${d.wood} planks and ${d.stone} stone`);resources.planks-=d.wood;resources.stone-=d.stone;buildings.push({materials:{planks:d.wood,stone:d.stone},reserved:{planks:d.wood,stone:d.stone},type:selectedTool,name:d.name,x:g.x,y:g.y,progress:.02,copy:d.copy,work:0});updateHud();save()}
function inspect(g){
  const b=buildings.find(b=>b.x===g.x&&b.y===g.y);if(!b)return;
  if(b.owner===2){toast('Feindlicher Außenposten: Schwertkämpfer zum Erobern schicken');return;}
  selectedWorkers.clear();commandMode=false;settingArea=false;inspectedWorker=null;inspectedBuilding=b;configureBuildingActions(b);showCommandPanel('building');
  document.querySelector('#building-actions').classList.remove('hidden');
  document.querySelector('#production-toggle').textContent=b.stopped?'Fortsetzen':'Anhalten';
  document.querySelector('#priority-toggle').textContent=b.priority?'Priorität: hoch':'Priorität: normal';
  const r=recipes[b.type],name=buildingNames[b.type]||b.name;
  const special={storehouse:'Zentrales Lager für Baustoffe und Waren.',woodcutter:'Fällt ausgewachsene Bäume im Arbeitsgebiet. Trägt Holz zur Hütte; Träger übernehmen den Weitertransport.',quarry:'Baut Felsen im Arbeitsgebiet ab. Träger holen die Steine ab.',forester:'Pflanzt junge Bäume. Erst ausgewachsene Bäume können gefällt werden.',house:'Schafft Platz für vier Siedler.',tower:'Erweitert dein Gebiet mit einer Schwertkämpfer-Besatzung.',barracks:'Rekrutiert Soldaten im Siedlermenü. Benötigt freie Träger und Waffen; höhere Ränge zusätzlich Gold.'};
  let copy=special[b.type]||'';
  if(r){const inputs=Object.entries(r.inputs).map(([k,n])=>n+' '+goodsNames[k]).join(' + ');copy=(inputs||'Keine Eingangswaren')+' → '+r.amount+' '+goodsNames[r.output]+'. ';copy+='Vor Ort: '+(Object.keys(r.inputs).map(k=>goodsNames[k]+' '+(b.buffer?.[k]||0)).join(', ')||'keine Eingangswaren nötig')+'. ';}
  if(b.progress<1)copy+=' Baustelle: '+constructionStage(b.progress)+' · '+Math.round(b.progress*100)+' %. '+(strategy.readyToBuild(b)?'Material bereit; Bauarbeiter benötigt.':Object.entries(b.materials||{}).map(([k,n])=>goodsNames[k]+' '+(b.buffer?.[k]||0)+'/'+n).join(', '));
  else {if(r||b.type==='forester')copy+=' '+(workforce.hasStaff(b)?'Facharbeiter vor Ort.':'Wartet auf Facharbeiter mit Werkzeug.');if(b.ready)copy+=' '+(b.outputAmount||2)+' '+goodsNames[b.ready]+' warten auf Abholung.';if(b.stopped)copy+=' Betrieb angehalten.';}
  if(b.type==='tower')copy+=' Besatzung: '+(b.garrison||0)+'.';
  document.querySelector('#info-title').textContent=name;document.querySelector('#info-type').textContent=b.progress<1?'BAUSTELLE':'GEBÄUDE';
  document.querySelector('#info-copy').textContent=copy;document.querySelector('#info-icon').innerHTML=b.type==='storehouse'?'⌂':`<span class="inspector-building" style='${buildingMenuArt(b.type)}'></span>`;
  document.querySelector('#info-panel').classList.remove('hidden');document.querySelector('#status-title').textContent=name;document.querySelector('#status-copy').textContent=copy;
}
function buildingMenuArt(type){const industrial=Object.keys(extraBuildings).indexOf(type);const base={woodcutter:4,quarry:5,house:6,tower:7}[type];const economy={forester:0,sawmill:1,farm:2,mill:3,bakery:4,fisher:5}[type];const index=industrial>=0?industrial:base??economy,rows=industrial>=0?4:2,image=industrial>=0?industryAtlas:base!==undefined?spriteAtlas:economyAtlas;return `background-image:url("${image.src}");background-size:400% ${rows*100}%;background-position:${index%4/3*100}% ${Math.floor(index/4)/(rows-1)*100}%`;}
function makeTools(){
  const groups={basic:['woodcutter','quarry','forester','sawmill'],food:['waterworks','farm','mill','bakery','fisher','pigfarm','butcher'],metal:['coalmine','ironmine','goldmine','sulfurmine','smelter','goldsmelter','toolsmith'],military:['tower','barracks','weaponsmith','bowmaker'],town:['house']};
  const labels={basic:'Grundversorgung',food:'Nahrung',metal:'Bergbau & Metall',military:'Militär',town:'Siedlung'};
  const names=buildingNames;
  const goods={wood:'Holz',planks:'Bretter',water:'Wasser',grain:'Getreide',flour:'Mehl',bread:'Brot',fish:'Fisch',pigs:'Schweine',meat:'Fleisch',coal:'Kohle',ironOre:'Eisenerz',goldOre:'Golderz',sulfur:'Schwefel',iron:'Eisen',gold:'Gold',tools:'Werkzeuge',swords:'Schwerter',bows:'Bögen'};
  const special={woodcutter:'Fällt nahe Bäume und liefert Holz.',quarry:'Gewinnt Stein. Benötigt nahe Felsen.',forester:'Pflanzt Bäume im Arbeitsgebiet.',tower:'Erweitert das Gebiet mit Schwertkämpfer-Besatzung.',barracks:'Rekrutiert Soldaten über „Units & economy“. Benötigt Waffen und freie Träger.',house:'Schafft Platz für 4 Siedler.'};
  const description=type=>{const recipe=recipes[type];if(!recipe)return special[type];const input=Object.entries(recipe.inputs).map(([k,n])=>n+' '+goods[k]).join(' + ');return (input?input+' → ':'Erzeugt ')+recipe.amount+' '+goods[recipe.output]+'.'+(recipe.deposit?' Benötigt erkundetes Vorkommen.':recipe.coastal?' Nur an der Küste.':'');};
  const dock=document.querySelector('.tool-dock');
  dock.innerHTML='<div class="build-heading">Bauen <small>Deine Siedlung wächst</small></div><select class="build-category" aria-label="Baukategorie">'+Object.keys(groups).map(k=>'<option value="'+k+'">'+labels[k]+'</option>').join('')+'</select><div class="category-buttons">'+Object.keys(groups).map(k=>`<button data-category="${k}" title="${labels[k]}" aria-label="${labels[k]}"><span style='${buildingMenuArt(groups[k][0])}'></span></button>`).join('')+'</div><button class="tool inspect-tool active" data-tool="inspect">Auswählen & Befehle</button><div class="building-catalog">'+Object.entries(buildDefs).map(([k,d])=>`<button class="tool building-card" data-tool="${k}" aria-label="${names[k]}: ${description(k)} Baukosten: ${d.wood} Bretter, ${d.stone} Stein."><span class="building-preview" role="img" aria-label="${names[k]} – Ansicht im Spiel" style='${buildingMenuArt(k)}'></span><strong>${names[k]}</strong><span class="building-purpose">${description(k)}</span><span class="building-cost">${goodAmount("planks",d.wood)} ${goodAmount("stone",d.stone)}</span></button>`).join('')+'</div>';
  const filter=value=>{dock.querySelectorAll('[data-category]').forEach(b=>{b.classList.toggle('active',b.dataset.category===value);b.setAttribute('aria-pressed',String(b.dataset.category===value));});dock.querySelectorAll('.building-card').forEach(b=>{b.hidden=!groups[value].includes(b.dataset.tool);});dock.querySelectorAll('.tool').forEach(b=>b.classList.toggle('active',b.dataset.tool===selectedTool));};
  dock.querySelector('select').onchange=e=>{selectedTool='inspect';commandMode=false;settingArea=false;filter(e.target.value);};filter('basic');
  dock.addEventListener('click',e=>{const category=e.target.closest('[data-category]');if(category){dock.querySelector('select').value=category.dataset.category;selectedTool='inspect';commandMode=false;settingArea=false;filter(category.dataset.category);return;}const b=e.target.closest('.tool');if(!b)return;selectedTool=b.dataset.tool;document.querySelector('#catalog-detail').textContent=b.dataset.tool==='inspect'?'Siedler oder Gebäude anklicken.':names[b.dataset.tool]+': '+description(b.dataset.tool);commandMode=false;settingArea=false;selectedWorkers.clear();document.querySelectorAll('.tool').forEach(x=>x.classList.toggle('active',x===b));});
}
function gridSprite(image,col,row,cols,rows,p,size){if(!image.complete||!image.naturalWidth)return false;const sw=image.naturalWidth/cols,sh=image.naturalHeight/rows,z=camera.zoom;ctx.drawImage(image,col*sw,row*sh,sw,sh,p.x-size*z/2,p.y-size*z*.92,size*z,size*z);return true;}
function drawWorker(w){
  if(w.dead||w.garrisonIndex!==undefined||!exploration.sees(w.x,w.y))return;
const activity=workActivity(w,buildings,recipes,b=>strategy.depositFor(b),b=>Boolean(findPlantSite(b)));const p=iso(w.x,w.y),z=camera.zoom,moving=['outbound','inbound','relocating','supply','command','manual','staffTravel'].includes(w.phase);
  const row=w.unit?strategy.isMilitary(w)?2:3:moving?Math.floor((w.t||0)*5)%2:0;
  groundShadow(p,5);
  if(selectedWorkers.has(w.id)||inspectedWorker===w.id){ctx.strokeStyle=(w.owner||1)===2?'#ec7971':'#fff08a';ctx.lineWidth=1.5;ctx.beginPath();ctx.ellipse(p.x,p.y,10*z,5*z,0,0,Math.PI*2);ctx.stroke();}
  const cargo=hasVisibleCargo(w),pose=cargoPose(w),bob=moving?Math.sin((w.t||0)*10)*.7*z:0;
  const drawCargo=()=>goodsArt.draw(ctx,w.carry,p.x+pose.x*z,p.y+pose.y*z+bob,(w.carry==='wood'||w.carry==='planks'?24:18)*z,(w.direction??2)>=3&&(w.direction??2)<=5);
  if(cargo&&pose.behind)drawCargo();
  if(activity){p.y+=Math.sin((w.t||0)*5)*1.3*z;}
  const specialRow=w.unit==='archer'?moving?Math.floor((w.t||0)*5)%2:0:w.unit==='pioneer'?2:w.unit==='geologist'?3:null;
  if(!gridSprite(specialRow===null?directionAtlas:specialistAtlas,w.direction??2,specialRow??row,8,4,p,32)){oldDrawWorker(w);return;}
  if(w.unit&&strategy.isMilitary(w)){for(let i=0;i<(w.rank||1);i++){ctx.fillStyle='#f5d36e';ctx.fillRect(p.x+(-5+i*4)*z,p.y-39*z,3*z,2*z);}}
  if(w.unit){ctx.fillStyle=w.owner===2?'#df594d':'#84bbef';ctx.fillRect(p.x-7*z,p.y-32*z,14*z,2*z);ctx.fillStyle='#70b66a';ctx.fillRect(p.x-7*z,p.y-35*z,14*z*Math.max(0,(w.hp||0)/(w.maxHp||(strategy.isMilitary(w)?55:30))),2*z);}
  if(cargo&&!pose.behind)drawCargo();
  if(activity)drawWorkAction(w,p,activity);
}
let buildSitesKey='',buildSites=[];
function getBuildSites(type){
  if(!buildDefs[type])return [];
  const key=[type,exploration.revision,terrainRevision,trees.length,rocks.length,buildings.length,roads.length,JSON.stringify(strategy.state.claims),strategy.state.deposits.map(d=>`${d.x},${d.y},${d.discovered},${d.amount>0}`).join(';'),buildings.filter(b=>b.type==='tower').map(b=>`${b.owner},${b.garrison},${b.progress>=1}`).join(';')].join('|');
  if(key!==buildSitesKey){
    const blocked=new Set([...trees,...rocks,...buildings,...roads].map(o=>keyOf(o.x,o.y)));buildSites=[];
    for(let y=1;y<MAP_H-1;y++)for(let x=1;x<MAP_W-1;x++){if(blocked.has(keyOf(x,y))||terrain[y][x]!=='grass'||strategy.ownerAt(x,y)!==1)continue;if(!placementReason({x,y},type))buildSites.push({x,y});}
    buildSitesKey=key;
  }return buildSites;
}
function drawBuildSites(){
  const def=buildDefs[selectedTool],hint=document.querySelector('#build-site-hint');
  if(!def||settingArea){hint.classList.add('hidden');return;}
  const sites=getBuildSites(selectedTool),z=camera.zoom,r=Math.max(2.3,4*z);
  for(const g of sites){const p=iso(g.x+.5,g.y+.5);if(p.x<-10||p.y<-10||p.x>innerWidth+10||p.y>innerHeight+10)continue;
    ctx.fillStyle='#17372de6';ctx.beginPath();ctx.ellipse(p.x,p.y+1,r+1,r*.7+1,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#39c99b';ctx.beginPath();ctx.ellipse(p.x,p.y,r,r*.7,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#c4ffb0';ctx.beginPath();ctx.ellipse(p.x-r*.25,p.y-r*.25,r*.4,r*.23,0,0,Math.PI*2);ctx.fill();
  }
  const shortage=resources.planks<def.wood||resources.stone<def.stone;
  let message=`${buildingNames[selectedTool]||def.name} · ${sites.length} Bauplätze · ${def.wood} Bretter / ${def.stone} Stein${shortage?' — Material fehlt':''}`;
  if(hovered){const reason=placementReason(hovered);if(reason)message+=' · '+reason;}
  const html=message.replace(def.wood+' Bretter / '+def.stone+' Stein',goodAmount('planks',def.wood)+' '+goodAmount('stone',def.stone));if(hint.innerHTML!==html)hint.innerHTML=html;hint.classList.remove('hidden');
}
function borderMarkers(){const points=[];for(let y=0;y<MAP_H;y++)for(let x=0;x<MAP_W;x++){const owner=strategy.ownerAt(x,y);if(!owner||!['grass','shore'].includes(terrain[y][x]))continue;if([[1,0],[-1,0],[0,1],[0,-1]].some(([dx,dy])=>strategy.ownerAt(x+dx,y+dy)!==owner))points.push({x,y,owner});}return points;}
function render(){renderWorld();drawWorkingArea();
  for(const marker of borderMarkers()){if(!exploration.sees(marker.x,marker.y))continue;const p=iso(marker.x+.5,marker.y+.5),r=Math.max(2.6,4.4*camera.zoom);if(p.x<-8||p.y<-8||p.x>innerWidth+8||p.y>innerHeight+8)continue;
    ctx.fillStyle='#26170dc9';ctx.beginPath();ctx.ellipse(p.x,p.y+1.5,r+1,r*.62,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle=marker.owner===1?'#aa191b':'#b98524';ctx.beginPath();ctx.ellipse(p.x,p.y-1,r,r*.9,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle=marker.owner===1?'#ff6556':'#ffe08b';ctx.beginPath();ctx.ellipse(p.x-r*.2,p.y-1-r*.35,r*.55,r*.32,0,0,Math.PI*2);ctx.fill();
  }
  for(const d of strategy.state.deposits){if(!d.discovered||!exploration.seen(d.x,d.y))continue;const p=iso(d.x+.5,d.y+.5),z=camera.zoom;ctx.fillStyle='#735333';ctx.fillRect(p.x-2*z,p.y-20*z,3*z,22*z);ctx.fillStyle='#e5cd8c';ctx.fillRect(p.x-13*z,p.y-37*z,26*z,22*z);goodsArt.draw(ctx,d.type,p.x,p.y-27*z,22*z);ctx.fillStyle='#231e13';ctx.font='bold '+Math.max(9,11*z)+'px sans-serif';ctx.textAlign='center';ctx.fillText(String(d.amount),p.x,p.y-40*z);ctx.textAlign='start';}
  drawFog();
}
function selectBox(box,add=false){const hits=workers.filter(w=>!w.dead&&(w.owner||1)===1&&w.garrisonIndex===undefined).filter(w=>{const p=iso(w.x,w.y);return p.x>=Math.min(box.a.x,box.b.x)&&p.x<=Math.max(box.a.x,box.b.x)&&p.y>=Math.min(box.a.y,box.b.y)&&p.y<=Math.max(box.a.y,box.b.y);});const preferred=hits.find(w=>strategy.isMilitary(w))?.unit||hits.find(w=>w.unit)?.unit;if(!add)selectedWorkers.clear();for(const w of hits)if(preferred?w.unit===preferred:!w.unit)selectedWorkers.add(w.id);toast(`${selectedWorkers.size} ${preferred||'workers'} selected`);}
function legacyInspectAt(p){const candidate=workers.filter(w=>w.unit&&!w.dead&&w.garrisonIndex===undefined).find(w=>{const q=iso(w.x,w.y);return Math.hypot(q.x-p.x,q.y-12*camera.zoom-p.y)<16;});if(candidate){selectedWorkers.clear();if((candidate.owner||1)===1)selectedWorkers.add(candidate.id);inspectedWorker=candidate.id;document.querySelector('#info-panel').classList.add('hidden');toast(`${candidate.unit} · ${Math.ceil(candidate.hp)} HP${candidate.owner===2?' · enemy':' · right-click or tap destination'}`);return;}oldInspectAt(p);}
function updateHud(){baseUpdateHud();const rations=document.querySelector('#rations-count');if(rations)rations.textContent=(resources.bread||0)+(resources.fish||0)+(resources.meat||0);const stocks=document.querySelector('#strategy-stocks');if(stocks){const html=Object.entries(resources).filter(([k])=>!['people','beds','food'].includes(k)).map(([k,v])=>`<div class="stock-row">${goodIcon(k)}<span>${goodsNames[k]||k}</span><b>${Math.floor(v)}</b></div>`).join('');if(stocks.innerHTML!==html)stocks.innerHTML=html;}updateEconomyReport();updateUnitStatus();}
document.querySelectorAll('[data-recruit]').forEach(button=>button.onclick=()=>{selectedTool='inspect';strategy.recruit(button.dataset.recruit,document.querySelector('#soldier-rank').value);updateUnitStatus();});
document.querySelector('#halt-units').onclick=()=>strategy.stop();
document.querySelector('#return-specialists').onclick=()=>strategy.returnSpecialists();
document.querySelector('#release-garrison').onclick=()=>strategy.release(inspectedBuilding);
const focusSelect=document.querySelector('#transport-focus');focusSelect.innerHTML=[...new Set(['planks','stone','wood',...Object.values(recipes).map(r=>r.output)])].map(k=>`<option value="${k}">${goodsNames[k]||k}</option>`).join('');focusSelect.onchange=e=>{priorityOrder=[e.target.value,...priorityOrder.filter(k=>k!==e.target.value)];toast((goodsNames[e.target.value]||e.target.value)+' beim Transport bevorzugt');updateHud();save();};
function hitBuilding(p){const g=screenToGrid(p.x,p.y);const targets=buildings.filter(b=>(b.owner||1)===1||exploration.sees(b.x,b.y));return targets.find(b=>b.x===g.x&&b.y===g.y)||[...targets].sort((a,b)=>(b.x+b.y)-(a.x+a.y)).find(b=>{const q=iso(b.x+.5,b.y+.5),size=(b.type==='tower'?96:116)*camera.zoom;return Math.abs(p.x-q.x)<size*.36&&p.y>=q.y-size*.73&&p.y<=q.y+size*.05;});}
function inspectAt(p,add=false){
  const b=hitBuilding(p);if(b){inspect(b);return;}
  const candidates=workers.filter(w=>!w.dead&&w.garrisonIndex===undefined&&exploration.sees(w.x,w.y)).map(w=>({w,p:iso(w.x,w.y)})).filter(o=>Math.hypot(o.p.x-p.x,o.p.y-12*camera.zoom-p.y)<17).sort((a,b)=>Math.hypot(a.p.x-p.x,a.p.y-12*camera.zoom-p.y)-Math.hypot(b.p.x-p.x,b.p.y-12*camera.zoom-p.y));
  if(candidates.length){const w=candidates[0].w;if(!add)selectedWorkers.clear();if((w.owner||1)===1){if(add&&selectedWorkers.has(w.id))selectedWorkers.delete(w.id);else selectedWorkers.add(w.id);}inspectedWorker=w.id;inspectedBuilding=null;settingArea=false;document.querySelector('#info-panel').classList.add('hidden');toast(`${w.unit||w.role||'Settler'} selected. Click clear ground to move; busy workers finish their delivery first.`);return;}
  if(selectedWorkers.size&&strategy.command(screenToGrid(p.x,p.y)))return;
  selectedWorkers.clear();inspectedWorker=null;inspectedBuilding=null;document.querySelector('#info-panel').classList.add('hidden');
}
function setWorkingArea(b,g){if(!b||!['forester','woodcutter','quarry'].includes(b.type))return false;if(terrain[g.y]?.[g.x]!=='grass'||strategy.ownerAt(g.x,g.y)!==1||Math.abs(g.x-b.x)+Math.abs(g.y-b.y)>8){toast('Choose grass in your territory within 8 tiles of the building');return false;}if(b.type==='quarry'&&!nearby(rocks,g)){toast('Stonecutter working area needs stone');return false;}
  b.area={x:g.x,y:g.y};for(const w of workers)if(w.task===b&&w.gather&&!w.carry){w.task=null;w.gather=null;w.route=null;w.phase='idle';}settingArea=false;inspect(b);save();return true;
}
function drawWorkingArea(){const b=inspectedBuilding;if(!b||!['forester','woodcutter','quarry'].includes(b.type))return;const area=settingArea&&hovered?hovered:b.area||b;ctx.save();for(let dy=-3;dy<=3;dy++)for(let dx=-3;dx<=3;dx++){if(Math.abs(dx)+Math.abs(dy)>3)continue;const x=area.x+dx,y=area.y+dy;if(terrain[y]?.[x]==='grass')diamond(x,y,'#7fdc7320','#c7e68c77');}ctx.restore();}
function refundText(refund){return Object.entries(refund).map(([k,n])=>`${n} ${goodsNames[k]||k}`).join(', ')||'keine Waren';}
function configureBuildingActions(b){document.querySelector('#area-toggle').hidden=!['forester','woodcutter','quarry'].includes(b.type);const button=document.querySelector('#demolish-building');button.disabled=b.type==='storehouse';button.textContent=b.type==='storehouse'?'Hauptlager geschützt':`Abreißen · Rückgabe ${refundText(demolitionRefund(b,buildDefs[b.type],workers,buildings.indexOf(b)))}`;}
function openDemolition(){const b=inspectedBuilding;if(!b||b.type==='storehouse'||(b.owner||1)!==1)return;demolitionTarget=b;demolitionWasPaused=paused;paused=true;document.querySelector('#demolition-copy').textContent=`${buildingNames[b.type]||b.name} abreißen? Rückgabe: ${refundText(demolitionRefund(b,buildDefs[b.type],workers,buildings.indexOf(b)))}. Verbaute Materialien: 50 % (abgerundet). Unbenutzte Waren und Werkzeuge: vollständig.${b.type==='house'?' Vier Wohnplätze entfallen.':''}${b.type==='tower'?' Sein Gebietseinfluss entfällt.':''}`;document.querySelector('#demolition-modal').classList.remove('hidden');}
function cancelDemolition(){if(demolitionTarget){demolitionTarget=null;paused=demolitionWasPaused;}document.querySelector('#demolition-modal').classList.add('hidden');}
function demolishBuilding(b){const index=buildings.indexOf(b);if(index<1||(b.owner||1)!==1)return false;const refund=demolitionRefund(b,buildDefs[b.type],workers,index);workforce.beforeDemolish(index);const exit=entrance(b)||entrance(buildings[0]);
  for(const w of workers){if(w.garrisonIndex===index){delete w.garrisonIndex;if(exit){w.x=exit.x;w.y=exit.y;}w.phase='guard';w.order=null;}else if(w.garrisonIndex>index)w.garrisonIndex--;
    if(w.task===b||(w.phase==='supply'&&w.supplyIndex===index)){w.carry=null;w.task=null;w.gather=null;w.route=null;w.supplyIndex=null;w.phase=w.unit?'guard':'idle';}
    else if(w.supplyIndex>index)w.supplyIndex--;
    if(w.order?.building===index){w.order=null;w.route=null;w.phase=w.unit?'guard':'idle';}else if(w.order?.building>index)w.order.building--;
  }
  buildings.splice(index,1);for(const [k,n] of Object.entries(refund))resources[k]=(resources[k]||0)+n;if(b.type==='house'&&b.completed)resources.beds=Math.max(0,resources.beds-4);strategy.recalculate();buildSitesKey='';inspectedBuilding=null;settingArea=false;document.querySelector('#info-panel').classList.add('hidden');updateHud();toast('Recovered '+refundText(refund));save();return true;
}
document.querySelector('#demolish-building').onclick=openDemolition;
document.querySelector('#cancel-demolition').onclick=cancelDemolition;
document.querySelector('#confirm-demolition').onclick=()=>{const b=demolitionTarget;cancelDemolition();if(b)demolishBuilding(b);};
document.querySelector('#move-units').onclick=()=>{if(!selectedWorkers.size)return toast('Select settlers first');commandMode=true;selectedTool='inspect';toast('Click or tap a destination');};
function pointerPos(e){const r=canvas.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top}}
function oldSelectBox(box){selectedWorkers.clear();for(const w of workers){const p=iso(w.x,w.y);if(p.x>=Math.min(box.a.x,box.b.x)&&p.x<=Math.max(box.a.x,box.b.x)&&p.y>=Math.min(box.a.y,box.b.y)&&p.y<=Math.max(box.a.y,box.b.y))selectedWorkers.add(w.id);}toast(`${selectedWorkers.size} workers inspected — tasks are assigned automatically`);}
function zoomAt(p,factor){const old=camera.zoom;camera.zoom=Math.max(.5,Math.min(1.45,old*factor));camera.x=p.x-(p.x-camera.x)*camera.zoom/old;camera.y=p.y-(p.y-camera.y)*camera.zoom/old;}
function oldInspectAt(p){selectedWorkers.clear();const g=screenToGrid(p.x,p.y);if(buildings.some(b=>b.x===g.x&&b.y===g.y)){inspect(g);return;}const candidates=workers.map(w=>({w,p:iso(w.x,w.y)})).filter(o=>Math.hypot(o.p.x-p.x,o.p.y-10*camera.zoom-p.y)<18).sort((a,b)=>Math.hypot(a.p.x-p.x,a.p.y-p.y)-Math.hypot(b.p.x-p.x,b.p.y-p.y));if(candidates.length){const w=candidates[0].w;inspectedWorker=w.id;inspectedBuilding=null;document.querySelector('#building-actions').classList.add('hidden');document.querySelector('#info-title').textContent='Settler '+(w.id+1);document.querySelector('#info-type').textContent=w.phase.toUpperCase();document.querySelector('#info-copy').textContent=w.carry?'Carrying '+w.carry:w.task?'Assigned to '+w.task.name:'Available worker. Work is assigned automatically.';document.querySelector('#info-panel').classList.remove('hidden');return;}inspect(screenToGrid(p.x,p.y));}
canvas.addEventListener('contextmenu',e=>e.preventDefault());
canvas.addEventListener('pointerdown',e=>{canvas.setPointerCapture(e.pointerId);const p=pointerPos(e);pointers.set(e.pointerId,p);if(pointers.size===2){const [a,b]=[...pointers.values()];pinch=true;selectionBox={a,b};drag=null;return;}drag={start:p,last:p,moved:false,button:e.button,touch:e.pointerType==='touch'};});
canvas.addEventListener('pointermove',e=>{const p=pointerPos(e);hovered=screenToGrid(p.x,p.y);if(pointers.has(e.pointerId))pointers.set(e.pointerId,p);if(pinch&&pointers.size===2){const [a,b]=[...pointers.values()];selectionBox={a,b};return;}if(drag){const dx=p.x-drag.last.x,dy=p.y-drag.last.y;if(Math.hypot(p.x-drag.start.x,p.y-drag.start.y)>8)drag.moved=true;if(drag.moved&&!drag.touch&&drag.button===0&&selectedTool==='inspect')selectionBox={a:drag.start,b:p};if(drag.moved&&(drag.touch||drag.button!==0)){camera.x+=dx;camera.y+=dy;}drag.last=p;}});
canvas.addEventListener('pointerup',e=>{const p=pointerPos(e);pointers.delete(e.pointerId);if(pinch){if(selectionBox)selectBox(selectionBox,e.shiftKey);selectionBox=null;if(!pointers.size)pinch=null;drag=null;return;}if(drag?.moved&&selectionBox){selectBox(selectionBox,e.shiftKey);selectionBox=null;}if(drag&&!drag.moved){if(settingArea&&inspectedBuilding){const g=screenToGrid(p.x,p.y);setWorkingArea(inspectedBuilding,g);}else if(drag.button===2||commandMode){commandMode=false;if(!strategy.command(screenToGrid(p.x,p.y))){selectedTool='inspect';settingArea=false;}}else selectedTool==='inspect'?inspectAt(p,e.shiftKey):place(screenToGrid(p.x,p.y));}drag=null;});
canvas.addEventListener('pointercancel',e=>{pointers.delete(e.pointerId);drag=null;pinch=null;selectionBox=null;});
canvas.addEventListener('wheel',e=>{e.preventDefault();const action=wheelAction(e);if(action.zoom)zoomAt(pointerPos(e),action.zoom);else {camera.x+=action.x;camera.y+=action.y;}},{passive:false});
document.querySelector('#zoom-slider').oninput=e=>zoomAt({x:innerWidth/2,y:innerHeight/2},Number(e.target.value)/camera.zoom);
document.querySelector('#clear-selection').onclick=()=>{selectedWorkers.clear();commandMode=false;inspectedWorker=null;settingArea=false;selectedTool='inspect';document.querySelector('#info-panel').classList.add('hidden');};
document.querySelector('#production-toggle').onclick=()=>{if(inspectedBuilding){inspectedBuilding.stopped=!inspectedBuilding.stopped;inspect(inspectedBuilding);save();}};
document.querySelector('#priority-toggle').onclick=()=>{if(inspectedBuilding){inspectedBuilding.priority=!inspectedBuilding.priority;inspect(inspectedBuilding);save();}};
document.querySelector('#area-toggle').onclick=()=>{if(inspectedBuilding&&['forester','woodcutter','quarry'].includes(inspectedBuilding.type)){settingArea=true;selectedTool='inspect';toast('Choose a work area inside your territory (within 8 tiles of this building)');}};
minimap.addEventListener('click',e=>{const r=minimap.getBoundingClientRect(),x=Math.max(0,Math.min(MAP_W-1,Math.floor((e.clientX-r.left)/r.width*MAP_W))),y=Math.max(0,Math.min(MAP_H-1,Math.floor((e.clientY-r.top)/r.height*MAP_H)));camera.x=innerWidth/2-(x-y)*TILE_W/2*camera.zoom;camera.y=innerHeight/2-(x+y)*TILE_H/2*camera.zoom});
document.querySelector('.inventory-panel').addEventListener('click',e=>{const item=e.target.closest('[data-priority]')?.dataset.priority;if(!item)return;priorityOrder=[item,...priorityOrder.filter(k=>k!==item)];toast(`${item} transport prioritized`);updateHud();save()});
function save(){try{localStorage.setItem('new-shores-save',JSON.stringify({version:6,controlGroups,exploration:exploration.save(),strategy:strategy.state,terrain,resources,buildings,roads,trees,rocks,traffic:[...traffic],trailEdges:[...trailEdges],trafficLastUsed:[...trafficLastUsed],workers:workers.map(w=>({...w,taskIndex:w.task?buildings.indexOf(w.task):-1,task:undefined})),priorityOrder,quest,elapsed,ecoMode}));return true;}catch(error){toast('Save failed: browser storage unavailable');return false;}}
function load(){try{const s=parseSave(localStorage.getItem('new-shores-save'),['storehouse',...Object.keys(buildDefs)]);if(!s)return false;if(s.terrain)terrain.splice(0,terrain.length,...s.terrain);terrainRevision++;for(const b of s.buildings)if(terrain[b.y]?.[b.x])terrain[b.y][b.x]='grass';resources={beds:12,planks:0,grain:0,flour:0,...s.resources};buildings.splice(0,buildings.length,...s.buildings.filter(b=>terrain[b.y]?.[b.x]==='grass'));roads.splice(0,roads.length,...s.roads.filter(r=>terrain[r.y]?.[r.x]==='grass'));if(s.trees)trees.splice(0,trees.length,...s.trees.filter(o=>terrain[o.y]?.[o.x]==='grass'));if(s.rocks)rocks.splice(0,rocks.length,...s.rocks.filter(o=>terrain[o.y]?.[o.x]==='grass'));traffic.clear();trailEdges.clear();trafficLastUsed.clear();for(const [k,v] of s.trafficLastUsed||[])trafficLastUsed.set(k,v);for(const [k,v] of s.traffic||[])traffic.set(k,v);for(const [k,v] of s.trailEdges||[])trailEdges.set(k,v);if(s.workers)workers.splice(0,workers.length,...s.workers.map(w=>({...w,task:w.taskIndex>=0?buildings[w.taskIndex]:null})));else {const h=entrance(buildings[0]);workers.forEach((w,i)=>{w.x=h.x+(i%3)*.22;w.y=h.y+Math.floor(i/3)*.22;w.phase='idle';w.task=null;w.carry=null;});}if((s.version||0)<5){resources.tools??=4;resources.planks=Math.max(16,resources.planks||0);}strategy.restore(s.strategy);for(const key of Object.keys(controlGroups))delete controlGroups[key];for(const [key,ids] of Object.entries(s.controlGroups||{}))if(/^[1-9]$/.test(key)&&Array.isArray(ids))controlGroups[key]=ids.filter(Number.isInteger);exploration.restore(s.exploration);exploration.update(buildings,workers);priorityOrder=s.priorityOrder||priorityOrder;ecoMode=s.ecoMode??true;document.querySelector('#power-button').textContent=`Eco render: ${ecoMode?'on':'off'}`;quest=s.quest||0;elapsed=s.elapsed||0;setQuest(quest);updateHud();return true}catch{return false}}
function start(continueGame=false){active=true;last=0;title.classList.remove('active');game.classList.add('active');if(continueGame)load();resize();}
document.querySelector('#new-game').onclick=()=>start(false);document.querySelector('#continue-game').onclick=()=>{if(!load())return alert('Kein gültiger Spielstand vorhanden. Gründe zuerst eine Siedlung.');start(false)};
document.querySelector('#pause-button').onclick=()=>{paused=true;document.querySelector('#pause-modal').classList.remove('hidden')};
document.querySelector('#speed-button').onclick=()=>{speed=speed===1?2:speed===2?4:1;document.querySelector('#speed-button').textContent=speed===1?'▶':speed===2?'▶▶':'▶▶▶'};
document.querySelector('#dismiss-quest').onclick=()=>document.querySelector('#quest-panel').classList.add('hidden');document.querySelector('#close-info').onclick=()=>{inspectedBuilding=null;settingArea=false;document.querySelector('#info-panel').classList.add('hidden');showCommandPanel('build');};
document.querySelector('#save-button').onclick=()=>{if(save())toast('Settlement saved');};
document.querySelector('#resume-button').onclick=()=>{paused=false;document.querySelector('#pause-modal').classList.add('hidden')};
document.querySelector('#power-button').onclick=()=>{ecoMode=!ecoMode;document.querySelector('#power-button').textContent=`Eco render: ${ecoMode?'on':'off'}`;resize();save()};
document.querySelector('#restart-button').onclick=()=>{localStorage.removeItem('new-shores-save');location.reload()};
document.querySelector('#help-button').onclick=()=>document.querySelector('#help-modal').classList.remove('hidden');
document.querySelector('#close-help').onclick=()=>document.querySelector('#help-modal').classList.add('hidden');
addEventListener('resize',resize);initWorld();strategy.init();exploration.update(buildings,workers);makeTools();initCommandSidebar();initSaveSlots();initDetails();updateHud();requestAnimationFrame(loop);
if(import.meta.env.DEV)globalThis.__newShores={particles,getBuildSites,strategy,selectedWorkers,constructionStage,workActivity,terrain,buildings,roads,trees,rocks,details,workers,get resources(){return resources},get camera(){return camera}};
addEventListener('keydown',e=>{if(!active)return;if(demolitionTarget&&e.key!=='Escape')return;if(['INPUT','SELECT','TEXTAREA'].includes(e.target?.tagName))return;if(/^[1-9]$/.test(e.key)&&(e.ctrlKey||e.metaKey)){e.preventDefault();controlGroups[e.key]=[...selectedWorkers];toast('Gruppe '+e.key+' gespeichert');return;}if(/^[1-9]$/.test(e.key)&&controlGroups[e.key]?.length){selectedWorkers.clear();for(const w of workers)if(controlGroups[e.key].includes(w.id)&&!w.dead&&(w.owner||1)===1)selectedWorkers.add(w.id);selectedTool='inspect';toast('Gruppe '+e.key+' ausgewählt');return;}if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();camera.x+=e.key==='ArrowLeft'?40:e.key==='ArrowRight'?-40:0;camera.y+=e.key==='ArrowUp'?40:e.key==='ArrowDown'?-40:0;return;}if(e.code==='Space'){e.preventDefault();paused=!paused;document.querySelector('#pause-modal').classList.toggle('hidden',!paused);return}if(e.key==='Escape'){commandMode=false;cancelDemolition();selectedWorkers.clear();inspectedWorker=null;settingArea=false;selectedTool='inspect';document.querySelectorAll('.tool').forEach(x=>x.classList.toggle('active',x.dataset.tool==='inspect'));document.querySelector('#info-panel').classList.add('hidden');return}const keys=['inspect','woodcutter','quarry','house','tower','forester'];const tool=keys[Number(e.key)-1];if(tool){commandMode=false;settingArea=false;selectedWorkers.clear();selectedTool=tool;document.querySelectorAll('.tool').forEach(x=>x.classList.toggle('active',x.dataset.tool===tool))}});

function drawBuildingGoods(b){const p=iso(b.x+.5,b.y+.5),items=Object.entries(b.buffer||{}).filter(([,n])=>n>0).map(([k,n])=>[k,Math.min(n,3)]);if(b.ready)items.push([b.ready,Math.min(b.outputAmount||2,3)]);let offset=0;for(const [item,n] of items)for(let i=0;i<n;i++){goodsArt.draw(ctx,item,p.x+(-24+(offset%5)*11)*camera.zoom,p.y+(5+Math.floor(offset/5)*7)*camera.zoom,17*camera.zoom);offset++;}}
const fogCanvas=document.createElement('canvas');let fogKey='';
function drawFog(){const key=[camera.x,camera.y,camera.zoom,innerWidth,innerHeight,exploration.revision].join(',');if(fogKey!==key){fogCanvas.width=innerWidth+64;fogCanvas.height=innerHeight+64;const c=fogCanvas.getContext('2d');c.translate(32,32);for(let y=0;y<MAP_H;y++)for(let x=0;x<MAP_W;x++){if(exploration.sees(x,y))continue;const p=iso(x+.5,y+.5),a=TILE_W*camera.zoom/2,b=TILE_H*camera.zoom/2;if(p.x+a< -32||p.x-a>innerWidth+32||p.y+b< -32||p.y-b>innerHeight+32)continue;c.fillStyle=exploration.seen(x,y)?'rgba(3,8,4,.63)':'#030604';c.beginPath();c.moveTo(p.x-a-1,p.y);c.lineTo(p.x,p.y-b-1);c.lineTo(p.x+a+1,p.y);c.lineTo(p.x,p.y+b+1);c.closePath();c.fill();}fogKey=key;}ctx.save();ctx.filter='blur(9px)';ctx.drawImage(fogCanvas,-32,-32);ctx.restore();}

function goodIcon(k){const i=goodsOrder.indexOf(k);return i<0?'':`<i class="goods-icon" aria-hidden="true" style="background-position:${i%6/5*100}% ${Math.floor(i/6)/3*100}%"></i>`;}
function goodAmount(k,n){return `<span class="good-amount" aria-label="${n} ${goodsNames[k]}" title="${goodsNames[k]}">${goodIcon(k)}<b>${n}</b></span>`;}
function drawGeology(){
  // Walkable bedrock overlay, not loose quarry stone. Existing save terrain remains intact.
  for(const d of strategy.state.deposits){for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++){
    if(dx*dx+dy*dy>6)continue;const x=d.x+dx,y=d.y+dy,p=iso(x+.5,y+.5);if(terrain[y]?.[x]!=='grass'||p.x< -100||p.y< -100||p.x>innerWidth+100||p.y>innerHeight+100)continue;
    ctx.save();ctx.globalAlpha=.34;ctx.fillStyle='#b7b4a0';ctx.beginPath();ctx.ellipse(p.x,p.y,43*camera.zoom,22*camera.zoom,0,0,Math.PI*2);ctx.fill();ctx.globalAlpha=.55;natureSprite(4,p,32+seeded(x,y)*18);ctx.restore();
  }}
}
function drawWorkAction(w,p,kind){
  const z=camera.zoom,t=w.t||0,swing=Math.sin(t*7),side=(w.direction??2)>=3&&(w.direction??2)<=5?-1:1;
  const tool=kind==='chop'?'axe':kind==='dig'?'shovel':kind==='harvest'?'sickle':'hammer';
  ctx.save();ctx.translate(p.x+side*7*z,p.y-14*z);ctx.rotate(side*(-.35+swing*.8));goodsArt.draw(ctx,tool,0,-5*z,18*z,side<0);ctx.restore();
  if(swing>.65){ctx.fillStyle=kind==='chop'?'#dcb67a':kind==='quarry'?'#b7b7a2':'#d1bd8b';for(let i=0;i<3;i++){const phase=(t*2+i*.21)%1;ctx.fillRect(p.x+side*(9+phase*9)*z,p.y-(4+Math.sin(phase*Math.PI)*9+i)*z,2*z,2*z);}}
  const b=buildings[w.employerIndex];if(b&&['smelter','goldsmelter','toolsmith','weaponsmith','bakery'].includes(b.type)){const q=iso(b.x+.5,b.y+.5);for(let i=0;i<3;i++){const phase=(t*.3+i/3)%1;ctx.save();ctx.globalAlpha=(1-phase)*.22;ctx.fillStyle='#dfd6bb';ctx.beginPath();ctx.ellipse(q.x+(12+phase*9)*z,q.y-(60+phase*28)*z,(3+phase*6)*z,(4+phase*5)*z,0,0,Math.PI*2);ctx.fill();ctx.restore();}}
}
function updateWorkSounds(){for(const w of workers){const kind=workActivity(w,buildings,recipes,b=>strategy.depositFor(b),b=>Boolean(findPlantSite(b))),beat=Math.floor((w.t||0)*1.2);if(kind&&w.soundBeat!==beat){w.soundBeat=beat;audibleEvent(kind,w);}}}
function unitMenuArt(type){const special=['archer','pioneer','geologist'].includes(type),row=type==='geologist'?3:type==='pioneer'||type==='swordsman'?2:0;return `background-image:url("${(special?specialistAtlas:directionAtlas).src}");background-size:800% 400%;background-position:${2/7*100}% ${row/3*100}%`;}
function updateUnitStatus(){const status=document.querySelector('#unit-status');if(!status)return;const selected=workers.filter(w=>selectedWorkers.has(w.id)&&!w.dead);status.textContent=selected.length?selected.map(w=>`${unitNames[w.unit]||buildingNames[w.profession]||unitNames[w.role]||'Siedler'}: ${w.unit==='geologist'?(w.surveyStatus||'Wartet auf Suchauftrag')+' · '+(w.surveyDone||0)+' Proben':w.phase==='guard'||w.phase==='idle'?'wartet':w.phase==='staffWork'?'am Arbeitsplatz':'im Einsatz'}`).join(' · '):'Siedler auswählen oder einen Spezialisten ausbilden.';document.querySelectorAll('[data-recruit]').forEach(b=>{const count=workers.filter(w=>w.unit===b.dataset.recruit&&!w.dead&&(w.owner||1)===1).length;const el=b.querySelector('.unit-count');if(el)el.textContent=count+' vorhanden';});}
function initDetails(){
  document.querySelectorAll('[data-recruit]').forEach(b=>{const type=b.dataset.recruit;b.classList.add('unit-card');b.innerHTML=`<span class="unit-preview" role="img" aria-label="${unitNames[type]}" style='${unitMenuArt(type)}'></span><strong>${unitNames[type]}</strong><small class="unit-count"></small>${goodAmount(type==='swordsman'?'swords':type==='archer'?'bows':'tools',1)}`;});
  const units=document.querySelector('.unit-buttons'),status=document.createElement('p');status.id='unit-status';units.after(status);
  const survey=document.createElement('button');survey.id='survey-nearest';survey.textContent='Geologe: nächstes Felsgebiet untersuchen';survey.onclick=()=>{selectedTool='inspect';strategy.surveyNearest();};units.after(survey);
  const find=document.createElement('button');find.id='find-geologist';find.textContent='Geologen finden & auswählen';find.onclick=()=>{const geologists=workers.filter(w=>w.unit==='geologist'&&!w.dead&&(w.owner||1)===1);selectedWorkers.clear();for(const w of geologists)selectedWorkers.add(w.id);if(geologists.length){const p=iso(geologists[0].x,geologists[0].y);camera.x+=innerWidth/2+100-p.x;camera.y+=innerHeight/2-p.y;selectedTool='inspect';}updateUnitStatus();};units.after(find);
  const soundButton=document.createElement('button');soundButton.id='sound-button';soundButton.className='text-button';soundButton.textContent='Soundeffekte: aus';soundButton.setAttribute('aria-pressed','false');soundButton.onclick=async()=>{const enabled=await sound.setEnabled(!sound.enabled);soundButton.textContent='Soundeffekte: '+(enabled?'an':'aus');soundButton.setAttribute('aria-pressed',String(enabled));if(enabled)sound.play('complete');};document.querySelector('#power-button').after(soundButton);
  const dock=document.querySelector('.tool-dock');const show=e=>{const b=e.target.closest('.building-card');if(!b)return;const type=b.dataset.tool,d=buildDefs[type],r=recipes[type];document.querySelector('#catalog-detail').innerHTML=`<strong>${buildingNames[type]}</strong> · ${goodAmount('planks',d.wood)} ${goodAmount('stone',d.stone)}${r?'<br>'+Object.entries(r.inputs).map(([k,n])=>goodAmount(k,n)).join(' + ')+' → '+goodAmount(r.output,r.amount):'<br>'+b.querySelector('.building-purpose').textContent}`;};dock.addEventListener('pointerover',show);dock.addEventListener('focusin',show);dock.addEventListener('click',show);
  updateUnitStatus();
}
function showCommandPanel(name){document.querySelectorAll('[data-command-panel]').forEach(el=>el.classList.toggle('hidden',el.dataset.commandPanel!==name));document.querySelectorAll('[data-command-tab]').forEach(el=>{el.classList.toggle('active',el.dataset.commandTab===name);el.setAttribute('aria-pressed',String(el.dataset.commandTab===name));});}
function initCommandSidebar(){
  for(const key of ['wood','planks','stone','food'])document.querySelector('.res-icon.'+key).innerHTML=goodIcon(key);
  const sidebar=document.createElement('aside');sidebar.id='command-sidebar';sidebar.setAttribute('aria-label','Siedlungsverwaltung');
  sidebar.innerHTML='<div class="sidebar-map"></div><nav class="command-tabs" aria-label="Hauptmenü"><button data-command-tab="build" title="Bauen">Bauen</button><button data-command-tab="units" title="Siedler und Militär">Siedler</button><button data-command-tab="goods" title="Waren und Transport">Waren</button><button data-command-tab="economy" title="Produktion und Engpässe">Betriebe</button></nav><div class="command-content"><section data-command-panel="build" id="build-section"></section><section data-command-panel="units" id="units-section"></section><section data-command-panel="goods" id="goods-section"></section><section data-command-panel="economy" id="economy-section"><h2>Betriebe</h2><p>Wähle einen Betrieb, um ihn auf der Karte zu sehen.</p><div id="economy-report"></div></section><section data-command-panel="building" id="building-section"></section></div><footer class="sidebar-resources"></footer>';
  game.append(sidebar);document.querySelector('.sidebar-map').append(minimap);document.querySelector('#build-section').append(document.querySelector('.tool-dock'));
  const detail=document.createElement('p');detail.id='catalog-detail';detail.textContent='Wähle eine Baukategorie und ein Gebäude.';document.querySelector('#build-section').append(detail);
  const units=document.querySelector('.units-panel');units.open=true;document.querySelector('#units-section').append(units);
  document.querySelector('#goods-section').append(document.querySelector('#strategy-stocks'),document.querySelector('#transport-focus').parentElement);
  document.querySelector('#building-section').append(document.querySelector('#info-panel'));
  document.querySelector('.sidebar-resources').append(document.querySelector('.resource-bar'));
  document.querySelectorAll('[data-command-tab]').forEach(b=>b.onclick=()=>showCommandPanel(b.dataset.commandTab));
  document.querySelector('#economy-report').onclick=e=>{const b=e.target.closest('[data-building-index]');if(!b)return;const target=buildings[Number(b.dataset.buildingIndex)];if(!target)return;const p=iso(target.x+.5,target.y+.5);camera.x+=innerWidth/2+100-p.x;camera.y+=innerHeight/2-p.y;inspect(target);};
  showCommandPanel('build');
}
function updateEconomyReport(){const report=document.querySelector('#economy-report');if(!report)return;const html=buildings.map((b,i)=>{if((b.owner||1)!==1)return '';const r=recipes[b.type];let status=b.progress<1?'Baustelle · '+constructionStage(b.progress)+' · '+Math.round(b.progress*100)+' %':b.stopped?'Angehalten':b.ready?'Ware wartet auf Abholung':(r||b.type==='forester')&&!workforce.hasStaff(b)?'Kein Facharbeiter / Werkzeug':r?Object.entries(r.inputs).filter(([k,n])=>(b.buffer?.[k]||0)<n).map(([k])=>goodsNames[k]).join(', '):'';if(r&&status&&!status.startsWith('Kein')&&!b.ready&&!b.stopped&&b.progress>=1)status='Fehlt: '+status;if(!status&&b.progress>=1&&!b.stopped){if(b.type==='woodcutter'&&!nearby(trees,b))status='Keine ausgewachsenen Bäume im Arbeitsgebiet';if(b.type==='quarry'&&!nearby(rocks,b))status='Keine Steine im Arbeitsgebiet';if(r?.deposit&&!strategy.depositFor(b))status='Passendes Vorkommen fehlt oder ist erschöpft';if(b.type==='forester'&&!findPlantSite(b))status='Kein freier Pflanzplatz im Arbeitsgebiet';}if(!status)status=b.type==='storehouse'?'Zentrales Lager':r?'Produziert · '+Math.min(99,Math.floor((b.work||0)/r.cycle*100))+' %':'Bereit';return `<button data-building-index="${i}"><strong>${buildingNames[b.type]||b.name}</strong><span>${status}</span></button>`;}).join('');if(report.innerHTML!==html)report.innerHTML=html;}

function initSaveSlots(){
  const panel=document.querySelector('#save-slots');panel.innerHTML=[1,2,3].map(n=>`<div class="save-slot"><span id="slot-label-${n}">Platz ${n}</span><button data-store-slot="${n}">Sichern</button><button data-load-slot="${n}">Laden</button></div>`).join('');
  document.querySelectorAll('[data-store-slot]').forEach(b=>b.onclick=()=>{const key='new-shores-slot-'+b.dataset.storeSlot;if(localStorage.getItem(key)&&!confirm('Diesen Speicherplatz überschreiben?'))return;if(save()){try{localStorage.setItem(key,localStorage.getItem('new-shores-save'));localStorage.setItem(key+'-date',new Date().toLocaleString('de-DE'));refreshSaveSlots();toast('Speicherplatz gesichert');}catch{toast('Speicherplatz konnte nicht gesichert werden');}}});
  document.querySelectorAll('[data-load-slot]').forEach(b=>b.onclick=()=>restoreSnapshot(localStorage.getItem('new-shores-slot-'+b.dataset.loadSlot)));
  document.querySelector('#export-save').onclick=()=>{if(!save())return;const url=URL.createObjectURL(new Blob([localStorage.getItem('new-shores-save')],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='new-shores-spielstand.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
  document.querySelector('#import-save').onchange=async e=>{const file=e.target.files?.[0];if(!file)return;if(file.size>8_000_000)return toast('Datei ist zu groß');restoreSnapshot(await file.text());e.target.value='';};
  document.querySelector('#restore-backup').onclick=()=>restoreSnapshot(localStorage.getItem('new-shores-before-load'));
  refreshSaveSlots();
}
function refreshSaveSlots(){for(const n of [1,2,3]){const key='new-shores-slot-'+n;document.querySelector('#slot-label-'+n).textContent=localStorage.getItem(key)?'Platz '+n+' · '+(localStorage.getItem(key+'-date')||'gesichert'):'Platz '+n+' · leer';document.querySelector('[data-load-slot="'+n+'"]').disabled=!localStorage.getItem(key);}}
function restoreSnapshot(text){try{parseSave(text,['storehouse',...Object.keys(buildDefs)]);if(!save())return;localStorage.setItem('new-shores-before-load',localStorage.getItem('new-shores-save'));localStorage.setItem('new-shores-save',text);if(!load()){localStorage.setItem('new-shores-save',localStorage.getItem('new-shores-before-load'));load();throw new Error('Spielstand konnte nicht geladen werden; Sicherheitskopie wiederhergestellt');}selectedWorkers.clear();inspectedBuilding=null;settingArea=false;commandMode=false;selectedTool='inspect';showCommandPanel('build');paused=true;document.querySelector('#pause-modal').classList.remove('hidden');toast('Spielstand geladen. Vorheriger Stand bleibt als Sicherheitskopie erhalten.');}catch(e){toast('Laden abgebrochen: '+e.message);}}

import assert from 'node:assert/strict';
import {createStrategy} from '../src/strategy.js';
import {parseSave} from '../src/savegames.js';
const terrain=Array.from({length:50},()=>Array(50).fill('grass'));
function setup(){
 const buildings=[{type:'storehouse',x:20,y:20,progress:1},{type:'tower',x:25,y:25,progress:1,owner:1,garrison:0,hp:24}];
 const workers=[{id:1,unit:'swordsman',owner:2,x:29.5,y:26.5,hp:55,phase:'guard'},{id:2,unit:'archer',owner:2,x:30.5,y:26.5,hp:55,phase:'guard'}];let blocked=false;
 const strategy=createStrategy({terrain,buildings,workers,trees:[],rocks:[],resources:()=>({people:0}),selected:new Set(),hud(){},toast(){},tacticalAI:true,entrance:b=>({x:b.x+.5,y:b.y+1.5}),routeTo:(w,p)=>blocked?null:[p],followRoute:w=>{Object.assign(w,w.route.at(-1));return true;}});
 strategy.state.enemyRaids=true;return {strategy,workers,buildings,block:()=>blocked=true};
}
{
 const {strategy:s,workers:w,buildings:b}=setup();s.tick(59);assert(!w[0].raid);s.tick(1);assert(w.every(w=>w.raid));assert.equal(w[0].x,29.5,'no teleport');
 s.tickWorker(w[0],1.2);s.tickWorker(w[1],1.2);s.tickWorker(w[0],1.2);assert.equal(b[1].owner,2,'actual tower capture');s.tick(.1);s.tickWorker(w[0],.1);assert.equal(w[0].garrisonIndex,1);
 s.tick(.1);assert(!w[0].raid);assert.equal(w[1].raid.stage,'return');s.tickWorker(w[1],1.2);s.tick(1);assert(!w[1].raid);assert.equal(w[1].x,30.5);assert.equal(w.length,2,'no free recruitment');
}
for(const kind of ['disabled','blocked','strong','distant','no-sword']){
 const {strategy:s,workers:w,buildings:b,block}=setup();if(kind==='disabled')s.state.enemyRaids=false;if(kind==='blocked')block();if(kind==='strong')b[1].garrison=5;if(kind==='distant')b[1].x=2;if(kind==='no-sword')w[0].unit='archer';s.tick(60);assert(!w.some(w=>w.raid),kind);
}
for(const kind of ['disabled','wounded','demolished','timeout']){
 const {strategy:s,workers:w,buildings:b}=setup();s.tick(60);if(kind==='disabled')s.state.enemyRaids=false;if(kind==='wounded')w[0].hp=5;if(kind==='demolished')b.pop();if(kind==='timeout')w[0].raid.age=90;s.tick(.1);assert.equal(w[0].raid.stage,'return',kind);s.tickWorker(w[0],1.2);s.tick(1);assert(!w[0].raid);assert.equal(w[0].x,29.5);
}
{
 const {strategy:s,workers:w,buildings:b}=setup();s.tick(60);const saved={version:6,resources:{people:0},buildings:b,workers:w,roads:[],strategy:s.state};assert(parseSave(JSON.stringify(saved),['storehouse','tower']));w[0].raid.home.x=-1;assert.throws(()=>parseSave(JSON.stringify(saved),['storehouse','tower']));s.restore({initialized:true,claims:[],deposits:[]});assert.equal(s.state.enemyRaids,false);assert.equal(s.state.raidClock,0);
}
console.log('PASS: finite squad planning, guarded target choice, physical assault/capture, return, disable, losses, blocked routes, timeout and save compatibility');

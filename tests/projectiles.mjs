import assert from 'node:assert/strict';
import {createStrategy} from '../src/strategy.js';
const workers=[{id:1,unit:'archer',owner:1,x:20,y:20,hp:55,phase:'guard'},{id:2,unit:'swordsman',owner:2,x:23,y:20,hp:7,phase:'guard'}];
const s=createStrategy({workers,terrain:Array.from({length:50},()=>Array(50).fill('grass')),buildings:[],trees:[],rocks:[],resources:()=>({people:1}),selected:new Set(),toast(){},hud(){}});
s.tickWorker(workers[0],.1);assert.equal(workers[1].hp,7,'no damage before impact');assert.equal(s.state.projectiles.length,1);
s.tick(.1);assert.equal(workers[1].hp,7);assert.ok(s.state.projectiles[0].x>20);
s.restore(JSON.parse(JSON.stringify(s.state)));s.tick(1);assert.equal(workers[1].dead,true);assert.equal(s.state.projectiles.length,0);
workers[1].dead=false;workers[1].hp=55;workers[0].cooldown=0;s.tickWorker(workers[0],.1);workers[1].dead=true;s.tick(.1);assert.equal(s.state.projectiles.length,0,'dead target removes projectile without second kill');
console.log('PASS: projectile flight, delayed damage, saved flight and dead-target cleanup');

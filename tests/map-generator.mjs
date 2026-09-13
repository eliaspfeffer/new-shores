import assert from 'node:assert/strict';
import {generateMap,validMapConfig} from '../src/map-generator.js';
import {parseSave} from '../src/savegames.js';
import {shoreEdges} from '../src/shoreline.js';
const config=(type,seed)=>({version:1,type,seed});
assert.deepEqual(generateMap(config('lake',123)),generateMap(config('lake',123)));
assert.notDeepEqual(generateMap(config('lake',123)),generateMap(config('lake',124)));
assert.notDeepEqual(generateMap(config('lake',123)),generateMap(config('coast',123)));
const coast=shoreEdges([['grass','grass','grass','grass','grass'],['grass','water','grass','water','grass'],['grass','grass','grass','grass','grass']]);
assert.equal(coast.length,8,'separate closed boundaries around two ponds');
assert(coast.every(([a,b])=>Math.hypot(a[0]-b[0],a[1]-b[1])===1),'no long false water connection');
for(const seed of [0,1,4294967295,...Array.from({length:80},(_,i)=>i*7919)])for(const type of ['coast','lake']){
 const m=generateMap(config(type,seed)),blocked=new Set([...m.trees,...m.rocks,{x:25,y:25},{x:37,y:14}].map(p=>p.x+','+p.y));
 assert.equal(new Set([...m.trees,...m.rocks].map(p=>p.x+','+p.y)).size,m.trees.length+m.rocks.length);
 assert(m.trees.length>=9);assert(m.rocks.length>=9);assert(m.terrain.some(r=>r.includes('water')));
 assert([...m.trees,...m.rocks,...m.details].every(p=>m.terrain[p.y][p.x]==='grass'));
 const reachable=new Set(['25,26']),queue=[[25,26]];
 for(let i=0;i<queue.length;i++){const [x,y]=queue[i];for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const a=x+dx,b=y+dy,k=a+','+b;if(['grass','shore'].includes(m.terrain[b]?.[a])&&!blocked.has(k)&&!reachable.has(k)){reachable.add(k);queue.push([a,b]);}}}
 for(const [x,y] of [[18,22],[31,26],[30,18],[18,31],[37,15],[38,14]])assert(reachable.has(x+','+y),`${type}/${seed}: anchor ${x},${y}`);
 for(const list of [m.trees,m.rocks])assert(list.some(p=>Math.hypot(p.x-25,p.y-25)<10&&[[1,0],[-1,0],[0,1],[0,-1]].some(([dx,dy])=>reachable.has((p.x+dx)+','+(p.y+dy)))),'reachable starter supply');
 assert(queue.some(([x,y])=>[[1,0],[-1,0],[0,1],[0,-1]].some(([dx,dy])=>m.terrain[y+dy]?.[x+dx]==='water')),'reachable fishing shore');
}
for(const c of [config('x',1),config('lake',-1),config('lake',1.5),config('coast',4294967296),{version:2,type:'coast',seed:1}])assert(!validMapConfig(c));
const m=generateMap(config('lake',123)),s={version:6,mapConfig:config('lake',123),...m,resources:{wood:24},buildings:[{type:'storehouse',x:25,y:25,progress:1}],roads:[]};
assert.deepEqual(parseSave(JSON.stringify(s),['storehouse']).terrain,m.terrain);
delete s.mapConfig;delete s.details;assert(parseSave(JSON.stringify(s),['storehouse']),'legacy remains loadable');s.mapConfig=config('lake',-1);assert.throws(()=>parseSave(JSON.stringify(s),['storehouse']));
console.log('PASS: deterministic/distinct seeds and layouts, 166 playable maps, reachable deposits/enemy/timber/stone/fishing, valid details and old/new save formats');

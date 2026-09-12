import assert from 'node:assert/strict';
import {buildingContext} from '../src/building-context.js';
const build={type:'house',progress:.4,materials:{planks:4},buffer:{planks:2}};
assert.deepEqual(buildingContext(build,{}).items,[{key:'planks',value:2,target:4}]);build.materialsSpent=true;assert.equal(buildingContext(build,{}).items[0].value,4);
assert.equal(buildingContext({type:'tower',progress:1,garrison:2},{}).status,'Besatzung: 2 · Stärke: 100');
assert.equal(buildingContext({type:'warehouse',progress:1,stored:{wood:3}},{wood:99}).items[0].value,3);
assert.equal(buildingContext({type:'coalmine',progress:1,buffer:{fish:1}},{}).items.find(i=>i.key==='fish').value,1);
assert.equal(buildingContext({type:'barracks',progress:1,stopped:true},{}).status,'Angehalten');
console.log('PASS: live building stock, construction delivery/spent materials, mine meals and contextual status');

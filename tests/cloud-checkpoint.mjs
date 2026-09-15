import assert from 'node:assert/strict';
import {canLoadRemote} from '../src/cloud-checkpoint.js';
const base={savedAt:1,journal:[],camera:{x:1},elapsed:4,buildings:[{type:'house',progress:.2}]};
assert.ok(canLoadRemote(JSON.stringify({...base,savedAt:2,journal:[{text:'Loaded'}],camera:{x:4}}),JSON.stringify(base)));
assert.equal(canLoadRemote(JSON.stringify({...base,elapsed:5}),JSON.stringify(base)),false,'unsent simulation progress must never be discarded');
assert.equal(canLoadRemote(JSON.stringify(base),null),false,'legacy saves require an explicit choice before replacing');
console.log('PASS cloud reconciliation preserves unsent worlds');

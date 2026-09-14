import assert from 'node:assert/strict';
import {touchLayout} from '../src/device-mode.js';
assert.equal(touchLayout({search:'?mobile=1',coarse:false,hover:true,maxTouchPoints:0}),false);
assert.equal(touchLayout({search:'?mobile=0',coarse:true,hover:false,maxTouchPoints:5}),true);
assert.equal(touchLayout({coarse:false,hover:true,maxTouchPoints:10}),false,'touch laptop with mouse stays desktop');
assert.equal(touchLayout({search:'?ui=mobile'}),true);
assert.equal(touchLayout({search:'?ui=desktop',coarse:true,hover:false,maxTouchPoints:5}),false);
console.log('PASS automatic device mode, stale shared links and deliberate previews');

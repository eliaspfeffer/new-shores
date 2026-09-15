import assert from 'node:assert/strict';
import {createJournal} from '../src/command-journal.js';
const journal=createJournal();for(let i=0;i<40;i++)journal.add('Meldung '+i,i);
assert.equal(journal.list().length,15);assert.equal(journal.list()[0].text,'Meldung 25');
journal.restore(Array.from({length:100},(_,i)=>({text:String(i),time:i,count:1})));
assert.equal(journal.list().length,15);journal.add('99',101);assert.equal(journal.list().at(-1).count,2);
console.log('PASS: old and new journals retain the latest 15 messages');

import assert from 'node:assert/strict';
import {checkoutTool,returnTool,toolTypes} from '../src/tools.js';
import {createStrategy,recipes} from '../src/strategy.js';
const stock={axe:1,hammer:1,tools:1};assert.equal(checkoutTool(stock,'woodcutter'),'axe');assert.equal(stock.axe,0);assert.equal(checkoutTool(stock,'pioneer'),'tools');assert.equal(checkoutTool(stock,'pioneer'),false);assert.equal(checkoutTool(stock,'forester'),null);returnTool(stock,'axe');assert.equal(stock.axe,1);
const buildings=[],workers=[],s=createStrategy({terrain:Array.from({length:50},()=>Array(50).fill('grass')),buildings,workers,trees:[],rocks:[],resources:()=>stock,selected:new Set(),toast(){},hud(){}});
for(const tool of toolTypes){const b={type:'toolsmith',progress:1,toolChoice:tool,buffer:{coal:1,iron:1}};s.produce(b,1);b.toolChoice=tool==='axe'?'hammer':'axe';s.produce(b,recipes.toolsmith.cycle);assert.equal(b.ready,tool,'in-progress tool is not replaced by new menu choice');assert.equal(b.outputAmount,1);assert.equal(b.buffer.iron,0);}
console.log('PASS: typed checkout, free professions, legacy kits, exact refund and all seven forge outputs');

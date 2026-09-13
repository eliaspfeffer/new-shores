import assert from 'node:assert/strict';
import {statSync,readFileSync} from 'node:fs';
import {sampleEffects} from '../src/audio-samples.js';
import {effects,createSound} from '../src/sound.js';
const urls=[...new Set(Object.values(sampleEffects).flatMap(s=>s.files))];
assert.equal(urls.length,10);
let bytes=0;for(const url of urls){const file=new URL(url);bytes+=statSync(file).size;assert(readFileSync(file).length>1000);}
assert(bytes<200000,'small embedded sound pack');
for(const [kind,spec] of Object.entries(sampleEffects)){assert(effects[kind]);assert(spec.gain>0&&spec.gain<=.4);assert(spec.cooldown>=.25);}
// Fake AudioContext: validate buffer reuse, variant switching and failed-file fallback.
const prior={AudioContext:globalThis.AudioContext,fetch:globalThis.fetch};let downloads=0,decoded=0,started=[];
class Node {constructor(){this.gain=this.frequency=this.pan={value:0,setValueAtTime(){},exponentialRampToValueAtTime(){},setTargetAtTime(){}};}connect(){}disconnect(){}start(){started.push(this.buffer);this.onended?.();}stop(){}}
globalThis.AudioContext=class{constructor(){this.currentTime=0;this.state='suspended';this.sampleRate=100;this.destination={};}createGain(){return new Node()}createBiquadFilter(){return new Node()}createStereoPanner(){return new Node()}createBufferSource(){return new Node()}createOscillator(){return new Node()}createBuffer(){return {getChannelData:()=>new Float32Array(200)}}async resume(){this.state='running'}async suspend(){this.state='suspended'}async decodeAudioData(){return {duration:.6,id:++decoded}}};
try{
 globalThis.fetch=async()=>{downloads++;return {ok:true,arrayBuffer:async()=>new ArrayBuffer(10)}};
 const s=createSound();s.setVolume('music',0);s.setVolume('ambience',0);await s.setEnabled(true);await s.whenSamplesReady();assert.equal(s.diagnostics.samples,10);s.play('build');assert.equal(s.diagnostics.samplePlays,1);assert.equal(s.play('build'),false,'duplicate suppressed');await s.setEnabled(false);await s.setEnabled(true);assert.equal(downloads,10,'decode once across mute/resume');await s.setEnabled(false);
 globalThis.fetch=async()=>{throw Error('offline cache missing')};const fallback=createSound();await fallback.setEnabled(true);await fallback.whenSamplesReady();assert.equal(fallback.diagnostics.sampleFailures,10);assert.equal(fallback.play('build'),true);assert.equal(fallback.diagnostics.samplePlays,0);await fallback.setEnabled(false);
}finally{globalThis.AudioContext=prior.AudioContext;globalThis.fetch=prior.fetch;}
console.log('PASS: CC0 files and bounds, decoded playback, rate limit, reusable buffers and download-failure fallback');

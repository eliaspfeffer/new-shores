import assert from 'node:assert/strict';
import {createApp} from '../server/app.mjs';
const waiting=[];
const pool={query:async sql=>{if(sql==='SELECT 1')return new Promise(resolve=>waiting.push(resolve));return {rows:[]};}};
const origin='https://settler.eliaspfeffer.de';
const server=await createApp({pool,origin});await new Promise(r=>server.listen(0,'127.0.0.1',r));
const url='http://127.0.0.1:'+server.address().port;
try{
 const wrong=await fetch(url+'/api/register',{method:'POST',headers:{Origin:'https://evil.example','Content-Type':'application/json'},body:'{}'});assert.equal(wrong.status,403);
 assert.match(wrong.headers.get('content-security-policy'),/script-src 'self'/);
 assert.equal(wrong.headers.get('x-frame-options'),'DENY');
 const large=await fetch(url+'/api/register',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:JSON.stringify({password:'x'.repeat(5000)})});assert.equal(large.status,413);
 const pending=Array.from({length:8},()=>fetch(url+'/api/health'));
 for(let i=0;i<100&&waiting.length<8;i++)await new Promise(r=>setTimeout(r,10));
 assert.equal(waiting.length,8);assert.equal((await fetch(url+'/api/health')).status,429);
 waiting.forEach(r=>r({rows:[]}));assert.ok((await Promise.all(pending)).every(r=>r.status===200));
 assert.equal((await fetch(url+'/api/me')).status,401,'slots released after response');
 console.log('PASS: API concurrency cap, release, auth payload bound, CSRF and security headers');
}finally{waiting.forEach(r=>r({rows:[]}));server.closeAllConnections();await new Promise(r=>server.close(r));}

import assert from 'node:assert/strict';
import {createApp} from '../../server/app.mjs';

// Requires npm run build; no database or real account is touched.
const server=await createApp({pool:{query(){throw new Error('Unexpected database access');}},origin:'https://settler.eliaspfeffer.de'});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const origin=`http://127.0.0.1:${server.address().port}`;
try{
  for(const path of ['/', '/?embed=anything', '/api/me?embed=whip']){
    const response=await fetch(origin+path);
    assert.equal(response.headers.get('x-frame-options'),'DENY');
    assert.ok(response.headers.get('content-security-policy').includes("frame-ancestors 'none'"));
  }
  const response=await fetch(origin+'/?embed=whip');
  assert.equal(response.status,200);
  assert.equal(response.headers.get('x-frame-options'),null);
  assert.ok(response.headers.get('content-security-policy').includes('frame-ancestors https://whip.run;'));
  assert.ok((await response.text()).includes('New Shores'));
  const forbidden=await fetch(origin+'/api/register?embed=whip',{method:'POST',headers:{Origin:'https://whip.run','Content-Type':'application/json'},body:'{}'});
  assert.equal(forbidden.status,403,'Whip is not granted API/CSRF privileges');
  console.log('PASS Whip framing: exact opt-in, restricted ancestor, ordinary pages/API remain protected');
}finally{await new Promise(resolve=>server.close(resolve));}

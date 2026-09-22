import assert from 'node:assert/strict';
import {createEmailService} from '../server/email.mjs';

assert.equal(createEmailService({}).enabled,false);
const calls=[];
const mail=createEmailService({RESEND_API_KEY:'test-key',MAIL_FROM:'New Shores <noreply@example.invalid>',APP_ORIGIN:'https://settler.example'},async(url,options)=>{calls.push({url,options});return {ok:true};});
assert.equal(mail.enabled,true);
assert.equal(await mail.verify('player@example.invalid','verify-token'),true);
assert.equal(await mail.reset('player@example.invalid','reset-token'),true);
assert.equal(calls.length,2);
const verification=JSON.parse(calls[0].options.body),reset=JSON.parse(calls[1].options.body);
assert.match(verification.html,/verify=1&amp;token=|verify=1&token=/);
assert.match(verification.text,/verify=1&token=verify-token/);
assert.match(reset.text,/reset=1&token=reset-token/);
assert.equal(calls[0].options.headers.Authorization,'Bearer test-key');
console.log('PASS: optional transactional email service, one-time verification and reset links');

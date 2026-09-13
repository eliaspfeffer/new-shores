import {randomBytes,scrypt as derive,timingSafeEqual,createHash} from 'node:crypto';
import {promisify} from 'node:util';
const scrypt=promisify(derive);
export const token=()=>randomBytes(32).toString('base64url');
export const digest=value=>createHash('sha256').update(value).digest('hex');
export function emailAddress(value){
  if(typeof value!=='string'||value.length>254||! /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))throw new Error('Bitte eine gültige E-Mail-Adresse eingeben.');
  return value.trim().toLowerCase();
}
export async function passwordHash(password){
  if(typeof password!=='string'||password.length<12||password.length>128)throw new Error('Passwort: 12 bis 128 Zeichen.');
  const salt=randomBytes(16).toString('hex');
  const key=await scrypt(password,salt,64,{N:32768,r:8,p:1,maxmem:64*1024*1024});
  return salt+':'+key.toString('hex');
}
export async function passwordMatches(password,hash){
  if(typeof password!=='string'||password.length>128)return false;
  const [salt,hex]=hash.split(':');
  const key=await scrypt(password,salt,64,{N:32768,r:8,p:1,maxmem:64*1024*1024});
  const expected=Buffer.from(hex,'hex');return key.length===expected.length&&timingSafeEqual(key,expected);
}
export function limiter(max,windowMs){
  const entries=new Map();return key=>{const now=Date.now();if(entries.size>10000)for(const [k,v] of entries)if(v.until<now)entries.delete(k);
    let entry=entries.get(key);if(!entry||entry.until<now){entry={count:0,until:now+windowMs};entries.set(key,entry);}return ++entry.count<=max;};
}

import {defineConfig} from 'vite';
import {createHash} from 'node:crypto';
export default defineConfig({plugins:[{name:'offline-game',generateBundle(_,bundle){
  const files=['/','/index.html','/manifest.webmanifest','/icon.svg',...Object.keys(bundle).filter(f=>f!=='index.html').map(f=>'/'+f)];
  const version=createHash('sha256').update(JSON.stringify(bundle)).digest('hex').slice(0,12);
  this.emitFile({type:'asset',fileName:'sw.js',source:`const CACHE='new-shores-${version}',FILES=${JSON.stringify(files)};
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(FILES))));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('new-shores-')&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{if(event.request.method!=='GET'||new URL(event.request.url).origin!==self.location.origin)return;event.respondWith(caches.open(CACHE).then(async cache=>{const url=new URL(event.request.url);const hit=await cache.match(event.request.mode==='navigate'?'/index.html':url.pathname);return hit||fetch(event.request);}));});`});
}}]});

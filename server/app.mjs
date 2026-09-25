import http from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {randomUUID} from 'node:crypto';
import pg from 'pg';
import {token,digest,emailAddress,passwordHash,passwordMatches,limiter} from './security.mjs';
import {parseSave} from '../src/savegames.js';
import {extraBuildings} from '../src/strategy.js';
import {sendDelivery} from './deliveries.mjs';
import {createEmailService} from './email.mjs';
import {promoteIslandToWorld,repackWorld,visibleIslandState,worldSlotOrigin,SHARED_WORLD_CAPACITY,SHARED_WORLD_SIZE,SHARED_WORLD_CELL_SIZE} from '../src/shared-world.js';

export const saveTypes=['largehouse','storehouse','woodcutter','forester','sawmill','house','quarry','farm','mill','bakery','fisher','warehouse','tower','hospital',...Object.keys(extraBuildings)];
const root=resolve(fileURLToPath(new URL('../dist',import.meta.url)));
const uuid=value=>/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(value||'');
const fail=(status,message)=>Object.assign(new Error(message),{status});
const name=value=>typeof value==='string'&&value.trim()?value.trim().slice(0,48):'Meine Insel';
export async function createApp({pool,origin,origins=[origin],secure=true,emailService={enabled:false}}){
  const allowedOrigins=new Set(origins);let authBusy=0,apiBusy=0;
  const authLimit=limiter(20,15*60_000),apiLimit=limiter(240,60_000);
  const messageLimit=limiter(8,60_000),streams=new Map(),worldStreams=new Set(),leases=new Map();
  const dummy=await passwordHash(token());
  async function body(req,max=8_100_000){let data='';for await(const chunk of req){data+=chunk;if(Buffer.byteLength(data)>max)throw fail(413,'Anfrage zu groß.');}try{return JSON.parse(data||'{}');}catch{throw fail(400,'Ungültige Anfrage.');}}
  const cookie=(res,value,age)=>res.setHeader('Set-Cookie',`ns_session=${value}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${age}${secure?'; Secure':''}`);
  async function session(req){const raw=(req.headers.cookie||'').split(';').map(s=>s.trim()).find(s=>s.startsWith('ns_session='))?.slice(11);
    if(!raw)return null;return (await pool.query('SELECT p.id,p.email,p.email_verified_at,s.hash session_hash FROM sessions s JOIN players p ON p.id=s.player_id WHERE s.hash=$1 AND s.expires_at>now()',[digest(raw)])).rows[0]||null;}
  async function access(player,id){if(!uuid(id))throw fail(404,'Insel nicht gefunden.');const result=await pool.query(`SELECT i.*,CASE WHEN i.owner_id=$2 THEN 'owner' ELSE m.permission END permission FROM islands i LEFT JOIN island_members m ON m.island_id=i.id AND m.player_id=$2 WHERE i.id=$1 AND (i.owner_id=$2 OR m.player_id=$2)`,[id,player.id]);if(!result.rows.length)throw fail(404,'Insel nicht gefunden.');return result.rows[0];}
  const validate=s=>{try{return parseSave(JSON.stringify(s),saveTypes);}catch(e){throw fail(400,e.message);}};
  const publish=(islandId,event)=>{for(const res of streams.get(islandId)||[]){if(res.destroyed)continue;res.write(`event: ${event.type||'update'}\ndata: ${JSON.stringify(event)}\n\n`);}};
  const publishWorld=event=>{for(const res of worldStreams)if(!res.destroyed)res.write(`event: ${event.type||'update'}\ndata: ${JSON.stringify(event)}\n\n`);};
  async function claimWorldIsland(player,preferredId=null){
    const client=await pool.connect();try{
      await client.query('BEGIN');await client.query('SELECT pg_advisory_xact_lock(442817)');
      let row=(await client.query('SELECT * FROM islands WHERE owner_id=$1 AND world_slot IS NOT NULL ORDER BY updated_at DESC LIMIT 1 FOR UPDATE',[player.id])).rows[0];
      if(row&&row.snapshot.worldSize!==SHARED_WORLD_SIZE){
        const snapshot=validate(repackWorld(row.snapshot,row.world_slot));
        await client.query('INSERT INTO island_history(island_id,revision,snapshot) VALUES($1,$2,$3) ON CONFLICT DO NOTHING',[row.id,row.revision,row.snapshot]);
        row=(await client.query('UPDATE islands SET snapshot=$2,revision=revision+1,updated_at=now() WHERE id=$1 RETURNING *',[row.id,snapshot])).rows[0];
      }
      if(!row){
        row=(await client.query("SELECT * FROM islands WHERE owner_id=$1 AND (snapshot->>'mode'='multiplayer' OR snapshot->>'mode' IS NULL) AND ($2::uuid IS NULL OR id=$2) ORDER BY (snapshot->>'mode'='multiplayer') DESC,updated_at DESC LIMIT 1 FOR UPDATE",[player.id,uuid(preferredId)?preferredId:null])).rows[0];
        if(!row){await client.query('COMMIT');return null;}
        const used=new Set((await client.query('SELECT world_slot FROM islands WHERE world_slot IS NOT NULL')).rows.map(r=>r.world_slot));
        const slot=Array.from({length:SHARED_WORLD_CAPACITY},(_,i)=>i).find(i=>!used.has(i));
        if(slot===undefined)throw fail(409,'Europa 1 ist voll. Für weitere Inseln muss die Welt erweitert werden.');
        const snapshot=validate(promoteIslandToWorld(row.snapshot,slot));
        await client.query('INSERT INTO island_history(island_id,revision,snapshot) VALUES($1,$2,$3) ON CONFLICT DO NOTHING',[row.id,row.revision,row.snapshot]);
        row=(await client.query('UPDATE islands SET snapshot=$2,world_slot=$3,revision=revision+1,updated_at=now() WHERE id=$1 RETURNING *',[row.id,snapshot,slot])).rows[0];
      }
      await client.query('COMMIT');publishWorld({type:'island',id:row.id,revision:row.revision});
      return {id:row.id,name:row.name,revision:row.revision,snapshot:row.snapshot,permission:'owner',worldSlot:row.world_slot};
    }catch(e){await client.query('ROLLBACK');throw e;}finally{client.release();}
  }
  async function issueAccountToken(player,purpose){
    const raw=token(),minutes=purpose==='reset'?30:1440;
    await pool.query('DELETE FROM account_tokens WHERE player_id=$1 AND purpose=$2',[player.id,purpose]);
    await pool.query("INSERT INTO account_tokens(hash,player_id,purpose,expires_at) VALUES($1,$2,$3,now()+($4 || ' minutes')::interval)",[digest(raw),player.id,purpose,String(minutes)]);
    const sent=purpose==='reset'?await emailService.reset?.(player.email,raw):await emailService.verify?.(player.email,raw);
    return Boolean(sent);
  }
  return http.createServer(async(req,res)=>{
    res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','same-origin');res.setHeader('X-Frame-Options','DENY');
    res.setHeader('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; media-src 'self' blob:; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'");
    res.setHeader('Permissions-Policy','camera=(), microphone=(), geolocation=(), payment=(), usb=()');
    if(secure)res.setHeader('Strict-Transport-Security','max-age=31536000; includeSubDomains');
    const json=(status,value)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(value));};
    try{
      const url=new URL(req.url,origin),path=url.pathname;
      if(path.startsWith('/api/')){
        const streaming=req.method==='GET'&&(path==='/api/world/events'||/^\/api\/islands\/[^/]+\/events$/.test(path));
        if(!streaming){if(apiBusy>=8)throw fail(429,'Server ausgelastet. Kurz warten.');apiBusy++;let released=false;const release=()=>{if(!released){released=true;apiBusy--;}};res.once('finish',release);res.once('close',release);}
        if(!apiLimit(req.socket.remoteAddress))throw fail(429,'Zu viele Anfragen. Kurz warten.');
        if(!['GET','HEAD'].includes(req.method)&&(!allowedOrigins.has(req.headers.origin)||!req.headers['content-type']?.startsWith('application/json')))throw fail(403,'Anfrage nur aus dem Spiel erlaubt.');
        if(path==='/api/health'&&req.method==='GET'){await pool.query('SELECT 1');return json(200,{ok:true});}
        if(['/api/login','/api/register'].includes(path)&&req.method==='POST'){
          const data=await body(req,4096);let email;try{email=emailAddress(data.email);}catch(e){throw fail(400,e.message);}
          if(!authLimit('ip:'+req.socket.remoteAddress)||!authLimit('email:'+email))throw fail(429,'Zu viele Anmeldeversuche. In 15 Minuten erneut versuchen.');
          if(authBusy>=2)throw fail(429,'Anmeldung ausgelastet. Kurz warten.');
          authBusy++;try{
          let player=(await pool.query('SELECT * FROM players WHERE email=$1',[email])).rows[0];
          if(path==='/api/register'){
            // Retrying a successful registration with the same credentials is safe.
            // Never overwrite the password or data of an existing account.
            if(player){if(!await passwordMatches(data.password,player.password_hash))throw fail(409,'Für diese E-Mail besteht bereits ein Konto. Bitte mit dem ursprünglichen Passwort anmelden. Dein Konto und deine Inseln bleiben unverändert.');}
            else{let hash;try{hash=await passwordHash(data.password);}catch(e){throw fail(400,e.message);}player={id:randomUUID(),email,email_verified_at:emailService.enabled?null:new Date()};
            await pool.query('INSERT INTO players(id,email,password_hash,email_verified_at) VALUES($1,$2,$3,$4)',[player.id,email,hash,player.email_verified_at]);}
          }else if(!await passwordMatches(data.password,player?.password_hash||dummy)||!player)throw fail(401,'E-Mail oder Passwort stimmt nicht.');
          if(path==='/api/register'&&emailService.enabled&&!player.email_verified_at){const sent=await issueAccountToken(player,'verify');return json(202,{verificationRequired:true,emailSent:sent});}
          if(path==='/api/login'&&emailService.enabled&&!player.email_verified_at)throw fail(403,'E-Mail-Adresse noch nicht bestätigt. Bitte den Bestätigungslink verwenden.');
          const raw=token();await pool.query('DELETE FROM sessions WHERE expires_at<now()');
          await pool.query("INSERT INTO sessions VALUES($1,$2,now()+interval '30 days')",[digest(raw),player.id]);cookie(res,raw,30*86400);return json(200,{id:player.id,email:player.email});
          }finally{authBusy--;}
        }
        if(path==='/api/forgot-password'&&req.method==='POST'){
          const data=await body(req,4096);let email;try{email=emailAddress(data.email);}catch(e){throw fail(400,e.message);}
          if(!authLimit('forgot-ip:'+req.socket.remoteAddress)||!authLimit('forgot-email:'+email))throw fail(429,'Zu viele Anfragen. Bitte später erneut versuchen.');
          const player=(await pool.query('SELECT id,email FROM players WHERE email=$1',[email])).rows[0];
          if(player&&emailService.enabled)await issueAccountToken(player,'reset');
          return json(200,{ok:true,emailAvailable:emailService.enabled});
        }
        if(['/api/verify-email','/api/reset-password'].includes(path)&&req.method==='POST'){
          const data=await body(req,4096);if(typeof data.token!=='string'||data.token.length<20||data.token.length>200)throw fail(400,'Link ungültig oder unvollständig.');
          const purpose=path==='/api/verify-email'?'verify':'reset',client=await pool.connect();try{await client.query('BEGIN');const row=(await client.query('SELECT t.*,p.email FROM account_tokens t JOIN players p ON p.id=t.player_id WHERE t.hash=$1 AND t.purpose=$2 AND t.used_at IS NULL AND t.expires_at>now() FOR UPDATE',[digest(data.token),purpose])).rows[0];if(!row)throw fail(400,'Link ungültig, abgelaufen oder bereits verwendet.');
            if(purpose==='verify')await client.query('UPDATE players SET email_verified_at=now() WHERE id=$1',[row.player_id]);
            else{let hash;try{hash=await passwordHash(data.password);}catch(e){throw fail(400,e.message);}await client.query('UPDATE players SET password_hash=$2,email_verified_at=COALESCE(email_verified_at,now()) WHERE id=$1',[row.player_id,hash]);await client.query('DELETE FROM sessions WHERE player_id=$1',[row.player_id]);}
            await client.query('UPDATE account_tokens SET used_at=now() WHERE hash=$1',[row.hash]);await client.query('COMMIT');return json(200,{ok:true});
          }catch(e){await client.query('ROLLBACK');throw e;}finally{client.release();}
        }
        const player=await session(req);if(!player)throw fail(401,'Bitte anmelden.');
        if(path==='/api/me'&&req.method==='GET')return json(200,{id:player.id,email:player.email,verified:Boolean(player.email_verified_at),emailAvailable:emailService.enabled});
        if(path==='/api/change-password'&&req.method==='POST'){
          const data=await body(req,4096),record=(await pool.query('SELECT password_hash FROM players WHERE id=$1',[player.id])).rows[0];
          if(!record||!await passwordMatches(data.currentPassword,record.password_hash))throw fail(401,'Aktuelles Passwort stimmt nicht.');
          let hash;try{hash=await passwordHash(data.newPassword);}catch(e){throw fail(400,e.message);}await pool.query('UPDATE players SET password_hash=$2 WHERE id=$1',[player.id,hash]);await pool.query('DELETE FROM sessions WHERE player_id=$1 AND hash<>$2',[player.id,player.session_hash]);return json(200,{ok:true});
        }
        if(path==='/api/account'&&req.method==='DELETE'){
          const data=await body(req,4096),record=(await pool.query('SELECT password_hash FROM players WHERE id=$1',[player.id])).rows[0];if(!record||!await passwordMatches(data.password,record.password_hash))throw fail(401,'Passwort stimmt nicht.');
          const client=await pool.connect();try{await client.query('BEGIN');await client.query('DELETE FROM goods_transfers WHERE sender_id=$1 OR source_id IN (SELECT id FROM islands WHERE owner_id=$1) OR target_id IN (SELECT id FROM islands WHERE owner_id=$1)',[player.id]);await client.query('DELETE FROM invitations WHERE island_id IN (SELECT id FROM islands WHERE owner_id=$1) OR used_by=$1',[player.id]);await client.query('DELETE FROM island_members WHERE player_id=$1 OR island_id IN (SELECT id FROM islands WHERE owner_id=$1)',[player.id]);await client.query('DELETE FROM island_history WHERE island_id IN (SELECT id FROM islands WHERE owner_id=$1)',[player.id]);await client.query('DELETE FROM island_messages WHERE player_id=$1 OR island_id IN (SELECT id FROM islands WHERE owner_id=$1)',[player.id]);await client.query('DELETE FROM islands WHERE owner_id=$1',[player.id]);await client.query('DELETE FROM sessions WHERE player_id=$1',[player.id]);await client.query('DELETE FROM players WHERE id=$1',[player.id]);await client.query('COMMIT');cookie(res,'',0);return json(200,{ok:true});}catch(e){await client.query('ROLLBACK');throw e;}finally{client.release();}
        }
        if(path==='/api/deliveries'&&req.method==='POST')return json(200,await sendDelivery(pool,player,await body(req),validate));
        if(path==='/api/deliveries'&&req.method==='GET')return json(200,(await pool.query('SELECT g.id,g.item,g.amount,g.created_at,g.delivery_x,g.delivery_y,s.name source_name,t.name target_name,CASE WHEN t.owner_id=$1 THEN true ELSE false END incoming FROM goods_transfers g JOIN islands s ON s.id=g.source_id JOIN islands t ON t.id=g.target_id WHERE s.owner_id=$1 OR t.owner_id=$1 ORDER BY g.created_at DESC LIMIT 50',[player.id])).rows);
        if(path==='/api/logout'&&req.method==='POST'){const raw=(req.headers.cookie||'').split(';').map(s=>s.trim()).find(s=>s.startsWith('ns_session='))?.slice(11);if(raw)await pool.query('DELETE FROM sessions WHERE hash=$1',[digest(raw)]);cookie(res,'',0);return json(200,{ok:true});}
        if(path==='/api/world/claim'&&req.method==='POST')return json(200,await claimWorldIsland(player,(await body(req,1024)).islandId));
        if(path==='/api/world/positions'&&req.method==='POST'){
          const data=await body(req,262144),island=await access(player,data.islandId);
          if(island.world_slot===null||island.permission==='view')throw fail(403,'Keine steuerbare Multiplayer-Insel.');
          const validPoint=p=>p&&Number.isInteger(p.id)&&Number.isFinite(p.x)&&Number.isFinite(p.y)&&p.x>=0&&p.y>=0&&p.x<SHARED_WORLD_SIZE&&p.y<SHARED_WORLD_SIZE;
          if(!Array.isArray(data.workers)||data.workers.length>5000||data.workers.some(p=>!validPoint(p))||!Array.isArray(data.ships)||data.ships.length>100||data.ships.some(p=>!validPoint(p)))throw fail(400,'Ungültige Live-Positionen.');
          const workers=data.workers.map(({id,x,y,unit,role,phase,t,direction,hp,maxHp,rank,carry})=>({id,x,y,unit,role,phase,t,direction,hp,maxHp,rank,carry}));
          const ships=data.ships.map(({id,x,y,type,status,hp})=>({id,x,y,type,status,hp}));
          publishWorld({type:'positions',id:island.id,workers,ships});return json(200,{ok:true});
        }
        if(path==='/api/world/state'&&req.method==='GET'){
          const rows=(await pool.query('SELECT id,name,revision,world_slot,snapshot FROM islands WHERE world_slot IS NOT NULL ORDER BY world_slot LIMIT 9')).rows;
          return json(200,rows.map(visibleIslandState));
        }
        if(path==='/api/world/events'&&req.method==='GET'){
          if(worldStreams.size>=64)throw fail(429,'Zu viele Weltverbindungen.');
          res.writeHead(200,{'Content-Type':'text/event-stream; charset=utf-8','Cache-Control':'no-store','Connection':'keep-alive','X-Accel-Buffering':'no'});
          res.write('event: ready\ndata: {}\n\n');worldStreams.add(res);
          const ping=setInterval(()=>res.write(': heartbeat\n\n'),20000);req.on('close',()=>{clearInterval(ping);worldStreams.delete(res);});return;
        }
        if(path==='/api/world'&&req.method==='GET'){
          const rows=(await pool.query(`SELECT i.id,i.updated_at,i.accept_deliveries,i.owner_id,i.world_slot,p.email AS owner_email,
            CASE WHEN i.owner_id=$1 THEN 'owner' ELSE m.permission END permission
            FROM islands i LEFT JOIN island_members m ON m.island_id=i.id AND m.player_id=$1
            JOIN players p ON p.id=i.owner_id WHERE i.world_slot IS NOT NULL
            ORDER BY i.world_slot LIMIT $2`,[player.id,SHARED_WORLD_CAPACITY])).rows;
          return json(200,rows.map(row=>({x:Math.round((worldSlotOrigin(row.world_slot).x+SHARED_WORLD_CELL_SIZE/2)/SHARED_WORLD_SIZE*100),y:Math.round((worldSlotOrigin(row.world_slot).y+SHARED_WORLD_CELL_SIZE/2)/SHARED_WORLD_SIZE*100),id:row.id,name:row.owner_email,updated_at:row.updated_at,accept_deliveries:row.accept_deliveries,permission:row.permission||null,owner:row.owner_email,online:streams.get(row.id)?.size||0})));
        }
        if(path==='/api/islands'&&req.method==='GET')return json(200,(await pool.query(`SELECT i.id,i.name,i.revision,i.updated_at,i.accept_deliveries,CASE WHEN i.owner_id=$1 THEN 'owner' ELSE m.permission END permission FROM islands i LEFT JOIN island_members m ON m.island_id=i.id AND m.player_id=$1 WHERE i.owner_id=$1 OR m.player_id=$1 ORDER BY i.updated_at DESC`,[player.id])).rows);
        if(path==='/api/islands'&&req.method==='POST'){
          const data=await body(req),snapshot=validate(data.snapshot),id=randomUUID();
          if(snapshot.mode==='multiplayer'){
            const existing=(await pool.query('SELECT id FROM islands WHERE owner_id=$1 AND world_slot IS NOT NULL LIMIT 1',[player.id])).rows[0];
            if(existing)return json(200,await claimWorldIsland(player,existing.id));
          }
          if(Number((await pool.query('SELECT count(*) FROM islands WHERE owner_id=$1',[player.id])).rows[0].count)>=20)throw fail(409,'Maximal 20 Inseln pro Konto.');
          await pool.query('INSERT INTO islands(id,owner_id,name,snapshot) VALUES($1,$2,$3,$4)',[id,player.id,name(data.name),snapshot]);
          if(snapshot.mode==='multiplayer'){const world=await claimWorldIsland(player,id);return json(201,world);}
          return json(201,{id,revision:1,permission:'owner'});
        }
        if(path==='/api/join'&&req.method==='POST'){
          const data=await body(req);if(typeof data.code!=='string'||data.code.length>100)throw fail(400,'Ungültiger Einladungscode.');
          const client=await pool.connect();try{await client.query('BEGIN');const inv=(await client.query('SELECT * FROM invitations WHERE hash=$1 AND expires_at>now() AND used_by IS NULL FOR UPDATE',[digest(data.code.trim())])).rows[0];if(!inv)throw fail(404,'Einladung ungültig, abgelaufen oder bereits verwendet.');
            await client.query('INSERT INTO island_members VALUES($1,$2,$3) ON CONFLICT(island_id,player_id) DO UPDATE SET permission=EXCLUDED.permission',[inv.island_id,player.id,inv.permission]);await client.query('UPDATE invitations SET used_by=$2 WHERE hash=$1',[inv.hash,player.id]);await client.query('COMMIT');return json(200,{id:inv.island_id});
          }catch(e){await client.query('ROLLBACK');throw e;}finally{client.release();}
        }
        const match=path.match(/^\/api\/islands\/([^/]+)(?:\/(invite|members|history|deliveries|events|messages|lease))?$/);
        if(match){
          const island=await access(player,match[1]),action=match[2];
          if(action==='events'&&req.method==='GET'){
            if((streams.get(island.id)?.size||0)>=32)throw fail(429,'Zu viele Live-Verbindungen.');
            res.writeHead(200,{'Content-Type':'text/event-stream; charset=utf-8','Cache-Control':'no-store','Connection':'keep-alive','X-Accel-Buffering':'no'});res.write(`event: ready\ndata: ${JSON.stringify({revision:island.revision})}\n\n`);
            const set=streams.get(island.id)||new Set();set.add(res);streams.set(island.id,set);publish(island.id,{type:'presence',count:set.size});const ping=setInterval(()=>res.write(': heartbeat\n\n'),20000);req.on('close',()=>{clearInterval(ping);set.delete(res);if(!set.size)streams.delete(island.id);else publish(island.id,{type:'presence',count:set.size});});return;
          }
          if(action==='lease'&&req.method==='POST'){
            if(island.permission==='view')throw fail(403,'Nur mit Baufreigabe.');const now=Date.now(),key=player.id+':'+player.session_hash,current=leases.get(island.id),data=await body(req,1024);
            if(data.release===true){if(current?.key===key){leases.delete(island.id);publish(island.id,{type:'lease',active:false});return json(200,{active:false});}return json(200,{active:Boolean(current&&current.until>now)});}
            if(current&&current.until>now&&current.key!==key)throw fail(423,'Ein anderer Mitspieler steuert diese Insel gerade. Live-Zuschauen bleibt möglich.');leases.set(island.id,{key,until:now+45000});publish(island.id,{type:'lease',active:true});return json(200,{active:true,expiresIn:45});
          }
          if(action==='messages'&&req.method==='GET')return json(200,(await pool.query("SELECT m.id,m.body,m.kind,m.created_at,CASE WHEN m.player_id=$2 THEN 'Du' ELSE 'Mitspieler '||substring(m.player_id::text,1,6) END sender FROM island_messages m WHERE m.island_id=$1 ORDER BY m.created_at DESC LIMIT 50",[island.id,player.id])).rows.reverse());
          if(action==='messages'&&req.method==='POST'){
            if(!messageLimit(player.id+':'+island.id))throw fail(429,'Bitte kurz warten, bevor du eine weitere Nachricht sendest.');const data=await body(req,2048),message=typeof data.message==='string'?data.message.trim():'';if(!message||message.length>280)throw fail(400,'Nachricht muss 1 bis 280 Zeichen enthalten.');const kind=['message','trade','warning','diplomacy'].includes(data.kind)?data.kind:'message';const row=(await pool.query('INSERT INTO island_messages(island_id,player_id,body,kind) VALUES($1,$2,$3,$4) RETURNING id,body,kind,created_at',[island.id,player.id,message,kind])).rows[0];publish(island.id,{type:'message'});return json(201,{...row,sender:'Du'});
          }
          if(action==='deliveries'&&req.method==='POST'){if(island.permission!=='owner')throw fail(403,'Nur der Besitzer kann Lieferungen erlauben.');const data=await body(req);if(typeof data.enabled!=='boolean')throw fail(400,'Ungültige Lieferfreigabe.');await pool.query('UPDATE islands SET accept_deliveries=$2 WHERE id=$1',[island.id,data.enabled]);return json(200,{enabled:data.enabled});}
          if(!action&&req.method==='GET')return json(200,{id:island.id,name:island.name,revision:island.revision,snapshot:island.snapshot,permission:island.permission});
          if(action==='history'&&req.method==='GET')return json(200,(await pool.query('SELECT revision,created_at,snapshot FROM island_history WHERE island_id=$1 ORDER BY revision DESC LIMIT 5',[island.id])).rows);
          if(!action&&req.method==='PUT'){
            if(island.permission==='view')throw fail(403,'Diese Insel ist nur zum Anschauen freigegeben.');
            const lease=leases.get(island.id),leaseKey=player.id+':'+player.session_hash;if(lease&&lease.until>Date.now()&&lease.key!==leaseKey)throw fail(423,'Ein anderer Mitspieler steuert diese Insel gerade.');if(lease?.key===leaseKey)lease.until=Date.now()+45000;
            const data=await body(req),snapshot=validate(data.snapshot);if(!Number.isInteger(data.revision))throw fail(400,'Spielstandversion fehlt.');
            const client=await pool.connect();try{await client.query('BEGIN');const current=(await client.query('SELECT * FROM islands WHERE id=$1 FOR UPDATE',[island.id])).rows[0];
              if(current.world_slot!==null&&(snapshot.mode!=='multiplayer'||snapshot.worldSize!==SHARED_WORLD_SIZE||snapshot.worldSlot!==current.world_slot))throw fail(400,'Ungültige Multiplayer-Weltzuordnung.');
              if(current.revision!==data.revision)throw fail(409,'Die Insel wurde auf einem anderen Gerät geändert. Dein Stand bleibt lokal erhalten. Bitte Serverstand laden oder lokale Insel als neue Kopie sichern.');
              await client.query('INSERT INTO island_history(island_id,revision,snapshot) VALUES($1,$2,$3)',[island.id,current.revision,current.snapshot]);
              await client.query('UPDATE islands SET snapshot=$2,revision=revision+1,updated_at=now() WHERE id=$1',[island.id,snapshot]);
              await client.query('DELETE FROM island_history WHERE island_id=$1 AND revision<$2',[island.id,Math.max(1,current.revision-4)]);await client.query('COMMIT');publish(island.id,{type:'snapshot',revision:current.revision+1});if(current.world_slot!==null)publishWorld({type:'island',id:island.id,revision:current.revision+1});return json(200,{revision:current.revision+1});
            }catch(e){await client.query('ROLLBACK');throw e;}finally{client.release();}
          }
          if(action==='invite'&&req.method==='POST'){
            if(island.permission!=='owner')throw fail(403,'Nur der Inselbesitzer kann einladen.');const data=await body(req);if(!['view','edit'].includes(data.permission))throw fail(400,'Ungültige Freigabe.');
            const code=token();await pool.query("INSERT INTO invitations(hash,island_id,permission,expires_at) VALUES($1,$2,$3,now()+interval '7 days')",[digest(code),island.id,data.permission]);return json(201,{code});
          }
          if(action==='members'&&req.method==='GET'){if(island.permission!=='owner')throw fail(403,'Nur für Inselbesitzer.');return json(200,(await pool.query('SELECT p.id,p.email,m.permission FROM island_members m JOIN players p ON p.id=m.player_id WHERE m.island_id=$1',[island.id])).rows);}
          if(action==='members'&&req.method==='DELETE'){if(island.permission!=='owner')throw fail(403,'Nur für Inselbesitzer.');const data=await body(req);if(!uuid(data.playerId))throw fail(400,'Ungültiger Spieler.');await pool.query('DELETE FROM island_members WHERE island_id=$1 AND player_id=$2',[island.id,data.playerId]);return json(200,{ok:true});}
        }
        throw fail(404,'Nicht gefunden.');
      }
      if(!['GET','HEAD'].includes(req.method))throw fail(405,'Nicht erlaubt.');
      const relative=decodeURIComponent(path==='/'?'/index.html':path);const file=resolve(root,'.'+relative);if(!file.startsWith(root+'/'))throw fail(404,'Nicht gefunden.');
      let info;try{info=await stat(file);}catch{throw fail(404,'Nicht gefunden.');}if(!info.isFile())throw fail(404,'Nicht gefunden.');
      const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css','.json':'application/json','.webmanifest':'application/manifest+json','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.mp3':'audio/mpeg'};
      // Opt-in framing for the public game only. API responses and ordinary
      // pages retain DENY; no CORS, session-cookie or CSRF policy is relaxed.
      if((path==='/'||path==='/index.html')&&url.searchParams.get('embed')==='whip'){
        res.removeHeader('X-Frame-Options');
        res.setHeader('Content-Security-Policy',res.getHeader('Content-Security-Policy').replace("frame-ancestors 'none'","frame-ancestors https://whip.run"));
      }
      res.writeHead(200,{'Content-Type':types[extname(file)]||'application/octet-stream','Cache-Control':/\/assets\/.+-[\w-]{8,}\.[\w]+$/.test(path)?'public, max-age=31536000, immutable':'no-cache'});res.end(req.method==='HEAD'?undefined:await readFile(file));
    }catch(e){if(!res.headersSent)json(e.status||(['23505'].includes(e.code)?409:500),{error:e.status?e.message:e.code==='23505'?'Eintrag bereits vorhanden.':'Anfrage fehlgeschlagen. Bitte erneut versuchen.'});else res.end();}
  });
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
  if(!process.env.DATABASE_URL||!process.env.APP_ORIGIN)throw new Error('DATABASE_URL und APP_ORIGIN erforderlich');
  const pool=new pg.Pool({connectionString:process.env.DATABASE_URL,max:5});
  await pool.query(await readFile(new URL('./schema.sql',import.meta.url),'utf8'));
  const emailService=createEmailService(process.env);
  const server=await createApp({pool,origin:process.env.APP_ORIGIN,origins:(process.env.APP_ORIGINS||process.env.APP_ORIGIN).split(',').map(x=>x.trim()),secure:process.env.NODE_ENV!=='test',emailService});
  server.requestTimeout=30000;server.headersTimeout=10000;server.maxRequestsPerSocket=1000;
  server.listen(Number(process.env.PORT||8791),'127.0.0.1',()=>console.log('New Shores server ready · email '+(emailService.enabled?'enabled':'disabled')));
}

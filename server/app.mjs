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

export const saveTypes=['largehouse','storehouse','woodcutter','forester','sawmill','house','quarry','farm','mill','bakery','fisher','warehouse','tower','hospital',...Object.keys(extraBuildings)];
const root=resolve(fileURLToPath(new URL('../dist',import.meta.url)));
const uuid=value=>/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(value||'');
const fail=(status,message)=>Object.assign(new Error(message),{status});
const name=value=>typeof value==='string'&&value.trim()?value.trim().slice(0,48):'Meine Insel';
export async function createApp({pool,origin,secure=true}){
  const authLimit=limiter(20,15*60_000),apiLimit=limiter(240,60_000);
  const dummy=await passwordHash(token());
  async function body(req){let data='';for await(const chunk of req){data+=chunk;if(Buffer.byteLength(data)>8_100_000)throw fail(413,'Anfrage zu groß.');}try{return JSON.parse(data||'{}');}catch{throw fail(400,'Ungültige Anfrage.');}}
  const cookie=(res,value,age)=>res.setHeader('Set-Cookie',`ns_session=${value}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${age}${secure?'; Secure':''}`);
  async function session(req){const raw=(req.headers.cookie||'').split(';').map(s=>s.trim()).find(s=>s.startsWith('ns_session='))?.slice(11);
    if(!raw)return null;return (await pool.query('SELECT p.id,p.email FROM sessions s JOIN players p ON p.id=s.player_id WHERE s.hash=$1 AND s.expires_at>now()',[digest(raw)])).rows[0]||null;}
  async function access(player,id){if(!uuid(id))throw fail(404,'Insel nicht gefunden.');const result=await pool.query(`SELECT i.*,CASE WHEN i.owner_id=$2 THEN 'owner' ELSE m.permission END permission FROM islands i LEFT JOIN island_members m ON m.island_id=i.id AND m.player_id=$2 WHERE i.id=$1 AND (i.owner_id=$2 OR m.player_id=$2)`,[id,player.id]);if(!result.rows.length)throw fail(404,'Insel nicht gefunden.');return result.rows[0];}
  const validate=s=>{try{return parseSave(JSON.stringify(s),saveTypes);}catch(e){throw fail(400,e.message);}};
  return http.createServer(async(req,res)=>{
    res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','same-origin');res.setHeader('X-Frame-Options','DENY');
    const json=(status,value)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(value));};
    try{
      const url=new URL(req.url,origin),path=url.pathname;
      if(path.startsWith('/api/')){
        if(!apiLimit(req.socket.remoteAddress))throw fail(429,'Zu viele Anfragen. Kurz warten.');
        if(!['GET','HEAD'].includes(req.method)&&(req.headers.origin!==origin||!req.headers['content-type']?.startsWith('application/json')))throw fail(403,'Anfrage nur aus dem Spiel erlaubt.');
        if(path==='/api/health'&&req.method==='GET'){await pool.query('SELECT 1');return json(200,{ok:true});}
        if(['/api/login','/api/register'].includes(path)&&req.method==='POST'){
          const data=await body(req);let email;try{email=emailAddress(data.email);}catch(e){throw fail(400,e.message);}
          if(!authLimit('ip:'+req.socket.remoteAddress)||!authLimit('email:'+email))throw fail(429,'Zu viele Anmeldeversuche. In 15 Minuten erneut versuchen.');
          let player=(await pool.query('SELECT * FROM players WHERE email=$1',[email])).rows[0];
          if(path==='/api/register'){
            if(player)throw fail(409,'Registrierung nicht möglich. Bitte anmelden.');
            let hash;try{hash=await passwordHash(data.password);}catch(e){throw fail(400,e.message);}player={id:randomUUID(),email};
            await pool.query('INSERT INTO players(id,email,password_hash) VALUES($1,$2,$3)',[player.id,email,hash]);
          }else if(!await passwordMatches(data.password,player?.password_hash||dummy)||!player)throw fail(401,'E-Mail oder Passwort stimmt nicht.');
          const raw=token();await pool.query('DELETE FROM sessions WHERE expires_at<now()');
          await pool.query("INSERT INTO sessions VALUES($1,$2,now()+interval '30 days')",[digest(raw),player.id]);cookie(res,raw,30*86400);return json(200,{id:player.id,email:player.email});
        }
        const player=await session(req);if(!player)throw fail(401,'Bitte anmelden.');
        if(path==='/api/me'&&req.method==='GET')return json(200,player);
        if(path==='/api/deliveries'&&req.method==='POST')return json(200,await sendDelivery(pool,player,await body(req),validate));
        if(path==='/api/deliveries'&&req.method==='GET')return json(200,(await pool.query('SELECT g.id,g.item,g.amount,g.created_at,g.delivery_x,g.delivery_y,s.name source_name,t.name target_name,CASE WHEN t.owner_id=$1 THEN true ELSE false END incoming FROM goods_transfers g JOIN islands s ON s.id=g.source_id JOIN islands t ON t.id=g.target_id WHERE s.owner_id=$1 OR t.owner_id=$1 ORDER BY g.created_at DESC LIMIT 50',[player.id])).rows);
        if(path==='/api/logout'&&req.method==='POST'){const raw=(req.headers.cookie||'').split(';').map(s=>s.trim()).find(s=>s.startsWith('ns_session='))?.slice(11);if(raw)await pool.query('DELETE FROM sessions WHERE hash=$1',[digest(raw)]);cookie(res,'',0);return json(200,{ok:true});}
        if(path==='/api/islands'&&req.method==='GET')return json(200,(await pool.query(`SELECT i.id,i.name,i.revision,i.updated_at,i.accept_deliveries,CASE WHEN i.owner_id=$1 THEN 'owner' ELSE m.permission END permission FROM islands i LEFT JOIN island_members m ON m.island_id=i.id AND m.player_id=$1 WHERE i.owner_id=$1 OR m.player_id=$1 ORDER BY i.updated_at DESC`,[player.id])).rows);
        if(path==='/api/islands'&&req.method==='POST'){
          const data=await body(req),snapshot=validate(data.snapshot),id=randomUUID();
          if(Number((await pool.query('SELECT count(*) FROM islands WHERE owner_id=$1',[player.id])).rows[0].count)>=20)throw fail(409,'Maximal 20 Inseln pro Konto.');
          await pool.query('INSERT INTO islands(id,owner_id,name,snapshot) VALUES($1,$2,$3,$4)',[id,player.id,name(data.name),snapshot]);return json(201,{id,revision:1,permission:'owner'});
        }
        if(path==='/api/join'&&req.method==='POST'){
          const data=await body(req);if(typeof data.code!=='string'||data.code.length>100)throw fail(400,'Ungültiger Einladungscode.');
          const client=await pool.connect();try{await client.query('BEGIN');const inv=(await client.query('SELECT * FROM invitations WHERE hash=$1 AND expires_at>now() AND used_by IS NULL FOR UPDATE',[digest(data.code.trim())])).rows[0];if(!inv)throw fail(404,'Einladung ungültig, abgelaufen oder bereits verwendet.');
            await client.query('INSERT INTO island_members VALUES($1,$2,$3) ON CONFLICT(island_id,player_id) DO UPDATE SET permission=EXCLUDED.permission',[inv.island_id,player.id,inv.permission]);await client.query('UPDATE invitations SET used_by=$2 WHERE hash=$1',[inv.hash,player.id]);await client.query('COMMIT');return json(200,{id:inv.island_id});
          }catch(e){await client.query('ROLLBACK');throw e;}finally{client.release();}
        }
        const match=path.match(/^\/api\/islands\/([^/]+)(?:\/(invite|members|history|deliveries))?$/);
        if(match){
          const island=await access(player,match[1]),action=match[2];
          if(action==='deliveries'&&req.method==='POST'){if(island.permission!=='owner')throw fail(403,'Nur der Besitzer kann Lieferungen erlauben.');const data=await body(req);if(typeof data.enabled!=='boolean')throw fail(400,'Ungültige Lieferfreigabe.');await pool.query('UPDATE islands SET accept_deliveries=$2 WHERE id=$1',[island.id,data.enabled]);return json(200,{enabled:data.enabled});}
          if(!action&&req.method==='GET')return json(200,{id:island.id,name:island.name,revision:island.revision,snapshot:island.snapshot,permission:island.permission});
          if(action==='history'&&req.method==='GET')return json(200,(await pool.query('SELECT revision,created_at,snapshot FROM island_history WHERE island_id=$1 ORDER BY revision DESC LIMIT 5',[island.id])).rows);
          if(!action&&req.method==='PUT'){
            if(island.permission==='view')throw fail(403,'Diese Insel ist nur zum Anschauen freigegeben.');
            const data=await body(req),snapshot=validate(data.snapshot);if(!Number.isInteger(data.revision))throw fail(400,'Spielstandversion fehlt.');
            const client=await pool.connect();try{await client.query('BEGIN');const current=(await client.query('SELECT * FROM islands WHERE id=$1 FOR UPDATE',[island.id])).rows[0];
              if(current.revision!==data.revision)throw fail(409,'Die Insel wurde auf einem anderen Gerät geändert. Dein Stand bleibt lokal erhalten. Bitte Serverstand laden oder lokale Insel als neue Kopie sichern.');
              await client.query('INSERT INTO island_history(island_id,revision,snapshot) VALUES($1,$2,$3)',[island.id,current.revision,current.snapshot]);
              await client.query('UPDATE islands SET snapshot=$2,revision=revision+1,updated_at=now() WHERE id=$1',[island.id,snapshot]);
              await client.query('DELETE FROM island_history WHERE island_id=$1 AND revision<$2',[island.id,Math.max(1,current.revision-4)]);await client.query('COMMIT');return json(200,{revision:current.revision+1});
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
      const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css','.json':'application/json','.webmanifest':'application/manifest+json','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.mp3':'audio/mpeg'};
      res.writeHead(200,{'Content-Type':types[extname(file)]||'application/octet-stream','Cache-Control':path.startsWith('/assets/')?'public, max-age=31536000, immutable':'no-cache'});res.end(req.method==='HEAD'?undefined:await readFile(file));
    }catch(e){if(!res.headersSent)json(e.status||(['23505'].includes(e.code)?409:500),{error:e.status?e.message:e.code==='23505'?'Eintrag bereits vorhanden.':'Anfrage fehlgeschlagen. Bitte erneut versuchen.'});else res.end();}
  });
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
  if(!process.env.DATABASE_URL||!process.env.APP_ORIGIN)throw new Error('DATABASE_URL und APP_ORIGIN erforderlich');
  const pool=new pg.Pool({connectionString:process.env.DATABASE_URL,max:5});
  await pool.query(await readFile(new URL('./schema.sql',import.meta.url),'utf8'));
  const server=await createApp({pool,origin:process.env.APP_ORIGIN,secure:process.env.NODE_ENV!=='test'});
  server.listen(Number(process.env.PORT||8791),'127.0.0.1',()=>console.log('New Shores server ready'));
}

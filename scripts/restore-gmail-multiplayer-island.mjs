import pg from 'pg';
import {promoteIslandToWorld,SHARED_WORLD_SIZE} from '../src/shared-world.js';
import {parseSave} from '../src/savegames.js';
import {saveTypes} from '../server/app.mjs';

if(!process.env.DATABASE_URL)throw new Error('DATABASE_URL fehlt.');
const apply=process.argv.includes('--apply');
const gmail='eliaspfeffer@gmail.com';
const sourceId='f43ce948-4496-405a-a902-104a7165c092';
const targetId='80ea4d9a-c3da-4712-a89e-d7f04d782f44';
const otherId='96505770-2b4e-42e8-8568-e07cf3efa596';
const pool=new pg.Pool({connectionString:process.env.DATABASE_URL,max:1});
const client=await pool.connect();
try{
  await client.query('BEGIN');
  await client.query('SELECT pg_advisory_xact_lock(442817)');
  const rows=(await client.query('SELECT i.*,p.email FROM islands i JOIN players p ON p.id=i.owner_id ORDER BY i.id FOR UPDATE OF i')).rows;
  const source=rows.find(row=>row.id===sourceId),target=rows.find(row=>row.id===targetId),other=rows.find(row=>row.id===otherId);
  if(rows.length!==16||!source||!target||!other||rows.filter(row=>row.world_slot!==null).length!==2||rows.some(row=>![gmail,other.email].includes(row.email)))throw new Error('Inselbestand verändert; keine Änderung.');
  if(source.email!==gmail||source.world_slot!==null||target.email!==gmail||target.world_slot!==1||other.world_slot!==0||other.email!== 'eliaspfeffer@online-meisterschule.de')throw new Error('Konten oder Weltplätze verändert; keine Änderung.');
  if(source.snapshot.buildings.length!==59||source.snapshot.workers.length!==154||source.snapshot.workers.filter(worker=>['swordsman','archer'].includes(worker.unit)).length!==57||target.snapshot.worldSize!==SHARED_WORLD_SIZE)throw new Error('Ausgangsstand verändert; keine Änderung.');
  for(const key of ['buildings','workers','trees','rocks','details'])if((source.snapshot[key]||[]).some(point=>point.x>=50||point.y>=50))throw new Error(`${key} außerhalb des gemeinsamen Inselbereichs; keine Änderung.`);
  if(source.snapshot.terrain.some((line,y)=>line.some((tile,x)=>(x>=50||y>=50)&&tile!=='water')))throw new Error('Land außerhalb des gemeinsamen Inselbereichs; keine Änderung.');
  const restored=parseSave(JSON.stringify(promoteIslandToWorld(source.snapshot,1)),saveTypes);
  if(restored.buildings.length!==59||restored.workers.length!==154||restored.worldSize!==SHARED_WORLD_SIZE||restored.resources?.stone!==source.snapshot.resources?.stone)throw new Error('Importprüfung fehlgeschlagen; keine Änderung.');
  const old=rows.filter(row=>row.world_slot===null);
  if(old.length!==14)throw new Error('Anzahl alter Kopien verändert; keine Änderung.');
  if(apply){
    await client.query('CREATE TABLE IF NOT EXISTS multiplayer_cleanup_backup_20260925 (id uuid PRIMARY KEY,owner_id uuid NOT NULL,name text NOT NULL,revision integer NOT NULL,world_slot smallint,snapshot jsonb NOT NULL,updated_at timestamptz NOT NULL,backed_up_at timestamptz NOT NULL DEFAULT now())');
    await client.query('CREATE TABLE IF NOT EXISTS multiplayer_cleanup_messages_backup_20260925 AS SELECT * FROM island_messages WHERE false');
    for(const row of [target,...old])await client.query('INSERT INTO multiplayer_cleanup_backup_20260925(id,owner_id,name,revision,world_slot,snapshot,updated_at) VALUES($1,$2,$3,$4,$5,$6,$7) ON CONFLICT DO NOTHING',[row.id,row.owner_id,row.name,row.revision,row.world_slot,row.snapshot,row.updated_at]);
    await client.query('INSERT INTO island_history(island_id,revision,snapshot) VALUES($1,$2,$3) ON CONFLICT DO NOTHING',[target.id,target.revision,target.snapshot]);
    await client.query('UPDATE islands SET snapshot=$2,revision=revision+1,updated_at=now() WHERE id=$1',[target.id,restored]);
    const ids=old.map(row=>row.id);
    await client.query('INSERT INTO multiplayer_cleanup_messages_backup_20260925 SELECT * FROM island_messages WHERE island_id=ANY($1::uuid[])',[ids]);
    await client.query('DELETE FROM island_messages WHERE island_id=ANY($1::uuid[])',[ids]);
    await client.query('DELETE FROM island_history WHERE island_id=ANY($1::uuid[])',[ids]);
    await client.query('DELETE FROM invitations WHERE island_id=ANY($1::uuid[])',[ids]);
    await client.query('DELETE FROM island_members WHERE island_id=ANY($1::uuid[])',[ids]);
    await client.query('DELETE FROM goods_transfers WHERE source_id=ANY($1::uuid[]) OR target_id=ANY($1::uuid[])',[ids]);
    await client.query('DELETE FROM islands WHERE id=ANY($1::uuid[])',[ids]);
    await client.query('COMMIT');
  }else await client.query('ROLLBACK');
  console.log(`${apply?'Applied':'Dry run'}: ${gmail} slot 1 ← ${sourceId.slice(0,8)} (${restored.buildings.length} buildings, ${restored.workers.length} workers, 57 soldiers); ${old.length} old island copies removed from active tables${apply?' and recoverably backed up':''}.`);
}catch(error){await client.query('ROLLBACK').catch(()=>{});throw error;}
finally{client.release();await pool.end();}

import pg from 'pg';
import {promoteIslandToWorld,repackWorld,SHARED_WORLD_CELL_SIZE,SHARED_WORLD_SIZE} from '../src/shared-world.js';
import {parseSave} from '../src/savegames.js';
import {saveTypes} from '../server/app.mjs';

if(!process.env.DATABASE_URL)throw new Error('DATABASE_URL fehlt.');
const apply=process.argv.includes('--apply');
const pool=new pg.Pool({connectionString:process.env.DATABASE_URL,max:1});
const client=await pool.connect();
const land=(terrain,x,y,size)=>{
  let count=0;
  for(let row=y;row<y+size;row++)for(let col=x;col<x+size;col++)if(['grass','shore'].includes(terrain?.[row]?.[col]))count++;
  return count;
};
try{
  await client.query('BEGIN');
  await client.query('SELECT pg_advisory_xact_lock(442817)');
  const rows=(await client.query('SELECT * FROM islands ORDER BY updated_at DESC FOR UPDATE')).rows;
  const owners=new Set(rows.map(row=>row.owner_id));
  const current=rows.find(row=>row.world_slot===0);
  const legacy=rows.find(row=>row.owner_id!==current?.owner_id&&row.world_slot===null);
  if(owners.size!==2||!current||!legacy||rows.some(row=>row.world_slot!==null&&row.id!==current.id))throw new Error('Produktionsbestand weicht von der geprüften Zwei-Konten-Welt ab. Keine Änderung.');
  if(current.snapshot.worldSize!==228||legacy.snapshot.worldSize!==72)throw new Error('Weltgrößen haben sich verändert. Keine Änderung.');
  if(![undefined,'multiplayer'].includes(legacy.snapshot.mode))throw new Error('Zweiter Spielstand ist kein älterer Multiplayer-Stand. Keine Änderung.');
  const compact=parseSave(JSON.stringify(repackWorld(current.snapshot,0)),saveTypes);
  const second=parseSave(JSON.stringify(promoteIslandToWorld(legacy.snapshot,1)),saveTypes);
  if(land(current.snapshot.terrain,2,2,72)!==land(compact.terrain,2,2,SHARED_WORLD_CELL_SIZE))throw new Error('Landverlust in der ersten Insel. Keine Änderung.');
  if(land(legacy.snapshot.terrain,0,0,72)!==land(second.terrain,56,2,SHARED_WORLD_CELL_SIZE))throw new Error('Landverlust in der zweiten Insel. Keine Änderung.');
  for(const [row,snapshot] of [[current,compact],[legacy,second]]){
    if(snapshot.worldSize!==SHARED_WORLD_SIZE||snapshot.buildings.length!==row.snapshot.buildings.length||snapshot.workers?.length!==row.snapshot.workers?.length)throw new Error('Spielinhalte verändert. Keine Änderung.');
  }
  if(apply){
    await client.query('CREATE TABLE IF NOT EXISTS compact_world_migration_backup_20260925 (id uuid PRIMARY KEY,revision integer NOT NULL,snapshot jsonb NOT NULL,created_at timestamptz NOT NULL DEFAULT now())');
    for(const [row,snapshot] of [[current,compact],[legacy,second]]){
      await client.query('INSERT INTO compact_world_migration_backup_20260925(id,revision,snapshot) VALUES($1,$2,$3) ON CONFLICT DO NOTHING',[row.id,row.revision,row.snapshot]);
      await client.query('INSERT INTO island_history(island_id,revision,snapshot) VALUES($1,$2,$3) ON CONFLICT DO NOTHING',[row.id,row.revision,row.snapshot]);
      await client.query('UPDATE islands SET snapshot=$2,world_slot=$3,revision=revision+1,updated_at=now() WHERE id=$1',[row.id,snapshot,snapshot.worldSlot]);
    }
    await client.query('COMMIT');
  }else await client.query('ROLLBACK');
  console.log(`${apply?'Applied':'Dry run'}: ${current.id.slice(0,8)} → slot 0, ${legacy.id.slice(0,8)} → slot 1; both ${SHARED_WORLD_SIZE}×${SHARED_WORLD_SIZE}, land and unit counts preserved.`);
}catch(error){
  await client.query('ROLLBACK').catch(()=>{});
  throw error;
}finally{client.release();await pool.end();}

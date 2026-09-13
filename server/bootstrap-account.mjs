// Initial account import over SSH stdin; password is never written or logged.
import {readFile} from 'node:fs/promises';
import {randomUUID} from 'node:crypto';
import pg from 'pg';
import {emailAddress,passwordHash} from './security.mjs';
import {parseSave} from '../src/savegames.js';
import {saveTypes} from './app.mjs';
let input='';for await(const chunk of process.stdin)input+=chunk;
const data=JSON.parse(input),email=emailAddress(data.email),hash=await passwordHash(data.password);
const snapshot=parseSave(await readFile(process.argv[2],'utf8'),saveTypes);
const pool=new pg.Pool({connectionString:process.env.DATABASE_URL});
const client=await pool.connect();
try{await client.query('BEGIN');const id=randomUUID();await client.query('INSERT INTO players(id,email,password_hash) VALUES($1,$2,$3)',[id,email,hash]);await client.query('INSERT INTO islands(id,owner_id,name,snapshot) VALUES($1,$2,$3,$4)',[randomUUID(),id,'Seenland · vom Mac übertragen',snapshot]);await client.query('COMMIT');console.log('Initial account and original save imported.');}
catch(e){await client.query('ROLLBACK');console.error('Import failed; no account or save changed.');process.exitCode=1;}
finally{client.release();await pool.end();}

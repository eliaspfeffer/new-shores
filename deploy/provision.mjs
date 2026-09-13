// Run once as root on the explicitly selected server. Never reads other app secrets.
import {randomBytes} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {existsSync,writeFileSync} from 'node:fs';
if(process.getuid()!==0)throw new Error('Root required');
if(existsSync('/etc/new-shores.env'))throw new Error('Already provisioned; preserve existing database credentials');
const query=sql=>execFileSync('docker',['exec','-i','database-platform-postgres','sh','-c','exec psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB" -At'],{input:sql,encoding:'utf8',stdio:['pipe','pipe','pipe']});
if(query("SELECT 1 FROM pg_database WHERE datname='new_shores'; SELECT 1 FROM pg_roles WHERE rolname='new_shores';").trim())throw new Error('Database or role already exists; inspect before proceeding');
const password=randomBytes(36).toString('hex');
query(`CREATE ROLE new_shores LOGIN PASSWORD '${password}'; CREATE DATABASE new_shores OWNER new_shores; REVOKE ALL ON DATABASE new_shores FROM PUBLIC;`);
writeFileSync('/etc/new-shores.env',`NODE_ENV=production\nPORT=8791\nAPP_ORIGIN=https://hermes.tailee79a6.ts.net:9444\nDATABASE_URL=postgresql://new_shores:${password}@127.0.0.1:5433/new_shores\n`,{mode:0o600,flag:'wx'});
try{execFileSync('id',['new-shores'],{stdio:'ignore'});}catch{execFileSync('useradd',['--system','--no-create-home','--shell','/usr/sbin/nologin','new-shores']);}
console.log('Isolated game database and service user provisioned.');

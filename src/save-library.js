// Snapshot names live inside each atomic save value, not in a separate metadata key.
export const saveEntries=[
  {key:'new-shores-save',label:'Automatischer Spielstand'},
  {key:'new-shores-quicksave',label:'Zwischenspeicher',writable:true},
  ...[1,2,3].map(n=>({key:'new-shores-slot-'+n,label:'Speicherplatz '+n,writable:true})),
  {key:'new-shores-before-load',label:'Sicherung vor dem Laden'},
  {key:'new-shores-before-starter-help',label:'Sicherung vor der Starthilfe'},
  {key:'new-shores-before-cloud',label:'Sicherung vor dem Server-Inselwechsel'},
  {key:'new-shores-autosave-backup',label:'Vorheriger Autosave'},
  {key:'new-shores-quicksave-backup',label:'Vorheriger Zwischenspeicher'},
];
export function createSaveLibrary(storage,parse){
  const entry=key=>{const e=saveEntries.find(e=>e.key===key);if(!e)throw new Error('Unbekannter Speicherplatz');return e;};
  const read=key=>{entry(key);const text=storage.getItem(key);if(!text)return null;return {text,data:parse(text)};};
  function write(key,text,name){
    const e=entry(key);if(!e.writable)throw new Error('Dieser Spielstand ist schreibgeschützt');
    const data=parse(text),clean=String(name??data.saveName??e.label).trim().slice(0,48);
    if(!clean)throw new Error('Bitte einen Namen eingeben');
    const result=JSON.stringify({...data,saveName:clean});parse(result);
    if(key==='new-shores-quicksave'){const previous=storage.getItem(key);if(previous){let valid=false;try{parse(previous);valid=true;}catch{}if(valid)storage.setItem('new-shores-quicksave-backup',previous);}}
    storage.setItem(key,result);return result;
  }
  const rename=(key,name)=>{const current=read(key);if(!current)throw new Error('Dieser Speicherplatz ist leer');return write(key,current.text,name);};
  return {read,write,rename,list:()=>saveEntries.map(e=>{try{const saved=read(e.key);return {...e,...saved,empty:!saved};}catch(error){return {...e,error:error.message};}})};
}

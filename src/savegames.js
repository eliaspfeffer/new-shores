export function parseSave(text,types,width=50,height=50){
  if(typeof text!=='string'||text.length>8_000_000)throw new Error('Spielstand fehlt oder ist zu groß.');
  const s=JSON.parse(text);
  function check(value,depth=0){if(depth>16)throw new Error('Ungültige Datenstruktur.');if(value&&typeof value==='object')for(const [k,v] of Object.entries(value)){if(['__proto__','constructor','prototype'].includes(k))throw new Error('Ungültiger Datenschlüssel.');check(v,depth+1);}else if(typeof value==='number'&&!Number.isFinite(value))throw new Error('Ungültiger Zahlenwert.');}
  check(s);if(!s||typeof s!=='object'||!Number.isInteger(s.version)||s.version<1||s.version>6)throw new Error('Diese Spielstandversion wird nicht unterstützt.');
  const point=p=>p&&Number.isFinite(p.x)&&Number.isFinite(p.y)&&p.x>=0&&p.y>=0&&p.x<width&&p.y<height;
  if(!s.resources||Object.entries(s.resources).some(([k,v])=>!/^[a-zA-Z][a-zA-Z0-9]{0,24}$/.test(k)||typeof v!=='number'||!Number.isFinite(v)||v<0))throw new Error('Ungültige Vorräte.');
  if(s.terrain&&(!Array.isArray(s.terrain)||s.terrain.length!==height||s.terrain.some(row=>!Array.isArray(row)||row.length!==width||row.some(t=>!['grass','water','shore','void'].includes(t)))))throw new Error('Ungültige Karte.');
  if(!Array.isArray(s.buildings)||!s.buildings.length||s.buildings[0].type!=='storehouse'||s.buildings.some(b=>!point(b)||!types.includes(b.type)||!Number.isInteger(b.x)||!Number.isInteger(b.y)||!(b.progress>=0&&b.progress<=1)))throw new Error('Ungültige Gebäude.');
  for(const key of ['roads','trees','rocks'])if(s[key]!==undefined&&(!Array.isArray(s[key])||s[key].some(p=>!point(p))))throw new Error('Ungültige Kartenelemente.');
  if(!Array.isArray(s.roads))throw new Error('Wege fehlen.');
  if(s.workers){if(!Array.isArray(s.workers)||s.workers.length>10000)throw new Error('Ungültige Siedler.');const ids=new Set();for(const w of s.workers){if(!point(w)||!Number.isInteger(w.id)||ids.has(w.id))throw new Error('Ungültige Siedlerposition oder Kennung.');ids.add(w.id);for(const key of ['taskIndex','supplyIndex','garrisonIndex','employerIndex'])if(w[key]!==undefined&&w[key]!==null&&(!Number.isInteger(w[key])||w[key]<(key==='taskIndex'?-1:0)||w[key]>=s.buildings.length))throw new Error('Ungültiger Gebäudeauftrag.');if(w.route&&(!Array.isArray(w.route)||w.route.some(p=>!point(p))))throw new Error('Ungültiger Laufweg.');}}
  for(const w of s.workers||[]){if(w.workArea&&(!point(w.workArea)||!Number.isInteger(w.workArea.x)||!Number.isInteger(w.workArea.y)||!Number.isInteger(w.workArea.radius)||w.workArea.radius<1||w.workArea.radius>15))throw new Error('Ungültiges Spezialisten-Arbeitsgebiet.');if(w.surveyQueue&&(!Array.isArray(w.surveyQueue)||w.surveyQueue.length>1000||w.surveyQueue.some(p=>!point(p))))throw new Error('Ungültiger Suchauftrag.');if(w.workSite&&!point(w.workSite))throw new Error('Ungültige Arbeitsstelle.');}
  for(const b of s.buildings)if(b.fields&&(!Array.isArray(b.fields)||b.fields.length>4||b.fields.some(f=>!point(f)||!Number.isInteger(f.x)||!Number.isInteger(f.y)||!Number.isFinite(f.age)||f.age<0||f.age>35)))throw new Error('Ungültige Felder.');
  for(const w of s.workers||[])if(w.outdoorJob&&(!point(w.outdoorJob)||!['plant','sow','harvest','fish'].includes(w.outdoorJob.kind)))throw new Error('Ungültiger Außeneinsatz.');
  return s;
}

import {depotGoods,storageModes} from './storage.js';
import {validMapConfig} from './map-generator.js';
import {validateGroundGoods} from './ground-goods.js';
export function parseSave(text,types,width=50,height=50){
  if(typeof text!=='string'||text.length>8_000_000)throw new Error('Spielstand fehlt oder ist zu groß.');
  const s=JSON.parse(text);
  function check(value,depth=0){if(depth>16)throw new Error('Ungültige Datenstruktur.');if(value&&typeof value==='object')for(const [k,v] of Object.entries(value)){if(['__proto__','constructor','prototype'].includes(k))throw new Error('Ungültiger Datenschlüssel.');check(v,depth+1);}else if(typeof value==='number'&&!Number.isFinite(value))throw new Error('Ungültiger Zahlenwert.');}
  check(s);if(!s||typeof s!=='object'||!Number.isInteger(s.version)||s.version<1||s.version>7)throw new Error('Diese Spielstandversion wird nicht unterstützt.');
  if(s.playerColor!==undefined&&!['red','blue','green','violet'].includes(s.playerColor))throw new Error('Ungültige Spielerfarbe.');
  if(s.saveName!==undefined&&(typeof s.saveName!=='string'||!s.saveName.trim()||s.saveName.length>48))throw new Error('Ungültiger Spielstandname.');
  const point=p=>p&&Number.isFinite(p.x)&&Number.isFinite(p.y)&&p.x>=0&&p.y>=0&&p.x<width&&p.y<height;
  validateGroundGoods(s.strategy,s.workers,point);
  if(s.version<7&&(s.strategy?.physicalSalvage||s.strategy?.groundPiles?.length||s.workers?.some(w=>['salvagePickup','salvageReturn'].includes(w.phase))))throw new Error('Bergungswaren benötigen Spielstandversion 7.');
  if(s.strategy?.starterHelpUsed!==undefined&&typeof s.strategy.starterHelpUsed!=='boolean')throw new Error('Ungültige Starthilfe.');
  if(s.mapConfig!==undefined&&!validMapConfig(s.mapConfig))throw new Error('Ungültige Kartenkonfiguration.');
  if(s.details!==undefined&&(!Array.isArray(s.details)||s.details.length>width*height||s.details.some(p=>!point(p)||![0,1,2].includes(p.type))))throw new Error('Ungültige Landschaftsdetails.');
  if(s.strategy?.enemyRaids!==undefined&&typeof s.strategy.enemyRaids!=='boolean')throw new Error('Ungültige Turmangriffs-KI.');
  if(s.strategy?.raidClock!==undefined&&(!Number.isFinite(s.strategy.raidClock)||s.strategy.raidClock<0||s.strategy.raidClock>60))throw new Error('Ungültige Angriffsplanung.');
  for(const w of s.workers||[])if(w.raid&&(!point(w.raid.home)||!point(w.raid.target)||!Number.isInteger(w.raid.target.x)||!Number.isInteger(w.raid.target.y)||!['attack','return'].includes(w.raid.stage)||!Number.isFinite(w.raid.age)||w.raid.age<0||w.raid.age>91))throw new Error('Ungültiger Turmangriff.');
  if(s.strategy?.tacticalAI!==undefined&&typeof s.strategy.tacticalAI!=='boolean')throw new Error('Ungültige Verteidigungs-KI.');
  if(s.strategy?.carrierReserve!==undefined&&(!Number.isInteger(s.strategy.carrierReserve)||s.strategy.carrierReserve<0||s.strategy.carrierReserve>50))throw new Error('Ungültige Trägerreserve.');
  if(s.journal!==undefined&&(!Array.isArray(s.journal)||s.journal.length>100||s.journal.some(e=>!e||typeof e.text!=='string'||e.text.length>300||!Number.isFinite(e.time)||e.time<0||!Number.isInteger(e.count)||e.count<1||e.count>999)))throw new Error('Ungültiges Meldungsjournal.');
  if(!s.resources||Object.entries(s.resources).some(([k,v])=>!/^[a-zA-Z][a-zA-Z0-9]{0,24}$/.test(k)||typeof v!=='number'||!Number.isFinite(v)||v<0))throw new Error('Ungültige Vorräte.');
  if(s.terrain&&(!Array.isArray(s.terrain)||s.terrain.length!==height||s.terrain.some(row=>!Array.isArray(row)||row.length!==width||row.some(t=>!['grass','water','shore','void'].includes(t)))))throw new Error('Ungültige Karte.');
  if(!Array.isArray(s.buildings)||!s.buildings.length||s.buildings[0].type!=='storehouse'||s.buildings.some(b=>!point(b)||!types.includes(b.type)||!Number.isInteger(b.x)||!Number.isInteger(b.y)||!(b.progress>=0&&b.progress<=1)))throw new Error('Ungültige Gebäude.');
  for(const key of ['roads','trees','rocks'])if(s[key]!==undefined&&(!Array.isArray(s[key])||s[key].some(p=>!point(p))))throw new Error('Ungültige Kartenelemente.');
  if(!Array.isArray(s.roads))throw new Error('Wege fehlen.');
  if(s.workers){if(!Array.isArray(s.workers)||s.workers.length>10000)throw new Error('Ungültige Siedler.');const ids=new Set();for(const w of s.workers){if(!point(w)||!Number.isInteger(w.id)||ids.has(w.id))throw new Error('Ungültige Siedlerposition oder Kennung.');ids.add(w.id);for(const key of ['taskIndex','supplyIndex','garrisonIndex','employerIndex','storageIndex'])if(w[key]!==undefined&&w[key]!==null&&(!Number.isInteger(w[key])||w[key]<(key==='taskIndex'?-1:0)||w[key]>=s.buildings.length))throw new Error('Ungültiger Gebäudeauftrag.');if(w.route&&(!Array.isArray(w.route)||w.route.some(p=>!point(p))))throw new Error('Ungültiger Laufweg.');}}
  for(const w of s.workers||[]){if(w.workArea&&(!point(w.workArea)||!Number.isInteger(w.workArea.x)||!Number.isInteger(w.workArea.y)||!Number.isInteger(w.workArea.radius)||w.workArea.radius<1||w.workArea.radius>15))throw new Error('Ungültiges Spezialisten-Arbeitsgebiet.');if(w.surveyQueue&&(!Array.isArray(w.surveyQueue)||w.surveyQueue.length>1000||w.surveyQueue.some(p=>!point(p))))throw new Error('Ungültiger Suchauftrag.');if(w.workSite&&!point(w.workSite))throw new Error('Ungültige Arbeitsstelle.');}
  for(const b of s.buildings)if(b.fields&&(!Array.isArray(b.fields)||b.fields.length>4||b.fields.some(f=>!point(f)||!Number.isInteger(f.x)||!Number.isInteger(f.y)||!Number.isFinite(f.age)||f.age<0||f.age>35)))throw new Error('Ungültige Felder.');
  for(const w of s.workers||[])if(w.outdoorJob&&(!point(w.outdoorJob)||!['plant','sow','harvest','fish'].includes(w.outdoorJob.kind)))throw new Error('Ungültiger Außeneinsatz.');
  for(const w of s.workers||[])if(w.waypoints&&(!Array.isArray(w.waypoints)||w.waypoints.length>32||w.waypoints.some(p=>!point(p)||!Number.isInteger(p.x)||!Number.isInteger(p.y))))throw new Error('Ungültige Wegpunktkette.');
  if(s.strategy?.projectiles&&(!Array.isArray(s.strategy.projectiles)||s.strategy.projectiles.length>10000||s.strategy.projectiles.some(p=>!point(p)||!Number.isInteger(p.targetId)||!Number.isFinite(p.fromX)||!Number.isFinite(p.fromY)||!Number.isFinite(p.damage)||p.damage<=0||p.damage>1000||!Number.isFinite(p.age)||p.age<0||p.age>5)))throw new Error('Ungültige Geschosse.');
  for(const b of s.buildings)if(b.miningEnergy!==undefined&&(!Number.isInteger(b.miningEnergy)||b.miningEnergy<0||b.miningEnergy>10))throw new Error('Ungültige Minenversorgung.');
  const tools=['axe','hammer','shovel','sickle','pickaxe','saw','rod'];
  for(const b of s.buildings)for(const key of ['toolChoice','activeTool'])if(b[key]!==undefined&&!tools.includes(b[key])&&!(key==='toolChoice'&&b[key]==='auto'))throw new Error('Ungültiger Werkzeugauftrag.');
  for(const w of s.workers||[])for(const key of ['workTool','jobTool','specialTool'])if(w[key]!=null&&w[key]!==true&&!['tools',...tools].includes(w[key]))throw new Error('Ungültiges Werkzeug.');
  for(const b of s.buildings)if(b.stored!==undefined&&(!b.stored||typeof b.stored!=='object'||Array.isArray(b.stored)||Object.entries(b.stored).some(([k,n])=>!/^[a-zA-Z][a-zA-Z0-9]{0,24}$/.test(k)||!Number.isInteger(n)||n<0)))throw new Error('Ungültiger Lagerbestand.');
  for(const w of s.workers||[])if(w.carryAmount!==undefined&&(!Number.isInteger(w.carryAmount)||w.carryAmount<0||w.carryAmount>1000))throw new Error('Ungültige Transportmenge.');
  for(const w of s.workers||[])if(w.patrol&&(!Array.isArray(w.patrol.points)||w.patrol.points.length<2||w.patrol.points.length>8||w.patrol.points.some(p=>!point(p)||!Number.isInteger(p.x)||!Number.isInteger(p.y))||!Number.isInteger(w.patrol.next)||w.patrol.next<0||w.patrol.next>=w.patrol.points.length))throw new Error('Ungültige Patrouille.');
  if(s.scenario&&(!['sandbox','economy','conquest'].includes(s.scenario.mode)||!['active','victory','defeat'].includes(s.scenario.status)||typeof s.scenario.acknowledged!=='boolean'||s.scenario.finishedAt!==undefined&&(!Number.isFinite(s.scenario.finishedAt)||s.scenario.finishedAt<0)))throw new Error('Ungültiges Spielziel.');
  for(const b of s.buildings)if(b.storageRules!==undefined&&(!b.storageRules||typeof b.storageRules!=='object'||Array.isArray(b.storageRules)||Object.entries(b.storageRules).some(([key,mode])=>!depotGoods.includes(key)||!storageModes.includes(mode))))throw new Error('Ungültige Lagerregel.');
  for(const [index,b] of s.buildings.entries()){
    if(b.storageSources!==undefined&&(!Array.isArray(b.storageSources)||b.storageSources.length>8||new Set(b.storageSources).size!==b.storageSources.length||b.storageSources.some(i=>!Number.isInteger(i)||i<0||i>=s.buildings.length||i===index||i!==0&&(s.buildings[i].type!=='warehouse'||(s.buildings[i].owner||1)!==1))))throw new Error('Ungültige Lagerquellenliste.');
    if(b.storageTargets!==undefined&&(!b.storageTargets||typeof b.storageTargets!=='object'||Array.isArray(b.storageTargets)||Object.entries(b.storageTargets).some(([key,n])=>!depotGoods.includes(key)||!Number.isInteger(n)||n<0||n>999)))throw new Error('Ungültige Lagerzielmenge.');
    if(b.storageSource!==undefined&&(!Number.isInteger(b.storageSource)||b.storageSource<0||b.storageSource>=s.buildings.length||b.storageSource===index||b.storageSource!==0&&(s.buildings[b.storageSource].type!=='warehouse'||(s.buildings[b.storageSource].owner||1)!==1)))throw new Error('Ungültige Lagerquelle.');
  }
  for(const w of s.workers||[])if(w.combatStance!==undefined&&!['defend','march'].includes(w.combatStance))throw new Error('Ungültiger Kampfbefehl.');
  for(const w of s.workers||[]){
    if(w.healTargetId!==undefined&&!Number.isInteger(w.healTargetId))throw new Error('Ungültiger Heilungsauftrag.');
    for(const key of ['healPulse','healRetry'])if(w[key]!==undefined&&(typeof w[key]!=='number'||w[key]<0||w[key]>2))throw new Error('Ungültiger Heilungsfortschritt.');
  }
  for(const b of s.buildings)if(b.patientId!==undefined&&!Number.isInteger(b.patientId))throw new Error('Ungültige Patientenkennung.');
  for(const b of s.buildings){
    if(b.holdFire!==undefined&&typeof b.holdFire!=='boolean')throw new Error('Ungültiger Turmfeuer-Befehl.');
    if(b.recruitQueue!==undefined&&(b.type!=='barracks'||!Array.isArray(b.recruitQueue)||b.recruitQueue.length>20||b.recruitQueue.some(q=>!q||!['swordsman','archer','medic'].includes(q.type)||![1,2,3].includes(q.rank)||!Number.isInteger(q.count)||q.count<1||q.count>20||!Number.isFinite(q.progress)||q.progress<0||q.progress>8)))throw new Error('Ungültige Ausbildungswarteschlange.');
    if(b.rallyPoint!==undefined&&(b.type!=='barracks'||!point(b.rallyPoint)||!Number.isInteger(b.rallyPoint.x)||!Number.isInteger(b.rallyPoint.y)))throw new Error('Ungültiger Sammelpunkt.');
    if(b.productionRemaining!==undefined&&(!Number.isInteger(b.productionRemaining)||b.productionRemaining<0||b.productionRemaining>999))throw new Error('Ungültiger Produktionsauftrag.');
  }
  for(const w of s.workers||[])if(w.tactics&&(!point(w.tactics.home)||w.tactics.lastSeen!=null&&!point(w.tactics.lastSeen)||!['guard','return','retreat','wounded','withdraw','engage','pursue','blocked','search'].includes(w.tactics.mode)||!Number.isFinite(w.tactics.clock)||w.tactics.clock< -1||w.tactics.clock>1||!Number.isInteger(w.tactics.lost)||w.tactics.lost<0||w.tactics.lost>4))throw new Error('Ungültiger Verteidigungsauftrag.');
  return s;
}

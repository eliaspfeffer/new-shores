import {recipes} from './strategy.js';
import {meals} from './nutrition.js';
export function buildingContext(b,resources,staffStatus=''){
  const r=recipes[b.type];let status='Bereit',items=[];
  if(b.progress<1){status='Baufortschritt: '+Math.round(b.progress*100)+' %';items=Object.entries(b.materials||{}).map(([key,target])=>({key,value:b.materialsSpent?target:b.buffer?.[key]||0,target}));}
  else if(b.type==='storehouse'||b.type==='warehouse'){status=b.type==='storehouse'?'Hauptlager':'Lokaler Lagerbestand';items=Object.entries(b.type==='storehouse'?resources:b.stored||{}).filter(([k,v])=>!['people','beds','food'].includes(k)&&v>0).map(([key,value])=>({key,value}));}
  else if(b.type==='tower')status='Besatzung: '+(b.garrison||0)+' · Stärke: '+Math.ceil(b.hp??100);
  else if(b.type==='house')status='Wohnplätze insgesamt: '+resources.people+' / '+resources.beds;
  else if(b.type==='barracks'){status='Rekrutierung bereit · Vorräte im Hauptlager';items=['swords','bows','gold'].map(key=>({key,value:resources[key]||0}));}
  else {status=b.ready?(b.outputInTransit?'Ware unterwegs zum Ausgang':'Ware wartet auf Abholung'):staffStatus||'Bereit';items=(r?.deposit?meals:Object.keys(r?.inputs||{})).map(key=>({key,value:b.buffer?.[key]||0}));if(b.ready)items.push({key:b.ready,value:b.outputAmount||2,output:true});}
  if(b.stopped)status='Angehalten';
  return {status,items,progress:b.progress<1?Math.round(b.progress*100):r?Math.min(100,Math.floor((b.work||0)/r.cycle*100)):null};
}

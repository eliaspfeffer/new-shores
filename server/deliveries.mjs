import {goodsOrder} from '../src/goods.js';
import {territoryOwners} from '../src/territory.js';
import {findPath,keyOf} from '../src/navigation.js';
const error=(status,message)=>Object.assign(new Error(message),{status});
const uuid=value=>/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(value||'');
export function deliverySpot(snapshot,item,amount){
  const {terrain,buildings}=snapshot,home=buildings[0];if(!terrain)throw error(409,'Die Zielinsel muss zuerst im aktuellen Spiel geladen und gespeichert werden.');
  const owners=territoryOwners(terrain,buildings,snapshot.strategy?.claims||[]),owned=p=>owners[Math.floor(p.y)]?.[Math.floor(p.x)]===1;
  const blocked=new Set([...(snapshot.trees||[]),...(snapshot.rocks||[]),...buildings].map(p=>keyOf(p.x,p.y)));
  const busy=new Set([...(snapshot.roads||[]),...buildings.flatMap(b=>b.fields||[]),...(snapshot.workers||[]).flatMap(w=>[w,w.outdoorJob,w.workSite,w.manualTarget,...(w.route||[])]).filter(Boolean)].map(p=>keyOf(Math.floor(p.x),Math.floor(p.y))));
  const door=[{x:home.x+.5,y:home.y+1.5},{x:home.x+1.5,y:home.y+.5},{x:home.x-.5,y:home.y+.5},{x:home.x+.5,y:home.y-.5}].find(p=>owned(p)&&['grass','shore'].includes(terrain[Math.floor(p.y)]?.[Math.floor(p.x)])&&!blocked.has(keyOf(Math.floor(p.x),Math.floor(p.y))));
  if(!door)throw error(409,'Hauptlagereingang der Zielinsel ist blockiert.');
  const piles=snapshot.strategy?.groundPiles||[],candidates=[];
  for(let y=home.y-6;y<=home.y+6;y++)for(let x=home.x-6;x<=home.x+6;x++){
    if(Math.hypot(x-home.x,y-home.y)>6||terrain[y]?.[x]!=='grass'||!owned({x,y})||blocked.has(keyOf(x,y))||busy.has(keyOf(x,y))||x===Math.floor(door.x)&&y===Math.floor(door.y))continue;
    const pile=piles.find(p=>p.x===x&&p.y===y);if(!Number.isSafeInteger((pile?.goods[item]||0)+amount))continue;
    candidates.push({x,y,existing:!!pile});
  }
  candidates.sort((a,b)=>Number(b.existing)-Number(a.existing)||Math.hypot(a.x-home.x,a.y-home.y)-Math.hypot(b.x-home.x,b.y-home.y));
  for(const p of candidates){const route=findPath(door,{x:p.x+.5,y:p.y+.5},terrain,blocked,new Map());if(route?.every(owned))return {x:p.x,y:p.y};}
  throw error(409,'Kein freier, erreichbarer Lieferplatz im eigenen Gebiet der Zielinsel.');
}
export function prepareDelivery(source,target,item,amount){
  if(!goodsOrder.includes(item)||!Number.isInteger(amount)||amount<1||amount>100)throw error(400,'Sendung: eine gültige Ware und 1 bis 100 Stück.');
  if(!Number.isSafeInteger(source.resources[item])||source.resources[item]<amount)throw error(409,'Nicht genug Waren im Hauptlager der Absenderinsel.');
  const place=deliverySpot(target,item,amount),outgoing=structuredClone(source),incoming=structuredClone(target);
  outgoing.resources[item]-=amount;incoming.version=7;incoming.strategy??={};incoming.strategy.groundPiles??=[];
  let pile=incoming.strategy.groundPiles.find(p=>p.x===place.x&&p.y===place.y);if(!pile){pile={...place,goods:{}};incoming.strategy.groundPiles.push(pile);}pile.goods[item]=(pile.goods[item]||0)+amount;
  return {outgoing,incoming,place};
}
export async function sendDelivery(pool,player,data,validate){
  if(!uuid(data.id)||!uuid(data.sourceId)||!uuid(data.targetId)||data.sourceId===data.targetId||!Number.isInteger(data.revision)||!goodsOrder.includes(data.item)||!Number.isInteger(data.amount)||data.amount<1||data.amount>100)throw error(400,'Ungültige Sendung.');
  const client=await pool.connect();
  try{
    await client.query('BEGIN');await client.query('SELECT pg_advisory_xact_lock(hashtextextended($1,0))',[data.id]);
    const previous=(await client.query('SELECT * FROM goods_transfers WHERE id=$1',[data.id])).rows[0];
    if(previous){if(previous.sender_id!==player.id||previous.source_id!==data.sourceId||previous.target_id!==data.targetId||previous.item!==data.item||previous.amount!==data.amount)throw error(409,'Sendungskennung bereits für einen anderen Auftrag verwendet.');await client.query('COMMIT');return {id:previous.id,sourceRevision:previous.source_revision,replayed:true};}
    const rows=(await client.query('SELECT * FROM islands WHERE id=ANY($1::uuid[]) ORDER BY id FOR UPDATE',[[data.sourceId,data.targetId]])).rows;
    const source=rows.find(r=>r.id===data.sourceId),target=rows.find(r=>r.id===data.targetId);
    if(!source||source.owner_id!==player.id)throw error(403,'Nur der Besitzer kann Waren von dieser Insel versenden.');
    if(!target)throw error(404,'Zielinsel nicht gefunden.');
    if(target.owner_id!==player.id&&!(await client.query('SELECT 1 FROM island_members WHERE island_id=$1 AND player_id=$2 FOR SHARE',[target.id,player.id])).rows.length)throw error(404,'Zielinsel nicht gefunden.');
    if(!target.accept_deliveries)throw error(403,'Die Zielinsel hat Warenlieferungen nicht freigegeben.');
    if(source.revision!==data.revision)throw error(409,'Absenderinsel wurde geändert. Erst den aktuellen Serverstand laden.');
    const {outgoing,incoming,place}=prepareDelivery(source.snapshot,target.snapshot,data.item,data.amount);validate(outgoing);validate(incoming);
    for(const [island,snapshot] of [[source,outgoing],[target,incoming]]){
      await client.query('INSERT INTO island_history(island_id,revision,snapshot) VALUES($1,$2,$3)',[island.id,island.revision,island.snapshot]);
      await client.query('UPDATE islands SET snapshot=$2,revision=revision+1,updated_at=now() WHERE id=$1',[island.id,snapshot]);
      await client.query('DELETE FROM island_history WHERE island_id=$1 AND revision<$2',[island.id,Math.max(1,island.revision-4)]);
    }
    await client.query('INSERT INTO goods_transfers(id,sender_id,source_id,target_id,item,amount,source_revision,target_revision,delivery_x,delivery_y) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)',[data.id,player.id,source.id,target.id,data.item,data.amount,source.revision+1,target.revision+1,place.x,place.y]);
    await client.query('COMMIT');return {id:data.id,sourceRevision:source.revision+1,replayed:false};
  }catch(e){await client.query('ROLLBACK');throw e;}finally{client.release();}
}

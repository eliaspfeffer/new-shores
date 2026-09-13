import {goodsOrder,goodsNames} from './goods.js';
export function initDeliveriesUI(api){
  const section=document.createElement('section');section.id='cloud-deliveries';
  section.innerHTML='<h3>Warenlieferungen</h3><p>Aus deinem Hauptlager an eine freigegebene Insel senden. Dort holen Träger die Lieferung am Hauptlager ab. Kein Schiffsverkehr und kein Echtzeit-Handel. Die Zielinsel danach frisch vom Server laden, damit laufende lokale Fassungen die Lieferung nicht übergehen.</p><button id="delivery-allow" aria-pressed="false">Lieferungen für diese Insel: aus</button><label>Zielinsel<select id="delivery-target" aria-label="Zielinsel für Warenlieferung"></select></label><label>Ware<select id="delivery-item" aria-label="Zu versendende Ware"></select></label><label>Anzahl<input id="delivery-amount" type="number" min="1" max="100" step="1" value="1"></label><p id="delivery-stock"></p><button id="delivery-send">Waren senden</button><p id="delivery-feedback" role="status"></p><details><summary>Letzte Sendungen</summary><button id="delivery-history-refresh">Sendungen aktualisieren</button><div id="delivery-history"></div></details>';
  api.host.append(section);const q=s=>section.querySelector(s),feedback=text=>q('#delivery-feedback').textContent=text;
  const key=()=>api.getUser()?'new-shores-pending-shipment:'+api.getUser().id:null;
  function pending(){try{return JSON.parse(localStorage.getItem(key())||'null');}catch{return null;}}
  for(const item of goodsOrder){const option=document.createElement('option');option.value=item;option.textContent=goodsNames[item];q('#delivery-item').append(option);}
  let islands=[];
  function stock(){let snapshot;try{snapshot=JSON.parse(localStorage.getItem('new-shores-save')||'null');}catch{}q('#delivery-stock').textContent='Lokal im Hauptlager: '+(snapshot?.resources?.[q('#delivery-item').value]||0)+' '+goodsNames[q('#delivery-item').value]+'. Vor dem Versand wird synchronisiert.';}
  function refresh(list=islands){islands=list;const binding=api.getBinding(),user=api.getUser(),own=binding?.permission==='owner'&&binding?.userId===user?.id,current=own&&list.find(i=>i.id===binding.id);q('#delivery-allow').hidden=!own;
    q('#delivery-allow').textContent='Lieferungen für diese Insel: '+(current?.accept_deliveries?'an':'aus');q('#delivery-allow').setAttribute('aria-pressed',String(!!current?.accept_deliveries));
    const select=q('#delivery-target'),chosen=select.value;select.replaceChildren();for(const island of list.filter(i=>i.id!==binding?.id&&i.accept_deliveries)){const option=document.createElement('option');option.value=island.id;option.textContent=island.name;select.append(option);}if([...select.options].some(o=>o.value===chosen))select.value=chosen;
    q('#delivery-send').hidden=!own&&!pending();q('#delivery-send').textContent=pending()?'Offene Sendung abschließen':'Waren senden';
    if(pending())feedback('Eine Sendung ist noch ungeklärt. Derselbe Auftrag wird erneut geprüft, nicht doppelt abgebucht. Bis dahin bleibt die Synchronisierung angehalten.');else if(!select.options.length)feedback('Noch keine andere freigegebene Insel mit erlaubten Lieferungen.');else feedback('');stock();
  }
  q('#delivery-item').onchange=stock;
  q('#delivery-allow').onclick=()=>api.act(async()=>{const binding=api.getBinding();if(binding?.permission!=='owner')throw new Error('Zuerst eine eigene Serverinsel laden.');const enabled=q('#delivery-allow').getAttribute('aria-pressed')!=='true';await api.request('/islands/'+binding.id+'/deliveries','POST',{enabled});await api.reloadList();feedback(enabled?'Lieferungen für diese Insel erlaubt.':'Keine neuen Lieferungen erlaubt. Bereits gelieferte Waren bleiben erhalten.');});
  q('#delivery-send').onclick=()=>api.act(async()=>{
    let order=pending();
    if(!order){const binding=api.getBinding(),item=q('#delivery-item').value,amount=Number(q('#delivery-amount').value),targetId=q('#delivery-target').value;
      if(!binding||binding.permission!=='owner'||binding.userId!==api.getUser()?.id)throw new Error('Zuerst eine eigene Serverinsel laden.');
      if(!targetId||!Number.isInteger(amount)||amount<1||amount>100)throw new Error('Zielinsel und eine ganze Anzahl von 1 bis 100 wählen.');
      if(!confirm(amount+' '+goodsNames[item]+' unwiderruflich an „'+q('#delivery-target').selectedOptions[0].textContent+'“ senden? Dein lokaler Stand wird vorher synchronisiert.'))return;
      await api.sync();order={id:crypto.randomUUID(),sourceId:binding.id,targetId,item,amount,revision:api.getBinding().revision};localStorage.setItem(key(),JSON.stringify(order));refresh();
    }
    feedback('Sendung wird auf dem Server geprüft …');
    try{await api.request('/deliveries','POST',order);}
    catch(e){if(e.status>=400&&e.status<500&&![401,429].includes(e.status)){localStorage.removeItem(key());refresh();}else feedback('Antwort unklar. „Offene Sendung abschließen“ prüft denselben Auftrag sicher erneut.');throw e;}
    // Keep the pending marker until the authoritative post-delivery source is staged.
    await api.reloadSource(order.sourceId);localStorage.removeItem(key());location.reload();
  });
  q('#delivery-history-refresh').onclick=()=>api.act(async()=>{const list=await api.request('/deliveries'),container=q('#delivery-history');container.replaceChildren();if(!list.length)container.textContent='Noch keine Sendungen.';for(const entry of list){const row=document.createElement('p');row.textContent=entry.source_name+' → '+entry.target_name+': '+entry.amount+' '+goodsNames[entry.item]+' · '+new Date(entry.created_at).toLocaleString()+' · Lieferplatz '+entry.delivery_x+', '+entry.delivery_y;container.append(row);}});
  return {refresh,pending};
}

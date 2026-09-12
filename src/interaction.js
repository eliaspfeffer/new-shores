// Input and refund rules kept independent of rendering for regression tests.
export function wheelAction(event){
  const scale=event.deltaMode===1?16:event.deltaMode===2?400:1;
  const x=event.deltaX*scale,y=event.deltaY*scale;
  return event.ctrlKey||event.metaKey||event.altKey?{zoom:Math.exp(-Math.max(-100,Math.min(100,y))*.008)}:{x:-x,y:-y};
}
export function demolitionRefund(building,definition,workers,index){
  const refund={};const add=(k,n)=>{if(n>0)refund[k]=(refund[k]||0)+n;};
  const cost=building.materials||building.paidCost||{wood:definition?.wood||0,stone:definition?.stone||0};
  if(building.progress>=1||building.materialsSpent||!building.materials)for(const [k,n] of Object.entries(cost))add(k,Math.floor(n/2));
  for(const bag of [building.reserved,building.buffer])for(const [k,n] of Object.entries(bag||{}))add(k,n);
  if(building.ready)add(building.ready,building.outputAmount||2);
  for(const w of workers)if(w.employerIndex===index&&w.workTool)add('tools',1);
  for(const w of workers){if(w.phase==='supply'&&w.supplyIndex===index&&w.carry)add(w.carry,1);else if(w.task===building&&w.carry)add(w.carry,building.outputAmount||2);}
  return refund;
}

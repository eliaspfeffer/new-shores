export const groundDeposit=(point,deposits)=>deposits.find(d=>Math.hypot(d.x-point.x,d.y-point.y)<=2.5);
export function buildingClearance(point,type,buildings,trees,rocks){
  if(type==='road')return '';
  const radius=type==='largehouse'?3:2;
  if(buildings.some(b=>Math.hypot(b.x-point.x,b.y-point.y)<Math.max(radius,b.type==='largehouse'?3:2)))return 'Mehr Abstand zum Nachbargebäude nötig';
  if(trees.some(t=>Math.hypot(t.x-point.x,t.y-point.y)<radius))return 'Bäume stehen zu dicht am Bauplatz';
  if(rocks.some(r=>Math.hypot(r.x-point.x,r.y-point.y)<1.5))return 'Felsen stehen zu dicht am Bauplatz';
  return '';
}

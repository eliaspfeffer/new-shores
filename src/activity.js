// Deterministic presentation state: animation only follows real simulation work.
export function constructionStage(progress) {
  return progress < .18 ? 'Fundament' : progress < .55 ? 'Mauerwerk' : progress < .85 ? 'Dachstuhl' : progress < 1 ? 'Dach & Ausbau' : 'Fertig';
}
export function workActivity(w, buildings, recipes, depositFor, canPlant=()=>true) {
  if (w.dead) return null;
  if(w.phase==='fieldWork')return w.outdoorJob?.kind==='harvest'?'harvest':w.outdoorJob?.kind==='fish'?'fish':'dig';
  if (w.unit === 'geologist' && w.phase === 'action') return 'survey';
  if (w.unit === 'pioneer' && w.phase === 'action') return 'dig';
  if (w.phase === 'working' && !w.task?.stopped) return w.gather?.type === 'woodcutter' ? 'chop' : w.gather ? 'quarry' : w.task?.progress < 1 ? 'build' : null;
  if (w.phase !== 'staffWork') return null;
  const b = buildings[w.employerIndex], r = b && recipes[b.type];
  if (!b || b.stopped || b.progress < 1 || b.ready || (r?.deposit && !depositFor(b)) || Object.entries(r?.inputs || {}).some(([k,n]) => (b.buffer?.[k] || 0) < n)) return null;
  if(b.type==='forester'&&!canPlant(b))return null;
  return b.type === 'forester' ? 'dig' : b.type === 'farm' ? 'harvest' : b.type === 'fisher' ? 'fish' : 'craft';
}

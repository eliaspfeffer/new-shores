export const minePreferences={coalmine:'bread',ironmine:'meat',goldmine:'fish',sulfurmine:'meat'};
export const meals=['bread','meat','fish'];
// Original manual: preferred meal powers ten extraction attempts, other meals two.
export function productionInputs(b,recipe,available={}){
  if(!recipe?.deposit)return recipe?.inputs||{};
  if((b.miningEnergy||0)>0)return {};
  const preferred=minePreferences[b.type],order=[preferred,...meals.filter(k=>k!==preferred)];
  const meal=order.find(k=>(b.buffer?.[k]||0)>0)||order.find(k=>(available[k]||0)>0)||preferred;
  return {[meal]:1};
}
export function feedMiner(b){
  if((b.miningEnergy||0)>0)return true;
  const preferred=minePreferences[b.type],meal=[preferred,...meals.filter(k=>k!==preferred)].find(k=>(b.buffer?.[k]||0)>0);
  if(!meal)return false;
  b.buffer[meal]--;b.miningEnergy=meal===preferred?10:2;b.lastMeal=meal;return true;
}

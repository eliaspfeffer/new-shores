export const toolTypes=['axe','hammer','shovel','sickle','pickaxe','saw','rod'];
export const professionTools={builder:'hammer',pioneer:'shovel',geologist:'hammer',woodcutter:'axe',quarry:'pickaxe',sawmill:'saw',farm:'sickle',fisher:'rod',butcher:'axe',coalmine:'pickaxe',ironmine:'pickaxe',goldmine:'pickaxe',sulfurmine:'pickaxe'};
export function checkoutTool(stock,profession){
  const required=professionTools[profession];if(!required)return null;
  // Legacy savegame kits remain usable; newly forged tools have separate inventories.
  const item=stock[required]>0?required:stock.tools>0?'tools':null;if(!item)return false;
  stock[item]--;return item;
}
export function returnTool(stock,item){if(item){const key=typeof item==='string'?item:'tools';stock[key]=(stock[key]||0)+1;}}
// One earmarked founding tool for each essential mine, never consumed by a quarry
// or a gold mine first. Flags travel with the save; no reload/demolition farming.
export function checkoutWorkshopTool(stock,profession,state){
  const flag={coalmine:'coalStarterToolUsed',ironmine:'ironStarterToolUsed'}[profession];
  if(flag&&!state[flag]){state[flag]=true;return 'pickaxe';}
  return checkoutTool(stock,profession);
}
export function nextTool(stock){return toolTypes.reduce((best,key)=>(stock[key]||0)<(stock[best]||0)?key:best,'hammer');}

export const toolTypes=['axe','hammer','shovel','sickle','pickaxe','saw','rod'];
export const professionTools={builder:'hammer',pioneer:'shovel',geologist:'hammer',woodcutter:'axe',quarry:'pickaxe',sawmill:'saw',farm:'sickle',fisher:'rod',butcher:'axe',coalmine:'pickaxe',ironmine:'pickaxe',goldmine:'pickaxe',sulfurmine:'pickaxe'};
export function checkoutTool(stock,profession){
  const required=professionTools[profession];if(!required)return null;
  // Legacy savegame kits remain usable; newly forged tools have separate inventories.
  const item=stock[required]>0?required:stock.tools>0?'tools':null;if(!item)return false;
  stock[item]--;return item;
}
export function returnTool(stock,item){if(item){const key=typeof item==='string'?item:'tools';stock[key]=(stock[key]||0)+1;}}
export function nextTool(stock){return toolTypes.reduce((best,key)=>(stock[key]||0)<(stock[best]||0)?key:best,'hammer');}

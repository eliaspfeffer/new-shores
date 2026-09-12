// Finite completed batches; sowing alone is not an output batch.
export const supportsProductionOrder=type=>['woodcutter','quarry','farm','fisher','forester','sawmill','waterworks','mill','bakery','pigfarm','butcher','coalmine','ironmine','goldmine','sulfurmine','smelter','goldsmelter','toolsmith','weaponsmith','bowmaker'].includes(type);
export function setProductionOrder(b,value){
  if(!b||!supportsProductionOrder(b.type)||(b.owner||1)!==1)return false;
  if(value===null){delete b.productionRemaining;return true;}
  if(!Number.isInteger(value)||value<0||value>999)return false;
  b.productionRemaining=value;return true;
}

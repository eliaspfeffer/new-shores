import './naval-command-art.css';

const atlas=new URL('../assets/naval-command-medallions-v1.png',import.meta.url).href;
const cells={
  'naval-manage':0,'ship-build':1,merchant:2,
  transport:3,warship:4,cargo:5,
  'troop-expedition':6,courier:7,'ship-status':8
};

export function navalCommandArt(symbol){
  const i=cells[symbol];
  if(i===undefined)return null;
  return `<span class="naval-command-medallion" style="background-image:url('${atlas}');background-position:${i%3*50}% ${Math.floor(i/3)*50}%"></span>`;
}

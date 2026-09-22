import './mobile-command-art.css';

const atlas=new URL('../assets/mobile-command-medallions-v2.png',import.meta.url).href;
const cells={
  food:0,metal:1,naval:2,'basic-jobs':3,
  'all-military':4,'find-units':5,'recruit-specialists':6,carrier:7,
  builder:8,pioneer:9,geologist:10,mark:11,
  destination:12,halt:13,'return-carrier':14,'carrier-reserve':15
};

export function mobileCommandArt(symbol){
  const i=cells[symbol];
  if(i===undefined)return null;
  return `<span class="mobile-command-medallion" style="background-image:url('${atlas}');background-position:${i%4*100/3}% ${Math.floor(i/4)*100/3}%"></span>`;
}

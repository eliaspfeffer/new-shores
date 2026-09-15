import './command-art.css';
const atlas=new URL('../assets/command-medallions-v1.png',import.meta.url).href;
const cells={'⌂':0,'⚒':1,'⚔':2,'♟':3,'♟+':3,'✉':4,'⌕':5,'↑':6,'✹':7,'⇧':8,'⇩':9,'▶':10,'Ⅱ':11,'+':12,'-':13,'✓':14,'×':15};
export function commandArt(symbol){
  const i=cells[symbol];if(i===undefined)return null;
  return `<span class="command-medallion" style="background-image:url('${atlas}');background-position:${i%4*100/3}% ${Math.floor(i/4)*100/3}%"></span>`;
}

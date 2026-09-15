export function createJournal(){
  let entries=[];
  return {
    add(message,time){const text=String(message).slice(0,300),last=entries.at(-1);if(last?.text===text){last.count=Math.min(999,last.count+1);last.time=time;}else{entries.push({text,time,count:1});if(entries.length>15)entries.shift();}},
    list:()=>entries.map(e=>({...e})),
    restore(value){entries=(value||[]).slice(-15).map(e=>({...e}));},
  };
}

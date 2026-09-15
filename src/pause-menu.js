import './pause-menu.css';

// Move controls, rather than cloning them: their save/settings listeners survive.
export function initPauseMenu(){
  const modal=document.querySelector('#pause-modal'),card=modal.querySelector('.modal-card');
  const original=[...card.children],pages=new Map();
  const heading=document.createElement('h2');heading.id='pause-heading';
  const content=document.createElement('div');content.className='pause-content';
  const footer=document.createElement('nav');footer.className='pause-navigation';
  card.replaceChildren(heading,content,footer);
  modal.setAttribute('role','dialog');modal.setAttribute('aria-modal','true');modal.setAttribute('aria-labelledby',heading.id);
  function button(label,action){const b=document.createElement('button');b.type='button';b.textContent=label;b.onclick=action;return b;}
  let current='home',page=0;
  function show(key,index=0,focus=true){
    current=key;page=index;const entry=pages.get(key),items=entry.items;
    heading.textContent=entry.title;
    for(const node of content.children)node.hidden=true;
    for(const node of items.slice(index*4,index*4+4)){node.hidden=false;content.append(node);}
    content.dataset.page=key;
    footer.replaceChildren();
    if(key!=='home')footer.append(button('← Zurück',()=>show('home')));
    if(index>0)footer.append(button('← Vorige',()=>show(key,index-1)));
    if(items.length>4){const count=document.createElement('span');count.textContent=`${index+1} / ${Math.ceil(items.length/4)}`;footer.append(count);}
    if((index+1)*4<items.length)footer.append(button('Weitere →',()=>show(key,index+1)));
    if(focus)[...card.querySelectorAll('button,input,select')].find(n=>!n.disabled&&n.getClientRects().length)?.focus();
  }
  const take=id=>original.find(n=>n.id===id);
  const home=document.createElement('div');home.className='pause-home-actions';
  home.append(take('resume-button'),button('Einstellungen',()=>show('settings')),button('Spielstände',()=>show('saves')),button('Spiel & Hilfe',()=>show('info')));
  const cloud=original.find(n=>n.matches('[data-cloud-open]'));if(cloud)home.append(cloud);
  const leave=take('return-main-menu');if(leave)home.append(leave);
  pages.set('home',{title:'Spiel pausiert',items:[home]});
  const settings=[],saves=[],info=[],rules=[];
  for(const node of original){
    if(home.contains(node)||node.matches('.eyebrow,h2'))continue;
    if(node.id==='save-slots'){node.hidden=true;card.append(node);continue;} // Covered by the save library.
    if(node.id==='audio-settings'){
      node.open=true;
      const extras=document.createElement('div');extras.className='pause-audio-extras';
      for(const child of [...node.children])if(child.tagName!=='SUMMARY'&&child.id!=='sound-button'&&child.tagName!=='LABEL')extras.append(child);
      pages.set('audio',{title:'Musik & Geräusche',items:[node]});
      pages.set('sounds',{title:'Hörproben',items:[extras]});
      settings.push(button('Musik & Geräusche',()=>show('audio')),button('Hörproben',()=>show('sounds')));continue;
    }
    if(/salvage|conquest|enemy-/.test(node.id)){rules.push(node);continue;}
    if(node.id==='power-button'||node.classList.contains('player-color-picker')){settings.push(node);continue;}
    if(/save|backup|autosave/.test(node.id)||node.classList.contains('import-label')){saves.push(node);continue;}
    info.push(node);
  }
  settings.push(button('Spielregeln',()=>show('rules')));
  pages.set('settings',{title:'Einstellungen',items:settings});
  pages.set('rules',{title:'Spielregeln',items:rules});
  pages.set('saves',{title:'Spielstände',items:saves});
  pages.set('info',{title:'Spiel & Hilfe',items:info});
  for(const entry of pages.values())for(const node of entry.items){node.hidden=true;content.append(node);}
  // Offline updates can insert their button after initialization.
  new MutationObserver(()=>{const update=document.querySelector('#game-update');if(update&&!info.includes(update)){info.push(update);update.hidden=true;content.append(update);if(current==='info')show(current,page,false);}}).observe(content,{childList:true,subtree:true});
  new MutationObserver(()=>show('home',0,!modal.classList.contains('hidden'))).observe(modal,{attributes:true,attributeFilter:['class']});
  modal.addEventListener('keydown',e=>{
    if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();if(current==='home')take('resume-button').click();else show('home');}
    if(e.code==='Space'&&e.target.tagName==='BUTTON')e.stopPropagation();
    if(e.key==='Tab'){
      const controls=[...card.querySelectorAll('button,input,select,a[href]')].filter(n=>!n.disabled&&n.getClientRects().length);
      const first=controls[0],last=controls.at(-1);
      if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}
      else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}
    }
  });
  show('home',0,false);
}

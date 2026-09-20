// A compact, self-contained map image for save-game cards.  It deliberately
// renders from simulation data rather than copying the screen: UI panels and
// the current zoom never leak into a saved game, while fog-of-war still does.
const terrainColors={grass:'#668f49',water:'#3f93ae',shore:'#d8c078',bridge:'#986536',ferry:'#bd8a45',void:'#030604'};

export function drawSaveThumbnail(ctx,{terrain,explored=[],visible=[],buildings=[],trees=[],rocks=[],details=[],width=50,height=50,playerColor='blue'}){
  const canvas=ctx.canvas,scale=Math.min(canvas.width/width,canvas.height/height);
  ctx.fillStyle='#030604';ctx.fillRect(0,0,canvas.width,canvas.height);
  const known=new Set(explored),lit=new Set(visible),at=(x,y)=>y*width+x;
  for(let y=0;y<height;y++)for(let x=0;x<width;x++){
    if(!known.has(at(x,y)))continue;
    ctx.globalAlpha=lit.has(at(x,y))?1:.38;
    ctx.fillStyle=terrainColors[terrain[y]?.[x]]||terrainColors.grass;
    ctx.fillRect(x*scale,y*scale,Math.ceil(scale),Math.ceil(scale));
  }
  const dot=(point,color,size=1)=>{
    const x=Math.floor((point.x+.5)*scale-size/2),y=Math.floor((point.y+.5)*scale-size/2);
    ctx.fillStyle=color;ctx.fillRect(x,y,size,size);
  };
  for(const tree of trees)if(lit.has(at(tree.x,tree.y)))dot(tree,'#28552d',Math.max(1,scale*.9));
  for(const rock of rocks)if(lit.has(at(rock.x,rock.y)))dot(rock,'#9a9a80',Math.max(1,scale*.8));
  for(const detail of details)if(lit.has(at(detail.x,detail.y)))dot(detail,'#8ca65e',1);
  const colors={red:'#bd513e',blue:'#3d75b2',green:'#4e914f',violet:'#8a5da0'};
  for(const building of buildings)if(lit.has(at(building.x,building.y))){
    const own=(building.owner||1)===1;
    dot(building,own?(colors[playerColor]||colors.blue):'#ba4e3b',Math.max(2,scale*1.25));
  }
  ctx.globalAlpha=1;
}

export function createSaveThumbnail(state){
  if(typeof document==='undefined')return undefined;
  const canvas=document.createElement('canvas');canvas.width=160;canvas.height=160;
  const ctx=canvas.getContext('2d');if(!ctx)return undefined;
  drawSaveThumbnail(ctx,state);
  try{return canvas.toDataURL('image/png');}catch{return undefined;}
}

export function validSaveThumbnail(value){
  return typeof value==='string'&&value.length<=300_000&&/^data:image\/png;base64,[A-Za-z0-9+/]+={0,2}$/.test(value);
}

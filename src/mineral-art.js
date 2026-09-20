const slot={stone:0,coal:1,ironOre:2,goldOre:3,sulfur:4};

// The atlas keeps the mundane quarry boulder deliberately separate from every
// mineable deposit.  This makes a stone source readable before a geologist
// has placed a sign and avoids reusing the generic nature-rock for minerals.
export function createMineralArt(url){
  const image=new Image();
  image.src=url;
  return {
    ready:()=>image.complete&&image.naturalWidth>0,
    draw(ctx,type,x,y,size){
      const index=slot[type];
      if(index===undefined||!image.complete||!image.naturalWidth)return false;
      const cell=image.naturalWidth/5;
      const height=image.naturalHeight;
      ctx.drawImage(image,index*cell,0,cell,height,x-size/2,y-size*.62,size,size*.72);
      return true;
    }
  };
}

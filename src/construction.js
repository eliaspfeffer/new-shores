// Original painted foundation and shell frames. Finished buildings retain their original art.
export const constructionTypes={
  basic:{woodcutter:0,quarry:1,house:2,tower:3},
  economy:{forester:0,sawmill:1,farm:2,mill:3,bakery:4,fisher:5},
  industry:{waterworks:0,pigfarm:1,butcher:2,coalmine:3,ironmine:4,goldmine:5,sulfurmine:6,smelter:7,goldsmelter:8,toolsmith:9,weaponsmith:10,bowmaker:11,barracks:12}
};
export function constructionLayers(progress){
  const p=Math.max(0,Math.min(1,progress));
  return {foundation:1,shell:p>=.6?1:Math.max(0,(p-.15)/.45),finished:Math.max(0,Math.min(1,(p-.60)/.40))};
}
export function createConstructionArt(urls){
  const frames=new Map();let loaded=0;
  for(const [family,url] of Object.entries(urls)){
    const source=new Image();source.onload=()=>{
      const raw=document.createElement('canvas');raw.width=source.naturalWidth;raw.height=source.naturalHeight;
      const c=raw.getContext('2d',{willReadFrequently:true});c.drawImage(source,0,0);const pixels=c.getImageData(0,0,raw.width,raw.height),data=pixels.data;
      // Color-key is imported once, like the existing goods atlas; source PNG is untouched.
      for(let i=0;i<data.length;i+=4)if(data[i]>155&&data[i+2]>155&&data[i+1]<135&&Math.min(data[i],data[i+2])-data[i+1]>65)data[i+3]=0;
      c.putImageData(pixels,0,0);
      for(const [type,index] of Object.entries(constructionTypes[family])){
        const crops=[0,1].map(stage=>{
          const rows=family==='industry'?8:4;
          const breaks=family==='industry'?[0,.145,.27,.39,.50,.625,.742,.862,1]:[0,.27,.51,.75,1],row=Math.floor(index/4)+stage*rows/2;
          const band=family==='basic'?(stage?[.79,.21]:[.245,.17]):[breaks[row],breaks[row+1]-breaks[row]];
          const x0=Math.floor(index%4*raw.width/4),x1=Math.floor((index%4+1)*raw.width/4),y0=Math.floor(band[0]*raw.height),y1=Math.min(raw.height,Math.floor((band[0]+band[1])*raw.height));
          let left=x1,right=x0,top=y1,bottom=y0;
          for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++)if(data[(y*raw.width+x)*4+3]>128){left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);}
          return {left,top,width:Math.max(1,right-left+1),height:Math.max(1,bottom-top+1)};
        });
        const scale=Math.min(116/Math.max(...crops.map(r=>r.width)),118/Math.max(...crops.map(r=>r.height)));
        frames.set(type,crops.map(r=>{const out=document.createElement('canvas');out.width=out.height=128;out.getContext('2d').drawImage(raw,r.left,r.top,r.width,r.height,(128-r.width*scale)/2,122-r.height*scale,r.width*scale,r.height*scale);return out;}));
      }
      loaded++;
    };source.src=url;
  }
  return {get ready(){return loaded===Object.keys(urls).length;},has:type=>frames.has(type),draw(ctx,type,stage,p,size){const frame=frames.get(type)?.[stage];if(!frame)return false;ctx.drawImage(frame,p.x-size/2,p.y-size*.84,size,size);return true;}};
}

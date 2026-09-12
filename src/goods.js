export const goodsOrder=['wood','planks','stone','grain','flour','bread','fish','water','pigs','meat','coal','ironOre','goldOre','sulfur','iron','gold','tools','swords','bows','food','axe','hammer','shovel','sickle'];
export const buildingNames={storehouse:'Hauptlager',woodcutter:'Holzfäller',quarry:'Steinmetz',forester:'Förster',sawmill:'Sägewerk',waterworks:'Wasserwerk',farm:'Getreidehof',mill:'Windmühle',bakery:'Bäckerei',fisher:'Fischerhütte',pigfarm:'Schweinehof',butcher:'Metzgerei',coalmine:'Kohlemine',ironmine:'Eisenmine',goldmine:'Goldmine',sulfurmine:'Schwefelmine',smelter:'Eisenschmelze',goldsmelter:'Goldschmelze',toolsmith:'Werkzeugschmiede',tower:'Wachturm',barracks:'Kaserne',weaponsmith:'Waffenschmiede',bowmaker:'Bogenwerkstatt',house:'Wohnhaus'};
export const goodsNames={wood:'Holz',planks:'Bretter',stone:'Stein',grain:'Getreide',flour:'Mehl',bread:'Brot',fish:'Fisch',water:'Wasser',pigs:'Schweine',meat:'Fleisch',coal:'Kohle',ironOre:'Eisenerz',goldOre:'Golderz',sulfur:'Schwefel',iron:'Eisen',gold:'Gold',tools:'Werkzeuge',swords:'Schwerter',bows:'Bögen',food:'Altbestand Nahrung',axe:'Axt',hammer:'Hammer',shovel:'Schaufel',sickle:'Sichel'};
export function hasVisibleCargo(w){return Boolean(w.carry)&&(w.phase!=='supply'||w.pickupEnd===undefined||w.routeIndex>=w.pickupEnd);}
export function cargoPose(w){const d=w.direction??2;return {x:[6,4,0,-4,-6,-4,0,4][d],y:[-19,-17,-17,-17,-19,-23,-24,-23][d],behind:d>=5};}
// Color-key import, once at load. The source remains untouched on disk.
export function createGoodsArt(url,onReady){
  const source=new Image(),atlas=document.createElement('canvas');atlas.width=384;atlas.height=256;
  let ready=false;
  source.onload=()=>{
    const raw=document.createElement('canvas');raw.width=source.naturalWidth;raw.height=source.naturalHeight;
    const c=raw.getContext('2d',{willReadFrequently:true});c.drawImage(source,0,0);const pixels=c.getImageData(0,0,raw.width,raw.height),p=pixels.data;
    for(let i=0;i<p.length;i+=4)if(p[i]>150&&p[i+2]>150&&p[i+1]<110&&Math.min(p[i],p[i+2])-p[i+1]>80)p[i+3]=0;
    c.putImageData(pixels,0,0);const out=atlas.getContext('2d'),breaks=[0,290,515,725,1024].map(n=>Math.round(n*raw.height/1024)),cw=raw.width/6;
    for(let n=0;n<24;n++){const col=n%6,row=Math.floor(n/6);let left=(col+1)*cw,right=col*cw,top=breaks[row+1],bottom=breaks[row];
      for(let y=breaks[row];y<breaks[row+1];y++)for(let x=Math.floor(col*cw);x<(col+1)*cw;x++)if(p[(y*raw.width+x)*4+3]){left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);}
      if(right<left)continue;const w=right-left+1,h=bottom-top+1,scale=56/Math.max(w,h);out.drawImage(raw,left,top,w,h,col*64+(64-w*scale)/2,row*64+(64-h*scale)/2,w*scale,h*scale);
    }
    ready=true;onReady?.(atlas.toDataURL());
  };
  source.src=url;
  return {draw(ctx,item,x,y,size,mirror=false){const i=goodsOrder.indexOf(item);if(!ready||i<0)return;ctx.save();ctx.translate(x,y);if(mirror)ctx.scale(-1,1);ctx.drawImage(atlas,i%6*64,Math.floor(i/6)*64,64,64,-size/2,-size/2,size,size);ctx.restore();},get ready(){return ready;}};
}

export function restoreCamera(camera,view){
  if(!view||!['x','y','zoom'].every(k=>Number.isFinite(view[k]))||view.zoom<.4||view.zoom>2||Math.abs(view.x)>100000||Math.abs(view.y)>100000)return false;
  Object.assign(camera,{x:view.x,y:view.y,zoom:view.zoom});return true;
}

// Old shared ?mobile links must not force a desktop onto the touch renderer.
// A deliberate UI preview remains possible with ?ui=mobile / ?ui=desktop.
export function touchLayout({search='',coarse=false,hover=true,maxTouchPoints=0}={}){
  const override=new URLSearchParams(search).get('ui');
  if(override==='mobile')return true;
  if(override==='desktop')return false;
  return coarse&&!hover&&maxTouchPoints>0;
}

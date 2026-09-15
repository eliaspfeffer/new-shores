// Presentation metadata does not make a world dirty. Simulation changes do.
export function worldContent(text){
  if(!text)return null;
  const {savedAt,journal,camera,ecoMode,...world}=JSON.parse(text);
  return JSON.stringify(world);
}
export function canLoadRemote(local,checkpoint){return !!checkpoint&&worldContent(local)===worldContent(checkpoint);}

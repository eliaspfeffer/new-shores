export function editedPatrol(worker,action,index,routeTo){
  const original=worker.patrol;if(!original)return null;
  const points=original.points.map(p=>({...p})),count=points.length;
  const target=original.points[(original.next+(worker.phase==='patrol'?count-1:0))%count];
  if(action==='reverse')points.reverse();
  else{
    if(!Number.isInteger(index)||index<0||index>=count)return null;
    if(action==='remove'){if(count<=2)return null;points.splice(index,1);}
    else if(action==='up'||action==='down'){const other=index+(action==='up'?-1:1);if(other<0||other>=count)return null;[points[index],points[other]]=[points[other],points[index]];}
    else return null;
  }
  const center=p=>({x:p.x+.5,y:p.y+.5});
  let next=points.findIndex(p=>p.x===target.x&&p.y===target.y);if(next<0)next=index%points.length;
  if(!routeTo(worker,center(points[next]))||points.some((p,i)=>!routeTo(center(p),center(points[(i+1)%points.length]))))return null;
  return {points,next};
}

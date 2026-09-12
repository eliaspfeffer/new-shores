export const playerColors={
  red:{name:'Rot',base:'#d94c42',light:'#ffaca0'},
  blue:{name:'Blau',base:'#518de0',light:'#b0d7ff'},
  green:{name:'Grün',base:'#54ab61',light:'#b1edac'},
  violet:{name:'Violett',base:'#a576d5',light:'#e1c2ff'},
};
export function colorForOwner(owner,color='blue'){
  const own=Object.hasOwn(playerColors,color)?color:'blue';
  return playerColors[(owner||1)===1?own:own==='red'?'blue':'red'];
}

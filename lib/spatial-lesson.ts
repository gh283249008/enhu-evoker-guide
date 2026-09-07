// A normalized geometry lesson, not a live-game radius, speed or combat model.
export type SpatialPoint = {x:number;y:number};
export type SpatialPerson = SpatialPoint & {name:string};
export const SPATIAL_REACH = 70;
export const ORB_HALF_WIDTH = 12;
export const ORB_FLIGHT_MS = 3000;
export const SPATIAL_GROUPS:SpatialPerson[][] = [
  [{name:'坦克',x:59,y:33},{name:'输出甲',x:67,y:50},{name:'输出乙',x:55,y:68},{name:'输出丙',x:14,y:36}],
  [{name:'坦克',x:48,y:43},{name:'输出甲',x:59,y:48},{name:'输出乙',x:70,y:52},{name:'输出丙',x:81,y:56}],
  [{name:'坦克',x:66,y:22},{name:'输出甲',x:80,y:40},{name:'输出乙',x:60,y:78},{name:'输出丙',x:22,y:75}],
];
export function projectPoint(p:SpatialPoint,origin:SpatialPoint,angle:number){
  const rad=angle*Math.PI/180,dx=p.x-origin.x,dy=p.y-origin.y;
  return {forward:dx*Math.cos(rad)-dy*Math.sin(rad),lateral:Math.abs(dx*Math.sin(rad)+dy*Math.cos(rad))};
}
export function orbHits(people:SpatialPerson[],origin:SpatialPoint,angle:number,progress:number){
  const distance=SPATIAL_REACH*Math.max(0,Math.min(1,progress));
  return people.filter(p=>{const q=projectPoint(p,origin,angle);return q.forward>=0&&q.forward<=distance+1e-9&&q.lateral<=ORB_HALF_WIDTH+1e-9}).map(p=>p.name);
}
export function breathHits(people:SpatialPerson[],origin:SpatialPoint,angle:number){
  return people.filter(p=>{const q=projectPoint(p,origin,angle);return Math.hypot(p.x-origin.x,p.y-origin.y)<=SPATIAL_REACH&&q.forward>0&&q.lateral<=q.forward+1e-9}).map(p=>p.name);
}
export type OrbFlight={origin:SpatialPoint;angle:number;people:SpatialPerson[]};
export type OrbState={phase:'idle'|'flying'|'arrived'|'consumed';progress:number;hit:string[];reversion:string[];flight:OrbFlight|null};
export const idleOrb=():OrbState=>({phase:'idle',progress:0,hit:[],reversion:[],flight:null});
export type OrbAction={type:'reset'}|{type:'launch';flight:OrbFlight}|{type:'tick';flight:OrbFlight;elapsed:number}|{type:'reversion'};
export function orbReducer(state:OrbState,action:OrbAction):OrbState{
  if(action.type==='reset')return idleOrb();
  if(action.type==='launch')return state.phase==='flying'?state:{...idleOrb(),phase:'flying',flight:action.flight};
  if(action.type==='reversion')return state.phase==='arrived'&&state.hit.length?{...state,phase:'consumed',reversion:[...state.hit]}:state;
  // Identity guard ignores a stale animation callback after reset or a new shot.
  if(state.phase!=='flying'||state.flight!==action.flight)return state;
  const progress=Math.max(state.progress,Math.min(1,Math.max(0,action.elapsed/ORB_FLIGHT_MS)));
  return {...state,progress,phase:progress===1?'arrived':'flying',hit:orbHits(action.flight.people,action.flight.origin,action.flight.angle,progress)};
}

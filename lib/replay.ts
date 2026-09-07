import {act,advance,createState} from './combat.ts';
import type {Input,Model,Scenario,State} from './combat.ts';

/** Replay and manual stepping must execute the same input stream, not just damage.
 * Inputs at the endpoint belong to the next step (also true of checkpoint replay).
 * Work from timestamps, not accepted input count: dead casters can reject inputs
 * without adding them to state.input.
 */
export function advanceReplay(state:State,sc:Scenario,model:Model,inputs:Input[],delta:number,stopOnDeath=false,includeEndpoint=false):State {
 const actions=[...inputs].sort((a,b)=>a.at-b.at);
 const until=Math.min(sc.duration,state.t+Math.max(0,delta));
 let s=state;
 if(includeEndpoint && Math.abs(s.t-until)<.0001) { for(const a of actions.filter(a=>Math.abs(a.at-s.t)<.0001)) s=act(s,sc,model,a); }
 let n=actions.findIndex(a=>a.at>=s.t-.00001);
 if(n<0)n=actions.length;
 while(s.t<until-.0001&&!s.finished&&(!stopOnDeath||!s.dead.length)) {
  while(n<actions.length&&actions[n].at<=s.t+.00001)s=act(s,sc,model,actions[n++]);
  const end=Math.min(until,s.t+.05,actions[n]?.at??Infinity);
  s=advance(s,sc,model,end-s.t);
 }
 return s;
}
export function replayUntil(sc:Scenario,model:Model,inputs:Input[],time:number,includeEndpoint=false):State {
 const s=advanceReplay(createState(sc),sc,model,inputs,Math.max(0,time),false,includeEndpoint);
 if(includeEndpoint && s.t>=Math.min(sc.duration,Math.max(0,time))-.0001) return advanceReplay(s,sc,model,inputs,0,false,true);
 return s;
}
export function isArenaEnded(state:State){return state.finished||state.dead.length>0;}

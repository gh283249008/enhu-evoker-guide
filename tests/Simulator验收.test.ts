import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createState,runReference} from '../lib/combat.ts';
import type {Input,Model,Scenario} from '../lib/combat.ts';
import {advanceReplay,replayUntil,isArenaEnded} from '../lib/replay.ts';
import {parseHash,parseProgress,parseLastRead} from '../lib/navigation.ts';
const data=JSON.parse(readFileSync('public/content/操作演练.json','utf8')) as {model:Model;scenarios:Scenario[]};
let streams=0;
for(const sc of data.scenarios){
 for(const actions of [sc.referenceActions,...(Array.isArray(sc.negativeActions)?[sc.negativeActions as Input[]]:[])]){
  // This checks player/seek/step parity, not question quality (owned by 题库验收).
  const full=replayUntil(sc,data.model,actions,sc.duration);
  let stepped=createState(sc);
  while(!stepped.finished)stepped=advanceReplay(stepped,sc,data.model,actions,.25);
  assert.deepEqual(stepped,full,`${sc.id}: 0.25秒步进须执行全部回放按键`);
  assert.deepEqual(full.dead,runReference(sc,data.model,actions).dead,`${sc.id}: 回放结局一致`);
  const cut=Math.min(1.1,sc.duration/2);
  const snapshot=replayUntil(sc,data.model,actions,cut);
  assert.ok(snapshot.input.every(a=>a.at<cut),`${sc.id}: 检查点不含未来操作`);
  const resumed=advanceReplay(snapshot,sc,data.model,actions,sc.duration-cut);
  assert.deepEqual(resumed,full,`${sc.id}: 拖动后续播不能遗漏／重复按键`);
  if(full.dead.length){const death=full.logs.find(l=>l.type==='death')!;assert.equal(isArenaEnded(replayUntil(sc,data.model,actions,death.at,true)),true);}
  streams++;
 }
}
const sc=data.scenarios[0];
const offGrid:Input[]=[{at:.03,action:'turn',facing:10},{at:.27,action:'turn',facing:20},{at:1.08,action:'turn',facing:30}];
const off=replayUntil(sc,data.model,offGrid,1.2);
assert.deepEqual(off.input.map(i=>i.at),[.03,.27,1.08],'非0.05整刻的玩家输入不能延迟到下一格');
assert.deepEqual(advanceReplay(replayUntil(sc,data.model,offGrid,.27),sc,data.model,offGrid,.93),off);
assert.equal(replayUntil(sc,data.model,[],sc.duration+10).t,sc.duration,'超出时长不能无限循环');
for(const hash of ['#%','#%E0%A4%A','#guide/%'])assert.equal(parseHash(hash).view,'home');
assert.deepEqual(parseHash('#guide/14/chapter-14-section-01'),{view:'guide',chapter:14,section:'chapter-14-section-01'});
for(const hash of ['#guide/1.5/','#guide/NaN/','#guide/Infinity/'])assert.equal(parseHash(hash).chapter,1);
for(const raw of ['null','{}','42','"bad"','{']){assert.deepEqual(parseProgress(raw),[]);assert.equal(parseLastRead(raw),null);}
assert.deepEqual(parseProgress('[null,2,"chapter-01-section-01","chapter-01-section-01"]'),['chapter-01-section-01']);
assert.equal(parseLastRead('{"chapter":1.5,"section":""}'),null);
assert.deepEqual(parseLastRead('{"chapter":14,"section":"chapter-14-section-01"}'),{chapter:14,section:'chapter-14-section-01'});
console.log(`Simulator逻辑验收通过：${streams}条回放流；步进／拖动续播／检查点／坏hash／坏存储。`);

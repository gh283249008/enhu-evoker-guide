import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {runReference,createState,advance} from '../lib/combat.ts';
import type {Scenario,Model,Input} from '../lib/combat.ts';
const read=(name:string)=>JSON.parse(readFileSync('public/content/'+name,'utf8'));
const data=read('操作演练.json') as {scenarios:Scenario[],model:Model};
const chapters=readdirSync('public/content').filter(f=>/^chapter-\d+\.json$/.test(f)).map(read);
const sectionIds=new Set(chapters.flatMap(c=>c.sections.map((s:{id:string})=>s.id)));
assert.ok(data.scenarios.length>=80,'题库至少80道');
assert.equal(new Set(data.scenarios.map(s=>s.id)).size,data.scenarios.length,'题目ID唯一');
const fingerprints=new Map<string,string>();
let negativeCount=0;
for(const sc of data.scenarios){
 assert.ok(sc.title&&sc.intro&&sc.events.length,`${sc.id} 题面完整`);
 assert.ok(Array.isArray(sc.sectionIds)&&sc.sectionIds.length,`${sc.id} 有正文落点`);
 for(const id of sc.sectionIds as string[])assert.ok(sectionIds.has(id),`${sc.id} 无效正文落点 ${id}`);
 assert.equal(sc.initialHealth.length,5,`${sc.id} 五人血条`);
 assert.ok(sc.availableSkills.every(k=>data.model.skills[k]),`${sc.id} 所有技能由引擎支持`);
 assert.equal(new Set(sc.events.map(e=>e.id)).size,sc.events.length,`${sc.id} 事件ID唯一`);
 for(const e of sc.events){assert.ok(e.at>=0&&e.at<=sc.duration,`${sc.id} 事件在题目时长内`);for(const t of e.targets)assert.ok(t>=0&&t<5,`${sc.id} 合法伤害目标`)}
 const s=runReference(sc,data.model);
 assert.equal(s.finished,true,`${sc.id} 参考必须走完全程`);
 assert.deepEqual(s.dead,[],`${sc.id} 参考操作不得阵亡`);
 assert.deepEqual(s.logs.filter(l=>l.type==='rejected'),[],`${sc.id} 参考操作不得被拒绝`);
 assert.ok(Array.isArray(sc.negativeActions)&&sc.negativeActions.length,`${sc.id} 有可回放的关键错误`);
 assert.ok(typeof sc.negativeExplanation==='string'&&sc.negativeExplanation.length>15,`${sc.id} 解释错误代价`);
 const n=runReference(sc,data.model,sc.negativeActions as Input[]);
 assert.ok(n.dead.length>0,`${sc.id} 关键错误必须实际出现阵亡`);negativeCount++;
 // Compare model inputs, not title, explanation, event IDs or linked chapters.
 const fp=JSON.stringify({duration:sc.duration,health:sc.initialHealth,essence:sc.initialEssence,coverage:sc.initialCoverage,positions:sc.initialPositions,facing:sc.initialFacing,cooldowns:sc.initialCooldowns,buffs:sc.initialBuffs,stasis:sc.initialStasis,skills:sc.availableSkills,events:sc.events.map(e=>Object.fromEntries(Object.entries(e).filter(([k])=>!['id','name','explanation'].includes(k))))});
 assert.ok(!fingerprints.has(fp),`${sc.id} 与 ${fingerprints.get(fp)} 的实际题目条件完全相同`);fingerprints.set(fp,sc.id);
 const idle=advance(createState(sc),sc,data.model,sc.duration);
 assert.ok(idle.dead.length>0,`${sc.id} 不能完全不操作就过关`);
}
for(const name of readdirSync('public/content').filter(f=>/\.(json|md)$/.test(f))){const text=readFileSync('public/content/'+name,'utf8');assert.ok(!text.includes('/Users/'),`${name} 不公开个人绝对路径`)}
console.log(`题库验收通过：${data.scenarios.length}道，条件指纹${fingerprints.size}种，${negativeCount}道正负例验证；正文落点与公开内容检查通过。`);

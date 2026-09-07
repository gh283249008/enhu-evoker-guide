import {readFileSync} from 'node:fs';
import {runReference,review,createState,advance} from '../lib/combat.ts';
import type {Scenario,Model} from '../lib/combat.ts';
const data=JSON.parse(readFileSync('public/content/操作演练.json','utf8')) as {scenarios:Scenario[],model:Model};
let errors=0;
for(const sc of data.scenarios){const s=runReference(sc,data.model);const rejects=s.logs.filter(l=>l.type==='rejected');console.log(sc.id,'HP',s.health.map(n=>n.toFixed(1)),'dead',s.dead,'rejects',rejects.map(l=>`${l.at}:${l.text}`)); console.log('rules',review(s,sc).rules.map(r=>[r.id,r.passed])); if(s.dead.length||rejects.length)errors++; const idle=advance(createState(sc),sc,data.model,sc.duration);console.log('idle deaths',idle.dead);}
if(errors)throw new Error(errors+' reference scenarios failed');

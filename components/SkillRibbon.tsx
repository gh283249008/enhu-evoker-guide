import {SkillGlyph} from './SkillGlyph';

const sets:Record<number,{title:string;skills:string[];note:string}>= {
  2:{title:'塑焰主循环',skills:['梦境吐息','翡翠之花','青翠之拥'],note:'先留下持续治疗，再用花和拥把它兑现；不要把三个按钮当成同一类治疗。'},
  3:{title:'回响兑现链',skills:['时空畸体','回响','逆转'],note:'球负责把回响送到人身上，逆转负责把这批准备兑现；中间不要乱插会吃回响的治疗。'},
  5:{title:'资源观察',skills:['梦境吐息','翡翠之花','火焰吐息','裂解'],note:'治疗压力没到临界时才穿插输出；资源条不是让你把每个空档都塞满。'},
  6:{title:'危险轮次工具箱',skills:['静滞','回溯','时间膨胀','微风'],note:'提前回答下一轮危险，或在伤害后追回已经发生的承伤；先看问题属于哪一类。'},
  7:{title:'功能与走位',skills:['自然平衡','灼烧之焰','青翠之拥','时空畸体'],note:'驱散、救人和定向治疗都受目标、路径与位置限制，按钮亮不等于现在能按。'},
};

export default function SkillRibbon({chapter}:{chapter:number}){
  const set=sets[chapter];
  if(!set)return null;
  return <section className="skill-ribbon" aria-label={`${set.title}技能图示`}>
    <div className="skill-ribbon-heading"><span className="eyebrow">技能图鉴 · 先认图标，再记逻辑</span><p>{set.note}</p></div>
    <div className="skill-ribbon-list">{set.skills.map((skill,index)=><div className="skill-ribbon-card" key={skill}><SkillGlyph skill={skill} size="large"/><div><small>0{index+1}</small><b>{skill}</b></div>{index<set.skills.length-1&&<span className="skill-ribbon-arrow">→</span>}</div>)}</div>
  </section>;
}

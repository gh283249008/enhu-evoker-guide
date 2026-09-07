import {useState} from 'react';

type Glyph={mark:string;className:string;label:string;icon:string};
const wowhead=(name:string)=>`https://wow.zamimg.com/images/wow/icons/large/${name}.jpg`;
const glyphs:Record<string,Glyph>= {
  '梦境吐息':{mark:'✦',className:'breath',label:'吐息',icon:wowhead('ability_evoker_dreambreath')},
  '翡翠之花':{mark:'✿',className:'bloom',label:'花',icon:wowhead('ability_evoker_emeraldblossom')},
  '青翠之拥':{mark:'✥',className:'embrace',label:'拥',icon:wowhead('ability_evoker_verdantembrace')},
  '回响':{mark:'↯',className:'echo',label:'响',icon:wowhead('ability_evoker_echo')},
  '逆转':{mark:'⟲',className:'reversion',label:'逆',icon:wowhead('ability_evoker_reversion')},
  '时空畸体':{mark:'◈',className:'orb',label:'球',icon:wowhead('ability_evoker_temporalanomaly')},
  '静滞':{mark:'⧖',className:'stasis',label:'滞',icon:wowhead('ability_evoker_stasis')},
  '回溯':{mark:'↩',className:'rewind',label:'溯',icon:wowhead('ability_evoker_rewind')},
  '时间膨胀':{mark:'◷',className:'dilation',label:'时',icon:wowhead('ability_evoker_timedilation')},
  '微风':{mark:'≋',className:'zephyr',label:'风',icon:wowhead('ability_evoker_zephyr')},
  '活化烈焰':{mark:'✹',className:'living-flame',label:'焰',icon:wowhead('ability_evoker_livingflame')},
  '火焰吐息':{mark:'△',className:'fire-breath',label:'火',icon:wowhead('ability_evoker_firebreath')},
  '裂解':{mark:'╱',className:'disintegrate',label:'裂',icon:wowhead('ability_evoker_disintegrate')},
  '自然平衡':{mark:'✚',className:'dispel',label:'驱',icon:wowhead('ability_evoker_expunge')},
  '灼烧之焰':{mark:'⌁',className:'purge',label:'净',icon:wowhead('ability_evoker_cauterizingflame')},
};

export function SkillGlyph({skill,size='normal',showLabel=false,decorative=false}:{skill:string;size?:'small'|'normal'|'large';showLabel?:boolean;decorative?:boolean}){
  const icon=glyphs[skill]||{mark:'·',className:'generic',label:skill.slice(0,1),icon:''};
  const [imageFailed,setImageFailed]=useState(false);
  const showImage=Boolean(icon.icon)&&!imageFailed;
  return <span className={`skill-glyph skill-glyph-${size} skill-glyph-${icon.className} ${showImage?'has-icon':''}`} title={decorative?undefined:skill} aria-label={decorative?undefined:skill} aria-hidden={decorative||undefined}>
    {showImage?<img className="skill-glyph-image" src={icon.icon} alt="" referrerPolicy="no-referrer" decoding="async" onError={()=>setImageFailed(true)}/>:<i aria-hidden="true">{icon.mark}</i>}
    {showLabel&&<b>{icon.label}</b>}
  </span>;
}

export function skillClass(skill:string){return glyphs[skill]?.className||'generic'}
export function skillFromText(text:string){return Object.keys(glyphs).sort((a,b)=>b.length-a.length).find(skill=>text.includes(skill))||null}

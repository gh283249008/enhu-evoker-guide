const glyphs:Record<string,{mark:string;className:string;label:string}>= {
  '梦境吐息':{mark:'✦',className:'breath',label:'吐息'},
  '翡翠之花':{mark:'✿',className:'bloom',label:'花'},
  '青翠之拥':{mark:'✥',className:'embrace',label:'拥'},
  '回响':{mark:'↯',className:'echo',label:'响'},
  '逆转':{mark:'⟲',className:'reversion',label:'逆'},
  '时空畸体':{mark:'◈',className:'orb',label:'球'},
  '静滞':{mark:'⧖',className:'stasis',label:'滞'},
  '回溯':{mark:'↩',className:'rewind',label:'溯'},
  '时间膨胀':{mark:'◷',className:'dilation',label:'时'},
  '微风':{mark:'≋',className:'zephyr',label:'风'},
  '活化烈焰':{mark:'✹',className:'living-flame',label:'焰'},
  '火焰吐息':{mark:'△',className:'fire-breath',label:'火'},
  '裂解':{mark:'╱',className:'disintegrate',label:'裂'},
  '自然平衡':{mark:'✚',className:'dispel',label:'驱'},
  '灼烧之焰':{mark:'⌁',className:'purge',label:'净'},
};

export function SkillGlyph({skill,size='normal',showLabel=false,decorative=false}:{skill:string;size?:'small'|'normal'|'large';showLabel?:boolean;decorative?:boolean}){
  const icon=glyphs[skill]||{mark:'·',className:'generic',label:skill.slice(0,1)};
  return <span className={`skill-glyph skill-glyph-${size} skill-glyph-${icon.className}`} title={decorative?undefined:skill} aria-label={decorative?undefined:skill} aria-hidden={decorative||undefined}>
    <i aria-hidden="true">{icon.mark}</i>{showLabel&&<b>{icon.label}</b>}
  </span>;
}

export function skillClass(skill:string){return glyphs[skill]?.className||'generic'}
export function skillFromText(text:string){return Object.keys(glyphs).sort((a,b)=>b.length-a.length).find(skill=>text.includes(skill))||null}

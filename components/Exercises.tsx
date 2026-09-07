'use client';

import {useState} from 'react';
import {partyNames, renamePartyText} from '../lib/party-names';
import type {Exercise} from '../lib/types';

export default function Exercises({items,onComplete}:{items:Exercise[];onComplete:()=>void}){
  const [index,setIndex]=useState(0);
  const exercise=items[index];
  if(!exercise)return null;
  return <section className="exercise-wrap">
    <div className="section-label"><span>读懂以后，亲手判断</span><small>{index+1} / {items.length}</small></div>
    <ExerciseCard key={exercise.id} exercise={exercise} onComplete={onComplete}/>
    {items.length>1&&<div className="exercise-pagination">
      <button disabled={index===0} onClick={()=>setIndex(index-1)}>上一题</button>
      <button disabled={index===items.length-1} onClick={()=>setIndex(index+1)}>下一题 →</button>
    </div>}
  </section>;
}

function ExerciseCard({exercise,onComplete}:{exercise:Exercise;onComplete:()=>void}){
  const [selected,setSelected]=useState<string[]>([]);
  const [order,setOrder]=useState(exercise.choices.map(choice=>choice.id));
  const [submitted,setSubmitted]=useState(false);
  const [variant,setVariant]=useState(false);
  const names=partyNames(exercise.id);
  const partyText=(text:string)=>renamePartyText(text,names);
  const ordering=exercise.type==='order';
  const correct=ordering
    ? JSON.stringify(order)===JSON.stringify(exercise.orderedIds||exercise.correctIds)
    : selected.length===exercise.correctIds.length&&selected.every(id=>exercise.correctIds.includes(id));

  function toggle(id:string){
    if(submitted)return;
    setSelected(exercise.correctIds.length>1
      ? selected.includes(id)?selected.filter(value=>value!==id):[...selected,id]
      : [id]);
  }

  function move(index:number,direction:number){
    const next=[...order];
    [next[index],next[index+direction]]=[next[index+direction],next[index]];
    setOrder(next);
  }

  return <div className="exercise-card">
    <p className="eyebrow">{({order:'手法排序',target:'选择救援目标',diagnose:'手法诊断',decision:'情景决策'} as Record<string,string>)[exercise.type]||'思考练习'} · 教学情景</p>
    <h3>{exercise.title}</h3>
    <p>{partyText(exercise.context)}</p>
    <details className="conditions" open>
      <summary>本题条件 · 先看清，再出手</summary>
      <ul>{exercise.conditions.map((condition,index)=><li key={index}>{partyText(condition)}</li>)}</ul>
    </details>
    <h4>{partyText(exercise.prompt)}</h4>
    {!ordering&&exercise.correctIds.length>1&&<small>本题需要选出多个动作。</small>}
    <div className="exercise-options">{(ordering?order:exercise.choices.map(choice=>choice.id)).map((id,index)=>{
      const choice=exercise.choices.find(item=>item.id===id)!;
      const label=partyText(choice.label);
      return ordering
        ? <div className="order-option" key={id}><span>{index+1}</span><b>{label}</b><button aria-label={`上移${label}`} disabled={submitted||index===0} onClick={()=>move(index,-1)}>↑</button><button aria-label={`下移${label}`} disabled={submitted||index===order.length-1} onClick={()=>move(index,1)}>↓</button></div>
        : <button key={id} disabled={submitted} aria-pressed={selected.includes(id)} className={`answer-option ${selected.includes(id)?'chosen':''} ${submitted&&exercise.correctIds.includes(id)?'correct':''}`} onClick={()=>toggle(id)}><span>{String.fromCharCode(65+index)}</span>{label}</button>;
    })}</div>
    {!submitted
      ? <button className="button primary" disabled={!ordering&&!selected.length} onClick={()=>{setSubmitted(true);onComplete()}}>提交我的判断 →</button>
      : <div className="exercise-feedback">
          <h4>{correct?'思路对了。现在看为什么。':'先别背答案，看看判断漏在了哪里。'}</h4>
          {ordering&&<p><b>参考顺序：</b>{(exercise.orderedIds||exercise.correctIds).map(id=>partyText(exercise.choices.find(choice=>choice.id===id)?.label||'')).join(' → ')}</p>}
          {exercise.choices.map(choice=><p key={choice.id}><strong>{partyText(choice.label)}</strong><br/>{partyText(choice.explanation)}</p>)}
          <blockquote>{partyText(exercise.takeaway)}</blockquote>
          {exercise.variant&&<><button className="text-button" onClick={()=>setVariant(!variant)}>换一个条件，还能照抄吗？ {variant?'−':'+'}</button>{variant&&<p><b>{partyText(exercise.variant.condition)}</b><br/>{partyText(exercise.variant.explanation)}</p>}</>}
          <button className="button ghost" onClick={()=>{setSubmitted(false);setSelected([]);setVariant(false)}}>重新判断</button>
        </div>}
  </div>;
}

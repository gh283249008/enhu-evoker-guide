'use client';
import {useState} from 'react';
import {ArrowDown,ArrowRight,Check,Eye,Flame,Layers,ShieldAlert,Target,Timer,TriangleAlert} from 'lucide-react';
import type {Storyboard,LessonScene} from '../lib/storyboard';
import {InlineMarkdown, default as Markdown} from './Markdown';

const evidenceNames={recorded:'正文记录',inference:'条件判断',hypothesis:'假设教学',unknown:'证据缺口'};
const stateNames={hit:'本次受伤',danger:'优先观察',covered:'已见覆盖',safe:'此时稳定',unknown:'不能确定'};
const icons={targets:Target,arrival:Timer,slots:Layers,spacing:Eye,dispel:ShieldAlert,resources:Flame,decision:Target};

/** No invented health percentages, synthetic times, or inferred player coordinates. */
export default function WaveVisual({lesson}:{lesson:Storyboard}){
 return <section className="field-lesson" aria-label="本节分镜讲解">
  <header className="field-lesson-heading"><p className="eyebrow">拆开看 · 再连起来打</p><h2>{lesson.title}</h2><p><InlineMarkdown text={lesson.verdict}/></p></header>
  <nav className="scene-index" aria-label="本节演示目录">{lesson.scenes.map((s,i)=><a key={i} href={`#${lesson.sectionId}-scene-${i+1}`} onClick={e=>{e.preventDefault();document.getElementById(`${lesson.sectionId}-scene-${i+1}`)?.scrollIntoView({behavior:'smooth',block:'start'})}}><span>{String(i+1).padStart(2,'0')}</span>{s.title}</a>)}</nav>
  {lesson.scenes.map((s,i)=><Scene key={i} scene={s} number={i+1} id={`${lesson.sectionId}-scene-${i+1}`}/>)}
  <footer className="field-takeaway"><Check size={21}/><div><b>这波带走一个判断</b><p><InlineMarkdown text={lesson.takeaway}/></p></div></footer>
  <p className="field-boundary"><Eye size={15}/><InlineMarkdown text={lesson.boundary}/></p>
 </section>
}
function Scene({scene:s,number,id}:{scene:LessonScene;number:number;id:string}){
 const [showMistake,setShowMistake]=useState(false);
 const Icon=icons[s.visual.type as keyof typeof icons]||Target;
 return <article className={`lesson-scene scene-${s.visual.type}`} id={id}>
  <header className="lesson-scene-header"><span className="scene-number">{String(number).padStart(2,'0')}</span><div><div className="scene-meta"><span className={`evidence-tag ${s.evidence}`}>{evidenceNames[s.evidence]}</span>{s.at&&<time>{s.at}</time>}</div><h3>{s.title}</h3></div></header>
  <p className="scene-focus"><Icon size={19}/><InlineMarkdown text={s.focus}/></p>
  <div className="scene-explainer"><div className="scene-drawing"><SceneDrawing scene={s}/></div><div className="scene-mechanic"><small>先认清眼前发生什么</small><p><InlineMarkdown text={s.mechanic}/></p></div></div>
  <div className="scene-decision-switch" role="group" aria-label="比较处理方式"><button aria-pressed={!showMistake} onClick={()=>setShowMistake(false)}><Check size={16}/>我该怎样接</button><button aria-pressed={showMistake} onClick={()=>setShowMistake(true)}><TriangleAlert size={16}/>换一手会错在哪</button></div>
  <div className={`scene-answer ${showMistake?'mistake':''}`} aria-live="polite"><b>{showMistake?'别把这一手学反了':'把下一键说具体'}</b><p><InlineMarkdown text={showMistake?s.pitfall:s.action}/></p><div className="scene-because"><span>为什么</span><p><InlineMarkdown text={s.why}/></p></div></div>
  <details className="scene-evidence"><summary>核对这一幕的正文依据</summary><blockquote><Markdown text={s.sourceQuote}/></blockquote><p>“正文记录”仅表示项目资料有记载；判断和假设不是日志还原。</p></details>
 </article>
}
function SceneDrawing({scene:s}:{scene:LessonScene}){
 const labels=s.visual.labels;
 if(s.visual.type==='slots')return <div className="draw-slots"><span className="draw-caption">静滞状态 / 储存内容 · 不把储存当释放</span><div>{labels.map((l,i)=><section key={i}><span className="slot-crystal"/><small>{i+1}</small><b>{l}</b></section>)}</div>{s.actors.length>0&&<Actors scene={s}/>}</div>;
 if(s.visual.type==='arrival')return <div className="draw-arrival"><span className="draw-caption">逐项对照事件 · 不是按比例绘制的时间轴</span><ol>{labels.map((l,i)=><li key={i}><span className="arrival-dot">{i+1}</span><p>{l}</p>{i<labels.length-1&&<ArrowDown size={18}/>}</li>)}</ol>{s.actors.length>0&&<Actors scene={s}/>}</div>;
 if(s.visual.type==='spacing')return <div className="draw-relations"><span className="draw-caption">位置条件示意 · 不代表本场实际坐标</span><div className="relation-nodes">{labels.map((l,i)=><div key={i}><span className="relation-ring"><Eye size={22}/></span><p>{l}</p></div>)}</div>{s.actors.length>0&&<Actors scene={s}/>}</div>;
 if(s.visual.type==='dispel')return <div className="draw-dispel"><span className="draw-caption">先辨认减益，再核对按钮与后果</span>{labels.map((l,i)=><div key={i}><span className="dispel-token">{i===0?'!':i===1?'✦':'✓'}</span><p>{l}</p>{i<labels.length-1&&<ArrowDown size={17}/>}</div>)}{s.actors.length>0&&<Actors scene={s}/>}</div>;
 if(s.visual.type==='resources')return <div className="draw-resources"><span className="draw-caption">本轮要用什么 / 下一轮失去什么</span>{labels.map((l,i)=><div key={i}><span className="resource-gem"/><b>{l}</b></div>)}{s.actors.length>0&&<Actors scene={s}/>}</div>;
 if(s.visual.type==='decision')return <div className="draw-decision"><span className="draw-caption">把条件与动作放在一起判断</span>{labels.map((l,i)=><div key={i}><span>{String(i+1).padStart(2,'0')}</span><p>{l}</p>{i<labels.length-1&&<ArrowRight size={17}/>}</div>)}{s.actors.length>0&&<Actors scene={s}/>}</div>;
 return <div className="draw-targets"><span className="draw-caption">只标已知对象 · 没有证据，不虚构血线</span><Actors scene={s}/><div className="target-labels">{labels.map((l,i)=><p key={i}><span/><b>{l}</b></p>)}</div></div>
}
function Actors({scene:s}:{scene:LessonScene}){return <div className="scene-actors">{s.actors.map((a,i)=><div key={i} className={`scene-actor actor-${a.state}`}><span className="actor-marker">{a.name.slice(0,1)}</span><div><b>{a.name}</b><small>{stateNames[a.state]||'按条件判断'}</small></div><p>{a.note}</p></div>)}</div>}

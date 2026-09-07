'use client';
import {useEffect, useReducer, useState} from 'react';
import {SPATIAL_GROUPS as groups, SPATIAL_REACH as reach, ORB_HALF_WIDTH, breathHits, idleOrb, orbReducer} from '../lib/spatial-lesson';

export default function SpatialLesson({kind='breath'}:{kind?:'breath'|'orb'|'embrace'}){
  const [formation,setFormation]=useState(kind==='orb'?1:0),[origin,setOrigin]=useState({x:26,y:52}),[angle,setAngle]=useState(0),[ordinaryPhase,setOrdinaryPhase]=useState(0),[selected,setSelected]=useState(0),[ordinaryHit,setOrdinaryHit]=useState<string[]>([]);
  const [orb,dispatch]=useReducer(orbReducer,undefined,idleOrb);
  const people=groups[formation];
  const phase=kind==='orb'?(orb.phase==='idle'?0:orb.phase==='flying'?1:2):ordinaryPhase;
  const hit=kind==='orb'?orb.hit:ordinaryHit,reversion=orb.reversion;
  const reset=()=>{dispatch({type:'reset'});setOrdinaryPhase(0);setOrdinaryHit([])};
  const flight=orb.flight;
  const flying=orb.phase==='flying';
  useEffect(()=>{
    if(!flight||!flying)return;
    let frame=0;
    const start=performance.now();
    function tick(now:number){
      dispatch({type:'tick',flight:flight!,elapsed:now-start});
      frame=window.requestAnimationFrame(tick);
    }
    frame=window.requestAnimationFrame(tick);
    return ()=>window.cancelAnimationFrame(frame);
  },[flight,flying]);
  function fire(){
    if(kind==='orb'){dispatch({type:'launch',flight:{origin:{...origin},angle,people:people.map(p=>({...p}))}});return}
    setOrdinaryHit(kind==='embrace'?[people[selected].name]:breathHits(people,origin,angle));setOrdinaryPhase(1);
  }
  function receiveReversion(){dispatch({type:'reversion'})}
  const titles={breath:'绿喷不是点谁就喷谁：移动你自己，让队友进扇形。',orb:'时空畸体不是丢给敌人：让路径真正穿过队友。',embrace:'青翠之拥不只是奶一口：你的角色也会过去。'};
  return <section className={`spatial-lesson spatial-${kind}`}>
    <div className="diagram-heading"><p className="eyebrow">空间关系实验室 · 亲手调整</p><small>几何示意，不代表实服半径/速度</small></div><h3>{titles[kind]}</h3>
    <p className="spatial-lead">{kind==='breath'?'框架能选到队友，不代表定向治疗能碰到他。试着救回身后的那个人，而不是盯着技能条反复按。':kind==='orb'?'先安排路径，再决定拿回响做什么。球还没经过远处的人，就急着接逆转，不能假设所有人都已有回响。':'先点选队友，看清落点，再决定飞不飞。红圈内的队友可能需要你用安全的远程治疗来救。'}</p>
    <div className="formation-switch"><span>队伍站位</span>{['有人在身后','沿路径站开','分散处理机制'].map((n,i)=><button key={n} aria-pressed={formation===i} onClick={()=>{setFormation(i);reset()}}>{n}</button>)}</div>
    <div className="spatial-board" role="group" tabIndex={0} aria-label="点击空地或聚焦后按方向键改变治疗者位置" onKeyDown={e=>{if(e.target!==e.currentTarget)return;const step=3;const dx=e.key==='ArrowRight'?step:e.key==='ArrowLeft'?-step:0,dy=e.key==='ArrowDown'?step:e.key==='ArrowUp'?-step:0;if(!dx&&!dy)return;e.preventDefault();setOrigin(p=>({x:Math.max(5,Math.min(95,p.x+dx)),y:Math.max(8,Math.min(92,p.y+dy))}));reset()}} onClick={e=>{const r=e.currentTarget.getBoundingClientRect();setOrigin({x:Math.max(5,Math.min(95,(e.clientX-r.left)/r.width*100)),y:Math.max(8,Math.min(92,(e.clientY-r.top)/r.height*100))});reset()}}>
      <div className="board-grid"/>{kind==='embrace'?<div className="spatial-danger"><b>危险地面</b><span>飞入不是正确急救</span></div>:<svg className="spatial-geometry" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <g transform={`translate(${origin.x} ${origin.y}) rotate(${-angle})`}>
          {kind==='orb'?<>
            <rect className="orb-corridor" x="0" y={-ORB_HALF_WIDTH} width={reach} height={ORB_HALF_WIDTH*2}/>
            {orb.phase!=='idle'&&<>
              <rect className="orb-swept" x="0" y={-ORB_HALF_WIDTH} width={reach*orb.progress} height={ORB_HALF_WIDTH*2}/>
              <line className="orb-front" x1={reach*orb.progress} x2={reach*orb.progress} y1={-ORB_HALF_WIDTH} y2={ORB_HALF_WIDTH}/>
              <circle className="orb-head" cx={reach*orb.progress} cy="0" r="2"/>
            </>}
          </>:<path className="breath-sector" d={`M 0 0 L ${reach/Math.sqrt(2)} ${-reach/Math.sqrt(2)} A ${reach} ${reach} 0 0 1 ${reach/Math.sqrt(2)} ${reach/Math.sqrt(2)} Z`}/>}
        </g>
      </svg>}
      {people.map((p,i)=>{const included=hit.includes(p.name),reverted=reversion.includes(p.name);return <button key={p.name} className={`spatial-person ${included?'covered':''} ${reverted?'reversion-ready':''} ${kind==='embrace'&&selected===i?'chosen':''}`} style={{left:p.x+'%',top:p.y+'%'}} onClick={e=>{e.stopPropagation();setSelected(i);if(kind==='embrace')reset()}}><span>{p.name}</span><b>{p.name==='坦克'?'坦':p.name.slice(-1)}</b><small>{reverted?'已接逆转':kind==='orb'&&included?'已命中 · 有回响':included?(kind==='orb'?'已命中':kind==='breath'?'本次覆盖':'选定落点'):kind==='embrace'?'点击选目标':kind==='orb'?(phase===0?'等待发射':phase===1?'尚未经过':'本次未命中'):'尚未覆盖'}</small></button>})}
      <div className="spatial-player" style={{left:(kind==='embrace'&&phase?people[selected].x:origin.x)+'%',top:(kind==='embrace'&&phase?people[selected].y:origin.y)+'%'}}><b style={{transform:`rotate(${-angle}deg)`}}>➤</b><span>你</span></div><div className="board-instruction">点击空地 / 聚焦后按方向键调整起点 · 范围为教学示意</div>
    </div>
    <div className="spatial-controls"><label>人物朝向 <input aria-label="人物朝向" type="range" min="-180" max="180" value={angle} onChange={e=>{setAngle(Number(e.target.value));reset()}}/><b>{angle}°</b></label><button className="button primary" disabled={kind==='orb'&&flying} onClick={fire}>{kind==='orb'?(phase===1?'时空畸体飞行中…':'发出时空畸体'):kind==='breath'?'按当前朝向释放绿喷':'查看飞行落点'} →</button><button className="text-button" onClick={()=>{setOrigin({x:8,y:50});setAngle(0);reset()}}>试试从队伍后方出发</button></div>
    {phase>0&&<div className="spatial-result" aria-live="polite"><strong>{kind==='embrace'?`你飞向了${people[selected].name}。`:kind==='orb'&&flying?`飞行中（${Math.round(orb.progress*100)}%） · 已经过：${hit.join('、')||'暂无'}。`:hit.length?`当前路线命中：${hit.join('、')}。`:'这条路线没有命中队友。'}</strong><p>{kind==='breath'?`本次没有覆盖：${people.filter(p=>!hit.includes(p.name)).map(p=>p.name).join('、')||'无'}。先检查是谁漏了，再决定能否重新调整，或用单体治疗补洞。不要因为多蓄了一档就以为身后的人会自动被奶到。`:kind==='orb'?'金色横线是当前扫描前沿：经过队友的圆心才登记命中并获得教学回响。本练习为完整观察而等飞行结束后再开放逆转按钮，不表示实战必须等全程结束。坦克与输出用相同判定；这些仅为几何示意，不是战斗引擎新增技能。':people[selected].x>58&&people[selected].y<47?'这个落点处于红色危险区。图解允许你查看错误的后果，但不建议这样救：检查是否有来得及的远程急救、个人防御或安全移动方案。':'这个示意落点没有红圈，但实战还需要检查视线、距离、下一次地面伤害，以及飞过去以后能不能继续覆盖全队。'}</p>{kind==='orb'&&<button className="button ghost" disabled={phase!==2||!hit.length||reversion.length===hit.length} onClick={receiveReversion}>{reversion.length?`已接逆转：${reversion.join('、')}`:'确认命中后接逆转'}</button>}{kind==='orb'&&phase===2&&hit.length>0&&<p className="spatial-status">命中状态：{hit.map(n=><span key={n} className={reversion.includes(n)?'is-ready':''}>{n}{reversion.includes(n)?' · 回响已兑现':''}</span>)}</p>}</div>}
    <div className="spatial-takeaways"><div><span>先看位置</span><p>{kind==='orb'?'从队伍一侧或后方选起点，让更多人落在同一路径。':'不要只转镜头。调整人物实际朝向，必要时移动自己。'}</p></div><div><span>再看时机</span><p>{kind==='orb'?'远处目标不是按下按钮就获得回响。观察逐个命中；本演示等飞行结束后，手动接逆转才兑现回响。':'如果队友马上死亡，来不及调整群疗，就换能赶到的单体急救。'}</p></div><div><span>最后补洞</span><p>队友分散时不强求一个技能包办。明确谁漏了，单独给他答案。</p></div></div>
  </section>
}

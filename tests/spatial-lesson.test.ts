import assert from 'node:assert/strict';
import {test} from 'node:test';
import {readFileSync} from 'node:fs';
import {SPATIAL_GROUPS, SPATIAL_REACH, ORB_HALF_WIDTH, ORB_FLIGHT_MS, projectPoint, orbHits, breathHits, idleOrb, orbReducer} from '../lib/spatial-lesson.ts';
const origin={x:26,y:52};
const flight=()=>({origin,angle:0,people:SPATIAL_GROUPS[1]});
const launch=()=>orbReducer(idleOrb(),{type:'launch',flight:flight()});

test('沿路径默认阵形：坦克与三个输出都能命中，不按角色排除',()=>{
  assert.deepEqual(orbHits(SPATIAL_GROUPS[1],origin,0,1),['坦克','输出甲','输出乙','输出丙']);
  assert.deepEqual(projectPoint(SPATIAL_GROUPS[1][0],origin,0),{forward:22,lateral:9});
});
test('三个阵形都能通过转向扫到坦克；默认路线并非总能扫到',()=>{
  for(const people of SPATIAL_GROUPS){
    const tank=people[0];
    const angle=Math.atan2(origin.y-tank.y,tank.x-origin.x)*180/Math.PI;
    assert(orbHits(people,origin,angle,1).includes('坦克'));
  }
  assert(!orbHits(SPATIAL_GROUPS[0],origin,0,1).includes('坦克'));
});
test('左右/后方/射程边界/通道边界使用同一几何判定',()=>{
  const o={x:0,y:0};
  const points=[{name:'边界',x:70,y:12},{name:'过宽',x:20,y:12.01},{name:'过远',x:70.01,y:0},{name:'背后',x:-1,y:0}];
  assert.deepEqual(orbHits(points,o,0,1),['边界']);
  assert.deepEqual(orbHits(points,o,180,1),['背后']);
  assert.deepEqual(orbHits([{name:'向上',x:0,y:-20}],o,90,1),['向上']);
});
test('飞行650ms未到坦克；1000ms只到坦克，1500ms才到输出甲',()=>{
  let s=launch();
  s=orbReducer(s,{type:'tick',flight:s.flight!,elapsed:650});
  assert.equal(s.phase,'flying');assert.deepEqual(s.hit,[]);
  s=orbReducer(s,{type:'tick',flight:s.flight!,elapsed:1000});
  assert.deepEqual(s.hit,['坦克']);assert.deepEqual(s.reversion,[]);
  s=orbReducer(s,{type:'tick',flight:s.flight!,elapsed:1500});
  assert.deepEqual(s.hit,['坦克','输出甲']);
  s=orbReducer(s,{type:'tick',flight:s.flight!,elapsed:ORB_FLIGHT_MS});
  assert.equal(s.phase,'arrived');assert.equal(s.progress,1);assert.equal(s.hit.length,4);assert.deepEqual(s.reversion,[]);
});
test('飞行中接逆转无效；命中不自动兑现，手动接才兑现且不能重复消费',()=>{
  let s=launch();
  assert.equal(orbReducer(s,{type:'reversion'}),s);
  s=orbReducer(s,{type:'tick',flight:s.flight!,elapsed:ORB_FLIGHT_MS});
  assert.deepEqual(s.reversion,[]);
  s=orbReducer(s,{type:'reversion'});
  assert.equal(s.phase,'consumed');assert.deepEqual(s.reversion,s.hit);
  assert.equal(orbReducer(s,{type:'reversion'}),s);
});
test('完全漏人仍完成飞行，但不能接逆转或显示成功',()=>{
  let s=orbReducer(idleOrb(),{type:'launch',flight:{...flight(),angle:180}});
  s=orbReducer(s,{type:'tick',flight:s.flight!,elapsed:ORB_FLIGHT_MS});
  assert.equal(s.phase,'arrived');assert.deepEqual(s.hit,[]);
  assert.equal(orbReducer(s,{type:'reversion'}),s);
});
test('重置（移动/朝向/阵形）清理已命中及逆转；旧飞行回调不能复活状态',()=>{
  let s=launch();const oldFlight=s.flight!;
  s=orbReducer(s,{type:'tick',flight:oldFlight,elapsed:1000});
  s=orbReducer(s,{type:'reset'});
  assert.deepEqual(s,idleOrb());
  assert.equal(orbReducer(s,{type:'tick',flight:oldFlight,elapsed:ORB_FLIGHT_MS}),s);
  s=orbReducer(s,{type:'launch',flight:flight()});
  assert.equal(orbReducer(s,{type:'tick',flight:oldFlight,elapsed:ORB_FLIGHT_MS}),s);
});
test('飞行中重复发射不重启；完成后的新球清除上一轮逆转',()=>{
  let s=launch();
  assert.equal(orbReducer(s,{type:'launch',flight:flight()}),s);
  s=orbReducer(s,{type:'tick',flight:s.flight!,elapsed:ORB_FLIGHT_MS});
  s=orbReducer(s,{type:'reversion'});
  s=orbReducer(s,{type:'launch',flight:flight()});
  assert.equal(s.phase,'flying');assert.deepEqual(s.hit,[]);assert.deepEqual(s.reversion,[]);
});
test('错序或超时帧不使球倒退或飞出范围',()=>{
  let s=launch();
  s=orbReducer(s,{type:'tick',flight:s.flight!,elapsed:2000});
  s=orbReducer(s,{type:'tick',flight:s.flight!,elapsed:500});
  assert.equal(s.progress,2/3);
  s=orbReducer(s,{type:'tick',flight:s.flight!,elapsed:10000});
  assert.equal(s.progress,1);
});
test('宽屏和窄屏非等比缩放：SVG通道与百分比圆心仍在同一坐标系',()=>{
  for(const [w,h] of [[900,600],[375,300]])for(const angle of [0,30,90,-60,180]){
    const theta=angle*Math.PI/180;
    const local={x:25,y:8};
    const world={x:origin.x+local.x*Math.cos(theta)+local.y*Math.sin(theta),y:origin.y-local.x*Math.sin(theta)+local.y*Math.cos(theta)};
    const pixels={x:world.x*w/100,y:world.y*h/100};
    const normalized={x:pixels.x/w*100,y:pixels.y/h*100};
    const q=projectPoint(normalized,origin,angle);
    assert(Math.abs(q.forward-local.x)<1e-9);assert(Math.abs(q.lateral-local.y)<1e-9);
    assert(orbHits([{...normalized,name:'圆心'}],origin,angle,1).includes('圆心'));
  }
});
test('绿喷仍是限距扇形，不把圆外或身后队友算覆盖',()=>{
  assert.deepEqual(breathHits([{name:'正前',x:10,y:0},{name:'身后',x:-10,y:0},{name:'圆外',x:60,y:60},{name:'边角',x:30,y:30}],{x:0,y:0},0),['正前','边角']);
});
test('组件接线防回归：同一progress绘制前沿，独立逆转动作，卸载清理动画帧',()=>{
  const source=readFileSync(new URL('../components/SpatialLesson.tsx',import.meta.url),'utf8');
  const css=readFileSync(new URL('../app/globals.css',import.meta.url),'utf8');
  assert(source.includes('viewBox="0 0 100 100" preserveAspectRatio="none"'));
  assert(source.includes('width={reach*orb.progress}'));
  assert(source.includes("dispatch({type:'reversion'})"));
  assert(source.includes('window.cancelAnimationFrame(frame)'));
  assert(!source.includes('setTimeout'));assert(!source.includes('travelling-orb'));
  assert(css.includes('.spatial-board .spatial-person>b{position:absolute;inset:0;'));
  assert.equal(SPATIAL_REACH,70);assert.equal(ORB_HALF_WIDTH,12);
});

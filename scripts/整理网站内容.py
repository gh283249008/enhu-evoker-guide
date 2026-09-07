import json,re,pathlib
ROOT=pathlib.Path(__file__).resolve().parents[1]; SOURCE=ROOT.parent/'research/网站内容/攻略内容.json'; OUT=ROOT/'public/content'; OUT.mkdir(exist_ok=True)
x=json.loads(SOURCE.read_text()); index={'meta':{k:x['meta'][k] for k in ['title','version','season','specialization','heroTalent','sourceRevisionDate','counts']},'chapters':[],'glossary':x['glossary'],'search':[]}
for g in index['glossary']: g['source']={k:v for k,v in g.get('source',{}).items() if k in ['chapterId','sectionId']}
for c in x['chapters']:
 out={k:c[k] for k in ['id','number','title','shortTitle','part','description']}; out['sections']=[]; seen=set()
 for s in c['sections']:
  if not s.get('display',{}).get('visible',True): continue
  if s.get('runKey') and s.get('pullId') is not None:
   key=(s['runKey'],s['pullId'])
   if key in seen: continue
   seen.add(key)
   r=next(r for r in x['runs'] if r['runKey']==s['runKey']); rs=next(t for t in r['sections'] if str(t['pullId'])==str(s['pullId']))
   twins=[t for t in c['sections'] if t.get('runKey')==s['runKey'] and str(t.get('pullId'))==str(s['pullId'])]
   # Preserve canonical complete pull, additional main-guide discussion in a clearly separate reading block.
   extra='\n\n'.join(t.get('displayMarkdown',t['markdown']) for t in twins if t.get('origin')=='book' and t['markdown'].strip() not in rs['markdown'])
   item={'id':s['id'],'title':rs['title'],'originalTitle':s['title'],'markdown':rs['markdown'],'extraMarkdown':extra,'kind':'wave','runKey':r['runKey'],'runLabel':r['label'],'level':r['level'],'logUrl':r['logUrl'],'pullId':rs['pullId'],'teachingProfile':rs.get('teachingProfile'),'teachingType':rs.get('teachingType'),'timing':rs.get('timing'),'aliases':[t['id'] for t in twins]}
  else: item={k:s[k] for k in ['id','title','kind']}; item['markdown']=s.get('displayMarkdown',s['markdown'])
  out['sections'].append(item)
  plain=re.sub(r'[#*\[\]`>\n]',' ',item['markdown'])
  index['search'].append({'chapter':c['number'],'section':item['id'],'title':item['title'],'text':plain,'runLabel':item.get('runLabel','')})
 # retain full original chapter as optional source without loading on first view
 out['originalMarkdown']=c['markdown']
 (OUT/f"{c['id']}.json").write_text(json.dumps(out,ensure_ascii=False,separators=(',',':')))
 index['chapters'].append({**{k:out[k] for k in ['id','number','title','shortTitle','part','description']},'sections':[{k:s[k] for k in ['id','title','kind','runLabel','runKey','pullId','aliases'] if k in s} for s in out['sections']]})
(OUT/'目录.json').write_text(json.dumps(index,ensure_ascii=False,separators=(',',':')))
supplements=[{'id':s['id'],'title':s.get('title','来源与说明'),'markdown':s['markdown']} for s in x['meta']['supplements']]
(OUT/'来源说明.json').write_text(json.dumps(supplements,ensure_ascii=False,separators=(',',':')))
# Keep research source out of public payload, expose source Markdown as explicit downloads.
for name in ['恩护唤魔师-12.1-大秘境全方位攻略-重写版.md','恩护唤魔师-16场182段实战附册.md']:
 (OUT/name).write_text((ROOT.parent/name).read_text())
# Avoid serving duplicate 13 MB research payload with filesystem/evidence internals.
for name in ['攻略内容.json','内容校验.json']:
 p=OUT/name
 if p.exists(): p.unlink()
print('18章已分片；阅读段数',sum(len(c['sections']) for c in index['chapters']),'实战段数',sum(1 for c in index['chapters'] for s in c['sections'] if s.get('runKey')))

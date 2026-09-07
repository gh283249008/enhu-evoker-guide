export type Route={view:'home'|'guide'|'sources';chapter:number;section:string};
export const initialRoute:Route={view:'home',chapter:1,section:''};
export function parseHash(hash:string):Route {
 let decoded:string;
 try{decoded=decodeURIComponent(hash.replace(/^#/,''))}catch{return initialRoute}
 const parts=decoded.split('/');
 if(parts[0]==='sources')return {view:'sources',chapter:1,section:''};
 if(parts[0]!=='guide')return initialRoute;
 const value=Number(parts[1]);
 const chapter=Number.isFinite(value)?Math.min(18,Math.max(1,Math.trunc(value)||1)):1;
 return {view:'guide',chapter,section:parts[2]||''};
}
export function parseProgress(raw:string|null):string[]{
 try{const data:unknown=JSON.parse(raw||'[]');return Array.isArray(data)?[...new Set(data.filter((v):v is string=>typeof v==='string'&&/^chapter-\d{2}-section-\d+$/.test(v)))]:[]}catch{return []}
}
export function parseLastRead(raw:string|null):{chapter:number;section:string}|null {
 try{const data:unknown=JSON.parse(raw||'null');if(!data||typeof data!=='object')return null;
 const v=data as Record<string,unknown>;
 return Number.isInteger(v.chapter)&&Number(v.chapter)>=1&&Number(v.chapter)<=18&&typeof v.section==='string'&&(v.section===''||/^chapter-\d{2}-section-\d+$/.test(v.section))?{chapter:Number(v.chapter),section:v.section}:null;
 }catch{return null}
}

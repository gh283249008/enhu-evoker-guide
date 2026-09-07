export type SceneActor = {name:string;state:'hit'|'danger'|'covered'|'safe'|'unknown';note:string};
export type LessonScene = {
 title:string;kind:string;evidence:'recorded'|'inference'|'hypothesis'|'unknown';at:string;
 focus:string;actors:SceneActor[];mechanic:string;action:string;why:string;pitfall:string;
 visual:{type:string;labels:string[];values?:unknown[];rule?:string};sourceQuote:string;
};
export type Storyboard = {sectionId:string;title:string;verdict:string;scenes:LessonScene[];takeaway:string;boundary:string};

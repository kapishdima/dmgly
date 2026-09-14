import { Composition } from "./model";
export type History = { past:Composition[];present:Composition;future:Composition[];transaction:Composition|null };
export type HistoryAction = {type:"edit";value:Composition}|{type:"restore";value:Composition}|{type:"begin"|"end"|"undo"|"redo"};
export function createHistory(present:Composition):History{return {past:[],present,future:[],transaction:null};}
export function reduceHistory(s:History,a:HistoryAction):History{
 if(a.type==="restore")return createHistory(a.value);
 if(a.type==="begin")return s.transaction?s:{...s,transaction:s.present};
 if(a.type==="end")return !s.transaction?s:{...s,past:s.transaction===s.present?s.past:[...s.past,s.transaction].slice(-60),transaction:null};
 if(a.type==="edit")return a.value===s.present?s:{...s,past:s.transaction?s.past:[...s.past,s.present].slice(-60),present:a.value,future:[]};
 if(s.transaction)s=reduceHistory(s,{type:"end"});
 if(a.type==="undo"&&s.past.length)return {past:s.past.slice(0,-1),present:s.past[s.past.length-1],future:[s.present,...s.future],transaction:null};
 if(a.type==="redo"&&s.future.length)return {past:[...s.past,s.present].slice(-60),present:s.future[0],future:s.future.slice(1),transaction:null};
 return s;
}

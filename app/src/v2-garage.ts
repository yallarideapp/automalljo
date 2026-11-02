import {useSyncExternalStore} from "react";

/** Saved cars and the compare list live in this browser only (localStorage), never on a server. */
type ListKey="saved"|"compare";
const STORAGE_KEYS:Record<ListKey,string>={saved:"automall-saved",compare:"automall-compare"};
const CHANGE_EVENT="automall-garage-change";
export const COMPARE_LIMIT=3;
const EMPTY:readonly string[]=Object.freeze([]);
const cache:Record<ListKey,{raw:string|null;ids:readonly string[]}>={saved:{raw:null,ids:EMPTY},compare:{raw:null,ids:EMPTY}};

function readRaw(key:ListKey){try{return window.localStorage.getItem(STORAGE_KEYS[key]);}catch{return null;}}
function readIds(key:ListKey):readonly string[]{
 const raw=readRaw(key);
 if(raw===cache[key].raw)return cache[key].ids;
 let ids:readonly string[]=EMPTY;
 try{const parsed:unknown=raw?JSON.parse(raw):[];if(Array.isArray(parsed))ids=Object.freeze([...new Set(parsed.filter((item):item is string=>typeof item==="string"&&/^\d{6,12}$/.test(item)))]);}catch{ids=EMPTY;}
 cache[key]={raw,ids};
 return ids;
}
function writeIds(key:ListKey,ids:readonly string[]){
 try{window.localStorage.setItem(STORAGE_KEYS[key],JSON.stringify(ids));}catch{/* storage blocked: keep working for this page view only */cache[key]={raw:JSON.stringify(ids),ids:Object.freeze([...ids])};}
 window.dispatchEvent(new Event(CHANGE_EVENT));
}
function subscribe(callback:()=>void){
 const onStorage=(event:StorageEvent)=>{if(!event.key||Object.values(STORAGE_KEYS).includes(event.key))callback();};
 window.addEventListener(CHANGE_EVENT,callback);window.addEventListener("storage",onStorage);
 return ()=>{window.removeEventListener(CHANGE_EVENT,callback);window.removeEventListener("storage",onStorage);};
}
const serverSnapshot=()=>EMPTY;
export const useSavedIds=()=>useSyncExternalStore(subscribe,()=>readIds("saved"),serverSnapshot);
export const useCompareIds=()=>useSyncExternalStore(subscribe,()=>readIds("compare"),serverSnapshot);

export function toggleSaved(id:string){const ids=readIds("saved");writeIds("saved",ids.includes(id)?ids.filter(item=>item!==id):[id,...ids]);}
/** Returns false when the compare list is already full. */
export function toggleCompare(id:string){
 const ids=readIds("compare");
 if(ids.includes(id)){writeIds("compare",ids.filter(item=>item!==id));return true;}
 if(ids.length>=COMPARE_LIMIT)return false;
 writeIds("compare",[...ids,id]);return true;
}
export function setCompare(ids:readonly string[]){writeIds("compare",[...new Set(ids)].slice(0,COMPARE_LIMIT));}
export const clearCompare=()=>writeIds("compare",[]);

/** Standard reducing-balance loan payment. Returns 0 for an empty loan. */
export function monthlyPayment(principal:number,annualRatePercent:number,years:number){
 const months=Math.round(years*12);
 if(!(principal>0)||!(months>0))return 0;
 const r=annualRatePercent/100/12;
 if(r<=0)return principal/months;
 return principal*r/(1-Math.pow(1+r,-months));
}

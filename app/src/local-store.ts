/**
 * Everything the admin panel saves lives in this browser only: no server, no GitHub.
 * - Edits (cars, homepage picks, showroom info) → localStorage
 * - Photos added in the panel → IndexedDB (too big for localStorage)
 * - Customer orders → localStorage
 * Every function is safe to call during prerendering: without a browser it does nothing.
 */
import type {AdminData} from "./inventory";
import type {SiteSettings} from "./site-data";

export type LocalData={version:1;admin:AdminData;settings:SiteSettings;savedAt:string};
export type OrderKind="reserve"|"test-drive"|"buy";
export type OrderStatus="new"|"contacted"|"done"|"cancelled";
export type Order={id:string;createdAt:string;kind:OrderKind;status:OrderStatus;vehicleId:string;car:string;price?:number;name:string;phone:string;preferred:string;message:string;lang:"en"|"ar";note?:string};

const DATA_KEY="automall-local-data",ORDERS_KEY="automall-orders";
/** Fired on window whenever saved edits or orders change, in this tab. Other tabs get the "storage" event. */
export const LOCAL_DATA_EVENT="automall-local-data",ORDERS_EVENT="automall-orders";
const hasWindow=()=>typeof window!=="undefined";
const safe=<T,>(fn:()=>T,fallback:T):T=>{try{return fn();}catch{return fallback;}};
const emit=(name:string)=>{if(hasWindow())window.dispatchEvent(new Event(name));};

export function readLocalData():LocalData|null{
 if(!hasWindow())return null;
 const data=safe(()=>JSON.parse(localStorage.getItem(DATA_KEY)??"null") as LocalData|null,null);
 return data&&data.version===1&&data.admin&&data.settings?data:null;
}
export function writeLocalData(admin:AdminData,settings:SiteSettings):LocalData{
 const data:LocalData={version:1,admin,settings,savedAt:new Date().toISOString()};
 localStorage.setItem(DATA_KEY,JSON.stringify(data));
 emit(LOCAL_DATA_EVENT);
 return data;
}
export function clearLocalData(){safe(()=>localStorage.removeItem(DATA_KEY),undefined);emit(LOCAL_DATA_EVENT);}

/* Photos ---------------------------------------------------------------- */
const DB_NAME="automall-local",STORE="photos";
function openDb():Promise<IDBDatabase>{
 return new Promise((resolve,reject)=>{
  if(!hasWindow()||!("indexedDB" in window)){reject(new Error("This browser can't store photos."));return;}
  const request=indexedDB.open(DB_NAME,1);
  request.onupgradeneeded=()=>{if(!request.result.objectStoreNames.contains(STORE))request.result.createObjectStore(STORE);};
  request.onsuccess=()=>resolve(request.result);
  request.onerror=()=>reject(request.error??new Error("Couldn't open photo storage."));
 });
}
async function withStore(mode:IDBTransactionMode,work:(store:IDBObjectStore)=>void){
 const db=await openDb();
 try{
  await new Promise<void>((resolve,reject)=>{
   const tx=db.transaction(STORE,mode);work(tx.objectStore(STORE));
   tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error??new Error("Saving photos was cancelled. The browser may be out of space."));
  });
 }finally{db.close();}
}
export async function savePhotos(photos:{path:string;bytes:Uint8Array}[]){
 if(!photos.length)return;
 await withStore("readwrite",store=>{for(const photo of photos)store.put(new Blob([photo.bytes as BlobPart],{type:photo.path.endsWith(".jpg")?"image/jpeg":"image/webp"}),photo.path);});
}
export async function deletePhotos(paths:string[]){
 if(!paths.length)return;
 await withStore("readwrite",store=>{for(const path of paths)store.delete(path);});
}
export async function clearPhotos(){await withStore("readwrite",store=>{store.clear();});}
/** Object URLs for the stored photos among `paths`. Paths not in storage are left out. */
export async function photoUrls(paths:string[]):Promise<Record<string,string>>{
 const wanted=[...new Set(paths)];if(!wanted.length||!hasWindow())return {};
 try{
  const db=await openDb();
  try{
   const found=await new Promise<[string,unknown][]>((resolve,reject)=>{
    const tx=db.transaction(STORE,"readonly"),store=tx.objectStore(STORE),out:[string,unknown][]=[];
    for(const path of wanted){const request=store.get(path);request.onsuccess=()=>out.push([path,request.result]);}
    tx.oncomplete=()=>resolve(out);tx.onerror=()=>reject(tx.error);
   });
   return Object.fromEntries(found.filter((entry):entry is [string,Blob]=>entry[1] instanceof Blob).map(([path,blob])=>[path,URL.createObjectURL(blob)]));
  }finally{db.close();}
 }catch{return {};}
}

/* Orders ---------------------------------------------------------------- */
export function readOrders():Order[]{
 if(!hasWindow())return [];
 const list=safe(()=>JSON.parse(localStorage.getItem(ORDERS_KEY)??"[]") as Order[],[]);
 return Array.isArray(list)?list:[];
}
function writeOrders(list:Order[]){localStorage.setItem(ORDERS_KEY,JSON.stringify(list));emit(ORDERS_EVENT);}
export function addOrder(order:Omit<Order,"id"|"createdAt"|"status">):Order{
 const full:Order={...order,id:"o"+Date.now().toString(36)+Math.random().toString(36).slice(2,6),createdAt:new Date().toISOString(),status:"new"};
 writeOrders([full,...readOrders()]);
 return full;
}
export function updateOrder(id:string,patch:Partial<Pick<Order,"status"|"note">>){writeOrders(readOrders().map(order=>order.id===id?{...order,...patch}:order));}
export function deleteOrder(id:string){writeOrders(readOrders().filter(order=>order.id!==id));}
export function clearOrders(){writeOrders([]);}
/** Calls `fn` when orders change in this tab or another one. Returns the unsubscribe function. */
export function onOrdersChange(fn:()=>void){
 if(!hasWindow())return ()=>{};
 const storage=(event:StorageEvent)=>{if(event.key===ORDERS_KEY||event.key===null)fn();};
 window.addEventListener(ORDERS_EVENT,fn);window.addEventListener("storage",storage);
 return ()=>{window.removeEventListener(ORDERS_EVENT,fn);window.removeEventListener("storage",storage);};
}
export function onLocalDataChange(fn:()=>void){
 if(!hasWindow())return ()=>{};
 const storage=(event:StorageEvent)=>{if(event.key===DATA_KEY||event.key===null)fn();};
 window.addEventListener(LOCAL_DATA_EVENT,fn);window.addEventListener("storage",storage);
 return ()=>{window.removeEventListener(LOCAL_DATA_EVENT,fn);window.removeEventListener("storage",storage);};
}

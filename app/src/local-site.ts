import {useEffect,useState} from "react";
import {applySiteData,builtAdmin,builtSettings} from "./site-data";
import {onLocalDataChange,photoUrls,readLocalData} from "./local-store";

let applied=false,urls:Record<string,string>={};

/** Applies this browser's saved admin edits to the site data. Returns true when the data changed. */
export async function loadLocalIntoSite():Promise<boolean>{
 const local=readLocalData();
 if(!local){
  if(!applied)return false;
  applySiteData(builtAdmin,builtSettings);applied=false;release(urls);urls={};
  return true;
 }
 const paths=local.admin.cars.flatMap(car=>[car.image,...(car.gallery??[])]);
 const next=await photoUrls(paths);
 applySiteData(local.admin,local.settings,next);
 release(urls);urls=next;applied=true;
 return true;
}
// Old photo links stay valid a moment longer, until the page has re-rendered with the new ones.
const release=(old:Record<string,string>)=>{const list=Object.values(old);if(list.length)window.setTimeout(()=>list.forEach(url=>URL.revokeObjectURL(url)),5000);};

/**
 * Loads this browser's admin edits after the page has hydrated, and again whenever the admin
 * panel saves. `version` changes each time the data does; `ready` turns true after the first check.
 */
export function useLocalSiteData(){
 const [state,setState]=useState({version:0,ready:false});
 useEffect(()=>{
  let live=true;
  const refresh=()=>{void loadLocalIntoSite().then(changed=>{if(live)setState(previous=>({version:changed?previous.version+1:previous.version,ready:true}));});};
  refresh();
  const stop=onLocalDataChange(refresh);
  return ()=>{live=false;stop();};
 },[]);
 return state;
}

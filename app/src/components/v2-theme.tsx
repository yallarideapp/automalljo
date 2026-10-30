import {useEffect,useState} from "react";
import type {Lang} from "@/site-data";

export type V2Theme="dark"|"light";
const STORAGE_KEY="automall-theme";
// Runs before the page paints, so a saved or system light preference never flashes dark first.
export const themeBootScript=`(function(){var d=document.documentElement,t="dark";try{var s=localStorage.getItem("${STORAGE_KEY}");t=s==="light"||s==="dark"?s:(window.matchMedia&&matchMedia("(prefers-color-scheme: light)").matches?"light":"dark")}catch(e){}d.setAttribute("data-v2-theme",t)})();`;
const readTheme=():V2Theme=>document.documentElement.getAttribute("data-v2-theme")==="light"?"light":"dark";
const copy={en:{light:"Switch to light mode",dark:"Switch to dark mode"},ar:{light:"التبديل إلى الوضع الفاتح",dark:"التبديل إلى الوضع الداكن"}};

export function ThemeToggle({lang,className="v2-theme-toggle"}:{lang:Lang;className?:string}){
 const [theme,setTheme]=useState<V2Theme>("dark");
 useEffect(()=>{setTheme(readTheme());const sync=()=>setTheme(readTheme());window.addEventListener("automall-theme",sync);return()=>window.removeEventListener("automall-theme",sync);},[]);
 const toggle=()=>{const next:V2Theme=readTheme()==="light"?"dark":"light";document.documentElement.setAttribute("data-v2-theme",next);try{localStorage.setItem(STORAGE_KEY,next);}catch{}setTheme(next);window.dispatchEvent(new Event("automall-theme"));};
 const label=theme==="light"?copy[lang].dark:copy[lang].light;
 return <button type="button" className={className} onClick={toggle} aria-label={label} title={label}>
  {theme==="light"
   ?<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z"/></svg>
   :<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4"/></svg>}
 </button>;
}

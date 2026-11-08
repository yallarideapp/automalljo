import {useEffect} from "react";
import {canonicalUrl,sitePath} from "@/site-paths";
import type {Lang} from "@/site-data";

/**
 * The site's main address now opens the current design (/v2/). GitHub Pages can't send real
 * redirects, so this page redirects at once with a meta refresh, then a script, then a link.
 */
export function redirectHead(lang:Lang){
 const target=sitePath("v2",lang);
 return {meta:[{title:lang==="ar"?"أوتومول | عمّان":"AutoMall | Amman"},{httpEquiv:"refresh",content:"0; url="+target},{name:"robots",content:"noindex, follow"}],links:[{rel:"canonical",href:canonicalUrl("v2",lang)}]};
}
export function RedirectToV2({lang}:{lang:Lang}){
 const target=sitePath("v2",lang);
 useEffect(()=>{
  // Old links such as /?lang=ar keep their language.
  const query=new URLSearchParams(window.location.search),arabic=lang==="ar"||query.get("lang")==="ar";
  query.delete("lang");const rest=query.toString();
  window.location.replace(sitePath("v2",arabic?"ar":"en")+(rest?"?"+rest:"")+window.location.hash);
 },[lang]);
 return <main style={{display:"grid",placeItems:"center",minHeight:"60vh",padding:"24px",fontFamily:"system-ui, sans-serif"}}><p><a href={target}>{lang==="ar"?"الانتقال إلى أوتومول":"Continue to AutoMall"}</a></p></main>;
}

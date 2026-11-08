import {useEffect} from "react";
import {canonicalUrl,sitePath} from "@/site-paths";
import type {Lang} from "@/site-data";

/**
 * The site's main address now opens the current design (/v2/). GitHub Pages can't send real
 * redirects, so this page redirects at once with a meta refresh, then a script, then a link.
 */
export function redirectHead(lang:Lang,page="v2"){
 const target=sitePath(page,lang);
 // Old links such as /?lang=ar go to the Arabic page; this runs before the refresh below.
 const arabic=JSON.stringify(sitePath(page,"ar"));
 return {meta:[{title:lang==="ar"?"أوتومول | عمّان":"AutoMall | Amman"},{httpEquiv:"refresh",content:"0; url="+target},{name:"robots",content:"noindex, follow"}],links:[{rel:"canonical",href:canonicalUrl(page,lang)}],
  scripts:[{children:"if(/[?&]lang=ar(&|$)/.test(location.search))location.replace("+arabic+");"}]};
}
export function RedirectToV2({lang,page="v2"}:{lang:Lang;page?:string}){
 const target=sitePath(page,lang);
 useEffect(()=>{
  // Old links such as /?lang=ar keep their language.
  const query=new URLSearchParams(window.location.search),arabic=lang==="ar"||query.get("lang")==="ar";
  query.delete("lang");const rest=query.toString();
  window.location.replace(sitePath(page,arabic?"ar":"en")+(rest?"?"+rest:"")+window.location.hash);
 },[lang,page]);
 return <main style={{display:"grid",placeItems:"center",minHeight:"60vh",padding:"24px",fontFamily:"system-ui, sans-serif"}}><p><a href={target}>{lang==="ar"?"الانتقال إلى أوتومول":"Continue to AutoMall"}</a></p></main>;
}

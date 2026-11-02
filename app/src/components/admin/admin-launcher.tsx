import {Suspense,lazy,useCallback,useEffect,useRef,useState} from "react";
import adminCss from "../../admin.css?url";

type Lang="en"|"ar";
// The panel's code only downloads when someone opens it, so visitors' pages stay light.
const AdminApp=lazy(()=>import("./admin-app").then(module=>({default:module.AdminApp})));
const OPEN_HASH="#admin";
const label={en:{open:"Staff sign-in",loading:"Opening the admin panel…"},ar:{open:"دخول الموظفين",loading:"جارٍ فتح لوحة التحكم…"}};

function useAdminStyles(active:boolean){
 useEffect(()=>{
  if(!active||document.querySelector("link[data-am-admin-css]"))return;
  const link=document.createElement("link");link.rel="stylesheet";link.href=adminCss;link.dataset.amAdminCss="";document.head.appendChild(link);
 },[active]);
}

/** Corner button that opens the staff admin panel on top of the current page. */
export function AdminLauncher({lang,vehicleId}:{lang:Lang;vehicleId?:string}){
 const [open,setOpen]=useState(false);
 const [mounted,setMounted]=useState(false);
 const button=useRef<HTMLButtonElement>(null);
 const panel=useRef<HTMLDivElement>(null);
 useAdminStyles(mounted);
 const show=useCallback(()=>{setMounted(true);setOpen(true);},[]);
 const hide=useCallback(()=>{setOpen(false);if(location.hash===OPEN_HASH)history.replaceState(null,"",location.pathname+location.search);requestAnimationFrame(()=>button.current?.focus());},[]);
 // /v2/#admin opens the panel straight away, so staff can bookmark it.
 useEffect(()=>{const check=()=>{if(location.hash===OPEN_HASH)show();};check();window.addEventListener("hashchange",check);return()=>window.removeEventListener("hashchange",check);},[show]);
 useEffect(()=>{
  if(!open)return;
  const root=document.documentElement,previous=root.style.overflow;root.style.overflow="hidden";
  const onKey=(event:KeyboardEvent)=>{if(event.key==="Escape"&&!event.defaultPrevented)hide();};
  window.addEventListener("keydown",onKey);
  requestAnimationFrame(()=>panel.current?.focus());
  return()=>{root.style.overflow=previous;window.removeEventListener("keydown",onKey);};
 },[open,hide]);
 const t=label[lang];
 return <>
  <button ref={button} type="button" className="am-launcher" onClick={show} aria-label={t.open} title={t.open} aria-haspopup="dialog" aria-expanded={open}>
   <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>
  </button>
  {/* Stays mounted after closing, so unpublished work survives closing and reopening the panel. */}
  {mounted&&<div ref={panel} className="am-overlay" role="dialog" aria-modal="true" aria-labelledby="am-admin-title" tabIndex={-1} hidden={!open}>
   <Suspense fallback={<p className="am-overlay-loading" role="status">{t.loading}</p>}><AdminApp embed={{lang,onClose:hide,vehicleId}}/></Suspense>
  </div>}
 </>;
}

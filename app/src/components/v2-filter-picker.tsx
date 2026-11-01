import {useEffect,useId,useMemo,useRef,useState,type KeyboardEvent,type ReactNode} from "react";
import type {Lang} from "@/site-data";

// Searchable filter dropdowns for the V2 catalogue: every list opens with a search box on top.
// On phones the list opens as a bottom sheet.

export type PickerOption={value:string;label:string;visual?:ReactNode;count?:number;keywords?:string;disabled?:boolean};
const pickerCopy={
 en:{search:"Search",noResults:"No matches. Try another word.",close:"Close",clear:"Clear",done:"Show results",from:"From",to:"To",any:"All",searchYear:"Type a year",anyYear:"All",fromYear:"From {y}",toYear:"Up to {y}"},
 ar:{search:"ابحث",noResults:"لا توجد نتائج. جرّب كلمة أخرى.",close:"إغلاق",clear:"مسح",done:"اعرض النتائج",from:"من",to:"إلى",any:"الكل",searchYear:"اكتب السنة",anyYear:"الكل",fromYear:"من {y}",toYear:"حتى {y}"}
};
const normalize=(value:string)=>value.normalize("NFKD").replace(/[̀-ًͯ-ٟ]/g,"").replace(/[٠-٩]/g,digit=>String("٠١٢٣٤٥٦٧٨٩".indexOf(digit))).toLowerCase().trim();
const matches=(option:PickerOption,query:string)=>!query||normalize(option.label+" "+(option.keywords??"")).includes(query);
function SearchGlyph(){return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m16.5 16.5 4 4"/></svg>;}
function Chevron(){return <svg className="v2-picker-chevron" width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="m4 6 4 4 4-4"/></svg>;}
function Check(){return <span className="v2-option-check" aria-hidden="true"><svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="m3 8 3 3 7-7"/></svg></span>;}

/** Opens/closes a panel, closes on outside press or Escape, and returns focus to the trigger. */
function usePanel(){
 const [open,setOpen]=useState(false);
 const root=useRef<HTMLDivElement>(null),trigger=useRef<HTMLButtonElement>(null);
 useEffect(()=>{
  if(!open)return;
  const press=(event:PointerEvent)=>{if(root.current&&!root.current.contains(event.target as Node))setOpen(false);};
  const key=(event:globalThis.KeyboardEvent)=>{if(event.key==="Escape"){event.preventDefault();setOpen(false);trigger.current?.focus();}};
  document.addEventListener("pointerdown",press);document.addEventListener("keydown",key);
  const phone=window.matchMedia("(max-width: 700px)").matches;if(phone)document.documentElement.classList.add("v2-sheet-open");
  return()=>{document.removeEventListener("pointerdown",press);document.removeEventListener("keydown",key);document.documentElement.classList.remove("v2-sheet-open");};
 },[open]);
 const close=(focus=true)=>{setOpen(false);if(focus)requestAnimationFrame(()=>trigger.current?.focus());};
 return {open,setOpen,close,root,trigger};
}

/** One searchable list: search box on top, options below, arrow keys + Enter. */
function SearchList({id,label,value,options,onPick,lang,placeholder,inputMode,autoFocus=true}:{id:string;label:string;value:string;options:PickerOption[];onPick:(option:PickerOption)=>void;lang:Lang;placeholder?:string;inputMode?:"text"|"numeric";autoFocus?:boolean}){
 const c=pickerCopy[lang];
 const [query,setQuery]=useState("");
 const shown=useMemo(()=>{const q=normalize(query);return options.filter(option=>matches(option,q));},[options,query]);
 const [active,setActive]=useState(()=>Math.max(0,options.findIndex(option=>option.value===value)));
 const input=useRef<HTMLInputElement>(null),list=useRef<HTMLUListElement>(null);
 useEffect(()=>{if(autoFocus)requestAnimationFrame(()=>input.current?.focus({preventScroll:true}));},[autoFocus]);
 useEffect(()=>{setActive(previous=>query?0:Math.min(previous,Math.max(0,shown.length-1)));},[query,shown.length]);
 useEffect(()=>{list.current?.querySelector<HTMLElement>("[data-active=true]")?.scrollIntoView({block:"nearest"});},[active,shown]);
 const step=(from:number,direction:number)=>{let next=from;for(let i=0;i<shown.length;i++){next=(next+direction+shown.length)%shown.length;if(!shown[next].disabled)return next;}return from;};
 const onKey=(event:KeyboardEvent<HTMLInputElement>)=>{
  if(!shown.length)return;
  if(event.key==="ArrowDown"){event.preventDefault();setActive(index=>step(index,1));}
  else if(event.key==="ArrowUp"){event.preventDefault();setActive(index=>step(index,-1));}
  else if(event.key==="Home"&&!query){event.preventDefault();setActive(step(-1,1));}
  else if(event.key==="End"&&!query){event.preventDefault();setActive(step(shown.length,-1));}
  else if(event.key==="Enter"){event.preventDefault();const option=shown[active];if(option&&!option.disabled)onPick(option);}
 };
 const optionId=(index:number)=>id+"-option-"+index;
 return <div className="v2-picker-column">
  <div className="v2-picker-search"><SearchGlyph/><input ref={input} id={id+"-search"} type="search" role="combobox" aria-expanded="true" aria-controls={id+"-list"} aria-autocomplete="list" aria-activedescendant={shown[active]?optionId(active):undefined} aria-label={c.search+": "+label} placeholder={placeholder??c.search+"…"} inputMode={inputMode} autoComplete="off" spellCheck={false} maxLength={40} value={query} onChange={event=>setQuery(event.target.value)} onKeyDown={onKey}/>{query&&<button type="button" className="v2-picker-clear-query" aria-label={c.clear} onClick={()=>{setQuery("");input.current?.focus();}}><span aria-hidden="true">×</span></button>}</div>
  <ul className="v2-visual-list v2-picker-list" id={id+"-list"} role="listbox" aria-label={label} ref={list}>
   {shown.map((option,index)=><li key={option.value} id={optionId(index)} role="option" className="v2-visual-option" aria-selected={option.value===value} aria-disabled={option.disabled||undefined} data-active={index===active||undefined} onPointerDown={event=>event.preventDefault()} onPointerMove={()=>{if(!option.disabled&&index!==active)setActive(index);}} onClick={()=>{if(!option.disabled)onPick(option);}}>
    {option.visual!==undefined&&<span className="v2-option-visual">{option.visual}</span>}<span className="v2-option-name">{option.label}</span>{option.count!==undefined&&<span className="v2-option-count">{option.count}</span>}{option.value===value&&<Check/>}
   </li>)}
  </ul>
  {shown.length===0&&<p className="v2-picker-empty" role="status">{c.noResults}</p>}
 </div>;
}

export function FilterPicker({id,label,value,options,onChange,lang,name}:{id:string;label:string;value:string;options:PickerOption[];onChange:(value:string)=>void;lang:Lang;name?:string}){
 const c=pickerCopy[lang],panelId=useId();
 const {open,setOpen,close,root,trigger}=usePanel();
 const selected=options.find(option=>option.value===value)??options[0];
 return <div className="v2-visual-select v2-picker" data-open={open||undefined} ref={root}>
  <button ref={trigger} type="button" id={id} className="v2-visual-trigger" aria-haspopup="dialog" aria-expanded={open} aria-controls={open?panelId:undefined} onClick={()=>setOpen(!open)}>
   <span className="v2-option-value">{selected.visual!==undefined&&<span className="v2-option-visual">{selected.visual}</span>}<span className="v2-option-name">{selected.label}</span>{selected.count!==undefined&&<span className="v2-option-count">{selected.count}</span>}</span><Chevron/>
  </button>
  {name&&<input type="hidden" name={name} value={value}/>}
  {open&&<>
   <div className="v2-picker-scrim" aria-hidden="true" onClick={()=>close()}/>
   <div className="v2-picker-panel" id={panelId} role="dialog" aria-label={label}>
    <div className="v2-picker-sheet-head"><span className="v2-picker-handle" aria-hidden="true"/><strong>{label}</strong><button type="button" className="v2-picker-close" onClick={()=>close()} aria-label={c.close}><span aria-hidden="true">×</span></button></div>
    <SearchList id={id+"-picker"} label={label} value={value} options={options} lang={lang} onPick={option=>{onChange(option.value);close();}}/>
   </div>
  </>}
 </div>;
}

/** OpenSooq-style year filter: one button, a panel with From and To year lists, each searchable. */
export function YearRangePicker({id,label,years,from,to,onChange,lang,named=false}:{id:string;label:string;years:string[];from:string;to:string;onChange:(from:string,to:string)=>void;lang:Lang;named?:boolean}){
 const c=pickerCopy[lang],panelId=useId();
 const {open,setOpen,close,root,trigger}=usePanel();
 const newestFirst=useMemo(()=>[...years].sort((a,b)=>Number(b)-Number(a)),[years]);
 const summary=from!=="all"&&to!=="all"?(from===to?from:from+" – "+to):from!=="all"?c.fromYear.replace("{y}",from):to!=="all"?c.toYear.replace("{y}",to):c.anyYear;
 const fromOptions:PickerOption[]=[{value:"all",label:c.any},...newestFirst.map(year=>({value:year,label:year,disabled:to!=="all"&&Number(year)>Number(to)}))];
 const toOptions:PickerOption[]=[{value:"all",label:c.any},...newestFirst.map(year=>({value:year,label:year,disabled:from!=="all"&&Number(year)<Number(from)}))];
 const active=from!=="all"||to!=="all";
 return <div className="v2-visual-select v2-picker v2-year-picker" data-open={open||undefined} ref={root}>
  <button ref={trigger} type="button" id={id} className="v2-visual-trigger" aria-haspopup="dialog" aria-expanded={open} aria-controls={open?panelId:undefined} data-filled={active||undefined} onClick={()=>setOpen(!open)}>
   <span className="v2-option-value"><span className="v2-option-visual"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true"><rect x="4" y="5" width="16" height="16" rx="2"/><path d="M4 10h16M8 3v4m8-4v4"/></svg></span><span className="v2-option-name" dir="auto">{summary}</span></span><Chevron/>
  </button>
  {named&&<><input type="hidden" name="from" value={from}/><input type="hidden" name="to" value={to}/></>}
  {open&&<>
   <div className="v2-picker-scrim" aria-hidden="true" onClick={()=>close()}/>
   <div className="v2-picker-panel v2-year-panel" id={panelId} role="dialog" aria-label={label}>
    <div className="v2-picker-sheet-head"><span className="v2-picker-handle" aria-hidden="true"/><strong>{label}</strong><button type="button" className="v2-picker-close" onClick={()=>close()} aria-label={c.close}><span aria-hidden="true">×</span></button></div>
    <div className="v2-year-columns">
     <section aria-label={label+" "+c.from}><h3 className="v2-year-heading">{c.from}<span>{from==="all"?c.any:from}</span></h3><SearchList id={id+"-from"} label={label+" "+c.from} value={from} options={fromOptions} lang={lang} placeholder={c.searchYear} inputMode="numeric" onPick={option=>{onChange(option.value,to);requestAnimationFrame(()=>document.getElementById(id+"-to-search")?.focus({preventScroll:true}));}}/></section>
     <section aria-label={label+" "+c.to}><h3 className="v2-year-heading">{c.to}<span>{to==="all"?c.any:to}</span></h3><SearchList id={id+"-to"} label={label+" "+c.to} value={to} options={toOptions} lang={lang} placeholder={c.searchYear} inputMode="numeric" autoFocus={false} onPick={option=>onChange(from,option.value)}/></section>
    </div>
    <div className="v2-year-actions"><button type="button" className="v2-year-reset" disabled={!active} onClick={()=>onChange("all","all")}>{c.clear}</button><button type="button" className="v2-button v2-button-orange" onClick={()=>close()}>{c.done}</button></div>
   </div>
  </>}
 </div>;
}

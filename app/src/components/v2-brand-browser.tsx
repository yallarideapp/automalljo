import {useState} from "react";
import {vehicles,type Lang} from "@/site-data";
import {defaultFilters,filtersToSearch} from "@/v2-catalog";
import {BrandLogo} from "./brand-logo";

const brandCounts=[...vehicles.reduce((counts,vehicle)=>counts.set(vehicle.brand,(counts.get(vehicle.brand)??0)+1),new Map<string,number>())]
 .sort(([name,count],[otherName,otherCount])=>otherCount-count||name.localeCompare(otherName,"en"));

export function V2BrandBrowser({lang,catalogHref}:{lang:Lang;catalogHref:string}){
 const [expanded,setExpanded]=useState(false);
 const brands=expanded?brandCounts:brandCounts.slice(0,12);
 const title=lang==="ar"?"تسوق حسب العلامة":"Shop by brand";
 const countText=(count:number)=>lang==="ar"?count+" سيارة":count+" "+(count===1?"car":"cars");
 return <section className="v2-brand-browser v2-wrap" id="v2-brands" aria-labelledby="v2-brands-title">
  <div className="v2-brand-browser-heading"><h2 id="v2-brands-title">{title}</h2><p>{lang==="ar"?"اختر علامة تجارية لعرض سياراتها في التشكيلة.":"Choose a brand to see its cars in the collection."}</p></div>
  <ul className="v2-brand-grid" id="v2-brand-grid">{brands.map(([brand,count])=><li key={brand}><a className="v2-brand-tile" href={catalogHref+"?"+filtersToSearch({...defaultFilters,brand})} aria-label={brand+", "+countText(count)}><BrandLogo brand={brand}/><span className="v2-brand-tile-name"><span>{brand}</span><small>{countText(count)}</small></span></a></li>)}</ul>
  {brandCounts.length>12&&<button className="v2-brand-expand" type="button" aria-expanded={expanded} aria-controls="v2-brand-grid" onClick={()=>setExpanded(value=>!value)}>{expanded?(lang==="ar"?"عرض علامات أقل":"Show fewer brands"):(lang==="ar"?"عرض كل العلامات":"Show all brands")+" ("+brandCounts.length+")"}<span aria-hidden="true">{expanded?"−":"+"}</span></button>}
 </section>;
}

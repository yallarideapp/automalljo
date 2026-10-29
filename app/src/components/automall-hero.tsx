import {useEffect,useRef,useState,type CSSProperties} from "react";
import {copy,modelMessage,whatsapp,type Lang} from "@/site-data";
import {scrollPhotoScenes} from "@/scroll-photo-scenes";

const clamp=(value:number)=>Math.max(0,Math.min(1,value));
const count=scrollPhotoScenes.length;

export function AutoMallHero({lang}:{lang:Lang}){
 const t=copy[lang];
 const root=useRef<HTMLElement>(null);
 const stage=useRef<HTMLDivElement>(null);
 const progress=useRef<HTMLSpanElement>(null);
 const [active,setActive]=useState(0);
 const [animated,setAnimated]=useState(false);

 useEffect(()=>{
  const section=root.current,pin=stage.current,bar=progress.current;
  if(!section||!pin||!bar)return;
  const panels=Array.from(section.querySelectorAll<HTMLElement>(".am-photo-story__scene"));
  const pictures=Array.from(section.querySelectorAll<HTMLImageElement>(".am-photo-story__image"));
  const copies=Array.from(section.querySelectorAll<HTMLElement>(".am-photo-story__copy"));
  const reduced=window.matchMedia("(prefers-reduced-motion: reduce)");
  const native=CSS.supports("animation-timeline: view()")&&CSS.supports("animation-range: contain 0% contain 100%");
  let frame=0,visible=true,start=0,distance=1,current=0;
  const measure=()=>{
   start=section.getBoundingClientRect().top+window.scrollY;
   distance=Math.max(1,section.offsetHeight-pin.offsetHeight);
  };
  const clear=()=>{
   for(let i=0;i<count;i++){
    panels[i].style.removeProperty("opacity");
    pictures[i].style.removeProperty("transform");
    copies[i].style.removeProperty("transform");
   }
   bar.style.removeProperty("transform");
  };
  const paint=()=>{
   frame=0;
   if(reduced.matches||!visible)return;
   const value=clamp((window.scrollY-start)/distance),phase=value*count;
   const next=Math.min(count-1,Math.max(0,Math.floor(phase+.1)));
   if(next!==current){current=next;setActive(next);}
   if(native)return;
   for(let i=0;i<count;i++){
    const enter=i===0?1:clamp((phase-(i-.2))/.2);
    const exit=i===count-1?0:clamp((phase-(i+.8))/.2);
    panels[i].style.opacity=String(enter*(1-exit));
    pictures[i].style.transform=`translate3d(0,${(-value*24).toFixed(2)}px,0) scale(${(1.04+value*.08).toFixed(4)})`;
    copies[i].style.transform=`translate3d(0,${((1-enter)*24-exit*20).toFixed(2)}px,0)`;
   }
   bar.style.transform=`scaleX(${value.toFixed(4)})`;
  };
  const request=()=>{if(!frame&&visible&&!reduced.matches)frame=window.requestAnimationFrame(paint);};
  const resize=()=>{measure();request();};
  const preference=()=>{
   clear();
   section.dataset.enhanced=String(!reduced.matches);
   section.dataset.timeline=native?"native":"js";
   setAnimated(!reduced.matches);
   if(reduced.matches){current=0;setActive(0);}
   measure();request();
  };
  preference();
  const intersection=new IntersectionObserver(entries=>{
   visible=entries[0]?.isIntersecting??true;
   if(visible){measure();request();}
   else if(frame){window.cancelAnimationFrame(frame);frame=0;}
  },{rootMargin:"100px"});
  intersection.observe(section);
  const observer=new ResizeObserver(resize);
  observer.observe(section);observer.observe(pin);
  window.addEventListener("scroll",request,{passive:true});
  window.addEventListener("resize",resize,{passive:true});
  reduced.addEventListener("change",preference);
  return()=>{
   window.cancelAnimationFrame(frame);intersection.disconnect();observer.disconnect();
   window.removeEventListener("scroll",request);window.removeEventListener("resize",resize);
   reduced.removeEventListener("change",preference);clear();
   delete section.dataset.enhanced;delete section.dataset.timeline;
  };
 },[]);

 const goTo=(index:number)=>{
  const section=root.current,pin=stage.current;
  if(!section||!pin)return;
  if(!animated){section.querySelectorAll<HTMLElement>(".am-photo-story__scene")[index]?.scrollIntoView({block:"start"});return;}
  const top=section.getBoundingClientRect().top+window.scrollY;
  const travel=Math.max(1,section.offsetHeight-pin.offsetHeight);
  window.scrollTo({top:top+travel*((index+.35)/count),behavior:"smooth"});
 };

 return <section ref={root} id="drive-story" className="am-photo-story" data-active={active} dir={lang==="ar"?"rtl":"ltr"} aria-label={lang==="ar"?"رحلة أوتومول بالصور":"AutoMall photo journey"}>
  <div ref={stage} className="am-photo-story__stage">
   <div className="am-photo-story__scenes">
    {scrollPhotoScenes.map((scene,index)=>{
     const hidden=animated&&active!==index;
     const Heading=index===0?"h1":"h2";
     const headingId=index===0?"automall-hero-title":"drive-title-"+scene.id;
     return <article className="am-photo-story__scene" id={"drive-"+scene.id} key={scene.id} aria-labelledby={headingId} aria-hidden={hidden||undefined} inert={hidden} style={{"--story-position":scene.position} as CSSProperties}>
      <img className="am-photo-story__image" src={scene.photo} width="1600" height="1068" alt={lang==="ar"?"صورة أصلية من أوتومول: "+scene.vehicle.brand+" "+scene.vehicle.name:"Original AutoMall photograph: "+scene.vehicle.brand+" "+scene.vehicle.name} loading={index===0?"eager":"lazy"} fetchPriority={index===0?"high":"low"} decoding="async"/>
      <div className="am-photo-story__shade" aria-hidden="true"/>
      <div className="am-photo-story__copy">
       <p className="am-photo-story__eyebrow"><span dir="ltr">0{index+1} / AUTOMALL</span><span>{scene.label[lang]}</span></p>
       <Heading id={headingId} className="am-photo-story__title">{scene.title[lang]}</Heading>
       <p className="am-photo-story__description">{scene.body[lang]}</p>
       <div className="am-photo-story__featured"><span>{scene.vehicle.brand} {scene.vehicle.name} <small>{scene.vehicle.year}</small></span>{scene.vehicle.range&&<p><strong>{scene.vehicle.range[lang]}</strong><small>{lang==="ar"?"مدى كهربائي معلن":"Advertised electric range"}</small></p>}</div>
       <div className="am-photo-story__actions"><a className="hero-browse" href="#collection">{t.browse}<span aria-hidden="true">↗</span></a><a className="hero-enquire" href={whatsapp(modelMessage(scene.vehicle,lang))} target="_blank" rel="noopener noreferrer">{t.chat}<span aria-hidden="true">↗</span></a></div>
      </div>
     </article>;
    })}
   </div>
   <div className="am-photo-story__footer">
    <div className="am-photo-story__signature"><span>{lang==="ar"?"صور أصلية. سيارات حقيقية.":"Original photos. Real cars."}</span><span className="am-photo-story__scroll">{lang==="ar"?"مرر لاستكشاف السيارات":"Scroll to explore"}<span aria-hidden="true">↓</span></span></div>
    <nav className="am-photo-story__chapters" aria-label={lang==="ar"?"مشاهد الرحلة":"Photo journey chapters"}>{scrollPhotoScenes.map((scene,index)=><button key={scene.id} type="button" onClick={()=>goTo(index)} aria-current={active===index?"step":undefined} aria-controls={"drive-"+scene.id}><span dir="ltr">0{index+1}</span><span>{scene.label[lang]}</span></button>)}</nav>
   </div>
   <div className="am-photo-story__progress" aria-hidden="true"><span ref={progress}/></div>
  </div>
 </section>;
}

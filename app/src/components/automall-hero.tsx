import {useEffect,useRef,useState,type CSSProperties} from "react";
import {assetPath} from "@/site-paths";
import {copy,genericMessage,whatsapp,type Lang} from "@/site-data";

const clamp=(value:number,min=-1,max=1)=>Math.min(max,Math.max(min,value));

/** Native-resolution artwork and compositor motion keep the showroom sharp. */
export function AutoMallHero({lang}:{lang:Lang}){
  const t=copy[lang];
  const [night,setNight]=useState(false);
  const hero=useRef<HTMLElement>(null);
  const stage=useRef<HTMLDivElement>(null);
  const car=useRef<HTMLDivElement>(null);
  const text=useRef<HTMLDivElement>(null);
  const carSource=assetPath("assets/hero-car-v2.png");
  const maskStyle:CSSProperties={maskImage:`url("${carSource}")`,WebkitMaskImage:`url("${carSource}")`};

  useEffect(()=>{
    const root=hero.current,scene=stage.current,vehicle=car.current,copyLayer=text.current;
    if(!root||!scene||!vehicle||!copyLayer)return;
    const reduced=window.matchMedia("(prefers-reduced-motion: reduce)");
    const fine=window.matchMedia("(hover: hover) and (pointer: fine)");
    let frame=0,visible=true,pointerX=0,pointerY=0;
    let metrics={left:0,top:0,width:1,height:1,heroTop:0,heroHeight:1};
    const measure=()=>{
      const sceneRect=scene.getBoundingClientRect(),rootRect=root.getBoundingClientRect();
      metrics={left:sceneRect.left,top:sceneRect.top+window.scrollY,width:Math.max(sceneRect.width,1),height:Math.max(sceneRect.height,1),heroTop:rootRect.top+window.scrollY,heroHeight:Math.max(rootRect.height,1)};
    };
    const clear=()=>{
      vehicle.style.removeProperty("transform");
      copyLayer.style.removeProperty("transform");
    };
    const paint=()=>{
      frame=0;
      if(reduced.matches||!fine.matches){clear();return;}
      if(!visible)return;
      const progress=clamp((window.scrollY-metrics.heroTop)/metrics.heroHeight,0,1);
      vehicle.style.transform=`translate3d(${(pointerX*10).toFixed(2)}px,${(pointerY*6-progress*22).toFixed(2)}px,0)`;
      copyLayer.style.transform=`translate3d(0,${(-progress*8).toFixed(2)}px,0)`;
    };
    const requestPaint=()=>{
      if(!frame&&visible)frame=window.requestAnimationFrame(paint);
    };
    const onPointer=(event:PointerEvent)=>{
      if(reduced.matches||!fine.matches||event.pointerType!=="mouse")return;
      pointerX=clamp((event.clientX-metrics.left)/metrics.width*2-1);
      pointerY=clamp((event.clientY+window.scrollY-metrics.top)/metrics.height*2-1);
      requestPaint();
    };
    const onLeave=()=>{pointerX=0;pointerY=0;requestPaint();};
    const onResize=()=>{measure();requestPaint();};
    const onPreference=()=>{pointerX=0;pointerY=0;clear();requestPaint();};
    measure();
    const observer=typeof IntersectionObserver!=="undefined"?new IntersectionObserver(entries=>{
      visible=entries[0]?.isIntersecting??true;
      if(visible){measure();requestPaint();}
      else if(frame){window.cancelAnimationFrame(frame);frame=0;}
    },{rootMargin:"80px"}):null;
    observer?.observe(root);
    const resize=typeof ResizeObserver!=="undefined"?new ResizeObserver(onResize):null;
    resize?.observe(root);
    scene.addEventListener("pointerenter",onResize);
    scene.addEventListener("pointermove",onPointer,{passive:true});
    scene.addEventListener("pointerleave",onLeave);
    window.addEventListener("scroll",requestPaint,{passive:true});
    window.addEventListener("resize",onResize,{passive:true});
    reduced.addEventListener("change",onPreference);
    fine.addEventListener("change",onPreference);
    return()=>{
      window.cancelAnimationFrame(frame);
      observer?.disconnect();resize?.disconnect();
      scene.removeEventListener("pointerenter",onResize);
      scene.removeEventListener("pointermove",onPointer);
      scene.removeEventListener("pointerleave",onLeave);
      window.removeEventListener("scroll",requestPaint);
      window.removeEventListener("resize",onResize);
      reduced.removeEventListener("change",onPreference);
      fine.removeEventListener("change",onPreference);
      clear();
    };
  },[]);

  return <section ref={hero} className="am-hero" data-lighting={night?"night":"studio"} dir={lang==="ar"?"rtl":"ltr"} aria-labelledby="automall-hero-title">
    <div className="am-hero__ambient am-hero__ambient--studio" aria-hidden="true"/>
    <div className="am-hero__ambient am-hero__ambient--night" aria-hidden="true"/>
    <div className="am-hero__layout">
      <div ref={text} className="am-hero__copy">
        <h1 className="am-hero__title" id="automall-hero-title">{t.heroTitle}</h1>
        <p className="am-hero__description">{t.heroBody}</p>
        <div className="hero-action-row am-hero__actions">
          <a href="#collection" className="hero-browse">{t.browse}<span aria-hidden="true">↗</span></a>
          <a href={whatsapp(genericMessage(lang))} className="hero-enquire" target="_blank" rel="noopener noreferrer">{t.chat}<span aria-hidden="true">↗</span></a>
        </div>
      </div>
      <div className="am-hero__visual">
        <div ref={stage} className="am-hero__stage">
          <div className="am-hero__architecture" aria-hidden="true"><span/><span/><span/></div>
          <div className="am-hero__floor" aria-hidden="true"><span/><span/></div>
          <div ref={car} className="am-hero__motion">
            <div className="am-hero__car-entry">
              <img className="am-hero__car-image" src={carSource} width="1672" height="940" fetchPriority="high" decoding="async" alt={lang==="ar"?"سيارة سيدان فضية في مشهد تعريفي لأوتومول":"Silver performance sedan, an illustrative AutoMall brand visual"}/>
              <div className="am-hero__paint-sweep" style={maskStyle} aria-hidden="true"><span/></div>
            </div>
          </div>
          <span className="am-hero__floor-edge" aria-hidden="true"/>
        </div>
      </div>
    </div>
    <div className="am-hero__footer">
      <div className="am-hero__signature"><span>{t.tagline}</span><small>{t.heroCaption}</small></div>
      <div className="am-hero__lighting" role="group" aria-label={lang==="ar"?"إضاءة المشهد":"Showroom lighting"}>
        <span className="am-hero__lighting-label">{lang==="ar"?"الإضاءة":"Lighting"}</span>
        <button type="button" aria-pressed={!night} onClick={()=>setNight(false)}>{lang==="ar"?"استوديو":"Studio"}</button>
        <button type="button" aria-pressed={night} onClick={()=>setNight(true)}>{lang==="ar"?"ليلية":"Night"}</button>
      </div>
    </div>
  </section>;
}

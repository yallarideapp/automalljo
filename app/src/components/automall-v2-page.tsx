import {useCallback,useDeferredValue,useEffect,useMemo,useRef,useState} from "react";
import {AdminLauncher} from "@/components/admin/admin-launcher";
import {useLocalSiteData} from "@/local-site";
import {vehicles,findVehicle,settings,builtSettings,builtVehicleIds,phoneDisplay,whatsapp,modelMessage,genericMessage,PHONE,INSTAGRAM,MAPS,type Lang,type Vehicle,type OpeningDay} from "@/site-data";
import {assetPath,sitePath,localizedLinks} from "@/site-paths";
import {legal,trademarkNotice} from "@/legal-data";
import {VehicleFeatureIcon,type VehicleFeatureName} from "./vehicle-feature-icon";
import {BodyStyleIcon} from "./body-style-icon";
import {BrandLogo} from "./brand-logo";
import {V2BrandBrowser} from "./v2-brand-browser";
import {V2VehicleDetails} from "./v2-vehicle-details";
import {FilterPicker,YearRangePicker,type PickerOption} from "./v2-filter-picker";
import {copyV2,FACEBOOK,brandNames,equipmentFor,equipmentTiles,featureLabels,cardFacts,specValue,dealerPosts,cardSrc} from "@/v2-content";
import {powertrains,bodyStyles,bodyStyleFor,defaultFilters,filtersFromSearch,filtersToSearch,filterVehicles,navigationCopy,homeCopy,modelYears,type CatalogFilters} from "@/v2-catalog";
import {ThemeToggle,themeBootScript} from "./v2-theme";
import {CompareBar,CompareButton,HeaderMenu,SaveButton,garageCopy} from "./v2-garage-ui";
import {setCompare,useCompareIds,useSavedIds,toggleCompare} from "@/v2-garage";
import v2Css from "../automall-v2.css?url";
import showcaseCss from "../v2-showcase.css?url";

export type V2View="home"|"cars"|"features"|"updates"|"contact"|"car"|"saved"|"compare";
const PAGE_SIZE=9;
const modelName=(vehicle:Vehicle)=>vehicle.brand+" "+vehicle.name;
const priceText=(vehicle:Vehicle,lang:Lang)=>vehicle.price?new Intl.NumberFormat(lang==="ar"?"ar-JO":"en-JO",{style:"currency",currency:"JOD",maximumFractionDigits:0}).format(vehicle.price.amount):null;
/** Cars added in this browser's admin panel have no prerendered page, so they open the shared /v2/car/local/ page. */
const pagePath=(view:V2View,lang:Lang,id?:string)=>view==="car"&&id&&!builtVehicleIds.has(id)?sitePath("v2/car/local",lang)+"?id="+encodeURIComponent(id):sitePath("v2"+(view==="home"?"":view==="car"?"/car/"+id:"/"+view),lang);
const withFilters=(path:string,filters:CatalogFilters)=>{const search=filtersToSearch(filters);return path+(search?(path.includes("?")?"&":"?")+search:"");};
/** Real showroom photos for the powertrain category cards (AutoMall logo removed from the copies). */
const categoryPhotos:Record<string,{id:string;model:string}>={electric:{id:"287914576",model:"Mercedes-Benz EQE SUV"},hybrid:{id:"287914072",model:"Land Rover Defender P400e"},gasoline:{id:"287890852",model:"Toyota Land Cruiser"}};
const categoryPhoto=(id:string)=>assetPath("assets/categories/photo-"+id+".webp");
const Arrow=()=> <span aria-hidden="true">↗</span>;
const Icon=({name,size=24}:{name:VehicleFeatureName;size?:number})=><VehicleFeatureIcon className="vehicle-feature-icon" name={name} size={size}/>;
export function v2Head(lang:Lang,view:V2View="home",vehicleId?:string){
 const n=navigationCopy[lang],vehicle=findVehicle(vehicleId);
 const title=view==="car"&&vehicle?modelName(vehicle)+" "+vehicle.year:view==="home"?(lang==="ar"?"سيارتك القادمة":"Find your next drive"):view==="saved"?garageCopy[lang].savedCars:view==="compare"?garageCopy[lang].compareNow:n[view as "cars"|"features"|"updates"|"contact"]??n.cars;
 return {meta:[{title:(lang==="ar"?"أوتومول | ":"AutoMall | ")+title},{name:"description",content:lang==="ar"?"تصفح سيارات أوتومول حسب نظام الحركة ونوع الهيكل، مع صور كاملة ومدى السيارات الكهربائية والتجهيزات المعلنة.":"Find AutoMall cars by powertrain and body style, with complete galleries, electric ranges and dealer-listed equipment."},{name:"theme-color",content:"#0b0d0f"}],links:[...localizedLinks("v2"+(view==="home"?"":view==="car"?"/car/"+vehicleId:"/"+view),lang),{rel:"stylesheet",href:v2Css},...(view==="car"?[{rel:"stylesheet",href:showcaseCss}]:[])]};
}
function NavIcon({name}:{name:string}){
 return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{name==="home"?<><path d="m3 10 9-7 9 7v10H3Z"/><path d="M9 20v-7h6v7"/></>:name==="cars"?<><path d="m4 10 2-5h12l2 5M3 10h18v8H3Z"/><path d="M6 18v2m12-2v2M6 13h2m8 0h2"/></>:name==="features"?<><path d="m12 3 3 6 6 3-6 3-3 6-3-6-6-3 6-3Z"/></>:name==="updates"?<><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 7h8M8 11h8M8 15h3m3 0h2M8 18h8"/></>:name==="contact"?<><path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z"/><circle cx="12" cy="10" r="2"/></>:<><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></>}</svg>;
}
function PageHeading({lang,view}:{lang:Lang;view:Exclude<V2View,"home"|"car">}){
 const n=navigationCopy[lang],t=copyV2[lang],g=garageCopy[lang];
 const data={cars:[t.inventoryKicker,n.catalogTitle,n.catalogBody],features:[t.equipmentKicker,n.featureTitle,t.equipmentBody],updates:[t.postKicker,n.showroomTitle,t.postBody],contact:[t.visitKicker,n.contactTitle,t.visitBody],saved:[g.savedKicker,g.savedTitle,g.savedBody],compare:[g.compareKicker,g.compareTitle,g.compareBody]}[view];
 return <div className="v2-page-heading v2-wrap"><p className="v2-eyebrow">{data[0]}</p><h1 tabIndex={-1}>{data[1]}</h1><p>{data[2]}</p></div>;
}
function CarCard({vehicle,lang,filters=defaultFilters,compact=false}:{vehicle:Vehicle;lang:Lang;filters?:CatalogFilters;compact?:boolean}){
 const t=copyV2[lang],facts=cardFacts(vehicle,lang),features=equipmentFor(vehicle),url=withFilters(pagePath("car",lang,vehicle.id),filters);
 return <article className={compact?"v2-car v2-car-compact":"v2-car"}><a id={"v2-car-"+vehicle.id} className="v2-car-photo" href={url} aria-label={t.details+": "+modelName(vehicle)}><img src={cardSrc(vehicle.image)} alt={modelName(vehicle)+" "+vehicle.year} width="1200" height="800" loading="lazy" decoding="async"/><span className="v2-car-condition" data-status={vehicle.status&&vehicle.status!=="available"?vehicle.status:undefined}>{vehicle.status==="reserved"?(lang==="ar"?"محجوزة":"Reserved"):vehicle.status==="sold"?(lang==="ar"?"مباعة":"Sold"):specValue(vehicle,"Condition")?.[lang]??vehicle.year}</span><span className="v2-car-photo-count">{new Set([vehicle.image,...(vehicle.gallery??[])]).size} {lang==="ar"?"صورة":"photos"}</span></a><div className="v2-car-actions"><SaveButton vehicle={vehicle} lang={lang}/><CompareButton vehicle={vehicle} lang={lang}/></div><div className="v2-car-info"><div className="v2-car-meta"><span>{vehicle.year}</span><span>{vehicle.type[lang].split(" · ")[0]}</span></div><h3><a className="v2-car-title" href={url}><BrandLogo brand={vehicle.brand}/><span>{modelName(vehicle)}</span></a></h3>{!compact&&<p className="v2-car-colour">{vehicle.color[lang]}</p>}<div className="v2-car-facts">{facts.map(fact=><div key={fact.icon}><Icon name={fact.icon} size={20}/><span><small>{fact.label}</small><strong>{fact.value}</strong></span></div>)}</div>{!compact&&features.length>0&&<div className="v2-card-equipment">{features.slice(0,2).map(feature=><span key={feature.id}><Icon name={feature.id} size={16}/>{feature.label[lang]}</span>)}{features.length>2&&<span className="v2-feature-extra">+{features.length-2}</span>}</div>}<div className="v2-car-bottom"><p><small>{priceText(vehicle,lang)?t.priceLabel:""}</small><strong>{priceText(vehicle,lang)??t.askPrice}</strong></p><a className="v2-car-detail-link" href={url} aria-label={t.details+": "+modelName(vehicle)}>{lang==="ar"?"التفاصيل":"Details"}<Arrow/></a></div></div></article>;
}
/** Homepage banner and featured cars are picked in the admin panel (site-settings.json). Banner photos are logo-free copies made at build time. */
const bannerPhoto=(vehicle:Vehicle)=>builtSettings.bannerCars.includes(vehicle.id)&&builtVehicleIds.has(vehicle.id)?assetPath("assets/banner/banner-"+vehicle.id+".webp"):vehicle.image;
/** Read at render time: this browser's admin edits can change the banner after the page loads. Logo-free copies exist for the published banner cars. */
const bannerCarList=()=>{const picked=settings.bannerCars.map(id=>findVehicle(id)).filter((vehicle):vehicle is Vehicle=>!!vehicle&&vehicle.status!=="sold").slice(0,6);return (picked.length?picked:vehicles.slice(0,3)).map(vehicle=>({id:vehicle.id,label:vehicle.brand+" "+vehicle.name,vehicle,photo:bannerPhoto(vehicle)}));};
const featuredCars=()=>{const picked=settings.featuredCars.map(id=>findVehicle(id)).filter((vehicle):vehicle is Vehicle=>!!vehicle&&vehicle.status!=="sold");return picked.length?picked:vehicles.slice(0,6);};
/** Banner cars with a looping video (public/assets/banner/video): desktop and phone MP4s plus a poster frame. Other banner cars keep their photo. */
/** How long each banner car stays before the banner moves on by itself. */
const BANNER_SLIDE_MS=8000;
const bannerVideoIds=new Set(["288938770","288630286","287516454","288440948"]);
const bannerVideoPath=(id:string)=>({desktop:assetPath("assets/banner/video/banner-"+id+".mp4"),phone:assetPath("assets/banner/video/banner-"+id+"-phone.mp4"),poster:assetPath("assets/banner/video/banner-"+id+"-poster.webp")});
/**
 * Plays in the same box as the banner photo, so the layout doesn't change. Only the slide on screen
 * plays; it stays on its still frame for reduced motion, data saver, or when scrolled out of view.
 */
function BannerVideo({video,label,active,paused}:{video:ReturnType<typeof bannerVideoPath>;label:string;active:boolean;paused:boolean}){
 const element=useRef<HTMLVideoElement>(null),[visible,setVisible]=useState(true),[allowed,setAllowed]=useState(false);
 useEffect(()=>{
  const motion=window.matchMedia("(prefers-reduced-motion: reduce)");
  const saveData=(navigator as Navigator&{connection?:{saveData?:boolean}}).connection?.saveData===true;
  const update=()=>setAllowed(!motion.matches&&!saveData);update();
  motion.addEventListener("change",update);
  const target=element.current;let observer:IntersectionObserver|undefined;
  if(target&&"IntersectionObserver" in window){observer=new IntersectionObserver(([entry])=>setVisible(entry.isIntersecting),{threshold:.15});observer.observe(target);}
  return()=>{motion.removeEventListener("change",update);observer?.disconnect();};
 },[]);
 useEffect(()=>{
  const target=element.current;if(!target)return;
  if(active&&visible&&allowed&&!paused){target.muted=true;target.preload="auto";void target.play().catch(()=>undefined);}
  else target.pause();
 },[active,visible,allowed,paused]);
 // Each time its car comes up, the clip starts again from the beginning.
 const wasActive=useRef(active);
 useEffect(()=>{const target=element.current;if(active&&!wasActive.current&&target&&target.readyState>0)target.currentTime=0;wasActive.current=active;},[active]);
 return <video ref={element} className="v2-dealer-hero-image" poster={video.poster} muted loop playsInline disablePictureInPicture preload="none" width="1280" height="720" role="img" aria-label={label}>
  <source media="(max-width: 700px)" src={video.phone} type="video/mp4"/><source src={video.desktop} type="video/mp4"/>
 </video>;
}
/**
 * The banner film: both Google Flow videos joined into one loop (Porsche → G580 → BMW → Jetour → back to the Porsche).
 * Inside each video the camera moves from car to car; between the videos the picture dissolves softly, and it loops without a cut.
 * `from` is when each car takes over the frame; `jump` is a well-framed moment to seek to from the dots and arrows.
 */
const bannerFilm={
 desktop:assetPath("assets/banner/video/banner-film.mp4"),phone:assetPath("assets/banner/video/banner-film-phone.mp4"),poster:assetPath("assets/banner/video/banner-film-poster.webp"),
 cars:[{id:"288938770",from:0,jump:0},{id:"287516454",from:7,jump:8.07},{id:"288630286",from:11.24,jump:12.35},{id:"288440948",from:19.2,jump:20.8}],
 /** From here to the end the picture has dissolved back to the first car. */
 wrap:24.04,
 /** The slow motion is built into the file (in-between frames generated), so it plays at normal speed. The BMW holds longest. */
 rate:1,
};
/** The film is used while the banner shows exactly its four cars; otherwise the banner keeps one slide per car. */
const filmCars=()=>{const list=bannerCarList();const ids=new Set(list.map(item=>item.vehicle.id));return list.length===bannerFilm.cars.length&&bannerFilm.cars.every(car=>ids.has(car.id))?bannerFilm.cars.map(car=>list.find(item=>item.vehicle.id===car.id)!):null;};
const filmCarAt=(time:number)=>{if(time>=bannerFilm.wrap)return 0;let found=0;bannerFilm.cars.forEach((car,index)=>{if(time>=car.from)found=index;});return found;};
/** How far through the current car's turn the film is, 0–1 (the first car's turn wraps around the loop). */
const filmProgress=(time:number,duration:number)=>{
 const index=filmCarAt(time);
 if(index===0){const span=duration-bannerFilm.wrap+bannerFilm.cars[1].from;return Math.min(1,(time>=bannerFilm.wrap?time-bannerFilm.wrap:duration-bannerFilm.wrap+time)/span);}
 const end=bannerFilm.cars[index+1]?.from??bannerFilm.wrap;return Math.min(1,(time-bannerFilm.cars[index].from)/(end-bannerFilm.cars[index].from));
};
function BannerFilmHero({lang,cars}:{lang:Lang;cars:ReturnType<typeof bannerCarList>}){
 const t=copyV2[lang],h=homeCopy[lang];
 const section=useRef<HTMLElement>(null),video=useRef<HTMLVideoElement>(null);
 const [index,setIndex]=useState(0),[playing,setPlaying]=useState(true),[canPlay,setCanPlay]=useState(false),[onScreen,setOnScreen]=useState(true);
 const car=cars[index].vehicle;
 // Reads the film's position: which car is on screen, and how far its turn has run (for the dot).
 const seeking=useRef(false);
 const read=useCallback(()=>{const element=video.current;if(!element||seeking.current)return;const time=element.currentTime,next=filmCarAt(time);setIndex(previous=>previous===next?previous:next);if(element.duration)section.current?.style.setProperty("--v2-film-progress",filmProgress(time,element.duration).toFixed(3));},[]);
 useEffect(()=>{
  const motion=window.matchMedia("(prefers-reduced-motion: reduce)"),saveData=(navigator as Navigator&{connection?:{saveData?:boolean}}).connection?.saveData===true;
  const update=()=>setCanPlay(!motion.matches&&!saveData&&!document.hidden);
  update();motion.addEventListener("change",update);document.addEventListener("visibilitychange",update);
  const target=section.current;let observer:IntersectionObserver|undefined;
  if(target&&"IntersectionObserver" in window){observer=new IntersectionObserver(([entry])=>setOnScreen(entry.isIntersecting),{threshold:.2});observer.observe(target);}
  return()=>{motion.removeEventListener("change",update);document.removeEventListener("visibilitychange",update);observer?.disconnect();};
 },[]);
 const running=playing&&canPlay&&onScreen;
 useEffect(()=>{
  const element=video.current;if(!element)return;
  element.muted=true;element.defaultPlaybackRate=bannerFilm.rate;element.playbackRate=bannerFilm.rate;
  if(!running){element.pause();read();return;}
  void element.play().catch(()=>undefined);
  let frame=0;const tick=()=>{read();frame=window.requestAnimationFrame(tick);};frame=window.requestAnimationFrame(tick);
  return()=>window.cancelAnimationFrame(frame);
 },[running,read]);
 // Dots and arrows jump to a car with a short fade; the film carries on from there.
 const fading=useRef(0);
 const showCar=(next:number)=>{
  const element=video.current;if(!element)return;
  const target=(next+cars.length)%cars.length,time=bannerFilm.cars[target].jump;
  setIndex(target);window.clearTimeout(fading.current);seeking.current=true;
  if(window.matchMedia("(prefers-reduced-motion: reduce)").matches){element.currentTime=time;return;}
  element.style.opacity="0";
  fading.current=window.setTimeout(()=>{element.currentTime=time;element.style.opacity="";},260);
 };
 const label=modelName(car)+" "+car.year+" — AutoMall";
 return <section ref={section} className="v2-dealer-hero v2-banner-film-mode" data-rotating={running||undefined} aria-labelledby="v2-dealer-title" aria-roledescription={lang==="ar"?"عارض سيارات":"carousel"}>
  <div className="v2-banner-track v2-banner-film" id="v2-banner-cars" role="group" aria-label={lang==="ar"?"فيديو سيارات البانر":"Banner cars video"} tabIndex={0} onKeyDown={event=>{if(event.key==="ArrowLeft"||event.key==="ArrowRight"){event.preventDefault();showCar(index+(event.key==="ArrowRight"?1:-1)*(lang==="ar"?-1:1));}}}>
   <div className="v2-banner-slide"><img className="v2-banner-backdrop" src={bannerFilm.poster} alt="" aria-hidden="true" width="1280" height="720" decoding="async"/>
    <video ref={video} className="v2-dealer-hero-image v2-banner-film-video" poster={bannerFilm.poster} muted loop playsInline disablePictureInPicture preload="auto" width="1280" height="720" role="img" aria-label={label} onSeeked={()=>{seeking.current=false;read();}} onLoadedMetadata={read}>
     <source media="(max-width: 700px)" src={bannerFilm.phone} type="video/mp4"/><source src={bannerFilm.desktop} type="video/mp4"/>
    </video>
   </div>
  </div>
  <div className="v2-dealer-hero-content"><h1 id="v2-dealer-title" tabIndex={-1}>{h.title}</h1><p>{h.description}</p><div className="v2-dealer-hero-actions"><a className="v2-button v2-button-orange" href={pagePath("cars",lang)}>{t.browse}<Arrow/></a><a className="v2-button v2-button-outline" href={whatsapp(genericMessage(lang))} target="_blank" rel="noopener noreferrer">{t.whatsapp}<Arrow/></a></div></div>
  <a className="v2-dealer-hero-model" href={pagePath("car",lang,car.id)}>{cars[index].label} <span>{specValue(car,"Fuel / powertrain")?.[lang]}</span><Arrow/></a>
  <div className="v2-banner-controls"><button type="button" aria-label={lang==="ar"?"السيارة السابقة في البانر":"Previous banner car"} aria-controls="v2-banner-cars" onClick={()=>showCar(index-1)}><span aria-hidden="true">{lang==="ar"?"→":"←"}</span></button><div className="v2-banner-pagination"><div className="v2-banner-dots">{cars.map((item,slide)=><button type="button" key={item.vehicle.id} aria-label={(lang==="ar"?"عرض ":"Show ")+item.label} aria-current={slide===index?"true":undefined} aria-controls="v2-banner-cars" onClick={()=>showCar(slide)}/>)}</div><span className="v2-banner-status"><span className="v2-banner-count" dir="ltr" aria-live={running?"off":"polite"} aria-atomic="true">0{index+1} / 0{cars.length}</span><button type="button" className="v2-banner-pause" aria-pressed={!playing} aria-label={playing?(lang==="ar"?"إيقاف الحركة":"Pause the banner"):(lang==="ar"?"تشغيل الحركة":"Play the banner")} onClick={()=>setPlaying(value=>!value)}>{playing?<svg viewBox="0 0 12 12" width="10" height="10" aria-hidden="true"><rect x="2" y="1.5" width="2.6" height="9" rx=".8" fill="currentColor"/><rect x="7.4" y="1.5" width="2.6" height="9" rx=".8" fill="currentColor"/></svg>:<svg viewBox="0 0 12 12" width="10" height="10" aria-hidden="true"><path d="M3 1.6v8.8L10.4 6z" fill="currentColor"/></svg>}</button></span></div><button type="button" aria-label={lang==="ar"?"السيارة التالية في البانر":"Next banner car"} aria-controls="v2-banner-cars" onClick={()=>showCar(index+1)}><span aria-hidden="true">{lang==="ar"?"←":"→"}</span></button></div>
 </section>;
}
function BannerCarousel({lang}:{lang:Lang}){
 const bannerCars=bannerCarList();
 const t=copyV2[lang],h=homeCopy[lang],track=useRef<HTMLDivElement>(null),active=useRef(0),measuredWidth=useRef(0),[index,setIndex]=useState(0),car=bannerCars[index].vehicle;
 const readSlide=()=>{const element=track.current;if(!element||!element.clientWidth||measuredWidth.current&&element.clientWidth!==measuredWidth.current)return;const next=Math.max(0,Math.min(bannerCars.length-1,Math.round(Math.abs(element.scrollLeft)/element.clientWidth)));active.current=next;setIndex(previous=>previous===next?previous:next);};
 // Slides change with a gentle glide (about a second). Jumps of more than one car fade instead of rewinding across the cars in between.
 const glide=useRef(0);
 const showSlide=(next:number)=>{
  const element=track.current;if(!element)return;
  const target=(next+bannerCars.length)%bannerCars.length,left=(lang==="ar"?-1:1)*target*element.clientWidth;
  window.cancelAnimationFrame(glide.current);element.style.opacity="";
  if(window.matchMedia("(prefers-reduced-motion: reduce)").matches){element.scrollTo({left,behavior:"instant"});return;}
  const start=element.scrollLeft,distance=left-start;if(Math.abs(distance)<1)return;
  element.style.scrollSnapType="none";element.style.scrollBehavior="auto";
  const settle=()=>{element.style.scrollSnapType="";element.style.scrollBehavior="";};
  if(Math.abs(distance)>element.clientWidth*1.5){
   element.style.transition="opacity .45s ease";element.style.opacity="0";
   window.setTimeout(()=>{element.scrollLeft=left;settle();element.style.opacity="1";window.setTimeout(()=>{element.style.transition="";element.style.opacity="";},500);},450);
   return;
  }
  const began=performance.now(),duration=1100;
  const step=(now:number)=>{const progress=Math.min(1,(now-began)/duration),eased=progress<.5?4*progress**3:1-(-2*progress+2)**3/2;element.scrollLeft=start+distance*eased;if(progress<1)glide.current=window.requestAnimationFrame(step);else settle();};
  glide.current=window.requestAnimationFrame(step);
 };
 // The banner moves on by itself every few seconds, and keeps going after a car is picked by hand.
 // It waits while the banner is off screen or the tab is hidden, and doesn't start for reduced motion.
 const section=useRef<HTMLElement>(null),[playing,setPlaying]=useState(true),[canAutoplay,setCanAutoplay]=useState(false),[onScreen,setOnScreen]=useState(true);
 useEffect(()=>{
  const motion=window.matchMedia("(prefers-reduced-motion: reduce)"),update=()=>setCanAutoplay(!motion.matches&&!document.hidden);
  update();motion.addEventListener("change",update);document.addEventListener("visibilitychange",update);
  const target=section.current;let observer:IntersectionObserver|undefined;
  if(target&&"IntersectionObserver" in window){observer=new IntersectionObserver(([entry])=>setOnScreen(entry.isIntersecting),{threshold:.25});observer.observe(target);}
  return()=>{motion.removeEventListener("change",update);document.removeEventListener("visibilitychange",update);observer?.disconnect();window.cancelAnimationFrame(glide.current);};
 },[]);
 const rotating=playing&&canAutoplay&&onScreen&&bannerCars.length>1;
 useEffect(()=>{if(!rotating)return;const timer=window.setTimeout(()=>showSlide(index+1),BANNER_SLIDE_MS);return()=>window.clearTimeout(timer);},[index,rotating]);
 useEffect(()=>{const element=track.current;if(!element)return;measuredWidth.current=element.clientWidth;const observer=new ResizeObserver(()=>{if(element.clientWidth===measuredWidth.current)return;measuredWidth.current=element.clientWidth;element.scrollTo({left:(lang==="ar"?-1:1)*active.current*measuredWidth.current,behavior:"instant"});});observer.observe(element);return()=>observer.disconnect();},[lang]);
 return <section ref={section} className="v2-dealer-hero" data-rotating={rotating||undefined} style={{"--v2-banner-slide-ms":BANNER_SLIDE_MS+"ms"} as React.CSSProperties} aria-labelledby="v2-dealer-title" aria-roledescription={lang==="ar"?"عارض سيارات":"carousel"}>
  <div className="v2-banner-track" id="v2-banner-cars" ref={track} role="group" aria-label={lang==="ar"?"سيارات البانر، اسحب جانبياً":"Banner cars, swipe sideways"} tabIndex={0} onScroll={readSlide} onKeyDown={event=>{if(event.target!==event.currentTarget)return;if(event.key==="ArrowLeft"||event.key==="ArrowRight"){event.preventDefault();showSlide(index+(event.key==="ArrowRight"?1:-1)*(lang==="ar"?-1:1));}else if(event.key==="Home"||event.key==="End"){event.preventDefault();showSlide(event.key==="End"?bannerCars.length-1:0);}}}>
   {bannerCars.map((item,slide)=><div className="v2-banner-slide" key={item.vehicle.id} role="group" aria-roledescription={lang==="ar"?"شريحة":"slide"} aria-label={(slide+1)+" / "+bannerCars.length} aria-hidden={slide!==index}>{(()=>{const alt=modelName(item.vehicle)+" "+item.vehicle.year+" — AutoMall",video=bannerVideoIds.has(item.vehicle.id)?bannerVideoPath(item.vehicle.id):null;return <><img className="v2-banner-backdrop" src={video?video.poster:item.photo} alt="" aria-hidden="true" width="1600" height="1600" loading={slide===0?"eager":"lazy"} decoding="async"/>{video?<BannerVideo video={video} label={alt} active={slide===index} paused={!playing}/>:<img className="v2-dealer-hero-image" src={item.photo} alt={alt} width="1600" height="1600" loading={slide===0?"eager":"lazy"} fetchPriority={slide===0?"high":"low"} decoding="async"/>}</>;})()}</div>)}
  </div>
  <div className="v2-dealer-hero-content"><h1 id="v2-dealer-title" tabIndex={-1}>{h.title}</h1><p>{h.description}</p><div className="v2-dealer-hero-actions"><a className="v2-button v2-button-orange" href={pagePath("cars",lang)}>{t.browse}<Arrow/></a><a className="v2-button v2-button-outline" href={whatsapp(genericMessage(lang))} target="_blank" rel="noopener noreferrer">{t.whatsapp}<Arrow/></a></div></div>
  <a className="v2-dealer-hero-model" href={pagePath("car",lang,car.id)}>{bannerCars[index].label} <span>{specValue(car,"Fuel / powertrain")?.[lang]}</span><Arrow/></a>
  <div className="v2-banner-controls"><button type="button" aria-label={lang==="ar"?"السيارة السابقة في البانر":"Previous banner car"} aria-controls="v2-banner-cars" onClick={()=>showSlide(index-1)}><span aria-hidden="true">{lang==="ar"?"→":"←"}</span></button><div className="v2-banner-pagination"><div className="v2-banner-dots">{bannerCars.map((item,slide)=><button type="button" key={item.vehicle.id} aria-label={(lang==="ar"?"عرض ":"Show ")+item.label} aria-current={slide===index?"true":undefined} aria-controls="v2-banner-cars" onClick={()=>showSlide(slide)}/>)}</div><span className="v2-banner-status"><span className="v2-banner-count" dir="ltr" aria-live={rotating?"off":"polite"} aria-atomic="true">0{index+1} / 0{bannerCars.length}</span><button type="button" className="v2-banner-pause" aria-pressed={!playing} aria-label={playing?(lang==="ar"?"إيقاف الحركة":"Pause the banner"):(lang==="ar"?"تشغيل الحركة":"Play the banner")} onClick={()=>setPlaying(value=>!value)}>{playing?<svg viewBox="0 0 12 12" width="10" height="10" aria-hidden="true"><rect x="2" y="1.5" width="2.6" height="9" rx=".8" fill="currentColor"/><rect x="7.4" y="1.5" width="2.6" height="9" rx=".8" fill="currentColor"/></svg>:<svg viewBox="0 0 12 12" width="10" height="10" aria-hidden="true"><path d="M3 1.6v8.8L10.4 6z" fill="currentColor"/></svg>}</button></span></div><button type="button" aria-label={lang==="ar"?"السيارة التالية في البانر":"Next banner car"} aria-controls="v2-banner-cars" onClick={()=>showSlide(index+1)}><span aria-hidden="true">{lang==="ar"?"←":"→"}</span></button></div>
 </section>;
}
function HomePage({lang,filters,onChange}:{lang:Lang;filters:CatalogFilters;onChange:(value:CatalogFilters)=>void}){
 const t=copyV2[lang],n=navigationCopy[lang],h=homeCopy[lang];
 const featuredRail=useRef<HTMLDivElement>(null),[railEdges,setRailEdges]=useState({start:true,end:false});
 const readRailEdges=()=>{const rail=featuredRail.current;if(!rail)return;const position=Math.abs(rail.scrollLeft),maximum=rail.scrollWidth-rail.clientWidth;const start=position<2,end=position>=maximum-2;setRailEdges(previous=>previous.start===start&&previous.end===end?previous:{start,end});};
 useEffect(()=>{const rail=featuredRail.current;if(!rail)return;readRailEdges();const observer=new ResizeObserver(readRailEdges);observer.observe(rail);return()=>observer.disconnect();},[]);
 const moveFeatured=(step:number)=>{const rail=featuredRail.current,card=rail?.firstElementChild as HTMLElement|null;if(!rail||!card)return;const gap=parseFloat(window.getComputedStyle(rail).columnGap)||0;rail.scrollBy({left:(lang==="ar"?-1:1)*step*(card.offsetWidth+gap),behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"instant":"smooth"});};
 const jumpFeatured=(end:boolean)=>{const rail=featuredRail.current;if(rail)rail.scrollTo({left:end?(lang==="ar"?-1:1)*rail.scrollWidth:0,behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"instant":"smooth"});};
 const kept={...defaultFilters,powertrain:filters.powertrain,brand:filters.brand,body:filters.body,yearFrom:filters.yearFrom,yearTo:filters.yearTo};
 const change=(key:"powertrain"|"brand"|"body",value:string)=>onChange({...kept,[key]:value});
 const bodyOptions:PickerOption[]=[{value:"all",label:n.allBody,visual:<BodyStyleIcon name="all"/>},...bodyStyles.map(body=>({value:body.id,label:body.label[lang],keywords:body.label.en+" "+body.label.ar,visual:<BodyStyleIcon name={body.id}/>,count:vehicles.filter(vehicle=>(filters.powertrain==="all"||vehicle.categories.includes(filters.powertrain))&&bodyStyleFor(vehicle)===body.id).length}))];
 const brandOptions:PickerOption[]=[{value:"all",label:t.allBrands,visual:<Icon name="emblem" size={20}/>},...brandNames.map(brand=>({value:brand,label:brand,visual:<BrandLogo brand={brand}/>}))];
 const powerOptions:PickerOption[]=[{value:"all",label:n.allPower,visual:<Icon name="energy" size={20}/>,count:vehicles.length},...powertrains.map(power=>({value:power.id,label:power.label[lang],keywords:power.label.en+" "+power.label.ar,visual:<Icon name={power.id==="electric"?"battery":power.id==="hybrid"?"hybrid":"engine"} size={20}/>,count:vehicles.filter(vehicle=>vehicle.categories.includes(power.id)).length}))];
 return <div className="v2-home-refined v2-home-banner">
  {(()=>{const cars=filmCars();return cars?<BannerFilmHero lang={lang} cars={cars}/>:<BannerCarousel lang={lang}/>;})()}
  <form className="v2-home-search" action={pagePath("cars",lang)} method="get" aria-label={h.findTitle}>
   <div className="v2-home-search-heading"><h2>{h.findTitle}</h2><p>{h.findDescription}</p></div>
   <div className="v2-home-search-fields">
    <div><label htmlFor="v2-home-power">{n.powerFilter}</label><FilterPicker id="v2-home-power" name="powertrain" label={n.powerFilter} lang={lang} value={filters.powertrain} options={powerOptions} onChange={value=>change("powertrain",value)}/></div>
    <div><label htmlFor="v2-home-brand">{t.brand}</label><FilterPicker id="v2-home-brand" name="brand" label={t.brand} lang={lang} value={filters.brand} options={brandOptions} onChange={value=>change("brand",value)}/></div>
    <div><label htmlFor="v2-home-body">{n.bodyFilter}</label><FilterPicker id="v2-home-body" name="body" label={n.bodyFilter} lang={lang} value={filters.body} options={bodyOptions} onChange={value=>change("body",value)}/></div>
    <div className="v2-year-field"><label htmlFor="v2-home-year">{n.yearFilter}</label><YearRangePicker id="v2-home-year" label={n.yearFilter} lang={lang} years={modelYears} from={filters.yearFrom} to={filters.yearTo} named onChange={(yearFrom,yearTo)=>onChange({...kept,yearFrom,yearTo})}/></div>
    <button className="v2-button v2-button-orange" type="submit">{h.findAction}<NavIcon name="search"/></button>
   </div>
  </form>
  <section className="v2-category-section v2-wrap" id="v2-categories" aria-labelledby="v2-power-heading"><div className="v2-section-heading" data-reveal><div><p className="v2-eyebrow">{n.powertrain}</p><h2 id="v2-power-heading">{n.powerTitle}</h2></div></div><div className="v2-category-grid" data-kind="powertrain">{powertrains.map(power=><a className="v2-category-card" key={power.id} href={withFilters(pagePath("cars",lang),{...defaultFilters,powertrain:power.id})}><img className="v2-category-photo" src={categoryPhoto(power.id)} alt={(categoryPhotos[power.id]?.model??power.label[lang])+(lang==="ar"?" في أوتومول":" at AutoMall")} width="1100" height="734" loading="lazy" decoding="async"/><div className="v2-category-label"><div><h3>{power.label[lang]}</h3><p>{vehicles.filter(vehicle=>vehicle.categories.includes(power.id)).length} {t.cars}</p><small>{power.description[lang]}</small></div><Arrow/></div></a>)}</div></section>

  <V2BrandBrowser lang={lang} catalogHref={pagePath("cars",lang)}/>

  <section className="v2-home-featured v2-wrap"><div className="v2-section-heading" data-reveal><div><p className="v2-eyebrow">AUTOMALL / {t.featured}</p><h2 id="v2-featured-title">{n.featuredTitle}</h2></div><a className="v2-text-link" href={pagePath("cars",lang)}>{n.viewAll}<Arrow/></a></div><div className="v2-featured-navigation"><p className="v2-featured-swipe-hint">{lang==="ar"?"اسحب جانبياً لاستكشاف السيارات":"Swipe to explore the cars"}</p><div className="v2-featured-controls"><button type="button" aria-label={t.previousCar} aria-controls="v2-featured-cars" disabled={railEdges.start} onClick={()=>moveFeatured(-1)}><span aria-hidden="true">{lang==="ar"?"→":"←"}</span></button><button type="button" aria-label={t.nextCar} aria-controls="v2-featured-cars" disabled={railEdges.end} onClick={()=>moveFeatured(1)}><span aria-hidden="true">{lang==="ar"?"←":"→"}</span></button></div></div><div className="v2-car-grid v2-featured-rail" id="v2-featured-cars" ref={featuredRail} role="region" aria-labelledby="v2-featured-title" tabIndex={0} onScroll={readRailEdges} onKeyDown={event=>{if(event.target!==event.currentTarget)return;if(event.key==="ArrowLeft"||event.key==="ArrowRight"){event.preventDefault();moveFeatured((event.key==="ArrowRight"?1:-1)*(lang==="ar"?-1:1));}else if(event.key==="Home"||event.key==="End"){event.preventDefault();jumpFeatured(event.key==="End");}}}>{featuredCars().map(vehicle=><CarCard key={vehicle.id} vehicle={vehicle} lang={lang} compact/>)}</div></section>
   <section className="v2-refined-contact v2-wrap"><div><p className="v2-eyebrow">{lang==="ar"?"زر أوتومول":"VISIT AUTOMALL"}</p><h2>{lang==="ar"?"تعرف على سيارتك عن قرب.":"See your next car in person."}</h2><p>{t.address} · {t.city}</p></div><a className="v2-button v2-button-orange" href={pagePath("contact",lang)}>{n.contact}<Arrow/></a></section>
</div>;
}
function CatalogPage({lang,filters,onChange}:{lang:Lang;filters:CatalogFilters;onChange:(value:CatalogFilters)=>void}){
 const t=copyV2[lang],n=navigationCopy[lang],[visibleCount,setVisibleCount]=useState(PAGE_SIZE),deferredQuery=useDeferredValue(filters.query);
 const matching=useMemo(()=>filterVehicles({...filters,query:deferredQuery}),[filters,deferredQuery]);
 const visible=matching.slice(0,visibleCount);
 useEffect(()=>{setVisibleCount(PAGE_SIZE);},[filters]);
 const change=(key:keyof CatalogFilters,value:string)=>onChange({...filters,[key]:value});
 const reset=()=>onChange({...defaultFilters});
 const more=()=>{const next=matching[visible.length];setVisibleCount(count=>count+PAGE_SIZE);if(next)requestAnimationFrame(()=>document.getElementById("v2-car-"+next.id)?.focus());};
 const bodyOptions:PickerOption[]=[{value:"all",label:n.allBody,visual:<BodyStyleIcon name="all"/>},...bodyStyles.map(body=>({value:body.id,label:body.label[lang],keywords:body.label.en+" "+body.label.ar,visual:<BodyStyleIcon name={body.id}/>,count:vehicles.filter(vehicle=>(filters.powertrain==="all"||vehicle.categories.includes(filters.powertrain))&&bodyStyleFor(vehicle)===body.id).length}))];
 const brandOptions:PickerOption[]=[{value:"all",label:t.allBrands,visual:<Icon name="emblem" size={20}/>},...brandNames.map(brand=>({value:brand,label:brand,visual:<BrandLogo brand={brand}/>}))];
 const sortOptions:PickerOption[]=[{value:"featured",label:t.featured,visual:<Icon name="featured" size={20}/>},{value:"newest",label:t.newest,visual:<Icon name="newest" size={20}/>},{value:"price",label:t.lowPrice,visual:<Icon name="priceUp" size={20}/>},{value:"price-desc",label:n.highPrice,visual:<Icon name="priceDown" size={20}/>},{value:"name",label:n.byName,visual:<Icon name="alphabet" size={20}/>}];
 const activeFilters:{key:keyof CatalogFilters;label:string}[]=[];
 if(filters.powertrain!=="all")activeFilters.push({key:"powertrain",label:powertrains.find(power=>power.id===filters.powertrain)!.label[lang]});
 if(filters.body!=="all")activeFilters.push({key:"body",label:bodyStyles.find(body=>body.id===filters.body)!.label[lang]});
 if(filters.brand!=="all")activeFilters.push({key:"brand",label:filters.brand});
 if(filters.equipment!=="all")activeFilters.push({key:"equipment",label:featureLabels[filters.equipment as VehicleFeatureName]?.[lang]??filters.equipment});
 if(filters.yearFrom!=="all"||filters.yearTo!=="all")activeFilters.push({key:"yearFrom",label:n.yearFilter+": "+(filters.yearFrom==="all"?modelYears[0]:filters.yearFrom)+"–"+(filters.yearTo==="all"?modelYears[modelYears.length-1]:filters.yearTo)});
 if(filters.query.trim())activeFilters.push({key:"query",label:t.search+": "+filters.query.trim()});
 const removeFilter=(key:keyof CatalogFilters)=>{if(key==="yearFrom"){onChange({...filters,yearFrom:"all",yearTo:"all"});requestAnimationFrame(()=>document.getElementById("v2-year")?.focus());return;}change(key,defaultFilters[key]);requestAnimationFrame(()=>{const target=key==="query"?"v2-search":key==="body"?"v2-body":key==="brand"?"v2-brand":key==="equipment"?"v2-equipment":null;if(key==="equipment")document.getElementById("v2-search")?.focus();else if(target)document.getElementById(target)?.focus();else document.querySelector<HTMLButtonElement>(".v2-powertrain-tabs button")?.focus();});};
 return <>
  <PageHeading lang={lang} view="cars"/>
  <section className="v2-inventory v2-wrap" id="v2-collection" aria-label={n.cars}>
   <div className="v2-filter-layout">
    <div className="v2-powertrain-tabs v2-powertrain-compact" role="group" aria-label={n.powerFilter}><button type="button" aria-pressed={filters.powertrain==="all"} onClick={()=>change("powertrain","all")}><span>{lang==="ar"?"الكل":"All"}</span><small>{vehicles.length}</small></button>{powertrains.map(power=><button type="button" key={power.id} aria-pressed={filters.powertrain===power.id} onClick={()=>change("powertrain",power.id)}><span>{power.label[lang]}</span><small>{vehicles.filter(vehicle=>vehicle.categories.includes(power.id)).length}</small></button>)}</div>
    <div className="v2-catalog-toolbar">
     <div className="v2-search"><label htmlFor="v2-search">{t.search}</label><div><input id="v2-search" type="search" maxLength={100} placeholder={t.searchPlaceholder} value={filters.query} onChange={event=>change("query",event.target.value)}/><span aria-hidden="true">⌕</span></div></div>
     <div className="v2-brand-select"><label htmlFor="v2-brand">{t.brand}</label><FilterPicker id="v2-brand" label={t.brand} lang={lang} value={filters.brand} options={brandOptions} onChange={value=>change("brand",value)}/></div>
     <div className="v2-body-select v2-body-filters"><label htmlFor="v2-body">{n.bodyFilter}</label><FilterPicker id="v2-body" label={n.bodyFilter} lang={lang} value={filters.body} options={bodyOptions} onChange={value=>change("body",value)}/></div>
     <div className="v2-year-select"><label htmlFor="v2-year">{n.yearFilter}</label><YearRangePicker id="v2-year" label={n.yearFilter} lang={lang} years={modelYears} from={filters.yearFrom} to={filters.yearTo} onChange={(yearFrom,yearTo)=>onChange({...filters,yearFrom,yearTo})}/></div>
     <div className="v2-sort-select"><label htmlFor="v2-sort">{t.sort}</label><FilterPicker id="v2-sort" label={t.sort} lang={lang} value={filters.sort} options={sortOptions} onChange={value=>change("sort",value)}/></div>
    </div>
    {(activeFilters.length>0||filters.sort!=="featured")&&<div className="v2-active-filters" aria-label={n.activeFilters}>{activeFilters.map(filter=><button type="button" key={filter.key} onClick={()=>removeFilter(filter.key)} aria-label={n.removeFilter+": "+filter.label}>{filter.key==="body"&&<span className="v2-filter-chip-visual"><BodyStyleIcon name={filters.body}/></span>}{filter.key==="brand"&&<span className="v2-filter-chip-visual"><BrandLogo brand={filters.brand}/></span>}{filter.label}<span aria-hidden="true">×</span></button>)}<button type="button" className="v2-clear-all" onClick={reset}>{t.reset}</button></div>}
   </div>
   <div className="v2-filter-summary"><div className="v2-count" role="status" aria-live="polite"><span>{t.showing} {visible.length} {t.of} {matching.length} {t.cars}</span><time dateTime="2026-10-29">{lang==="ar"?"29 أكتوبر 2026":"29 OCT 2026"}</time></div></div>
   <div className="v2-car-grid">{visible.map(vehicle=><CarCard key={vehicle.id} vehicle={vehicle} lang={lang} filters={filters}/>)}</div>
   {matching.length===0&&<div className="v2-empty"><Icon name="mileage" size={42}/><h3>{t.emptyTitle}</h3><p>{t.emptyBody}</p><button className="v2-button v2-button-dark" type="button" onClick={reset}>{t.reset}<Arrow/></button></div>}
   {visible.length<matching.length&&<div className="v2-load-more"><button className="v2-button v2-button-dark" type="button" onClick={more}>{t.more}<span aria-hidden="true">+{Math.min(PAGE_SIZE,matching.length-visible.length)}</span></button></div>}
   <p className="v2-source-note">{t.snapshot}</p>
  </section>
 </>;
}
function DetailPage({lang,vehicleId,filters}:{lang:Lang;vehicleId?:string;filters:CatalogFilters}){
 const n=navigationCopy[lang],vehicle=findVehicle(vehicleId);
 const related=vehicle?vehicles.filter(item=>item.id!==vehicle.id&&bodyStyleFor(item)===bodyStyleFor(vehicle)&&item.categories.some(category=>powertrains.some(power=>power.id===category)&&vehicle.categories.includes(category))).slice(0,3):[];
 if(!vehicle)return <div className="v2-page-heading v2-wrap"><h1 tabIndex={-1}>{n.notFound}</h1><p>{n.notFoundBody}</p><a className="v2-button v2-button-orange" href={pagePath("cars",lang)}>{n.backCars}<Arrow/></a></div>;
 return <><V2VehicleDetails vehicle={vehicle} lang={lang} catalogHref={withFilters(pagePath("cars",lang),filters)} homeHref={pagePath("home",lang)} languageHref={withFilters(pagePath("car",lang==="en"?"ar":"en",vehicle.id),filters)}/>{related.length>0&&<section className="v2-related v2-wrap"><div className="v2-section-heading"><div><p className="v2-eyebrow">AUTOMALL / {n.cars}</p><h2>{n.related}</h2></div><a className="v2-text-link" href={withFilters(pagePath("cars",lang),filters)}>{n.backCars}<Arrow/></a></div><div className="v2-car-grid">{related.map(item=><CarCard key={item.id} vehicle={item} lang={lang} filters={filters}/>)}</div></section>}</>;
}
function FeaturesPage({lang}:{lang:Lang}){
 const t=copyV2[lang],cabin=findVehicle("288630286")??vehicles[0];
 return <><PageHeading lang={lang} view="features"/><section className="v2-equipment v2-wrap" id="v2-features" aria-label={t.navFeatures}><div className="v2-equipment-grid">{equipmentTiles.map(id=><a className="v2-equipment-tile" key={id} href={withFilters(pagePath("cars",lang),{...defaultFilters,equipment:id})} aria-label={t.viewMatches+": "+featureLabels[id]?.[lang]}><Icon name={id} size={34}/><h3>{featureLabels[id]?.[lang]}</h3><span>{vehicles.filter(vehicle=>equipmentFor(vehicle).some(feature=>feature.id===id)).length} {t.cars}<Arrow/></span></a>)}</div><p className="v2-source-note">{t.dealerListed}</p></section><section className="v2-cabin v2-wrap" aria-labelledby="v2-cabin-heading"><div className="v2-cabin-copy" data-reveal><p className="v2-eyebrow">{t.cabinKicker}</p><h2 id="v2-cabin-heading">{t.cabinTitle}</h2><p>{t.cabinBody}</p><div className="v2-cabin-features">{equipmentFor(cabin).filter(feature=>["leather","heatedSeats","ventilatedSeats","hud"].includes(feature.id)).map(feature=><div key={feature.id}><Icon name={feature.id} size={27}/><span>{feature.label[lang]}</span></div>)}</div><a className="v2-button v2-button-light" href={pagePath("car",lang,cabin.id)}>{t.cabinAction}<Arrow/></a></div><div className="v2-cabin-photos" data-reveal><img className="v2-cabin-main" src={assetPath("assets/catalog/gallery-288630286-11.webp")} alt={lang==="ar"?"المقصورة الجلدية لسيارة BMW i5 M60 في أوتومول":"BMW i5 M60 leather cabin at AutoMall"} width="1600" height="1068" loading="lazy"/><img className="v2-cabin-detail" src={assetPath("assets/catalog/gallery-288630286-5.webp")} alt={lang==="ar"?"تفاصيل وحدة التحكم في BMW i5 M60":"BMW i5 M60 console detail"} width="1600" height="1068" loading="lazy"/></div></section></>;
}
function UpdatesPage({lang}:{lang:Lang}){
 const t=copyV2[lang];
 return <><PageHeading lang={lang} view="updates"/><section className="v2-posts v2-wrap" aria-label={t.postTitle}><div className="v2-post-grid">{dealerPosts.map(post=>{const vehicle=vehicles.find(item=>post.vehicleIds.includes(item.id));return <article className="v2-post" key={post.postId}>{vehicle&&<a className="v2-post-photo" href={pagePath("car",lang,vehicle.id)} aria-label={t.details+": "+modelName(vehicle)}><img src={cardSrc(vehicle.image)} alt={modelName(vehicle)+" "+vehicle.year} width="1200" height="800" loading="lazy"/></a>}<div className="v2-post-top"><span className="v2-facebook-mark" aria-hidden="true">f</span><span>AutoMall / Facebook</span><Arrow/></div><h3>{post.model} · {post.year}</h3><p className="v2-post-summary">{post.summary[lang]}</p>{vehicle&&<div className="v2-post-icons">{equipmentFor(vehicle).filter(feature=>feature.sourceType==="facebook").slice(0,3).map(feature=><span key={feature.id}><Icon name={feature.id} size={20}/>{feature.label[lang]}</span>)}</div>}<a href={post.url} target="_blank" rel="noopener noreferrer">{t.postAction}<Arrow/></a></article>;})}</div><div className="v2-post-actions"><a className="v2-text-link" href={FACEBOOK} target="_blank" rel="noopener noreferrer">{t.viewFacebook}<Arrow/></a></div><p className="v2-source-note">{t.sourceNote}</p></section></>;
}
function ContactIcon({name}:{name:"whatsapp"|"call"|"directions"|"social"|"clock"|"trade"}){
 const paths={whatsapp:<><path d="M4 20l1.3-3.9A8 8 0 1 1 8 18.8Z"/><path d="M9 8.5c0 3.5 2.6 6.5 6.4 6.6l1.1-1.4-2-1.1-.9.8a5 5 0 0 1-2.6-2.6l.8-.9-1.1-2-1.4 1Z"/></>,call:<path d="M5 4h3l1.6 4-2 1.3a10 10 0 0 0 5.1 5.1l1.3-2 4 1.6v3a2 2 0 0 1-2.2 2A15 15 0 0 1 3 6.2 2 2 0 0 1 5 4Z"/>,directions:<><path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z"/><circle cx="12" cy="10" r="2.4"/></>,social:<><rect x="4" y="4" width="16" height="16" rx="5"/><circle cx="12" cy="12" r="3.6"/><circle cx="16.8" cy="7.2" r=".9" fill="currentColor" stroke="none"/></>,clock:<><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></>,trade:<><path d="M4 8h13l-3-3m6 11H7l3 3"/></>};
 return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}
const dayNames:Record<Lang,Record<OpeningDay["day"],string>>={en:{sat:"Saturday",sun:"Sunday",mon:"Monday",tue:"Tuesday",wed:"Wednesday",thu:"Thursday",fri:"Friday"},ar:{sat:"السبت",sun:"الأحد",mon:"الاثنين",tue:"الثلاثاء",wed:"الأربعاء",thu:"الخميس",fri:"الجمعة"}};
const formatTime=(time:string,lang:Lang)=>{const [h,m]=time.split(":").map(Number);if(!Number.isFinite(h))return time;const suffix=h<12?(lang==="ar"?"ص":"am"):(lang==="ar"?"م":"pm");const hour=h%12||12;return hour+(m?":"+String(m).padStart(2,"0"):"")+" "+suffix;};
function ContactPage({lang}:{lang:Lang}){
 const t=copyV2[lang],n=navigationCopy[lang],ar=lang==="ar";
 const tradeMessage=ar?"مرحباً أوتومول، أود مناقشة استبدال سيارتي الحالية.":"Hello AutoMall, I would like to discuss trading in my current car.";
 const mapQuery=encodeURIComponent(settings.mapsQuery);
 const tiles=[
  {icon:"whatsapp" as const,label:"WhatsApp",value:ar?"راسلنا الآن":"Message us now",href:whatsapp(genericMessage(lang)),external:true},
  {icon:"call" as const,label:ar?"اتصل بالمعرض":"Call the showroom",value:phoneDisplay(),href:"tel:"+PHONE,external:false,ltr:true},
  {icon:"directions" as const,label:t.directions,value:t.address+" · "+t.city,href:MAPS,external:true},
  {icon:"social" as const,label:"Instagram",value:"@automalljo",href:INSTAGRAM,external:true,ltr:true}
 ];
 return <><PageHeading lang={lang} view="contact"/>
  <section className="v2-showroom v2-wrap" id="v2-visit" aria-label={t.navVisit}>
   <div className="v2-showroom-info">
    <p className="v2-eyebrow">{ar?"أوتومول / شارع مكة":"AUTOMALL / MECCA STREET"}</p>
    <h2>{ar?"زر معرضنا في عمّان":"Visit our Amman showroom"}</h2>
    <address className="v2-showroom-address"><strong>{t.address}</strong><span>{t.city}</span></address>
    <div className="v2-showroom-tiles">{tiles.map(tile=><a key={tile.icon} className="v2-showroom-tile" href={tile.href} {...(tile.external?{target:"_blank",rel:"noopener noreferrer"}:{})}><ContactIcon name={tile.icon}/><span><small>{tile.label}</small><strong dir={tile.ltr?"ltr":undefined}>{tile.value}</strong></span><Arrow/></a>)}</div>
    {settings.hours.length>0?<div className="v2-showroom-hours"><ContactIcon name="clock"/><div><strong>{ar?"أوقات الدوام":"Opening hours"}</strong><dl className="v2-hours-list">{settings.hours.map(day=><div key={day.day}><dt>{dayNames[lang][day.day]}</dt><dd dir="ltr">{day.closed||!day.open||!day.close?(ar?"مغلق":"Closed"):formatTime(day.open,lang)+" – "+formatTime(day.close,lang)}</dd></div>)}</dl></div></div>:<p className="v2-showroom-hours"><ContactIcon name="clock"/><span><strong>{ar?"أوقات الدوام":"Opening hours"}</strong>{ar?"اتصل أو راسلنا على واتساب لتأكيد أوقات الدوام قبل زيارتك.":"Call or message us on WhatsApp to confirm opening hours before you visit."}</span></p>}
   </div>
   <div className="v2-showroom-map"><iframe title={ar?"خريطة موقع معرض أوتومول في شارع مكة، عمّان":"Map of the AutoMall showroom on Mecca Street, Amman"} src={"https://www.google.com/maps?q="+mapQuery+"&hl="+lang+"&z=15&output=embed"} loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen/><a className="v2-showroom-map-link" href={MAPS} target="_blank" rel="noopener noreferrer">{ar?"افتح في خرائط Google":"Open in Google Maps"}<Arrow/></a></div>
  </section>
  <section className="v2-wrap v2-showroom-trade-wrap" aria-labelledby="v2-trade-heading"><div className="v2-showroom-trade">
   <span className="v2-showroom-trade-icon"><ContactIcon name="trade"/></span>
   <div><p className="v2-eyebrow">AUTOMALL / {ar?"الاستبدال":"TRADE-IN"}</p><h2 id="v2-trade-heading">{n.trade}</h2><p>{n.tradeBody}</p></div>
   <div className="v2-showroom-trade-actions"><a className="v2-button v2-button-orange" href={whatsapp(tradeMessage)} target="_blank" rel="noopener noreferrer">{n.tradeAction}<Arrow/></a><a className="v2-text-link" href={FACEBOOK} target="_blank" rel="noopener noreferrer">Facebook<Arrow/></a></div>
  </div></section>
 </>;
}
function SavedPage({lang}:{lang:Lang}){
 const g=garageCopy[lang],ids=useSavedIds(),[ready,setReady]=useState(false);
 useEffect(()=>setReady(true),[]);
 const cars=ids.map(id=>findVehicle(id)).filter((item):item is Vehicle=>!!item);
 return <><PageHeading lang={lang} view="saved"/><section className="v2-inventory v2-wrap" aria-label={g.savedCars}>{ready&&cars.length>0?<div className="v2-car-grid">{cars.map(vehicle=><CarCard key={vehicle.id} vehicle={vehicle} lang={lang}/>)}</div>:<div className="v2-empty v2-garage-empty"><Icon name="featured" size={42}/><h3>{g.savedEmptyTitle}</h3><p>{g.savedEmptyBody}</p><a className="v2-button v2-button-orange" href={pagePath("cars",lang)}>{g.browseCars}<Arrow/></a></div>}</section></>;
}
function ComparePage({lang}:{lang:Lang}){
 const g=garageCopy[lang],t=copyV2[lang],ids=useCompareIds(),[ready,setReady]=useState(false);
 useEffect(()=>{const shared=new URLSearchParams(window.location.search).get("cars");if(shared){const valid=shared.split(",").filter(id=>!!findVehicle(id));if(valid.length)setCompare(valid);}setReady(true);},[]);
 const cars=ids.map(id=>findVehicle(id)).filter((item):item is Vehicle=>!!item);
 useEffect(()=>{if(!ready)return;const url=new URL(window.location.href);url.searchParams.delete("cars");const rest=url.searchParams.toString();const query=[cars.length?"cars="+cars.map(car=>car.id).join(","):"",rest].filter(Boolean).join("&");window.history.replaceState(window.history.state,"",url.pathname+(query?"?"+query:"")+url.hash);},[ready,cars.map(car=>car.id).join(",")]);
 const value=(vehicle:Vehicle,label:string)=>specValue(vehicle,label)?.[lang];
 const engine=(vehicle:Vehicle)=>cardFacts(vehicle,lang)[3]?.value;
 const rows:{label:string;get:(vehicle:Vehicle)=>string|undefined}[]=[
  {label:t.priceLabel,get:vehicle=>priceText(vehicle,lang)??t.askPrice},
  {label:lang==="ar"?"سنة الموديل":"Model year",get:vehicle=>String(vehicle.year)},
  {label:lang==="ar"?"الحالة":"Condition",get:vehicle=>value(vehicle,"Condition")},
  {label:lang==="ar"?"المسافة المقطوعة":"Mileage",get:vehicle=>value(vehicle,"Mileage")},
  {label:lang==="ar"?"نظام الحركة":"Powertrain",get:vehicle=>value(vehicle,"Fuel / powertrain")},
  {label:lang==="ar"?"المدى المعلن":"Advertised range",get:vehicle=>vehicle.range?.[lang]},
  {label:lang==="ar"?"القوة الحصانية":"Horsepower",get:vehicle=>value(vehicle,"Power")},
  {label:lang==="ar"?"عزم الدوران":"Torque",get:vehicle=>value(vehicle,"Torque")},
  {label:lang==="ar"?"المحرك / البطارية":"Engine / battery",get:engine},
  {label:lang==="ar"?"الدفع":"Drive",get:vehicle=>value(vehicle,"Drive")},
  {label:lang==="ar"?"ناقل الحركة":"Transmission",get:vehicle=>value(vehicle,"Transmission")},
  {label:lang==="ar"?"المقاعد":"Seats",get:vehicle=>value(vehicle,"Seats")},
  {label:lang==="ar"?"نوع الهيكل":"Body style",get:vehicle=>value(vehicle,"Body style")},
  {label:lang==="ar"?"اللون الخارجي":"Exterior colour",get:vehicle=>value(vehicle,"Exterior colour")},
  {label:lang==="ar"?"التجهيزات":"Equipment",get:vehicle=>{const list=equipmentFor(vehicle);return list.length?list.slice(0,6).map(feature=>feature.label[lang]).join(" · "):undefined;}}
 ];
 if(!ready||cars.length===0)return <><PageHeading lang={lang} view="compare"/><section className="v2-inventory v2-wrap"><div className="v2-empty v2-garage-empty"><Icon name="alphabet" size={42}/><h3>{g.compareEmptyTitle}</h3><p>{g.compareEmptyBody}</p><a className="v2-button v2-button-orange" href={pagePath("cars",lang)}>{g.browseCars}<Arrow/></a></div></section></>;
 return <><PageHeading lang={lang} view="compare"/><section className="v2-compare v2-wrap" aria-label={g.compareNow}>
  {cars.length<2&&<p className="v2-compare-hint" role="status">{g.compareOne} <a href={pagePath("cars",lang)}>{g.addMore}<Arrow/></a></p>}
  <div className="v2-compare-scroll" tabIndex={0} role="region" aria-label={g.compareNow}><table className="v2-compare-table" style={{["--v2-compare-cols" as string]:String(cars.length)}}>
   <thead><tr><td/>{cars.map(car=><th scope="col" key={car.id}><a className="v2-compare-photo" href={pagePath("car",lang,car.id)}><img src={cardSrc(car.image)} alt="" width="800" height="534" loading="lazy"/></a><a className="v2-compare-name" href={pagePath("car",lang,car.id)}><BrandLogo brand={car.brand}/><span>{car.brand} {car.name}</span></a><button type="button" className="v2-compare-remove" onClick={()=>toggleCompare(car.id)}>{g.removeCompare}</button></th>)}</tr></thead>
   <tbody>{rows.map(row=><tr key={row.label}><th scope="row">{row.label}</th>{cars.map(car=><td key={car.id}>{row.get(car)??"—"}</td>)}</tr>)}<tr><th scope="row"><span className="v2-visually-hidden">{t.enquire}</span></th>{cars.map(car=><td key={car.id}><a className="v2-button v2-button-orange v2-compare-enquire" href={whatsapp(modelMessage(car,lang))} target="_blank" rel="noopener noreferrer">{lang==="ar"?"واتساب":"WhatsApp"}<Arrow/></a></td>)}</tr></tbody>
  </table></div>
 </section></>;
}
export function AutoMallV2Page({lang,view="home",vehicleId:routeVehicleId}:{lang:Lang;view?:V2View;vehicleId?:string}){
 // This browser's admin edits load after hydration; the main area re-mounts when they change.
 const local=useLocalSiteData();
 const [localCarId,setLocalCarId]=useState<string|null>(null);
 useEffect(()=>{if(routeVehicleId==="local")setLocalCarId(new URLSearchParams(window.location.search).get("id"));},[routeVehicleId]);
 const waitingForLocalCar=routeVehicleId==="local"&&(!local.ready||localCarId===null);
 const vehicleId=routeVehicleId==="local"?localCarId??undefined:routeVehicleId;
 const t=copyV2[lang],n=navigationCopy[lang],l=legal[lang],page=useRef<HTMLDivElement>(null),[menu,setMenu]=useState(false),[filters,setFilters]=useState<CatalogFilters>({...defaultFilters});
 const closeMenu=useCallback(()=>setMenu(false),[]);
 const navViews=["home","cars","updates","contact"] as const;
 const updateFilters=(value:CatalogFilters)=>{setFilters(value);const search=filtersToSearch(value);window.history.replaceState(window.history.state,"",window.location.pathname+(search?"?"+search:"")+window.location.hash);};
 useEffect(()=>{const read=()=>setFilters(filtersFromSearch(new URLSearchParams(window.location.search)));read();window.addEventListener("popstate",read);return()=>window.removeEventListener("popstate",read);},[]);
 useEffect(()=>{const element=page.current;if(!element)return;const reduced=window.matchMedia("(prefers-reduced-motion: reduce)");const targets=Array.from(element.querySelectorAll<HTMLElement>("[data-reveal]"));for(const target of targets)if(reduced.matches||target.getBoundingClientRect().top<window.innerHeight)target.dataset.visible="true";element.dataset.ready="true";const observer=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){(entry.target as HTMLElement).dataset.visible="true";observer.unobserve(entry.target);}},{rootMargin:"60px",threshold:.08});for(const target of targets)observer.observe(target);return()=>observer.disconnect();},[view,local.version,waitingForLocalCar]);
 return <div ref={page} className="automall-v2" data-view={view} lang={lang} dir={lang==="ar"?"rtl":"ltr"}><script dangerouslySetInnerHTML={{__html:themeBootScript}}/><header className="v2-header"><a className="v2-brand" href={pagePath("home",lang)} aria-label={lang==="ar"?"أوتومول الرئيسية":"AutoMall home"}><img src={assetPath("assets/logo.jpg")} alt="AutoMall" width="42" height="42"/><span>AUTOMALL<small lang="ar">مجمع السيارات</small></span></a><nav className="v2-nav" aria-label={lang==="ar"?"التنقل الرئيسي":"Main navigation"}>{navViews.map(item=><a key={item} href={item==="cars"?withFilters(pagePath(item,lang),filters):pagePath(item,lang)} aria-current={view===item||view==="car"&&item==="cars"?"page":undefined} onClick={()=>setMenu(false)}>{n[item]}</a>)}</nav><div className="v2-header-actions"><a className="v2-language" href={withFilters(pagePath(view,lang==="en"?"ar":"en",vehicleId),filters)}>{lang==="en"?"العربية":"English"}</a><ThemeToggle lang={lang}/><a className="v2-search-shortcut" href={pagePath("cars",lang)+"#v2-search"} aria-label={t.search}><NavIcon name="search"/></a><a className="v2-header-chat" href={whatsapp(genericMessage(lang))} target="_blank" rel="noopener noreferrer">{lang==="ar"?"واتساب":"WhatsApp"}<Arrow/></a><HeaderMenu lang={lang} open={menu} onToggle={()=>setMenu(!menu)} onClose={closeMenu} savedHref={pagePath("saved",lang)} compareHref={pagePath("compare",lang)} pages={navViews.map(item=>({href:item==="cars"?withFilters(pagePath(item,lang),filters):pagePath(item,lang),label:n[item],current:view===item||view==="car"&&item==="cars"}))}/></div></header><main id="main-content" key={local.version}>{waitingForLocalCar?<p className="v2-local-wait v2-wrap" role="status">{lang==="ar"?"جارٍ التحميل…":"Loading…"}</p>:view==="home"?<HomePage lang={lang} filters={filters} onChange={updateFilters}/>:view==="cars"?<CatalogPage lang={lang} filters={filters} onChange={updateFilters}/>:view==="features"?<FeaturesPage lang={lang}/>:view==="updates"?<UpdatesPage lang={lang}/>:view==="contact"?<ContactPage lang={lang}/>:view==="saved"?<SavedPage lang={lang}/>:view==="compare"?<ComparePage lang={lang}/>:<DetailPage key={vehicleId} lang={lang} vehicleId={vehicleId} filters={filters}/>}</main><footer className="v2-footer v2-wrap"><div className="v2-footer-top"><a className="v2-footer-wordmark" href={pagePath("home",lang)}>AUTOMALL<span>JO</span></a><p>{t.footerLine}</p><div><a href={INSTAGRAM} target="_blank" rel="noopener noreferrer">Instagram<Arrow/></a><a href={FACEBOOK} target="_blank" rel="noopener noreferrer">Facebook<Arrow/></a></div></div><div className="v2-footer-bottom"><span>© 2026 AutoMall</span><nav aria-label={t.legal}><a href={pagePath("contact",lang)}>{n.contact}</a><a href={pagePath("features",lang)}>{n.features}</a><a href={pagePath("saved",lang)}>{garageCopy[lang].savedCars}</a><a href={pagePath("compare",lang)}>{garageCopy[lang].compareNow}</a><a href={sitePath("privacy",lang)}>{l.privacyTitle}</a><a href={sitePath("terms",lang)}>{l.termsTitle}</a><a href={sitePath("",lang)+"?v=scroll"}>{t.versionOne}</a></nav></div><p className="v2-trademark">{trademarkNotice(lang)}</p></footer>{view!=="compare"&&<CompareBar lang={lang} compareHref={pagePath("compare",lang)}/>}<AdminLauncher lang={lang} vehicleId={view==="car"?vehicleId:undefined}/><nav className="v2-mobile-bar" aria-label={lang==="ar"?"التنقل السريع":"Quick navigation"}>{(["home","cars","updates","contact"] as const).map(item=><a key={item} href={item==="cars"?withFilters(pagePath(item,lang),filters):pagePath(item,lang)} aria-current={view===item||view==="car"&&item==="cars"?"page":undefined}><NavIcon name={item}/><span>{n[item]}</span></a>)}</nav></div>;
}

import {useRef,useState,type KeyboardEvent,type ReactNode} from "react";
import {whatsapp,modelMessage,PHONE,type Lang,type Vehicle} from "@/site-data";
import {copyV2,dealerPosts,equipmentFor,specValue} from "@/v2-content";
import {bodyStyleFor,navigationCopy} from "@/v2-catalog";
import {BrandLogo} from "./brand-logo";
import {BodyStyleIcon} from "./body-style-icon";
import {VehicleFeatureIcon,type VehicleFeatureName} from "./vehicle-feature-icon";

export type V2VehicleDetailsProps={vehicle:Vehicle;lang:Lang;catalogHref:string;homeHref:string;languageHref?:string};
type DetailTile={label:string;value:string|undefined;icon:ReactNode;range?:boolean};
const detailCopy={
 en:{back:"Back to the collection",highlights:"Highlights",information:"Information",gallery:"Gallery",modelYear:"Model year",mileage:"Mileage",battery:"Battery",powertrain:"Powertrain",transmission:"Transmission",seats:"Seats",body:"Body type",condition:"Condition",enquire:"Enquire on WhatsApp",breadcrumb:"Breadcrumb",photoPicker:"Choose a vehicle photo"},
 ar:{back:"العودة إلى السيارات",highlights:"أبرز المواصفات",information:"المعلومات",gallery:"الصور",modelYear:"سنة الموديل",mileage:"المسافة المقطوعة",battery:"البطارية",powertrain:"نظام الحركة",transmission:"ناقل الحركة",seats:"المقاعد",body:"نوع الهيكل",condition:"الحالة",enquire:"استفسر عبر واتساب",breadcrumb:"مسار الصفحة",photoPicker:"اختر صورة للسيارة"}
};
const Arrow=()=> <span aria-hidden="true">↗</span>;
const FeatureIcon=({name}:{name:VehicleFeatureName})=><VehicleFeatureIcon name={name} size={22} className="vehicle-feature-icon"/>;
function DetailGlyph({name}:{name:"year"|"condition"}){
 return <svg className="vehicle-feature-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{name==="year"?<><rect x="4" y="5" width="16" height="16" rx="2"/><path d="M4 10h16M8 3v4m8-4v4M8 14h3m3 0h2M8 17h3"/></>:<path d="m12 3 2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.3-4.1 5.9-.9Z"/>}</svg>;
}
function DetailTiles({items,className}:{items:DetailTile[];className:string}){
 return <dl className={className}>{items.filter((item):item is DetailTile&{value:string}=>!!item.value).map(item=><div className={item.range?"v2-showcase-stat v2-range-panel":"v2-showcase-stat"} key={item.label}><dt><span>{item.label}</span>{item.icon}</dt><dd>{item.value}</dd></div>)}</dl>;
}

export function V2VehicleDetails({vehicle,lang,catalogHref,homeHref,languageHref}:V2VehicleDetailsProps){
 const t=copyV2[lang],n=navigationCopy[lang],d=detailCopy[lang];
 const [photoIndex,setPhotoIndex]=useState(0),[tab,setTab]=useState<"information"|"gallery">("information");
 const stage=useRef<HTMLDivElement>(null),thumbs=useRef<HTMLDivElement>(null),tabs=useRef<HTMLDivElement>(null);
 const images=[...new Set([vehicle.image,...(vehicle.gallery??[])])];
 const name=vehicle.brand+" "+vehicle.name;
 const facebook=dealerPosts.find(post=>post.vehicleIds.includes(vehicle.id));
 const price=vehicle.price?new Intl.NumberFormat(lang==="ar"?"ar-JO":"en-JO",{style:"currency",currency:"JOD",maximumFractionDigits:0}).format(vehicle.price.amount):null;
 const enquiryHref=whatsapp(modelMessage(vehicle,lang));
 const value=(label:string)=>specValue(vehicle,label)?.[lang];
 const stats:DetailTile[]=[
  vehicle.range?{label:t.range,value:vehicle.range[lang],icon:<FeatureIcon name="range"/>,range:true}:{label:d.modelYear,value:String(vehicle.year),icon:<DetailGlyph name="year"/>},
  {label:d.mileage,value:value("Mileage"),icon:<FeatureIcon name="mileage"/>},
  value("Battery (seller stated)")?{label:d.battery,value:value("Battery (seller stated)"),icon:<FeatureIcon name="battery"/>}:{label:d.powertrain,value:value("Fuel / powertrain"),icon:<FeatureIcon name={vehicle.categories.includes("electric")?"battery":vehicle.categories.includes("hybrid")?"hybrid":"engine"}/>}
 ];
 const highlights:DetailTile[]=[
  {label:d.transmission,value:value("Transmission"),icon:<FeatureIcon name="gearbox"/>},
  {label:d.seats,value:value("Seats"),icon:<FeatureIcon name="seats"/>},
  {label:d.body,value:value("Body style")??vehicle.type[lang],icon:<BodyStyleIcon name={bodyStyleFor(vehicle)}/>},
  {label:d.condition,value:value("Condition"),icon:<DetailGlyph name="condition"/>}
 ];
 const selectPhoto=(next:number,focusThumb=false)=>{const index=(next+images.length)%images.length;setPhotoIndex(index);if(focusThumb){const button=thumbs.current?.querySelectorAll<HTMLButtonElement>("button")[index];button?.focus();button?.scrollIntoView({block:"nearest",inline:"nearest",behavior:"instant"});}};
 const thumbnailKey=(event:KeyboardEvent<HTMLButtonElement>,index:number)=>{
  let next=index;
  if(event.key==="ArrowRight")next=index+(lang==="ar"?-1:1);
  else if(event.key==="ArrowLeft")next=index+(lang==="ar"?1:-1);
  else if(event.key==="ArrowDown")next=index+1;
  else if(event.key==="ArrowUp")next=index-1;
  else if(event.key==="Home")next=0;
  else if(event.key==="End")next=images.length-1;
  else return;
  event.preventDefault();selectPhoto(next,true);
 };
 const tabKey=(event:KeyboardEvent<HTMLButtonElement>,index:number)=>{
  let next=index;
  if(event.key==="ArrowRight")next=(index+(lang==="ar"?-1:1)+2)%2;
  else if(event.key==="ArrowLeft")next=(index+(lang==="ar"?1:-1)+2)%2;
  else if(event.key==="Home")next=0;
  else if(event.key==="End")next=1;
  else return;
  event.preventDefault();setTab(next===0?"information":"gallery");tabs.current?.querySelectorAll<HTMLButtonElement>("button")[next]?.focus();
 };
 const selectGalleryPhoto=(index:number)=>{setPhotoIndex(index);stage.current?.focus({preventScroll:true});stage.current?.scrollIntoView({block:"start",behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"instant":"smooth"});};
 return <section className="v2-detail-page v2-wrap v2-showcase">
  <nav className="v2-showcase-breadcrumb" aria-label={d.breadcrumb}><a href={homeHref}>{n.home}</a><span aria-hidden="true">/</span><a href={catalogHref}>{n.cars}</a><span aria-hidden="true">/</span><span>{name}</span></nav>
  <div className="v2-showcase-bar"><a className="v2-showcase-back" href={catalogHref}><span aria-hidden="true">{lang==="ar"?"→":"←"}</span>{d.back}</a><a className="v2-showcase-wordmark" href={homeHref} aria-label={lang==="ar"?"أوتومول الرئيسية":"AutoMall home"}>AUTOMALL</a><div className="v2-showcase-bar-actions">{languageHref&&<a className="v2-showcase-language" href={languageHref} aria-label={lang==="ar"?"التغيير إلى الإنجليزية":"Change language to Arabic"}>{lang==="ar"?"English":"العربية"}</a>}<a className="v2-showcase-visit" href={enquiryHref} target="_blank" rel="noopener noreferrer">{d.enquire}<Arrow/></a></div></div>
  <div className="v2-showcase-top">
   <div className="v2-showcase-title"><div className="v2-showcase-brand"><BrandLogo brand={vehicle.brand}/><span>{vehicle.brand}</span></div><h1 id="v2-detail-title" tabIndex={-1}>{name}</h1><p className="v2-showcase-meta">{vehicle.year} · {vehicle.type[lang]} · {vehicle.color[lang]}</p><p className="v2-showcase-price"><small>{price?t.priceLabel:""}</small><strong>{price??t.askPrice}</strong></p><div className="v2-showcase-actions"><a className="v2-button v2-button-orange" href={enquiryHref} target="_blank" rel="noopener noreferrer">{d.enquire}<Arrow/></a><a className="v2-text-link" href={"tel:"+PHONE}>{t.call}<Arrow/></a></div></div>
   <DetailTiles items={stats} className="v2-showcase-stats"/>
  </div>
  <div className="v2-showcase-stage">
   <div className="v2-showcase-main" ref={stage} tabIndex={-1} role="group" aria-label={t.gallery}><img className="v2-dialog-image" src={images[photoIndex]} alt={name+" "+vehicle.year+" — "+t.photo+" "+(photoIndex+1)} width="1600" height="1068" fetchPriority="high"/><a className="v2-showcase-full-photo" href={images[photoIndex]} target="_blank" rel="noopener noreferrer">{lang==="ar"?"عرض الصورة كاملة":"Open full photo"}<Arrow/></a><div className="v2-gallery-controls"><button type="button" aria-label={t.previousPhoto} onClick={()=>selectPhoto(photoIndex-1)}><span aria-hidden="true">{lang==="ar"?"›":"‹"}</span></button><span role="status" aria-live="polite">{t.photo} {photoIndex+1} {t.of} {images.length}</span><button type="button" aria-label={t.nextPhoto} onClick={()=>selectPhoto(photoIndex+1)}><span aria-hidden="true">{lang==="ar"?"‹":"›"}</span></button></div></div>
   <div className="v2-gallery-thumbs v2-showcase-thumbs" ref={thumbs} role="group" aria-label={d.photoPicker}>{images.map((image,index)=><button key={image} type="button" aria-pressed={photoIndex===index} aria-label={t.photo+" "+(index+1)+" "+t.of+" "+images.length} onClick={()=>selectPhoto(index)} onKeyDown={event=>thumbnailKey(event,index)}><img src={image} alt="" width="72" height="72" loading="lazy" decoding="async"/></button>)}</div>
  </div>
  <h2 className="v2-showcase-heading">{d.highlights}</h2><DetailTiles items={highlights} className="v2-showcase-highlights"/>
  <div className="v2-showcase-tabs" role="tablist" aria-label={name} ref={tabs}><button type="button" role="tab" id="v2-showcase-tab-information" aria-selected={tab==="information"} aria-controls="v2-showcase-panel-information" tabIndex={tab==="information"?0:-1} onClick={()=>setTab("information")} onKeyDown={event=>tabKey(event,0)}>{d.information}</button><button type="button" role="tab" id="v2-showcase-tab-gallery" aria-selected={tab==="gallery"} aria-controls="v2-showcase-panel-gallery" tabIndex={tab==="gallery"?0:-1} onClick={()=>setTab("gallery")} onKeyDown={event=>tabKey(event,1)}>{d.gallery} ({images.length})</button></div>
  <div className="v2-showcase-panel" role="tabpanel" id="v2-showcase-panel-information" aria-labelledby="v2-showcase-tab-information" tabIndex={0} hidden={tab!=="information"}><dl className="v2-showcase-specs">{vehicle.specs?.map(spec=><div key={spec.label.en}><dt>{spec.label[lang]}</dt><dd>{spec.value[lang]}</dd></div>)}</dl>{equipmentFor(vehicle).length>0&&<section className="v2-showcase-equipment"><h3>{t.equipmentTitleSmall}</h3><div>{equipmentFor(vehicle).map(feature=><div key={feature.id}><FeatureIcon name={feature.id}/><span>{feature.label[lang]}</span></div>)}</div></section>}<p className="v2-showcase-note">{t.detailNote}</p><div className="v2-showcase-sources"><a href={vehicle.post} target="_blank" rel="noopener noreferrer">{t.source}<Arrow/></a>{facebook&&<a href={facebook.url} target="_blank" rel="noopener noreferrer">{t.facebookSource}<Arrow/></a>}<a href={"tel:"+PHONE}>{t.call}<Arrow/></a></div></div>
  <div className="v2-showcase-panel" role="tabpanel" id="v2-showcase-panel-gallery" aria-labelledby="v2-showcase-tab-gallery" tabIndex={0} hidden={tab!=="gallery"}><ul className="v2-showcase-gallery">{images.map((image,index)=><li key={image}><button type="button" aria-label={t.photo+" "+(index+1)+" "+t.of+" "+images.length} onClick={()=>selectGalleryPhoto(index)}><img src={image} alt={name+" — "+t.photo+" "+(index+1)} width="800" height="600" loading="lazy" decoding="async"/></button></li>)}</ul></div>
 </section>;
}

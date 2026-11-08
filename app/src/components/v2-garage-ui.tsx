import {useEffect,useId,useMemo,useRef,useState} from "react";
import {findVehicle,whatsapp,type Lang,type Vehicle} from "@/site-data";
import {COMPARE_LIMIT,clearCompare,monthlyPayment,toggleCompare,toggleSaved,useCompareIds,useSavedIds} from "@/v2-garage";
import {thumbSrc} from "@/v2-content";
import {formatMoney,formatNumber,westernDigits} from "@/number-format";
import {DirectionArrow} from "./direction-arrow";

export const garageCopy={
 en:{save:"Save car",saved:"Saved",unsave:"Remove from saved",savedCars:"Saved cars",compare:"Compare",comparing:"In compare",addCompare:"Add to compare",removeCompare:"Remove from compare",compareFull:"You can compare up to "+COMPARE_LIMIT+" cars. Remove one to add another.",compareNow:"Compare cars",clear:"Clear",compareTray:"Cars to compare",
  calcTitle:"Estimate a monthly payment",calcBody:"Change the numbers to see a rough monthly instalment. This is an estimate only.",price:"Car price (JOD)",pricePlaceholder:"Enter the price",down:"Down payment",term:"Loan term",years:"years",year:"year",rate:"Annual rate (%)",monthly:"Estimated monthly payment",financed:"Amount financed",interest:"Total interest",total:"Total cost",calcNote:"An estimate using a standard reducing-balance loan. Real rates, terms and approval come from the bank or finance company. Ask the showroom about current finance offers.",askFinance:"Ask about finance",savedKicker:"AUTOMALL / SAVED",savedTitle:"Your saved cars.",savedBody:"Cars you save are kept in this browser, so you can come back to them any time.",savedEmptyTitle:"No saved cars yet.",savedEmptyBody:"Tap the heart on any car to keep it here.",browseCars:"Browse cars",compareKicker:"AUTOMALL / COMPARE",compareTitle:"Compare side by side.",compareBody:"Pick up to "+COMPARE_LIMIT+" cars to see their specifications next to each other.",compareEmptyTitle:"Nothing to compare yet.",compareEmptyBody:"Use the compare button on any car, then come back here.",compareOne:"Add at least one more car to compare.",addMore:"Add another car",noPrice:"This car has no advertised price. Enter the price the showroom gives you."},
 ar:{save:"احفظ السيارة",saved:"محفوظة",unsave:"إزالة من المحفوظة",savedCars:"السيارات المحفوظة",compare:"قارن",comparing:"في المقارنة",addCompare:"أضف للمقارنة",removeCompare:"إزالة من المقارنة",compareFull:"يمكنك مقارنة "+COMPARE_LIMIT+" سيارات كحد أقصى. أزل واحدة لإضافة أخرى.",compareNow:"قارن السيارات",clear:"مسح",compareTray:"سيارات للمقارنة",
  calcTitle:"احسب القسط الشهري التقريبي",calcBody:"غيّر الأرقام لترى قسطاً شهرياً تقريبياً. هذا تقدير فقط.",price:"سعر السيارة (دينار)",pricePlaceholder:"أدخل السعر",down:"الدفعة الأولى",term:"مدة التمويل",years:"سنوات",year:"سنة",rate:"نسبة الفائدة السنوية (%)",monthly:"القسط الشهري التقريبي",financed:"المبلغ الممول",interest:"مجموع الفوائد",total:"التكلفة الإجمالية",calcNote:"تقدير بحسب قرض متناقص الرصيد. النسب والمدد والموافقة الفعلية من البنك أو شركة التمويل. اسأل المعرض عن عروض التمويل الحالية.",askFinance:"اسأل عن التمويل",savedKicker:"أوتومول / المحفوظة",savedTitle:"سياراتك المحفوظة.",savedBody:"تُحفظ السيارات في هذا المتصفح لتعود إليها في أي وقت.",savedEmptyTitle:"لا توجد سيارات محفوظة بعد.",savedEmptyBody:"اضغط على القلب في أي سيارة لحفظها هنا.",browseCars:"تصفح السيارات",compareKicker:"أوتومول / المقارنة",compareTitle:"قارن جنباً إلى جنب.",compareBody:"اختر حتى "+COMPARE_LIMIT+" سيارات لترى مواصفاتها بجانب بعضها.",compareEmptyTitle:"لا توجد سيارات للمقارنة بعد.",compareEmptyBody:"استخدم زر المقارنة في أي سيارة ثم عد إلى هنا.",compareOne:"أضف سيارة أخرى على الأقل للمقارنة.",addMore:"أضف سيارة أخرى",noPrice:"لا يوجد سعر معلن لهذه السيارة. أدخل السعر الذي يعطيك إياه المعرض."}
};
const money=formatMoney;

function Heart({filled}:{filled:boolean}){return <svg width="20" height="20" viewBox="0 0 24 24" fill={filled?"currentColor":"none"} stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" aria-hidden="true"><path d="M12 20s-7.5-4.6-9-9.4C2 7.2 4.3 4.5 7.3 4.5c2 0 3.5 1.1 4.7 2.8 1.2-1.7 2.7-2.8 4.7-2.8 3 0 5.3 2.7 4.3 6.1C19.5 15.4 12 20 12 20Z"/></svg>;}
export function CompareGlyph(){return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="4" width="7" height="16" rx="1.6"/><rect x="14" y="4" width="7" height="16" rx="1.6"/><path d="M5.5 8h2m-2 3h2m9-3h2m-2 3h2"/></svg>;}

export function SaveButton({vehicle,lang,withLabel=false}:{vehicle:Vehicle;lang:Lang;withLabel?:boolean}){
 const g=garageCopy[lang],saved=useSavedIds().includes(vehicle.id);
 return <button type="button" className={withLabel?"v2-garage-button v2-garage-button-label":"v2-garage-button"} aria-pressed={saved} aria-label={(saved?g.unsave:g.save)+": "+vehicle.brand+" "+vehicle.name} title={saved?g.unsave:g.save} data-kind="save" onClick={()=>toggleSaved(vehicle.id)}><Heart filled={saved}/>{withLabel&&<span>{saved?g.saved:g.save}</span>}</button>;
}
export function CompareButton({vehicle,lang,withLabel=false}:{vehicle:Vehicle;lang:Lang;withLabel?:boolean}){
 const g=garageCopy[lang],ids=useCompareIds(),active=ids.includes(vehicle.id),full=!active&&ids.length>=COMPARE_LIMIT,[warn,setWarn]=useState(false);
 useEffect(()=>{if(!warn)return;const timer=window.setTimeout(()=>setWarn(false),3200);return()=>window.clearTimeout(timer);},[warn]);
 return <span className="v2-compare-wrap"><button type="button" className={withLabel?"v2-garage-button v2-garage-button-label":"v2-garage-button"} aria-pressed={active} aria-label={(active?g.removeCompare:g.addCompare)+": "+vehicle.brand+" "+vehicle.name} title={full?g.compareFull:active?g.removeCompare:g.addCompare} data-kind="compare" data-full={full||undefined} onClick={()=>{if(!toggleCompare(vehicle.id))setWarn(true);}}><CompareGlyph/>{withLabel&&<span>{active?g.comparing:g.compare}</span>}</button>{warn&&<span className="v2-compare-warning" role="status">{g.compareFull}</span>}</span>;
}

export function CompareBar({lang,compareHref}:{lang:Lang;compareHref:string}){
 const g=garageCopy[lang],ids=useCompareIds();
 const cars=ids.map(id=>findVehicle(id)).filter((item):item is Vehicle=>!!item);
 if(cars.length===0)return null;
 return <aside className="v2-compare-bar" aria-label={g.compareTray}>
  <ul>{cars.map(car=><li key={car.id}><img src={thumbSrc(car.image)} alt="" width="54" height="36"/><span>{car.brand} {car.name}</span><button type="button" aria-label={g.removeCompare+": "+car.brand+" "+car.name} onClick={()=>toggleCompare(car.id)}>×</button></li>)}{Array.from({length:COMPARE_LIMIT-cars.length},(_,index)=><li key={"empty"+index} className="v2-compare-slot" aria-hidden="true"><CompareGlyph/></li>)}</ul>
  <div className="v2-compare-bar-actions"><button type="button" className="v2-compare-clear" onClick={clearCompare}>{g.clear}</button><a className="v2-button v2-button-orange" href={compareHref+"?cars="+cars.map(car=>car.id).join(",")} aria-disabled={cars.length<2||undefined}>{g.compareNow} ({cars.length})<DirectionArrow kind="outward"/></a></div>
 </aside>;
}

/**
 * The menu button in the header's corner: every page of the site, then Favourites and Compare (with counts).
 */
export function HeaderMenu({lang,open,onToggle,onClose,savedHref,compareHref,pages}:{lang:Lang;open:boolean;onToggle:()=>void;onClose:()=>void;savedHref:string;compareHref:string;pages:{href:string;label:string;current:boolean}[]}){
 const g=garageCopy[lang],saved=useSavedIds().filter(id=>!!findVehicle(id)).length,compared=useCompareIds().filter(id=>!!findVehicle(id)).length;
 const box=useRef<HTMLDivElement>(null),panelId=useId();
 useEffect(()=>{
  if(!open)return;
  const outside=(event:PointerEvent)=>{if(box.current&&!box.current.contains(event.target as Node))onClose();};
  const escape=(event:KeyboardEvent)=>{if(event.key==="Escape"){onClose();box.current?.querySelector<HTMLButtonElement>(".v2-menu")?.focus();}};
  document.addEventListener("pointerdown",outside);document.addEventListener("keydown",escape);
  return()=>{document.removeEventListener("pointerdown",outside);document.removeEventListener("keydown",escape);};
 },[open,onClose]);
 const words=lang==="ar"?{menu:"القائمة",close:"إغلاق القائمة",favourites:"المفضلة",pages:"صفحات الموقع"}:{menu:"Menu",close:"Close menu",favourites:"Favourites",pages:"Site pages"};
 return <div className="v2-menu-wrap" ref={box}>
  <button className="v2-menu" type="button" aria-expanded={open} aria-controls={panelId} aria-label={open?words.close:words.menu+(saved?" · "+words.favourites+" ("+saved+")":"")} onClick={onToggle}>
   {open?<span aria-hidden="true">×</span>:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>}
   {!open&&saved>0&&<span className="v2-menu-dot" aria-hidden="true"/>}
  </button>
  <div className="v2-menu-panel" id={panelId} hidden={!open}>
   <nav className="v2-menu-pages" aria-label={words.pages}>{pages.map(page=><a key={page.href} href={page.href} aria-current={page.current?"page":undefined} onClick={onClose}>{page.label}</a>)}</nav>
   <a className="v2-menu-item" href={savedHref} onClick={onClose}><Heart filled={saved>0}/><span>{words.favourites}</span>{saved>0&&<b>{saved}</b>}</a>
   <a className="v2-menu-item" href={compareHref} onClick={onClose}><CompareGlyph/><span>{g.compare}</span>{compared>0&&<b>{compared}</b>}</a>
  </div>
 </div>;
}

export function PaymentCalculator({vehicle,lang}:{vehicle?:Vehicle;lang:Lang}){
 const g=garageCopy[lang],id=useId();
 const [price,setPrice]=useState(vehicle?.price?formatNumber(vehicle.price.amount):""),[down,setDown]=useState(20),[years,setYears]=useState(5),[rate,setRate]=useState("5");
 const amount=Math.max(0,Number(westernDigits(price).replace(/[^\d.]/g,""))||0),rateValue=Math.min(30,Math.max(0,Number(rate)||0));
 const financed=amount*(1-down/100),monthly=monthlyPayment(financed,rateValue,years),total=monthly*years*12+amount*down/100,interest=Math.max(0,monthly*years*12-financed);
 const message=useMemo(()=>lang==="ar"
  ?"مرحباً أوتومول، أود الاستفسار عن تمويل "+(vehicle?vehicle.brand+" "+vehicle.name+" "+vehicle.year:"سيارة من معرضكم")+(amount?" بسعر "+money(amount,lang)+" ودفعة أولى "+down+"% لمدة "+years+" "+g.years:"")+". ما هي عروض التمويل المتاحة؟"
  :"Hello AutoMall, I would like to ask about finance for "+(vehicle?"the "+vehicle.year+" "+vehicle.brand+" "+vehicle.name:"a car at your showroom")+(amount?" at "+money(amount,lang)+" with "+down+"% down over "+years+" years":"")+". What finance offers are available?",[lang,vehicle,amount,down,years,g.years]);
 return <section className="v2-calculator" aria-labelledby={id+"-title"}>
  <div className="v2-calculator-intro"><h2 id={id+"-title"}>{g.calcTitle}</h2><p>{!vehicle||vehicle.price?g.calcBody:g.noPrice}</p></div>
  <div className="v2-calculator-body">
   <div className="v2-calculator-fields">
    <label className="v2-calc-field"><span>{g.price}</span><input type="text" inputMode="numeric" dir="ltr" placeholder={g.pricePlaceholder} value={price} onChange={event=>setPrice(westernDigits(event.target.value).replace(/[^\d.,]/g,""))} onBlur={()=>{if(amount)setPrice(formatNumber(amount));}}/></label>
    <label className="v2-calc-field"><span>{g.down} <strong><bdi dir="ltr">{down}%</bdi>{amount>0&&<> · <bdi>{money(amount*down/100,lang)}</bdi></>}</strong></span><input type="range" dir="ltr" min="0" max="60" step="5" value={down} onChange={event=>setDown(Number(event.target.value))} aria-valuetext={down+"%"}/></label>
    <div className="v2-calc-field"><span id={id+"-term"}>{g.term}</span><div className="v2-calc-years" role="radiogroup" aria-labelledby={id+"-term"}>{[1,2,3,4,5,6,7].map(value=><button type="button" role="radio" key={value} aria-checked={years===value} tabIndex={years===value?0:-1} aria-label={value+" "+(value===1?g.year:g.years)} onKeyDown={event=>{let next=value;if(event.key==="ArrowRight")next=Math.min(7,Math.max(1,value+(lang==="ar"?-1:1)));else if(event.key==="ArrowLeft")next=Math.min(7,Math.max(1,value+(lang==="ar"?1:-1)));else if(event.key==="Home")next=1;else if(event.key==="End")next=7;else return;event.preventDefault();setYears(next);event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>("button")[next-1]?.focus();}} onClick={()=>setYears(value)}>{value}</button>)}</div><small>{years} {years===1?g.year:g.years}</small></div>
    <label className="v2-calc-field"><span>{g.rate}</span><input type="number" inputMode="decimal" dir="ltr" min="0" max="30" step="0.25" value={rate} onChange={event=>setRate(event.target.value)}/></label>
   </div>
   <div className="v2-calculator-result" aria-live="polite">
    <p className="v2-calc-monthly"><small>{g.monthly}</small><strong><bdi>{amount?money(monthly,lang):"—"}</bdi></strong></p>
    <dl><div><dt>{g.financed}</dt><dd><bdi>{amount?money(financed,lang):"—"}</bdi></dd></div><div><dt>{g.interest}</dt><dd><bdi>{amount?money(interest,lang):"—"}</bdi></dd></div><div><dt>{g.total}</dt><dd><bdi>{amount?money(total,lang):"—"}</bdi></dd></div></dl>
    <a className="v2-button v2-button-orange" href={whatsapp(message)} target="_blank" rel="noopener noreferrer">{g.askFinance}<DirectionArrow kind="outward"/></a>
   </div>
  </div>
  <p className="v2-calculator-note">{g.calcNote}</p>
 </section>;
}

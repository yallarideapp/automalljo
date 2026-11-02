import {useCallback,useEffect,useMemo,useRef,useState,type ReactNode} from "react";
import catalogData from "@/catalog-data.json";
import {mergeInventory,type AdminData,type VehicleRecord,type VehicleStatus} from "@/inventory";
import type {OpeningDay,SiteSettings} from "@/site-data";
import {assetPath,sitePath} from "@/site-paths";
import {thumbSrc} from "@/v2-content";
import {GitHubError,checkAccess,commitFiles,deployState,fileSha,readJson,REPO,type DeployState} from "@/admin/github";
import {bodyOptions,buildVehicle,colourOptions,conditionOptions,driveOptions,emptyForm,formProblems,marketOptions,powerOptions,preparePhoto,quickEdit,quickFormFor,statusOptions,transmissionOptions,type CarForm,type QuickForm} from "@/admin/vehicle-form";

type Lang="en"|"ar";
const catalog=catalogData as VehicleRecord[];
const ADMIN_FILE="src/admin-data.json",SETTINGS_FILE="src/site-settings.json";
const KEY_STORE="automall-admin-key",LANG_STORE="automall-admin-lang",DRAFT_STORE="automall-admin-draft";
const tryStorage=<T,>(fn:()=>T,fallback:T)=>{try{return fn();}catch{return fallback;}};
const clone=<T,>(value:T):T=>JSON.parse(JSON.stringify(value)) as T;
const pretty=(value:unknown)=>JSON.stringify(value,null,2)+"\n";
const days:OpeningDay["day"][]=["sat","sun","mon","tue","wed","thu","fri"];

const copy={
 en:{title:"AutoMall admin",close:"Close",viewSite:"View website",signOut:"Sign out",lang:"العربية",
  signTitle:"Sign in to manage the website",signBody:"The admin panel saves straight to the website's GitHub repository. Each staff member uses their own GitHub access key.",
  step1:"On GitHub, open Settings → Developer settings → Fine-grained tokens, and choose Generate new token.",step1Link:"Open the token page",
  step2:"Repository access: choose Only select repositories, then "+REPO.owner+"/"+REPO.repo+".",
  step3:"Permissions → Repository → Contents: Read and write. Optionally Actions: Read-only, to watch the site update.",
  step4:"Generate the token, copy it and paste it below. Treat it like a password.",
  keyLabel:"GitHub access key",remember:"Keep me signed in on this device",signIn:"Sign in",checking:"Checking…",
  badKey:"This key isn't valid or has expired. Create a new one and try again.",noRepo:"This key can't see the website. Under Repository access, choose "+REPO.owner+"/"+REPO.repo+".",
  loading:"Loading the latest website data…",loadFailed:"Couldn't load the website data.",retry:"Try again",
  tabs:{cars:"Cars",homepage:"Homepage",showroom:"Showroom info",publish:"Publish"},
  search:"Search by brand, model or year",all:"All",hiddenFilter:"Hidden",addCar:"Add a car",edit:"Edit",hide:"Hide from site",show:"Show on site",remove:"Delete",
  added:"Added",edited:"Edited",hidden:"Hidden",noPrice:"No price",carsCount:(n:number)=>n+" cars",
  status:"Status",price:"Price (JOD)",pricePh:"Leave empty for “Enquire for price”",
  newCar:"Add a car",editCar:"Edit car",editListing:"Edit dealer listing",listingNote:"This car comes from the dealer's OpenSooq listing, so its photos and most specifications stay as listed. You can change the price, status and the details below.",
  save:"Save changes",cancel:"Cancel",deleteCar:"Delete this car",confirmDelete:"Delete this car from the website? Its photos are removed too.",
  basics:"The car",performance:"Power and range",bodyAndColour:"Body and colour",selling:"Selling",photos:"Photos",
  brand:"Brand",model:"Model",year:"Model year",trim:"Trim / edition",condition:"Condition",mileage:"Mileage (km)",powertrain:"Powertrain",engine:"Engine",enginePh:"e.g. 2.0L turbo petrol",
  battery:"Battery (kWh)",range:"Advertised range (km)",cycle:"Range test",cyclePh:"e.g. WLTP or CLTC",power:"Horsepower (hp)",torque:"Torque (Nm)",
  body:"Body style",seats:"Seats",transmission:"Transmission",drive:"Drive",exterior:"Exterior colour",interior:"Interior colour",market:"Specification",premium:"Show under Premium",
  descriptionEn:"Description (English)",descriptionAr:"Description (Arabic)",descriptionPh:"Optional. A short line is written for you if empty.",none:"—",
  addPhotos:"Add photos",photoHint:"The first photo is the cover. Photos are resized to 1600 px before upload.",cover:"Cover",moveEarlier:"Move earlier",moveLater:"Move later",removePhoto:"Remove photo",preparing:"Preparing photos…",
  bannerTitle:"Banner cars",bannerBody:"The large photos at the top of the homepage. Choose 1 to 6 cars, in order.",featuredTitle:"Featured cars",featuredBody:"The cars under “A few to get you started”. Choose up to 12.",
  pick:"Add a car",pickPh:"Search cars to add",up:"Move up",down:"Move down",takeOut:"Remove",unlisted:"Hidden or sold, so it won't show",
  contact:"Contact",phone:"Phone number",phoneHint:"With country code, e.g. +962799050000",whatsappNumber:"WhatsApp number",whatsappHint:"Digits only, with country code, e.g. 962799050000",
  address:"Street address",city:"City",addressEn:"English",addressAr:"Arabic",mapsQuery:"Map search text",mapsHint:"What Google Maps searches for to place the pin.",instagram:"Instagram link",facebook:"Facebook link",
  hoursTitle:"Opening hours",hoursBody:"Leave empty to show “Call to confirm opening hours”.",addHours:"Add opening hours",clearHours:"Remove opening hours",closed:"Closed",opens:"Opens",closes:"Closes",copyFirst:"Copy Saturday to every day",
  dayNames:{sat:"Saturday",sun:"Sunday",mon:"Monday",tue:"Tuesday",wed:"Wednesday",thu:"Thursday",fri:"Friday"} as Record<OpeningDay["day"],string>,
  publishTitle:"Publish your changes",publishBody:"Publishing saves everything to GitHub. The website then rebuilds itself, which takes about 2–3 minutes.",
  nothing:"No unpublished changes.",changes:(n:number)=>n===1?"1 change":n+" changes",publish:"Publish to website",publishing:"Publishing…",discard:"Discard all changes",confirmDiscard:"Discard every unpublished change?",
  problemsTitle:"Fix these before publishing",published:"Published. The website is rebuilding.",deployQueued:"Waiting to start…",deployRunning:"Building the website…",deployDone:"Done. The changes are live.",deployFailed:"The rebuild failed. Your changes are saved; open the build log to see why.",deployUnknown:"Check back in 2–3 minutes. (Add Actions: Read-only to your key to see progress here.)",buildLog:"Open the build log",
  conflict:"Someone else published changes since you opened the admin panel. Reload to get the latest version, then make your changes again.",reload:"Reload latest",
  unsaved:"You have unpublished changes.",leaveWarning:"You have unpublished changes and photos. Publish before closing this page.",
  ch:{carAdded:"Added",carChanged:"Changed",carDeleted:"Deleted",listingEdited:"Edited listing",listingReset:"Reset listing",shown:"Shown again",hiddenCar:"Hidden",settings:"Showroom info",banner:"Banner cars",featured:"Featured cars",photosUp:"photos to upload",photosDel:"photos to delete"},
 },
 ar:{title:"لوحة تحكم أوتومول",close:"إغلاق",viewSite:"عرض الموقع",signOut:"تسجيل الخروج",lang:"English",
  signTitle:"سجّل الدخول لإدارة الموقع",signBody:"تحفظ لوحة التحكم التغييرات مباشرة في مستودع الموقع على GitHub. يستخدم كل موظف مفتاح الوصول الخاص به.",
  step1:"في GitHub افتح Settings ← Developer settings ← Fine-grained tokens واختر Generate new token.",step1Link:"افتح صفحة المفاتيح",
  step2:"Repository access: اختر Only select repositories ثم "+REPO.owner+"/"+REPO.repo+".",
  step3:"Permissions ← Repository ← Contents: Read and write. ويمكنك إضافة Actions: Read-only لمتابعة تحديث الموقع.",
  step4:"أنشئ المفتاح وانسخه والصقه في الأسفل. تعامل معه ككلمة مرور.",
  keyLabel:"مفتاح وصول GitHub",remember:"إبقائي مسجلاً على هذا الجهاز",signIn:"تسجيل الدخول",checking:"جارٍ التحقق…",
  badKey:"هذا المفتاح غير صالح أو منتهي. أنشئ مفتاحاً جديداً وحاول مرة أخرى.",noRepo:"لا يستطيع هذا المفتاح الوصول إلى الموقع. اختر "+REPO.owner+"/"+REPO.repo+" في Repository access.",
  loading:"جارٍ تحميل أحدث بيانات الموقع…",loadFailed:"تعذّر تحميل بيانات الموقع.",retry:"حاول مرة أخرى",
  tabs:{cars:"السيارات",homepage:"الصفحة الرئيسية",showroom:"معلومات المعرض",publish:"النشر"},
  search:"ابحث بالعلامة أو الموديل أو السنة",all:"الكل",hiddenFilter:"مخفية",addCar:"أضف سيارة",edit:"تعديل",hide:"إخفاء من الموقع",show:"إظهار في الموقع",remove:"حذف",
  added:"مضافة",edited:"معدّلة",hidden:"مخفية",noPrice:"بدون سعر",carsCount:(n:number)=>n+" سيارة",
  status:"الحالة",price:"السعر (دينار)",pricePh:"اتركه فارغاً لعرض «استفسر عن السعر»",
  newCar:"أضف سيارة",editCar:"تعديل السيارة",editListing:"تعديل إعلان المعرض",listingNote:"هذه السيارة من إعلان المعرض على السوق المفتوح، لذلك تبقى صورها ومعظم مواصفاتها كما هي. يمكنك تغيير السعر والحالة والتفاصيل أدناه.",
  save:"حفظ التغييرات",cancel:"إلغاء",deleteCar:"حذف هذه السيارة",confirmDelete:"حذف هذه السيارة من الموقع؟ ستُحذف صورها أيضاً.",
  basics:"السيارة",performance:"القوة والمدى",bodyAndColour:"الهيكل واللون",selling:"البيع",photos:"الصور",
  brand:"العلامة التجارية",model:"الموديل",year:"سنة الموديل",trim:"الفئة / الإصدار",condition:"الحالة",mileage:"المسافة المقطوعة (كم)",powertrain:"نظام الحركة",engine:"المحرك",enginePh:"مثال: 2.0L تيربو بنزين",
  battery:"البطارية (كيلوواط/ساعة)",range:"المدى المعلن (كم)",cycle:"دورة القياس",cyclePh:"مثال: WLTP أو CLTC",power:"القوة (حصان)",torque:"العزم (نيوتن متر)",
  body:"نوع الهيكل",seats:"المقاعد",transmission:"ناقل الحركة",drive:"نظام الدفع",exterior:"اللون الخارجي",interior:"لون المقصورة",market:"المواصفات",premium:"إظهارها ضمن الفاخرة",
  descriptionEn:"الوصف (بالإنجليزية)",descriptionAr:"الوصف (بالعربية)",descriptionPh:"اختياري. يُكتب سطر قصير تلقائياً إذا تُرك فارغاً.",none:"—",
  addPhotos:"أضف صوراً",photoHint:"الصورة الأولى هي صورة الغلاف. تُصغّر الصور إلى 1600 بكسل قبل الرفع.",cover:"الغلاف",moveEarlier:"تقديم",moveLater:"تأخير",removePhoto:"إزالة الصورة",preparing:"جارٍ تجهيز الصور…",
  bannerTitle:"سيارات البانر",bannerBody:"الصور الكبيرة أعلى الصفحة الرئيسية. اختر من 1 إلى 6 سيارات بالترتيب.",featuredTitle:"السيارات المختارة",featuredBody:"السيارات تحت «سيارات مختارة». اختر حتى 12 سيارة.",
  pick:"أضف سيارة",pickPh:"ابحث عن سيارة لإضافتها",up:"للأعلى",down:"للأسفل",takeOut:"إزالة",unlisted:"مخفية أو مباعة فلن تظهر",
  contact:"التواصل",phone:"رقم الهاتف",phoneHint:"مع رمز الدولة، مثال: ‎+962799050000",whatsappNumber:"رقم واتساب",whatsappHint:"أرقام فقط مع رمز الدولة، مثال: 962799050000",
  address:"العنوان",city:"المدينة",addressEn:"بالإنجليزية",addressAr:"بالعربية",mapsQuery:"نص البحث في الخريطة",mapsHint:"ما يبحث عنه Google Maps لتحديد الموقع.",instagram:"رابط إنستغرام",facebook:"رابط فيسبوك",
  hoursTitle:"أوقات الدوام",hoursBody:"اتركها فارغة لعرض «اتصل لتأكيد أوقات الدوام».",addHours:"أضف أوقات الدوام",clearHours:"إزالة أوقات الدوام",closed:"مغلق",opens:"يفتح",closes:"يغلق",copyFirst:"نسخ أوقات السبت لكل الأيام",
  dayNames:{sat:"السبت",sun:"الأحد",mon:"الاثنين",tue:"الثلاثاء",wed:"الأربعاء",thu:"الخميس",fri:"الجمعة"} as Record<OpeningDay["day"],string>,
  publishTitle:"انشر تغييراتك",publishBody:"يحفظ النشر كل شيء في GitHub، ثم يُعاد بناء الموقع تلقائياً خلال 2–3 دقائق تقريباً.",
  nothing:"لا توجد تغييرات غير منشورة.",changes:(n:number)=>n===1?"تغيير واحد":n+" تغييرات",publish:"انشر على الموقع",publishing:"جارٍ النشر…",discard:"تجاهل كل التغييرات",confirmDiscard:"تجاهل كل التغييرات غير المنشورة؟",
  problemsTitle:"أصلح هذه قبل النشر",published:"تم النشر. يُعاد بناء الموقع الآن.",deployQueued:"بانتظار البدء…",deployRunning:"جارٍ بناء الموقع…",deployDone:"تم. التغييرات ظاهرة على الموقع.",deployFailed:"فشل إعادة البناء. تغييراتك محفوظة؛ افتح سجل البناء لمعرفة السبب.",deployUnknown:"تحقق بعد 2–3 دقائق. (أضف Actions: Read-only لمفتاحك لمتابعة التقدم هنا.)",buildLog:"افتح سجل البناء",
  conflict:"نشر شخص آخر تغييرات منذ فتحت لوحة التحكم. أعد التحميل للحصول على أحدث نسخة ثم أعد تغييراتك.",reload:"إعادة التحميل",
  unsaved:"لديك تغييرات غير منشورة.",leaveWarning:"لديك تغييرات وصور غير منشورة. انشرها قبل إغلاق الصفحة.",
  ch:{carAdded:"أضيفت",carChanged:"عُدّلت",carDeleted:"حُذفت",listingEdited:"تعديل إعلان",listingReset:"إرجاع إعلان",shown:"أُظهرت",hiddenCar:"أُخفيت",settings:"معلومات المعرض",banner:"سيارات البانر",featured:"السيارات المختارة",photosUp:"صور للرفع",photosDel:"صور للحذف"},
 }
};
type Copy=typeof copy.en;

type Base={admin:AdminData;settings:SiteSettings;adminSha:string;settingsSha:string};
type Upload={bytes:Uint8Array;url:string};
type Editing={kind:"new"}|{kind:"added";id:string}|{kind:"listing";id:string}|null;
const option=(lang:Lang,list:{key:string;en:string;ar:string}[],value:string)=>list.find(item=>item.key===value)?.[lang]??value;
const label=(car:VehicleRecord)=>car.brand+" "+car.name+" · "+car.year;

/** Embedded mode: the same panel opened over the website from the corner button. */
export type AdminEmbed={lang:Lang;onClose:()=>void;vehicleId?:string};
export function AdminApp({embed}:{embed?:AdminEmbed}={}){
 const [lang,setLang]=useState<Lang>(embed?.lang??"en");
 const [token,setToken]=useState<string|null>(null);
 const [ready,setReady]=useState(false);
 const embedded=!!embed;
 useEffect(()=>{if(!embedded)setLang(tryStorage(()=>localStorage.getItem(LANG_STORE)==="ar"?"ar":"en",lang));setToken(tryStorage(()=>localStorage.getItem(KEY_STORE)??sessionStorage.getItem(KEY_STORE),null));setReady(true);},[embedded]);
 useEffect(()=>{if(!embedded)tryStorage(()=>localStorage.setItem(LANG_STORE,lang),undefined);},[lang,embedded]);
 const t=copy[lang];
 const signOut=useCallback(()=>{tryStorage(()=>{localStorage.removeItem(KEY_STORE);sessionStorage.removeItem(KEY_STORE);},undefined);setToken(null);},[]);
 const brand=<><img src={assetPath("assets/logo.jpg")} alt="" width="34" height="34"/><span>{t.title}</span></>;
 return <div className="am-admin" lang={lang} dir={lang==="ar"?"rtl":"ltr"}>
  <header className="am-admin-header">{embed?<div className="am-admin-brand" id="am-admin-title">{brand}</div>:<a className="am-admin-brand" href={sitePath("v2")}>{brand}</a>}<div className="am-admin-header-actions"><button type="button" className="am-link-button" onClick={()=>setLang(lang==="en"?"ar":"en")}>{t.lang}</button>{!embed&&<a className="am-link-button" href={sitePath("v2")} target="_blank" rel="noopener noreferrer">{t.viewSite} ↗</a>}{token&&<button type="button" className="am-link-button" onClick={signOut}>{t.signOut}</button>}{embed&&<button type="button" className="am-button am-small am-admin-close" onClick={embed.onClose} aria-label={t.close}><span className="am-close-label">{t.close}</span><span aria-hidden="true">×</span></button>}</div></header>
  <main className="am-admin-main" id={embed?"am-admin-main":"main-content"}>{!ready?null:token?<Workspace key={token} token={token} lang={lang} onSignOut={signOut} focusVehicleId={embed?.vehicleId}/>:<SignIn lang={lang} onSignedIn={setToken}/>}</main>
 </div>;
}

function SignIn({lang,onSignedIn}:{lang:Lang;onSignedIn:(token:string)=>void}){
 const t=copy[lang],[key,setKey]=useState(""),[remember,setRemember]=useState(true),[busy,setBusy]=useState(false),[error,setError]=useState("");
 const submit=async()=>{
  const value=key.trim();if(!value)return;
  setBusy(true);setError("");
  try{await checkAccess(value);tryStorage(()=>(remember?localStorage:sessionStorage).setItem(KEY_STORE,value),undefined);onSignedIn(value);}
  catch(caught){setError(caught instanceof GitHubError?(caught.status===401?t.badKey:caught.status===404?t.noRepo:caught.message):String(caught));}
  finally{setBusy(false);}
 };
 return <section className="am-card am-signin" aria-labelledby="am-signin-title">
  <h1 id="am-signin-title">{t.signTitle}</h1><p className="am-muted">{t.signBody}</p>
  <ol className="am-steps"><li>{t.step1} <a href="https://github.com/settings/personal-access-tokens/new" target="_blank" rel="noopener noreferrer">{t.step1Link} ↗</a></li><li>{t.step2}</li><li>{t.step3}</li><li>{t.step4}</li></ol>
  <form onSubmit={event=>{event.preventDefault();void submit();}}>
   <label className="am-field"><span>{t.keyLabel}</span><input type="password" autoComplete="off" dir="ltr" spellCheck={false} value={key} onChange={event=>setKey(event.target.value)} placeholder="github_pat_…" required/></label>
   <label className="am-check"><input type="checkbox" checked={remember} onChange={event=>setRemember(event.target.checked)}/><span>{t.remember}</span></label>
   {error&&<p className="am-error" role="alert">{error}</p>}
   <button className="am-button am-primary" type="submit" disabled={busy||!key.trim()}>{busy?t.checking:t.signIn}</button>
  </form>
 </section>;
}

function Workspace({token,lang,onSignOut,focusVehicleId}:{token:string;lang:Lang;onSignOut:()=>void;focusVehicleId?:string}){
 const t=copy[lang];
 const [base,setBase]=useState<Base|null>(null),[loadError,setLoadError]=useState("");
 const [admin,setAdmin]=useState<AdminData|null>(null),[settings,setSettings]=useState<SiteSettings|null>(null);
 const [uploads,setUploads]=useState<Record<string,Upload>>({}),[deletions,setDeletions]=useState<string[]>([]);
 const [tab,setTab]=useState<"cars"|"homepage"|"showroom"|"publish">("cars"),[editing,setEditing]=useState<Editing>(null);
 const signOutRef=useRef(onSignOut);signOutRef.current=onSignOut;
 const load=useCallback(async(keepDraft:boolean)=>{
  setLoadError("");setBase(null);
  try{
   const [a,s]=await Promise.all([readJson<AdminData>(token,ADMIN_FILE),readJson<SiteSettings>(token,SETTINGS_FILE)]);
   const next={admin:a.data,settings:s.data,adminSha:a.sha,settingsSha:s.sha};
   setBase(next);
   const saved=keepDraft?tryStorage(()=>JSON.parse(localStorage.getItem(DRAFT_STORE)??"null") as {adminSha:string;settingsSha:string;admin:AdminData;settings:SiteSettings}|null,null):null;
   if(saved&&saved.adminSha===a.sha&&saved.settingsSha===s.sha){setAdmin(saved.admin);setSettings(saved.settings);}else{setAdmin(clone(a.data));setSettings(clone(s.data));tryStorage(()=>localStorage.removeItem(DRAFT_STORE),undefined);}
   setUploads({});setDeletions([]);
  }catch(caught){if(caught instanceof GitHubError&&caught.status===401){signOutRef.current();return;}setLoadError(caught instanceof Error?caught.message:String(caught));}
 },[token]);
 useEffect(()=>{void load(true);},[load]);
 // Opened from a car page: go straight to that car's editor once the data is in.
 const focused=useRef(false);
 useEffect(()=>{if(focused.current||!admin||!focusVehicleId)return;focused.current=true;if(admin.cars.some(car=>car.id===focusVehicleId))setEditing({kind:"added",id:focusVehicleId});else if(catalog.some(car=>car.id===focusVehicleId))setEditing({kind:"listing",id:focusVehicleId});},[admin,focusVehicleId]);
 // Keep text-only drafts across reloads; photos waiting to upload live in memory only.
 useEffect(()=>{if(!base||!admin||!settings)return;if(Object.keys(uploads).length)return;tryStorage(()=>localStorage.setItem(DRAFT_STORE,JSON.stringify({adminSha:base.adminSha,settingsSha:base.settingsSha,admin,settings})),undefined);},[base,admin,settings,uploads]);
 const pending=!!base&&!!admin&&!!settings&&(pretty(admin)!==pretty(base.admin)||pretty(settings)!==pretty(base.settings)||Object.keys(uploads).length>0||deletions.length>0);
 useEffect(()=>{if(!pending)return;const warn=(event:BeforeUnloadEvent)=>{if(Object.keys(uploads).length){event.preventDefault();event.returnValue="";}};window.addEventListener("beforeunload",warn);return()=>window.removeEventListener("beforeunload",warn);},[pending,uploads]);
 if(loadError)return <section className="am-card"><p className="am-error" role="alert">{t.loadFailed} {loadError}</p><button className="am-button" type="button" onClick={()=>void load(true)}>{t.retry}</button></section>;
 if(!base||!admin||!settings)return <p className="am-muted am-loading" role="status">{t.loading}</p>;
 const photoSrc=(path:string,small=true)=>uploads[path]?.url??assetPath((small&&path.startsWith("/assets/catalog/")?thumbSrc(path):path).replace(/^\//,""));
 const ctx={lang,t,admin,setAdmin,settings,setSettings,uploads,setUploads,deletions,setDeletions,photoSrc,base};
 return <>
  {pending&&tab!=="publish"&&<div className="am-banner" role="status"><span>{t.unsaved}</span><button type="button" className="am-button am-primary am-small" onClick={()=>{setEditing(null);setTab("publish");}}>{t.tabs.publish}</button></div>}
  <nav className="am-tabs" role="tablist" aria-label={t.title}>{(["cars","homepage","showroom","publish"] as const).map(id=><button key={id} type="button" role="tab" aria-selected={tab===id} onClick={()=>{setEditing(null);setTab(id);}}>{t.tabs[id]}{id==="publish"&&pending&&<span className="am-dot" aria-hidden="true"/>}</button>)}</nav>
  {tab==="cars"&&(editing?<CarEditor ctx={ctx} editing={editing} onDone={()=>setEditing(null)}/>:<CarList ctx={ctx} onEdit={setEditing}/>)}
  {tab==="homepage"&&<HomepageTab ctx={ctx}/>}
  {tab==="showroom"&&<ShowroomTab ctx={ctx}/>}
  {tab==="publish"&&<PublishTab ctx={ctx} token={token} pending={pending} onReload={()=>void load(false)} onPublished={next=>{setBase(next);setUploads({});setDeletions([]);tryStorage(()=>localStorage.removeItem(DRAFT_STORE),undefined);}}/>}
 </>;
}
type Ctx={lang:Lang;t:Copy;admin:AdminData;setAdmin:(value:AdminData)=>void;settings:SiteSettings;setSettings:(value:SiteSettings)=>void;uploads:Record<string,Upload>;setUploads:(value:Record<string,Upload>)=>void;deletions:string[];setDeletions:(value:string[])=>void;photoSrc:(path:string,small?:boolean)=>string;base:Base};

function useInventory(admin:AdminData){
 return useMemo(()=>{
  const hidden=new Set(admin.hidden),merged=mergeInventory(catalog,{...admin,hidden:[]});
  return merged.map(car=>({car,hidden:hidden.has(car.id),added:admin.cars.some(item=>item.id===car.id),edited:!!admin.edits[car.id]}));
 },[admin]);
}

function CarList({ctx,onEdit}:{ctx:Ctx;onEdit:(value:Editing)=>void}){
 const {t,lang,admin,setAdmin}=ctx,[query,setQuery]=useState(""),[filter,setFilter]=useState<"all"|VehicleStatus|"hidden">("all");
 const rows=useInventory(admin);
 const needle=query.trim().toLowerCase();
 const shown=rows.filter(row=>(filter==="all"||(filter==="hidden"?row.hidden:!row.hidden&&(row.car.status??"available")===filter))&&(!needle||label(row.car).toLowerCase().includes(needle)));
 const setStatus=(row:typeof rows[number],status:VehicleStatus)=>{
  if(status==="sold")dropFromHomepage(ctx,row.car.id);
  if(row.added){setAdmin({...admin,cars:admin.cars.map(car=>car.id===row.car.id?{...car,status,form:{...(car.form??{}),status}}:car)});return;}
  const original=catalog.find(car=>car.id===row.car.id)!;
  const form={...quickFormFor(applyCurrent(original,admin)),status};
  setListingEdit(ctx,original,form);
 };
 const toggleHidden=(id:string)=>{if(!admin.hidden.includes(id))dropFromHomepage(ctx,id);setAdmin({...admin,hidden:admin.hidden.includes(id)?admin.hidden.filter(item=>item!==id):[...admin.hidden,id]});};
 return <section aria-label={t.tabs.cars}>
  <div className="am-toolbar"><input className="am-input" type="search" value={query} onChange={event=>setQuery(event.target.value)} placeholder={t.search} aria-label={t.search}/><select className="am-input am-select" value={filter} onChange={event=>setFilter(event.target.value as typeof filter)} aria-label={t.status}><option value="all">{t.all}</option>{statusOptions.map(item=><option key={item.key} value={item.key}>{item[lang]}</option>)}<option value="hidden">{t.hiddenFilter}</option></select><button className="am-button am-primary" type="button" onClick={()=>onEdit({kind:"new"})}>+ {t.addCar}</button></div>
  <p className="am-muted am-count">{t.carsCount(shown.length)}</p>
  <ul className="am-car-list">{shown.map(row=><li key={row.car.id} className="am-car-row" data-hidden={row.hidden||undefined}>
   <img src={ctx.photoSrc(row.car.image)} alt="" width="96" height="64" loading="lazy"/>
   <div className="am-car-main"><strong>{row.car.brand} {row.car.name}</strong><span className="am-muted">{row.car.year} · {row.car.price?row.car.price.amount.toLocaleString("en-US")+" JOD":t.noPrice}</span><span className="am-chips">{row.added&&<span className="am-chip">{t.added}</span>}{row.edited&&<span className="am-chip">{t.edited}</span>}{row.hidden&&<span className="am-chip am-chip-warn">{t.hidden}</span>}</span></div>
   <select className="am-input am-select am-status" value={row.car.status??"available"} onChange={event=>setStatus(row,event.target.value as VehicleStatus)} aria-label={t.status+": "+row.car.brand+" "+row.car.name} data-status={row.car.status??"available"}>{statusOptions.map(item=><option key={item.key} value={item.key}>{item[lang]}</option>)}</select>
   <div className="am-row-actions"><button className="am-button am-small" type="button" onClick={()=>onEdit(row.added?{kind:"added",id:row.car.id}:{kind:"listing",id:row.car.id})}>{t.edit}</button>{!row.added&&<button className="am-button am-small am-ghost" type="button" onClick={()=>toggleHidden(row.car.id)}>{row.hidden?t.show:t.hide}</button>}</div>
  </li>)}</ul>
 </section>;
}
/** A sold or hidden car is taken off the homepage banner and featured lists. */
function dropFromHomepage(ctx:Ctx,id:string){const {settings,setSettings}=ctx;if(settings.bannerCars.includes(id)||settings.featuredCars.includes(id))setSettings({...settings,bannerCars:settings.bannerCars.filter(item=>item!==id),featuredCars:settings.featuredCars.filter(item=>item!==id)});}
const applyCurrent=(original:VehicleRecord,admin:AdminData)=>mergeInventory([original],{...admin,cars:[],hidden:[]})[0];
function setListingEdit(ctx:Ctx,original:VehicleRecord,form:QuickForm){
 const edit=quickEdit(original,form),edits={...ctx.admin.edits};
 if(edit)edits[original.id]=edit;else delete edits[original.id];
 ctx.setAdmin({...ctx.admin,edits});
}

function Field({label:text,hint,children,wide}:{label:string;hint?:string;children:ReactNode;wide?:boolean}){return <label className={wide?"am-field am-wide":"am-field"}><span>{text}</span>{children}{hint&&<small>{hint}</small>}</label>;}
function Select({value,onChange,options,lang,empty}:{value:string;onChange:(value:string)=>void;options:{key:string;en:string;ar:string}[];lang:Lang;empty?:string}){return <select className="am-input am-select" value={value} onChange={event=>onChange(event.target.value)}>{empty!==undefined&&<option value="">{empty}</option>}{options.map(item=><option key={item.key} value={item.key}>{item[lang]}</option>)}</select>;}

function CarEditor({ctx,editing,onDone}:{ctx:Ctx;editing:Exclude<Editing,null>;onDone:()=>void}){
 if(editing.kind==="listing")return <ListingEditor ctx={ctx} id={editing.id} onDone={onDone}/>;
 return <AddedCarEditor ctx={ctx} id={editing.kind==="added"?editing.id:null} onDone={onDone}/>;
}

function ListingEditor({ctx,id,onDone}:{ctx:Ctx;id:string;onDone:()=>void}){
 const {t,lang}=ctx,original=catalog.find(car=>car.id===id)!;
 const [form,setForm]=useState<QuickForm>(()=>quickFormFor(applyCurrent(original,ctx.admin)));
 const set=<K extends keyof QuickForm>(key:K,value:QuickForm[K])=>setForm(previous=>({...previous,[key]:value}));
 return <section className="am-card am-editor" aria-labelledby="am-editor-title">
  <div className="am-editor-head"><img src={ctx.photoSrc(original.image)} alt="" width="120" height="80"/><div><h2 id="am-editor-title">{t.editListing}</h2><p>{label(original)}</p></div></div>
  <p className="am-note">{t.listingNote}</p>
  <div className="am-grid">
   <Field label={t.price}><input className="am-input" inputMode="numeric" dir="ltr" value={form.price} onChange={event=>set("price",event.target.value.replace(/[^\d]/g,""))} placeholder={t.pricePh}/></Field>
   <Field label={t.status}><Select lang={lang} value={form.status} onChange={value=>set("status",value as VehicleStatus)} options={statusOptions}/></Field>
   <Field label={t.condition}><Select lang={lang} value={form.condition} onChange={value=>set("condition",value)} options={conditionOptions}/></Field>
   <Field label={t.mileage}><input className="am-input" inputMode="numeric" dir="ltr" value={form.mileage} onChange={event=>set("mileage",event.target.value.replace(/[^\d]/g,""))}/></Field>
   <Field label={t.power}><input className="am-input" inputMode="numeric" dir="ltr" value={form.power} onChange={event=>set("power",event.target.value.replace(/[^\d]/g,""))}/></Field>
   <Field label={t.torque}><input className="am-input" inputMode="numeric" dir="ltr" value={form.torque} onChange={event=>set("torque",event.target.value.replace(/[^\d]/g,""))}/></Field>
   <Field label={t.exterior}><Select lang={lang} value={form.exterior} onChange={value=>set("exterior",value)} options={colourOptions} empty={t.none}/></Field>
   <Field label={t.descriptionEn} wide><textarea className="am-input" dir="ltr" rows={2} value={form.descriptionEn} onChange={event=>set("descriptionEn",event.target.value)}/></Field>
   <Field label={t.descriptionAr} wide><textarea className="am-input" dir="rtl" rows={2} value={form.descriptionAr} onChange={event=>set("descriptionAr",event.target.value)}/></Field>
  </div>
  <div className="am-editor-actions"><button className="am-button am-primary" type="button" onClick={()=>{if(form.status==="sold")dropFromHomepage(ctx,original.id);setListingEdit(ctx,original,form);onDone();}}>{t.save}</button><button className="am-button am-ghost" type="button" onClick={onDone}>{t.cancel}</button></div>
 </section>;
}

function AddedCarEditor({ctx,id,onDone}:{ctx:Ctx;id:string|null;onDone:()=>void}){
 const {t,lang,admin,setAdmin,uploads,setUploads,deletions,setDeletions,settings,setSettings}=ctx;
 const existing=id?admin.cars.find(car=>car.id===id):undefined;
 const carId=useRef(id??newCarId(admin)).current;
 const [form,setForm]=useState<CarForm>(()=>({...emptyForm(),...(existing?.form as Partial<CarForm>|undefined)}));
 const [photos,setPhotos]=useState<string[]>(()=>existing?[...new Set([existing.image,...(existing.gallery??[])])]:[]);
 const [localUploads,setLocalUploads]=useState<Record<string,Upload>>({}),[removed,setRemoved]=useState<string[]>([]);
 const [busy,setBusy]=useState(false),[problems,setProblems]=useState<string[]>([]);
 const set=<K extends keyof CarForm>(key:K,value:CarForm[K])=>setForm(previous=>({...previous,[key]:value}));
 const src=(path:string)=>localUploads[path]?.url??ctx.photoSrc(path,false);
 const addFiles=async(files:FileList|null)=>{
  if(!files?.length)return;setBusy(true);
  const next={...localUploads},list=[...photos];
  try{for(const [index,file] of Array.from(files).entries()){const photo=await preparePhoto(file);const path="/assets/uploads/upload-"+carId+"-"+Date.now().toString(36)+index+"."+photo.ext;next[path]={bytes:photo.bytes,url:photo.url};list.push(path);}}
  catch(caught){setProblems([caught instanceof Error?caught.message:String(caught)]);}
  setLocalUploads(next);setPhotos(list);setBusy(false);
 };
 const move=(index:number,step:number)=>{const list=[...photos];const [item]=list.splice(index,1);list.splice(index+step,0,item);setPhotos(list);};
 const dropPhoto=(path:string)=>{setPhotos(photos.filter(item=>item!==path));if(localUploads[path]||uploads[path]){const next={...localUploads};delete next[path];setLocalUploads(next);}else setRemoved([...removed,path]);};
 const save=()=>{
  const issues=formProblems(form,photos.length,lang);setProblems(issues);if(issues.length)return;
  const record=buildVehicle(form,carId,photos,existing?.addedAt??new Date().toISOString());
  const cars=existing?admin.cars.map(car=>car.id===carId?record:car):[record,...admin.cars];
  setAdmin({...admin,cars});
  if(form.status==="sold")dropFromHomepage(ctx,carId);
  const merged={...uploads};for(const [path,upload] of Object.entries(localUploads))merged[path]=upload;for(const path of Object.keys(merged))if(path.includes("upload-"+carId+"-")&&!photos.includes(path))delete merged[path];setUploads(merged);
  setDeletions([...new Set([...deletions,...removed.filter(path=>!uploads[path])])]);
  onDone();
 };
 const remove=()=>{
  if(!existing||!window.confirm(t.confirmDelete))return;
  const published=[...new Set([existing.image,...(existing.gallery??[])])].filter(path=>!uploads[path]);
  const edits={...admin.edits};delete edits[carId];
  setAdmin({...admin,cars:admin.cars.filter(car=>car.id!==carId),edits,hidden:admin.hidden.filter(item=>item!==carId)});
  const kept={...uploads};for(const path of Object.keys(kept))if(path.includes("upload-"+carId+"-"))delete kept[path];setUploads(kept);
  setDeletions([...new Set([...deletions,...published])]);
  setSettings({...settings,bannerCars:settings.bannerCars.filter(item=>item!==carId),featuredCars:settings.featuredCars.filter(item=>item!==carId)});
  onDone();
 };
 const electric=form.powertrain==="electric";
 const numberInput=(key:keyof CarForm)=><input className="am-input" inputMode="numeric" dir="ltr" value={form[key] as string} onChange={event=>set(key,event.target.value.replace(/[^\d.]/g,"") as never)}/>;
 return <section className="am-card am-editor" aria-labelledby="am-editor-title">
  <h2 id="am-editor-title">{existing?t.editCar:t.newCar}</h2>
  <fieldset><legend>{t.photos}</legend><p className="am-muted">{t.photoHint}</p>
   <ul className="am-photos">{photos.map((path,index)=><li key={path}><img src={src(path)} alt="" width="160" height="107"/>{index===0&&<span className="am-chip am-cover">{t.cover}</span>}<div><button type="button" className="am-icon-button" aria-label={t.moveEarlier} disabled={index===0} onClick={()=>move(index,-1)}>{lang==="ar"?"→":"←"}</button><button type="button" className="am-icon-button" aria-label={t.moveLater} disabled={index===photos.length-1} onClick={()=>move(index,1)}>{lang==="ar"?"←":"→"}</button><button type="button" className="am-icon-button" aria-label={t.removePhoto} onClick={()=>dropPhoto(path)}>×</button></div></li>)}
    <li className="am-photo-add"><label><input type="file" accept="image/*" multiple onChange={event=>{void addFiles(event.target.files);event.target.value="";}} disabled={busy}/><span>{busy?t.preparing:"+ "+t.addPhotos}</span></label></li></ul>
  </fieldset>
  <fieldset><legend>{t.basics}</legend><div className="am-grid">
   <Field label={t.brand}><input className="am-input" value={form.brand} onChange={event=>set("brand",event.target.value)} placeholder="BYD" required/></Field>
   <Field label={t.model}><input className="am-input" value={form.model} onChange={event=>set("model",event.target.value)} placeholder="Seal" required/></Field>
   <Field label={t.year}><input className="am-input" inputMode="numeric" dir="ltr" maxLength={4} value={form.year} onChange={event=>set("year",event.target.value.replace(/\D/g,""))}/></Field>
   <Field label={t.trim}><input className="am-input" value={form.trim} onChange={event=>set("trim",event.target.value)}/></Field>
   <Field label={t.condition}><Select lang={lang} value={form.condition} onChange={value=>set("condition",value)} options={conditionOptions}/></Field>
   <Field label={t.mileage}>{numberInput("mileage")}</Field>
   <Field label={t.market}><Select lang={lang} value={form.market} onChange={value=>set("market",value)} options={marketOptions} empty={t.none}/></Field>
  </div></fieldset>
  <fieldset><legend>{t.performance}</legend><div className="am-grid">
   <Field label={t.powertrain}><Select lang={lang} value={form.powertrain} onChange={value=>set("powertrain",value)} options={powerOptions}/></Field>
   {!electric&&<Field label={t.engine}><input className="am-input" dir="ltr" value={form.engine} onChange={event=>set("engine",event.target.value)} placeholder={t.enginePh}/></Field>}
   <Field label={t.power}>{numberInput("power")}</Field>
   <Field label={t.torque}>{numberInput("torque")}</Field>
   {form.powertrain!=="petrol"&&form.powertrain!=="diesel"&&<Field label={t.battery}>{numberInput("battery")}</Field>}
   {electric&&<Field label={t.range}>{numberInput("range")}</Field>}
   {electric&&<Field label={t.cycle}><input className="am-input" dir="ltr" value={form.rangeCycle} onChange={event=>set("rangeCycle",event.target.value)} placeholder={t.cyclePh}/></Field>}
   <Field label={t.drive}><Select lang={lang} value={form.drive} onChange={value=>set("drive",value)} options={driveOptions} empty={t.none}/></Field>
   <Field label={t.transmission}><Select lang={lang} value={form.transmission} onChange={value=>set("transmission",value)} options={transmissionOptions} empty={t.none}/></Field>
  </div></fieldset>
  <fieldset><legend>{t.bodyAndColour}</legend><div className="am-grid">
   <Field label={t.body}><Select lang={lang} value={form.body} onChange={value=>set("body",value)} options={bodyOptions}/></Field>
   <Field label={t.seats}>{numberInput("seats")}</Field>
   <Field label={t.exterior}><Select lang={lang} value={form.exterior} onChange={value=>set("exterior",value)} options={colourOptions} empty={t.none}/></Field>
   <Field label={t.interior}><Select lang={lang} value={form.interior} onChange={value=>set("interior",value)} options={colourOptions} empty={t.none}/></Field>
  </div></fieldset>
  <fieldset><legend>{t.selling}</legend><div className="am-grid">
   <Field label={t.price}><input className="am-input" inputMode="numeric" dir="ltr" value={form.price} onChange={event=>set("price",event.target.value.replace(/[^\d]/g,""))} placeholder={t.pricePh}/></Field>
   <Field label={t.status}><Select lang={lang} value={form.status} onChange={value=>set("status",value as VehicleStatus)} options={statusOptions}/></Field>
   <label className="am-check am-wide"><input type="checkbox" checked={form.premium} onChange={event=>set("premium",event.target.checked)}/><span>{t.premium}</span></label>
   <Field label={t.descriptionEn} wide><textarea className="am-input" dir="ltr" rows={2} value={form.descriptionEn} onChange={event=>set("descriptionEn",event.target.value)} placeholder={t.descriptionPh}/></Field>
   <Field label={t.descriptionAr} wide><textarea className="am-input" dir="rtl" rows={2} value={form.descriptionAr} onChange={event=>set("descriptionAr",event.target.value)} placeholder={t.descriptionPh}/></Field>
  </div></fieldset>
  {problems.length>0&&<ul className="am-error" role="alert">{problems.map(problem=><li key={problem}>{problem}</li>)}</ul>}
  <div className="am-editor-actions"><button className="am-button am-primary" type="button" disabled={busy} onClick={save}>{t.save}</button><button className="am-button am-ghost" type="button" onClick={onDone}>{t.cancel}</button>{existing&&<button className="am-button am-danger" type="button" onClick={remove}>{t.deleteCar}</button>}</div>
 </section>;
}
function newCarId(admin:AdminData){
 const taken=new Set([...catalog.map(car=>car.id),...admin.cars.map(car=>car.id)]);
 let id="";do{id="9"+String(Date.now()+Math.floor(Math.random()*1000)).slice(-8);}while(taken.has(id));
 return id;
}

function CarPickerList({ctx,title,body,ids,max,onChange}:{ctx:Ctx;title:string;body:string;ids:string[];max:number;onChange:(ids:string[])=>void}){
 const {t,admin}=ctx,rows=useInventory(admin),[query,setQuery]=useState("");
 const listed=(id:string)=>rows.some(row=>row.car.id===id&&!row.hidden&&row.car.status!=="sold");
 const needle=query.trim().toLowerCase();
 const matches=needle?rows.filter(row=>!row.hidden&&row.car.status!=="sold"&&!ids.includes(row.car.id)&&label(row.car).toLowerCase().includes(needle)).slice(0,8):[];
 const move=(index:number,step:number)=>{const list=[...ids];const [item]=list.splice(index,1);list.splice(index+step,0,item);onChange(list);};
 return <section className="am-card" aria-label={title}><h2>{title} <small className="am-muted">{ids.length} / {max}</small></h2><p className="am-muted">{body}</p>
  <ol className="am-pick-list">{ids.map((id,index)=>{const row=rows.find(item=>item.car.id===id);return <li key={id} data-problem={!listed(id)||undefined}>{row&&<img src={ctx.photoSrc(row.car.image)} alt="" width="72" height="48"/>}<span>{row?label(row.car):id}{!listed(id)&&<small className="am-warn">{t.unlisted}</small>}</span><div><button type="button" className="am-icon-button" aria-label={t.up} disabled={index===0} onClick={()=>move(index,-1)}>↑</button><button type="button" className="am-icon-button" aria-label={t.down} disabled={index===ids.length-1} onClick={()=>move(index,1)}>↓</button><button type="button" className="am-icon-button" aria-label={t.takeOut} onClick={()=>onChange(ids.filter(item=>item!==id))}>×</button></div></li>;})}</ol>
  {ids.length<max&&<div className="am-picker"><input className="am-input" type="search" value={query} onChange={event=>setQuery(event.target.value)} placeholder={t.pickPh} aria-label={t.pick}/>{matches.length>0&&<ul>{matches.map(row=><li key={row.car.id}><button type="button" onClick={()=>{onChange([...ids,row.car.id]);setQuery("");}}><img src={ctx.photoSrc(row.car.image)} alt="" width="54" height="36"/>{label(row.car)}</button></li>)}</ul>}</div>}
 </section>;
}
function HomepageTab({ctx}:{ctx:Ctx}){
 const {t,settings,setSettings}=ctx;
 return <div className="am-stack">
  <CarPickerList ctx={ctx} title={t.bannerTitle} body={t.bannerBody} ids={settings.bannerCars} max={6} onChange={ids=>setSettings({...settings,bannerCars:ids})}/>
  <CarPickerList ctx={ctx} title={t.featuredTitle} body={t.featuredBody} ids={settings.featuredCars} max={12} onChange={ids=>setSettings({...settings,featuredCars:ids})}/>
 </div>;
}

function ShowroomTab({ctx}:{ctx:Ctx}){
 const {t,settings,setSettings}=ctx;
 const set=<K extends keyof SiteSettings>(key:K,value:SiteSettings[K])=>setSettings({...settings,[key]:value});
 const setDay=(day:OpeningDay["day"],patch:Partial<OpeningDay>)=>set("hours",settings.hours.map(item=>item.day===day?{...item,...patch}:item));
 return <div className="am-stack">
  <section className="am-card"><h2>{t.contact}</h2><div className="am-grid">
   <Field label={t.phone} hint={t.phoneHint}><input className="am-input" dir="ltr" inputMode="tel" value={settings.phone} onChange={event=>set("phone",event.target.value)}/></Field>
   <Field label={t.whatsappNumber} hint={t.whatsappHint}><input className="am-input" dir="ltr" inputMode="numeric" value={settings.whatsapp} onChange={event=>set("whatsapp",event.target.value.replace(/\D/g,""))}/></Field>
   <Field label={t.address+" · "+t.addressEn}><input className="am-input" dir="ltr" value={settings.address.en} onChange={event=>set("address",{...settings.address,en:event.target.value})}/></Field>
   <Field label={t.address+" · "+t.addressAr}><input className="am-input" dir="rtl" value={settings.address.ar} onChange={event=>set("address",{...settings.address,ar:event.target.value})}/></Field>
   <Field label={t.city+" · "+t.addressEn}><input className="am-input" dir="ltr" value={settings.city.en} onChange={event=>set("city",{...settings.city,en:event.target.value})}/></Field>
   <Field label={t.city+" · "+t.addressAr}><input className="am-input" dir="rtl" value={settings.city.ar} onChange={event=>set("city",{...settings.city,ar:event.target.value})}/></Field>
   <Field label={t.mapsQuery} hint={t.mapsHint} wide><input className="am-input" dir="ltr" value={settings.mapsQuery} onChange={event=>set("mapsQuery",event.target.value)}/></Field>
   <Field label={t.instagram}><input className="am-input" dir="ltr" type="url" value={settings.instagram} onChange={event=>set("instagram",event.target.value)}/></Field>
   <Field label={t.facebook}><input className="am-input" dir="ltr" type="url" value={settings.facebook} onChange={event=>set("facebook",event.target.value)}/></Field>
  </div></section>
  <section className="am-card"><h2>{t.hoursTitle}</h2><p className="am-muted">{t.hoursBody}</p>
   {settings.hours.length===0?<button className="am-button" type="button" onClick={()=>set("hours",days.map(day=>({day,closed:day==="fri",open:"10:00",close:"21:00"})))}>+ {t.addHours}</button>:<>
    <table className="am-hours"><tbody>{days.map(day=>{const item=settings.hours.find(entry=>entry.day===day)??{day,closed:true};return <tr key={day}><th scope="row">{t.dayNames[day]}</th><td><label className="am-check"><input type="checkbox" checked={!!item.closed} onChange={event=>setDay(day,{closed:event.target.checked})}/><span>{t.closed}</span></label></td><td><label className="am-time"><span>{t.opens}</span><input className="am-input" type="time" value={item.open??""} disabled={!!item.closed} onChange={event=>setDay(day,{open:event.target.value})}/></label></td><td><label className="am-time"><span>{t.closes}</span><input className="am-input" type="time" value={item.close??""} disabled={!!item.closed} onChange={event=>setDay(day,{close:event.target.value})}/></label></td></tr>;})}</tbody></table>
    <div className="am-editor-actions"><button className="am-button am-small" type="button" onClick={()=>{const first=settings.hours.find(item=>item.day==="sat");if(first)set("hours",days.map(day=>({...first,day})));}}>{t.copyFirst}</button><button className="am-button am-small am-ghost" type="button" onClick={()=>set("hours",[])}>{t.clearHours}</button></div>
   </>}
  </section>
 </div>;
}

function changeList(ctx:Ctx){
 const {t,admin,settings,base,uploads,deletions}=ctx,lines:string[]=[];
 const before=new Map(base.admin.cars.map(car=>[car.id,car])),after=new Map(admin.cars.map(car=>[car.id,car]));
 for(const [id,car] of after){const old=before.get(id);if(!old)lines.push(t.ch.carAdded+": "+label(car));else if(pretty(old)!==pretty(car))lines.push(t.ch.carChanged+": "+label(car));}
 for(const [id,car] of before)if(!after.has(id))lines.push(t.ch.carDeleted+": "+label(car));
 const name=(id:string)=>{const car=catalog.find(item=>item.id===id)??after.get(id)??before.get(id);return car?label(car):id;};
 for(const id of new Set([...Object.keys(base.admin.edits),...Object.keys(admin.edits)]))if(pretty(base.admin.edits[id]??null)!==pretty(admin.edits[id]??null))lines.push((admin.edits[id]?t.ch.listingEdited:t.ch.listingReset)+": "+name(id));
 for(const id of admin.hidden)if(!base.admin.hidden.includes(id))lines.push(t.ch.hiddenCar+": "+name(id));
 for(const id of base.admin.hidden)if(!admin.hidden.includes(id))lines.push(t.ch.shown+": "+name(id));
 if(pretty(settings.bannerCars)!==pretty(base.settings.bannerCars))lines.push(t.ch.banner);
 if(pretty(settings.featuredCars)!==pretty(base.settings.featuredCars))lines.push(t.ch.featured);
 const {bannerCars:_a,featuredCars:_b,...rest}=settings,{bannerCars:_c,featuredCars:_d,...restBefore}=base.settings;
 if(pretty(rest)!==pretty(restBefore))lines.push(t.ch.settings);
 const up=Object.keys(uploads).length,del=deletions.length;
 if(up)lines.push(up+" "+t.ch.photosUp);if(del)lines.push(del+" "+t.ch.photosDel);
 return lines;
}
function publishProblems(ctx:Ctx){
 const {lang,admin,settings}=ctx,problems:string[]=[],tr=(en:string,ar:string)=>lang==="ar"?ar:en;
 const inventory=mergeInventory(catalog,admin),listed=(id:string)=>inventory.some(car=>car.id===id&&car.status!=="sold");
 if(settings.bannerCars.filter(listed).length<1)problems.push(tr("Choose at least one banner car that is on sale.","اختر سيارة واحدة على الأقل للبانر معروضة للبيع."));
 for(const id of [...settings.bannerCars,...settings.featuredCars])if(!listed(id)){problems.push(tr("Remove hidden or sold cars from the homepage lists.","أزل السيارات المخفية أو المباعة من قوائم الصفحة الرئيسية."));break;}
 if(!/^\+?\d{9,15}$/.test(settings.phone.replace(/[\s-]/g,"")))problems.push(tr("Check the phone number.","تحقق من رقم الهاتف."));
 if(!/^\d{9,15}$/.test(settings.whatsapp))problems.push(tr("Check the WhatsApp number.","تحقق من رقم واتساب."));
 for(const key of ["address","city"] as const)if(!settings[key].en.trim()||!settings[key].ar.trim())problems.push(tr("Fill in the address and city in both languages.","أكمل العنوان والمدينة باللغتين."));
 if(!/^https:\/\//.test(settings.instagram)||!/^https:\/\//.test(settings.facebook))problems.push(tr("Social links must start with https://","يجب أن تبدأ روابط التواصل بـ https://"));
 for(const day of settings.hours)if(!day.closed&&(!/^\d{2}:\d{2}$/.test(day.open??"")||!/^\d{2}:\d{2}$/.test(day.close??""))){problems.push(tr("Give every open day an opening and closing time.","حدد وقت الفتح والإغلاق لكل يوم دوام."));break;}
 return [...new Set(problems)];
}
function PublishTab({ctx,token,pending,onReload,onPublished}:{ctx:Ctx;token:string;pending:boolean;onReload:()=>void;onPublished:(base:Base)=>void}){
 const {t,admin,settings,base,uploads,deletions}=ctx;
 const [busy,setBusy]=useState(false),[error,setError]=useState(""),[conflict,setConflict]=useState(false),[commit,setCommit]=useState<{sha:string;url:string}|null>(null),[deploy,setDeploy]=useState<DeployState|null>(null);
 const lines=changeList(ctx),problems=publishProblems(ctx);
 useEffect(()=>{if(!commit)return;let stop=false;const poll=async()=>{const state=await deployState(token,commit.sha);if(stop)return;setDeploy(state);if(state.status!=="completed"&&state.status!=="unknown")timer=window.setTimeout(poll,10000);};let timer=window.setTimeout(poll,4000);return()=>{stop=true;window.clearTimeout(timer);};},[commit,token]);
 const publish=async()=>{
  setBusy(true);setError("");setConflict(false);
  try{
   const [adminSha,settingsSha]=await Promise.all([fileSha(token,ADMIN_FILE),fileSha(token,SETTINGS_FILE)]);
   if(adminSha!==base.adminSha||settingsSha!==base.settingsSha){setConflict(true);return;}
   const files=[{path:ADMIN_FILE,text:pretty(admin)},{path:SETTINGS_FILE,text:pretty(settings)},...Object.entries(uploads).filter(([path])=>admin.cars.some(car=>car.image===path||car.gallery?.includes(path))).map(([path,upload])=>({path:"public"+path,bytes:upload.bytes}))];
   const message="Admin panel: "+(lines.slice(0,3).join("; ")||"update")+(lines.length>3?" (+"+(lines.length-3)+" more)":"")+"\n\n"+lines.map(line=>"- "+line).join("\n")+"\n\nPublished from the AutoMall admin panel.";
   const result=await commitFiles(token,message,files,deletions.map(path=>"public"+path));
   const [a,s]=await Promise.all([fileSha(token,ADMIN_FILE),fileSha(token,SETTINGS_FILE)]);
   onPublished({admin:clone(admin),settings:clone(settings),adminSha:a??"",settingsSha:s??""});
   setCommit({sha:result.sha,url:result.html_url});setDeploy({status:"queued"});
  }catch(caught){setError(caught instanceof Error?caught.message:String(caught));}
  finally{setBusy(false);}
 };
 const discard=()=>{if(window.confirm(t.confirmDiscard))onReload();};
 return <section className="am-card" aria-labelledby="am-publish-title">
  <h2 id="am-publish-title">{t.publishTitle}</h2><p className="am-muted">{t.publishBody}</p>
  {commit&&<div className="am-success" role="status"><strong>{t.published}</strong><p>{deploy?.status==="completed"?(deploy.conclusion==="success"?t.deployDone:t.deployFailed):deploy?.status==="in_progress"?t.deployRunning:deploy?.status==="unknown"?t.deployUnknown:t.deployQueued}</p>{deploy?.url&&<a href={deploy.url} target="_blank" rel="noopener noreferrer">{t.buildLog} ↗</a>}</div>}
  {!pending?<p className="am-muted">{t.nothing}</p>:<>
   <h3>{t.changes(lines.length)}</h3><ul className="am-changes">{lines.map(line=><li key={line}>{line}</li>)}</ul>
   {problems.length>0&&<div className="am-error" role="alert"><strong>{t.problemsTitle}</strong><ul>{problems.map(problem=><li key={problem}>{problem}</li>)}</ul></div>}
   {conflict&&<div className="am-error" role="alert"><p>{t.conflict}</p><button className="am-button" type="button" onClick={onReload}>{t.reload}</button></div>}
   {error&&<p className="am-error" role="alert">{error}</p>}
   <div className="am-editor-actions"><button className="am-button am-primary" type="button" disabled={busy||problems.length>0} onClick={()=>void publish()}>{busy?t.publishing:t.publish}</button><button className="am-button am-ghost" type="button" disabled={busy} onClick={discard}>{t.discard}</button></div>
  </>}
 </section>;
}

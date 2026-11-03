export type Lang = "en" | "ar";
function structuredCloneJson<T>(value:T):T{return JSON.parse(JSON.stringify(value)) as T;}
import {assetPath} from "./site-paths";
import catalog from "./catalog-data.json";
import adminData from "./admin-data.json";
import settingsData from "./site-settings.json";
import {mergeInventory,type AdminData,type VehicleRecord,type VehicleStatus} from "./inventory";
export {SITE_URL} from "./site-paths";
type Localized = {en:string;ar:string};
export type OpeningDay={day:"sat"|"sun"|"mon"|"tue"|"wed"|"thu"|"fri";closed?:boolean;open?:string;close?:string};
export type SiteSettings={phone:string;whatsapp:string;address:Localized;city:Localized;mapsQuery:string;instagram:string;facebook:string;hours:OpeningDay[];bannerCars:string[];featuredCars:string[]};
/** Contact details, opening hours and homepage picks, edited in the admin panel. */
export const settings:SiteSettings=structuredCloneJson(settingsData as SiteSettings);
/** The published settings and admin data, as built into the site (before this browser's own edits). */
export const builtSettings:SiteSettings=structuredCloneJson(settingsData as SiteSettings);
export const builtAdmin:AdminData=structuredCloneJson(adminData as AdminData);
export let PHONE = settings.phone;
export let INSTAGRAM = settings.instagram;
export let FACEBOOK_URL = settings.facebook;
const mapsFor=(query:string)=>"https://www.google.com/maps/search/?api=1&query="+encodeURIComponent(query);
export let MAPS = mapsFor(settings.mapsQuery);
export const phoneDisplay=(phone=settings.phone)=>{const digits=phone.replace(/\D/g,"");const local=digits.startsWith("962")?"0"+digits.slice(3):digits;return local.length===10?local.slice(0,3)+" "+local.slice(3,6)+" "+local.slice(6):phone;};
export const whatsapp = (message: string) => "https://wa.me/"+settings.whatsapp.replace(/\D/g,"")+"?text=" + encodeURIComponent(message);
export type Vehicle = {
 id:string;brand:string;name:string;year:number|string;image:string;
 categories:readonly string[];color:Localized;type:Localized;description:Localized;
 facts:{en:string[];ar:string[]};
 specs?:readonly {label:Localized;value:Localized}[];
 gallery?:readonly string[];post:string;sourceLabel?:Localized;
 price?:{amount:number;currency:"JOD"};
 range?:Localized;
 status?:VehicleStatus;
};
const asset=(path:string)=>/^(?:blob:|data:|https?:)/.test(path)?path:assetPath(path);
const withAssets=(vehicle:VehicleRecord):Vehicle=>({...vehicle,image:asset(vehicle.image),gallery:vehicle.gallery?.map(asset)});
/** The audited dealer snapshot alone (used by the catalogue tests). */
export const catalogVehicles:readonly Vehicle[] = (catalog as VehicleRecord[]).map(withAssets);
/** Every car with a page: dealer snapshot + admin additions and edits, minus hidden cars. Sold cars keep their page. */
export const allVehicles:Vehicle[] = mergeInventory(catalog as VehicleRecord[],builtAdmin).map(withAssets);
/** Cars listed for sale (sold cars are left out of lists, filters and counts). */
export const vehicles:Vehicle[] = allVehicles.filter(vehicle=>vehicle.status!=="sold");
export const findVehicle=(id?:string)=>allVehicles.find(vehicle=>vehicle.id===id);
/** Cars that have a prerendered page of their own. Cars added in this browser use /v2/car/local/?id=… instead. */
export const builtVehicleIds:ReadonlySet<string>=new Set(allVehicles.map(vehicle=>vehicle.id));

const listeners=new Set<()=>void>();
/** Modules that derive lists from the cars (brands, model years…) refresh themselves here. */
export function onSiteDataChange(fn:()=>void){listeners.add(fn);return ()=>{listeners.delete(fn);};}
/**
 * Swap in this browser's own edits from the admin panel (or the published data again).
 * The arrays and the settings object are updated in place, so every module sees the change.
 * `photos` maps admin photo paths to the object URLs of photos stored in this browser.
 */
export function applySiteData(admin:AdminData,next:SiteSettings,photos:Record<string,string>={}){
 for(const key of Object.keys(settings) as (keyof SiteSettings)[])delete settings[key];
 Object.assign(settings,structuredCloneJson(next));
 PHONE=settings.phone;INSTAGRAM=settings.instagram;FACEBOOK_URL=settings.facebook;MAPS=mapsFor(settings.mapsQuery);
 const swap=(path:string)=>photos[path]??path;
 const merged=mergeInventory(catalog as VehicleRecord[],admin).map(vehicle=>withAssets({...vehicle,image:swap(vehicle.image),gallery:vehicle.gallery?.map(swap)}));
 allVehicles.splice(0,allVehicles.length,...merged);
 vehicles.splice(0,vehicles.length,...merged.filter(vehicle=>vehicle.status!=="sold"));
 for(const fn of listeners)fn();
}
export const copy = {
en:{
navCars:"Collection",navTrade:"Trade-in",navVisit:"Showroom",chat:"WhatsApp",browse:"Browse cars",lang:"العربية",menu:"Open navigation",close:"Close",heroTitle:"Your next drive.\nAt AutoMall.",heroBody:"Electric, hybrid and gasoline. Discover more possibilities at AutoMall, your car dealership in Amman.",tagline:"More choices. Less prices.",collectionLabel:"THE COLLECTION",collectionTitle:"Find your next drive.",collectionBody:"Explore 70 public dealer listings, with real photographs and vehicle specifications. Find your next drive by brand, fuel or model.",all:"All cars",electric:"Electric",suv:"SUV",premium:"Premium",search:"Search the collection",searchPlaceholder:"Brand, model or year",results:"vehicles",sourceNote:"All 70 public dealer listings, checked 29 October 2026. Listings can change; confirm current stock, price and specifications with our team.",details:"View details",emptyTitle:"A different road awaits.",emptyBody:"Try another model or reset the filters. We can also help you find what you have in mind.",reset:"Reset filters",tradeTitle:"New keys.\nNew possibilities.",tradeBody:"Your next chapter can start with your current car. Talk to AutoMall about a trade-in, subject to inspection.",tradeAction:"Discuss trade-in",visitLabel:"COME MEET YOUR NEXT CAR",visitTitle:"Better in person.",visitBody:"Take a closer look, sit behind the wheel and talk through your options with our team.",address:"Mecca Street 148",city:"Amman, Jordan 11112",directions:"Get directions",call:"Call the showroom",visitNote:"Contact us to confirm opening hours and arrange your visit.",faqTitle:"Good to know.",faq:[["How do I check price and availability?","Choose a car and open its details to send a model-specific WhatsApp enquiry. Our team will confirm the current price, specifications and availability."],["Can I trade in my current car?","Yes, AutoMall's vehicle posts invite trade-ins. Contact the team to discuss your vehicle. Any offer depends on inspection and a final agreement."],["Can I arrange a showroom visit?","Call or send a WhatsApp message to arrange a visit. Confirm opening hours directly with the showroom before travelling."],["Where can I find more cars?","This catalogue includes the 70 live listings on our public dealer page as checked on 29 October 2026. Follow @automalljo on Instagram for showroom updates, or ask our team about the latest arrivals."]],instagram:"Follow the collection",footerDescription:"Cars for your next chapter. Visit AutoMall on Mecca Street, Amman.",source:"Original dealer listing",enquire:"Enquire on WhatsApp",detailNote:"Specifications and photographs come from the linked dealer listing. Confirm the exact trim, model year, condition, mileage and current price before purchase. Listings may contain seller errors. Advertised driving range varies with speed, weather, load and battery condition.",heroCaption:"Original dealer photographs. Explore the collection below.",back:"Back to AutoMall"
},
ar:{
navCars:"السيارات",navTrade:"الاستبدال",navVisit:"المعرض",chat:"واتساب",browse:"تصفح السيارات",lang:"English",menu:"فتح القائمة",close:"إغلاق",heroTitle:"سيارتك القادمة.\nفي أوتومول.",heroBody:"كهربائية، هجينة أو بنزين. اكتشف المزيد من الخيارات في أوتومول، معرض السيارات في عمّان.",tagline:"خيارات أكثر. أسعار أقل.",collectionLabel:"تشكيلتنا",collectionTitle:"اعثر على سيارتك القادمة.",collectionBody:"تصفح 70 إعلاناً عاماً للمعرض مع صور حقيقية ومواصفات السيارات. ابحث حسب العلامة التجارية أو الوقود أو الموديل.",all:"كل السيارات",electric:"كهربائية",suv:"دفع رباعي",premium:"فاخرة",search:"البحث في السيارات",searchPlaceholder:"العلامة، الموديل أو السنة",results:"سيارات",sourceNote:"جميع إعلانات المعرض العامة الـ70، كما رُصدت في 29 أكتوبر 2026. قد تتغير الإعلانات؛ أكد التوفر والسعر والمواصفات الحالية مع فريقنا.",details:"عرض التفاصيل",emptyTitle:"خيارك القادم ينتظرك.",emptyBody:"جرّب البحث عن موديل آخر أو أعد ضبط التصفية. يمكن لفريقنا مساعدتك في العثور على ما تبحث عنه.",reset:"إعادة الضبط",tradeTitle:"مفاتيح جديدة.\nإمكانيات أكثر.",tradeBody:"قد تبدأ خطوتك القادمة بسيارتك الحالية. تواصل مع أوتومول لمناقشة الاستبدال، مع الخضوع للفحص.",tradeAction:"ناقش الاستبدال",visitLabel:"تعرف على سيارتك عن قرب",visitTitle:"التجربة أجمل عن قرب.",visitBody:"شاهد التفاصيل، واجلس خلف المقود، وناقش خياراتك مع فريقنا.",address:"شارع مكة 148",city:"عمّان، الأردن 11112",directions:"الاتجاهات",call:"اتصل بالمعرض",visitNote:"تواصل معنا لتأكيد أوقات الدوام وترتيب زيارتك.",faqTitle:"أسئلة تهمك.",faq:[["كيف أتحقق من السعر والتوفر؟","اختر السيارة وافتح تفاصيلها لإرسال استفسار محدد عبر واتساب. يؤكد فريقنا السعر والمواصفات والتوفر الحالي."],["هل يمكن استبدال سيارتي الحالية؟","نعم، تتضمن منشورات أوتومول إمكانية الاستبدال. تواصل مع الفريق لمناقشة سيارتك، ويخضع أي عرض للفحص والاتفاق النهائي."],["كيف أرتب زيارة للمعرض؟","اتصل بنا أو أرسل رسالة عبر واتساب لترتيب زيارتك. يُرجى تأكيد أوقات الدوام مع المعرض قبل الحضور."],["أين أجد المزيد من السيارات؟","يشمل هذا الكتالوج الإعلانات الـ70 النشطة على صفحة المعرض العامة كما رُصدت في 29 أكتوبر 2026. تابع @automalljo على إنستغرام لأخبار المعرض، أو اسأل فريقنا عن أحدث السيارات."]],instagram:"تابع تشكيلتنا",footerDescription:"سيارات لخطوتك القادمة. زر أوتومول في شارع مكة، عمّان.",source:"إعلان المعرض الأصلي",enquire:"استفسر عبر واتساب",detailNote:"المواصفات والصور من إعلان المعرض المرتبط. أكد الفئة وسنة الموديل والحالة والعداد والسعر الحالي قبل الشراء. قد تحتوي إعلانات البائع على أخطاء. يتغير مدى القيادة الفعلي بحسب السرعة والطقس والحمولة وحالة البطارية.",heroCaption:"صور أصلية من المعرض. تصفح السيارات أدناه.",back:"العودة إلى أوتومول"
}};
export function modelMessage(v:Vehicle,lang:Lang){return lang==="ar" ? "مرحباً أوتومول، أود الاستفسار عن "+v.brand+" "+v.name+" "+v.year+". يرجى تأكيد السعر والتوفر." : "Hello AutoMall, I am interested in the "+v.year+" "+v.brand+" "+v.name+". Please confirm its current price and availability.";}
export const genericMessage = (lang:Lang) => lang==="ar"?"مرحباً أوتومول، أود معرفة المزيد عن السيارات وترتيب زيارة للمعرض.":"Hello AutoMall, I would like to explore your cars and arrange a showroom visit.";

import rawFeatures from "./v2-feature-data.json";
import {efficiencyFact} from "./v2-efficiency";
import {vehicles,settings,onSiteDataChange,type Lang,type Vehicle} from "./site-data";
import type {VehicleFeatureName} from "./components/vehicle-feature-icon";
export type Localized={en:string;ar:string};
export type EquipmentFeature={id:VehicleFeatureName;label:Localized;sourceURL:string;sourceType:"facebook"|"dealer-listing";confidence?:string};
export type DealerPost={postId:string;url:string;title:string;model:string;year:number;vehicleIds:string[];summary:Localized;captionAccess:string};
const research=rawFeatures as unknown as {checkedAt:string;facebookPosts:DealerPost[];vehicles:Record<string,{features:EquipmentFeature[]}>};
const supported=new Set<VehicleFeatureName>(["range","battery","charge","hybrid","awd","panorama","camera360","heatedSeats","ventilatedSeats","leather","cruise","hud","keyless","powerTailgate","carplay","parkingSensors","safety","seats","gearbox","engine","mileage"]);
export let FACEBOOK=settings.facebook;
export const dealerPosts=research.facebookPosts.filter(post=>post.captionAccess==="public-full-caption"&&post.url.startsWith("https://www.facebook.com/automall.jo/"));
const researched=(vehicle:Vehicle)=>{const seen=new Set<string>();return (research.vehicles[vehicle.id]?.features??[]).filter(feature=>supported.has(feature.id)&&!seen.has(feature.id)&&!!seen.add(feature.id));};
/** A car's equipment: what the research found, or the list chosen in the admin panel when there is one. */
export const equipmentFor=(vehicle:Vehicle):EquipmentFeature[]=>{
 const found=researched(vehicle);if(!vehicle.features)return found;
 const chosen=new Set(vehicle.features),isEquipment=(id:string)=>id in featureLabels;
 const kept=found.filter(feature=>!isEquipment(feature.id)||chosen.has(feature.id));
 const added=[...chosen].filter(id=>isEquipment(id)&&!kept.some(feature=>feature.id===id)).map(id=>({id:id as VehicleFeatureName,label:featureLabels[id as VehicleFeatureName]!,sourceURL:"",sourceType:"dealer-listing" as const}));
 return [...kept,...added];
};
/** The researched equipment ids alone (the admin panel's starting point). */
export const researchedEquipment=(vehicle:Vehicle)=>researched(vehicle).map(feature=>feature.id).filter(id=>id in featureLabels);
/** Small copies of dealer photos: 450px for thumbnail strips and grids, 800px for car cards. */
export const thumbSrc=(src:string)=>src.replace(/\/assets\/(?:catalog|uploads)\//,"/assets/thumbs/").replace(/\.(?:jpe?g|png)$/i,".webp");
export const cardSrc=(src:string)=>src.replace(/\/assets\/(?:catalog|uploads)\//,"/assets/cards/").replace(/\.(?:jpe?g|png)$/i,".webp");
export const specValue=(vehicle:Vehicle,label:string)=>vehicle.specs?.find(spec=>spec.label.en===label)?.value;
export const isElectric=(vehicle:Vehicle)=>vehicle.categories.includes("electric");
export const brandNames:string[]=[];
export const featureLabels:Partial<Record<VehicleFeatureName,Localized>>={
 panorama:{en:"Panoramic roof",ar:"سقف بانورامي"},camera360:{en:"Surround-view cameras",ar:"كاميرات محيطية"},heatedSeats:{en:"Heated seats",ar:"مقاعد مدفأة"},ventilatedSeats:{en:"Ventilated seats",ar:"مقاعد بتهوية"},leather:{en:"Leather upholstery",ar:"مقصورة جلدية"},cruise:{en:"Cruise control",ar:"مثبت سرعة"},hud:{en:"Head-up display",ar:"عرض على الزجاج"},keyless:{en:"Keyless systems",ar:"أنظمة بدون مفتاح"},powerTailgate:{en:"Powered tailgate",ar:"صندوق كهربائي"},carplay:{en:"Phone connectivity",ar:"ربط الهاتف"},parkingSensors:{en:"Parking sensors",ar:"حساسات اصطفاف"},safety:{en:"Safety & assistance",ar:"السلامة ومساعدة القيادة"},awd:{en:"All-wheel drive",ar:"دفع كلي"}
};
export const equipmentOptions:[VehicleFeatureName,Localized][]=[];
/** Lists derived from the cars, refreshed when this browser's admin edits are applied. */
const refreshLists=()=>{FACEBOOK=settings.facebook;brandNames.splice(0,brandNames.length,...[...new Set(vehicles.map(v=>v.brand))].sort((a,b)=>a.localeCompare(b)));equipmentOptions.splice(0,equipmentOptions.length,...(Object.entries(featureLabels).filter(([id])=>vehicles.some(v=>equipmentFor(v).some(f=>f.id===id))) as [VehicleFeatureName,Localized][]));};
refreshLists();onSiteDataChange(refreshLists);
export const equipmentTiles=["panorama","camera360","heatedSeats","ventilatedSeats","hud","carplay"] as const;
export function cardFacts(vehicle:Vehicle,lang:Lang){
 return [
  efficiencyFact(vehicle,lang),
  {icon:"mileage" as const,label:lang==="ar"?"العداد":"Mileage",value:specValue(vehicle,"Mileage")?.[lang]??"—"},
  {icon:"power" as const,label:lang==="ar"?"القوة والعزم":"Power · torque",value:[specValue(vehicle,"Power")?.[lang],specValue(vehicle,"Torque")?.[lang]?.replace(/ \((engine|المحرك)\)$/,"")].filter(Boolean).join(" · ")||"—"},
  engineFact(vehicle,lang)
 ];
}
/** Engine size for petrol and hybrid cars ("2.0L turbo", "4.0L V8 twin-turbo"); battery size for electric cars. */
export function engineSize(vehicle:Vehicle,lang:Lang){
 const engine=specValue(vehicle,"Engine / hybrid system")?.en;
 const size=engine?.match(/\d+(?:\.\d+)?L/)?.[0];
 if(!size)return undefined;
 const cylinders=engine!.match(/\bV\d+\b/)?.[0];
 const boost=/twin-turbo/.test(engine!)?(lang==="ar"?"توين تيربو":"twin-turbo"):/turbo/.test(engine!)?(lang==="ar"?"تيربو":"turbo"):undefined;
 return [size,cylinders,boost].filter(Boolean).join(" ");
}
function engineFact(vehicle:Vehicle,lang:Lang){
 const size=engineSize(vehicle,lang);
 if(size||!isElectric(vehicle))return {icon:"piston" as VehicleFeatureName,label:lang==="ar"?"سعة المحرك":"Engine size",value:size??"—"};
 const battery=specValue(vehicle,"Battery (seller stated)")?.[lang]?.replace(/\s*(Blade|بليد)$/i,"");
 return {icon:"battery" as VehicleFeatureName,label:lang==="ar"?(battery?"البطارية":"المحرك"):(battery?"Battery":"Motor"),value:battery??(lang==="ar"?"كهربائي":"Electric")};
}
export const heroModels=[{id:"287516454",photo:"/assets/catalog/gallery-287516454-1.webp"},{id:"288630286",photo:"/assets/catalog/gallery-288630286-1.webp"},{id:"288440948",photo:"/assets/catalog/gallery-288440948-1.webp"}].map(item=>({...item,vehicle:vehicles.find(v=>v.id===item.id)!}));
export const copyV2={
 en:{navCars:"Collection",navFeatures:"Features",navVisit:"Visit us",versionOne:"Version 01",menu:"Open navigation",close:"Close",heroKicker:"AUTOMALL / AMMAN, JORDAN",heroTitle:"A better way\nto find your\nnext drive.",heroBody:"Electric, hybrid or petrol. Discover the car that fits your life, right here at AutoMall.",browse:"Explore the collection",whatsapp:"Let's talk",spotlight:"IN THE SPOTLIGHT",previousCar:"Previous featured car",nextCar:"Next featured car",liveListings:"Dealer listings",brands:"Brands to explore",photos:"Real vehicle photos",equipmentKicker:"01 / THE DETAILS THAT MATTER",equipmentTitle:"Find your kind\nof extraordinary.",equipmentBody:"Explore equipment highlighted in the dealership's posts. Choose a feature to find matching cars.",dealerListed:"Dealer-listed equipment. Availability varies by vehicle and trim.",viewMatches:"Explore matching cars",inventoryKicker:"02 / THE COLLECTION",inventoryTitle:"Your next chapter.",inventoryBody:"A complete public-listing snapshot. Real photos, clear specifications and direct answers from the showroom.",all:"All cars",electric:"Electric",hybrid:"Hybrid",petrol:"Petrol",suv:"SUV",brand:"Brand",allBrands:"All brands",equipment:"Equipment",anyEquipment:"Any equipment",search:"Search cars",searchPlaceholder:"Brand, model or year",sort:"Sort",featured:"Featured",newest:"Newest model year",lowPrice:"Price: low to high",showing:"Showing",of:"of",cars:"cars",reset:"Clear filters",more:"Discover more cars",emptyTitle:"Let's take another road.",emptyBody:"Try another model or clear the filters to explore the full collection.",details:"Discover this car",priceLabel:"Advertised price",askPrice:"Enquire for price",newCar:"New",usedCar:"Used",range:"Advertised electric range",gallery:"Vehicle gallery",photo:"Photo",previousPhoto:"Previous photo",nextPhoto:"Next photo",specifications:"The specifications",equipmentTitleSmall:"Equipment highlights",enquire:"Enquire about this car",source:"Original dealer listing",facebookSource:"Related Facebook post",detailNote:"Equipment and figures are dealer-advertised. Confirm the exact trim, condition, price and availability with AutoMall. Actual driving range varies with use.",cabinKicker:"03 / TAKE A CLOSER LOOK",cabinTitle:"The inside\nstory.",cabinBody:"A cabin is where every journey begins. Discover the materials, the technology and the details that make a car feel like yours.",cabinAction:"Explore the BMW i5 M60",postKicker:"04 / FROM THE SHOWROOM",postTitle:"Fresh perspectives.\nStraight from AutoMall.",postBody:"Selected public Facebook posts, with the features that matter brought into focus.",postAction:"Read the Facebook post",morePosts:"More showroom updates",viewFacebook:"Visit AutoMall on Facebook",visitKicker:"05 / COME SAY HELLO",visitTitle:"Some things are\nbetter in person.",visitBody:"See the cars, settle into the seat and talk through your options. Contact the team to arrange your visit.",address:settings.address.en,city:settings.city.en,directions:"Get directions",call:"Call the showroom",visitNote:"Confirm opening hours before travelling.",footerLine:"More choices. More possibilities.",legal:"Legal information",snapshot:"Listing snapshot checked 29 October 2026. Confirm current availability with the showroom.",sourceNote:"Facebook posts and linked dealer advertisements provide the equipment highlights; features are not assumed across different trims."},
 ar:{navCars:"السيارات",navFeatures:"المواصفات",navVisit:"زرنا",versionOne:"النسخة الأولى",menu:"فتح القائمة",close:"إغلاق",heroKicker:"أوتومول / عمّان، الأردن",heroTitle:"طريق أجمل\nللعثور على\nسيارتك القادمة.",heroBody:"كهربائية أو هجينة أو بنزين. اكتشف السيارة التي تناسب حياتك هنا في أوتومول.",browse:"اكتشف السيارات",whatsapp:"تواصل معنا",spotlight:"تحت الأضواء",previousCar:"السيارة المميزة السابقة",nextCar:"السيارة المميزة التالية",liveListings:"إعلان للمعرض",brands:"علامة تجارية",photos:"صورة حقيقية",equipmentKicker:"01 / تفاصيل تصنع الفارق",equipmentTitle:"اكتشف التفاصيل\nالتي تشبهك.",equipmentBody:"تصفح التجهيزات التي تبرزها إعلانات المعرض. اختر ميزة للعثور على السيارات المطابقة.",dealerListed:"تجهيزات معلنة من المعرض، تختلف بحسب السيارة والفئة.",viewMatches:"اكتشف السيارات المطابقة",inventoryKicker:"02 / تشكيلة السيارات",inventoryTitle:"خطوتك القادمة.",inventoryBody:"مجموعة الإعلانات العامة مع صور حقيقية ومواصفات واضحة وإجابات مباشرة من المعرض.",all:"كل السيارات",electric:"كهربائية",hybrid:"هجينة",petrol:"بنزين",suv:"سيارات SUV",brand:"العلامة",allBrands:"كل العلامات",equipment:"التجهيزات",anyEquipment:"كل التجهيزات",search:"ابحث عن سيارة",searchPlaceholder:"العلامة أو الموديل أو السنة",sort:"الترتيب",featured:"المميزة",newest:"الأحدث موديلًا",lowPrice:"السعر: من الأقل للأعلى",showing:"عرض",of:"من",cars:"سيارة",reset:"مسح التصفية",more:"اكتشف المزيد من السيارات",emptyTitle:"لنبحث عن خيار آخر.",emptyBody:"جرّب موديلًا آخر أو امسح التصفية لاستكشاف التشكيلة كاملة.",details:"اكتشف هذه السيارة",priceLabel:"السعر المعلن",askPrice:"استفسر عن السعر",newCar:"جديدة",usedCar:"مستعملة",range:"المدى الكهربائي المعلن",gallery:"صور السيارة",photo:"الصورة",previousPhoto:"الصورة السابقة",nextPhoto:"الصورة التالية",specifications:"المواصفات",equipmentTitleSmall:"أبرز التجهيزات",enquire:"استفسر عن هذه السيارة",source:"إعلان المعرض الأصلي",facebookSource:"منشور فيسبوك المرتبط",detailNote:"التجهيزات والأرقام معلنة من المعرض. أكد الفئة والحالة والسعر والتوفر مع أوتومول. يختلف مدى القيادة الفعلي بحسب الاستخدام.",cabinKicker:"03 / نظرة أقرب",cabinTitle:"حكاية\nالمقصورة.",cabinBody:"من المقصورة تبدأ كل رحلة. اكتشف المواد والتقنيات والتفاصيل التي تجعل السيارة أقرب إليك.",cabinAction:"اكتشف BMW i5 M60",postKicker:"04 / من داخل المعرض",postTitle:"زوايا جديدة.\nمباشرة من أوتومول.",postBody:"منشورات عامة مختارة من فيسبوك، مع إبراز التجهيزات التي تهمك.",postAction:"اقرأ المنشور على فيسبوك",morePosts:"المزيد من أخبار المعرض",viewFacebook:"زر أوتومول على فيسبوك",visitKicker:"05 / أهلًا بك",visitTitle:"بعض التفاصيل\nأجمل عن قرب.",visitBody:"شاهد السيارات واجلس خلف المقود وناقش خياراتك. تواصل مع الفريق لترتيب زيارتك.",address:settings.address.ar,city:settings.city.ar,directions:"الاتجاهات",call:"اتصل بالمعرض",visitNote:"أكد أوقات الدوام قبل الحضور.",footerLine:"خيارات أكثر. إمكانيات أكثر.",legal:"المعلومات القانونية",snapshot:"رُصدت الإعلانات في 29 أكتوبر 2026. أكد التوفر الحالي مع المعرض.",sourceNote:"تأتي التجهيزات من منشورات فيسبوك وإعلانات المعرض المرتبطة، ولا تُفترض عبر الفئات المختلفة."}
};
// The showroom address in the copy follows this browser's admin edits too.
onSiteDataChange(()=>{for(const lang of ["en","ar"] as const){copyV2[lang].address=settings.address[lang];copyV2[lang].city=settings.city[lang];}});

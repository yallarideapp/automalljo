import {vehicles,type Vehicle} from "./site-data";
import {equipmentFor,equipmentOptions,type Localized} from "./v2-content";

export const powertrains:{id:string;label:Localized;description:Localized}[]=[
 {id:"electric",label:{en:"Electric",ar:"كهربائية"},description:{en:"A different kind of energy.",ar:"طاقة جديدة لكل رحلة."}},
 {id:"hybrid",label:{en:"Hybrid",ar:"هايبرد"},description:{en:"The best of both worlds.",ar:"مرونة تجمع مصدرَي الطاقة."}},
 {id:"gasoline",label:{en:"Petrol",ar:"بنزين"},description:{en:"The familiar feeling of the open road.",ar:"متعة الطريق بأسلوبك المعتاد."}},
];
export const bodyStyles:{id:string;source:string;label:Localized}[]=[
 {id:"suv",source:"SUV",label:{en:"SUV",ar:"SUV"}},
 {id:"sedan",source:"Sedan",label:{en:"Sedan",ar:"سيدان"}},
 {id:"pickup",source:"Pickup",label:{en:"Pickup",ar:"بيك أب"}},
 {id:"van",source:"Van",label:{en:"Van",ar:"فان"}},
 {id:"coupe",source:"Coupe",label:{en:"Coupé",ar:"كوبيه"}},
 {id:"shooting-brake",source:"Shooting brake",label:{en:"Shooting brake",ar:"شوتينغ بريك"}},
 {id:"targa",source:"Targa",label:{en:"Targa",ar:"تارغا"}},
 {id:"truck",source:"Refrigerated truck",label:{en:"Refrigerated truck",ar:"شاحنة مبردة"}},
];
export const bodyStyleFor=(vehicle:Vehicle)=>bodyStyles.find(body=>body.source===vehicle.type.en.split(" · ")[0])?.id??"other";
export const modelYears=[...new Set(vehicles.map(vehicle=>Number(vehicle.year)).filter(Number.isFinite))].sort((a,b)=>a-b).map(String);
export type CatalogFilters={powertrain:string;body:string;brand:string;equipment:string;query:string;sort:string;yearFrom:string;yearTo:string};
export const defaultFilters:CatalogFilters={powertrain:"all",body:"all",brand:"all",equipment:"all",query:"",sort:"featured",yearFrom:"all",yearTo:"all"};
const normalized=(value:string)=>value.normalize("NFKD").replace(/[\u0300-\u036f\u064b-\u065f]/g,"").toLowerCase();
export function filtersFromSearch(search:URLSearchParams):CatalogFilters{
 const valid=(key:string,values:string[],fallback="all")=>{const value=search.get(key)??fallback;return values.includes(value)?value:fallback;};
 return {
  powertrain:valid("powertrain",["all",...powertrains.map(item=>item.id)]),
  body:valid("body",["all",...bodyStyles.map(item=>item.id)]),
  brand:valid("brand",["all",...new Set(vehicles.map(item=>item.brand))]),
  equipment:valid("equipment",["all",...equipmentOptions.map(([id])=>id)]),
  query:(search.get("q")??"").slice(0,100),sort:valid("sort",["featured","newest","price","price-desc","name"],"featured"),
  yearFrom:valid("from",["all",...modelYears]),yearTo:valid("to",["all",...modelYears]),
 };
}
export function filtersToSearch(filters:CatalogFilters):string{
 const search=new URLSearchParams();
 for(const key of ["powertrain","body","brand","equipment","sort"] as const)if(filters[key]!==defaultFilters[key])search.set(key,filters[key]);
 if(filters.yearFrom!=="all")search.set("from",filters.yearFrom);
 if(filters.yearTo!=="all")search.set("to",filters.yearTo);
 if(filters.query.trim())search.set("q",filters.query.trim());
 return search.toString();
}
export function filterVehicles(filters:CatalogFilters,items:readonly Vehicle[]=vehicles):Vehicle[]{
 const needle=normalized(filters.query.trim());
 const result=items.filter(vehicle=>(filters.powertrain==="all"||vehicle.categories.includes(filters.powertrain))&&(filters.body==="all"||bodyStyleFor(vehicle)===filters.body)&&(filters.brand==="all"||vehicle.brand===filters.brand)&&(filters.equipment==="all"||equipmentFor(vehicle).some(feature=>feature.id===filters.equipment))&&(filters.yearFrom==="all"||Number(vehicle.year)>=Number(filters.yearFrom))&&(filters.yearTo==="all"||Number(vehicle.year)<=Number(filters.yearTo))&&normalized([vehicle.brand,vehicle.name,vehicle.year,vehicle.type.en,vehicle.type.ar,...equipmentFor(vehicle).flatMap(feature=>[feature.label.en,feature.label.ar])].join(" ")).includes(needle));
 if(filters.sort==="newest")result.sort((a,b)=>Number(b.year)-Number(a.year));
 if(filters.sort==="price"||filters.sort==="price-desc")result.sort((a,b)=>{
  if(!a.price)return b.price?1:0;if(!b.price)return -1;
  return (a.price.amount-b.price.amount)*(filters.sort==="price-desc"?-1:1);
 });
 if(filters.sort==="name")result.sort((a,b)=>(a.brand+" "+a.name).localeCompare(b.brand+" "+b.name));
 return result;
}

export const navigationCopy={
 en:{moreFilters:"More filters",activeFilters:"Active filters",removeFilter:"Remove filter",home:"Home",cars:"Cars",features:"Features",updates:"News",contact:"Showroom",powertrain:"01 / Browse by category",body:"02 / Find your shape",powerTitle:"Shop by category",bodyTitle:"A car for your kind of life.",allPower:"All powertrains",allBody:"All body styles",powerFilter:"Powertrain",bodyFilter:"Body style",illustration:"Category illustrations. Explore individual listings for photographs of the actual cars.",featuredTitle:"A few to get you started.",viewAll:"View all cars",backCars:"Back to cars",yearFilter:"Year",yearFrom:"From",yearTo:"To",anyYear:"Any year",yearRange:"Model year range",related:"More like this.",trade:"Ready for a change?",tradeBody:"Talk to AutoMall about trading in your current car. Any offer follows inspection and a final agreement.",tradeAction:"Discuss a trade-in",highPrice:"Price: high to low",byName:"Name: A–Z",notFound:"This car could not be found.",notFoundBody:"Browse the current collection or ask the showroom for help.",detailKicker:"THE DETAILS / YOUR NEXT DRIVE",showroomTitle:"From the showroom.",contactTitle:"Visit AutoMall",featureTitle:"The details make the drive.",catalogTitle:"Find your next drive.",catalogBody:"Choose a powertrain, then a body style. Refine the results to find what fits.",seeFeatures:"Explore the features"},
 ar:{moreFilters:"فلاتر إضافية",activeFilters:"التصفية الحالية",removeFilter:"إزالة التصفية",home:"الرئيسية",cars:"السيارات",features:"التجهيزات",updates:"أخبار المعرض",contact:"تواصل معنا",powertrain:"01 / تصفح حسب الفئة",body:"02 / اختر شكل سيارتك",powerTitle:"تسوق حسب الفئة",bodyTitle:"سيارة تناسب أسلوب حياتك.",allPower:"كل أنظمة الحركة",allBody:"كل أنواع الهيكل",powerFilter:"نظام الحركة",bodyFilter:"نوع الهيكل",illustration:"صور توضيحية للفئات. تجد صور السيارات الفعلية داخل كل إعلان.",featuredTitle:"خيارات تستحق أن تبدأ بها.",viewAll:"عرض كل السيارات",backCars:"العودة إلى السيارات",related:"خيارات قد تعجبك.",trade:"حان وقت التغيير؟",tradeBody:"تحدث مع أوتومول عن استبدال سيارتك الحالية. يخضع أي عرض للفحص والاتفاق النهائي.",tradeAction:"ناقش الاستبدال",highPrice:"السعر: من الأعلى للأقل",byName:"الاسم: أ–ي",notFound:"تعذر العثور على هذه السيارة.",notFoundBody:"تصفح التشكيلة الحالية أو تواصل مع المعرض للمساعدة.",detailKicker:"التفاصيل / سيارتك القادمة",showroomTitle:"من داخل المعرض.",contactTitle:"المعرض والتواصل",featureTitle:"التفاصيل تصنع متعة القيادة.",catalogTitle:"اعثر على سيارتك القادمة.",catalogBody:"اختر نظام الحركة، ثم نوع الهيكل. حدد بقية الخيارات لتصل إلى ما يناسبك.",seeFeatures:"اكتشف التجهيزات",yearFilter:"السنة",yearFrom:"من",yearTo:"إلى",anyYear:"أي سنة",yearRange:"نطاق سنة الموديل"},
};

export const homeCopy={
 en:{eyebrow:"AUTOMALL · AMMAN, JORDAN",title:"Find your next car\nat AutoMall.",description:"Explore electric, hybrid and petrol cars. View the photos, compare the details and speak directly with our showroom.",findTitle:"Find a car",findDescription:"Browse 70 dealer listings",findAction:"Search cars",featuredTitle:"Featured vehicles",featuredBody:"A selection from our advertised cars. Contact us to confirm price and availability.",detailsTitle:"A closer look at your next car",photosTitle:"Actual vehicle photos",photosBody:"Explore the full gallery for each car before arranging your visit.",specsTitle:"Clear specifications",specsBody:"Check the powertrain, mileage, equipment and advertised electric range.",contactTitle:"Talk to the showroom",contactBody:"Get answers about the car, current availability and arranging a viewing.",showroomEyebrow:"VISIT AUTOMALL",showroomTitle:"See your next car in person",showroomBody:"Find us on Mecca Street in Amman. Take a closer look at the cars and discuss your options, including trading in your current vehicle.",visitAction:"Showroom & contact"},
 ar:{eyebrow:"أوتومول · معرض سيارات في عمّان",title:"اختر سيارتك القادمة\nمن أوتومول.",description:"سيارات كهربائية وهايبرد وبنزين. تصفح الصور والمواصفات، وتواصل مباشرة مع فريق المعرض.",findTitle:"ابحث عن سيارتك",findDescription:"تصفح 70 إعلاناً للمعرض",findAction:"ابحث عن السيارات",featuredTitle:"سيارات مختارة من المعرض",featuredBody:"مجموعة من سياراتنا المعلنة. تواصل معنا لتأكيد السعر والتوفر الحالي.",detailsTitle:"تعرف على سيارتك عن قرب",photosTitle:"صور السيارات الفعلية",photosBody:"تصفح معرض الصور الكامل لكل سيارة قبل ترتيب زيارتك.",specsTitle:"مواصفات واضحة",specsBody:"اطلع على نظام الحركة والعداد والتجهيزات والمدى الكهربائي المعلن.",contactTitle:"تواصل مباشر مع المعرض",contactBody:"استفسر عن السيارة والتوفر الحالي ورتب موعداً لمشاهدتها.",showroomEyebrow:"زر أوتومول",showroomTitle:"شاهد سيارتك القادمة على أرض الواقع",showroomBody:"نستقبلك في شارع مكة في عمّان. شاهد السيارات عن قرب، وناقش خياراتك مع الفريق، بما فيها استبدال سيارتك الحالية.",visitAction:"المعرض والتواصل"}
};

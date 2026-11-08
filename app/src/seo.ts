/**
 * What search engines and link previews (WhatsApp, Facebook, X…) read about each page:
 * page descriptions, the preview image, and structured data for Google (the dealership and each car).
 * Everything here is built from the published data at build time.
 */
import {builtSettings,findVehicle,type Lang,type Vehicle} from "./site-data";
import {absoluteAsset,canonicalUrl,SITE_URL} from "./site-paths";
import {specValue} from "./v2-content";

export type SeoView="home"|"cars"|"features"|"updates"|"contact"|"saved"|"compare"|"car";

/** Western digits in both languages (previews mix the price with the model year), e.g. "JOD 20,900" / "20,900 دينار". */
const price=(vehicle:Vehicle,lang:Lang)=>{if(!vehicle.price)return null;const amount=vehicle.price.amount.toLocaleString("en-US");return lang==="ar"?amount+" دينار":"JOD "+amount;};
const spec=(vehicle:Vehicle,label:string,lang:Lang)=>specValue(vehicle,label)?.[lang];
const digits=(text?:string)=>{const found=text?.replace(/[,\s]/g,"").match(/\d+(?:\.\d+)?/);return found?Number(found[0]):undefined;};

/** "2021 Toyota Camry · JOD 20,900" — the car's title in previews. */
export function carTitle(vehicle:Vehicle,lang:Lang){
 const cost=price(vehicle,lang);
 return vehicle.year+" "+vehicle.brand+" "+vehicle.name+(cost?" · "+cost:"");
}

/** One short line per page; for a car: what it is, the key facts, the price and where to see it. */
export function pageDescription(lang:Lang,view:SeoView,vehicleId?:string){
 const vehicle=view==="car"?findVehicle(vehicleId):undefined;
 if(vehicle){
  const facts=[spec(vehicle,"Fuel / powertrain",lang),spec(vehicle,"Power",lang),spec(vehicle,"Mileage",lang),spec(vehicle,"Transmission",lang)].filter(Boolean).join(" · ");
  const cost=price(vehicle,lang)??(lang==="ar"?"السعر عند الطلب":"price on request");
  const sold=vehicle.status==="sold"?(lang==="ar"?" (مباعة)":" (sold)"):vehicle.status==="reserved"?(lang==="ar"?" (محجوزة)":" (reserved)"):"";
  return lang==="ar"
   ?`${vehicle.brand} ${vehicle.name} موديل ${vehicle.year}${sold}: ${facts}. ${cost}. شاهدها في أوتومول، شارع مكة 148، عمّان، أو تواصل معنا على واتساب.`
   :`${vehicle.year} ${vehicle.brand} ${vehicle.name}${sold}: ${facts}. ${cost}. See it at AutoMall, Mecca Street 148, Amman, or message us on WhatsApp.`;
 }
 const copy:Record<Exclude<SeoView,"car">,[string,string]>={
  home:["Electric, hybrid and petrol cars at AutoMall on Mecca Street 148, Amman. Full photo galleries, specifications and prices, and a direct line to the showroom on WhatsApp.","سيارات كهربائية وهايبرد وبنزين في أوتومول، شارع مكة 148، عمّان. صور كاملة ومواصفات وأسعار، وتواصل مباشر مع المعرض على واتساب."],
  cars:["Browse every car at AutoMall in Amman. Filter by powertrain, brand, body style and model year, and sort by price.","تصفح كل سيارات أوتومول في عمّان. اختر حسب نظام الحركة والماركة ونوع الهيكل وسنة الصنع، ورتّب حسب السعر."],
  features:["Find AutoMall cars by the equipment you want: panoramic roof, 360° cameras, heated and ventilated seats, head-up display and more.","ابحث في سيارات أوتومول حسب التجهيزات: فتحة سقف بانورامية، كاميرات 360، مقاعد مدفأة ومبردة، شاشة أمامية وغيرها."],
  updates:["New arrivals and news from the AutoMall showroom in Amman.","وصل حديثاً وأخبار من معرض أوتومول في عمّان."],
  contact:["Visit AutoMall on Mecca Street 148, Amman. Call, message us on WhatsApp, get directions, or ask about trading in your car.","زر أوتومول في شارع مكة 148، عمّان. اتصل أو راسلنا على واتساب، واحصل على الاتجاهات، أو اسأل عن استبدال سيارتك."],
  saved:["The cars you saved at AutoMall.","السيارات التي حفظتها في أوتومول."],
  compare:["Compare AutoMall cars side by side: power, range, mileage, equipment and price.","قارن سيارات أوتومول جنباً إلى جنب: القوة والمدى والممشى والتجهيزات والسعر."],
 };
 return copy[view as Exclude<SeoView,"car">][lang==="ar"?1:0];
}

/** The preview image: each published car has a 1200×630 photo (scripts/make-og.py); other pages use the brand image. */
export function previewImage(view:SeoView,vehicleId?:string){
 const vehicle=view==="car"?findVehicle(vehicleId):undefined;
 return vehicle?{url:absoluteAsset("assets/og/car-"+vehicle.id+".jpg"),width:"1200",height:"630",alt:vehicle.year+" "+vehicle.brand+" "+vehicle.name}:{url:absoluteAsset("assets/automall-og.png"),width:"1200",height:"630",alt:"AutoMall, Amman"};
}

const dealerId=SITE_URL+"/#dealership";
/** The dealership, as Google reads it (shown on the home and showroom pages, referenced from every car). */
export function dealerSchema(lang:Lang){
 const s=builtSettings;
 const days={sat:"Saturday",sun:"Sunday",mon:"Monday",tue:"Tuesday",wed:"Wednesday",thu:"Thursday",fri:"Friday"};
 const hours=(s.hours??[]).filter(day=>!day.closed&&day.open&&day.close).map(day=>({"@type":"OpeningHoursSpecification",dayOfWeek:"https://schema.org/"+days[day.day],opens:day.open,closes:day.close}));
 return {
  "@context":"https://schema.org","@type":"AutoDealer","@id":dealerId,
  name:"AutoMall",alternateName:"أوتومول",url:canonicalUrl("v2",lang),
  image:absoluteAsset("assets/automall-og.png"),logo:absoluteAsset("assets/logo.jpg"),
  telephone:s.phone,
  address:{"@type":"PostalAddress",streetAddress:s.address.en,addressLocality:s.city.en.split(",")[0]||"Amman",addressCountry:"JO"},
  hasMap:"https://www.google.com/maps/search/?api=1&query="+encodeURIComponent(s.mapsQuery),
  sameAs:[s.instagram,s.facebook].filter(Boolean),
  ...(hours.length?{openingHoursSpecification:hours}:{}),
 };
}

const fuelFor=(vehicle:Vehicle)=>vehicle.categories.includes("electric")?"Electric":vehicle.categories.includes("hybrid")?"Hybrid":"Gasoline";
/** A car listing as Google reads it: the Car itself, its price offer (when there is a price) and the breadcrumb. */
export function carSchema(vehicle:Vehicle,lang:Lang){
 const url=canonicalUrl("v2/car/"+vehicle.id,lang);
 const photos=[vehicle.image,...(vehicle.gallery??[])].filter((photo,index,list)=>list.indexOf(photo)===index).slice(0,6).map(photo=>photo.startsWith("http")?photo:SITE_URL+photo.replace(/^.*?(\/assets\/)/,"$1"));
 const mileage=digits(spec(vehicle,"Mileage","en")),power=digits(spec(vehicle,"Power","en")),seats=digits(spec(vehicle,"Seats","en"));
 const condition=/new/i.test(spec(vehicle,"Condition","en")??"")?"NewCondition":"UsedCondition";
 const availability=vehicle.status==="sold"?"SoldOut":vehicle.status==="reserved"?"LimitedAvailability":"InStock";
 const car={
  "@type":"Car","@id":url+"#car",name:vehicle.year+" "+vehicle.brand+" "+vehicle.name,url,
  description:pageDescription(lang,"car",vehicle.id),image:photos,
  brand:{"@type":"Brand",name:vehicle.brand},model:vehicle.name,vehicleModelDate:String(vehicle.year),
  itemCondition:"https://schema.org/"+condition,fuelType:fuelFor(vehicle),
  ...(mileage!==undefined?{mileageFromOdometer:{"@type":"QuantitativeValue",value:mileage,unitCode:"KMT"}}:{}),
  ...(spec(vehicle,"Transmission","en")?{vehicleTransmission:spec(vehicle,"Transmission","en")}:{}),
  ...(spec(vehicle,"Body style","en")?{bodyType:spec(vehicle,"Body style","en")}:{}),
  ...(spec(vehicle,"Exterior colour","en")?{color:spec(vehicle,"Exterior colour","en")}:{}),
  ...(seats?{vehicleSeatingCapacity:seats}:{}),
  ...(power?{vehicleEngine:{"@type":"EngineSpecification",enginePower:{"@type":"QuantitativeValue",value:power,unitCode:"BHP"}}}:{}),
  ...(vehicle.price?{offers:{"@type":"Offer",price:vehicle.price.amount,priceCurrency:vehicle.price.currency||"JOD",availability:"https://schema.org/"+availability,url,seller:{"@id":dealerId}}}:{}),
 };
 const crumbs={"@type":"BreadcrumbList",itemListElement:[
  {"@type":"ListItem",position:1,name:"AutoMall",item:canonicalUrl("v2",lang)},
  {"@type":"ListItem",position:2,name:lang==="ar"?"السيارات":"Cars",item:canonicalUrl("v2/cars",lang)},
  {"@type":"ListItem",position:3,name:vehicle.brand+" "+vehicle.name,item:url},
 ]};
 return {"@context":"https://schema.org","@graph":[car,crumbs]};
}

/** JSON-LD made safe to place inside a <script> element. */
export const jsonLd=(data:unknown)=>JSON.stringify(data).replace(/</g,"\\u003c");

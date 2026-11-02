import {specLabelsAr,type Localized,type VehicleEdit,type VehicleRecord,type VehicleStatus} from "@/inventory";

type Option={key:string;en:string;ar:string};
type PowerOption=Option&{category:"electric"|"hybrid"|"gasoline"};
export const powerOptions:PowerOption[]=[
 {key:"electric",en:"Electric",ar:"كهربائية",category:"electric"},
 {key:"hev",en:"Hybrid (HEV)",ar:"هجينة ذاتية الشحن",category:"hybrid"},
 {key:"phev",en:"Plug-in hybrid",ar:"هجينة قابلة للشحن",category:"hybrid"},
 {key:"reev",en:"Hybrid (range extender / REEV)",ar:"هجينة بموسّع مدى REEV",category:"hybrid"},
 {key:"mild",en:"Mild hybrid",ar:"هجينة خفيفة",category:"hybrid"},
 {key:"petrol",en:"Petrol",ar:"بنزين",category:"gasoline"},
 {key:"diesel",en:"Diesel",ar:"ديزل",category:"gasoline"},
];
export const bodyOptions:Option[]=[
 {key:"SUV",en:"SUV",ar:"رياضية متعددة الاستخدامات"},{key:"Sedan",en:"Sedan",ar:"سيدان"},{key:"Pickup",en:"Pickup",ar:"بيك أب"},{key:"Van",en:"Van",ar:"فان"},
 {key:"Coupe",en:"Coupe",ar:"كوبيه"},{key:"Shooting brake",en:"Shooting brake",ar:"ستيشن رياضية"},{key:"Targa",en:"Targa",ar:"تارغا"},{key:"Refrigerated truck",en:"Refrigerated truck",ar:"شاحنة مبردة"},
];
export const transmissionOptions:Option[]=[{key:"Automatic",en:"Automatic",ar:"أوتوماتيك"},{key:"Manual",en:"Manual",ar:"يدوي"}];
export const driveOptions:Option[]=[{key:"FWD",en:"FWD",ar:"دفع أمامي"},{key:"RWD",en:"RWD",ar:"دفع خلفي"},{key:"AWD",en:"AWD",ar:"دفع كلي"},{key:"4WD",en:"4WD",ar:"دفع رباعي"}];
export const colourOptions:Option[]=[
 {key:"Black",en:"Black",ar:"أسود"},{key:"White",en:"White",ar:"أبيض"},{key:"Grey",en:"Grey",ar:"رمادي"},{key:"Silver",en:"Silver",ar:"فضي"},{key:"Blue",en:"Blue",ar:"أزرق"},
 {key:"Navy Blue",en:"Navy Blue",ar:"كحلي"},{key:"Red",en:"Red",ar:"أحمر"},{key:"Green",en:"Green",ar:"أخضر"},{key:"Beige",en:"Beige",ar:"بيج"},{key:"Brown",en:"Brown",ar:"بني"},
 {key:"Burgundy",en:"Burgundy",ar:"خمري"},{key:"Orange",en:"Orange",ar:"برتقالي"},{key:"Purple",en:"Purple",ar:"بنفسجي"},{key:"Yellow",en:"Yellow",ar:"أصفر"},{key:"Gold",en:"Gold",ar:"ذهبي"},
];
export const marketOptions:Option[]=[
 {key:"GCC Specs",en:"GCC Specs",ar:"مواصفات خليجية"},{key:"Chinese Specs",en:"Chinese Specs",ar:"مواصفات صينية"},{key:"European Specs",en:"European Specs",ar:"مواصفات أوروبية"},
 {key:"American Specs",en:"American Specs",ar:"مواصفات أمريكية"},{key:"Japanese Specs",en:"Japanese Specs",ar:"مواصفات يابانية"},{key:"Korean Specs",en:"Korean Specs",ar:"مواصفات كورية"},
 {key:"Dealership",en:"Dealership",ar:"الوكالة"},{key:"Other Specs",en:"Other Specs",ar:"مواصفات أخرى"},
];
export const conditionOptions:Option[]=[{key:"New",en:"New",ar:"جديدة"},{key:"Used",en:"Used",ar:"مستعملة"}];
export const statusOptions:{key:VehicleStatus;en:string;ar:string}[]=[{key:"available",en:"Available",ar:"متوفرة"},{key:"reserved",en:"Reserved",ar:"محجوزة"},{key:"sold",en:"Sold",ar:"مباعة"}];

/** Everything the "Add a car" form collects. Numbers are kept as strings while editing. */
export type CarForm={
 brand:string;model:string;year:string;trim:string;condition:string;mileage:string;
 powertrain:string;engine:string;battery:string;range:string;rangeCycle:string;power:string;torque:string;
 body:string;seats:string;transmission:string;drive:string;exterior:string;interior:string;market:string;
 price:string;status:VehicleStatus;premium:boolean;descriptionEn:string;descriptionAr:string;
};
export const emptyForm=():CarForm=>({brand:"",model:"",year:String(new Date().getFullYear()),trim:"",condition:"New",mileage:"0",powertrain:"electric",engine:"",battery:"",range:"",rangeCycle:"",power:"",torque:"",body:"SUV",seats:"5",transmission:"Automatic",drive:"",exterior:"Black",interior:"",market:"",price:"",status:"available",premium:false,descriptionEn:"",descriptionAr:""});

const number=(value:string)=>{const parsed=Number(String(value).replace(/[^\d.]/g,""));return Number.isFinite(parsed)&&parsed>0?parsed:0;};
const grouped=(value:number)=>value.toLocaleString("en-US");
const find=<T extends Option>(options:T[],key:string)=>options.find(option=>option.key===key);
const spec=(label:string,value:Localized)=>({label:{en:label,ar:specLabelsAr[label]??label},value});

/** Problems that stop a car from being saved, in the admin's language. */
export function formProblems(form:CarForm,photoCount:number,lang:"en"|"ar"){
 const problems:string[]=[];
 const t=(en:string,ar:string)=>lang==="ar"?ar:en;
 if(!form.brand.trim())problems.push(t("Enter the brand.","أدخل العلامة التجارية."));
 if(!form.model.trim())problems.push(t("Enter the model.","أدخل الموديل."));
 if(!/^\d{4}$/.test(form.year)||Number(form.year)<1950||Number(form.year)>new Date().getFullYear()+2)problems.push(t("Enter a 4-digit model year.","أدخل سنة الموديل من 4 أرقام."));
 if(photoCount<1)problems.push(t("Add at least one photo.","أضف صورة واحدة على الأقل."));
 return problems;
}

export function buildVehicle(form:CarForm,id:string,photos:string[],addedAt:string):VehicleRecord{
 const power=find(powerOptions,form.powertrain)??powerOptions[0],body=find(bodyOptions,form.body)??bodyOptions[0],condition=find(conditionOptions,form.condition)??conditionOptions[0];
 const exterior=find(colourOptions,form.exterior),interior=find(colourOptions,form.interior),transmission=find(transmissionOptions,form.transmission),drive=find(driveOptions,form.drive),market=find(marketOptions,form.market);
 const mileage=Math.round(number(form.mileage)),hp=Math.round(number(form.power)),nm=Math.round(number(form.torque)),battery=number(form.battery),range=Math.round(number(form.range)),seats=Math.round(number(form.seats)),price=Math.round(number(form.price));
 const name=form.model.trim(),brand=form.brand.trim(),year=Number(form.year),trim=form.trim.trim(),engine=form.engine.trim();
 const cycle=form.rangeCycle.trim();
 const rangeText:Localized|undefined=power.category==="electric"&&range?{en:"Up to "+grouped(range)+" km"+(cycle?" ("+cycle+")":""),ar:"حتى "+grouped(range)+" كم"+(cycle?" ("+cycle+")":"")}:undefined;
 const specs=[
  spec("Model year",{en:String(year),ar:String(year)}),
  ...(trim?[spec("Trim / edition",{en:trim,ar:trim})]:[]),
  spec("Condition",{en:condition.en,ar:condition.ar}),
  spec("Mileage",{en:grouped(mileage)+" km",ar:grouped(mileage)+" كم"}),
  spec("Fuel / powertrain",{en:power.en,ar:power.ar}),
  ...(engine?[spec("Engine / hybrid system",{en:engine,ar:engine})]:[]),
  ...(hp?[spec("Power",{en:grouped(hp)+" hp",ar:grouped(hp)+" حصان"})]:[]),
  ...(nm?[spec("Torque",{en:grouped(nm)+" Nm",ar:grouped(nm)+" نيوتن متر"})]:[]),
  spec("Body style",{en:body.en,ar:body.ar}),
  ...(seats?[spec("Seats",{en:String(seats),ar:String(seats)})]:[]),
  ...(transmission?[spec("Transmission",{en:transmission.en,ar:transmission.ar})]:[]),
  ...(exterior?[spec("Exterior colour",{en:exterior.en,ar:exterior.ar})]:[]),
  ...(interior?[spec("Interior colour",{en:interior.en,ar:interior.ar})]:[]),
  ...(battery?[spec("Battery (seller stated)",{en:grouped(battery)+" kWh",ar:grouped(battery)+" كيلوواط/ساعة"})]:[]),
  ...(drive?[spec("Drive",{en:drive.en,ar:drive.ar})]:[]),
  ...(rangeText?[spec("Advertised driving range",rangeText)]:[]),
  ...(market?[spec("Market specification",{en:market.en,ar:market.ar})]:[]),
 ];
 const autoEn=year+" "+brand+" "+name+". "+condition.en+"; "+grouped(mileage)+" km."+(trim?" "+trim+".":"");
 const autoAr=brand+" "+name+" موديل "+year+". "+condition.ar+"؛ عداد "+grouped(mileage)+" كم."+(trim?" "+trim+".":"");
 return {
  id,brand,name,year,image:photos[0],gallery:photos,
  categories:[power.category,...(body.key==="SUV"?["suv"]:[]),...(form.premium?["premium"]:[])],
  color:exterior?{en:exterior.en+" exterior",ar:"لون خارجي "+exterior.ar}:{en:"Colour on request",ar:"اللون عند الطلب"},
  type:{en:body.en+" · "+power.en,ar:body.ar+" · "+power.ar},
  description:{en:form.descriptionEn.trim()||autoEn,ar:form.descriptionAr.trim()||autoAr},
  facts:{en:[power.en,condition.en,grouped(mileage)+" km",...(trim?[trim]:[])],ar:[power.ar,condition.ar,grouped(mileage)+" كم",...(trim?[trim]:[])]},
  specs,post:"",
  ...(price?{price:{amount:price,currency:"JOD" as const}}:{}),
  ...(rangeText?{range:rangeText}:{}),
  status:form.status,form:form as unknown as Record<string,unknown>,addedAt,
 };
}

/** Quick edits allowed on cars from the dealer snapshot. */
export type QuickForm={price:string;status:VehicleStatus;condition:string;mileage:string;power:string;torque:string;exterior:string;descriptionEn:string;descriptionAr:string};
const specEn=(vehicle:VehicleRecord,label:string)=>vehicle.specs?.find(item=>item.label.en===label)?.value.en??"";
const digits=(text:string)=>{const match=text.replace(/,/g,"").match(/\d+(?:\.\d+)?/);return match?match[0]:"";};
export function quickFormFor(vehicle:VehicleRecord):QuickForm{
 return {price:vehicle.price?String(vehicle.price.amount):"",status:vehicle.status??"available",condition:specEn(vehicle,"Condition")||"New",mileage:digits(specEn(vehicle,"Mileage")),power:digits(specEn(vehicle,"Power")),torque:digits(specEn(vehicle,"Torque")),exterior:colourOptions.find(option=>option.en===specEn(vehicle,"Exterior colour"))?.key??"",descriptionEn:vehicle.description.en,descriptionAr:vehicle.description.ar};
}
/** Turns a quick form into the smallest edit against the original dealer listing. */
export function quickEdit(original:VehicleRecord,form:QuickForm):VehicleEdit|undefined{
 const before=quickFormFor(original),edit:VehicleEdit={},specs:Record<string,Localized|null>={};
 if(form.price!==before.price)edit.price=number(form.price)?Math.round(number(form.price)):null;
 if(form.status!=="available"||before.status!=="available")if(form.status!==before.status)edit.status=form.status;
 if(form.condition!==before.condition){const option=find(conditionOptions,form.condition);if(option)specs.Condition={en:option.en,ar:option.ar};}
 if(form.mileage!==before.mileage){const km=Math.round(number(form.mileage));specs.Mileage={en:grouped(km)+" km",ar:grouped(km)+" كم"};}
 if(form.power!==before.power){const hp=Math.round(number(form.power));specs.Power=hp?{en:grouped(hp)+" hp",ar:grouped(hp)+" حصان"}:null;}
 if(form.torque!==before.torque){const nm=Math.round(number(form.torque));specs.Torque=nm?{en:grouped(nm)+" Nm",ar:grouped(nm)+" نيوتن متر"}:null;}
 if(form.exterior!==before.exterior){const option=find(colourOptions,form.exterior);if(option){specs["Exterior colour"]={en:option.en,ar:option.ar};edit.color={en:option.en+" exterior",ar:"لون خارجي "+option.ar};}}
 if(form.descriptionEn.trim()!==before.descriptionEn||form.descriptionAr.trim()!==before.descriptionAr)edit.description={en:form.descriptionEn.trim()||before.descriptionEn,ar:form.descriptionAr.trim()||before.descriptionAr};
 if(Object.keys(specs).length)edit.specs=specs;
 return Object.keys(edit).length?edit:undefined;
}

/** Resizes a photo in the browser to at most 1600px on its long side. */
export async function preparePhoto(file:File):Promise<{bytes:Uint8Array;ext:"webp"|"jpg";url:string}>{
 const bitmap=await createImageBitmap(file);
 const scale=Math.min(1,1600/Math.max(bitmap.width,bitmap.height));
 const canvas=document.createElement("canvas");
 canvas.width=Math.round(bitmap.width*scale);canvas.height=Math.round(bitmap.height*scale);
 canvas.getContext("2d")!.drawImage(bitmap,0,0,canvas.width,canvas.height);
 bitmap.close();
 const toBlob=(type:string,quality:number)=>new Promise<Blob|null>(resolve=>canvas.toBlob(resolve,type,quality));
 let blob=await toBlob("image/webp",0.86),ext:"webp"|"jpg"="webp";
 if(!blob||blob.type!=="image/webp"){blob=await toBlob("image/jpeg",0.88);ext="jpg";}
 if(!blob)throw new Error("Could not read this photo.");
 return {bytes:new Uint8Array(await blob.arrayBuffer()),ext,url:URL.createObjectURL(blob)};
}

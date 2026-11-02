// Checks what the admin panel saves (src/admin-data.json, src/site-settings.json) before a deploy.
import assert from "node:assert/strict";
import {stat} from "node:fs/promises";
import {catalog,adminData,siteSettings,inventory} from "./inventory.mjs";

const catalogIds=new Set(catalog.map(vehicle=>vehicle.id));
const statuses=new Set(["available","reserved","sold"]);
const bodies=new Set(["SUV","Sedan","Pickup","Van","Coupe","Shooting brake","Targa","Refrigerated truck"]);
const localized=(value,where)=>{for(const lang of ["en","ar"])assert.ok(typeof value?.[lang]==="string"&&value[lang].trim(),"Missing "+lang+" text: "+where);};
const exists=async path=>{const info=await stat("public"+path).catch(()=>null);assert.ok(info?.isFile()&&info.size>0,"Missing photo file: "+path);};

assert.equal(adminData.version,1,"admin-data.json version");
assert.ok(Array.isArray(adminData.cars)&&Array.isArray(adminData.hidden)&&adminData.edits&&typeof adminData.edits==="object","admin-data.json shape");
const added=new Set();
for(const car of adminData.cars){
 assert.match(car.id,/^9\d{8}$/,"Added car id: "+car.id);
 assert.ok(!catalogIds.has(car.id)&&!added.has(car.id),"Duplicate car id: "+car.id);added.add(car.id);
 assert.ok(car.brand?.trim()&&car.name?.trim()&&/^\d{4}$/.test(String(car.year)),"Added car needs brand, model and year: "+car.id);
 assert.ok(car.image?.startsWith("/assets/uploads/"),"Added car needs an uploaded photo: "+car.id);
 for(const photo of new Set([car.image,...(car.gallery??[])])){assert.ok(photo.startsWith("/assets/uploads/"),"Unexpected photo path: "+photo);await exists(photo);}
 assert.ok(["electric","hybrid","gasoline"].some(category=>car.categories?.includes(category)),"Added car needs a powertrain category: "+car.id);
 assert.ok(bodies.has(car.type?.en?.split(" · ")[0]),"Added car needs a known body style: "+car.id);
 for(const key of ["color","type","description"])localized(car[key],car.id+" "+key);
 for(const spec of car.specs??[]){localized(spec.label,car.id+" spec label");localized(spec.value,car.id+" "+spec.label.en);}
 if(car.status)assert.ok(statuses.has(car.status),"Status: "+car.id);
 if(car.price)assert.ok(car.price.amount>0&&car.price.currency==="JOD","Price: "+car.id);
}
for(const [id,edit] of Object.entries(adminData.edits)){
 assert.ok(catalogIds.has(id)||added.has(id),"Edit for an unknown car: "+id);
 if(edit.status)assert.ok(statuses.has(edit.status),"Status: "+id);
 if(edit.price!==undefined&&edit.price!==null)assert.ok(Number.isFinite(edit.price)&&edit.price>0,"Price: "+id);
 for(const [label,value] of Object.entries(edit.specs??{}))if(value!==null)localized(value,id+" "+label);
}
for(const id of adminData.hidden)assert.ok(catalogIds.has(id)||added.has(id),"Hidden car does not exist: "+id);

assert.match(siteSettings.phone.replace(/[\s-]/g,""),/^\+?\d{9,15}$/,"Phone number");
assert.match(siteSettings.whatsapp,/^\d{9,15}$/,"WhatsApp number (digits only, with country code)");
for(const key of ["address","city"])localized(siteSettings[key],key);
for(const key of ["instagram","facebook"])assert.ok(/^https:\/\//.test(siteSettings[key]),key+" link");
assert.ok(siteSettings.mapsQuery?.trim(),"Map search text");
const days=new Set(["sat","sun","mon","tue","wed","thu","fri"]);
for(const day of siteSettings.hours){assert.ok(days.has(day.day),"Opening day");if(!day.closed){assert.match(day.open??"",/^\d{2}:\d{2}$/,"Opening time");assert.match(day.close??"",/^\d{2}:\d{2}$/,"Closing time");}}
const listed=id=>inventory.some(vehicle=>vehicle.id===id&&vehicle.status!=="sold");
assert.ok(siteSettings.bannerCars.length>=1&&siteSettings.bannerCars.length<=6,"Choose 1 to 6 banner cars");
for(const id of siteSettings.bannerCars)assert.ok(listed(id),"Banner car is missing, hidden or sold: "+id);
assert.ok(siteSettings.featuredCars.length<=12,"At most 12 featured cars");
for(const id of siteSettings.featuredCars)assert.ok(listed(id),"Featured car is missing, hidden or sold: "+id);
console.log("Verified admin data: "+adminData.cars.length+" added cars, "+Object.keys(adminData.edits).length+" edits, "+adminData.hidden.length+" hidden; "+inventory.length+" car pages; settings with "+siteSettings.bannerCars.length+" banner and "+siteSettings.featuredCars.length+" featured cars.");

/**
 * The cars shown on the site = the audited dealer snapshot (catalog-data.json)
 * merged with what showroom staff change in the admin panel (admin-data.json):
 * cars they add, per-car edits (price, status, specs) and cars they hide.
 * scripts/inventory.mjs applies the same rules for the build scripts; keep them in step.
 */
export type Localized={en:string;ar:string};
export type VehicleStatus="available"|"reserved"|"sold";
export type VehicleRecord={
 id:string;brand:string;name:string;year:number|string;image:string;
 categories:string[];color:Localized;type:Localized;description:Localized;
 facts:{en:string[];ar:string[]};
 specs?:{label:Localized;value:Localized}[];
 gallery?:string[];post:string;sourceLabel?:Localized;
 price?:{amount:number;currency:"JOD"};
 range?:Localized;
 status?:VehicleStatus;
 /** Cars added in the admin panel keep the form they were made from, so they can be edited again. */
 form?:Record<string,unknown>;
 addedAt?:string;
 /** Equipment chosen in the admin panel (panorama, HUD…). When absent, the researched equipment is shown. */
 features?:string[];
};
export type VehicleEdit={
 price?:number|null;
 status?:VehicleStatus;
 /** Keyed by the English spec label; null removes that spec. */
 specs?:Record<string,Localized|null>;
 color?:Localized;
 description?:Localized;
 range?:Localized|null;
 /** A dealer listing edited in full in the admin panel: this record replaces the listing (id and source link stay). */
 replace?:VehicleRecord;
};
export type AdminData={version:1;cars:VehicleRecord[];edits:Record<string,VehicleEdit>;hidden:string[]};

export function applyEdit(vehicle:VehicleRecord,edit?:VehicleEdit):VehicleRecord{
 if(!edit)return vehicle;
 const base=edit.replace?{...edit.replace,id:vehicle.id,post:vehicle.post,sourceLabel:vehicle.sourceLabel}:vehicle;
 const next:VehicleRecord={...base};
 if(edit.price===null)delete next.price;
 else if(typeof edit.price==="number"&&edit.price>0)next.price={amount:Math.round(edit.price),currency:"JOD"};
 if(edit.status)next.status=edit.status;
 if(edit.color)next.color=edit.color;
 if(edit.description)next.description=edit.description;
 if(edit.range===null)delete next.range;else if(edit.range)next.range=edit.range;
 if(edit.specs){
  const specs=[...(base.specs??[])];
  for(const [label,value] of Object.entries(edit.specs)){
   const index=specs.findIndex(spec=>spec.label.en===label);
   if(value===null){if(index>=0)specs.splice(index,1);continue;}
   if(index>=0)specs[index]={label:specs[index].label,value};
   else{const before=specs.findIndex(spec=>spec.label.en==="Dealer listing ID");specs.splice(before>=0?before:specs.length,0,{label:{en:label,ar:specLabelsAr[label]??label},value});}
  }
  next.specs=specs;
 }
 return next;
}

export function mergeInventory(catalog:readonly VehicleRecord[],admin:AdminData):VehicleRecord[]{
 const hidden=new Set(admin.hidden);
 const catalogIds=new Set(catalog.map(vehicle=>vehicle.id));
 const added=admin.cars.filter(car=>!catalogIds.has(car.id));
 return [...added,...catalog].filter(vehicle=>!hidden.has(vehicle.id)).map(vehicle=>applyEdit(vehicle,admin.edits[vehicle.id]));
}

/** Arabic labels for the standard specification rows. */
export const specLabelsAr:Record<string,string>={"Model year": "سنة الموديل", "Trim / edition": "الفئة / الإصدار", "Condition": "الحالة", "Mileage": "المسافة المقطوعة", "Fuel / powertrain": "الوقود / نظام الحركة", "Body style": "نوع الهيكل", "Seats": "المقاعد", "Transmission": "ناقل الحركة", "Exterior colour": "اللون الخارجي", "Interior colour": "لون المقصورة", "Engine / hybrid system": "المحرك / النظام الهجين", "Power": "القوة", "Torque": "عزم الدوران", "Drive": "نظام الدفع", "Market specification": "فئة المواصفات", "Dealer listing ID": "رقم إعلان المعرض", "Battery (seller stated)": "البطارية (بحسب الإعلان)", "Advertised driving range": "مدى القيادة المعلن"};

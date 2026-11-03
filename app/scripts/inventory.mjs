// Build-script copy of the merge rules in src/inventory.ts (keep the two in step).
import {readFileSync} from "node:fs";
const read=path=>JSON.parse(readFileSync(new URL(path,import.meta.url),"utf8"));
export const catalog=read("../src/catalog-data.json");
export const adminData=read("../src/admin-data.json");
export const siteSettings=read("../src/site-settings.json");
function applyEdit(vehicle,edit){
 if(!edit)return vehicle;
 const base=edit.replace?{...edit.replace,id:vehicle.id,post:vehicle.post,sourceLabel:vehicle.sourceLabel}:vehicle;
 const next={...base};
 if(edit.price===null)delete next.price;else if(typeof edit.price==="number"&&edit.price>0)next.price={amount:Math.round(edit.price),currency:"JOD"};
 if(edit.status)next.status=edit.status;
 if(edit.color)next.color=edit.color;
 if(edit.description)next.description=edit.description;
 if(edit.range===null)delete next.range;else if(edit.range)next.range=edit.range;
 if(edit.specs){const specs=[...(base.specs??[])];for(const [label,value] of Object.entries(edit.specs)){const index=specs.findIndex(spec=>spec.label.en===label);if(value===null){if(index>=0)specs.splice(index,1);continue;}if(index>=0)specs[index]={label:specs[index].label,value};else specs.push({label:{en:label,ar:label},value});}next.specs=specs;}
 return next;
}
export function mergeInventory(base=catalog,admin=adminData){
 const hidden=new Set(admin.hidden),ids=new Set(base.map(vehicle=>vehicle.id));
 return [...admin.cars.filter(car=>!ids.has(car.id)),...base].filter(vehicle=>!hidden.has(vehicle.id)).map(vehicle=>applyEdit(vehicle,admin.edits[vehicle.id]));
}
/** Every car with a page (sold cars keep their page; hidden cars have none). */
export const inventory=mergeInventory();

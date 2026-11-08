import type {Lang,Vehicle} from "./site-data";
import references from "./fuel-consumption-data.json";
import type {VehicleFeatureName} from "./components/vehicle-feature-icon";
import {westernDigits} from "./number-format";

type Reference={brand:string;name:string;year:string;engine:string;trim:string;value:string;cycle:string;note:{en:string;ar:string};sourceURL:string};
export type EfficiencyFact={label:string;value:string;icon:VehicleFeatureName;note?:string;sourceURL?:string};
const records:Record<string,Reference>=references;
const spec=(vehicle:Vehicle,label:string)=>vehicle.specs?.find(item=>item.label.en===label)?.value;

/** Range for BEVs; fuel use for petrol/PHEV/HEV/REEV. Never infer fuel use from battery capacity or range. */
export function efficiencyFact(vehicle:Vehicle,lang:Lang):EfficiencyFact{
 if(vehicle.categories.includes("electric"))return {label:lang==="ar"?"المدى الكهربائي":"Electric range",value:westernDigits(vehicle.range?.[lang]??spec(vehicle,"Advertised driving range")?.[lang]??(lang==="ar"?"غير معلن":"Not published")),icon:"range"};
 const label=lang==="ar"?"صرف الوقود":"Fuel consumption";
 const published=spec(vehicle,"Fuel consumption")??spec(vehicle,"Combined fuel consumption");
 if(published)return {label,value:westernDigits(published[lang]),icon:"energy"};
 const reference=records[vehicle.id];
 // An admin can replace a listing with another car. Do not carry old reference figures over to that car.
 if(reference&&reference.brand===vehicle.brand&&reference.name===vehicle.name&&reference.year===String(vehicle.year)&&reference.engine===(spec(vehicle,"Engine / hybrid system")?.en??"")&&reference.trim===(spec(vehicle,"Trim / edition")?.en??""))return {label,value:reference.value+" L/100km",icon:"energy",note:reference.cycle+" · "+reference.note[lang],sourceURL:reference.sourceURL};
 return {label,value:lang==="ar"?"غير متوفر":"Not available",icon:"energy",note:lang==="ar"?"L/100km · أكد الرقم مع المعرض":"L/100km · confirm with showroom"};
}

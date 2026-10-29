import {readFileSync} from "node:fs";

const catalog=JSON.parse(readFileSync(new URL("../src/catalog-data.json",import.meta.url),"utf8"));
export const vehicleIds=catalog.map(vehicle=>String(vehicle.id));
export const v2Views=["","cars","features","updates","contact"];
export const legacyPaths=["/","/ar/","/privacy/","/ar/privacy/","/terms/","/ar/terms/"];
export const v2Paths=["","/ar"].flatMap(prefix=>[
 ...v2Views.map(view=>prefix+"/v2/"+(view?view+"/":"")),
 ...vehicleIds.map(id=>prefix+"/v2/car/"+id+"/")
]);
export const pagePaths=[...legacyPaths,...v2Paths];

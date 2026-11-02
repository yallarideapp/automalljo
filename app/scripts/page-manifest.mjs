import {inventory} from "./inventory.mjs";

export const vehicleIds=inventory.map(vehicle=>String(vehicle.id));
export const v2Views=["","cars","features","updates","contact","saved","compare"];
export const legacyPaths=["/","/ar/","/privacy/","/ar/privacy/","/terms/","/ar/terms/"];
export const v2Paths=["","/ar"].flatMap(prefix=>[
 ...v2Views.map(view=>prefix+"/v2/"+(view?view+"/":"")),
 ...vehicleIds.map(id=>prefix+"/v2/car/"+id+"/")
]);
export const pagePaths=[...legacyPaths,...v2Paths];
/** The staff admin panel: prerendered, but left out of the sitemap and page checks. */
export const adminPaths=["/admin/"];

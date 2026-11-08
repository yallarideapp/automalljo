import {inventory} from "./inventory.mjs";

export const vehicleIds=inventory.map(vehicle=>String(vehicle.id));
export const v2Views=["","cars","features","updates","contact","saved","compare"];
export const legacyPaths=["/privacy/","/ar/privacy/","/terms/","/ar/terms/"];
/** The old homepage addresses: prerendered pages that send visitors to the current design (left out of the sitemap). */
export const redirectPaths={"/":"/v2/","/ar/":"/ar/v2/"};
export const v2Paths=["","/ar"].flatMap(prefix=>[
 ...v2Views.map(view=>prefix+"/v2/"+(view?view+"/":"")),
 ...vehicleIds.map(id=>prefix+"/v2/car/"+id+"/")
]);
export const pagePaths=[...legacyPaths,...v2Paths];
/** The staff admin panel: prerendered, but left out of the sitemap and page checks. */
export const adminPaths=["/admin/"];
/** One shared page for cars added in a browser's admin panel (read from that browser, by ?id=). */
export const localCarPaths=["/v2/car/local/","/ar/v2/car/local/"];

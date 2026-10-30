import {describe,expect,test} from "bun:test";
import {vehicles,type Vehicle} from "../src/site-data";
import {bodyStyles,bodyStyleFor,defaultFilters,filterVehicles,filtersFromSearch,filtersToSearch,powertrains} from "../src/v2-catalog";
import {pagePaths,vehicleIds} from "../scripts/page-manifest.mjs";

describe("AutoMall V2 catalogue navigation",()=>{
 test("keeps every public listing in exactly one powertrain and body category",()=>{
  expect(vehicles).toHaveLength(70);
  const powerCounts=Object.fromEntries(powertrains.map(power=>[power.id,filterVehicles({...defaultFilters,powertrain:power.id}).length]));
  expect(powerCounts).toEqual({electric:27,hybrid:34,gasoline:9});
  expect(Object.values(powerCounts).reduce((total,count)=>total+count,0)).toBe(vehicles.length);
  const bodyCounts=Object.fromEntries(bodyStyles.map(body=>[body.id,filterVehicles({...defaultFilters,body:body.id}).length]));
  expect(bodyCounts).toEqual({suv:49,sedan:11,pickup:3,van:3,coupe:1,"shooting-brake":1,targa:1,truck:1});
  expect(vehicles.every(vehicle=>bodyStyleFor(vehicle)!=="other")).toBe(true);
  expect(Object.values(bodyCounts).reduce((total,count)=>total+count,0)).toBe(vehicles.length);
 });

 test("intersects independent powertrain and body selections",()=>{
  const combinations=[
   ["electric","suv",15],["electric","sedan",5],["hybrid","suv",29],
   ["hybrid","sedan",4],["gasoline","suv",5],["gasoline","sedan",2],
   ["electric","pickup",3],["hybrid","pickup",0],["gasoline","targa",1],
  ] as const;
  for(const [powertrain,body,count] of combinations){
   const results=filterVehicles({...defaultFilters,powertrain,body});
   expect(results).toHaveLength(count);
   expect(results.every(vehicle=>vehicle.categories.includes(powertrain)&&bodyStyleFor(vehicle)===body)).toBe(true);
  }
 });

 test("keeps an incompatible selection empty instead of discarding a filter",()=>{
  const filters={...defaultFilters,powertrain:"hybrid",body:"pickup",brand:"BMW"};
  expect(filterVehicles(filters)).toHaveLength(0);
  expect(filtersFromSearch(new URLSearchParams(filtersToSearch(filters)))).toEqual(filters);
 });

 test("combines brand and model search with category filters",()=>{
  expect(filterVehicles({...defaultFilters,powertrain:"electric",body:"sedan",brand:"BMW"})).toHaveLength(2);
  const camry=filterVehicles({...defaultFilters,powertrain:"hybrid",body:"sedan",query:" cAmRy "});
  expect(camry.map(vehicle=>vehicle.id)).toEqual(["288432146"]);
  expect(filterVehicles({...defaultFilters,query:"unmatched-example-model"})).toHaveLength(0);
 });

 test("equipment selection retains the exact listing and its EV range",()=>{
  const results=filterVehicles({...defaultFilters,powertrain:"electric",body:"suv",brand:"Zeekr",equipment:"hud"});
  expect(results.map(vehicle=>vehicle.id)).toEqual(["288700472"]);
  expect(results[0].range?.en).toBe("615 km (cycle unspecified)");
 });

 test("serializes filters for reload, links, back navigation and language switching",()=>{
  const selected={powertrain:"electric",body:"sedan",brand:"BMW",equipment:"hud",query:"BMW i5",sort:"price-desc",yearFrom:"2024",yearTo:"2026"};
  const serialized=filtersToSearch(selected);
  expect(serialized.startsWith("?")).toBe(false);
  expect(filtersFromSearch(new URLSearchParams(serialized))).toEqual(selected);
  expect(filtersToSearch(defaultFilters)).toBe("");
  expect(filtersFromSearch(new URLSearchParams())).toEqual(defaultFilters);
 });

 test("rejects unsupported URL selections and bounds the search field",()=>{
  const selected=filtersFromSearch(new URLSearchParams({powertrain:"diesel",body:"hatchback",brand:"Missing brand",equipment:"made-up-feature",sort:"random",q:"x".repeat(250)}));
  expect(selected).toEqual({...defaultFilters,query:"x".repeat(100)});
 });

 test("sorts known prices in either direction while keeping unpriced listings last",()=>{
  const sample:Vehicle[]=[
   {...vehicles[0],id:"unknown-a",price:undefined},
   {...vehicles[1],id:"expensive",price:{amount:30000,currency:"JOD"}},
   {...vehicles[2],id:"cheap",price:{amount:10000,currency:"JOD"}},
   {...vehicles[3],id:"unknown-b",price:undefined},
  ];
  expect(filterVehicles({...defaultFilters,sort:"price"},sample).map(vehicle=>vehicle.id)).toEqual(["cheap","expensive","unknown-a","unknown-b"]);
  expect(filterVehicles({...defaultFilters,sort:"price-desc"},sample).map(vehicle=>vehicle.id)).toEqual(["expensive","cheap","unknown-a","unknown-b"]);
  expect(sample.map(vehicle=>vehicle.id)).toEqual(["unknown-a","expensive","cheap","unknown-b"]);
 });

 test("preserves all static detail routes and their Arabic counterparts",()=>{
  expect(vehicleIds).toHaveLength(70);
  expect(pagePaths).toHaveLength(156);
  expect(new Set(pagePaths).size).toBe(pagePaths.length);
  for(const id of vehicleIds){
   expect(pagePaths).toContain("/v2/car/"+id+"/");
   expect(pagePaths).toContain("/ar/v2/car/"+id+"/");
  }
  for(const prefix of ["","/ar"])for(const page of ["","cars/","features/","updates/","contact/"])expect(pagePaths).toContain(prefix+"/v2/"+page);
 });
 test("filters by a from-to model year range",()=>{
  const ranged=filterVehicles({...defaultFilters,yearFrom:"2020",yearTo:"2025"});
  expect(ranged.length).toBeGreaterThan(0);
  expect(ranged.every(vehicle=>Number(vehicle.year)>=2020&&Number(vehicle.year)<=2025)).toBe(true);
  expect(filterVehicles({...defaultFilters,yearFrom:"2027"}).every(vehicle=>Number(vehicle.year)===2027)).toBe(true);
  expect(filtersFromSearch(new URLSearchParams("from=1990&to=2026")).yearFrom).toBe("all");
 });
});

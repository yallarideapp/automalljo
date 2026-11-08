import {describe,expect,test} from "bun:test";
import {catalogVehicles as vehicles} from "../src/site-data";
import {formatMoney,westernDigits} from "../src/number-format";
import {efficiencyFact} from "../src/v2-efficiency";
import {monthlyPayment} from "../src/v2-garage";

describe("Arabic numbers and vehicle running figures",()=>{
 test("keeps Western digits and comma-separated prices in both languages",()=>{
  expect(formatMoney(32900,"ar")).toBe("32,900 دينار");
  expect(formatMoney(32900,"en")).toBe("JOD 32,900");
  expect(westernDigits("٢٩٬٠٠٠")).toBe("29,000");
  expect(westernDigits("۶٫۴۵")).toBe("6.45");
 });
 test("keeps every advertised electric range and never labels it as fuel use",()=>{
  for(const vehicle of vehicles.filter(item=>item.categories.includes("electric")))for(const lang of ["en","ar"] as const){
   expect(efficiencyFact(vehicle,lang).value).toBe(vehicle.range?.[lang]);
   expect(efficiencyFact(vehicle,lang).icon).toBe("range");
  }
 });
 test("uses the matching Camry fuel reference and rejects it after an admin replaces the car",()=>{
  const car=vehicles.find(vehicle=>vehicle.id==="288432146")!;
  expect(efficiencyFact(car,"ar").value).toBe("4.5 L/100km");
  expect(efficiencyFact(car,"ar").note).toContain("EPA");
  expect(efficiencyFact({...car,year:2025},"ar").sourceURL).toBeUndefined();
  expect(efficiencyFact({...car,brand:"Other"},"ar").value).toBe("غير متوفر");
 });
 test("does not substitute a charged PHEV figure for its depleted-battery reference",()=>{
  const jetour=vehicles.find(vehicle=>vehicle.id==="288440948")!;
  expect(efficiencyFact(jetour,"en").value).toBe("8.8 L/100km");
  expect(efficiencyFact(jetour,"en").note).toContain("Charge-depleted");
 });
 test("leaves an unverified petrol model explicitly unavailable",()=>{
  const car=vehicles.find(vehicle=>vehicle.id==="289156416")!;
  expect(efficiencyFact(car,"en").value).toBe("Not available");
  expect(efficiencyFact(car,"en").sourceURL).toBeUndefined();
 });
 test("calculates zero-rate and reducing-balance monthly payments",()=>{
  expect(monthlyPayment(24000,0,5)).toBe(400);
  expect(monthlyPayment(24000,5,5)).toBeCloseTo(452.91,2);
  expect(monthlyPayment(0,5,5)).toBe(0);
 });
});

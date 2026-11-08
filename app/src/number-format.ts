import type {Lang} from "./site-data";

/** The storefront uses Western digits and comma grouping in both languages. */
export const formatNumber=(value:number,maximumFractionDigits=0)=>new Intl.NumberFormat("en-US",{maximumFractionDigits}).format(value);
export const formatMoney=(value:number,lang:Lang)=>lang==="ar"?formatNumber(Math.round(value))+" دينار":"JOD "+formatNumber(Math.round(value));
export const westernDigits=(value:string)=>value.replace(/[٠-٩۰-۹]/g,char=>String("٠١٢٣٤٥٦٧٨٩".includes(char)?"٠١٢٣٤٥٦٧٨٩".indexOf(char):"۰۱۲۳۴۵۶۷۸۹".indexOf(char))).replace(/٬/g,",").replace(/٫/g,".");

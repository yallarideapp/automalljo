import {assetPath} from "./site-paths";

export type BrandLogoAsset={src:string;source:string;name:string;tone?:"dark"|"light"};
const asset=(file:string,source:string,name:string,tone:"dark"|"light"="light"):BrandLogoAsset=>({src:assetPath("assets/brands/"+file),source,name,tone});
const dataset="https://github.com/filippofilip95/car-logos-dataset";
export const brandLogos:Record<string,BrandLogoAsset>={
 "ARCFOX":asset("arcfox.png",dataset,"ARCFOX"),
 "Audi":asset("audi.png",dataset,"Audi"),
 "AVATR":asset("avatr.svg","https://www.avatr.com/","AVATR","dark"),
 "BAIC":asset("baic-motor.png",dataset,"BAIC"),
 "BAW":asset("baw.svg","https://bawauto.com/","BAW"),
 "BMW":asset("bmw.png",dataset,"BMW"),
 "BYD":asset("byd.png",dataset,"BYD"),
 "BYD Yangwang":asset("yangwang.svg","https://www.yangwangauto.com/cn","Yangwang","dark"),
 "Chery iCAR":asset("chery-icar.svg","https://www.icarglobal.com/zh/","iCAR"),
 "EXEED":asset("exeed.png",dataset,"EXEED"),
 "GAC":asset("gac-group.png",dataset,"GAC"),
 "GAC Aion":asset("gac-aion.png","https://www.aion.com.cn/","Aion","dark"),
 "Geely Farizon":asset("farizon.svg","https://farizonauto.co.uk/","Farizon","dark"),
 "Hongqi":asset("hongqi.png",dataset,"Hongqi"),
 "Jetour":asset("jetour.png",dataset,"Jetour"),
 "Land Rover":asset("land-rover.png",dataset,"Land Rover"),
 "Lynk & Co":asset("lynk-and-co.png",dataset,"Lynk & Co"),
 "Maserati":asset("maserati.png",dataset,"Maserati"),
 "Mercedes-Benz":asset("mercedes-benz.png",dataset,"Mercedes-Benz"),
 "MG":asset("mg.png",dataset,"MG"),
 "Porsche":asset("porsche.png",dataset,"Porsche"),
 "Riddara":asset("riddara.svg","https://www.riddara.com/","Riddara"),
 "Rising":asset("rising.png","https://www.risingauto.com/","Rising","dark"),
 "SERES":asset("seres.png","https://www.global-seres.com/","SERES"),
 "Toyota":asset("toyota.png",dataset,"Toyota"),
 "Zeekr":asset("zeekr.png",dataset,"Zeekr"),
};
export const brandLogoFor=(brand:string):BrandLogoAsset|undefined=>brandLogos[brand];

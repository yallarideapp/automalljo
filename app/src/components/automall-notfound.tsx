import {SiteHeader,SiteFooter} from "./automall-site";
import {sitePath} from "@/site-paths";
import type {Lang} from "@/site-data";
export function AutoMallNotFound({lang="en"}:{lang?:Lang}){return <div className="automall-page legal-page" lang={lang} dir={lang==="ar"?"rtl":"ltr"}><SiteHeader lang={lang}/><main id="main-content" className="legal-content"><h1>{lang==="ar"?"نهاية هذا الطريق.":"That road ends here."}</h1><p>{lang==="ar"?"تعذر العثور على الصفحة. اختر سيارتك القادمة من تشكيلتنا.":"The page could not be found. Your next drive is waiting in the collection."}</p><a className="legal-back" href={sitePath("",lang)}>{lang==="ar"?"العودة إلى أوتومول":"Back to AutoMall"} ↗</a></main><SiteFooter lang={lang}/></div>;}

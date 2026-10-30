import {readFile,writeFile,stat} from "node:fs/promises";
import {join} from "node:path";
import {pagePaths,v2Paths,vehicleIds} from "./page-manifest.mjs";

const out="dist/client";
const fileFor=path=>path.replace(/^\//,"")+"index.html";
const htmlFiles=pagePaths.map(fileFor);
const artIds=["electric","hybrid","gasoline","suv","sedan","pickup","van","coupe","shooting-brake","targa","truck"];
const expected=[...htmlFiles,"404.html","robots.txt","sitemap.xml","site.webmanifest","assets/catalog/gallery-287890822-1.webp","assets/catalog/gallery-288440948-1.webp","assets/catalog/gallery-288630286-11.webp","assets/catalog/gallery-287516454-1.webp",...artIds.map(id=>"assets/categories/category-"+id+".webp")];
for(const path of expected){const info=await stat(join(out,path));if(!info.isFile()||info.size===0)throw new Error("Missing or empty static output: "+path);}

const source=process.env.VITE_SITE_URL;
if(!source)throw new Error("VITE_SITE_URL is required to verify localized canonical URLs.");
const site=source.replace(/\/+$/,"");
const base=process.env.VITE_BASE_PATH||"/";
const expectedBase="/"+base.replace(/^\/+|\/+$/g,"")+(base.replace(/^\/+|\/+$/g,"")?"/":"");
const escapeText=value=>value.replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#x27;"})[char]);
const tags=(html,name)=>html.match(new RegExp("<"+name+"\\b[^>]*>","g"))||[];
const hasClass=(html,name)=>new RegExp('class="[^\\"]*\\b'+name+'\\b[^\\"]*"').test(html);
const htmlByPath=new Map();
for(const path of pagePaths){
 const file=fileFor(path),html=await readFile(join(out,file),"utf8"),lang=path.startsWith("/ar/")?"ar":"en";
 htmlByPath.set(path,html);
 if(!new RegExp('<html[^>]+lang="'+lang+'"').test(html))throw new Error("Wrong HTML language: "+file);
 if(lang==="ar"&&!/<html[^>]+dir="rtl"/.test(html))throw new Error("Arabic HTML needs RTL: "+file);
 if(!html.includes("AutoMall")&&!html.includes("أوتومول"))throw new Error("Static page has no dealership content: "+file);
 if(!tags(html,"meta").some(tag=>tag.includes('name="robots"')&&tag.includes("noindex")))throw new Error("Premature search-engine indexing: "+file);
 if(!tags(html,"link").some(tag=>tag.includes('rel="canonical"')&&tag.includes('href="'+site+path+'"')))throw new Error("Incorrect localized canonical: "+file);
 if(/https:\/\/automalljo\.higgsfield\.app/.test(html))throw new Error("Old hosting URL in static page: "+file);
 if(expectedBase!=="/"&&/(?:src|href)="\/(?:assets|privacy|terms|v2|ar|site\.webmanifest)(?:\/|")/.test(html))throw new Error("Unprefixed root URL in "+file);
}

for(const path of ["/","/ar/"]){
 const html=htmlByPath.get(path);
 if((html.match(/class="am-photo-story__image"/g)||[]).length!==4)throw new Error("Expected four prerendered dealer photographs: "+path);
 if(html.includes('src="'+expectedBase+'assets/hero-car-v2.png"'))throw new Error("Old illustrative hero remains active: "+path);
}
for(const path of v2Paths)if(!hasClass(htmlByPath.get(path),"automall-v2"))throw new Error("Missing second-version page content: "+path);
for(const prefix of ["","/ar"]){
 const home=htmlByPath.get(prefix+"/v2/"),cars=htmlByPath.get(prefix+"/v2/cars/");
 if(home.includes('id="v2-collection"')||home.includes('id="v2-posts-heading"'))throw new Error("V2 homepage still includes a full catalogue or posts page: "+prefix);
 if(!hasClass(home,"v2-home-refined")||!hasClass(home,"v2-dealer-hero")||!hasClass(home,"v2-home-search")||!hasClass(home,"v2-category-grid")||!hasClass(home,"v2-home-featured"))throw new Error("V2 homepage is missing its photo banner, search form, category links or featured vehicles: "+prefix);
 if(!hasClass(cars,"v2-powertrain-tabs")||!hasClass(cars,"v2-body-filters"))throw new Error("V2 catalogue needs separate powertrain and body filters: "+prefix);
 if(hasClass(cars,"v2-hero"))throw new Error("Catalogue still includes the homepage hero: "+prefix);
 if(!/<svg\b[^>]*class="[^\"]*\bvehicle-feature-icon\b[^\"]*"/.test(cars))throw new Error("Missing prerendered vehicle feature icons: "+prefix);
 for(const view of ["features","updates","contact"])if(!/<h1\b/.test(htmlByPath.get(prefix+"/v2/"+view+"/")))throw new Error("V2 page has no primary heading: "+view);
}
const catalog=JSON.parse(await readFile(new URL("../src/catalog-data.json",import.meta.url),"utf8"));
for(const vehicle of catalog)for(const prefix of ["","/ar"]){
 const path=prefix+"/v2/car/"+vehicle.id+"/",html=htmlByPath.get(path),lang=prefix?"ar":"en";
 if(!html.includes('id="v2-detail-title"')||!hasClass(html,"v2-gallery-thumbs"))throw new Error("Missing standalone car gallery/details: "+path);
 if(!html.includes(escapeText(vehicle.brand)))throw new Error("Wrong vehicle in detail page: "+path);
 if(vehicle.range&&(!hasClass(html,"v2-range-panel")||!html.includes(escapeText(vehicle.range[lang]))))throw new Error("Missing electric range on car page: "+path);
 const images=[...new Set([vehicle.image,...(vehicle.gallery||[])])];
 for(const image of images)if(!html.includes(expectedBase+image.replace(/^\//,"")))throw new Error("Missing dealer gallery photograph on car page: "+path+" / "+image);
}

// GitHub Pages serves this recovery document at arbitrary missing paths.
const notFound=await readFile(join(out,"404.html"),"utf8");
await writeFile(join(out,"404.html"),notFound.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,"").replace(/<link\b(?=[^>]*rel="modulepreload")[^>]*>/gi,""));
await writeFile(join(out,".nojekyll"),"");
const robots=await readFile(join(out,"robots.txt"),"utf8");
if(!robots.includes("Disallow: /"))throw new Error("Robots indexing block was removed.");
const sitemap=await readFile(join(out,"sitemap.xml"),"utf8");
for(const path of pagePaths)if(!sitemap.includes("<loc>"+site+path+"</loc>"))throw new Error("Missing sitemap path: "+path);
console.log("Verified "+pagePaths.length+" localized static pages, "+vehicleIds.length+" standalone car pages per language, all galleries/ranges, separate catalogue filters, category artwork, recovery page and discovery files.");

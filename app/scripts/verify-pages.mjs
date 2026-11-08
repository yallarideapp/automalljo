import {readFile,writeFile,stat} from "node:fs/promises";
import {join} from "node:path";
import {pagePaths,redirectPaths,v2Paths,vehicleIds} from "./page-manifest.mjs";

const out="dist/client";
const fileFor=path=>path.replace(/^\//,"")+"index.html";
const htmlFiles=pagePaths.map(fileFor);
const artIds=["electric","hybrid","gasoline","suv","sedan","pickup","van","coupe","shooting-brake","targa","truck"];
const expected=[...htmlFiles,"404.html","robots.txt","sitemap.xml","site.webmanifest","assets/catalog/gallery-287890822-1.webp","assets/catalog/gallery-288440948-1.webp","assets/catalog/gallery-288630286-11.webp","assets/catalog/gallery-287516454-1.webp","assets/banner/banner-287516454.webp","assets/categories/photo-electric.webp","assets/categories/photo-hybrid.webp","assets/categories/photo-gasoline.webp","assets/thumbs/gallery-288630286-1.webp","assets/cards/gallery-288630286-1.webp","assets/banner/banner-288630286.webp","assets/banner/banner-288440948.webp","assets/banner/banner-288938770.webp",...artIds.map(id=>"assets/categories/category-"+id+".webp")];
for(const path of expected){const info=await stat(join(out,path));if(!info.isFile()||info.size===0)throw new Error("Missing or empty static output: "+path);}

const source=process.env.VITE_SITE_URL;
if(!source)throw new Error("VITE_SITE_URL is required to verify localized canonical URLs.");
const site=source.replace(/\/+$/,"");
const base=process.env.VITE_BASE_PATH||"/";
const expectedBase="/"+base.replace(/^\/+|\/+$/g,"")+(base.replace(/^\/+|\/+$/g,"")?"/":"");
const escapeText=value=>value.replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#x27;"})[char]);
const tags=(html,name)=>html.match(new RegExp("<"+name+"\\b[^>]*>","g"))||[];
const hasClass=(html,name)=>new RegExp('class="[^\\"]*\\b'+name+'\\b[^\\"]*"').test(html);
// Read the image itself: declared dimensions must match the bytes crawlers receive.
const previewSizes=new Map();
async function verifyPreview(html,path){
 const meta=tags(html,"meta"),value=name=>meta.find(tag=>tag.includes('property="'+name+'"'))?.match(/content="([^"]+)"/)?.[1];
 const image=value("og:image");
 if(!image?.startsWith(site+"/assets/"))throw new Error("Preview needs an absolute, self-hosted image: "+path);
 if(!previewSizes.has(image)){
  const bytes=await readFile(join(out,image.slice(site.length+1)));
  let size;
  if(bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))size=[bytes.readUInt32BE(16),bytes.readUInt32BE(20)];
  else if(bytes.readUInt16BE(0)===0xffd8){
   for(let offset=2;offset+4<bytes.length;){
    if(bytes[offset]!==0xff)break;
    const marker=bytes[offset+1],length=bytes.readUInt16BE(offset+2);
    if([0xc0,0xc1,0xc2,0xc3,0xc5,0xc6,0xc7,0xc9,0xca,0xcb,0xcd,0xce,0xcf].includes(marker)){size=[bytes.readUInt16BE(offset+7),bytes.readUInt16BE(offset+5)];break;}
    if(length<2)break;
    offset+=length+2;
   }
  }
  if(!size)throw new Error("Cannot read preview image dimensions: "+image);
  previewSizes.set(image,size);
 }
 const [width,height]=previewSizes.get(image);
 if(value("og:image:width")!==String(width)||value("og:image:height")!==String(height))throw new Error("Preview image dimensions do not match the image: "+path);
 if(!meta.some(tag=>tag.includes('name="twitter:image"')&&tag.includes('content="'+image+'"')))throw new Error("Twitter and Open Graph previews must use the same image: "+path);
}
const htmlByPath=new Map();
for(const path of pagePaths){
 const file=fileFor(path),html=await readFile(join(out,file),"utf8"),lang=path.startsWith("/ar/")?"ar":"en";
 htmlByPath.set(path,html);
 await verifyPreview(html,path);
 if(!new RegExp('<html[^>]+lang="'+lang+'"').test(html))throw new Error("Wrong HTML language: "+file);
 if(lang==="ar"&&!/<html[^>]+dir="rtl"/.test(html))throw new Error("Arabic HTML needs RTL: "+file);
 if(!html.includes("AutoMall")&&!html.includes("أوتومول"))throw new Error("Static page has no dealership content: "+file);
 if(!tags(html,"meta").some(tag=>tag.includes('name="robots"')&&tag.includes("noindex")))throw new Error("Premature search-engine indexing: "+file);
 if(!tags(html,"link").some(tag=>tag.includes('rel="canonical"')&&tag.includes('href="'+site+path+'"')))throw new Error("Incorrect localized canonical: "+file);
 if(/https:\/\/automalljo\.higgsfield\.app/.test(html))throw new Error("Old hosting URL in static page: "+file);
 if(expectedBase!=="/"&&/(?:src|href)="\/(?:assets|privacy|terms|v2|ar|site\.webmanifest)(?:\/|")/.test(html))throw new Error("Unprefixed root URL in "+file);
}

// The old homepage addresses send visitors to the current design.
for(const [path,target] of Object.entries(redirectPaths)){
 const html=await readFile(join(out,fileFor(path)),"utf8");
 await verifyPreview(html,path);
 if(!tags(html,"meta").some(tag=>tag.includes('http-equiv="refresh"')&&tag.includes(expectedBase+target.replace(/^\//,""))))throw new Error("Old homepage must redirect to "+target+": "+path);
 if(!tags(html,"link").some(tag=>tag.includes('rel="canonical"')&&tag.includes('href="'+site+target+'"')))throw new Error("Old homepage canonical must point to "+target+": "+path);
}
// Link previews and Google data: each car page names its own photo (which must exist) and carries Car data; home and showroom carry the dealership.
for(const prefix of ["","/ar"]){
 for(const id of vehicleIds){
  const html=htmlByPath.get(prefix+"/v2/car/"+id+"/");
  if(!tags(html,"meta").some(tag=>tag.includes('property="og:image"')&&tag.includes("/assets/og/car-"+id+".jpg")))throw new Error("Car page needs its own preview photo: "+prefix+" "+id);
  if(!/<script[^>]+application\/ld\+json[^>]*>[^<]*"@type":"Car"/.test(html))throw new Error("Car page needs Car structured data: "+prefix+" "+id);
  await readFile(join(out,"assets/og/car-"+id+".jpg")).catch(()=>{throw new Error("Missing preview photo for car "+id);});
 }
 for(const view of ["","contact/"])if(!/<script[^>]+application\/ld\+json[^>]*>[^<]*"@type":"AutoDealer"/.test(htmlByPath.get(prefix+"/v2/"+view)))throw new Error("Dealership structured data missing: "+prefix+"/v2/"+view);
 const descriptions=new Set(["","cars/","contact/"].map(view=>tags(htmlByPath.get(prefix+"/v2/"+view),"meta").find(tag=>tag.includes('name="description"'))));
 if(descriptions.size!==3)throw new Error("Pages need their own descriptions: "+prefix);
}
for(const path of v2Paths)if(!hasClass(htmlByPath.get(path),"automall-v2"))throw new Error("Missing second-version page content: "+path);
const {inventory:inventoryForBanner,siteSettings:siteSettingsForBanner}=await import("./inventory.mjs");
for(const prefix of ["","/ar"]){
 const home=htmlByPath.get(prefix+"/v2/"),cars=htmlByPath.get(prefix+"/v2/cars/");
 if(home.includes('id="v2-collection"')||home.includes('id="v2-posts-heading"'))throw new Error("V2 homepage still includes a full catalogue or posts page: "+prefix);
 if(!hasClass(home,"v2-home-refined")||!hasClass(home,"v2-dealer-hero")||!hasClass(home,"v2-home-search")||!hasClass(home,"v2-category-grid")||!hasClass(home,"v2-home-featured"))throw new Error("V2 homepage is missing its photo banner, search form, category links or featured vehicles: "+prefix);
 const bannerImages=[...tags(home,"img"),...tags(home,"video")].filter(tag=>hasClass(tag,"v2-dealer-hero-image"));
 const bannerCount=siteSettingsForBanner.bannerCars.filter(id=>inventoryForBanner.some(vehicle=>vehicle.id===id&&vehicle.status!=="sold")).length;
 // The banner is either one film of all the banner cars (with a dot per car) or one photo/video slide per car.
 const film=bannerImages.find(tag=>hasClass(tag,"v2-banner-film-video"));
 if(film){const carButtons=tags(home,"button").filter(tag=>tag.includes('aria-controls="v2-banner-cars"')).length;if(bannerImages.length!==1||!home.includes("banner-film.mp4")||!home.includes("banner-film-phone.mp4")||carButtons!==bannerCount+2)throw new Error("V2 banner film must offer every chosen dealer vehicle: "+prefix);}
 else if(bannerImages.length!==bannerCount||bannerCount<1||new Set(bannerImages.map(tag=>tag.match(/(?:gallery|banner)-(\d+)[-.]/)?.[1]).filter(Boolean)).size!==bannerCount)throw new Error("V2 banner must contain the chosen dealer vehicles: "+prefix);
 if(!hasClass(home,"v2-brand-grid")||tags(home,"a").filter(tag=>hasClass(tag,"v2-brand-tile")).length!==12||home.indexOf('id="v2-brands"')<home.indexOf('id="v2-categories"')||home.indexOf('id="v2-brands"')>home.indexOf('id="v2-featured-title"'))throw new Error("V2 brand browser must follow categories and show twelve initial brand links: "+prefix);
 if(!hasClass(cars,"v2-powertrain-tabs")||!hasClass(cars,"v2-body-filters"))throw new Error("V2 catalogue needs separate powertrain and body filters: "+prefix);
 if(hasClass(cars,"v2-hero"))throw new Error("Catalogue still includes the homepage hero: "+prefix);
 if(!/<svg\b[^>]*class="[^\"]*\bvehicle-feature-icon\b[^\"]*"/.test(cars))throw new Error("Missing prerendered vehicle feature icons: "+prefix);
 for(const view of ["features","updates","contact"])if(!/<h1\b/.test(htmlByPath.get(prefix+"/v2/"+view+"/")))throw new Error("V2 page has no primary heading: "+view);
}
const {inventory,siteSettings}=await import("./inventory.mjs");
for(const vehicle of inventory)for(const prefix of ["","/ar"]){
 const path=prefix+"/v2/car/"+vehicle.id+"/",html=htmlByPath.get(path),lang=prefix?"ar":"en";
 if(!html.includes('id="v2-detail-title"')||!hasClass(html,"v2-gallery-thumbs"))throw new Error("Missing standalone car gallery/details: "+path);
 if(!hasClass(html,"v2-showcase")||!hasClass(html,"v2-showcase-tabs")||!hasClass(html,"v2-showcase-gallery"))throw new Error("Missing reference-style car specifications or gallery tabs: "+path);
 if(!html.includes(escapeText(vehicle.brand)))throw new Error("Wrong vehicle in detail page: "+path);
 if(vehicle.range&&(!hasClass(html,"v2-range-panel")||!html.includes(escapeText(vehicle.range[lang]))))throw new Error("Missing electric range on car page: "+path);
 const images=[...new Set([vehicle.image,...(vehicle.gallery||[])])];
 for(const image of images){const thumb=image.replace(/\/assets\/(?:catalog|uploads)\//,"/assets/thumbs/").replace(/\.(?:jpe?g|png)$/i,".webp");if(!html.includes(expectedBase+thumb.replace(/^\//,"")))throw new Error("Missing dealer gallery photograph on car page: "+path+" / "+image);const info=await stat(join(out,thumb.replace(/^\//,"")));if(!info.size)throw new Error("Empty thumbnail: "+thumb);}
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

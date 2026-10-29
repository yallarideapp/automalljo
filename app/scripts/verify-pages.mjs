import {readFile,writeFile,stat,readdir} from "node:fs/promises";
import {join} from "node:path";
const out="dist/client";
const expected=["index.html","ar/index.html","privacy/index.html","ar/privacy/index.html","terms/index.html","ar/terms/index.html","404.html","robots.txt","sitemap.xml","site.webmanifest","assets/catalog/gallery-287890822-1.webp","assets/catalog/gallery-288440948-1.webp","assets/catalog/gallery-288630286-11.webp","assets/catalog/gallery-287516454-1.webp"];
for(const path of expected){const info=await stat(join(out,path));if(!info.isFile()||info.size===0)throw new Error("Missing or empty static output: "+path);}
for(const path of expected.filter(path=>path.endsWith("index.html"))){const html=await readFile(join(out,path),"utf8");const lang=path.startsWith("ar/")?"ar":"en";if(!new RegExp('<html[^>]+lang="'+lang+'"').test(html))throw new Error("Wrong HTML language: "+path);if(lang==="ar"&&!/<html[^>]+dir="rtl"/.test(html))throw new Error("Arabic HTML needs RTL: "+path);if(!html.includes("AutoMall")&&!html.includes("أوتومول"))throw new Error("Static page has no dealership content: "+path);if(/https:\/\/automalljo\.higgsfield\.app/.test(html))throw new Error("Old hosting URL in static page: "+path);}
// GitHub Pages serves this file at arbitrary missing paths. It is intentionally
// non-hydrating: a static, keyboard-accessible recovery page works at every URL.
const notFound=await readFile(join(out,"404.html"),"utf8");
await writeFile(join(out,"404.html"),notFound.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,"").replace(/<link\b(?=[^>]*rel="modulepreload")[^>]*>/gi,""));
await writeFile(join(out,".nojekyll"),"");
const base=process.env.VITE_BASE_PATH||"/";
const expectedBase="/"+base.replace(/^\/+|\/+$/g,"")+(base.replace(/^\/+|\/+$/g,"")?"/":"");
for(const path of ["index.html","ar/index.html"]){const html=await readFile(join(out,path),"utf8");if((html.match(/class="am-photo-story__image"/g)||[]).length!==4)throw new Error("Expected four prerendered dealer photographs: "+path);if(html.includes('src="'+expectedBase+'assets/hero-car-v2.png"'))throw new Error("Old illustrative hero remains active: "+path);}
for(const path of expected.filter(path=>path.endsWith(".html"))){const html=await readFile(join(out,path),"utf8");if(expectedBase!=="/"&&/(?:src|href)="\/(?:assets|privacy|terms|site\.webmanifest)(?:\/|")/.test(html))throw new Error("Unprefixed root URL in "+path);}
console.log("Verified six localized static pages, four sharp dealer hero photographs, recovery page and discovery files.");

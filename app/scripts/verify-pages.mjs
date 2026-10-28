import {readFile,writeFile,stat,readdir} from "node:fs/promises";
import {join} from "node:path";
const out="dist/client";
const expected=["index.html","ar/index.html","privacy/index.html","ar/privacy/index.html","terms/index.html","ar/terms/index.html","404.html","robots.txt","sitemap.xml","site.webmanifest","assets/world/scene-01.mp4","assets/world/scene-01-mobile.mp4"];
for(const path of expected){const info=await stat(join(out,path));if(!info.isFile()||(!path.endsWith(".mp4")&&info.size===0))throw new Error("Missing or empty static output: "+path);}
for(const path of expected.filter(path=>path.endsWith("index.html"))){const html=await readFile(join(out,path),"utf8");const lang=path.startsWith("ar/")?"ar":"en";if(!new RegExp('<html[^>]+lang="'+lang+'"').test(html))throw new Error("Wrong HTML language: "+path);if(lang==="ar"&&!/<html[^>]+dir="rtl"/.test(html))throw new Error("Arabic HTML needs RTL: "+path);if(!html.includes("AutoMall")&&!html.includes("أوتومول"))throw new Error("Static page has no dealership content: "+path);if(/https:\/\/automalljo\.higgsfield\.app/.test(html))throw new Error("Old hosting URL in static page: "+path);}
// GitHub Pages serves this file at arbitrary missing paths. It is intentionally
// non-hydrating: a static, keyboard-accessible recovery page works at every URL.
const notFound=await readFile(join(out,"404.html"),"utf8");
await writeFile(join(out,"404.html"),notFound.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,"").replace(/<link\b(?=[^>]*rel="modulepreload")[^>]*>/gi,""));
await writeFile(join(out,".nojekyll"),"");
const base=process.env.VITE_BASE_PATH||"/";
const expectedBase="/"+base.replace(/^\/+|\/+$/g,"")+(base.replace(/^\/+|\/+$/g,"")?"/":"");
for(const path of expected.filter(path=>path.endsWith(".html"))){const html=await readFile(join(out,path),"utf8");if(expectedBase!=="/"&&/(?:src|href)="\/(?:assets|privacy|terms|site\.webmanifest)(?:\/|")/.test(html))throw new Error("Unprefixed root URL in "+path);}
console.log("Verified six localized static pages, all media variants, recovery page and discovery files.");

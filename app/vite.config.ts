import {tanstackStart} from "@tanstack/react-start/plugin/vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import {defineConfig} from "vite";
import {fileURLToPath} from "node:url";
import {pagePaths} from "./scripts/page-manifest.mjs";
const iconsShim=fileURLToPath(new URL("./src/lib/quanta-icons.ts",import.meta.url));
export default defineConfig(({command})=>{
 const rawBase=process.env.VITE_BASE_PATH||"/";
 const base="/"+rawBase.replace(/^\/+|\/+$/g,"")+(rawBase.replace(/^\/+|\/+$/g,"")?"/":"");
 if(command==="build"&&!process.env.VITE_SITE_URL)throw new Error("Set VITE_SITE_URL to the final public site URL before building.");
 return {
  base,
  define:{__HF_DESIGN_INSPECTOR__:"false"},
  resolve:{tsconfigPaths:true,alias:[{find:/^@higgsfield-ai\/icons(\/.*)?$/,replacement:iconsShim}]},
  server:{watch:{usePolling:true,interval:150}},
  // The Pages build prerenders under Node. Worker bindings remain inert source.
  ssr:{external:["cloudflare:workers"]},
  build:{rollupOptions:{external:[/^cloudflare:/]}},
  plugins:[
   svgr({svgrOptions:{icon:true,svgProps:{fill:"currentColor"},svgoConfig:{plugins:[{name:"preset-default",params:{overrides:{removeViewBox:false}}}]}}}),
   tanstackStart({
    router:{basepath:base},server:{entry:"server"},
    prerender:{enabled:true,autoSubfolderIndex:true,autoStaticPathsDiscovery:false,crawlLinks:false,failOnError:true,concurrency:4},
    pages:[...pagePaths.map(path=>({path,prerender:{enabled:true}})),{path:"/404/",prerender:{enabled:true,outputPath:"/404.html"}}],
    sitemap:{enabled:false}
   }),
   react(),tailwindcss()
  ]
 };
});

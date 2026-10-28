import {QueryClient,QueryClientProvider} from "@tanstack/react-query";
import {Outlet,createRootRouteWithContext,useRouter,useRouterState,HeadContent,Scripts} from "@tanstack/react-router";
import {useEffect,type ReactNode} from "react";
import appCss from "../styles.css?url";
import ownCss from "../automall.css?url";
import heroCss from "../automall-hero.css?url";
import appMeta from "../app-meta.json";
import {AutoMallNotFound} from "../components/automall-notfound";
import {scrollScrubTheme} from "../scroll-scrub-scenes";
import {assetPath,absoluteAsset,canonicalUrl,languageFromPath,sitePath} from "../site-paths";
function NotFound(){const lang=useRouterState({select:s=>languageFromPath(s.location.pathname)});return <AutoMallNotFound lang={lang}/>;}
function ErrorPage({error,reset}:{error:Error;reset:()=>void}){const router=useRouter();useEffect(()=>{console.error(error);},[error]);return <main className="error-page" id="main-content"><p>AUTOMALL</p><h1>A short pit stop.</h1><p>Please refresh the page and try again.</p><button onClick={()=>{router.invalidate();reset();}}>Try again</button><a href={sitePath()}>Back to AutoMall ↗</a></main>;}
export const Route=createRootRouteWithContext<{queryClient:QueryClient}>()({
head:()=>({meta:[{charSet:"utf-8"},{name:"viewport",content:"width=device-width, initial-scale=1"},{title:appMeta.og_title??"AutoMall Jo"},{name:"description",content:appMeta.og_description??""},{name:"author",content:"AutoMall"},{name:"theme-color",content:scrollScrubTheme.background},{name:"robots",content:"noindex, follow"},{property:"og:title",content:appMeta.og_title??"AutoMall Jo"},{property:"og:description",content:appMeta.og_description??""},{property:"og:type",content:"website"},{property:"og:url",content:canonicalUrl()},{property:"og:image",content:absoluteAsset(appMeta.og_image_url)},{name:"twitter:card",content:"summary_large_image"},{name:"twitter:title",content:appMeta.og_title??"AutoMall Jo"},{name:"twitter:description",content:appMeta.og_description??""},{name:"twitter:image",content:absoluteAsset(appMeta.og_image_url)}],links:[{rel:"stylesheet",href:appCss},{rel:"stylesheet",href:ownCss},{rel:"stylesheet",href:heroCss},{rel:"icon",href:assetPath("assets/favicon.ico")},{rel:"icon",type:"image/png",sizes:"32x32",href:assetPath("assets/favicon-32.png")},{rel:"apple-touch-icon",href:assetPath("assets/apple-touch-icon.png")},{rel:"manifest",href:assetPath("site.webmanifest")}]}),
shellComponent:RootShell,component:RootComponent,notFoundComponent:NotFound,errorComponent:ErrorPage
});
function RootShell({children}:{children:ReactNode}){const lang=useRouterState({select:s=>languageFromPath(s.location.pathname)});return <html lang={lang} dir={lang==="ar"?"rtl":"ltr"} data-theme="default-dark" style={{colorScheme:"dark"}}><head><HeadContent/></head><body><a className="skip-link" href="#main-content">{lang==="ar"?"انتقل إلى المحتوى":"Skip to content"}</a>{children}<Scripts/></body></html>;}
function RootComponent(){const {queryClient}=Route.useRouteContext();return <QueryClientProvider client={queryClient}><Outlet/></QueryClientProvider>;}

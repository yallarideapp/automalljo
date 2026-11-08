import {createFileRoute} from "@tanstack/react-router";
import {RedirectToV2,redirectHead} from "@/components/redirect-to-v2";
export const Route=createFileRoute("/ar/")({head:()=>redirectHead("ar"),component:ArabicHome});
function ArabicHome(){return <RedirectToV2 lang="ar"/>;}

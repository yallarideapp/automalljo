import {createFileRoute} from "@tanstack/react-router";
import {RedirectToV2,redirectHead} from "@/components/redirect-to-v2";

export const Route=createFileRoute("/ar/v2/updates/")({head:()=>redirectHead("ar","v2/finance"),component:ArabicV2Updates});
function ArabicV2Updates(){return <RedirectToV2 lang="ar" page="v2/finance"/>;}

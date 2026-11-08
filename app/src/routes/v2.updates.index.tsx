import {createFileRoute} from "@tanstack/react-router";
import {RedirectToV2,redirectHead} from "@/components/redirect-to-v2";

export const Route=createFileRoute("/v2/updates/")({head:()=>redirectHead("en","v2/finance"),component:EnglishV2Updates});
function EnglishV2Updates(){return <RedirectToV2 lang="en" page="v2/finance"/>;}

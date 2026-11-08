import {createFileRoute} from "@tanstack/react-router";
import {RedirectToV2,redirectHead} from "@/components/redirect-to-v2";
// The old homepage design was replaced by /v2/; its address now leads there.
export const Route=createFileRoute("/")({head:()=>redirectHead("en"),component:EnglishHome});
function EnglishHome(){return <RedirectToV2 lang="en"/>;}

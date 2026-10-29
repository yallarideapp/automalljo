import {createFileRoute} from "@tanstack/react-router";
import {AutoMallV2Page,v2Head} from "@/components/automall-v2-page";

export const Route=createFileRoute("/v2/features/")({head:()=>v2Head("en","features"),component:EnglishV2Features});
function EnglishV2Features(){return <AutoMallV2Page lang="en" view="features"/>;}

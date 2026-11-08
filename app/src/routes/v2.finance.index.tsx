import {createFileRoute} from "@tanstack/react-router";
import {AutoMallV2Page,v2Head} from "@/components/automall-v2-page";

export const Route=createFileRoute("/v2/finance/")({head:()=>v2Head("en","finance"),component:EnglishV2Finance});
function EnglishV2Finance(){return <AutoMallV2Page lang="en" view="finance"/>;}

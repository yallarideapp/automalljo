import {createFileRoute} from "@tanstack/react-router";
import {AutoMallV2Page,v2Head} from "@/components/automall-v2-page";

export const Route=createFileRoute("/ar/v2/finance/")({head:()=>v2Head("ar","finance"),component:ArabicV2Finance});
function ArabicV2Finance(){return <AutoMallV2Page lang="ar" view="finance"/>;}

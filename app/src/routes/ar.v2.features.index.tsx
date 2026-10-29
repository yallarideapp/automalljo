import {createFileRoute} from "@tanstack/react-router";
import {AutoMallV2Page,v2Head} from "@/components/automall-v2-page";

export const Route=createFileRoute("/ar/v2/features/")({head:()=>v2Head("ar","features"),component:ArabicV2Features});
function ArabicV2Features(){return <AutoMallV2Page lang="ar" view="features"/>;}

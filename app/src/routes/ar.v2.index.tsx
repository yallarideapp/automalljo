import {createFileRoute} from "@tanstack/react-router";
import {AutoMallV2Page,v2Head} from "@/components/automall-v2-page";

export const Route=createFileRoute("/ar/v2/")({head:()=>v2Head("ar"),component:ArabicV2});
function ArabicV2(){return <AutoMallV2Page lang="ar"/>;}

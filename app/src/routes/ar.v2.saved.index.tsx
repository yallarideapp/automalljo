import {createFileRoute} from "@tanstack/react-router";
import {AutoMallV2Page,v2Head} from "@/components/automall-v2-page";

export const Route=createFileRoute("/ar/v2/saved/")({head:()=>v2Head("ar","saved"),component:ArV2Saved});
function ArV2Saved(){return <AutoMallV2Page lang="ar" view="saved"/>;}

import {createFileRoute} from "@tanstack/react-router";
import {AutoMallV2Page,v2Head} from "@/components/automall-v2-page";

export const Route=createFileRoute("/ar/v2/cars/")({head:()=>v2Head("ar","cars"),component:ArabicV2Cars});
function ArabicV2Cars(){return <AutoMallV2Page lang="ar" view="cars"/>;}

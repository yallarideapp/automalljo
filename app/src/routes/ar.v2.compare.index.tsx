import {createFileRoute} from "@tanstack/react-router";
import {AutoMallV2Page,v2Head} from "@/components/automall-v2-page";

export const Route=createFileRoute("/ar/v2/compare/")({head:()=>v2Head("ar","compare"),component:ArV2Compare});
function ArV2Compare(){return <AutoMallV2Page lang="ar" view="compare"/>;}

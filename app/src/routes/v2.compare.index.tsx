import {createFileRoute} from "@tanstack/react-router";
import {AutoMallV2Page,v2Head} from "@/components/automall-v2-page";

export const Route=createFileRoute("/v2/compare/")({head:()=>v2Head("en","compare"),component:EnV2Compare});
function EnV2Compare(){return <AutoMallV2Page lang="en" view="compare"/>;}

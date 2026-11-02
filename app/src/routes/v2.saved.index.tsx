import {createFileRoute} from "@tanstack/react-router";
import {AutoMallV2Page,v2Head} from "@/components/automall-v2-page";

export const Route=createFileRoute("/v2/saved/")({head:()=>v2Head("en","saved"),component:EnV2Saved});
function EnV2Saved(){return <AutoMallV2Page lang="en" view="saved"/>;}

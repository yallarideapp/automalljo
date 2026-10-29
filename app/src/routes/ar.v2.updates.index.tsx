import {createFileRoute} from "@tanstack/react-router";
import {AutoMallV2Page,v2Head} from "@/components/automall-v2-page";

export const Route=createFileRoute("/ar/v2/updates/")({head:()=>v2Head("ar","updates"),component:ArabicV2Updates});
function ArabicV2Updates(){return <AutoMallV2Page lang="ar" view="updates"/>;}

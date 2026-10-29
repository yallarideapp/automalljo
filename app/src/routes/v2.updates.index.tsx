import {createFileRoute} from "@tanstack/react-router";
import {AutoMallV2Page,v2Head} from "@/components/automall-v2-page";

export const Route=createFileRoute("/v2/updates/")({head:()=>v2Head("en","updates"),component:EnglishV2Updates});
function EnglishV2Updates(){return <AutoMallV2Page lang="en" view="updates"/>;}

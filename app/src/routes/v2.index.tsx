import {createFileRoute} from "@tanstack/react-router";
import {AutoMallV2Page,v2Head} from "@/components/automall-v2-page";

export const Route=createFileRoute("/v2/")({head:()=>v2Head("en"),component:EnglishV2});
function EnglishV2(){return <AutoMallV2Page lang="en"/>;}

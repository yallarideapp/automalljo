import {createFileRoute} from "@tanstack/react-router";
import {AutoMallV2Page,v2Head} from "@/components/automall-v2-page";

export const Route=createFileRoute("/v2/cars/")({head:()=>v2Head("en","cars"),component:EnglishV2Cars});
function EnglishV2Cars(){return <AutoMallV2Page lang="en" view="cars"/>;}

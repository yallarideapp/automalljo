import {createFileRoute} from "@tanstack/react-router";
import {AutoMallV2Page,v2Head} from "@/components/automall-v2-page";

export const Route=createFileRoute("/v2/contact/")({head:()=>v2Head("en","contact"),component:EnglishV2Contact});
function EnglishV2Contact(){return <AutoMallV2Page lang="en" view="contact"/>;}

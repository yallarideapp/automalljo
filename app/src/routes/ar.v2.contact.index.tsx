import {createFileRoute} from "@tanstack/react-router";
import {AutoMallV2Page,v2Head} from "@/components/automall-v2-page";

export const Route=createFileRoute("/ar/v2/contact/")({head:()=>v2Head("ar","contact"),component:ArabicV2Contact});
function ArabicV2Contact(){return <AutoMallV2Page lang="ar" view="contact"/>;}

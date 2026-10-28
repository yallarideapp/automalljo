import {createFileRoute} from "@tanstack/react-router";
import {LegalPage} from "@/components/automall-legal";
import {localizedLinks} from "@/site-paths";
export const Route=createFileRoute("/privacy")({head:()=>({meta:[{title:"Privacy Policy | AutoMall"}],links:localizedLinks("privacy","en")}),component:Page});
function Page(){return <LegalPage kind="privacy" lang="en"/>;}

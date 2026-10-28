import {createFileRoute} from "@tanstack/react-router";
import {LegalPage} from "@/components/automall-legal";
import {localizedLinks} from "@/site-paths";
export const Route=createFileRoute("/terms")({head:()=>({meta:[{title:"Terms & Conditions | AutoMall"}],links:localizedLinks("terms","en")}),component:Page});
function Page(){return <LegalPage kind="terms" lang="en"/>;}

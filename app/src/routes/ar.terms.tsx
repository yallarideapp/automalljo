import {createFileRoute} from "@tanstack/react-router";
import {LegalPage} from "@/components/automall-legal";
import {localizedLinks} from "@/site-paths";
export const Route=createFileRoute("/ar/terms")({head:()=>({meta:[{title:"الشروط والأحكام | أوتومول"}],links:localizedLinks("terms","ar")}),component:Page});
function Page(){return <LegalPage kind="terms" lang="ar"/>;}

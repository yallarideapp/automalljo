import {createFileRoute} from "@tanstack/react-router";
import {LegalPage} from "@/components/automall-legal";
import {localizedLinks} from "@/site-paths";
export const Route=createFileRoute("/ar/privacy")({head:()=>({meta:[{title:"سياسة الخصوصية | أوتومول"}],links:localizedLinks("privacy","ar")}),component:Page});
function Page(){return <LegalPage kind="privacy" lang="ar"/>;}

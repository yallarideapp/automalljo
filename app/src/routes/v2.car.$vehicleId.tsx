import {createFileRoute} from "@tanstack/react-router";
import {AutoMallV2Page,v2Head} from "@/components/automall-v2-page";

export const Route=createFileRoute("/v2/car/$vehicleId")({head:({params})=>v2Head("en","car",params.vehicleId),component:EnglishV2Vehicle});
function EnglishV2Vehicle(){const {vehicleId}=Route.useParams();return <AutoMallV2Page lang="en" view="car" vehicleId={vehicleId}/>;}

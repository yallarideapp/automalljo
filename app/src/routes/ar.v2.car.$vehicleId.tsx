import {createFileRoute} from "@tanstack/react-router";
import {AutoMallV2Page,v2Head} from "@/components/automall-v2-page";

export const Route=createFileRoute("/ar/v2/car/$vehicleId")({head:({params})=>v2Head("ar","car",params.vehicleId),component:ArabicV2Vehicle});
function ArabicV2Vehicle(){const {vehicleId}=Route.useParams();return <AutoMallV2Page lang="ar" view="car" vehicleId={vehicleId}/>;}

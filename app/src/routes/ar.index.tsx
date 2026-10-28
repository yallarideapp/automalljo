import {createFileRoute} from "@tanstack/react-router";
import {AutoMallPage,homeHead} from "./index";
export const Route=createFileRoute("/ar/")({head:()=>homeHead("ar"),component:ArabicHome});
function ArabicHome(){return <AutoMallPage lang="ar"/>;}

import {createFileRoute} from "@tanstack/react-router";
import {AutoMallNotFound} from "@/components/automall-notfound";
export const Route=createFileRoute("/404")({head:()=>({meta:[{title:"Page not found | AutoMall"}]}),component:AutoMallNotFound});

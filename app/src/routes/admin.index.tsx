import {createFileRoute} from "@tanstack/react-router";
import {AdminApp} from "@/components/admin/admin-app";
import adminCss from "../admin.css?url";

export const Route=createFileRoute("/admin/")({head:()=>({meta:[{title:"AutoMall admin"},{name:"robots",content:"noindex, nofollow"},{name:"description",content:"Staff admin panel for the AutoMall website."}],links:[{rel:"stylesheet",href:adminCss}]}),component:AdminPage});
function AdminPage(){return <AdminApp/>;}

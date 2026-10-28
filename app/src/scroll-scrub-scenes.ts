import {assetPath} from "@/site-paths";
import {createElement} from "react";
import type {ScrollScrubScene,ScrollScrubTheme} from "@/components/scroll-scrub/scroll-scrub";
import {copy,genericMessage,whatsapp,type Lang} from "@/site-data";
export const scrollScrubTheme:ScrollScrubTheme={accent:"#ED8738",background:"#111315",ink:"#E7E9E9",muted:"#B9BEC0"};
function scene(lang:Lang):ScrollScrubScene[]{const t=copy[lang];return [{id:"arrival",label:lang==="ar"?"أوتومول":"AutoMall",title:t.heroTitle,body:t.heroBody,clip:assetPath("/assets/world/scene-01.mp4"),mobileClip:assetPath("/assets/world/scene-01-mobile.mp4"),poster:assetPath("/assets/world/scene-01-poster.png"),mobilePoster:assetPath("/assets/world/scene-01-mobile-poster.png"),scroll:1.45,linger:.12,objectPosition:"62% 50%",mobileObjectPosition:"63% 42%",actions:createElement("div",{className:"hero-action-row"},createElement("a",{href:"#collection",className:"hero-browse"},t.browse,createElement("span",{"aria-hidden":true},"↗")),createElement("a",{href:whatsapp(genericMessage(lang)),className:"hero-enquire",target:"_blank",rel:"noopener noreferrer"},t.chat,createElement("span",{"aria-hidden":true},"↗")))}];}
export const scrollScrubScenes=scene("en");
export const scrollScrubScenesArabic=scene("ar");
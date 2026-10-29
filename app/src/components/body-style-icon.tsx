import type {ReactNode} from "react";

const wheels=<><circle cx="12" cy="18.5" r="3"/><circle cx="36" cy="18.5" r="3"/></>;
const icons:Record<string,ReactNode>={
 all:<><path d="M8.5 18.5H3v-5l8-2 5-5h13l7 5 9 2v5h-5.5m-7 0h-17"/><path d="m13 11.5 4-3h10l4.5 3Z"/>{wheels}</>,
 suv:<><path d="M8.5 18.5H3v-7l5.5-1.5 4-5h19l5 5.5 7.5 2v6h-5.5m-7 0h-17"/><path d="m11 10.5 3-4h16l3.5 4ZM23 6.5v4m0 3v4"/>{wheels}</>,
 sedan:<><path d="M8.5 18.5H3v-5l8-2 5-5h13l7 5 9 2v5h-5.5m-7 0h-17"/><path d="m13 11.5 4-3h11l4.5 3ZM23 8.5v3m0 2.5v3"/>{wheels}</>,
 pickup:<><path d="M8.5 18.5H3v-7h16l1-6h10l7 7 8 1.5v5h-5.5m-7 0h-17"/><path d="M5 11.5v-3h13v3m3 0 .8-4H29l4 4ZM19 13v4"/>{wheels}</>,
 van:<><path d="M8.5 18.5H3V7a2 2 0 0 1 2-2h28l7 7 5 2v4.5h-5.5m-7 0h-17"/><path d="M6 8h16v4H6Zm20 0h6l4 4H26ZM24 6.5v11"/>{wheels}</>,
 coupe:<><path d="M8.5 18.5H3v-4l11-3 7-5h8l10 6 6 2v4.5h-5.5m-7 0h-17"/><path d="m17 11.5 5-3.5h6l6 3.5Zm8 2.5v3"/>{wheels}</>,
 "shooting-brake":<><path d="M8.5 18.5H3v-7l7-5h20l7 5 8 2.5v5h-5.5m-7 0h-17"/><path d="m7 11.5 4-3h18l4.5 3ZM21 8.5v3m3.5 2.5v3"/>{wheels}</>,
 targa:<><path d="M8.5 18.5H3v-4l10-2.5 5-4h5m4 0h3l8 5 7 2v4.5h-5.5m-7 0h-17"/><path d="m17 11.5 2-2.5h3m5-3v6m3-3h1l4 2.5H15m10 2.5v3"/>{wheels}</>,
 truck:<><path d="M8.5 18.5H2.5V4h25v14.5h-12m12 0h5m7 0H46V12l-6-6H29v12.5"/><path d="M32 8.5h7l3.5 4H32ZM3 15h24"/>{wheels}</>,
};

export function BodyStyleIcon({name,size=40,className}:{name:string;size?:number;className?:string}){
 return <svg className={className} width={size} height={size/2} viewBox="0 0 48 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" data-body-icon={name}>{icons[name]??icons.all}</svg>;
}

import type {ReactNode} from "react";

export type VehicleFeatureName=
 |"range"|"battery"|"charge"|"hybrid"|"awd"|"panorama"|"camera360"
 |"heatedSeats"|"ventilatedSeats"|"leather"|"cruise"|"hud"|"keyless"
 |"powerTailgate"|"carplay"|"parkingSensors"|"safety"|"seats"|"gearbox"
 |"engine"|"mileage";

const seat=<><path d="m8 4 1.2 7.2a2 2 0 0 0 2 1.7H16a2 2 0 0 1 2 2v2H9a3 3 0 0 1-3-2.5L4.7 6a1.8 1.8 0 0 1 1.8-2Z"/><path d="M8 17v3m9-3v3M8 20h10"/></>;
const icons:Record<VehicleFeatureName,ReactNode>={
 range:<><path d="M4 18a9 9 0 1 1 16 0M6.2 6.5l1.6 1.6M12 4v2m5.8.5-1.6 1.6M3.5 13h2m13 0h2M12 13l4-3"/><circle cx="12" cy="13" r="1.6"/><path d="M8 20h8"/></>,
 battery:<><rect x="2.5" y="6" width="17" height="12" rx="2"/><path d="M19.5 10H22v4h-2.5M6 10v4m-2-2h4m6-2h3"/></>,
 charge:<><path d="M9 3v5m6-5v5M7 8h10v3a5 5 0 0 1-10 0Zm5 8v3a2 2 0 0 0 2 2h4"/><path d="M17 21h4"/></>,
 hybrid:<><path d="M5 7.5a8 8 0 0 1 13-2L20 8m0-4v4h-4M19 16.5a8 8 0 0 1-13 2L4 16m0 4v-4h4"/><path d="m13 7-4 6h4l-2 4 5-7h-4Z"/></>,
 awd:<><rect x="7.5" y="4" width="9" height="16" rx="3"/><path d="M7.5 8h9m-9 8h9M12 8v8M4.5 5.5v4m15-4v4m-15 5v4m15-4v4M4.5 7.5h3m9 0h3m-15 9h3m9 0h3"/><circle cx="12" cy="12" r="1.7"/></>,
 panorama:<><path d="M8 3h8a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3Z"/><rect x="8" y="7" width="8" height="9" rx="1.2"/><path d="M8 11.5h8M9 4.8h6M9 18.5h6"/></>,
 camera360:<><rect x="9" y="7" width="6" height="10" rx="2"/><path d="M9 10h6m-6 4h6M4 9a8.5 8.5 0 0 1 6-5m4 0a8.5 8.5 0 0 1 6 5m0 6a8.5 8.5 0 0 1-6 5m-4 0a8.5 8.5 0 0 1-6-5M2.5 9H5V6.5m14 11V15h2.5"/></>,
 heatedSeats:<>{seat}<path d="M13 3c-2 1.5 2 2.5 0 4m4-4c-2 1.5 2 2.5 0 4m4-4c-2 1.5 2 2.5 0 4"/></>,
 ventilatedSeats:<>{seat}<path d="M12 5h9m-2-2 2 2-2 2M13 9h8m-2-2 2 2-2 2"/></>,
 leather:<>{seat}<path d="m6.6 5.8.3 1.6m.4 2.2.3 1.6m.5 2.2.7 1.4m2.5.3h1.4m2 0h1.4"/><path d="m15 4 2 2 2-2-2-2Z"/></>,
 cruise:<><path d="M3 14a9 9 0 0 1 18 0M5 8.5l1.5 1M12 5v2m6.9 1.5-1.5 1M12 14l4-4"/><circle cx="12" cy="14" r="1.3"/><path d="M5.5 20v-2.5L7 15h10l1.5 2.5V20M6 18h12M8 20v1m8-1v1"/></>,
 hud:<><path d="m5 5-2 9h18l-2-9ZM7 18h10m-5-4v7M6 11l1-4h10l1 4"/><path d="m10 10 2-2 2 2m-2-2v4"/></>,
 keyless:<><rect x="3" y="8" width="9" height="12" rx="3"/><circle cx="7.5" cy="12" r="1.2"/><path d="M6.5 16h2M15 8a5 5 0 0 1 0 6m3-9a9 9 0 0 1 0 12M7.5 8V5"/></>,
 powerTailgate:<><path d="M5 20v-6l2-4h10l2 4v6M5 16h14M7 20v1m10-1v1M8 13h8M6 6l6-3 6 3M6 6v3m12-3v3"/><path d="M12 9V5m-2 2 2-2 2 2"/></>,
 carplay:<><rect x="3" y="4" width="10" height="16" rx="2"/><path d="M7 7h2m-2 10h2M16 7h5v10h-5M16 10h3m-3 4h3"/><path d="m7 10 3 2-3 2Z"/></>,
 parkingSensors:<><path d="M6 20v-4l2-4h8l2 4v4M6 17h12M8 20v1m8-1v1M8.5 14h7M9 8a4 4 0 0 1 6 0M6 5a8 8 0 0 1 12 0"/></>,
 safety:<><path d="m12 3 8 3v6c0 4-3.5 7.2-8 9-4.5-1.8-8-5-8-9V6Z"/><path d="m8 12 2.5 2.5L16 9"/></>,
 seats:<><rect x="4" y="3" width="5" height="4" rx="1.3"/><rect x="15" y="3" width="5" height="4" rx="1.3"/><path d="M3.5 9h6L11 17H2Zm11 0h6l1.5 8H13ZM4 17v4m4-4v4m8-4v4m4-4v4M2 21h9m2 0h9"/></>,
 gearbox:<><path d="M6 4v15m6-15v15m6-15v7H6"/><circle cx="6" cy="4" r="1.5" fill="currentColor" stroke="none"/><circle cx="12" cy="4" r="1.5" fill="currentColor" stroke="none"/><circle cx="18" cy="4" r="1.5" fill="currentColor" stroke="none"/><circle cx="6" cy="19" r="1.5" fill="currentColor" stroke="none"/><circle cx="12" cy="19" r="1.5" fill="currentColor" stroke="none"/></>,
 engine:<><path d="M5 9h4l2-3h5v3h3l2 3v5h-3l-2 2H8l-3-3ZM3 11v5m-1-2h3M11 3h6m-3 0v3M21 11h1v7"/><path d="m12 10-2 4h3l-1 3 4-5h-3l1-2"/></>,
 mileage:<><path d="m8 3-5 18m13-18 5 18M12 3v3m0 4v4m0 4v3"/><path d="M6 12h3m6 0h3M4.5 18H9m6 0h4.5"/></>
};

export function VehicleFeatureIcon({name,size=24,className}:{name:VehicleFeatureName;size?:number|string;className?:string}){
 return <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" data-feature-icon={name}>{icons[name]}</svg>;
}

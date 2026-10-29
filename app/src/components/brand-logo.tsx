import {brandLogoFor} from "@/brand-logos";
import {BodyStyleIcon} from "./body-style-icon";

export function BrandLogo({brand}:{brand:string}){
 const logo=brandLogoFor(brand);
 return logo?<span className="v2-brand-badge" data-brand-logo={brand} data-tone={logo.tone}><img src={logo.src} alt="" width="32" height="24" decoding="async"/></span>:<BodyStyleIcon name="all"/>;
}

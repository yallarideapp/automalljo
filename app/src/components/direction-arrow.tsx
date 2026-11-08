/** SVG arrows do not undergo the browser's automatic bidi glyph mirroring. */
export function DirectionArrow({kind="forward",size=20}:{kind?:"forward"|"back"|"outward";size?:number}){
 return <svg className="v2-direction-arrow" data-direction={kind} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">{kind==="outward"?<path d="M6 18 18 6M6 6h12v12"/>:kind==="back"?<path d="M19 12H5m6-6-6 6 6 6"/>:<path d="M5 12h14m-6-6 6 6-6 6"/>}</svg>;
}

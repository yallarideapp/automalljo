import type {Lang} from "@/site-data";
import {assetPath} from "@/site-paths";

/**
 * Opening screen (like a launch / splash page): an orange line draws a sports car, the body fills
 * with a metallic sheen, the headlight flashes and the wheels turn, the shop's logo pops in,
 * then the screen fades away to the page (about 2.9 seconds).
 *
 * - It is in the prerendered HTML and runs on CSS alone, so it plays straight away and always ends,
 *   even before the page's JavaScript has loaded.
 * - Once per browser session: the small script below marks it seen, so later pages open directly.
 * - A tap, click or key press skips it. It never shows with reduced motion.
 * - The car is an original drawing, not any brand's design.
 */
const bootScript=`(function(){var d=document.documentElement;try{if(sessionStorage.getItem("am-splash")){d.classList.add("am-splash-seen");return}sessionStorage.setItem("am-splash","1")}catch(e){}var s=document.getElementById("am-splash");if(!s)return;var done=function(){d.classList.add("am-splash-done");removeEventListener("keydown",done);};s.addEventListener("pointerdown",done);addEventListener("keydown",done);setTimeout(function(){d.classList.add("am-splash-done")},3500);})();`;

export function V2Splash({lang}:{lang:Lang}){
 return <>
  <div className="am-splash" id="am-splash" aria-hidden="true">
   <div className="am-splash-stage">
    <svg className="am-splash-car" viewBox="0 0 600 210" width="600" height="210">
     <defs>
      <linearGradient id="am-splash-paint" x1="0" y1="0" x2="0" y2="1">
       <stop offset="0" className="am-splash-paint-top"/><stop offset=".55" className="am-splash-paint-mid"/><stop offset="1" className="am-splash-paint-low"/>
      </linearGradient>
      <linearGradient id="am-splash-sheen" x1="0" y1="0" x2="1" y2="0">
       <stop offset="0" stopColor="#fff" stopOpacity="0"/><stop offset=".5" stopColor="#fff" stopOpacity=".55"/><stop offset="1" stopColor="#fff" stopOpacity="0"/>
      </linearGradient>
      <clipPath id="am-splash-body-clip"><path d="M30 150V128C31 114 46 107 70 103L118 96C168 64 250 50 326 53C392 56 434 76 474 92L530 101C556 106 568 116 571 132L572 150H493A45 45 0 0 0 403 150H197A45 45 0 0 0 107 150Z"/></clipPath>
     </defs>
     <ellipse className="am-splash-shadow" cx="300" cy="186" rx="250" ry="10"/>
     {/* Body fill and moving light reflection, revealed left to right */}
     <g clipPath="url(#am-splash-body-clip)">
      <rect className="am-splash-fill" x="20" y="40" width="560" height="120" fill="url(#am-splash-paint)"/>
      <rect className="am-splash-sheen" x="-160" y="40" width="160" height="120" fill="url(#am-splash-sheen)"/>
     </g>
     <path className="am-splash-glass" d="M138 98C182 72 244 62 300 63L346 65C380 70 402 80 420 93L408 98H150Z"/>
     {/* Line drawing */}
     <g className="am-splash-lines" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path pathLength="1" d="M30 150V128C31 114 46 107 70 103L118 96C168 64 250 50 326 53C392 56 434 76 474 92L530 101C556 106 568 116 571 132L572 150H493A45 45 0 0 0 403 150H197A45 45 0 0 0 107 150Z"/>
      <path pathLength="1" d="M138 98C182 72 244 62 300 63L346 65C380 70 402 80 420 93L408 98H150Z"/>
      <path pathLength="1" d="M286 64V98M120 120H560"/>
     </g>
     <path className="am-splash-headlight" d="M540 108L566 114L562 122L540 118Z"/>
     <path className="am-splash-taillight" d="M32 118L52 114V124L32 126Z"/>
     <ellipse className="am-splash-beam" cx="640" cy="118" rx="90" ry="16"/>
     {[152,448].map(x=><g key={x} className="am-splash-wheel" transform={`translate(${x} 150)`}>
      <circle className="am-splash-tyre" r="36" pathLength="1"/>
      <g className="am-splash-rim"><circle r="22"/><path d="M0-22V22M-22 0H22M-15.5-15.5L15.5 15.5M15.5-15.5L-15.5 15.5"/><circle r="6" className="am-splash-hub"/></g>
     </g>)}
     <path className="am-splash-road" d="M20 187H580" pathLength="1"/>
    </svg>
    {/* The shop's own logo (orange tile: AUTOMALL · مجمع السيارات) */}
    <span className="am-splash-logo"><span><img src={assetPath("assets/logo.jpg")} alt="" width="136" height="136" decoding="sync" fetchPriority="high"/></span></span>
    <p className="am-splash-tag">{lang==="ar"?"خيارات أكثر. إمكانيات أكثر.":"More choices. More possibilities."}</p>
   </div>
  </div>
  <script dangerouslySetInnerHTML={{__html:bootScript}}/>
 </>;
}

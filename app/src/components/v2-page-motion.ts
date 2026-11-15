import { useEffect, useState, type RefObject } from "react";
import { ENGINE_INTRO_DURATION } from "./v2-engine-gauge";

type Phase = "opening" | "revving" | "ready";
const engineSessionKey = "automall-engine-started";

export function useV2PageMotion(page: RefObject<HTMLDivElement | null>, isHome: boolean): Phase {
 const [phase, setPhase] = useState<Phase>("opening");

 useEffect(() => {
  const container = page.current;
  if (!container) return;
  const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
  const splash = container.querySelector("#am-splash");
  let observer: MutationObserver | undefined;
  let startTimer = 0;
  let finishTimer = 0;
  let entrance: Animation | undefined;
  let started = false;

  const finish = () => {
   window.clearTimeout(finishTimer);
   setPhase("ready");
  };
  const begin = () => {
   if (started) return;
   started = true;
   window.clearTimeout(startTimer);
   observer?.disconnect();
   if (preference.matches || document.hidden || window.scrollY > 24 || location.hash) {
    finish();
    return;
   }
   entrance = container.querySelector("main")?.animate?.(
    [{ transform: "translateY(10px)", opacity: .88 }, { transform: "translateY(0)", opacity: 1 }],
    { duration: 450, easing: "cubic-bezier(.18,.75,.26,1)" },
   );
   let playIntro = isHome;
   if (playIntro) {
    try {
     playIntro = sessionStorage.getItem(engineSessionKey) === null;
     if (playIntro) sessionStorage.setItem(engineSessionKey, "1");
    } catch {
     playIntro = false;
    }
   }
   if (playIntro) {
    setPhase("revving");
    finishTimer = window.setTimeout(finish, ENGINE_INTRO_DURATION);
   } else {
    finish();
   }
  };
  const onSplashEnd = (event: Event) => {
   if (event.target === splash && (event as AnimationEvent).animationName === "am-splash-out") begin();
  };
  const onPreference = () => {
   if (!preference.matches) return;
   entrance?.cancel();
   begin();
   finish();
  };
  const onVisibility = () => {
   if (document.hidden && started) finish();
  };
  const onInteraction = () => {
   if (started) finish();
  };

  const splashStyle = splash && getComputedStyle(splash);
  if (preference.matches || !splashStyle || splashStyle.display === "none" || splashStyle.visibility === "hidden") {
   begin();
  } else {
   splash?.addEventListener("animationend", onSplashEnd);
   observer = new MutationObserver(() => {
    if (!document.documentElement.classList.contains("am-splash-done")) return;
    window.clearTimeout(startTimer);
    startTimer = window.setTimeout(begin, 360);
   });
   observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
   startTimer = window.setTimeout(begin, document.documentElement.classList.contains("am-splash-done") ? 360 : 4000);
  }
  preference.addEventListener("change", onPreference);
  document.addEventListener("visibilitychange", onVisibility);
  container.addEventListener("pointerdown", onInteraction, true);
  container.addEventListener("keydown", onInteraction, true);
  return () => {
   splash?.removeEventListener("animationend", onSplashEnd);
   observer?.disconnect();
   window.clearTimeout(startTimer);
   window.clearTimeout(finishTimer);
   entrance?.cancel();
   preference.removeEventListener("change", onPreference);
   document.removeEventListener("visibilitychange", onVisibility);
   container.removeEventListener("pointerdown", onInteraction, true);
   container.removeEventListener("keydown", onInteraction, true);
  };
 }, [page, isHome]);

 return phase;
}

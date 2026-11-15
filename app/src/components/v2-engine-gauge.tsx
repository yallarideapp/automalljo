import {useEffect,useRef} from "react";
import type {Lang} from "@/site-data";

export const ENGINE_REV_TIMES = [340, 1040, 1740] as const;
export const ENGINE_INTRO_DURATION = 2200;

const idle = 800;
const redline = 8000;
const dialFormat = new Intl.NumberFormat("en-US");
const startup = [
  [0, 0],
  [65, 0],
  [ENGINE_REV_TIMES[0] - 30, 3000],
  [ENGINE_REV_TIMES[0] + 50, 3000],
  [660, idle],
  [ENGINE_REV_TIMES[1] - 30, 6000],
  [ENGINE_REV_TIMES[1] + 50, 6000],
  [1360, idle],
  [ENGINE_REV_TIMES[2] - 30, redline],
  [ENGINE_REV_TIMES[2] + 50, redline],
  [ENGINE_INTRO_DURATION, idle],
] as const;

function startupRpm(elapsed:number) {
  for (let i = 1; i < startup.length; i++) {
    const [end, peak] = startup[i];
    if (elapsed > end) continue;
    const [start, rpm] = startup[i - 1];
    const progress = Math.max(0, (elapsed - start) / (end - start));
    const eased = progress * (2 - progress);
    return rpm + (peak - rpm) * eased;
  }
  return idle;
}

export function V2EngineGauge({lang,intro}:{lang:Lang;intro:boolean}) {
  const gauge = useRef<HTMLDivElement>(null);
  const needle = useRef<HTMLSpanElement>(null);
  const readout = useRef<HTMLElement>(null);

  useEffect(() => {
    const panel = gauge.current;
    const pointer = needle.current;
    const display = readout.current;
    if (!panel || !pointer || !display) return;

    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const introStart = intro && !preference.matches ? performance.now() : null;
    const introActive = () => introStart !== null && performance.now() - introStart < ENGINE_INTRO_DURATION;
    let frame = 0;
    let frameAt = 0;
    let nearBanner = typeof IntersectionObserver !== "function";
    let listening = false;
    let lastScrollY = window.scrollY;
    let lastScrollAt = -Infinity;
    let target = idle;
    let rpm = idle;
    let displayedRpm = idle;

    const paint = (value:number) => {
      pointer.style.transform = `rotate(${-135 + value / redline * 270}deg)`;
      const rounded = Math.round(value / 25) * 25;
      if (rounded !== displayedRpm) {
        displayedRpm = rounded;
        display.textContent = dialFormat.format(rounded);
      }
    };

    const animate = (now:number) => {
      frame = 0;
      const elapsed = introStart === null ? Infinity : now - introStart;
      if (elapsed < ENGINE_INTRO_DURATION) {
        rpm = startupRpm(elapsed);
        paint(rpm);
        frameAt = now;
        frame = requestAnimationFrame(animate);
        return;
      }

      const dt = frameAt ? Math.min(now - frameAt, 50) : 16;
      frameAt = now;
      const accelerating = now - lastScrollAt < 120;
      const desired = accelerating ? target : idle;
      rpm += (desired - rpm) * (1 - Math.exp(-dt / (accelerating ? 105 : 340)));
      if (!accelerating && Math.abs(rpm - idle) < 8) {
        rpm = idle;
        frameAt = 0;
        paint(idle);
        return;
      }
      paint(rpm);
      frame = requestAnimationFrame(animate);
    };

    const onScroll = () => {
      const y = window.scrollY;
      const distance = Math.abs(y - lastScrollY);
      lastScrollY = y;
      const now = performance.now();
      if (introStart !== null && now - introStart < ENGINE_INTRO_DURATION) return;
      if (distance < 1) return;
      const dt = Math.min(80, Math.max(8, now - lastScrollAt));
      const throttle = Math.min(1, distance / dt / 2.2);
      target = idle + (redline - idle) * Math.sqrt(throttle);
      lastScrollAt = now;
      if (!frame) frame = requestAnimationFrame(animate);
    };

    const stop = () => {
      window.removeEventListener("scroll", onScroll);
      listening = false;
      cancelAnimationFrame(frame);
      frame = 0;
      frameAt = 0;
      lastScrollAt = -Infinity;
      rpm = idle;
      target = idle;
      paint(idle);
    };

    const sync = () => {
      if (preference.matches) {
        stop();
        return;
      }
      if (!nearBanner) {
        if (!introActive()) stop();
        return;
      }
      if (listening) return;
      listening = true;
      lastScrollY = window.scrollY;
      window.addEventListener("scroll", onScroll, {passive:true});
    };

    const observer = typeof IntersectionObserver === "function" ? new IntersectionObserver(([entry]) => {
      nearBanner = entry.isIntersecting;
      sync();
    }, {rootMargin:"96px 0px"}) : null;
    observer?.observe(panel);
    preference.addEventListener("change", sync);
    if (introStart !== null) {
      paint(0);
      frame = requestAnimationFrame(animate);
    }
    sync();
    return () => {
      observer?.disconnect();
      preference.removeEventListener("change", sync);
      stop();
    };
  }, [intro]);

  return (
    <div ref={gauge} className="v2-engine-gauge" aria-hidden="true" data-starting={intro || undefined}>
      <span className="v2-engine-dial">
        <span className="v2-engine-scale"/>
        <span className="v2-engine-needle" ref={needle}/>
        <span className="v2-engine-hub"/>
      </span>
      <span className="v2-engine-readout">
        <strong ref={readout} dir="ltr">800</strong>
        <span>{lang === "ar" ? "دورة/دقيقة" : "RPM"}</span>
      </span>
    </div>
  );
}

import { useEffect, useRef } from "react";

export type HighlightMeterKind = "power" | "torque" | "range";

const number = "(?:[0-9]{1,3}(?:,[0-9]{3})+|[0-9]+)(?:\\.[0-9]{1,3})?";
const firstNumber = `(?<first>${number})`;
const valuePatterns = {
  power: new RegExp(`^${firstNumber}(?<suffix> (?:hp|حصان)(?: .*)?)$`, "i"),
  torque: new RegExp(`^${firstNumber}(?<suffix> (?:Nm|نيوتن متر)(?: .*)?)$`, "i"),
  range: new RegExp(
    `^(?<prefix>(?:up to|approximately|more than|حتى|نحو|أكثر من) )?${firstNumber}` +
      `(?:(?<separator>[–-])(?<last>${number}))?(?<suffix> (?:km|كم)(?: .*)?)$`,
    "i",
  ),
};
const formatter = new Intl.NumberFormat("en-US", { maximumFractionDigits: 3 });
const duration = 850;

export function HighlightMeter({ kind, value }: { kind: HighlightMeterKind; value: string }) {
  const block = useRef<HTMLSpanElement>(null);
  const counter = useRef<HTMLElement>(null);
  const fill = useRef<HTMLSpanElement>(null);
  const canCount = valuePatterns[kind].test(value);

  useEffect(() => {
    const meter = block.current;
    const text = counter.current;
    const bar = fill.current;
    const match = value.match(valuePatterns[kind])?.groups;
    if (!meter || !text || !bar || !match || !window.IntersectionObserver || !bar.animate) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reducedMotion.matches) return;

    const { prefix = "", first, separator, last = "0", suffix } = match;
    const start = Number(first.replace(/,/g, ""));
    const end = Number(last.replace(/,/g, ""));
    if (!Number.isFinite(start) || !Number.isFinite(end)) return;
    const precision = 10 ** (first.split(".")[1]?.length ?? 0);
    const endPrecision = 10 ** (last.split(".")[1]?.length ?? 0);

    let request = 0;
    let animation: Animation | undefined;
    const finish = () => {
      observer.disconnect();
      window.cancelAnimationFrame(request);
      animation?.cancel();
      delete meter.dataset.counting;
      delete meter.dataset.pending;
      text.textContent = value;
    };

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting || entry.intersectionRatio < 0.3 || reducedMotion.matches) return;
      observer.disconnect();

      try {
        animation = bar.animate(
          { transform: ["scaleX(0)", "scaleX(1)"] },
          { duration, easing: "cubic-bezier(0.33, 1, 0.68, 1)", fill: "forwards" },
        );
      } catch {
        finish();
        return;
      }
      text.textContent = prefix + (separator ? `0${separator}0` : "0") + suffix;
      meter.dataset.counting = "true";
      const startedAt = performance.now();
      const tick = (now: number) => {
        const elapsed = Math.max(0, (now - startedAt) / duration);
        if (elapsed >= 1) {
          finish();
          return;
        }

        const progress = 1 - (1 - elapsed) ** 3;
        const firstValue = formatter.format(Math.round(start * progress * precision) / precision);
        const secondValue = separator ? separator + formatter.format(Math.round(end * progress * endPrecision) / endPrecision) : "";
        const next = prefix + firstValue + secondValue + suffix;
        if (text.textContent !== next) text.textContent = next;
        request = window.requestAnimationFrame(tick);
      };
      request = window.requestAnimationFrame(tick);
    }, { threshold: 0.3 });

    const preferenceChanged = () => {
      if (reducedMotion.matches) finish();
    };
    reducedMotion.addEventListener("change", preferenceChanged);
    meter.dataset.pending = "true";
    observer.observe(meter);

    return () => {
      reducedMotion.removeEventListener("change", preferenceChanged);
      finish();
    };
  }, [kind, value]);

  if (!canCount) return <bdi>{value}</bdi>;

  return (
    <span className="v2-highlight-meter" data-meter={kind} ref={block}>
      <span className="v2-highlight-meter-value">
        <bdi>{value}</bdi>
        <bdi className="v2-highlight-meter-counter" aria-hidden="true" ref={counter}>{value}</bdi>
      </span>
      <span className="v2-highlight-meter-track" aria-hidden="true">
        <span className="v2-highlight-meter-well">
          <span className="v2-highlight-meter-fill" ref={fill} />
        </span>
      </span>
    </span>
  );
}

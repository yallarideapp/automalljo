import {useEffect,useLayoutEffect,useRef,useState,type CSSProperties} from "react";
import {formatMoney,formatNumber} from "@/number-format";
import type {Lang} from "@/site-data";

const motionPreference = "(prefers-reduced-motion: reduce)";
const digitStrip = "0\n1\n2\n3\n4\n5\n6\n7\n8\n9\n".repeat(3).trimEnd();
const offset = (row: number) => `translateY(calc(${-row} * var(--v2-payment-row)))`;
type RollingAnimation = {animation: Animation; from: number; to: number};

function PaymentDigit({digit}: {digit: number}) {
 const track = useRef<HTMLSpanElement>(null);
 const restingRow = useRef(digit + 10);
 const running = useRef<RollingAnimation | null>(null);

 useLayoutEffect(() => {
  const element = track.current;
  const target = digit + 10;
  if (!element || restingRow.current === target) return;

  const active = running.current;
  const progress = active?.animation.effect?.getComputedTiming().progress;
  const previous = active && progress != null
   ? active.from + (active.to - active.from) * progress
   : restingRow.current;
  active?.animation.cancel();
  restingRow.current = target;

  // Recenter the repeated strip so crossing from 9 to 0 takes just one step.
  const from = 10 + previous % 10;
  const distance = target - from;
  const to = target - 10 * Math.round(distance / 10);
  running.current = null;
  try {
   const animation = element.animate(
    [{transform: offset(from)}, {transform: offset(to)}],
    {duration: 300, easing: "cubic-bezier(.22,.7,.28,1)"},
   );
   running.current = {animation, from, to};
  } catch {
   // The reel already has the final digit as its regular CSS transform.
  }
 }, [digit]);

 useLayoutEffect(() => () => running.current?.animation.cancel(), []);

 return (
  <span className="v2-payment-digit">
   <span
    ref={track}
    className="v2-payment-reel"
    style={{"--v2-payment-offset": offset(digit + 10)} as CSSProperties}
   >
    {digitStrip}
   </span>
  </span>
 );
}

export function RollingPayment({amount,lang}: {amount: number | null; lang: Lang}) {
 const [enabled, setEnabled] = useState(false);
 useEffect(() => {
  if (!("animate" in Element.prototype) || !window.matchMedia) return;
  const preference = window.matchMedia(motionPreference);
  const update = () => setEnabled(!preference.matches);
  update();
  preference.addEventListener?.("change", update);
  return () => preference.removeEventListener?.("change", update);
 }, []);

 const text = amount === null ? "—" : formatMoney(amount, lang);
 if (!enabled || amount === null || !Number.isFinite(amount)) return <bdi>{text}</bdi>;

 const number = formatNumber(Math.round(amount));
 return (
  <>
   <bdi className="v2-payment-exact">{text}</bdi>
   <span className="v2-payment-visual" aria-hidden="true" style={{display: "none"}}>
    {lang === "en" && <span>JOD</span>}
    <bdi className="v2-payment-number" dir="ltr">
     {Array.from(number, (character, index) => {
      const place = number.length - index;
      return character === ","
       ? <span key={place}>,</span>
       : <PaymentDigit key={place} digit={Number(character)} />;
     })}
    </bdi>
    {lang === "ar" && <span>دينار</span>}
   </span>
  </>
 );
}

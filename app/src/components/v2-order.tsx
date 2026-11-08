import {DirectionArrow} from "./direction-arrow";
import {useEffect,useRef,useState} from "react";
import {whatsapp,type Lang,type Vehicle} from "@/site-data";
import {addOrder,type Order,type OrderKind} from "@/local-store";

export const orderCopy={
 en:{open:"Order this car",title:"Order this car",intro:"Leave your details and the showroom team will contact you.",kind:"What would you like to do?",
  kinds:{reserve:"Reserve it",["test-drive"]:"Book a test drive",buy:"Buy it"} as Record<OrderKind,string>,
  name:"Your name",phone:"Phone number",phonePh:"07X XXX XXXX",preferred:"Best time to call",times:{any:"Any time",morning:"Morning",afternoon:"Afternoon",evening:"Evening"} as Record<string,string>,
  message:"Message (optional)",messagePh:"Trade-in, financing, questions…",send:"Send order",cancel:"Cancel",close:"Close",
  needName:"Please enter your name.",needPhone:"Please enter a phone number we can call.",
  doneTitle:"Order received",doneBody:"Thank you. The showroom team will contact you about this car.",whatsapp:"Also send it on WhatsApp",
  reserved:"This car is reserved. You can still order it if the reservation falls through."},
 ar:{open:"اطلب هذه السيارة",title:"اطلب هذه السيارة",intro:"اترك بياناتك وسيتواصل معك فريق المعرض.",kind:"ماذا تريد؟",
  kinds:{reserve:"حجز السيارة",["test-drive"]:"تجربة قيادة",buy:"شراء السيارة"} as Record<OrderKind,string>,
  name:"الاسم",phone:"رقم الهاتف",phonePh:"07X XXX XXXX",preferred:"أفضل وقت للاتصال",times:{any:"أي وقت",morning:"صباحاً",afternoon:"بعد الظهر",evening:"مساءً"} as Record<string,string>,
  message:"رسالة (اختياري)",messagePh:"استبدال، تمويل، أسئلة…",send:"أرسل الطلب",cancel:"إلغاء",close:"إغلاق",
  needName:"يرجى كتابة الاسم.",needPhone:"يرجى كتابة رقم هاتف يمكننا الاتصال به.",
  doneTitle:"تم استلام الطلب",doneBody:"شكراً لك. سيتواصل معك فريق المعرض بخصوص هذه السيارة.",whatsapp:"أرسله على واتساب أيضاً",
  reserved:"هذه السيارة محجوزة. يمكنك طلبها في حال إلغاء الحجز."}
};
const kinds:OrderKind[]=["reserve","test-drive","buy"];

/** The order text staff receive on WhatsApp, in the customer's language. */
export function orderMessage(order:Pick<Order,"kind"|"car"|"name"|"phone"|"preferred"|"message">,lang:Lang){
 const c=orderCopy[lang];
 return [lang==="ar"?"مرحباً أوتومول، طلب جديد:":"Hello AutoMall, a new order:",c.kinds[order.kind]+": "+order.car,c.name+": "+order.name,c.phone+": "+order.phone,c.preferred+": "+(c.times[order.preferred]??order.preferred),order.message?c.message.replace(/ \(.*\)/,"")+": "+order.message:""].filter(Boolean).join("\n");
}

export function OrderButton({vehicle,lang}:{vehicle:Vehicle;lang:Lang}){
 const c=orderCopy[lang],dialog=useRef<HTMLDialogElement>(null),first=useRef<HTMLInputElement>(null);
 const [open,setOpen]=useState(false),[kind,setKind]=useState<OrderKind>("reserve"),[name,setName]=useState(""),[phone,setPhone]=useState(""),[preferred,setPreferred]=useState("any"),[message,setMessage]=useState("");
 const [error,setError]=useState(""),[done,setDone]=useState<Order|null>(null);
 useEffect(()=>{const element=dialog.current;if(!element)return;if(open&&!element.open){element.showModal();requestAnimationFrame(()=>first.current?.focus());}else if(!open&&element.open)element.close();},[open]);
 if(vehicle.status==="sold")return null;
 const car=vehicle.year+" "+vehicle.brand+" "+vehicle.name;
 const submit=()=>{
  if(!name.trim()){setError(c.needName);return;}
  if(phone.replace(/\D/g,"").length<9){setError(c.needPhone);return;}
  setError("");
  setDone(addOrder({kind,vehicleId:vehicle.id,car,price:vehicle.price?.amount,name:name.trim(),phone:phone.trim(),preferred,message:message.trim(),lang}));
 };
 const close=()=>{setOpen(false);if(done){setDone(null);setMessage("");}};
 return <>
  <button type="button" className="v2-garage-button v2-garage-button-label v2-order-button" onClick={()=>setOpen(true)} aria-haspopup="dialog">
   <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 11V7a3 3 0 0 1 6 0v4"/><path d="M5 9h14l-1 11H6Z"/></svg><span>{c.open}</span>
  </button>
  <dialog ref={dialog} className="v2-order-dialog" aria-labelledby="v2-order-title" onClose={close} onClick={event=>{if(event.target===event.currentTarget)close();}}>
   {done?<div className="v2-order-done" role="status">
    <h2 id="v2-order-title">{c.doneTitle}</h2><p>{c.doneBody}</p>
    <p className="v2-order-summary"><strong>{c.kinds[done.kind]}</strong> · {done.car}</p>
    <div className="v2-order-actions"><a className="v2-button v2-button-orange" href={whatsapp(orderMessage(done,lang))} target="_blank" rel="noopener noreferrer">{c.whatsapp} <DirectionArrow kind="outward"/></a><button type="button" className="v2-order-secondary" onClick={close}>{c.close}</button></div>
   </div>:<form onSubmit={event=>{event.preventDefault();submit();}} noValidate>
    <div className="v2-order-head"><h2 id="v2-order-title">{c.title}</h2><button type="button" className="v2-order-x" onClick={close} aria-label={c.close}>×</button></div>
    <p className="v2-order-car">{car}</p>
    <p className="v2-order-intro">{c.intro}</p>
    {vehicle.status==="reserved"&&<p className="v2-order-note">{c.reserved}</p>}
    <fieldset className="v2-order-kinds"><legend>{c.kind}</legend>{kinds.map(item=><label key={item} data-checked={kind===item||undefined}><input type="radio" name="v2-order-kind" value={item} checked={kind===item} onChange={()=>setKind(item)}/><span>{c.kinds[item]}</span></label>)}</fieldset>
    <div className="v2-order-grid">
     <label><span>{c.name}</span><input ref={first} value={name} onChange={event=>setName(event.target.value)} autoComplete="name" maxLength={80} required/></label>
     <label><span>{c.phone}</span><input value={phone} onChange={event=>setPhone(event.target.value)} type="tel" inputMode="tel" autoComplete="tel" dir="ltr" placeholder={c.phonePh} maxLength={20} required/></label>
     <label><span>{c.preferred}</span><select value={preferred} onChange={event=>setPreferred(event.target.value)}>{Object.entries(c.times).map(([key,value])=><option key={key} value={key}>{value}</option>)}</select></label>
     <label className="v2-order-wide"><span>{c.message}</span><textarea value={message} onChange={event=>setMessage(event.target.value)} rows={3} maxLength={600} placeholder={c.messagePh}/></label>
    </div>
    {error&&<p className="v2-order-error" role="alert">{error}</p>}
    <div className="v2-order-actions"><button type="submit" className="v2-button v2-button-orange">{c.send} <DirectionArrow kind="outward"/></button><button type="button" className="v2-order-secondary" onClick={close}>{c.cancel}</button></div>
   </form>}
  </dialog>
 </>;
}

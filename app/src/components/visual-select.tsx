import {useState,type ReactNode} from "react";
import {Select} from "@base-ui/react/select";
import {DirectionProvider} from "@base-ui/react/direction-provider";

export type VisualSelectOption={value:string;label:string;visual:ReactNode;count?:number};
export function VisualSelect({id,label,value,options,onChange,dir="ltr"}:{id:string;label:string;value:string;options:VisualSelectOption[];onChange:(value:string)=>void;dir?:"ltr"|"rtl"}){
 const [open,setOpen]=useState(false);
 const selected=options.find(option=>option.value===value)??options[0];
 return <DirectionProvider direction={dir}><div className="v2-visual-select" data-open={open||undefined}>
  <Select.Root<string> value={value} onValueChange={next=>{if(next!==null)onChange(next);}} open={open} onOpenChange={setOpen} modal={false} items={options.map(option=>({value:option.value,label:option.label}))}>
   <Select.Trigger id={id} aria-label={label} className="v2-visual-trigger">
    <Select.Value className="v2-option-value"><span className="v2-option-visual">{selected.visual}</span><span className="v2-option-name">{selected.label}</span>{selected.count!==undefined&&<span className="v2-option-count">{selected.count}</span>}</Select.Value>
    <svg className="v2-picker-chevron" width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="m4 6 4 4 4-4"/></svg>
   </Select.Trigger>
   <Select.Positioner className="v2-visual-positioner" sideOffset={8} collisionPadding={8} alignItemWithTrigger={false} positionMethod="absolute">
    <Select.Popup className="v2-visual-options"><Select.List className="v2-visual-list" aria-label={label}>
     {options.map(option=><Select.Item className="v2-visual-option" key={option.value} value={option.value} label={option.label}>
      <span className="v2-option-visual">{option.visual}</span><Select.ItemText className="v2-option-name">{option.label}</Select.ItemText>{option.count!==undefined&&<span className="v2-option-count">{option.count}</span>}
      <Select.ItemIndicator className="v2-option-check"><svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="m3 8 3 3 7-7"/></svg></Select.ItemIndicator>
     </Select.Item>)}
    </Select.List></Select.Popup>
   </Select.Positioner>
  </Select.Root>
 </div></DirectionProvider>;
}

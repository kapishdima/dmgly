"use client";
import { ColorControl, SelectControl, Slider } from "dialkit";
import "dialkit/styles.css";
import { Composition } from "@/lib/dmgly/model";

export function hexColor(value: string): string {
  const c=document.createElement("canvas").getContext("2d")!;
  c.fillStyle="#000000";c.fillStyle=value;c.fillRect(0,0,1,1);
  return "#"+Array.from(c.getImageData(0,0,1,1).data).slice(0,3).map(v=>v.toString(16).padStart(2,"0")).join("");
}
export function BackgroundProperties({document:d,onChange}:{document:Composition;onChange:(d:Composition)=>void}) {
 const b=d.background;
 const update=(patch:Partial<typeof b>)=>onChange({...d,background:{...b,...patch}});
 return <div className="dialkit-root control-stack" data-theme="light">
   <div className="segment">{(["solid","gradient","image"] as const).map(mode=><button key={mode} aria-pressed={b.mode===mode} className={b.mode===mode?"active":""} onClick={()=>update({mode})}>{mode[0].toUpperCase()+mode.slice(1)}</button>)}</div>
   {b.mode==="solid" && <ColorControl label="Color" value={b.solid} onChange={value=>update({solid:hexColor(value)})}/>}
   {b.mode==="gradient" && <>
     <SelectControl label="Type" value={b.gradient.type} options={[{value:"linear",label:"Linear"},{value:"radial",label:"Radial"}]} onChange={type=>update({gradient:{...b.gradient,type:type as "linear"|"radial"}})}/>
     {b.gradient.type==="linear" && <Slider label="Angle" value={b.gradient.angle} min={0} max={360} step={1} unit="°" onChange={angle=>update({gradient:{...b.gradient,angle}})}/>}
     <p className="field-label">COLOR STOPS</p>
     {b.gradient.stops.map((stop,i)=><div className="color-stop" key={stop.id}>
       <ColorControl label={`Color ${i+1}`} value={stop.color} onChange={color=>update({gradient:{...b.gradient,stops:b.gradient.stops.map(s=>s.id===stop.id?{...s,color:hexColor(color)}:s)}})}/>
       <div className="stop-position"><Slider label="Position" value={stop.at} min={0} max={100} step={1} unit="%" onChange={at=>update({gradient:{...b.gradient,stops:b.gradient.stops.map(s=>s.id===stop.id?{...s,at}:s)}})}/><button className="small-button" aria-label={`Remove color ${i+1}`} disabled={b.gradient.stops.length<=2} onClick={()=>update({gradient:{...b.gradient,stops:b.gradient.stops.filter(s=>s.id!==stop.id)}})}>×</button></div>
     </div>)}
     <button className="secondary-button" disabled={b.gradient.stops.length>=8} onClick={()=>update({gradient:{...b.gradient,stops:[...b.gradient.stops,{id:crypto.randomUUID(),color:"#ffffff",at:50}]}})}>+ Add color stop</button>
   </>}
 </div>;
}

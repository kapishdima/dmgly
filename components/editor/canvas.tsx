"use client";
import { useEffect, useRef, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Folder01Icon } from "@hugeicons/core-free-icons";
import { Composition, ElementId, MovableId, moveElement, TITLEBAR_HEIGHT } from "@/lib/dmgly/model";

export function DmgCanvas({ document: d, selected, onSelect, onChange, onBegin, onEnd, artwork }: {
  document: Composition; selected: ElementId; onSelect: (id: ElementId) => void; onChange: (d: Composition) => void; onBegin?: () => void; onEnd?: () => void; artwork?: React.ReactNode;
}) {
  const host = useRef<HTMLDivElement>(null);
  const drag = useRef<{ id: MovableId; clientX: number; clientY: number; x: number; y: number } | null>(null);
  const [available, setAvailable] = useState(660);
  const [zoom, setZoom] = useState<number | "fit">("fit");
  const [guides, setGuides] = useState<{ x?: number; y?: number }>({});
  useEffect(() => { const el = host.current!; const observer = new ResizeObserver(entries => setAvailable(entries[0].contentRect.width)); observer.observe(el); return () => observer.disconnect(); }, []);
  const scale = zoom === "fit" ? Math.min(1, available / d.window.width) : zoom;
  function snap(id: MovableId, x: number, y: number) {
    const xs = [d.window.width / 2], ys = [(d.window.height - TITLEBAR_HEIGHT) / 2];
    for (const other of ["app", "applications", "text", "arrow"] as const) if (other !== id && (!("visible" in d[other]) || d[other].visible)) { xs.push(d[other].x); ys.push(d[other].y); }
    const gx = xs.find(v => Math.abs(v - x) < 6 / scale), gy = ys.find(v => Math.abs(v - y) < 6 / scale);
    setGuides({ x: gx, y: gy }); return [gx ?? x, gy ?? y];
  }
  function item(id: MovableId, content: React.ReactNode, label: string, native = false) {
    const el = d[id];
    return <button type="button" key={id} className={`canvas-object ${native ? "native-object" : "decoration-object"} ${selected === id ? "selected" : ""}`} aria-label={label} aria-pressed={selected === id}
      style={{ left: el.x, top: el.y }}
      onClick={e => { e.stopPropagation(); onSelect(id); }}
      onPointerDown={e => { if (e.button !== 0) return; e.stopPropagation(); e.preventDefault(); e.currentTarget.focus(); onSelect(id); onBegin?.(); drag.current = { id, clientX: e.clientX, clientY: e.clientY, x: el.x, y: el.y }; e.currentTarget.setPointerCapture(e.pointerId); }}
      onPointerMove={e => { const start = drag.current; if (!start || start.id !== id) return; const [x,y] = snap(id, start.x + (e.clientX - start.clientX) / scale, start.y + (e.clientY - start.clientY) / scale); onChange(moveElement(d, id, x, y)); }}
      onPointerUp={() => { if (drag.current) { drag.current = null; setGuides({}); onEnd?.(); } }}
      onPointerCancel={() => { drag.current = null; setGuides({}); onEnd?.(); }}
      onKeyDown={e => { const offsets: Record<string, [number,number]> = { ArrowLeft:[-1,0], ArrowRight:[1,0], ArrowUp:[0,-1], ArrowDown:[0,1] }; const v=offsets[e.key]; if (!v) return; e.preventDefault(); const n=e.shiftKey?10:1; onChange(moveElement(d,id,el.x+v[0]*n,el.y+v[1]*n)); }}
    >{content}</button>;
  }
  return <>
    <div ref={host} className="canvas-host"><div className="canvas-scroll"><div className="canvas-size" style={{ width:d.window.width*scale,height:d.window.height*scale }}>
      <div className="finder live-finder" style={{ width:d.window.width,height:d.window.height,transform:`scale(${scale})` }}>
        <div className="finder-title"><span className="traffic-lights" aria-hidden="true"><i/><i/><i/></span><span>{d.app.name}</span></div>
        <div className="artboard" style={{ height:d.window.height-TITLEBAR_HEIGHT }} onClick={() => onSelect("background")}>
          {artwork || <div className="artwork" style={{background:"linear-gradient(135deg,#ffefd5,#e9a26c)"}} />}
          {item("app",<><span className="app-placeholder">{d.app.image ? <img src={d.app.image.data} alt="" draggable={false}/> : d.app.name.slice(0,1).toUpperCase()}</span><span className="icon-label">{d.app.name}</span></>,"App icon",true)}
          {item("applications",<><HugeiconsIcon icon={Folder01Icon} size={120} strokeWidth={1.3} color="#168cb9" fill="#8ed8f5"/><span className="icon-label">Applications</span></>,"Applications folder",true)}
          {d.text.visible && item("text",<span style={{fontFamily:"Arial",fontSize:d.text.size,color:d.text.color,whiteSpace:"pre",lineHeight:1.3}}>{d.text.content}</span>,"Instruction text")}
          {d.arrow.visible && item("arrow",<span style={{fontSize:58,color:d.arrow.color,lineHeight:1}}>→</span>,"Installation arrow")}
          {guides.x !== undefined && <div className="guide guide-x" style={{left:guides.x}}/>}{guides.y !== undefined && <div className="guide guide-y" style={{top:guides.y}}/>}
        </div>
      </div>
    </div></div></div>
    <div className="canvas-toolbar"><span>{d.window.width} × {d.window.height}<span className="toolbar-muted"> px</span></span><div className="zoom-controls"><button aria-label="Zoom out" onClick={() => setZoom(Math.max(.25,scale-.1))}>−</button><output>{Math.round(scale*100)}%</output><button aria-label="Zoom in" onClick={() => setZoom(Math.min(2,scale+.1))}>+</button><button onClick={() => setZoom("fit")}>Fit</button></div></div>
  </>;
}

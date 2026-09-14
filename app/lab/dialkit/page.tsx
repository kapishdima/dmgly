"use client";

import { useState } from "react";
import { ColorControl, ImageControl, Slider, TextControl, Toggle } from "dialkit";
import "dialkit/styles.css";

const initial = { x: 100, color: "#f69237", title: "Drag me", visible: true, image: "" };
export default function DialKitLab() {
  const [value, setValue] = useState(initial);
  const [previous, setPrevious] = useState(initial);
  function edit(patch: Partial<typeof value>) { setPrevious(value); setValue({ ...value, ...patch }); }
  return <main style={{ padding: 40 }}>
    <h1>DialKit integration lab</h1>
    <p>A controlled component probe for REM-415.</p>
    <div style={{ display: "flex", gap: 40, marginTop: 30 }}>
      <div style={{ position: "relative", width: 450, height: 300, background: "#eee" }}>
        {value.visible && <button aria-label="Preview object" style={{ position: "absolute", left: value.x, top: 80, background: value.color, padding: 24, touchAction: "none" }}
          onPointerDown={e => { setPrevious(value); e.currentTarget.setPointerCapture(e.pointerId); }}
          onPointerMove={e => { if (e.currentTarget.hasPointerCapture(e.pointerId)) setValue(v => ({ ...v, x: Math.max(0, Math.min(300, e.clientX - e.currentTarget.parentElement!.getBoundingClientRect().left - 40)) })); }}
        >{value.title}</button>}
      </div>
      <aside className="dialkit-root" data-theme="light" style={{ width: 300 }}>
        <Slider label="X position" value={value.x} min={0} max={300} step={1} onChange={x => edit({ x })} />
        <ColorControl label="Color" value={value.color} onChange={color => edit({ color })} />
        <TextControl label="Title" value={value.title} onChange={title => edit({ title })} />
        <Toggle label="Visible" checked={value.visible} onChange={visible => edit({ visible })} />
        <ImageControl label="Image" value={value.image} onChange={image => edit({ image })} />
        <button onClick={() => setValue(previous)}>Undo</button>
        <output data-testid="position">{value.x}</output>
      </aside>
    </div>
  </main>;
}

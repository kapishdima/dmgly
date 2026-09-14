"use client";

import { useState } from "react";
import { createComposition } from "@/lib/dmgly/model";
import "./editor.css";

export default function Editor() {
  const [document] = useState(createComposition);
  return <div className="dmgly">
    <header className="site-header"><a className="wordmark" href="/">Dmgly<span>.</span></a><span className="header-note">A little care, before the first launch.</span><a href="https://github.com" className="quiet-link" hidden>GitHub</a></header>
    <main>
      <div className="intro"><span className="eyebrow">MAKE YOURSELF AT HOME</span><h1>A lovely first impression.</h1><p>Design your DMG. Make the welcome yours.</p></div>
      <div className="workspace">
        <section className="preview-area" aria-label="DMG preview">
          <div className="preview-caption"><span>YOUR INSTALLER</span><span>macOS preview</span></div>
          <div className="stage"><div className="finder" style={{ width: 660 }}>
            <div className="finder-title"><span className="traffic-lights"><i/><i/><i/></span><span>{document.app.name}</span></div>
            <div className="static-art"><div className="starter-app">A</div><span className="starter-arrow">→</span><div className="starter-folder">Applications</div><p>Drag to Applications to install</p></div>
          </div></div>
          <div className="canvas-toolbar"><span>660 × 400</span><span>100% · Fit</span></div>
          <p className="preview-note">A small window. A warm welcome.</p>
        </section>
        <aside className="inspector"><div className="inspector-heading"><h2>Make it yours</h2><span>01 — Background</span></div><div className="segment"><button className="active">Background</button><button disabled>Elements</button></div><p className="field-label">BACKGROUND</p><div className="segment"><button>Solid</button><button className="active">Gradient</button><button>Image</button></div><div className="gradient-sample"/><div className="swatch-row"><span style={{background:'#ffefd5'}}/> <span>#FFEFD5</span><span style={{background:'#e9a26c'}}/><span>#E9A26C</span></div><p className="inspector-help">Your canvas is the starting point.<br/>Every detail will update right here.</p><button className="primary-button" disabled>Export design <span>↗</span></button></aside>
      </div>
    </main>
    <footer><span>Made for the moment before “Open”.</span><span>Electron · Tauri · macOS</span></footer>
  </div>;
}

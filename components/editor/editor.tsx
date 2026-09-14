"use client";

import { useState } from "react";
import { BackgroundProperties } from "./properties";
import { backgroundSvg } from "@/lib/dmgly/artwork";
import { DmgCanvas } from "./canvas";
import { createComposition, ElementId } from "@/lib/dmgly/model";
import "./editor.css";

export default function Editor() {
  const [document, setDocument] = useState(createComposition);
  const [selected, setSelected] = useState<ElementId>("background");
  return <div className="dmgly">
    <header className="site-header"><a className="wordmark" href="/">Dmgly<span>.</span></a><span className="header-note">A little care, before the first launch.</span><a href="https://github.com" className="quiet-link" hidden>GitHub</a></header>
    <main>
      <div className="intro"><span className="eyebrow">MAKE YOURSELF AT HOME</span><h1>A lovely first impression.</h1><p>Design your DMG. Make the welcome yours.</p></div>
      <div className="workspace">
        <section className="preview-area" aria-label="DMG preview">
          <div className="preview-caption"><span>YOUR INSTALLER</span><span>macOS preview</span></div>
          <DmgCanvas document={document} selected={selected} onSelect={setSelected} onChange={setDocument} artwork={<div className="artwork" dangerouslySetInnerHTML={{__html:backgroundSvg(document)}} />} />
          <p className="preview-note">A small window. A warm welcome.</p>
        </section>
        <aside className="inspector"><div className="inspector-heading"><h2>Make it yours</h2><span>Background</span></div><BackgroundProperties document={document} onChange={setDocument}/><p className="inspector-help">Your design stays in your browser.</p><button className="primary-button" disabled>Export design <span>↗</span></button></aside>
      </div>
    </main>
    <footer><span>Made for the moment before “Open”.</span><span>Electron · Tauri · macOS</span></footer>
  </div>;
}

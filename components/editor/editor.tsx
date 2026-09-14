"use client";

import Link from "next/link";
import { useState } from "react";
import { ExportDialog } from "./export-dialog";
import { Inspector } from "./properties";
import { artworkSvg } from "@/lib/dmgly/artwork";
import { DmgCanvas } from "./canvas";
import { useDraft } from "./use-draft";
import { useComposition } from "./use-composition";
import { ElementId } from "@/lib/dmgly/model";
import "./editor.css";

export default function Editor() {
  const {
    document,
    edit: setDocument,
    begin,
    end,
    undo,
    redo,
    canUndo,
    canRedo,
    restore,
  } = useComposition();
  const draft = useDraft(document, restore);
  const [selected, setSelected] = useState<ElementId>("background");
  return (
    <div className="dmgly">
      <header className="site-header">
        <Link className="wordmark" href="/">
          Dmgly<span>.</span>
        </Link>
        <span className="header-note">A little care, before the first launch.</span>
      </header>
      <main>
        <div className="intro">
          <span className="eyebrow">MAKE YOURSELF AT HOME</span>
          <h1>A lovely first impression.</h1>
          <p>Design your DMG. Make the welcome yours.</p>
        </div>
        <div className="workspace" inert={!draft.ready} aria-busy={!draft.ready}>
          <section className="preview-area" aria-label="DMG preview">
            <div className="preview-caption">
              <span>YOUR INSTALLER</span>
              <span>macOS preview</span>
            </div>
            <DmgCanvas
              document={document}
              selected={selected}
              onSelect={setSelected}
              onChange={setDocument}
              onBegin={begin}
              onEnd={end}
              artwork={
                <div
                  className="artwork"
                  dangerouslySetInnerHTML={{ __html: artworkSvg(document) }}
                />
              }
            />
            <div className="history-toolbar">
              <button onClick={undo} disabled={!canUndo}>
                ↶ Undo
              </button>
              <button onClick={redo} disabled={!canRedo}>
                ↷ Redo
              </button>
            </div>
            <p className="preview-note">Drag an icon to find its place.</p>
          </section>
          <Inspector
            document={document}
            selected={selected}
            onSelect={setSelected}
            onChange={setDocument}
            onBegin={begin}
            onEnd={end}
          >
            <p className="inspector-help">{draft.status}</p>
            <ExportDialog document={document} />
          </Inspector>
        </div>
      </main>
      <footer>
        <span>Made for the moment before “Open”.</span>
        <span>Electron · Tauri · macOS</span>
      </footer>
    </div>
  );
}

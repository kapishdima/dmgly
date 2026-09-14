"use client";

import { useState } from "react";
import {
  UndoIcon,
  RedoIcon,
  CheckmarkCircle02Icon,
  GithubIcon,
  NewTwitterIcon,
  ReloadIcon,
} from "@hugeicons/core-free-icons";
import { Icon } from "./icon";
import { ExportDialog } from "./export-dialog";
import { ShortcutsDialog } from "./shortcuts-dialog";
import { Inspector } from "./properties";
import { artworkSvg } from "@/lib/dmgly/artwork";
import { DmgCanvas } from "./canvas";
import { useDesignUrl } from "./use-design-url";
import { useComposition } from "./use-composition";
import { useInputModality } from "./use-input-modality";
import { ElementId, createComposition } from "@/lib/dmgly/model";
import { selectElement } from "@/lib/dmgly/transforms";
import "./editor.css";

export default function Editor() {
  useInputModality();
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
  const designUrl = useDesignUrl(document, restore);
  const [selection, setSelection] = useState<ElementId[]>(["background"]);
  const selected = selection[selection.length - 1] ?? "background";
  const select = (id: ElementId, additive = false) =>
    setSelection((current) => selectElement(current, id, additive));
  return (
    <div className="dmgly">
      <main className="editor-main">
        <div className="intro">
          <div className="intro-brand-row">
            <span className="intro-brand">Dmgly</span>
            <nav className="intro-socials" aria-label="Social links">
              <a
                href="https://github.com/kapishdima/dmgly"
                aria-label="Dmgly on GitHub"
                title="GitHub"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Icon icon={GithubIcon} size={16} />
              </a>
              <a
                href="https://x.com/kapish_dima"
                aria-label="Dima on X"
                title="X"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Icon icon={NewTwitterIcon} size={16} />
              </a>
            </nav>
          </div>
          <h1 className="intro-title">
            <span>Make your installer</span>
            <span>feel like your app</span>
          </h1>
          <p>
            <span>Design your DMG background and layout</span>{" "}
            <span>Export for Electron, Tauri, or Swift</span>
          </p>
        </div>
        <div
          className="workspace"
          inert={!designUrl.ready}
          aria-busy={!designUrl.ready}
        >
          <section className="preview-area" aria-label="DMG preview">
            <div className="preview-toolbar">
              <div>
                <h2>Preview</h2>
                <p>Your installer, as you make it.</p>
              </div>
              <div
                className="history-toolbar"
                role="group"
                aria-label="Preview actions"
              >
                <button
                  type="button"
                  className="toolbar-button"
                  onClick={undo}
                  disabled={!canUndo}
                  aria-label="Undo"
                  title="Undo (⌘Z / Ctrl+Z)"
                >
                  <Icon icon={UndoIcon} />
                  <span className="history-label">Undo</span>
                </button>
                <button
                  type="button"
                  className="toolbar-button"
                  onClick={redo}
                  disabled={!canRedo}
                  aria-label="Redo"
                  title="Redo (⇧⌘Z / Ctrl+Shift+Z)"
                >
                  <Icon icon={RedoIcon} />
                  <span className="history-label">Redo</span>
                </button>
                <button
                  type="button"
                  className="toolbar-button"
                  aria-label="Reset design"
                  title="Reset design"
                  onClick={() => {
                    const value = createComposition();
                    end();
                    setDocument(value);
                    setSelection(["background"]);
                    designUrl.reset(value);
                  }}
                >
                  <Icon icon={ReloadIcon} />
                  <span className="history-label">Reset</span>
                </button>
                <ShortcutsDialog />
              </div>
            </div>
            <DmgCanvas
              document={document}
              selected={selection}
              onSelectionChange={setSelection}
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
          </section>
          <Inspector
            document={document}
            selected={selected}
            onSelect={select}
            onChange={setDocument}
            onBegin={begin}
            onEnd={end}
          >
            <div className="inspector-footer">
              <p className="save-status" role="status">
                {designUrl.status === "Settings saved in URL" && (
                  <Icon icon={CheckmarkCircle02Icon} size={16} />
                )}
                <span>{designUrl.status}</span>
              </p>
              <ExportDialog document={document} />
            </div>
          </Inspector>
        </div>
      </main>
    </div>
  );
}

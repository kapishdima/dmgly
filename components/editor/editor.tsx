"use client";

import { useState } from "react";
import {
  UndoIcon,
  RedoIcon,
  CheckmarkCircle02Icon,
  GithubIcon,
  NewTwitterIcon,
} from "@hugeicons/core-free-icons";
import { Icon } from "./icon";
import { ExportDialog } from "./export-dialog";
import { Inspector } from "./properties";
import { artworkSvg } from "@/lib/dmgly/artwork";
import { DmgCanvas } from "./canvas";
import { useDraft } from "./use-draft";
import { useComposition } from "./use-composition";
import { ElementId } from "@/lib/dmgly/model";
import { selectElement } from "@/lib/dmgly/transforms";
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
          <h1>
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
          inert={!draft.ready}
          aria-busy={!draft.ready}
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
                aria-label="Edit history"
              >
                <button
                  type="button"
                  className="toolbar-button"
                  onClick={undo}
                  disabled={!canUndo}
                  title="Undo (⌘Z / Ctrl+Z)"
                >
                  <Icon icon={UndoIcon} />
                  Undo
                </button>
                <button
                  type="button"
                  className="toolbar-button"
                  onClick={redo}
                  disabled={!canRedo}
                  title="Redo (⇧⌘Z / Ctrl+Shift+Z)"
                >
                  <Icon icon={RedoIcon} />
                  Redo
                </button>
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
                {draft.status === "Saved on this device" && (
                  <Icon icon={CheckmarkCircle02Icon} size={16} />
                )}
                <span>{draft.status}</span>
              </p>
              <ExportDialog document={document} />
            </div>
          </Inspector>
        </div>
      </main>
    </div>
  );
}

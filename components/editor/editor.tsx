"use client";

import { useState } from "react";
import {
  UndoIcon,
  RedoIcon,
  CheckmarkCircle02Icon,
} from "@hugeicons/core-free-icons";
import { Icon } from "./icon";
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
      <main className="editor-main">
        <div className="intro">
          <h1>Make the first impression yours</h1>
          <p>
            Arrange your installer, fine-tune the details, and take it into your
            app.
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
          </section>
          <Inspector
            document={document}
            selected={selected}
            onSelect={setSelected}
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

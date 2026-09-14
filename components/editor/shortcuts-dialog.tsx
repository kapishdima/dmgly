"use client";

import { useEffect, useRef, useState } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { Cancel01Icon, HelpCircleIcon } from "@hugeicons/core-free-icons";
import { Icon } from "./icon";

const groups = [
  {
    title: "Selection",
    shortcuts: [
      ["Add or remove an element", ["Shift", "Click"]],
      ["Select all visible elements", ["⌘ / Ctrl", "A"]],
      ["Move selection by 1 px", ["↑ ↓ ← →"]],
      ["Move selection by 10 px", ["Shift", "↑ ↓ ← →"]],
      ["Clear selection or cancel a gesture", ["Esc"]],
    ],
  },
  {
    title: "Transform",
    description: "With a scale or rotation handle focused.",
    shortcuts: [
      ["Scale by 2%", ["↑ ↓ ← →"]],
      ["Scale by 10%", ["Shift", "↑ ↓ ← →"]],
      ["Rotate by 1°", ["↑ ↓ ← →"]],
      ["Rotate by 15°", ["Shift", "↑ ↓ ← →"]],
      ["Snap rotation while dragging", ["Shift", "Drag"]],
    ],
  },
  {
    title: "General",
    shortcuts: [
      ["Undo", ["⌘ / Ctrl", "Z"]],
      ["Redo", ["⌘ / Ctrl", "Shift", "Z"]],
      ["Next control", ["Tab"]],
      ["Previous control", ["Shift", "Tab"]],
      ["Activate a focused button", ["Enter / Space"]],
      ["Show keyboard shortcuts", ["/"]],
      ["Close a dialog", ["Esc"]],
    ],
  },
] as const;

export function ShortcutsDialog() {
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (
        event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey ||
        event.repeat || event.isComposing || event.defaultPrevented ||
        document.querySelector('[role="dialog"]') ||
        trigger.current?.closest("[inert]")
      ) return;
      if (
        event.target instanceof Element &&
        event.target.closest('input,textarea,[contenteditable]:not([contenteditable="false"])')
      ) return;
      event.preventDefault();
      setOpen(true);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger ref={trigger} className="icon-button" aria-label="Keyboard shortcuts" aria-keyshortcuts="/" title="Keyboard shortcuts (/)">
        <Icon icon={HelpCircleIcon} size={20} />
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop className="export-backdrop" />
        <Dialog.Popup className="shortcuts-dialog dmgly" finalFocus={trigger}>
          <div className="shortcuts-heading">
            <div>
              <Dialog.Title>Keyboard shortcuts</Dialog.Title>
              <Dialog.Description>Select, arrange, and edit from your keyboard.</Dialog.Description>
            </div>
            <Dialog.Close className="close-button" aria-label="Close keyboard shortcuts">
              <Icon icon={Cancel01Icon} />
            </Dialog.Close>
          </div>
          <div className="shortcuts-body">
            {groups.map((group) => (
              <section key={group.title} aria-label={group.title}>
                <h3>{group.title}</h3>
                {"description" in group && <p className="shortcuts-hint">{group.description}</p>}
                <dl>
                  {group.shortcuts.map(([label, keys]) => (
                    <div className="shortcut-row" key={label}>
                      <dt>{label}</dt>
                      <dd>{keys.map((key) => <kbd key={key}>{key}</kbd>)}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            ))}
          </div>
          <p className="shortcuts-footer">Drag corners to scale text and arrows. Drag outside corners to rotate. Use ⌘ on Mac or Ctrl on Windows and Linux.</p>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

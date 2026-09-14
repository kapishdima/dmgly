"use client";
import { useMemo, useRef, useState } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { Composition, compositionSchema } from "@/lib/dmgly/model";
import { ExportTarget, TARGET_NAMES } from "@/lib/dmgly/export/contract";
import { createBundle, downloadBytes, exportText } from "@/lib/dmgly/export/bundle";
export function ExportDialog({ document: d }: { document: Composition }) {
  const [open, setOpen] = useState(false),
    [target, setTarget] = useState<ExportTarget>("electron"),
    [tab, setTab] = useState<"config" | "prompt">("config"),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState("");
  const busyRef = useRef(false);
  const parsed = useMemo(() => compositionSchema.safeParse(d), [d]);
  const output = useMemo(
    () => (parsed.success ? exportText(parsed.data, target) : null),
    [parsed, target],
  );
  const error = !parsed.success
    ? "Use a valid app name (no path separators or control characters)."
    : d.background.mode === "image" && !d.background.image
      ? "Upload a background image before exporting."
      : "";
  async function copy() {
    if (!output || error) return;
    try {
      await navigator.clipboard.writeText(tab === "config" ? output.config.content : output.prompt);
      setMessage(
        tab === "config"
          ? "Config copied."
          : "AI prompt copied. Remember to include the downloaded assets.",
      );
    } catch {
      setMessage("Clipboard is unavailable. Select and copy the text below.");
    }
  }
  async function download() {
    if (busyRef.current || error) return;
    busyRef.current = true;
    setBusy(true);
    setMessage("");
    try {
      const bytes = await createBundle(d, target);
      downloadBytes(bytes, `dmgly-${target}.zip`);
      setMessage("ZIP downloaded. Your config, prompt, and assets are ready.");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Export failed. Please try again.");
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }
  return (
    <Dialog.Root
      open={open}
      onOpenChange={(value) => {
        setOpen(value);
        setMessage("");
      }}
    >
      <Dialog.Trigger className="primary-button">
        Export design <span aria-hidden="true">↗</span>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop className="export-backdrop" />
        <Dialog.Popup className="export-dialog dmgly">
          <div className="export-heading">
            <div>
              <Dialog.Title>Ready for the first launch.</Dialog.Title>
              <Dialog.Description>Take your design into your app.</Dialog.Description>
            </div>
            <Dialog.Close className="close-button" aria-label="Close export">
              ×
            </Dialog.Close>
          </div>
          <label className="export-target">
            Build with
            <select
              value={target}
              disabled={busy}
              onChange={(e) => {
                setTarget(e.target.value as ExportTarget);
                setMessage("");
              }}
            >
              {Object.entries(TARGET_NAMES).map(([id, label]) => (
                <option key={id} value={id}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <div className="segment export-tabs">
            {(["config", "prompt"] as const).map((value) => (
              <button
                key={value}
                aria-pressed={tab === value}
                className={tab === value ? "active" : ""}
                onClick={() => {
                  setTab(value);
                  setMessage("");
                }}
              >
                {value === "config" ? "Config" : "AI prompt"}
              </button>
            ))}
          </div>
          {tab === "prompt" && (
            <p className="export-helper">
              Give your AI agent this prompt and the downloaded assets.
            </p>
          )}
          {error ? (
            <p className="error-message" role="alert">
              {error}
            </p>
          ) : (
            <textarea
              className="export-code"
              aria-label={tab === "config" ? "Generated configuration" : "AI setup prompt"}
              readOnly
              value={tab === "config" ? output?.config.content : output?.prompt}
              spellCheck={false}
            />
          )}
          {output?.config.warnings.map((w) => (
            <p key={w} className="export-warning">
              {w}
            </p>
          ))}
          <div className="export-actions">
            <button className="secondary-button" disabled={!!error || busy} onClick={copy}>
              {tab === "config" ? "Copy config" : "Copy AI prompt"}
            </button>
            <button className="primary-button" disabled={!!error || busy} onClick={download}>
              {busy ? "Preparing files…" : "Download ZIP"} <span aria-hidden="true">↓</span>
            </button>
          </div>
          <p className="export-message" role="status">
            {message || "Includes your background, configuration, and setup instructions."}
          </p>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

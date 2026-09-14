"use client";
import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import {
  Cancel01Icon,
  Copy01Icon,
  Download01Icon,
  CodeIcon,
  SparklesIcon,
} from "@hugeicons/core-free-icons";
import { Icon } from "./icon";
import { PlatformSelect } from "./platform-select";
import { CodePreview } from "./code-preview";
import { Dialog } from "@base-ui/react/dialog";
import { Composition, compositionSchema } from "@/lib/dmgly/model";
import { ExportTarget } from "@/lib/dmgly/export/contract";
import {
  createBundle,
  downloadBytes,
  exportText,
} from "@/lib/dmgly/export/bundle";
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
      await navigator.clipboard.writeText(
        tab === "config" ? output.config.content : output.prompt,
      );
      setMessage(
        tab === "config"
          ? "Config copied."
          : "AI prompt copied. Remember to include the downloaded assets.",
      );
    } catch {
      setMessage(
        "Clipboard is unavailable. Select and copy the text in the preview.",
      );
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
      setMessage(
        e instanceof Error ? e.message : "Export failed. Please try again.",
      );
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
        Export design
        <span className="export-platforms" aria-hidden="true">
          {(["tauri", "electron", "swift"] as const).map((platform) => (
            <span className="export-platform" key={platform}>
              <Image
                src={`/assets/platforms/${platform}.svg`}
                alt=""
                width={16}
                height={16}
              />
            </span>
          ))}
        </span>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop className="export-backdrop" />
        <Dialog.Popup className="export-dialog dmgly">
          <div className="export-heading">
            <div>
              <Dialog.Title>Export your design</Dialog.Title>
              <Dialog.Description>
                Your composition, ready for your app.
              </Dialog.Description>
            </div>
            <Dialog.Close className="close-button" aria-label="Close export">
              <Icon icon={Cancel01Icon} />
            </Dialog.Close>
          </div>
          <PlatformSelect
            value={target}
            disabled={busy}
            onChange={(value) => {
              setTarget(value);
              setMessage("");
            }}
          />
          <div className="segment export-tabs">
            {(["config", "prompt"] as const).map((value) => (
              <button
                type="button"
                key={value}
                aria-pressed={tab === value}
                className={tab === value ? "active" : ""}
                onClick={() => {
                  setTab(value);
                  setMessage("");
                }}
              >
                <Icon
                  icon={value === "config" ? CodeIcon : SparklesIcon}
                  size={16}
                />
                {value === "config" ? "Configuration" : "AI prompt"}
              </button>
            ))}
          </div>
          <div className="code-frame">
            <div className="code-heading">
              <span>
                {tab === "config"
                  ? output?.config.filename
                  : "apply-dmg-prompt.md"}
              </span>
              <span>
                {tab === "prompt"
                  ? "Markdown"
                  : target === "native"
                    ? "Shell"
                    : "JSON"}
              </span>
            </div>
            {error ? (
              <div className="export-error" role="alert">
                <p>{error}</p>
              </div>
            ) : (
              <CodePreview
                code={
                  (tab === "config"
                    ? output?.config.content
                    : output?.prompt) || ""
                }
                language={
                  tab === "prompt"
                    ? "markdown"
                    : target === "native"
                      ? "bash"
                      : "json"
                }
                label={
                  tab === "config"
                    ? "Generated configuration"
                    : "AI setup prompt"
                }
              />
            )}
          </div>
          <div className="export-notes">
            <p>
              {tab === "prompt"
                ? "Give your AI agent this prompt together with the files in your ZIP."
                : target === "native"
                  ? "Run this script on macOS with your built .app and the exported assets."
                  : "Merge these settings into your app’s existing packaging configuration."}
            </p>
            {output?.config.warnings.map((w) => (
              <p key={w}>{w}</p>
            ))}
          </div>
          <div className="export-actions">
            <button
              type="button"
              className="secondary-button"
              disabled={!!error || busy}
              onClick={copy}
            >
              <Icon icon={Copy01Icon} />
              {tab === "config" ? "Copy config" : "Copy AI prompt"}
            </button>
            <button
              type="button"
              className="primary-button"
              disabled={!!error || busy}
              onClick={download}
            >
              <Icon icon={Download01Icon} />
              {busy ? "Preparing files…" : "Download ZIP"}
            </button>
          </div>
          <p className="export-message" role="status">
            {message ||
              "Includes your background, configuration, and setup instructions."}
          </p>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

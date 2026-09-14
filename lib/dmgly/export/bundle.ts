import { strToU8, zipSync } from "fflate";
import { Composition, snapshot } from "../model";
import { ExportTarget } from "./contract";
import { electronConfig } from "./electron";
import { tauriConfig } from "./tauri";
import { nativeConfig } from "./native";
import { aiPrompt } from "./ai-prompt";
import { renderAssets } from "./render";
export function buildConfig(d: Composition, target: ExportTarget) {
  return { electron: electronConfig, tauri: tauriConfig, native: nativeConfig }[target](d);
}
export function exportText(d: Composition, target: ExportTarget) {
  const config = buildConfig(d, target);
  return { config, prompt: aiPrompt(d, config) };
}
export async function createBundle(document: Composition, target: ExportTarget) {
  const d = snapshot(document),
    { config, prompt } = exportText(d, target),
    assets = await renderAssets(d);
  const files = {
    ...assets,
    [config.filename]: strToU8(config.content),
    "README.md": strToU8(config.instructions),
    "apply-dmg-prompt.md": strToU8(prompt),
  };
  return zipSync(files, { level: 0 });
}
export function downloadBytes(bytes: Uint8Array, name: string, type = "application/zip") {
  const blob = new Blob([new Uint8Array(bytes)], { type }),
    url = URL.createObjectURL(blob),
    link = window.document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

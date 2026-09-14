import { Composition } from "../model";
export type ExportTarget = "electron" | "tauri" | "native";
export type ExportConfig = {
  target: ExportTarget;
  filename: string;
  content: string;
  instructions: string;
  warnings: string[];
  assets: string[];
};
export const TARGET_NAMES: Record<ExportTarget, string> = {
  electron: "Electron (electron-builder)",
  tauri: "Tauri",
  native: "Swift / macOS (create-dmg)",
};
export function assetPaths(d: Composition) {
  return [
    "assets/dmg-background.png",
    ...(d.app.image ? ["assets/app-icon.png"] : []),
  ];
}
export const commonInstructions =
  "The background already includes visible text and arrows. App and Applications icons remain real Finder items. The preview approximates Finder; check the final DMG on macOS. The PNG is exported at 1x; Retina backgrounds are not included.\n\nApply the target-specific instructions above. Preserve signing, notarization, update, and unrelated build settings. Copying configuration or an AI prompt does not transfer the image files.";
export function iconInstructions(d: Composition) {
  return d.app.image
    ? "The optional assets/app-icon.png is a normalized 512px reference. Integrate it through your existing app-icon pipeline (generate ICNS or the required icon set); changing a DMG background does not change the built .app icon."
    : "The icon in the preview is a placeholder. The built .app supplies its own icon.";
}

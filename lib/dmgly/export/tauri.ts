import { Composition, snapshot } from "../model";
import { assetPaths, commonInstructions, ExportConfig, iconInstructions } from "./contract";
export function tauriConfig(document: Composition): ExportConfig {
  const d = snapshot(document),
    config = {
      bundle: {
        macOS: {
          dmg: {
            background: "dmgly/assets/dmg-background.png",
            windowSize: d.window,
            appPosition: { x: d.app.x, y: d.app.y },
            applicationFolderPosition: d.applications,
          },
        },
      },
    };
  return {
    target: "tauri",
    filename: "tauri.dmg.json",
    content: JSON.stringify(config, null, 2),
    assets: assetPaths(d),
    warnings: [
      "Tauri fixes native icon size at 128 px. Check appearance on macOS with Finder; CI may skip layout customization.",
    ],
    instructions: `# Apply this design with Tauri\n\nTarget: Tauri 2.x.\n\n1. Copy the exported assets directory to src-tauri/dmgly/assets.\n2. Merge tauri.dmg.json into src-tauri/tauri.conf.json, preserving the existing bundle and macOS keys.\n3. Run your project's Tauri build command with --bundles dmg on macOS. Background paths are resolved from the Tauri working directory (normally src-tauri).\n4. Open the DMG in Finder and check the layout; CI can skip customization. If a tiling window manager resizes Finder during bundling, pause its layout rules for the build and restore them afterwards.\n\n${commonInstructions}\n\n${iconInstructions(d)}\n`,
  };
}

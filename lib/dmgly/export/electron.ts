import { backgroundAssetPath } from "../media";
import { Composition, snapshot } from "../model";
import { assetPaths, commonInstructions, ExportConfig, iconInstructions } from "./contract";
export function electronConfig(document: Composition): ExportConfig {
  const d = snapshot(document);
  const config = {
    dmg: {
      background: `build/dmgly/${backgroundAssetPath(d)}`,
      window: { width: d.window.width, height: d.window.height },
      iconSize: 128,
      contents: [
        { x: d.app.x, y: d.app.y, type: "file" },
        { x: d.applications.x, y: d.applications.y, type: "link", path: "/Applications" },
      ],
    },
  };
  return {
    target: "electron",
    filename: "electron-builder.dmg.json",
    content: JSON.stringify(config, null, 2),
    assets: assetPaths(d),
    warnings: [],
    instructions: `# Apply this design with electron-builder\n\nTested contract: electron-builder 26.x.\n\n1. Copy the exported assets folder to build/dmgly/assets in your Electron project.\n2. Merge electron-builder.dmg.json into your existing electron-builder config (or its build key in package.json). This is a fragment, not a replacement package.json.\n3. The app contents entry intentionally omits path so electron-builder uses the packaged .app.\n4. Build the dmg target on macOS with your project's normal build command.\n\n${commonInstructions}\n\n${iconInstructions(d)}\n`,
  };
}

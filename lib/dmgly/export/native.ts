import { Composition, snapshot } from "../model";
import { assetPaths, commonInstructions, ExportConfig, iconInstructions } from "./contract";
export function shellQuote(value: string) {
  return "'" + value.replace(/'/g, "'\\''") + "'";
}
export function nativeConfig(document: Composition): ExportConfig {
  const d = snapshot(document);
  const lines = [
    "#!/usr/bin/env bash",
    "set -euo pipefail",
    'SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"',
    'APP_PATH="${1:?Usage: bash build-dmg.sh /path/to/MyApp.app /path/to/output.dmg}"',
    'OUTPUT="${2:-$PWD/installer.dmg}"',
    'command -v create-dmg >/dev/null || { echo "Install create-dmg first: brew install create-dmg" >&2; exit 1; }',
    '[[ -d "$APP_PATH" && "$APP_PATH" == *.app ]] || { echo "Provide an existing .app bundle." >&2; exit 1; }',
    '[[ ! -e "$OUTPUT" ]] || { echo "Output already exists. Choose a new output path." >&2; exit 1; }',
    'APP_NAME="$(basename "$APP_PATH")"',
    "SAFE_NAME='^[[:alnum:]_. -]+$'",
    '[[ "$APP_NAME" =~ $SAFE_NAME ]] || { echo "create-dmg requires an app filename containing only letters, numbers, spaces, dots, underscores, or hyphens." >&2; exit 1; }',
    '[[ -f "$SCRIPT_DIR/assets/dmg-background.png" ]] || { echo "Keep the exported assets folder beside this script." >&2; exit 1; }',
    'STAGING="$(mktemp -d -t dmgly)"',
    "trap 'rm -rf -- \"$STAGING\"' EXIT",
    'ditto "$APP_PATH" "$STAGING/$APP_NAME"',
    "create-dmg \\",
    '  --volname "${APP_NAME%.app}" \\',
    `  --window-size ${d.window.width} ${d.window.height} \\`,
    "  --icon-size 128 \\",
    `  --icon "$APP_NAME" ${d.app.x} ${d.app.y} \\`,
    `  --app-drop-link ${d.applications.x} ${d.applications.y} \\`,
    '  --hide-extension "$APP_NAME" \\',
    '  --background "$SCRIPT_DIR/assets/dmg-background.png" \\',
    '  "$OUTPUT" "$STAGING"',
    "",
  ];
  return {
    target: "native",
    filename: "build-dmg.sh",
    content: lines.join("\n"),
    assets: assetPaths(d),
    warnings: [
      "This packages an existing .app on macOS. The real app filename supplies the volume name and must use letters, numbers, spaces, dots, underscores, or hyphens.",
    ],
    instructions: `# Apply this design to a native macOS app\n\nInstall create-dmg (for example, brew install create-dmg). Build your .app with your existing Xcode/Swift workflow. Keep assets beside build-dmg.sh, then run:\n\nbash build-dmg.sh '/path/to/My App.app' '/path/to/installer.dmg'\n\nThe script stages a copy of the app, preserves the original bundle, and refuses to overwrite an existing output. The actual .app filename determines the Finder label and volume name. Continue your existing signing and notarization workflow after packaging as appropriate. If a tiling window manager resizes Finder during packaging, pause its layout rules for the build and restore them afterwards.\n\n${commonInstructions}\n\n${iconInstructions(d)}\n`,
  };
}

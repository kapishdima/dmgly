# DMG packaging contract (REM-414)

## Baseline

Research date: 2026-09-14. Host: macOS 26.6.2, Apple command-line tools available. Registry versions at investigation: electron-builder 26.15.3, Tauri CLI 2.11.4. create-dmg upstream reports 1.3.0. Pin and record versions again in the build fixtures before release.

## Capability matrix

| Setting | electron-builder | Tauri 2 | create-dmg |
| --- | --- | --- | --- |
| Background image | dmg.background | bundle.macOS.dmg.background | --background |
| Window geometry | dmg.window | dmg.windowSize | --window-size |
| App icon center | dmg.contents entry | dmg.appPosition | --icon |
| Applications center | contents symlink entry | dmg.applicationFolderPosition | --app-drop-link |
| Icon size | dmg.iconSize | Fixed 128 in bundled script | --icon-size |
| Separate decorative text/arrow | Render into background | Render into background | Render into background |

Coordinates are integer logical pixels, x right and y down, relative to the icon-view area. Native file icon positions refer to icon centers. They are independent of browser zoom and device pixel ratio. Preview labels are indicative: Finder controls label appearance and actual application icons come from the built .app.

The editor uses a shared 128 px native icon size. Window dimensions passed to the packaging tools are their window bounds; create-dmg and Tauri's AppleScript explicitly set Finder container-window bounds. Finder chrome and the resulting visible content height can vary with macOS. The preview uses a separate 32 px titlebar approximation and labels dimensions as window size. Background exports use the configured width/height, so the image covers the content region. Do not promise pixel-exact chrome or compensate by an unverified constant in one adapter.

## Asset policy

MVP exports an sRGB PNG at 1x logical window dimensions for every background mode. Rasterize visible decorations into it. Do not export browser zoom, selection, icons, labels, or guides. Retina/multi-resolution TIFF is deferred until logical sizing is verified with all three tools; merely exporting a 2x PNG is not sufficient.

Uploaded app icons are preview inputs, not automatic .app bundle modifications. Include a normalized PNG reference when available and explain the tool-specific app-icon integration step. Accept PNG/JPEG/WebP for image uploads; ICNS/SVG support is not claimed in the MVP.

## Adapter boundary

Each adapter consumes an immutable, validated composition snapshot and returns a target, config/script filename and text, named assets, English setup instructions, and explicit limitations. The AI prompt and ZIP must consume that same result. Keep builder-specific path conventions inside adapters. Export fragments are merged into existing configuration, preserving signing, notarization, and updater settings.

Tauri's bundler resolves background paths from its working directory and forwards window dimensions and positions to its bundled create-dmg script. Its CI branch can skip Finder customization. Instructions must call out that final appearance should be checked on a Mac with Finder available.

## Verification status

Official documentation and upstream implementation were inspected. REM-431 subsequently built and opened all three DMG formats using disposable native fixtures. Window dimensions, icon size/positions, Applications links, and background bytes were verified; see [the verification report](../verification/mvp.md). Finder chrome and label typography remain approximations. Tiling window managers must not resize Finder during create-dmg/Tauri customization.

## Sources

- [electron-builder DMG](https://www.electron.build/dmg/)
- [electron-builder settings translation](https://github.com/electron-userland/electron-builder/blob/master/packages/dmg-builder/src/dmgUtil.ts)
- [Tauri DMG guide](https://v2.tauri.app/distribute/dmg/)
- [Tauri bundler implementation](https://github.com/tauri-apps/tauri/blob/dev/crates/tauri-bundler/src/bundle/macos/dmg/mod.rs)
- [Tauri bundled script](https://github.com/tauri-apps/tauri/blob/dev/crates/tauri-bundler/src/bundle/macos/dmg/bundle_dmg)
- [create-dmg AppleScript bounds](https://github.com/create-dmg/create-dmg/blob/master/support/template.applescript)

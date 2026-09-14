# MVP verification — REM-431

Verified on 2026-09-14 on macOS 26.6.2 (25G83), Apple Silicon.

## Build and code checks

- Next.js 16.3.5 production build, ESLint, and TypeScript pass.
- 15 Bun tests pass: schema validation, Unicode data, geometry, immutable snapshots, shared history transactions, draft persistence/failure handling, SVG escaping and visibility, builder adapters, native Bash syntax, and AI prompt boundaries.
- Removed the temporary DialKit lab and unused Next.js starter artwork/favicon. The approved identity remains the Dmgly wordmark.
- Improved secondary-text contrast, corrected selection geometry for aligned text/rotated arrows, and kept uploaded icons at the shared 128 px size.
- Export messages reset when the dialog reopens, so a previous successful download cannot mask a missing-image error.

## Browser checks

Chrome 152.0.7977.84 and Safari 26.6.2 both loaded the editor and downloaded ZIP exports successfully. Safari's normal local-download permission was exercised. The following interaction checks were performed in the Codex in-app browser:

- Pointer dragging moved the app from (180, 170) to (225, 135). One Undo restored the initial position.
- DialKit X edits and canvas edits share the same history. Keyboard arrows move 1 px, Shift+Arrow moves 10 px, and Command+Z restores the last change.
- Text visibility can be disabled and restored without losing content or coordinates.
- Linear/radial switching, adding a third gradient stop, and undoing both changes work.
- PNG uploads work for background and app icon. A non-image file displays a recoverable error; a subsequent valid upload succeeds.
- Reload restores the selected background mode and its uploaded image from IndexedDB.
- Configuration copy reports success. Switching targets updates both configuration and English AI prompt.
- ZIP exports include a 660 × 400 PNG without Finder chrome or native icons. An uploaded app icon produces a separate 512 × 512 PNG reference. Nested uploaded images render successfully in the final background.
- Missing background images disable both export actions and show a recovery message.
- At a 390 × 844 viewport, the preview scales to 54%; document width and scroll width both equal 390 px. The properties panel stacks below it. Temporary viewport overrides were reset.
- Export dialogs receive initial focus on their close control and close with Escape. Reduced-motion CSS suppresses interface transitions and animations.

The browser pass is representative, not an exhaustive screen-reader, browser-version, or device matrix. Storage denial and invalid drafts are covered by the focused IndexedDB tests; actual disk-full conditions were not forced on the user's browser.

## Actual macOS packaging

Packaging tools were installed in a disposable directory outside this repository. A tiny locally compiled `.app` and a minimal Rust binary served as packaging fixtures. These validate the DMG adapters, not a production Electron/Tauri application's signing or runtime.

| Tool | Version | Build | Window | App center | Applications center | Icon size |
| --- | --- | --- | --- | --- | --- | --- |
| electron-builder | 26.15.3 | Pass, prepackaged fixture | 660 × 400 | 180, 170 | 480, 170 | 128 |
| Tauri CLI | 2.11.4 | Pass, `bundle --bundles dmg --no-sign` | 660 × 400 | 180, 170 | 480, 170 | 128 |
| create-dmg | 1.3.0 | Pass, generated script | 660 × 400 | 180, 170 | 480, 170 | 128 |

The Electron fixture used `--prepackaged` and an explicit Electron version (44.3.0) so the packaging-only test did not require downloading a full Electron runtime. Signing was disabled only for disposable fixtures.

All three images mounted read-only with successful checksums. Their Applications entries point to `/Applications`. Parsed `.DS_Store` records confirm window size, icon size, and icon coordinates; the packaged background bytes are identical across all three tools. Structured evidence is in [dmg-layout.json](dmg-layout.json).

Background SHA-256: `706b312dec082b211ad3342fc6c1f65617db3c4ab287a1041294638658ac25c7`.

All three DMGs were opened in Finder. The artwork and native-item placement agree with the shared composition. Finder supplies system-specific chrome, icons, and labels. On this host its titlebar is approximately 32 px versus the preview's 28 px approximation; native/Tauri labels use 16 pt while electron-builder uses 12 pt. These are declared preview limitations, not settings that Dmgly exports.

### Window-manager finding

The first create-dmg and Tauri builds succeeded but captured incorrect window sizes because AeroSpace resized Finder during its AppleScript customization. After the user stopped AeroSpace, repeat builds preserved exactly 660 × 400. electron-builder's direct `.DS_Store` generation preserved the requested size on both runs. Native/Tauri export instructions now explain this build-environment constraint.

## Known MVP limits

- 1x PNG backgrounds; Retina TIFF/multi-resolution work is deferred.
- App icons are exported as PNG references; the existing application build must generate/apply its real icon set.
- Finder chrome, actual app icons, native label typography, and macOS appearance remain approximate in the browser.
- create-dmg's app-filename restriction is explicit; unsupported names fail without altering the original app or overwriting an existing output.
- No signing/notarization, upload to a server, AI API call, or public deployment was performed.
- Logo design remains deferred in REM-432.

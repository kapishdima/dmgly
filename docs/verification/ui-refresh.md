# UI refinement

The editor uses a shared spacing scale, a fixed-height inspector, and a permanent canvas toolbar. Context switches only change the scrollable properties region. Window controls and export remain anchored below it. Undo/Redo sit beside the preview heading and use Hugeicons.

The simplified Finder preview uses a light 32 px titlebar, left-aligned volume name, modern corner radii, and a shadow with 48 px clearance inside the scroll viewport (24 px for narrow canvases). Native icon coordinates and exported background geometry remain independent of browser zoom.

## Applications icon

The preview uses Apple's Applications folder artwork, obtained from the [DocSystem macOS icon archive](https://github.com/DocSystem/bigsur-icons-for-catalina/blob/master/Folders/ApplicationsFolderIcon.icns). The original ICNS was converted to a 256 px transparent PNG for the 128 px preview. This is the Big Sur-era Apple folder asset, not a claim that every macOS version uses identical artwork. It is preview-only; the exported DMG uses the actual system Applications link. Apple retains rights to its system artwork.

Other interface icons use the existing Hugeicons package. Editable installation arrows remain document artwork.

## Default application icon

`public/assets/generic-application.png` is the macOS generic application artwork, rendered at 256 px via `NSWorkspace.shared.icon(forFile:)` from the iconless test fixture used for native DMG verification on this host. It appears at 128 logical pixels until the user uploads an icon. The older `CoreTypes.bundle/GenericApplicationIcon.icns` differs from Finder's current resolved icon, so that legacy asset is not used. Apple retains rights to its system artwork. This image is preview-only; real DMGs get their icon from the built app.

## Default background

The user-supplied `Dithering@2x.png` (1600 × 1200, 81,805 bytes) is embedded without modifying its bytes in `lib/dmgly/default-background.json`. New compositions start in Image mode with this self-contained asset, so initial rendering and SVG-to-PNG export do not wait for an external image request. Default text and arrows use white; image-background icon labels receive a light backing for readability.

Restoring the exact old, untouched gradient starter upgrades it to the new default. Customized drafts are preserved. Browser reload verified the new image and the selected Image mode; the default composition successfully downloaded as an export ZIP. Regression tests cover embedded artwork and legacy draft migration, including schema-normalized property order.

## Export and validation

The export dialog uses Base UI Select with keyboard navigation and a stable code viewport. Shiki 4.4.3 is loaded on demand with only JSON, Bash, Markdown, and one light theme. Its JavaScript regex engine avoids a separate WASM request. The AI prompt wraps at the viewport edge; configuration keeps its code indentation. Copying still uses the original text, independent of highlighting.

- All 16 tests, ESLint, TypeScript, and production build pass.
- A highlighting test covers all three languages and escaping of HTML in user content.
- Browser checks at 1280 × 720 and 390 × 844 confirm the editor has no horizontal page overflow, the window shadow has clearance, and the export actions remain visible.
- Switching Background to App preserves the inspector bounds and the positions of the window settings and export footer.
- Electron, Tauri, native shell, and AI prompt views render highlighted tokens. The code frame stays at the same bounds while switching platform or view. The platform menu supports arrow keys and Enter.

## Studio layout promotion and Luma radii

The main editor now uses the joined Studio workspace in the existing light palette. The full-width white header has a separate inner alignment container, bottom divider, and subtle shadow. The introduction stays in a single column.

The installed `base-luma` Button and Card use `rounded-4xl`. Editor surfaces and buttons reference that token (26 px with the current root radius), while nested controls use the corresponding inner radius. The workspace adds its 8 px inset to the panel radius for concentric corners. Finder artwork retains its native geometry.

Background has at least 96 px at normal widths. Below 360 px the element tabs use two rows. Browser checks at 1280, 390, and 320 px confirmed no page overflow and no clipped tab labels. Switching Background to App preserved the inspector footer bounds. The export dialog remains usable at 320 px. ESLint and production build, including TypeScript, passed.

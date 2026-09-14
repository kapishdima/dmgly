# Dmgly

A browser-based editor for the first moment of installing a macOS app. Arrange an installer in a live Finder-style preview, then take the artwork and packaging settings into your project.

## Run locally

```sh
bun install
bun run dev
```

Open http://localhost:3000. No API keys or server-side storage are required. Images stay in the browser; the current composition and uploads are saved to IndexedDB on this device.

```sh
bun run test
bun run typecheck
bun run lint
bun run build
bun run start
```

## Design and export

- Drag the app, Applications folder, instruction text, and arrow directly in the preview. Use arrow keys for 1 px movement or Shift+Arrow for 10 px.
- Use contextual DialKit controls for exact positions, colors, typography, gradients, images, and window dimensions.
- Choose a solid color, linear/radial gradient, or uploaded PNG/JPEG/WebP background. Text and arrow have independent visibility switches.
- Undo/redo works across the canvas and properties. Command/Ctrl+Z and Shift+Command/Ctrl+Z work outside text fields.
- Export an electron-builder fragment, Tauri 2 fragment, or create-dmg script for an existing native macOS app.
- Copy the selected configuration or an English AI setup prompt. Download the ZIP to transfer the PNG artwork and supporting files as well.

The ZIP contains a 1x PNG background, selected configuration/script, setup instructions, and the same AI prompt shown in the editor. An uploaded app icon is included as a normalized PNG reference for your existing icon pipeline.

## Scope

The browser creates artwork and configuration; the actual DMG is built on macOS in your application repository. The app and Applications icons remain real Finder items. Finder chrome, labels, and native icons vary by system and are approximate in the preview. The shared native icon size is 128 px.

PNG, JPEG, and WebP uploads are limited to 10 MB, 8192 px per side, and 16 megapixels. ICNS/SVG uploads and Retina backgrounds are not supported in this MVP. No AI API is called: prompts are generated deterministically from the export snapshot. Logo design is deferred.

A tiling window manager can override Finder geometry during Tauri/create-dmg packaging. Pause those layout rules while building and restore them afterwards.

## Implementation and evidence

The app uses Next.js App Router, React, DialKit, Zod, and fflate. `lib/dmgly` owns the shared document, history, artwork, persistence, and export adapters; `components/editor` contains the interaction layer.

- [Product design](docs/plans/2026-09-14-dmg-preview-design.md)
- [Packaging contract](docs/research/packaging-contract.md)
- [MVP verification](docs/verification/mvp.md)

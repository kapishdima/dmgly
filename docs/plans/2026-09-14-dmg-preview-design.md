# Dmgly — agreed MVP

Product name: **Dmgly**. Use this capitalization in product copy and documentation.

Status: MVP scope, a light homepage editor, and AI prompt export are agreed. DialKit is being evaluated for the properties panel.

## Language

All product copy and project documentation must be in English: navigation, labels, tooltips, placeholders, default canvas text, empty states, errors, export instructions, generated comments, AI prompts, and bundled documentation. The MVP has no language selector.

Preserve user-authored app names, filenames, and canvas text exactly as entered, including content in other languages. The English requirement applies to product-authored content.

## Purpose

A web application for freely composing a macOS DMG installation window. Users edit directly in the preview and receive assets and settings for their packaging tool.

## Editor

- One workspace with a Finder window preview and properties for the selected element.
- Adjustable window dimensions and preview zoom.
- Freely positioned app and Applications icons, exact coordinates, and alignment guides.
- App icon upload and app name editing. The preview icon must match the built app icon; export instructions explain how to connect it.
- One background with Solid, Gradient, and Image modes.
- Solid: color picker and HEX input.
- Gradient: linear or radial, colors and stops, and a linear gradient angle.
- Image: upload, fit or fill, scale, and position.
- Editable text: content, a small font selection, size, color, alignment, and position.
- Arrow: several shapes, color, thickness, size, rotation, and position.
- Independent visibility toggles for text and arrow. Hiding preserves properties while excluding the element from the preview and exported background.
- Undo, redo, and automatic draft saving in the browser.

## Export

All three targets are included in the MVP:

| Target | Output |
| --- | --- |
| Electron / electron-builder | A dmg configuration fragment |
| Tauri | A bundle.macOS.dmg fragment for tauri.conf.json |
| Swift / macOS / create-dmg | A script that packages an existing .app |

The export dialog offers Config and AI prompt tabs for the selected target, with Copy config, Copy AI prompt, and Download ZIP actions. The archive includes the rendered background, the corresponding configuration or script, setup instructions, and apply-dmg-prompt.md. Resource names and paths match the generated configuration.

Visible text and arrows are baked into the background. The app and Applications remain DMG objects with separately exported coordinates. Finder chrome, selection outlines, and alignment guides are excluded from the background.

## AI prompt export

Users select a packaging target, download the assets, and give the generated English prompt to an agent working in their application repository. The prompt must accompany the extracted assets or a path accessible to the agent: copying text does not transfer files.

Generate the prompt deterministically from the same composition snapshot and export adapter output. This feature does not require an AI API call. Include:

- The target packaging tool and the task of integrating the design into an existing project.
- Exact dimensions, object positions, and the full generated configuration fragment or script.
- A manifest of actual exported assets and their relative paths.
- An explanation that visible decorative elements are already baked into the background.
- Instructions to inspect the existing configuration and installed tool version, and report a target mismatch instead of automatically migrating the project.
- Instructions to merge appearance settings while preserving other build, signing, notarization, and update settings.
- Asset and configuration checks, available macOS build verification, and a report of checks actually performed.

Represent user-authored text and filenames as clearly delimited, escaped data. Identify missing assets and unsupported settings explicitly. Do not promise automatic asset transfer or guaranteed outcomes from a third-party agent.

Validate that the prompt, configuration, and ZIP describe the same composition snapshot and update together. Cover hidden text and arrows, special characters in names, preservation of user-authored language, and references to actual exported resources.

Suggested helper text: "Give your AI agent this prompt and the downloaded assets."

## Architecture and verification

A single composition model drives the preview, background rendering, and individual export adapters. The preview approximates Finder; each exposed setting must be reproducible by the selected packaging tool.

Verify an example built with each of the three tools on macOS and compare its Finder appearance with the preview. Also verify coordinate handling at different zoom levels, hidden-element exclusion, and agreement between resource paths and exported files.

## Open design details

- Detailed panel layout, controls, and initial composition.
- Packaging-tool capability matrix, including icon-size limits and Retina backgrounds.
- Supported icon and image upload formats.
- Upload, persistence, and export error handling.

## Visual references

The user selected two style references:

- [Keeby](https://getkeeby.com/): light surroundings, a large macOS demonstration, a rounded bold headline, a dimensional orange icon, black pill buttons, and handwritten hints.
- [Bendy](https://trybendy.app/): light surroundings, generous whitespace, a large product demonstration, restrained typography, and a black pill button.

Agreed direction: a light page with a short introduction and a working editor directly on the homepage. A large preview sits on the left, with a compact properties panel on the right. With five fixed elements, a compact element selector can replace a separate left sidebar. Direct canvas selection remains available; hidden text and arrows remain accessible in the panel.

Use an almost-white page, graphite text, soft shadows around the DMG window, and a black Export button. Concentrate color in the user's composition and the product's own icon. A handwritten hint can introduce dragging and disappear after the first interaction. Detailed control design remains open.

## DialKit assessment

The user proposed [DialKit](https://www.dialkit.dev/). Its website, Photo Stack demo, and official documentation were reviewed.

Relevant features include numeric sliders with manual entry, text, selects, colors, images, toggles, and groups. Light theme and inline panel placement are supported. React integration uses a client component; the ready-made DialRoot requires productionEnabled to appear in production.

Recommendation: use individually exported DialKit controls inside a custom properties panel. This preserves the chosen layout, allows fields to depend on background type and selected object, and routes edits through the shared document model and undo history. A ready-made inline panel with setValue/setValues updates from canvas interactions is an alternative for a quick prototype.

Custom implementation is still required for the Finder canvas, selection and dragging, alignment guides, gradient-stop editing, operation history, and background/configuration/ZIP export. DialKit's built-in Copy produces parameters and a configuration-update instruction; it does not replace packaging-tool export.

ImageControl accepts local images up to 10 MB and returns a data URL. Asset persistence and project restoration require separate design that accounts for browser storage limits. Image upload support does not establish ICNS support.

Sources: [README](https://github.com/joshpuckett/dialkit), [API and individual controls](https://github.com/joshpuckett/dialkit/blob/main/docs/reference.md#custom-layouts). This assessment is based on documentation and the demo; integration in this project has not yet been tested.

## Packaging references

- [electron-builder DMG](https://www.electron.build/dmg/)
- [Tauri DmgConfig](https://v2.tauri.app/reference/config/#dmgconfig)
- [create-dmg](https://github.com/create-dmg/create-dmg)

# GIF backgrounds

## Behavior

- Background → Image accepts GIFs with no application file-size cap and displays their original size. The existing pixel-dimension bounds still apply; still images retain their 10 MB cap.
- Assets round-trip through IndexedDB and URL references, including a GIF above the former 15 MB encoded-data schema limit.
- A worker decodes one frame at a time for preview. Pause retains the displayed frame; play resumes it. Once-only and finite loops stop at the last frame. Reduced-motion preference initially pauses preview and does not change the export.
- Export composites the chosen fit/fill, scale, offsets, solid fill, texts, arrow, and label backgrounds onto every frame in a worker. Each original frame delay and loop count are preserved. Cancellation terminates the worker.
- Palette conversion uses full RGB precision and error diffusion when the composed frame exceeds GIF's 256-color limit. Frames with at most 256 colors preserve exact RGB values. No frame-rate or dimension reduction is applied to meet a file-size target.
- An opaque full-frame GIF is passed through byte-for-byte when its dimensions match the window, there are no transform changes and no visible decorations.
- All three packaging configurations and AI prompts consistently reference `assets/dmg-background.gif` for GIF backgrounds and `.png` otherwise.
- The export dialog reports the ZIP size and exposes a Save ZIP link after rendering.

## Verification

- Unit tests cover partial frames, transparency, restore-to-previous and restore-to-background disposal, zero and unequal frame delays, once/finite/infinite repeats, malformed input, gradient palette quality, asset size, local persistence, shared placement geometry, all three target configs, AI prompts and Bash syntax.
- Production browser check: uploaded the 18,301,955-byte NeuroNoise GIF; saw it in preview, paused it, cancelled an export, successfully rendered a later export, and restored the asset after reload. No browser errors were reported. The in-app browser did not expose an automatic ZIP download to the download-event tool; output bytes were also checked independently below.
- Invoked the actual `gif.worker.ts` export handler in a local canvas harness using the same NeuroNoise GIF and default editor composition. The canvas adapter supplies OffscreenCanvas/ImageData/createImageBitmap equivalents for this test. Output: 642 × 406, 120 frames, all 120 delays identical to the input, infinite repeat retained, 13,822,155 bytes. This is an export-handler integration check, not a native browser download.
- Inspected a decoded output frame to confirm the added text, arrow and both label backgrounds are baked in and the gradient is smooth. A low-bit palette implementation exhibited visible banding and was replaced; a regression test protects the finer palette.
- Original GIF playback in a Finder DMG was verified earlier in this conversation. This change does not claim a fresh native build for every packaging target or compatibility with every macOS version.

Local verification artifacts: `/private/tmp/dmgly-gif-editor-check/`.

Final production-browser rerun with the full-precision palette completed at 13.6 MB ZIP size with no console errors. Save ZIP appeared and was clickable. The temporary production server was stopped and port 3102 was verified free. Final checks: 61 tests passed, lint, TypeScript, production build and diff whitespace checks passed.

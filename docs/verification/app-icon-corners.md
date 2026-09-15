# Rounded uploaded app icons — 2026-09-15

Uploaded app images use a corner radius of 22% of their fitted shorter side. A shared geometry helper keeps the 128px preview and 512px exported PNG consistent. Images retain their aspect ratio, remain centered, and preserve existing alpha. Original uploads remain unchanged; the mask is applied when displaying or exporting.

Verification:

- Uploaded an opaque square PNG with sharp corners in the production UI and visually confirmed rounded corners over the animated background.
- Exercised the actual `drawAppIcon` export helper with a native canvas adapter on square, landscape and transparent fixtures. Corner pixels are transparent, edge centers remain opaque, and an existing transparent center remains transparent. Preview and export bounds/radius scale by exactly four.
- All 62 tests, lint, type checking, production build and diff whitespace checks passed.
- The temporary production server was stopped after verification.

The exported PNG remains an app-icon reference. The app's own icon pipeline must consume it for the built `.app` to use the same shape in Finder; the DMG background cannot change that native icon.

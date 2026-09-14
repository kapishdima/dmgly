# DialKit integration (REM-415)

Use DialKit 2.0.2 individual controlled React components, imported in a client component inside `.dialkit-root[data-theme="light"]`. They take explicit value/onChange (checked/onChange for Toggle), so the document model owns state. No internal DialStore or second undo stack is required. Individual components render in production without mounting DialRoot; a ready-made root would require productionEnabled.

The `/lab/dialkit` probe includes numeric, color, text, visibility, image, and a draggable object. Production build and TypeScript passed. Browser checks confirmed a coordinate edit from 100 to 150 and programmatic Undo restoring both preview and Slider to 100.

The initial isolated pointer probe failed in the in-app browser. Final REM-431 checks passed in the actual editor: pointer drag moved the app from (180, 170) to (225, 135), Undo restored (180, 170), and a DialKit X edit to 330 used the same undo history. Keyboard arrows and Shift+Arrow moved by 1 and 10 px; Command+Z restored the last move. The temporary lab route was removed after integration verification.

Controls have no gesture commit API, so the panel should group history at pointer/focus boundaries. ColorControl can return modern CSS color syntax; normalize via the browser before storing sRGB hex for shared SVG/canvas rendering. ImageControl returns data URLs up to 10 MB; application upload validation and persistence remain separate responsibilities. Keyboard, focus, upload errors, and control overflow are part of final QA.

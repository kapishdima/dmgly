# DialKit integration (REM-415)

Use DialKit 2.0.2 individual controlled React components, imported in a client component inside `.dialkit-root[data-theme="light"]`. They take explicit value/onChange (checked/onChange for Toggle), so the document model owns state. No internal DialStore or second undo stack is required. Individual components render in production without mounting DialRoot; a ready-made root would require productionEnabled.

The `/lab/dialkit` probe includes numeric, color, text, visibility, image, and a draggable object. Production build and TypeScript passed. Browser checks confirmed a coordinate edit from 100 to 150 and programmatic Undo restoring both preview and Slider to 100.

A pointer-drag check crashed the in-app browser page twice, while the route still returned HTTP 200. Direct pointer interaction remains unverified and must be resolved during canvas QA; the integration issue remains In Review until this is checked.

Controls have no gesture commit API, so the panel should group history at pointer/focus boundaries. ColorControl can return modern CSS color syntax; normalize via the browser before storing sRGB hex for shared SVG/canvas rendering. ImageControl returns data URLs up to 10 MB; application upload validation and persistence remain separate responsibilities. Keyboard, focus, upload errors, and control overflow are part of final QA.

# Canvas selection and transforms

- Shift-click toggles individual foreground objects in a selection. Clicking an unselected object replaces the selection; dragging an already selected object moves the group.
- Command+A / Control+A selects all visible foreground objects. Backgrounds and hidden decorations are excluded. Editable fields keep their native select-all behavior, and export dialogs do not intercept this shortcut for the canvas.
- Arrow keys move the selection by 1 px, or 10 px with Shift. Shared boundary clamping preserves distances between selected objects. Escape clears the selection or cancels an active gesture.
- Text and arrow selections expose corner scale handles and rotation targets outside the corners. Scaling preserves proportions and anchors the opposite corner. Shift snaps rotation to 15-degree steps. Focused handles support arrow-key adjustments.
- Real Finder icons remain upright at 128 px for compatibility with all export targets. Selections containing these icons support group movement but do not expose scale or rotation handles.
- Text rotation and arrow scale persist in the composition, defaulting to 0 and 1 for existing drafts. Both transforms are baked into the exported SVG/PNG background.
- Text bounds are measured from rendered SVG text. The artboard uses overflow clipping so focusing selections cannot scroll the background independently of the window.

## Verification

Pure tests cover selection toggling, visibility, relative group positions at boundaries, rotation geometry, fixed scale anchors, scale limits, native-icon restrictions, legacy drafts, persistence, and single-step gesture undo/redo.

Browser checks covered Shift-selection, Command+A, grouped keyboard movement and pointer dragging, pointer scaling and rotation, transform-handle keyboard adjustments, native text selection inside the inspector, and undo. The selection UI was also checked at a 390 px viewport. A transformed SVG with rotated text and a scaled arrow was rasterized to a 642 × 406 PNG successfully.

The browser download event did not resolve during the ZIP check, so an end-to-end ZIP download is not claimed for this change. Native DMG packaging was not rerun; native icon coordinates and sizes retain their existing export contract.

# Exported label backgrounds

The approved approach is a light background behind each native Finder label. Finder still owns the filename typography; decorative text cannot cover it. A CSS-only plate improves the editor but does not reach the DMG, so both preview and export must use the same SVG rectangles.

## Design

- Store independent `labelBackground` settings on App and Applications: visible, color, opacity, auto size, width, height, radius, and relative X/Y offsets.
- Default to a white plate at 96% opacity, measured label width plus 4 px padding on every side, with 4 px corners. The label line box is 16 px high; the default badge is 24 px high. Manual width/height remains available by disabling Fit to text.
- Expose the controls in each native item's inspector using the existing controls. Retain values when disabled.
- Draw plates after the background and decorative artwork, before native Finder items. Remove the automatic CSS label background.
- Drag each plate independently using a transparent hit target over the rendered rectangle. Keyboard arrows move it by 1 px (Shift: 10 px). Each gesture is one undo transaction, and Escape cancels it. Clamp independent plate movement and resizing to the visible canvas. Relative offsets follow the icon on later icon moves.
- Use the same browser text measurement for preview and PNG export. SSR uses an approximate width until the label is measured. Keep native filenames outside the PNG.
- Existing compositions without the new fields receive the defaults. URL state and undo use the existing composition pipeline. Packaging adapters must continue to emit coordinates only.
- Explain that plates are part of the exported image and that final label fit depends on Finder and the actual app name.

## Implementation and verification

1. Extend the schema and shared artwork, then add inspector controls and remove CSS-only plates.
2. Keep movement limits and packaging adapters consistent with the extended native-item model.
3. Verify legacy data, URL round-trips, independent visibility, exported geometry, and adapter shape. Run tests, typecheck, lint, and build.
4. Inspect the browser controls and exported PNG; create a disposable DMG and check the label placement in Finder if the host permits it.

Broader text layers and changes to native label typography are outside this change.

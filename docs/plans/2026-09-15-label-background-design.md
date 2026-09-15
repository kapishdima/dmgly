# Exported label backgrounds

The approved approach is a light background behind each native Finder label. Finder still owns the filename typography; decorative text cannot cover it. A CSS-only plate improves the editor but does not reach the DMG, so both preview and export must use the same SVG rectangles.

## Design

- Store independent `labelBackground` settings on App and Applications: visible, color, opacity, width, height, and radius.
- Default to a white plate at 96% opacity, 180 × 48 logical pixels, with 8 px corners. Anchor it below the 128 px icon, leaving space for Finder's larger or wrapped labels.
- Expose the controls in each native item's inspector using the existing controls. Retain values when disabled.
- Draw plates after the background and decorative artwork, before native Finder items. Remove the automatic CSS label background.
- Keep plates inside the visible canvas during movement and resizing. Use the same limits for pointer, keyboard, and inspector changes.
- Existing compositions without the new fields receive the defaults. URL state and undo use the existing composition pipeline. Packaging adapters must continue to emit coordinates only.
- Explain that plates are part of the exported image and that final label fit depends on Finder and the actual app name.

## Implementation and verification

1. Extend the schema and shared artwork, then add inspector controls and remove CSS-only plates.
2. Keep movement limits and packaging adapters consistent with the extended native-item model.
3. Verify legacy data, URL round-trips, independent visibility, exported geometry, and adapter shape. Run tests, typecheck, lint, and build.
4. Inspect the browser controls and exported PNG; create a disposable DMG and check the label placement in Finder if the host permits it.

Broader text layers and changes to native label typography are outside this change.

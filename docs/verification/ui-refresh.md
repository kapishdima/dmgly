# UI refinement

The editor uses a shared spacing scale, a fixed-height inspector, and a permanent canvas toolbar. Context switches only change the scrollable properties region. Window controls and export remain anchored below it. Undo/Redo sit beside the preview heading and use Hugeicons.

The simplified Finder preview uses a light 32 px titlebar, left-aligned volume name, modern corner radii, and a shadow with 48 px clearance inside the scroll viewport. Native icon coordinates and exported background geometry remain independent of browser zoom.

## Applications icon

The preview uses Apple's Applications folder artwork, obtained from the [DocSystem macOS icon archive](https://github.com/DocSystem/bigsur-icons-for-catalina/blob/master/Folders/ApplicationsFolderIcon.icns). The original ICNS was converted to a 256 px transparent PNG for the 128 px preview. This is the Big Sur-era Apple folder asset, not a claim that every macOS version uses identical artwork. It is preview-only; the exported DMG uses the actual system Applications link. Apple retains rights to its system artwork.

Other interface icons use the existing Hugeicons package. Editable installation arrows remain document artwork.

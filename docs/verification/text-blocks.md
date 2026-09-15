# Multiple text blocks

The editor stores an ordered `texts` array with stable IDs. New blocks receive UUIDs; the existing starter text keeps the `text` ID. Legacy documents and URL settings with a single `text` object migrate to the first block, preserving its content, appearance, and position. An explicit empty array remains empty.

Add text from the preview toolbar or the Text panel. The panel lists all blocks, including hidden ones, and provides selection and deletion. Existing typography, move, rotate, scale, multiselection, and undo controls apply independently to every block. All visible blocks render through the shared SVG used for preview and PNG export.

There is no application-level block-count limit. The former 10 KB URL parser cap was removed so larger compositions can round-trip; browser and system resource limits still apply.

Verification covers 151 blocks through serialization and validation, legacy migration, unique IDs, independent styles and visibility, export ordering and escaping, group transformations, resize bounds, deletion of the final block, and undo/redo. TypeScript, ESLint, and the production build pass. No development server or native Finder verification was run for this change.

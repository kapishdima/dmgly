# URL state and image storage

Composition settings use nuqs with a versioned `design` query parameter. The serializer includes only fields that differ from the default design. It validates the complete merged state with Zod. Image data never enters the URL; the bundled background has a stable preset reference, and uploaded images use SHA-256 references.

The editor keeps gesture history in memory and replaces the current URL after edits, preserving unrelated query parameters. Reset restores the default composition and clears `design`; it remains one undoable action. URLs without `design` always open the default composition.

IndexedDB version 2 stores uploaded assets only in the `assets` store. Existing version 1 `drafts` records are retained as a recovery backup, but are never restored automatically or updated. Reset does not delete uploaded images, so older links and Undo can still recover them on the same device.

Missing local images produce an explicit notice. Their references remain in the URL while the user edits other settings, including after Reset followed by Undo. On another device, the image must be uploaded again. Invalid links show the default design and an explanatory status.

## Verification

- Unit tests cover compact serialization, complete Unicode/settings round-trips, image references, invalid links, asset persistence, storage recovery, and preservation of the legacy database.
- Browser checks verified that moving an app updates the URL, reload restores its coordinates, Reset clears the design parameter, and Undo restores the composition and URL.
- An uploaded background survived reload through its local asset reference. A simulated unavailable image showed the missing-image notice and kept its reference through editing and Reset/Undo.
- Reset preserved an unrelated `source` parameter.
- Invalid links showed the default composition with a notice. Reset was checked at a 390 px viewport and immediately after an edit with a pending URL update.
- Type checking, lint (one pre-existing unused-variable warning in the export dialog), and production build passed.

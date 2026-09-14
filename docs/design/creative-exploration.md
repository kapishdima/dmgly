# Dmgly creative direction exploration

Status: Studio layout selected, with revisions.

## Decision

- Keep Studio's joined workspace: a recessed preview beside a raised inspector inside one shell.
- Keep the light palette. The dark palette was not the reason for selection.
- Give the site header its own full-width surface and separator.
- Stack the introduction title and description in one reading column.
- Make the Background tab wide enough for its full label.
- Use the installed base-luma radius scale: rounded-4xl surfaces and buttons, with concentric inner surfaces.
- Reject Parcel's packaging treatment and Studio's split introduction.
- Remove the comparison route after promotion. The main editor at `/` is the deliverable.

The brief was “сайт выглядит слишком плоским”. The highest-impact area is the editor's surrounding surface and hierarchy. The current page gives the header, canvas, and inspector nearly equal visual weight.

The comparison ran at `/proto/creative` with Current, Studio, and Parcel. The route and picker were removed after selection.

| Direction | Axis | Strength | Cost |
| --- | --- | --- | --- |
| Current | Quiet, open page | Familiar baseline | Little separation between surfaces |
| Studio | Compact app shell and illuminated stage | Strong focus on the composition, a clear light inspector | A more serious, less playful personality |
| Parcel | Physical packaging and editorial hierarchy | Paper layers, a parcel edge, warm materials and a memorable title | More vertical space before the editor |

The experiment imported the actual editor and added styles scoped to each wrapper. Production components were unchanged during exploration. No increased tracking, handmade interface icons, or dot-separated copy was introduced.

Validation: all three directions rendered in the browser; Studio and Parcel checked at 1280 × 720 and 390 × 844 with no horizontal page overflow. Canvas keyboard positioning and Undo work without changing the chosen direction. Export opens with syntax highlighting in both new directions. Browser console had no errors. ESLint, TypeScript, and production build pass.

The comparison route was removed when the chosen layout was promoted.

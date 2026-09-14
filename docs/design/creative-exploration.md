# Dmgly creative direction exploration

Status: awaiting a direction choice.

The brief was “сайт выглядит слишком плоским”. The highest-impact area is the editor's surrounding surface and hierarchy. The current page gives the header, canvas, and inspector nearly equal visual weight.

Explore at `/proto/creative` during development. The route returns not-found in production. Keys 1–3 or the floating picker switch directions; the chosen direction is stored in `?v=`. Canvas arrows and form input retain their editor behavior. The existing editor remains functional and uses its normal local draft storage.

| Direction | Axis | Strength | Cost |
| --- | --- | --- | --- |
| Current | Quiet, open page | Familiar baseline | Little separation between surfaces |
| Studio | Compact app shell and illuminated stage | Strong focus on the composition, a clear light inspector | A more serious, less playful personality |
| Parcel | Physical packaging and editorial hierarchy | Paper layers, a parcel edge, warm materials and a memorable title | More vertical space before the editor |

The experiment imports the actual editor and adds styles scoped to each wrapper. Production components are unchanged. No increased tracking, handmade interface icons, or dot-separated copy was introduced.

Validation: all three directions rendered in the browser; Studio and Parcel checked at 1280 × 720 and 390 × 844 with no horizontal page overflow. Canvas keyboard positioning and Undo work without changing the chosen direction. Export opens with syntax highlighting in both new directions. Browser console had no errors. ESLint, TypeScript, and production build pass.

After selection, record the chosen direction and rejected tradeoffs, promote only the selected rules into the editor, and remove the exploration route unless requested otherwise.

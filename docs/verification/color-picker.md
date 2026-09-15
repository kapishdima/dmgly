# Color picker formats — 2026-09-15

## Regression

Clicking OKLCH or Display P3 immediately returned to Hex. The editor converted every emitted CSS color to hex and passed that string back to DialKit, which infers its selected format from the controlled value.

The shared editor ColorControl now retains the picker's CSS representation locally and passes only the converted sRGB hex to the composition. External color changes, including Undo, synchronize the local value. Changing format without changing the stored color does not create a history entry.

## Verification

In the production build, through the browser UI:

- Reproduced the original reset to Hex before applying the fix.
- Switched Fill color through Hex, OKLCH and Display P3; the selected radio and CSS input agree.
- Entered `color(display-p3 0.3 0.4 0.5)`; Display P3 stayed selected, and the URL stored `#456782`.
- Switched back to Hex, then used ArrowRight to select OKLCH.
- Undo restored the original `#f4f1eb` value. Format-only switching left Undo disabled.
- Repeated format switching in the app label background picker. Closing and reopening it retained Display P3.
- No browser console errors. 62 tests, lint, type checking and production build passed.

The wrapper is shared by solid backgrounds, image fill colors, gradient stops, label backgrounds, text and arrows. Stored/exported colors remain sRGB hex; this fix does not introduce wide-gamut storage.

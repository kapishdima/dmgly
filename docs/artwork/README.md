# Default animated background

The default artwork is [Paper Dithering](https://shaders.paper.design/dithering#colorBack=250240&colorFront=7f18c3&shape=warp&type=4x4&size=2.5&speed=0.24&scale=1.04&rotation=0&offsetX=0&offsetY=0), rendered with `@paper-design/shaders-react@0.0.78`.

- Colors: `#250240` and `#7f18c3`
- Shape: `warp`, pattern: `4x4`, size: `2.5`, scale: `1.04`
- Rotation and offsets: `0`
- 642 × 406 pixels, 1047 frames at 20 fps, 52.35 seconds, infinite repeat
- GIF: 2,432,255 bytes, no text, arrows or label backgrounds baked in

The warp shader uses `t = 0.5 * u_time`, and repeats after `t = 2π`. At speed 0.24, a full cycle takes about 52.36 seconds. Rounding to 1047 frames changes the speed by less than 0.02%. Sampling a full forward cycle avoids a jump, reversal or duplicate frame at the loop boundary.

## Reproduce

Use a separate temporary render directory. Copy `dithering.tsx.example` to `dithering.tsx` there, then install the pinned rendering dependencies:

```sh
bun add @remotion/cli@4.0.520 remotion@4.0.520 react@19.2.3 react-dom@19.2.3 @paper-design/shaders-react@0.0.78
bunx remotion render dithering.tsx Dithering dithering-frames --sequence --image-format=png --gl=angle --concurrency=3
ffmpeg -framerate 20 -i dithering-frames/element-%04d.png \
  -filter_complex '[0:v]split[a][b];[a]palettegen=max_colors=4:stats_mode=full:reserve_transparent=1[p];[b][p]paletteuse=dither=none' \
  -loop 0 Dithering.gif
```

Embed the GIF as a `data:image/gif;base64,` asset in `lib/dmgly/default-background.json`, with its filename and dimensions. Rendering dependencies are not needed by the editor.

## Verification — 2026-09-15

- Every decoded GIF frame matches its rendered PNG pixel for pixel; only the two requested RGB colors are used.
- All 1047 frame delays are 50 ms; infinite looping is preserved. About 0.70% of pixels change across the loop boundary, comparable to 0.72% across the first frame transition.
- Production preview opens with `Dithering.gif`, animates, and keeps editor decorations separate.
- 62 tests, lint, type checking and production build passed.
- The real GIF export worker, run with a native canvas adapter, preserved all 1047 frames, their delays and infinite repeat while compositing the default text, arrow and label backgrounds. Its ZIP passed an integrity check; its GIF is 12,805,124 bytes. Native app icons and filenames remain Finder items.
- Browser export completed with `ZIP ready · 12.2 MB` and no console errors. The in-app browser did not expose a downloaded file; archive-content validation above used the worker adapter. The temporary production server was stopped after verification.

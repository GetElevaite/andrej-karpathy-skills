# Editable clip example

A minimal Remotion project that loads one real **1080×1920, 24fps, 145-frame**
Higgsfield clip (`public/clip.mp4`) and overlays an **editable title + caption**
you can trim, re-time, and re-style — then render to MP4.

This is the runnable companion to the [`remotion` skill](../SKILL.md).

## Setup

```bash
cd skills/remotion/example
npm install
```

## Edit it visually

```bash
npm run studio          # opens Remotion Studio at http://localhost:3000
```

Studio gives you a frame-accurate timeline: scrub, play, and **hot-reload** every
change. All the knobs live in one file — [`src/copy.ts`](./src/copy.ts):

| Knob | What it does |
|---|---|
| `title.text` / `title.show` | Top title card text + on/off |
| `caption.text` / `caption.show` | Bottom caption (lower-third) text + on/off |
| `trimStart` | Frames cut from the **front** of the clip (`trimBefore`) |
| `trimEnd` | Frames cut from the **tail** (shortens the slot) |
| `keepClipAudio` | Keep the clip's own audio in Studio preview |
| `brandColor` | Title color |

The composition duration is **derived** from `145 − trimStart − trimEnd`, so it
always matches your trims (see [`src/Root.tsx`](./src/Root.tsx)).

## Render to MP4

```bash
npm run render          # → out/video.mp4  (h264, muted picture)
```

The picture is rendered **muted** by convention — marry final audio in ffmpeg
afterward (see the skill's Audio section). To keep the clip's own audio in the
render instead, drop `--muted` from the `render` script in `package.json`.

## Files

```
public/clip.mp4          the native AI clip (145f @24fps, 1080x1920)
src/copy.ts              single source of truth for text / trim / brand
src/scenes/ClipScene.tsx clip + title + caption overlays
src/Root.tsx             registers the composition, derives duration
src/index.ts             entry point
remotion.config.ts       render settings
```

## Swap in your own clip

Replace `public/clip.mp4`, set `CLIP_FRAMES` in `src/copy.ts` to your clip's frame
count (`fps × seconds`), and keep the master `FPS` equal to the clip's native fps to
avoid resampling judder.

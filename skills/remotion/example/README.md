# Editable clip example

A minimal Remotion project built around one real **1080×1920, 24fps, 145-frame**
Higgsfield clip (`public/clip.mp4`). It ships **two compositions**:

- **`EditableClip`** — put an editable title + caption on the single clip and trim it.
- **`MultiClip`** — several clips played back-to-back with a smooth **cross-dissolve**
  between each, plus an optional **voiceover** track. (The demo reuses the one clip
  3× as stand-ins; swap in real clips later.)
- **`DialogueClip`** — two characters "talking": each line gets a **color-coded,
  speaker-labeled caption** timed over the clip, plus its own **voice** audio.

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

Studio lists both compositions in the left sidebar. It gives you a frame-accurate
timeline: scrub, play, and **hot-reload** every change. All the knobs live in one
file — [`src/copy.ts`](./src/copy.ts):

**Single clip (`edit`, drives `EditableClip`):**

| Knob | What it does |
|---|---|
| `title.text` / `title.show` | Top title card text + on/off |
| `caption.text` / `caption.show` | Bottom caption (lower-third) text + on/off |
| `trimStart` | Frames cut from the **front** of the clip (`trimBefore`) |
| `trimEnd` | Frames cut from the **tail** (shortens the slot) |
| `keepClipAudio` | Keep the clip's own audio in Studio preview |
| `brandColor` | Title color |

**Several clips (`clips` + `voiceover`, drive `MultiClip`):**

| Knob | What it does |
|---|---|
| `clips[]` | The ordered list of clips, each with its own `src`, `title`, `caption`, trims |
| `DISSOLVE` | Length of the fade between clips, in frames (12 ≈ 0.5s) |
| `voiceover.enabled` | Lay `public/voiceover.mp3` over the whole sequence |

Both durations are **derived** (single = `145 − trims`; multi = the timeline length
summed from the clips and overlaps), so they always match your edits and never drift.
See [`src/Root.tsx`](./src/Root.tsx) and [`src/Sequencer.tsx`](./src/Sequencer.tsx).

## Add a voiceover

Remotion doesn't *create* the voice — it lines it up with the picture. So:

1. Write your script and generate the spoken audio (e.g. with **ElevenLabs**).
2. Save it as `public/voiceover.mp3`.
3. Set `voiceover.enabled: true` in `src/copy.ts`.
4. Render the `MultiClip` composition **without** `--muted` so the audio is included.

## Make the characters talk (different voices)

The `DialogueClip` composition gives each character a distinct voice + a
color-coded caption. The captions render on their own; the voices drop in:

1. Generate **one mp3 per line**, a distinct voice per character (Higgsfield
   `text2speech`, ElevenLabs, etc.).
2. Save them in `public/` under the `voiceFile` names in `dialogue.lines`
   (`boss1.mp3`, `squeak1.mp3`).
3. Set `dialogue.enabled: true` in `src/copy.ts`; tune each line's `startSec`,
   `text`, `speaker`, and the per-speaker `color` in `speakers`.
4. Render `DialogueClip` **without** `--muted`.

Note: this makes them *speak with captions*. It does **not** move their mouths —
lip-sync is a separate AI-generation step (see the [skill](../SKILL.md)).

## Render to MP4

```bash
npm run render                                   # EditableClip → out/video.mp4
npx remotion render src/index.ts MultiClip out/multiclip.mp4 --codec h264 --muted
```

The picture is rendered **muted** by convention — marry final audio in ffmpeg
afterward (see the skill's Audio section). To keep the clip's own audio (or the
voiceover) in the render instead, drop `--muted`.

## Files

```
public/clip.mp4          the native AI clip (145f @24fps, 1080x1920)
src/copy.ts              single source of truth for text / trim / clips / voiceover
src/scenes/ClipScene.tsx one clip + title + caption overlays (prop-driven)
src/scenes/DialogueScene.tsx  two characters talking: voices + speaker captions
src/Sequencer.tsx        chains clips with cross-dissolves + optional voiceover
src/Root.tsx             registers both compositions, derives durations
src/index.ts             entry point
remotion.config.ts       render settings
```

## Swap in your own clip

Replace `public/clip.mp4`, set `CLIP_FRAMES` in `src/copy.ts` to your clip's frame
count (`fps × seconds`), and keep the master `FPS` equal to the clip's native fps to
avoid resampling judder.

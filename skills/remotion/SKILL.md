---
name: remotion
description: Edit and assemble AI-generated video clips (e.g. Higgsfield/Veo) into a finished social cut with Remotion — add titles/captions, trim, cross-dissolve, and render. Use when wrapping a generated clip with programmatic overlays or building a multi-clip vertical promo in React.
license: MIT
---

# Remotion: edit AI clips into a finished cut

[Remotion](https://remotion.dev) renders video from React. You drive it from a
single source-of-truth file (text, timing, colors), preview every frame live in
Remotion Studio, then render to MP4. This skill captures a **proven pipeline for
editing native AI clips** (Higgsfield / Veo-style 6-second renders) into a
captioned, branded vertical promo — and the failure modes that cost the most time.

A runnable example lives in [`example/`](./example/) with two compositions:
`EditableClip` (title + caption + trim on one clip) and `MultiClip` (several clips
chained with cross-dissolves + an optional voiceover track). Start there.

## What Remotion is — and isn't — for

Remotion is the **editing room**: it arranges clips in time and stacks overlays on
top (text, captions, audio, fades). It **cannot change what is inside the frame** —
it can't make a mouth move, repaint night→day, or change an outfit. That work
happens on the **film set**: AI video generation (Higgsfield, Runway, Kling, Veo).
Know which department a task belongs to before you start:

| Task | Tool | Cost |
|---|---|---|
| Chain clips, fades, titles, captions, sync audio | **Remotion** (this skill) | free |
| Create the spoken voice for a voiceover | **ElevenLabs** (text-to-speech) → Remotion syncs it | TTS credits |
| Make a character's mouth move to speech (lip-sync) | **Higgsfield / Runway Act / Hedra** + ElevenLabs voice | generation credits |
| Change background (night→day), outfits, props | **Higgsfield / Runway / Kling** (video-to-video) | generation credits |

### Dialogue between characters (making them "talk")

Two separate steps, then assemble:
1. **Voice** — generate each character's lines as audio (ElevenLabs; the ZB cut used
   Liam/Brian voices, `eleven_multilingual_v2`, `mp3_44100_128`). Distinct voices per
   character if the performance matters.
2. **Mouths** — drive lip-sync with a generation tool (Higgsfield Seedance/Wan,
   Runway Act, Hedra).
3. **Assemble** — bring the talking clips + voice audio into Remotion, place
   captions, and render. Marry the final mix in ffmpeg.

**Lip-sync, learned the hard way (verified on this cast):**
- **Feed it a face, not an action shot.** A clean *front-facing portrait* lip-syncs
  well — even a cartoon animal. A side/back-profile running clip (the escape scene)
  cannot be lip-synced; the mouth isn't visible. Generate the portrait from a locked
  character **Element** first so identity holds, then animate that.
- **Two ways to voice it.** (a) Let the video model **generate native speech** from
  the line in the prompt (`generate_audio: true`) — reliable. (b) Attach a
  **pre-made** voice as an audio reference to sync to an exact take — more control,
  but the audio must be a real uploaded **audio media**; a raw text-to-speech job id
  is rejected, so upload/import the mp3 to a media id first (needs network access to
  the generation host).
- Expect failed renders; retry, and keep the shot tight on the face.

### Changing the scene (night→day, outfits)

This is **video-to-video** generation, not an edit: feed the clip to a generation
tool with a change prompt ("same shot, change night to a bright sunny morning, keep
characters and camera identical"). It re-renders every frame, so identity/continuity
can drift — verify against the original (see QC below) and seed from the source frame
where possible.

## When to use Remotion vs. regenerate

Editing the cut is cheap; regenerating an AI clip costs credits and risks new
defects. **Prefer the edit** whenever the fix is positional or temporal:

| Want to… | Do it in Remotion (edit) | Must regenerate the clip |
|---|---|---|
| Add/!change on-screen text, titles, captions, lower-thirds | ✅ | |
| Trim a dead hold, a loop, or a bad tail | ✅ (`trimBefore` / shorter slot) | |
| Hide a seam between two clips | ✅ (cross-dissolve) | |
| Recolor/brand an overlay, add a logo card | ✅ | |
| Fix a *spatial* discontinuity (subject snaps position across a cut) | | ✅ seed from prior cut frame |
| Change what a character/object actually *does* | | ✅ |

Rule of thumb from production: if no trim or time-offset can reconcile two clips
(the subject occupies incompatible positions), **no edit will fix it** — regenerate
the clip seeded from the preceding scene's exact cut frame.

## Locked settings that matter

These were learned the expensive way; match them and a class of bugs disappears.

- **Lock the master fps to the native clip fps.** Higgsfield/Veo clips are
  **24 fps**. Render the Remotion composition at **24 fps** too, and give each clip
  an exact-length slot (a 145-frame clip → a 145-frame `Sequence`) so it plays
  **1:1 with zero resampling**. A 24→30 fps master produces duplicate-frame judder.
- **Generate at final resolution (1080×1920) from the start.** 720×1280 plates force
  a full regen + upscale pass later.
- **`OffthreadVideo`, not `<Video>`, for rendering clips.** It's frame-accurate under
  the renderer. Use `objectFit: 'cover'` (9:16 clip into a 9:16 comp = no crop).
- **One source of truth for copy.** All on-screen text lives in `copy.ts`. Re-run any
  compliance/word check after every clip swap, not just once.
- **Derive `durationInFrames` from the timeline**, never hand-edit a total — sum the
  slots/trims in code so it can't drift.

## The clip-editing primitives

- **Trim the front** with `trimBefore={N}` on `OffthreadVideo` (a.k.a. `startFrom`).
  Trim the **tail** by giving the `Sequence` fewer frames than the clip has.
- **Cross-dissolve** to hide AI seams: start the next scene `D` frames before the
  previous ends and ramp its opacity 0→1 over `D` frames, rendered on top of the
  still-opaque outgoing scene (a true A/B composite). ~5 frames (≈0.2s) between easy
  cuts, ~12 frames (≈0.5s) into the hardest ones.
- **Captions** for silent mobile feeds: a bottom scrim gradient
  (`rgba(0,0,0,0.66)` → transparent) plus a heavy text outline
  (`WebkitTextStroke` ≈ 6% of glyph size). Fade in over frames ~5–22 with a small
  upward rise; fade out keyed to `sceneDuration − 20 … − 6`.
- **Hold beats short.** Trim freeze/hold moments to ~0.6–0.7s of held action; AI
  clips love to sit on a pixel-identical frame for multiple seconds (detect with
  consecutive-frame SSIM ≈ 1.000).

## Audio

Render the picture **muted** (`--muted`) and marry audio in ffmpeg afterward — it's
far easier to iterate on a mix outside the React render loop. The native clip's own
generated audio is often the best bed; extract it per scene and `amix`. Finish with
broadcast/social loudness: `loudnorm I=-14:TP=-1.5:LRA=11`.

## Render

```bash
# Preview every frame, scrub, hot-reload edits:
npx remotion studio

# Render the picture (muted), audio married later in ffmpeg:
npx remotion render src/index.ts <CompositionId> out/video.mp4 --codec h264 --muted
```

`remotion.config.ts`: JPEG image format, `--overwrite`, and **concurrency 1** if a
machine struggles with parallel Chrome tabs during render.

## Stack

Remotion `4.x`, React 19, TypeScript. See [`example/`](./example/) for a minimal,
frame-accurate project (one 145-frame clip, editable overlays) and its `README.md`
for setup and render commands.

## Pitfalls (each cost real time)

1. **Acting on a wrong root cause.** Before "fixing" a continuity break, track an
   objective quantity across the seam (subject position, luminance, frame-to-frame
   SSIM) and confirm the diagnosis. A misdiagnosed snap burned a whole cycle.
2. **Baking everything into one layer.** If `scene.mp4` bakes all characters/objects
   into the same frames, any per-element change needs a full regen. Plan composite
   vs. single-bake before you need an element-level edit.
3. **Stale planning docs.** A shell/script doc left at the old fps/runtime/copy will
   mislead you. Keep it in sync or mark it superseded.
4. **API flakiness.** Generation APIs return 500/504 under load — build retry, and
   keep an image-reference edit prompt ready as the primary path for branded inserts.
5. **Version sprawl.** Name a single "current best cut" and archive aggressively;
   don't accumulate `final2…final9`.

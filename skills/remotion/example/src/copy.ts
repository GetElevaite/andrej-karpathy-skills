/**
 * Single source of truth for everything editable about this cut.
 * Change values here, watch them update live in Remotion Studio.
 */

// The native clip is 145 frames @ 24fps (6.04s), 1080x1920.
export const CLIP_FRAMES = 145;
export const FPS = 24;

// Cross-fade length between chained clips, in frames (~0.5s at 24fps).
export const DISSOLVE = 12;

// Brand color (ZeroBugs primary green, sampled from logo).
export const brandColor = '#01A66D';

// ─────────────────────────────────────────────────────────────────────────
// SINGLE-CLIP EDITOR  →  composition "EditableClip"
// Put text on one clip and trim it.
// ─────────────────────────────────────────────────────────────────────────
export const edit = {
  src: 'clip.mp4',

  // Trim (in frames @24fps)
  trimStart: 0, // frames removed from the FRONT
  trimEnd: 0, // frames removed from the TAIL (0 = play to the end)

  keepClipAudio: true, // ignored when rendered with --muted

  title: {text: 'NIGHT PATROL', show: true},
  caption: {text: 'The detective and his partner work the night shift.', show: true},
} as const;

// ─────────────────────────────────────────────────────────────────────────
// MULTI-CLIP SEQUENCE  →  composition "MultiClip"
// Several clips played back-to-back with a smooth fade between each.
// (Here we reuse the one clip 3x as stand-ins — swap in real clips later.)
// ─────────────────────────────────────────────────────────────────────────
export const clips = [
  {src: 'clip.mp4', title: 'NIGHT PATROL', caption: 'The detective works the night shift.', trimStart: 0, trimEnd: 0},
  {src: 'clip.mp4', title: '', caption: 'His partner spots something move.', trimStart: 0, trimEnd: 0},
  {src: 'clip.mp4', title: '', caption: 'Case closed. Pest evicted.', trimStart: 0, trimEnd: 0},
] as const;

// Voiceover audio laid over the whole sequence.
// To use it: create the audio (e.g. with ElevenLabs), drop the mp3 at
// public/voiceover.mp3, then set enabled: true. Render WITHOUT --muted to hear it.
export const voiceover = {
  enabled: false,
  src: 'voiceover.mp3',
} as const;

// ─────────────────────────────────────────────────────────────────────────
// CHARACTER DIALOGUE  →  composition "DialogueClip"
// Two animals "talking" — each line gets its own voice + a color-coded,
// speaker-labeled caption timed over the clip.
//
// Remotion places and captions the dialogue; it does NOT create the voices,
// and it cannot make the mouths move (that's AI lip-sync — see SKILL.md).
//
// To make it speak: generate one mp3 per line (e.g. Higgsfield text2speech /
// ElevenLabs — distinct voice per character), save them in public/ under the
// `voiceFile` names below, then set enabled: true and render WITHOUT --muted.
// ─────────────────────────────────────────────────────────────────────────
export const speakers = {
  BOSS: {label: 'BOSS', color: '#01A66D'}, // squirrel detective
  SQUEAK: {label: 'SQUEAK', color: '#5ab9ff'}, // mouse partner
} as const;

export const dialogue = {
  enabled: false, // true once the mp3s are in public/
  lines: [
    {speaker: 'BOSS', text: "Stay sharp, partner. Something's moving by the fence.", voiceFile: 'boss1.mp3', startSec: 0.2},
    {speaker: 'SQUEAK', text: "I see it, Boss — eight legs, and it's fast!", voiceFile: 'squeak1.mp3', startSec: 3.3},
  ],
} as const;

/**
 * Single source of truth for everything editable about this cut.
 * Change values here, watch them update live in Remotion Studio.
 */

// The native clip is 145 frames @ 24fps (6.04s), 1080x1920.
export const CLIP_FRAMES = 145;
export const FPS = 24;

export const edit = {
  // --- Trim (in frames @24fps) ---
  // Frames removed from the FRONT of the clip.
  trimStart: 0,
  // Frames removed from the TAIL (shorten the slot). 0 = play to the end.
  trimEnd: 0,

  // --- Keep the clip's own generated audio? (ignored when rendered with --muted) ---
  keepClipAudio: true,

  // --- Title card (top), fades in then out near the start ---
  title: {
    text: 'NIGHT PATROL',
    show: true,
  },

  // --- Caption / lower-third (bottom), held over the action ---
  caption: {
    text: 'The detective and his partner work the night shift.',
    show: true,
  },

  // --- Brand ---
  brandColor: '#01A66D', // ZeroBugs primary green (sampled from logo)
} as const;

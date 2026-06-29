import React from 'react';
import {
  AbsoluteFill,
  OffthreadVideo,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {edit} from '../copy';

// Heavy outline + bottom scrim keep text legible over bright video on silent
// mobile feeds. Outline ≈ 6% of glyph size.
const outline = (fontSize: number): React.CSSProperties => ({
  WebkitTextStroke: `${fontSize * 0.06}px #000`,
  paintOrder: 'stroke fill',
});

export const ClipScene: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();

  // Title: fade in 5→20, hold, fade out 60→80.
  const titleOpacity = interpolate(
    frame,
    [5, 20, 60, 80],
    [0, 1, 1, 0],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
  );

  // Caption: fade in 5→22 with a small rise; fade out near the end.
  const captionOpacity = interpolate(
    frame,
    [5, 22, durationInFrames - 20, durationInFrames - 6],
    [0, 1, 1, 0],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
  );
  const captionRise = interpolate(frame, [5, 22], [22, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{backgroundColor: '#000'}}>
      <OffthreadVideo
        src={staticFile('clip.mp4')}
        // Trim the FRONT of the clip; the slot length handles the tail.
        trimBefore={edit.trimStart}
        muted={!edit.keepClipAudio}
        style={{width: '100%', height: '100%', objectFit: 'cover'}}
      />

      {/* Bottom scrim for caption legibility */}
      {edit.caption.show && (
        <AbsoluteFill
          style={{
            background:
              'linear-gradient(to top, rgba(0,0,0,0.66) 0%, rgba(0,0,0,0) 38%)',
          }}
        />
      )}

      {/* Title card (top) */}
      {edit.title.show && (
        <AbsoluteFill
          style={{
            justifyContent: 'flex-start',
            alignItems: 'center',
            paddingTop: 160,
            opacity: titleOpacity,
          }}
        >
          <div
            style={{
              fontFamily: 'Arial, sans-serif',
              fontWeight: 800,
              fontSize: 96,
              letterSpacing: 2,
              color: edit.brandColor,
              textTransform: 'uppercase',
              ...outline(96),
            }}
          >
            {edit.title.text}
          </div>
        </AbsoluteFill>
      )}

      {/* Caption / lower-third (bottom) */}
      {edit.caption.show && (
        <AbsoluteFill
          style={{
            justifyContent: 'flex-end',
            alignItems: 'center',
            paddingBottom: 220,
            paddingLeft: 80,
            paddingRight: 80,
            opacity: captionOpacity,
            transform: `translateY(${captionRise}px)`,
          }}
        >
          <div
            style={{
              fontFamily: 'Arial, sans-serif',
              fontWeight: 700,
              fontSize: 64,
              lineHeight: 1.15,
              textAlign: 'center',
              color: '#fff',
              ...outline(64),
            }}
          >
            {edit.caption.text}
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

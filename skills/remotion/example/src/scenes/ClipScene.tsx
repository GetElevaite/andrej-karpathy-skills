import React from 'react';
import {
  AbsoluteFill,
  OffthreadVideo,
  interpolate,
  staticFile,
  useCurrentFrame,
} from 'remotion';
import {brandColor} from '../copy';

export type ClipSceneProps = {
  src: string;
  title?: string;
  caption?: string;
  trimStart?: number;
  /** Length of this clip's slot, in frames — drives the caption fade-out. */
  clipDuration: number;
  muted?: boolean;
};

// Heavy outline keeps text legible over bright video on silent mobile feeds.
// Outline ≈ 6% of glyph size.
const outline = (fontSize: number): React.CSSProperties => ({
  WebkitTextStroke: `${fontSize * 0.06}px #000`,
  paintOrder: 'stroke fill',
});

export const ClipScene: React.FC<ClipSceneProps> = ({
  src,
  title,
  caption,
  trimStart = 0,
  clipDuration,
  muted = true,
}) => {
  const frame = useCurrentFrame();

  // Title: fade in 5→20, hold, fade out 60→80.
  const titleOpacity = interpolate(frame, [5, 20, 60, 80], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Caption: fade in 5→22 with a small rise; fade out near the slot's end.
  const captionOpacity = interpolate(
    frame,
    [5, 22, clipDuration - 20, clipDuration - 6],
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
        src={staticFile(src)}
        trimBefore={trimStart} // trims the FRONT; the slot length handles the tail
        muted={muted}
        style={{width: '100%', height: '100%', objectFit: 'cover'}}
      />

      {/* Bottom scrim for caption legibility */}
      {caption ? (
        <AbsoluteFill
          style={{
            background:
              'linear-gradient(to top, rgba(0,0,0,0.66) 0%, rgba(0,0,0,0) 38%)',
          }}
        />
      ) : null}

      {/* Title card (top) */}
      {title ? (
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
              color: brandColor,
              textTransform: 'uppercase',
              ...outline(96),
            }}
          >
            {title}
          </div>
        </AbsoluteFill>
      ) : null}

      {/* Caption / lower-third (bottom) */}
      {caption ? (
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
            {caption}
          </div>
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};

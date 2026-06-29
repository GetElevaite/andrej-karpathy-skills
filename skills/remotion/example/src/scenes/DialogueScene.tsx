import React from 'react';
import {
  AbsoluteFill,
  Audio,
  OffthreadVideo,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {dialogue, speakers} from '../copy';

const outline = (fontSize: number): React.CSSProperties => ({
  WebkitTextStroke: `${fontSize * 0.06}px #000`,
  paintOrder: 'stroke fill',
});

// One color-coded, speaker-labeled caption. Visible from its own start until
// the next line begins (or the end). Fades in over ~6 frames.
const Line: React.FC<{
  label: string;
  color: string;
  text: string;
  fromFrame: number;
  toFrame: number;
}> = ({label, color, text, fromFrame, toFrame}) => {
  const frame = useCurrentFrame();
  if (frame < fromFrame || frame >= toFrame) return null;
  const opacity = interpolate(frame, [fromFrame, fromFrame + 6], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return (
    <AbsoluteFill
      style={{
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingBottom: 200,
        paddingLeft: 80,
        paddingRight: 80,
        opacity,
      }}
    >
      <div style={{fontFamily: 'Arial, sans-serif', fontWeight: 800, fontSize: 52, color, ...outline(52)}}>
        {label}
      </div>
      <div
        style={{
          fontFamily: 'Arial, sans-serif',
          fontWeight: 700,
          fontSize: 60,
          lineHeight: 1.15,
          textAlign: 'center',
          color: '#fff',
          marginTop: 12,
          ...outline(60),
        }}
      >
        {text}
      </div>
    </AbsoluteFill>
  );
};

export const DialogueScene: React.FC = () => {
  const {fps, durationInFrames} = useVideoConfig();

  // Each line shows from its startSec until the next line's start (or the end).
  const windows = dialogue.lines.map((l, i) => {
    const from = Math.round(l.startSec * fps);
    const next = dialogue.lines[i + 1];
    const to = next ? Math.round(next.startSec * fps) : durationInFrames;
    return {...l, from, to};
  });

  return (
    <AbsoluteFill style={{backgroundColor: '#000'}}>
      <OffthreadVideo
        src={staticFile('clip.mp4')}
        muted
        style={{width: '100%', height: '100%', objectFit: 'cover'}}
      />

      {/* Bottom scrim for legibility */}
      <AbsoluteFill
        style={{
          background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 40%)',
        }}
      />

      {windows.map((w, i) => {
        const sp = speakers[w.speaker as keyof typeof speakers];
        return (
          <Line key={i} label={sp.label} color={sp.color} text={w.text} fromFrame={w.from} toFrame={w.to} />
        );
      })}

      {/* Each character's voice, placed at its line's start. Only when the
          mp3s exist in public/ and dialogue.enabled is true. */}
      {dialogue.enabled
        ? dialogue.lines.map((l, i) => (
            <Sequence key={i} from={Math.round(l.startSec * fps)}>
              <Audio src={staticFile(l.voiceFile)} />
            </Sequence>
          ))
        : null}
    </AbsoluteFill>
  );
};

import React from 'react';
import {AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {ClipScene} from './scenes/ClipScene';
import {CLIP_FRAMES, DISSOLVE, clips, voiceover} from './copy';

// Lay the clips on a timeline. Each clip (after the first) starts DISSOLVE
// frames BEFORE the previous one ends, so they overlap. The incoming clip
// fades 0→1 over those frames on top of the still-visible outgoing clip —
// a true cross-dissolve that hides the seam between AI clips.
type Placed = {
  src: string;
  title: string;
  caption: string;
  trimStart: number;
  start: number;
  dur: number;
};

const place = (): {placed: Placed[]; total: number} => {
  let cursor = 0;
  const placed = clips.map((c, i) => {
    const dur = CLIP_FRAMES - c.trimStart - c.trimEnd;
    const start = i === 0 ? 0 : cursor - DISSOLVE;
    cursor = start + dur;
    return {src: c.src, title: c.title, caption: c.caption, trimStart: c.trimStart, start, dur};
  });
  return {placed, total: cursor};
};

export const TIMELINE = place();

// Fades a clip in over the first `frames` frames (skipped for the first clip).
const DissolveIn: React.FC<{frames: number; children: React.ReactNode}> = ({frames, children}) => {
  const frame = useCurrentFrame();
  const opacity =
    frames <= 0
      ? 1
      : interpolate(frame, [0, frames], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });
  return <AbsoluteFill style={{opacity}}>{children}</AbsoluteFill>;
};

export const Sequencer: React.FC = () => {
  return (
    <AbsoluteFill style={{backgroundColor: '#000'}}>
      {TIMELINE.placed.map((c, i) => (
        <Sequence key={i} from={c.start} durationInFrames={c.dur}>
          <DissolveIn frames={i === 0 ? 0 : DISSOLVE}>
            <ClipScene
              src={c.src}
              title={c.title}
              caption={c.caption}
              trimStart={c.trimStart}
              clipDuration={c.dur}
            />
          </DissolveIn>
        </Sequence>
      ))}

      {voiceover.enabled ? <Audio src={staticFile(voiceover.src)} /> : null}
    </AbsoluteFill>
  );
};

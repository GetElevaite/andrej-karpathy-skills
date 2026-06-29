import React from 'react';
import {Composition} from 'remotion';
import {ClipScene} from './scenes/ClipScene';
import {CLIP_FRAMES, FPS, edit} from './copy';

// Duration is DERIVED from the clip length minus trims — never hand-edited,
// so it can't drift out of sync with the trim controls.
const durationInFrames = CLIP_FRAMES - edit.trimStart - edit.trimEnd;

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="EditableClip"
      component={ClipScene}
      durationInFrames={durationInFrames}
      fps={FPS}
      width={1080}
      height={1920}
    />
  );
};

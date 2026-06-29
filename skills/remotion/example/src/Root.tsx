import React from 'react';
import {Composition} from 'remotion';
import {ClipScene} from './scenes/ClipScene';
import {Sequencer, TIMELINE} from './Sequencer';
import {CLIP_FRAMES, FPS, edit} from './copy';

// Single-clip editor: duration DERIVED from the clip minus trims (can't drift).
const singleDuration = CLIP_FRAMES - edit.trimStart - edit.trimEnd;

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* Put text on ONE clip and trim it. */}
      <Composition
        id="EditableClip"
        component={ClipScene}
        durationInFrames={singleDuration}
        fps={FPS}
        width={1080}
        height={1920}
        defaultProps={{
          src: edit.src,
          title: edit.title.show ? edit.title.text : undefined,
          caption: edit.caption.show ? edit.caption.text : undefined,
          trimStart: edit.trimStart,
          clipDuration: singleDuration,
          muted: !edit.keepClipAudio,
        }}
      />

      {/* Several clips chained with cross-dissolves + optional voiceover. */}
      <Composition
        id="MultiClip"
        component={Sequencer}
        durationInFrames={TIMELINE.total}
        fps={FPS}
        width={1080}
        height={1920}
      />
    </>
  );
};

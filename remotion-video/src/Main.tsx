import {AbsoluteFill, OffthreadVideo, staticFile} from 'remotion';

export const Main: React.FC<{src: string}> = ({src}) => {
  return (
    <AbsoluteFill style={{backgroundColor: 'black'}}>
      <OffthreadVideo
        src={staticFile(src)}
        style={{width: '100%', height: '100%', objectFit: 'cover'}}
      />
    </AbsoluteFill>
  );
};

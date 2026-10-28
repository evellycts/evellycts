import {Composition, staticFile} from 'remotion';
import {parseMedia} from '@remotion/media-parser';
import {Main} from './Main';

const FPS = 30;

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="Main"
      component={Main}
      width={1080}
      height={1920}
      fps={FPS}
      durationInFrames={FPS * 10}
      defaultProps={{src: 'video.mp4'}}
      // A duração acompanha o video.mp4 automaticamente.
      calculateMetadata={async ({props}) => {
        const {slowDurationInSeconds} = await parseMedia({
          src: staticFile(props.src),
          fields: {slowDurationInSeconds: true},
          acknowledgeRemotionLicense: true,
        });
        return {durationInFrames: Math.floor(slowDurationInSeconds * FPS)};
      }}
    />
  );
};

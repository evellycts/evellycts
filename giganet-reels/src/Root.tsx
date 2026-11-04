import '@fontsource/poppins/500.css';
import '@fontsource/poppins/700.css';
import '@fontsource/poppins/800.css';
import {Composition} from 'remotion';
import {GiganetReels} from './Video';
import {FPS, TOTAL_FRAMES} from './timeline';

export const Root: React.FC = () => (
  <Composition
    id="GiganetReels"
    component={GiganetReels}
    durationInFrames={TOTAL_FRAMES}
    fps={FPS}
    width={1080}
    height={1920}
  />
);

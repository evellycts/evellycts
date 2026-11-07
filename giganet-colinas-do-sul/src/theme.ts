import {Easing, interpolate, spring} from 'remotion';

export const C = {
  blue: '#004AAD',
  blueLight: '#2E6FD1',
  orange: '#F9A01B',
  orangeDark: '#D9820A',
  gray: '#ECE9EA',
  navy: '#061A44',
  navy2: '#0B2766',
  ink: '#0A1633',
  white: '#FFFFFF',
  skin: '#9A6244',
  skinShade: '#80492F',
  hair: '#2A1A15',
  pants: '#14254F',
  whats: '#25D366',
};

export const FONT = "'Poppins', 'Helvetica Neue', Arial, sans-serif";

export const ease = Easing.bezier(0.45, 0, 0.2, 1); // suave (in-out)
export const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
export const easeIn = Easing.bezier(0.6, 0, 0.9, 0.4);

/** interpolação com clamp e easing padrão */
export const tw = (
  f: number,
  input: number[],
  output: number[],
  e: (t: number) => number = ease,
) =>
  interpolate(f, input, output, {
    easing: e,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

/** mola com pequena acomodação ao chegar */
export const pop = (f: number, start: number, fps = 30, damping = 11) =>
  spring({frame: f - start, fps, config: {damping, stiffness: 160, mass: 0.7}});

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const mixColor = (a: string, b: string, t: number) => {
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  const ch = (p: number, s: number) => (p >> s) & 255;
  const c = [16, 8, 0].map((s) => Math.round(lerp(ch(pa, s), ch(pb, s), t)));
  return '#' + c.map((v) => v.toString(16).padStart(2, '0')).join('');
};

/** cor ao longo de várias paradas (0..1) */
export const colorRamp = (stops: string[], t: number) => {
  const x = Math.max(0, Math.min(0.9999, t)) * (stops.length - 1);
  const i = Math.floor(x);
  return mixColor(stops[i], stops[i + 1], x - i);
};

import React from 'react';
import {useCurrentFrame} from 'remotion';
import {C, FONT, easeOut, tw} from '../theme';

/** Texto que surge palavra a palavra por máscara (sobe de baixo). */
export const Reveal: React.FC<{
  text: string;
  start: number;
  stagger?: number;
  size?: number;
  color?: string;
  weight?: number;
  style?: React.CSSProperties;
  out?: number; // frame de saída (opcional)
  align?: 'left' | 'center';
  lineHeight?: number;
}> = ({text, start, stagger = 3, size = 64, color = C.blue, weight = 800, style, out, align = 'center', lineHeight = 1.15}) => {
  const f = useCurrentFrame();
  const lines = text.split('\n');
  let k = 0;
  const exitT = out !== undefined ? tw(f, [out, out + 10], [0, 1]) : 0;
  return (
    <div
      style={{
        position: 'absolute',
        fontFamily: FONT,
        fontWeight: weight,
        fontSize: size,
        color,
        lineHeight,
        textAlign: align,
        letterSpacing: -0.5,
        opacity: 1 - exitT,
        transform: `translateY(${-exitT * 30}px)`,
        ...style,
      }}
    >
      {lines.map((ln, li) => (
        <div key={li} style={{display: 'block', whiteSpace: 'nowrap'}}>
          {ln.split(' ').map((w, wi) => {
            const i = k++;
            const t = tw(f, [start + i * stagger, start + i * stagger + 14], [0, 1], easeOut);
            return (
              <span key={wi} style={{display: 'inline-block', overflow: 'hidden', verticalAlign: 'top', paddingBottom: size * 0.12, marginBottom: -size * 0.12}}>
                <span style={{display: 'inline-block', transform: `translateY(${(1 - t) * 110}%) rotate(${(1 - t) * 6}deg)`, opacity: t > 0 ? 1 : 0}}>
                  {w}
                  {wi < ln.split(' ').length - 1 ? ' ' : ''}
                </span>
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
};

/** Letra a letra, discreto (usado em "João Pessoa"). */
export const Letters: React.FC<{text: string; start: number; size?: number; color?: string; style?: React.CSSProperties; weight?: number}> = ({
  text,
  start,
  size = 52,
  color = C.blue,
  style,
  weight = 700,
}) => {
  const f = useCurrentFrame();
  return (
    <div style={{position: 'absolute', fontFamily: FONT, fontWeight: weight, fontSize: size, color, letterSpacing: 2, whiteSpace: 'nowrap', ...style}}>
      {text.split('').map((ch, i) => {
        const t = tw(f, [start + i * 1.2, start + i * 1.2 + 10], [0, 1], easeOut);
        return (
          <span key={i} style={{display: 'inline-block', opacity: t, transform: `translateY(${(1 - t) * 24}px)`}}>
            {ch === ' ' ? ' ' : ch}
          </span>
        );
      })}
    </div>
  );
};

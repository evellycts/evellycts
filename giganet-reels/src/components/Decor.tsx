import React from 'react';
import {C, pop} from '../theme';

/**
 * Elementos da arte da marca (bolhas laranja 3D e linhas onduladas),
 * redesenhados em SVG para poderem ser animados.
 */

export type Bubble = [number, number, number]; // x, y, raio

export const BubbleDefs: React.FC<{id: string}> = ({id}) => (
  <defs>
    <radialGradient id={`${id}-bub`} cx="0.36" cy="0.32" r="0.75">
      <stop offset="0" stopColor="#FFF1D2" />
      <stop offset="0.35" stopColor="#FBC266" />
      <stop offset="0.75" stopColor={C.orange} />
      <stop offset="1" stopColor="#C9770C" />
    </radialGradient>
  </defs>
);

/** Aglomerado de bolhas que surgem com mola e flutuam devagar. */
export const Bubbles: React.FC<{id: string; list: Bubble[]; f: number; start: number; float?: number}> = ({
  id,
  list,
  f,
  start,
  float = 1,
}) => (
  <g>
    {list.map(([x, y, r], i) => {
      const sp = pop(f, start + i * 1.5, 30, 10);
      if (sp <= 0.001) return null;
      const dy = Math.sin(f * 0.06 + i * 1.7) * 6 * float;
      const dx = Math.cos(f * 0.05 + i) * 3 * float;
      return (
        <g key={i} transform={`translate(${x + dx} ${y + dy}) scale(${sp})`}>
          <circle r={r} fill={`url(#${id}-bub)`} />
          <ellipse cx={-r * 0.32} cy={-r * 0.38} rx={r * 0.22} ry={r * 0.14} fill="#FFFFFF" opacity={0.55} transform={`rotate(-30 ${-r * 0.32} ${-r * 0.38})`} />
        </g>
      );
    })}
  </g>
);

/** Linhas onduladas concêntricas (curvas de nível) que se desenham. */
export const Contours: React.FC<{
  cx: number;
  cy: number;
  r0: number;
  gap?: number;
  n?: number;
  f: number;
  start: number;
  color?: string;
  opacity?: number;
  seed?: number;
}> = ({cx, cy, r0, gap = 16, n = 9, f, start, color = C.orange, opacity = 0.75, seed = 1}) => (
  <g opacity={opacity}>
    {Array.from({length: n}, (_, k) => {
      const pts: string[] = [];
      const steps = 90;
      for (let i = 0; i <= steps; i++) {
        const t = (i / steps) * Math.PI * 2;
        const wob = Math.sin(t * 3 + seed + k * 0.35) * (10 + k * 1.6) + Math.sin(t * 5 + seed * 2) * 6;
        const r = r0 + k * gap + wob + Math.sin(f * 0.03 + k * 0.4) * 3;
        pts.push(`${(cx + Math.cos(t) * r).toFixed(1)} ${(cy + Math.sin(t) * r * 0.82).toFixed(1)}`);
      }
      const prog = Math.max(0, Math.min(1, (f - start - k * 1.5) / 24));
      return (
        <path
          key={k}
          d={'M' + pts.join(' L')}
          fill="none"
          stroke={color}
          strokeWidth={2.6}
          pathLength={1}
          strokeDasharray="1 1"
          strokeDashoffset={1 - prog}
        />
      );
    })}
  </g>
);

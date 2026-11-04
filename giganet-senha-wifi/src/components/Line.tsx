import React from 'react';
import {C} from '../theme';

export type Pt = [number, number];

/**
 * Trajetória suave (Catmull-Rom) que passa por pontos de parada.
 * O progresso é medido em "índice de parada": 0 = primeiro ponto,
 * 1 = segundo ponto, 2.5 = metade entre o 3º e o 4º, etc.
 * Assim, a cabeça da linha pode ser sincronizada exatamente com cada objeto.
 */
export class Track {
  pts: Pt[] = []; // amostras
  idx: number[] = []; // índice de parada de cada amostra
  constructor(way: Pt[], closed = false, perSeg = 40) {
    const P = closed ? [way[way.length - 1], ...way, way[0], way[1]] : [way[0], ...way, way[way.length - 1]];
    const segs = closed ? way.length : way.length - 1;
    for (let i = 0; i < segs; i++) {
      const [p0, p1, p2, p3] = [P[i], P[i + 1], P[i + 2], P[i + 3]];
      for (let k = 0; k < perSeg; k++) {
        const t = k / perSeg;
        const t2 = t * t;
        const t3 = t2 * t;
        const f = (a: number, b: number, c: number, d: number) =>
          0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
        this.pts.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])]);
        this.idx.push(i + t);
      }
    }
    this.pts.push(closed ? way[0] : way[way.length - 1]);
    this.idx.push(segs);
  }
  get max() {
    return this.idx[this.idx.length - 1];
  }
  at(u: number): Pt {
    const v = Math.max(0, Math.min(this.max, u));
    const n = this.idx.length;
    // amostras uniformes por segmento -> busca direta
    const pos = (v / this.max) * (n - 1);
    const i = Math.min(n - 2, Math.floor(pos));
    const t = pos - i;
    const a = this.pts[i];
    const b = this.pts[i + 1];
    return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  }
  d(u0: number, u1: number) {
    const n = this.idx.length;
    const a = Math.max(0, Math.min(this.max, u0));
    const b = Math.max(0, Math.min(this.max, u1));
    if (b <= a) return '';
    const i0 = Math.ceil((a / this.max) * (n - 1));
    const i1 = Math.floor((b / this.max) * (n - 1));
    const pts: Pt[] = [this.at(a)];
    for (let i = i0; i <= i1; i++) pts.push(this.pts[i]);
    pts.push(this.at(b));
    return 'M' + pts.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' L');
  }
}

/** Linha de conexão azul + laranja (lembra o cabo de fibra da logo). */
export const ConnLine: React.FC<{
  track: Track;
  from?: number;
  to: number;
  width?: number;
  head?: boolean;
  glow?: number;
  pulses?: number[]; // posições (índice de parada) de pulsos luminosos
}> = ({track, from = 0, to, width = 18, head = true, glow = 1, pulses = []}) => {
  const d = track.d(from, to);
  if (!d) return null;
  const h = track.at(to);
  return (
    <g>
      {/* contorno claro: mantém a linha legível sobre o azul-escuro */}
      <path d={d} fill="none" stroke="#FFFFFF" strokeOpacity={0.85} strokeWidth={width * 1.35} strokeLinecap="round" strokeLinejoin="round" />
      <path d={d} fill="none" stroke={C.blue} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" />
      <path
        d={d}
        fill="none"
        stroke={C.orange}
        strokeWidth={width * 0.42}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {pulses.map((p, i) => {
        if (p < from || p > to) return null;
        const [x, y] = track.at(p);
        return (
          <g key={i}>
            <circle cx={x} cy={y} r={width * 1.5} fill={C.orange} opacity={0.25} />
            <circle cx={x} cy={y} r={width * 0.75} fill="#FFF4DD" />
          </g>
        );
      })}
      {head && (
        <g>
          <circle cx={h[0]} cy={h[1]} r={width * 1.7 * glow} fill={C.orange} opacity={0.22} />
          <circle cx={h[0]} cy={h[1]} r={width * 0.95} fill={C.orange} />
          <circle cx={h[0]} cy={h[1]} r={width * 0.42} fill="#FFF6E4" />
        </g>
      )}
    </g>
  );
};

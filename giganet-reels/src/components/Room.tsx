import React from 'react';
import {C, colorRamp} from '../theme';

/**
 * Cômodo principal (sala/escritório) em 1080×1920.
 * phase: 0 manhã · 0.5 fim de tarde · 1 noite. A luz muda suavemente.
 */
export const FLOOR_Y = 1600;

export const Room: React.FC<{phase: number; id: string; lamp?: number; children?: React.ReactNode}> = ({
  phase,
  id,
  lamp,
  children,
}) => {
  const wall = colorRamp(['#ECE9EA', '#F4DFC9', '#22325E'], phase);
  const wallDark = colorRamp(['#DDD8DA', '#E6CBB0', '#1A2850'], phase);
  const floor = colorRamp(['#D6C3B2', '#D2AE8E', '#18244A'], phase);
  const floorDark = colorRamp(['#C3AD9A', '#BF9877', '#121C3C'], phase);
  const sky = colorRamp(['#9ED4FF', '#FFB86B', '#0D1B4D'], phase);
  const sky2 = colorRamp(['#D8F0FF', '#FFE2B0', '#1D2F72'], phase);
  const sunY = 420 + phase * 360;
  const lampOn = lamp ?? Math.max(0, Math.min(1, (phase - 0.6) / 0.3));
  const nightA = Math.max(0, (phase - 0.55) / 0.45);

  return (
    <g>
      <defs>
        <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={sky} />
          <stop offset="1" stopColor={sky2} />
        </linearGradient>
        <radialGradient id={`${id}-lamp`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#FFD98A" stopOpacity={0.55} />
          <stop offset="1" stopColor="#FFD98A" stopOpacity={0} />
        </radialGradient>
        <linearGradient id={`${id}-sun`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity={0.35 * (1 - nightA)} />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity={0} />
        </linearGradient>
      </defs>
      {/* parede e piso */}
      <rect x={-200} y={-200} width={1480} height={FLOOR_Y + 200} fill={wall} />
      <rect x={-200} y={FLOOR_Y - 30} width={1480} height={30} fill={wallDark} />
      <rect x={-200} y={FLOOR_Y} width={1480} height={700} fill={floor} />
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <line key={i} x1={-200 + i * 240} y1={FLOOR_Y} x2={-420 + i * 300} y2={2300} stroke={floorDark} strokeWidth={4} />
      ))}
      {/* janela */}
      <g>
        <rect x={130} y={300} width={360} height={460} rx={26} fill={`url(#${id}-sky)`} />
        <circle cx={400} cy={sunY} r={46} fill="#FFE07A" opacity={1 - nightA} />
        <g opacity={nightA}>
          <circle cx={230} cy={400} r={34} fill="#F4F1E8" />
          <circle cx={244} cy={390} r={30} fill={sky} />
          {[
            [330, 360],
            [420, 430],
            [180, 520],
            [380, 560],
            [300, 470],
          ].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={4} fill="#FFFFFF" />
          ))}
        </g>
        <path d="M 130 640 Q 230 590 310 640 T 490 630 L 490 760 L 130 760 Z" fill={colorRamp(['#7CC46A', '#C9925A', '#0A1638'], phase)} opacity={0.9} />
        <rect x={130} y={300} width={360} height={460} rx={26} fill="none" stroke="#FFFFFF" strokeWidth={18} />
        <line x1={310} y1={300} x2={310} y2={760} stroke="#FFFFFF" strokeWidth={12} />
        <line x1={130} y1={530} x2={490} y2={530} stroke="#FFFFFF" strokeWidth={12} />
        <rect x={110} y={760} width={400} height={22} rx={8} fill="#FFFFFF" />
      </g>
      {/* luz do sol entrando */}
      <path d={`M 130 300 L 490 300 L 760 ${FLOOR_Y + 200} L 200 ${FLOOR_Y + 200} Z`} fill={`url(#${id}-sun)`} />
      {/* prateleira */}
      <g>
        <rect x={610} y={470} width={340} height={16} rx={6} fill="#B07B4B" />
        <rect x={630} y={386} width={26} height={84} rx={4} fill={C.blue} />
        <rect x={660} y={400} width={22} height={70} rx={4} fill={C.orange} />
        <rect x={686} y={392} width={26} height={78} rx={4} fill="#5BC0EB" />
        <path d="M 870 470 Q 860 420 890 400 Q 920 420 910 470 Z" fill="#6FB36A" />
        <rect x={868} y={440} width={44} height={30} rx={6} fill="#ECE9EA" />
      </g>
      {/* luminária de chão */}
      <g>
        <rect x={60} y={1000} width={10} height={FLOOR_Y - 1000} fill="#59627E" />
        <ellipse cx={65} cy={FLOOR_Y} rx={50} ry={10} fill="#59627E" />
        <circle cx={65} cy={1030} r={260 * lampOn + 1} fill={`url(#${id}-lamp)`} />
        <path d="M 10 1000 L 120 1000 L 100 920 L 30 920 Z" fill={lampOn > 0.5 ? '#FFE3A3' : '#ECE9EA'} />
      </g>
      {children}
      {/* tom noturno sobre a cena */}
      <rect x={-200} y={-200} width={1480} height={2320} fill="#0A1A4A" opacity={nightA * 0.18} />
    </g>
  );
};

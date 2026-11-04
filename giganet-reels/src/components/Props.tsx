import React from 'react';
import {C} from '../theme';

/* ------------------------------------------------------------ telas */
export const Screen: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  children?: React.ReactNode;
  bg?: string;
}> = ({x, y, w, h, children, bg = '#0F2147'}) => (
  <svg x={x} y={y} width={w} height={h} viewBox="0 0 400 250" preserveAspectRatio="none">
    <rect width={400} height={250} fill={bg} />
    {children}
  </svg>
);

export const PlayerContent: React.FC<{showPlay?: number; progress?: number}> = ({showPlay = 1, progress = 0}) => (
  <g>
    <rect width={400} height={250} fill="#13306B" />
    <circle cx={330} cy={60} r={30} fill="#1E4A9A" />
    <path d="M0 250 L0 170 Q 90 120 180 170 T 400 150 L400 250 Z" fill="#0C2457" />
    <g opacity={showPlay} transform={`translate(200 118) scale(${0.6 + 0.4 * showPlay})`}>
      <circle r={42} fill={C.orange} />
      <path d="M -12 -20 L 22 0 L -12 20 Z" fill="#FFFFFF" />
    </g>
    <rect x={20} y={226} width={360} height={7} rx={3.5} fill="#FFFFFF" opacity={0.25} />
    <rect x={20} y={226} width={360 * progress} height={7} rx={3.5} fill={C.orange} />
  </g>
);

const Avatar: React.FC<{x: number; y: number; c: string; hair: string}> = ({x, y, c, hair}) => (
  <g transform={`translate(${x} ${y})`}>
    <circle cy={-14} r={24} fill={hair} />
    <circle cy={-8} r={19} fill="#B07A57" />
    <path d="M -34 40 Q -34 12 0 12 Q 34 12 34 40 Z" fill={c} />
  </g>
);

export const CallContent: React.FC<{t?: number}> = ({t = 0}) => (
  <g>
    <rect width={400} height={250} fill="#0D1C3D" />
    {[
      [10, 10, '#2F5FB5', C.blue, '#3B2418'],
      [205, 10, '#3A4A72', C.orange, '#1D120C'],
      [10, 124, '#3A4A72', '#5BC0EB', '#5A3A22'],
      [205, 124, '#2F5FB5', '#ECE9EA', '#2A1A15'],
    ].map(([x, y, bg, c, h], i) => (
      <g key={i}>
        <rect x={x as number} y={y as number} width={185} height={106} rx={10} fill={bg as string} />
        <Avatar x={(x as number) + 92} y={(y as number) + 64} c={c as string} hair={h as string} />
        {i === Math.floor(t) % 4 && (
          <rect x={x as number} y={y as number} width={185} height={106} rx={10} fill="none" stroke={C.orange} strokeWidth={5} />
        )}
      </g>
    ))}
  </g>
);

export const DocContent: React.FC<{t?: number}> = ({t = 0}) => (
  <g>
    <rect width={400} height={250} fill="#F4F6FA" />
    <rect width={400} height={34} fill={C.blue} />
    <circle cx={20} cy={17} r={6} fill={C.orange} />
    {[0, 1, 2, 3, 4, 5].map((i) => (
      <rect key={i} x={24} y={56 + i * 30} width={Math.min(260 - (i % 3) * 50, Math.max(0, t * 400 - i * 60))} height={10} rx={5} fill="#B9C3D6" />
    ))}
    <rect x={300} y={56} width={76} height={160} rx={8} fill="#DCE5F5" />
    {[0, 1, 2].map((i) => (
      <rect key={i} x={312 + i * 22} y={196 - (40 + i * 30)} width={14} height={40 + i * 30} rx={3} fill={i === 2 ? C.orange : C.blue} />
    ))}
  </g>
);

export const SeriesContent: React.FC<{t: number}> = ({t}) => (
  <g>
    <rect width={400} height={250} fill="#1B1240" />
    <circle cx={300 - (t % 200) * 0.3} cy={70} r={28} fill="#FFD36E" opacity={0.9} />
    <path d={`M0 250 L0 160 Q 100 ${110 + Math.sin(t / 8) * 10} 200 160 T 400 150 L400 250 Z`} fill="#2C1E6B" />
    <path d="M0 250 L0 200 Q 120 170 240 205 T 400 190 L400 250 Z" fill="#120B30" />
    <g transform={`translate(${120 + Math.sin(t / 10) * 30} 150)`}>
      <circle cy={-26} r={12} fill="#F9A01B" />
      <rect x={-10} y={-14} width={20} height={34} rx={8} fill="#FFFFFF" />
    </g>
  </g>
);

/* ------------------------------------------------------------ notebook */
export const Laptop: React.FC<{
  x: number; // centro
  y: number; // linha da dobradiça
  w?: number;
  children?: React.ReactNode;
  screenBg?: string;
  base?: boolean;
}> = ({x, y, w = 340, children, screenBg, base = true}) => {
  const h = w * 0.63;
  return (
    <g>
      <rect x={x - w / 2} y={y - h} width={w} height={h} rx={16} fill="#0B1733" />
      <Screen x={x - w / 2 + 12} y={y - h + 12} w={w - 24} h={h - 22} bg={screenBg}>
        {children}
      </Screen>
      {base && (
        <g>
          <path d={`M ${x - w / 2 - 22} ${y} L ${x + w / 2 + 22} ${y} L ${x + w / 2 + 42} ${y + 24} L ${x - w / 2 - 42} ${y + 24} Z`} fill="#C9CED8" />
          <rect x={x - w / 2 - 42} y={y + 22} width={w + 84} height={8} rx={4} fill="#A6ADBB" />
          <rect x={x - 34} y={y + 6} width={68} height={8} rx={4} fill="#B2B8C5" />
        </g>
      )}
    </g>
  );
};

/* ------------------------------------------------------------ TV */
export const TV: React.FC<{x: number; y: number; w?: number; children?: React.ReactNode; stand?: boolean; glow?: number}> = ({
  x,
  y,
  w = 480,
  children,
  stand = true,
  glow = 0,
}) => {
  const h = w * 0.5625;
  return (
    <g>
      {glow > 0 && <ellipse cx={x} cy={y} rx={w * 0.9} ry={h * 1.1} fill="#6FA8FF" opacity={0.18 * glow} />}
      {stand && (
        <g>
          <rect x={x - 10} y={y + h / 2} width={20} height={34} fill="#2A3557" />
          <rect x={x - 80} y={y + h / 2 + 30} width={160} height={12} rx={6} fill="#2A3557" />
        </g>
      )}
      <rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={14} fill="#0B1733" />
      <Screen x={x - w / 2 + 12} y={y - h / 2 + 12} w={w - 24} h={h - 24}>
        {children}
      </Screen>
    </g>
  );
};

export const PlayBadge: React.FC<{r?: number; s?: number}> = ({r = 46, s = 1}) => (
  <g transform={`scale(${s})`}>
    <circle r={r} fill={C.orange} />
    <path d={`M ${-r * 0.28} ${-r * 0.45} L ${r * 0.5} 0 L ${-r * 0.28} ${r * 0.45} Z`} fill="#FFFFFF" strokeLinejoin="round" />
  </g>
);

/* ------------------------------------------------------------ caderno + lápis */
export const NotebookBook: React.FC<{lines?: number}> = ({lines = 1}) => (
  <g>
    <path d="M -170 -100 L 0 -84 L 0 104 L -170 90 Z" fill="#FFFFFF" stroke="#C8CEDA" strokeWidth={3} />
    <path d="M 170 -100 L 0 -84 L 0 104 L 170 90 Z" fill="#F7F8FB" stroke="#C8CEDA" strokeWidth={3} />
    {[0, 1, 2, 3, 4].map((i) => (
      <g key={i}>
        <line x1={-150} y1={-62 + i * 32} x2={-150 + 130 * Math.min(1, Math.max(0, lines * 5 - i))} y2={-50 + i * 32} stroke={C.blue} strokeWidth={4} strokeLinecap="round" opacity={0.75} />
        <line x1={20} y1={-74 + i * 32} x2={150} y2={-86 + i * 32} stroke="#D5DAE4" strokeWidth={3} strokeLinecap="round" />
      </g>
    ))}
    {[0, 1, 2, 3, 4, 5].map((i) => (
      <circle key={i} cx={0} cy={-70 + i * 32} r={6} fill="none" stroke="#7D879C" strokeWidth={3} />
    ))}
  </g>
);

export const Pencil: React.FC = () => (
  <g>
    <rect x={-10} y={-90} width={20} height={150} rx={4} fill={C.orange} />
    <rect x={-10} y={-90} width={20} height={14} fill="#E77B9C" />
    <rect x={-10} y={-78} width={20} height={8} fill="#C9CED8" />
    <path d="M -10 60 L 10 60 L 0 88 Z" fill="#F2D3A8" />
    <path d="M -4 77 L 4 77 L 0 88 Z" fill="#2A1A15" />
  </g>
);

/* ------------------------------------------------------------ controle */
export const Controller: React.FC = () => (
  <g>
    <path
      d="M -150 -40 Q -150 -80 -100 -80 L 100 -80 Q 150 -80 160 -30 L 180 60 Q 190 110 140 110 Q 110 110 90 60 L -90 60 Q -110 110 -140 110 Q -190 110 -180 60 Z"
      fill="#ECE9EA"
    />
    <rect x={-118} y={-30} width={22} height={66} rx={5} fill="#1C2A52" />
    <rect x={-140} y={-8} width={66} height={22} rx={5} fill="#1C2A52" />
    <circle cx={100} cy={-32} r={14} fill={C.orange} />
    <circle cx={130} cy={-4} r={14} fill={C.blueLight} />
    <circle cx={70} cy={-4} r={14} fill={C.blueLight} />
    <circle cx={100} cy={24} r={14} fill={C.orange} />
    <circle cx={-34} cy={30} r={20} fill="#9AA6C2" />
    <circle cx={34} cy={30} r={20} fill="#9AA6C2" />
  </g>
);

/* ------------------------------------------------------------ móveis */
export const Desk: React.FC<{x0: number; x1: number; top: number; floor: number; color?: string}> = ({
  x0,
  x1,
  top,
  floor,
  color = '#C98E5A',
}) => (
  <g>
    <rect x={x0 + 26} y={top + 20} width={22} height={floor - top - 20} fill="#8C5E38" />
    <rect x={x1 - 48} y={top + 20} width={22} height={floor - top - 20} fill="#8C5E38" />
    <rect x={x1 - 190} y={top + 26} width={150} height={110} rx={8} fill="#B07B4B" />
    <rect x={x1 - 130} y={top + 76} width={30} height={8} rx={4} fill="#ECE9EA" />
    <rect x={x0} y={top} width={x1 - x0} height={30} rx={8} fill={color} />
  </g>
);

export const OfficeChairBack: React.FC<{x: number; y: number}> = ({x, y}) => (
  <g>
    <rect x={x - 8} y={y + 10} width={16} height={130} fill="#59627E" />
    <path d={`M ${x - 110} ${y + 190} L ${x + 110} ${y + 190}`} stroke="#59627E" strokeWidth={14} strokeLinecap="round" />
    <circle cx={x - 110} cy={y + 200} r={12} fill="#2B3352" />
    <circle cx={x + 110} cy={y + 200} r={12} fill="#2B3352" />
    <circle cx={x} cy={y + 200} r={12} fill="#2B3352" />
    <rect x={x - 96} y={y - 300} width={192} height={290} rx={56} fill="#2B3A67" />
    <rect x={x - 70} y={y - 270} width={140} height={210} rx={40} fill="#33467C" />
    <rect x={x - 100} y={y - 14} width={200} height={34} rx={17} fill="#2B3A67" />
  </g>
);

export const ArmchairBack: React.FC<{x: number; y: number; color?: string}> = ({x, y, color = '#D9D4D6'}) => (
  <g>
    <rect x={x - 170} y={y - 280} width={340} height={330} rx={70} fill={color} />
    <rect x={x - 130} y={y - 250} width={260} height={240} rx={50} fill="#E7E3E4" />
    <rect x={x - 70} y={y - 170} width={120} height={90} rx={30} fill={C.orange} transform={`rotate(-8 ${x} ${y - 125})`} />
    <rect x={x - 150} y={y - 20} width={300} height={70} rx={26} fill="#CBC5C7" />
    <rect x={x - 150} y={y + 46} width={24} height={50} rx={6} fill="#8C5E38" />
    <rect x={x + 126} y={y + 46} width={24} height={50} rx={6} fill="#8C5E38" />
  </g>
);

export const ArmchairFront: React.FC<{x: number; y: number; color?: string}> = ({x, y, color = '#D9D4D6'}) => (
  <g>
    <rect x={x - 200} y={y - 120} width={70} height={180} rx={34} fill={color} />
    <rect x={x + 130} y={y - 120} width={70} height={180} rx={34} fill={color} />
  </g>
);

/* ------------------------------------------------------------ ícones */
/** Ícone simplificado de WhatsApp (balão + fone). */
export const WhatsIcon: React.FC<{r?: number}> = ({r = 70}) => {
  const k = r / 70;
  return (
    <g transform={`scale(${k})`}>
      <circle r={70} fill={C.whats} />
      <path d="M -40 44 L -32 18 A 40 40 0 1 1 -14 36 Z" fill="none" stroke="#FFFFFF" strokeWidth={8} strokeLinejoin="round" />
      <path
        d="M -16 -20 Q -20 -10 -10 6 Q 2 22 18 24 Q 24 24 26 16 L 22 10 L 12 8 L 8 14 Q -2 10 -8 -2 L -2 -6 L -4 -16 L -10 -22 Q -14 -24 -16 -20 Z"
        fill="#FFFFFF"
      />
    </g>
  );
};

export const PinIcon: React.FC<{s?: number; color?: string}> = ({s = 1, color = C.orange}) => (
  <g transform={`scale(${s})`}>
    <path d="M 0 30 C -14 12 -22 2 -22 -10 A 22 22 0 0 1 22 -10 C 22 2 14 12 0 30 Z" fill={color} />
    <circle cy={-10} r={8} fill="#FFFFFF" />
  </g>
);

export const LoadingRing: React.FC<{r?: number; angle: number; arc?: number; w?: number}> = ({r = 40, angle, arc = 0.75, w = 12}) => {
  const circ = 2 * Math.PI * r;
  return (
    <g transform={`rotate(${angle})`}>
      <circle r={r} fill="none" stroke="#FFFFFF" strokeOpacity={0.2} strokeWidth={w} />
      <circle
        r={r}
        fill="none"
        stroke={C.blue}
        strokeWidth={w}
        strokeLinecap="round"
        strokeDasharray={`${circ * arc} ${circ}`}
      />
      <circle
        r={r}
        fill="none"
        stroke={C.orange}
        strokeWidth={w * 0.38}
        strokeLinecap="round"
        strokeDasharray={`${circ * arc} ${circ}`}
      />
    </g>
  );
};

export const Router: React.FC<{on?: number}> = ({on = 1}) => (
  <g>
    <line x1={-30} y1={-10} x2={-40} y2={-60} stroke="#33447A" strokeWidth={7} strokeLinecap="round" />
    <line x1={30} y1={-10} x2={40} y2={-60} stroke="#33447A" strokeWidth={7} strokeLinecap="round" />
    <rect x={-60} y={-14} width={120} height={36} rx={12} fill="#ECE9EA" />
    {[0, 1, 2].map((i) => (
      <circle key={i} cx={-30 + i * 20} cy={4} r={5} fill={i === 2 ? C.orange : '#2ECC71'} opacity={0.4 + 0.6 * on} />
    ))}
  </g>
);

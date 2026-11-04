import React from 'react';
import {C, FONT} from '../theme';

/**
 * Sala de estar (mundo 2200 × 1920; chão em y = 1600).
 * Esquerda: porta de entrada. Direita: sofá, prateleira com roteador, luminária, plantas.
 */
export const FLOOR = 1600;
export const DOOR = {x0: 120, x1: 440, top: 640};
export const SOFA = {x0: 1150, x1: 1950, seat: 1430};
export const SEATS = {visita: 1330, amiga: 1550, anfitria: 1770};
export const ROUTER: [number, number] = [1460, 896];

/** Folha da porta: open 0 = fechada, 1 = aberta (gira na dobradiça da direita). */
export const DoorLeaf: React.FC<{open: number}> = ({open}) => {
  const w = DOOR.x1 - DOOR.x0;
  const sx = Math.max(0.1, 1 - open * 0.88);
  return (
    <g transform={`translate(${DOOR.x1} 0) scale(${sx} 1) translate(${-DOOR.x1} 0)`}>
      <rect x={DOOR.x0} y={DOOR.top} width={w} height={FLOOR - DOOR.top} fill="#2D5DB8" />
      <rect x={DOOR.x0 + 36} y={DOOR.top + 50} width={w - 72} height={300} rx={14} fill="#2552A8" />
      <rect x={DOOR.x0 + 36} y={DOOR.top + 400} width={w - 72} height={460} rx={14} fill="#2552A8" />
      <circle cx={DOOR.x0 + 40} cy={1140} r={14} fill={C.orange} />
      {/* sombra lateral dá volume ao girar */}
      <rect x={DOOR.x0} y={DOOR.top} width={w} height={FLOOR - DOOR.top} fill="#000" opacity={open * 0.35} />
    </g>
  );
};

export const Sala: React.FC<{f: number; lamp?: number; doorOpen?: number; children?: React.ReactNode}> = ({f, lamp = 1, doorOpen = 1, children}) => (
  <g>
    <defs>
      <radialGradient id="sala-lamp" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stopColor="#FFD98A" stopOpacity={0.5} />
        <stop offset="1" stopColor="#FFD98A" stopOpacity={0} />
      </radialGradient>
      <linearGradient id="sala-fora" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#FFB86B" />
        <stop offset="1" stopColor="#FFE2B0" />
      </linearGradient>
      <linearGradient id="sala-wall" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#E3DFE0" />
        <stop offset="1" stopColor="#F1EEEF" />
      </linearGradient>
    </defs>
    {/* parede */}
    <rect x={-1200} y={-1400} width={4600} height={FLOOR + 1400} fill="url(#sala-wall)" />
    <rect x={-1200} y={FLOOR - 34} width={4600} height={34} fill="#D6D1D3" />
    {/* piso */}
    <rect x={-1200} y={FLOOR} width={4600} height={1600} fill="#C99A6E" />
    {Array.from({length: 16}, (_, i) => (
      <line key={i} x1={-1200 + i * 300} y1={FLOOR} x2={-1800 + i * 380} y2={3200} stroke="#B5865C" strokeWidth={5} />
    ))}
    {/* porta: lado de fora (fim de tarde) */}
    <rect x={DOOR.x0} y={DOOR.top} width={DOOR.x1 - DOOR.x0} height={FLOOR - DOOR.top} fill="url(#sala-fora)" />
    <circle cx={200} cy={820} r={50} fill="#FFF1C9" opacity={0.9} />
    <path d={`M ${DOOR.x0} 1300 Q 220 1220 320 1290 T ${DOOR.x1} 1280 L ${DOOR.x1} ${FLOOR} L ${DOOR.x0} ${FLOOR} Z`} fill="#6FB36A" />
    <rect x={DOOR.x0} y={FLOOR - 70} width={DOOR.x1 - DOOR.x0} height={70} fill="#B9A89C" />
    {/* batente */}
    <path d={`M ${DOOR.x0 - 28} ${FLOOR} L ${DOOR.x0 - 28} ${DOOR.top - 28} L ${DOOR.x1 + 28} ${DOOR.top - 28} L ${DOOR.x1 + 28} ${FLOOR}`} fill="none" stroke="#FFFFFF" strokeWidth={30} />
    {/* quadro */}
    <rect x={720} y={700} width={220} height={170} rx={10} fill="#FFFFFF" />
    <rect x={736} y={716} width={188} height={138} rx={6} fill={C.blue} />
    <circle cx={800} cy={770} r={24} fill={C.orange} />
    <path d="M 736 854 L 820 790 L 870 830 L 924 780 L 924 854 Z" fill="#2E6FD1" />
    {/* planta perto do quadro */}
    <Planta x={1060} />
    {/* prateleira com roteador */}
    <rect x={1300} y={930} width={500} height={18} rx={6} fill="#B07B4B" />
    <g transform={`translate(${ROUTER[0]} ${ROUTER[1]})`}>
      <line x1={-30} y1={-10} x2={-40} y2={-60} stroke="#33447A" strokeWidth={7} strokeLinecap="round" />
      <line x1={30} y1={-10} x2={40} y2={-60} stroke="#33447A" strokeWidth={7} strokeLinecap="round" />
      <rect x={-60} y={-14} width={120} height={48} rx={12} fill="#FFFFFF" />
      {[0, 1, 2].map((i) => (
        <circle key={i} cx={-30 + i * 20} cy={10} r={5} fill={i === 2 ? C.orange : '#2ECC71'} opacity={0.5 + 0.5 * Math.abs(Math.sin(f * 0.2 + i))} />
      ))}
    </g>
    <rect x={1580} y={850} width={26} height={80} rx={4} fill={C.blue} />
    <rect x={1610} y={864} width={22} height={66} rx={4} fill={C.orange} />
    <rect x={1636} y={856} width={26} height={74} rx={4} fill="#5BC0EB" />
    <path d="M 1720 930 Q 1708 870 1740 850 Q 1772 870 1760 930 Z" fill="#6FB36A" />
    {/* luminária de chão */}
    <g>
      <circle cx={2080} cy={1020} r={330 * lamp} fill="url(#sala-lamp)" />
      <rect x={2075} y={1000} width={10} height={FLOOR - 1000} fill="#59627E" />
      <ellipse cx={2080} cy={FLOOR} rx={54} ry={11} fill="#59627E" />
      <path d="M 2020 1000 L 2140 1000 L 2118 912 L 2042 912 Z" fill="#FFE3A3" />
    </g>
    <Planta x={2160} big />
    {/* sombra suave do sofá */}
    <ellipse cx={(SOFA.x0 + SOFA.x1) / 2} cy={FLOOR + 8} rx={460} ry={30} fill="#000" opacity={0.12} />
    {/* tapete */}
    <ellipse cx={1550} cy={FLOOR + 110} rx={520} ry={70} fill={C.blue} opacity={0.85} />
    <ellipse cx={1550} cy={FLOOR + 110} rx={470} ry={54} fill="none" stroke={C.orange} strokeWidth={6} opacity={0.8} />
    {children}
  </g>
);

export const Planta: React.FC<{x: number; big?: boolean}> = ({x, big}) => {
  const k = big ? 1.25 : 1;
  return (
    <g transform={`translate(${x} ${FLOOR}) scale(${k})`}>
      {[-50, -20, 10, 40, -35, 25].map((a, i) => (
        <ellipse key={i} cx={Math.sin((a * Math.PI) / 180) * 70} cy={-150 - (i % 3) * 30} rx={22} ry={70} fill={i % 2 ? '#5E9E5A' : '#79B86F'} transform={`rotate(${a} ${Math.sin((a * Math.PI) / 180) * 70} ${-150 - (i % 3) * 30})`} />
      ))}
      <path d="M -50 -90 L 50 -90 L 38 0 L -38 0 Z" fill={C.orange} />
      <rect x={-56} y={-100} width={112} height={18} rx={6} fill="#D9820A" />
    </g>
  );
};

/** Encosto do sofá (atrás das personagens). */
export const SofaBack: React.FC = () => (
  <g>
    <rect x={SOFA.x0} y={1120} width={SOFA.x1 - SOFA.x0} height={360} rx={60} fill="#CFC9CC" />
    {[0, 1, 2].map((i) => (
      <rect key={i} x={SOFA.x0 + 40 + i * 245} y={1150} width={230} height={250} rx={40} fill="#DDD8DA" />
    ))}
    <rect x={SOFA.x0 + 70} y={1220} width={120} height={100} rx={28} fill={C.orange} transform={`rotate(-10 ${SOFA.x0 + 130} 1270)`} />
    <rect x={SOFA.x1 - 190} y={1220} width={120} height={100} rx={28} fill={C.blue} transform={`rotate(9 ${SOFA.x1 - 130} 1270)`} />
    {/* assento e base */}
    <rect x={SOFA.x0 + 10} y={SOFA.seat - 20} width={SOFA.x1 - SOFA.x0 - 20} height={80} rx={30} fill="#BDB6BA" />
    <rect x={SOFA.x0} y={SOFA.seat + 40} width={SOFA.x1 - SOFA.x0} height={120} rx={24} fill="#B3ACB0" />
    {[SOFA.x0 + 40, SOFA.x1 - 70].map((x, i) => (
      <rect key={i} x={x} y={SOFA.seat + 158} width={30} height={12} rx={4} fill="#8C5E38" />
    ))}
  </g>
);

/** Braços do sofá + mesinha (na frente das personagens). */
export const SofaFront: React.FC = () => (
  <g>
    {/* frente do assento: cobre o quadril, as pernas saem por baixo (leitura de "sentado") */}
    <rect x={SOFA.x0 + 20} y={SOFA.seat - 6} width={SOFA.x1 - SOFA.x0 - 40} height={74} rx={30} fill="#C7C1C4" />
    {[1, 2].map((i) => (
      <line key={i} x1={SOFA.x0 + i * ((SOFA.x1 - SOFA.x0) / 3)} y1={SOFA.seat + 2} x2={SOFA.x0 + i * ((SOFA.x1 - SOFA.x0) / 3)} y2={SOFA.seat + 60} stroke="#B3ACB0" strokeWidth={5} />
    ))}
    <rect x={SOFA.x0 - 60} y={1250} width={110} height={330} rx={48} fill="#CFC9CC" />
    <rect x={SOFA.x1 - 50} y={1250} width={110} height={330} rx={48} fill="#CFC9CC" />
    <rect x={SOFA.x0 - 40} y={1578} width={28} height={22} rx={4} fill="#8C5E38" />
    <rect x={SOFA.x1 + 12} y={1578} width={28} height={22} rx={4} fill="#8C5E38" />
  </g>
);

export const MesaCentro: React.FC = () => (
  <g>
    <ellipse cx={1550} cy={1690} rx={250} ry={40} fill="#000" opacity={0.12} />
    <rect x={1330} y={1600} width={440} height={30} rx={14} fill="#B07B4B" />
    <rect x={1360} y={1628} width={20} height={60} fill="#8C5E38" />
    <rect x={1720} y={1628} width={20} height={60} fill="#8C5E38" />
    {/* pipoca */}
    <path d="M 1440 1600 L 1540 1600 L 1528 1550 L 1452 1550 Z" fill={C.orange} />
    {[0, 1, 2, 3, 4].map((i) => (
      <circle key={i} cx={1460 + i * 16} cy={1544 - (i % 2) * 10} r={14} fill="#FFF6E0" />
    ))}
    <rect x={1620} y={1556} width={40} height={44} rx={8} fill="#FFFFFF" />
    <rect x={1660} y={1566} width={14} height={22} rx={7} fill="none" stroke="#FFFFFF" strokeWidth={5} />
  </g>
);

/* ------------------------------------------------------------ celular */
export const Phone: React.FC<{x: number; y: number; rot?: number; s?: number; front?: boolean; children?: React.ReactNode}> = ({
  x,
  y,
  rot = 0,
  s = 1,
  front = true,
  children,
}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <rect x={-30} y={-54} width={60} height={108} rx={12} fill="#0B1733" />
    {front ? (
      <svg x={-25} y={-47} width={50} height={94} viewBox="0 0 400 750">
        <rect width={400} height={750} fill="#F4F6FA" />
        {children}
      </svg>
    ) : (
      <g>
        <rect x={-26} y={-50} width={52} height={100} rx={10} fill="#1C2A52" />
        <circle cx={-12} cy={-36} r={7} fill="#0B1733" stroke="#59627E" strokeWidth={2} />
      </g>
    )}
  </g>
);

/* ------------------------------------------------------------ conteúdo das telas (400 × 750) */
export const VideoTela: React.FC<{t: number}> = ({t}) => (
  <g>
    <rect width={400} height={750} fill="#13306B" />
    <rect y={180} width={400} height={300} fill="#7CC4FF" />
    <rect y={420} width={400} height={60} fill="#6FB36A" />
    {/* personagem do vídeo pulando (engraçado) */}
    <g transform={`translate(${200 + Math.sin(t / 5) * 90} ${400 - Math.abs(Math.sin(t / 3)) * 120})`}>
      <ellipse rx={46} ry={40} fill={C.orange} />
      <circle cx={-14} cy={-8} r={7} fill="#1C120E" />
      <circle cx={14} cy={-8} r={7} fill="#1C120E" />
      <path d="M -12 12 Q 0 24 12 12" stroke="#1C120E" strokeWidth={5} fill="none" strokeLinecap="round" />
    </g>
    <rect x={30} y={540} width={340} height={10} rx={5} fill="#FFFFFF" opacity={0.3} />
    <rect x={30} y={540} width={(t % 90) * 3.8} height={10} rx={5} fill={C.orange} />
    <text x={200} y={640} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={44} fill="#FFFFFF">
      😂😂😂
    </text>
  </g>
);

export const MusicaTela: React.FC<{t: number; playing: number}> = ({t, playing}) => (
  <g>
    <rect width={400} height={750} fill="#0D1C3D" />
    <defs>
      <linearGradient id="capa" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor={C.orange} />
        <stop offset="1" stopColor={C.blue} />
      </linearGradient>
    </defs>
    <rect x={50} y={70} width={300} height={300} rx={26} fill="url(#capa)" />
    <text x={200} y={262} textAnchor="middle" fontSize={150} fill="#FFFFFF" fontFamily={FONT}>
      ♪
    </text>
    <rect x={50} y={410} width={230} height={22} rx={11} fill="#FFFFFF" />
    <rect x={50} y={448} width={150} height={16} rx={8} fill="#FFFFFF" opacity={0.45} />
    {/* equalizador */}
    {[0, 1, 2, 3, 4].map((i) => {
      const h = 14 + playing * Math.abs(Math.sin(t * 0.35 + i * 1.3)) * 46;
      return <rect key={i} x={300 + i * 12} y={460 - h} width={8} height={h} rx={3} fill={C.orange} />;
    })}
    <rect x={50} y={510} width={300} height={8} rx={4} fill="#FFFFFF" opacity={0.25} />
    <rect x={50} y={510} width={60 + playing * (t % 60) * 2} height={8} rx={4} fill={C.orange} />
    {/* controles */}
    <path d="M 110 600 L 80 620 L 110 640 Z" fill="#FFFFFF" />
    <rect x={74} y={600} width={6} height={40} fill="#FFFFFF" />
    <circle cx={200} cy={620} r={52} fill={C.orange} />
    {playing > 0.5 ? (
      <g fill="#FFFFFF">
        <rect x={182} y={596} width={13} height={48} rx={4} />
        <rect x={205} y={596} width={13} height={48} rx={4} />
      </g>
    ) : (
      <path d="M 186 594 L 226 620 L 186 646 Z" fill="#FFFFFF" />
    )}
    <path d="M 290 600 L 320 620 L 290 640 Z" fill="#FFFFFF" />
    <rect x={320} y={600} width={6} height={40} fill="#FFFFFF" />
  </g>
);

/** Conversa de grupo genérica; recebe a "foto" como children (400 × 300). */
export const ChatTela: React.FC<{sent: number; ticks: number; children?: React.ReactNode}> = ({sent, ticks, children}) => (
  <g>
    <rect width={400} height={750} fill="#EEF1F6" />
    <rect width={400} height={96} fill={C.blue} />
    <circle cx={52} cy={50} r={28} fill={C.orange} />
    <text x={52} y={62} textAnchor="middle" fontSize={30}>
      🏠
    </text>
    <text x={96} y={46} fontFamily={FONT} fontWeight={700} fontSize={28} fill="#FFFFFF">
      Turma da sala
    </text>
    <text x={96} y={76} fontFamily={FONT} fontWeight={500} fontSize={20} fill="#FFFFFF" opacity={0.8}>
      3 participantes
    </text>
    <rect x={22} y={128} width={230} height={56} rx={22} fill="#FFFFFF" />
    <rect x={42} y={148} width={170} height={14} rx={7} fill="#C5CCD9" />
    <rect x={22} y={198} width={170} height={56} rx={22} fill="#FFFFFF" />
    <rect x={42} y={218} width={110} height={14} rx={7} fill="#C5CCD9" />
    {/* foto enviada */}
    <g transform={`translate(${70 + (1 - sent) * 340} 290)`} opacity={sent > 0 ? 1 : 0}>
      <rect x={0} y={0} width={310} height={300} rx={22} fill="#D8F5C8" />
      <svg x={12} y={12} width={286} height={230} viewBox="0 0 400 320">
        {children}
      </svg>
      <text x={240} y={282} fontFamily={FONT} fontSize={20} fill="#59627E">
        20:15
      </text>
      <path d={`M 276 270 L 283 278 L 296 262`} stroke={ticks > 0.5 ? '#2E9BF0' : '#9AA6C2'} strokeWidth={4} fill="none" strokeLinecap="round" />
      <path d={`M 286 270 L 293 278 L 306 262`} stroke={ticks > 0.5 ? '#2E9BF0' : '#9AA6C2'} strokeWidth={4} fill="none" strokeLinecap="round" />
    </g>
    <rect x={20} y={670} width={300} height={56} rx={28} fill="#FFFFFF" />
    <circle cx={354} cy={698} r={28} fill={C.blue} />
    <path d="M 342 686 L 370 698 L 342 710 Z" fill="#FFFFFF" />
  </g>
);

export const Nota: React.FC<{x: number; y: number; s?: number; color?: string; kind?: number}> = ({x, y, s = 1, color = C.orange, kind = 0}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {kind === 0 ? (
      <g fill={color}>
        <ellipse cx={-10} cy={30} rx={18} ry={13} transform="rotate(-20 -10 30)" />
        <rect x={4} y={-40} width={7} height={70} />
        <path d="M 4 -40 Q 30 -30 34 -6 Q 24 -20 11 -22 Z" />
      </g>
    ) : (
      <g fill={color}>
        <ellipse cx={-26} cy={30} rx={16} ry={12} transform="rotate(-20 -26 30)" />
        <ellipse cx={22} cy={22} rx={16} ry={12} transform="rotate(-20 22 22)" />
        <rect x={-14} y={-36} width={7} height={66} />
        <rect x={34} y={-44} width={7} height={66} />
        <path d="M -14 -36 L 41 -44 L 41 -30 L -14 -22 Z" />
      </g>
    )}
  </g>
);

import React from 'react';

/**
 * Pequeno bairro ilustrado em perspectiva isométrica (representação artística).
 * Grade local 0..520 em x e y; z para cima. Sem nomes de ruas, sem áreas coloridas de cobertura.
 */
export const GRID = 520;
export const PLATE = {cx: 540, top: 990, k: 1}; // posição na tela (mundo) do vértice de cima

const C30 = 0.866;
export const iso = (x: number, y: number, z = 0): [number, number] => [
  PLATE.cx + (x - y) * C30 * PLATE.k,
  PLATE.top + ((x + y) * 0.5 - z) * PLATE.k,
];
const P = (pts: [number, number, number][]) => pts.map(([x, y, z]) => iso(x, y, z).map((v) => v.toFixed(1)).join(' ')).join(' L ');
const poly = (pts: [number, number, number][], fill: string, key?: string | number, extra?: React.SVGProps<SVGPathElement>) => (
  <path key={key} d={`M ${P(pts)} Z`} fill={fill} {...extra} />
);

type Casa = {x: number; y: number; w: number; d: number; h: number; wall: string; wallDark: string; roof: string; roofDark: string; door: string};
export const CASAS: Casa[] = [
  {x: 40, y: 50, w: 120, d: 100, h: 74, wall: '#FFFFFF', wallDark: '#DCD8DA', roof: '#2C4A86', roofDark: '#1F3768', door: '#2C4A86'},
  {x: 340, y: 40, w: 130, d: 100, h: 80, wall: '#F6EEE6', wallDark: '#DDD0C4', roof: '#C2553F', roofDark: '#9E4232', door: '#8C5E38'},
  {x: 40, y: 330, w: 120, d: 110, h: 70, wall: '#EEF2F7', wallDark: '#D2D9E3', roof: '#5A6B8C', roofDark: '#465673', door: '#5A6B8C'},
  // a casa da consulta (frente-direita)
  {x: 360, y: 330, w: 120, d: 110, h: 78, wall: '#FFFFFF', wallDark: '#DCD8DA', roof: '#3E7D7A', roofDark: '#2F6260', door: '#C2553F'},
];
export const CASA_CONSULTA = 3;
/** ponto de frente da casa da consulta (porta), em coordenadas de tela do mundo */
export const portaConsulta = () => {
  const c = CASAS[CASA_CONSULTA];
  return iso(c.x + c.w, c.y + c.d * 0.55, 0);
};

const CasaIso: React.FC<{c: Casa; glow?: number}> = ({c, glow = 0}) => {
  const {x, y, w, d, h} = c;
  const r = 46; // altura do telhado
  const ov = 8; // beiral
  const mid = y + d / 2;
  return (
    <g>
      {/* sombra */}
      {poly([[x + 6, y + d, 0], [x + w + 6, y + d, 0], [x + w + 22, y + d + 18, 0], [x + 22, y + d + 18, 0]], 'rgba(0,0,0,0.10)')}
      {/* parede esquerda-frente (face y = y+d) */}
      {poly([[x, y + d, 0], [x + w, y + d, 0], [x + w, y + d, h], [x, y + d, h]], c.wallDark)}
      {/* parede direita-frente (face x = x+w) com empena */}
      {poly([[x + w, y, 0], [x + w, y + d, 0], [x + w, y + d, h], [x + w, mid, h + r], [x + w, y, h]], c.wall)}
      {/* janelas e porta */}
      {poly([[x + w, y + 14, 22], [x + w, y + 38, 22], [x + w, y + 38, 46], [x + w, y + 14, 46]], glow > 0 ? '#FFD98A' : '#9FC6F0')}
      {poly([[x + w, y + d - 40, 0], [x + w, y + d - 16, 0], [x + w, y + d - 16, 42], [x + w, y + d - 40, 42]], c.door)}
      {poly([[x + 20, y + d, 24], [x + 50, y + d, 24], [x + 50, y + d, 48], [x + 20, y + d, 48]], '#9FC6F0')}
      {poly([[x + 70, y + d, 24], [x + 100, y + d, 24], [x + 100, y + d, 48], [x + 70, y + d, 48]], '#9FC6F0')}
      {/* telhado: duas águas ao longo de x */}
      {poly([[x - ov, mid, h + r], [x + w + ov, mid, h + r], [x + w + ov, y - ov, h - 6], [x - ov, y - ov, h - 6]], c.roofDark)}
      {poly([[x - ov, mid, h + r], [x + w + ov, mid, h + r], [x + w + ov, y + d + ov, h - 6], [x - ov, y + d + ov, h - 6]], c.roof)}
      <path d={`M ${iso(x - ov, mid, h + r).join(' ')} L ${iso(x + w + ov, mid, h + r).join(' ')}`} stroke="#FFFFFF" strokeOpacity={0.35} strokeWidth={3} />
    </g>
  );
};

const Arvore: React.FC<{x: number; y: number; s?: number; f: number}> = ({x, y, s = 1, f}) => {
  const [bx, by] = iso(x, y, 0);
  const sway = Math.sin(f * 0.05 + x) * 2;
  return (
    <g>
      <ellipse cx={bx + 10} cy={by + 4} rx={26 * s} ry={10 * s} fill="rgba(0,0,0,0.12)" />
      <rect x={bx - 5 * s} y={by - 46 * s} width={10 * s} height={46 * s} rx={4} fill="#8C5E38" />
      <circle cx={bx + sway} cy={by - 70 * s} r={30 * s} fill="#5E9E5A" />
      <circle cx={bx - 16 * s + sway} cy={by - 56 * s} r={22 * s} fill="#79B86F" />
      <circle cx={bx + 14 * s + sway} cy={by - 84 * s} r={18 * s} fill="#8FCB84" />
    </g>
  );
};

const Poste: React.FC<{x: number; y: number}> = ({x, y}) => {
  const [bx, by] = iso(x, y, 0);
  return (
    <g>
      <rect x={bx - 3} y={by - 130} width={6} height={130} fill="#7D879C" />
      <rect x={bx - 20} y={by - 126} width={40} height={5} rx={2} fill="#7D879C" />
      <circle cx={bx + 18} cy={by - 118} r={6} fill="#FFE3A3" />
    </g>
  );
};

/** Bairro completo. `glowCasa` destaca apenas a casa da consulta (uma pergunta, não cobertura). */
export const Bairro: React.FC<{f: number; consulta?: number}> = ({f, consulta = 0}) => {
  const T = 34; // espessura da plataforma
  const items: {depth: number; el: React.ReactNode}[] = [];
  CASAS.forEach((c, i) => items.push({depth: c.x + c.w + c.y + c.d, el: <CasaIso key={`c${i}`} c={c} glow={i === CASA_CONSULTA ? consulta : 0} />}));
  [
    [210, 40, 1],
    [490, 220, 0.9],
    [200, 470, 1.1],
    [30, 230, 0.85],
  ].forEach(([x, y, s], i) => items.push({depth: x + y, el: <Arvore key={`a${i}`} x={x} y={y} s={s} f={f} />}));
  [
    [300, 200],
    [200, 320],
  ].forEach(([x, y], i) => items.push({depth: x + y, el: <Poste key={`p${i}`} x={x} y={y} />}));
  items.sort((a, b) => a.depth - b.depth);
  return (
    <g>
      {/* sombra da plataforma */}
      <ellipse cx={PLATE.cx} cy={iso(GRID, GRID)[1] + 40} rx={430} ry={50} fill="rgba(6,26,68,0.15)" />
      {/* laterais da plataforma */}
      {poly([[0, GRID, 0], [GRID, GRID, 0], [GRID, GRID, -T], [0, GRID, -T]], '#7FAE72')}
      {poly([[GRID, 0, 0], [GRID, GRID, 0], [GRID, GRID, -T], [GRID, 0, -T]], '#93C285')}
      {poly([[0, GRID, -T], [GRID, GRID, -T], [GRID, GRID, -T - 14], [0, GRID, -T - 14]], '#C9A27A')}
      {poly([[GRID, 0, -T], [GRID, GRID, -T], [GRID, GRID, -T - 14], [GRID, 0, -T - 14]], '#D8B48D')}
      {/* gramado */}
      {poly([[0, 0, 0], [GRID, 0, 0], [GRID, GRID, 0], [0, GRID, 0]], '#CFE8C4')}
      {/* calçadas/caminhos neutros (sem nomes, sem cores de cobertura) */}
      {poly([[236, 0, 0], [284, 0, 0], [284, GRID, 0], [236, GRID, 0]], '#ECE9EA')}
      {poly([[0, 236, 0], [GRID, 236, 0], [GRID, 284, 0], [0, 284, 0]], '#ECE9EA')}
      {poly([[214, 214, 0], [306, 214, 0], [306, 306, 0], [214, 306, 0]], '#E2DEE0')}
      {items.map((it) => it.el)}
    </g>
  );
};

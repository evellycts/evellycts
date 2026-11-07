import React from 'react';
import {C, lerp} from '../theme';

/**
 * Personagem: jovem adulta, cliente Giganet JP.
 * Origem do desenho = centro do quadril. Escala 1 ≈ 670 px de altura em pé.
 * Braços: [ombro, cotovelo] em graus. 0 = braço solto para baixo;
 * valores positivos abrem o braço para fora do corpo (lado da tela).
 */
export type Arm = [number, number];
export type Pose = {
  x: number;
  y: number;
  s: number;
  lean?: number; // inclinação do tronco (graus)
  bob?: number; // deslocamento vertical do tronco (respiração/antecipação)
  squash?: number; // 1 = normal
  headTilt?: number;
  headTurn?: number; // -1 (olha p/ esquerda) .. 1 (direita)
  lookX?: number; // -1..1 pupilas
  lookY?: number;
  browL?: number; // 0..1 levanta sobrancelha
  browR?: number;
  blink?: number; // 0..1
  mouth?: 'smile' | 'grin' | 'flat' | 'hmm' | 'o';
  armL?: Arm; // braço do lado esquerdo da tela
  armR?: Arm;
  pointL?: boolean;
  pointR?: boolean;
  sit?: number; // 0 em pé .. 1 sentada
  flip?: number; // 1 normal, -1 espelhada (usado no giro da cadeira)
};

const SH_L: [number, number] = [-60, -200];
const UA = 92;
const FA = 86;

const rot = (L: number, deg: number): [number, number] => {
  const r = (deg * Math.PI) / 180;
  return [-L * Math.sin(r), L * Math.cos(r)];
};

/** posição da mão no espaço do mundo (para objetos seguirem a mão) */
export const handPos = (p: Pose, side: 'L' | 'R'): [number, number] => {
  const [a, b] = (side === 'L' ? p.armL : p.armR) ?? [8, 0];
  const u = rot(UA, a);
  const f = rot(FA, a + b);
  let hx = SH_L[0] + u[0] + f[0];
  const hy = SH_L[1] + u[1] + f[1] + (p.bob ?? 0);
  if (side === 'R') hx = -hx;
  // inclinação do tronco em torno do quadril
  const lr = ((p.lean ?? 0) * Math.PI) / 180;
  const rx = hx * Math.cos(lr) - hy * Math.sin(lr);
  const ry = hx * Math.sin(lr) + hy * Math.cos(lr);
  const fl = p.flip ?? 1;
  return [p.x + rx * p.s * fl, p.y + ry * p.s * (p.squash ?? 1)];
};

const ArmShape: React.FC<{arm: Arm; point?: boolean}> = ({arm, point}) => {
  const [a, b] = arm;
  return (
    <g transform={`translate(${SH_L[0]} ${SH_L[1]}) rotate(${a})`}>
      <line x1={0} y1={0} x2={0} y2={UA} stroke={C.blue} strokeWidth={32} strokeLinecap="round" />
      <g transform={`translate(0 ${UA}) rotate(${b})`}>
        <line x1={0} y1={0} x2={0} y2={FA - 14} stroke={C.blue} strokeWidth={28} strokeLinecap="round" />
        <line x1={-13} y1={FA - 22} x2={13} y2={FA - 22} stroke={C.orange} strokeWidth={5} strokeLinecap="round" />
        {point && (
          <rect x={-5} y={FA} width={10} height={30} rx={5} fill={C.skin} />
        )}
        <circle cx={0} cy={FA} r={16} fill={C.skin} />
        <ellipse cx={point ? -10 : -12} cy={FA - 4} rx={6} ry={9} fill={C.skin} transform={`rotate(-20 -12 ${FA - 4})`} />
      </g>
    </g>
  );
};

export const Character: React.FC<{pose: Pose}> = ({pose: p}) => {
  const sit = p.sit ?? 0;
  const lean = p.lean ?? 0;
  const bob = p.bob ?? 0;
  const turn = p.headTurn ?? 0;
  const lx = (p.lookX ?? 0) * 5 + turn * 2;
  const ly = (p.lookY ?? 0) * 5;
  const blink = p.blink ?? 0;
  const eyeS = Math.max(0.08, 1 - blink);
  const bL = (p.browL ?? 0) * 9;
  const bR = (p.browR ?? 0) * 9;
  const fx = turn * 9; // deslocamento dos traços do rosto ao virar a cabeça
  const armL = p.armL ?? [8, 0];
  const armR = p.armR ?? [8, 0];
  const mouth = p.mouth ?? 'smile';

  // pernas: interpola entre em pé e sentada (vista frontal)
  const knee = (sx: number): [number, number] => [sx * lerp(24, 40, sit), lerp(112, 34, sit)];
  const ankle = (sx: number): [number, number] => [sx * lerp(25, 40, sit), lerp(212, 168, sit)];
  const leg = (sx: number) => {
    const k = knee(sx);
    const a = ankle(sx);
    return (
      <g key={sx}>
        <path
          d={`M ${sx * 26} 0 L ${k[0]} ${k[1]} L ${a[0]} ${a[1]}`}
          fill="none"
          stroke={C.pants}
          strokeWidth={lerp(46, 54, sit)}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <ellipse cx={a[0] + sx * 8} cy={a[1] + 20} rx={31} ry={15} fill="#FFFFFF" stroke="#C9CCD6" strokeWidth={3} />
        <rect x={a[0] + sx * 8 - 30} y={a[1] + 26} width={60} height={7} rx={3.5} fill={C.orange} />
      </g>
    );
  };

  return (
    <g transform={`translate(${p.x} ${p.y}) scale(${p.s * (p.flip ?? 1)} ${p.s * (p.squash ?? 1)})`}>
      {/* sombra */}
      <ellipse cx={0} cy={lerp(240, 200, sit)} rx={110} ry={16} fill="#000" opacity={0.12} />
      {leg(-1)}
      {leg(1)}
      <g transform={`rotate(${lean}) translate(0 ${bob})`}>
        {/* cabelo atrás */}
        <g transform={`rotate(${p.headTilt ?? 0} 0 -240)`}>
          <circle cx={-turn * 4} cy={-318} r={72} fill={C.hair} />
          <circle cx={8 - turn * 6} cy={-394} r={34} fill={C.hair} />
          <circle cx={-14 - turn * 6} cy={-384} r={14} fill={C.hair} />
          <ellipse cx={5 - turn * 6} cy={-366} rx={25} ry={9} fill={C.orange} />
        </g>
        {/* capuz */}
        <ellipse cx={0} cy={-214} rx={46} ry={16} fill="#003A8C" />
        {/* tronco – moletom azul */}
        <path
          d="M -58 8 L 58 8 C 64 -60 70 -150 66 -188 Q 62 -214 30 -220 L -30 -220 Q -62 -214 -66 -188 C -70 -150 -64 -60 -58 8 Z"
          fill={C.blue}
        />
        <path d="M -40 -40 Q 0 -54 40 -40 L 44 -6 L -44 -6 Z" fill="#003F97" />
        <rect x={-60} y={-8} width={120} height={18} rx={9} fill="#003A8C" />
        <path d="M -36 -190 Q -48 -120 -30 -70" stroke="#2E6FD1" strokeWidth={6} fill="none" strokeLinecap="round" opacity={0.6} />
        {/* cordões laranja (detalhe) */}
        <line x1={-12} y1={-212} x2={-15} y2={-170} stroke={C.orange} strokeWidth={5} strokeLinecap="round" />
        <line x1={12} y1={-212} x2={15} y2={-166} stroke={C.orange} strokeWidth={5} strokeLinecap="round" />
        {/* pescoço */}
        <rect x={-15} y={-252} width={30} height={40} rx={10} fill={C.skinShade} />
        {/* cabeça */}
        <g transform={`rotate(${p.headTilt ?? 0} 0 -240)`}>
          <circle cx={-58 + fx * 0.3} cy={-300} r={11} fill={C.skinShade} />
          <circle cx={58 + fx * 0.3} cy={-300} r={11} fill={C.skinShade} />
          <ellipse cx={0} cy={-305} rx={60} ry={66} fill={C.skin} />
          {/* franja */}
          <path
            d={`M -63 -312 C -66 -372 -20 -392 12 -386 C 52 -380 70 -350 63 -306 C 48 -344 ${18 + fx} -356 ${-12 + fx} -348 C -34 -342 -52 -330 -63 -312 Z`}
            fill={C.hair}
          />
          {/* bochechas */}
          <ellipse cx={-36 + fx} cy={-278} rx={11} ry={6} fill="#E3735E" opacity={0.35} />
          <ellipse cx={36 + fx} cy={-278} rx={11} ry={6} fill="#E3735E" opacity={0.35} />
          {/* olhos */}
          {[-1, 1].map((sx) => (
            <g key={sx} transform={`translate(${sx * 22 + fx} -301) scale(1 ${eyeS})`}>
              <ellipse cx={0} cy={0} rx={12.5} ry={14} fill="#FFFFFF" />
              <circle cx={lx} cy={ly} r={8.5} fill="#1C120E" />
              <circle cx={lx - 2.6} cy={ly - 3.2} r={2.6} fill="#FFFFFF" />
              <path d="M -13 -6 Q 0 -17 13 -6" stroke="#1C120E" strokeWidth={3.5} fill="none" strokeLinecap="round" />
            </g>
          ))}
          {/* sobrancelhas */}
          <path
            d={`M ${-34 + fx} ${-325 - bL} Q ${-22 + fx} ${-334 - bL * 1.3} ${-10 + fx} ${-327 - bL * 0.6}`}
            stroke={C.hair}
            strokeWidth={5}
            fill="none"
            strokeLinecap="round"
          />
          <path
            d={`M ${10 + fx} ${-327 - bR * 0.6} Q ${22 + fx} ${-334 - bR * 1.3} ${34 + fx} ${-325 - bR}`}
            stroke={C.hair}
            strokeWidth={5}
            fill="none"
            strokeLinecap="round"
          />
          {/* nariz */}
          <path d={`M ${-1 + fx * 1.2} -292 Q ${6 + fx * 1.2} -283 ${-2 + fx * 1.2} -279`} stroke={C.skinShade} strokeWidth={3.5} fill="none" strokeLinecap="round" />
          {/* boca (expressão, sem fala) */}
          <g transform={`translate(${fx} 0)`}>
            {mouth === 'smile' && <path d="M -14 -264 Q 0 -252 14 -264" stroke="#5A2A1C" strokeWidth={4} fill="none" strokeLinecap="round" />}
            {mouth === 'grin' && (
              <g>
                <path d="M -18 -267 Q 0 -242 18 -267 Z" fill="#5A2A1C" />
                <path d="M -14 -266 L 14 -266 L 12 -261 L -12 -261 Z" fill="#FFFFFF" />
              </g>
            )}
            {mouth === 'flat' && <path d="M -10 -262 L 10 -262" stroke="#5A2A1C" strokeWidth={4} strokeLinecap="round" />}
            {mouth === 'hmm' && <path d="M -12 -260 Q 2 -264 13 -268" stroke="#5A2A1C" strokeWidth={4} fill="none" strokeLinecap="round" />}
            {mouth === 'o' && <ellipse cx={0} cy={-262} rx={6} ry={7} fill="#5A2A1C" />}
          </g>
        </g>
        {/* braços */}
        <ArmShape arm={armL} point={p.pointL} />
        <g transform="scale(-1 1)">
          <ArmShape arm={armR} point={p.pointR} />
        </g>
      </g>
    </g>
  );
};

/**
 * Cinemática inversa: devolve [ombro, cotovelo] para a mão chegar ao alvo
 * (coordenadas do mundo). bend = 1 cotovelo para fora, -1 para dentro.
 */
export const ik = (p: Pose, side: 'L' | 'R', target: [number, number], bend = 1): Arm => {
  const fl = p.flip ?? 1;
  let qx = (target[0] - p.x) / (p.s * fl);
  let qy = (target[1] - p.y) / (p.s * (p.squash ?? 1));
  const lr = (-(p.lean ?? 0) * Math.PI) / 180;
  const rx = qx * Math.cos(lr) - qy * Math.sin(lr);
  const ry = qx * Math.sin(lr) + qy * Math.cos(lr);
  qx = rx;
  qy = ry - (p.bob ?? 0);
  if (side === 'R') qx = -qx;
  const vx = qx - SH_L[0];
  const vy = qy - SH_L[1];
  const d = Math.max(Math.abs(UA - FA) + 1, Math.min(UA + FA - 0.5, Math.hypot(vx, vy)));
  const th = Math.atan2(-vx, vy);
  const al = Math.acos((UA * UA + d * d - FA * FA) / (2 * UA * d));
  const be = Math.acos((UA * UA + FA * FA - d * d) / (2 * UA * FA));
  const deg = 180 / Math.PI;
  return [(th + bend * al) * deg, -bend * (180 - be * deg)];
};

/** mistura dois ângulos de braço */
export const mixArm = (a: Arm, b: Arm, t: number): Arm => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];

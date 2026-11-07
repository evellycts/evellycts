import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import {Character, Pose, handPos, ik, mixArm} from '../components/Character';
import {ConnLine, Pt, Track} from '../components/Line';
import {
  CallContent,
  Controller,
  Desk,
  Laptop,
  LoadingRing,
  NotebookBook,
  OfficeChairBack,
  Pencil,
  PinIcon,
  PlayBadge,
  PlayerContent,
  SeriesContent,
  TV,
} from '../components/Props';
import {Room} from '../components/Room';
import {Letters} from '../components/Text';
import {Bubble, BubbleDefs, Bubbles, Contours} from '../components/Decor';
import {C, FONT, ease, easeIn, easeOut, lerp, pop, tw} from '../theme';
import {VO} from '../timeline';

/**
 * CENAS 1, 2 e 3 em um único plano contínuo (frames absolutos 0–420):
 * gancho no quarto → linha desenrola e revela a rotina → Giganet JP.
 */

export const blinkAt = (f: number, list: number[]) =>
  list.reduce((m, b) => Math.max(m, tw(f, [b, b + 2, b + 4], [0, 1, 0], (t) => t)), 0);

// layout do quarto (igual ao da cena 4)
export const SEAT: Pose = {x: 460, y: 1410, s: 1, sit: 1};
export const LAPTOP = {x: 720, y: 1228, w: 330};
export const PLAY_POS: Pt = [720, 1118];
export const DESK = {x0: 500, x1: 1050, top: 1256};

// paradas da linha (mundo)
const STOPS = {
  call: {x: 330, y: 2010, f: VO.reuniao + 6},
  book: {x: 760, y: 2470, f: VO.aula + 1},
  pad: {x: 330, y: 2900, f: VO.partida + 1},
  tv: {x: 690, y: 3290, f: VO.serie},
};
const LOGO_C: Pt = [540, 4560];
const S3_BUB_TOP: Bubble[] = [
  [950, 330, 60],
  [1040, 240, 40],
  [870, 250, 28],
  [1030, 430, 30],
  [900, 450, 18],
  [1060, 340, 20],
];
const S3_BUB_BOTTOM: Bubble[] = [
  [970, 1620, 62],
  [880, 1720, 38],
  [1050, 1530, 34],
  [1040, 1760, 26],
  [890, 1590, 18],
];
const R_CIRCLE = 470;
const circlePts: Pt[] = Array.from({length: 12}, (_, i) => {
  const a = -Math.PI / 2 - (i * Math.PI) / 6; // começa no topo, gira anti-horário
  return [LOGO_C[0] + Math.cos(a) * R_CIRCLE, LOGO_C[1] + Math.sin(a) * R_CIRCLE];
});

const camAt = (f: number) => {
  const cy = tw(
    f,
    [0, 104, 124, 140, 160, 200, 252, 262, 290, 420],
    [1170, 1170, 2150, 2420, 2830, 3240, 3330, 3620, 4560, 4560],
  );
  const cx = tw(f, [0, 104, 124, 290], [640, 640, 540, 540]);
  const z = f < 104 ? tw(f, [0, 100], [1.3, 1.38]) : f < 290 ? tw(f, [104, 124], [1.38, 1.0]) : tw(f, [290, 420], [1.0, 1.04]);
  return {cx, cy, z};
};

const ObjectPop: React.FC<{f: number; at: number; x: number; y: number; children: React.ReactNode}> = ({f, at, x, y, children}) => {
  if (f < at - 1) return null;
  const sp = pop(f, at, 30, 9);
  const burst = tw(f, [at, at + 16], [0, 1], easeOut);
  return (
    <g>
      <circle cx={x} cy={y} r={60 + burst * 220} fill="none" stroke={C.orange} strokeWidth={10 * (1 - burst)} opacity={1 - burst} />
      <g transform={`translate(${x} ${y + (1 - sp) * 50}) rotate(${(1 - sp) * -14}) scale(${(0.2 + 0.8 * sp) * 1.18})`}>{children}</g>
    </g>
  );
};

const posePrimeira = (f: number): Pose => {
  const p: Pose = {...SEAT};
  // ----- corpo
  p.lean = tw(f, [0, 6, 18, 72, 84, 90, 96, 106, 114, 126], [4, 8, 0, 0, -7, 9, 2, 2, -9, -4]);
  p.bob = tw(f, [72, 84, 90, 96], [0, 6, -4, 0]);
  p.squash = tw(f, [72, 84, 90, 98], [1, 0.97, 1.03, 1]);
  // ----- cabeça e olhar
  const ringAng = f * 0.35;
  const follow = tw(f, [10, 16, 36, 42], [0, 1, 1, 0]);
  p.headTurn = tw(f, [0, 42, 52, 62, 70, 110, 124], [0.6, 0.6, 0, 0, 0.6, 0.4, 0.5]);
  p.headTilt = tw(f, [36, 44, 62, 70, 114, 124], [0, -7, -7, 0, 0, 6]);
  p.lookX = lerp(tw(f, [0, 42, 50, 62, 70, 106, 116, 124], [1, 1, 0, 0, 1, 0.2, 0.6, 0.8]), 0.9 + Math.cos(ringAng) * 0.25, follow);
  p.lookY = lerp(tw(f, [0, 106, 116, 124], [0, 0, 0.2, 1]), Math.sin(ringAng) * 0.4, follow);
  p.browR = tw(f, [34, 42, 66, 74], [0, 1, 1, 0]);
  p.browL = tw(f, [34, 42, 66, 74, 94, 100], [0, 0.15, 0.15, -0.2, -0.2, 0.4]);
  p.blink = blinkAt(f, [26, 58, 100]);
  p.mouth = f < 30 ? 'smile' : f < 40 ? 'flat' : f < 70 ? 'hmm' : f < 92 ? 'flat' : 'grin';
  // ----- braços
  const restR: Pt = [600, 1250];
  const restL: Pt = [420, 1398];
  let tR: Pt;
  if (f < 6) tR = [lerp(670, PLAY_POS[0], tw(f, [0, 6], [0, 1], easeIn)), lerp(1160, PLAY_POS[1], tw(f, [0, 6], [0, 1], easeIn))];
  else if (f < 72) tR = [lerp(PLAY_POS[0], restR[0], tw(f, [6, 18], [0, 1])), lerp(PLAY_POS[1], restR[1], tw(f, [6, 18], [0, 1]))];
  else if (f < 86) tR = [lerp(restR[0], 575, tw(f, [72, 84], [0, 1])), lerp(restR[1], 1310, tw(f, [72, 84], [0, 1]))];
  else if (f < 93) tR = [lerp(575, PLAY_POS[0], tw(f, [86, 92], [0, 1], easeIn)), lerp(1310, PLAY_POS[1], tw(f, [86, 92], [0, 1], easeIn))];
  else if (f < 106) tR = [lerp(PLAY_POS[0], 640, tw(f, [93, 104], [0, 1])), lerp(PLAY_POS[1], 1225, tw(f, [93, 104], [0, 1]))];
  else tR = [lerp(640, 585, tw(f, [106, 116], [0, 1], easeOut)), lerp(1225, 1265, tw(f, [106, 116], [0, 1], easeOut))];
  // cotovelo para baixo: o braço nunca passa na frente do rosto
  p.armR = ik(p, 'R', tR, -1);
  const lArm = ik(p, 'L', restL, 1);
  // braço esquerdo acompanha o puxão (equilíbrio)
  p.armL = mixArm(lArm, [55, -60], tw(f, [106, 116], [0, 1]));
  return p;
};

export const Abertura: React.FC = () => {
  const f = useCurrentFrame();
  const cam = camAt(f);
  const pose = posePrimeira(f);
  const hand = handPos(pose, 'R');

  // ---- círculo de carregamento
  const ringIn = pop(f, 8, 30, 12);
  const grabbed = f >= 92;
  const unspool = tw(f, [106, 124], [0, 1], ease);
  const ringPos: Pt = grabbed ? hand : PLAY_POS;
  const ringR = grabbed ? lerp(40, 54, tw(f, [92, 104], [0, 1])) * (1 - unspool * 0.6) : 40;

  // ---- linha
  const way: Pt[] = [
    hand,
    [920, 1430],
    [600, 1900],
    [STOPS.call.x, STOPS.call.y + 190],
    [STOPS.book.x, STOPS.book.y + 175],
    [STOPS.pad.x, STOPS.pad.y + 170],
    [STOPS.tv.x, STOPS.tv.y + 230],
    [930, 3800],
    [740, 4078],
    ...circlePts,
    circlePts[0],
  ];
  const track = new Track(way);
  const u = tw(
    f,
    [106, STOPS.call.f, STOPS.book.f, STOPS.pad.f, STOPS.tv.f, 252, 262, 272, 292],
    [0, 3, 4, 5, 6, 6.15, 7, 9, 22],
    (t) => t,
  );
  const lineFlow = f >= 106;
  // disco branco da marca
  const discR = f < 284 ? 0 : f < 293 ? tw(f, [284, 293], [0, R_CIRCLE], easeOut) : tw(f, [293, 304], [R_CIRCLE, 1500], easeIn);
  const circleScale = discR > R_CIRCLE ? discR / R_CIRCLE : 1;

  // ---- logo
  const logoW = 860;
  const logoH = (logoW * 162) / 500;
  const reveal = tw(f, [294, 314], [0, 1], easeOut);

  // ---- personagem na cena 3
  const f3 = f - 12; // entra só depois que o fundo branco cobre a tela
  const p3: Pose = {x: 300, y: 5130, s: 0.85, sit: 0};
  const walk = tw(f3, [292, 312], [0, 1], easeOut);
  p3.x = lerp(-260, 300, walk);
  p3.bob = f3 < 312 ? -Math.abs(Math.sin(f3 * 0.55)) * 18 : 0;
  p3.lean = tw(f3, [292, 306, 314, 320], [10, 8, -3, 0]);
  p3.squash = tw(f3, [310, 314, 320], [1, 0.96, 1]);
  p3.lookX = tw(f3, [300, 314, 344, 352], [1, 0.7, 0.7, 0]);
  p3.lookY = tw(f3, [300, 314, 344, 352], [0, -1, -1, 0]);
  p3.headTilt = tw(f3, [312, 320, 344, 352], [0, -6, -6, 4]);
  p3.headTurn = tw(f3, [312, 320, 344, 352], [0, 0.3, 0.3, 0]);
  p3.blink = blinkAt(f3, [336, 380]);
  p3.mouth = f3 < 330 ? 'smile' : 'grin';
  p3.browL = tw(f3, [326, 334], [0, 0.5]);
  p3.browR = tw(f3, [326, 334], [0, 0.5]);
  const present = tw(f3, [324, 338], [0, 1], easeOut);
  p3.armR = mixArm([12, -10 + Math.sin(f3 * 0.55) * 20 * (1 - walk)], [150, -22], present);
  p3.armL = mixArm([-8 - Math.sin(f3 * 0.55) * 20 * (1 - walk), 0], [34, -118], tw(f3, [330, 344], [0, 1]));

  // ---- objetos ativos
  const tvPlayPulse = 1 + Math.sin(f * 0.3) * 0.06;

  return (
    <AbsoluteFill style={{background: C.navy}}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <defs>
          <linearGradient id="ab-fade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={C.navy} stopOpacity={0} />
            <stop offset="1" stopColor={C.navy} stopOpacity={1} />
          </linearGradient>
        </defs>
        <g transform={`translate(540 960) scale(${cam.z}) translate(${-cam.cx} ${-cam.cy})`}>
          {/* ---------- CENA 1: quarto (manhã) */}
          {f < 140 && (
            <Room phase={0} id="ab-room">
              <OfficeChairBack x={SEAT.x} y={SEAT.y} />
              <Desk x0={DESK.x0} x1={DESK.x1} top={DESK.top} floor={1600} />
              <Laptop x={LAPTOP.x} y={LAPTOP.y} w={LAPTOP.w}>
                <PlayerContent showPlay={tw(f, [5, 10], [1, 0])} progress={0.06} />
              </Laptop>
              <rect x={800} y={1196} width={80} height={60} rx={10} fill="#FFFFFF" />
              <rect x={872} y={1206} width={20} height={34} rx={10} fill="none" stroke="#FFFFFF" strokeWidth={7} />
              <Character pose={pose} />
            </Room>
          )}
          {/* transição do piso para o fundo azul-escuro */}
          <rect x={-400} y={1700} width={1880} height={500} fill="url(#ab-fade)" />
          <rect x={-400} y={2199} width={1880} height={4000} fill={C.navy} />
          {/* partículas de fundo */}
          {Array.from({length: 40}, (_, i) => (
            <circle key={i} cx={(i * 263) % 1080} cy={2000 + ((i * 397) % 3400)} r={3 + (i % 3)} fill="#2E6FD1" opacity={0.35} />
          ))}

          {/* ---------- CENA 2: objetos da rotina */}
          <ObjectPop f={f} at={STOPS.call.f} x={STOPS.call.x} y={STOPS.call.y}>
            <Laptop x={0} y={95} w={300}>
              <CallContent t={f / 12} />
            </Laptop>
          </ObjectPop>
          <ObjectPop f={f} at={STOPS.book.f} x={STOPS.book.x} y={STOPS.book.y}>
            <g transform="scale(0.85)">
              <NotebookBook lines={tw(f, [STOPS.book.f + 6, STOPS.book.f + 40], [0, 1])} />
            </g>
            <g transform={`translate(${70 + Math.sin(f * 0.6) * 10} ${-30}) rotate(28)`}>
              <Pencil />
            </g>
          </ObjectPop>
          <ObjectPop f={f} at={STOPS.pad.f} x={STOPS.pad.x} y={STOPS.pad.y}>
            <g transform={`rotate(${Math.sin(f * 0.4) * 4}) scale(0.85)`}>
              <Controller />
            </g>
          </ObjectPop>
          <ObjectPop f={f} at={STOPS.tv.f} x={STOPS.tv.x} y={STOPS.tv.y}>
            <rect x={-236} y={-140} width={472} height={280} rx={22} fill="none" stroke="#2E6FD1" strokeWidth={6} />
            <TV x={0} y={0} w={440}>
              <rect width={400} height={250} fill="#13306B" />
              <g transform={`translate(200 125) scale(${tvPlayPulse})`}>
                <PlayBadge r={52} />
              </g>
            </TV>
          </ObjectPop>

          {/* ---------- linha */}
          {lineFlow && (
            <g>
              <ConnLine track={track} from={0} to={Math.min(u, 9)} head={u < 9} width={18} pulses={[3, 4, 5, 6].filter((k) => u >= k)} />
              {u > 9 && (
                <g transform={`translate(${LOGO_C[0]} ${LOGO_C[1]}) scale(${circleScale}) translate(${-LOGO_C[0]} ${-LOGO_C[1]})`}>
                  <circle cx={LOGO_C[0]} cy={LOGO_C[1]} r={Math.min(discR, R_CIRCLE)} fill="#FFFFFF" />
                  <ConnLine track={track} from={9} to={u} width={18} head={u < 22} />
                </g>
              )}
            </g>
          )}

          {/* ---------- círculo de carregamento */}
          {f >= 8 && unspool < 1 && (
            <g transform={`translate(${ringPos[0]} ${ringPos[1]}) scale(${(grabbed ? 1 : ringIn) * (ringR / 40)})`}>
              <LoadingRing r={40} angle={f * 20} arc={0.72 * (1 - unspool)} w={12} />
            </g>
          )}

          {/* "Logo agora?" */}
          {f >= 40 && f < 100 && (
            <g transform={`translate(${700} ${955}) scale(${pop(f, 40, 30, 10) * tw(f, [88, 96], [1, 0])})`}>
              <rect x={-150} y={-44} width={300} height={80} rx={40} fill="#FFFFFF" />
              <path d="M -10 34 L 10 34 L -14 60 Z" fill="#FFFFFF" />
              <text x={0} y={12} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={40} fill={C.blue}>
                Logo agora?
              </text>
            </g>
          )}

          {/* ---------- CENA 3: marca */}
          {f >= 302 && (
            <g>
              <Character pose={p3} />
            </g>
          )}
        </g>
      </svg>
      {/* João Pessoa – texto de apoio */}
      {f >= VO.joaoPessoa - 4 && (
        <div style={{position: 'absolute', left: 0, right: 0, top: 1062, display: 'flex', justifyContent: 'center'}}>
          <div style={{position: 'relative', display: 'flex', alignItems: 'center', gap: 14}}>
            <svg width={44} height={60} viewBox="-26 -36 52 70" style={{transform: `scale(${pop(f, VO.joaoPessoa - 4)})`}}>
              <PinIcon />
            </svg>
            <div style={{position: 'relative', width: 340, height: 64}}>
              <Letters text="João Pessoa" start={VO.joaoPessoa - 2} size={54} color={C.blue} style={{left: 0, top: 0}} />
            </div>
          </div>
        </div>
      )}
      {/* elementos da arte da marca */}
      {f >= 296 && (
        <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', left: 0, top: 0}}>
          <BubbleDefs id="s3" />
          <Contours cx={-30} cy={290} r0={110} n={9} f={f} start={300} opacity={0.55} seed={1} />
          <Contours cx={1120} cy={1880} r0={130} n={9} f={f} start={308} color={C.blue} opacity={0.28} seed={3} />
          <Bubbles id="s3" list={S3_BUB_TOP} f={f} start={302} />
          <Bubbles id="s3" list={S3_BUB_BOTTOM} f={f} start={314} />
        </svg>
      )}
      {/* logo original (proporção preservada), revelada por máscara */}
      {f >= 290 && (
        <Img
          src={staticFile('logo-giganet.png')}
          style={{
            position: 'absolute',
            width: logoW * cam.z,
            height: logoH * cam.z,
            left: 540 + (540 - logoW / 2 - cam.cx) * cam.z,
            top: 960 + (4440 - logoH / 2 - cam.cy) * cam.z + (1 - reveal) * 24,
            transform: `scale(${0.94 + 0.06 * reveal})`,
            clipPath: `inset(-2% ${50 * (1 - reveal)}% -2% ${50 * (1 - reveal)}%)`,
          }}
        />
      )}
    </AbsoluteFill>
  );
};

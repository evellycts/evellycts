import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Character, LOOKS, Pose, handPos, ik, mixArm} from '../components/Character';
import {Pt, Track} from '../components/Line';
import {DOOR, DoorLeaf, FLOOR, MesaCentro, Phone, Sala, SEATS, SOFA, SofaBack, SofaFront} from '../components/Sala';
import {C, FONT, ease, easeIn, easeOut, lerp, pop, tw} from '../theme';
import {VO} from '../timeline';

/** CENAS 1 e 2 — a pergunta na porta e o "antes mesmo de sentar" (frames 0–170). */

export const blinkAt = (f: number, list: number[]) =>
  list.reduce((m, b) => Math.max(m, tw(f, [b, b + 2, b + 4], [0, 1, 0], (t) => t)), 0);

export const WifiIcon: React.FC<{c?: string; q?: boolean}> = ({c = C.blue, q}) => (
  <g>
    {[70, 46, 22].map((r, i) => (
      <path key={i} d={`M ${-r} ${-r * 0.2} A ${r * 1.1} ${r * 1.1} 0 0 1 ${r} ${-r * 0.2}`} fill="none" stroke={c} strokeWidth={14} strokeLinecap="round" opacity={q ? 0.35 + i * 0.2 : 1} />
    ))}
    <circle cx={0} cy={14} r={10} fill={c} />
    {q && (
      <text x={60} y={-30} fontFamily={FONT} fontWeight={800} fontSize={70} fill={C.orange}>
        ?
      </text>
    )}
  </g>
);

const cam = (f: number) => ({
  cx: tw(f, [0, 26, 38, 52, 80, 170], [430, 430, 540, 540, 1075, 1085]),
  cy: tw(f, [0, 26, 38, 52, 80, 170], [1120, 1120, 1040, 1040, 1090, 1095]),
  z: tw(f, [0, 26, 38, 52, 80, 170], [1.12, 1.12, 1.5, 1.5, 0.57, 0.59]),
});

const posVisita = (f: number): Pose => {
  const p: Pose = {x: 285, y: 1348, s: 1.04, sit: 0, look: LOOKS.visita};
  p.mouth = f < 118 ? 'grin' : 'smile';
  p.headTilt = tw(f, [0, 10, 80, 92, 118, 126], [0, 6, 6, 10, 10, -4]);
  p.headTurn = tw(f, [0, 10, 80, 92, 118, 126], [0, 0.35, 0.35, 0, 0, 0.45]);
  p.lookX = tw(f, [0, 10, 80, 92, 118, 126], [0, 0.8, 0.8, 0.2, 0.2, 1]);
  p.lookY = tw(f, [80, 92, 118, 126], [0, 0.9, 0.9, 0]);
  p.browL = tw(f, [0, 8, 118, 124], [0, 0.6, 0.6, 1]);
  p.browR = p.browL;
  p.blink = blinkAt(f, [40, 100, 140]);
  p.lean = tw(f, [0, 6, 14], [0, -4, 3]);
  p.bob = Math.sin(f * 0.2) * 1.5;
  // celular erguido, pronto para digitar a senha
  const phone: Pt = [345 + Math.sin(f * 0.9) * (f > 92 && f < 118 ? 2 : 0), 1170];
  p.armR = ik(p, 'R', phone, -1);
  // aceno de "oi" ao abrir a porta
  const wave = tw(f, [6, 12, 30, 38], [0, 1, 1, 0]);
  p.armL = mixArm([10, -8], [150, -30 + Math.sin(f * 0.7) * 25], wave);
  return p;
};

const posAnfitria = (f: number): Pose => {
  const p: Pose = {x: 650, y: 1358, s: 1, sit: 0, look: LOOKS.anfitria};
  // abre a porta, recebe a visita
  p.headTurn = tw(f, [0, 40, 46, 54, 62, 118, 126], [-0.5, -0.5, 0, 0, 0.6, 0.6, -0.5]);
  p.lookX = tw(f, [0, 40, 46, 54, 62, 118, 126], [-1, -1, 0, 0, 1, 1, -1]);
  p.headTilt = tw(f, [22, 28, 46, 54, 118, 126], [0, 8, 8, 0, 0, -6]);
  // a reação: sobrancelha levantada
  p.browL = tw(f, [22, 27, 50, 56], [0, 1.2, 1.2, 0]);
  p.browR = tw(f, [22, 27, 50, 56, 118, 124], [0, -0.3, -0.3, 0, 0, 0.6]);
  p.mouth = f < 22 ? 'smile' : f < 56 ? 'hmm' : f < 118 ? 'smile' : 'grin';
  p.blink = blinkAt(f, [16, 70]) || (f > 126 && f < 146 ? 0.7 : 0);
  // risada no fim
  const laugh = tw(f, [124, 130], [0, 1]);
  p.bob = Math.sin(f * 0.9) * 5 * laugh;
  p.lean = tw(f, [56, 62, 70, 118, 126], [0, -4, 6, 6, -2]);
  p.squash = tw(f, [56, 62, 68], [1, 0.97, 1.02]);
  // recebe a visita com a mão aberta, depois baixa o braço
  const welcome = tw(f, [0, 8, 22, 32], [0.4, 1, 1, 0], ease);
  p.armL = mixArm([10, -8], [58, -42], welcome);
  // aponta o sofá (com antecipação)
  const point = tw(f, [58, 64, 70], [0, -0.25, 1], ease) * tw(f, [116, 124], [1, 0]);
  p.armR = mixArm([10, -6], [96, 4], point);
  p.pointR = point > 0.6;
  if (laugh > 0) p.armR = mixArm(p.armR, [30, -110], laugh);
  return p;
};

const posAmiga = (f: number): Pose => {
  const p: Pose = {x: SEATS.amiga, y: SOFA.seat, s: 0.96, sit: 1, look: LOOKS.amiga};
  p.headTurn = -0.6;
  p.lookX = -1;
  p.mouth = f > 118 ? 'grin' : 'smile';
  p.blink = blinkAt(f, [74, 132]);
  const wave = tw(f, [84, 90, 108, 114], [0, 1, 1, 0]);
  p.armL = mixArm([20, -40], [150, -40 + Math.sin(f * 0.8) * 25], wave);
  p.armR = [20, -60];
  p.bob = Math.sin(f * 0.9) * 3 * tw(f, [124, 130], [0, 1]);
  return p;
};

export const Porta: React.FC = () => {
  const f = useCurrentFrame();
  const c = cam(f);
  const doorOpen = tw(f, [0, 3, 14], [0, 0.06, 1], easeOut);
  const vis = posVisita(f);
  const host = posAnfitria(f);
  const hand = handPos(vis, 'R');

  // caminho pontilhado até o sofá
  const path = new Track([[300, FLOOR + 40], [700, FLOOR + 110], [1100, FLOOR + 30], [SEATS.visita, SOFA.seat + 20]], false, 30);
  const pathU = tw(f, [78, 112], [0, path.max], ease);

  // transição: a porta fecha sobre a tela
  const wipe = tw(f, [146, 157], [-1120, 0], easeIn);
  const wipe2 = f >= 157 ? tw(f, [157, 169], [0, 1120], easeOut) : wipe;

  return (
    <AbsoluteFill style={{background: f >= 157 ? 'transparent' : '#ECE9EA'}}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <g transform={`translate(540 960) scale(${c.z}) translate(${-c.cx} ${-c.cy})`} opacity={f >= 157 ? 0 : 1}>
          <Sala f={f}>
            <SofaBack />
            <Character pose={posAmiga(f)} />
            <SofaFront />
            <MesaCentro />
            {/* visita na porta */}
            <Character pose={vis} />
            <Phone x={hand[0]} y={hand[1] - 34} rot={-6} s={1.04}>
              <g transform="translate(200 330)">
                <WifiIcon q />
              </g>
            </Phone>
            <DoorLeaf open={doorOpen} />
            <Character pose={host} />
            {/* caminho pontilhado */}
            {f >= 78 && (
              <g>
                <path d={path.d(0, pathU)} fill="none" stroke={C.orange} strokeWidth={26} strokeLinecap="round" strokeDasharray="2 46" />
                {pathU >= path.max - 0.01 && (
                  <g transform={`translate(${SEATS.visita} ${SOFA.seat - 10})`}>
                    <circle r={70 + ((f - 112) % 24) * 3} fill="none" stroke={C.orange} strokeWidth={8} opacity={1 - ((f - 112) % 24) / 24} />
                    <circle r={22} fill={C.orange} />
                  </g>
                )}
              </g>
            )}
            {/* balão da pergunta */}
            {f >= VO.senha + 2 && f < 66 && (
              <g transform={`translate(${470} ${820}) scale(${pop(f, VO.senha + 2, 30, 10) * tw(f, [56, 66], [1, 0])})`}>
                <path d="M -110 92 L -170 160 L -40 92 Z" fill="#FFFFFF" />
                <rect x={-250} y={-100} width={500} height={200} rx={50} fill="#FFFFFF" />
                <text x={0} y={-12} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={54} fill={C.blue}>
                  Qual é a senha
                </text>
                <text x={0} y={52} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={54} fill={C.blue}>
                  do Wi-Fi?
                </text>
              </g>
            )}
            {/* marcação de surpresa sobre a anfitriã */}
            {f >= 24 && f < 52 && (
              <g transform={`translate(${745} ${965}) scale(${pop(f, 24, 30, 8) * tw(f, [44, 52], [1, 0])})`}>
                {[-40, 0, 40].map((a, i) => (
                  <line key={i} x1={0} y1={0} x2={Math.sin((a * Math.PI) / 180) * 50} y2={-Math.cos((a * Math.PI) / 180) * 50} stroke={C.orange} strokeWidth={9} strokeLinecap="round" transform={`translate(${Math.sin((a * Math.PI) / 180) * 20} ${-Math.cos((a * Math.PI) / 180) * 20})`} />
                ))}
              </g>
            )}
          </Sala>
        </g>
        {/* porta que vira transição */}
        {f >= 146 && (
          <g transform={`translate(${wipe2} 0)`}>
            <rect x={0} y={-20} width={1080} height={1960} fill="#2D5DB8" />
            <rect x={90} y={180} width={900} height={640} rx={30} fill="#2552A8" />
            <rect x={90} y={900} width={900} height={860} rx={30} fill="#2552A8" />
            <circle cx={140} cy={1000} r={34} fill={C.orange} />
            <rect x={1040} y={-20} width={40} height={1960} fill="#1D4794" />
          </g>
        )}
      </svg>
      {/* texto de apoio */}
      {f >= 40 && f < 128 && (
        <div style={{position: 'absolute', top: 270, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
          <div
            style={{
              background: C.blue,
              color: '#FFFFFF',
              fontFamily: FONT,
              fontWeight: 700,
              fontSize: 44,
              padding: '14px 34px',
              borderRadius: 50,
              transform: `scale(${pop(f, 40, 30, 11)}) translateY(${tw(f, [118, 128], [0, -30])}px)`,
              opacity: tw(f, [118, 128], [1, 0]),
              boxShadow: '0 14px 30px rgba(0,0,0,0.18)',
            }}
          >
            Você conhece alguém assim? 👀
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};
void DOOR;
void lerp;

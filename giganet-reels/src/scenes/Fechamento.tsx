import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import {Character, Pose, ik, mixArm} from '../components/Character';
import {ConnLine, Pt, Track} from '../components/Line';
import {PinIcon, WhatsIcon} from '../components/Props';
import {Room} from '../components/Room';
import {Reveal} from '../components/Text';
import {C, FONT, ease, easeIn, easeOut, lerp, pop, tw} from '../theme';
import {SCENES, VO} from '../timeline';
import {blinkAt} from './Abertura';
import {NightRoomFurniture} from './DiaNoite';

/**
 * CENAS 5, 6 e 7 (f600 → fim). Frame local g = f - 600.
 *  K = g          casa (zoom out, linha percorre os cômodos)
 *  J = g - 93     contato (linha sai da casa e vira moldura)
 *  E = g - 230    assinatura
 */
const G0 = SCENES.casa;
const J0 = SCENES.contato - G0; // 93
const E0 = SCENES.assinatura - G0; // 230

// ---------- geometria da casa (coordenadas finais na tela)
const CW = 302;
const CH = 537;
const KS = CW / 1080; // escala do cômodo dentro da casa
const CELL = {
  TL: [136, 640] as Pt,
  TR: [454, 640] as Pt,
  BL: [136, 1193] as Pt,
  BR: [454, 1193] as Pt,
};
const GROUND = 1746;
const APEX: Pt = [454, 400];

const DEV = {
  router: [136 + 900 * KS, 1193 + 1416 * KS] as Pt,
  tv: [136 + 760 * KS, 1193 + 800 * KS] as Pt,
  tablet: [286, 1060] as Pt,
  monitor: [604, 970] as Pt,
  phone: [654, 1578] as Pt,
};
/**
 * Fibra óptica na casa, como uma instalação real:
 * chega da rua por baixo do chão, sobe por dentro da parede central (x = 446)
 * e sai em ramais retos até cada aparelho.
 */
const WALL_X = 446;
const FIBER_Y = 1764; // eletroduto sob a calçada
const TOP_Y = 960;
const seg = (a: Pt, b: Pt, n: number): Pt[] =>
  Array.from({length: n}, (_, k) => [lerp(a[0], b[0], k / n), lerp(a[1], b[1], k / n)] as Pt);
const N_H = 30;
const N_V = 40;
const trunk = new Track(
  [...seg([-140, FIBER_Y], [WALL_X, FIBER_Y], N_H), ...seg([WALL_X, FIBER_Y], [WALL_X, TOP_Y], N_V), [WALL_X, TOP_Y]],
  false,
  1,
);
/** índice do tronco quando ele passa na altura y */
const trunkIdx = (y: number) => N_H + ((FIBER_Y - y) / (FIBER_Y - TOP_Y)) * N_V;
const FIB_START = 12;
const FIB_END = 46;
const trunkFrame = (idx: number) => FIB_START + (idx / trunk.max) * (FIB_END - FIB_START);

type Branch = {y: number; pts: Pt[]; dev: Pt};
const RAW_BRANCHES: Branch[] = [
  {y: 1592, pts: [[WALL_X, 1592], [DEV.router[0] + 18, 1592]], dev: DEV.router},
  // passa acima da geladeira e desce até o celular
  {y: 1398, pts: [[WALL_X, 1398], [DEV.phone[0], 1398], [DEV.phone[0], 1522]], dev: DEV.phone},
  {y: 1417, pts: [[WALL_X, 1417], [DEV.tv[0] + 66, 1417]], dev: DEV.tv},
  {y: 1056, pts: [[WALL_X, 1056], [DEV.tablet[0] + 36, 1056]], dev: DEV.tablet},
  {y: 966, pts: [[WALL_X, 966], [DEV.monitor[0] - 62, 966]], dev: DEV.monitor},
];
const BRANCHES: Branch[] = RAW_BRANCHES.map((b) => ({...b, pts: b.pts.length === 2 ? seg(b.pts[0], b.pts[1], 12).concat([b.pts[1]]) : [...seg(b.pts[0], b.pts[1], 12), ...seg(b.pts[1], b.pts[2], 8), b.pts[2]]}));
const branchTracks = BRANCHES.map((b) => new Track(b.pts, false, 1));
const branchStart = BRANCHES.map((b) => trunkFrame(trunkIdx(b.y)));

// ---------- moldura do contato
const CARD = {x: 100, y: 330, w: 720, h: 640, r: 64};
const roundedRect = (x: number, y: number, w: number, h: number, r: number): Pt[] => {
  const pts: Pt[] = [];
  const arc = (cx: number, cy: number, a0: number, a1: number) => {
    for (let i = 0; i <= 10; i++) {
      const a = a0 + ((a1 - a0) * i) / 10;
      pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
    }
  };
  pts.push([x, y + h - r]);
  arc(x + r, y + r, Math.PI, Math.PI * 1.5);
  arc(x + w - r, y + r, -Math.PI / 2, 0);
  arc(x + w - r, y + h - r, 0, Math.PI / 2);
  arc(x + r, y + h - r, Math.PI / 2, Math.PI);
  return pts;
};

// ---------- play final
const PLAY = {
  a: [470, 318] as Pt,
  b: [470, 482] as Pt,
  c: [614, 400] as Pt,
};
const densify = (pts: Pt[], n = 14): Pt[] => {
  const out: Pt[] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    for (let k = 0; k < n; k++) {
      const t = k / n;
      out.push([lerp(pts[i][0], pts[i + 1][0], t), lerp(pts[i][1], pts[i + 1][1], t)]);
    }
  }
  out.push(pts[pts.length - 1]);
  return out;
};
const playLead = new Track([[-60, 560], [160, 470], [330, 300], PLAY.a], false, 18);
const playTri = new Track(densify([PLAY.a, PLAY.c, PLAY.b, PLAY.a]), false, 1);

const OtherRooms: React.FC<{g: number}> = ({g}) => {
  const glow = 0.85 + Math.sin(g * 0.2) * 0.1;
  const cellBg = (p: Pt, key: string, warm = '#2E4178') => (
    <g key={key}>
      <rect x={p[0]} y={p[1]} width={CW} height={CH} fill={warm} />
      <rect x={p[0]} y={p[1] + CH - 70} width={CW} height={70} fill="#1B2850" />
      <circle cx={p[0] + CW / 2} cy={p[1] + 120} r={150} fill="#FFD98A" opacity={0.12} />
      <line x1={p[0] + CW / 2} y1={p[1]} x2={p[0] + CW / 2} y2={p[1] + 70} stroke="#59627E" strokeWidth={4} />
      <path d={`M ${p[0] + CW / 2 - 30} ${p[1] + 96} L ${p[0] + CW / 2 + 30} ${p[1] + 96} L ${p[0] + CW / 2 + 18} ${p[1] + 70} L ${p[0] + CW / 2 - 18} ${p[1] + 70} Z`} fill="#FFE3A3" />
    </g>
  );
  const [tl, tr, br] = [CELL.TL, CELL.TR, CELL.BR];
  return (
    <g>
      {/* quarto */}
      {cellBg(tl, 'tl', '#33467E')}
      <rect x={tl[0] + 30} y={tl[1] + 150} width={110} height={130} rx={14} fill="#0D1B4D" stroke="#FFFFFF" strokeWidth={8} />
      <circle cx={tl[0] + 70} cy={tl[1] + 190} r={16} fill="#F4F1E8" />
      <rect x={tl[0] + 40} y={tl[1] + 360} width={230} height={40} rx={16} fill="#5B6FA8" />
      <rect x={tl[0] + 40} y={tl[1] + 396} width={230} height={70} rx={12} fill="#ECE9EA" />
      <rect x={tl[0] + 50} y={tl[1] + 380} width={70} height={30} rx={12} fill={C.orange} />
      <rect x={DEV.tablet[0] - 36} y={DEV.tablet[1] - 30} width={72} height={52} rx={8} fill="#0B1733" />
      <rect x={DEV.tablet[0] - 30} y={DEV.tablet[1] - 24} width={60} height={40} rx={5} fill="#7DB7FF" opacity={glow} />
      {/* escritório */}
      {cellBg(tr, 'tr', '#2B3E78')}
      <rect x={tr[0] + 40} y={tr[1] + 380} width={230} height={18} rx={6} fill="#C98E5A" />
      <rect x={tr[0] + 60} y={tr[1] + 398} width={14} height={70} fill="#8C5E38" />
      <rect x={tr[0] + 236} y={tr[1] + 398} width={14} height={70} fill="#8C5E38" />
      <rect x={DEV.monitor[0] - 62} y={DEV.monitor[1] - 46} width={124} height={84} rx={8} fill="#0B1733" />
      <rect x={DEV.monitor[0] - 54} y={DEV.monitor[1] - 38} width={108} height={66} rx={5} fill="#7DB7FF" opacity={glow} />
      <rect x={DEV.monitor[0] - 6} y={DEV.monitor[1] + 38} width={12} height={34} fill="#0B1733" />
      <rect x={tr[0] + 200} y={tr[1] + 160} width={70} height={90} rx={8} fill="#5BC0EB" opacity={0.6} />
      {/* cozinha */}
      {cellBg(br, 'br', '#30437C')}
      <rect x={br[0] + 20} y={br[1] + 220} width={76} height={247} rx={10} fill="#DCE2EE" />
      <line x1={br[0] + 30} y1={br[1] + 300} x2={br[0] + 86} y2={br[1] + 300} stroke="#9AA6C2" strokeWidth={4} />
      <rect x={br[0] + 110} y={br[1] + 400} width={180} height={67} rx={6} fill="#C98E5A" />
      <rect x={br[0] + 104} y={br[1] + 392} width={192} height={14} rx={5} fill="#ECE9EA" />
      <rect x={DEV.phone[0] - 16} y={DEV.phone[1] - 52} width={32} height={56} rx={7} fill="#0B1733" />
      <rect x={DEV.phone[0] - 12} y={DEV.phone[1] - 47} width={24} height={44} rx={4} fill="#7DB7FF" opacity={glow} />
      <rect x={br[0] + 140} y={br[1] + 330} width={36} height={60} rx={6} fill={C.orange} />
    </g>
  );
};

const House: React.FC<{g: number; pulses: number[]}> = ({g, pulses}) => {
  const [bl] = [CELL.BL];
  return (
    <g>
      {/* telhado */}
      <path d={`M 84 652 L ${APEX[0]} ${APEX[1]} L 824 652 Z`} fill="#0F2A66" stroke="#0A1E4D" strokeWidth={6} strokeLinejoin="round" />
      <path d={`M 64 660 L ${APEX[0]} ${APEX[1] - 26} L 844 660`} fill="none" stroke={C.orange} strokeWidth={22} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={APEX[0]} cy={540} r={44} fill="#FFD98A" opacity={0.85} />
      <circle cx={APEX[0]} cy={540} r={44} fill="none" stroke="#FFFFFF" strokeWidth={8} />
      {/* paredes */}
      <rect x={120} y={624} width={668} height={GROUND - 624 + 2} fill="#ECE9EA" />
      <OtherRooms g={g} />
      {/* sala = o mesmo cômodo da cena 4 */}
      <svg x={bl[0]} y={bl[1]} width={CW} height={CH} viewBox="0 0 1080 1920">
        <Room phase={1} id="s5-room" lamp={1}>
          <NightRoomFurniture L={g + 204} />
        </Room>
      </svg>
      <rect x={438} y={624} width={16} height={GROUND - 624} fill="#ECE9EA" />
      <rect x={120} y={1177} width={668} height={16} fill="#ECE9EA" />
      {/* fibra: tronco na parede central + ramais até os aparelhos */}
      <ConnLine track={trunk} to={tw(g, [FIB_START, FIB_END], [0, trunk.max], (t) => t)} width={12} head={g < FIB_END} pulses={g > FIB_END ? pulses.map((q) => q % trunk.max) : []} />
      {branchTracks.map((bt, i) => {
        const st = branchStart[i];
        if (g < st) return null;
        const u = tw(g, [st, st + 7], [0, bt.max], easeOut);
        const done = g - (st + 7);
        const ring = done > 0 ? (done / 24) % 1 : -1;
        const d = BRANCHES[i].dev;
        return (
          <g key={i}>
            <ConnLine track={bt} to={u} width={10} head={u < bt.max} pulses={done > 0 ? [((done * 0.5) % 1) * bt.max] : []} />
            {ring >= 0 && (
              <circle cx={d[0]} cy={d[1]} r={18 + ring * 44} fill="none" stroke={C.orange} strokeWidth={5 * (1 - ring)} opacity={1 - ring} />
            )}
          </g>
        );
      })}
    </g>
  );
};

export const Fechamento: React.FC = () => {
  const g = useCurrentFrame();
  const J = g - J0;
  const E = g - E0;

  // ---------- zoom out (cena 5)
  const zt = tw(g, [0, 34], [0, 1], ease);
  const Z0 = 1 / KS;
  const sc = Math.pow(Z0, 1 - zt);
  const wgt = (Z0 - sc) / (Z0 - 1);
  const o: Pt = [CELL.BL[0] * wgt, CELL.BL[1] * wgt];
  // na cena 6 a casa recua
  const hs = tw(J, [0, 32], [1, 0.52], ease);
  const hFade = tw(J, [0, 32], [1, 0.4]) * tw(E, [0, 14], [1, 0]);
  const houseT = `translate(${o[0] - CELL.BL[0] * sc} ${o[1] - CELL.BL[1] * sc}) scale(${sc}) translate(454 ${GROUND}) scale(${hs}) translate(-454 ${-GROUND})`;

  const pulses = g > FIB_END ? [0, 1, 2].map((i) => (g - FIB_END) * 0.9 + i * (trunk.max / 3)) : [];

  // ---------- moldura (cena 6)
  const apexY = GROUND - (GROUND - APEX[1]) * hs;
  const frameTrack = new Track(
    [
      ...new Track([[APEX[0], apexY - 20], [330, 1160], [CARD.x, CARD.y + CARD.h - CARD.r]], false, 16).pts,
      ...roundedRect(CARD.x, CARD.y, CARD.w, CARD.h, CARD.r),
    ],
    false,
    1,
  );
  const frameU = tw(J, [0, 30], [0, frameTrack.max], ease);
  const leadLen = 32;
  const frameFrom = tw(J, [24, 40], [0, leadLen]);
  const cardIn = tw(J, [22, 32], [0, 1], easeOut);

  // ---------- expansão (cena 7)
  const ex = tw(E, [0, 16], [0, 1], ease);
  const card = {
    x: lerp(CARD.x, -60, ex),
    y: lerp(CARD.y, -60, ex),
    w: lerp(CARD.w, 1200, ex),
    h: lerp(CARD.h, 2040, ex),
    r: lerp(CARD.r, 0, ex),
  };
  const contentOut = tw(E, [0, 8], [1, 0]);

  // ---------- personagem (camada da frente, com paralaxe)
  const p: Pose = {x: 460, y: 1368, s: 1, sit: 0};
  p.x = lerp(460, 880, zt);
  p.y = lerp(1368, 1480, zt);
  p.s = lerp(1, 0.7, zt);
  const e7 = tw(E, [0, 20], [0, 1], ease);
  p.x = lerp(p.x, 880, e7);
  p.y = lerp(p.y, 1590, e7);
  p.s = lerp(p.s, 0.66, e7);
  p.blink = blinkAt(g, [20, 70, 120, 190, 262, 320, 370]);
  p.mouth = 'grin';
  // convite (cena 5)
  const inv = tw(g, [26, 40], [0, 1], easeOut) * tw(J, [10, 24], [1, 0]);
  const beck = Math.sin(Math.max(0, g - 40) * 0.45) * 22 * tw(g, [40, 48], [0, 1]);
  p.lean = lerp(0, 4, inv);
  p.headTilt = lerp(0, -6, inv);
  p.armL = mixArm([10, -6], [62, -22], inv);
  p.armR = mixArm([10, -6], [132, -62 + beck], inv);
  p.browL = 0.4 * inv;
  p.browR = 0.4 * inv;
  // aponta para a moldura (cena 6)
  const pt = tw(J, [18, 32], [0, 1], easeOut) * tw(E, [0, 12], [1, 0]);
  const pointArm = ik(p, 'L', [640, 1060], 1);
  p.armL = mixArm(p.armL, pointArm, pt);
  p.pointL = pt > 0.5;
  p.lookX = lerp(0, -0.8, pt * tw(J, [32, 40, 86, 96], [0, 1, 1, 0]));
  p.lookY = lerp(0, -0.9, pt * tw(J, [32, 40, 86, 96], [0, 1, 1, 0]));
  p.headTurn = lerp(0, -0.35, pt * tw(J, [32, 40, 86, 96], [0, 1, 1, 0]));
  p.lean = lerp(p.lean, -3, pt);
  // aceno final (cena 7), depois quase parada para leitura
  const wave = tw(E, [16, 26, 50, 60], [0, 1, 1, 0], ease);
  p.armR = mixArm(p.armR, [148, -36 + Math.sin(E * 0.55) * 22], wave);
  p.bob = Math.sin(g * 0.12) * 1.5;

  // ---------- assinatura
  const logoW = 860;
  const logoH = (logoW * 162) / 500;
  const logoRev = tw(E, [8, 28], [0, 1], easeOut);
  const leadU = tw(E, [56, 66], [0, playLead.max], easeIn);
  const triU = tw(E, [66, 80], [0, playTri.max], easeOut);
  const leadFrom = tw(E, [64, 76], [0, playLead.max]);
  const triFill = pop(E, 78, 30, 9);

  // pulsação discreta do WhatsApp
  const pulse = ((Math.max(0, J - 34) % 36) / 36) * (J > 34 ? 1 : 0);

  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <defs>
          <linearGradient id="f-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#04122F" />
            <stop offset="1" stopColor={C.navy2} />
          </linearGradient>
        </defs>
        {/* céu noturno */}
        <rect width={1080} height={1920} fill="url(#f-sky)" />
        {Array.from({length: 46}, (_, i) => (
          <circle
            key={i}
            cx={(i * 211) % 1080}
            cy={(i * 137) % 1300}
            r={2 + (i % 3)}
            fill="#FFFFFF"
            opacity={0.25 + 0.35 * Math.abs(Math.sin(g * 0.05 + i))}
          />
        ))}
        <circle cx={960} cy={560} r={54} fill="#F4F1E8" opacity={0.9} />
        <circle cx={983} cy={546} r={47} fill="#04122F" />
        {/* casa */}
        <g opacity={hFade}>
          <g transform={houseT}>
            <rect x={-1200} y={GROUND} width={3600} height={800} fill="#0E2A4F" />
            <rect x={-1200} y={GROUND} width={3600} height={18} fill="#1E4A7A" />
            <House g={g} pulses={pulses} />
          </g>
        </g>
        {/* moldura do contato */}
        {J >= 0 && E < 20 && (
          <g>
            <g opacity={Math.min(1, cardIn * 2.5)} transform={`translate(460 650) scale(${0.92 + 0.08 * cardIn}) translate(-460 -650)`}>
              <rect x={card.x} y={card.y} width={card.w} height={card.h} rx={card.r} fill="#FFFFFF" />
            </g>
            {E < 6 && (
              <g transform={`translate(${460} ${650}) scale(${1 + (J > 34 ? Math.sin(J * 0.2) * 0.004 : 0)}) translate(-460 -650)`}>
                <ConnLine track={frameTrack} from={frameFrom} to={frameU} width={14} head={frameU < frameTrack.max - 0.5} />
              </g>
            )}
            {/* conteúdo */}
            <g opacity={contentOut}>
              {J >= 30 && (
                <g transform={`translate(460 482)`}>
                  <circle r={72 + pulse * 46} fill="none" stroke={C.whats} strokeWidth={8 * (1 - pulse)} opacity={1 - pulse} />
                  <g transform={`scale(${pop(J, 30, 30, 9)})`}>
                    <WhatsIcon r={72} />
                  </g>
                </g>
              )}
            </g>
          </g>
        )}
        {E >= 0 && (
          <g>
            <rect x={-60} y={-60} width={1200} height={2040} fill="#FFFFFF" opacity={ex >= 1 ? 1 : 0} />
            {/* play desenhado pela linha */}
            {E >= 56 && (
              <g>
                <ConnLine track={playLead} from={leadFrom} to={leadU} width={16} head={leadU < playLead.max} />
                {triU > 0 && (
                  <g>
                    <g transform={`translate(${(PLAY.a[0] + PLAY.b[0] + PLAY.c[0]) / 3} 400) scale(${triFill}) translate(${-(PLAY.a[0] + PLAY.b[0] + PLAY.c[0]) / 3} -400)`}>
                      <path d={`M ${PLAY.a[0]} ${PLAY.a[1]} L ${PLAY.c[0]} ${PLAY.c[1]} L ${PLAY.b[0]} ${PLAY.b[1]} Z`} fill={C.orange} stroke={C.orange} strokeWidth={14} strokeLinejoin="round" />
                    </g>
                    <ConnLine track={playTri} to={triU} width={16} head={triU < playTri.max} />
                  </g>
                )}
              </g>
            )}
          </g>
        )}
        <Character pose={p} />
      </svg>

      {/* textos — cena 5 */}
      {g >= 20 && J < 10 && (
        <Reveal text="Vamos conectar sua casa?" start={22} size={66} color="#FFFFFF" style={{top: 250, left: 0, right: 0}} out={J0 - 6} />
      )}
      {/* textos — cena 6 */}
      {J >= 0 && E < 10 && (
        <div style={{opacity: contentOut}}>
          {J >= 48 && (
            <div
              style={{
                position: 'absolute',
                top: 574,
                left: CARD.x,
                width: CARD.w,
                textAlign: 'center',
                fontFamily: FONT,
                fontWeight: 700,
                fontSize: 40,
                color: '#128C4B',
                opacity: tw(J, [48, 58], [0, 1]),
                transform: `translateY(${tw(J, [48, 58], [16, 0], easeOut)}px)`,
              }}
            >
              WhatsApp
            </div>
          )}
          <Reveal text="Conheça os planos" start={VO.planos - G0 - 6} size={66} color={C.blue} style={{top: 664, left: CARD.x, width: CARD.w}} />
          <div style={{position: 'absolute', top: 800, left: CARD.x, width: CARD.w, display: 'flex', justifyContent: 'center', gap: 18}}>
            <svg width={44} height={64} viewBox="-26 -36 52 70" style={{marginTop: 6, transform: `scale(${pop(J, VO.cobertura - G0 - J0 - 4)})`}}>
              <PinIcon color={C.orange} />
            </svg>
            <div style={{position: 'relative', width: 520, height: 130}}>
              <Reveal
                text={'Consulte a cobertura\nno seu bairro'}
                start={VO.cobertura - G0 - 4}
                stagger={2}
                size={46}
                weight={700}
                color={C.ink}
                align="left"
                style={{top: 0, left: 0}}
              />
            </div>
          </div>
        </div>
      )}
      {/* assinatura — cena 7 */}
      {E >= 6 && (
        <>
          <Img
            src={staticFile('logo-giganet.png')}
            style={{
              position: 'absolute',
              width: logoW,
              height: logoH,
              left: 540 - logoW / 2,
              top: 680 - logoH / 2 + (1 - logoRev) * 20,
              transform: `scale(${0.95 + 0.05 * logoRev})`,
              clipPath: `inset(-2% ${50 * (1 - logoRev)}% -2% ${50 * (1 - logoRev)}%)`,
            }}
          />
          <Reveal text={'Seu próximo play\ncomeça aqui.'} start={VO.proximoPlay - G0 - 4} stagger={3} size={78} color={C.blue} style={{top: 880, left: 0, right: 0}} />
          {E >= 84 && (
            <div style={{position: 'absolute', top: 1130, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  background: C.orange,
                  borderRadius: 60,
                  padding: '14px 34px 14px 16px',
                  transform: `scale(${pop(E, 84, 30, 12)})`,
                  boxShadow: '0 14px 30px rgba(249,160,27,0.35)',
                }}
              >
                <svg width={64} height={64} viewBox="-72 -72 144 144">
                  <WhatsIcon r={70} />
                </svg>
                <span style={{fontFamily: FONT, fontWeight: 700, fontSize: 38, color: C.ink, whiteSpace: 'nowrap'}}>Fale com a gente no WhatsApp</span>
              </div>
            </div>
          )}
        </>
      )}
    </AbsoluteFill>
  );
};

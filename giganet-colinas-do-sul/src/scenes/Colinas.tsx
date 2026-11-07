import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import {Bairro, CASAS, CASA_CONSULTA, iso} from '../components/Bairro';
import {Character, LOOKS, Pose, handPos, ik, mixArm} from '../components/Character';
import {Contours} from '../components/Decor';
import {ConnLine, Pt, Track} from '../components/Line';
import {Reveal} from '../components/Text';
import {C, FONT, ease, easeIn, easeOut, lerp, pop, tw} from '../theme';
import {SCENES, VO} from '../timeline';

/**
 * "Tem novidade na área!" — um único mundo contínuo (bairro, placa, marcador, técnico),
 * com a câmera passeando por ele. Frames absolutos.
 */

const S = SCENES;
export const blinkAt = (f: number, list: number[]) =>
  list.reduce((m, b) => Math.max(m, tw(f, [b, b + 2, b + 4], [0, 1, 0], (t) => t)), 0);

// ---------- elementos do mundo (coordenadas de tela com câmera neutra)
const PIN_TIP: Pt = [800, 1300];
const SIGN = {x: 280, y: 935, w: 520, h: 250};
const BANNER = {x: 80, y: 334, w: 920, h: 372};
const PHONE = {x: 270, y: 360, w: 540, h: 1100};
const BUBBLE = {x: 0.15, y: 0.62, w: 0.8, h: 0.15}; // fração do telefone (mensagem nova)
const CLOSE = {z: 1.6, cx: 620, cy: 1215};
const FINAL = {z: 0.9, cx: 540, cy: 960};

const cam = (f: number) => {
  if (f < S.consulte) {
    return {
      z: tw(f, [0, 30, 62], [1.45, 1.45, 1], ease),
      cx: tw(f, [0, 30, 62], [620, 620, 540], ease),
      cy: tw(f, [0, 30, 62], [1080, 1080, 960], ease),
    };
  }
  const t = tw(f, [S.assinatura, S.assinatura + 40], [0, 1], ease);
  // leve aproximação contínua nos planos fechados (cenas 4–5)
  const drift = 1 + 0.06 * tw(f, [S.consulte, S.assinatura], [0, 1], (x) => x);
  return {z: Math.exp(lerp(Math.log(CLOSE.z * drift), Math.log(FINAL.z), t)), cx: lerp(CLOSE.cx, FINAL.cx, t), cy: lerp(CLOSE.cy, FINAL.cy, t)};
};
const toScreen = (c: {z: number; cx: number; cy: number}, p: Pt): Pt => [540 + (p[0] - c.cx) * c.z, 960 + (p[1] - c.cy) * c.z];

// ---------- marcador de localização
const Pin: React.FC<{x: number; y: number; s?: number; sx?: number; sy?: number}> = ({x, y, s = 1, sx = 1, sy = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${s * sx} ${s * sy})`}>
    <ellipse cx={0} cy={4} rx={34} ry={10} fill="rgba(0,0,0,0.18)" />
    <path d="M 0 0 C -24 -40 -62 -78 -62 -120 A 62 62 0 0 1 62 -120 C 62 -78 24 -40 0 0 Z" fill={C.orange} />
    <path d="M 0 0 C -24 -40 -62 -78 -62 -120 A 62 62 0 0 1 0 -182 L 0 0 Z" fill="#FFB43C" opacity={0.6} />
    <circle cx={0} cy={-122} r={28} fill="#FFFFFF" />
    <circle cx={0} cy={-122} r={12} fill={C.blue} />
  </g>
);

// ---------- placa do bairro
const Placa: React.FC<{f: number; grow: number; pulse: number}> = ({f, grow, pulse}) => {
  const postH = (1250 - (SIGN.y + SIGN.h)) * grow;
  const by = 1250 - postH - SIGN.h * grow;
  const cx = SIGN.x + SIGN.w / 2;
  return (
    <g>
      {[SIGN.x + 90, SIGN.x + SIGN.w - 90].map((x, i) => (
        <rect key={i} x={x - 10} y={1250 - postH - 10} width={20} height={postH + 14} rx={6} fill="#59627E" />
      ))}
      <g transform={`translate(${cx} ${by + (SIGN.h * grow) / 2}) scale(${grow * (1 + pulse * 0.06)}) translate(${-cx} ${-(SIGN.y + SIGN.h / 2)})`}>
        <rect x={SIGN.x + 6} y={SIGN.y + 10} width={SIGN.w} height={SIGN.h} rx={28} fill="rgba(6,26,68,0.18)" />
        <rect x={SIGN.x} y={SIGN.y} width={SIGN.w} height={SIGN.h} rx={28} fill="#FFFFFF" stroke={C.blue} strokeWidth={12} />
        <rect x={SIGN.x + 6} y={SIGN.y + 6} width={SIGN.w - 12} height={22} rx={12} fill={C.orange} />
        <text x={cx} y={SIGN.y + 128} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={98} fill={C.blue} letterSpacing={2}>
          COLINAS
        </text>
        <text x={cx} y={SIGN.y + 220} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={86} fill={C.blue} letterSpacing={6}>
          DO SUL
        </text>
        {pulse > 0 && <rect x={SIGN.x - 14} y={SIGN.y - 14} width={SIGN.w + 28} height={SIGN.h + 28} rx={38} fill="none" stroke={C.orange} strokeWidth={8} opacity={pulse} />}
      </g>
      {void f}
    </g>
  );
};

// ---------- técnico
const posTecnico = (f: number): Pose => {
  const p: Pose = {x: 205, y: 1184, s: 0.5, sit: 0, look: LOOKS.tecnico};
  p.blink = blinkAt(f, [100, 190, 260, 452, 560, 700, 780]);
  p.mouth = 'grin';
  if (f < S.consulte) {
    // entra pela esquerda e apresenta a novidade
    const walk = tw(f, [54, 84], [0, 1], easeOut);
    p.x = lerp(-140, 205, walk);
    p.step = f * 0.55;
    p.stepAmp = walk < 1 ? 1 : 0;
    p.bob = walk < 1 ? -Math.abs(Math.sin(f * 0.55)) * 10 : Math.sin(f * 0.12) * 1.5;
    p.lean = walk < 1 ? 5 : tw(f, [86, 92, 100], [0, -5, 3]);
    const present = tw(f, [86, 92, 102], [0, -0.25, 1], ease) * tw(f, [150, 162], [1, 0.4]);
    p.armR = mixArm([12 - Math.sin(f * 0.55) * 18 * p.stepAmp, -10], [118, -36], present);
    p.armL = mixArm([12 + Math.sin(f * 0.55) * 18 * p.stepAmp, -10], [20, -40], present);
    p.headTurn = tw(f, [84, 94, 120, 130], [0, 0.4, 0.4, 0]);
    p.lookX = p.headTurn * 2;
    // olha a logo e faz "joinha" no nome do bairro
    p.lookY = tw(f, [180, 190, 230, 240], [0, -1, -1, 0]);
    const thumbs = tw(f, [VO.colinas2 - 4, VO.colinas2 + 4, 262, 272], [0, 1, 1, 0], ease);
    p.armL = mixArm(p.armL, [70, -120], thumbs);
    p.pointL = thumbs > 0.6;
    return p;
  }
  if (f < S.assinatura) {
    // cena 4–5: caminha até a casa com o cartão de localização
    const walk = tw(f, [S.consulte + 4, S.consulte + 36], [0, 1], easeOut);
    p.x = lerp(430, 700, walk);
    p.y = lerp(1458, 1395, walk) - 121;
    p.step = f * 0.55;
    p.stepAmp = walk < 1 ? 1 : 0;
    p.bob = walk < 1 ? -Math.abs(Math.sin(f * 0.55)) * 10 : Math.sin(f * 0.12) * 1.5;
    p.headTurn = tw(f, [S.consulte + 36, S.consulte + 44, 452, 460], [0, -0.5, -0.5, 0]);
    p.lookX = p.headTurn * 2;
    p.lookY = tw(f, [S.whatsapp + 10, S.whatsapp + 18], [0, -1]);
    const hold = tw(f, [S.consulte + 30, S.consulte + 42], [0, 1], ease) * tw(f, [S.whatsapp, S.whatsapp + 8], [1, 0]);
    p.armR = mixArm([12, -10], ik(p, 'R', [p.x + 70, p.y - 90], -1), hold);
    // aponta para o cartão de contato (com antecipação)
    const point = tw(f, [S.whatsapp + 14, S.whatsapp + 20, S.whatsapp + 30], [0, -0.2, 1], ease);
    p.armL = mixArm([12, -10], [150, -8], point);
    p.pointL = point > 0.6;
    p.browL = 0.4;
    p.browR = 0.4;
    return p;
  }
  // assinatura: vai para o lado da composição e acena
  const walk = tw(f, [S.assinatura + 10, S.assinatura + 44], [0, 1], easeOut);
  p.x = lerp(700, 900, walk);
  p.y = lerp(1395, 1295, walk) - 121;
  p.step = f * 0.55;
  p.stepAmp = walk > 0 && walk < 1 ? 1 : 0;
  p.bob = p.stepAmp ? -Math.abs(Math.sin(f * 0.55)) * 10 : Math.sin(f * 0.1) * 1.5;
  const wave = tw(f, [S.assinatura + 48, S.assinatura + 56, S.assinatura + 90, S.assinatura + 98], [0, 1, 1, 0], ease);
  p.armR = mixArm([12, -10], [150, -36 + Math.sin(f * 0.55) * 22], wave);
  p.armL = [12, -10];
  return p;
};

// ---------- interface do grupo "Vizinhos" (400 × 815)
const ChatVizinhos: React.FC<{f: number}> = ({f}) => {
  const msg = pop(f, VO.grupo + 10, 30, 11);
  return (
    <g>
      <rect width={400} height={815} fill="#EEF1F6" />
      <rect width={400} height={110} fill={C.blue} />
      <circle cx={56} cy={62} r={30} fill={C.orange} />
      <text x={56} y={74} textAnchor="middle" fontSize={32}>
        🏘️
      </text>
      <text x={102} y={60} fontFamily={FONT} fontWeight={800} fontSize={32} fill="#FFFFFF">
        Vizinhos
      </text>
      <text x={102} y={88} fontFamily={FONT} fontWeight={500} fontSize={18} fill="#FFFFFF" opacity={0.8}>
        grupo do bairro
      </text>
      {/* mensagens anteriores (sem nomes) */}
      {[150, 228, 306].map((y, i) => (
        <g key={i}>
          <rect x={22} y={y} width={i === 1 ? 190 : 250} height={58} rx={22} fill="#FFFFFF" />
          <rect x={42} y={y + 22} width={i === 1 ? 120 : 180} height={14} rx={7} fill="#C5CCD9" />
        </g>
      ))}
      {/* nova mensagem */}
      <g transform={`translate(${380} ${BUBBLE.y * 815 + 60}) scale(${msg}) translate(${-380} ${-(BUBBLE.y * 815 + 60)})`}>
        <rect x={BUBBLE.x * 400} y={BUBBLE.y * 815} width={BUBBLE.w * 400} height={BUBBLE.h * 815} rx={24} fill="#D8F5C8" />
        <text x={BUBBLE.x * 400 + 22} y={BUBBLE.y * 815 + 46} fontFamily={FONT} fontWeight={700} fontSize={23} fill={C.ink}>
          A Giganet chegou ao
        </text>
        <text x={BUBBLE.x * 400 + 22} y={BUBBLE.y * 815 + 80} fontFamily={FONT} fontWeight={700} fontSize={23} fill={C.ink}>
          Colinas do Sul! 📶
        </text>
        <path d="M 330 600 L 337 608 L 350 592 M 340 600 L 347 608 L 360 592" transform={`translate(0 ${BUBBLE.y * 815 + 110 - 600})`} stroke="#2E9BF0" strokeWidth={3.5} fill="none" strokeLinecap="round" />
      </g>
      {/* reações */}
      {[
        ['👍', VO.novidade + 4, 120],
        ['🎉', VO.novidade + 16, 200],
      ].map(([e, t0, x], i) => {
        const k = pop(f, t0 as number, 30, 9);
        if (k <= 0.01) return null;
        return (
          <g key={i} transform={`translate(${x} ${BUBBLE.y * 815 + BUBBLE.h * 815 + 34}) scale(${k})`}>
            <rect x={-38} y={-26} width={76} height={52} rx={26} fill="#FFFFFF" stroke="#D5DAE4" strokeWidth={2} />
            <text x={-14} y={11} fontSize={30}>
              {e}
            </text>
            <text x={20} y={10} fontFamily={FONT} fontWeight={700} fontSize={20} fill="#59627E">
              {i + 1}
            </text>
          </g>
        );
      })}
      <rect x={20} y={735} width={300} height={56} rx={28} fill="#FFFFFF" />
      <circle cx={354} cy={763} r={28} fill={C.blue} />
      <path d="M 342 751 L 370 763 L 342 775 Z" fill="#FFFFFF" />
    </g>
  );
};

const WhatsGlyph: React.FC<{r?: number}> = ({r = 72}) => (
  <g transform={`scale(${r / 70})`}>
    <circle r={70} fill={C.whats} />
    <path d="M -40 44 L -32 18 A 40 40 0 1 1 -14 36 Z" fill="none" stroke="#FFFFFF" strokeWidth={8} strokeLinejoin="round" />
    <path d="M -16 -20 Q -20 -10 -10 6 Q 2 22 18 24 Q 24 24 26 16 L 22 10 L 12 8 L 8 14 Q -2 10 -8 -2 L -2 -6 L -4 -16 L -10 -22 Q -14 -24 -16 -20 Z" fill="#FFFFFF" />
  </g>
);

/** Mundo: céu, bairro, placa, marcador e técnico. */
const Mundo: React.FC<{f: number; showSign: number; signPulse: number; pinState: {x: number; y: number; sx: number; sy: number; s: number; on: boolean}; tech: Pose; consulta: number}> = ({
  f,
  showSign,
  signPulse,
  pinState,
  tech,
  consulta,
}) => (
  <g>
    <Bairro f={f} consulta={consulta} />
    {showSign > 0.001 && <Placa f={f} grow={showSign} pulse={signPulse} />}
    <Character pose={tech} />
    {pinState.on && <Pin x={pinState.x} y={pinState.y} s={pinState.s} sx={pinState.sx} sy={pinState.sy} />}
  </g>
);

export const Colinas: React.FC = () => {
  const f = useCurrentFrame();
  const c = cam(f);
  const tech = posTecnico(f);

  // ---- marcador: cai, acomoda, depois vira linha (cena 2)
  const fall = tw(f, [0, 12], [0, 1], easeIn);
  const squash = f >= 12 ? Math.exp(-(f - 12) / 5) * Math.cos((f - 12) * 0.7) : 0;
  const stretch = tw(f, [S.apresentacao - 2, S.apresentacao + 8], [0, 1], easeIn);
  const pinOn = f < S.apresentacao + 8 || (f >= S.assinatura + 26 && f < 9999);
  const finalPin = pop(f, S.assinatura + 26, 30, 9);
  const pinState =
    f < S.assinatura
      ? {x: PIN_TIP[0], y: lerp(-300, PIN_TIP[1], fall), s: 1, sx: 1 + squash * 0.25 - stretch * 0.6, sy: 1 - squash * 0.25 + stretch * 0.9, on: pinOn}
      : {x: SIGN.x - 40, y: SIGN.y + 200, s: 0.62 * finalPin, sx: 1, sy: 1, on: true};

  // ---- placa
  const signGrow = f < S.espalhe + 3 ? pop(f, 16, 30, 10) : f >= S.assinatura + 14 ? pop(f, S.assinatura + 14, 30, 10) : 0;
  const signPulse = tw(f, [VO.colinas2 - 2, VO.colinas2 + 4, VO.colinas2 + 20], [0, 1, 0]);

  // ---- linha (cena 2): do marcador até a moldura da logo
  const rr = (x: number, y: number, w: number, h: number, r: number): Pt[] => {
    const pts: Pt[] = [];
    const arc = (cx: number, cy: number, a0: number, a1: number) => {
      for (let i = 0; i <= 8; i++) {
        const a = a0 + ((a1 - a0) * i) / 8;
        pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
      }
    };
    arc(x + w - r, y + h - r, 0, Math.PI / 2);
    arc(x + r, y + h - r, Math.PI / 2, Math.PI);
    arc(x + r, y + r, Math.PI, Math.PI * 1.5);
    arc(x + w - r, y + r, -Math.PI / 2, 0);
    pts.push([x + w, y + h - r]);
    return pts;
  };
  const lead = new Track([PIN_TIP, [860, 1180], [990, 980], [1040, 800], [BANNER.x + BANNER.w, BANNER.y + BANNER.h - 40]], false, 14);
  const frameTrack = new Track([...lead.pts, ...rr(BANNER.x, BANNER.y, BANNER.w, BANNER.h, 44)], false, 1);
  const leadLen = lead.pts.length - 1;
  const lineU = tw(f, [S.apresentacao + 2, S.apresentacao + 52], [0, frameTrack.max], ease);
  const lineFrom = tw(f, [S.apresentacao + 40, S.apresentacao + 62], [0, leadLen], ease);
  const bannerFill = tw(f, [S.apresentacao + 48, S.apresentacao + 58], [0, 1]);
  const s2Out = tw(f, [S.espalhe, S.espalhe + 10], [1, 0]);
  const logoRev = tw(f, [S.apresentacao + 54, S.apresentacao + 74], [0, 1], easeOut);

  // ---- cena 3: placa gira e vira celular
  const flip = tw(f, [S.espalhe + 2, S.espalhe + 20], [0, 1], ease);
  const phoneR = {
    x: lerp(SIGN.x, PHONE.x, flip),
    y: lerp(SIGN.y, PHONE.y, flip),
    w: lerp(SIGN.w, PHONE.w, flip),
    h: lerp(SIGN.h, PHONE.h, flip),
  };
  const flipScale = Math.max(0.04, Math.abs(Math.cos(Math.PI * flip)));
  const phoneOn = f >= S.espalhe + 2 && f < S.consulte + 20;
  const dim = f >= S.espalhe && f < S.consulte + 20 ? 0.32 * tw(f, [S.espalhe, S.espalhe + 12], [0, 1]) : 0;

  // ---- cena 4: a mensagem se expande e revela a casa
  const bub = {x: PHONE.x + BUBBLE.x * PHONE.w, y: PHONE.y + BUBBLE.y * PHONE.h, w: BUBBLE.w * PHONE.w, h: BUBBLE.h * PHONE.h};
  const ex = tw(f, [S.consulte, S.consulte + 18], [0, 1], ease);
  const clip = {x: lerp(bub.x, -20, ex), y: lerp(bub.y, -20, ex), w: lerp(bub.w, 1120, ex), h: lerp(bub.h, 1960, ex), r: lerp(24, 0, ex)};
  const closeUp = f >= S.consulte;
  const consulta = tw(f, [VO.suaRua - 10, VO.suaRua], [0, 1]) * tw(f, [S.assinatura, S.assinatura + 20], [1, 0]);

  // ---- cartão de localização → cartão de contato (cena 5)
  const hand = toScreen(c, handPos(tech, 'R'));
  const card = tw(f, [S.whatsapp, S.whatsapp + 16], [0, 1], ease);
  const cardOut = tw(f, [S.assinatura - 2, S.assinatura + 10], [0, 1], easeIn);
  const big = {x: 120, y: 270, w: 840, h: 430};
  const small = {x: hand[0] - 40, y: hand[1] - 60, w: 80, h: 56};
  const R = {
    x: lerp(small.x, big.x, card),
    y: lerp(small.y, big.y, card),
    w: lerp(small.w, big.w, card) * (1 - cardOut),
    h: lerp(small.h, big.h, card) * (1 - cardOut),
  };
  const cardVisible = closeUp && f >= S.consulte + 34 && cardOut < 1;
  const pulse = f > S.whatsapp + 18 ? ((f - S.whatsapp - 18) % 36) / 36 : 0;

  // casa consultada: ponto de interrogação discreto
  const casa = CASAS[CASA_CONSULTA];
  const roofTop = toScreen(c, iso(casa.x + casa.w / 2, casa.y + casa.d / 2, casa.h + 70));

  const worldT = (cc: typeof c) => `translate(540 960) scale(${cc.z}) translate(${-cc.cx} ${-cc.cy})`;
  const world = (cc: typeof c) => (
    <g transform={worldT(cc)}>
      <Mundo f={f} showSign={closeUp && f < S.assinatura ? 0 : signGrow} signPulse={signPulse} pinState={pinState} tech={closeUp ? tech : tech} consulta={consulta} />
    </g>
  );
  const camBefore = {z: 1, cx: 540, cy: 960};

  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <defs>
          <linearGradient id="ceu" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#CFE3FF" />
            <stop offset="1" stopColor="#F4F7FB" />
          </linearGradient>
          <clipPath id="bolha">
            <rect x={clip.x} y={clip.y} width={clip.w} height={clip.h} rx={clip.r} />
          </clipPath>
          <filter id="grao" x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.38" numOctaves="3" seed="7" />
            <feColorMatrix type="saturate" values="0" />
            <feComposite in2="SourceGraphic" operator="in" />
          </filter>
        </defs>
        <rect width={1080} height={1920} fill="url(#ceu)" />
        {/* nuvens */}
        {[
          [180, 260, 1],
          [860, 420, 0.8],
          [300, 760, 0.7],
        ].map(([x, y, s], i) => (
          <g key={i} transform={`translate(${x + Math.sin(f * 0.01 + i) * 20} ${y}) scale(${s})`} opacity={0.9}>
            <ellipse rx={110} ry={34} fill="#FFFFFF" />
            <circle cx={-30} cy={-24} r={42} fill="#FFFFFF" />
            <circle cx={34} cy={-18} r={34} fill="#FFFFFF" />
          </g>
        ))}
        <Contours cx={1120} cy={140} r0={60} n={9} f={f} start={10} color={C.blue} opacity={0.18} seed={2} />

        {/* mundo */}
        {!closeUp && world(c)}
        {closeUp && ex < 1 && world(camBefore)}

        {/* cena 2: linha + moldura da logo */}
        {f >= S.apresentacao && f < S.espalhe + 10 && (
          <g opacity={s2Out}>
            <g opacity={bannerFill}>
              <rect x={BANNER.x} y={BANNER.y} width={BANNER.w} height={BANNER.h} rx={44} fill="#084AA9" />
              <rect x={BANNER.x} y={BANNER.y} width={BANNER.w} height={BANNER.h} rx={44} fill="#000" filter="url(#grao)" opacity={0.28} style={{mixBlendMode: 'overlay'}} />
            </g>
            <ConnLine track={frameTrack} from={lineFrom} to={lineU} width={16} head={lineU < frameTrack.max - 0.5} />
          </g>
        )}

        {/* cena 3: escurece e mostra o celular */}
        {dim > 0 && <rect width={1080} height={1920} fill={C.navy} opacity={dim * (1 - ex)} />}
        {phoneOn && (
          <g opacity={1 - tw(f, [S.consulte + 8, S.consulte + 18], [0, 1])}>
            {flip < 0.5 ? (
              <g transform={`translate(${phoneR.x + phoneR.w / 2} 0) scale(${flipScale} 1) translate(${-(phoneR.x + phoneR.w / 2)} 0)`}>
                <rect x={phoneR.x} y={phoneR.y} width={phoneR.w} height={phoneR.h} rx={28} fill="#FFFFFF" stroke={C.blue} strokeWidth={12} />
              </g>
            ) : (
              <g transform={`translate(${phoneR.x + phoneR.w / 2} 0) scale(${flipScale} 1) translate(${-(phoneR.x + phoneR.w / 2)} 0)`}>
                <rect x={phoneR.x - 16} y={phoneR.y - 16} width={phoneR.w + 32} height={phoneR.h + 32} rx={56} fill="#0B1733" />
                <svg x={phoneR.x} y={phoneR.y} width={phoneR.w} height={phoneR.h} viewBox="0 0 400 815" preserveAspectRatio="none">
                  <ChatVizinhos f={f} />
                </svg>
              </g>
            )}
          </g>
        )}

        {/* cenas 4–6: mundo de perto, revelado pela mensagem que se expande */}
        {closeUp && (
          <g clipPath={ex < 1 ? 'url(#bolha)' : undefined}>
            <rect width={1080} height={1920} fill="url(#ceu)" />
            {world(c)}
            {/* consulta: uma interrogação sobre a casa (não é cobertura) */}
            {consulta > 0 && (
              <g transform={`translate(${roofTop[0]} ${roofTop[1] - 40}) scale(${pop(f, VO.suaRua - 10, 30, 9) * (1 - tw(f, [S.assinatura, S.assinatura + 14], [0, 1]))})`}>
                <circle r={46 + ((f % 30) / 30) * 26} fill="none" stroke={C.orange} strokeWidth={6} opacity={1 - (f % 30) / 30} />
                <circle r={44} fill="#FFFFFF" stroke={C.orange} strokeWidth={6} />
                <text y={18} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={54} fill={C.orange}>
                  ?
                </text>
              </g>
            )}
          </g>
        )}

        {/* cartão de localização (na mão) → cartão de contato */}
        {cardVisible && (
          <g>
            <rect x={R.x + 6} y={R.y + 10} width={R.w} height={R.h} rx={Math.min(40, R.h / 4)} fill="rgba(6,26,68,0.18)" />
            <rect x={R.x} y={R.y} width={R.w} height={R.h} rx={Math.min(40, R.h / 4)} fill="#FFFFFF" stroke={C.orange} strokeWidth={card > 0.3 ? 8 : 4} />
            {card < 0.4 ? (
              <g transform={`translate(${R.x + R.w / 2} ${R.y + R.h * 0.72}) scale(${0.28 + card})`}>
                <Pin x={0} y={0} s={0.5} />
              </g>
            ) : (
              <g transform={`translate(${R.x + R.w / 2} ${R.y + 112}) scale(${(card - 0.4) / 0.6})`}>
                <circle r={74 + pulse * 40} fill="none" stroke={C.whats} strokeWidth={8 * (1 - pulse)} opacity={1 - pulse} />
                <WhatsGlyph r={74} />
              </g>
            )}
          </g>
        )}
      </svg>

      {/* ---------- textos ---------- */}
      {/* cena 1 */}
      {f >= 60 && f < S.apresentacao + 10 && (
        <div style={{position: 'absolute', top: 250, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
          <div
            style={{
              background: C.blue,
              color: '#FFFFFF',
              fontFamily: FONT,
              fontWeight: 800,
              fontSize: 54,
              padding: '16px 40px',
              borderRadius: 60,
              transform: `scale(${pop(f, 60, 30, 10)}) translateY(${tw(f, [S.apresentacao, S.apresentacao + 10], [0, -40])}px)`,
              opacity: tw(f, [S.apresentacao, S.apresentacao + 10], [1, 0]),
              boxShadow: '0 16px 34px rgba(6,26,68,0.25)',
            }}
          >
            A Giganet JP chegou! <span style={{color: C.orange}}>📍</span>
          </div>
        </div>
      )}
      {/* cena 2: logo (da arte original) + apoio */}
      {f >= S.apresentacao + 50 && s2Out > 0 && (
        <Img
          src={staticFile('logo-giganet-azul.png')}
          style={{
            position: 'absolute',
            width: 880,
            height: (880 * 205) / 500,
            left: 100,
            top: BANNER.y + BANNER.h / 2 - (880 * 205) / 1000 + (1 - logoRev) * 16,
            opacity: s2Out,
            transform: `scale(${0.95 + 0.05 * logoRev})`,
            clipPath: `inset(4px ${50 * (1 - logoRev)}% 4px ${50 * (1 - logoRev)}%)`,
          }}
        />
      )}
      {f >= VO.tambemNo - 6 && s2Out > 0 && (
        <div style={{opacity: s2Out}}>
          <Reveal text="Agora também no" start={VO.tambemNo - 6} size={60} color={C.blue} style={{top: 760, left: 0, right: 0}} />
        </div>
      )}
      {f >= VO.joaoPessoa - 4 && s2Out > 0 && (
        <div style={{position: 'absolute', top: 1204, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: s2Out}}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              background: '#FFFFFF',
              borderRadius: 50,
              padding: '10px 30px 10px 20px',
              boxShadow: '0 10px 24px rgba(6,26,68,0.18)',
              transform: `scale(${pop(f, VO.joaoPessoa - 4, 30, 11)})`,
            }}
          >
            <svg width={36} height={50} viewBox="-26 -36 52 70">
              <path d="M 0 30 C -14 12 -22 2 -22 -10 A 22 22 0 0 1 22 -10 C 22 2 14 12 0 30 Z" fill={C.orange} />
              <circle cy={-10} r={8} fill="#FFFFFF" />
            </svg>
            <span style={{fontFamily: FONT, fontWeight: 700, fontSize: 48, color: C.blue}}>João Pessoa</span>
          </div>
        </div>
      )}
      {/* cena 4: consulta */}
      {f >= S.consulte + 18 && f < S.whatsapp + 10 && (
        <div style={{opacity: tw(f, [S.whatsapp, S.whatsapp + 10], [1, 0])}}>
          <div style={{position: 'absolute', top: 300, left: 120, right: 120, transform: `scale(${pop(f, S.consulte + 18, 30, 11)})`}}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 18,
                background: '#FFFFFF',
                borderRadius: 26,
                border: `4px solid ${C.blue}`,
                padding: '20px 28px',
                boxShadow: '0 16px 34px rgba(6,26,68,0.2)',
              }}
            >
              <svg width={40} height={56} viewBox="-26 -36 52 70">
                <path d="M 0 30 C -14 12 -22 2 -22 -10 A 22 22 0 0 1 22 -10 C 22 2 14 12 0 30 Z" fill={C.orange} />
                <circle cy={-10} r={8} fill="#FFFFFF" />
              </svg>
              <span style={{fontFamily: FONT, fontWeight: 700, fontSize: 46, color: '#7D879C'}}>Seu endereço</span>
              <span style={{width: 4, height: 50, background: C.blue, opacity: Math.floor(f / 8) % 2 ? 1 : 0}} />
            </div>
          </div>
          {f >= VO.suaRua - 6 && (
            <div style={{position: 'absolute', top: 470, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
              <div
                style={{
                  background: C.orange,
                  color: C.ink,
                  fontFamily: FONT,
                  fontWeight: 800,
                  fontSize: 50,
                  padding: '14px 38px',
                  borderRadius: 50,
                  transform: `scale(${pop(f, VO.suaRua - 6, 30, 10)})`,
                  boxShadow: '0 14px 30px rgba(249,160,27,0.35)',
                }}
              >
                Consulte a disponibilidade.
              </div>
            </div>
          )}
        </div>
      )}
      {/* cena 5: contato */}
      {cardVisible && card > 0.95 && (
        <div style={{position: 'absolute', left: big.x, width: big.w, top: 0, opacity: 1 - cardOut}}>
          <Reveal text="Conheça os planos" start={S.whatsapp + 14} size={58} color={C.blue} style={{top: 488, left: 0, right: 0}} />
          <Reveal text="Consulte seu endereço" start={VO.consulte - 4} size={48} weight={700} color={C.ink} style={{top: 576, left: 0, right: 0}} />
        </div>
      )}
      {/* cena 6: assinatura */}
      {f >= S.assinatura + 20 && (
        <>
          <div
            style={{
              position: 'absolute',
              left: 80,
              top: 230,
              width: 920,
              height: 372,
              borderRadius: 44,
              overflow: 'hidden',
              transform: `scale(${pop(f, S.assinatura + 20, 30, 12)})`,
              boxShadow: '0 18px 40px rgba(6,26,68,0.25)',
            }}
          >
            <svg width={920} height={372} style={{position: 'absolute'}}>
              <rect width={920} height={372} fill="#084AA9" />
              <rect width={920} height={372} fill="#000" filter="url(#grao)" opacity={0.28} style={{mixBlendMode: 'overlay'}} />
            </svg>
            <Img src={staticFile('logo-giganet-azul.png')} style={{position: 'absolute', width: 880, height: (880 * 205) / 500, left: 20, top: 186 - (880 * 205) / 1000}} />
          </div>
          <Reveal text="AGORA TAMBÉM NO" start={VO.agoraTambem - 4} size={56} color={C.blue} style={{top: 630, left: 0, right: 0}} />
          {f >= VO.agoraTambem + 14 && (
            <div style={{position: 'absolute', top: 706, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
              <div
                style={{
                  background: C.orange,
                  color: C.ink,
                  fontFamily: FONT,
                  fontWeight: 800,
                  fontSize: 82,
                  padding: '4px 34px 8px',
                  borderRadius: 24,
                  letterSpacing: 1,
                  transform: `scale(${pop(f, VO.agoraTambem + 14, 30, 11)})`,
                }}
              >
                COLINAS DO SUL
              </div>
            </div>
          )}
          <Reveal text="Consulte a disponibilidade para o seu endereço." start={VO.agoraTambem + 30} stagger={2} size={32} weight={700} color={C.ink} style={{top: 852, left: 0, right: 0}} />
        </>
      )}
    </AbsoluteFill>
  );
};
void easeIn;

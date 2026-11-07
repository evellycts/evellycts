import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import {Character, LOOKS, Pose, mixArm} from '../components/Character';
import {Bubble, BubbleDefs, Bubbles, Contours} from '../components/Decor';
import {ConnLine, Pt, Track} from '../components/Line';
import {Reveal} from '../components/Text';
import {C, FONT, ease, easeOut, lerp, pop, tw} from '../theme';
import {SCENES, VO} from '../timeline';
import {camMomentos, lineTrack, MundoSala} from './Momentos';
import {blinkAt} from './Porta';

/**
 * CENAS 5, 6 e 7 (frames absolutos 422–945): casa, contato e assinatura.
 * A sala continua viva dentro da janela da casa.
 */
export const FROM_CASA = SCENES.giganet; // 422
const S6 = SCENES.contato; // 605
const S7 = SCENES.assinatura; // 767

const BRAND_BG = '#084AA9'; // + granulado ≈ azul da arte original
const GROUND = 1620;
const APEX: Pt = [540, 840];
const EAVE = 1120;
const HX0 = 190;
const HX1 = 890;
const WIN = {x: 250, y: 1200, w: 580, h: 360};
// recorte do mundo da sala que aparece na janela
const WR = {x: 100, y: 560, w: 1900, h: 1180};
const K = WIN.w / WR.w;
const worldToHouse = (p: Pt): Pt => [WIN.x + (p[0] - WR.x) * K, WIN.y + (p[1] - WR.y) * K];

type X = {s: number; tx: number; ty: number};
/** interpola escala (log) mantendo um ponto-foco suave na tela */
const zoomTo = (a: X, b: X, focus: Pt, t: number): X => {
  const s = Math.exp(lerp(Math.log(a.s), Math.log(b.s), t));
  const pa: Pt = [focus[0] * a.s + a.tx, focus[1] * a.s + a.ty];
  const pb: Pt = [focus[0] * b.s + b.tx, focus[1] * b.s + b.ty];
  const w = Math.abs(Math.log(a.s) - Math.log(b.s)) < 1e-6 ? t : (Math.log(s) - Math.log(a.s)) / (Math.log(b.s) - Math.log(a.s));
  const p: Pt = [lerp(pa[0], pb[0], w), lerp(pa[1], pb[1], w)];
  return {s, tx: p[0] - focus[0] * s, ty: p[1] - focus[1] * s};
};
const anchored = (s: number, ground: Pt): X => ({s, tx: ground[0] - 540 * s, ty: ground[1] - GROUND * s});

const houseX = (f: number): X => {
  // início: casa ampliada exatamente como a câmera da cena 4
  const c = camMomentos(SCENES.giganet);
  const P0 = worldToHouse([c.cx, c.cy]);
  const s0 = c.z / K;
  const start: X = {s: s0, tx: 540 - P0[0] * s0, ty: 960 - P0[1] * s0};
  const id: X = {s: 1, tx: 0, ty: 0};
  const back = anchored(0.62, [540, GROUND]);
  const sofaFocus = worldToHouse([1550, 1300]);
  const inside: X = {s: 2.95, tx: 540 - sofaFocus[0] * 2.95, ty: 960 - sofaFocus[1] * 2.95};
  const final = anchored(0.55, [540, 1650]);
  if (f < 462) return zoomTo(start, id, P0, tw(f, [FROM_CASA, 462], [0, 1], ease));
  if (f < S6) return id;
  if (f < S7) return zoomTo(id, back, [540, GROUND], tw(f, [S6, S6 + 22], [0, 1], ease));
  if (f < 806) return zoomTo(back, inside, sofaFocus, tw(f, [S7 + 4, S7 + 26], [0, 1], ease));
  return zoomTo(inside, final, sofaFocus, tw(f, [808, 832], [0, 1], ease));
};

const seg = (a: Pt, b: Pt, n: number): Pt[] => Array.from({length: n}, (_, k) => [lerp(a[0], b[0], k / n), lerp(a[1], b[1], k / n)] as Pt);
// Fibra no contorno da casa: duas linhas sobem juntas por fora das paredes,
// acompanham o telhado (paralelas ao friso, sem sobrepor) e se encontram na cumeeira.
// Dali, uma linha sobe e se abre num sublinhado sob a logo.
const OFF = 34; // distância do contorno
const ROOF_APEX: Pt = [540, 735]; // ~58 px acima do friso, paralelo a ele
const sideTrack = (dir: 1 | -1) => {
  const m = (x: number) => 540 + dir * (x - 540);
  return new Track(
    [
      ...seg([m(1160), GROUND], [m(HX1 + 30), GROUND], 10),
      ...seg([m(HX1 + 30), GROUND], [m(HX1 + 30), 1172], 18),
      ...seg([m(HX1 + 30), 1172], [m(1012), 1172], 4),
      ...seg([m(1012), 1172], [m(1012), ROOF_APEX[1] + (1012 - 540) * 0.771], 3),
      ...seg([m(1012), ROOF_APEX[1] + (1012 - 540) * 0.771], ROOF_APEX, 22),
      ROOF_APEX,
    ],
    false,
    1,
  );
};
const LEFT = sideTrack(-1);
const RIGHT = sideTrack(1);
const UNDER_Y = 660;
const UP = new Track([...seg(ROOF_APEX, [540, UNDER_Y], 8), [540, UNDER_Y]], false, 1);
const UNDER_L = new Track([...seg([540, UNDER_Y], [150, UNDER_Y], 16), [150, UNDER_Y]], false, 1);
const UNDER_R = new Track([...seg([540, UNDER_Y], [930, UNDER_Y], 16), [930, UNDER_Y]], false, 1);
const FIB = {sides: [448, 498] as [number, number], up: [498, 506] as [number, number], under: [506, 524] as [number, number], retract: [526, 540] as [number, number]};

const BUB_TL: Bubble[] = [
  [60, 150, 52],
  [160, 90, 32],
  [30, 250, 26],
  [150, 205, 18],
  [235, 140, 14],
];
const BUB_BR: Bubble[] = [
  [1030, 1330, 40],
  [985, 1398, 22],
  [1052, 1420, 18],
  [1004, 1280, 13],
];

const Casa3D: React.FC<{f: number}> = ({f}) => (
  <g>
    <rect x={HX0 - 70} y={GROUND - 10} width={HX1 - HX0 + 140} height={24} rx={10} fill="#000" opacity={0.15} />
    {/* chaminé */}
    <rect x={720} y={880} width={70} height={150} fill="#0A1E4D" />
    <rect x={708} y={868} width={94} height={24} rx={6} fill="#0F2A66" />
    {/* telhado */}
    <path d={`M ${HX0 - 60} ${EAVE + 10} L ${APEX[0]} ${APEX[1] - 20} L ${HX1 + 60} ${EAVE + 10} Z`} fill="#0F2A66" />
    <path d={`M ${HX0 - 70} ${EAVE + 14} L ${APEX[0]} ${APEX[1] - 30} L ${HX1 + 70} ${EAVE + 14}`} fill="none" stroke={C.orange} strokeWidth={24} strokeLinecap="round" strokeLinejoin="round" />
    <circle cx={APEX[0]} cy={1000} r={46} fill="#FFD98A" />
    <circle cx={APEX[0]} cy={1000} r={46} fill="none" stroke="#FFFFFF" strokeWidth={9} />
    {/* paredes */}
    <rect x={HX0} y={EAVE} width={HX1 - HX0} height={GROUND - EAVE} fill="#ECE9EA" />
    <rect x={HX0} y={EAVE} width={HX1 - HX0} height={24} fill="#D6D1D3" />
    {/* moldura da janela (o conteúdo é desenhado à parte) */}
    <rect x={WIN.x - 16} y={WIN.y - 16} width={WIN.w + 32} height={WIN.h + 32} rx={22} fill="#FFFFFF" />
    <rect x={WIN.x - 24} y={WIN.y + WIN.h + 10} width={WIN.w + 48} height={20} rx={8} fill="#D6D1D3" />
    {/* vasos */}
    {[HX0 + 10, HX1 - 70].map((x, i) => (
      <g key={i} transform={`translate(${x + 30} ${GROUND})`}>
        {[-30, 0, 30].map((a, j) => (
          <ellipse key={j} cx={Math.sin((a * Math.PI) / 180) * 30} cy={-60} rx={13} ry={36} fill={j % 2 ? '#5E9E5A' : '#79B86F'} transform={`rotate(${a} ${Math.sin((a * Math.PI) / 180) * 30} -60)`} />
        ))}
        <path d="M -26 -30 L 26 -30 L 20 0 L -20 0 Z" fill={C.orange} />
      </g>
    ))}
    {/* luz da janela no chão */}
    <ellipse cx={540} cy={GROUND + 6} rx={260} ry={14} fill="#FFD98A" opacity={0.25 + Math.sin(f * 0.1) * 0.05} />
  </g>
);

const posVisitaCartao = (f: number): Pose => {
  const p: Pose = {x: 880, y: 1420, s: 0.78, sit: 0, look: LOOKS.visita};
  const enter = tw(f, [S6, S6 + 16], [0, 1], easeOut);
  const exit = tw(f, [S7 - 4, S7 + 10], [0, 1], ease);
  p.x = lerp(1250, 880, enter) + exit * 420;
  p.bob = enter < 1 || exit > 0 ? -Math.abs(Math.sin(f * 0.55)) * 14 : Math.sin(f * 0.12) * 1.5;
  p.lean = enter < 1 ? -8 : exit > 0 ? 8 : 0;
  p.mouth = 'grin';
  p.blink = blinkAt(f, [650, 700, 744]);
  const present = tw(f, [S6 + 10, S6 + 16, S6 + 26], [0, -0.2, 1], ease);
  const point = tw(f, [VO.cobertura - 6, VO.cobertura + 4], [0, 1], ease);
  p.armL = mixArm(mixArm([10, -8], [118, -28], present), [140, -6], point);
  p.pointL = point > 0.5;
  p.armR = mixArm([10, -8], [30, -100], present);
  p.headTurn = tw(f, [S6 + 16, S6 + 26, 690, 700, VO.cobertura, VO.cobertura + 8, 740, 748], [0, -0.4, -0.4, 0, 0, -0.4, -0.4, 0]);
  p.lookX = p.headTurn * 2;
  p.lookY = tw(f, [S6 + 16, S6 + 26, 690, 700], [0, -0.6, -0.6, 0]);
  p.browL = 0.4;
  p.browR = 0.4;
  return p;
};

export const Casa: React.FC = () => {
  const f = useCurrentFrame() + FROM_CASA;
  const x = houseX(f);
  const clipOpen = tw(x.s, [1.05, 1.75], [0, 1]);
  // retângulo da tela em coordenadas da casa
  const scr = {x: -x.tx / x.s, y: -x.ty / x.s, w: 1080 / x.s, h: 1920 / x.s};
  const clip = {
    x: lerp(WIN.x, scr.x, clipOpen),
    y: lerp(WIN.y, scr.y, clipOpen),
    w: lerp(WIN.w, scr.w, clipOpen),
    h: lerp(WIN.h, scr.h, clipOpen),
    r: lerp(12, 0, clipOpen),
  };
  const relax = f >= S7 ? 1 : 0;
  const wf = f; // a sala continua animada

  // linha do contorno
  const lineOn = f >= 448 && f < S6 + 10;
  const pulses = f > FIB.sides[1] ? [0, 1].map((i) => (f - FIB.sides[1]) * 0.8 + i * 27) : [];

  // logo
  const logoRev = tw(f, [458, 478], [0, 1], easeOut);
  const logoOut = tw(f, [S6, S6 + 12], [0, 1]);
  const logoFinal = tw(f, [828, 846], [0, 1], easeOut);
  const showLogo = (f >= 458 && logoOut < 1) || f >= 828;
  const lr = f >= 828 ? logoFinal : logoRev * (1 - logoOut);

  // cartão
  const cardIn = pop(f, S6 + 14, 30, 11) * (1 - tw(f, [S7 - 2, S7 + 10], [0, 1], ease));
  const cardOrigin: Pt = [760, 1250];
  const pulse = f > S6 + 30 ? ((f - S6 - 30) % 36) / 36 : 0;

  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <defs>
          <filter id="grain" x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.38" numOctaves="3" seed="7" />
            <feColorMatrix type="saturate" values="0" />
            <feComposite in2="SourceGraphic" operator="in" />
          </filter>
          <clipPath id="janela">
            <rect x={clip.x} y={clip.y} width={clip.w} height={clip.h} rx={clip.r} />
          </clipPath>
        </defs>
        {/* céu azul da marca */}
        <rect width={1080} height={1920} fill={BRAND_BG} />
        <rect width={1080} height={1920} fill="#000" filter="url(#grain)" opacity={0.28} style={{mixBlendMode: 'overlay'}} />
        <BubbleDefs id="cs" />
        <Contours cx={1110} cy={160} r0={70} n={10} f={f} start={470} opacity={0.8} seed={2} />
        <Bubbles id="cs" list={BUB_TL} f={f} start={474} />
        <Bubbles id="cs" list={BUB_BR} f={f} start={486} />
        <g transform={`translate(${x.tx} ${x.ty}) scale(${x.s})`}>
          {/* chão: onda branca */}
          <path d={`M -900 ${GROUND - 10} Q 0 ${GROUND - 60} 540 ${GROUND - 20} T 2000 ${GROUND - 30} L 2000 3200 L -900 3200 Z`} fill="#FFFFFF" />
          <Casa3D f={f} />
          {/* a sala, viva dentro da janela */}
          <g clipPath="url(#janela)">
            <g transform={`translate(${WIN.x} ${WIN.y}) scale(${K}) translate(${-WR.x} ${-WR.y})`}>
              <MundoSala f={wf} relax={relax} />
              {f < S6 && (() => {
                const tr = lineTrack(Math.min(f, SCENES.giganet));
                return <ConnLine track={tr} to={tr.max} width={28} head={false} pulses={[0, 1].map((i) => ((f - 419) * 0.25 + i * 3.5) % tr.max)} />;
              })()}
            </g>
          </g>
          {lineOn && (
            <g>
              {[LEFT, RIGHT].map((tr, i) => (
                <ConnLine key={i} track={tr} to={tw(f, FIB.sides, [0, tr.max], (t) => t)} width={20} head={f < FIB.sides[1]} pulses={pulses.map((q) => q % tr.max)} />
              ))}
              {f >= FIB.up[0] && (
                <ConnLine track={UP} from={tw(f, FIB.retract, [0, UP.max], ease)} to={tw(f, FIB.up, [0, UP.max])} width={20} head={f < FIB.up[1]} />
              )}
              {f >= FIB.under[0] &&
                [UNDER_L, UNDER_R].map((tr, i) => (
                  <ConnLine key={i} track={tr} to={tw(f, FIB.under, [0, tr.max], easeOut)} width={16} head={f < FIB.under[1]} />
                ))}
            </g>
          )}
        </g>
        {/* visita apresenta o cartão */}
        {f >= S6 && f < S7 + 14 && <Character pose={posVisitaCartao(f)} />}
        {cardIn > 0.001 && (
          <g transform={`translate(${cardOrigin[0]} ${cardOrigin[1]}) scale(${cardIn}) translate(${-cardOrigin[0]} ${-cardOrigin[1]})`}>
            <rect x={100} y={330} width={660} height={660} rx={56} fill="#FFFFFF" />
            <rect x={100} y={330} width={660} height={660} rx={56} fill="none" stroke={C.orange} strokeWidth={8} />
            <g transform="translate(430 470)">
              <circle r={72 + pulse * 46} fill="none" stroke={C.whats} strokeWidth={8 * (1 - pulse)} opacity={1 - pulse} />
              <WhatsGlyph />
            </g>
          </g>
        )}
      </svg>

      {/* logo (da arte original) */}
      {showLogo && (
        <Img
          src={staticFile('logo-giganet-azul.png')}
          style={{
            position: 'absolute',
            width: 900,
            height: (900 * 205) / 500,
            left: 90,
            top: (f >= 828 ? 430 : 450) - (900 * 205) / 1000 + (1 - lr) * 20,
            transform: `scale(${0.95 + 0.05 * lr})`,
            opacity: f >= 828 ? 1 : 1 - logoOut,
            clipPath: `inset(-2% ${50 * (1 - lr)}% -2% ${50 * (1 - lr)}%)`,
          }}
        />
      )}
      {/* João Pessoa */}
      {f >= VO.joaoPessoa - 4 && f < S6 + 10 && (
        <div style={{position: 'absolute', top: 690, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: 1 - logoOut}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
            <svg width={44} height={60} viewBox="-26 -36 52 70" style={{transform: `scale(${pop(f, VO.joaoPessoa - 4)})`}}>
              <path d="M 0 30 C -14 12 -22 2 -22 -10 A 22 22 0 0 1 22 -10 C 22 2 14 12 0 30 Z" fill={C.orange} />
              <circle cy={-10} r={8} fill="#FFFFFF" />
            </svg>
            <Reveal text="João Pessoa" start={VO.joaoPessoa - 2 - FROM_CASA} stagger={3} size={58} weight={700} color="#FFFFFF" style={{position: 'relative'}} />
          </div>
        </div>
      )}
      {/* textos do cartão */}
      {cardIn > 0.6 && (
        <div style={{position: 'absolute', left: 100, top: 0, width: 660, opacity: Math.min(1, (cardIn - 0.6) * 3) * tw(f, [S7 - 8, S7 - 2], [1, 0])}}>
          <Reveal text="Conheça os planos." start={S6 + 22 - FROM_CASA} size={60} color={C.blue} style={{top: 586, left: 0, right: 0}} />
          <div style={{position: 'absolute', top: 712, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 16}}>
            <svg width={44} height={64} viewBox="-26 -36 52 70" style={{marginTop: 6, transform: `scale(${pop(f, VO.cobertura - 4)})`}}>
              <path d="M 0 30 C -14 12 -22 2 -22 -10 A 22 22 0 0 1 22 -10 C 22 2 14 12 0 30 Z" fill={C.orange} />
              <circle cy={-10} r={8} fill="#FFFFFF" />
            </svg>
            <div style={{position: 'relative', width: 470, height: 130}}>
              <Reveal text={'Consulte a cobertura\nno seu bairro.'} start={VO.cobertura - 2 - FROM_CASA} stagger={2} size={44} weight={700} color={C.ink} align="left" style={{top: 0, left: 0}} />
            </div>
          </div>
        </div>
      )}
      {/* assinatura */}
      {f >= 830 && (
        <>
          <Reveal text={'A conexão começa\nem casa.'} start={834 - FROM_CASA} stagger={3} size={78} color="#FFFFFF" style={{top: 690, left: 0, right: 0}} />
          {f >= 858 && (
            <div style={{position: 'absolute', top: 930, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  background: C.orange,
                  borderRadius: 60,
                  padding: '14px 34px 14px 16px',
                  transform: `scale(${pop(f, 858, 30, 12)})`,
                  boxShadow: '0 14px 30px rgba(0,0,0,0.25)',
                }}
              >
                <svg width={64} height={64} viewBox="-72 -72 144 144">
                  <WhatsGlyph r={70} />
                </svg>
                <span style={{fontFamily: FONT, fontWeight: 700, fontSize: 38, color: C.ink, whiteSpace: 'nowrap'}}>Fale com a gente no WhatsApp.</span>
              </div>
            </div>
          )}
        </>
      )}
    </AbsoluteFill>
  );
};

/** Ícone simplificado de WhatsApp (balão + fone). */
const WhatsGlyph: React.FC<{r?: number}> = ({r = 72}) => (
  <g transform={`scale(${r / 70})`}>
    <circle r={70} fill={C.whats} />
    <path d="M -40 44 L -32 18 A 40 40 0 1 1 -14 36 Z" fill="none" stroke="#FFFFFF" strokeWidth={8} strokeLinejoin="round" />
    <path d="M -16 -20 Q -20 -10 -10 6 Q 2 22 18 24 Q 24 24 26 16 L 22 10 L 12 8 L 8 14 Q -2 10 -8 -2 L -2 -6 L -4 -16 L -10 -22 Q -14 -24 -16 -20 Z" fill="#FFFFFF" />
  </g>
);

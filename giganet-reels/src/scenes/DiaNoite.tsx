import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Character, Pose, ik, mixArm} from '../components/Character';
import {ConnLine, Pt, Track} from '../components/Line';
import {
  ArmchairBack,
  ArmchairFront,
  DocContent,
  Desk,
  Laptop,
  NotebookBook,
  OfficeChairBack,
  Pencil,
  Router,
  Screen,
  SeriesContent,
} from '../components/Props';
import {FLOOR_Y, Room} from '../components/Room';
import {C, FONT, ease, easeIn, easeOut, lerp, pop, tw} from '../theme';
import {blinkAt, DESK, LAPTOP, SEAT} from './Abertura';

/**
 * CENA 4 — Do dia à noite (começa em f396 com a íris da linha).
 * Frame local L. Termina em L204 (= f600), quando a câmera da cena 5 assume.
 */
export const S4_START = 396;
const W = {trabalho: 19, estudo: 56, diversao: 96};
export const TV_RECT = {cx: 760, cy: 800, w: 470};

/** Móveis da sala à noite — reaproveitados na cena 5 (casa). */
export const NightRoomFurniture: React.FC<{L: number; withChair?: boolean}> = ({L, withChair = true}) => (
  <g>
    <rect x={560} y={1430} width={440} height={170} rx={14} fill="#7E5434" />
    <rect x={580} y={1450} width={190} height={120} rx={8} fill="#6A452A" />
    <rect x={790} y={1450} width={190} height={120} rx={8} fill="#6A452A" />
    <g transform="translate(900 1416)">
      <Router />
    </g>
    <TVOnWall L={L} />
    {withChair && <ArmchairBack x={SEAT.x} y={SEAT.y} />}
    {withChair && <ArmchairFront x={SEAT.x} y={SEAT.y} />}
  </g>
);

const TVOnWall: React.FC<{L: number}> = ({L}) => {
  const h = TV_RECT.w * 0.5625;
  return (
    <g>
      <ellipse cx={TV_RECT.cx} cy={TV_RECT.cy} rx={420} ry={260} fill="#6FA8FF" opacity={0.13} />
      <rect x={TV_RECT.cx - TV_RECT.w / 2} y={TV_RECT.cy - h / 2} width={TV_RECT.w} height={h} rx={14} fill="#0B1733" />
      <Screen x={TV_RECT.cx - TV_RECT.w / 2 + 12} y={TV_RECT.cy - h / 2 + 12} w={TV_RECT.w - 24} h={h - 24}>
        <SeriesContent t={L} />
      </Screen>
    </g>
  );
};

const WordPill: React.FC<{L: number; at: number; until: number; text: string; bg: string; color: string}> = ({L, at, until, text, bg, color}) => {
  if (L < at - 1 || L > until + 12) return null;
  const tIn = tw(L, [at, at + 12], [0, 1], easeOut);
  const tOut = tw(L, [until, until + 10], [0, 1], easeIn);
  return (
    <div style={{position: 'absolute', top: 250, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
      <div
        style={{
          overflow: 'hidden',
          borderRadius: 60,
          background: bg,
          padding: '14px 54px 18px',
          transform: `scale(${0.85 + 0.15 * tIn}) translateY(${-tOut * 40}px)`,
          opacity: 1 - tOut,
          boxShadow: '0 18px 40px rgba(0,0,0,0.18)',
        }}
      >
        <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 92, color, transform: `translateY(${(1 - tIn) * 110}%)`, letterSpacing: -1}}>
          {text}
        </div>
      </div>
    </div>
  );
};

export const DiaNoite: React.FC = () => {
  const L = useCurrentFrame();
  const phase = L < 60 ? tw(L, [34, 60], [0, 0.5]) : tw(L, [80, 106], [0.5, 1]);

  // ---------- câmera
  const z = tw(L, [0, 90, 118], [1.18, 1.2, 1.0]);
  const cx = tw(L, [0, 90, 118], [620, 610, 540]);
  const cy = tw(L, [0, 90, 118], [1160, 1150, 960]);

  // ---------- íris (linha desenha o círculo e abre a nova cena)
  const iris = new Track(
    [
      [1180, 640],
      [880, 700],
      ...Array.from({length: 12}, (_, i) => {
        const a = -Math.PI / 2 + 0.35 + (i * Math.PI) / 6;
        return [540 + Math.cos(a) * 330, 960 + Math.sin(a) * 330] as Pt;
      }),
    ],
    false,
  );
  const irisU = tw(L, [0, 12], [0, iris.max], easeOut);
  const irisR = tw(L, [8, 26], [330, 1250], easeIn);
  const irisFade = tw(L, [20, 28], [1, 0]);

  // ---------- giro da cadeira (L78–96)
  const k = tw(L, [76, 96], [0, 1], ease);
  const spin = Math.max(0.03, Math.abs(Math.cos(Math.PI * k)));
  const night = k >= 0.5;

  // ---------- notebook -> TV (L84–104)
  const m = tw(L, [84, 106], [0, 1], ease);
  const lapH = LAPTOP.w * 0.63;
  const tvH = TV_RECT.w * 0.5625;
  const scr = {
    x0: lerp(LAPTOP.x - LAPTOP.w / 2, TV_RECT.cx - TV_RECT.w / 2, m),
    y0: lerp(LAPTOP.y - lapH, TV_RECT.cy - tvH / 2, m),
    w: lerp(LAPTOP.w, TV_RECT.w, m),
    h: lerp(lapH, tvH, m),
  };
  const deskTop = lerp(DESK.top, 1430, m);

  // ---------- pose
  const p: Pose = {...SEAT};
  const standUp = tw(L, [180, 196], [0, 1], ease);
  p.sit = 1 - standUp;
  p.y = lerp(SEAT.y, 1368, standUp);
  const studyT = tw(L, [44, 54], [0, 1]);
  const sofaT = night ? 1 : 0;
  p.lean = night
    ? tw(L, [96, 110, 172, 182, 196, 204], [-6, -4, -4, 12, 2, 0])
    : lerp(5 + Math.sin(L * 0.25) * 0.8, 1, studyT);
  p.bob = night ? tw(L, [176, 184, 194], [0, 10, 0]) : Math.sin(L * 0.5) * 1.2;
  p.headTurn = night ? tw(L, [96, 104, 186, 196], [0.6, 0.55, 0.55, 0]) : lerp(0.6, -0.1, studyT);
  p.headTilt = night ? tw(L, [180, 190], [-3, 0]) : lerp(Math.sin(L * 0.3) * 1.5, 9, studyT);
  p.lookX = night ? tw(L, [96, 104, 186, 196], [1, 1, 1, 0]) : lerp(1, -0.3, studyT);
  p.lookY = night ? tw(L, [186, 196], [-0.1, 0]) : lerp(0.35, 1, studyT);
  p.mouth = night ? 'grin' : studyT > 0.5 ? 'smile' : 'smile';
  p.blink = blinkAt(L, [30, 74, 128, 160]);
  p.browL = night ? tw(L, [100, 106], [0, 0.4]) : 0;
  p.browR = p.browL;

  if (!night) {
    // trabalho -> estudo
    const typeR: Pt = [650 + Math.sin(L * 1.4) * 10, 1244 - Math.abs(Math.sin(L * 1.4)) * 8];
    const typeL: Pt = [565 + Math.cos(L * 1.7) * 10, 1250 - Math.abs(Math.cos(L * 1.7)) * 8];
    const book: Pt = [378, 1300];
    const pen: Pt = [470 + Math.sin(L * 0.9) * 16, 1262 + Math.cos(L * 1.8) * 4];
    p.armR = mixArm(ik(p, 'R', typeR), ik(p, 'R', pen, 1), studyT);
    p.armL = mixArm(ik(p, 'L', typeL), ik(p, 'L', book, 1), studyT);
  } else {
    const restL: Pt = [292, 1336];
    const restR: Pt = [628, 1336];
    const sitArmsL = ik(p, 'L', restL, 1);
    const sitArmsR = ik(p, 'R', restR, 1);
    p.armL = mixArm(sitArmsL, [10, -6], standUp);
    p.armR = mixArm(sitArmsR, [10, -6], standUp);
  }
  void sofaT;

  const bookPop = pop(L, 46, 30, 10);
  const bookOut = tw(L, [76, 84], [1, 0]);

  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <defs>
          <clipPath id="s4-iris">
            <circle cx={540} cy={960} r={irisR} />
          </clipPath>
        </defs>
        <g clipPath="url(#s4-iris)">
          <g transform={`translate(540 960) scale(${z}) translate(${-cx} ${-cy})`}>
            <Room phase={phase} id="s4-room">
              {/* móveis noturnos surgem com a transformação */}
              <g opacity={m}>
                <g transform={`translate(900 1416) scale(${m})`}>
                  <Router />
                </g>
              </g>
              {/* mesa -> rack */}
              {m < 1 ? (
                <Desk x0={lerp(DESK.x0, 560, m)} x1={lerp(DESK.x1, 1000, m)} top={deskTop} floor={FLOOR_Y} />
              ) : (
                <NightRoomFurniture L={L} withChair={false} />
              )}
              {/* tela do notebook se expande e vira TV */}
              {m < 1 && (
                <g>
                  <g opacity={1 - tw(L, [84, 92], [0, 1])}>
                    <path
                      d={`M ${LAPTOP.x - LAPTOP.w / 2 - 22} ${LAPTOP.y} L ${LAPTOP.x + LAPTOP.w / 2 + 22} ${LAPTOP.y} L ${LAPTOP.x + LAPTOP.w / 2 + 42} ${LAPTOP.y + 24} L ${LAPTOP.x - LAPTOP.w / 2 - 42} ${LAPTOP.y + 24} Z`}
                      fill="#C9CED8"
                    />
                  </g>
                  <rect x={scr.x0} y={scr.y0} width={scr.w} height={scr.h} rx={14 + 2 * m} fill="#0B1733" />
                  <Screen x={scr.x0 + 12} y={scr.y0 + 12} w={scr.w - 24} h={scr.h - 22 - 2 * m}>
                    <DocContent t={L / 30} />
                    <g opacity={m}>
                      <SeriesContent t={L} />
                    </g>
                  </Screen>
                </g>
              )}
              {/* cadeira + personagem giram juntas */}
              <g transform={`translate(${SEAT.x} 0) scale(${spin} 1) translate(${-SEAT.x} 0)`}>
                {night ? <ArmchairBack x={SEAT.x} y={SEAT.y} /> : <OfficeChairBack x={SEAT.x} y={SEAT.y} />}
                <Character pose={p} />
                {night && <ArmchairFront x={SEAT.x} y={SEAT.y} />}
                {!night && L >= 45 && (
                  <g opacity={bookOut}>
                    <g transform={`translate(425 1292) rotate(-6) scale(${0.42 * bookPop})`}>
                      <NotebookBook lines={tw(L, [52, 76], [0, 1])} />
                    </g>
                    <g transform={`translate(${470 + Math.sin(L * 0.9) * 16 + 4} ${1262 + Math.cos(L * 1.8) * 4 - 40}) rotate(24) scale(${0.55 * bookPop})`}>
                      <Pencil />
                    </g>
                  </g>
                )}
              </g>
            </Room>
          </g>
        </g>
        <g opacity={irisFade}>
          <ConnLine track={iris} to={irisU} width={16} head={irisU < iris.max - 0.01} />
        </g>
        {/* borda da íris acompanha a abertura */}
        {L > 8 && L < 26 && (
          <circle cx={540} cy={960} r={irisR} fill="none" stroke={C.orange} strokeWidth={10} opacity={irisFade} />
        )}
      </svg>
      <WordPill L={L} at={W.trabalho} until={W.estudo - 6} text="Trabalho." bg={C.blue} color="#FFFFFF" />
      <WordPill L={L} at={W.estudo} until={W.diversao - 6} text="Estudo." bg={C.blue} color="#FFFFFF" />
      <WordPill L={L} at={W.diversao} until={170} text="Diversão." bg={C.orange} color={C.ink} />
    </AbsoluteFill>
  );
};

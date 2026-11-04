import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Character, LOOKS, Pose, handPos, ik, mixArm} from '../components/Character';
import {ConnLine, Pt, Track} from '../components/Line';
import {ChatTela, DoorLeaf, MesaCentro, MusicaTela, Nota, Phone, ROUTER, Sala, SEATS, SOFA, SofaBack, SofaFront, VideoTela} from '../components/Sala';
import {C, ease, easeIn, easeOut, lerp, pop, tw} from '../theme';
import {SCENES, VO} from '../timeline';
import {blinkAt} from './Porta';

/**
 * CENAS 3 e 4 — os momentos no sofá e o encontro (frames absolutos 150–440).
 * A tela de cada celular vira a moldura da ação seguinte.
 */
export const FROM = SCENES.momentos; // 150

const T = {
  video: VO.video - 4, // 200
  musica: VO.musica - 4, // 252
  foto: VO.foto - 2, // 288
  flash: VO.foto + 14, // 304
  enviar: VO.grupo + 6, // 318
  fim: SCENES.encontro, // 341
};

// ---------- câmera
export const camMomentos = (f: number) => {
  const push = tw(f, [T.video + 4, T.video + 16, T.musica - 4, T.musica + 4], [0, 1, 1, 0], ease);
  return {
    cx: tw(f, [150, T.fim + 2, T.fim + 32, 440], [1550, 1550, 1260, 1240]) + push * -110,
    cy: tw(f, [150, T.fim + 2, T.fim + 32, 440], [1180, 1180, 1250, 1250]) + push * -20,
    z: tw(f, [150, T.fim + 2, T.fim + 32, 440], [1.0, 1.0, 0.68, 0.66]) * (1 + push * 0.55),
  };
};

const toScreen = (f: number, p: Pt): Pt => {
  const c = camMomentos(f);
  return [540 + (p[0] - c.cx) * c.z, 960 + (p[1] - c.cy) * c.z];
};

// aproximação para a selfie
const squeeze = (f: number) => tw(f, [T.foto - 6, T.foto + 8, T.enviar + 4, T.enviar + 18], [0, 1, 1, 0], ease);

/** relax = 1: todos recostados (cena 7) */
export const posesMomentos = (f: number, relax = 0) => {
  const sq = squeeze(f);
  const encontro = tw(f, [T.fim, T.fim + 10], [0, 1]);
  const laughAll = encontro;

  // ---- visita
  const v: Pose = {x: lerp(SEATS.visita, SEATS.visita + 80, sq), y: SOFA.seat, s: 0.95, sit: 1, look: LOOKS.visita};
  const show = tw(f, [T.video, T.video + 6, T.video + 14], [0, -0.2, 1], ease) * tw(f, [T.musica, T.musica + 10], [1, 0]);
  const laughV = tw(f, [T.video + 22, T.video + 28, T.musica], [0, 1, 0]);
  v.lean = lerp(0, 8, show) + lerp(0, 10, sq) - relax * 5;
  v.headTurn = show > 0.3 ? 0.6 : sq > 0.3 ? 0.3 : encontro > 0 ? 0.5 * Math.sin(f * 0.12) + 0.2 : 0;
  v.lookX = show > 0.3 ? 1 : sq > 0.3 ? 0 : encontro > 0 ? Math.sin(f * 0.12) : 0;
  v.lookY = show > 0.3 ? 0.6 : f < T.video ? 0.9 : 0;
  v.headTilt = lerp(0, 6, sq) + (f < T.video ? 8 : 0);
  v.mouth = laughV > 0.4 || sq > 0.5 || laughAll > 0.5 || relax ? 'grin' : 'smile';
  v.blink = Math.max(blinkAt(f, [180, 236, 380]), laughV * 0.75);
  v.bob = Math.sin(f * 0.9) * 4 * Math.max(laughV, laughAll * 0.6);
  // braços sempre por IK até alvos reais: colo, celular, rosto
  const vPhoneRest: Pt = [v.x + 45, 1335]; // celular no colo, olhando para baixo
  const vPhoneShow: Pt = [v.x + 130, 1225]; // virado para a amiga
  const vPhone: Pt = [lerp(vPhoneRest[0], vPhoneShow[0], show), lerp(vPhoneRest[1], vPhoneShow[1], show)];
  const vLap: Pt = [v.x - 38, 1405];
  const vPeace: Pt = [v.x - 70, 1105]; // "paz e amor" na selfie
  v.armR = relax ? ik(v, 'R', [v.x + 38, 1405], 1) : ik(v, 'R', vPhone, -1);
  const vl = ik(v, 'L', [lerp(vLap[0], vPeace[0], sq), lerp(vLap[1], vPeace[1], sq)], 1);
  v.armL = vl;
  v.pointL = sq > 0.6;

  // ---- amiga
  const a: Pose = {x: SEATS.amiga, y: SOFA.seat, s: 0.95, sit: 1, look: LOOKS.amiga};
  a.headTurn = show > 0.3 ? -0.5 : sq > 0.3 ? 0 : encontro > 0 ? -0.5 * Math.sin(f * 0.12 + 1.5) : -0.2;
  a.lookX = show > 0.3 ? -1 : sq > 0.3 ? 0 : encontro > 0 ? -Math.sin(f * 0.12 + 1.5) : 0.6;
  a.lookY = show > 0.3 ? 0.5 : 0;
  a.mouth = laughV > 0.4 || sq > 0.5 || laughAll > 0.5 || relax ? 'grin' : 'smile';
  a.blink = Math.max(blinkAt(f, [196, 300, 400]), laughV * 0.8);
  a.browL = laughV * 0.6;
  a.browR = laughV * 0.6;
  a.bob = Math.sin(f * 0.9 + 1) * 4 * Math.max(laughV, laughAll * 0.6) - sq * 6;
  a.headTilt = lerp(0, -4, sq) + laughV * -6;
  a.lean = -relax * 5;
  // mão na boca de tanto rir
  const aLapL: Pt = [a.x - 38, 1405];
  const aMouth: Pt = [a.x - 8, 1165];
  a.armL = ik(a, 'L', [lerp(aLapL[0], aMouth[0], laughV), lerp(aLapL[1], aMouth[1], laughV)], 1);
  a.armR = ik(a, 'R', [a.x + 38, 1405], 1);

  // ---- anfitriã
  const h: Pose = {x: lerp(SEATS.anfitria, SEATS.anfitria - 80, sq), y: SOFA.seat, s: 0.95, sit: 1, look: LOOKS.anfitria};
  const music = tw(f, [T.musica - 6, T.musica + 2], [0, 1]) * tw(f, [T.foto, T.foto + 8], [1, 0]);
  h.headTurn = music > 0.3 ? -0.3 : sq > 0.3 ? -0.3 : encontro > 0 ? -0.5 * Math.sin(f * 0.12 + 3) - 0.2 : -0.5;
  h.lookX = music > 0.3 ? -0.6 : sq > 0.3 ? 0 : encontro > 0 ? -Math.sin(f * 0.12 + 3) - 0.3 : -1;
  h.lookY = music > 0.3 ? 0.8 : sq > 0.3 ? -0.4 : 0;
  h.mouth = sq > 0.5 || laughAll > 0.5 || relax ? 'grin' : 'smile';
  h.blink = Math.max(blinkAt(f, [170, 226, 330, 410]), laughV * 0.5);
  h.headTilt = lerp(0, -8, sq);
  h.bob = Math.sin(f * 0.9 + 2) * 4 * Math.max(laughV * 0.5, laughAll * 0.6);
  h.lean = lerp(0, -6, sq) - relax * 5;
  const hPhoneRest: Pt = [h.x - 45, 1335];
  const hPhoneUp: Pt = [h.x - 55, 1270]; // ergue para escolher a música
  const hp: Pt = [lerp(hPhoneRest[0], hPhoneUp[0], music), lerp(hPhoneRest[1], hPhoneUp[1], music)];
  const hLapR: Pt = [h.x + 38, 1405];
  const selfie: Pt = [h.x + 40, 1015];
  h.armL = relax ? ik(h, 'L', [h.x - 38, 1405], 1) : ik(h, 'L', hp, -1);
  h.armR = ik(h, 'R', [lerp(hLapR[0], selfie[0], sq), lerp(hLapR[1], selfie[1], sq)], sq > 0.3 ? -1 : 1);
  return {v, a, h, show, music, sq};
};

/** Sala + sofá + personagens (sem câmera). Reutilizado na janela da casa. */
export const MundoSala: React.FC<{f: number; relax?: number; phones?: boolean}> = ({f, relax = 0, phones = true}) => {
  const {v, a, h, show} = posesMomentos(f, relax);
  const vh = handPos(v, 'R');
  const hh = handPos(h, 'L');
  const sh = handPos(h, 'R');
  const sq = squeeze(f);
  return (
    <Sala f={f} doorOpen={0}>
      <DoorLeaf open={0} />
      <SofaBack />
      <Character pose={v} />
      <Character pose={a} />
      <Character pose={h} />
      <SofaFront />
      <MesaCentro />
      {phones && !relax && (
        <g>
          {/* celular da visita: de costas, depois virado para a amiga */}
          <Phone x={vh[0]} y={vh[1] - 30} rot={lerp(-10, 8, show)} s={0.95} front={show > 0.5}>
            <VideoTela t={f} />
          </Phone>
          {/* celular da anfitriã (música / câmera / conversa) */}
          {sq < 0.5 ? (
            <Phone x={hh[0]} y={hh[1] - 30} rot={8} s={0.95}>
              <MusicaTela t={f} playing={1} />
            </Phone>
          ) : (
            <Phone x={sh[0]} y={sh[1] - 40} rot={-10} s={0.95} front={false} />
          )}
        </g>
      )}
    </Sala>
  );
};

// ---------- linha da internet (cena 4)
export const lineTrack = (_f: number) =>
  // sai do roteador, contorna o grupo pelo sofá (sem cruzar rostos) e sobe para a transição
  new Track(
    [
      [ROUTER[0], ROUTER[1] + 30],
      [1250, 975],
      [1085, 1150],
      [1080, 1500],
      [1300, 1700],
      [1800, 1700],
      [2020, 1500],
      [2030, 1100],
      [2200, 650],
      [2550, 200],
    ],
    false,
    30,
  );

export const Momentos: React.FC = () => {
  const f = useCurrentFrame() + FROM;
  const c = camMomentos(f);
  const {h} = posesMomentos(f);

  // ---- moldura que viaja entre as telas
  const hh = toScreen(f, handPos(h, 'L'));
  const phoneRect = {x: hh[0] - 24, y: hh[1] - 30 * c.z - 45 * c.z, w: 48 * c.z, h: 90 * c.z};
  const big = {x: 260, y: 420, w: 560, h: 1050};
  const finder = {x: 150, y: 640, w: 780, h: 640};
  const grow = tw(f, [T.musica, T.musica + 12], [0, 1], easeOut);
  const toFinder = tw(f, [T.foto, T.foto + 12], [0, 1], ease);
  const toChat = tw(f, [T.flash + 4, T.flash + 14], [0, 1], ease);
  const shrink = tw(f, [T.fim - 2, T.fim + 10], [0, 1], easeIn);
  const R = (() => {
    const l = (a: typeof big, b: typeof big, t: number) => ({x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t), w: lerp(a.w, b.w, t), h: lerp(a.h, b.h, t)});
    let r = l(phoneRect, big, grow);
    if (f >= T.foto) r = l(big, finder, toFinder);
    if (f >= T.flash + 4) r = l(finder, big, toChat);
    if (f >= T.fim - 2) r = l(big, phoneRect, shrink);
    return r;
  })();
  const cardOn = f >= T.musica && shrink < 1;
  const radius = lerp(16, 46, Math.min(grow, 1 - shrink));
  const mode: 'musica' | 'camera' | 'chat' = f < T.foto + 6 ? 'musica' : f < T.flash + 8 ? 'camera' : 'chat';
  const contentAlpha = mode === 'camera' ? tw(f, [T.foto, T.foto + 8], [1, 0]) : 1;
  const flash = tw(f, [T.flash, T.flash + 2, T.flash + 10], [0, 1, 0]);
  const dim = cardOn ? (mode === 'camera' ? 0.45 : 0.35) * Math.min(grow, 1 - shrink) : 0;

  // ---- linha
  const track = lineTrack(f);
  const lineU = tw(f, [T.fim + 20, T.fim + 70], [0, track.max], (t) => t);
  const pulses = f > T.fim + 78 ? [0, 1].map((i) => ((f - T.fim - 78) * 0.25 + i * 3.5) % track.max) : [];

  return (
    <AbsoluteFill style={{background: '#ECE9EA'}}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <defs>
          <mask id="m-dim">
            <rect width={1080} height={1920} fill="#FFFFFF" />
            <rect x={R.x} y={R.y} width={R.w} height={R.h} rx={radius} fill="#000" />
          </mask>
        </defs>
        <g transform={`translate(540 960) scale(${c.z}) translate(${-c.cx} ${-c.cy})`}>
          <MundoSala f={f} />
          {f >= T.fim + 20 && <ConnLine track={track} to={lineU} width={28} head={lineU < track.max} pulses={pulses} />}
        </g>
        {/* escurece o fundo enquanto a tela está ampliada */}
        {dim > 0 && <rect width={1080} height={1920} fill={C.navy} opacity={dim} mask="url(#m-dim)" />}
        {cardOn && (
          <g>
            {mode !== 'camera' && <rect x={R.x - 14} y={R.y - 14} width={R.w + 28} height={R.h + 28} rx={radius + 12} fill="#0B1733" />}
            {mode === 'musica' && (
              <g opacity={contentAlpha}>
                <svg x={R.x} y={R.y} width={R.w} height={R.h} viewBox="0 0 400 750" preserveAspectRatio="none">
                  <MusicaTela t={f} playing={f >= T.musica + 16 ? 1 : 0} />
                  {/* toque no play */}
                  {f >= T.musica + 14 && f < T.musica + 30 && (
                    <circle cx={200} cy={620} r={52 + (f - T.musica - 14) * 5} fill="none" stroke="#FFFFFF" strokeWidth={6} opacity={1 - (f - T.musica - 14) / 16} />
                  )}
                </svg>
              </g>
            )}
            {mode === 'camera' && (
              <g>
                <rect x={R.x} y={R.y} width={R.w} height={R.h} rx={radius} fill="none" stroke="#FFFFFF" strokeWidth={5} opacity={0.6} />
                {[
                  [R.x, R.y, 1, 1],
                  [R.x + R.w, R.y, -1, 1],
                  [R.x, R.y + R.h, 1, -1],
                  [R.x + R.w, R.y + R.h, -1, -1],
                ].map(([x, y, sx, sy], i) => (
                  <path key={i} d={`M ${x + sx * 70} ${y} L ${x} ${y} L ${x} ${y + sy * 70}`} fill="none" stroke="#FFFFFF" strokeWidth={12} strokeLinecap="round" />
                ))}
                <circle cx={R.x + R.w / 2} cy={R.y + R.h + 80} r={44} fill="#FFFFFF" stroke={C.orange} strokeWidth={10} />
              </g>
            )}
            {mode === 'chat' && (
              <svg x={R.x} y={R.y} width={R.w} height={R.h} viewBox="0 0 400 750" preserveAspectRatio="none">
                <ChatTela sent={tw(f, [T.enviar, T.enviar + 8], [0, 1], easeOut)} ticks={f > T.enviar + 14 ? 1 : 0}>
                  {/* a foto: o mesmo instante capturado no visor */}
                  <svg width={400} height={320} viewBox={`${finder.x} ${finder.y} ${finder.w} ${finder.h}`} preserveAspectRatio="xMidYMid slice">
                    <g transform={`translate(540 960) scale(1) translate(-1550 -1180)`}>
                      <MundoSala f={T.flash} phones={false} />
                    </g>
                  </svg>
                </ChatTela>
              </svg>
            )}
          </g>
        )}
        {/* notas musicais saindo da tela */}
        {f >= T.musica + 16 && f < T.foto + 10 &&
          [0, 1, 2, 3, 4, 5].map((i) => {
            const t0 = T.musica + 16 + i * 3;
            const k = tw(f, [t0, t0 + 26], [0, 1], (t) => t);
            if (k <= 0) return null;
            const side = i % 2 ? 1 : -1;
            const x = 540 + side * (300 + k * 120 + i * 10);
            const y = 900 - k * 380 + Math.sin(k * 8 + i) * 20;
            return <Nota key={i} x={x} y={y} s={pop(f, t0, 30, 9) * (1.2 - k * 0.3)} kind={i % 2} color={i % 3 === 0 ? C.orange : i % 3 === 1 ? '#FFFFFF' : '#5BC0EB'} />;
          })}
        {/* flash da foto */}
        {flash > 0 && <rect width={1080} height={1920} fill="#FFFFFF" opacity={flash} />}
      </svg>
    </AbsoluteFill>
  );
};
void pop;

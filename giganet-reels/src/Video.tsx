import React from 'react';
import {AbsoluteFill, Audio, Sequence, interpolate, staticFile} from 'remotion';
import {Abertura} from './scenes/Abertura';
import {DiaNoite, S4_START} from './scenes/DiaNoite';
import {Fechamento} from './scenes/Fechamento';
import {SCENES, TOTAL_FRAMES, VO} from './timeline';

/** Efeitos sonoros: [frame, arquivo, volume] — edite aqui para re-sincronizar. */
const SFX: [number, string, number][] = [
  // cena 1 — clique no play, espera e "pegada"
  [5, 'click', 0.45],
  ...[12, 22, 32, 42, 52, 62, 72].map((f) => [f, 'tick', 0.16] as [number, string, number]),
  [90, 'grab', 0.4],
  // cena 2 — linha desenrola, objetos surgem
  [104, 'whoosh', 0.35],
  [VO.reuniao + 6, 'pop1', 0.35],
  [VO.aula + 1, 'pop2', 0.35],
  [VO.partida + 1, 'pop3', 0.35],
  [VO.serie, 'pop4', 0.38],
  // cena 3 — revelação da marca (o groove da trilha entra aqui)
  [256, 'whoosh-curto', 0.3],
  [292, 'chime', 0.42],
  [VO.joaoPessoa - 4, 'blip', 0.22],
  // cena 4
  [S4_START, 'whoosh', 0.32],
  [S4_START + 19, 'click', 0.25],
  [S4_START + 56, 'click', 0.25],
  [S4_START + 76, 'whoosh-curto', 0.32],
  [S4_START + 96, 'pop3', 0.28],
  // cena 5 — zoom e conexão dos cômodos
  [SCENES.casa, 'whoosh-grave', 0.4],
  ...[2, 3, 5, 7, 9].map((k, i) => [SCENES.casa + 14 + Math.round((k / 9) * 48), 'blip', 0.16 + i * 0.01] as [number, string, number]),
  // cena 6 — moldura e WhatsApp
  [SCENES.contato, 'whoosh-curto', 0.3],
  [SCENES.contato + 30, 'pop2', 0.35],
  [VO.planos - 6, 'blip', 0.18],
  [VO.cobertura - 4, 'blip', 0.18],
  // cena 7 — assinatura
  [SCENES.assinatura, 'whoosh', 0.3],
  [SCENES.assinatura + 8, 'chime', 0.35],
  [SCENES.assinatura + 66, 'whoosh-curto', 0.25],
  [SCENES.assinatura + 78, 'pop4', 0.35],
  [SCENES.assinatura + 84, 'click', 0.3],
];

export const GiganetReels: React.FC = () => (
  <AbsoluteFill style={{background: '#061A44'}}>
    {/* cenas 1–3 (plano contínuo) */}
    <Sequence from={0} durationInFrames={S4_START + 30} name="Cenas 1-3 · Gancho, Rotina, Giganet JP">
      <Abertura />
    </Sequence>
    {/* cena 4 (abre por íris da linha) */}
    <Sequence from={S4_START} durationInFrames={SCENES.casa - S4_START} name="Cena 4 · Do dia à noite">
      <DiaNoite />
    </Sequence>
    {/* cenas 5–7 (casa → contato → assinatura) */}
    <Sequence from={SCENES.casa} durationInFrames={TOTAL_FRAMES - SCENES.casa} name="Cenas 5-7 · Casa, Contato, Assinatura">
      <Fechamento />
    </Sequence>

    {/* ÁUDIO */}
    <Audio src={staticFile('narracao.mp3')} volume={1} />
    <Audio
      src={staticFile('trilha.wav')}
      volume={(f) => interpolate(f, [0, 100, TOTAL_FRAMES - 20, TOTAL_FRAMES], [0.32, 0.32, 0.32, 0], {extrapolateRight: 'clamp'})}
    />
    {SFX.map(([f, name, vol], i) => (
      <Sequence key={i} from={f} durationInFrames={60} name={`sfx ${name}`} layout="none">
        <Audio src={staticFile(`sfx/${name}.wav`)} volume={vol} />
      </Sequence>
    ))}
  </AbsoluteFill>
);

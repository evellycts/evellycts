import React from 'react';
import {AbsoluteFill, Audio, Sequence, interpolate, staticFile} from 'remotion';
import {Casa, FROM_CASA} from './scenes/Casa';
import {FROM, Momentos} from './scenes/Momentos';
import {Porta} from './scenes/Porta';
import {SCENES, TOTAL_FRAMES, VO} from './timeline';

/** Efeitos sonoros: [frame, arquivo, volume]. Edite aqui para re-sincronizar. */
const SFX: [number, string, number][] = [
  // cena 1 — porta abrindo e marcação de surpresa
  [0, 'porta', 0.45],
  [24, 'surpresa', 0.32],
  // cena 2 — caminho até o sofá; porta fecha (transição)
  [78, 'whoosh-curto', 0.2],
  [112, 'pop2', 0.28],
  [146, 'porta', 0.35],
  // cena 3 — vídeo, música, foto
  [VO.video, 'whoosh-curto', 0.25],
  [VO.musica - 4, 'whoosh-curto', 0.25],
  [VO.musica + 10, 'click', 0.4], // toque na tela
  [VO.musica + 14, 'nota', 0.25],
  [VO.musica + 22, 'nota', 0.2],
  [VO.foto - 2, 'whoosh-curto', 0.22],
  [VO.foto + 14, 'foto', 0.5], // disparo da foto
  [VO.grupo + 6, 'enviar', 0.4], // envio da mensagem
  // cena 4 — afastamento e linha
  [SCENES.encontro, 'whoosh', 0.28],
  [SCENES.encontro + 32, 'blip', 0.16],
  [SCENES.encontro + 56, 'blip', 0.16],
  // cena 5 — casa e marca
  [SCENES.giganet, 'whoosh-grave', 0.38],
  [458, 'chime', 0.38],
  [VO.joaoPessoa - 4, 'blip', 0.2],
  // cena 6 — cartão de contato
  [SCENES.contato, 'whoosh-curto', 0.26],
  [SCENES.contato + 14, 'pop2', 0.34],
  [VO.cobertura - 4, 'blip', 0.2],
  // cena 7 — sofá e assinatura
  [SCENES.assinatura + 2, 'whoosh', 0.28],
  [806, 'whoosh', 0.26],
  [830, 'chime', 0.34],
  [858, 'pop4', 0.32],
];

export const GiganetSenhaWifi: React.FC = () => (
  <AbsoluteFill style={{background: '#061A44'}}>
    <Sequence from={FROM} durationInFrames={FROM_CASA - FROM + 2} name="Cenas 3-4 · Momentos e encontro">
      <Momentos />
    </Sequence>
    <Sequence from={0} durationInFrames={170} name="Cenas 1-2 · A pergunta / Antes de sentar">
      <Porta />
    </Sequence>
    <Sequence from={FROM_CASA} durationInFrames={TOTAL_FRAMES - FROM_CASA} name="Cenas 5-7 · Casa, contato, assinatura">
      <Casa />
    </Sequence>

    <Audio src={staticFile('narracao.mp3')} volume={1} />
    <Audio
      src={staticFile('trilha.wav')}
      volume={(f) => interpolate(f, [0, TOTAL_FRAMES - 20, TOTAL_FRAMES], [0.3, 0.3, 0], {extrapolateRight: 'clamp'})}
    />
    {SFX.map(([f, name, vol], i) => (
      <Sequence key={i} from={f} durationInFrames={60} name={`sfx ${name}`} layout="none">
        <Audio src={staticFile(`sfx/${name}.wav`)} volume={vol} />
      </Sequence>
    ))}
  </AbsoluteFill>
);

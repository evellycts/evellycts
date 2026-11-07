import React from 'react';
import {AbsoluteFill, Audio, Sequence, interpolate, staticFile} from 'remotion';
import {Colinas} from './scenes/Colinas';
import {SCENES as S, TOTAL_FRAMES, VO} from './timeline';

/** Efeitos sonoros: [frame, arquivo, volume]. Edite aqui para re-sincronizar. */
const SFX: [number, string, number][] = [
  [0, 'pouso', 0.5], // chegada do marcador (baque em ~f12)
  [16, 'pop2', 0.32], // placa surge
  [30, 'whoosh', 0.22],
  [60, 'blip', 0.18],
  [S.apresentacao, 'whoosh-curto', 0.25], // haste vira linha
  [S.apresentacao + 54, 'chime', 0.38], // revelação da marca
  [VO.colinas2 - 2, 'blip', 0.2],
  [VO.joaoPessoa - 4, 'blip', 0.2],
  [S.espalhe + 2, 'giro', 0.42], // placa gira e vira celular
  [VO.grupo + 10, 'mensagem', 0.45], // mensagem no grupo
  [VO.novidade + 4, 'pop3', 0.3],
  [VO.novidade + 16, 'pop4', 0.3],
  [S.consulte, 'whoosh', 0.28],
  [S.consulte + 18, 'click', 0.3],
  [VO.suaRua - 6, 'blip', 0.2],
  [S.whatsapp, 'whoosh-curto', 0.26],
  [S.whatsapp + 16, 'pop2', 0.32],
  [VO.consulte - 4, 'blip', 0.2],
  [S.assinatura, 'whoosh-grave', 0.32],
  [S.assinatura + 20, 'chime', 0.36],
  [VO.agoraTambem + 14, 'pop4', 0.32],
];

export const GiganetColinas: React.FC = () => (
  <AbsoluteFill style={{background: '#F4F7FB'}}>
    <Sequence from={0} durationInFrames={TOTAL_FRAMES} name="Tem novidade na área (cenas 1–6)">
      <Colinas />
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

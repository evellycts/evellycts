/**
 * Linha do tempo sincronizada com public/narracao.mp3 (31,4 s).
 * Tempos medidos pela detecção de pausas da voz (ffmpeg silencedetect).
 * Altere aqui para reajustar todas as cenas de uma vez.
 */
export const FPS = 30;
export const s = (sec: number) => Math.round(sec * FPS);

export const TOTAL_FRAMES = s(33); // 990 – sustenta a tela final após a voz

// Marcas da narração (segundos -> frames)
export const VO = {
  rotinaNaoEspera: s(0.0),
  internetAcompanha: s(1.94),
  tem: s(3.6),
  reuniao: s(3.85),
  aula: s(4.61),
  partida: s(5.23),
  serie: s(6.55),
  conheca: s(9.08),
  giganet: s(9.75),
  jotaPe: s(10.55),
  provedor: s(11.17),
  joaoPessoa: s(12.35),
  bomDia: s(13.69),
  episodio: s(14.8),
  noite: s(15.95),
  temMuita: s(16.68),
  mundo: s(19.0),
  eAi: s(20.08),
  vamosColocar: s(20.72),
  fale: s(23.12),
  whatsapp: s(24.87),
  planos: s(25.6),
  cobertura: s(26.44),
  assinatura: s(27.71),
  proximoPlay: s(29.4),
  play: s(30.1),
  fimVoz: s(31.24),
};

// Cenas (frame inicial)
export const SCENES = {
  gancho: 0,
  rotina: s(3.6), // 108
  marca: s(9.07), // 272
  diaNoite: s(13.7), // 411
  casa: s(20.0), // 600
  contato: s(23.1), // 693
  assinatura: s(27.65), // 830
  fim: TOTAL_FRAMES,
};

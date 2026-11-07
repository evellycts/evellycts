/**
 * Linha do tempo sincronizada com public/narracao.mp3 (25,3 s).
 * Tempos medidos pelas pausas da voz (ffmpeg silencedetect).
 */
export const FPS = 30;
export const s = (sec: number) => Math.round(sec * FPS);
export const TOTAL_FRAMES = s(27.5); // 825 — sustenta a tela final após a voz

export const VO = {
  alo: 0, // "Alô, Colinas do Sul!"
  colinas1: s(0.57),
  chegou: s(1.91), // "A Giganet Jota Pê chegou ao seu bairro!"
  agora: s(5.03), // "Agora estamos atendendo"
  tambemNo: s(6.37), // "também no"
  colinas2: s(6.96), // "Colinas do Sul,"
  joaoPessoa: s(8.1), // "em João Pessoa."
  grupo: s(9.37), // "Já avisa no grupo dos vizinhos:"
  novidade: s(11.2), // "tem novidade na área!"
  planos: s(13.17), // "Quer conhecer os planos e saber se atendemos na sua rua?"
  suaRua: s(15.1),
  fale: s(16.26), // "Fale com a Giganet no WhatsApp"
  consulte: s(18.13), // "e consulte a disponibilidade para o seu endereço."
  assinatura: s(21.21), // "Giganet Jota Pê."
  agoraTambem: s(22.93), // "Agora também no Colinas do Sul!"
  fimVoz: s(25.08),
};

export const SCENES = {
  novidade: 0,
  apresentacao: s(5.0), // 150
  espalhe: s(9.35), // 281
  consulte: s(13.12), // 394
  whatsapp: s(16.25), // 488
  assinatura: s(21.2), // 636
};

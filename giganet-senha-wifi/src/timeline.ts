/**
 * Linha do tempo sincronizada com public/narracao.mp3 (29,3 s).
 * Tempos medidos pelas pausas da voz (ffmpeg silencedetect).
 */
export const FPS = 30;
export const s = (sec: number) => Math.round(sec * FPS);

export const TOTAL_FRAMES = s(31.5); // 945 — sustenta a tela final após a voz

export const VO = {
  senha: s(0.09), // "Qual é a senha do Wi-Fi?"
  temVisita: s(1.67), // "Tem visita que pergunta isso antes mesmo de sentar!"
  sentar: s(4.2),
  quandoPercebe: s(5.11), // "E, quando você percebe,"
  video: s(6.81), // "já tem gente mostrando vídeo,"
  musica: s(8.52), // "escolhendo música"
  foto: s(9.65), // "e mandando foto no grupo."
  grupo: s(10.4),
  encontros: s(11.43), // "A internet faz parte desses encontros."
  giganet: s(14.14), // "E a Giganet Jota Pê quer fazer parte da sua casa!"
  suaCasa: s(16.2),
  provedor: s(17.71), // "Seu provedor de internet em João Pessoa."
  joaoPessoa: s(18.9),
  planos: s(20.22), // "Quer conhecer os planos?"
  fale: s(21.55), // "Fale com a Giganet no WhatsApp e consulte a cobertura no seu bairro."
  whatsapp: s(23.2),
  cobertura: s(24.07),
  assinatura: s(25.63), // "Giganet Jota Pê."
  conexao: s(27.29), // "A conexão começa em casa."
  fimVoz: s(29.14),
};

export const SCENES = {
  pergunta: 0,
  antesDeSentar: VO.temVisita, // 50
  momentos: s(5.0), // 150 – porta fecha e vira a transição
  encontro: VO.encontros - 2, // 341
  giganet: VO.giganet - 2, // 422
  contato: VO.planos - 2, // 605
  assinatura: VO.assinatura - 2, // 767
  fim: TOTAL_FRAMES,
};

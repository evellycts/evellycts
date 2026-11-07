# Giganet JP — "Sua vida no play" (Reels 9:16)

Animação em motion design para Instagram Reels: 1080×1920, 30 fps, 33 s (990 quadros).
Feita em React + Remotion, com tudo desenhado em SVG e separado em partes animáveis
(personagem articulada, objetos, linha de conexão, ambientes).

Vídeo final: `out/giganet-sua-vida-no-play.mp4`

## Estrutura

```
public/
  narracao.mp3            narração original (31,4 s)
  trilha.wav              trilha instrumental sintetizada, com ducking sob a voz
  sfx/*.wav               cliques, whooshes, pops, chime, bips
  logo-giganet.png        logo original, só cortada nas margens brancas (desenho e cor intactos)
scripts/gerar_audio.py    gera trilha.wav e sfx/ (python3 + numpy)
src/
  timeline.ts             MARCAS DA NARRAÇÃO e início de cada cena. Ajuste aqui para re-sincronizar
  theme.ts                paleta (#004AAD, #F9A01B, #ECE9EA, azul-escuro), fonte, easings
  Video.tsx               montagem: sequências das cenas, narração, trilha e lista de SFX por quadro
  components/
    Character.tsx         personagem (olhos, sobrancelhas, cabeça, braços com IK, pernas sentada/em pé)
    Line.tsx              linha azul+laranja (trajetória por paradas, cabeça luminosa, pulsos)
    Props.tsx             notebook, TV, caderno, lápis, controle, cadeiras, WhatsApp, pin, roteador
    Room.tsx              cômodo com luz de manhã → fim de tarde → noite
    Text.tsx              textos revelados por máscara (palavra a palavra / letra a letra)
  scenes/
    Abertura.tsx          cenas 1–3: gancho → linha revela a rotina → logo + "João Pessoa"
    DiaNoite.tsx          cena 4: íris da linha, Trabalho/Estudo/Diversão, cadeira gira, notebook vira TV
    Fechamento.tsx        cenas 5–7: zoom out até a casa, moldura do contato, assinatura com play
```

## Sincronia com a narração

| Cena | Tempo | Fala |
|---|---|---|
| 1 Gancho | 0–3,6 s | "Sua rotina não espera… Sua internet acompanha?" |
| 2 Rotina | 3,6–9,1 s | reunião 3,9 s · aula 4,6 s · partida 5,2 s · série 6,6 s |
| 3 Giganet JP | 9,1–13,2 s | logo em 9,8 s · "João Pessoa" em 12,2 s |
| 4 Do dia à noite | 13,2–20 s | Trabalho 13,8 s · Estudo 15,1 s · Diversão 16,4 s |
| 5 A casa | 20–23,1 s | "E aí… vamos colocar a sua casa nessa conexão?" |
| 6 Contato | 23,1–27,7 s | WhatsApp 24,1 s · planos 25,4 s · cobertura 26,3 s |
| 7 Assinatura | 27,7–33 s | logo 27,9 s · frase 29,3 s · play 30,1 s · tela final até 33 s |

Os tempos saíram das pausas da voz medidas com `ffmpeg silencedetect`.

## Como usar

```bash
npm install
npm run studio        # abre o Remotion Studio: linha do tempo editável, quadro a quadro
npm run audio         # (opcional) regenera trilha e efeitos
npm run render        # gera out/giganet-sua-vida-no-play.mp4
```

Se o Remotion não conseguir baixar o Chrome headless, aponte para um binário local:
`REMOTION_BROWSER=/caminho/chrome-headless-shell npm run render`
(ou `--browser-executable=...`).

## Observações

- Não há valores de planos nem telefone na tela. Se quiser incluir o número do WhatsApp,
  adicione-o no selo final em `src/scenes/Fechamento.tsx`.
- O ícone de WhatsApp é uma versão simplificada (balão + fone).
- A logo tem fundo branco opaco, por isso fica sempre sobre o branco (cenas 3 e 7).

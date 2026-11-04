# Giganet JP — "Qual é a senha do Wi-Fi?" (Reels 9:16)

Motion design para Instagram Reels: 1080×1920, 30 fps, 31,5 s (945 quadros).
A duração segue a narração (29,3 s) e sustenta a tela final por mais ~2 s.
React + Remotion, tudo em SVG, com personagens e objetos animados separadamente.

Vídeo final: `out/giganet-senha-do-wifi.mp4`

## Estrutura

```
public/
  narracao.mp3                narração original (ElevenLabs)
  trilha.wav, sfx/*.wav       trilha leve sintetizada (com ducking sob a voz) e efeitos
  logo-giganet-azul.png       logo da arte original (faixa central com bordas suaves; logo intacta)
  arte-giganet-azul-original.png
scripts/gerar_audio.py        gera trilha e efeitos (porta, surpresa, toque, foto, envio…)
src/
  timeline.ts                 marcas da narração e início de cada cena
  Video.tsx                   montagem, narração, trilha e lista de efeitos por quadro
  components/
    Character.tsx             rig das personagens + LOOKS (anfitriã, visita, amiga) + IK dos braços
    Sala.tsx                  sala de estar, porta, sofá, celular e interfaces (vídeo, música, conversa)
    Line.tsx · Text.tsx · Decor.tsx   linha azul+laranja, textos por máscara, bolhas e linhas da marca
  scenes/
    Porta.tsx                 cenas 1–2: porta abre, a pergunta, reação, caminho pontilhado, porta-transição
    Momentos.tsx              cenas 3–4: vídeo, música, selfie, foto no grupo, linha da internet
    Casa.tsx                  cenas 5–7: casa com a sala viva na janela, logo, contato, assinatura
```

## Sincronia

| Cena | Tempo | Fala / ação |
|---|---|---|
| 1 A pergunta | 0–1,7 s | balão "Qual é a senha do Wi-Fi?", sobrancelha + aproximação, "Você conhece alguém assim? 👀" |
| 2 Antes de sentar | 1,7–5 s | aponta o sofá, caminho pontilhado, risada; a porta fecha sobre a tela |
| 3 Os momentos | 5–11,4 s | vídeo 6,8 s · música 8,5 s (tela amplia, notas) · foto 9,7 s (visor, flash, envio ✓✓) |
| 4 O encontro | 11,4–14,1 s | câmera recua, linha sai do roteador e contorna o grupo |
| 5 Giganet JP | 14,1–20,2 s | casa revelada, linha no contorno até a logo, "João Pessoa" 18,9 s |
| 6 Contato | 20,2–25,6 s | a visita apresenta o cartão: "Conheça os planos." · "Consulte a cobertura no seu bairro." 24 s |
| 7 Assinatura | 25,6–31,5 s | amigos no sofá; logo, "A conexão começa em casa.", "Fale com a gente no WhatsApp." |

## Como usar

```bash
npm install
npm run studio     # prévia e linha do tempo editável
npm run audio      # (opcional) regenera trilha e efeitos
npm run render     # gera out/giganet-senha-do-wifi.mp4
```
Sem Chrome headless disponível: `REMOTION_BROWSER=/caminho/chrome-headless-shell npm run render`.

Sem preços, velocidades, telefone ou endereço na tela. O ícone de WhatsApp é simplificado.

# Giganet JP — "Tem novidade na área!" · Colinas do Sul (Reels 9:16)

Motion design para Instagram Reels: 1080×1920, 30 fps, 27,5 s (825 quadros).
A duração segue a narração (25,3 s) e sustenta a tela final por mais ~2 s.
React + Remotion, tudo em SVG: bairro isométrico, placa, marcador, técnico animado.

Vídeo final: `out/giganet-colinas-do-sul.mp4`

## Estrutura

```
public/
  narracao.mp3                narração original (ElevenLabs)
  trilha.wav, sfx/*.wav       trilha animada sintetizada (com ducking sob a voz) e efeitos
  logo-giganet-azul.png       logo da arte original (faixa central; logo intacta)
scripts/gerar_audio.py        gera trilha e efeitos (pouso do marcador, giro da placa, mensagem…)
src/
  timeline.ts                 marcas da narração e início de cada cena
  Video.tsx                   montagem, narração, trilha e efeitos por quadro
  components/
    Bairro.tsx                bairro isométrico (casas, árvores, postes, calçadas neutras)
    Character.tsx             rig da personagem + visual do técnico (boné, uniforme, ciclo de passos)
    Line.tsx · Text.tsx · Decor.tsx
  scenes/Colinas.tsx          as 6 cenas num mundo contínuo com câmera
```

## Sincronia

| Cena | Tempo | Ação |
|---|---|---|
| 1 A novidade | 0–5 s | marcador cai e acomoda, placa "COLINAS DO SUL" surge, técnico entra e apresenta, "A Giganet JP chegou!" |
| 2 Apresentação | 5–9,3 s | haste vira linha e desenha a moldura da logo; "Agora também no" 6,2 s, placa pulsa em "Colinas do Sul" 6,9 s, "João Pessoa" 8 s |
| 3 Espalhe a notícia | 9,3–13,1 s | placa gira e vira celular; grupo "Vizinhos", mensagem 9,7 s, 👍 11,3 s, 🎉 11,7 s |
| 4 Consulte sua rua | 13,1–16,3 s | mensagem se expande e revela a casa; técnico com cartão; "Seu endereço"; "?" só sobre essa casa; "Consulte a disponibilidade." 14,9 s |
| 5 WhatsApp | 16,3–21,2 s | cartão vira contato: "Conheça os planos" · "Consulte seu endereço" 18 s; técnico aponta |
| 6 Assinatura | 21,2–27,5 s | câmera recua: logo, "AGORA TAMBÉM NO / COLINAS DO SUL", "Consulte a disponibilidade para o seu endereço.", placa, bairro, técnico |

O bairro é uma representação artística: sem nomes de ruas e sem áreas coloridas que sugiram
cobertura integral. Só uma casa recebe uma "?" (consulta), nunca um selo de "atendida".
Sem telefone, preço, velocidade ou condição comercial na tela.

## Como usar

```bash
npm install
npm run studio     # prévia e linha do tempo editável
npm run audio      # (opcional) regenera trilha e efeitos
npm run render     # gera out/giganet-colinas-do-sul.mp4
```

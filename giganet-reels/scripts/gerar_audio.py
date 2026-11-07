"""
Gera a trilha instrumental e os efeitos sonoros do vídeo "Sua vida no play".

Tudo é sintetizado (sem samples de terceiros), então o projeto fica livre de
direitos. Rode com:  python3 scripts/gerar_audio.py
Saídas: public/trilha.wav e public/sfx/*.wav

A trilha já vem com "ducking": o volume cai automaticamente quando a
narração está falando, para priorizar a voz.
"""
import os
import subprocess
import wave

import numpy as np

SR = 44100
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PUB = os.path.join(ROOT, "public")
SFX = os.path.join(PUB, "sfx")
os.makedirs(SFX, exist_ok=True)

DUR = 33.0          # duração total do vídeo (990 frames a 30 fps)
LOGO_T = 9.07       # entrada da Giganet: muda o ritmo
SCENE2_T = 3.60     # início da rotina
END_T = 27.70       # assinatura final
BPM = 104
BEAT = 60 / BPM

rng = np.random.default_rng(7)


def save(path, x):
    x = np.clip(x, -1, 1)
    data = (x * 32767).astype(np.int16)
    with wave.open(path, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(data.tobytes())


def t_axis(d):
    return np.arange(int(d * SR)) / SR


def env(d, a=0.005, r=0.2):
    t = t_axis(d)
    e = np.minimum(1, t / max(a, 1e-4)) * np.exp(-t / max(r, 1e-4))
    return e


def norm(x, peak=0.9):
    m = np.max(np.abs(x)) or 1
    return x / m * peak


# ---------------------------------------------------------------- SFX
def sfx_click():
    t = t_axis(0.06)
    x = np.sin(2 * np.pi * 2400 * t) * np.exp(-t / 0.008)
    x += 0.5 * rng.standard_normal(len(t)) * np.exp(-t / 0.004)
    return norm(x, 0.8)


def sfx_tick():
    # "bip" suave de espera (carregando)
    t = t_axis(0.12)
    x = np.sin(2 * np.pi * 880 * t) * np.exp(-t / 0.03)
    x += 0.3 * np.sin(2 * np.pi * 1760 * t) * np.exp(-t / 0.02)
    return norm(x, 0.5)


def sfx_whoosh(d=0.6, f0=300, f1=2400):
    t = t_axis(d)
    n = rng.standard_normal(len(t))
    # filtro passa-banda móvel simples (ressonador de 2ª ordem)
    out = np.zeros_like(n)
    y1 = y2 = 0.0
    for i in range(len(n)):
        p = i / len(n)
        f = f0 + (f1 - f0) * np.sin(np.pi * p) ** 1.2
        r = 0.985
        c = 2 * r * np.cos(2 * np.pi * f / SR)
        y = n[i] * (1 - r) + c * y1 - r * r * y2
        y2, y1 = y1, y
        out[i] = y
    shape = np.sin(np.pi * t / d) ** 2
    return norm(out * shape, 0.7)


def sfx_pop(freq=600):
    t = t_axis(0.25)
    f = freq * (1 + 0.8 * np.exp(-t / 0.02))
    ph = 2 * np.pi * np.cumsum(f) / SR
    x = np.sin(ph) * np.exp(-t / 0.07)
    x += 0.25 * np.sin(2 * ph) * np.exp(-t / 0.04)
    return norm(x, 0.75)


def sfx_chime():
    t = t_axis(1.8)
    x = np.zeros_like(t)
    for i, f in enumerate([523.25, 659.25, 783.99, 1046.5]):
        d = i * 0.06
        tt = np.clip(t - d, 0, None)
        x += (t >= d) * np.sin(2 * np.pi * f * tt) * np.exp(-tt / 0.7) * (0.9 - i * 0.12)
        x += (t >= d) * 0.2 * np.sin(2 * np.pi * f * 2.01 * tt) * np.exp(-tt / 0.3)
    return norm(x, 0.7)


def sfx_blip(freq=1320):
    t = t_axis(0.18)
    x = np.sin(2 * np.pi * freq * t) * np.exp(-t / 0.05)
    x += 0.4 * np.sin(2 * np.pi * freq * 1.5 * t) * np.exp(-t / 0.03)
    return norm(x, 0.6)


def sfx_grab():
    t = t_axis(0.2)
    f = 900 * np.exp(-t / 0.05) + 200
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.05)
    return norm(x, 0.7)


def sfx_swoosh_short():
    return sfx_whoosh(0.35, 600, 3200)


save(os.path.join(SFX, "click.wav"), sfx_click())
save(os.path.join(SFX, "tick.wav"), sfx_tick())
save(os.path.join(SFX, "whoosh.wav"), sfx_whoosh())
save(os.path.join(SFX, "whoosh-curto.wav"), sfx_swoosh_short())
save(os.path.join(SFX, "whoosh-grave.wav"), sfx_whoosh(0.9, 120, 900))
for i, f in enumerate([523.25, 659.25, 783.99, 1046.5]):
    save(os.path.join(SFX, f"pop{i + 1}.wav"), sfx_pop(f))
save(os.path.join(SFX, "chime.wav"), sfx_chime())
save(os.path.join(SFX, "blip.wav"), sfx_blip())
save(os.path.join(SFX, "grab.wav"), sfx_grab())

# ---------------------------------------------------------------- TRILHA
N = int(DUR * SR)
t = np.arange(N) / SR
mix = np.zeros(N)


def add(x, at, gain=1.0):
    i = int(at * SR)
    if i >= N:
        return
    j = min(N, i + len(x))
    mix[i:j] += x[: j - i] * gain


def kick():
    tt = t_axis(0.35)
    f = 50 + 110 * np.exp(-tt / 0.03)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt / 0.12)


def hat():
    tt = t_axis(0.06)
    n = rng.standard_normal(len(tt))
    n = np.diff(n, prepend=0)  # brilho
    return n * np.exp(-tt / 0.015) * 0.3


def clap():
    tt = t_axis(0.2)
    n = rng.standard_normal(len(tt))
    e = np.exp(-tt / 0.05) * (1 + 0.6 * np.exp(-((tt - 0.012) ** 2) / 1e-5))
    return n * e * 0.35


def pluck(f, d=0.45):
    tt = t_axis(d)
    x = np.sin(2 * np.pi * f * tt) + 0.35 * np.sin(2 * np.pi * 2 * f * tt) + 0.12 * np.sin(2 * np.pi * 3 * f * tt)
    return x * np.exp(-tt / 0.16) * np.minimum(1, tt / 0.004)


def pad(freqs, d):
    tt = t_axis(d)
    x = np.zeros_like(tt)
    for f in freqs:
        for det in (-0.6, 0.6):
            x += np.sin(2 * np.pi * (f + det) * tt + rng.uniform(0, 6))
    a = np.minimum(1, tt / 0.4) * np.minimum(1, (d - tt) / 0.5)
    return x * a / (len(freqs) * 2)


def bass(f, d):
    tt = t_axis(d)
    x = np.sin(2 * np.pi * f * tt) + 0.3 * np.sin(2 * np.pi * 2 * f * tt)
    return x * np.minimum(1, tt / 0.01) * np.exp(-tt / 0.35)


# progressão I–V–vi–IV em Ré maior (alegre, "campanha")
CHORDS = [
    ([293.66, 369.99, 440.0], 73.42),   # D
    ([277.18, 369.99, 440.0], 55.0),    # A/C#
    ([246.94, 293.66, 369.99], 61.74),  # Bm
    ([196.0, 293.66, 392.0], 49.0),     # G
]
BAR = BEAT * 4

# Parte A (rotina): pad + plucks leves
t0 = SCENE2_T
k = 0
while t0 < LOGO_T:
    ch, _ = CHORDS[k % 4]
    add(pad(ch, BAR + 0.5), t0, 0.35)
    for s in range(8):
        add(pluck(ch[s % 3] * 2, 0.35), t0 + s * BEAT / 2, 0.16)
    t0 += BAR
    k += 1

# Parte B (Giganet em diante): groove completo
t0 = LOGO_T
k = 0
add(sfx_whoosh(0.8, 200, 3000), LOGO_T - 0.75, 0.25)
while t0 < END_T + BAR * 0.99:
    ch, b = CHORDS[k % 4]
    add(pad(ch, BAR + 0.5), t0, 0.32)
    for s in range(4):
        bt = t0 + s * BEAT
        add(kick(), bt, 0.75)
        if s in (1, 3):
            add(clap(), bt, 0.55)
        add(hat(), bt + BEAT / 2, 0.6)
        add(bass(b, BEAT * 0.9), bt, 0.42)
        add(bass(b, BEAT * 0.4), bt + BEAT * 0.5, 0.25)
    arp = [0, 1, 2, 1, 0, 2, 1, 2]
    for s in range(8):
        add(pluck(ch[arp[s]] * 2, 0.3), t0 + s * BEAT / 2, 0.14)
    t0 += BAR
    k += 1

# Final: acorde sustentado até o fim
add(pad(CHORDS[0][0] + [587.33], DUR - t0 + 0.2), t0, 0.45)
add(bass(73.42, 2.5), t0, 0.5)
add(pluck(587.33, 1.2), t0, 0.25)

# Fade-out final
fade = np.clip((DUR - t) / 1.2, 0, 1)
mix *= fade
mix = norm(mix, 0.9)

# ------------------------------------------------ ducking pela narração
raw = subprocess.run(
    ["ffmpeg", "-v", "quiet", "-i", os.path.join(PUB, "narracao.mp3"),
     "-f", "s16le", "-ac", "1", "-ar", str(SR), "-"],
    capture_output=True, check=True).stdout
voice = np.frombuffer(raw, dtype=np.int16).astype(np.float64) / 32768
voice = np.pad(voice, (0, max(0, N - len(voice))))[:N]
win = int(0.05 * SR)
rms = np.sqrt(np.convolve(voice ** 2, np.ones(win) / win, mode="same"))
active = (rms > 0.02).astype(float)
# suaviza ataque/liberação (~120 ms)
sm = int(0.12 * SR)
active = np.convolve(active, np.ones(sm) / sm, mode="same")
gain = 1 - 0.45 * np.clip(active, 0, 1)
mix *= gain

save(os.path.join(PUB, "trilha.wav"), mix)
print("ok: trilha.wav e sfx gerados")

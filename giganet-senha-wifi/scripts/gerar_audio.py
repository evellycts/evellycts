"""
Gera a trilha instrumental e os efeitos sonoros do vídeo "Qual é a senha do Wi-Fi?".

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

DUR = 31.5          # duração total do vídeo (945 frames a 30 fps)
LOGO_T = 14.1       # entrada da Giganet: o groove ganha bateria completa
END_T = 27.3        # assinatura final
BPM = 112
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



# ---------------------------------------------------------------- SFX novos
def sfx_door():
    # rangido curto + trinco
    t = t_axis(0.9)
    f = 300 + 180 * np.sin(np.pi * t / 0.9) + 40 * np.sin(2 * np.pi * 13 * t)
    creak = np.sin(2 * np.pi * np.cumsum(f) / SR) * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 38 * t)))
    creak *= np.sin(np.pi * np.clip(t / 0.7, 0, 1)) * 0.35
    latch = np.zeros_like(t)
    lt = t_axis(0.08)
    latch[: len(lt)] = (np.sin(2 * np.pi * 1800 * lt) + rng.standard_normal(len(lt)) * 0.6) * np.exp(-lt / 0.01)
    return norm(creak + latch, 0.8)


def sfx_surprise():
    # "plim" ascendente
    t = t_axis(0.4)
    f = 700 + 900 * np.minimum(1, t / 0.12)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.15)
    return norm(x, 0.7)


def sfx_shutter():
    out = np.zeros(int(0.3 * SR))
    for d, g in [(0.0, 1.0), (0.09, 0.7)]:
        tt = t_axis(0.05)
        i = int(d * SR)
        out[i:i + len(tt)] += (rng.standard_normal(len(tt)) * 0.8 + np.sin(2 * np.pi * 3000 * tt)) * np.exp(-tt / 0.008) * g
    return norm(out, 0.8)


def sfx_send():
    w = sfx_whoosh(0.3, 800, 3600) * 0.6
    p = sfx_pop(1046.5)
    out = np.zeros(int(0.6 * SR))
    out[: len(w)] += w
    out[int(0.22 * SR): int(0.22 * SR) + len(p)] += p
    return norm(out, 0.75)


def sfx_note():
    t = t_axis(0.35)
    x = np.sin(2 * np.pi * 1318.5 * t) * np.exp(-t / 0.1) + 0.5 * np.sin(2 * np.pi * 1568 * t) * np.exp(-t / 0.08)
    return norm(x, 0.6)


save(os.path.join(SFX, "porta.wav"), sfx_door())
save(os.path.join(SFX, "surpresa.wav"), sfx_surprise())
save(os.path.join(SFX, "foto.wav"), sfx_shutter())
save(os.path.join(SFX, "enviar.wav"), sfx_send())
save(os.path.join(SFX, "nota.wav"), sfx_note())

# ---------------------------------------------------------------- TRILHA (leve e descontraída)
N = int(DUR * SR)
t = np.arange(N) / SR
mix = np.zeros(N)


def add(x, at, gain=1.0):
    i = int(at * SR)
    if i >= N:
        return
    j = min(N, i + len(x))
    mix[i:j] += x[: j - i] * gain


def uke(f, d=0.5):
    # Karplus-Strong: corda dedilhada (tipo ukulele)
    n = int(d * SR)
    p = max(2, int(SR / f))
    buf = rng.uniform(-1, 1, p)
    out = np.zeros(n)
    for i in range(n):
        out[i] = buf[i % p]
        buf[i % p] = 0.5 * (buf[i % p] + buf[(i + 1) % p]) * 0.996
    return out * np.exp(-np.arange(n) / SR / 0.35)


def kick():
    tt = t_axis(0.3)
    f = 55 + 100 * np.exp(-tt / 0.03)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt / 0.1)


def clap():
    tt = t_axis(0.18)
    return rng.standard_normal(len(tt)) * np.exp(-tt / 0.04) * 0.4


def shaker():
    tt = t_axis(0.05)
    return np.diff(rng.standard_normal(len(tt)), prepend=0) * np.exp(-tt / 0.012) * 0.25


def bass(f, d):
    tt = t_axis(d)
    return (np.sin(2 * np.pi * f * tt) + 0.25 * np.sin(4 * np.pi * f * tt)) * np.minimum(1, tt / 0.01) * np.exp(-tt / 0.3)


# progressão alegre em Dó: C – Am – F – G
CH = [([261.63, 329.63, 392.0], 65.41), ([220.0, 261.63, 329.63], 55.0), ([174.61, 220.0, 261.63], 43.65), ([196.0, 246.94, 293.66], 49.0)]
BAR = BEAT * 4
pattern = [0, 1, 2, 1, 0, 2, 1, 2]
t0 = 0.0
k = 0
while t0 < END_T:
    ch, b = CH[k % 4]
    for s8 in range(8):
        add(uke(ch[pattern[s8]] * 2, 0.45), t0 + s8 * BEAT / 2, 0.22)
    for s4 in range(4):
        bt = t0 + s4 * BEAT
        add(bass(b, BEAT * 0.8), bt, 0.35)
        add(shaker(), bt + BEAT / 2, 0.5)
        if t0 >= LOGO_T - 0.01 or s4 in (0, 2):
            add(kick(), bt, 0.55 if t0 >= LOGO_T - 0.01 else 0.35)
        if s4 in (1, 3) and t0 >= 1.6:
            add(clap(), bt, 0.45)
    t0 += BAR
    k += 1
# acorde final
for i, f in enumerate([261.63, 329.63, 392.0, 523.25]):
    add(uke(f, 2.5), t0 + i * 0.05, 0.3)
add(bass(65.41, 2.0), t0, 0.45)

fade = np.clip((DUR - t) / 1.2, 0, 1)
mix *= fade
mix = norm(mix, 0.9)

raw = subprocess.run(
    ["ffmpeg", "-v", "quiet", "-i", os.path.join(PUB, "narracao.mp3"),
     "-f", "s16le", "-ac", "1", "-ar", str(SR), "-"],
    capture_output=True, check=True).stdout
voice = np.frombuffer(raw, dtype=np.int16).astype(np.float64) / 32768
voice = np.pad(voice, (0, max(0, N - len(voice))))[:N]
win = int(0.05 * SR)
rms = np.sqrt(np.convolve(voice ** 2, np.ones(win) / win, mode="same"))
active = (rms > 0.02).astype(float)
sm = int(0.12 * SR)
active = np.convolve(active, np.ones(sm) / sm, mode="same")
mix *= 1 - 0.45 * np.clip(active, 0, 1)
save(os.path.join(PUB, "trilha.wav"), mix)
print("ok: trilha.wav e sfx gerados")

"""Monta el banco de combate v3 con los efectos que eligió el propietario.

Elección del 02/11/2026 en la sala de escucha (efectos «potentes y
cinematográficos»): disparo láser digital, explosión grave, golpe de impacto,
cañón láser y cañonazo para el jefe. Todo CC0 (procedencia en
art-source/audio/combat-sfx-v3/PROVENANCE.md).

Escribe:
- art-source/audio/combat-sfx-v3/combat_sfx_atlas_v3.wav: maestro mono 48 kHz,
  cada sonido recortado, con caída final y pico 0,70, separados por 120 ms.
- assets/combat_sfx_atlas_v3.m4a (AAC) y assets/combat_sfx_atlas_v3.json
  (offsets y política de voces, la misma que src/game/audio/combat-sfx.js).
Crea o actualiza sus entradas en ASSET_MANIFEST.json.
Reproducible: mismas entradas, mismas salidas. Necesita ffmpeg y numpy.
Uso: python3 scripts/build-combat-sfx-v3.py
"""
import hashlib
import json
import math
import subprocess
from pathlib import Path
import numpy as np

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / 'art-source' / 'audio' / 'combat-sfx-v3'
OUT = ROOT / 'assets'
MANIFEST = ROOT / 'ASSET_MANIFEST.json'
RATE, GAP, PEAK, FADE = 48000, .12, .70, .06

# evento: (capas [(archivo, inicio s, largo s, ganancia de la capa)], ganancia, prioridad, espera mínima s, voces)
# Las capas de un mismo evento se mezclan en un solo sonido.
CUES = {
    'phaser': ([('kenney_laser4.mp3', 0, .30, 1)], .15, 1, .045, 3),
    'missile-launch': ([('kenney_thrusterFire_000.ogg', 0, .60, 1)], .31, 5, .25, 2),
    'impact-metal': ([('kenney_impactMetal_002.ogg', 0, .40, 1)], .20, 3, .04, 3),
    'impact-plasma': ([('kenney_forceField_000.ogg', 0, .45, 1)], .22, 3, .04, 3),
    'hull-hit': ([('starninjas_impact_3.ogg', 0, .60, 1)], .29, 6, .12, 2),
    'enemy-break': ([('kenney_lowFrequency_explosion_000.ogg', 0, 1.0, 1)], .31, 5, .10, 2),
    'atlas-charge': ([('blacklodge_beam_02.wav', 0, .95, 1)], .26, 7, .30, 1),
    # Jefe destruido: el cañonazo que eligió el propietario con una cola grave
    # debajo para que dure y pese más (su nota: «hay que darle más vueltas»).
    'atlas-collapse': ([('rubberduck_cannon_01.ogg', 0, 1.24, 1), ('nenadsimic_muffled_distant_explosion.wav', 0, 3.0, .8)], .40, 9, 1, 1),
    'enemy-phaser': ([('rubberduck_shoot_01.ogg', 0, .25, 1)], .17, 2, .055, 3),
    'enemy-heavy': ([('kenney_laserLarge_000.ogg', 0, .60, 1)], .26, 5, .16, 2),
    # Láser grande del subguardián (antes sonaba la explosión del jefe).
    'boss-laser': ([('tad_doomsday_laser_cannon_medium.wav', 0, 2.6, 1)], .32, 8, 1, 1),
}


def decode(name, start, length):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-ss', str(start), '-t', str(length), '-i', str(SOURCE / name),
                          '-ac', '1', '-ar', str(RATE), '-f', 'f32le', '-'], check=True, capture_output=True).stdout
    return np.frombuffer(raw, dtype='<f4').astype(np.float64)


def render(layers):
    parts = [decode(name, start, length) * gain for name, start, length, gain in layers]
    mixed = np.zeros(max(len(part) for part in parts))
    for part in parts:
        mixed[:len(part)] += part
    fade = min(len(mixed), round(FADE * RATE))
    mixed[len(mixed) - fade:] *= np.linspace(1, 0, fade)
    return mixed * (PEAK / max(np.abs(mixed).max(), 1e-9))


def build():
    pieces, cues, cursor = [], {}, 0.0
    for cue, (layers, gain, priority, cooldown, polyphony) in CUES.items():
        samples = render(layers)
        duration = math.ceil(len(samples) / RATE * 100) / 100
        pieces.append((round(cursor * RATE), samples))
        cues[cue] = {'variants': [{'offset': round(cursor, 2), 'duration': duration}], 'gain': gain,
                     'priority': priority, 'cooldown': cooldown, 'polyphony': polyphony}
        cursor = round(cursor + duration + GAP, 2)
    total = round(cursor - GAP, 2)
    atlas = np.zeros(round(total * RATE))
    for start, samples in pieces:
        atlas[start:start + len(samples)] = samples
    master = SOURCE / 'combat_sfx_atlas_v3.wav'
    pcm = (np.clip(atlas, -1, 1) * 32767).astype('<i2').tobytes()
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 's16le', '-ar', str(RATE), '-ac', '1', '-i', '-',
                    '-bitexact', str(master)], input=pcm, check=True)
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', str(master), '-c:a', 'aac', '-b:a', '96k',
                    '-map_metadata', '-1', '-fflags', '+bitexact', '-flags:a', '+bitexact',
                    str(OUT / 'combat_sfx_atlas_v3.m4a')], check=True)
    meta = {'version': 3, 'src': 'assets/combat_sfx_atlas_v3.m4a', 'sampleRate': RATE, 'channels': 1,
            'duration': total, 'gap': GAP, 'cues': cues}
    (OUT / 'combat_sfx_atlas_v3.json').write_text(json.dumps(meta, indent=2) + '\n', encoding='utf-8')
    return total


def main():
    total = build()
    manifest = json.loads(MANIFEST.read_text(encoding='utf-8'))
    by_path = {entry['path']: entry for entry in manifest['standalone']}
    origin = 'OpenGameArt, packs CC0 elegidos por el propietario (art-source/audio/combat-sfx-v3/PROVENANCE.md)'
    for name, asset_id, fmt, dimensions, use in [
            ('combat_sfx_atlas_v3.m4a', 'combat-sfx-atlas-v3', 'aac-lc', f'48000Hz mono AAC {total}s',
             f'Efectos de combate: {len(CUES)} eventos (disparos, impactos, explosiones, láser del subguardián)'),
            ('combat_sfx_atlas_v3.json', 'combat-sfx-map-v3', 'json', 'JSON', 'Offsets y política de voces del banco de combate')]:
        data = (OUT / name).read_bytes()
        entry = by_path.get(f'assets/{name}')
        if entry is None:
            entry = {'id': asset_id, 'path': f'assets/{name}', 'master': 'art-source/audio/combat-sfx-v3/combat_sfx_atlas_v3.wav',
                     'dimensions': '', 'format': fmt, 'size': 0, 'sha256': '', 'activeRuntime': True, 'precache': True,
                     'status': 'IN_REVIEW', 'artisticAcceptance': 'PENDING_OWNER', 'origin': origin, 'version': 1, 'use': use}
            manifest['standalone'].append(entry)
            manifest['assetCount'] += 1
        entry['dimensions'] = dimensions
        # Por diferencia: repetir el script no cuenta dos veces.
        manifest['runtimeBytes'] += len(data) - entry['size']
        entry['size'] = len(data)
        entry['sha256'] = hashlib.sha256(data).hexdigest()
    MANIFEST.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    for name in ('combat_sfx_atlas_v3.m4a', 'combat_sfx_atlas_v3.json'):
        print(f'assets/{name}', (OUT / name).stat().st_size)


if __name__ == '__main__':
    main()

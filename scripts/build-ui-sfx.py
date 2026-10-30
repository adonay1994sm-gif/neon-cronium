"""Monta el banco de sonidos de interfaz con los packs CC0 de Kenney.

Lee art-source/audio/kenney-cc0/ (Interface Sounds y Sci-Fi Sounds, elegidos
por el propietario el 22/10/2026) y escribe:
- art-source/audio/kenney-cc0/ui_sfx_atlas_v1.wav: maestro mono 48 kHz, cada
  sonido normalizado a pico 0,70 y separado por 120 ms de silencio.
- assets/ui_sfx_atlas_v1.m4a (AAC) y assets/ui_sfx_atlas_v1.json (offsets y
  política de voces, la misma que src/game/audio/ui-sfx.js).
Crea o actualiza sus entradas en ASSET_MANIFEST.json.
Reproducible: mismas entradas, mismas salidas. Necesita ffmpeg y numpy.
Uso: python3 scripts/build-ui-sfx.py
"""
import hashlib
import json
import math
import subprocess
from pathlib import Path
import numpy as np

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / 'art-source' / 'audio' / 'kenney-cc0'
OUT = ROOT / 'assets'
MANIFEST = ROOT / 'ASSET_MANIFEST.json'
RATE, GAP, PEAK = 48000, .12, .70

# evento: (sonidos de Kenney, ganancia, prioridad, espera mínima en s, voces)
CUES = {
    'ui-press': (['click_001'], .16, 1, .05, 2),
    'ui-toggle': (['toggle_001'], .16, 1, .05, 2),
    'ui-tick': (['tick_004'], .14, 1, .06, 1),
    'confirm': (['confirmation_001'], .24, 4, .15, 1),
    'weapon-switch': (['maximize_007'], .20, 3, .12, 1),
    'pickup-scrap': (['drop_002'], .18, 2, .05, 2),
    'pickup-cronium': (['glass_002', 'glass_003'], .20, 2, .03, 3),
    'ammo-ready': (['tick_002'], .14, 1, .20, 1),
    'power-up': (['maximize_004'], .26, 4, .15, 1),
    'repair': (['confirmation_002'], .26, 4, .20, 1),
    'transmission': (['bong_001'], .18, 3, .30, 1),
    'stage-start': (['maximize_001'], .24, 4, .50, 1),
    'stage-complete': (['confirmation_004'], .30, 6, .50, 1),
    'unlock': (['confirmation_003'], .28, 5, .30, 1),
    'gate-warning': (['error_004'], .20, 4, .30, 1),
    'gate-clear': (['select_003'], .22, 3, .20, 1),
    'defeat': (['minimize_005'], .30, 7, .50, 1),
    'ship-destroyed': (['lowFrequency_explosion_001'], .40, 8, .50, 1),
    'rupture': (['lowFrequency_explosion_000'], .40, 9, 1, 1),
    'boss-alert': (['forceField_000'], .30, 7, .30, 1),
}


def decode(name):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', str(SOURCE / f'{name}.ogg'), '-ac', '1', '-ar', str(RATE),
                          '-f', 'f32le', '-'], check=True, capture_output=True).stdout
    samples = np.frombuffer(raw, dtype='<f4').astype(np.float64)
    return samples * (PEAK / max(np.abs(samples).max(), 1e-9))


def build():
    pieces, cues, cursor = [], {}, 0.0
    for cue, (names, gain, priority, cooldown, polyphony) in CUES.items():
        variants = []
        for name in names:
            samples = decode(name)
            duration = math.ceil(len(samples) / RATE * 100) / 100
            pieces.append((round(cursor * RATE), samples))
            variants.append({'offset': round(cursor, 2), 'duration': duration})
            cursor = round(cursor + duration + GAP, 2)
        cues[cue] = {'variants': variants, 'gain': gain, 'priority': priority, 'cooldown': cooldown, 'polyphony': polyphony}
    total = round(cursor - GAP, 2)
    atlas = np.zeros(round(total * RATE))
    for start, samples in pieces:
        atlas[start:start + len(samples)] = samples
    master = SOURCE / 'ui_sfx_atlas_v1.wav'
    pcm = (np.clip(atlas, -1, 1) * 32767).astype('<i2').tobytes()
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 's16le', '-ar', str(RATE), '-ac', '1', '-i', '-',
                    '-bitexact', str(master)], input=pcm, check=True)
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', str(master), '-c:a', 'aac', '-b:a', '96k',
                    '-map_metadata', '-1', '-fflags', '+bitexact', '-flags:a', '+bitexact', str(OUT / 'ui_sfx_atlas_v1.m4a')], check=True)
    meta = {'version': 1, 'src': 'assets/ui_sfx_atlas_v1.m4a', 'sampleRate': RATE, 'channels': 1,
            'duration': total, 'gap': GAP, 'cues': cues}
    (OUT / 'ui_sfx_atlas_v1.json').write_text(json.dumps(meta, indent=2) + '\n', encoding='utf-8')
    return total


def main():
    total = build()
    manifest = json.loads(MANIFEST.read_text(encoding='utf-8'))
    by_path = {entry['path']: entry for entry in manifest['standalone']}
    origin = 'Kenney, Interface Sounds y Sci-Fi Sounds (CC0, licencias en art-source/audio/kenney-cc0)'
    for name, asset_id, fmt, dimensions, use in [
            ('ui_sfx_atlas_v1.m4a', 'ui-sfx-atlas-v1', 'aac-lc', f'48000Hz mono AAC {total}s',
             f'Sonidos de interfaz y avisos: {len(CUES)} eventos que sustituyen los pitidos tone()'),
            ('ui_sfx_atlas_v1.json', 'ui-sfx-map-v1', 'json', 'JSON', 'Offsets y política de voces del banco de interfaz')]:
        data = (OUT / name).read_bytes()
        entry = by_path.get(f'assets/{name}')
        if entry is None:
            entry = {'id': asset_id, 'path': f'assets/{name}', 'master': 'art-source/audio/kenney-cc0/ui_sfx_atlas_v1.wav',
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
    for name in ('ui_sfx_atlas_v1.m4a', 'ui_sfx_atlas_v1.json'):
        print(f'assets/{name}', (OUT / name).stat().st_size)


if __name__ == '__main__':
    main()

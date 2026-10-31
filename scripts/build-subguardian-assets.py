"""Empaqueta el arte del subguardián del tramo 5 (31/10/2026).

Lee art-source/enemies/subguardian/ (GPT) y escribe en assets/:
- subguardian_atlas_v1.webp: los 8 estados en 4×2 celdas de 512 px (reposo,
  inclinado a la izquierda y a la derecha, dañado, cañones, carga del láser,
  disparo del láser y derrota), en el orden de subguardianFrame.
- subguardian_laser_v1.webp: 5 celdas de 192×768 px: los 4 fotogramas del haz
  (se repiten sin costura en vertical) y la franja de aviso.
- subguardian_impact_v1.webp: salpicadura donde choca el láser, 4×2 de 192 px.
laser_arranque_v1 no se usa: trae una carcasa que no es la del subguardián.
Crea o actualiza sus entradas en ASSET_MANIFEST.json.
Reproducible: mismas entradas, mismas salidas.
Uso: python3 scripts/build-subguardian-assets.py
"""
import hashlib
import json
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / 'art-source' / 'enemies' / 'subguardian'
OUT = ROOT / 'assets'
MANIFEST = ROOT / 'ASSET_MANIFEST.json'
BEAM_W, BEAM_H, IMPACT_CELL = 192, 768, 192

ENTRIES = {
    'subguardian_atlas_v1.webp': ('subguardian-atlas-v1', 'art-source/enemies/subguardian/subguardian_estados_v1.webp',
                                  'camp-art-s1-subguardian',
                                  'Subguardián del tramo 5: 8 estados en 4×2 celdas de 512 px, en el orden de subguardianFrame.'),
    'subguardian_laser_v1.webp': ('subguardian-laser-v1', 'art-source/enemies/subguardian',
                                  'camp-art-s1-laser-subjefe',
                                  'Láser del subguardián: 4 fotogramas del haz y la franja de aviso, celdas de 192×768 que se repiten en vertical.'),
    'subguardian_impact_v1.webp': ('subguardian-impact-v1', 'art-source/enemies/subguardian/laser_impacto_v1.webp',
                                   'camp-art-s1-laser-subjefe',
                                   'Láser del subguardián: salpicadura del impacto, 4×2 celdas de 192 px.'),
}


def build():
    load = lambda name: Image.open(SOURCE / name).convert('RGBA')
    states = load('subguardian_estados_v1.webp')
    animation, warning = load('laser_animacion_v1.webp'), load('laser_aviso_v1.webp')
    cell = animation.width // 4
    beams = [animation.crop((k * cell, 0, (k + 1) * cell, animation.height)) for k in range(4)] + [warning]
    laser = Image.new('RGBA', (BEAM_W * 5, BEAM_H), (0, 0, 0, 0))
    for index, beam in enumerate(beams):
        laser.alpha_composite(beam.resize((BEAM_W, BEAM_H), Image.LANCZOS), (index * BEAM_W, 0))
    impact = load('laser_impacto_v1.webp')
    pieces = {
        'subguardian_atlas_v1.webp': states.resize((states.width * 4 // 5, states.height * 4 // 5), Image.LANCZOS),
        'subguardian_laser_v1.webp': laser,
        'subguardian_impact_v1.webp': impact.resize((IMPACT_CELL * 4, IMPACT_CELL * 2), Image.LANCZOS),
    }
    for name, image in pieces.items():
        image.save(OUT / name, 'WEBP', quality=88, alpha_quality=100, method=6)


def main():
    build()
    manifest = json.loads(MANIFEST.read_text(encoding='utf-8'))
    by_path = {entry['path']: entry for entry in manifest['standalone']}
    for name, (asset_id, master, order, use) in ENTRIES.items():
        path = OUT / name
        data = path.read_bytes()
        entry = by_path.get(f'assets/{name}')
        if entry is None:
            entry = {'id': asset_id, 'path': f'assets/{name}', 'master': master,
                     'dimensions': '', 'format': 'webp-alpha', 'size': 0, 'sha256': '', 'activeRuntime': True, 'precache': True,
                     'status': 'IN_REVIEW', 'artisticAcceptance': 'PENDING_OWNER',
                     'origin': f'GPT a petición del propietario (encargo {order})', 'version': 1, 'use': use}
            manifest['standalone'].append(entry)
            manifest['assetCount'] += 1
        with Image.open(path) as image:
            entry['dimensions'] = f'{image.width}x{image.height}'
        # Por diferencia: repetir el script no cuenta dos veces.
        manifest['runtimeBytes'] += len(data) - entry['size']
        entry['size'] = len(data)
        entry['sha256'] = hashlib.sha256(data).hexdigest()
    MANIFEST.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    for name in ENTRIES:
        print(f'assets/{name}', (OUT / name).stat().st_size)


if __name__ == '__main__':
    main()

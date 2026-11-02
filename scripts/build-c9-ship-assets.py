"""Monta la hoja de C9, la nave taller de Mira (diseño elegido el 02/11/2026).

Lee el original de GPT en art-source/c9-nave/c9_estados_v1.webp (2x2 celdas de
1024: cerrada, abriéndose, atracando, abierta) y escribe assets/c9_ship_v1.webp
con el mismo orden de celdas que espera el juego, en celdas de 768. La fila de abajo venía un 1 %
más grande y 8 px más arriba: se corrige para que la nave no salte al cambiar
de estado. Crea o actualiza su entrada en ASSET_MANIFEST.json.
Reproducible: mismas entradas, mismas salidas.
Uso: python3 scripts/build-c9-ship-assets.py
"""
import hashlib
import json
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / 'art-source' / 'c9-nave' / 'c9_estados_v1.webp'
OUT = ROOT / 'assets' / 'c9_ship_v1.webp'
MANIFEST = ROOT / 'ASSET_MANIFEST.json'
CELL = 1024
RUNTIME_CELL = 768
# (escala, desplazamiento vertical en px) por celda; medido el 02/11/2026.
FIX = {0: (1.0, 0), 1: (1.0, 0), 2: (0.99, 8), 3: (0.99, 8)}


def main():
    sheet = Image.open(SOURCE).convert('RGBA')
    out = Image.new('RGBA', sheet.size, (0, 0, 0, 0))
    for index, (scale, dy) in FIX.items():
        x, y = (index % 2) * CELL, (index // 2) * CELL
        cell = sheet.crop((x, y, x + CELL, y + CELL))
        if scale != 1.0:
            side = round(CELL * scale)
            cell = cell.resize((side, side), Image.LANCZOS)
        layer = Image.new('RGBA', (CELL, CELL), (0, 0, 0, 0))
        offset = (CELL - cell.width) // 2
        layer.alpha_composite(cell, (offset, offset + dy))
        out.alpha_composite(layer, (x, y))
    # En el juego se dibuja a 440 de 720 de ancho: en un iPhone son ~715 píxeles
    # reales, así que celdas de 768 bastan y pesan la mitad.
    out = out.resize((RUNTIME_CELL * 2, RUNTIME_CELL * 2), Image.LANCZOS)
    out.save(OUT, 'WEBP', quality=90, alpha_quality=100, method=6)
    data = OUT.read_bytes()
    manifest = json.loads(MANIFEST.read_text(encoding='utf-8'))
    by_path = {entry['path']: entry for entry in manifest['standalone']}
    entry = by_path.get('assets/c9_ship_v1.webp')
    if entry is None:
        entry = {'id': 'c9-ship-v1', 'path': 'assets/c9_ship_v1.webp', 'master': 'art-source/c9-nave/c9_estados_v1.webp',
                 'dimensions': '', 'format': 'webp-alpha', 'size': 0, 'sha256': '', 'activeRuntime': True, 'precache': True,
                 'status': 'IN_REVIEW', 'artisticAcceptance': 'PENDING_OWNER',
                 'origin': 'GPT image generation uploaded to the asset vault (camp-art-c9-hoja); bottom row rescaled 0.99 and moved 8 px down',
                 'version': 1, 'pivot': '384,384 in each 768x768 cell',
                 'use': 'C9, nave taller de Mira (diseño elegido el 02/11/2026): 2x2 celdas cerrada, abriéndose, atracando, abierta. '
                        'Escena de llegada del tramo 6 y fondo de la Forja en la parada.'}
        manifest['standalone'].append(entry)
        manifest['assetCount'] += 1
    entry['dimensions'] = f'{out.width}x{out.height}'
    manifest['runtimeBytes'] += len(data) - entry['size']
    entry['size'] = len(data)
    entry['sha256'] = hashlib.sha256(data).hexdigest()
    MANIFEST.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print('assets/c9_ship_v1.webp', len(data))


if __name__ == '__main__':
    main()

"""Empaqueta los disparos del jugador por nivel (armas por niveles, 01/11/2026).

Lee art-source/player/armas-niveles-v1/armas_niveles_v1.webp (GPT, encargo
camp-art-armas-niveles: 4 columnas N1-N4 × 4 filas Pulso, Gemelo, Lanza,
Abanico, celdas de 256 px) y escribe assets/weapon_levels_v1.webp con las filas
de Pulso y Gemelo (las armas de hoy, dec-armas-plan) en celdas de 192 px:
4 columnas (nivel) × 2 filas (Pulso, Gemelo). Crea o actualiza su entrada en
ASSET_MANIFEST.json. Reproducible. Uso: python3 scripts/build-weapon-levels.py
"""
import hashlib
import json
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / 'art-source' / 'player' / 'armas-niveles-v1' / 'armas_niveles_v1.webp'
OUT = ROOT / 'assets' / 'weapon_levels_v1.webp'
MANIFEST = ROOT / 'ASSET_MANIFEST.json'
CELL = 192


def main():
    sheet = Image.open(SOURCE).convert('RGBA')
    source_cell = sheet.width // 4
    rows = sheet.crop((0, 0, sheet.width, source_cell * 2))
    rows.resize((CELL * 4, CELL * 2), Image.LANCZOS).save(OUT, 'WEBP', quality=88, alpha_quality=100, method=6)
    manifest = json.loads(MANIFEST.read_text(encoding='utf-8'))
    path = 'assets/weapon_levels_v1.webp'
    entry = next((item for item in manifest['standalone'] if item['path'] == path), None)
    if entry is None:
        entry = {'id': 'weapon-levels-v1', 'path': path, 'master': 'art-source/player/armas-niveles-v1/armas_niveles_v1.webp',
                 'dimensions': '', 'format': 'webp-alpha', 'size': 0, 'sha256': '', 'activeRuntime': True, 'precache': True,
                 'status': 'IN_REVIEW', 'artisticAcceptance': 'PENDING_OWNER',
                 'origin': 'GPT a petición del propietario (encargo camp-art-armas-niveles)', 'version': 1,
                 'use': 'Disparos del jugador por nivel: 4 columnas (N1-N4) × 2 filas (Pulso, Gemelo), celdas de 192 px.'}
        manifest['standalone'].append(entry)
        manifest['assetCount'] += 1
    data = OUT.read_bytes()
    entry['dimensions'] = f'{CELL * 4}x{CELL * 2}'
    manifest['runtimeBytes'] += len(data) - entry['size']
    entry['size'] = len(data)
    entry['sha256'] = hashlib.sha256(data).hexdigest()
    MANIFEST.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(path, len(data))


if __name__ == '__main__':
    main()

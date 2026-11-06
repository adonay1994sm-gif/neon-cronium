"""Empaqueta los disparos del jugador por nivel (armas por niveles, 01/11/2026).

Lee art-source/player/armas-niveles-v1/armas_niveles_v1.webp (GPT, encargo
camp-art-armas-niveles: 4 columnas N1-N4 × 4 filas Pulso, Gemelo, Lanza,
Abanico, celdas de 256 px) y escribe assets/weapon_levels_v1.webp con las filas
de Pulso y Gemelo (las armas de hoy, dec-armas-plan) en celdas de 192 px:
4 columnas (nivel) × 2 filas (Pulso, Gemelo), y assets/weapon_bolts_v1.webp
con UN proyectil de cada nivel (el más centrado de la ráfaga) en celdas de
96×192, mismo orden: el juego dibuja cada proyectil por separado. Crea o
actualiza sus entradas en ASSET_MANIFEST.json. Reproducible.
Uso: python3 scripts/build-weapon-levels.py
"""
import hashlib
import json
from collections import deque
from pathlib import Path
from PIL import Image, ImageChops

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / 'art-source' / 'player' / 'armas-niveles-v1' / 'armas_niveles_v1.webp'
OUT = ROOT / 'assets' / 'weapon_levels_v1.webp'
BOLTS = ROOT / 'assets' / 'weapon_bolts_v1.webp'
MANIFEST = ROOT / 'ASSET_MANIFEST.json'
CELL, BOLT_W, BOLT_H = 192, 96, 192
USES = {
    'weapon_levels_v1.webp': ('weapon-levels-v1', 'Disparos del jugador por nivel: 4 columnas (N1-N4) × 2 filas (Pulso, Gemelo), celdas de 192 px.'),
    'weapon_bolts_v1.webp': ('weapon-bolts-v1', 'Un proyectil por nivel (el más centrado de cada ráfaga): 4 columnas (N1-N4) × 2 filas (Pulso, Gemelo), celdas de 96×192.'),
}


def central_bolt(cell):
    """La mancha (con su brillo) más cercana al centro de la celda."""
    alpha = cell.getchannel('A')
    w, h = cell.size
    solid = [[alpha.getpixel((x, y)) > 40 for x in range(w)] for y in range(h)]
    seen = [[False] * w for _ in range(h)]
    best = None
    for y in range(h):
        for x in range(w):
            if not solid[y][x] or seen[y][x]:
                continue
            queue, seen[y][x], size, box = deque([(x, y)]), True, 0, [x, y, x, y]
            while queue:
                cx, cy = queue.popleft()
                size += 1
                box = [min(box[0], cx), min(box[1], cy), max(box[2], cx), max(box[3], cy)]
                for nx, ny in ((cx + 1, cy), (cx - 1, cy), (cx, cy + 1), (cx, cy - 1)):
                    if 0 <= nx < w and 0 <= ny < h and solid[ny][nx] and not seen[ny][nx]:
                        seen[ny][nx] = True
                        queue.append((nx, ny))
            if size < 40:
                continue
            distance = abs((box[0] + box[2]) / 2 - w / 2)
            if best is None or distance < best[0] - 2:
                best = (distance, box)
    box = best[1]
    pad = 10
    return cell.crop((max(0, box[0] - pad), max(0, box[1] - pad), min(w, box[2] + pad), min(h, box[3] + pad)))


def bolts(sheet, source_cell):
    atlas = Image.new('RGBA', (BOLT_W * 4, BOLT_H * 2), (0, 0, 0, 0))
    for row in range(2):
        for col in range(4):
            cell = sheet.crop((col * source_cell, row * source_cell, (col + 1) * source_cell, (row + 1) * source_cell))
            if row == 0 and col >= 2:
                # Los tres pulsos del abanico se juntan por la cola: se toma la
                # franja central (el pulso recto) y se borran las colas vecinas.
                # Máscara suave: plena en el centro y arriba, se apaga hacia los lados y abajo.
                mask = Image.new('L', cell.size, 0)
                for y in range(source_cell):
                    vertical = 1 if y < source_cell * .5 else max(0, 1 - (y - source_cell * .5) / (source_cell * .3))
                    for x in range(source_cell):
                        horizontal = max(0, 1 - abs(x - source_cell / 2) / (source_cell * .14)) ** .6
                        mask.putpixel((x, y), round(255 * vertical * horizontal))
                cell = cell.copy()
                cell.putalpha(ImageChops.multiply(cell.getchannel('A'), mask))
            bolt = central_bolt(cell)
            scale = min(BOLT_W / bolt.width, BOLT_H / bolt.height)
            bolt = bolt.resize((round(bolt.width * scale), round(bolt.height * scale)), Image.LANCZOS)
            atlas.alpha_composite(bolt, (col * BOLT_W + (BOLT_W - bolt.width) // 2, row * BOLT_H + (BOLT_H - bolt.height) // 2))
    return atlas


def main():
    sheet = Image.open(SOURCE).convert('RGBA')
    source_cell = sheet.width // 4
    rows = sheet.crop((0, 0, sheet.width, source_cell * 2))
    rows.resize((CELL * 4, CELL * 2), Image.LANCZOS).save(OUT, 'WEBP', quality=88, alpha_quality=100, method=6)
    bolts(sheet, source_cell).save(BOLTS, 'WEBP', quality=88, alpha_quality=100, method=6)
    manifest = json.loads(MANIFEST.read_text(encoding='utf-8'))
    for name, (asset_id, use) in USES.items():
        path = f'assets/{name}'
        entry = next((item for item in manifest['standalone'] if item['path'] == path), None)
        if entry is None:
            entry = {'id': asset_id, 'path': path, 'master': 'art-source/player/armas-niveles-v1/armas_niveles_v1.webp',
                     'dimensions': '', 'format': 'webp-alpha', 'size': 0, 'sha256': '', 'activeRuntime': True, 'precache': True,
                     'status': 'IN_REVIEW', 'artisticAcceptance': 'PENDING_OWNER',
                     'origin': 'GPT a petición del propietario (encargo camp-art-armas-niveles)', 'version': 1, 'use': use}
            manifest['standalone'].append(entry)
            manifest['assetCount'] += 1
        data = (ROOT / path).read_bytes()
        with Image.open(ROOT / path) as image:
            entry['dimensions'] = f'{image.width}x{image.height}'
        manifest['runtimeBytes'] += len(data) - entry['size']
        entry['size'] = len(data)
        entry['sha256'] = hashlib.sha256(data).hexdigest()
        print(path, len(data))
    MANIFEST.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')


if __name__ == '__main__':
    main()

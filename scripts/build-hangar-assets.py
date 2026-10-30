"""Empaqueta el arte del hangar de las 10 naves (paso del hangar, 30/10/2026).

Lee art-source/ships/laminas-v1/ (láminas de GPT), art-source/ui/habilidades-v1/
(iconos de GPT) y art-source/ui/piezas-v2/ (casillas y placa de la ficha), y
escribe en assets/:
- hangar_ships_v1.webp: pose neutral de cada nave en una rejilla de 5×2 celdas
  de 360 px, en el orden de SHIP_ROSTER (src/game/ship/ship-roster.js).
- ship_ability_icons_v1.webp: los 20 iconos en 5×4 celdas de 128 px, en ese
  mismo orden (exclusiva y última de cada nave).
- hangar_slot_{normal,chosen,locked,paid}_v1.webp: casillas de 240 px.
- hangar_ability_plate_v1.webp: placa de la ficha de habilidades, 1000×360.
Crea o actualiza sus entradas en ASSET_MANIFEST.json.
Reproducible: mismas entradas, mismas salidas.
Uso: python3 scripts/build-hangar-assets.py
"""
import hashlib
import json
from collections import deque
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SHIPS = ROOT / 'art-source' / 'ships' / 'laminas-v1'
ICONS = ROOT / 'art-source' / 'ui' / 'habilidades-v1'
PIECES = ROOT / 'art-source' / 'ui' / 'piezas-v2'
OUT = ROOT / 'assets'
MANIFEST = ROOT / 'ASSET_MANIFEST.json'
ORDER = ['aster', 'bastion', 'vertice', 'mantarraya', 'arpon', 'orion', 'quimera', 'nomada', 'eclipse', 'titan']
SHIP_CELL, ICON_CELL = 360, 128

ENTRIES = {
    'hangar_ships_v1.webp': ('hangar-ships-v1', 'art-source/ships/laminas-v1', 'camp-art-nave-*',
                             'Hangar: pose neutral de las 10 naves, rejilla 5×2 de 360 px en el orden de SHIP_ROSTER.'),
    'ship_ability_icons_v1.webp': ('ship-ability-icons-v1', 'art-source/ui/habilidades-v1', 'camp-art-habilidades-iconos',
                                   'Hangar: 20 iconos de habilidad (exclusiva y última de cada nave), rejilla 5×4 de 128 px.'),
    'hangar_slot_normal_v1.webp': ('hangar-slot-normal-v1', 'art-source/ui/piezas-v2/hangar_casilla_normal_v1.webp', 'art-ui-hangar-v2',
                                   'Hangar: casilla de nave conseguida.'),
    'hangar_slot_chosen_v1.webp': ('hangar-slot-chosen-v1', 'art-source/ui/piezas-v2/hangar_casilla_elegida_v1.webp', 'art-ui-hangar-v2',
                                   'Hangar: casilla de la nave elegida.'),
    'hangar_slot_locked_v1.webp': ('hangar-slot-locked-v1', 'art-source/ui/piezas-v2/hangar_casilla_bloqueada_v1.webp', 'art-ui-hangar-v2',
                                   'Hangar: casilla de nave sin conseguir.'),
    'hangar_slot_paid_v1.webp': ('hangar-slot-paid-v1', 'art-source/ui/piezas-v2/hangar_casilla_pago_v1.webp', 'art-ui-hangar-v2',
                                 'Hangar: casilla de nave de pago.'),
    'hangar_ability_plate_v1.webp': ('hangar-ability-plate-v1', 'art-source/ui/piezas-v2/hud_placa_mensajes_v1.webp', 'art-ui-hangar-v2',
                                     'Hangar: placa de la ficha con los huecos de la habilidad EXCLUSIVA y la ÚLTIMA.'),
}


def trimmed(image):
    return image.crop(image.getchannel('A').point(lambda v: 255 if v > 8 else 0).getbbox())


def fit(image, size):
    image = trimmed(image)
    scale = min(size[0] / image.width, size[1] / image.height)
    return image.resize((round(image.width * scale), round(image.height * scale)), Image.LANCZOS)


def neutral_pose(sheet):
    """La mancha más grande de la celda de arriba a la izquierda (5 poses arriba)."""
    w, h = sheet.size
    step = 4
    alpha = sheet.getchannel('A').resize((w // step, h // step))
    sw, sh = alpha.size
    solid = [[alpha.getpixel((x, y)) > 24 for x in range(sw)] for y in range(sh)]
    seen = [[False] * sw for _ in range(sh)]
    best = None
    for y in range(sh):
        for x in range(sw):
            if not solid[y][x] or seen[y][x]:
                continue
            queue, seen[y][x], size, box = deque([(x, y)]), True, 0, [x, y, x, y]
            while queue:
                cx, cy = queue.popleft()
                size += 1
                box = [min(box[0], cx), min(box[1], cy), max(box[2], cx), max(box[3], cy)]
                for nx, ny in ((cx + 1, cy), (cx - 1, cy), (cx, cy + 1), (cx, cy - 1)):
                    if 0 <= nx < sw and 0 <= ny < sh and solid[ny][nx] and not seen[ny][nx]:
                        seen[ny][nx] = True
                        queue.append((nx, ny))
            centre = ((box[0] + box[2]) / 2 * step, (box[1] + box[3]) / 2 * step)
            if centre[0] < w / 5 and centre[1] < h / 2 and (best is None or size > best[0]):
                best = (size, box)
    box = best[1]
    return sheet.crop((max(0, box[0] * step - 4), max(0, box[1] * step - 4),
                       min(w, (box[2] + 1) * step + 4), min(h, (box[3] + 1) * step + 4)))


def grid(images, cols, cell, inner):
    rows = (len(images) + cols - 1) // cols
    atlas = Image.new('RGBA', (cols * cell, rows * cell), (0, 0, 0, 0))
    for index, image in enumerate(images):
        piece = fit(image, (inner, inner))
        col, row = index % cols, index // cols
        atlas.alpha_composite(piece, (col * cell + (cell - piece.width) // 2, row * cell + (cell - piece.height) // 2))
    return atlas


def build():
    load = lambda path: Image.open(path).convert('RGBA')
    pieces = {
        'hangar_ships_v1.webp': grid([neutral_pose(load(SHIPS / f'{ship}_lamina_v1.webp')) for ship in ORDER], 5, SHIP_CELL, SHIP_CELL - 20),
        'ship_ability_icons_v1.webp': grid([load(ICONS / f'habilidad_{n:02d}_v1.webp') for n in range(1, 21)], 5, ICON_CELL, ICON_CELL - 4),
        'hangar_slot_normal_v1.webp': fit(load(PIECES / 'hangar_casilla_normal_v1.webp'), (240, 240)),
        'hangar_slot_chosen_v1.webp': fit(load(PIECES / 'hangar_casilla_elegida_v1.webp'), (240, 240)),
        'hangar_slot_locked_v1.webp': fit(load(PIECES / 'hangar_casilla_bloqueada_v1.webp'), (240, 240)),
        'hangar_slot_paid_v1.webp': fit(load(PIECES / 'hangar_casilla_pago_v1.webp'), (240, 240)),
        'hangar_ability_plate_v1.webp': fit(load(PIECES / 'hud_placa_mensajes_v1.webp'), (1000, 360)),
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

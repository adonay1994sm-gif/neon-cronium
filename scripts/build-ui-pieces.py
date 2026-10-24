"""Empaqueta las piezas pintadas de GPT para las ventanas del juego.

Lee art-source/ui/piezas-v2/ (encargos art-ui-iconos-como-jugar-v2 y
art-ui-ventanas-piezas-v2) y escribe en assets/:
- ui_howto_icons_v1.webp: los 11 iconos de «Cómo jugar» en una rejilla de
  6×2 celdas de 128 px, en el orden de la hoja de GPT.
- ui_star_full_v1.webp y ui_star_empty_v1.webp: estrellas del fin de sector.
- ui_sector_frame_v1.webp: marco de la imagen del sector (centro transparente).
- ui_beacon_big_v1.webp: la baliza de reaparición de su ventana.
- ui_defeat_cracks_v1.webp: grietas y chispas de la ventana de derrota.
Crea o actualiza sus entradas en ASSET_MANIFEST.json.
Reproducible: mismas entradas, mismas salidas.
Uso: python3 scripts/build-ui-pieces.py
"""
import hashlib
import json
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / 'art-source' / 'ui' / 'piezas-v2'
OUT = ROOT / 'assets'
MANIFEST = ROOT / 'ASSET_MANIFEST.json'
CELL = 128

ENTRIES = {
    'ui_howto_icons_v1.webp': ('ui-howto-icons-v1', 'iconos_como_jugar_v1.webp', 'art-ui-iconos-como-jugar-v2',
                               'Cómo jugar: 11 iconos pintados en rejilla de 6×2 celdas de 128 px.'),
    'ui_star_full_v1.webp': ('ui-star-full-v1', 'estrella_llena_v1.webp', 'art-ui-ventanas-piezas-v2',
                             'Fin de sector: estrella conseguida.'),
    'ui_star_empty_v1.webp': ('ui-star-empty-v1', 'estrella_vacia_v1.webp', 'art-ui-ventanas-piezas-v2',
                              'Fin de sector: estrella sin conseguir.'),
    'ui_sector_frame_v1.webp': ('ui-sector-frame-v1', 'marco_imagen_sector_v1.webp', 'art-ui-ventanas-piezas-v2',
                                'Fin de sector: marco de la imagen del sector.'),
    'ui_beacon_big_v1.webp': ('ui-beacon-big-v1', 'baliza_grande_v1.webp', 'art-ui-ventanas-piezas-v2',
                              'Ventana de la baliza: baliza de reaparición grande.'),
    'ui_defeat_cracks_v1.webp': ('ui-defeat-cracks-v1', 'derrota_grietas_v1.webp', 'art-ui-ventanas-piezas-v2',
                                 'Derrota: grietas y chispas rojas sobre el marco de la ventana.'),
}


def trimmed(image):
    return image.crop(image.getchannel('A').point(lambda v: 255 if v > 8 else 0).getbbox())


def fit(image, size):
    image = trimmed(image)
    scale = min(size[0] / image.width, size[1] / image.height)
    return image.resize((round(image.width * scale), round(image.height * scale)), Image.LANCZOS)


def icon_sheet(sheet):
    cols, rows = 6, 2
    w, h = sheet.width / cols, sheet.height / rows
    atlas = Image.new('RGBA', (cols * CELL, rows * CELL), (0, 0, 0, 0))
    for index in range(11):
        col, row = index % cols, index // cols
        icon = fit(sheet.crop((round(col * w), round(row * h), round((col + 1) * w), round((row + 1) * h))), (CELL - 4, CELL - 4))
        atlas.alpha_composite(icon, (col * CELL + (CELL - icon.width) // 2, row * CELL + (CELL - icon.height) // 2))
    return atlas


def build():
    load = lambda name: Image.open(SOURCE / name).convert('RGBA')
    pieces = {
        'ui_howto_icons_v1.webp': icon_sheet(load('iconos_como_jugar_v1.webp')),
        'ui_star_full_v1.webp': fit(load('estrella_llena_v1.webp'), (160, 160)),
        'ui_star_empty_v1.webp': fit(load('estrella_vacia_v1.webp'), (160, 160)),
        'ui_sector_frame_v1.webp': fit(load('marco_imagen_sector_v1.webp'), (1000, 1000)),
        'ui_beacon_big_v1.webp': fit(load('baliza_grande_v1.webp'), (384, 384)),
        'ui_defeat_cracks_v1.webp': load('derrota_grietas_v1.webp').resize((720, 1000), Image.LANCZOS),
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
            entry = {'id': asset_id, 'path': f'assets/{name}', 'master': f'art-source/ui/piezas-v2/{master}',
                     'dimensions': '', 'format': 'webp-alpha', 'size': 0, 'sha256': '', 'activeRuntime': True, 'precache': True,
                     'status': 'IN_REVIEW', 'artisticAcceptance': 'PENDING_OWNER',
                     'origin': f'GPT a petición del propietario (encargo {order})',
                     'version': 1, 'use': use}
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

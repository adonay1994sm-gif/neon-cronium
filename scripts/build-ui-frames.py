"""Empaqueta los marcos pintados de GPT para las ventanas del juego.

Lee art-source/ui/marcos-v2/ (encargos art-ui-paneles-v2 y
art-ui-marco-principal-v2) y escribe en assets/ cada pieza recortada a su parte
visible: GPT las entrega con márgenes transparentes distintos en cada una, y
border-image necesita la pieza justa para estirarla.
Crea o actualiza sus entradas en ASSET_MANIFEST.json.
Reproducible: mismas entradas, mismas salidas.
Uso: python3 scripts/build-ui-frames.py
"""
import hashlib
import json
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / 'art-source' / 'ui' / 'marcos-v2'
OUT = ROOT / 'assets'
MANIFEST = ROOT / 'ASSET_MANIFEST.json'

ENTRIES = {
    'ui_window_v1.webp': ('ui-window-v1', 'encargo-art-ui-paneles-v2-v1-1.webp',
                          'Ventanas (pausa, ajustes, derrota, fin de sector, baliza…): marco pintado.'),
    'ui_button_main_v1.webp': ('ui-button-main-v1', 'encargo-art-ui-marco-principal-v2-v1-1.webp',
                               'Ventanas: botón principal.'),
    'ui_button_main_pressed_v1.webp': ('ui-button-main-pressed-v1', 'encargo-art-ui-marco-principal-v2-v1-2.webp',
                                       'Ventanas: botón principal pulsado.'),
    'ui_button_secondary_v1.webp': ('ui-button-secondary-v1', 'encargo-art-ui-paneles-v2-v1-2.webp',
                                    'Ventanas: botón secundario.'),
    'ui_button_secondary_pressed_v1.webp': ('ui-button-secondary-pressed-v1', 'encargo-art-ui-paneles-v2-v1-3.webp',
                                            'Ventanas: botón secundario pulsado.'),
    'ui_button_danger_v1.webp': ('ui-button-danger-v1', 'encargo-art-ui-paneles-v2-v1-4.webp',
                                 'Ventanas: botón de peligro (SALIR AL MENÚ).'),
    'ui_button_ad_v1.webp': ('ui-button-ad-v1', 'encargo-art-ui-paneles-v2-v1-5.webp',
                             'Ventanas: botón de anuncio (VER ANUNCIO Y REPARAR).'),
    'ui_stat_card_v1.webp': ('ui-stat-card-v1', 'encargo-art-ui-paneles-v2-v1-6.webp',
                             'Ventanas: ficha de dato (PUNTOS, CASCO, COMBO).'),
}


def build():
    for name, (_, master, _) in ENTRIES.items():
        piece = Image.open(SOURCE / master).convert('RGBA')
        piece = piece.crop(piece.getchannel('A').point(lambda v: 255 if v > 8 else 0).getbbox())
        piece.save(OUT / name, 'WEBP', quality=90, alpha_quality=100, method=6)


def main():
    build()
    manifest = json.loads(MANIFEST.read_text(encoding='utf-8'))
    by_path = {entry['path']: entry for entry in manifest['standalone']}
    for name, (asset_id, master, use) in ENTRIES.items():
        path = OUT / name
        data = path.read_bytes()
        entry = by_path.get(f'assets/{name}')
        if entry is None:
            entry = {'id': asset_id, 'path': f'assets/{name}', 'master': f'art-source/ui/marcos-v2/{master}',
                     'dimensions': '', 'format': 'webp-alpha', 'size': 0, 'sha256': '', 'activeRuntime': True, 'precache': True,
                     'status': 'IN_REVIEW', 'artisticAcceptance': 'PENDING_OWNER',
                     'origin': 'GPT a petición del propietario (encargos art-ui-paneles-v2 y art-ui-marco-principal-v2)',
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

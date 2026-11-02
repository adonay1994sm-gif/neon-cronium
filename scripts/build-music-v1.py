"""Prepara la música del juego que eligió el propietario (02/11/2026).

Lee los originales CC0 de art-source/audio/musica-v1/ (procedencia en su
PROVENANCE.md) y escribe assets/music_<momento>_v1.m4a: AAC 96 kbps estéreo,
volumen igualado a −16 LUFS para que ningún momento suene más alto que otro.
Crea o actualiza sus entradas en ASSET_MANIFEST.json.
Necesita ffmpeg. Uso: python3 scripts/build-music-v1.py
"""
import hashlib
import json
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / 'art-source' / 'audio' / 'musica-v1'
OUT = ROOT / 'assets'
MANIFEST = ROOT / 'ASSET_MANIFEST.json'

TRACKS = {
    'menu': ('congusbongus_midnight_drive.ogg', 'Midnight Drive · congusbongus · CC0'),
    'vuelo': ('centurion_of_war_bio_hazard_v3.ogg', 'Bio-Hazard · Centurion_of_war · CC0'),
    'subjefe': ('centurion_of_war_technological_messup_v2.ogg', 'Technological Messup · Centurion_of_war · CC0'),
    'jefe': ('centurion_of_war_confrontation_1.ogg', 'Confrontation · Centurion_of_war · CC0'),
}


def duration(path):
    out = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', str(path)],
                         check=True, capture_output=True, text=True).stdout
    return round(float(out), 1)


def main():
    manifest = json.loads(MANIFEST.read_text(encoding='utf-8'))
    by_path = {entry['path']: entry for entry in manifest['standalone']}
    for mood, (source, credit) in TRACKS.items():
        target = OUT / f'music_{mood}_v1.m4a'
        subprocess.run(['ffmpeg', '-nostdin', '-v', 'error', '-y', '-i', str(SOURCE / source),
                        '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11', '-ar', '44100', '-ac', '2', '-c:a', 'aac', '-b:a', '96k',
                        '-map_metadata', '-1', '-fflags', '+bitexact', '-flags:a', '+bitexact', '-movflags', '+faststart',
                        str(target)], check=True)
        data = target.read_bytes()
        entry = by_path.get(f'assets/{target.name}')
        if entry is None:
            entry = {'id': f'music-{mood}-v1', 'path': f'assets/{target.name}', 'master': f'art-source/audio/musica-v1/{source}',
                     'dimensions': '', 'format': 'aac-lc', 'size': 0, 'sha256': '', 'activeRuntime': True, 'precache': True,
                     'status': 'IN_REVIEW', 'artisticAcceptance': 'ACCEPTED_OWNER_2026-11-02',
                     'origin': f'OpenGameArt, {credit} (elegida por el propietario en la sala de escucha)',
                     'version': 1, 'use': f'Música en bucle del momento «{mood}» (src/game/audio/mood-music.js)'}
            manifest['standalone'].append(entry)
            manifest['assetCount'] += 1
        entry['dimensions'] = f'44100Hz stereo AAC {duration(target)}s'
        # Por diferencia: repetir el script no cuenta dos veces.
        manifest['runtimeBytes'] += len(data) - entry['size']
        entry['size'] = len(data)
        entry['sha256'] = hashlib.sha256(data).hexdigest()
        print(f'assets/{target.name}', len(data))
    MANIFEST.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')


if __name__ == '__main__':
    main()

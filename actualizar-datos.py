"""Actualiza site-data.js a partir de los archivos media.json y lang/*.json."""
from pathlib import Path
import json
root = Path(__file__).resolve().parent
media = {
    'carrusel': json.loads((root / 'img/carrusel/media.json').read_text(encoding='utf-8')),
    'platos': {p.parent.name: json.loads(p.read_text(encoding='utf-8')) for p in (root / 'img/platos').glob('*/media.json')}
}
langs = {p.stem: json.loads(p.read_text(encoding='utf-8')) for p in (root / 'lang').glob('*.json')}
code = '/* Respaldo local generado automáticamente. */\n'
code += 'window.REVIRA_MEDIA=' + json.dumps(media, ensure_ascii=False, separators=(',', ':')) + ';\n'
code += 'window.REVIRA_LANGUAGES=' + json.dumps(langs, ensure_ascii=False, separators=(',', ':')) + ';\n'
# Copia local para que carta y sugerencias también funcionen con file:// sin servidor.
menus = {p.parent.name: json.loads(p.read_text(encoding='utf-8')) for p in (root / 'img/platos').glob('*/manifest.json')}
code += 'window.REVIRA_MENU=' + json.dumps(menus, ensure_ascii=False, separators=(',', ':')) + ';\n'
(root / 'site-data.js').write_text(code, encoding='utf-8')
print('Datos locales actualizados')

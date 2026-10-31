"""Build a price-free reference catalogue from the audited selection, not sale offers."""
import hashlib
import json
import re
import shutil
from pathlib import Path

source = Path('.v0/refs/verified-tires')
selected = json.loads((source / 'catalog-selection.json').read_text())
output = Path('public/images/tire-reference')
output.mkdir(parents=True, exist_ok=True)
models = []
for batch in selected:
    first = batch['products'][0]
    name = first['tire']['model']
    slug = re.sub('[^a-z0-9]+', '-', f'{first["brand"]}-{name}'.lower()).strip('-')
    images = []
    for photo in batch['modelPhotos'][:2]:
        file = source / photo['file']
        assert file.resolve().is_relative_to((source / 'photos').resolve())
        assert hashlib.sha256(file.read_bytes()).hexdigest() == photo['sha256']
        destination = output / f'{photo["sha256"]}.webp'
        shutil.copyfile(file, destination)
        images.append('/images/tire-reference/' + destination.name)
    assert len(set(images)) == 2
    variants = []
    for p in batch['products']:
        t = p['tire']
        variants.append({k: t[k] for k in ['width', 'aspect', 'rim', 'loadIndex', 'speedRating', 'extraLoad', 'runFlat']} | {'mpn': p['mpn'], 'gtin': p.get('gtin', '')})
    models.append({'slug': slug, 'brand': first['brand'], 'name': name, 'images': images, 'seasons': sorted({p['tire']['season'] for p in batch['products']}), 'sourceUrl': batch['model']['usUrl'], 'variants': sorted(variants, key=lambda v: (v['width'], v['aspect'], v['rim'], v['loadIndex'], v['mpn']))})
assert len({m['slug'] for m in models}) == len(models)
brands = {m['brand'] for m in models}
assert 12 <= len(brands) <= 15
assert all(12 <= sum(m['brand'] == brand for m in models) <= 15 for brand in brands)
Path('lib/catalog/reference-data.json').write_text(json.dumps(models, ensure_ascii=False, separators=(',', ':')))
print(json.dumps({'brands': len(brands), 'models': len(models), 'variants': sum(len(m['variants']) for m in models), 'photos': sum(len(m['images']) for m in models)}))

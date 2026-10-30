"""Audit EU evidence for the selected models without treating missing GTINs as EU absence."""
import argparse
import collections
import csv
import io
import json
import zipfile
from pathlib import Path
from tire_sources import brand_key, normalized

ROOT = Path('.v0/refs/verified-tires')


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    selected = json.loads((ROOT / 'catalog-selection.json').read_text())
    registry = json.loads((ROOT / 'selection-eu-registry.json').read_text())
    verified = json.loads((ROOT / 'selection-verified-crosswalk.json').read_text())
    records = collections.defaultdict(list)
    scans = {brand_key(row['brand']): row for row in registry}
    for row in registry:
        for record in row['records']:
            records[(brand_key(row['brand']), normalized(record['commercialName']))].append(record)
    exact = collections.Counter((brand_key(row['brand']), normalized(row['model'])) for row in verified['matches'])
    rows = []
    for batch in selected:
        name = batch['products'][0]['tire']['model']
        brand = batch['model']['brand']
        key = (brand_key(brand), normalized(name))
        evidence = records[key]
        scan = scans.get(key[0], {})
        rows.append({'brand': brand, 'model': name, 'usArticles': len(batch['products']), 'usSizes': len({(p['tire']['width'], p['tire']['aspect'], p['tire']['rim']) for p in batch['products']}), 'euRegistryRecords': len(evidence), 'euRegistrySizes': len({(r.get('tyreSection'), r.get('aspectRatio'), r.get('rimDiameter')) for r in evidence}), 'exactArticlesVerified': exact[key], 'registryScanComplete': bool(scan.get('scanComplete')), 'status': 'Exact article snapshots found; publication checks pending' if exact[key] else 'Registry model-name match only; regional article verification pending' if evidence else 'No exact model-name result; not proof of absence from EU', 'scanError': scan.get('error', ''), 'usModelReference': batch['model']['usUrl'], 'euRetailModelReference': batch['model'].get('euUrl') or '', 'publicationReady': False})
    summary = {'brands': len({r['brand'] for r in rows}), 'models': len(rows), 'modelsWithExactRegistryName': sum(r['euRegistryRecords'] > 0 for r in rows), 'modelsWithoutExactRegistryName': sum(r['euRegistryRecords'] == 0 for r in rows), 'modelsWithExactArticleSnapshots': sum(r['exactArticlesVerified'] > 0 for r in rows), 'exactArticleSnapshots': len(verified['matches']), 'euRegistryRecords': sum(r['euRegistryRecords'] for r in rows), 'allScansComplete': all(r.get('scanComplete') for r in registry) and len(registry) == len(scans) == len({r['brand'] for r in rows}), 'publicationReady': 0, 'scope': 'Registry records are technical evidence, not retail availability, prices, rights clearance or publication approval. Different regional GTINs do not imply absence from the EU. Cached source snapshots may be reused.'}
    output = io.StringIO(newline='')
    writer = csv.DictWriter(output, fieldnames=list(rows[0]))
    writer.writeheader()
    writer.writerows(rows)
    csv_content = '\ufeff' + output.getvalue()
    args.output.with_suffix('.csv').write_text(csv_content, encoding='utf-8')
    with zipfile.ZipFile(args.output, 'w', zipfile.ZIP_DEFLATED) as archive:
        archive.writestr('models-eu-review.csv', csv_content)
        archive.writestr('summary.json', json.dumps(summary, indent=2))
        for file in ['selection-eu-registry.json', 'selection-crosswalk.json', 'selection-verified-crosswalk.json']:
            archive.write(ROOT / file, file)
    print(json.dumps(summary), flush=True)


if __name__ == '__main__':
    main()

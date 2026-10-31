"""Export an audit bundle with source URLs, coverage, exact matches and unresolved checks."""
import argparse
import collections
import csv
import io
import json
import zipfile
from pathlib import Path

SOURCE = Path('.v0/refs/verified-tires')


def csv_text(rows, fields):
    output = io.StringIO(newline='')
    writer = csv.DictWriter(output, fieldnames=fields)
    writer.writeheader()
    writer.writerows(rows)
    return '\ufeff' + output.getvalue()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    us = json.loads((SOURCE / 'us-variants.json').read_text())
    eu = json.loads((SOURCE / 'eu-registry.json').read_text())
    verified = json.loads((SOURCE / 'verified-crosswalk.json').read_text())
    crosswalk = json.loads((SOURCE / 'crosswalk.json').read_text())
    stats = collections.defaultdict(lambda: {'usModelsWithEligibleDrafts': 0, 'usDrafts': 0, 'euRegistryModelRecords': 0, 'registryRecordsScanned': 0, 'registryScanComplete': False})
    for row in us:
        stats[row['model']['brand']]['usModelsWithEligibleDrafts'] += bool(row['products'])
        stats[row['model']['brand']]['usDrafts'] += len(row['products'])
    for row in eu:
        stats[row['brand']].update(euRegistryModelRecords=len(row['records']), registryRecordsScanned=row.get('scannedRecords', 0), registryScanComplete=row.get('scanComplete', False))
    coverage = [{'brand': brand, **values} for brand, values in sorted(stats.items())]
    articles = [{'brand': m['brand'], 'model': m['model'], 'usMpn': m['mpn'], 'gtin': m['gtin'], 'eprelRegistration': m['euRecord']['eprelRegistrationNumber'], 'euTyreTypeIdentifier': m['euRecord']['modelIdentifier'], 'size': m['euRecord']['sizeDesignation'], 'fuelClass': m['euRecord']['energyClass'], 'wetGripClass': m['euRecord']['wetGripClass'], 'noiseDb': m['euRecord']['externalRollingNoiseValue'], 'eprelUrl': m['euRecord']['sourceUrl'], 'snapshotCheckedAt': m['directLookup']['checkedAt'], 'publicationReady': False, 'pending': '; '.join(m['pending'])} for m in verified['matches']]
    summary = {**verified['summary'], 'registryRecordsScanned': sum(r.get('scannedRecords', 0) for r in eu), 'registryBrands': len(eu), 'allRegistryScansComplete': all(r.get('scanComplete') for r in eu), 'scope': crosswalk['scope'], 'databaseChanges': 'This export does not modify the database or publish products.'}
    with zipfile.ZipFile(args.output, 'w', zipfile.ZIP_DEFLATED) as archive:
        for filename in ['models.json', 'us-variants.json', 'eu-registry.json', 'crosswalk.json', 'verified-crosswalk.json']:
            archive.write(SOURCE / filename, filename)
        archive.writestr('summary.json', json.dumps(summary, ensure_ascii=False, indent=2))
        archive.writestr('brand-coverage.csv', csv_text(coverage, list(coverage[0])))
        if articles:
            archive.writestr('exact-article-matches.csv', csv_text(articles, list(articles[0])))
    print(json.dumps(summary), flush=True)
    print(str(args.output), args.output.stat().st_size, 'bytes', flush=True)


if __name__ == '__main__':
    main()
